'use strict';

const {
  requireDb,
  serverTimestamp,
  serializeDoc,
  getOwnedDoc,
  listOwnedDocs,
  byTimestamp,
} = require('../utils/firestore');

const COLLECTION = 'notes';

const getNotes = async (userId) => {
  const docs = await listOwnedDocs(COLLECTION, userId);
  // Oldest first — the Notes page opens the first note, as it did with localStorage.
  return docs.sort(byTimestamp('createdAt', 'asc')).map((d) => serializeDoc(d));
};

const getNote = async (userId, noteId) => {
  const { snap } = await getOwnedDoc(COLLECTION, noteId, userId);
  return serializeDoc(snap);
};

// content is stored exactly as the editor produced it (TipTap HTML).
const createNote = async (userId, data) => {
  const ref = requireDb().collection(COLLECTION).doc();
  await ref.set({
    userId,
    title: data.title ?? '',
    content: data.content ?? '',
    tags: data.tags ?? [],
    color: data.color ?? '',
    isPinned: data.isPinned ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return serializeDoc(await ref.get());
};

const updateNote = async (userId, noteId, data) => {
  const { ref } = await getOwnedDoc(COLLECTION, noteId, userId);
  await ref.update({ ...data, updatedAt: serverTimestamp() });
  return serializeDoc(await ref.get());
};

const deleteNote = async (userId, noteId) => {
  const { ref } = await getOwnedDoc(COLLECTION, noteId, userId);
  await ref.delete();
};

module.exports = { getNotes, getNote, createNote, updateNote, deleteNote };
