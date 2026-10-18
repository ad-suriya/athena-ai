import { useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';

// Bell with an empty notifications popover. Athena has no notification source yet,
// so it never shows an unread dot.
const NotificationsButton = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-brand-50"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-6 w-6" strokeWidth={1.8} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-2xl border border-line bg-white p-5 text-center shadow-card">
          <p className="text-sm font-semibold text-ink">You&apos;re all caught up</p>
          <p className="mt-1 text-xs text-ink-faint">Reminders and updates will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsButton;
