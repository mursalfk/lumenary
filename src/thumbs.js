import { useSyncExternalStore } from 'react';
import { STYLES } from './engine/styles/index.js';
import { renderThumb } from './engine/runtime.js';
import { env, ensureFonts } from './env.js';
import { getSample } from './source.js';

// Homepage previews: each style rendered once from the built-in sample, one per idle slice.
const cache = new Map();
const listeners = new Set();
let started = false;

const emit = () => listeners.forEach((l) => l());
const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };

export function startThumbs() {
  if (started) return;
  started = true;
  ensureFonts().then(() => {
    const queue = STYLES.slice();
    const sample = getSample();
    const next = () => {
      const s = queue.shift();
      if (!s) return;
      try {
        const c = renderThumb(env, s, sample, 440);
        cache.set(s.id, c.toDataURL('image/jpeg', 0.86));
        emit();
      } catch (e) {
        console.warn('Thumbnail failed for', s.id, e);
      }
      setTimeout(next, 30);
    };
    (window.requestIdleCallback || ((f) => setTimeout(f, 60)))(next);
  });
}

export function useThumb(id) {
  return useSyncExternalStore(subscribe, () => cache.get(id));
}
export function useThumbCount() {
  return useSyncExternalStore(subscribe, () => cache.size);
}
export const peekThumb = (id) => cache.get(id);
