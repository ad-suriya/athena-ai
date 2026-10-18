import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';

const VIEWS = [
  { id: 'month', label: 'Month' },
  { id: 'week', label: 'Week' },
  { id: 'day', label: 'Day' },
];

// Moves currentDate by one unit of the current view.
const shift = (date, viewMode, direction) => {
  const next = new Date(date);
  if (viewMode === 'month') next.setMonth(date.getMonth() + direction);
  else if (viewMode === 'week') next.setDate(date.getDate() + direction * 7);
  else next.setDate(date.getDate() + direction);
  return next;
};

// Calendar toolbar: today / previous / next, the month, search, view switch, new event.
const CalendarTopBar = ({ viewMode, setViewMode, currentDate, setCurrentDate, searchQuery, setSearchQuery, onNewEvent }) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line bg-white px-4 py-4 sm:px-6">
    <div className="flex items-center gap-2">
      <button
        onClick={() => setCurrentDate(new Date())}
        className="rounded-xl border border-line px-3.5 py-2 text-sm font-medium text-ink hover:bg-brand-50"
        aria-label="Go to today"
      >
        Today
      </button>
      <button
        onClick={() => setCurrentDate((d) => shift(d, viewMode, -1))}
        className="rounded-lg p-2 text-ink-muted hover:bg-brand-50 hover:text-brand-500"
        aria-label={`Previous ${viewMode}`}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => setCurrentDate((d) => shift(d, viewMode, 1))}
        className="rounded-lg p-2 text-ink-muted hover:bg-brand-50 hover:text-brand-500"
        aria-label={`Next ${viewMode}`}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <h1 className="ml-1 text-2xl font-bold tracking-[-0.02em] text-ink">
        {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
      </h1>
    </div>

    <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
      <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          type="search"
          placeholder="Search events"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-line bg-[#F8F6F6] py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100"
          data-testid="search-input"
          aria-label="Search events"
        />
      </div>
      <div className="flex rounded-xl border border-line bg-[#F8F6F6] p-1" role="group" aria-label="Calendar view">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setViewMode(v.id)}
            aria-pressed={viewMode === v.id}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === v.id ? 'bg-white text-brand-600 shadow-sm' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <button
        onClick={onNewEvent}
        className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        data-testid="new-event-button"
      >
        <Plus className="h-4 w-4" /> New event
      </button>
    </div>
  </div>
);

CalendarTopBar.propTypes = {
  viewMode: PropTypes.oneOf(['month', 'week', 'day']).isRequired,
  setViewMode: PropTypes.func.isRequired,
  currentDate: PropTypes.instanceOf(Date).isRequired,
  setCurrentDate: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  onNewEvent: PropTypes.func.isRequired,
};

export default CalendarTopBar;
