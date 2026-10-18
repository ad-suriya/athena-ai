import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { AlertTriangle, Check, Minus, X } from 'lucide-react';
import { primaryButton, secondaryButton } from './panelStyles';

const STATUS = {
  created: { icon: Check, tone: 'text-emerald-600', text: 'Created' },
  already_done: { icon: Check, tone: 'text-ink-faint', text: 'Already created earlier' },
  failed: { icon: X, tone: 'text-brand-600', text: 'Failed' },
  skipped: { icon: Minus, tone: 'text-ink-faint', text: 'Skipped' },
  unverified: { icon: AlertTriangle, tone: 'text-amber-600', text: 'Couldn’t confirm it was saved' },
};

// What happened when the approved plan ran: one line per task or session, from the
// server's read-back of stored data. Retry is safe: finished steps are not repeated.
const PlanResults = ({ outcome, busy, onRetry, onDone }) => {
  const { summary, results } = outcome;
  const done = summary.created + summary.already_done;
  const unfinished = summary.failed + summary.skipped + summary.unverified;

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink">
        {unfinished === 0
          ? `All ${done} saved and checked.`
          : `${done} of ${results.length} saved and checked. ${unfinished} still need${unfinished === 1 ? 's' : ''} attention.`}
      </p>
      <ul className="space-y-1.5">
        {results.map((r) => {
          const s = STATUS[r.status];
          return (
            <li key={`${r.kind}-${r.key}`} className="flex items-start gap-2 text-xs">
              <s.icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${s.tone}`} aria-hidden="true" />
              <span className="min-w-0 flex-1 text-ink">
                {r.kind === 'event' ? 'Session: ' : ''}{r.title}
                <span className="block text-ink-muted">{r.error || s.text}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap gap-2">
        {unfinished > 0 && (
          <button type="button" onClick={onRetry} disabled={busy} className={primaryButton}>Retry the rest</button>
        )}
        <Link to="/tasks" className={secondaryButton}>Open Tasks</Link>
        <button type="button" onClick={onDone} className={secondaryButton}>Done</button>
      </div>
    </div>
  );
};

PlanResults.propTypes = {
  outcome: PropTypes.shape({
    summary: PropTypes.objectOf(PropTypes.number).isRequired,
    results: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      kind: PropTypes.string.isRequired,
      status: PropTypes.oneOf(Object.keys(STATUS)).isRequired,
      title: PropTypes.string,
      error: PropTypes.string,
    })).isRequired,
  }).isRequired,
  busy: PropTypes.bool.isRequired,
  onRetry: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
};

export default PlanResults;
