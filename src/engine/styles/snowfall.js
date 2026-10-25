// src/engine/styles/snowfall.js
import { clamp, lerp, rng, TAU } from '../utils.js';

export default {
  id: 'snowfall',
  name: 'Snowfall',
  kind: 'animated',
  maxSide: 720,
  thumbAt: 2,
  blurb: 'Flakes drift down in three depths, the near ones large and soft, the far ones small and sharp, while a cold light settles on your picture. Move the cursor to steer the wind.',
  params: [
    { key: 'amount', label: 'Snow', type: 'range', min: 10, max: 100, step: 1, default: 55 },
    { key: 'size', label: 'Flake size', type: 'range', min: 30, max: 160, step: 1, default: 90, fmt: (v) => v + '%' },
    { key: 'fall', label: 'Fall speed', type: 'range', min: 10, max: 100, step: 1, default: 40 },
    { key: 'wind', label: 'Wind', type: 'range', min: -100, max: 100, step: 1, default: 15 },
    { key: 'frost', label: 'Cold light on the picture', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'drift', label: 'Snow on the ground', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'seed', label: 'New snowfall', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, fl = [], built = '', time = 0, r = rng(1), sprite = null, soft = null, windNow = 0, back = null;

    function spr(hard) {
      const s = 48, c = env.makeCanvas(s, s), x = c.getContext('2d'), g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(hard ? 0.5 : 0.15, hard ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.65)'); g.addColorStop(hard ? 0.85 : 0.6, hard ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, s, s); return c;
    }

    function build() {
      const key = [p.amount, p.seed, p.frost, p.drift, W].join('|'); if (key === built) return;
      r = rng(p.seed * 97 + 1); fl = []; const n = Math.round(60 + (p.amount / 100) * 940 * (W * H) / (720 * 900));
      for (let i = 0; i < n; i++) fl.push({ x: r() * W, y: r() * H, z: Math.pow(r(), 1.6), ph: r() * TAU, sw: 0.5 + r() * 1.2 });
      sprite = spr(true); soft = spr(false);
      // the still backdrop: the picture under a cold light, with snow banked along the ground
      back = env.makeCanvas(W, H); const b = back.getContext('2d'); b.drawImage(work, 0, 0, W, H);
      const f = p.frost / 100; b.fillStyle = `rgba(120,160,215,${0.22 * f})`; b.fillRect(0, 0, W, H);
      b.globalCompositeOperation = 'luminosity'; b.fillStyle = `rgba(160,175,200,${0.35 * f})`; b.fillRect(0, 0, W, H); b.globalCompositeOperation = 'source-over';
      const d = p.drift / 100; if (d > 0) { const g = b.createLinearGradient(0, H * (1 - 0.16 * d), 0, H); g.addColorStop(0, 'rgba(245,250,255,0)'); g.addColorStop(1, `rgba(245,250,255,${0.9 * d})`); b.fillStyle = g; b.fillRect(0, H * (1 - 0.2 * d), W, H); }
      built = key;
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; built = ''; },
      setParams(np) { p = np; },
      step(dt, ptr) {
        build(); dt = Math.min(dt, 0.05); time += dt;
        const sc = W / 720, target = (p.wind / 100) * 70 * sc + (ptr && ptr.inside ? (ptr.x - 0.5) * 200 * sc : 0);
        windNow += (target - windNow) * Math.min(1, dt * 2);
        const fall = (14 + (p.fall / 100) * 90) * sc;
        for (const f of fl) {
          f.y += fall * (0.35 + 1.1 * f.z) * dt; f.x += (windNow * (0.3 + f.z) + Math.sin(time * f.sw + f.ph) * 14 * sc * (0.4 + f.z)) * dt;
          if (f.y > H + 10) { f.y = -10; f.x = r() * W; } if (f.x > W + 10) f.x = -10; else if (f.x < -10) f.x = W + 10;
        }
      },
      draw(ctx, t, dt, ptr) {
        if (!W) return;
        if (dt > 0) this.step(dt, ptr); else build();
        const sc = W / 720, k = p.size / 100;
        ctx.drawImage(back, 0, 0, W, H);
        for (const f of fl) {
          const s = (2.2 + f.z * f.z * 14) * sc * k, img = f.z > 0.6 ? soft : sprite;
          ctx.globalAlpha = lerp(0.45, f.z > 0.6 ? 0.8 : 0.95, f.z); ctx.drawImage(img, f.x - s, f.y - s, s * 2, s * 2);
        }
        ctx.globalAlpha = 1;
      },
      dispose() {},
    };
  },
};
