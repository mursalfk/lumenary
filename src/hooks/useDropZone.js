import { useMemo, useState } from 'react';

// Drag-and-drop file target. Spread `bind` on the element.
export default function useDropZone(onFile) {
  const [dragging, setDragging] = useState(false);
  const bind = useMemo(() => {
    const over = (e) => { e.preventDefault(); setDragging(true); };
    return {
      onDragEnter: over,
      onDragOver: over,
      onDragLeave: () => setDragging(false),
      onDrop: (e) => {
        e.preventDefault();
        setDragging(false);
        onFile(e.dataTransfer.files && e.dataTransfer.files[0]);
      },
    };
  }, [onFile]);
  return { dragging, bind };
}
