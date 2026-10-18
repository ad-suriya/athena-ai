import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link2 } from 'lucide-react';
import { actionButton, primaryButton, sectionTitle } from './panelStyles';

const EXAMPLE = 'I’m preparing for internships while managing college assignments. I need to improve DSA, build a project, update my resume, and manage my time.';

// With no node selected: generate a map from a description, or look for connections
// across the whole map. A non-empty map is never replaced unless the user picks it.
const MapAthenaActions = ({ nodeCount, busy, onGenerate, onFindConnections }) => {
  const [prompt, setPrompt] = useState('');
  const [replace, setReplace] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="mindmap-generate" className={sectionTitle}>Generate a mind map</label>
        <textarea
          id="mindmap-generate"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder={`Describe a goal, project or problem. For example: “${EXAMPLE}”`}
          className="w-full resize-none rounded-xl border border-line bg-white p-2 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-brand-300"
        />
        {nodeCount > 0 && (
          <fieldset className="space-y-1 text-xs text-ink">
            <legend className="sr-only">Where to put it</legend>
            <label className="flex items-center gap-2">
              <input type="radio" name="mindmap-place" checked={!replace} onChange={() => setReplace(false)} className="accent-brand-500" />
              Add next to my current map
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="mindmap-place" checked={replace} onChange={() => setReplace(true)} className="accent-brand-500" />
              Replace my current map (asks again first)
            </label>
          </fieldset>
        )}
        <button type="button" disabled={busy || !prompt.trim()} onClick={() => onGenerate(prompt.trim(), replace)} className={primaryButton}>
          Generate
        </button>
        <p className="text-xs text-ink-faint">You’ll see a preview first; nothing changes until you add it.</p>
      </div>

      {nodeCount >= 2 && (
        <div className="space-y-1.5">
          <p className={sectionTitle}>Whole map</p>
          <button type="button" disabled={busy} onClick={onFindConnections} className={`${actionButton} w-full`}>
            <Link2 className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
            Find connections across the map
          </button>
        </div>
      )}

      <p className="text-xs text-ink-muted">Select an idea on the map to expand it, plan it as tasks, or ask about it.</p>
    </div>
  );
};

MapAthenaActions.propTypes = {
  nodeCount: PropTypes.number.isRequired,
  busy: PropTypes.bool.isRequired,
  onGenerate: PropTypes.func.isRequired,
  onFindConnections: PropTypes.func.isRequired,
};

export default MapAthenaActions;
