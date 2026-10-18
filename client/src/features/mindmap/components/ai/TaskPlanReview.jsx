import { useState } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, CalendarClock } from 'lucide-react';
import { buildApprovedPlan, fromDateInput, isPlanReady, toDateInput } from '../../utils/planUtils';
import { input, primaryButton, secondaryButton, sectionTitle } from './panelStyles';

const timeRange = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  const day = s.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  const t = (d) => d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${day}, ${t(s)}–${t(e)}`;
};

// Review of proposed tasks (and calendar sessions in schedule mode): tick, edit the
// title, priority and due date, then create. Nothing is written before "Create".
const TaskPlanReview = ({ plan, nodeTitle, busy, onApprove, onDiscard }) => {
  const [accepted, setAccepted] = useState(() => new Set(plan.tasks.map((t) => t.key)));
  const [acceptedEvents, setAcceptedEvents] = useState(() => new Set(plan.events.filter((e) => !e.conflict).map((e) => e.key)));
  const [edits, setEdits] = useState({});
  const approved = buildApprovedPlan(plan, { accepted, edits, acceptedEvents });
  const titleOf = (key) => edits[key]?.title ?? plan.tasks.find((t) => t.key === key)?.title;

  const flip = (setter, key) => setter((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  });
  const edit = (key, field, value) => setEdits((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));

  if (!plan.tasks.length) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-ink">No new tasks to suggest{plan.skipped.length ? ' — you already have the ones Athena thought of.' : '.'}</p>
        <button type="button" onClick={onDiscard} className={secondaryButton}>Close</button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink">
        Proposed tasks for <span className="font-semibold">“{nodeTitle}”</span>
        <span className="text-ink-muted"> · they’ll be linked to this idea</span>
      </p>

      <ul className="space-y-2">
        {plan.tasks.map((t) => {
          const on = accepted.has(t.key);
          const after = t.dependsOn.map(titleOf).filter(Boolean);
          return (
            <li key={t.key} className="flex items-start gap-2">
              <input type="checkbox" checked={on} onChange={() => flip(setAccepted, t.key)} className="mt-1.5 h-3.5 w-3.5 shrink-0 accent-brand-500" aria-label={`Include ${titleOf(t.key)}`} />
              <div className={`min-w-0 flex-1 space-y-1 ${on ? '' : 'opacity-50'}`}>
                <input value={titleOf(t.key)} onChange={(e) => edit(t.key, 'title', e.target.value)} maxLength={500} className={input} aria-label="Task title" />
                <div className="flex flex-wrap items-center gap-1.5">
                  <select
                    value={edits[t.key]?.priority ?? t.priority}
                    onChange={(e) => edit(t.key, 'priority', e.target.value)}
                    className="rounded-lg border border-line bg-white px-1.5 py-0.5 text-xs text-ink"
                    aria-label="Priority"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <input
                    type="date"
                    value={toDateInput(edits[t.key]?.dueDate !== undefined ? edits[t.key].dueDate : t.dueDate)}
                    onChange={(e) => edit(t.key, 'dueDate', fromDateInput(e.target.value))}
                    className="rounded-lg border border-line bg-white px-1.5 py-0.5 text-xs text-ink"
                    aria-label="Due date"
                  />
                </div>
                {t.description && <p className="text-xs text-ink-muted">{t.description}</p>}
                {after.length > 0 && <p className="text-xs text-ink-faint">After: {after.join(', ')}</p>}
              </div>
            </li>
          );
        })}
      </ul>

      {plan.events.length > 0 && (
        <div className="space-y-1.5">
          <p className={sectionTitle}>Calendar sessions</p>
          {plan.events.map((ev) => {
            const taskOn = accepted.has(ev.taskKey);
            return (
              <label key={ev.key} className={`flex items-start gap-2 text-xs ${taskOn ? 'text-ink' : 'text-ink-faint'}`}>
                <input
                  type="checkbox"
                  checked={taskOn && acceptedEvents.has(ev.key)}
                  disabled={!taskOn}
                  onChange={() => flip(setAcceptedEvents, ev.key)}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-brand-500"
                />
                <span className="min-w-0 flex-1">
                  <CalendarClock className="mr-1 inline h-3 w-3 text-ink-faint" />
                  {timeRange(ev.startTime, ev.endTime)} · {titleOf(ev.taskKey)}
                  {ev.conflict && (
                    <span className="mt-0.5 flex items-center gap-1 text-amber-700">
                      <AlertTriangle className="h-3 w-3" /> Overlaps something on your calendar
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {plan.skipped.length > 0 && (
        <p className="text-xs text-ink-muted">
          Left out: {plan.skipped.map((s) => `“${s.title}” (${s.reason.toLowerCase()})`).join(', ')}
        </p>
      )}

      <div className="flex gap-2">
        <button type="button" onClick={() => onApprove(approved)} disabled={busy || !isPlanReady(approved)} className={primaryButton}>
          Create {approved.tasks.length} task{approved.tasks.length === 1 ? '' : 's'}
          {approved.events.length > 0 && ` + ${approved.events.length} session${approved.events.length === 1 ? '' : 's'}`}
        </button>
        <button type="button" onClick={onDiscard} disabled={busy} className={secondaryButton}>Discard</button>
      </div>
    </div>
  );
};

TaskPlanReview.propTypes = {
  plan: PropTypes.shape({
    proposalId: PropTypes.string.isRequired,
    nodeId: PropTypes.number.isRequired,
    tasks: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      priority: PropTypes.string.isRequired,
      dueDate: PropTypes.string,
      dependsOn: PropTypes.arrayOf(PropTypes.string).isRequired,
    })).isRequired,
    events: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      taskKey: PropTypes.string.isRequired,
      startTime: PropTypes.string.isRequired,
      endTime: PropTypes.string.isRequired,
      conflict: PropTypes.bool,
    })).isRequired,
    skipped: PropTypes.arrayOf(PropTypes.shape({ title: PropTypes.string, reason: PropTypes.string })).isRequired,
  }).isRequired,
  nodeTitle: PropTypes.string.isRequired,
  busy: PropTypes.bool.isRequired,
  onApprove: PropTypes.func.isRequired,
  onDiscard: PropTypes.func.isRequired,
};

export default TaskPlanReview;
