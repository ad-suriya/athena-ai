import { useState } from 'react';
import CalendarTopBar from './components/CalendarTopBar';
import CalendarMiniMonth from './components/CalendarMiniMonth';
import CalendarInfoPanel from './components/CalendarInfoPanel';
import EventEditPanel from './components/EventEditPanel';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';
import DayView from './components/DayView';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { useEventForm } from './hooks/useEventForm';
import { useIsMobile } from './hooks/useIsMobile';
import { filterEvents } from './utils/calendarEvents';

const VIEW_MODES = ['month', 'week', 'day'];

// Calendar page: navigation state, search, and the create/edit flow.
// Views and side panels live in ./components; event data in useCalendarEvents.
const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const isMobile = useIsMobile();
  const { events: allEvents, error, clearError, saveEvent } = useCalendarEvents();
  const eventForm = useEventForm(selectedEvent, currentDate);

  const events = filterEvents(allEvents, searchQuery);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsEditMode(true);
  };

  // "Scheduling" edit button: start a new event.
  const handleNewEvent = () => {
    setSelectedEvent(null);
    setIsEditMode(true);
  };

  const handleSaveEvent = async () => {
    const { event, error: formError } = eventForm.buildEvent();
    if (formError) {
      alert(formError);
      return;
    }
    const saved = await saveEvent(selectedEvent ? selectedEvent.id : null, event);
    if (!saved) return; // keep the form open so the user can fix and retry
    setIsEditMode(false);
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CalendarTopBar
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      />
      <div className="flex flex-col md:flex-row">
        <CalendarMiniMonth
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          onEditClick={handleNewEvent}
        />
        <div className="flex-1 min-w-0 p-4 md:p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={clearError} className="text-red-500 hover:text-red-700" title="Dismiss">✕</button>
            </div>
          )}
          {isMobile && (
            <div className="mb-4">
              <div className="flex space-x-1 p-1 rounded-lg bg-gray-100">
                {VIEW_MODES.map((viewType) => (
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
            {viewMode === 'month' && (
              <MonthView
                currentDate={currentDate}
                events={events}
                isMobile={isMobile}
                onSelectDate={setSelectedDate}
                onEventClick={handleEventClick}
              />
            )}
            {viewMode === 'week' && (
              <WeekView
                currentDate={currentDate}
                events={events}
                isMobile={isMobile}
                onOpenDay={(date) => {
                  setSelectedDate(date);
                  setViewMode('day');
                }}
                onEventClick={handleEventClick}
              />
            )}
            {viewMode === 'day' && (
              <DayView
                date={selectedDate || currentDate}
                events={events}
                isMobile={isMobile}
                onEventClick={handleEventClick}
              />
            )}
          </div>
        </div>
        <div className={`flex-none ${isEditMode ? 'order-first md:order-none' : ''}`}>
          {isEditMode ? (
            <EventEditPanel
              eventData={eventForm.eventData}
              onFieldChange={eventForm.setField}
              isNew={!selectedEvent}
              onSave={handleSaveEvent}
              onBack={() => setIsEditMode(false)}
            />
          ) : (
            <CalendarInfoPanel searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
