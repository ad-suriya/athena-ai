// Backend auth calls. Sign-in itself stays with Firebase Auth on the client.
import { auth, signInWithEmailAndPassword, signOut } from '../config/firebase.js';
import { post } from './api';

// Verifies the signed-in user's ID token on the server and creates/updates users/{uid}.
export const syncUserProfile = async () => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Not signed in');
  return post('/api/auth/google', { token });
};

// Firebase error codes → messages for the login form.
const EMAIL_SIGN_IN_ERRORS = {
  'auth/invalid-credential': 'Invalid email or password',
  'auth/invalid-login-credentials': 'Invalid email or password',
  'auth/wrong-password': 'Invalid email or password',
  'auth/user-not-found': 'Invalid email or password',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/operation-not-allowed': 'Email sign-in is not enabled for this app.',
  'auth/network-request-failed': 'Could not reach the sign-in service. Check your connection.',
};

// Signs in with Firebase Auth (email/password provider). Credentials are checked by
// Firebase, never in this code. Throws an Error with a user-facing message.
export const signInWithEmail = async (email, password) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (err) {
    throw new Error(EMAIL_SIGN_IN_ERRORS[err.code] || 'Sign-in failed. Please try again.');
  }
};

// Signs out of Firebase Auth. App.jsx's auth listener then routes to /login.
export const signOutUser = () => signOut(auth);
