import PropTypes from 'prop-types';

export const nodeShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  expanded: PropTypes.bool.isRequired,
  status: PropTypes.string,
});

export const connectionShape = PropTypes.shape({
  from: PropTypes.number.isRequired,
  to: PropTypes.number.isRequired,
  type: PropTypes.string,
  label: PropTypes.string,
});

// One node's entry from useLinkedTasks.
export const linkedShape = PropTypes.shape({
  tasks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  })).isRequired,
  progress: PropTypes.shape({
    total: PropTypes.number.isRequired,
    completed: PropTypes.number.isRequired,
    overdue: PropTypes.number.isRequired,
    suggestedStatus: PropTypes.string,
  }).isRequired,
});
