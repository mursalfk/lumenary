import { useSyncExternalStore } from 'react';
import { env } from './env.js';
import { makeSample } from './engine/sample.js';

// The picture shared by every style page, so switching styles keeps what you uploaded.
let sample = null;
let current = null;
const subs = new Set();

export function getSample() {
  if (!sample) sample = makeSample(env);
  return sample;
}
let defaultSrc = null;
export function getSource() {
  if (current) return current;
  if (!defaultSrc) defaultSrc = { canvas: getSample(), name: 'Sample image', sample: true, w: 800, h: 1000 };
  return defaultSrc;
}
export function subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }
function emit() { subs.forEach((f) => f()); }
export function useSource() { return useSyncExternalStore(subscribe, getSource); }
export function resetToSample() { current = null; emit(); }

export function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || (file.type && !file.type.startsWith('image/'))) return reject(new Error('That file is not an image.'));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const MAX = 3200;
      const k = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * k)), h = Math.max(1, Math.round(img.naturalHeight * k));
      const c = env.makeCanvas(w, h);
      const x = c.getContext('2d');
      x.imageSmoothingQuality = 'high';
      x.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      current = { canvas: c, name: file.name || 'Pasted image', sample: false, w: img.naturalWidth, h: img.naturalHeight };
      emit();
      resolve(current);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Couldn't read that image. Try a JPG, PNG, WebP or GIF.")); };
    img.src = url;
  });
}
