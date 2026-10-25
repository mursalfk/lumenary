// src/engine/styles/minimalism.js
import { still, clamp } from '../utils.js';
import { pixels, blurredL } from '../helpers.js';
import { hexToRgb } from '../utils.js';

const SCHEMES = {
  stone: { paper: '#ecebe6', ink: '#2a2a29' },
  dusk: { paper: '#e8e4dc', ink: '#35465a' },
  ink: { paper: '#f5f5f3', ink: '#0d0d0d' },
  clay: { paper: '#efe9e1', ink: '#6b3f32' },
};

export default still({
  id: 'minimalism',
  name: 'Minimalism',
  blurb: 'A few flat tones, soft shapes and a lot of empty paper.',
  maxSide: 1100,
  params: [
    { key: 'scheme', label: 'Paper and ink', type: 'select', default: 'stone', options: [['stone', 'Stone'], ['dusk', 'Dusk'], ['ink', 'Ink'], ['clay', 'Clay']] },
    { key: 'tones', label: 'Tones', type: 'range', min: 2, max: 5, step: 1, default: 3 },
    { key: 'soften', label: 'Soften shapes', type: 'range', min: 2, max: 60, step: 1, default: 24 },
    { key: 'margin', label: 'Empty margin', type: 'range', min: 0, max: 30, step: 1, default: 12, fmt: (v) => v + '%' },
    { key: 'accent', label: 'One accent tone', type: 'toggle', default: false },
    { key: 'accentColor', label: 'Accent', type: 'color', default: '#c8452f' },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const sc = SCHEMES[p.scheme] || SCHEMES.stone;
    const paper = hexToRgb(sc.paper), ink = hexToRgb(sc.ink), acc = hexToRgb(p.accentColor);
    ctx.fillStyle = sc.paper;
    ctx.fillRect(0, 0, W, H);

    const m = Math.round(Math.min(W, H) * p.margin / 100);
    const iw = W - 2 * m, ih = H - 2 * m;
    if (iw < 4 || ih < 4) return;
    const L = blurredL(cache, W, H, Math.max(1, Math.round(p.soften * W / 1100)));

    // Sort the tones so that the lightest becomes paper (empty) and the darkest ink.
    const n = p.tones;
    const levels = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      levels.push([ink[0] + (paper[0] - ink[0]) * t, ink[1] + (paper[1] - ink[1]) * t, ink[2] + (paper[2] - ink[2]) * t]);
    }
    if (p.accent && n > 2) levels[1] = acc;

    // Normalise the blurred brightness so the picture always uses the whole range.
    let lo = 1, hi = 0;
    for (let i = 0; i < L.length; i += 7) { if (L[i] < lo) lo = L[i]; if (L[i] > hi) hi = L[i]; }
    const span = Math.max(0.05, hi - lo);

    const img = ctx.createImageData(iw, ih), d = img.data;
    for (let y = 0; y < ih; y++) {
      const sy = Math.min(H - 1, ((y / ih) * H) | 0) * W;
      for (let x = 0; x < iw; x++) {
        const v = clamp((L[sy + Math.min(W - 1, ((x / iw) * W) | 0)] - lo) / span);
        const c = levels[Math.min(n - 1, (v * n) | 0)], o = (y * iw + x) * 4;
        d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
      }
    }
    ctx.putImageData(img, m, m);
  },
});
