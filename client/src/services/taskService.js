// Tasks API — speaks the canonical Firestore schema (see docs/DATABASE_SCHEMA.md).
import { get, post, patch, del } from './api';

export const getTasks = () => get('/api/tasks');
export const getTask = (id) => get(`/api/tasks/${encodeURIComponent(id)}`);
export const createTask = (data) => post('/api/tasks', data);
export const updateTask = (id, data) => patch(`/api/tasks/${encodeURIComponent(id)}`, data);
export const deleteTask = (id) => del(`/api/tasks/${encodeURIComponent(id)}`);
