import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// White dashboard card with an icon + title row and an optional link on the right.
const HomeCard = ({ icon: Icon, title, action, children, className = '' }) => (
  <section className={`flex flex-col rounded-card border border-line bg-white p-5 shadow-card sm:p-6 ${className}`}>
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-3 text-[17px] font-semibold text-ink">
        <Icon className="h-6 w-6 text-brand-500" strokeWidth={1.9} />
        {title}
      </h2>
      {action && (
        <Link to={action.to} state={action.state} className="shrink-0 text-sm font-medium text-brand-500 hover:text-brand-600">
          {action.label}
        </Link>
      )}
    </div>
    <div className="flex min-h-0 flex-1 flex-col">{children}</div>
  </section>
);

HomeCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  action: PropTypes.shape({ label: PropTypes.string.isRequired, to: PropTypes.string.isRequired, state: PropTypes.object }),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default HomeCard;
