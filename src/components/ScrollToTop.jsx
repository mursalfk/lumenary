// src/components/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToId, scrollToTop } from '../utils/scroller.js';

// How long after the target appears it is re-aligned, while fonts and typeset equations settle and move it.
const SETTLE_MS = [60, 250, 700];
// Lazy pages arrive a moment after the route changes, so wait for the target for up to this long.
const WAIT_MS = 6000;
const POLL_MS = 80;

// New page: go to the top. Page with a #hash: jump to that section once it exists,
// then keep it in place while the page settles.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) { scrollToTop(); return undefined; }
    const id = hash.slice(1), jump = () => scrollToId(id, { immediate: true });
    const timers = [];
    let poll = 0, waited = 0, raf = 0, found = false;

    const settle = () => {
      if (found) return;
      found = true;
      SETTLE_MS.forEach((ms) => timers.push(setTimeout(jump, ms)));
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!stopped) timers.push(setTimeout(jump, 0)); });
    };
    let stopped = false;
    const attempt = () => { if (jump()) { settle(); return true; } return false; };

    raf = requestAnimationFrame(() => {
      if (attempt()) return;
      poll = setInterval(() => {
        waited += POLL_MS;
        if (attempt() || waited >= WAIT_MS) clearInterval(poll);
      }, POLL_MS);
    });

    // The visitor taking over cancels any further re-aligning.
    const stop = () => { stopped = true; clearInterval(poll); timers.forEach(clearTimeout); };
    window.addEventListener('wheel', stop, { passive: true, once: true });
    window.addEventListener('touchstart', stop, { passive: true, once: true });
    return () => {
      stop();
      cancelAnimationFrame(raf);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
    };
  }, [pathname, hash]);
  return null;
}
