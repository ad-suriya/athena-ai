import PropTypes from 'prop-types';

// Toasts in the top-right corner (see useNotifications).
const NotificationStack = ({ notifications }) => (
  <div className="fixed right-4 top-20 z-50 space-y-1.5" aria-live="polite">
    {notifications.map(notif => (
      <div key={notif.id} className="animate-fade-in rounded-xl border border-line bg-white px-3 py-1.5 text-xs text-ink shadow-card">
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
