'use strict';

require('./helpers/setup');
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseModelJson, validateMapProposal, validateConnections, validateTaskPlan, validateExecution,
} = require('../src/agent/mindmapProposals');

// Internship (1) → DSA Practice (2), Resume (3); DSA Practice → Arrays (4). Plus a stray node 5.
const MAP = {
  nodes: [
    { id: 1, title: 'Internship Preparation' },
    { id: 2, title: 'DSA Practice' },
    { id: 3, title: 'Resume' },
    { id: 4, title: 'Arrays' },
    { id: 5, title: 'Practice Schedule' },
  ],
  connections: [{ from: 1, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 4 }],
};
const EMPTY = { nodes: [], connections: [] };

test('parseModelJson accepts objects (fenced or not) and rejects anything else', () => {
  assert.deepEqual(parseModelJson('{"nodes":[]}'), { nodes: [] });
  assert.deepEqual(parseModelJson('```json\n{"nodes":[]}\n```'), { nodes: [] });
  assert.equal(parseModelJson('Here is your map: {"nodes": [}'), null);
  assert.equal(parseModelJson('[1,2]'), null);
  assert.equal(parseModelJson(''), null);
  assert.equal(parseModelJson(undefined), null);
});

test('a valid generated map becomes a tree with stable refs and explicit edges', () => {
  const raw = {
    nodes: [
      { key: 'root', title: 'Internships and College', parent: '' },
      { key: 'a', title: 'DSA Practice', description: 'Daily problems', parent: 'root' },
      { key: 'b', title: 'Assignments', parent: 'root' },
      { key: 'a1', title: 'Binary Search', parent: 'a' },
    ],
  };
  const out = validateMapProposal(raw, { map: EMPTY });
  assert.deepEqual(out.nodes.map((n) => [n.ref, n.title, n.parent]), [
    ['new-1', 'Internships and College', null],
    ['new-2', 'DSA Practice', 'new-1'],
    ['new-3', 'Assignments', 'new-1'],
    ['new-4', 'Binary Search', 'new-2'],
  ]);
  assert.deepEqual(out.edges, [{ from: 'new-1', to: 'new-2' }, { from: 'new-1', to: 'new-3' }, { from: 'new-2', to: 'new-4' }]);
  assert.equal(out.nodes[1].description, 'Daily problems');
});

test('children listed before their parent are still placed under it', () => {
  const raw = { nodes: [{ key: 'c', title: 'Child', parent: 'p' }, { key: 'p', title: 'Parent', parent: '' }] };
  const out = validateMapProposal(raw, { map: EMPTY });
  assert.deepEqual(out.nodes.map((n) => [n.title, n.parent]), [['Parent', null], ['Child', 'new-1']]);
});

test('invalid model output is rejected or cleaned', () => {
  assert.throws(() => validateMapProposal({ items: [] }, { map: EMPTY }), { code: 'AI_INVALID_OUTPUT' });
  assert.throws(() => validateMapProposal(null, { map: EMPTY }), { code: 'AI_INVALID_OUTPUT' });
  const out = validateMapProposal({
    nodes: [
      { key: 'a', title: '   ', parent: '' },                  // empty title
      { key: 'b', title: 'Ok\u0000 title\n\twith   spaces', parent: '' },
      { key: 'b', title: 'Repeated key', parent: '' },         // duplicate key
      { key: 'x', title: 'Loop one', parent: 'y' },            // cycle
      { key: 'y', title: 'Loop two', parent: 'x' },
      'not an object',
      { key: 'z', title: 'T'.repeat(500), parent: 'missing' }, // unknown parent → top level
    ],
  }, { map: EMPTY });
  assert.deepEqual(out.nodes.map((n) => n.title.length > 100 ? n.title.length : n.title), ['Ok title with spaces', 120]);
  assert.equal(out.nodes[1].parent, null);
  assert.equal(out.dropped.invalid, 5);
});

