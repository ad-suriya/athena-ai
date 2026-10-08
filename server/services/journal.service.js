'use strict';

const {
  requireDb,
  serverTimestamp,
  serializeDoc,
  getOwnedDoc,
  listOwnedDocs,
  byTimestamp,
} = require('./firestore.helpers');

const COLLECTION = 'journalEntries';

const getEntries = async (userId) => {
  const docs = await listOwnedDocs(COLLECTION, userId);
  return docs.sort(byTimestamp('createdAt', 'desc')).map((d) => serializeDoc(d));
};

const getEntry = async (userId, entryId) => {
  const { snap } = await getOwnedDoc(COLLECTION, entryId, userId);
  return serializeDoc(snap);
};

const createEntry = async (userId, data) => {
  const ref = requireDb().collection(COLLECTION).doc();
  await ref.set({
    userId,
    title: data.title ?? '',
    content: data.content,
    mood: data.mood ?? '',
    tags: data.tags ?? [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return serializeDoc(await ref.get());
};

const updateEntry = async (userId, entryId, data) => {
  const { ref } = await getOwnedDoc(COLLECTION, entryId, userId);
  await ref.update({ ...data, updatedAt: serverTimestamp() });
  return serializeDoc(await ref.get());
};

const deleteEntry = async (userId, entryId) => {
  const { ref } = await getOwnedDoc(COLLECTION, entryId, userId);
  await ref.delete();
};

module.exports = { getEntries, getEntry, createEntry, updateEntry, deleteEntry };
