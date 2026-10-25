// src/engine/styles/wave-function-collapse.js
import { still, rng, clamp, lerp } from '../utils.js';
import { pixels, sampler } from '../helpers.js';

// A tile is a 4-bit number: bit 0 north, 1 east, 2 south, 3 west. A set bit means a line leaves through that side.
const N = 1, E = 2, S = 4, Wb = 8;
const opposite = [S, Wb, N, E];
const pop = (t) => (t & 1) + ((t >> 1) & 1) + ((t >> 2) & 1) + ((t >> 3) & 1);

export default still({
  id: 'wave-function-collapse',
  name: 'Wave Function Collapse',
  blurb: 'Every cell starts as every possible tile. The most constrained cell settles first, and its neighbours must agree, until the whole sheet is one connected drawing.',
  maxSide: 1000,
  params: [
    { key: 'size', label: 'Tile size', type: 'range', min: 10, max: 44, step: 1, default: 20 },
    { key: 'draw', label: 'Line style', type: 'select', default: 'round', options: [['straight', 'Straight pipes'], ['round', 'Rounded corners'], ['chamfer', 'Chamfered circuit']] },
    { key: 'density', label: 'Picture sets the density', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'line', label: 'Line weight', type: 'range', min: 0.15, max: 0.7, step: 0.01, default: 0.34, fmt: (v) => v.toFixed(2) },
    { key: 'colour', label: 'Colour', type: 'select', default: 'picture', options: [['picture', 'Colours of the picture'], ['ink', 'Black ink']] },
    { key: 'paper', label: 'Paper', type: 'select', default: 'cream', options: [['cream', 'Cream'], ['night', 'Night']] },
    { key: 'seed', label: 'Collapse again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, s = p.size * sc, cols = Math.ceil(W / s), rows = Math.ceil(H / s), n = cols * rows, night = p.paper === 'night';
    const smp = sampler(cache, d, W, H, s * 0.6);
    const key = [p.size, p.density, p.seed, p.paper, W].join('|');
    if (cache.key !== key) {
      const r = rng(p.seed * 53 + 11), dom = new Uint16Array(n).fill(0xffff), tile = new Int8Array(n).fill(-1), dens = p.density / 100;
      const weight = new Float32Array(n * 16);
      for (let c = 0; c < n; c++) {
        const x = ((c % cols) + 0.5) * s, y = (((c / cols) | 0) + 0.5) * s, t = smp.tone(x, y), heavy = night ? t : 1 - t, target = lerp(1.6, 0.3 + 3.2 * heavy, dens);
        for (let k = 0; k < 16; k++) { const dv = pop(k) - target; weight[c * 16 + k] = Math.exp(-(dv * dv) / 1.1) * (k === 0 ? 0.3 : 1); }
      }
      const nb = (c, dir) => { const x = c % cols, y = (c / cols) | 0; if (dir === 0) return y > 0 ? c - cols : -1; if (dir === 1) return x < cols - 1 ? c + 1 : -1; if (dir === 2) return y < rows - 1 ? c + cols : -1; return x > 0 ? c - 1 : -1; };
      // edges on the border of the sheet are closed, so lines never leave the picture
      const bit = [N, E, S, Wb];
      for (let c = 0; c < n; c++) { let m = 0xffff; for (let dir = 0; dir < 4; dir++) if (nb(c, dir) < 0) for (let k = 0; k < 16; k++) if (k & bit[dir]) m &= ~(1 << k); dom[c] = m; }
      const stack = [];
      const propagate = () => {
        while (stack.length) {
          const c = stack.pop(), D = dom[c];
          for (let dir = 0; dir < 4; dir++) {
            const q = nb(c, dir); if (q < 0) continue;
            let can0 = false, can1 = false;
            for (let k = 0; k < 16; k++) if (D & (1 << k)) { if (k & bit[dir]) can1 = true; else can0 = true; }
            const od = (dir + 2) % 4; let nd = dom[q];
            for (let k = 0; k < 16; k++) if (nd & (1 << k)) { const has = (k & bit[od]) ? 1 : 0; if ((has && !can1) || (!has && !can0)) nd &= ~(1 << k); }
            if (nd !== dom[q]) { dom[q] = nd; if (nd === 0) nd = 1; stack.push(q); }
          }
        }
      };
      for (let c = 0; c < n; c++) stack.push(c); propagate();
      const count = (D) => { let k = 0; for (; D; D &= D - 1) k++; return k; };
      for (let step = 0; step < n; step++) {
        let best = -1, be = 1e9;
        for (let c = 0; c < n; c++) { if (tile[c] >= 0) continue; const k = count(dom[c]); if (k === 0) { tile[c] = 0; continue; } const e = k + r() * 0.4; if (k > 1 || true) if (e < be) { be = e; best = c; } }
        if (best < 0) break;
        const D = dom[best]; let tot = 0; for (let k = 0; k < 16; k++) if (D & (1 << k)) tot += weight[best * 16 + k];
        let u = r() * tot, pick = 0; for (let k = 0; k < 16; k++) if (D & (1 << k)) { u -= weight[best * 16 + k]; if (u <= 0) { pick = k; break; } }
        tile[best] = pick; dom[best] = 1 << pick; stack.push(best); propagate();
      }
      for (let c = 0; c < n; c++) if (tile[c] < 0) tile[c] = 0;
      cache.tile = tile; cache.key = key;
    }
    const tile = cache.tile;
    ctx.fillStyle = night ? '#0c0c12' : '#f3eddf'; ctx.fillRect(0, 0, W, H);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const mid = [[0, -0.5], [0.5, 0], [0, 0.5], [-0.5, 0]];
    for (let c = 0; c < n; c++) {
      const t = tile[c]; if (!t) continue;
      const cx = ((c % cols) + 0.5) * s, cy = (((c / cols) | 0) + 0.5) * s, tn = smp.tone(cx, cy), heavy = night ? tn : 1 - tn;
      if (p.colour === 'ink') ctx.strokeStyle = ctx.fillStyle = night ? '#ece8dc' : '#1c1a20';
      else { const cc = smp.rgb(cx, cy), k = night ? 1.2 : 0.8; ctx.strokeStyle = ctx.fillStyle = `rgb(${Math.min(255, cc[0] * k) | 0},${Math.min(255, cc[1] * k) | 0},${Math.min(255, cc[2] * k) | 0})`; }
      ctx.lineWidth = s * p.line * (0.75 + 0.5 * heavy);
      const bits = [0, 1, 2, 3].filter((k) => t & (1 << k)), cnt = bits.length;
      ctx.beginPath();
      if (cnt === 2 && (p.draw === 'round' || p.draw === 'chamfer') && Math.abs(bits[0] - bits[1]) !== 2) {
        const a = mid[bits[0]], b = mid[bits[1]];
        if (p.draw === 'chamfer') { ctx.moveTo(cx + a[0] * s, cy + a[1] * s); ctx.lineTo(cx + b[0] * s, cy + b[1] * s); }
        else {
          // corner arc about the tile corner shared by the two sides
          const ax = a[0] + b[0], ay = a[1] + b[1], kx = cx + ax * s, ky = cy + ay * s, a0 = Math.atan2(a[1] * s - ay * s, a[0] * s - ax * s), a1 = Math.atan2(b[1] * s - ay * s, b[0] * s - ax * s);
          let da = a1 - a0; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
          ctx.arc(kx, ky, s * 0.5, a0, a0 + da, da < 0);
        }
      } else for (const k of bits) { ctx.moveTo(cx, cy); ctx.lineTo(cx + mid[k][0] * s, cy + mid[k][1] * s); }
      ctx.stroke();
      if (cnt !== 2 || (bits[0] + 2 !== bits[1] && p.draw === 'straight')) { ctx.beginPath(); ctx.arc(cx, cy, ctx.lineWidth * (cnt >= 3 ? 0.78 : cnt === 1 ? 0.9 : 0.5), 0, Math.PI * 2); ctx.fill(); }
    }
  },
});
