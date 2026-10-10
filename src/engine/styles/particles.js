import { rng, lumOf, sampleImage, TAU } from '../utils.js';

export default {
  id: 'particles',
  number: 1,
  name: 'Particles',
  kind: 'animated',
  maxSide: 720,
  thumbAt: 2.4,
  blurb: 'Thousands of points assemble into your image and scatter away from the cursor.',
  params: [
    { key: 'density', label: 'Particles across', type: 'range', min: 50, max: 180, step: 1, default: 110 },
    { key: 'size', label: 'Particle size', type: 'range', min: 0.4, max: 2.5, step: 0.05, default: 1, fmt: (v) => v.toFixed(2) },
    { key: 'force', label: 'Cursor force', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'mode', label: 'Color', type: 'select', default: 'original', options: [['original', 'Original colors'], ['white', 'White']] },
    { key: 'bg', label: 'Background', type: 'color', default: '#050505' },
    { key: 'seed', label: 'Scatter again', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {};
    let N = 0, x, y, vx, vy, tx, ty, rad, groups = [], builtKey = '', prevDown = false, lastSeed = null;
    const rand = rng(11);

    function scatter() {
      for (let i = 0; i < N; i++) { x[i] = rand() * W; y[i] = rand() * H; vx[i] = 0; vy[i] = 0; }
    }

    function build() {
      const cols = Math.round(p.density), step = W / cols, rows = Math.max(1, Math.round(H / step));
      const d = sampleImage(env, work, cols, rows).data;
      N = cols * rows;
      x = new Float32Array(N); y = new Float32Array(N); vx = new Float32Array(N); vy = new Float32Array(N);
      tx = new Float32Array(N); ty = new Float32Array(N); rad = new Float32Array(N);
      const map = new Map();
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i, o = k * 4;
          tx[k] = (i + 0.5 + (rand() - 0.5) * 0.7) * step; ty[k] = (j + 0.5 + (rand() - 0.5) * 0.7) * step;
          const l = lumOf(d[o], d[o + 1], d[o + 2]);
          let key, css;
          if (p.mode === 'white') {
            key = 0; css = '#f2f2f0';
            rad[k] = step * 0.5 * p.size * (0.12 + 0.95 * Math.sqrt(l));
          } else {
            const r = (d[o] >> 4) * 17, g = (d[o + 1] >> 4) * 17, b = (d[o + 2] >> 4) * 17;
            key = (r << 16) | (g << 8) | b; css = `rgb(${r},${g},${b})`;
            rad[k] = step * 0.5 * p.size * 0.95;
          }
          let grp = map.get(key);
          if (!grp) { grp = { css, ids: [] }; map.set(key, grp); }
          grp.ids.push(k);
        }
      }
      groups = Array.from(map.values()).map((g) => ({ css: g.css, ids: Uint32Array.from(g.ids) }));
      scatter();
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; builtKey = ''; },
      setParams(np) {
        p = np;
        if (lastSeed !== null && np.seed !== lastSeed && N) scatter();
        lastSeed = np.seed;
      },
      step(dt, ptr) {
        const key = p.density + '|' + p.mode + '|' + p.size;
        if (builtKey !== key) { build(); builtKey = key; }
        dt = Math.min(Math.max(dt || 1 / 60, 1 / 120), 1 / 30);
        const damp = Math.exp(-11 * dt), k = 60;
        const active = ptr && ptr.inside && p.force > 0;
        const R = W * 0.16, R2 = R * R, acc = (p.force / 100) * 4200 * (W / 720);
        const px = active ? ptr.x * W : 0, py = active ? ptr.y * H : 0;
        const burst = ptr && ptr.down && !prevDown && ptr.inside;
        prevDown = !!(ptr && ptr.down);
        for (let i = 0; i < N; i++) {
          let ax = (tx[i] - x[i]) * k, ay = (ty[i] - y[i]) * k;
          if (active) {
            const dx = x[i] - px, dy = y[i] - py, d2 = dx * dx + dy * dy;
            if (d2 < R2) {
              const d = Math.sqrt(d2) + 0.001, f = 1 - d / R;
              ax += (dx / d) * f * f * acc; ay += (dy / d) * f * f * acc;
              if (burst) { vx[i] += (rand() - 0.5) * 900; vy[i] += (rand() - 0.5) * 900; }
            }
          }
          vx[i] = (vx[i] + ax * dt) * damp; vy[i] = (vy[i] + ay * dt) * damp;
          x[i] += vx[i] * dt; y[i] += vy[i] * dt;
        }
      },
      draw(ctx, t, dt, ptr) {
        this.step(dt, ptr);
        ctx.fillStyle = p.bg;
        ctx.fillRect(0, 0, W, H);
        for (const g of groups) {
          ctx.fillStyle = g.css;
          const ids = g.ids;
          for (let n = 0; n < ids.length; n++) {
            const i = ids[n], r = rad[i];
            if (r < 0.15) continue;
            if (r < 1.3) ctx.fillRect(x[i] - r, y[i] - r, r * 2, r * 2);
            else { ctx.beginPath(); ctx.arc(x[i], y[i], r, 0, TAU); ctx.fill(); }
          }
        }
      },
      dispose() {},
    };
  },
};
