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
  <div className="bg-white border-b border-gray-200 px-3 py-1.5 flex items-center justify-between text-sm">
    <div className="font-medium text-gray-900 text-sm">🧠 My mind map</div>
    <div
      className={`text-xs ${saveStatus === 'error' || saveStatus === 'load-error' ? 'text-red-600' : 'text-gray-500'}`}
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
