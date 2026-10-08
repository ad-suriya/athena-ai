// Notes API. `content` is the editor's HTML, stored unchanged.
import { get, post, patch, del } from './api';

export const getNotes = () => get('/api/notes');
export const getNote = (id) => get(`/api/notes/${encodeURIComponent(id)}`);
export const createNote = (data) => post('/api/notes', data);
export const updateNote = (id, data) => patch(`/api/notes/${encodeURIComponent(id)}`, data);
export const deleteNote = (id) => del(`/api/notes/${encodeURIComponent(id)}`);
