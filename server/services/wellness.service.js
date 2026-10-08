'use strict';

const {
  requireDb,
  serverTimestamp,
  serializeDoc,
  getOwnedDoc,
  listOwnedDocs,
  byTimestamp,
} = require('./firestore.helpers');

const COLLECTION = 'wellnessEntries';
const TIMESTAMP_FIELDS = ['createdAt', 'updatedAt', 'recordedAt'];

const serialize = (snap) => serializeDoc(snap, TIMESTAMP_FIELDS);

// Newest first. from/to (Dates, optional) select entries whose recordedAt is in [from, to).
const getEntries = async (userId, { from, to } = {}) => {
  const docs = await listOwnedDocs(COLLECTION, userId);
  return docs
    .filter((d) => {
      const at = d.get('recordedAt')?.toDate?.();
      return at && (!from || at >= from) && (!to || at < to);
    })
    .sort(byTimestamp('recordedAt', 'desc'))
    .map(serialize);
};

const getEntry = async (userId, entryId) => {
  const { snap } = await getOwnedDoc(COLLECTION, entryId, userId);
  return serialize(snap);
};

// Metrics are optional individually (a user may log only sleep), but the
// controller requires at least one.
const createEntry = async (userId, data) => {
  const ref = requireDb().collection(COLLECTION).doc();
  await ref.set({
    userId,
    mood: data.mood ?? null,
    energy: data.energy ?? null,
    stress: data.stress ?? null,
    sleepHours: data.sleepHours ?? null,
    note: data.note ?? '',
    recordedAt: data.recordedAt ?? serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return serialize(await ref.get());
};

const updateEntry = async (userId, entryId, data) => {
  const { ref } = await getOwnedDoc(COLLECTION, entryId, userId);
  await ref.update({ ...data, updatedAt: serverTimestamp() });
  return serialize(await ref.get());
};

const deleteEntry = async (userId, entryId) => {
  const { ref } = await getOwnedDoc(COLLECTION, entryId, userId);
  await ref.delete();
};

module.exports = { getEntries, getEntry, createEntry, updateEntry, deleteEntry };
