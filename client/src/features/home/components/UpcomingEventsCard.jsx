import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { CalendarDays, Plus } from 'lucide-react';
import HomeCard from './HomeCard';
import { dayLabel, formatClock, isSameDay } from '../utils/homeUtils';

const DOT = { blue: 'bg-[#3B82D6]', purple: 'bg-[#8B5CF6]', green: 'bg-[#22A06B]', orange: 'bg-[#F08A24]', red: 'bg-brand-500' };

// Date badge for the first upcoming event and a short timeline of the next events.
const UpcomingEventsCard = ({ events, isLoading, error }) => {
  const first = events[0] ? new Date(events[0].startTime) : null;
  return (
    <HomeCard icon={CalendarDays} title="Upcoming Events" action={{ label: 'View calendar', to: '/calendar' }}>
      {error ? (
        <p className="text-sm text-brand-600">Couldn&apos;t load events. {error}</p>
      ) : isLoading ? (
        <p className="text-sm text-ink-faint">Loading events…</p>
      ) : events.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink-muted">Nothing scheduled for the next 7 days.</p>
      ) : (
        <div className="flex gap-5">
          <div className="flex h-[92px] w-[68px] shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-50">
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-500">{first.toLocaleDateString('en-US', { month: 'short' })}</span>
            <span className="text-[28px] font-bold leading-tight text-ink">{first.getDate()}</span>
            <span className="text-xs text-ink-muted">{first.toLocaleDateString('en-US', { weekday: 'short' })}</span>
          </div>
          <ol className="relative min-w-0 flex-1 space-y-3 border-l border-line pl-5">
            {events.map((e) => {
              const start = new Date(e.startTime);
              const end = e.endTime ? new Date(e.endTime) : null;
              const prefix = isSameDay(start, first) ? '' : `${dayLabel(start)}, `;
              return (
                <li key={e.id} className="relative">
                  <span className={`absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${DOT[e.color] || DOT.blue}`} />
                  <p className="truncate text-[15px] font-medium text-ink">{e.title}</p>
                  <p className="text-sm tabular-nums text-ink-muted">{prefix}{formatClock(start)}{end ? ` – ${formatClock(end)}` : ''}</p>
                </li>
              );
            })}
          </ol>
        </div>
      )}
      <div className="mt-auto pt-4">
        <Link to="/calendar" state={{ newEvent: true }}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-50 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-100">
          <Plus className="h-4 w-4" /> Add event
        </Link>
      </div>
    </HomeCard>
  );
};

UpcomingEventsCard.propTypes = {
  events: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string,
    color: PropTypes.string,
  })).isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
};

export default UpcomingEventsCard;
