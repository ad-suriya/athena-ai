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
  <div className="bg-white rounded-card border border-line shadow-card">
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:grid md:grid-cols-12 md:gap-3 px-4 py-3 bg-[#FBF8F7] border-b border-line text-sm font-medium text-ink-muted">
      {showCheckbox && (
        <div className="flex items-center md:col-span-1">
          <input
            type="checkbox"
            checked={selectedIds.length === tasks.length && tasks.length > 0}
            onChange={onSelectAll}
            className="rounded border-line text-brand-500 focus:ring-brand-200 w-3 h-3"
          />
        </div>
      )}
      <button
        className="flex items-center gap-1 md:col-span-4 text-left hover:text-ink transition-colors"
        onClick={() => onSort('title')}
      >
        <Target className="w-3 h-3" />
        Wellness Activities
        <SortIndicator active={sortConfig.key === 'title'} direction={sortConfig.direction} />
      </button>
      <button
        className="flex items-center gap-1 md:col-span-1 text-left hover:text-ink transition-colors"
        onClick={() => onSort('status')}
      >
        <Zap className="w-3 h-3" />
        Status
        <SortIndicator active={sortConfig.key === 'status'} direction={sortConfig.direction} />
      </button>
      <div className="hidden items-center gap-1 md:flex md:col-span-2">
        <Menu className="w-3 h-3" />
        Wellness Category
      </div>
      <div className="hidden items-center gap-1 md:flex md:col-span-4">
        <Menu className="w-3 h-3" />
        Notes
      </div>
      <div className="hidden text-center md:block md:col-span-1">Actions</div>
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
        <div className="px-3 py-8 text-center text-sm text-ink-muted">Loading wellness activities...</div>
      )}

      {!isLoading && tasks.length === 0 && (
        <div className="px-3 py-8 text-center text-ink-muted">
          <Heart className="w-8 h-8 mx-auto mb-2 text-ink-faint" />
          <h3 className="text-base font-medium mb-2">No wellness activities found</h3>
          <p className="text-sm mb-2">
            {hasActiveFilters
              ? "Try adjusting your search or filters"
              : "Start your wellness journey by adding your first self-care activity"
            }
          </p>
          {!showNewTaskForm && (
            <button
              onClick={onOpenNewTask}
              className="inline-flex items-center gap-1 bg-brand-500 text-white px-3 py-1.5 rounded-xl text-sm hover:bg-brand-600 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add First Activity
            </button>
          )}
        </div>
      )}
    </div>

    {tasks.length > 0 && (
      <div className="px-3 py-2 border-t border-line/70">
        <button
          onClick={onOpenNewTask}
          className="flex items-center gap-1 text-ink-muted hover:text-ink transition-colors text-sm"
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
