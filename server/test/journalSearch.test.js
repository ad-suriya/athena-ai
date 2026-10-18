'use strict';

const { store, failures, embedRequests, FakeTimestamp, reset } = require('./helpers/setup');
const test = require('node:test');
const assert = require('node:assert/strict');
const { chunkText, indexNote, searchNotes } = require('../src/services/journalSearch.service');
const noteService = require('../src/services/note.service');
const { runTool } = require('../src/agent/tools');

const putNote = (id, userId, title, content) => store.set(`notes/${id}`, {
  userId, title, content, createdAt: new FakeTimestamp('2026-10-01T09:00:00Z'), updatedAt: new FakeTimestamp('2026-10-01T09:00:00Z'),
});
const chunksOf = (noteId) => [...store.entries()].filter(([key, data]) => key.startsWith('noteChunks/') && data.noteId === noteId);

// Waits for background indexing started by note.service.
const waitFor = async (check) => {
  for (let i = 0; i < 100; i += 1) {
    if (check()) return;
    await new Promise((ok) => setTimeout(ok, 10));
  }
  assert.fail('timed out waiting for background indexing');
};

test.beforeEach(reset);

test('chunkText packs short paragraphs and splits long ones at sentences', () => {
  assert.deepEqual(chunkText(''), []);
  assert.deepEqual(chunkText('One.\n\nTwo.'), ['One.\n\nTwo.']);

  const sentence = 'I went for a long walk by the river today. ';
  const long = sentence.repeat(80).trim(); // ~3400 chars, one paragraph
  const chunks = chunkText(long);
  assert.ok(chunks.length >= 3);
  for (const c of chunks) {
    assert.ok(c.length <= 1500, `chunk of ${c.length} chars`);
    assert.match(c, /\.$/, 'cut at a sentence end');
  }
  assert.equal(chunks.join(' ').replace(/\s+/g, ' '), long);
});

test('indexNote stores passages with vectors, skips unchanged entries and drops old passages', async () => {
  const sentence = 'Work was exhausting and the office felt endless. ';
  putNote('n1', 'u1', 'Long week', `<p>${sentence.repeat(70)}</p>`);

  assert.equal(await indexNote('u1', 'n1', { dryRun: true }), 'would_index');
  assert.equal(chunksOf('n1').length, 0);

  assert.equal(await indexNote('u1', 'n1'), 'indexed');
  const chunks = chunksOf('n1');
  assert.ok(chunks.length >= 2);
  for (const [, data] of chunks) {
    assert.equal(data.userId, 'u1');
    assert.equal(data.title, 'Long week');
    assert.ok(Array.isArray(data.embedding.toArray()));
  }
  assert.equal(embedRequests[0].taskType, 'RETRIEVAL_DOCUMENT');
  assert.match(embedRequests[0].texts[0], /^Long week\n\n/, 'title is embedded with each passage');

  // Unchanged: nothing is embedded again.
  const calls = embedRequests.length;
  assert.equal(await indexNote('u1', 'n1'), 'unchanged');
  assert.equal(embedRequests.length, calls);

  // Shorter text: one passage left, the rest removed.
  store.set('notes/n1', { ...store.get('notes/n1'), content: '<p>Better today.</p>' });
  assert.equal(await indexNote('u1', 'n1'), 'indexed');
  assert.deepEqual(chunksOf('n1').map(([key, data]) => [key, data.text]), [['noteChunks/n1_0', 'Better today.']]);
});

test('indexNote refuses another user\'s entry', async () => {
  putNote('n1', 'u1', 'Mine', '<p>Private</p>');
  await assert.rejects(indexNote('u2', 'n1'), (err) => err.status === 404);
  assert.equal(chunksOf('n1').length, 0);
});

test('searchNotes finds entries by meaning, one passage each, only for that user', async () => {
  putNote('a', 'u1', 'Monday', '<p>So tired after work, the boss kept me late.</p>');
  putNote('b', 'u1', 'Weekend', '<p>Happy day with my sister and mom.</p>');
  putNote('c', 'u2', 'Not yours', '<p>Exhausted and drained at the office.</p>');
  for (const [id, user] of [['a', 'u1'], ['b', 'u1'], ['c', 'u2']]) await indexNote(user, id);

  const results = await searchNotes('u1', 'feeling burnt out at my job', 5);
  assert.equal(embedRequests[embedRequests.length - 1].taskType, 'RETRIEVAL_QUERY');
  assert.deepEqual(results.map((r) => r.noteId), ['a', 'b']);
  assert.ok(results[0].distance < results[1].distance);
  assert.equal(results[0].title, 'Monday');
  assert.equal(new Set(results.map((r) => r.noteId)).size, results.length);
});

test('note saves index in the background, and deleting an entry removes its passages', async () => {
  const note = await noteService.createNote('u1', { title: 'Gym', content: '<p>Went running, felt great.</p>' });
  await waitFor(() => chunksOf(note.id).length === 1);

  // Changes outside the title and text do not re-index.
  const calls = embedRequests.length;
  await noteService.updateNote('u1', note.id, { isPinned: true });
  await new Promise((ok) => setTimeout(ok, 30));
  assert.equal(embedRequests.length, calls);

  await noteService.updateNote('u1', note.id, { content: '<p>Skipped the gym.</p>' });
  await waitFor(() => chunksOf(note.id)[0]?.[1].text === 'Skipped the gym.');

  await noteService.deleteNote('u1', note.id);
  await waitFor(() => chunksOf(note.id).length === 0);
});

test('a failed embedding never fails the note save', async () => {
  failures.push({ op: 'embed', match: () => true });
  const note = await noteService.createNote('u1', { title: 'Offline', content: '<p>Still saved.</p>' });
  assert.equal(store.get(`notes/${note.id}`).title, 'Offline');
  await new Promise((ok) => setTimeout(ok, 30));
  assert.equal(chunksOf(note.id).length, 0);
});

test('search_journal tool returns matching entries, and falls back when search is unavailable', async () => {
  putNote('a', 'u1', 'Monday', '<p>So tired after work.</p>');
  await indexNote('u1', 'a');

  const { result } = await runTool('u1', 'search_journal', { query: 'exhausted at the office' });
  assert.equal(result.entries.length, 1);
  assert.deepEqual(
    { id: result.entries[0].id, title: result.entries[0].title, passage: result.entries[0].passage, createdAt: result.entries[0].createdAt },
    { id: 'a', title: 'Monday', passage: 'So tired after work.', createdAt: '2026-10-01T09:00:00.000Z' },
  );
  assert.equal(typeof result.entries[0].relevance, 'number');

  assert.match((await runTool('u1', 'search_journal', { query: ' ' })).result.error, /query/);

  failures.push({ op: 'findNearest', match: () => true });
  assert.match((await runTool('u1', 'search_journal', { query: 'work' })).result.error, /list_journal_entries/);
});
