import PropTypes from 'prop-types';

// Event as produced by useCalendarEvents (UI shape).
export const eventShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  type: PropTypes.string,
  color: PropTypes.string,
  description: PropTypes.string,
});
