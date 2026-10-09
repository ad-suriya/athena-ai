import PropTypes from 'prop-types';
import { Eye, EyeOff } from 'lucide-react';
import { getNodeStyle, getTagColor, NODE_TYPE_ICONS } from '../utils/mindMapUtils';
import { nodeShape } from './mindMapPropTypes';

// A node card: type icon, title (inline editor while editing), expand toggle,
// and when expanded its content, tags and like/comment counts.
const MindMapNode = ({
  node,
  isSelected,
  isConnecting,
  isEditing,
  onMouseDown,
  onContextMenu,
  onClick,
  onSaveTitle,
  onToggleExpand,
  onLike,
}) => (
  <div
    className={`absolute w-48 rounded-lg p-3 cursor-move select-none ${getNodeStyle(node.type, isSelected, isConnecting)}`}
    style={{ left: node.x, top: node.y }}
    onMouseDown={onMouseDown}
    onContextMenu={onContextMenu}
    onClick={onClick}
  >
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-1.5 flex-1">
        {NODE_TYPE_ICONS[node.type] && <span className="text-sm">{NODE_TYPE_ICONS[node.type]}</span>}

        {isEditing ? (
          <input
            type="text"
            defaultValue={node.title}
            autoFocus
            className="font-medium text-gray-900 text-xs bg-transparent border-b border-gray-300 outline-none flex-1"
            onBlur={(e) => onSaveTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSaveTitle(e.target.value)}
          />
        ) : (
          <h3 className="font-medium text-gray-900 text-xs flex-1 leading-tight">{node.title}</h3>
        )}
      </div>

      <div className="node-controls flex items-center gap-0.5">
        <button
          onClick={onToggleExpand}
          className="text-gray-400 hover:text-gray-600 p-0.5 rounded"
        >
          {node.expanded ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
      </div>
    </div>

    {node.expanded && (
      <>
        <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-relaxed">{node.content}</p>

        <div className="flex gap-1 mb-2">
          {node.tags.map((tag, index) => (
            <span key={index} className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}>
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <button
              onClick={onLike}
              className="flex items-center gap-1 hover:text-red-500"
            >
              {node.likes}
            </button>
            <button className="flex items-center gap-1 hover:text-blue-500">
              {node.comments}
            </button>
          </div>
          <div className="text-xs text-gray-400">2m</div>
        </div>
      </>
    )}

    {/* Collaborator indicator (sample content) */}
    {node.id === 5 && (
      <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
        A
      </div>
    )}
  </div>
);

MindMapNode.propTypes = {
  node: nodeShape.isRequired,
  isSelected: PropTypes.bool.isRequired,
  isConnecting: PropTypes.bool.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onMouseDown: PropTypes.func.isRequired,
  onContextMenu: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  onSaveTitle: PropTypes.func.isRequired,
  onToggleExpand: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
};

export default MindMapNode;
