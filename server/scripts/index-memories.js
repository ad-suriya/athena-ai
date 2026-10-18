'use strict';

// Builds conversation memories (summaries for past-conversation search) for
// existing conversations, and catches up chats whose last messages arrived after
// their summary. New chats are summarized automatically while they run. Idempotent:
// up-to-date memories and users who turned memory off are skipped.
//
//   node scripts/index-memories.js           # dry run — counts only, no Gemini calls or writes
//   node scripts/index-memories.js --apply   # summarize, embed and write
//
// See docs/CONVERSATION_MEMORY.md.

require('dotenv').config();
const { db } = require('../src/config/firebase');
const { isAvailable } = require('../src/config/vertex');
const { refreshMemory, CONVERSATIONS } = require('../src/services/memory.service');

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

  const conversations = await db.collection(CONVERSATIONS).get();
  const totals = { conversations: conversations.size, failed: 0 };

  // One at a time, to stay inside the Gemini quota. minNew: 1 catches up any chat
  // that has a message its summary has not seen.
  for (const doc of conversations.docs) {
    try {
      const status = await refreshMemory(doc.get('userId'), doc.id, { minNew: 1, dryRun: !apply });
      totals[status] = (totals[status] || 0) + 1;
    } catch (err) {
      totals.failed += 1;
      console.error(`${doc.id}: ${err.message}`);
    }
  }

  console.log(totals);
  process.exit(totals.failed > 0 ? 1 : 0);
})();