test('duplicate nodes are merged instead of created', () => {
  // Adding a branch under Internship Preparation (1).
  const raw = {
    nodes: [
      { key: 'a', title: 'dsa practice!', parent: '' },            // = existing child 2 → merged
      { key: 'a1', title: 'Hashing', parent: 'a' },                // attaches to existing node 2
      { key: 'a2', title: 'Arrays', parent: 'a' },                 // = existing grandchild 4 → merged
      { key: 'b', title: 'Interview Prep', parent: '' },
      { key: 'b2', title: 'Interview prep', parent: '' },          // duplicate within proposal
      { key: 'b2c', title: 'Mock Interviews', parent: 'b2' },      // follows the merge to 'b'
      { key: 'c', title: 'Internship Preparation', parent: '' },   // = the anchor itself
      { key: 'd', title: 'Practice Schedule', parent: '' },        // same title elsewhere → flagged
    ],
  };
  const out = validateMapProposal(raw, { map: MAP, anchorId: 1 });
  assert.deepEqual(out.nodes.map((n) => [n.title, n.parent]), [
    ['Hashing', 2],
    ['Interview Prep', 1],
    ['Mock Interviews', 'new-2'],
    ['Practice Schedule', 1],
  ]);
  assert.deepEqual(out.nodes[3].similarTo, { id: 5, title: 'Practice Schedule' });
  assert.equal(out.dropped.duplicates, 4);
});

test('node expansion respects the node limit and the 500-node map limit', () => {
  const raw = { nodes: Array.from({ length: 12 }, (_, i) => ({ key: `k${i}`, title: `Idea ${i}`, parent: '' })) };
  const out = validateMapProposal(raw, { map: MAP, anchorId: 2, maxNodes: 8 });
  assert.equal(out.nodes.length, 8);
  assert.ok(out.nodes.every((n) => n.parent === 2));
  assert.equal(out.dropped.overLimit, 4);

  const full = { nodes: Array.from({ length: 498 }, (_, i) => ({ id: i + 1, title: `N${i}` })), connections: [] };
  assert.equal(validateMapProposal(raw, { map: full, anchorId: 1, maxNodes: 8 }).nodes.length, 2);

  // Children of a node dropped for space are dropped too, not re-parented.
  const nested = { nodes: [{ key: 'a', title: 'A', parent: '' }, { key: 'b', title: 'B', parent: '' }, { key: 'b1', title: 'B1', parent: 'b' }] };
  const capped = validateMapProposal(nested, { map: EMPTY, maxNodes: 1 });
  assert.deepEqual(capped.nodes.map((n) => n.title), ['A']);
  assert.equal(capped.dropped.overLimit, 2);
});

test('suggested connections reject self, unknown, out-of-subset, duplicate and existing edges', () => {
  const raw = {
    connections: [
      { from: 3, to: 4, type: 'related', reason: 'Resume lists DSA skills', strength: 'likely' },  // ok
      { from: 4, to: 3, type: 'related', reason: 'Same pair reversed', strength: 'possible' },    // duplicate pair
      { from: 2, to: 1, type: 'dependency', reason: 'Already connected', strength: 'possible' },  // existing edge
      { from: 2, to: 2, type: 'related', reason: 'Self', strength: 'possible' },                  // self
      { from: 2, to: 99, type: 'related', reason: 'Unknown', strength: 'possible' },              // unknown node
      { from: 3, to: 5, type: 'related', reason: 'Outside the subset', strength: 'possible' },    // not shown to model
      { from: 2, to: 3, type: 'diagnosis', reason: 'Bad type', strength: 'possible' },            // bad type
      { from: 2, to: 3, type: 'blocker', reason: '', strength: 'possible' },                      // no reason
      { from: '2', to: '3', type: 'blocker', reason: 'Practice time competes with resume work', strength: 'certain' },
    ],
  };
  const out = validateConnections(raw, { map: MAP, candidateIds: [1, 2, 3, 4] });
  assert.deepEqual(out.connections, [
    { from: 3, to: 4, type: 'related', reason: 'Resume lists DSA skills', strength: 'likely' },
    { from: 2, to: 3, type: 'blocker', reason: 'Practice time competes with resume work', strength: 'possible' },
  ]);
  assert.equal(out.rejected, 7);
  assert.throws(() => validateConnections({}, { map: MAP, candidateIds: [1] }), { code: 'AI_INVALID_OUTPUT' });
});

