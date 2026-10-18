'use strict';

const { store, failures, reset } = require('./helpers/setup');
const test = require('node:test');
const assert = require('node:assert/strict');
const mindmapService = require('../src/services/mindmap.service');
const taskService = require('../src/services/task.service');
const { runTool, idFor } = require('../src/agent/tools');
const { executePlan } = require('../src/agent/executor');

const node = (id) => ({ id, x: 0, y: 0, title: `Node ${id}`, content: '', type: 'secondary', expanded: true });
const taskStep = (key, title, nodeId = 1) => ({ key, kind: 'task', tool: 'create_task', args: { title, mindMapNodeId: nodeId } });
const eventStep = (key, after) => ({ key, kind: 'event', tool: 'create_event', after, args: { title: `Work on ${after}`, startTime: '2026-10-20T09:00:00Z', endTime: '2026-10-20T10:00:00Z' } });
const verify = (userId) => async (step, id) => (step.kind === 'task'
  ? (await taskService.getTask(userId, id)).mindMapNodeId === step.args.mindMapNodeId
  : true);

test.beforeEach(async () => {
  reset();
  await mindmapService.saveMap('u1', { nodes: [node(1)], connections: [] });
});

test('creates linked tasks, verifies them, and a retry repeats nothing', async () => {
  const steps = [taskStep('a', 'Define scope'), taskStep('b', 'Prepare data'), eventStep('e', 'a')];
  const first = await executePlan({ userId: 'u1', proposalId: 'p1', steps, runTool, verify: verify('u1') });
  assert.deepEqual(first.results.map((r) => r.status), ['created', 'created', 'created']);
  assert.equal(first.actions.length, 3);
  const tasks = await taskService.getTasks('u1');
  assert.equal(tasks.length, 2);
  assert.ok(tasks.every((t) => t.mindMapNodeId === 1));

  const retry = await executePlan({ userId: 'u1', proposalId: 'p1', steps, runTool, verify: verify('u1') });
  assert.deepEqual(retry.results.map((r) => r.status), ['already_done', 'already_done', 'already_done']);
  assert.equal(retry.actions.length, 0);
  assert.equal((await taskService.getTasks('u1')).length, 2, 'no duplicate tasks');
  assert.equal([...store.keys()].filter((k) => k.startsWith('calendarEvents/')).length, 1, 'no duplicate events');

  // A different proposal is a different plan and does create new tasks.
  await executePlan({ userId: 'u1', proposalId: 'p2', steps: [taskStep('a', 'Define scope again')], runTool, verify: verify('u1') });
  assert.equal((await taskService.getTasks('u1')).length, 3);
});

test('partial failure: other steps still run, the dependent event is skipped, and a retry finishes only the rest', async () => {
  const steps = [taskStep('a', 'First'), taskStep('b', 'Second'), eventStep('eb', 'b'), eventStep('ea', 'a')];
  failures.push({ op: 'create', match: (path) => path === `tasks/${idFor('u1', 'p1:task:b')}` });
  const first = await executePlan({ userId: 'u1', proposalId: 'p1', steps, runTool, verify: verify('u1') });
  assert.deepEqual(first.results.map((r) => r.status), ['created', 'failed', 'skipped', 'created']);
  assert.equal(first.results[1].error, 'That action failed on the server.');
  assert.deepEqual(first.summary, { created: 2, already_done: 0, failed: 1, skipped: 1, unverified: 0 });

  const retry = await executePlan({ userId: 'u1', proposalId: 'p1', steps, runTool, verify: verify('u1') });
  assert.deepEqual(retry.results.map((r) => r.status), ['already_done', 'created', 'created', 'already_done']);
  assert.deepEqual((await taskService.getTasks('u1')).map((t) => t.title).sort(), ['First', 'Second']);
});

test('a write that cannot be read back is reported as unverified, not done', async () => {
  const result = await executePlan({ userId: 'u1', proposalId: 'p1', steps: [taskStep('a', 'Ghost')], runTool, verify: async () => false });
  assert.equal(result.results[0].status, 'unverified');
  assert.equal(result.actions.length, 0);
});

test('tool validation errors fail the step without throwing', async () => {
  const result = await executePlan({ userId: 'u1', proposalId: 'p1', steps: [taskStep('a', 'Bad node', 42), taskStep('b', '')], runTool, verify: verify('u1') });
  assert.deepEqual(result.results.map((r) => r.status), ['failed', 'failed']);
  assert.match(result.results[0].error, /No mind map node with id 42/);
  assert.equal((await taskService.getTasks('u1')).length, 0);
});

test('plans are bounded', async () => {
  const steps = Array.from({ length: 25 }, (_, i) => taskStep(`k${i}`, `T${i}`));
  await assert.rejects(executePlan({ userId: 'u1', proposalId: 'p1', steps, runTool, verify: verify('u1') }), /limit is 24/);
  assert.equal((await taskService.getTasks('u1')).length, 0);
});

test('idempotency keys are per user: the same key never touches another user\'s task', async () => {
  await mindmapService.saveMap('u2', { nodes: [node(1)], connections: [] });
  await executePlan({ userId: 'u1', proposalId: 'p1', steps: [taskStep('a', 'Mine')], runTool, verify: verify('u1') });
  const theirs = await executePlan({ userId: 'u2', proposalId: 'p1', steps: [taskStep('a', 'Theirs')], runTool, verify: verify('u2') });
  assert.equal(theirs.results[0].status, 'created');
  assert.equal((await taskService.getTasks('u1'))[0].title, 'Mine');
  assert.equal((await taskService.getTasks('u2'))[0].title, 'Theirs');
});
