'use strict';

const { admin, db } = require('../config/firebase');
const { notFoundError, serviceUnavailable } = require('../utils/errors');

const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();

const requireDb = () => {
  if (!db) throw serviceUnavailable('Database is not configured');
  return db;
};

// Firestore Timestamps → ISO strings so API responses are plain JSON.
const toIso = (value) => (value && typeof value.toDate === 'function' ? value.toDate().toISOString() : value ?? null);

const serializeDoc = (snap, timestampFields = ['createdAt', 'updatedAt']) => {
  const data = snap.data();
  const out = { id: snap.id, ...data };
  for (const field of timestampFields) {
    if (field in out) out[field] = toIso(out[field]);
  }
  return out;
};

// Loads a document and verifies it belongs to userId.
// Missing and not-owned are both reported as 404 so other users' IDs are not revealed.
const DOC_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

const getOwnedDoc = async (collection, id, userId) => {
  if (!DOC_ID_PATTERN.test(id)) throw notFoundError();
  const ref = requireDb().collection(collection).doc(id);
  const snap = await ref.get();
  if (!snap.exists || snap.get('userId') !== userId) {
    throw notFoundError();
  }
  return { ref, snap };
};

// Single-field equality query only, so no composite index is required.
// Sorting happens in memory; per-user collections are small.
const listOwnedDocs = async (collection, userId) => {
  const snapshot = await requireDb().collection(collection).where('userId', '==', userId).get();
  return snapshot.docs;
};

// Comparator for DocumentSnapshots on a Timestamp field; missing values sort as 0.
const byTimestamp = (field, direction = 'asc') => (a, b) => {
  const ta = a.get(field)?.toMillis?.() ?? 0;
  const tb = b.get(field)?.toMillis?.() ?? 0;
  return direction === 'asc' ? ta - tb : tb - ta;
};

module.exports = {
  admin,
  serverTimestamp,
  requireDb,
  toIso,
  serializeDoc,
  getOwnedDoc,
  listOwnedDocs,
  byTimestamp,
  DOC_ID_PATTERN,
};
