// src/engine/styles/truck-art.js
import { still, clamp, hexToRgb, smoothstep } from '../utils.js';
import { pixels, sampler } from '../helpers.js';
import { css, paletteIdx, modeFilter, edgeMask, rosette, leaf } from '../culture.js';

const PALS = {
  bazaar: ['#e32b21', '#ffd12a', '#12a150', '#1c6fe0', '#ff5fa8', '#ff8a1c', '#16bfc7', '#fff6e6', '#161616'],
  peshawar: ['#d71f26', '#ffc61a', '#0f8b4c', '#f47a1f', '#e91e63', '#7a1fa2', '#00a3a3', '#fff1d6', '#161616'],
  karachi: ['#00b3b8', '#ff4f9a', '#2c5be0', '#ffe14a', '#e32b21', '#ff7a1a', '#7bd34a', '#ffffff', '#161616'],
};

// One side of the frame, drawn along x with the outer edge at y = 0 and the inner edge at y = m.
function strip(ctx, len, m, pal, ink) {
  const c = pal.map((v) => css(v));
  ctx.fillStyle = c[0]; ctx.fillRect(0, 0, len, m * 0.3);
  ctx.fillStyle = c[1]; ctx.fillRect(0, m * 0.3, len, m * 0.52);
  ctx.fillStyle = c[3]; ctx.fillRect(0, m * 0.82, len, m * 0.18);
  const tw = m * 0.26;
  ctx.fillStyle = c[0];
  for (let x = 0; x < len; x += tw) { ctx.beginPath(); ctx.moveTo(x, m * 0.3); ctx.lineTo(x + tw / 2, m * 0.3 + tw * 0.5); ctx.lineTo(x + tw, m * 0.3); ctx.fill(); }
  const fs = m * 0.66;
  for (let k = 0, x = fs / 2; x < len; k++, x += fs) {
    const y = m * 0.6;
    leaf(ctx, x + fs * 0.12, y, 0, fs * 0.38, m * 0.07); ctx.fillStyle = c[2]; ctx.fill();
    leaf(ctx, x - fs * 0.12, y, Math.PI, fs * 0.38, m * 0.07); ctx.fill();
    rosette(ctx, x, y, m * 0.18, 8, k % 2 ? c[4] : c[5], c[7], k % 2 ? c[0] : c[3], ink);
  }
  ctx.fillStyle = c[7];
  for (let x = m * 0.1; x < len; x += m * 0.2) { ctx.beginPath(); ctx.arc(x, m * 0.91, m * 0.045, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = ink; ctx.lineWidth = Math.max(1, m * 0.025);
  for (const y of [m * 0.3, m * 0.82, m]) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(len, y); ctx.stroke(); }
}

export default still({
  id: 'truck-art',
  name: 'Truck Art',
  blurb: 'The painted lorries of Pakistan: flat, loud colour, heavy black outlines, a gloss of chrome light and a frame of flowers and chains.',
  maxSide: 1100,
  params: [
    { key: 'palette', label: 'Paint', type: 'select', default: 'bazaar', options: [['bazaar', 'Bazaar'], ['peshawar', 'Peshawar'], ['karachi', 'Karachi']] },
    { key: 'simplify', label: 'Simplify', type: 'range', min: 1, max: 9, step: 1, default: 4 },
    { key: 'outline', label: 'Outline', type: 'range', min: 0, max: 100, step: 1, default: 65 },
    { key: 'gloss', label: 'Chrome gloss', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'frame', label: 'Frame', type: 'range', min: 0, max: 100, step: 1, default: 65 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, pal = PALS[p.palette].map(hexToRgb), ink = '#151515', n = pal.length;
    const smp = sampler(cache, d, W, H, p.simplify * sc * 1.2);
    const key = p.palette + '|' + p.simplify + '|' + W;
    if (cache.tk !== key) { cache.tIdx = modeFilter(paletteIdx(smp.ch, W, H, pal, 1.5, 0.02), W, H, n, Math.max(1, Math.round(2 * sc)), 2); cache.tk = key; }
    const idx = cache.tIdx, edge = edgeMask(idx, W, H, Math.max(0, Math.round((0.2 + (p.outline / 100) * 2.2) * sc)));
    const img = ctx.createImageData(W, H), o = img.data, ol = p.outline / 100, gl = p.gloss / 100;
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      const c = pal[idx[i]], t = smp.tone(x, y);
      let f = 0.88 + 0.22 * t, add = 0;
      if (t > 0.74) { const s = (x * 0.8 + y * 0.6) / (7 * sc); add = smoothstep(0.74, 0.92, t) * gl * (s - Math.floor(s) < 0.42 ? 150 : 40); }
      let r = c[0] * f + add, g = c[1] * f + add, b = c[2] * f + add;
      if (edge[i] && ol > 0.02) { const e = Math.min(1, ol * 1.4); r = r * (1 - e) + 21 * e; g = g * (1 - e) + 21 * e; b = b * (1 - e) + 21 * e; }
      o[k] = r > 255 ? 255 : r; o[k + 1] = g > 255 ? 255 : g; o[k + 2] = b > 255 ? 255 : b; o[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const m = Math.round(Math.min(W, H) * (p.frame / 100) * 0.11);
    if (m < 6) return;
    ctx.save();
    ctx.fillStyle = css(pal[0]);
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.rect(m, m, W - 2 * m, H - 2 * m); ctx.fill('evenodd');
    const sides = [[m, 0, 0, W - 2 * m], [W - m, H, Math.PI, W - 2 * m], [0, H - m, -Math.PI / 2, H - 2 * m], [W, m, Math.PI / 2, H - 2 * m]];
    for (const [tx, ty, rot, len] of sides) {
      ctx.save(); ctx.translate(tx, ty); ctx.rotate(rot);
      ctx.beginPath(); ctx.rect(0, 0, len, m); ctx.clip();
      strip(ctx, len, m, pal, ink); ctx.restore();
    }
    for (const [cx, cy] of [[m / 2, m / 2], [W - m / 2, m / 2], [m / 2, H - m / 2], [W - m / 2, H - m / 2]]) {
      ctx.beginPath(); ctx.arc(cx, cy, m * 0.5, 0, Math.PI * 2); ctx.fillStyle = css(pal[1]); ctx.fill();
      ctx.strokeStyle = ink; ctx.lineWidth = Math.max(1, m * 0.03); ctx.stroke();
      rosette(ctx, cx, cy, m * 0.36, 12, css(pal[4]), css(pal[7]), css(pal[0]), ink);
    }
    ctx.strokeStyle = ink; ctx.lineWidth = Math.max(1.5, m * 0.05); ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
    ctx.restore();
  },
});
