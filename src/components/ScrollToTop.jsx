import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToId, scrollToTop } from '../utils/scroller.js';

// New page: go to the top. Page with a #hash: go to that section once it exists.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) { scrollToTop(); return undefined; }
    const id = requestAnimationFrame(() => scrollToId(hash.slice(1)));
    return () => cancelAnimationFrame(id);
  }, [pathname, hash]);
  return null;
}
