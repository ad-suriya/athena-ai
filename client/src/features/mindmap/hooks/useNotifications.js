import { useCallback, useRef, useState } from 'react';

const DURATION_MS = 3000;

// Short-lived toast messages; each disappears after 3 seconds.
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const nextId = useRef(0);

  const notify = useCallback((message) => {
    const id = ++nextId.current;
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, DURATION_MS);
  }, []);

  return { notifications, notify };
};
