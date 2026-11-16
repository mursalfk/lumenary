// src/engine/styles/dust-snap.js
import { clamp, lerp, smoothstep, hash2, vnoise } from '../utils.js';
import { readFrame } from '../history.js';

const HOLD = 0.9, GONE = 0.7;      // seconds the picture stays whole, and stays gone

export default {
  id: 'dust-snap',
  name: 'Dust Snap',
  kind: 'animated',
  maxSide: 640,
  thumbAt: 2.3,
  blurb: 'The picture crumbles to dust, grain by grain, and the wind carries it away. Then it comes back together. Every grain keeps its own colour on the way, and on video the dust is made from the scene that is playing.',
  params: [
    { key: 'from', label: 'Where it starts', type: 'select', default: 'left', options: [['left', 'The left'], ['right', 'The right'], ['top', 'The top'], ['bottom', 'The bottom'], ['centre', 'The middle'], ['cursor', 'The cursor'], ['random', 'Everywhere'] ] },
    { key: 'grain', label: 'Size of the dust', type: 'range', min: 2, max: 9, step: 1, default: 3 },
    { key: 'wind', label: 'Wind direction', type: 'range', min: 0, max: 359, step: 1, default: 25, fmt: (v) => v + '°' },
    { key: 'spread', label: 'How far it drifts', type: 'range', min: 10, max: 100, step: 1, default: 60 },
    { key: 'speed', label: 'Speed', type: 'range', min: 10, max: 100, step: 1, default: 50 },
    { key: 'left', label: 'Where the picture was', type: 'select', default: 'dark', options: [['dark', 'Empty and dark'], ['paper', 'Empty and white'], ['ghost', 'A faint ghost']] },
    { key: 'reform', label: 'Comes back together', type: 'toggle', default: true },
    { key: 'seed', label: 'Another gust', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, cur = null, fresh = true, out = null, clock = 0, gx = 0, gy = 0, g = 2, tau = null, vx = null, vy = null, ph = null, built = '', ox = 0.5, oy = 0.5, cycle = -1, ptrIn = false, px = 0.5, py = 0.5;
    const snapTime = () => lerp(5.2, 1.7, p.speed / 100), total = () => HOLD + snapTime() + GONE + (p.reform ? snapTime() * 0.75 : 0.4);

    // How far through the snap the picture is: 0 whole, 1 gone. Coming back, the same path is played backwards.
    function progress(t) {
      const s = snapTime(), re = p.reform ? s * 0.75 : 0.4;
      if (t < HOLD) return 0;
      if (t < HOLD + s) return (t - HOLD) / s;
      if (t < HOLD + s + GONE) return 1;
      if (t < HOLD + s + GONE + re) return p.reform ? 1 - (t - HOLD - s - GONE) / re : 1;
      return 0;
    }

    function build() {
      const key = [W, H, p.grain, p.from, p.seed, p.wind, ox.toFixed(2), oy.toFixed(2)].join('|'); if (key === built) return; built = key;
      g = Math.max(2, Math.round(p.grain * (W / 640))); gx = Math.ceil(W / g); gy = Math.ceil(H / g);
      const n = gx * gy, a = (p.wind * Math.PI) / 180, wx = Math.cos(a), wy = -Math.sin(a), seed = p.seed * 17;
      tau = new Float32Array(n); vx = new Float32Array(n); vy = new Float32Array(n); ph = new Float32Array(n);
      for (let j = 0, i = 0; j < gy; j++) for (let x = 0; x < gx; x++, i++) {
        const cx = (x + 0.5) / gx, cy = (j + 0.5) / gy, r = hash2(x, j, seed), r2 = hash2(x, j, seed + 1), r3 = hash2(x, j, seed + 2), r4 = hash2(x, j, seed + 3);
        let sw;
        switch (p.from) {
          case 'left': sw = cx; break;
          case 'right': sw = 1 - cx; break;
          case 'top': sw = cy; break;
          case 'bottom': sw = 1 - cy; break;
          case 'centre': sw = Math.hypot(cx - 0.5, (cy - 0.5) * (H / W)) / 0.62; break;
          case 'cursor': sw = Math.hypot(cx - ox, (cy - oy) * (H / W)) / 1.05; break;
          default: sw = r;
        }
        // the front of the snap is ragged: a slow noise bends it, and each grain has a little luck of its own
        sw = clamp(sw + (vnoise(cx * 6, cy * 6, seed) - 0.5) * 0.34);
        tau[i] = 0.5 * clamp(sw * 0.86 + r * 0.14);
        const sp = 0.35 + 0.65 * r2;
        vx[i] = wx * sp * (0.7 + 0.6 * r3) + (r4 - 0.5) * 0.7; vy[i] = wy * sp * (0.7 + 0.6 * r3) + (hash2(x, j, seed + 4) - 0.5) * 0.7 - 0.12;
        ph[i] = r3 * 6.2832;
      }
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; fresh = true; built = ''; out = null; clock = 0; cycle = -1; },
      setFrame(w) { work = w; fresh = true; },
      setParams(np) { p = np; },
      step(dt, ptr) {
        if (!W) return;
        const was = Math.floor(clock / total());
        clock += dt;
        if (ptr && ptr.inside) { px = ptr.x; py = ptr.y; ptrIn = true; }
        // the cursor decides where the next snap starts, when the picture is whole
        const c = Math.floor(clock / total());
        if (c !== was || cycle < 0) { cycle = c; if (p.from === 'cursor') { ox = ptrIn ? px : 0.5; oy = ptrIn ? py : 0.5; } }
      },
      draw(ctx, t, dt, ptr) {
        if (!W) return;
        if (dt > 0) this.step(dt, ptr);
        if (fresh) { cur = readFrame(work, W, H); fresh = false; }
        build();
        if (!out) out = ctx.createImageData(W, H);
        const o = out.data, pr = progress(clock % total()), spreadPx = (p.spread / 100) * 0.55 * W, N = W * H, mode = p.left;
        // what is left where the picture was
        for (let i = 0, d = 0; i < N; i++, d += 4) {
          if (mode === 'paper') { o[d] = 238; o[d + 1] = 234; o[d + 2] = 224; }
          else if (mode === 'ghost') { const l = (0.299 * cur[d] + 0.587 * cur[d + 1] + 0.114 * cur[d + 2]) * 0.2 + 10; o[d] = l; o[d + 1] = l; o[d + 2] = l * 1.04; }
          else { o[d] = 9; o[d + 1] = 8; o[d + 2] = 11; }
          o[d + 3] = 255;
        }
        // grains that have not gone yet are the picture itself
        for (let j = 0, i = 0; j < gy; j++) for (let x = 0; x < gx; x++, i++) {
          if (pr > tau[i]) continue;
          const x0 = x * g, y0 = j * g, x1 = Math.min(W, x0 + g), y1 = Math.min(H, y0 + g);
          for (let y = y0; y < y1; y++) for (let xx = x0, d = (y * W + x0) * 4; xx < x1; xx++, d += 4) { o[d] = cur[d]; o[d + 1] = cur[d + 1]; o[d + 2] = cur[d + 2]; }
        }
        // grains in the air: each follows its own path, turns a little as it goes, and fades near the end
        for (let j = 0, i = 0; j < gy; j++) for (let x = 0; x < gx; x++, i++) {
          const s = clamp((pr - tau[i]) / 0.5);
          if (s <= 0 || pr <= tau[i]) continue;
          const alpha = 1 - smoothstep(0.55, 1, s);
          if (alpha <= 0.01) continue;
          const e = Math.pow(s, 1.25), sw = Math.sin(s * 7 + ph[i]) * 0.035 * W * s;
          const sx = x * g + g / 2 + vx[i] * spreadPx * e - sw * vy[i], sy = j * g + g / 2 + vy[i] * spreadPx * e + sw * vx[i];
          const size = Math.max(1, Math.round(g * (1 - 0.5 * s))), x0 = Math.round(sx - size / 2), y0 = Math.round(sy - size / 2);
          const cs = (Math.min(H - 1, j * g + (g >> 1)) * W + Math.min(W - 1, x * g + (g >> 1))) * 4, r = cur[cs], gg = cur[cs + 1], b = cur[cs + 2], a = alpha * 0.96;
          for (let yy = Math.max(0, y0); yy < Math.min(H, y0 + size); yy++) for (let xx = Math.max(0, x0), d = (yy * W + Math.max(0, x0)) * 4; xx < Math.min(W, x0 + size); xx++, d += 4) {
            o[d] += (r - o[d]) * a; o[d + 1] += (gg - o[d + 1]) * a; o[d + 2] += (b - o[d + 2]) * a;
          }
        }
        ctx.putImageData(out, 0, 0);
      },
      dispose() { out = null; },
    };
  },
};
