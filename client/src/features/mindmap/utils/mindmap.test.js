// Unit tests for the mind map's pure helpers. Run with `npm test` (node:test, no browser).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createNode, nextNodeId, tidyLayout, toPayload } from './mindMapUtils.js';
import { applyConnectionProposal, applyNodeProposal, hasConnection, proposalDepths } from './proposalUtils.js';
import { buildApprovedPlan, fromDateInput, isPlanReady, toDateInput } from './planUtils.js';

const node = (id, x = 100, y = 100, extra = {}) => ({ id, x, y, title: `N${id}`, content: '', type: 'secondary', expanded: true, ...extra });

// ---------------------------------------------------------------- existing helpers

test('nextNodeId, createNode and tidyLayout keep their behaviour', () => {
  assert.equal(nextNodeId([]), 1);
  assert.equal(nextNodeId([node(3), node(7)]), 8);
  assert.deepEqual(createNode(4, 190, 140, 'main'), { id: 4, x: 100, y: 100, title: 'New idea', content: '', type: 'main', expanded: true });
  assert.deepEqual(tidyLayout([node(1), node(2), node(3), node(4)]).map((n) => [n.x, n.y]), [[100, 100], [300, 100], [500, 100], [100, 250]]);
});

test('toPayload saves old maps unchanged and keeps the optional fields only when set', () => {
  const legacy = toPayload([{ ...node(1), selected: true }], [{ from: 1, to: 2 }]);
  assert.deepEqual(legacy, { nodes: [node(1)], connections: [{ from: 1, to: 2 }] });
  const rich = toPayload([node(1, 0, 0, { status: 'blocked' }), node(2, 0, 0, { status: undefined })], [{ from: 1, to: 2, type: 'dependency', label: 'first' }, { from: 2, to: 1, label: 'ignored without a type' }]);
  assert.equal(rich.nodes[0].status, 'blocked');
  assert.equal('status' in rich.nodes[1], false);
  assert.deepEqual(rich.connections, [{ from: 1, to: 2, type: 'dependency', label: 'first' }, { from: 2, to: 1 }]);
});

test('hasConnection checks both directions', () => {
  const connections = [{ from: 1, to: 2 }];
  assert.equal(hasConnection(connections, 1, 2), true);
  assert.equal(hasConnection(connections, 2, 1), true);
  assert.equal(hasConnection(connections, 1, 3), false);
});

// ---------------------------------------------------------------- applying node proposals

const PROPOSAL = {
  nodes: [
    { ref: 'new-1', title: 'Internships', description: 'Main goal', parent: null },
    { ref: 'new-2', title: 'DSA', description: '', parent: 'new-1' },
    { ref: 'new-3', title: 'Arrays', description: '', parent: 'new-2' },
    { ref: 'new-4', title: 'Resume', description: '', parent: 'new-1' },
  ],
};
const all = (p) => new Set(p.nodes.map((n) => n.ref));

test('a new map applies as a tree with fresh ids, a main root and explicit links', () => {
  const out = applyNodeProposal({ nodes: [], connections: [] }, PROPOSAL, { accepted: all(PROPOSAL) });
  assert.deepEqual(out.addedIds, [1, 2, 3, 4]);
  assert.deepEqual(out.nodes.map((n) => [n.id, n.title, n.type]), [[1, 'Internships', 'main'], [2, 'DSA', 'secondary'], [3, 'Arrays', 'secondary'], [4, 'Resume', 'secondary']]);
  assert.equal(out.nodes[0].content, 'Main goal');
  assert.deepEqual(out.connections, [{ from: 1, to: 2 }, { from: 2, to: 3 }, { from: 1, to: 4 }]);
  // Children sit one column right of their parent; leaves don't overlap.
  const byId = Object.fromEntries(out.nodes.map((n) => [n.id, n]));
  assert.ok(byId[2].x > byId[1].x && byId[3].x > byId[2].x);
  assert.notEqual(byId[3].y, byId[4].y);
});

test('adding next to an existing map never moves existing nodes and keeps a single main node', () => {
  const graph = { nodes: [node(5, 400, 300, { type: 'main' })], connections: [] };
  const out = applyNodeProposal(graph, PROPOSAL, { accepted: all(PROPOSAL) });
  assert.deepEqual(out.nodes[0], graph.nodes[0]);
  assert.deepEqual(out.addedIds, [6, 7, 8, 9]);
  assert.ok(out.nodes.slice(1).every((n) => n.x > 400), 'placed to the right of the map');
  assert.equal(out.nodes.filter((n) => n.type === 'main').length, 1);
});

test('expansion attaches under the existing node, below its existing children', () => {
  const graph = { nodes: [node(1, 100, 100), node(2, 350, 300)], connections: [{ from: 1, to: 2 }] };
  const proposal = { nodes: [{ ref: 'new-1', title: 'A', parent: 1 }, { ref: 'new-2', title: 'B', parent: 1 }] };
  const out = applyNodeProposal(graph, proposal, { accepted: all(proposal) });
  assert.deepEqual(out.connections.slice(1), [{ from: 1, to: 3 }, { from: 1, to: 4 }]);
  assert.ok(out.nodes.slice(2).every((n) => n.y > 300 && n.x === 350));
});

