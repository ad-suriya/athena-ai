import PropTypes from 'prop-types';

const MIN_ZOOM = 50;
const MAX_ZOOM = 150;
const STEP = 25;

// Zoom out / percentage / zoom in, clamped to 50–150%.
const MindMapZoomControls = ({ zoom, onZoomChange }) => (
  <div className="absolute top-2 right-2 z-10 bg-white rounded shadow-md px-2 py-1 flex items-center gap-1 text-sm">
    <button
      onClick={() => onZoomChange(Math.max(MIN_ZOOM, zoom - STEP))}
      className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-xs"
    >
      −
    </button>
    <span className="text-xs font-medium min-w-8 text-center">{zoom}%</span>
    <button
      onClick={() => onZoomChange(Math.min(MAX_ZOOM, zoom + STEP))}
      className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-xs"
    >
      +
    </button>
  </div>
);

MindMapZoomControls.propTypes = {
  zoom: PropTypes.number.isRequired,
  onZoomChange: PropTypes.func.isRequired,
};

export default MindMapZoomControls;
