// Pure helpers for the Home dashboard. Dates are compared in the user's local time.

export const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const greetingFor = (date) => {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// Today's list: tasks due today, plus undated tasks that are still open or were finished today.
export const selectTodaysTasks = (tasks, now = new Date()) => {
  const today = tasks.filter((t) => {
    if (t.dueDate) return isSameDay(new Date(t.dueDate), now);
    if (t.status !== 'completed') return true;
    return t.completedAt ? isSameDay(new Date(t.completedAt), now) : false;
  });
  const dueMs = (t) => (t.dueDate ? new Date(t.dueDate).getTime() : Infinity);
  return today.sort((a, b) => dueMs(a) - dueMs(b));
};

export const formatClock = (date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

// Due time for a task, or '' when it has no time of day.
export const taskTime = (task) => {
  if (!task.dueDate) return '';
  const d = new Date(task.dueDate);
  return d.getHours() === 0 && d.getMinutes() === 0 ? '' : formatClock(d);
};

export const summaryLine = ({ completed, total }) => {
  if (completed > 0) return `You've completed ${completed} task${completed === 1 ? '' : 's'} today. Let's keep the momentum.`;
  if (total > 0) return `${total} task${total === 1 ? '' : 's'} on your list today. One step at a time.`;
  return 'A fresh start. What would you like to focus on today?';
};

// 1–10 mood score → word shown in the mood ring.
export const moodLabel = (score) => {
  if (score == null) return '—';
  if (score >= 8) return 'Great';
  if (score >= 6) return 'Good';
  if (score >= 4) return 'Okay';
  return 'Low';
};

export const checkInLine = (count) => {
  if (count === 0) return 'Check in to start tracking how you feel.';
  if (count === 1) return "You checked in once this week. A small habit goes a long way.";
  return `You've checked in ${count} times this week. Keep it up!`;
};

export { stripHtml } from '../../../utils/text';

export const formatLongDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// "Today", "Tomorrow" or "Mon, Oct 12" relative to now.
export const dayLabel = (date, now = new Date()) => {
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (isSameDay(date, now)) return 'Today';
  if (isSameDay(date, tomorrow)) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};
