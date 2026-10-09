import { useState, useEffect, useCallback } from 'react';
import * as calendarService from '../../../services/calendarService';
import { toDateKey, formatTime, combineDateAndTime } from '../utils/calendarDates';

// The calendar UI works with { id, title, date: "YYYY-MM-DD", time: "3:30 PM - 4:00 PM",
// type, color, description, location }. The API stores startTime/endTime timestamps.
export const toUiEvent = (event) => {
  const start = new Date(event.startTime);
  const end = event.endTime ? new Date(event.endTime) : null;
  return {
    id: event.id,
    title: event.title,
    date: toDateKey(start),
    time: formatTime(start) + (end ? ` - ${formatTime(end)}` : ''),
    type: event.category || 'meeting',
    color: event.color || 'blue',
    description: event.description || '',
    location: event.location || '',
  };
};

const toApiEvent = (uiEvent) => {
  const [startText, endText] = (uiEvent.time || '').split('-').map((s) => s.trim());
  const startTime = combineDateAndTime(uiEvent.date, startText || '');
  if (!startTime) {
    throw new Error('Please enter the start time like "3:30 PM".');
  }
  let endTime = null;
  if (endText) {
    endTime = combineDateAndTime(uiEvent.date, endText);
    if (!endTime) throw new Error('Please enter the end time like "4:00 PM".');
    // "11:00 PM - 1:00 AM" ends the next day
    if (endTime < startTime) endTime.setDate(endTime.getDate() + 1);
  }
  return {
    title: uiEvent.title,
    description: uiEvent.description || '',
    location: uiEvent.location || '',
    startTime: startTime.toISOString(),
    endTime: endTime ? endTime.toISOString() : null,
    category: uiEvent.type || 'meeting',
    color: uiEvent.color || 'blue',
  };
};

// range: optional { from: Date, to: Date } passed to the API
export const useCalendarEvents = (range) => {
  const from = range?.from?.getTime();
  const to = range?.to?.getTime();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    calendarService
      .getEvents({
        from: from !== undefined ? new Date(from) : undefined,
        to: to !== undefined ? new Date(to) : undefined,
      })
      .then((data) => {
        if (!cancelled) setEvents(data.map(toUiEvent));
      })
      .catch((err) => {
        if (!cancelled) setError(`Could not load events: ${err.message}`);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  // Creates when id is null, otherwise updates. Returns the saved event, or null on failure.
  const saveEvent = useCallback(async (id, uiEvent) => {
    try {
      const payload = toApiEvent(uiEvent);
      const saved = toUiEvent(id ? await calendarService.updateEvent(id, payload) : await calendarService.createEvent(payload));
      setEvents((prev) => (id ? prev.map((e) => (e.id === id ? saved : e)) : [...prev, saved]));
      setError(null);
      return saved;
    } catch (err) {
      setError(`Could not save event: ${err.message}`);
      return null;
    }
  }, []);

  const deleteEvent = useCallback(async (id) => {
    try {
      await calendarService.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setError(null);
      return true;
    } catch (err) {
      setError(`Could not delete event: ${err.message}`);
      return false;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { events, isLoading, error, clearError, saveEvent, deleteEvent };
};
