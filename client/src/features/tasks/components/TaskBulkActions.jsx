import PropTypes from 'prop-types';

// Bar shown while tasks are selected: set status for all, delete, or cancel.
const TaskBulkActions = ({ selectedCount, onSetStatus, onDelete, onCancel }) => (
  <div className="bg-brand-50 border border-brand-200 rounded-xl p-2 mb-2">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-brand-700">
        {selectedCount} activit{selectedCount !== 1 ? 'ies' : 'y'} selected
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onSetStatus('To Do')}
          className="px-3 py-1 bg-[#ECE7E6] text-ink rounded-lg text-sm hover:bg-[#E3DDDC]"
        >
          Mark To Do
        </button>
        <button
          onClick={() => onSetStatus('In progress')}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
        >
          Mark In Progress
        </button>
        <button
          onClick={() => onSetStatus('Done')}
          className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
        >
          Mark Done
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
        >
          Delete
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-[#F5F2F1] text-ink rounded text-sm hover:bg-[#EEEAE9]"
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
