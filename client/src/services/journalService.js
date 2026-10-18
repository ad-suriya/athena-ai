// Journal entries API (journalEntries collection). No UI consumes this yet.
import { get, post, patch, del } from './api';

export const getJournalEntries = () => get('/api/journal');
export const getJournalEntry = (id) => get(`/api/journal/${encodeURIComponent(id)}`);
export const createJournalEntry = (data) => post('/api/journal', data);
export const updateJournalEntry = (id, data) => patch(`/api/journal/${encodeURIComponent(id)}`, data);
export const deleteJournalEntry = (id) => del(`/api/journal/${encodeURIComponent(id)}`);
