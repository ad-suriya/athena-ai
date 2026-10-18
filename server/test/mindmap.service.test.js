'use strict';

const { store, reset } = require('./helpers/setup');
const test = require('node:test');
const assert = require('node:assert/strict');
const mindmapService = require('../src/services/mindmap.service');
const taskService = require('../src/services/task.service');

const node = (id, extra = {}) => ({ id, x: 10 * id, y: 20, title: `Node ${id}`, content: '', type: 'secondary', expanded: true, ...extra });

test.beforeEach(reset);

test('saves and loads a map; maps saved before status/type existed still load and save', async () => {
  assert.deepEqual(await mindmapService.getMap('u1'), { nodes: [], connections: [], updatedAt: null });
  // Legacy document: no status, no connection types.
  store.set('mindMaps/u1', { userId: 'u1', nodes: [{ id: 1, x: 1, y: 2, title: 'Old', content: '', type: 'main', expanded: true }], connections: [] });
  const legacy = await mindmapService.getMap('u1');
  assert.equal(legacy.nodes[0].status, undefined);
  const saved = await mindmapService.saveMap('u1', { nodes: [...legacy.nodes, node(2, { status: 'in_progress' })], connections: [{ from: 1, to: 2 }, { from: 2, to: 1, type: 'dependency', label: 'Needs it first' }] });
  assert.equal(saved.nodes[0].status, undefined);
  assert.equal(saved.nodes[1].status, 'in_progress');
  assert.deepEqual(saved.connections, [{ from: 1, to: 2 }, { from: 2, to: 1, type: 'dependency', label: 'Needs it first' }]);
  assert.equal(store.get('mindMaps/u1').userId, 'u1');
});

test('rejects invalid nodes, statuses and connections', async () => {
  const save = (data) => mindmapService.saveMap('u1', data);
  await assert.rejects(save({ nodes: [node(1, { status: 'done' })], connections: [] }), { code: 'VALIDATION_ERROR' });
  await assert.rejects(save({ nodes: [node(1), node(1)], connections: [] }), { code: 'VALIDATION_ERROR' });
  await assert.rejects(save({ nodes: [node(1)], connections: [{ from: 1, to: 1 }] }), { code: 'VALIDATION_ERROR' });
  await assert.rejects(save({ nodes: [node(1)], connections: [{ from: 1, to: 9 }] }), { code: 'VALIDATION_ERROR' });
  await assert.rejects(save({ nodes: [node(1), node(2)], connections: [{ from: 1, to: 2, type: 'magic' }] }), { code: 'VALIDATION_ERROR' });
  await assert.rejects(save({ nodes: [node(1), node(2)], connections: [{ from: 1, to: 2, type: 'related', label: 'x'.repeat(201) }] }), { code: 'VALIDATION_ERROR' });
  await assert.rejects(save({ nodes: Array.from({ length: 501 }, (_, i) => node(i + 1)), connections: [] }), { code: 'VALIDATION_ERROR' });
  // Duplicate connections are dropped, not rejected (existing behaviour).
  const saved = await save({ nodes: [node(1), node(2)], connections: [{ from: 1, to: 2 }, { from: 1, to: 2 }] });
  assert.equal(saved.connections.length, 1);
});

test('removing a node unlinks its tasks but keeps them', async () => {
  await mindmapService.saveMap('u1', { nodes: [node(1), node(2)], connections: [] });
  const linked = await taskService.createTask('u1', { title: 'Linked', mindMapNodeId: 2 });
  const other = await taskService.createTask('u1', { title: 'Other node', mindMapNodeId: 1 });
  const foreign = await taskService.createTask('u2', { title: 'Another user', mindMapNodeId: 2 });
  await mindmapService.saveMap('u1', { nodes: [node(1)], connections: [] });
  assert.equal((await taskService.getTask('u1', linked.id)).mindMapNodeId, undefined);
  assert.equal((await taskService.getTask('u1', other.id)).mindMapNodeId, 1);
  assert.equal((await taskService.getTask('u2', foreign.id)).mindMapNodeId, 2, 'other users are untouched');
});

test('the REST task path cannot set mindMapNodeId, and createTaskOnce is idempotent and owner-checked', async () => {
  const { taskSpec } = require('../src/controllers/tasks.controller');
  const { validate } = require('../src/utils/validate');
  assert.equal('mindMapNodeId' in validate({ title: 'x', mindMapNodeId: 3 }, taskSpec), false);

  const first = await taskService.createTaskOnce('u1', 'fixedid1', { title: 'Once' });
  const again = await taskService.createTaskOnce('u1', 'fixedid1', { title: 'Once (edited)' });
  assert.equal(first.created, true);
  assert.equal(again.created, false);
  assert.equal(again.task.title, 'Once');
  assert.equal((await taskService.getTasks('u1')).length, 1);
  await assert.rejects(taskService.createTaskOnce('u2', 'fixedid1', { title: 'Steal' }), { code: 'RESOURCE_NOT_FOUND' });
});
