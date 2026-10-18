'use strict';

// Runs a plan the user approved (tasks and calendar slots from a mind map node)
// through the agent's own tools, then checks each write against stored data.
//
// Unlike the chat agent, nothing here is decided by the model: the steps are the
// approved plan, run once each, in order. That keeps approval binding and makes
// retries safe:
// - Bounded: at most maxSteps tool calls, one attempt each, no automatic retries.
// - Idempotent: each step carries `${proposalId}:${kind}:${key}` as its idempotency
//   key, so running the same plan again (after a timeout or a partial failure) reports
//   finished steps as already done instead of repeating them.
// - Verified: a step counts as done only when a read-back finds the stored record.
// - Partial failure: a failed step does not stop the others; a calendar slot whose
//   task failed is skipped, since it would point at nothing.

const STEP_STATUSES = ['created', 'already_done', 'failed', 'skipped', 'unverified'];

// steps: [{ key, kind: 'task' | 'event', tool, args, after? (key of the step it needs) }]
// runTool(userId, name, args, options) → { result, action? }   (agent/tools)
// verify(step, id) → Promise<boolean>: is the record stored as expected?
// → { results: [{ key, kind, status, id?, title, error? }], summary: { [status]: count }, actions }
const executePlan = async ({ userId, proposalId, steps, runTool, verify, maxSteps = 24 }) => {
  if (steps.length > maxSteps) throw new Error(`Plan has ${steps.length} steps; the limit is ${maxSteps}`);
  const results = [];
  const byKey = new Map();
  const actions = [];

  for (const step of steps) {
    const base = { key: step.key, kind: step.kind, title: step.args.title };
    const needed = step.after ? byKey.get(step.after) : null;
    if (needed && !['created', 'already_done'].includes(needed.status)) {
      const skipped = { ...base, status: 'skipped', error: 'Skipped because its task was not created' };
      results.push(skipped);
      byKey.set(step.key, skipped);
      continue;
    }

    const outcome = await runTool(userId, step.tool, step.args, { idempotencyKey: `${proposalId}:${step.kind}:${step.key}` });
    const record = outcome.result?.task || outcome.result?.event;
    let result;
    if (outcome.result?.error || !record?.id) {
      result = { ...base, status: 'failed', error: outcome.result?.error || 'No record was returned' };
    } else {
      let verified = false;
      try {
        verified = await verify(step, record.id);
      } catch {
        verified = false;
      }
      const status = !verified ? 'unverified' : outcome.result.created === false ? 'already_done' : 'created';
      result = { ...base, status, id: record.id, title: record.title };
      if (status === 'created' && outcome.action) actions.push(outcome.action);
    }
    results.push(result);
    byKey.set(step.key, result);
  }

  const summary = Object.fromEntries(STEP_STATUSES.map((s) => [s, results.filter((r) => r.status === s).length]));
  return { results, summary, actions };
};

module.exports = { executePlan, STEP_STATUSES };
