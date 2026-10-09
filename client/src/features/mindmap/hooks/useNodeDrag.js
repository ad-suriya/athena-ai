import { useEffect, useRef } from 'react';

// Drags nodes with the mouse. Listens on the document so a drag continues outside
// the node. Latest values are read from refs, so listeners are attached once.
//
// onMove(id, x, y) receives canvas coordinates divided by the zoom factor;
// onDragEnd(id) runs on mouseup after any mousedown on a node.
export const useNodeDrag = ({ canvasRef, zoom, onMove, onDragEnd }) => {
  const dragRef = useRef(null); // { id, offset: { x, y } } while dragging
  const latest = useRef({ zoom, onMove, onDragEnd });
  latest.current = { zoom, onMove, onDragEnd };

  useEffect(() => {
    const handleMouseMove = (e) => {
      const drag = dragRef.current;
      if (!drag) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const scale = latest.current.zoom / 100;
      latest.current.onMove(
        drag.id,
        (e.clientX - rect.left - drag.offset.x) / scale,
        (e.clientY - rect.top - drag.offset.y) / scale
      );
    };

    const handleMouseUp = () => {
      if (dragRef.current) latest.current.onDragEnd(dragRef.current.id);
      dragRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [canvasRef]);

  // Starts a drag unless the press was on the node's own controls.
  // Returns true when a drag started.
  const startDrag = (e, node) => {
    if (e.target.closest('.node-controls')) return false;
    const rect = canvasRef.current.getBoundingClientRect();
    dragRef.current = {
      id: node.id,
      offset: { x: e.clientX - rect.left - node.x, y: e.clientY - rect.top - node.y },
    };
    e.preventDefault();
    return true;
  };

  return { startDrag };
};
