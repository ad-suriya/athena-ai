'use strict';

const { requireDb, serverTimestamp, toIso } = require('../utils/firestore');
const conversationService = require('./conversation.service');

const COLLECTION = 'users';

// Creates users/{uid} on first sign-in, otherwise updates lastLogin.
// Same fields the client used to write directly from login.jsx.
const upsertUser = async (userRecord) => {
  const ref = requireDb().collection(COLLECTION).doc(userRecord.uid);
  const snap = await ref.get();

  if (snap.exists) {
    await ref.update({ lastLogin: serverTimestamp() });
    return;
  }

  await ref.set({
    uid: userRecord.uid,
    name: userRecord.displayName || 'Anonymous',
    email: userRecord.email || 'no-email',
    photoURL: userRecord.photoURL || '',
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
};

// Profile for the signed-in user. Falls back to token claims if users/{uid}
// has not been written yet (e.g. profile sync failed at sign-in).
const getProfile = async (token) => {
  const [snap, conversations] = await Promise.all([
    requireDb().collection(COLLECTION).doc(token.uid).get(),
    conversationService.countConversations(token.uid),
  ]);
  const data = snap.exists ? snap.data() : {};

  return {
    uid: token.uid,
    name: data.name || token.name || 'Anonymous',
    email: data.email || token.email || '',
    photoURL: data.photoURL || token.picture || '',
    createdAt: toIso(data.createdAt),
    lastLogin: toIso(data.lastLogin),
    stats: { conversations },
  };
};

module.exports = { upsertUser, getProfile };
