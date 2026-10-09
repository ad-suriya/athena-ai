import { useEffect } from 'react';

// Calls onOutside when a mousedown happens outside ref's element, while active.
export const useClickOutside = (ref, onOutside, active = true) => {
  useEffect(() => {
    if (!active) return undefined;
    const handle = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onOutside();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [ref, onOutside, active]);
};
