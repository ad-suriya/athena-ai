import PropTypes from 'prop-types';

// Conversation as listed in the history panel (from /api/conversations).
export const conversationShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  preview: PropTypes.string,
  updatedAt: PropTypes.string,
  createdAt: PropTypes.string,
  isFavorite: PropTypes.bool,
  isScheduled: PropTypes.bool,
  isArchived: PropTypes.bool,
});
