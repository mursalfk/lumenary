// src/hooks/useModal.js
import { useEffect } from 'react';
import { lockScroll, unlockScroll } from '../utils/scroller.js';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Behaviour of a modal dialog on `ref` while `active`: focus moves in (to [data-autofocus] if present), Tab stays inside,
// Escape calls `onClose`, the page behind stops scrolling, and focus returns to where it was when the dialog closes.
// `onClose` should be stable (useCallback), or the dialog re-focuses on every render.
export default function useModal(ref, { active, onClose }) {
  useEffect(() => {
    const node = ref.current;
    if (!active || !node) return undefined;
    const before = document.activeElement;
    lockScroll();
    const items = () => [...node.querySelectorAll(FOCUSABLE)];
    (node.querySelector('[data-autofocus]') || items()[0])?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab') return;
      const list = items();
      if (!list.length) return;
      const first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      unlockScroll();
      if (before && before.focus) before.focus();
    };
  }, [active, ref, onClose]);
}