test('task plans drop duplicates, bad dates and forward dependencies, and flag calendar conflicts', () => {
  const now = new Date('2026-10-18T10:00:00Z');
  const raw = {
    tasks: [
      { key: 'scope', title: 'Define project scope', priority: 'high', dueDate: '2026-10-20T17:00:00Z', startTime: '2026-10-19T09:00:00Z', endTime: '2026-10-19T10:00:00Z' },
      { key: 'data', title: 'Prepare the dataset', dependsOn: ['scope', 'data', 'later'], priority: 'urgent', dueDate: 'tomorrow', startTime: '2026-10-19T14:00:00Z', endTime: '2026-10-19T15:00:00Z' },
      { key: 'later', title: 'Build baseline model', startTime: '2026-10-19T12:00:00Z', endTime: '2026-10-19T11:00:00Z' },
      { key: 'dup', title: 'define project  scope' },
      { key: 'old', title: 'Update resume' },
      { key: 'past', title: 'Write report', dueDate: '2020-01-01T00:00:00Z', startTime: '2020-01-01T09:00:00Z', endTime: '2020-01-01T10:00:00Z' },
    ],
  };
  const busy = [{ start: new Date('2026-10-19T13:30:00Z'), end: new Date('2026-10-19T14:30:00Z') }];
  const out = validateTaskPlan(raw, { existingTitles: new Set(['update resume']), busy, now, schedule: true });
  assert.deepEqual(out.tasks.map((t) => [t.key, t.priority, t.dueDate, t.dependsOn]), [
    ['scope', 'high', '2026-10-20T17:00:00.000Z', []],
    ['data', 'medium', null, ['scope']],
    ['later', 'medium', null, []],
    ['past', 'medium', null, []],
  ]);
  assert.deepEqual(out.events.map((e) => [e.taskKey, e.conflict]), [['scope', false], ['data', true]]);
  assert.deepEqual(out.skipped, [{ title: 'Update resume', reason: 'You already have this task' }]);
  // Without schedule mode no events are proposed.
  assert.equal(validateTaskPlan(raw, { now }).events.length, 0);
});

test('the approved plan is validated strictly', () => {
  const ok = {
    proposalId: 'abcdef1234567890',
    nodeId: 2,
    tasks: [{ key: 't1', title: 'Do it', priority: 'low', dueDate: '2026-10-20T10:00:00Z' }, { key: 't2', title: 'Then this', dependsOn: ['t1', 'nope'] }],
    events: [{ key: 'e1', taskKey: 't1', title: 'Do it', startTime: '2026-10-19T09:00:00Z', endTime: '2026-10-19T10:00:00Z' }],
    userId: 'someone-else', // ignored
  };
  const plan = validateExecution(ok);
  assert.equal(plan.tasks[1].dependsOn.length, 1);
  assert.ok(plan.tasks[0].data.dueDate instanceof Date);
  assert.equal(plan.events[0].taskKey, 't1');
  assert.equal('userId' in plan, false);

  const bad = (patch, field) => assert.throws(() => validateExecution({ ...ok, ...patch }), (err) => err.code === 'VALIDATION_ERROR' && field in err.fields);
  bad({ proposalId: 'short' }, 'proposalId');
  bad({ nodeId: 1.5 }, 'nodeId');
  bad({ tasks: [], events: [] }, 'tasks');
  bad({ tasks: Array.from({ length: 13 }, (_, i) => ({ key: `t${i}`, title: 'x' })) }, 'tasks');
  bad({ tasks: [{ key: 't1', title: 'a' }, { key: 't1', title: 'b' }] }, 'tasks[1].key');
  bad({ tasks: [{ key: 't1', title: '' }] }, 'tasks[0].title');
  bad({ tasks: [{ key: 't1', title: 'x', priority: 'urgent' }] }, 'tasks[0].priority');
  bad({ events: [{ key: 'e1', title: 'x', startTime: '2026-10-19T10:00:00Z', endTime: '2026-10-19T09:00:00Z' }] }, 'events[0].endTime');
});
