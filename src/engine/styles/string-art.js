// src/engine/styles/string-art.js
import { still, clamp, lerp, TAU } from '../utils.js';
import { pixels, sampler, stretchedL } from '../helpers.js';

export default still({
  id: 'string-art',
  name: 'String Art',
  blurb: 'One long thread wound between nails. At each turn the next nail is the one whose straight run covers the darkest part still unpainted.',
  maxSide: 900,
  params: [
    { key: 'shape', label: 'Board', type: 'select', default: 'round', options: [['round', 'Round'], ['frame', 'Frame']] },
    { key: 'nails', label: 'Nails', type: 'range', min: 60, max: 300, step: 4, default: 180 },
    { key: 'lines', label: 'Thread length', type: 'range', min: 400, max: 5000, step: 50, default: 3000 },
    { key: 'strength', label: 'Thread opacity', type: 'range', min: 5, max: 40, step: 1, default: 18, fmt: (v) => v + '%' },
    { key: 'colour', label: 'Thread', type: 'select', default: 'picture', options: [['picture', 'Colours of the picture'], ['ink', 'Black thread'], ['white', 'White thread']] },
    { key: 'nailDots', label: 'Show nails', type: 'toggle', default: true },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, white = p.colour === 'white';
    const key = [p.shape, p.nails, p.lines, p.strength, white, W].join('|');
    if (cache.key !== key) {
      const G = 240, gw = Math.max(40, Math.round((G * W) / Math.max(W, H))), gh = Math.max(40, Math.round((G * H) / Math.max(W, H))), k = gw / W, n = p.nails;
      const L = stretchedL(cache), T = new Float32Array(gw * gh);
      for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) { const l = L[Math.min(H - 1, Math.round(y / k)) * W + Math.min(W - 1, Math.round(x / k))]; T[y * gw + x] = clamp(white ? Math.pow(l, 1.2) : Math.pow(1 - l, 1.2)); }
      const nx = new Float32Array(n), ny = new Float32Array(n), cxg = gw / 2, cyg = gh / 2, rad = Math.min(gw, gh) / 2 - 1.5;
      if (p.shape === 'round') {
        for (let i = 0; i < n; i++) { const a = (i / n) * TAU; nx[i] = cxg + Math.cos(a) * rad; ny[i] = cyg + Math.sin(a) * rad; }
        for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) if (Math.hypot(x - cxg, y - cyg) > rad) T[y * gw + x] = 0;
      } else {
        const per = 2 * (gw + gh - 4);
        for (let i = 0; i < n; i++) {
          let s = (i / n) * per; const w = gw - 2, h = gh - 2;
          if (s < w) { nx[i] = 1 + s; ny[i] = 1; } else if ((s -= w) < h) { nx[i] = gw - 1; ny[i] = 1 + s; } else if ((s -= h) < w) { nx[i] = gw - 1 - s; ny[i] = gh - 1; } else { s -= w; nx[i] = 1; ny[i] = gh - 1 - s; }
        }
      }
      const step = p.strength / 100, seq = [0], used = new Set();
      let cur = 0;
      for (let t = 0; t < p.lines; t++) {
        let best = -1, bj = -1;
        for (let j = 0; j < n; j++) {
          const dd = Math.abs(j - cur); if (j === cur || Math.min(dd, n - dd) < 3) continue;
          const x0 = nx[cur], y0 = ny[cur], x1 = nx[j], y1 = ny[j], len = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0; if (len < 2) continue;
          const sx = (x1 - x0) / len, sy = (y1 - y0) / len; let x = x0, y = y0, sum = 0;
          for (let s = 0; s < len; s++) { sum += T[(y | 0) * gw + (x | 0)]; x += sx; y += sy; }
          let score = sum / len; if (used.has(cur * 1000 + j)) score *= 0.5;
          if (score > best) { best = score; bj = j; }
        }
        if (bj < 0 || best < 0.012) break;
        const x0 = nx[cur], y0 = ny[cur], x1 = nx[bj], y1 = ny[bj], len = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0, sx = (x1 - x0) / len, sy = (y1 - y0) / len;
        let x = x0, y = y0;
        for (let s = 0; s < len; s++) { const i = (y | 0) * gw + (x | 0); T[i] = Math.max(0, T[i] - step); x += sx; y += sy; }
        used.add(cur * 1000 + bj); used.add(bj * 1000 + cur); seq.push(bj); cur = bj;
      }
      cache.seq = seq; cache.nx = nx; cache.ny = ny; cache.k = k; cache.key = key;
    }
    const { seq, nx, ny, k } = cache, smp = sampler(cache, d, W, H, 4 * sc), picture = p.colour === 'picture', a = clamp(p.strength / 100 * 1.15, 0.05, 0.6);
    ctx.fillStyle = white ? '#0b0b10' : '#f3eddf'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalCompositeOperation = white ? 'lighter' : 'multiply'; ctx.lineWidth = Math.max(0.6, 0.75 * sc); ctx.lineCap = 'round';
    for (let i = 1; i < seq.length; i++) {
      const x0 = nx[seq[i - 1]] / k, y0 = ny[seq[i - 1]] / k, x1 = nx[seq[i]] / k, y1 = ny[seq[i]] / k;
      if (picture) { const c = smp.rgb((x0 + x1) / 2, (y0 + y1) / 2); ctx.strokeStyle = `rgba(${c[0] * 0.8 | 0},${c[1] * 0.8 | 0},${c[2] * 0.8 | 0},${a + 0.12})`; }
      else ctx.strokeStyle = white ? `rgba(255,252,244,${a})` : `rgba(20,18,22,${a})`;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
    ctx.restore();
    if (p.nailDots) { ctx.fillStyle = white ? '#e8d8a8' : '#3a342c'; for (let i = 0; i < nx.length; i++) { ctx.beginPath(); ctx.arc(nx[i] / k, ny[i] / k, Math.max(1.1, 1.8 * sc), 0, TAU); ctx.fill(); } }
  },
});
