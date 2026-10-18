import * as calendarService from '../../../services/calendarService';
import { useAsyncData } from './useAsyncData';

const DAYS_AHEAD = 7;
const MAX_EVENTS = 3;

// Next few events from now through the coming week, soonest first.
const loadUpcoming = async () => {
  const from = new Date();
  const to = new Date(from);
  to.setDate(to.getDate() + DAYS_AHEAD);
  const events = await calendarService.getEvents({ from, to });
  return events
    .filter((e) => new Date(e.endTime || e.startTime) >= from)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, MAX_EVENTS);
};

export const useUpcomingEvents = () => {
  const { data, isLoading, error } = useAsyncData(loadUpcoming, []);
  return { events: data, isLoading, error };
};
