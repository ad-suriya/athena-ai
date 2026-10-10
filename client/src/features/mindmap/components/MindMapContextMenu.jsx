import PropTypes from 'prop-types';
import { Copy, Edit3, Link, Trash2 } from 'lucide-react';

const item = 'flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm';

// Node actions shown at the cursor after a right-click.
const MindMapContextMenu = ({ x, y, onEdit, onDuplicate, onConnect, onDelete }) => (
  <div
    className="fixed z-50 min-w-40 rounded-xl border border-line bg-white p-1 shadow-card"
    style={{ left: x, top: y }}
  >
    <button onClick={onEdit} className={`${item} text-ink hover:bg-brand-50`}>
      <Edit3 className="h-3.5 w-3.5 text-ink-muted" /> Edit
    </button>
    <button onClick={onDuplicate} className={`${item} text-ink hover:bg-brand-50`}>
      <Copy className="h-3.5 w-3.5 text-ink-muted" /> Duplicate
    </button>
    <button onClick={onConnect} className={`${item} text-ink hover:bg-brand-50`}>
      <Link className="h-3.5 w-3.5 text-ink-muted" /> Connect
    </button>
    <div className="my-1 border-t border-line" />
    <button onClick={onDelete} className={`${item} text-brand-600 hover:bg-brand-50`}>
      <Trash2 className="h-3.5 w-3.5" /> Delete
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
