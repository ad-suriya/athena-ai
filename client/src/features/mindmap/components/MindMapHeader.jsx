import PropTypes from 'prop-types';

const STATUS_TEXT = {
  loading: 'Loading…',
  saving: 'Saving…',
  saved: 'All changes saved',
  error: 'Couldn’t save — will retry on your next change',
  'load-error': 'Couldn’t load your mind map',
};

// Title bar with the save status.
const MindMapHeader = ({ saveStatus }) => (
  <div className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-white px-4 sm:px-6">
    <h1 className="text-lg font-semibold text-ink">Mind map</h1>
    <div
      className={`text-xs ${saveStatus === 'error' || saveStatus === 'load-error' ? 'text-brand-700' : 'text-ink-muted'}`}
      role="status"
      aria-live="polite"
    >
      {STATUS_TEXT[saveStatus]}
    </div>
  </div>
);

MindMapHeader.propTypes = {
  saveStatus: PropTypes.oneOf(Object.keys(STATUS_TEXT)).isRequired,
};

export default MindMapHeader;
