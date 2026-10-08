'use strict';

const {
  admin,
  requireDb,
  serverTimestamp,
  serializeDoc,
  toIso,
  getOwnedDoc,
  listOwnedDocs,
  byTimestamp,
  DOC_ID_PATTERN,
} = require('./firestore.helpers');
const aiService = require('./ai.service');
const { notFoundError, validationFailed } = require('../utils/errors');

const COLLECTION = 'conversations';
const MESSAGES = 'messages';
const TITLE_LENGTH = 30; // matches the legacy client (substring(0, 30))
const PREVIEW_LENGTH = 200;
// Prior messages loaded as AI context (ai.service applies the same cap).
const CONTEXT_MESSAGES = 50;

const preview = (text) => (text || '').slice(0, PREVIEW_LENGTH);
const titleFrom = (text) => (text || '').trim().slice(0, TITLE_LENGTH) || 'New Chat';

const serializeMessage = (snap) => {
  const message = serializeDoc(snap, ['createdAt']);
  if (message.metadata?.editedAt) {
    message.metadata = { ...message.metadata, editedAt: toIso(message.metadata.editedAt) };
  }
  return message;
};

const getOwnedConversation = (userId, conversationId) => getOwnedDoc(COLLECTION, conversationId, userId);

// ---------------------------------------------------------------------------
// Legacy migration: users/{uid}/conversations/{id} (messages[] array)
//   → conversations/{id} + conversations/{id}/messages/{legacy-NNNNN}
// Copy only. Legacy documents are never modified. See docs/DATA_MIGRATION.md.
// ---------------------------------------------------------------------------

const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const LEGACY_FLAGS = ['isSearch', 'isDeepResearch', 'isCriticalAnalysis'];

const buildLegacyCopy = (userId, legacySnap) => {
  const data = legacySnap.data();
  const legacyMessages = Array.isArray(data.messages) ? data.messages.filter((m) => m && typeof m === 'object') : [];
  const convCreated = toDate(data.createdAt) || toDate(legacyMessages[0]?.timestamp) || new Date(0);

  // createdAt must be strictly increasing so ordering by createdAt reproduces array order,
  // even when timestamps are missing, equal, or out of order (edited arrays).
  let previous = convCreated.getTime() - 1;
  const messages = legacyMessages.map((m, index) => {
    const parsed = toDate(m.timestamp)?.getTime() ?? previous + 1;
    const createdAtMs = Math.max(parsed, previous + 1);
    previous = createdAtMs;

    const metadata = { legacyIndex: index };
    for (const flag of LEGACY_FLAGS) if (m[flag] === true) metadata[flag] = true;

    return {
      id: `legacy-${String(index).padStart(5, '0')}`,
      data: {
        conversationId: legacySnap.id,
        role: typeof m.role === 'string' ? m.role : 'assistant',
        content: typeof m.content === 'string' ? m.content : '',
        createdAt: admin.firestore.Timestamp.fromMillis(createdAtMs),
        model: m.modelUsed || m.model || '',
        metadata,
      },
    };
  });

  const last = messages[messages.length - 1];
  const conversation = {
    userId,
    title: typeof data.title === 'string' && data.title ? data.title : 'New Chat',
    createdAt: admin.firestore.Timestamp.fromDate(convCreated),
    updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function'
      ? data.updatedAt
      : admin.firestore.Timestamp.fromMillis(last ? last.data.createdAt.toMillis() : convCreated.getTime()),
    lastMessage: preview(last?.data.content),
    messageCount: messages.length,
    archived: data.archived === true,
    legacyPath: legacySnap.ref.path,
  };

  return { conversation, messages };
};

// Firestore batches are limited to 500 writes; the largest legacy conversation has 40 messages.
const MAX_BATCH_WRITES = 500;

