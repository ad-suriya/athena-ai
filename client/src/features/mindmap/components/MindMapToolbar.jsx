import PropTypes from 'prop-types';
import { Eye, EyeOff, Plus, Sparkles } from 'lucide-react';

const toolButton = 'flex h-9 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-sm font-medium text-ink shadow-card hover:bg-brand-50';

// Bottom-left tools (mini map toggle, Tidy), bottom-right add button, and the usage hint.
const MindMapToolbar = ({ showMiniMap, onToggleMiniMap, onTidy, onAddNode }) => (
  <>
    <div className="absolute bottom-4 left-4 flex gap-2">
      <button onClick={onToggleMiniMap} className={toolButton} aria-label={showMiniMap ? 'Hide overview' : 'Show overview'}>
        {showMiniMap ? <EyeOff className="h-4 w-4 text-ink-muted" /> : <Eye className="h-4 w-4 text-ink-muted" />}
      </button>
      <button onClick={onTidy} className={toolButton}>
        <Sparkles className="h-4 w-4 text-brand-500" />
        Tidy
      </button>
    </div>

    <button
      onClick={onAddNode}
      className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-[0_6px_16px_rgba(230,92,82,0.35)] transition hover:bg-brand-600"
      aria-label="Add idea"
    >
      <Plus className="h-5 w-5" />
    </button>

    <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs text-ink-muted shadow-card sm:block">
      Double-click to add · double-click an idea to edit · right-click for options
    </div>
  </>
);

MindMapToolbar.propTypes = {
  showMiniMap: PropTypes.bool.isRequired,
  onToggleMiniMap: PropTypes.func.isRequired,
  onTidy: PropTypes.func.isRequired,
  onAddNode: PropTypes.func.isRequired,
};

export default MindMapToolbar;
