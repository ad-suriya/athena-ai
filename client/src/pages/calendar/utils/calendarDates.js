// Date helpers for the calendar UI. All day keys are in the user's local timezone —
// toISOString() would shift dates by a day for anyone not on UTC.

const pad = (n) => String(n).padStart(2, '0');

// Date → "YYYY-MM-DD" (local)
export const toDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// "YYYY-MM-DD" → Date at local midnight
export const parseDateKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// Form date text such as "Thu, Oct 9" → "YYYY-MM-DD", or null if unparseable.
// Text without a year uses the year of `referenceDate` (JS would otherwise pick 2001).
export const parseFormDate = (text, referenceDate) => {
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;
  if (!/\b\d{4}\b/.test(text)) parsed.setFullYear(referenceDate.getFullYear());
  return toDateKey(parsed);
};

// "3:30 PM", "3:30pm", "3 PM", "15:30" → { hours, minutes } or null
const parseTime = (text) => {
  const match = text.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([AaPp][Mm])?$/);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const period = match[3]?.toUpperCase();
  if (minutes > 59) return null;
  if (period) {
    if (hours < 1 || hours > 12) return null;
    hours = (hours % 12) + (period === 'PM' ? 12 : 0);
  } else if (hours > 23) {
    return null;
  }
  return { hours, minutes };
};

// Date → "3:30 PM" — the format Calendar.jsx parses for positioning.
export const formatTime = (date) => {
  const hours = date.getHours();
  return `${hours % 12 || 12}:${pad(date.getMinutes())} ${hours < 12 ? 'AM' : 'PM'}`;
};

// ("YYYY-MM-DD", "3:30 PM") → local Date, or null
export const combineDateAndTime = (dateKey, timeText) => {
  const time = parseTime(timeText);
  if (!time) return null;
  const date = parseDateKey(dateKey);
  date.setHours(time.hours, time.minutes, 0, 0);
  return date;
};
