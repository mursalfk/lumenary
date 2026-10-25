// src/engine/styles/madhubani.js
import { still, hexToRgb } from '../utils.js';
import { pixels, sampler } from '../helpers.js';
import { css, paletteIdx, modeFilter, edgeMask, grain } from '../culture.js';

// Madder red, turmeric, leaf green, indigo, lamp black, paper, saffron, earth.
const PAL = ['#c43a2b', '#e8b130', '#3b8a52', '#2f55a0', '#1d1b1a', '#f4ead2', '#e5742f', '#7a4527'].map(hexToRgb);
const INK = [29, 27, 26], PAPER = [244, 234, 210];
const fr = (v) => v - Math.floor(v);

// Line fill that goes inside each colour: nothing is left empty in Madhubani. Returns 1 on a line.
function fill(id, x, y, q) {
  switch (id) {
    case 0: { const a = Math.abs(fr((x + y) / q) - 0.5), b = Math.abs(fr((x - y) / q) - 0.5); return a < 0.07 || b < 0.07 ? 1 : 0; }
    case 1: return Math.hypot(fr(x / q) - 0.5, fr(y / q) - 0.5) < 0.17 ? 1 : 0;
    case 2: return Math.abs(fr((y + Math.sin(x / (q * 0.9)) * q * 0.25) / (q * 0.8)) - 0.5) < 0.1 ? 1 : 0;
    case 3: { const h = q * 0.5, row = Math.floor(y / h), u = fr(x / q + (row % 2) * 0.5) - 0.5, v = (y - row * h) / q; return Math.abs(Math.hypot(u, v) - 0.5) < 0.07 ? 1 : 0; }
    case 4: return Math.hypot(fr(x / q) - 0.5, fr(y / q) - 0.5) < 0.14 ? 1 : 0;
    case 6: { const u = fr(x / (q * 1.6)) - 0.5, v = fr(y / (q * 1.6)) - 0.5, r = Math.hypot(u, v); return r < 0.5 && fr(r * 5) < 0.32 ? 1 : 0; }
    case 7: return Math.abs(fr(x / (q * 0.6)) - 0.5) < 0.09 ? 1 : 0;
    default: return 0;
  }
}

// A band of alternating triangles, drawn along x with its outer edge at y = 0 and inner edge at y = m.
function strip(ctx, len, m, pal) {
  const w = m * 0.34;
  for (let x = 0, j = 0; x < len; x += w, j++) {
    ctx.fillStyle = css(pal[j % 2 ? 1 : 0]);
    ctx.beginPath(); ctx.moveTo(x, m * 0.3); ctx.lineTo(x + w, m * 0.3); ctx.lineTo(x + w / 2, m * 0.7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = css(pal[j % 2 ? 3 : 2]);
    ctx.beginPath(); ctx.moveTo(x + w / 2, m * 0.7); ctx.lineTo(x + w * 1.5, m * 0.7); ctx.lineTo(x + w, m * 0.3); ctx.closePath(); ctx.fill();
  }
}

export default still({
  id: 'madhubani',
  name: 'Madhubani',
  blurb: 'Mithila painting from Bihar: flat natural pigments, a heavy black line around every shape, and no space left empty, so each colour is filled with its own pattern.',
  maxSide: 1100,
  params: [
    { key: 'simplify', label: 'Simplify', type: 'range', min: 1, max: 10, step: 1, default: 5 },
    { key: 'size', label: 'Pattern size', type: 'range', min: 3, max: 14, step: 1, default: 7 },
    { key: 'pattern', label: 'Pattern strength', type: 'range', min: 0, max: 100, step: 1, default: 80 },
    { key: 'line', label: 'Outline', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'frame', label: 'Border', type: 'range', min: 0, max: 100, step: 1, default: 60 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, n = PAL.length;
    const smp = sampler(cache, d, W, H, p.simplify * sc * 1.1);
    const key = p.simplify + '|' + W;
    if (cache.mk !== key) { cache.mIdx = modeFilter(paletteIdx(smp.ch, W, H, PAL, 1.3, 0.02), W, H, n, Math.max(2, Math.round(3 * sc)), 2); cache.mk = key; }
    const idx = cache.mIdx, edge = edgeMask(idx, W, H, Math.max(0, Math.round((0.4 + (p.line / 100) * 2.2) * sc)));
    const img = ctx.createImageData(W, H), o = img.data, q = p.size * sc * 1.6, ps = p.pattern / 100;
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      const id = idx[i], c = PAL[id];
      let r = c[0], g = c[1], b = c[2];
      if (edge[i]) { r = INK[0]; g = INK[1]; b = INK[2]; } else if (ps > 0.02) {
        const cov = fill(id, x + Math.sin(y * 0.045) * 1.4 * sc, y + Math.sin(x * 0.05) * 1.4 * sc, q);
        if (cov) { const light = id === 4 || id === 7, t = ps * 0.9, L = light ? PAPER : INK; r += (L[0] - r) * t; g += (L[1] - g) * t; b += (L[2] - b) * t; }
      }
      o[k] = r; o[k + 1] = g; o[k + 2] = b; o[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const m = Math.round(Math.min(W, H) * (p.frame / 100) * 0.1);
    if (m >= 8) {
      ctx.fillStyle = css(PAPER);
      ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.rect(m, m, W - 2 * m, H - 2 * m); ctx.fill('evenodd');
      const sides = [[m, 0, 0, W - 2 * m], [W - m, H, Math.PI, W - 2 * m], [0, H - m, -Math.PI / 2, H - 2 * m], [W, m, Math.PI / 2, H - 2 * m]];
      for (const [tx, ty, rot, len] of sides) {
        ctx.save(); ctx.translate(tx, ty); ctx.rotate(rot); ctx.beginPath(); ctx.rect(0, 0, len, m); ctx.clip();
        strip(ctx, len, m, [PAL[0], PAL[1], PAL[3], PAL[2]]); ctx.restore();
      }
      ctx.strokeStyle = css(INK);
      for (const [inset, w] of [[m * 0.12, m * 0.07], [m * 0.28, m * 0.04], [m * 0.72, m * 0.04], [m, m * 0.08]]) { ctx.lineWidth = Math.max(1, w); ctx.strokeRect(inset, inset, W - 2 * inset, H - 2 * inset); }
    }
    grain(ctx, W, H, 0.06, 4, sc);
  },
});
