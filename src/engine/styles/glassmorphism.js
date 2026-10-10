import { still, rng, roundRect, clamp } from '../utils.js';

const LAYOUTS = [
  [0.08, 0.6, 0.84, 0.3],
  [0.08, 0.08, 0.5, 0.3],
  [0.5, 0.36, 0.42, 0.2],
  [0.12, 0.42, 0.3, 0.12],
];

export default still({
  id: 'glassmorphism',
  number: 6,
  name: 'Glassmorphism',
  blurb: 'Frosted glass panels floating over your picture.',
  maxSide: 1100,
  params: [
    { key: 'panels', label: 'Panels', type: 'range', min: 1, max: 4, step: 1, default: 3 },
    { key: 'blur', label: 'Frost', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'opacity', label: 'Glass opacity', type: 'range', min: 0, max: 100, step: 1, default: 30 },
    { key: 'radius', label: 'Corner radius', type: 'range', min: 0, max: 60, step: 1, default: 28 },
    { key: 'tint', label: 'Glass', type: 'select', default: 'light', options: [['light', 'Light'], ['smoke', 'Smoke']] },
    { key: 'details', label: 'Card details', type: 'toggle', default: true },
    { key: 'seed', label: 'Rearrange', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    ctx.drawImage(work, 0, 0, W, H);

    const f = 1 / (1.5 + p.blur / 5);
    const bk = 'b' + p.blur;
    if (cache.bk !== bk) {
      const sw = Math.max(2, Math.round(W * f)), sh = Math.max(2, Math.round(H * f));
      const small = env.makeCanvas(sw, sh);
      const sx = small.getContext('2d');
      sx.imageSmoothingEnabled = true; sx.imageSmoothingQuality = 'high';
      sx.drawImage(work, 0, 0, sw, sh);
      // enlarge in doubling steps so the frost stays smooth everywhere
      let cur = small;
      while (cur.width * 2 < W) {
        const c = env.makeCanvas(cur.width * 2, Math.round(cur.height * 2)), cx2 = c.getContext('2d');
        cx2.imageSmoothingEnabled = true; cx2.imageSmoothingQuality = 'high';
        cx2.drawImage(cur, 0, 0, c.width, c.height); cur = c;
      }
      const big = env.makeCanvas(W, H);
      const bx = big.getContext('2d');
      bx.imageSmoothingEnabled = true; bx.imageSmoothingQuality = 'high';
      bx.drawImage(cur, 0, 0, W, H);
      cache.blurred = big; cache.bk = bk;
    }

    const r = rng(p.seed * 7919);
    const rad = (p.radius / 100) * Math.min(W, H) * 0.2;
    const u = W / 100;
    for (let k = 0; k < p.panels; k++) {
      let [fx, fy, fw, fh] = LAYOUTS[k];
      fx = clamp(fx + (r() - 0.5) * 0.08, 0.03, 0.97 - fw);
      fy = clamp(fy + (r() - 0.5) * (k === 0 ? 0.1 : 0.2), 0.03, 0.97 - fh);
      const x = fx * W, y = fy * H, w = fw * W, h = fh * H;

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = u * 4; ctx.shadowOffsetY = u * 1.6;
      roundRect(ctx, x, y, w, h, rad);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fill();
      ctx.restore();

      ctx.save();
      roundRect(ctx, x, y, w, h, rad);
      ctx.clip();
      ctx.drawImage(cache.blurred, 0, 0, W, H);
      const op = p.opacity / 100;
      ctx.fillStyle = p.tint === 'smoke' ? `rgba(12,12,14,${0.15 + op * 0.7})` : `rgba(255,255,255,${op * 0.55})`;
      ctx.fillRect(x, y, w, h);
      const sheen = ctx.createLinearGradient(x, y, x + w * 0.8, y + h * 1.2);
      sheen.addColorStop(0, 'rgba(255,255,255,0.32)');
      sheen.addColorStop(0.45, 'rgba(255,255,255,0.04)');
      sheen.addColorStop(1, 'rgba(255,255,255,0.0)');
      ctx.fillStyle = sheen;
      ctx.fillRect(x, y, w, h);

      if (p.details) {
        const pad = Math.min(w, h) * 0.12;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        roundRect(ctx, x + pad, y + pad, w * 0.16, Math.min(h * 0.14, u * 2.4), u * 1.2); ctx.fill();
        if (h > H * 0.16) {
          ctx.fillStyle = 'rgba(255,255,255,0.38)';
          const bh = Math.min(h * 0.07, u * 1.8);
          roundRect(ctx, x + pad, y + h * 0.5, w - pad * 2, bh, bh / 2); ctx.fill();
          roundRect(ctx, x + pad, y + h * 0.5 + bh * 2.1, (w - pad * 2) * 0.62, bh, bh / 2); ctx.fill();
        }
      }
      ctx.restore();

      const border = ctx.createLinearGradient(x, y, x + w, y + h);
      border.addColorStop(0, 'rgba(255,255,255,0.75)');
      border.addColorStop(0.5, 'rgba(255,255,255,0.12)');
      border.addColorStop(1, 'rgba(255,255,255,0.4)');
      roundRect(ctx, x, y, w, h, rad);
      ctx.strokeStyle = border;
      ctx.lineWidth = Math.max(1, W / 650);
      ctx.stroke();
    }
  },
});
