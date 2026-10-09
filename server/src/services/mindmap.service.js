'use strict';

const { requireDb, serverTimestamp, serializeDoc } = require('../utils/firestore');
const { validationFailed, notFoundError } = require('../utils/errors');

// One mind map per user, stored at mindMaps/{userId}:
// { userId, nodes: [{ id, x, y, title, content, type, expanded }], connections: [{ from, to }] }
const COLLECTION = 'mindMaps';
const NODE_TYPES = ['main', 'secondary', 'note', 'ai'];
const MAX_NODES = 500;
const MAX_CONNECTIONS = 1000;
const MAX_TITLE = 200;
const MAX_CONTENT = 5000;

const mapRef = (userId) => requireDb().collection(COLLECTION).doc(userId);

const EMPTY = { nodes: [], connections: [] };

// Checks and normalizes a whole map. Throws 422 with per-field messages.
const normalizeMap = ({ nodes, connections }) => {
  if (!Array.isArray(nodes) || nodes.length > MAX_NODES) {
    throw validationFailed({ nodes: `Must be an array of at most ${MAX_NODES} nodes` });
  }
  if (!Array.isArray(connections) || connections.length > MAX_CONNECTIONS) {
    throw validationFailed({ connections: `Must be an array of at most ${MAX_CONNECTIONS} connections` });
  }

  const ids = new Set();
  const cleanNodes = nodes.map((n, i) => {
    const ok = n && typeof n === 'object'
      && Number.isInteger(n.id) && n.id > 0 && !ids.has(n.id)
      && Number.isFinite(n.x) && Number.isFinite(n.y)
      && typeof n.title === 'string' && n.title.length <= MAX_TITLE
      && (n.content === undefined || (typeof n.content === 'string' && n.content.length <= MAX_CONTENT))
      && (n.type === undefined || NODE_TYPES.includes(n.type));
    if (!ok) throw validationFailed({ [`nodes[${i}]`]: 'Invalid node' });
    ids.add(n.id);
    return {
      id: n.id,
      x: Math.round(n.x),
      y: Math.round(n.y),
      title: n.title,
      content: n.content ?? '',
      type: n.type ?? 'secondary',
      expanded: n.expanded !== false,
    };
  });

  const seen = new Set();
  const cleanConnections = connections.filter((c, i) => {
    if (!c || !ids.has(c.from) || !ids.has(c.to) || c.from === c.to) {
      throw validationFailed({ [`connections[${i}]`]: 'Must join two different existing nodes' });
    }
    const key = `${c.from}-${c.to}`;
    if (seen.has(key)) return false; // drop duplicates
    seen.add(key);
    return true;
  }).map((c) => ({ from: c.from, to: c.to }));

  return { nodes: cleanNodes, connections: cleanConnections };
};

// Returns the user's map, or an empty one if they have never saved.
const getMap = async (userId) => {
  const snap = await mapRef(userId).get();
  if (!snap.exists) return { ...EMPTY, updatedAt: null };
  const { nodes, connections, updatedAt } = serializeDoc(snap);
  return { nodes: nodes || [], connections: connections || [], updatedAt };
};

// Replaces the whole map.
const saveMap = async (userId, data) => {
  const map = normalizeMap(data);
  const ref = mapRef(userId);
  const exists = (await ref.get()).exists;
  await ref.set({
    userId,
    ...map,
    updatedAt: serverTimestamp(),
    ...(exists ? {} : { createdAt: serverTimestamp() }),
  }, { merge: true });
  return getMap(userId);
};

// --- Single-node edits (used by the AI). Each reads, changes and saves the whole map.

const findNode = (map, id) => {
  const node = map.nodes.find((n) => n.id === id);
  if (!node) throw notFoundError(`No mind map node with id ${id}`);
  return node;
};

// Adds a node; placed to the right of `connectTo` when given, else below the lowest node.
const addNode = async (userId, { title, content = '', type, connectTo }) => {
  const map = await getMap(userId);
  const id = map.nodes.length ? Math.max(...map.nodes.map((n) => n.id)) + 1 : 1;
  const anchor = connectTo !== undefined ? findNode(map, connectTo) : null;
  const siblings = anchor ? map.connections.filter((c) => c.from === anchor.id).length : 0;
  const lowest = map.nodes.reduce((y, n) => Math.max(y, n.y), 0);
  const node = {
    id,
    x: anchor ? anchor.x + 240 : 120,
    y: anchor ? anchor.y + siblings * 110 : (map.nodes.length ? lowest + 140 : 120),
    title,
    content,
    type: type || (map.nodes.length ? 'secondary' : 'main'),
    expanded: true,
  };
  const saved = await saveMap(userId, {
    nodes: [...map.nodes, node],
    connections: anchor ? [...map.connections, { from: anchor.id, to: id }] : map.connections,
  });
  return saved.nodes.find((n) => n.id === id);
};

const updateNode = async (userId, id, changes) => {
  const map = await getMap(userId);
  findNode(map, id);
  const saved = await saveMap(userId, { ...map, nodes: map.nodes.map((n) => (n.id === id ? { ...n, ...changes } : n)) });
  return saved.nodes.find((n) => n.id === id);
};

// Removes the node and its connections.
const deleteNode = async (userId, id) => {
  const map = await getMap(userId);
  const node = findNode(map, id);
  await saveMap(userId, {
    nodes: map.nodes.filter((n) => n.id !== id),
    connections: map.connections.filter((c) => c.from !== id && c.to !== id),
  });
  return node;
};

const connectNodes = async (userId, from, to) => {
  const map = await getMap(userId);
  findNode(map, from);
  findNode(map, to);
  await saveMap(userId, { ...map, connections: [...map.connections, { from, to }] });
  return { from, to };
};

module.exports = { getMap, saveMap, normalizeMap, NODE_TYPES, addNode, updateNode, deleteNode, connectNodes };
