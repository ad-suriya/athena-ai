// Backend auth calls. Sign-in itself stays with Firebase Auth on the client.
import { auth } from '../firebase.js';
import { post } from './api';

// Verifies the signed-in user's ID token on the server and creates/updates users/{uid}.
export const syncUserProfile = async () => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Not signed in');
  return post('/api/auth/google', { token });
};
