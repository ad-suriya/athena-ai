import PropTypes from 'prop-types';
import { EyeOff } from 'lucide-react';
import { nodeShape } from './mindMapPropTypes';

// Overview in the top-left corner: one dot per node at 1/15 scale.
const MindMapMiniMap = ({ nodes, onHide }) => (
  <div className="absolute left-4 top-4 z-10 w-36 rounded-xl border border-line bg-white p-2 shadow-card">
    <div className="mb-1 flex items-center justify-between text-xs font-medium text-ink-muted">
      Overview
      <button onClick={onHide} className="rounded p-0.5 hover:bg-brand-50" aria-label="Hide overview">
        <EyeOff size={12} />
      </button>
    </div>
    <div className="relative h-14 w-full overflow-hidden rounded-lg bg-[#FFFAF9]">
      {nodes.map(node => (
        <div
          key={node.id}
          className="absolute h-1.5 w-1.5 rounded-sm bg-brand-400"
          style={{
            left: (node.x / 15),
            top: (node.y / 15)
          }}
        />
      ))}
    </div>
  </div>
);

MindMapMiniMap.propTypes = {
  nodes: PropTypes.arrayOf(nodeShape).isRequired,
  onHide: PropTypes.func.isRequired,
};

export default MindMapMiniMap;
