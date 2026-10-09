import PropTypes from 'prop-types';
import { buildMonthGrid, DAYS_OF_WEEK, isToday } from '../utils/calendarDates';
import { eventsOnDate, getEventColorClass } from '../utils/calendarEvents';
import { eventShape } from './calendarPropTypes';

// Month grid. Shows up to 2 events per day (1 on mobile) and "+N more".
const MonthView = ({ currentDate, events, isMobile, onSelectDate, onEventClick }) => {
  const visibleCount = isMobile ? 1 : 2;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="grid grid-cols-7 border-b border-gray-200">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {buildMonthGrid(currentDate).map((day, index) => {
          const dayEvents = eventsOnDate(events, day.fullDate);
          const today = isToday(day.fullDate);
          return (
            <div
              key={index}
              onClick={() => day.isCurrentMonth && onSelectDate(day.fullDate)}
              className="min-h-24 p-2 border-r border-b cursor-pointer border-gray-200 hover:bg-gray-50"
            >
              <div className={`text-sm font-medium mb-1 ${!day.isCurrentMonth ? 'text-gray-400' : today ? 'text-blue-600 bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-900'}`}>
                {day.day}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, visibleCount).map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={`text-xs px-2 py-1 rounded border truncate ${getEventColorClass(event.color)}`}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    {!isMobile && <div className="text-xs opacity-75">{event.time.split(' - ')[0]}</div>}
                  </div>
                ))}
                {dayEvents.length > visibleCount && (
                  <div className="text-xs px-2 text-gray-500">
                    +{dayEvents.length - visibleCount} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

MonthView.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  events: PropTypes.arrayOf(eventShape).isRequired,
  isMobile: PropTypes.bool.isRequired,
  onSelectDate: PropTypes.func.isRequired,
  onEventClick: PropTypes.func.isRequired,
};

export default MonthView;
