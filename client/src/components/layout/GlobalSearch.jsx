import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useSearchIndex } from './useSearchIndex';

const GROUP_ORDER = ['Chats', 'Tasks', 'Journal', 'Calendar'];
const PER_GROUP = 4;

// Top-bar search over chats, tasks, journal entries and events. Ctrl/⌘+K focuses it.
const GlobalSearch = () => {
  const navigate = useNavigate();
  const { load, search, status } = useSearchIndex();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  useClickOutside(wrapRef, () => setOpen(false), open);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const results = search(query);
  const groups = GROUP_ORDER.map((type) => ({ type, items: results.filter((r) => r.type === type).slice(0, PER_GROUP) }))
    .filter((g) => g.items.length);

  const go = (item) => {
    setOpen(false);
    setQuery('');
    navigate(item.to, item.state ? { state: item.state } : undefined);
  };

  return (
    <div ref={wrapRef} className="relative w-full max-w-[740px]">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" />
      <input
        ref={inputRef}
        id="global-search"
        type="search"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { load(); setOpen(true); }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') { setOpen(false); e.currentTarget.blur(); }
          if (e.key === 'Enter' && results[0]) go(results[0]);
        }}
        placeholder="Search anything..."
        aria-label="Search chats, tasks, journal and calendar"
        className="h-12 w-full rounded-2xl border border-line bg-[#F8F6F6] pl-12 pr-4 text-[15px] text-ink placeholder:text-ink-faint focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100"
      />
      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-[60vh] overflow-y-auto rounded-2xl border border-line bg-white p-2 shadow-card">
          {status === 'loading' && <p className="px-3 py-2 text-sm text-ink-faint">Searching…</p>}
          {status === 'ready' && groups.length === 0 && (
            <p className="px-3 py-2 text-sm text-ink-faint">Nothing matches “{query.trim()}”.</p>
          )}
          {groups.map((g) => (
            <div key={g.type} className="py-1">
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">{g.type}</p>
              {g.items.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => go(item)}
                  className="block w-full rounded-xl px-3 py-2 text-left hover:bg-brand-50 focus:bg-brand-50 focus:outline-none"
                >
                  <span className="block truncate text-sm font-medium text-ink">{item.title}</span>
                  {item.text && <span className="block truncate text-xs text-ink-faint">{item.text}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
