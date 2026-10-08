import { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, Edit, Plus, Trash2, X } from 'lucide-react';
import { STATUS_DROPDOWN_OPTIONS } from '../data/taskOptions';
import { getStatusColor, getTaskIcon } from '../utils/taskUtils';
import OptionDropdown from './OptionDropdown';
import TaskEditRow from './TaskEditRow';
import { rowActionsShape, taskShape } from './taskPropTypes';

const closedMenu = null;

// One task in the table: icon/title, status pill, category chips, notes, hover actions.
// Renders TaskEditRow while the task is being edited.
const TaskRow = ({
  task,
  isEditing,
  showCheckbox,
  isSelected = false,
  onToggleSelect,
  categoryOptions,
  actions,
}) => {
  const [openMenu, setOpenMenu] = useState(closedMenu); // 'status' | 'category' | null
  const closeMenu = () => setOpenMenu(closedMenu);

  if (isEditing) {
    return (
      <TaskEditRow
        task={task}
        showCheckbox={showCheckbox}
        onSave={actions.onUpdate}
        onCancel={actions.onCancelEdit}
      />
    );
  }

  const IconComponent = getTaskIcon(task.icon);

  return (
    <div className={`grid grid-cols-12 gap-2 px-3 py-2 border-b border-gray-100 hover:bg-gray-50 group transition-colors ${
      task.completed ? 'opacity-75' : ''
    }`}>
      {showCheckbox && (
        <div className="col-span-1 flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(task.id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
          />
        </div>
      )}

      <div className="col-span-4 flex items-center gap-2">
        <IconComponent className="w-4 h-4 text-gray-600 flex-shrink-0" />
        <span className={`text-xs font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {task.title}
        </span>
      </div>

      <div className="col-span-1 flex items-center relative">
        <button
          onClick={() => setOpenMenu(openMenu === 'status' ? closedMenu : 'status')}
          className={`px-1 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(task.status)} hover:opacity-80 cursor-pointer flex items-center gap-1`}
        >
          {task.status}
          <ChevronDown className="w-2 h-2" />
        </button>
        <OptionDropdown
          isOpen={openMenu === 'status'}
          onClose={closeMenu}
          onChange={(newStatus) => actions.onUpdate(task.id, { status: newStatus })}
          options={STATUS_DROPDOWN_OPTIONS}
          placeholder="Select a status"
        />
      </div>

      <div className="col-span-2 flex items-center gap-1 relative">
        <div className="flex flex-wrap gap-1 flex-1">
          {task.category.map((cat, index) => (
            <button
              key={index}
              onClick={() => {
                const newCategories = task.category.filter((_, i) => i !== index);
                actions.onUpdate(task.id, { category: newCategories });
              }}
              className="inline-flex bg-purple-100 text-purple-700 px-1 py-0.5 rounded-full text-[10px] hover:bg-purple-200 cursor-pointer items-center gap-1"
            >
              {cat}
              <X className="w-2 h-2" />
            </button>
          ))}
          <button
            onClick={() => setOpenMenu(openMenu === 'category' ? closedMenu : 'category')}
            className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-1 py-0.5 rounded-full text-[10px] hover:bg-gray-200 cursor-pointer"
          >
            <Plus className="w-2 h-2" />
            Add
          </button>
        </div>
        <OptionDropdown
          isOpen={openMenu === 'category'}
          onClose={closeMenu}
          onChange={(newCategory) => {
            if (!task.category.includes(newCategory)) {
              actions.onUpdate(task.id, { category: [...task.category, newCategory] });
            }
          }}
          options={categoryOptions.filter(opt => !task.category.includes(opt.value))}
          placeholder="Select a category"
        />
      </div>

      <div className="col-span-4 flex items-center">
        <span className="text-xs text-gray-600 truncate" title={task.notes}>
          {task.notes}
        </span>
      </div>

      <div className="col-span-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => actions.onEdit(task.id)}
          className="p-0.5 text-blue-600 hover:bg-blue-100 rounded"
          title="Edit activity"
        >
          <Edit className="w-3 h-3" />
        </button>
        <button
          onClick={() => actions.onDuplicate(task)}
          className="p-0.5 text-green-600 hover:bg-green-100 rounded"
          title="Duplicate activity"
        >
          <Plus className="w-3 h-3" />
        </button>
        <button
          onClick={() => actions.onDelete(task.id)}
          className="p-0.5 text-red-600 hover:bg-red-100 rounded"
          title="Delete activity"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

TaskRow.propTypes = {
  task: taskShape.isRequired,
  isEditing: PropTypes.bool.isRequired,
  showCheckbox: PropTypes.bool.isRequired,
  // Only used when showCheckbox is true.
  isSelected: PropTypes.bool,
  onToggleSelect: PropTypes.func,
  categoryOptions: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    color: PropTypes.string,
  })).isRequired,
  actions: rowActionsShape.isRequired,
};

export default TaskRow;
