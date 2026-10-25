// src/engine/styles/pastel-chalk.js
import { still, rng, vnoise, boxBlur, smoothstep, clamp, hash2, rgb2hsl, hsl2rgb } from '../utils.js';
import { pixels, blurRGB, stretchedL } from '../helpers.js';

const PAPERS = { slate: [58, 60, 68], navy: [30, 40, 66], kraft: [158, 124, 90], black: [20, 20, 22] };

export default still({
  id: 'pastel-chalk',
  name: 'Pastel Chalk',
  blurb: 'Soft pastel dragged across toned paper: the lights go on thick, the shadows are left to the paper, and the grain breaks every stroke.',
  maxSide: 1000,
  params: [
    { key: 'size', label: 'Stroke size', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'pressure', label: 'Pressure', type: 'range', min: 10, max: 100, step: 1, default: 70 },
    { key: 'tooth', label: 'Paper tooth', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'angle', label: 'Direction of strokes', type: 'range', min: 0, max: 180, step: 1, default: 55, fmt: (v) => v + '°' },
    { key: 'paper', label: 'Paper', type: 'select', default: 'slate', options: [['slate', 'Slate grey'], ['navy', 'Navy'], ['kraft', 'Kraft brown'], ['black', 'Black']] },
    { key: 'seed', label: 'Redraw', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, N = W * H, sc = W / 800, seed = p.seed * 5 + 1;
    const key = p.size + '|' + p.angle + '|' + p.seed + '|' + W;
    if (cache.key !== key) {
      const s = (5 + (p.size / 100) * 14) * sc, r = rng(p.seed * 29 + 7), ch = blurRGB(d, W, H, Math.max(1, Math.round(s * 0.45)), 2);
      const layer = env.makeCanvas(W, H), lx = layer.getContext('2d'), base = (p.angle * Math.PI) / 180;
      lx.lineCap = 'round';
      for (const ps of [{ sz: s, step: s * 0.8, keep: 1 }, { sz: s * 0.5, step: s * 0.6, keep: 0.55 }]) {
        const pts = [];
        for (let y = 0; y < H + ps.step; y += ps.step) for (let x = 0; x < W + ps.step; x += ps.step) if (r() < ps.keep) pts.push([x + (r() - 0.5) * ps.step, y + (r() - 0.5) * ps.step]);
        for (let i = pts.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
        for (const [x, y] of pts) {
          const i = clamp(y | 0, 0, H - 1) * W + clamp(x | 0, 0, W - 1);
          let [h, sa, l] = rgb2hsl(ch[0][i], ch[1][i], ch[2][i]);
          [h, sa, l] = [h, clamp(sa * 1.12), clamp(l * 0.9 + 0.1)];
          const [R, G, B] = hsl2rgb(h, sa, l), a = base + (r() - 0.5) * 0.7, len = ps.sz * (2 + r() * 2.2), dx = Math.cos(a) * len / 2, dy = Math.sin(a) * len / 2;
          lx.strokeStyle = `rgba(${R | 0},${G | 0},${B | 0},0.85)`; lx.lineWidth = ps.sz * (0.8 + r() * 0.5);
          lx.beginPath(); lx.moveTo(x - dx, y - dy); lx.lineTo(x + dx, y + dy); lx.stroke();
        }
      }
      cache.layer = lx.getImageData(0, 0, W, H).data; cache.Ls = boxBlur(boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(4 * sc))), W, H, Math.max(1, Math.round(4 * sc))); cache.key = key;
    }
    const { layer, Ls } = cache, paper = PAPERS[p.paper] || PAPERS.slate, press = 0.35 + (p.pressure / 100) * 0.9, th = p.tooth / 100;
    const out = ctx.createImageData(W, H), o4 = out.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4, a = layer[o + 3] / 255;
      const tooth = 0.5 * vnoise(x * 0.45 / sc, y * 0.45 / sc, seed) + 0.5 * hash2(x, y, seed + 2);
      const amt = clamp((0.15 + 1.05 * Ls[i]) * press * (0.8 + 0.4 * vnoise(x * 0.02 / sc, y * 0.02 / sc, seed + 5)));
      const cov = a * smoothstep(tooth * th * 1.1 - 0.12 * (1 - th) - 0.05, tooth * th * 1.1 + 0.2 + 0.1 * (1 - th), amt);
      const dust = hash2(x, y, 11) < 0.012 * th ? 0.25 : 0;
      const m = Math.min(1, cov + dust);
      for (let c = 0; c < 3; c++) o4[o + c] = paper[c] * (1 - m) + layer[o + c] * m * (1 + dust);
      o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
