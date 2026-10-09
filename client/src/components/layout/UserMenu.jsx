import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ChevronDown, LogOut, MessageSquareText, User } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { signOutUser } from '../../services/authService';

const menuItem = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-brand-50';

// Avatar, first name and an account menu (profile, insights, feedback, sign out).
const UserMenu = () => {
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  if (!user) return null;
  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 hover:bg-brand-50"
        aria-label="Account menu"
        aria-expanded={open}
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="h-11 w-11 rounded-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0F5A45] text-lg font-semibold text-white">
            {user.firstName[0]?.toUpperCase()}
          </span>
        )}
        <span className="hidden text-[15px] font-medium text-ink sm:inline">{user.firstName}</span>
        <ChevronDown className="hidden h-4 w-4 text-ink-muted sm:inline" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-60 rounded-2xl border border-line bg-white p-2 shadow-card">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-faint">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          <Link to="/profile" className={menuItem} onClick={close}><User className="h-4 w-4" /> Profile</Link>
          <Link to="/settings" className={menuItem} onClick={close}><BarChart3 className="h-4 w-4" /> Insights</Link>
          <Link to="/feedback" className={menuItem} onClick={close}><MessageSquareText className="h-4 w-4" /> Send feedback</Link>
          <div className="my-1 h-px bg-line" />
          <button className={`${menuItem} text-brand-600`} onClick={() => { close(); signOutUser(); }}>
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
