import PropTypes from 'prop-types';
import { ArrowUpDown, Heart, Menu, Plus, Target, Zap } from 'lucide-react';
import TaskRow from './TaskRow';
import { rowActionsShape, taskShape } from './taskPropTypes';

const SortIndicator = ({ active, direction }) =>
  active ? <ArrowUpDown className={`w-2 h-2 ${direction === 'desc' ? 'rotate-180' : ''}`} /> : null;

SortIndicator.propTypes = {
  active: PropTypes.bool.isRequired,
  direction: PropTypes.oneOf(['asc', 'desc']).isRequired,
};

// "All Activities" view: sortable header, optional selection column, rows,
// loading and empty states, and a trailing "New wellness activity" row.
const TaskTable = ({
  tasks,
  sortConfig,
  onSort,
  showCheckbox,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  isLoading,
  hasActiveFilters,
  showNewTaskForm,
  onOpenNewTask,
  editingId,
  categoryOptions,
  actions,
}) => (
  <div className="bg-white rounded-md border border-gray-200 shadow-sm">
    <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-600">
      {showCheckbox && (
        <div className="col-span-1 flex items-center">
          <input
            type="checkbox"
            checked={selectedIds.length === tasks.length && tasks.length > 0}
            onChange={onSelectAll}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-3 h-3"
          />
        </div>
      )}
      <button
        className="col-span-4 flex items-center gap-1 text-left hover:text-gray-900 transition-colors"
        onClick={() => onSort('title')}
      >
        <Target className="w-3 h-3" />
        Wellness Activities
        <SortIndicator active={sortConfig.key === 'title'} direction={sortConfig.direction} />
      </button>
      <button
        className="col-span-1 flex items-center gap-1 text-left hover:text-gray-900 transition-colors"
        onClick={() => onSort('status')}
      >
        <Zap className="w-3 h-3" />
        Status
        <SortIndicator active={sortConfig.key === 'status'} direction={sortConfig.direction} />
      </button>
      <div className="col-span-2 flex items-center gap-1">
        <Menu className="w-3 h-3" />
        Wellness Category
      </div>
      <div className="col-span-4 flex items-center gap-1">
        <Menu className="w-3 h-3" />
        Notes
      </div>
      <div className="col-span-1 text-center">Actions</div>
    </div>

    <div>
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          isEditing={editingId === task.id}
          showCheckbox={showCheckbox}
          isSelected={selectedIds.includes(task.id)}
          onToggleSelect={onToggleSelect}
          categoryOptions={categoryOptions}
          actions={actions}
        />
      ))}

      {isLoading && (
        <div className="px-3 py-8 text-center text-xs text-gray-500">Loading wellness activities...</div>
      )}

      {!isLoading && tasks.length === 0 && (
        <div className="px-3 py-8 text-center text-gray-500">
          <Heart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <h3 className="text-base font-medium mb-2">No wellness activities found</h3>
          <p className="text-xs mb-2">
            {hasActiveFilters
              ? "Try adjusting your search or filters"
              : "Start your wellness journey by adding your first self-care activity"
            }
          </p>
          {!showNewTaskForm && (
            <button
              onClick={onOpenNewTask}
              className="inline-flex items-center gap-1 bg-purple-600 text-white px-2 py-1 rounded-md text-xs hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add First Activity
            </button>
          )}
        </div>
      )}
    </div>

    {tasks.length > 0 && (
      <div className="px-3 py-2 border-t border-gray-100">
        <button
          onClick={onOpenNewTask}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors text-xs"
        >
          <Plus className="w-3 h-3" />
          <span>New wellness activity</span>
        </button>
      </div>
    )}
  </div>
);

TaskTable.propTypes = {
  tasks: PropTypes.arrayOf(taskShape).isRequired,
  sortConfig: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc']).isRequired,
  }).isRequired,
  onSort: PropTypes.func.isRequired,
  showCheckbox: PropTypes.bool.isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onToggleSelect: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  hasActiveFilters: PropTypes.bool.isRequired,
  showNewTaskForm: PropTypes.bool.isRequired,
  onOpenNewTask: PropTypes.func.isRequired,
  editingId: PropTypes.string,
  categoryOptions: TaskRow.propTypes.categoryOptions,
  actions: rowActionsShape.isRequired,
};

export default TaskTable;
