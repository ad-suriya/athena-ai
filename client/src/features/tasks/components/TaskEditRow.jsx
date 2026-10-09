import { useState } from 'react';
import PropTypes from 'prop-types';
import { Save, X } from 'lucide-react';
import { ICON_NAMES, STATUS_OPTIONS } from '../data/taskOptions';
import { taskShape } from './taskPropTypes';

// Inline editor for one task row. Enter saves, Escape cancels.
const TaskEditRow = ({ task, showCheckbox, onSave, onCancel }) => {
  const [editData, setEditData] = useState(task);

  return (
    <div className="flex flex-col gap-2 md:grid md:grid-cols-12 md:gap-3 px-4 py-3 border-b border-line/70 bg-brand-50/60">
      {showCheckbox && <div className="hidden md:block md:col-span-1"></div>}
      <div className="flex items-center gap-2 md:col-span-3">
        <select
          value={editData.icon}
          onChange={(e) => setEditData(prev => ({...prev, icon: e.target.value}))}
          className="w-6 h-6 text-sm border rounded"
        >
          {ICON_NAMES.map(icon => (
            <option key={icon} value={icon}>{icon}</option>
          ))}
        </select>
        <input
          type="text"
          value={editData.title}
          onChange={(e) => setEditData(prev => ({...prev, title: e.target.value}))}
          className="font-medium text-ink bg-white border rounded px-2 py-1 text-sm flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave(task.id, editData);
            if (e.key === 'Escape') onCancel();
          }}
        />
      </div>

      <div className="flex items-center md:col-span-1">
        <select
          value={editData.status}
          onChange={(e) => setEditData(prev => ({...prev, status: e.target.value}))}
          className="text-sm bg-white border rounded px-2 py-1 w-full"
        >
          {STATUS_OPTIONS.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center md:col-span-2">
        <input
          type="text"
          value={editData.category.join(', ')}
          onChange={(e) => setEditData(prev => ({...prev, category: e.target.value.split(',').map(s => s.trim())}))}
          placeholder="Mindfulness, Self-Care"
          className="text-sm text-ink-muted bg-white border rounded px-2 py-1 w-full"
        />
      </div>

      <div className="flex items-center gap-2 md:col-span-5">
        <input
          type="text"
          value={editData.notes}
          onChange={(e) => setEditData(prev => ({...prev, notes: e.target.value}))}
          className="text-sm text-ink-muted bg-white border rounded px-2 py-1 flex-1"
        />
      </div>

      <div className="flex items-center gap-1 md:col-span-1">
        <button
          onClick={() => onSave(task.id, editData)}
          className="p-1 text-green-600 hover:bg-green-100 rounded"
          title="Save changes"
        >
          <Save className="w-3 h-3" />
        </button>
        <button
          onClick={onCancel}
          className="p-1 text-ink-muted hover:bg-brand-50 rounded"
          title="Cancel"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

TaskEditRow.propTypes = {
  task: taskShape.isRequired,
  showCheckbox: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default TaskEditRow;
