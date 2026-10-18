import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CalendarTopBar from './components/CalendarTopBar';
import CalendarMiniMonth from './components/CalendarMiniMonth';
import EventEditPanel from './components/EventEditPanel';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';
import DayView from './components/DayView';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { useEventForm } from './hooks/useEventForm';
import { useIsMobile } from './hooks/useIsMobile';
import { filterEvents } from './utils/calendarEvents';

// Calendar page: navigation (one current date drives every view), search, and the
// create / edit / delete flow. Views and panels live in ./components.
const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const isMobile = useIsMobile();
  const { events: allEvents, error, clearError, saveEvent, deleteEvent } = useCalendarEvents();
  const eventForm = useEventForm(selectedEvent, currentDate);

  const events = filterEvents(allEvents, searchQuery);

  const closeForm = () => {
    setIsEditMode(false);
    setSelectedEvent(null);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsEditMode(true);
  };

  const handleNewEvent = () => {
    setSelectedEvent(null);
    setIsEditMode(true);
  };

  // Home's "Add event" links here with { newEvent: true }: open the new-event form once.
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (location.state?.newEvent) {
      setSelectedEvent(null);
      setIsEditMode(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  const handleSaveEvent = async () => {
    const { event, error: formError } = eventForm.buildEvent();
    if (formError) {
      alert(formError);
      return;
    }
    const saved = await saveEvent(selectedEvent ? selectedEvent.id : null, event);
    if (!saved) return; // keep the form open so the user can fix and retry
    closeForm();
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent || !window.confirm(`Delete "${selectedEvent.title}"?`)) return;
    if (await deleteEvent(selectedEvent.id)) closeForm();
  };

  const openDay = (date) => {
    setCurrentDate(date);
    setViewMode('day');
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <CalendarTopBar
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNewEvent={handleNewEvent}
      />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="hidden w-72 shrink-0 border-r border-line bg-[#FFFAF9] md:block">
          <CalendarMiniMonth currentDate={currentDate} setCurrentDate={setCurrentDate} />
        </aside>

        <div className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
          {error && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700" role="alert">
              <span>{error}</span>
              <button onClick={clearError} className="rounded-md p-1 text-brand-500 hover:bg-brand-100" aria-label="Dismiss">✕</button>
            </div>
          )}
          {viewMode === 'month' && (
            <MonthView currentDate={currentDate} events={events} isMobile={isMobile} onSelectDate={setCurrentDate} onEventClick={handleEventClick} />
          )}
          {viewMode === 'week' && (
            <WeekView currentDate={currentDate} events={events} isMobile={isMobile} onOpenDay={openDay} onEventClick={handleEventClick} />
          )}
          {viewMode === 'day' && (
            <DayView date={currentDate} events={events} isMobile={isMobile} onEventClick={handleEventClick} />
          )}
        </div>

        {isEditMode && (
          <aside className="order-first shrink-0 border-b border-line md:order-none md:border-b-0 md:border-l">
            <EventEditPanel
              eventData={eventForm.eventData}
              onFieldChange={eventForm.setField}
              isNew={!selectedEvent}
              onSave={handleSaveEvent}
              onBack={closeForm}
              onDelete={handleDeleteEvent}
            />
          </aside>
        )}
      </div>
    </div>
  );
};

export default Calendar;
