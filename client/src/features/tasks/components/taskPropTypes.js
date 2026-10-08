import PropTypes from 'prop-types';

// Task as produced by useTasks (UI shape).
export const taskShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  category: PropTypes.arrayOf(PropTypes.string).isRequired,
  notes: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  completed: PropTypes.bool.isRequired,
});

// Row-level callbacks shared by TaskTable and TaskGroups.
export const rowActionsShape = PropTypes.shape({
  onUpdate: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
});
