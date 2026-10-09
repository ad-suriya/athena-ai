import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildMonthGrid, isToday, MONTH_NAMES, toDateKey } from '../utils/calendarDates';

const MINI_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Small month navigator. Picking a day moves the calendar to it.
const CalendarMiniMonth = ({ currentDate, setCurrentDate }) => {
  const selectedKey = toDateKey(currentDate);
  const shiftMonth = (direction) => setCurrentDate((prev) => {
    const next = new Date(prev);
    next.setMonth(prev.getMonth() + direction);
    return next;
  });

  return (
    <div className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => shiftMonth(-1)} className="rounded-lg p-1.5 text-ink-muted hover:bg-brand-50 hover:text-brand-500" aria-label="Previous month">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="text-sm font-semibold text-ink" aria-live="polite">
          {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button onClick={() => shiftMonth(1)} className="rounded-lg p-1.5 text-ink-muted hover:bg-brand-50 hover:text-brand-500" aria-label="Next month">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {MINI_DAYS.map((d) => (
          <div key={d} className="py-1 text-[11px] font-medium text-ink-faint">{d}</div>
        ))}
        {buildMonthGrid(currentDate).map((cell, i) => {
          const key = toDateKey(cell.fullDate);
          const selected = key === selectedKey;
          const today = isToday(cell.fullDate);
          return (
            <button
              key={i}
              onClick={() => setCurrentDate(cell.fullDate)}
              aria-label={cell.fullDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              aria-current={selected ? 'date' : undefined}
              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[13px] tabular-nums transition-colors ${
                selected ? 'bg-brand-500 font-semibold text-white'
                  : today ? 'font-semibold text-brand-600 hover:bg-brand-50'
                  : cell.isCurrentMonth ? 'text-ink hover:bg-brand-50' : 'text-ink-faint/60 hover:bg-brand-50'
              }`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

CalendarMiniMonth.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  setCurrentDate: PropTypes.func.isRequired,
};

export default CalendarMiniMonth;
