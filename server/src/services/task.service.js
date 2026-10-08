'use strict';

const {
  requireDb,
  serverTimestamp,
  serializeDoc,
  getOwnedDoc,
  listOwnedDocs,
  byTimestamp,
} = require('../utils/firestore');

const COLLECTION = 'tasks';
const TIMESTAMP_FIELDS = ['createdAt', 'updatedAt', 'dueDate', 'completedAt'];

const TASK_STATUSES = ['todo', 'in_progress', 'completed', 'cancelled'];
const TASK_PRIORITIES = ['low', 'medium', 'high'];

const serialize = (snap) => serializeDoc(snap, TIMESTAMP_FIELDS);

// completedAt tracks the transition into/out of "completed".
const completionFields = (status) => {
  if (status === undefined) return {};
  return { completedAt: status === 'completed' ? serverTimestamp() : null };
};

const getTasks = async (userId) => {
  const docs = await listOwnedDocs(COLLECTION, userId);
  // Oldest first — matches the order tasks were appended in the UI.
  return docs.sort(byTimestamp('createdAt', 'asc')).map(serialize);
};

const getTask = async (userId, taskId) => {
  const { snap } = await getOwnedDoc(COLLECTION, taskId, userId);
  return serialize(snap);
};

const createTask = async (userId, data) => {
  const ref = requireDb().collection(COLLECTION).doc();
  const status = data.status ?? 'todo';
  await ref.set({
    userId,
    title: data.title.trim(),
    description: data.description ?? '',
    status,
    priority: data.priority ?? 'medium',
    dueDate: data.dueDate ?? null,
    category: data.category ?? '',
    tags: data.tags ?? [],
    icon: data.icon ?? '',
    ...completionFields(status),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return serialize(await ref.get());
};

const updateTask = async (userId, taskId, data) => {
  const { ref, snap } = await getOwnedDoc(COLLECTION, taskId, userId);
  const statusChanged = data.status !== undefined && data.status !== snap.get('status');
  await ref.update({
    ...data,
    ...(data.title !== undefined ? { title: data.title.trim() } : {}),
    ...(statusChanged ? completionFields(data.status) : {}),
    updatedAt: serverTimestamp(),
  });
  return serialize(await ref.get());
};

const deleteTask = async (userId, taskId) => {
  const { ref } = await getOwnedDoc(COLLECTION, taskId, userId);
  await ref.delete();
};

module.exports = {
  TASK_STATUSES,
  TASK_PRIORITIES,
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};
