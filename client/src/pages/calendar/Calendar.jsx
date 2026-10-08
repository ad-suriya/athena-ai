import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import CalendarTopBar from './CalendarTopBar';
import CalendarSidebar from './CalendarSidebar';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { toDateKey } from './utils/calendarDates';

const Calendar = () => {
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { events: allEvents, error, clearError, saveEvent } = useCalendarEvents();

  // Helper function
  const formatDate = (date) => {
    return toDateKey(date);
  };

  // Responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter events based on search query
  const filteredEvents = allEvents.filter(event => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) ||
      (event.description && event.description.toLowerCase().includes(query)) ||
      (event.time && event.time.toLowerCase().includes(query))
    );
  });

  // Handle event selection for editing
  const handleEventClick = (event) => {
    console.log('Event clicked:', event);
    setSelectedEvent(event);
    setIsEditMode(true);
  };

  // Handle edit button click from left sidebar - ADD THIS FUNCTION
  const handleEditClick = () => {
    console.log('Edit button clicked from left sidebar');
    setSelectedEvent(null); // Clear selected event for new event
    setIsEditMode(true); // Switch to edit mode
  };

  // Handle saving edited event
  const handleSaveEvent = async (updatedEvent) => {
    const saved = await saveEvent(selectedEvent ? selectedEvent.id : null, updatedEvent);
    if (!saved) return; // keep the form open so the user can fix and retry
    setIsEditMode(false);
    setSelectedEvent(null);
  };

  // Helper functions
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getColorClass = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEventsForDate = (date) => {
    const dateStr = formatDate(date);
    return filteredEvents.filter(event => event.date === dateStr);
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        date: prevMonthDays - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonthDays - i)
      });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: day,
        isCurrentMonth: true,
        fullDate: new Date(year, month, day)
      });
    }
    const daysToAdd = 42 - days.length;
    for (let day = 1; day <= daysToAdd; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, day)
      });
    }

    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {daysOfWeek.map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day.fullDate);
            const isToday = formatDate(day.fullDate) === formatDate(new Date());
            return (
              <div
                key={index}
                onClick={() => day.isCurrentMonth && setSelectedDate(day.fullDate)}
                className="min-h-24 p-2 border-r border-b cursor-pointer border-gray-200 hover:bg-gray-50"
              >
                <div className={`text-sm font-medium mb-1 ${!day.isCurrentMonth ? 'text-gray-400' : isToday ? 'text-blue-600 bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-900'}`}>
                  {day.date}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, isMobile ? 1 : 2).map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                      className={`text-xs px-2 py-1 rounded border truncate ${getColorClass(event.color)}`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {!isMobile && <div className="text-xs opacity-75">{event.time.split(' - ')[0]}</div>}
                    </div>
                  ))}
                  {dayEvents.length > (isMobile ? 1 : 2) && (
                    <div className="text-xs px-2 text-gray-500">
                      +{dayEvents.length - (isMobile ? 1 : 2)} more
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

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const timeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let totalMinutes = (hours % 12) * 60 + (minutes || 0);
      if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
      return totalMinutes;
    };

    const getEventPosition = (event) => {
      if (!event.time) return { top: 0, height: 60 };
      if (event.time.includes('-')) {
        const [start, end] = event.time.split('-').map(s => s.trim());
        const startMinutes = timeToMinutes(start);
        const endMinutes = timeToMinutes(end);
        return {
          top: (startMinutes / 1440) * 100,
          height: ((endMinutes - startMinutes) / 1440) * 100
        };
      }
      const minutes = timeToMinutes(event.time);
      return {
        top: (minutes / 1440) * 100,
        height: 4
      };
    };

    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isMobile ? (
              <>
                {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </>
            ) : (
              `Week of ${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            )}
          </h2>
        </div>
        {isMobile ? (
          <div className="p-2">
            <div className="flex overflow-x-auto pb-2">
              {weekDates.map((date, index) => {
                const dayEvents = getEventsForDate(date);
                const isToday = formatDate(date) === formatDate(new Date());
                return (
                  <div
                    key={index}
                    className={`flex-shrink-0 w-16 border rounded-lg p-2 mx-1 ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => {
                      setSelectedDate(date);
                      setViewMode('day');
                    }}
                  >
                    <div className="text-xs text-center text-gray-500">{daysOfWeek[index]}</div>
                    <div className={`text-center text-sm font-medium my-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {date.getDate()}
                    </div>
                    {dayEvents.length > 0 && (
                      <div className="text-xs text-center text-blue-600">
                        {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 space-y-2">
              {weekDates.map((date, index) => {
                const dayEvents = getEventsForDate(date);
                if (dayEvents.length === 0) return null;
                return (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="font-medium text-gray-900">
                      {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="mt-2 space-y-2">
                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className={`p-2 rounded border-l-4 ${getColorClass(event.color)}`}
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
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-max">
              <div className="grid grid-cols-8 border-b border-gray-200">
                <div className="p-2"></div>
                {weekDates.map((date, index) => {
                  const isToday = formatDate(date) === formatDate(new Date());
                  return (
                    <div key={index} className={`p-2 text-center ${isToday ? 'border-b-2 border-blue-500' : ''}`}>
                      <div className="text-xs text-gray-500">{daysOfWeek[index]}</div>
                      <div className={`mx-auto w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${isToday ? 'bg-blue-600 text-white' : 'text-gray-900'}`}>
                        {date.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-8">
                <div className="border-r border-gray-200">
                  {hours.map(hour => (
                    <div key={hour} className="h-16 flex items-start justify-end pr-2 text-xs text-gray-500">
                      {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                    </div>
                  ))}
                </div>
                {weekDates.map((date, dayIndex) => {
                  const dayEvents = getEventsForDate(date);
                  return (
                    <div key={dayIndex} className="relative border-r border-gray-200">
                      {hours.map(hour => (
                        <div
                          key={hour}
                          className="h-16 border-b border-gray-100"
                        ></div>
                      ))}
                      {dayEvents.map(event => {
                        const { top, height } = getEventPosition(event);
                        return (
                          <div
                            key={event.id}
                            onClick={() => handleEventClick(event)}
                            className={`absolute left-0 right-0 mx-1 p-1 rounded text-xs cursor-pointer ${getColorClass(event.color)}`}
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
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(selectedDate || currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const timeTo24Hour = (timeStr) => {
      if (!timeStr) return 0;
      const [time, period] = timeStr.split(' ');
      const [hours] = time.split(':').map(Number);
      if (period === 'PM' && hours !== 12) return hours + 12;
      if (period === 'AM' && hours === 12) return 0;
      return hours;
    };

    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {(selectedDate || currentDate).toLocaleDateString('en-US', {
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
                <div className="text-center py-8 text-gray-500">
                  No events scheduled for today
                </div>
              ) : (
                dayEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className={`p-3 rounded-lg border-l-4 cursor-pointer ${getColorClass(event.color)}`}
                  >
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className="text-sm mt-1 text-gray-600">{event.time}</div>
                    {event.description && (
                      <div className="text-xs mt-2 text-gray-600">{event.description}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {hours.map(hour => {
                const hourEvents = dayEvents.filter(event => {
                  if (!event.time) return false;
                  if (event.time.includes('-')) {
                    const [start, end] = event.time.split('-').map(t => t.trim());
                    const startHour = timeTo24Hour(start);
                    const endHour = timeTo24Hour(end);
                    return hour >= startHour && hour <= endHour;
                  }
                  const eventHour = timeTo24Hour(event.time);
                  return hour === eventHour;
                });
                return (
                  <div key={hour} className="flex">
                    <div className="w-16 text-sm pt-1 text-gray-500">
                      {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                    </div>
                    <div className="flex-1 border-t pt-2 border-gray-100">
                      {hourEvents.map(event => (
                        <div
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className={`mb-2 p-3 rounded-lg border-l-4 cursor-pointer ${getColorClass(event.color)}`}
                        >
                          <div className="font-medium text-sm">{event.title}</div>
                          <div className="text-sm mt-1 text-gray-600">{event.time}</div>
                          {event.description && (
                            <div className="text-xs mt-2 text-gray-600">{event.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CalendarTopBar
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      />
      <div className="flex">
        <CalendarSidebar
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          allEvents={allEvents}
          onEditClick={handleEditClick} // ADD THIS PROP
        />
        <div className="flex-1 p-4 md:p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={clearError} className="text-red-500 hover:text-red-700" title="Dismiss">✕</button>
            </div>
          )}
          {isMobile && (
            <div className="mb-4">
              <div className="flex space-x-1 p-1 rounded-lg bg-gray-100">
                {['month', 'week', 'day'].map((viewType) => (
                  <button
                    key={viewType}
                    onClick={() => setViewMode(viewType)}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md capitalize transition-colors ${
                      viewMode === viewType
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {viewType}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-6">
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && renderDayView()}
          </div>
        </div>
        <div className="flex-none">
          <CalendarSidebar
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            allEvents={allEvents}
            isRightSidebar={true}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            selectedEvent={selectedEvent}
            onSaveEvent={handleSaveEvent}
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;