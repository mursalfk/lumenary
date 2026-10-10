import { useEffect } from 'react';

// Eases an element toward the mouse. Moves it with transform only.
export default function useFollowPointer(ref, { enabled = true, offset = 32, ease = 0.16 } = {}) {
  useEffect(() => {
    if (!enabled) return undefined;
    const p = { x: 0, y: 0, tx: 0, ty: 0, ready: false };
    const move = (e) => {
      p.tx = e.clientX; p.ty = e.clientY;
      if (!p.ready) { p.x = p.tx; p.y = p.ty; p.ready = true; }
    };
    let raf;
    const loop = () => {
      const el = ref.current;
      p.x += (p.tx - p.x) * ease;
      p.y += (p.ty - p.y) * ease;
      if (el) {
        const w = el.offsetWidth, h = el.offsetHeight;
        let x = p.x + offset;
        if (x + w > window.innerWidth - 16) x = p.x - w - offset;
        const y = Math.max(16, Math.min(window.innerHeight - h - 16, p.y - h / 2));
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', move);
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf); };
  }, [ref, enabled, offset, ease]);
}
