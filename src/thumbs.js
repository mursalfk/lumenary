// src/thumbs.js
import { useSyncExternalStore } from 'react';
import { SECTION_LIST } from './engine/styles/index.js';
import { renderThumb } from './engine/runtime.js';
import { env, ensureFonts } from './env.js';
import { getSample } from './source.js';

// Previews: each treatment is rendered once from the built-in sample, only when something asks for it,
// one per idle moment. The cache is an external store, so any component can show a preview by id.
const cache = new Map();
const listeners = new Set();
const queue = [];
const waiting = new Set();
const failed = new Set();
let fontsReady = false;
let fontsStarted = false;
let pumping = false;

const emit = () => listeners.forEach((l) => l());
const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
const idle = (f) => (window.requestIdleCallback || ((g) => setTimeout(g, 40)))(f);

// The four treatments shown for each section on the homepage; the hero card cycles through the same ones.
export const SHOWCASE = SECTION_LIST.flatMap((sec) => sec.styles.slice(0, 4));

function pump() {
  if (pumping || !fontsReady) return;
  pumping = true;
  const step = () => {
    const s = queue.shift();
    if (!s) { pumping = false; return; }
    waiting.delete(s.id);
    try {
      cache.set(s.id, renderThumb(env, s, getSample(), 440).toDataURL('image/jpeg', 0.86));
      emit();
    } catch (e) {
      failed.add(s.id);
      console.warn('Thumbnail failed for', s.id, e);
    }
    setTimeout(() => idle(step), 24);
  };
  idle(step);
}

// Makes sure the canvas fonts are loaded before the first preview is drawn.
export function startThumbs() {
  if (fontsStarted) return;
  fontsStarted = true;
  ensureFonts().then(() => { fontsReady = true; pump(); });
}

// Asks for previews. `first` puts them ahead of anything already waiting (used by the page you are looking at).
export function requestThumbs(styles, { first = false } = {}) {
  startThumbs();
  const fresh = styles.filter((s) => !cache.has(s.id) && !failed.has(s.id) && !waiting.has(s.id));
  fresh.forEach((s) => waiting.add(s.id));
  if (first) {
    const keep = queue.filter((s) => !fresh.includes(s));
    queue.length = 0;
    queue.push(...fresh, ...keep);
  } else {
    queue.push(...fresh);
  }
  pump();
}
export const requestThumb = (style) => requestThumbs([style]);

export function useThumb(id) {
  return useSyncExternalStore(subscribe, () => cache.get(id));
}
export function useThumbCount() {
  return useSyncExternalStore(subscribe, () => cache.size);
}
export const peekThumb = (id) => cache.get(id);
