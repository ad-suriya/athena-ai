'use strict';

// "Today snapshot": a short summary of the user's tasks, calendar and journal that
// the agent reads before replying, so Athena knows the user's day without being
// asked. Built fresh for every message, so it reflects changes made a moment ago.

const taskService = require('../services/task.service');
const calendarService = require('../services/calendar.service');
const noteService = require('../services/note.service');

const MAX_ITEMS = 8;
const OPEN = new Set(['todo', 'in_progress']);
const DAY_MS = 86400000;

// Minutes ahead of UTC in timeZone at `date` (330 for Asia/Kolkata).
const offsetMinutes = (timeZone, date) => {
  const name = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(date).find((p) => p.type === 'timeZoneName')?.value || '';
  const m = name.match(/([+-])(\d{2}):(\d{2})/);
  return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
};

// Midnight at the start of the user's current day, as a Date.
const startOfLocalDay = (timeZone, now) => {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(now).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d) - offsetMinutes(timeZone, now) * 60000);
};

const clip = (text = '', max = 80) => (text.length > max ? `${text.slice(0, max)}…` : text);
const more = (items) => (items.length > MAX_ITEMS ? [`- …and ${items.length - MAX_ITEMS} more`] : []);

// userId's data → text for the system instruction ('' when there is nothing useful).
// Parts that fail to load are left out; the snapshot never blocks a reply.
const buildSnapshot = async (userId, timeZone = 'UTC', now = new Date()) => {
  const tz = timeZone || 'UTC';
  const today = startOfLocalDay(tz, now);
  const tomorrow = new Date(today.getTime() + DAY_MS);
  const dayAfter = new Date(today.getTime() + 2 * DAY_MS);

  const day = (iso) => {
    const date = new Date(iso);
    if (date >= today && date < tomorrow) return 'today';
    if (date >= tomorrow && date < dayAfter) return 'tomorrow';
    return date.toLocaleDateString('en-GB', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short' });
  };
  const time = (iso) => new Date(iso).toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit' });

  const [tasks, events, notes] = await Promise.allSettled([
    taskService.getTasks(userId),
    calendarService.getEvents(userId, { from: today, to: dayAfter }),
    noteService.getNotes(userId),
  ]);
  const lines = [];

  if (tasks.status === 'fulfilled') {
    const open = tasks.value.filter((t) => OPEN.has(t.status));
    const taskLine = (t) => `- “${clip(t.title)}”${t.priority ? ` (${t.priority})` : ''}, due ${day(t.dueDate)} [id ${t.id}]`;
    const overdue = open.filter((t) => t.dueDate && new Date(t.dueDate) < now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const dueSoon = open.filter((t) => t.dueDate && new Date(t.dueDate) >= now && new Date(t.dueDate) < dayAfter)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    lines.push(`Tasks: ${open.length} open, ${overdue.length} overdue.`);
    if (overdue.length) lines.push('Overdue:', ...overdue.slice(0, MAX_ITEMS).map(taskLine), ...more(overdue));
    if (dueSoon.length) lines.push('Due today or tomorrow:', ...dueSoon.slice(0, MAX_ITEMS).map(taskLine), ...more(dueSoon));
  }

  if (events.status === 'fulfilled') {
    const list = events.value;
    if (!list.length) lines.push('Calendar: nothing today or tomorrow.');
    else {
      const eventLine = (e) => `- ${day(e.startTime)} ${time(e.startTime)}${e.endTime ? `–${time(e.endTime)}` : ''} “${clip(e.title)}”${e.location ? ` at ${clip(e.location, 40)}` : ''} [id ${e.id}]`;
      lines.push(`Calendar, today and tomorrow (${list.length} events):`, ...list.slice(0, MAX_ITEMS).map(eventLine), ...more(list));
    }
  }

  if (notes.status === 'fulfilled' && notes.value.length) {
    const when = (n) => new Date(n.updatedAt || n.createdAt || 0);
    const latest = notes.value.reduce((a, b) => (when(b) > when(a) ? b : a));
    lines.push(`Latest journal entry: “${clip(latest.title || 'Untitled')}”, last written ${day(when(latest).toISOString())} [id ${latest.id}].`);
  }

  [tasks, events, notes].filter((r) => r.status === 'rejected')
    .forEach((r) => console.error('Snapshot part failed to load:', r.reason));

  if (!lines.length) return '';
  return [
    'Snapshot of the user\'s Athena data, loaded just now. Use it when it helps — for example when the user feels busy, stressed or overwhelmed, or asks about their day or what to do next. Then be specific: name the one or two items that matter most (say, the overdue high-priority task, or a packed day tomorrow), connect them to how the user feels, and offer one concrete step you can take with your tools, such as moving a deadline or blocking time. Acknowledge feelings first; never list everything. Do not mention the snapshot on greetings or unrelated topics. Ids shown are real and can be used directly with your tools.',
    ...lines,
  ].join('\n');
};

module.exports = { buildSnapshot, startOfLocalDay };
