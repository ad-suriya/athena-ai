import { useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff } from 'lucide-react';
import { getNodeStyle, NODE_TYPE_ICONS } from '../utils/mindMapUtils';
import { nodeShape } from './mindMapPropTypes';

// Title and notes editor shown inside a node. Enter in the title or "Done" saves;
// Escape cancels; clicking outside the form saves.
const NodeEditor = ({ node, onSave, onCancel }) => {
  const [title, setTitle] = useState(node.title);
  const [content, setContent] = useState(node.content);
  const save = () => onSave({ title: title.trim() || 'Untitled', content: content.trim() });

  return (
    <div
      className="node-controls space-y-2"
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) save(); }}
      onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
        autoFocus
        maxLength={200}
        aria-label="Node title"
        className="w-full border-b border-gray-300 bg-transparent text-xs font-medium text-gray-900 outline-none"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={5000}
        placeholder="Add notes (optional)"
        aria-label="Node notes"
        className="w-full resize-none rounded border border-gray-200 bg-white/70 p-1.5 text-xs text-gray-700 outline-none focus:border-gray-400"
      />
      <div className="flex justify-end">
        <button onClick={save} className="rounded bg-gray-900 px-2 py-0.5 text-xs font-medium text-white hover:bg-gray-700">
          Done
        </button>
      </div>
    </div>
  );
};

NodeEditor.propTypes = {
  node: nodeShape.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

// A node card: type icon, title, expand toggle, and (when expanded) its notes.
// Double-click edits title and notes.
const MindMapNode = ({
  node,
  isSelected,
  isConnecting,
  isEditing,
  onMouseDown,
  onContextMenu,
  onClick,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleExpand,
}) => (
  <div
    className={`absolute w-48 rounded-lg p-3 cursor-move select-none ${getNodeStyle(node.type, isSelected, isConnecting)}`}
    style={{ left: node.x, top: node.y }}
    onMouseDown={onMouseDown}
    onContextMenu={onContextMenu}
    onClick={onClick}
    onDoubleClick={(e) => {
      e.stopPropagation(); // the canvas adds a node on double-click
      onStartEdit();
    }}
  >
    {isEditing ? (
      <NodeEditor node={node} onSave={onSaveEdit} onCancel={onCancelEdit} />
    ) : (
      <>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5 flex-1">
            {NODE_TYPE_ICONS[node.type] && <span className="text-sm">{NODE_TYPE_ICONS[node.type]}</span>}
            <h3 className="font-medium text-gray-900 text-xs flex-1 leading-tight">{node.title}</h3>
          </div>
          {node.content && (
            <div className="node-controls flex items-center gap-0.5">
              <button
                onClick={onToggleExpand}
                className="text-gray-400 hover:text-gray-600 p-0.5 rounded"
                aria-label={node.expanded ? 'Hide notes' : 'Show notes'}
              >
                {node.expanded ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </div>
          )}
        </div>
        {node.expanded && node.content && (
          <p className="mt-2 text-xs text-gray-600 line-clamp-2 leading-relaxed whitespace-pre-wrap">{node.content}</p>
        )}
      </>
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
  onStartEdit: PropTypes.func.isRequired,
  onSaveEdit: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  onToggleExpand: PropTypes.func.isRequired,
};

export default MindMapNode;
