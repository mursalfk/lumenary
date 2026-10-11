import { useEffect } from 'react';
import Lenis from 'lenis';
import { useReducedMotion } from 'motion/react';
import { setScroller } from '../utils/scroller.js';

// Inertial scrolling for the whole app. Renders nothing; off when the visitor prefers less motion.
export default function SmoothScroll() {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return undefined;
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    setScroller(lenis);
    let raf;
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); setScroller(null); };
  }, [reduce]);
  return null;
}
