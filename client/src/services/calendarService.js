// Calendar events API. startTime/endTime are ISO 8601 strings.
import { get, post, patch, del } from './api';

const EVENTS = '/api/calendar/events';

// range: { from?: Date, to?: Date }
export const getEvents = ({ from, to } = {}) => {
  const params = new URLSearchParams();
  if (from) params.set('from', from.toISOString());
  if (to) params.set('to', to.toISOString());
  const query = params.toString();
  return get(query ? `${EVENTS}?${query}` : EVENTS);
};
export const getEvent = (id) => get(`${EVENTS}/${encodeURIComponent(id)}`);
export const createEvent = (data) => post(EVENTS, data);
export const updateEvent = (id, data) => patch(`${EVENTS}/${encodeURIComponent(id)}`, data);
export const deleteEvent = (id) => del(`${EVENTS}/${encodeURIComponent(id)}`);