test('rejected and edited suggestions: children of a rejected node move up, titles are trimmed', () => {
  const accepted = new Set(['new-1', 'new-3']);
  const out = applyNodeProposal({ nodes: [], connections: [] }, PROPOSAL, { accepted, titles: { 'new-3': '  Arrays & Strings  ', 'new-1': '   ' } });
  assert.deepEqual(out.nodes.map((n) => n.title), ['Untitled', 'Arrays & Strings']);
  assert.deepEqual(out.connections, [{ from: 1, to: 2 }]);
});

test('replace starts from an empty map; links to nodes that vanished are dropped', () => {
  const graph = { nodes: [node(1), node(2)], connections: [{ from: 1, to: 2 }] };
  const replaced = applyNodeProposal(graph, PROPOSAL, { accepted: all(PROPOSAL), replace: true });
  assert.deepEqual(replaced.addedIds, [1, 2, 3, 4]);
  assert.equal(replaced.nodes.length, 4);
  // A proposal for node 9, which the user deleted meanwhile, becomes a top-level idea.
  const orphan = applyNodeProposal(graph, { nodes: [{ ref: 'new-1', title: 'X', parent: 9 }] }, { accepted: new Set(['new-1']) });
  assert.equal(orphan.connections.length, 1);
});

test('proposalDepths indents by nesting', () => {
  assert.deepEqual([...proposalDepths(PROPOSAL.nodes).values()], [0, 1, 2, 1]);
});

// ---------------------------------------------------------------- applying connections

test('accepted connections are added with their type and reason; invalid ones are skipped', () => {
  const graph = { nodes: [node(1), node(2), node(3)], connections: [{ from: 1, to: 2 }] };
  const suggestions = [
    { from: 2, to: 3, type: 'dependency', reason: 'Do 2 first' },
    { from: 2, to: 1, type: 'related', reason: 'Already linked' },
    { from: 3, to: 4, type: 'related', reason: 'Node 4 was deleted' },
    { from: 1, to: 3, type: 'related', reason: 'Not accepted' },
  ];
  const out = applyConnectionProposal(graph, suggestions, { accepted: new Set([0, 1, 2]), types: { 0: 'blocker' } });
  assert.equal(out.added, 1);
  assert.deepEqual(out.connections.at(-1), { from: 2, to: 3, type: 'blocker', label: 'Do 2 first' });
});

// ---------------------------------------------------------------- task plans

const PLAN = {
  proposalId: 'p'.repeat(32),
  nodeId: 3,
  tasks: [
    { key: 'a', title: 'Define scope', description: 'What is in', priority: 'high', dueDate: null, dependsOn: [] },
    { key: 'b', title: 'Prepare data', description: '', priority: 'medium', dueDate: '2026-10-25T11:30:00.000Z', dependsOn: ['a'] },
  ],
  events: [
    { key: 'ev-a', taskKey: 'a', title: 'Define scope', startTime: '2026-10-19T09:00:00.000Z', endTime: '2026-10-19T10:00:00.000Z' },
    { key: 'ev-b', taskKey: 'b', title: 'Prepare data', startTime: '2026-10-20T09:00:00.000Z', endTime: '2026-10-20T10:00:00.000Z' },
  ],
};

test('the approved plan carries edits, drops dependencies and sessions of rejected tasks', () => {
  const approved = buildApprovedPlan(PLAN, {
    accepted: new Set(['b']),
    edits: { b: { title: ' Clean the dataset ', priority: 'high', dueDate: null } },
    acceptedEvents: new Set(['ev-a', 'ev-b']),
  });
  assert.deepEqual(approved, {
    proposalId: PLAN.proposalId,
    nodeId: 3,
    tasks: [{ key: 'b', title: 'Clean the dataset', description: '', priority: 'high', dueDate: null, dependsOn: [] }],
    events: [{ key: 'ev-b', taskKey: 'b', title: 'Clean the dataset', startTime: PLAN.events[1].startTime, endTime: PLAN.events[1].endTime }],
  });
  assert.equal(isPlanReady(approved), true);
  assert.equal(isPlanReady(buildApprovedPlan(PLAN, { accepted: new Set(['a']), edits: { a: { title: '  ' } } })), false);
  assert.equal(isPlanReady(buildApprovedPlan(PLAN, { accepted: new Set() })), false);
});

test('date inputs round-trip in local time', () => {
  assert.equal(toDateInput(''), '');
  assert.equal(toDateInput('nonsense'), '');
  assert.equal(fromDateInput(''), null);
  assert.equal(toDateInput(fromDateInput('2026-10-25')), '2026-10-25');
});
