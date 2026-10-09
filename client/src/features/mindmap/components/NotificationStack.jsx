import PropTypes from 'prop-types';

// Toasts in the top-right corner (see useNotifications).
const NotificationStack = ({ notifications }) => (
  <div className="fixed top-16 right-4 z-50 space-y-1">
    {notifications.map(notif => (
      <div key={notif.id} className="bg-white border border-gray-200 rounded-md shadow-md px-3 py-1 text-xs animate-fade-in">
        {notif.message}
      </div>
    ))}
  </div>
);

NotificationStack.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
  })).isRequired,
};

export default NotificationStack;
