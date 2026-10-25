// src/engine/styles/flow-field.js
import { still, rng, clamp, lerp, smoothstep, sobel, TAU } from '../utils.js';
import { pixels, sampler, fbm } from '../helpers.js';

export default still({
  id: 'flow-field',
  name: 'Flow Field',
  blurb: 'Evenly spaced streamlines that follow a drifting field. Near the edges of your picture they turn to run along it.',
  maxSide: 1000,
  params: [
    { key: 'space', label: 'Line spacing', type: 'range', min: 3, max: 16, step: 0.5, default: 6, fmt: (v) => v.toFixed(1) },
    { key: 'scale', label: 'Size of the swirls', type: 'range', min: 10, max: 100, step: 1, default: 45 },
    { key: 'follow', label: 'Follow the picture', type: 'range', min: 0, max: 100, step: 1, default: 65 },
    { key: 'weight', label: 'Picture sets line weight', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'colour', label: 'Colour', type: 'select', default: 'picture', options: [['picture', 'Colours of the picture'], ['ink', 'Ink on paper'], ['night', 'Light on night']] },
    { key: 'seed', label: 'New field', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, sep = p.space * sc, r = rng(p.seed * 17 + 3), seed = p.seed * 5 + 1;
    const smp = sampler(cache, d, W, H, 3.5 * sc);
    if (cache.sobK !== W) { cache.sob = sobel(smp.L, W, H, 1); cache.sobK = W; }
    const { gx, gy, mag } = cache.sob, follow = p.follow / 100, nscale = 0.0045 / (0.3 + p.scale / 100 * 1.4) / sc;
    const night = p.colour === 'night';
    ctx.fillStyle = night ? '#0b0c12' : '#f4efe3'; ctx.fillRect(0, 0, W, H);
    const cell = sep / Math.SQRT2, gwid = Math.ceil(W / cell) + 1, ghei = Math.ceil(H / cell) + 1, grid = new Int32Array(gwid * ghei).fill(-1);
    const PX = [], PY = [], PL = [], PO = [];
    const dir = (x, y, out) => {
      const a = fbm(x * nscale, y * nscale, seed, 3) * TAU * 2.2; let vx = Math.cos(a), vy = Math.sin(a);
      const xi = clamp(x | 0, 0, W - 1), yi = clamp(y | 0, 0, H - 1), i = yi * W + xi, m = mag[i];
      if (follow > 0 && m > 1e-5) { const w = follow * smoothstep(0.015, 0.12, m), tx = -gy[i] / (m * 4 + 1e-9), ty = gx[i] / (m * 4 + 1e-9), tl = Math.hypot(tx, ty) + 1e-9; vx = vx * (1 - w) + (tx / tl) * w; vy = vy * (1 - w) + (ty / tl) * w; }
      const l = Math.hypot(vx, vy) + 1e-9; out[0] = vx / l; out[1] = vy / l;
    };
    const free = (x, y, line, ord) => {
      if (x < 0 || y < 0 || x >= W || y >= H) return false;
      const cx = (x / cell) | 0, cy = (y / cell) | 0, s2 = sep * sep * 0.64;
      for (let j = Math.max(0, cy - 2); j <= Math.min(ghei - 1, cy + 2); j++) for (let i = Math.max(0, cx - 2); i <= Math.min(gwid - 1, cx + 2); i++) {
        const k = grid[j * gwid + i]; if (k < 0) continue;
        if (PL[k] === line && ord - PO[k] < 14) continue;
        const dx = PX[k] - x, dy = PY[k] - y; if (dx * dx + dy * dy < s2) return false;
      }
      return true;
    };
    const lines = [], v = [0, 0], h = sep * 0.45, maxSteps = 260;
    const trace = (x0, y0, id) => {
      const fwd = [], bwd = [];
      for (const side of [1, -1]) {
        let x = x0, y = y0, px = 0, py = 0, ord = 0; const arr = side > 0 ? fwd : bwd;
        for (let s = 0; s < maxSteps; s++) {
          dir(x, y, v); let dx = v[0], dy = v[1];
          if (s === 0) { dx *= side; dy *= side; } else if (dx * px + dy * py < 0) { dx = -dx; dy = -dy; }
          const nx = x + dx * h, ny = y + dy * h;
          if (!free(nx, ny, id, (side > 0 ? 100 : -100) + ord + 1)) break;
          x = nx; y = ny; px = dx; py = dy; ord++; arr.push([x, y]);
          const idx = PX.length; PX.push(x); PY.push(y); PL.push(id); PO.push((side > 0 ? 100 : -100) + ord);
          grid[((y / cell) | 0) * gwid + ((x / cell) | 0)] = idx;
        }
      }
      return [...bwd.reverse(), [x0, y0], ...fwd];
    };
    const seeds = []; const sg = sep * 1.1;
    for (let y = sg / 2; y < H; y += sg) for (let x = sg / 2; x < W; x += sg) seeds.push([x + (r() - 0.5) * sg, y + (r() - 0.5) * sg]);
    for (let i = seeds.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [seeds[i], seeds[j]] = [seeds[j], seeds[i]]; }
    let id = 0;
    for (const [sx, sy] of seeds) {
      if (!free(sx, sy, -1, 0)) continue;
      const idx = PX.length; PX.push(sx); PY.push(sy); PL.push(id); PO.push(0); grid[((sy / cell) | 0) * gwid + ((sx / cell) | 0)] = idx;
      const ln = trace(sx, sy, id); id++;
      if (ln.length >= 5) lines.push(ln);
    }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const wt = p.weight / 100;
    for (const ln of lines) {
      const mid = ln[ln.length >> 1], t = smp.tone(mid[0], mid[1]), c = smp.rgb(mid[0], mid[1]), heavy = night ? t : 1 - t;
      ctx.lineWidth = sep * lerp(0.3, 0.1 + 0.62 * heavy, wt);
      if (p.colour === 'picture') { const k = night ? 1.15 : 0.84; ctx.strokeStyle = `rgb(${Math.min(255, c[0] * k) | 0},${Math.min(255, c[1] * k) | 0},${Math.min(255, c[2] * k) | 0})`; }
      else ctx.strokeStyle = night ? 'rgba(236,232,220,0.92)' : 'rgba(30,26,30,0.92)';
      ctx.beginPath(); ctx.moveTo(ln[0][0], ln[0][1]);
      for (let i = 1; i < ln.length - 1; i++) ctx.quadraticCurveTo(ln[i][0], ln[i][1], (ln[i][0] + ln[i + 1][0]) / 2, (ln[i][1] + ln[i + 1][1]) / 2);
      ctx.lineTo(ln[ln.length - 1][0], ln[ln.length - 1][1]); ctx.stroke();
    }
  },
});
