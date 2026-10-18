'use strict';

// Indexes existing journal entries (notes collection) for journal search.
// New and edited entries are indexed automatically; this covers entries written
// before journal search existed. Idempotent: unchanged entries are skipped.
//
//   node scripts/index-journal.js           # dry run — counts only, embeds and writes nothing
//   node scripts/index-journal.js --apply   # embed and write noteChunks
//
// See docs/JOURNAL_SEARCH.md.

require('dotenv').config();
const { db } = require('../src/config/firebase');
const { isAvailable } = require('../src/config/vertex');
const { indexNote, NOTES } = require('../src/services/journalSearch.service');

const apply = process.argv.includes('--apply');

(async () => {
  if (!db) {
    console.error('Firestore is not configured (check FIREBASE_* in server/.env).');
    process.exit(1);
  }
  if (apply && !isAvailable()) {
    console.error('Vertex AI is not configured (check VERTEX_* in server/.env).');
    process.exit(1);
  }

  console.log(`Project: ${process.env.FIREBASE_PROJECT_ID} — ${apply ? 'APPLYING' : 'DRY RUN (pass --apply to write)'}`);

  const notes = await db.collection(NOTES).get();
  const totals = { notes: notes.size, indexed: 0, would_index: 0, unchanged: 0, stale: 0, failed: 0 };

  // One at a time, to stay inside the embedding quota.
  for (const doc of notes.docs) {
    try {
      const status = await indexNote(doc.get('userId'), doc.id, { dryRun: !apply });
      totals[status] += 1;
    } catch (err) {
      totals.failed += 1;
      console.error(`${doc.id}: ${err.message}`);
    }
  }

  console.log(totals);
  process.exit(totals.failed > 0 ? 1 : 0);
})();
