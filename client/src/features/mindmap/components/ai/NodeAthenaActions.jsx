import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  CalendarPlus, FileText, GitBranch, Lightbulb, Link2, ListChecks, ListOrdered, OctagonAlert, TrendingUp, Workflow,
} from 'lucide-react';
import { NODE_STATUSES, TASK_STATUS_LABELS, statusMeta } from '../../utils/nodeStatus';
import { linkedShape, nodeShape } from '../mindMapPropTypes';
import { actionButton, primaryButton, secondaryButton, sectionTitle } from './panelStyles';

// Panel actions; MindMapAIPanel runAction maps each id to a request.
const NODE_ACTIONS = [
  { id: 'expand', label: 'Expand', icon: GitBranch },
  { id: 'related', label: 'Find related', icon: Link2 },
  { id: 'dependencies', label: 'Suggest dependencies', icon: Workflow },
  { id: 'tasks', label: 'Convert to tasks', icon: ListChecks },
  { id: 'steps', label: 'Break into steps', icon: ListOrdered },
  { id: 'schedule', label: 'Schedule', icon: CalendarPlus },
  { id: 'summarize', label: 'Summarize branch', icon: FileText },
  { id: 'explain', label: 'Explain', icon: Lightbulb },
  { id: 'blockers', label: 'Identify blockers', icon: OctagonAlert },
  { id: 'progress', label: 'Review progress', icon: TrendingUp },
];

const SUGGESTION_TEXT = {
  completed: 'All linked tasks are done. Mark this idea as done?',
  in_progress: 'Work on the linked tasks has started. Mark this idea as in progress?',
};

// Status, linked tasks, actions and a question box for the selected node.
const NodeAthenaActions = ({ node, linked, busy, onStatus, onAction, onAsk, onBranch }) => {
  const [text, setText] = useState('');
  const progress = linked?.progress;
  const suggestion = progress?.suggestedStatus && progress.suggestedStatus !== node.status ? progress.suggestedStatus : null;

  const send = (handler) => {
    const value = text.trim();
    if (!value) return;
    handler(value);
    setText('');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <p className={sectionTitle}>Status</p>
        <div className="flex flex-wrap gap-1">
          {NODE_STATUSES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onStatus(node.status === s.id ? null : s.id)}
              aria-pressed={node.status === s.id}
              className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${node.status === s.id ? 'border-brand-300 bg-brand-50 text-ink' : 'border-line text-ink-muted hover:bg-brand-50'}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className={sectionTitle}>Linked tasks</p>
        {progress && progress.total > 0 ? (
          <>
            <p className="text-xs text-ink">
              {progress.completed} of {progress.total} done{progress.overdue > 0 && <span className="text-brand-700"> · {progress.overdue} overdue</span>}
            </p>
            <ul className="space-y-0.5">
              {linked.tasks.slice(0, 5).map((t) => (
                <li key={t.id} className="flex justify-between gap-2 text-xs">
                  <span className={`truncate ${t.status === 'completed' ? 'text-ink-faint line-through' : 'text-ink'}`}>{t.title}</span>
                  <span className="shrink-0 text-ink-faint">{TASK_STATUS_LABELS[t.status] || t.status}</span>
                </li>
              ))}
              {linked.tasks.length > 5 && <li className="text-xs text-ink-faint">and {linked.tasks.length - 5} more</li>}
            </ul>
          </>
        ) : (
          <p className="text-xs text-ink-muted">None yet. “Convert to tasks” plans this idea as tasks linked to it.</p>
        )}
        {suggestion && (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-brand-50 px-2.5 py-2">
            <p className="text-xs text-ink">{SUGGESTION_TEXT[suggestion]}</p>
            <button type="button" onClick={() => onStatus(suggestion)} className="shrink-0 text-xs font-semibold text-brand-600 hover:text-brand-700">
              Mark {statusMeta(suggestion).label.toLowerCase()}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <p className={sectionTitle}>Ask Athena to</p>
        <div className="grid grid-cols-2 gap-1.5">
          {NODE_ACTIONS.map((a) => (
            <button key={a.id} type="button" disabled={busy} onClick={() => onAction(a.id)} className={actionButton}>
              <a.icon className="h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden="true" />
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="mindmap-ask" className={sectionTitle}>Ask or describe a branch</label>
        <textarea
          id="mindmap-ask"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(onAsk); } }}
          rows={2}
          maxLength={2000}
          placeholder={`Ask about “${node.title}”…`}
          className="w-full resize-none rounded-xl border border-line bg-white p-2 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-brand-300"
        />
        <div className="flex gap-2">
          <button type="button" disabled={busy || !text.trim()} onClick={() => send(onAsk)} className={primaryButton}>Ask</button>
          <button type="button" disabled={busy || !text.trim()} onClick={() => send(onBranch)} className={secondaryButton} title="Turn your description into new ideas under this one">
            Add as branch
          </button>
        </div>
      </div>
    </div>
  );
};

NodeAthenaActions.propTypes = {
  node: nodeShape.isRequired,
  linked: linkedShape,
  busy: PropTypes.bool.isRequired,
  onStatus: PropTypes.func.isRequired,
  onAction: PropTypes.func.isRequired,
  onAsk: PropTypes.func.isRequired,
  onBranch: PropTypes.func.isRequired,
};

export default NodeAthenaActions;
