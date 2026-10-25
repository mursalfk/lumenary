// src/engine/styles/aurora.js
import { still, rng, vnoise, boxBlur, clamp, smoothstep, TAU } from '../utils.js';
import { pixels, paintPixels, ramp, stretchedL } from '../helpers.js';

const PALETTES = {
  classic: [[60, 255, 150], [40, 220, 200], [120, 110, 255], [200, 90, 230]],
  polar: [[90, 255, 230], [60, 170, 255], [90, 90, 255], [150, 80, 230]],
  crimson: [[255, 120, 140], [255, 70, 150], [190, 70, 230], [110, 90, 255]],
};

export default still({
  id: 'aurora',
  name: 'Aurora',
  blurb: 'The bright parts of your picture rise as curtains of northern light over a dark pine ridge.',
  maxSide: 1000,
  params: [
    { key: 'palette', label: 'Colours', type: 'select', default: 'classic', options: [['classic', 'Green to violet'], ['polar', 'Ice blue'], ['crimson', 'Crimson']] },
    { key: 'length', label: 'Curtain height', type: 'range', min: 15, max: 100, step: 1, default: 42 },
    { key: 'glow', label: 'Brightness', type: 'range', min: 20, max: 140, step: 1, default: 70 },
    { key: 'rays', label: 'Ray streaks', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'stars', label: 'Stars', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'trees', label: 'Pine ridge', type: 'toggle', default: true },
    { key: 'seed', label: 'New sky', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const u = Math.min(W, H) / 100, r = rng(p.seed * 17 + 9);
    const Lb = boxBlur(boxBlur(stretchedL(cache), W, H, Math.max(2, Math.round(W / 90))), W, H, Math.max(1, Math.round(W / 140)));
    // sources: only the brighter parts of the picture feed the sky
    const I = new Float32Array(W * H), D = new Float32Array(W * H), decay = 1 - 1 / (H * (0.05 + (p.length / 100) * 0.75));
    for (let x = 0; x < W; x++) {
      let cur = 0, dist = 0;
      for (let y = H - 1; y >= 0; y--) {
        const src = smoothstep(0.22, 0.85, Lb[y * W + x]), nx = cur * decay;
        if (src >= nx) { cur = src; dist = 0; } else { cur = nx; dist++; }
        I[y * W + x] = cur; D[y * W + x] = dist;
      }
    }
    const pal = PALETTES[p.palette] || PALETTES.classic, k = (p.glow / 100) * 1.25, rayAmt = p.rays / 100, f = 90 / W * (W / 800);
    const col = [0, 0, 0];
    paintPixels(ctx, W, H, (x, y, o) => {
      const sky = y / H;
      // deep night, a little lighter at the horizon
      o[0] = 3 + sky * 8; o[1] = 8 + sky * 20; o[2] = 20 + sky * 34;
      const i = y * W + x;
      // vertical rays: noise that varies quickly across, slowly up and down
      const ray = 1 - rayAmt + rayAmt * (0.35 + 1.3 * vnoise(x * 0.09 * f * 4, y * 0.004, p.seed) * vnoise(x * 0.031 * f * 4, 3.3, p.seed + 4));
      const a = clamp(I[i] * ray * k);
      if (a > 0.004) {
        ramp(pal, clamp(D[i] / (H * 0.55)), col);
        // light adds, so overlapping curtains glow
        const g = a * a * (3 - 2 * a) * 0.95 + a * 0.12;
        o[0] += col[0] * g; o[1] += col[1] * g; o[2] += col[2] * g;
      }
    });
    // stars, hidden where the sky is bright
    const n = Math.round((p.stars / 100) * W * H / 2600);
    for (let s = 0; s < n; s++) {
      const x = r() * W, y = r() * H * 0.9, i = (y | 0) * W + (x | 0), vis = 1 - clamp(I[i] * 1.6);
      if (vis < 0.15) { r(); continue; }
      const big = r() < 0.06, rad = (big ? 1.7 : 0.55 + r() * 0.7) * (W / 800) * 1.1;
      ctx.fillStyle = `rgba(235,242,255,${(0.25 + r() * 0.55) * vis})`;
      ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); ctx.fill();
    }
    if (p.trees) {
      // two ridges of pines, far then near
      const rr = rng(p.seed * 3 + 1);
      for (const [layer, shade, hmax] of [[0, '#05121d', 0.1], [1, '#010408', 0.15]]) {
        ctx.fillStyle = shade;
        const base = H * 0.97, off = layer ? 0 : u * 2.5;
        let x = -u * 3;
        const pines = [];
        while (x < W + u * 3) {
          const tw = u * (2.4 + rr() * 2.6), th = H * (0.03 + rr() * hmax) * (0.7 + 0.6 * vnoise(x * 0.01, layer * 5, 2));
          pines.push([x, tw, th]); x += tw * (0.45 + rr() * 0.4);
        }
        for (const [tx, tw, th] of pines) {
          const by = base - off, tiers = 4;
          ctx.beginPath(); ctx.moveTo(tx, by - th);
          for (let t = 1; t <= tiers; t++) { const w = tw * 0.5 * (t / tiers), y = by - th * (1 - t / tiers) - th * 0.03 * (t < tiers); ctx.lineTo(tx + w, y); ctx.lineTo(tx + w * 0.55, y + th * 0.04); }
          ctx.lineTo(tx - tw * 0.3, by + 1); ctx.lineTo(tx - tw * 0.3, by);
          for (let t = tiers; t >= 1; t--) { const w = tw * 0.5 * (t / tiers), y = by - th * (1 - t / tiers) - th * 0.03 * (t < tiers); ctx.lineTo(tx - w * 0.55, y + th * 0.04); ctx.lineTo(tx - w, y); }
          ctx.closePath(); ctx.fill();
        }
        ctx.fillRect(0, base - off, W, H - base + off);
      }
      ctx.fillStyle = '#010408'; ctx.fillRect(0, H * 0.965, W, H * 0.04);
    }
  },
});
