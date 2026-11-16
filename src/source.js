// src/source.js
import { useSyncExternalStore } from 'react';
import { env } from './env.js';
import { makeSample } from './engine/sample.js';
import { grabFrame, VIDEO_LIMIT } from './engine/runtime.js';

// The picture or video shared by every style page, so switching styles keeps what you uploaded.
// A source is { canvas, name, sample, w, h } for a picture. A video adds { video, file, duration, limit, trimmed,
// paused() }: `canvas` is then its first frame, `video` the element that plays it and `limit` how much of it is used.
let sample = null;
let current = null;
let held = false;
const subs = new Set();

const VIDEO_NAME = /\.(mp4|m4v|mov|webm|mkv|ogv)$/i;
export const isVideoFile = (file) => !!file && ((file.type || '').startsWith('video/') || (!file.type && VIDEO_NAME.test(file.name || '')));

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

// Lets go of the video that was loaded before, so its memory and its object URL are freed.
function release(src) {
  if (!src || !src.video) return;
  const url = src.video.src;
  src.video.pause();
  src.video.removeAttribute('src');
  src.video.load();
  URL.revokeObjectURL(url);
}
function swap(next) {
  const old = current;
  current = next;
  held = false;
  emit();
  release(old);
}

export function resetToSample() { swap(null); }

// Whether the viewer paused the video themselves. The runtime only starts playback when they did not.
export function holdVideo(on) { held = on; }

export function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || (file.type && !file.type.startsWith('image/'))) return reject(new Error('That file is not an image or a video.'));
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
      swap({ canvas: c, name: file.name || 'Pasted image', sample: false, w: img.naturalWidth, h: img.naturalHeight });
      resolve(current);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Couldn't read that image. Try a JPG, PNG, WebP or GIF.")); };
    img.src = url;
  });
}

// Opens a video file in a muted, looping <video> element and waits until its first frame can be drawn.
export function loadVideoFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    let settled = false;
    const fail = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      v.removeAttribute('src'); v.load();
      URL.revokeObjectURL(url);
      reject(new Error("This browser can't play that video. Try an MP4 or WebM file."));
    };
    const ready = () => {
      if (settled || !v.videoWidth) return;
      settled = true;
      clearTimeout(timer);
      v.pause();
      const duration = Number.isFinite(v.duration) ? v.duration : Infinity;
      const limit = Math.min(duration, VIDEO_LIMIT);
      swap({
        canvas: grabFrame(env, v, 1920), name: file.name || 'Video', sample: false, w: v.videoWidth, h: v.videoHeight,
        video: v, file, duration, limit, trimmed: duration > VIDEO_LIMIT + 0.05, paused: () => held,
      });
      resolve(current);
    };
    const timer = setTimeout(fail, 12000);
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
    v.addEventListener('loadeddata', ready);
    v.addEventListener('playing', ready);
    v.addEventListener('error', fail);
    v.src = url;
    // Phones do not load a frame until playback starts, so start it; `ready` pauses it again.
    v.play().catch(() => {});
  });
}

export const loadFile = (file) => (isVideoFile(file) ? loadVideoFile(file) : loadImageFile(file));
