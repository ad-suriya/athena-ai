import PropTypes from 'prop-types';
import { Menu } from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import NotificationsButton from './NotificationsButton';
import UserMenu from './UserMenu';

// Search, notifications and account. The menu button opens the sidebar below lg.
const TopBar = ({ onOpenMenu }) => (
  <header className="flex h-20 shrink-0 items-center gap-3 border-b border-transparent bg-white px-4 sm:px-6 lg:px-9">
    <button onClick={onOpenMenu} className="rounded-xl p-2 text-ink hover:bg-brand-50 lg:hidden" aria-label="Open menu">
      <Menu className="h-6 w-6" />
    </button>
    <div className="min-w-0 flex-1">
      <GlobalSearch />
    </div>
    <div className="flex shrink-0 items-center gap-2 sm:gap-4">
      <NotificationsButton />
      <UserMenu />
    </div>
  </header>
);

TopBar.propTypes = {
  onOpenMenu: PropTypes.func.isRequired,
};

export default TopBar;
