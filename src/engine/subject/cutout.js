// src/engine/subject/cutout.js
// Helpers for working with a subject mask: cut the subject out of a picture, give it an outline, label a wait.
import { clamp } from '../utils.js';

// `soft` is how gradual the edge is, from 0 (a hard cut) to 1 (a wide feather).
export function cutout(env, picture, mask, soft = 0.4) {
  const w = picture.width, h = picture.height, out = env.makeCanvas(w, h), ctx = out.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(picture, 0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  const m = mask.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, w, h).data;
  const half = 0.03 + 0.47 * clamp(soft), lo = 0.5 - half, hi = 0.5 + half;
  for (let i = 0; i < d.length; i += 4) {
    const t = clamp((m[i + 3] / 255 - lo) / (hi - lo));
    d[i + 3] = Math.round(t * t * (3 - 2 * t) * 255);
  }
  ctx.putImageData(img, 0, 0);
  return out;
}

// The same shape as a flat colour, grown outwards by `grow` pixels.
export function outline(env, cut, color, grow) {
  const w = cut.width, h = cut.height, flat = env.makeCanvas(w, h), fc = flat.getContext('2d');
  fc.drawImage(cut, 0, 0);
  fc.globalCompositeOperation = 'source-in';
  fc.fillStyle = color;
  fc.fillRect(0, 0, w, h);
  if (grow < 0.5) return flat;
  const out = env.makeCanvas(w, h), oc = out.getContext('2d'), steps = Math.max(16, Math.round(grow * 2.2));
  for (let k = 0; k < steps; k++) {
    const a = (k / steps) * Math.PI * 2;
    oc.drawImage(flat, Math.cos(a) * grow, Math.sin(a) * grow);
  }
  oc.drawImage(flat, 0, 0);
  return out;
}

// A small label in the middle of the picture, for the moments the subject is still being found.
export function waitNote(ctx, W, H, text) {
  if (!text) return;
  const fs = Math.max(13, Math.round(W * 0.028));
  ctx.save();
  ctx.font = `500 ${fs}px "Hanken Grotesk", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const tw = ctx.measureText(text).width + fs * 1.6, th = fs * 2.1;
  ctx.fillStyle = 'rgba(0,0,0,0.62)';
  ctx.beginPath();
  ctx.roundRect(W / 2 - tw / 2, H / 2 - th / 2, tw, th, th / 2);
  ctx.fill();
  ctx.fillStyle = '#f5f5f5';
  ctx.fillText(text + '...', W / 2, H / 2 + 1);
  ctx.restore();
}
