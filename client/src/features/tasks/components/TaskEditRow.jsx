import { useState } from 'react';
import PropTypes from 'prop-types';
import { Save, X } from 'lucide-react';
import { ICON_NAMES, STATUS_OPTIONS } from '../data/taskOptions';
import { taskShape } from './taskPropTypes';

// Inline editor for one task row. Enter saves, Escape cancels.
const TaskEditRow = ({ task, showCheckbox, onSave, onCancel }) => {
  const [editData, setEditData] = useState(task);

  return (
    <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-gray-100 bg-blue-50">
      {showCheckbox && <div className="col-span-1"></div>}
      <div className="col-span-3 flex items-center gap-2">
        <select
          value={editData.icon}
          onChange={(e) => setEditData(prev => ({...prev, icon: e.target.value}))}
          className="w-6 h-6 text-xs border rounded"
        >
          {ICON_NAMES.map(icon => (
            <option key={icon} value={icon}>{icon}</option>
          ))}
        </select>
        <input
          type="text"
          value={editData.title}
          onChange={(e) => setEditData(prev => ({...prev, title: e.target.value}))}
          className="font-medium text-gray-900 bg-white border rounded px-2 py-1 text-xs flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave(task.id, editData);
            if (e.key === 'Escape') onCancel();
          }}
        />
      </div>

      <div className="col-span-1 flex items-center">
        <select
          value={editData.status}
          onChange={(e) => setEditData(prev => ({...prev, status: e.target.value}))}
          className="text-xs bg-white border rounded px-2 py-1 w-full"
        >
          {STATUS_OPTIONS.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="col-span-2 flex items-center">
        <input
          type="text"
          value={editData.category.join(', ')}
          onChange={(e) => setEditData(prev => ({...prev, category: e.target.value.split(',').map(s => s.trim())}))}
          placeholder="Mindfulness, Self-Care"
          className="text-xs text-gray-600 bg-white border rounded px-2 py-1 w-full"
        />
      </div>

      <div className="col-span-5 flex items-center gap-2">
        <input
          type="text"
          value={editData.notes}
          onChange={(e) => setEditData(prev => ({...prev, notes: e.target.value}))}
          className="text-xs text-gray-600 bg-white border rounded px-2 py-1 flex-1"
        />
      </div>

      <div className="col-span-1 flex items-center gap-1">
        <button
          onClick={() => onSave(task.id, editData)}
          className="p-1 text-green-600 hover:bg-green-100 rounded"
          title="Save changes"
        >
          <Save className="w-3 h-3" />
        </button>
        <button
          onClick={onCancel}
          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
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
