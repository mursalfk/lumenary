// src/engine/styles/ink-in-water.js
import { clamp, lerp, rng, vnoise, TAU } from '../utils.js';

const WATER = { clear: [246, 247, 244], blue: [214, 230, 240], dark: [14, 18, 26] };

export default {
  id: 'ink-in-water',
  name: 'Ink in Water',
  kind: 'animated',
  maxSide: 720,
  thumbAt: 4,
  blurb: 'Drops of ink released into still water curl and bloom along slow currents. Each wisp carries the colour of the picture where it was released. Drag across the water to add ink.',
  params: [
    { key: 'rate', label: 'How often drops fall', type: 'range', min: 5, max: 100, step: 1, default: 50 },
    { key: 'amount', label: 'Ink in each drop', type: 'range', min: 20, max: 100, step: 1, default: 60 },
    { key: 'flow', label: 'Strength of the currents', type: 'range', min: 5, max: 100, step: 1, default: 65 },
    { key: 'scale', label: 'Size of the curls', type: 'range', min: 10, max: 100, step: 1, default: 45 },
    { key: 'linger', label: 'How long ink lingers', type: 'range', min: 0, max: 100, step: 1, default: 75 },
    { key: 'water', label: 'Water', type: 'select', default: 'clear', options: [['clear', 'Clear'], ['blue', 'Pale blue'], ['dark', 'Dark']] },
    { key: 'seed', label: 'New currents', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, img = null, cvs = null, c2 = null, ps = [], built = '', time = 0, r = rng(1), acc = 0, lastPtr = null, MAX = 6500;

    function build() {
      const key = [p.water, p.seed, W].join('|'); if (key === built) return;
      img = work.getContext('2d').getImageData(0, 0, W, H).data; r = rng(p.seed * 41 + 3);
      cvs = env.makeCanvas(W, H); c2 = cvs.getContext('2d'); const w = WATER[p.water] || WATER.clear; c2.fillStyle = `rgb(${w})`; c2.fillRect(0, 0, W, H);
      ps = []; time = 0; acc = 0; for (let i = 0; i < 4; i++) { const [x, y] = spot(); drop(x, y, 1); } built = key;
    }
    // the ink takes its colour from the picture at the spot where it is released, a little richer than the paper
    function inkAt(x, y) {
      const o = ((clamp(y | 0, 0, H - 1)) * W + clamp(x | 0, 0, W - 1)) * 4, R = img[o], G = img[o + 1], B = img[o + 2], L = 0.3 * R + 0.59 * G + 0.11 * B, dk = p.water === 'dark', s = 1.5;
      const m = (v) => clamp(L + (v - L) * s, 0, 255) * (dk ? 1.25 : 0.82);
      return `rgb(${m(R) | 0},${m(G) | 0},${m(B) | 0})`;
    }
    function vivid(x, y) { const o = (y * W + x) * 4; return Math.max(img[o], img[o + 1], img[o + 2]) - Math.min(img[o], img[o + 1], img[o + 2]); }
    function drop(x, y, k) {
      const n = Math.round(380 * (p.amount / 100) * k), sc = W / 720, col = inkAt(x, y);
      for (let i = 0; i < n && ps.length < MAX; i++) { const a = r() * TAU, d = Math.sqrt(r()) * 9 * sc; ps.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, vx: Math.cos(a) * 14 * sc * r(), vy: Math.sin(a) * 14 * sc * r() + 6 * sc, age: 0, life: 6 + r() * 7, r0: (1.5 + r() * 2.6) * sc, col }); }
    }
    function spot() { let bx = r() * W, by = r() * H * 0.85, bv = -1; for (let i = 0; i < 6; i++) { const x = r() * W, y = r() * H * 0.85, v = vivid(x | 0, y | 0); if (v > bv) { bv = v; bx = x; by = y; } } return [bx, by]; }
    const pot = (x, y, t, s) => vnoise(x * s + t * 0.11, y * s - t * 0.07, 11);

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; built = ''; },
      setParams(np) { p = np; },
      step(dt, ptr) {
        build(); dt = Math.min(dt, 0.05); time += dt;
        const sc = W / 720, s = 0.0035 / (0.25 + p.scale / 100 * 1.4) / sc, e = 6 * sc, F = (p.flow / 100) * 150 * sc;
        acc += dt * (p.rate / 100) * 1.2; while (acc >= 1) { acc -= 1; const [x, y] = spot(); drop(x, y, 1); }
        if (ptr && ptr.inside) { const x = ptr.x * W, y = ptr.y * H; if (lastPtr && (ptr.down || Math.hypot(x - lastPtr[0], y - lastPtr[1]) > 4 * sc)) drop(x, y, 0.12); lastPtr = [x, y]; } else lastPtr = null;
        // fade the picture of old ink back toward the water
        const fadeA = lerp(0.07, 0.003, p.linger / 100), w = WATER[p.water] || WATER.clear; c2.globalAlpha = 1;
        c2.fillStyle = `rgba(${w[0]},${w[1]},${w[2]},${fadeA * dt * 30})`; c2.fillRect(0, 0, W, H);
        c2.lineWidth = 1;
        for (let i = ps.length - 1; i >= 0; i--) {
          const q = ps[i]; q.age += dt;
          if (q.age > q.life || q.x < -30 || q.x > W + 30 || q.y > H + 30) { ps[i] = ps[ps.length - 1]; ps.pop(); continue; }
          const dpx = (pot(q.x, q.y + e, time, s) - pot(q.x, q.y - e, time, s)) / (2 * e), dpy = (pot(q.x + e, q.y, time, s) - pot(q.x - e, q.y, time, s)) / (2 * e);
          q.vx = q.vx * 0.9 + dpx * F * 30 * dt * 4 * 0.9 + (r() - 0.5) * 6 * sc; q.vy = q.vy * 0.9 - dpy * F * 30 * dt * 4 * 0.9 + 1.5 * sc + (r() - 0.5) * 6 * sc;
          q.x += q.vx * dt * 3; q.y += q.vy * dt * 3;
          const a = clamp(1 - q.age / q.life), rad = q.r0 * (1 + q.age * 0.45), al = 0.07 * Math.pow(a, 0.6) * (0.6 + 0.4 * (p.amount / 100));
          c2.globalAlpha = al; c2.fillStyle = q.col; c2.beginPath(); c2.arc(q.x, q.y, rad, 0, TAU); c2.fill();
        }
        c2.globalAlpha = 1;
      },
      draw(ctx, t, dt, ptr) {
        if (!W) return;
        if (dt > 0) this.step(dt, ptr); else build();
        ctx.drawImage(cvs, 0, 0, W, H);
      },
      dispose() {},
    };
  },
};
