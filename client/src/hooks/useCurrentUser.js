import { useEffect, useState } from 'react';
import { auth } from '../config/firebase.js';

// The signed-in Firebase user as { uid, name, firstName, email, photoURL }, or null.
const toUser = (u) => {
  if (!u) return null;
  const name = u.displayName || u.email?.split('@')[0] || 'there';
  return { uid: u.uid, name, firstName: name.split(' ')[0], email: u.email || '', photoURL: u.photoURL || '' };
};

export const useCurrentUser = () => {
  const [user, setUser] = useState(() => toUser(auth.currentUser));

  useEffect(() => auth.onAuthStateChanged((u) => setUser(toUser(u))), []);

  return user;
};
