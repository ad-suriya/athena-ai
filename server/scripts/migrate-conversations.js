'use strict';

// Copies legacy conversations (users/{uid}/conversations/{id} with a messages[] array)
// to conversations/{id} + messages subcollection. Never modifies or deletes legacy data.
// Idempotent: conversations that already exist in the new structure are skipped.
//
//   node scripts/migrate-conversations.js           # dry run — counts only, writes nothing
//   node scripts/migrate-conversations.js --apply   # perform the copy
//
// The API also runs this lazily per user on GET /api/conversations, so running the
// script is optional. See docs/DATA_MIGRATION.md.

require('dotenv').config();
const { db } = require('../config/firebase');
const { migrateLegacyConversations } = require('../services/conversation.service');

const apply = process.argv.includes('--apply');

(async () => {
  if (!db) {
    console.error('Firestore is not configured (check FIREBASE_* in server/.env).');
    process.exit(1);
  }

  console.log(`Project: ${process.env.FIREBASE_PROJECT_ID} — ${apply ? 'APPLYING' : 'DRY RUN (pass --apply to write)'}`);

  // listDocuments() includes users that only exist as a parent of subcollections.
  const users = await db.collection('users').listDocuments();
  const totals = { users: 0, found: 0, alreadyMigrated: 0, migrated: 0, failed: 0 };

  for (const userRef of users) {
    const stats = await migrateLegacyConversations(userRef.id, { dryRun: !apply });
    if (stats.found === 0) continue;
    totals.users++;
    for (const key of ['found', 'alreadyMigrated', 'migrated', 'failed']) totals[key] += stats[key];
    console.log(`${userRef.id}: ${JSON.stringify(stats)}`);
  }

  console.log(`\n${apply ? 'Migrated' : 'Would migrate'}:`, totals);
  process.exit(totals.failed > 0 ? 1 : 0);
})().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
