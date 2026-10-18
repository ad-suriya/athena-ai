import { useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff } from 'lucide-react';
import { getNodeStyle, NODE_TYPE_ICONS } from '../utils/mindMapUtils';
import { statusMeta } from '../utils/nodeStatus';
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
        className="w-full border-b border-line bg-transparent pb-0.5 text-sm font-medium text-ink outline-none focus:border-brand-400"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={5000}
        placeholder="Add notes (optional)"
        aria-label="Node notes"
        className="w-full resize-none rounded-lg border border-line bg-white p-1.5 text-xs text-ink placeholder:text-ink-faint outline-none focus:border-brand-300"
      />
      <div className="flex justify-end">
        <button onClick={save} className="rounded-lg bg-brand-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-600">
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

// Optional status dot and linked-task count, kept small so the map stays calm.
const NodeProgress = ({ status, linked }) => {
  const meta = statusMeta(status);
  if (!meta && !linked?.total) return null;
  return (
    <div className="mt-1.5 flex items-center gap-2 text-[10px] text-ink-muted">
      {meta && (
        <span className="flex items-center gap-1">
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
          {meta.label}
        </span>
      )}
      {linked?.total > 0 && <span title="Linked tasks done">{linked.completed}/{linked.total} tasks</span>}
    </div>
  );
};

NodeProgress.propTypes = {
  status: PropTypes.string,
  linked: PropTypes.shape({ total: PropTypes.number, completed: PropTypes.number }),
};

// A node card: type icon, title, expand toggle, (when expanded) its notes, and
// progress. Double-click edits title and notes.
const MindMapNode = ({
  node,
  linked,
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
    className={`absolute w-48 rounded-xl p-3 cursor-move select-none ${getNodeStyle(node.type, isSelected, isConnecting)}`}
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
            <h3 className="flex-1 text-sm font-medium leading-tight text-ink">{node.title}</h3>
          </div>
          {node.content && (
            <div className="node-controls flex items-center gap-0.5">
              <button
                onClick={onToggleExpand}
                className="rounded p-0.5 text-ink-faint hover:bg-brand-50 hover:text-brand-500"
                aria-label={node.expanded ? 'Hide notes' : 'Show notes'}
              >
                {node.expanded ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </div>
          )}
        </div>
        {node.expanded && node.content && (
          <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-xs leading-relaxed text-ink-muted">{node.content}</p>
        )}
        <NodeProgress status={node.status} linked={linked} />
      </>
    )}
  </div>
);

MindMapNode.propTypes = {
  node: nodeShape.isRequired,
  linked: PropTypes.shape({ total: PropTypes.number, completed: PropTypes.number }),
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
