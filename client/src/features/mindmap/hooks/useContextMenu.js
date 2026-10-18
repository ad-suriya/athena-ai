import { useEffect, useState } from 'react';

const CLOSED = { visible: false, x: 0, y: 0, nodeId: null };

// Right-click menu for a node, positioned at the cursor. Any click closes it.
export const useContextMenu = () => {
  const [menu, setMenu] = useState(CLOSED);

  useEffect(() => {
    const handleGlobalClick = () => setMenu(prev => ({ ...prev, visible: false }));
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  const open = (e, nodeId) => {
    e.preventDefault();
    setMenu({ visible: true, x: e.clientX, y: e.clientY, nodeId });
  };

  const close = () => setMenu(CLOSED);

  return { menu, open, close };
};