// Returns { found, alreadyMigrated, migrated, failed }. With dryRun, nothing is written.
const migrateLegacyConversations = async (userId, { dryRun = false } = {}) => {
  const db = requireDb();
  const legacy = await db.collection('users').doc(userId).collection(COLLECTION).get();
  const stats = { found: legacy.size, alreadyMigrated: 0, migrated: 0, failed: 0 };
  if (legacy.empty) return stats;

  const existing = new Set((await listOwnedDocs(COLLECTION, userId)).map((d) => d.id));

  for (const legacySnap of legacy.docs) {
    if (existing.has(legacySnap.id)) {
      stats.alreadyMigrated++;
      continue;
    }
    if (dryRun) {
      stats.migrated++;
      continue;
    }

    const { conversation, messages } = buildLegacyCopy(userId, legacySnap);
    if (messages.length + 1 > MAX_BATCH_WRITES) {
      console.error(`Legacy migration: ${legacySnap.ref.path} has too many messages for one batch`);
      stats.failed++;
      continue;
    }

    const ref = db.collection(COLLECTION).doc(legacySnap.id);
    const batch = db.batch();
    batch.create(ref, conversation); // fails the whole batch if it already exists
    for (const m of messages) batch.set(ref.collection(MESSAGES).doc(m.id), m.data);

    try {
      await batch.commit();
      stats.migrated++;
    } catch (err) {
      if (err.code === 6 /* ALREADY_EXISTS */) {
        stats.alreadyMigrated++;
      } else {
        console.error(`Legacy migration failed for ${legacySnap.ref.path}:`, err);
        stats.failed++;
      }
    }
  }

  return stats;
};

// Lazy migration: once per user per server process. Concurrent callers share one run.
const migrationRuns = new Map();

const ensureLegacyMigrated = (userId) => {
  if (!migrationRuns.has(userId)) {
    const run = migrateLegacyConversations(userId)
      .then((stats) => {
        if (stats.migrated || stats.failed) console.log(`Legacy conversations for ${userId}:`, stats);
        if (stats.failed) migrationRuns.delete(userId); // retry on next request
      })
      .catch((err) => {
        console.error(`Legacy migration error for ${userId}:`, err);
        migrationRuns.delete(userId);
      });
    migrationRuns.set(userId, run);
  }
  return migrationRuns.get(userId);
};

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

const getConversations = async (userId) => {
  await ensureLegacyMigrated(userId);
  const docs = await listOwnedDocs(COLLECTION, userId);
  return docs.sort(byTimestamp('updatedAt', 'desc')).map((d) => serializeDoc(d));
};

const getConversation = async (userId, conversationId) => {
  const { snap } = await getOwnedConversation(userId, conversationId);
  return serializeDoc(snap);
};

