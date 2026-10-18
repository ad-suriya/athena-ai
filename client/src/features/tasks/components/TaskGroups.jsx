import PropTypes from 'prop-types';
import { Heart, Menu, Target } from 'lucide-react';
import { getStatusColor } from '../utils/taskUtils';
import TaskRow from './TaskRow';
import { rowActionsShape, taskShape } from './taskPropTypes';

// "Grouped by status" view: one card per non-empty status.
const TaskGroups = ({ groupedTasks, totalCount, editingId, categoryOptions, actions }) => (
  <div className="space-y-4">
    {Object.entries(groupedTasks).map(([status, statusTasks]) => (
      statusTasks.length > 0 && (
        <div key={status} className="bg-white rounded-card border border-line shadow-card">
          <div className="bg-[#FBF8F7] px-3 py-2 border-b border-line">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-ink text-sm flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${getStatusColor(status).split(' ')[1]}`}></span>
                {status} ({statusTasks.length})
              </h3>
              <div className="text-sm text-ink-muted">
                {status === 'Done' && `${Math.round((statusTasks.length / totalCount) * 100)}% of all activities completed`}
              </div>
            </div>
          </div>

          <div className="hidden md:grid md:grid-cols-12 md:gap-3 px-4 py-3 bg-[#FBF8F7] border-b border-line text-sm font-medium text-ink-muted">
            <div className="col-span-4 flex items-center gap-1">
              <Target className="w-3 h-3" />
              Wellness Activities
            </div>
            <div className="col-span-2 flex items-center gap-1">
              <Menu className="w-3 h-3" />
              Wellness Category
            </div>
            <div className="col-span-5 flex items-center gap-1">
              <Menu className="w-3 h-3" />
              Notes
            </div>
            <div className="col-span-1 text-center">Actions</div>
          </div>

          {statusTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              isEditing={editingId === task.id}
              showCheckbox={false}
              categoryOptions={categoryOptions}
              actions={actions}
            />
          ))}
        </div>
      )
    ))}

    {Object.values(groupedTasks).every(arr => arr.length === 0) && (
      <div className="bg-white rounded-xl border border-line px-3 py-8 text-center text-ink-muted shadow-card">
        <Heart className="w-8 h-8 mx-auto mb-2 text-ink-faint" />
        <h3 className="text-base font-medium mb-2">No wellness activities found</h3>
        <p className="text-sm">Try adjusting your search or filters to see more activities</p>
      </div>
    )}
  </div>
);

TaskGroups.propTypes = {
  groupedTasks: PropTypes.objectOf(PropTypes.arrayOf(taskShape)).isRequired,
  totalCount: PropTypes.number.isRequired,
  editingId: PropTypes.string,
  categoryOptions: TaskRow.propTypes.categoryOptions,
  actions: rowActionsShape.isRequired,
};

export default TaskGroups;
