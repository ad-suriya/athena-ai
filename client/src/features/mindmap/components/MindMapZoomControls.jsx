import PropTypes from 'prop-types';
import { Minus, Plus } from 'lucide-react';

const MIN_ZOOM = 50;
const MAX_ZOOM = 150;
const STEP = 25;

// Zoom out / percentage / zoom in, clamped to 50–150%.
const MindMapZoomControls = ({ zoom, onZoomChange }) => (
  <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-xl border border-line bg-white px-1.5 py-1 shadow-card">
    <button
      onClick={() => onZoomChange(Math.max(MIN_ZOOM, zoom - STEP))}
      disabled={zoom <= MIN_ZOOM}
      className="rounded-lg p-1 text-ink-muted hover:bg-brand-50 disabled:opacity-30"
      aria-label="Zoom out"
    >
      <Minus className="h-4 w-4" />
    </button>
    <span className="min-w-[3rem] text-center text-xs font-medium tabular-nums text-ink">{zoom}%</span>
    <button
      onClick={() => onZoomChange(Math.min(MAX_ZOOM, zoom + STEP))}
      disabled={zoom >= MAX_ZOOM}
      className="rounded-lg p-1 text-ink-muted hover:bg-brand-50 disabled:opacity-30"
      aria-label="Zoom in"
    >
      <Plus className="h-4 w-4" />
    </button>
  </div>
);

MindMapZoomControls.propTypes = {
  zoom: PropTypes.number.isRequired,
  onZoomChange: PropTypes.func.isRequired,
};

export default MindMapZoomControls;
