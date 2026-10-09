import PropTypes from 'prop-types';
import { EyeOff } from 'lucide-react';
import { nodeShape } from './mindMapPropTypes';

// Overview in the top-left corner: one dot per node at 1/15 scale.
const MindMapMiniMap = ({ nodes, onHide }) => (
  <div className="absolute top-2 left-2 z-10 bg-white rounded shadow-md p-1.5 w-32 h-20 border text-xs">
    <div className="text-xs font-medium text-gray-500 mb-1 flex items-center justify-between">
      Map
      <button onClick={onHide}>
        <EyeOff size={10} />
      </button>
    </div>
    <div className="w-full h-12 bg-gray-50 rounded relative overflow-hidden">
      {nodes.map(node => (
        <div
          key={node.id}
          className="absolute w-1.5 h-1.5 bg-blue-400 rounded-sm"
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
