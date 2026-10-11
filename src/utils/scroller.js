// Holds the smooth-scroll instance (if any) so any component can scroll through one door.
let lenis = null;

export const setScroller = (instance) => { lenis = instance; };

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  if (lenis) lenis.scrollTo(el, { offset: -8, duration: 1.4 });
  else el.scrollIntoView({ behavior: 'smooth' });
  return true;
}
