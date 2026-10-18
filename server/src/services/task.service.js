'use strict';

const {
  requireDb,
  serverTimestamp,
  deleteField,
  isAlreadyExists,
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

// The stored fields of a new task. mindMapNodeId (optional) links it to the mind map
// node it was planned from; it is only set by the AI planner, never by the REST API.
const newTaskDoc = (userId, data) => {
  const status = data.status ?? 'todo';
  return {
    userId,
    title: data.title.trim(),
    description: data.description ?? '',
    status,
    priority: data.priority ?? 'medium',
    dueDate: data.dueDate ?? null,
    category: data.category ?? '',
    tags: data.tags ?? [],
    icon: data.icon ?? '',
    ...(data.mindMapNodeId ? { mindMapNodeId: data.mindMapNodeId } : {}),
    ...completionFields(status),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
};

const createTask = async (userId, data) => {
  const ref = requireDb().collection(COLLECTION).doc();
  await ref.set(newTaskDoc(userId, data));
  return serialize(await ref.get());
};

// Creates the task with a caller-chosen id, at most once: a retry with the same id
// returns the task made the first time instead of a duplicate. → { task, created }
// A matching id owned by someone else is reported as not found.
const createTaskOnce = async (userId, taskId, data) => {
  const ref = requireDb().collection(COLLECTION).doc(taskId);
  try {
    await ref.create(newTaskDoc(userId, data));
    return { task: serialize(await ref.get()), created: true };
  } catch (err) {
    if (!isAlreadyExists(err)) throw err;
  }
  const { snap } = await getOwnedDoc(COLLECTION, taskId, userId);
  return { task: serialize(snap), created: false };
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

// Tasks linked to mind map nodes, grouped by node id: { [nodeId]: [task] }.
const getTasksByMindMapNode = async (userId) => {
  const groups = {};
  for (const task of await getTasks(userId)) {
    if (task.mindMapNodeId) (groups[task.mindMapNodeId] ||= []).push(task);
  }
  return groups;
};

// Clears the link on tasks whose mind map node was removed, so a later node that
// reuses the id does not inherit them. The tasks themselves are kept.
const unlinkMindMapNodes = async (userId, nodeIds) => {
  const removed = new Set(nodeIds);
  const docs = (await listOwnedDocs(COLLECTION, userId)).filter((d) => removed.has(d.get('mindMapNodeId')));
  if (!docs.length) return 0;
  const batch = requireDb().batch();
  docs.forEach((d) => batch.update(d.ref, { mindMapNodeId: deleteField(), updatedAt: serverTimestamp() }));
  await batch.commit();
  return docs.length;
};

module.exports = {
  TASK_STATUSES,
  TASK_PRIORITIES,
  getTasks,
  getTask,
  createTask,
  createTaskOnce,
  updateTask,
  deleteTask,
  getTasksByMindMapNode,
  unlinkMindMapNodes,
};
