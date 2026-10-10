import { useMemo } from 'react';

// Pointer handlers that forward normalised (0..1) canvas coordinates to the runtime.
export default function usePointerBridge(canvasRef, rtRef) {
  return useMemo(() => {
    const send = (e, patch) => {
      const c = canvasRef.current, rt = rtRef.current;
      if (!c || !rt) return;
      const r = c.getBoundingClientRect();
      rt.setPointer({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, ...patch });
    };
    return {
      onPointerMove: (e) => send(e, { inside: true }),
      onPointerEnter: (e) => send(e, { inside: true }),
      onPointerLeave: (e) => send(e, { inside: false, down: false }),
      onPointerDown: (e) => send(e, { inside: true, down: true }),
      onPointerUp: (e) => send(e, { down: false }),
    };
  }, [canvasRef, rtRef]);
}
