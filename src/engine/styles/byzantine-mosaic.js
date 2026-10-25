// src/engine/styles/byzantine-mosaic.js
import { still, hexToRgb, clamp, smoothstep, boxBlur, sobel, rng, hash2 } from '../utils.js';
import { pixels, sampler, stretchedL, slopes, nearest } from '../helpers.js';
import { css, vivid } from '../culture.js';

// Smalti: glass tesserae in deep blue, green, crimson, white, purple, ochre, black and pale blue.
const SMALTI = ['#1d3f7a', '#2e6b4e', '#8c1f2b', '#efe8d8', '#3a2a4a', '#c17a2f', '#161412', '#6e8fb5'].map(hexToRgb);
const GOLDS = [[224, 180, 60], [201, 154, 46], [242, 211, 107], [188, 140, 40]];

export default still({
  id: 'byzantine-mosaic',
  name: 'Byzantine Mosaic',
  blurb: 'Glass and gold tesserae set into wet plaster as in the churches of Ravenna and Constantinople. The rows of tiny cubes follow the contours of the picture, and the brightest parts are set in gold leaf glass.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Tessera size', type: 'range', min: 4, max: 18, step: 1, default: 8 },
    { key: 'gold', label: 'Gold in the light', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'outline', label: 'Dark outlines', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'palette', label: 'Glass', type: 'select', default: 'smalti', options: [['smalti', 'Traditional smalti'], ['picture', 'Colours of the picture']] },
    { key: 'seed', label: 'New laying', type: 'shuffle', default: 3 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, s = p.size * sc, smp = sampler(cache, d, W, H, s * 0.6), tmp = [0, 0, 0], r = rng(p.seed * 41 + 7);
    const L = stretchedL(cache), Fl = boxBlur(boxBlur(L, W, H, Math.max(2, Math.round(5 * sc))), W, H, Math.max(2, Math.round(5 * sc))), { sx, sy } = slopes(Fl, W, H, 1), E = sobel(boxBlur(L, W, H, Math.max(1, Math.round(1.2 * sc))), W, H, 1).mag;
    ctx.fillStyle = '#2b2420'; ctx.fillRect(0, 0, W, H);
    const cs = s * 1.05, gw = Math.ceil(W / cs) + 1, gh = Math.ceil(H / cs) + 1, cells = new Array(gw * gh);
    const placed = [], min2 = (s * 0.98) * (s * 0.98);
    const free = (x, y) => {
      if (x < -s || y < -s || x > W + s || y > H + s) return false;
      const cx = (x / cs) | 0, cy = (y / cs) | 0;
      for (let j = Math.max(0, cy - 1); j <= Math.min(gh - 1, cy + 1); j++) for (let i = Math.max(0, cx - 1); i <= Math.min(gw - 1, cx + 1); i++) {
        const l = cells[j * gw + i]; if (!l) continue;
        for (const q of l) { const dx = q[0] - x, dy = q[1] - y; if (dx * dx + dy * dy < min2) return false; }
      }
      return true;
    };
    const idx = (x, y) => (y < 0 ? 0 : y >= H ? H - 1 : y | 0) * W + (x < 0 ? 0 : x >= W ? W - 1 : x | 0);
    const dirAt = (x, y, prev) => {
      const i = idx(x, y), tx0 = sy[i], ty0 = -sx[i], m = Math.hypot(tx0, ty0), w = smoothstep(0.003, 0.03, m);
      let tx = m > 1e-6 ? tx0 / m : 1, ty = m > 1e-6 ? ty0 / m : 0;
      const bx = Math.cos(0.3), by = Math.sin(0.3);
      if (tx * bx + ty * by < 0) { tx = -tx; ty = -ty; }
      let ox = w * tx + (1 - w) * bx, oy = w * ty + (1 - w) * by; const om = Math.hypot(ox, oy) || 1; ox /= om; oy /= om;
      if (prev && ox * prev[0] + oy * prev[1] < 0) { ox = -ox; oy = -oy; }
      return [ox, oy];
    };
    const put = (x, y, a) => { const cx = clamp((x / cs) | 0, 0, gw - 1), cy = clamp((y / cs) | 0, 0, gh - 1), k = cy * gw + cx; (cells[k] || (cells[k] = [])).push([x, y]); placed.push([x, y, a]); };
    const trace = (x0, y0, dir0, sign) => {
      let x = x0, y = y0, dir = [dir0[0] * sign, dir0[1] * sign];
      for (let n = 0; n < 90; n++) {
        x += dir[0] * s * 1.03; y += dir[1] * s * 1.03;
        if (!free(x, y)) break;
        dir = dirAt(x, y, dir); put(x, y, Math.atan2(dir[1], dir[0]));
      }
    };
    for (const sp of [1.05, 0.55]) {
      const seeds = [];
      for (let y = 0; y < H + s; y += s * sp) for (let x = 0; x < W + s; x += s * sp) seeds.push([x + (r() - 0.5) * s * 0.5, y + (r() - 0.5) * s * 0.5]);
      for (let i = seeds.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; const t = seeds[i]; seeds[i] = seeds[j]; seeds[j] = t; }
      for (const [x, y] of seeds) {
        if (!free(x, y)) continue;
        const dir = dirAt(x, y, null); put(x, y, Math.atan2(dir[1], dir[0]));
        trace(x, y, dir, 1); trace(x, y, dir, -1);
      }
    }
    const gold = p.gold / 100, thr = 1 - gold * 0.5, ol = p.outline / 100;
    for (const [x, y, a] of placed) {
      const qx = clamp(x, 0, W - 1), qy = clamp(y, 0, H - 1), t = smp.tone(qx, qy), e = smoothstep(0.1, 0.26, E[idx(qx, qy)]) * ol, h1 = hash2(x | 0, y | 0, 5);
      let col, isGold = false;
      if (gold > 0.02 && t > thr - 0.1 + (h1 - 0.5) * 0.12) { col = GOLDS[(h1 * GOLDS.length) | 0]; isGold = true; } else if (e > 0.5) col = SMALTI[6]; else {
        vivid(smp.rgb(qx, qy), 1.35, 0.02, tmp);
        col = p.palette === 'picture' ? [tmp[0], tmp[1], tmp[2]] : SMALTI[nearest(SMALTI, tmp[0], tmp[1], tmp[2])];
      }
      const k = 0.86 + 0.28 * hash2(x | 0, y | 0, 9), w = s * (0.88 + 0.08 * (h1 - 0.5)), ang = a + (hash2(x | 0, y | 0, 12) - 0.5) * 0.14;
      const ca = Math.cos(ang) * w / 2, sa = Math.sin(ang) * w / 2, x0 = x - ca + sa, y0 = y - sa - ca, x1 = x + ca + sa, y1 = y + sa - ca, x2 = x + ca - sa, y2 = y + sa + ca, x3 = x - ca - sa, y3 = y - sa + ca;
      ctx.fillStyle = css([col[0] * k, col[1] * k, col[2] * k]);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.fill();
      // a sheen on one side and a shade on the other, tilted differently on every cube
      ctx.fillStyle = isGold ? 'rgba(255,248,200,0.38)' : 'rgba(255,255,255,0.16)';
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x3, y3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.fill();
    }
  },
});
