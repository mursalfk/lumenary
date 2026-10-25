// src/engine/styles/chinese-paper-cut.js
import { still, hexToRgb, clamp, smoothstep, boxBlur, hash2, TAU } from '../utils.js';
import { pixels, sampler, stretchedL, fbm } from '../helpers.js';

const fr = (v) => v - Math.floor(v);
const PAPERS = { red: [200, 20, 32], black: [26, 22, 22], gold: [214, 160, 30] };
const BACK = { red: ['#f4e8cf', '#ecd9ae'], black: ['#f1e6cd', '#e4d3ad'], gold: ['#8f1420', '#6e0e18'] };

// 1 where the cut-out pattern removes paper. `k` runs 0..1 and says how much to cut; (x, y) are pixels, q the pattern size.
function cutAt(kind, x, y, q, k) {
  if (kind === 'dots') { const u = fr((x + y) / q) - 0.5, v = fr((x - y) / q) - 0.5; return Math.hypot(u, v) < 0.4 * k; }
  if (kind === 'teeth') { const row = Math.floor(y / q), fy = fr(y / q), tw = Math.abs(fr(x / q + 0.5 * row) - 0.5) * 2; return fy < k * (1 - tw) * 0.92; }
  if (kind === 'crescent') {
    const u = fr(x / q) - 0.5, v = fr(y / q) - 0.5, r = 0.4 * k, a = Math.hypot(u, v) < r, b = Math.hypot(u - 0.16 * (0.4 + k), v + 0.14 * (0.4 + k)) < r * 0.92;
    return a && !b;
  }
  return Math.abs(fr((x + y + Math.sin(x / (q * 1.8)) * q * 0.5) / q) - 0.5) < 0.5 * k;
}

export default still({
  id: 'chinese-paper-cut',
  name: 'Chinese Paper Cut',
  blurb: 'Jianzhi: a single sheet of red paper cut with a small knife. Dark areas stay solid, midtones are cut into fine slits and crescents, and the light is cut away completely.',
  maxSide: 1100,
  params: [
    { key: 'cut', label: 'Paper left', type: 'range', min: 15, max: 85, step: 1, default: 52 },
    { key: 'fine', label: 'Fine cutting range', type: 'range', min: 5, max: 60, step: 1, default: 30 },
    { key: 'pattern', label: 'Cuts', type: 'select', default: 'slits', options: [['slits', 'Slits'], ['crescent', 'Crescents'], ['teeth', 'Teeth'], ['dots', 'Dots']] },
    { key: 'size', label: 'Cut size', type: 'range', min: 4, max: 16, step: 1, default: 8 },
    { key: 'frame', label: 'Border', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'paper', label: 'Paper', type: 'select', default: 'red', options: [['red', 'Red'], ['black', 'Black'], ['gold', 'Gold']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, smp = sampler(cache, d, W, H, 1.6 * sc), T = smp.L, q = p.size * sc * 1.5;
    const T1 = p.cut / 100, T0 = T1 - p.fine / 100, fm = Math.round(Math.min(W, H) * 0.06 * (p.frame / 100));
    const M = new Float32Array(W * H);
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) {
      const v = 1 - T[i];
      let m;
      if (fm > 0 && (x < fm || y < fm || x >= W - fm || y >= H - fm)) {
        const dEdge = Math.min(x, y, W - 1 - x, H - 1 - y), along = (x < fm || x >= W - fm) && y >= fm && y < H - fm ? y : x;
        if (dEdge < fm * 0.18) m = 1; else {
          const s = along / (fm * 0.95), dd = (dEdge - fm * 0.18) / (fm * 0.82);
          m = Math.abs(fr(s) - 0.5) + Math.abs(dd - 0.5) < 0.3 ? 0 : (Math.hypot(fr(s + 0.5) - 0.5, dd - 0.5) < 0.1 && (Math.floor(s) % 2) === 0 ? 0 : 1);
        }
      } else if (v <= T0) m = 0; else { const kk = smoothstep(T1 + 0.3, T0, v); m = kk > 0.05 && cutAt(p.pattern, x, y, q, kk) ? 0 : 1; }
      M[i] = m;
    }
    const A = boxBlur(M, W, H, 1), paper = PAPERS[p.paper], layer = env.makeCanvas(W, H), lc = layer.getContext('2d'), img = lc.createImageData(W, H), o = img.data;
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      const a = smoothstep(0.3, 0.7, A[i]), f = 0.9 + 0.12 * fbm(x / (7 * sc), y / (1.4 * sc), 4, 3) + (hash2(x, y, 4) - 0.5) * 0.05;
      o[k] = paper[0] * f; o[k + 1] = paper[1] * f; o[k + 2] = paper[2] * f; o[k + 3] = a * 255;
    }
    lc.putImageData(img, 0, 0);
    // corner flowers, cut into the border
    if (fm > 6) {
      lc.globalCompositeOperation = 'destination-out'; lc.fillStyle = '#000';
      for (const [cx, cy] of [[fm, fm], [W - fm, fm], [fm, H - fm], [W - fm, H - fm]]) {
        lc.beginPath();
        for (let j = 0; j < 8; j++) { const a = (j / 8) * TAU; lc.ellipse(cx + Math.cos(a) * fm * 0.62, cy + Math.sin(a) * fm * 0.62, fm * 0.34, fm * 0.12, a, 0, TAU); }
        lc.moveTo(cx + fm * 0.2, cy); lc.arc(cx, cy, fm * 0.2, 0, TAU);
        lc.fill();
      }
      lc.globalCompositeOperation = 'source-over';
    }
    const [b1, b2] = BACK[p.paper], gr = ctx.createLinearGradient(0, 0, W, H);
    gr.addColorStop(0, b1); gr.addColorStop(1, b2); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.shadowColor = 'rgba(40,10,10,0.5)'; ctx.shadowBlur = 5 * sc; ctx.shadowOffsetX = 2 * sc; ctx.shadowOffsetY = 3 * sc; ctx.drawImage(layer, 0, 0); ctx.restore();
  },
});
