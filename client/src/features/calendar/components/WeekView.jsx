import PropTypes from 'prop-types';
import { DAYS_OF_WEEK, formatHourLabel, getWeekDates, HOURS, isToday } from '../utils/calendarDates';
import { eventsOnDate, getEventColorClass, getEventPosition } from '../utils/calendarEvents';
import { eventShape } from './calendarPropTypes';

const shortDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// Mobile: day strip (tap opens Day view) plus per-day event lists.
const MobileWeek = ({ weekDates, events, onOpenDay, onEventClick }) => (
  <div className="p-2">
    <div className="flex overflow-x-auto pb-2">
      {weekDates.map((date, index) => {
        const dayEvents = eventsOnDate(events, date);
        const today = isToday(date);
        return (
          <div
            key={index}
            className={`w-16 flex-shrink-0 cursor-pointer rounded-xl border p-2 mx-1 ${today ? 'border-brand-300 bg-brand-50' : 'border-line'}`}
            onClick={() => onOpenDay(date)}
          >
            <div className="text-xs text-center text-ink-muted">{DAYS_OF_WEEK[index]}</div>
            <div className={`text-center text-sm font-medium my-1 ${today ? 'text-brand-600' : 'text-ink'}`}>
              {date.getDate()}
            </div>
            {dayEvents.length > 0 && (
              <div className="text-xs text-center text-brand-600">
                {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        );
      })}
    </div>
    <div className="mt-4 space-y-2">
      {weekDates.map((date, index) => {
        const dayEvents = eventsOnDate(events, date);
        if (dayEvents.length === 0) return null;
        return (
          <div key={index} className="rounded-xl border border-line p-3">
            <div className="font-medium text-ink">
              {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
            <div className="mt-2 space-y-2">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className={`p-2 rounded border-l-4 ${getEventColorClass(event.color)}`}
                >
                  <div className="font-medium text-sm">{event.title}</div>
                  <div className="text-xs">{event.time}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

MobileWeek.propTypes = {
  weekDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
  events: PropTypes.arrayOf(eventShape).isRequired,
  onOpenDay: PropTypes.func.isRequired,
  onEventClick: PropTypes.func.isRequired,
};

// Desktop: hour grid with events positioned by start/end time.
const DesktopWeek = ({ weekDates, events, onEventClick }) => (
  <div className="overflow-x-auto">
    <div className="min-w-max">
      <div className="grid grid-cols-8 border-b border-line">
        <div className="p-2"></div>
        {weekDates.map((date, index) => {
          const today = isToday(date);
          return (
            <div key={index} className={`p-2 text-center ${today ? 'border-b-2 border-brand-500' : ''}`}>
              <div className="text-xs text-ink-muted">{DAYS_OF_WEEK[index]}</div>
              <div className={`mx-auto w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${today ? 'bg-brand-500 text-white' : 'text-ink'}`}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-8">
        <div className="border-r border-line">
          {HOURS.map(hour => (
            <div key={hour} className="h-16 flex items-start justify-end pr-2 text-xs text-ink-muted">
              {formatHourLabel(hour)}
            </div>
          ))}
        </div>
        {weekDates.map((date, dayIndex) => (
          <div key={dayIndex} className="relative border-r border-line">
            {HOURS.map(hour => (
              <div
                key={hour}
                className="h-16 border-b border-line/60"
              ></div>
            ))}
            {eventsOnDate(events, date).map(event => {
              const { top, height } = getEventPosition(event);
              return (
                <div
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className={`absolute left-0 right-0 mx-1 p-1 rounded text-xs cursor-pointer ${getEventColorClass(event.color)}`}
                  style={{
                    top: `${top}%`,
                    height: `${height}%`,
                    zIndex: 10
                  }}
                >
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="text-xs opacity-75 truncate">{event.time}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  </div>
);

DesktopWeek.propTypes = {
  weekDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
  events: PropTypes.arrayOf(eventShape).isRequired,
  onEventClick: PropTypes.func.isRequired,
};

// Week containing currentDate (Sunday–Saturday).
const WeekView = ({ currentDate, events, isMobile, onOpenDay, onEventClick }) => {
  const weekDates = getWeekDates(currentDate);

  return (
    <div className="rounded-card border border-line bg-white shadow-card">
      <div className="p-4 border-b border-line">
        <h2 className="text-lg font-semibold text-ink">
          {`${isMobile ? '' : 'Week of '}${shortDate(weekDates[0])} – ${shortDate(weekDates[6])}`}
        </h2>
      </div>
      {isMobile ? (
        <MobileWeek weekDates={weekDates} events={events} onOpenDay={onOpenDay} onEventClick={onEventClick} />
      ) : (
        <DesktopWeek weekDates={weekDates} events={events} onEventClick={onEventClick} />
      )}
    </div>
  );
};

WeekView.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  events: PropTypes.arrayOf(eventShape).isRequired,
  isMobile: PropTypes.bool.isRequired,
  onOpenDay: PropTypes.func.isRequired,
  onEventClick: PropTypes.func.isRequired,
};

export default WeekView;
