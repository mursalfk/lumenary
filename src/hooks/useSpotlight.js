import { useCallback, useEffect, useRef } from 'react';
import { animate, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

const SPRING = { stiffness: 110, damping: 20, mass: 0.7 };

// A pool of light that follows the pointer, and drifts across the element by itself when nobody is pointing.
// Returns a CSS mask (use it on the "lit" layer) and the pointer handlers for the container.
export default function useSpotlight(ref, { radius = 340 } = {}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);
  const drift = useRef([]);

  const stop = useCallback(() => { drift.current.forEach((a) => a.stop()); drift.current = []; }, []);

  const start = useCallback(() => {
    const el = ref.current;
    if (!el || reduce) return;
    stop();
    const w = el.offsetWidth, h = el.offsetHeight;
    const loop = { duration: 7.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' };
    drift.current = [
      animate(x, [w * 0.06, w * 0.94], loop),
      animate(y, [h * 0.3, h * 0.72], { ...loop, duration: 5.4 }),
    ];
  }, [ref, reduce, stop, x, y]);

  useEffect(() => {
    const el = ref.current;
    if (el) { x.set(el.offsetWidth * 0.5); y.set(el.offsetHeight * 0.5); }
    start();
    return stop;
  }, [ref, start, stop, x, y]);

  const follow = useCallback((e) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  }, [x, y]);

  const mask = useMotionTemplate`radial-gradient(circle ${radius}px at ${sx}px ${sy}px, #000 0%, rgba(0,0,0,0.9) 32%, transparent 100%)`;
  const bind = { onPointerEnter: stop, onPointerMove: follow, onPointerLeave: start };
  return { mask, bind };
}
