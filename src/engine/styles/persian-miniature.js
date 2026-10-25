// src/engine/styles/persian-miniature.js
import { still, clamp, hexToRgb, hash2, smoothstep, TAU } from '../utils.js';
import { pixels, sampler } from '../helpers.js';
import { css, paletteIdx, modeFilter, edgeMask, grain, leaf } from '../culture.js';

// Lapis, vermilion, gold, emerald, turmeric, rose, ivory, ink, turquoise.
const PAL = ['#1f3f8f', '#c8321f', '#c9a24a', '#1f7a5c', '#e0a526', '#c75b78', '#f1e6c8', '#2a1a12', '#2c9aa3'].map(hexToRgb);

// A small gold teardrop pointing along angle a.
function drop(ctx, x, y, a, L) {
  leaf(ctx, x, y, a, L, L * 0.28); ctx.fill();
}

export default still({
  id: 'persian-miniature',
  name: 'Persian Miniature',
  blurb: 'Flat jewel colour with no cast shadows, fine ink outlines, tufts of grass and a gilded frame, as in a page from an illuminated manuscript.',
  maxSide: 1100,
  params: [
    { key: 'simplify', label: 'Simplify', type: 'range', min: 1, max: 9, step: 1, default: 4 },
    { key: 'ink', label: 'Ink outline', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'hatch', label: 'Hatching', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'gold', label: 'Gold leaf', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'frame', label: 'Frame', type: 'range', min: 0, max: 100, step: 1, default: 70 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, n = PAL.length, ink = '#2a1a12';
    const smp = sampler(cache, d, W, H, p.simplify * sc * 1.1);
    const key = p.simplify + '|' + W;
    if (cache.pk !== key) { cache.pIdx = modeFilter(paletteIdx(smp.ch, W, H, PAL, 1.25, 0.03), W, H, n, Math.max(1, Math.round(2 * sc)), 2); cache.pk = key; }
    const idx = cache.pIdx, edge = edgeMask(idx, W, H, Math.max(0, Math.round(0.6 * sc))), img = ctx.createImageData(W, H), o = img.data;
    const ol = (p.ink / 100) * 0.8, hat = p.hatch / 100, per = 3.1 * sc;
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      const c = PAL[idx[i]], t = smp.tone(x, y);
      let f = 0.93 + 0.14 * t;
      if (hat > 0 && t < 0.42) { const s = (x * 0.7 + y) / per; if (s - Math.floor(s) < 0.26) f -= hat * 0.34 * smoothstep(0.42, 0.15, t); }
      let r = c[0] * f, g = c[1] * f, b = c[2] * f;
      if (edge[i]) { r = r * (1 - ol) + 42 * ol; g = g * (1 - ol) + 26 * ol; b = b * (1 - ol) + 16 * ol; }
      o[k] = r; o[k + 1] = g; o[k + 2] = b; o[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    // grass tufts, tiny flowers and flecks of gold, set where the colour is open and flat
    const step = 30 * sc, gold = p.gold / 100;
    ctx.lineCap = 'round';
    for (let gy = step / 2; gy < H; gy += step) for (let gx = step / 2; gx < W; gx += step) {
      const jx = gx + (hash2(gx | 0, gy | 0, 1) - 0.5) * step * 0.8, jy = gy + (hash2(gx | 0, gy | 0, 2) - 0.5) * step * 0.8;
      const xi = clamp(jx | 0, 0, W - 1), yi = clamp(jy | 0, 0, H - 1), id = idx[yi * W + xi], hv = hash2(gx | 0, gy | 0, 3);
      if (edge[yi * W + xi] || hv > 0.55) continue;
      if (id === 3 || id === 8 || hv < 0.2) {
        const c = PAL[id], dk = css([c[0] * 0.55, c[1] * 0.55, c[2] * 0.55]);
        ctx.strokeStyle = dk; ctx.lineWidth = 1.3 * sc;
        for (const a of [-0.5, 0, 0.5]) { ctx.beginPath(); ctx.moveTo(jx, jy); ctx.quadraticCurveTo(jx + a * 5 * sc, jy - 5 * sc, jx + a * 9 * sc, jy - 10 * sc); ctx.stroke(); }
      } else if (gold > 0.05) {
        ctx.fillStyle = css(PAL[2], 0.5 + 0.5 * gold); ctx.beginPath(); ctx.arc(jx, jy, (1 + hv * 1.6) * sc * (0.6 + gold * 0.6), 0, TAU); ctx.fill();
      }
    }
    // the illuminated border
    const m = Math.round(Math.min(W, H) * (p.frame / 100) * 0.1);
    if (m >= 8) {
      const L = css(PAL[0]), G = css(PAL[2]), R = css(PAL[1]), I = css(PAL[6]);
      ctx.fillStyle = I;
      ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.rect(m, m, W - 2 * m, H - 2 * m); ctx.fill('evenodd');
      const band = (inset, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.strokeRect(inset, inset, W - 2 * inset, H - 2 * inset); };
      band(m * 0.64, m * 0.5, L);
      band(m * 0.34, Math.max(1.5, m * 0.07), G);
      band(m * 0.94, Math.max(1.5, m * 0.07), G);
      band(m * 0.97 + 1, Math.max(1, m * 0.03), R);
      band(m * 0.04 + 1, Math.max(1, m * 0.03), ink);
      // gold teardrops and white dots along the blue band
      ctx.fillStyle = G;
      const inset = m * 0.64, gap = m * 0.55;
      const run = (x0, y0, dx, dy, len, ang) => {
        for (let t = gap / 2, j = 0; t < len; t += gap, j++) {
          const x = x0 + dx * t, y = y0 + dy * t;
          ctx.fillStyle = G; drop(ctx, x, y, ang + (j % 2 ? Math.PI : 0) + Math.PI / 2 - Math.PI / 2, m * 0.2);
          ctx.fillStyle = I; ctx.beginPath(); ctx.arc(x + dx * gap * 0.5, y + dy * gap * 0.5, m * 0.04, 0, TAU); ctx.fill();
        }
      };
      run(inset, inset, 1, 0, W - 2 * inset, 0); run(inset, H - inset, 1, 0, W - 2 * inset, 0);
      run(inset, inset, 0, 1, H - 2 * inset, Math.PI / 2); run(W - inset, inset, 0, 1, H - 2 * inset, Math.PI / 2);
      for (const [cx, cy] of [[inset, inset], [W - inset, inset], [inset, H - inset], [W - inset, H - inset]]) {
        ctx.fillStyle = G; ctx.beginPath(); ctx.arc(cx, cy, m * 0.26, 0, TAU); ctx.fill();
        ctx.fillStyle = R; ctx.beginPath(); ctx.arc(cx, cy, m * 0.15, 0, TAU); ctx.fill();
        ctx.fillStyle = I; ctx.beginPath(); ctx.arc(cx, cy, m * 0.06, 0, TAU); ctx.fill();
      }
    }
    grain(ctx, W, H, 0.05, 9, sc);
  },
});
