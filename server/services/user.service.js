'use strict';

const { requireDb, serverTimestamp } = require('./firestore.helpers');

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

module.exports = { upsertUser };
