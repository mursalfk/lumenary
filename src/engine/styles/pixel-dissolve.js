// src/engine/styles/pixel-dissolve.js
import { clamp, lerp, smoothstep, hash2, vnoise } from '../utils.js';

const WINDS = { right: [1, -0.12], left: [-1, -0.12], up: [0.1, -1], fall: [0.06, 1] };
const GROUNDS = { black: '#050506', white: '#f4f2ec', ghost: '#050506' };

export default {
  id: 'pixel-dissolve',
  name: 'Pixel Dissolve',
  kind: 'animated',
  maxSide: 720,
  thumbAt: 2.2,
  blurb: 'The picture breaks into square pixels that lift away like sand in a wind, drift, and then find their way back, over and over. The cursor blows a hole in it.',
  params: [
    { key: 'size', label: 'Pixel size', type: 'range', min: 5, max: 26, step: 1, default: 10 },
    { key: 'speed', label: 'Speed', type: 'range', min: 10, max: 100, step: 1, default: 50 },
    { key: 'scatter', label: 'How far they fly', type: 'range', min: 10, max: 100, step: 1, default: 55 },
    { key: 'wind', label: 'Wind', type: 'select', default: 'right', options: [['right', 'To the right'], ['left', 'To the left'], ['up', 'Upward'], ['fall', 'Falling'], ['burst', 'Out from the middle']] },
    { key: 'ground', label: 'Behind', type: 'select', default: 'ghost', options: [['ghost', 'Faint picture'], ['black', 'Black'], ['white', 'White']] },
    { key: 'seed', label: 'Another gust', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, cols = 0, rows = 0, s = 0, small = null, sctx = null, css = [], built = '', time = 0;

    // the picture at one colour per block, kept both as a tiny canvas (to draw the intact parts in one go) and as CSS colours
    function read() {
      sctx.imageSmoothingQuality = 'high'; sctx.drawImage(work, 0, 0, cols, rows);
      const d = sctx.getImageData(0, 0, cols, rows).data; css = new Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) css[i] = `rgb(${d[i * 4]},${d[i * 4 + 1]},${d[i * 4 + 2]})`;
    }
    function build() {
      const key = [p.size, W, H].join('|'); if (key === built) return;
      s = Math.max(3, Math.round(p.size * (W / 720))); cols = Math.ceil(W / s); rows = Math.ceil(H / s);
      small = env.makeCanvas(cols, rows); sctx = small.getContext('2d');
      read(); built = key;
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; built = ''; },
      // A new video frame of the same size: recolour the blocks. Where each block is depends only on the time.
      setFrame(w) { work = w; if (built) read(); },
      setParams(np) { p = np; },
      step(dt) { build(); time += Math.min(dt, 0.05); },
      draw(ctx, t, dt, ptr) {
        if (!W) return;
        if (dt > 0) this.step(dt, ptr); else build();
        const period = lerp(11, 4, p.speed / 100), ph = (time % period) / period, seed = p.seed * 7, far = (p.scatter / 100) * W * 0.8, burst = p.wind === 'burst', [wx, wy] = WINDS[p.wind] || WINDS.right;
        const inside = ptr && ptr.inside, px = inside ? ptr.x * W : 0, py = inside ? ptr.y * H : 0, reach = W * 0.16;
        // one cycle: hold, come apart, drift, come back, hold. `out` and `home` are how far those two sweeps have got.
        const out = (ph - 0.16) / 0.3, home = (ph - 0.6) / 0.3, moving = out > 0 && home < 1.3;
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.fillStyle = GROUNDS[p.ground] || GROUNDS.black; ctx.fillRect(0, 0, W, H);
        if (p.ground === 'ghost') { ctx.globalAlpha = 0.14; ctx.imageSmoothingEnabled = true; ctx.drawImage(work, 0, 0, W, H); ctx.globalAlpha = 1; }
        ctx.imageSmoothingEnabled = false; ctx.drawImage(small, 0, 0, cols * s, rows * s); ctx.imageSmoothingEnabled = true;
        if (!moving && !inside) return;
        const ground = GROUNDS[p.ground] || GROUNDS.black;
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
          const u = i / cols, v = j / rows, n = hash2(i, j, seed);
          // the order in which blocks leave: the downwind edge goes first, with some disorder
          let first;
          if (burst) first = Math.hypot(u - 0.5, v - 0.5) * 1.4; else first = wx > 0.5 ? 1 - u : wx < -0.5 ? u : wy < 0 ? v : 1 - v;
          const o = first * 0.7 + n * 0.3;
          let a = Math.min(smoothstep(o * 0.72, o * 0.72 + 0.28, out), 1 - smoothstep((1 - o) * 0.72, (1 - o) * 0.72 + 0.28, home));
          const hx = (i + 0.5) * s, hy = (j + 0.5) * s;
          let bx = 0, by = 0;
          if (inside) { const dx = hx - px, dy = hy - py, d = Math.hypot(dx, dy); if (d < reach) { const k = 1 - d / reach; a = Math.max(a, k * 0.85); bx = (dx / (d + 1)) * k * reach * 0.6; by = (dy / (d + 1)) * k * reach * 0.6; } }
          if (a <= 0.002) continue;
          // flight: along the wind, each block going its own distance, with a slow tumble across it
          const e = a * a * (3 - 2 * a), dist = far * (0.35 + 0.65 * hash2(i, j, seed + 3)) * e, curl = (vnoise(u * 5 + time * 0.25, v * 5, seed + 5) - 0.5) * far * 0.5 * e;
          let dx, dy;
          if (burst) { const an = Math.atan2(v - 0.5, u - 0.5) + (n - 0.5) * 0.8; dx = Math.cos(an) * dist; dy = Math.sin(an) * dist; } else { dx = wx * dist - wy * curl; dy = wy * dist + wx * curl; }
          const size = s * (1 - 0.55 * e);
          ctx.fillStyle = ground; ctx.globalAlpha = 1; ctx.fillRect(i * s, j * s, s, s);
          if (p.ground === 'ghost') { ctx.globalAlpha = 0.14; ctx.fillStyle = css[j * cols + i]; ctx.fillRect(i * s, j * s, s, s); }
          ctx.globalAlpha = clamp(1 - e * e * 0.92); ctx.fillStyle = css[j * cols + i];
          ctx.fillRect(hx + dx + bx - size / 2, hy + dy + by - size / 2, size, size);
        }
        ctx.globalAlpha = 1;
      },
      dispose() {},
    };
  },
};
