import PropTypes from 'prop-types';
import { Copy, Edit3, Link, Trash2 } from 'lucide-react';

// Node actions shown at the cursor after a right-click.
const MindMapContextMenu = ({ x, y, onEdit, onDuplicate, onConnect, onDelete }) => (
  <div
    className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-36 text-sm"
    style={{ left: x, top: y }}
  >
    <button onClick={onEdit} className="w-full px-3 py-1 text-left hover:bg-gray-50 flex items-center gap-2">
      <Edit3 size={12} /> Edit
    </button>
    <button onClick={onDuplicate} className="w-full px-3 py-1 text-left hover:bg-gray-50 flex items-center gap-2">
      <Copy size={12} /> Duplicate
    </button>
    <button onClick={onConnect} className="w-full px-3 py-1 text-left hover:bg-gray-50 flex items-center gap-2">
      <Link size={12} /> Connect
    </button>
    <hr className="my-1" />
    <button onClick={onDelete} className="w-full px-3 py-1 text-left hover:bg-red-50 text-red-600 flex items-center gap-2">
      <Trash2 size={12} /> Delete
    </button>
  </div>
);

MindMapContextMenu.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onConnect: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default MindMapContextMenu;
