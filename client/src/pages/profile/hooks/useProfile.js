import { useEffect, useState } from 'react';
import { auth } from '../../../firebase.js';
import { getMyProfile } from '../../../services/userService';

const formatMonthYear = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—';

const formatRelative = (iso) => {
  if (!iso) return '—';
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

// Loads the profile once the auth state is known, and returns display-ready values.
export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) return;
      getMyProfile()
        .then(setProfile)
        .catch((err) => {
          console.error('Error loading profile:', err);
          setError(err);
        });
    });
    return () => unsubscribe();
  }, []);

  return {
    error,
    name: profile?.name ?? '—',
    email: profile?.email ?? '—',
    memberSince: formatMonthYear(profile?.createdAt),
    lastActive: formatRelative(profile?.lastLogin),
    totalChats: profile?.stats?.conversations ?? '—',
  };
};
