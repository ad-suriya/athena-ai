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
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 md:grid md:grid-cols-12 md:gap-3 px-4 py-3 border-b border-line/70 hover:bg-brand-50/40 group transition-colors ${
      task.completed ? 'opacity-75' : ''
    }`}>
      {showCheckbox && (
        <div className="order-0 flex items-center md:order-none md:col-span-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(task.id)}
            className="rounded border-line text-blue-600 focus:ring-brand-200 w-3 h-3"
          />
        </div>
      )}

      <div className="order-1 min-w-0 flex-1 flex items-center gap-2 md:order-none md:col-span-4">
        <IconComponent className="w-4 h-4 text-ink-muted flex-shrink-0" />
        <span className={`text-sm font-medium ${task.completed ? 'line-through text-ink-muted' : 'text-ink'}`}>
          {task.title}
        </span>
      </div>

      {/* Phones: status and categories start a second line. */}
      <div className="order-3 h-0 basis-full md:hidden" aria-hidden="true" />

      <div className="order-4 flex items-center relative md:order-none md:col-span-1">
        <button
          onClick={() => setOpenMenu(openMenu === 'status' ? closedMenu : 'status')}
          className={`px-1 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)} hover:opacity-80 cursor-pointer flex items-center gap-1`}
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

      <div className="order-5 min-w-0 flex-1 flex items-center gap-1 relative md:order-none md:col-span-2">
        <div className="flex flex-wrap gap-1 flex-1">
          {task.category.map((cat, index) => (
            <button
              key={index}
              onClick={() => {
                const newCategories = task.category.filter((_, i) => i !== index);
                actions.onUpdate(task.id, { category: newCategories });
              }}
              className="inline-flex bg-brand-50 text-brand-600 px-1 py-0.5 rounded-full text-xs hover:bg-brand-100 cursor-pointer items-center gap-1"
            >
              {cat}
              <X className="w-2 h-2" />
            </button>
          ))}
          <button
            onClick={() => setOpenMenu(openMenu === 'category' ? closedMenu : 'category')}
            className="inline-flex items-center gap-1 bg-[#F5F2F1] text-ink-muted px-1 py-0.5 rounded-full text-xs hover:bg-[#EEEAE9] cursor-pointer"
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

      <div className={`order-6 w-full items-center md:order-none md:col-span-4 ${task.notes ? 'flex' : 'hidden md:flex'}`}>
        <span className="text-sm text-ink-muted truncate" title={task.notes}>
          {task.notes}
        </span>
      </div>

      <div className="order-2 flex items-center gap-1 transition-opacity md:order-none md:col-span-1 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
        <button
          onClick={() => actions.onEdit(task.id)}
          className="rounded-lg p-1.5 text-ink-muted hover:bg-brand-50 hover:text-brand-500"
          title="Edit activity"
        >
          <Edit className="w-3 h-3" />
        </button>
        <button
          onClick={() => actions.onDuplicate(task)}
          className="rounded-lg p-1.5 text-ink-muted hover:bg-brand-50 hover:text-brand-500"
          title="Duplicate activity"
        >
          <Plus className="w-3 h-3" />
        </button>
        <button
          onClick={() => actions.onDelete(task.id)}
          className="rounded-lg p-1.5 text-brand-500 hover:bg-brand-50 hover:text-brand-600"
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
