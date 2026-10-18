// Signed-in user's profile and activity stats.
import { get, patch } from './api';

// Returns { uid, name, email, photoURL, createdAt, lastLogin, stats: { conversations }, settings: { memoryEnabled } }.
export const getMyProfile = () => get('/api/users/me');

// settings: { memoryEnabled }. Turning memory off deletes it on the server. Returns the saved settings.
export const updateMySettings = (settings) => patch('/api/users/me/settings', settings);
