// Pure helpers that turn the parts of an Athena proposal the user accepted into map
// changes. Existing nodes are never moved; new nodes get positions next to the node
// they hang from (or beside the current map for a new one).
import { nextNodeId } from './mindMapUtils.js';

const COLUMN = 250; // horizontal step per level
const ROW = 96;     // vertical step between siblings

// True if a and b are joined, in either direction.
export const hasConnection = (connections, a, b) =>
  connections.some((c) => (c.from === a && c.to === b) || (c.from === b && c.to === a));

// Depth of each proposed node below its attachment point, for indenting the preview.
export const proposalDepths = (nodes) => {
  const byRef = new Map(nodes.map((n) => [n.ref, n]));
  const depth = new Map();
  const of = (n, seen = new Set()) => {
    if (depth.has(n.ref)) return depth.get(n.ref);
    const parent = typeof n.parent === 'string' && !seen.has(n.parent) ? byRef.get(n.parent) : null;
    const d = parent ? of(parent, seen.add(n.ref)) + 1 : 0;
    depth.set(n.ref, d);
    return d;
  };
  nodes.forEach((n) => of(n));
  return depth;
};

// graph: { nodes, connections }. proposal: { nodes: [{ ref, title, description, parent }] }.
// accepted: Set of refs. titles: { [ref]: edited title }. replace: start from an empty map.
// A rejected node's accepted children attach to its nearest accepted ancestor.
// → { nodes, connections, addedIds }
export const applyNodeProposal = (graph, proposal, { accepted, titles = {}, replace = false }) => {
  const base = replace ? { nodes: [], connections: [] } : graph;
  const existing = new Map(base.nodes.map((n) => [n.id, n]));
  const byRef = new Map(proposal.nodes.map((n) => [n.ref, n]));

  const parentOf = (n) => {
    let p = n.parent;
    const seen = new Set();
    while (typeof p === 'string' && !accepted.has(p) && !seen.has(p)) {
      seen.add(p);
      p = byRef.get(p)?.parent ?? null;
    }
    if (typeof p === 'string' && !accepted.has(p)) return null;
    if (typeof p === 'number' && !existing.has(p)) return null;
    return p ?? null;
  };

  const chosen = proposal.nodes.filter((n) => accepted.has(n.ref));
  let id = nextNodeId(base.nodes);
  const idOf = new Map(chosen.map((n) => [n.ref, id++]));

  // Children lists keyed by attachment: a ref, `e<id>` for an existing node, or 'root'.
  const keyOf = (p) => (p === null ? 'root' : typeof p === 'number' ? `e${p}` : p);
  const kids = new Map();
  chosen.forEach((n) => {
    const key = keyOf(parentOf(n));
    if (!kids.has(key)) kids.set(key, []);
    kids.get(key).push(n.ref);
  });

  // Simple tidy tree: leaves stack downwards, parents sit level with their children's middle.
  const pos = new Map();
  const place = (ref, x, cursor) => {
    const children = kids.get(ref) || [];
    if (!children.length) {
      pos.set(ref, { x, y: cursor.y });
      cursor.y += ROW;
      return cursor.y - ROW;
    }
    const ys = children.map((c) => place(c, x + COLUMN, cursor));
    const y = (ys[0] + ys[ys.length - 1]) / 2;
    pos.set(ref, { x, y });
    return y;
  };

  const hierarchyChildren = (parentId) => base.connections.filter((c) => !c.type && c.from === parentId).map((c) => existing.get(c.to)).filter(Boolean);
  for (const [key, refs] of kids) {
    if (!key.startsWith('e')) continue;
    const parent = existing.get(Number(key.slice(1)));
    const below = hierarchyChildren(parent.id);
    const cursor = { y: below.length ? Math.max(...below.map((n) => n.y)) + ROW : parent.y - ((refs.length - 1) * ROW) / 2 };
    refs.forEach((ref) => place(ref, parent.x + COLUMN, cursor));
  }
  if (kids.has('root')) {
    const right = base.nodes.length ? Math.max(...base.nodes.map((n) => n.x)) + COLUMN + 80 : 120;
    const cursor = { y: base.nodes.length ? Math.max(40, Math.min(...base.nodes.map((n) => n.y))) : 120 };
    kids.get('root').forEach((ref) => {
      place(ref, right, cursor);
      cursor.y += ROW / 2;
    });
  }

  const hasMain = base.nodes.some((n) => n.type === 'main');
  const added = chosen.map((n) => {
    const p = pos.get(n.ref);
    const isRoot = parentOf(n) === null;
    return {
      id: idOf.get(n.ref),
      x: Math.round(p.x),
      y: Math.round(Math.max(0, p.y)),
      title: (titles[n.ref] ?? n.title).trim().slice(0, 200) || 'Untitled',
      content: (n.description || '').slice(0, 5000),
      type: isRoot && !hasMain ? 'main' : 'secondary',
      expanded: true,
    };
  });
  const links = chosen
    .filter((n) => parentOf(n) !== null)
    .map((n) => {
      const p = parentOf(n);
      return { from: typeof p === 'number' ? p : idOf.get(p), to: idOf.get(n.ref) };
    });

  return {
    nodes: [...base.nodes, ...added],
    connections: [...base.connections, ...links],
    addedIds: added.map((n) => n.id),
  };
};

// suggestions: [{ from, to, type, reason }]; accepted: Set of indexes; types: { [index]: type }.
// Suggestions whose nodes are gone or already joined are skipped. → { connections, added }
export const applyConnectionProposal = (graph, suggestions, { accepted, types = {} }) => {
  const ids = new Set(graph.nodes.map((n) => n.id));
  const connections = [...graph.connections];
  let added = 0;
  suggestions.forEach((s, i) => {
    if (!accepted.has(i) || s.from === s.to || !ids.has(s.from) || !ids.has(s.to) || hasConnection(connections, s.from, s.to)) return;
    connections.push({ from: s.from, to: s.to, type: types[i] || s.type, label: s.reason.slice(0, 200) });
    added += 1;
  });
  return { connections, added };
};
