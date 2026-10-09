import { useState } from 'react';
import { parseDateKey, parseFormDate } from '../utils/calendarDates';

const formatFormDate = (date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

// Fields the form shows. Only title, times, date and description are saved today.
const emptyForm = (currentDate) => ({
  title: '',
  startTime: '3:30 PM',
  endTime: '4:00 PM',
  date: formatFormDate(currentDate),
  isAllDay: false,
  timeZone: 'Time zone',
  repeat: 'Repeat',
  participants: '',
  conferencing: '',
  aiNotes: '',
  location: '',
  description: '',
  visibility: 'Default visibility',
  status: 'Busy',
  reminders: '30 min before'
});

const formFromEvent = (event, currentDate) => ({
  ...emptyForm(currentDate),
  title: event.title || '',
  startTime: event.time?.split(' - ')[0] || '3:30 PM',
  endTime: event.time?.split(' - ')[1] || '4:00 PM',
  date: event.date ? formatFormDate(parseDateKey(event.date)) : formatFormDate(currentDate),
  description: event.description || '',
});

// State for the event edit panel. Resets when a different event is selected or the
// calendar date changes; otherwise a draft survives closing and reopening the panel.
export const useEventForm = (selectedEvent, currentDate) => {
  const initialForm = () => (selectedEvent ? formFromEvent(selectedEvent, currentDate) : emptyForm(currentDate));
  const [eventData, setEventData] = useState(initialForm);

  // Reset during render (not in an effect) so the panel never shows one frame of
  // the previous event's data before the new one appears.
  const [source, setSource] = useState({ selectedEvent, currentDate });
  if (source.selectedEvent !== selectedEvent || source.currentDate !== currentDate) {
    setSource({ selectedEvent, currentDate });
    setEventData(initialForm());
  }

  const setField = (field, value) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  // Validates the form. Returns { event } in the UI event shape, or { error } with a message.
  const buildEvent = () => {
    if (!eventData.title.trim()) {
      return { error: 'Event title is required' };
    }
    const date = parseFormDate(eventData.date, currentDate);
    if (!date) {
      return { error: 'Invalid date format. Please use a valid date (e.g., Sun Aug 24).' };
    }
    return {
      event: {
        title: eventData.title,
        time: eventData.startTime + (eventData.endTime ? ` - ${eventData.endTime}` : ''),
        date,
        description: eventData.description,
        type: selectedEvent?.type || 'meeting',
        color: selectedEvent?.color || 'blue'
      }
    };
  };

  return { eventData, setField, buildEvent };
};
