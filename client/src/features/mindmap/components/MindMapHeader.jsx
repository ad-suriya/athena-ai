import PropTypes from 'prop-types';
import { Sparkles } from 'lucide-react';

const STATUS_TEXT = {
  loading: 'Loading…',
  saving: 'Saving…',
  saved: 'All changes saved',
  error: 'Couldn’t save — will retry on your next change',
  'load-error': 'Couldn’t load your mind map',
};

// Title bar with the save status and the Athena panel toggle.
const MindMapHeader = ({ saveStatus, panelOpen, onTogglePanel }) => (
  <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-white px-4 sm:px-6">
    <h1 className="text-lg font-semibold text-ink">Mind map</h1>
    <div className="flex items-center gap-3">
      <div
        className={`text-xs ${saveStatus === 'error' || saveStatus === 'load-error' ? 'text-brand-700' : 'text-ink-muted'}`}
        role="status"
        aria-live="polite"
      >
        {STATUS_TEXT[saveStatus]}
      </div>
      <button
        type="button"
        onClick={onTogglePanel}
        aria-pressed={panelOpen}
        className={`flex h-8 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium ${panelOpen ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-line bg-white text-ink hover:bg-brand-50'}`}
      >
        <Sparkles className="h-4 w-4 text-brand-500" aria-hidden="true" />
        Athena
      </button>
    </div>
  </div>
);

MindMapHeader.propTypes = {
  saveStatus: PropTypes.oneOf(Object.keys(STATUS_TEXT)).isRequired,
  panelOpen: PropTypes.bool.isRequired,
  onTogglePanel: PropTypes.func.isRequired,
};

export default MindMapHeader;
