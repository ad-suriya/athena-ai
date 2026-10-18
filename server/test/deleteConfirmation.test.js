'use strict';

require('./helpers/setup');
const test = require('node:test');
const assert = require('node:assert/strict');
const { confirmsDeletion } = require('../src/agent/safety');
const { buildAgent } = require('../src/agent/graph');
const { isDestructive } = require('../src/agent/tools');

const ASKED = [{ role: 'user', content: 'delete my dentist task' }, { role: 'assistant', content: 'Delete the task “Dentist appointment”?' }];

test('a deletion is confirmed only by a yes to a question about deleting', () => {
  for (const yes of ['yes', 'Yes please', 'yeah, delete it', 'ok', 'go ahead', 'delete it', 'Confirm']) {
    assert.equal(confirmsDeletion(ASKED, yes), true, yes);
  }
  for (const no of ['no', 'wait', 'yes but not that one', 'actually keep it', 'hmm', 'what?', 'ok don\'t']) {
    assert.equal(confirmsDeletion(ASKED, no), false, no);
  }
  // The previous reply must be Athena's, and must have asked about deleting.
  assert.equal(confirmsDeletion([{ role: 'assistant', content: 'Want me to add a reminder?' }], 'yes'), false);
  assert.equal(confirmsDeletion([{ role: 'assistant', content: 'I deleted it.' }], 'yes'), false);
  assert.equal(confirmsDeletion([{ role: 'user', content: 'Delete it?' }], 'yes'), false);
  assert.equal(confirmsDeletion([], 'yes delete everything'), false);
  assert.equal(confirmsDeletion([{ role: 'assistant', content: 'Should I remove “Gym” from your calendar?' }], 'yes'), true);
});

test('only the four delete tools are destructive', () => {
  for (const name of ['delete_task', 'delete_journal_entry', 'delete_event', 'delete_mind_map_node']) assert.equal(isDestructive(name), true, name);
  for (const name of ['create_task', 'update_task', 'list_tasks', 'add_mind_map_node']) assert.equal(isDestructive(name), false, name);
});

// A scripted model that tries to delete straight away, then replies.
const scriptedAgent = () => {
  const ran = [];
  const replies = [
    { text: '', response: { functionCalls: [{ name: 'delete_task', args: { id: 't1' } }], candidates: [{ content: { role: 'model', parts: [] } }] } },
    { text: 'Delete the task “Dentist appointment”?', response: { functionCalls: [], candidates: [{ content: { role: 'model', parts: [{ text: 'Delete the task “Dentist appointment”?' }] } }] } },
  ];
  const seen = [];
  const agent = buildAgent({
    generate: async (req) => { seen.push(req); return replies.shift(); },
    runTool: async (userId, name, args) => { ran.push([name, args]); return { result: { deleted: args.id }, action: 'Deleted task “Dentist appointment”' }; },
    functionDeclarations: [],
    isDestructive,
  });
  return { agent, ran, seen };
};

test('the agent cannot delete without confirmation', async () => {
  const { agent, ran, seen } = scriptedAgent();
  const out = await agent.run({ contents: [{ role: 'user', parts: [{ text: 'delete my dentist task' }] }], userId: 'u1' });
  assert.deepEqual(ran, [], 'nothing ran');
  assert.deepEqual(out.actions, []);
  assert.equal(out.text, 'Delete the task “Dentist appointment”?');
  const refusal = seen[1].contents.at(-1).parts[0].functionResponse.response;
  assert.match(refusal.error, /Not deleted.*confirm/);
});

test('the agent deletes once the user has confirmed', async () => {
  const { agent, ran } = scriptedAgent();
  const out = await agent.run({ contents: [{ role: 'user', parts: [{ text: 'yes' }] }], userId: 'u1', deleteConfirmed: true });
  assert.deepEqual(ran, [['delete_task', { id: 't1' }]]);
  assert.deepEqual(out.actions, ['Deleted task “Dentist appointment”']);
});
