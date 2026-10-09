// Pure helpers for UI events: { id, title, date: "YYYY-MM-DD", time: "3:30 PM - 4:00 PM", color, description }.
import { toDateKey } from './calendarDates';

// Matches title, description or time text (case-insensitive). Empty query keeps all.
export const filterEvents = (events, query) => {
  if (!query) return events;
  const q = query.toLowerCase();
  return events.filter(event =>
    event.title.toLowerCase().includes(q) ||
    (event.description && event.description.toLowerCase().includes(q)) ||
    (event.time && event.time.toLowerCase().includes(q))
  );
};

export const eventsOnDate = (events, date) => {
  const key = toDateKey(date);
  return events.filter(event => event.date === key);
};

// "blue" is the stored default (there is no colour picker yet), so it is drawn in the brand tint.
const COLOR_CLASSES = {
  blue: 'bg-brand-50 text-brand-700 border-brand-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  red: 'bg-red-100 text-red-800 border-red-200'
};

export const getEventColorClass = (color) => COLOR_CLASSES[color] || 'bg-canvas text-ink border-line';

// "3:30 PM" → minutes since midnight
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let totalMinutes = (hours % 12) * 60 + (minutes || 0);
  if (period === 'PM') totalMinutes += 12 * 60; // 12 PM → 12:00 (hours % 12 already made 12 AM → 0)
  return totalMinutes;
};

// Week view: vertical position and height as % of the day.
export const getEventPosition = (event) => {
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

// "3:30 PM" → 15 (hour only)
const timeTo24Hour = (timeStr) => {
  if (!timeStr) return 0;
  const [time, period] = timeStr.split(' ');
  const [hours] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) return hours + 12;
  if (period === 'AM' && hours === 12) return 0;
  return hours;
};

// Day view: whether the event is listed in the row for `hour` (start..end inclusive).
export const occursInHour = (event, hour) => {
  if (!event.time) return false;
  if (event.time.includes('-')) {
    const [start, end] = event.time.split('-').map(t => t.trim());
    return hour >= timeTo24Hour(start) && hour <= timeTo24Hour(end);
  }
  return hour === timeTo24Hour(event.time);
};
