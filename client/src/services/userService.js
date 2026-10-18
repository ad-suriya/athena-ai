// Signed-in user's profile and activity stats.
import { get } from './api';

// Returns { uid, name, email, photoURL, createdAt, lastLogin, stats: { conversations } }.
export const getMyProfile = () => get('/api/users/me');
