'use strict';

// Journal search (RAG): finds journal entries by meaning, not exact words, so
// "when did I feel burnt out?" also finds an entry that says "exhausted at work".
//
// Each entry (notes collection) is split into passages, and each passage is stored
// with its embedding in noteChunks/{noteId}_{index}:
//   { userId, noteId, index, title, text, hash, createdAt, embedding (vector), updatedAt }
// Search embeds the query and runs a Firestore vector query limited to the user's
// own chunks. It needs a composite vector index (userId, embedding); see
// docs/JOURNAL_SEARCH.md.
//
// Indexing runs in the background after a note is saved, so a save never waits on
// Vertex or fails because of it. `hash` covers the title and text: unchanged entries
// are not embedded again, and a run whose entry changed while it was embedding writes
// nothing (the save that changed it indexes it again).

const crypto = require('crypto');
const { embed, isAvailable } = require('../config/vertex');
const { admin, requireDb, serverTimestamp, getOwnedDoc } = require('../utils/firestore');
const { htmlToText } = require('../utils/html');

const NOTES = 'notes';
const CHUNKS = 'noteChunks';
const MAX_CHUNK_CHARS = 1500; // about 375 tokens
const MAX_CHUNKS = 40;        // longer entries are indexed up to here
const DISTANCE = 'distance';

const hashOf = (title, text) => crypto.createHash('sha256').update(`${title}\n${text}`).digest('hex');

const noteText = (snap) => {
  const title = snap.get('title') || '';
  const text = htmlToText(snap.get('content') || '');
  return { title, text, hash: hashOf(title, text) };
};

// Plain text → passages of at most MAX_CHUNK_CHARS, split at paragraphs where
// possible, then at sentences, then anywhere.
const chunkText = (text = '') => {
  const pieces = [];
  for (const para of text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)) {
    if (para.length <= MAX_CHUNK_CHARS) { pieces.push(para); continue; }
    let rest = para;
    while (rest.length > MAX_CHUNK_CHARS) {
      const window = rest.slice(0, MAX_CHUNK_CHARS);
      const cut = Math.max(window.lastIndexOf('. '), window.lastIndexOf('? '), window.lastIndexOf('! '));
      const at = cut > MAX_CHUNK_CHARS / 2 ? cut + 1 : MAX_CHUNK_CHARS;
      pieces.push(rest.slice(0, at).trim());
      rest = rest.slice(at).trim();
    }
    if (rest) pieces.push(rest);
  }
  // Pack short paragraphs together up to the limit.
  const chunks = [];
  for (const piece of pieces) {
    const last = chunks[chunks.length - 1];
    if (last !== undefined && last.length + piece.length + 2 <= MAX_CHUNK_CHARS) chunks[chunks.length - 1] = `${last}\n\n${piece}`;
    else chunks.push(piece);
  }
  return chunks.slice(0, MAX_CHUNKS);
};

const chunksOf = async (userId, noteId) => {
  const snapshot = await requireDb().collection(CHUNKS).where('noteId', '==', noteId).get();
  return snapshot.docs.filter((d) => d.get('userId') === userId);
};

// Brings noteId's passages up to date. dryRun reports what would happen without
// embedding or writing. → 'indexed' | 'unchanged' | 'stale' | 'would_index'
const indexNote = async (userId, noteId, { dryRun = false } = {}) => {
  const db = requireDb();
  const { snap } = await getOwnedDoc(NOTES, noteId, userId);
  const { title, text, hash } = noteText(snap);
  const chunks = chunkText(text);
  const existing = await chunksOf(userId, noteId);
  const current = existing.length === chunks.length && existing.every((d) => d.get('hash') === hash);
  if (current) return 'unchanged';
  if (dryRun) return 'would_index';

  // The title goes into each passage's embedding so it is searchable too.
  const vectors = chunks.length ? await embed(chunks.map((c) => (title ? `${title}\n\n${c}` : c)), 'RETRIEVAL_DOCUMENT') : [];

  const latest = await db.collection(NOTES).doc(noteId).get();
  if (!latest.exists || noteText(latest).hash !== hash) return 'stale';

  const batch = db.batch();
  chunks.forEach((chunk, index) => {
    batch.set(db.collection(CHUNKS).doc(`${noteId}_${index}`), {
      userId,
      noteId,
      index,
      title,
      text: chunk,
      hash,
      createdAt: snap.get('createdAt') ?? null,
      embedding: admin.firestore.FieldValue.vector(vectors[index]),
      updatedAt: serverTimestamp(),
    });
  });
  existing.filter((d) => d.get('index') >= chunks.length).forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return 'indexed';
};

// Removes a deleted note's passages.
const removeNote = async (userId, noteId) => {
  const existing = await chunksOf(userId, noteId);
  if (!existing.length) return;
  const batch = requireDb().batch();
  existing.forEach((d) => batch.delete(d.ref));
  await batch.commit();
};

// Background versions for the note write paths: failures are logged, never thrown.
const indexNoteLater = (userId, noteId) => {
  if (!isAvailable()) return;
  indexNote(userId, noteId).catch((err) => console.error(`Journal search: indexing note ${noteId} failed:`, err));
};
const removeNoteLater = (userId, noteId) => {
  removeNote(userId, noteId).catch((err) => console.error(`Journal search: removing note ${noteId} failed:`, err));
};

// query → the user's best-matching entries, closest first, one passage each:
// [{ noteId, title, text, createdAt (Timestamp | null), distance (cosine, 0 = same) }]
const searchNotes = async (userId, query, limit = 5) => {
  const [vector] = await embed([query], 'RETRIEVAL_QUERY');
  const snapshot = await requireDb().collection(CHUNKS)
    .where('userId', '==', userId)
    .findNearest({
      vectorField: 'embedding',
      queryVector: vector,
      limit: Math.min(limit * 3, 50), // several passages may come from one entry
      distanceMeasure: 'COSINE',
      distanceResultField: DISTANCE,
    })
    .get();
  const seen = new Set();
  return snapshot.docs
    .filter((d) => !seen.has(d.get('noteId')) && seen.add(d.get('noteId')))
    .slice(0, limit)
    .map((d) => ({ noteId: d.get('noteId'), title: d.get('title'), text: d.get('text'), createdAt: d.get('createdAt'), distance: d.get(DISTANCE) }));
};

module.exports = { chunkText, indexNote, removeNote, indexNoteLater, removeNoteLater, searchNotes, NOTES, CHUNKS };
