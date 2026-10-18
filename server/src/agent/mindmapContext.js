'use strict';

// Pure helpers that read a mind map ({ nodes, connections }) for the AI features:
// the hierarchy around a node, a bounded subset of a large map, title matching for
// duplicate checks, and the data block placed in prompts. No I/O, so it is unit-tested.

// Connections without a type are the map's parent → child links; typed ones
// (related, dependency, …) are cross-links and do not define the hierarchy.
const isHierarchy = (c) => !c.type;

const buildIndex = ({ nodes = [], connections = [] }) => {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const children = new Map();
  const parents = new Map();
  for (const c of connections) {
    if (!isHierarchy(c) || !byId.has(c.from) || !byId.has(c.to)) continue;
    if (!children.has(c.from)) children.set(c.from, []);
    if (!parents.has(c.to)) parents.set(c.to, []);
    children.get(c.from).push(c.to);
    parents.get(c.to).push(c.from);
  }
  return { byId, children, parents };
};

// Nearest first; follows the first parent and stops on cycles.
const ancestorsOf = (index, id, max = 6) => {
  const out = [];
  const seen = new Set([id]);
  let current = index.parents.get(id)?.[0];
  while (current !== undefined && !seen.has(current) && out.length < max) {
    out.push(current);
    seen.add(current);
    current = index.parents.get(current)?.[0];
  }
  return out;
};

const childrenOf = (index, id) => index.children.get(id) || [];

const siblingsOf = (index, id) => {
  const out = new Set();
  for (const p of index.parents.get(id) || []) {
    for (const c of childrenOf(index, p)) if (c !== id) out.add(c);
  }
  return [...out];
};

// Breadth-first, excluding the node itself.
const descendantsOf = (index, id, { depth = 3, max = 60 } = {}) => {
  const out = [];
  const seen = new Set([id]);
  let frontier = [id];
  for (let d = 0; d < depth && frontier.length && out.length < max; d += 1) {
    const next = [];
    for (const n of frontier) {
      for (const c of childrenOf(index, n)) {
        if (seen.has(c) || out.length >= max) continue;
        seen.add(c);
        out.push(c);
        next.push(c);
      }
    }
    frontier = next;
  }
  return out;
};

// "  DSA practice! " and "dsa-practice" compare equal.
const normalizeTitle = (title = '') => title.toLowerCase().normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const STOP_WORDS = new Set(['a', 'an', 'and', 'the', 'of', 'to', 'for', 'in', 'on', 'my', 'with', 'or', 'is', 'at', 'by']);
const tokens = (text = '') => new Set(normalizeTitle(text).split(' ').filter((t) => t.length > 1 && !STOP_WORDS.has(t)));
const overlap = (a, b) => {
  let n = 0;
  for (const t of a) if (b.has(t)) n += 1;
  return n;
};

// Ids of at most `max` nodes worth showing the model when looking for connections.
// With a focus node: it, its hierarchy neighbourhood, then the nodes whose words
// overlap it most. Without: the whole map when small, else the nodes sharing the
// most words with others (the likeliest to have a relationship worth suggesting).
const focusSubset = (map, focusId, max = 50) => {
  const { nodes } = map;
  if (focusId === undefined && nodes.length <= max) return nodes.map((n) => n.id);
  const words = new Map(nodes.map((n) => [n.id, tokens(`${n.title} ${n.content || ''}`)]));

  if (focusId === undefined) {
    const score = new Map(nodes.map((n) => [n.id, 0]));
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const o = overlap(words.get(nodes[i].id), words.get(nodes[j].id));
        if (!o) continue;
        score.set(nodes[i].id, score.get(nodes[i].id) + o);
        score.set(nodes[j].id, score.get(nodes[j].id) + o);
      }
    }
    return nodes.map((n) => n.id).sort((a, b) => score.get(b) - score.get(a)).slice(0, max);
  }

  const index = buildIndex(map);
  const picked = new Set([focusId]);
  const add = (ids) => ids.forEach((id) => picked.size < max && picked.add(id));
  add(ancestorsOf(index, focusId));
  add(siblingsOf(index, focusId));
  add(descendantsOf(index, focusId, { depth: 2, max }));
  const own = words.get(focusId) || new Set();
  add(nodes
    .filter((n) => !picked.has(n.id))
    .map((n) => ({ id: n.id, o: overlap(own, words.get(n.id)) }))
    .sort((a, b) => b.o - a.o)
    .map((n) => n.id));
  return [...picked];
};

const clip = (text = '', max = 200) => (text.length > max ? `${text.slice(0, max)}…` : text);
const nodeData = (n) => ({ id: n.id, title: n.title, ...(n.content ? { notes: clip(n.content) } : {}), ...(n.status ? { status: n.status } : {}) });

// The selected node and its surroundings, for prompts.
const nodeContext = (map, id) => {
  const index = buildIndex(map);
  const pick = (ids) => ids.map((i) => index.byId.get(i)).filter(Boolean).map(nodeData);
  return {
    node: nodeData(index.byId.get(id)),
    ancestors: pick(ancestorsOf(index, id)),
    children: pick(childrenOf(index, id)),
    siblings: pick(siblingsOf(index, id).slice(0, 20)),
    descendants: pick(descendantsOf(index, id, { depth: 3, max: 40 })),
  };
};

// Progress of a node from its linked tasks' stored status (cancelled tasks don't count).
// suggestedStatus is only a suggestion for the user: all tasks done → 'completed';
// work started on a node still marked as an idea or plan → 'in_progress'.
const linkedProgress = (tasks = [], node = {}, now = new Date()) => {
  const counted = tasks.filter((t) => t.status !== 'cancelled');
  const completed = counted.filter((t) => t.status === 'completed').length;
  const inProgress = counted.filter((t) => t.status === 'in_progress').length;
  const overdue = counted.filter((t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now).length;
  let suggestedStatus = null;
  if (counted.length && completed === counted.length && node.status !== 'completed') suggestedStatus = 'completed';
  else if (inProgress && [undefined, null, 'idea', 'planned'].includes(node.status)) suggestedStatus = 'in_progress';
  return { total: counted.length, completed, inProgress, overdue, suggestedStatus };
};

// User content goes into prompts as JSON inside a tag. JSON escaping keeps it from
// closing the tag or posing as prompt text; the system instruction says tag contents
// are data, never instructions.
const dataBlock = (tag, value) => `<${tag}>\n${JSON.stringify(value, null, 1).replace(/</g, '\\u003c')}\n</${tag}>`;

module.exports = {
  isHierarchy,
  buildIndex,
  ancestorsOf,
  childrenOf,
  siblingsOf,
  descendantsOf,
  normalizeTitle,
  focusSubset,
  nodeData,
  nodeContext,
  linkedProgress,
  dataBlock,
};
