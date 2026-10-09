'use strict';

const { requireDb, serverTimestamp, serializeDoc } = require('../utils/firestore');

// feedback/{id}: bug reports and suggestions from "Send feedback" and Chat's "Report issue".
const COLLECTION = 'feedback';

const createFeedback = async (userId, { type, message, email = '', context = {} }) => {
  const ref = requireDb().collection(COLLECTION).doc();
  await ref.set({ userId, type, message, email, context, createdAt: serverTimestamp() });
  return serializeDoc(await ref.get(), ['createdAt']);
};

module.exports = { createFeedback };
