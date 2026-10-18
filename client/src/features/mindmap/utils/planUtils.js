// Pure helpers for reviewing a task plan from Athena before it runs.

const pad = (n) => String(n).padStart(2, '0');

// ISO date-time → 'YYYY-MM-DD' in local time (for <input type="date">), or ''.
export const toDateInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// 'YYYY-MM-DD' → ISO at 17:00 local time, or null when cleared.
export const fromDateInput = (value) => (value ? new Date(`${value}T17:00:00`).toISOString() : null);

// plan: { proposalId, nodeId, tasks, events }. accepted: Set of task keys.
// edits: { [key]: { title?, priority?, dueDate? } }. acceptedEvents: Set of event keys.
// An event is kept only when its task is kept. → the body for POST /ai/execute
export const buildApprovedPlan = (plan, { accepted, edits = {}, acceptedEvents = new Set() }) => {
  const tasks = plan.tasks
    .filter((t) => accepted.has(t.key))
    .map((t) => {
      const e = edits[t.key] || {};
      return {
        key: t.key,
        title: (e.title ?? t.title).trim(),
        description: t.description || '',
        priority: e.priority ?? t.priority,
        dueDate: e.dueDate !== undefined ? e.dueDate : t.dueDate,
        dependsOn: t.dependsOn.filter((k) => accepted.has(k)),
      };
    });
  const events = plan.events
    .filter((ev) => acceptedEvents.has(ev.key) && accepted.has(ev.taskKey))
    .map((ev) => ({ key: ev.key, taskKey: ev.taskKey, title: (edits[ev.taskKey]?.title ?? ev.title).trim(), startTime: ev.startTime, endTime: ev.endTime }));
  return { proposalId: plan.proposalId, nodeId: plan.nodeId, tasks, events };
};

// True when every kept task has a title (the server rejects empty ones).
export const isPlanReady = (approved) =>
  (approved.tasks.length > 0 || approved.events.length > 0) && approved.tasks.every((t) => t.title);
