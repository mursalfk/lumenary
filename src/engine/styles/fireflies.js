// src/engine/styles/fireflies.js
import { clamp, lerp, rng, vnoise, TAU } from '../utils.js';

const GLOWS = { green: [190, 255, 90], amber: [255, 190, 70], white: [230, 245, 255], pink: [255, 140, 210] };

export default {
  id: 'fireflies',
  name: 'Fireflies',
  kind: 'animated',
  maxSide: 720,
  thumbAt: 2.8,
  blurb: 'A summer night: the picture sits in near darkness, and each firefly lights up the patch of it beneath, blinking on and off. Keep still and they gather round the cursor.',
  params: [
    { key: 'count', label: 'Fireflies', type: 'range', min: 8, max: 160, step: 1, default: 55 },
    { key: 'glow', label: 'Glow size', type: 'range', min: 20, max: 140, step: 1, default: 70 },
    { key: 'night', label: 'Darkness of the night', type: 'range', min: 40, max: 98, step: 1, default: 86, fmt: (v) => v + '%' },
    { key: 'blink', label: 'Blinking', type: 'range', min: 0, max: 100, step: 1, default: 65 },
    { key: 'speed', label: 'Drift speed', type: 'range', min: 5, max: 100, step: 1, default: 40 },
    { key: 'colour', label: 'Light', type: 'select', default: 'green', options: [['green', 'Green-gold'], ['amber', 'Amber'], ['white', 'Cool white'], ['pink', 'Pink']] },
    { key: 'seed', label: 'Release again', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, fl = [], built = '', time = 0, tint = null, tintKey = '', light = null, lctx = null, lit = null, litx = null, r = rng(1), sprite = null, px = -1, py = -1, inside = false;

    function makeSprite(col) {
      const s = 64, c = env.makeCanvas(s, s), x = c.getContext('2d'), g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2), q = col || [255, 255, 255], rgb = `${q[0]},${q[1]},${q[2]}`;
      g.addColorStop(0, `rgba(${rgb},1)`); g.addColorStop(0.18, `rgba(${rgb},0.7)`); g.addColorStop(0.5, `rgba(${rgb},0.16)`); g.addColorStop(1, `rgba(${rgb},0)`);
      x.fillStyle = g; x.fillRect(0, 0, s, s); return c;
    }

    function build() {
      const key = [p.count, p.seed, W].join('|'); if (key === built) return;
      r = rng(p.seed * 53 + 9); fl = [];
      for (let i = 0; i < p.count; i++) fl.push({ x: r() * W, y: r() * H, a: r() * TAU, ph: r() * TAU, per: 1.4 + r() * 2.4, s: 0.6 + r() * 0.8, seed: r() * 100 });
      light = env.makeCanvas(W, H); lctx = light.getContext('2d'); lit = env.makeCanvas(W, H); litx = lit.getContext('2d'); sprite = makeSprite(); built = key; tintKey = '';
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; built = ''; },
      setParams(np) { p = np; },
      step(dt, ptr) {
        build(); dt = Math.min(dt, 0.05); time += dt;
        const sc = W / 720, sp = (p.speed / 100) * 55 * sc;
        inside = !!(ptr && ptr.inside); if (inside) { px = ptr.x * W; py = ptr.y * H; }
        for (const f of fl) {
          f.a += (vnoise(time * 0.4 + f.seed, f.seed, 3) - 0.5) * 5 * dt;
          let vx = Math.cos(f.a) * sp * f.s, vy = Math.sin(f.a) * sp * f.s - 4 * sc;
          if (inside) { const dx = px - f.x, dy = py - f.y, d = Math.hypot(dx, dy) + 1; if (d < W * 0.5) { const k = (1 - d / (W * 0.5)) * 55 * sc; vx += (dx / d) * k; vy += (dy / d) * k; } }
          f.x += vx * dt; f.y += vy * dt;
          if (f.x < -20) f.x = W + 20; else if (f.x > W + 20) f.x = -20; if (f.y < -20) f.y = H + 20; else if (f.y > H + 20) f.y = -20;
        }
      },
      draw(ctx, t, dt, ptr) {
        if (!W) return;
        if (dt > 0) this.step(dt, ptr); else build();
        const sc = W / 720, col = GLOWS[p.colour] || GLOWS.green;
        if (tintKey !== p.colour) { tint = makeSprite(col); tintKey = p.colour; }
        const blink = p.blink / 100, R0 = (30 + (p.glow / 100) * 95) * sc, dark = p.night / 100;
        // where the fireflies are shining, as a soft white mask
        lctx.globalCompositeOperation = 'source-over'; lctx.clearRect(0, 0, W, H);
        const lum = [];
        for (const f of fl) {
          const wave = 0.5 + 0.5 * Math.sin(time * TAU / f.per + f.ph), b = lerp(1, Math.pow(wave, 2.2), blink) * (0.15 + 0.85 * 1);
          lum.push(b); if (b < 0.03) continue;
          const rr = R0 * (0.6 + 0.5 * b); lctx.globalAlpha = clamp(b * 0.95); lctx.drawImage(sprite, f.x - rr, f.y - rr, rr * 2, rr * 2);
        }
        lctx.globalAlpha = 1;
        litx.globalCompositeOperation = 'source-over'; litx.clearRect(0, 0, W, H); litx.drawImage(work, 0, 0, W, H);
        litx.globalCompositeOperation = 'destination-in'; litx.drawImage(light, 0, 0); litx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#05060a'; ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1 - dark; ctx.drawImage(work, 0, 0, W, H); ctx.globalAlpha = 1;
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.9; ctx.drawImage(lit, 0, 0); ctx.restore();
        // the lights themselves
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        fl.forEach((f, i) => {
          const b = lum[i]; if (b < 0.03) return;
          const g = R0 * 0.34 * (0.5 + 0.7 * b); ctx.globalAlpha = clamp(b * 0.7);
          ctx.drawImage(tint, f.x - g, f.y - g, g * 2, g * 2);
          ctx.globalAlpha = clamp(b); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(f.x, f.y, (1.0 + 1.0 * b) * sc, 0, TAU); ctx.fill();
        });
        ctx.restore();
      },
      dispose() {},
    };
  },
};
