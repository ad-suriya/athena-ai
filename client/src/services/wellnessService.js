// Wellness check-ins API (wellnessEntries collection): mood, energy, stress (1–10),
// sleepHours, note, recordedAt. No UI consumes this yet.
import { get, post, patch, del } from './api';

// range: { from?: Date, to?: Date } on recordedAt
export const getWellnessEntries = ({ from, to } = {}) => {
  const params = new URLSearchParams();
  if (from) params.set('from', from.toISOString());
  if (to) params.set('to', to.toISOString());
  const query = params.toString();
  return get(query ? `/api/wellness?${query}` : '/api/wellness');
};
export const getWellnessEntry = (id) => get(`/api/wellness/${encodeURIComponent(id)}`);
export const createWellnessEntry = (data) => post('/api/wellness', data);
export const updateWellnessEntry = (id, data) => patch(`/api/wellness/${encodeURIComponent(id)}`, data);
export const deleteWellnessEntry = (id) => del(`/api/wellness/${encodeURIComponent(id)}`);
