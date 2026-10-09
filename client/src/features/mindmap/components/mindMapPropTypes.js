import PropTypes from 'prop-types';

export const nodeShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  expanded: PropTypes.bool.isRequired,
});

export const connectionShape = PropTypes.shape({
  from: PropTypes.number.isRequired,
  to: PropTypes.number.isRequired,
});
