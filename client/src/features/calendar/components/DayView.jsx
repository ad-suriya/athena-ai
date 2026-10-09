import PropTypes from 'prop-types';
import { formatHourLabel, HOURS } from '../utils/calendarDates';
import { eventsOnDate, getEventColorClass, occursInHour } from '../utils/calendarEvents';
import { eventShape } from './calendarPropTypes';

const EventCard = ({ event, className, onClick }) => (
  <div
    onClick={() => onClick(event)}
    className={`${className} rounded-lg border-l-4 cursor-pointer ${getEventColorClass(event.color)}`}
  >
    <div className="font-medium text-sm">{event.title}</div>
    <div className="text-sm mt-1 text-ink-muted">{event.time}</div>
    {event.description && (
      <div className="text-xs mt-2 text-ink-muted">{event.description}</div>
    )}
  </div>
);

EventCard.propTypes = {
  event: eventShape.isRequired,
  className: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

// One day: a list on mobile, hourly rows on desktop (multi-hour events repeat per hour).
const DayView = ({ date, events, isMobile, onEventClick }) => {
  const dayEvents = eventsOnDate(events, date);

  return (
    <div className="rounded-card border border-line bg-white shadow-card">
      <div className="p-4 border-b border-line">
        <h2 className="text-lg font-semibold text-ink">
          {date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </h2>
      </div>
      <div className="p-4">
        {isMobile ? (
          <div className="space-y-4">
            {dayEvents.length === 0 ? (
              <div className="text-center py-8 text-ink-muted">
                Nothing scheduled for this day
              </div>
            ) : (
              dayEvents.map(event => (
                <EventCard key={event.id} event={event} className="p-3" onClick={onEventClick} />
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {HOURS.map(hour => (
              <div key={hour} className="flex">
                <div className="w-16 text-sm pt-1 text-ink-muted">
                  {formatHourLabel(hour)}
                </div>
                <div className="flex-1 border-t pt-2 border-line/60">
                  {dayEvents.filter(event => occursInHour(event, hour)).map(event => (
                    <EventCard key={event.id} event={event} className="mb-2 p-3" onClick={onEventClick} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

DayView.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  events: PropTypes.arrayOf(eventShape).isRequired,
  isMobile: PropTypes.bool.isRequired,
  onEventClick: PropTypes.func.isRequired,
};

export default DayView;
