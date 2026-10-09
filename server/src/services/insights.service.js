'use strict';

const { listOwnedDocs } = require('../utils/firestore');

// Activity counted per local day. Each kind is what the user actually did that day.
const KINDS = ['messages', 'tasksCompleted', 'tasksAdded', 'journal', 'moodCheckIns', 'events'];

// Firestore Timestamp → Date (or null).
const dateOf = (value) => (value && typeof value.toDate === 'function' ? value.toDate() : null);

// "YYYY-MM-DD" in the user's timezone. tzOffset is Date#getTimezoneOffset() (minutes, UTC − local).
const localDay = (date, tzOffset) => new Date(date.getTime() - tzOffset * 60000).toISOString().slice(0, 10);

// One month of activity for the user's own data.
// → { month, days: { 'YYYY-MM-DD': { messages, ..., total } }, totals, activeDays, longestStreak }
const getMonthActivity = async (userId, { year, month, tzOffset = 0 }) => {
  // The month's bounds in UTC, widened by the offset so every local day is covered.
  const from = new Date(Date.UTC(year, month - 1, 1) + tzOffset * 60000);
  const to = new Date(Date.UTC(year, month, 1) + tzOffset * 60000);
  const prefix = `${year}-${String(month).padStart(2, '0')}`;

  const days = {};
  const add = (date, kind) => {
    if (!date || date < from || date >= to) return;
    const key = localDay(date, tzOffset);
    if (!key.startsWith(prefix)) return;
    days[key] = days[key] || Object.fromEntries([...KINDS, 'total'].map((k) => [k, 0]));
    days[key][kind] += 1;
    days[key].total += 1;
  };

  const [tasks, notes, wellness, events, conversations] = await Promise.all([
    listOwnedDocs('tasks', userId),
    listOwnedDocs('notes', userId),
    listOwnedDocs('wellnessEntries', userId),
    listOwnedDocs('calendarEvents', userId),
    listOwnedDocs('conversations', userId),
  ]);

  tasks.forEach((d) => {
    add(dateOf(d.get('createdAt')), 'tasksAdded');
    add(dateOf(d.get('completedAt')), 'tasksCompleted');
  });
  // A journal entry counts on the day it was written.
  notes.forEach((d) => add(dateOf(d.get('createdAt')), 'journal'));
  wellness.forEach((d) => add(dateOf(d.get('recordedAt')), 'moodCheckIns'));
  events.forEach((d) => add(dateOf(d.get('createdAt')), 'events'));

  // Only conversations touched since the month began can hold messages from it.
  const recent = conversations.filter((c) => (dateOf(c.get('updatedAt')) || new Date(0)) >= from);
  const messageSnaps = await Promise.all(recent.map((c) =>
    c.ref.collection('messages').where('createdAt', '>=', from).where('createdAt', '<', to).get()));
  messageSnaps.forEach((snap) => snap.docs
    .filter((m) => m.get('role') === 'user')
    .forEach((m) => add(dateOf(m.get('createdAt')), 'messages')));

  const totals = Object.fromEntries(KINDS.map((k) => [k, Object.values(days).reduce((sum, d) => sum + d[k], 0)]));

  let longestStreak = 0;
  let run = 0;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  for (let day = 1; day <= daysInMonth; day += 1) {
    run = days[`${prefix}-${String(day).padStart(2, '0')}`] ? run + 1 : 0;
    longestStreak = Math.max(longestStreak, run);
  }

  return { month: prefix, days, totals, activeDays: Object.keys(days).length, longestStreak };
};

module.exports = { getMonthActivity, KINDS };
