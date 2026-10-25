// src/engine/styles/boids.js
import { clamp, lerp, rng, TAU, sobel } from '../utils.js';

export default {
  id: 'boids',
  name: 'Boids',
  kind: 'animated',
  maxSide: 720,
  thumbAt: 3.5,
  blurb: 'A flock with three rules: keep apart, fly the same way, stay close. Each bird paints in the colour beneath it, so the flock slowly paints your picture.',
  params: [
    { key: 'count', label: 'Birds', type: 'range', min: 50, max: 1400, step: 10, default: 520 },
    { key: 'speed', label: 'Speed', type: 'range', min: 20, max: 160, step: 1, default: 80 },
    { key: 'flock', label: 'How tightly they flock', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'seek', label: 'Pull toward light', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'look', label: 'Look', type: 'select', default: 'paint', options: [['paint', 'Painting the picture'], ['comet', 'Fading trails']] },
    { key: 'size', label: 'Brush size', type: 'range', min: 1, max: 8, step: 0.5, default: 3, fmt: (v) => v.toFixed(1) },
    { key: 'bg', label: 'Background', type: 'select', default: 'night', options: [['night', 'Night'], ['cream', 'Cream']] },
    { key: 'seed', label: 'Release again', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, n = 0, x, y, vx, vy, px, py, img, gx, gy, paint = null, pctx = null, built = '', r = rng(1), head, next, cellN = 0, gcols = 0, grows = 0;

    function build() {
      const key = [p.count, p.seed, p.bg, W].join('|');
      if (key === built) return;
      img = work.getContext('2d').getImageData(0, 0, W, H).data;
      const L = new Float32Array(W * H); let lo = 1, hi = 0;
      for (let i = 0; i < L.length; i++) { const l = (0.2126 * img[i * 4] + 0.7152 * img[i * 4 + 1] + 0.0722 * img[i * 4 + 2]) / 255; L[i] = l; if (l < lo) lo = l; if (l > hi) hi = l; }
      for (let i = 0; i < L.length; i++) L[i] = (L[i] - lo) / (hi - lo + 1e-6);
      const s = sobel(L, W, H, 1); gx = s.gx; gy = s.gy;
      r = rng(p.seed * 91 + 7); n = p.count;
      x = new Float32Array(n); y = new Float32Array(n); vx = new Float32Array(n); vy = new Float32Array(n); px = new Float32Array(n); py = new Float32Array(n);
      for (let i = 0; i < n; i++) { x[i] = r() * W; y[i] = r() * H; const a = r() * TAU; vx[i] = Math.cos(a) * 60; vy[i] = Math.sin(a) * 60; px[i] = x[i]; py[i] = y[i]; }
      paint = env.makeCanvas(W, H); pctx = paint.getContext('2d'); pctx.fillStyle = p.bg === 'night' ? '#0b0b10' : '#f4efe3'; pctx.fillRect(0, 0, W, H);
      built = key;
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; built = ''; },
      setParams(np) { p = np; },
      step(dt, ptr) {
        build();
        dt = Math.min(dt, 0.05);
        const sc = W / 720, perc = 46 * sc, cell = perc, cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1;
        if (cols * rows !== head?.length) { head = new Int32Array(cols * rows); gcols = cols; grows = rows; } head.fill(-1); if (!next || next.length !== n) next = new Int32Array(n);
        for (let i = 0; i < n; i++) { const c = clamp((y[i] / cell) | 0, 0, rows - 1) * cols + clamp((x[i] / cell) | 0, 0, cols - 1); next[i] = head[c]; head[c] = i; }
        const flock = p.flock / 100, vmax = p.speed * sc, vmin = vmax * 0.45, seek = (p.seek / 100) * 260 * sc;
        const px0 = ptr && ptr.inside ? ptr.x * W : -1e9, py0 = ptr && ptr.inside ? ptr.y * H : -1e9, down = ptr && ptr.down;
        for (let i = 0; i < n; i++) {
          let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, cnt = 0;
          const gxi = clamp((x[i] / cell) | 0, 0, cols - 1), gyi = clamp((y[i] / cell) | 0, 0, rows - 1);
          for (let j = Math.max(0, gyi - 1); j <= Math.min(rows - 1, gyi + 1); j++) for (let k = Math.max(0, gxi - 1); k <= Math.min(cols - 1, gxi + 1); k++) {
            for (let q = head[j * cols + k]; q >= 0; q = next[q]) {
              if (q === i) continue;
              const dx = x[q] - x[i], dy = y[q] - y[i], d2 = dx * dx + dy * dy;
              if (d2 > perc * perc) continue;
              cnt++; ax += vx[q]; ay += vy[q]; cx += x[q]; cy += y[q];
              if (d2 < (perc * 0.38) ** 2) { const d = Math.sqrt(d2) + 1e-3; sx -= (dx / d) * (1 - d / (perc * 0.38)); sy -= (dy / d) * (1 - d / (perc * 0.38)); }
            }
          }
          let fx = 0, fy = 0;
          if (cnt) { fx += (ax / cnt - vx[i]) * 1.6 * flock + (cx / cnt - x[i]) * 1.2 * flock; fy += (ay / cnt - vy[i]) * 1.6 * flock + (cy / cnt - y[i]) * 1.2 * flock; }
          fx += sx * 220 * sc; fy += sy * 220 * sc;
          const xi = clamp(x[i] | 0, 0, W - 1), yi = clamp(y[i] | 0, 0, H - 1), gi = yi * W + xi;
          fx += gx[gi] * seek; fy += gy[gi] * seek;
          fx += (r() - 0.5) * 40 * sc; fy += (r() - 0.5) * 40 * sc;
          if (px0 > -1e8) { const dx = px0 - x[i], dy = py0 - y[i], d = Math.hypot(dx, dy) + 1; if (d < W * 0.4) { const s = (down ? -1 : 1) * 160 * sc * (1 - d / (W * 0.4)); fx += (dx / d) * s; fy += (dy / d) * s; } }
          vx[i] += fx * dt; vy[i] += fy * dt;
          const sp = Math.hypot(vx[i], vy[i]) + 1e-6, tgt = clamp(sp, vmin, vmax); vx[i] *= tgt / sp; vy[i] *= tgt / sp;
          px[i] = x[i]; py[i] = y[i]; x[i] += vx[i] * dt; y[i] += vy[i] * dt;
          if (x[i] < 0) { x[i] += W; px[i] += W; } else if (x[i] >= W) { x[i] -= W; px[i] -= W; } if (y[i] < 0) { y[i] += H; py[i] += H; } else if (y[i] >= H) { y[i] -= H; py[i] -= H; }
        }
        const night = p.bg === 'night';
        if (p.look === 'comet') { pctx.fillStyle = night ? 'rgba(11,11,16,0.14)' : 'rgba(244,239,227,0.14)'; pctx.fillRect(0, 0, W, H); }
        pctx.lineCap = 'round'; pctx.lineWidth = p.size * sc;
        for (let i = 0; i < n; i++) {
          const xi = clamp(x[i] | 0, 0, W - 1), yi = clamp(y[i] | 0, 0, H - 1), o = (yi * W + xi) * 4, k = night ? 1.15 : 0.9;
          pctx.strokeStyle = `rgba(${Math.min(255, img[o] * k) | 0},${Math.min(255, img[o + 1] * k) | 0},${Math.min(255, img[o + 2] * k) | 0},${p.look === 'paint' ? 0.55 : 0.9})`;
          pctx.beginPath(); pctx.moveTo(px[i], py[i]); pctx.lineTo(x[i], y[i]); pctx.stroke();
        }
      },
      draw(ctx, t, dt, ptr) {
        if (!W) return;
        if (dt > 0) this.step(dt, ptr); else build();
        const sc = W / 720, night = p.bg === 'night';
        ctx.drawImage(paint, 0, 0, W, H);
        if (p.look === 'comet') {
          for (let i = 0; i < n; i++) {
            const a = Math.atan2(vy[i], vx[i]), s = (p.size + 2) * sc, xi = clamp(x[i] | 0, 0, W - 1), yi = clamp(y[i] | 0, 0, H - 1), o = (yi * W + xi) * 4;
            ctx.fillStyle = `rgb(${Math.min(255, img[o] * 1.2 + 40) | 0},${Math.min(255, img[o + 1] * 1.2 + 40) | 0},${Math.min(255, img[o + 2] * 1.2 + 40) | 0})`;
            ctx.beginPath(); ctx.moveTo(x[i] + Math.cos(a) * s * 1.6, y[i] + Math.sin(a) * s * 1.6); ctx.lineTo(x[i] + Math.cos(a + 2.5) * s, y[i] + Math.sin(a + 2.5) * s); ctx.lineTo(x[i] + Math.cos(a - 2.5) * s, y[i] + Math.sin(a - 2.5) * s); ctx.closePath(); ctx.fill();
          }
        }
      },
      dispose() {},
    };
  },
};
