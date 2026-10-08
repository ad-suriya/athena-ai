import PropTypes from 'prop-types';

// Bar shown while tasks are selected: set status for all, delete, or cancel.
const TaskBulkActions = ({ selectedCount, onSetStatus, onDelete, onCancel }) => (
  <div className="bg-purple-50 border border-purple-200 rounded-md p-2 mb-2">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-purple-900">
        {selectedCount} activit{selectedCount !== 1 ? 'ies' : 'y'} selected
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onSetStatus('To Do')}
          className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
        >
          Mark To Do
        </button>
        <button
          onClick={() => onSetStatus('In progress')}
          className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
        >
          Mark In Progress
        </button>
        <button
          onClick={() => onSetStatus('Done')}
          className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
        >
          Mark Done
        </button>
        <button
          onClick={onDelete}
          className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
        >
          Delete
        </button>
        <button
          onClick={onCancel}
          className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

TaskBulkActions.propTypes = {
  selectedCount: PropTypes.number.isRequired,
  onSetStatus: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default TaskBulkActions;
