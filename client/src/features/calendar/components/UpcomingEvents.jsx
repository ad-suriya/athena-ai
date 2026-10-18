import { Calendar, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCalendarEvents } from '../hooks/useCalendarEvents';

const UPCOMING_DAYS = 3;

// [start of today, start of today + UPCOMING_DAYS), local time
const upcomingRange = () => {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + UPCOMING_DAYS);
  return { from, to };
};

const UpcomingEvents = () => {
  const { events } = useCalendarEvents(upcomingRange());
  const navigate = useNavigate();

  // Opens the calendar's new-event form (same as Home's "Add event").
  const handleNewEventClick = () => navigate('/calendar', { state: { newEvent: true } });

  const newEventButton = (
    <button
      onClick={handleNewEventClick}
      className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-100"
    >
      <Plus className="h-4 w-4" />
      New event
    </button>
  );

  return (
    <section className="mx-auto max-w-2xl rounded-card border border-line bg-white p-5 text-left shadow-card sm:p-6">
      <h2 className="mb-4 flex items-center gap-3 text-[17px] font-semibold text-ink">
        <Calendar className="h-6 w-6 text-brand-500" strokeWidth={1.9} />
        Upcoming events
      </h2>

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <p className="text-sm text-ink-muted">No upcoming events in the next 3 days</p>
          {newEventButton}
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3">
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-medium text-ink">{event.title}</h3>
                <p className="text-sm text-ink-muted">{event.date} at {event.time}</p>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                <Calendar className="h-4 w-4 text-brand-500" />
              </span>
            </div>
          ))}
          <div className="pt-1">{newEventButton}</div>
        </div>
      )}
    </section>
  );
};

export default UpcomingEvents;