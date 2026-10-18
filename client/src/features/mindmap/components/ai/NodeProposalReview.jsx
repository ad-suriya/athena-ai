import { useState } from 'react';
import PropTypes from 'prop-types';
import { proposalDepths } from '../../utils/proposalUtils';
import { input, primaryButton, secondaryButton } from './panelStyles';

// Review of proposed new nodes: tick the ones to keep, rename any of them, then add.
// Nodes similar to one elsewhere on the map start unticked. Replacing a non-empty map
// asks for a second confirmation.
const NodeProposalReview = ({ proposal, anchorTitle, replace, mapSize, onApply, onDiscard }) => {
  const [accepted, setAccepted] = useState(() => new Set(proposal.nodes.filter((n) => !n.similarTo).map((n) => n.ref)));
  const [titles, setTitles] = useState({});
  const [confirming, setConfirming] = useState(false);
  const depths = proposalDepths(proposal.nodes);
  const { duplicates = 0, overLimit = 0 } = proposal.dropped || {};
  const count = accepted.size;

  const toggle = (ref) => setAccepted((prev) => {
    const next = new Set(prev);
    if (next.has(ref)) next.delete(ref);
    else next.add(ref);
    return next;
  });

  if (!proposal.nodes.length) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-ink">Nothing new to add — everything Athena came up with is already on your map.</p>
        <button type="button" onClick={onDiscard} className={secondaryButton}>Close</button>
      </div>
    );
  }

  const apply = () => {
    if (replace && mapSize > 0 && !confirming) {
      setConfirming(true);
      return;
    }
    onApply({ accepted, titles, replace });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink">
        {anchorTitle ? <>Proposed ideas under <span className="font-semibold">“{anchorTitle}”</span></> : 'Proposed mind map'}
        <span className="text-ink-muted"> · review before adding</span>
      </p>

      <ul className="space-y-1.5">
        {proposal.nodes.map((n) => (
          <li key={n.ref} className="flex items-start gap-2" style={{ paddingLeft: Math.min(depths.get(n.ref) || 0, 4) * 14 }}>
            <input
              type="checkbox"
              checked={accepted.has(n.ref)}
              onChange={() => toggle(n.ref)}
              className="mt-1.5 h-3.5 w-3.5 shrink-0 accent-brand-500"
              aria-label={`Include ${titles[n.ref] ?? n.title}`}
            />
            <div className="min-w-0 flex-1">
              <input
                value={titles[n.ref] ?? n.title}
                onChange={(e) => setTitles((prev) => ({ ...prev, [n.ref]: e.target.value }))}
                maxLength={200}
                className={`${input} ${accepted.has(n.ref) ? '' : 'text-ink-faint line-through'}`}
                aria-label="Idea title"
              />
              {n.description && <p className="mt-0.5 px-0.5 text-xs text-ink-muted">{n.description}</p>}
              {n.similarTo && (
                <p className="mt-0.5 px-0.5 text-xs text-amber-700">Similar to “{n.similarTo.title}” already on your map</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {(duplicates > 0 || overLimit > 0) && (
        <p className="text-xs text-ink-muted">
          {duplicates > 0 && `Skipped ${duplicates} idea${duplicates === 1 ? '' : 's'} already on your map. `}
          {overLimit > 0 && `Left out ${overLimit} to keep the map manageable.`}
        </p>
      )}

      {confirming ? (
        <div className="space-y-2 rounded-xl border border-brand-200 bg-brand-50 p-3">
          <p className="text-sm text-ink">This replaces your current map ({mapSize} idea{mapSize === 1 ? '' : 's'}). You can undo right after. Tasks linked to current ideas stay in your task list but are unlinked.</p>
          <div className="flex gap-2">
            <button type="button" onClick={apply} className={primaryButton}>Replace map</button>
            <button type="button" onClick={() => setConfirming(false)} className={secondaryButton}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button type="button" onClick={apply} disabled={!count} className={primaryButton}>
            {replace && mapSize > 0 ? `Replace with ${count} ideas` : `Add ${count} idea${count === 1 ? '' : 's'}`}
          </button>
          <button type="button" onClick={onDiscard} className={secondaryButton}>Discard</button>
        </div>
      )}
    </div>
  );
};

NodeProposalReview.propTypes = {
  proposal: PropTypes.shape({
    nodes: PropTypes.arrayOf(PropTypes.shape({
      ref: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      similarTo: PropTypes.shape({ title: PropTypes.string }),
    })).isRequired,
    dropped: PropTypes.shape({ duplicates: PropTypes.number, overLimit: PropTypes.number }),
  }).isRequired,
  anchorTitle: PropTypes.string,
  replace: PropTypes.bool,
  mapSize: PropTypes.number.isRequired,
  onApply: PropTypes.func.isRequired,
  onDiscard: PropTypes.func.isRequired,
};

export default NodeProposalReview;