const createConversation = async (userId, data) => {
  const ref = requireDb().collection(COLLECTION).doc();
  await ref.set({
    userId,
    title: data.title?.trim() ? data.title.trim() : 'New Chat',
    lastMessage: '',
    messageCount: 0,
    archived: data.archived ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return serializeDoc(await ref.get());
};

const updateConversation = async (userId, conversationId, data) => {
  const { ref } = await getOwnedConversation(userId, conversationId);
  await ref.update({
    ...data,
    ...(data.title !== undefined ? { title: data.title.trim() || 'New Chat' } : {}),
    updatedAt: serverTimestamp(),
  });
  return serializeDoc(await ref.get());
};

// Deletes the conversation, its messages, and the legacy source document (if any),
// so the lazy migration does not bring it back. The old client also deleted the legacy doc.
const deleteConversation = async (userId, conversationId) => {
  const { ref } = await getOwnedConversation(userId, conversationId);
  const db = requireDb();
  await db.recursiveDelete(ref);
  await db.collection('users').doc(userId).collection(COLLECTION).doc(conversationId).delete();
};

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

const loadMessages = async (convRef) => {
  const snapshot = await convRef.collection(MESSAGES).orderBy('createdAt', 'asc').get();
  return snapshot.docs;
};

const getMessages = async (userId, conversationId) => {
  const { ref } = await getOwnedConversation(userId, conversationId);
  return (await loadMessages(ref)).map(serializeMessage);
};

const toHistory = (messageDocs) =>
  messageDocs
    .slice(-CONTEXT_MESSAGES)
    .map((d) => ({ role: d.get('role'), content: d.get('content') }))
    .filter((m) => m.role === 'user' || m.role === 'assistant');

const addMessage = async (convRef, { role, content, model = '', metadata = {} }) => {
  const msgRef = convRef.collection(MESSAGES).doc();
  await msgRef.set({
    conversationId: convRef.id,
    role,
    content,
    createdAt: serverTimestamp(),
    model,
    metadata,
  });
  return msgRef;
};

// Flow: verify ownership → save user message → build context → Vertex AI →
// save assistant message → return both.
// If the AI call fails, the user message stays saved and the AI error is thrown.
const sendMessage = async (userId, conversationId, { content, metadata }) => {
  const { ref: convRef, snap: convSnap } = await getOwnedConversation(userId, conversationId);
  const increment = admin.firestore.FieldValue.increment;

  const history = toHistory(await loadMessages(convRef));

  const userMsgRef = await addMessage(convRef, { role: 'user', content, metadata });
  await convRef.update({
    lastMessage: preview(content),
    messageCount: increment(1),
    updatedAt: serverTimestamp(),
    ...(convSnap.get('messageCount') === 0 && convSnap.get('title') === 'New Chat' ? { title: titleFrom(content) } : {}),
  });

  const { text, model } = await aiService.generateResponse(content, history);

  const assistantMsgRef = await addMessage(convRef, { role: 'assistant', content: text, model, metadata });
  await convRef.update({
    lastMessage: preview(text),
    messageCount: increment(1),
    updatedAt: serverTimestamp(),
  });

  return {
    userMessage: serializeMessage(await userMsgRef.get()),
    assistantMessage: serializeMessage(await assistantMsgRef.get()),
  };
};

const getOwnedMessage = async (userId, conversationId, messageId) => {
  const { ref: convRef } = await getOwnedConversation(userId, conversationId);
  if (!DOC_ID_PATTERN.test(messageId)) throw notFoundError();
  const msgRef = convRef.collection(MESSAGES).doc(messageId);
  const msgSnap = await msgRef.get();
  if (!msgSnap.exists) throw notFoundError();
  return { convRef, msgRef, msgSnap };
};

// Only the user's own messages can be edited.
const editMessage = async (userId, conversationId, messageId, { content }) => {
  const { convRef, msgRef, msgSnap } = await getOwnedMessage(userId, conversationId, messageId);
  if (msgSnap.get('role') !== 'user') {
    throw validationFailed({ messageId: 'Only user messages can be edited' });
  }
  await msgRef.update({ content, 'metadata.editedAt': serverTimestamp() });
  await convRef.update({ updatedAt: serverTimestamp() });
  return serializeMessage(await msgRef.get());
};

// Replaces an assistant message with a fresh response to the user message before it.
// That message and everything after it are removed, matching the old client behaviour.
// Nothing is deleted if the AI call fails.
const regenerateMessage = async (userId, conversationId, messageId) => {
  const { convRef } = await getOwnedMessage(userId, conversationId, messageId);
  const docs = await loadMessages(convRef);
  const index = docs.findIndex((d) => d.id === messageId);
  const target = docs[index];
  const prompt = docs[index - 1];

  if (target.get('role') !== 'assistant' || !prompt || prompt.get('role') !== 'user') {
    throw validationFailed({ messageId: 'Must be an assistant message that follows a user message' });
  }

  const { text, model } = await aiService.generateResponse(prompt.get('content'), toHistory(docs.slice(0, index - 1)));

  const db = requireDb();
  const removed = docs.slice(index);
  for (let i = 0; i < removed.length; i += MAX_BATCH_WRITES) {
    const batch = db.batch();
    removed.slice(i, i + MAX_BATCH_WRITES).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  const metadata = { ...(prompt.get('metadata') || {}), regenerated: true };
  delete metadata.editedAt;
  delete metadata.legacyIndex;
  const msgRef = await addMessage(convRef, { role: 'assistant', content: text, model, metadata });
  await convRef.update({
    lastMessage: preview(text),
    messageCount: index + 1,
    updatedAt: serverTimestamp(),
  });

  return serializeMessage(await msgRef.get());
};

module.exports = {
  migrateLegacyConversations,
  getConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
  getMessages,
  sendMessage,
  editMessage,
  regenerateMessage,
};
