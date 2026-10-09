// Insights API: the user's own activity, counted per local day.
import { get } from './api';

// month: Date in the wanted month. Days are bucketed in the browser's timezone.
// → { month, days: { 'YYYY-MM-DD': { messages, tasksCompleted, tasksAdded, journal, moodCheckIns, events, total } },
//     totals, activeDays, longestStreak }
export const getMonthActivity = (month) => {
  const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
  return get(`/api/insights/activity?month=${key}&tzOffset=${new Date(month.getFullYear(), month.getMonth(), 15).getTimezoneOffset()}`);
};
