import { useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowRight } from 'lucide-react';
import { CONNECTION_TYPES } from '../../utils/nodeStatus';
import { nodeShape } from '../mindMapPropTypes';
import { primaryButton, secondaryButton } from './panelStyles';

const STRENGTH_HINT = 'Athena’s own judgement from your node text — not a measured probability.';

// Review of suggested connections: tick, change the kind of link, then add.
// Nothing starts ticked: each link is the user's call.
const ConnectionReview = ({ suggestions, nodes, onApply, onDiscard }) => {
  const [accepted, setAccepted] = useState(() => new Set());
  const [types, setTypes] = useState({});
  const titleOf = (id) => nodes.find((n) => n.id === id)?.title;
  const visible = suggestions.map((s, i) => ({ ...s, i })).filter((s) => titleOf(s.from) && titleOf(s.to));

  const toggle = (i) => setAccepted((prev) => {
    const next = new Set(prev);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    return next;
  });

  if (!visible.length) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-ink">No useful new connections found. Athena only suggests links your node text supports.</p>
        <button type="button" onClick={onDiscard} className={secondaryButton}>Close</button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink">Suggested connections <span className="text-ink-muted">· pick the ones that make sense</span></p>
      <ul className="space-y-2">
        {visible.map((s) => (
          <li key={s.i} className={`rounded-xl border p-2.5 ${accepted.has(s.i) ? 'border-brand-200 bg-brand-50/60' : 'border-line bg-white'}`}>
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={accepted.has(s.i)} onChange={() => toggle(s.i)} className="mt-1 h-3.5 w-3.5 shrink-0 accent-brand-500" />
              <span className="min-w-0 flex-1 text-sm text-ink">
                <span className="font-medium">{titleOf(s.from)}</span>
                <ArrowRight className="mx-1 inline h-3 w-3 text-ink-faint" aria-label="to" />
                <span className="font-medium">{titleOf(s.to)}</span>
              </span>
            </label>
            <div className="mt-1.5 flex items-center gap-2 pl-5">
              <select
                value={types[s.i] || s.type}
                onChange={(e) => setTypes((prev) => ({ ...prev, [s.i]: e.target.value }))}
                className="rounded-lg border border-line bg-white px-1.5 py-0.5 text-xs text-ink outline-none focus:border-brand-300"
                aria-label="Kind of connection"
              >
                {CONNECTION_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <span className="text-[11px] text-ink-faint" title={STRENGTH_HINT}>{s.strength === 'likely' ? 'Likely' : 'Possible'}</span>
            </div>
            <p className="mt-1 pl-5 text-xs text-ink-muted">{s.reason}</p>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <button type="button" onClick={() => onApply({ accepted, types })} disabled={!accepted.size} className={primaryButton}>
          Add {accepted.size} connection{accepted.size === 1 ? '' : 's'}
        </button>
        <button type="button" onClick={onDiscard} className={secondaryButton}>Discard</button>
      </div>
    </div>
  );
};

ConnectionReview.propTypes = {
  suggestions: PropTypes.arrayOf(PropTypes.shape({
    from: PropTypes.number.isRequired,
    to: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    reason: PropTypes.string.isRequired,
    strength: PropTypes.string,
  })).isRequired,
  nodes: PropTypes.arrayOf(nodeShape).isRequired,
  onApply: PropTypes.func.isRequired,
  onDiscard: PropTypes.func.isRequired,
};

export default ConnectionReview;
