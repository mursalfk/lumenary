// src/utils/scroller.js
// Holds the smooth-scroll instance (if any) so any component can scroll through one door.
let lenis = null;

export const setScroller = (instance) => { lenis = instance; };

// Lenis caches the page height. After a route change the page can be much taller than it was a moment ago,
// and a stale height makes it clamp every scroll to the old bottom. Re-measure before scrolling.
export const remeasure = () => { if (lenis) lenis.resize(); };

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
}

export function scrollToId(id, { immediate = false } = {}) {
  const el = document.getElementById(id);
  if (!el) return false;
  remeasure();
  if (lenis) lenis.scrollTo(el, { offset: -8, duration: 1.4, immediate });
  else if (immediate) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 8);
  else el.scrollIntoView({ behavior: 'smooth' });
  return true;
}
