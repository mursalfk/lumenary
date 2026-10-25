// src/engine/styles/pointillism.js
import { still, rng, clamp, rgb2hsl, hsl2rgb, hash2 } from '../utils.js';
import { pixels, blurRGB } from '../helpers.js';

const GROUNDS = { white: '#f6f3ea', cream: '#efe6d0', dark: '#16130f' };

export default still({
  id: 'pointillism',
  name: 'Pointillism',
  blurb: 'Seurat-style: the picture broken into thousands of small dots of pure colour that your eye mixes back together.',
  maxSide: 1000,
  params: [
    { key: 'dot', label: 'Dot size', type: 'range', min: 0, max: 100, step: 1, default: 38 },
    { key: 'cover', label: 'Coverage', type: 'range', min: 0, max: 100, step: 1, default: 65 },
    { key: 'vivid', label: 'Colour jitter', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'ground', label: 'Canvas', type: 'select', default: 'cream', options: [['white', 'White'], ['cream', 'Cream'], ['dark', 'Dark']] },
    { key: 'seed', label: 'Re-dot', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, rd = (1.5 + (p.dot / 100) * 5.5) * sc;
    const ch = blurRGB(d, W, H, Math.max(1, Math.round(rd * 0.7)), 1);
    const r = rng(p.seed * 23 + 3), vv = p.vivid / 100;
    ctx.fillStyle = GROUNDS[p.ground] || GROUNDS.cream; ctx.fillRect(0, 0, W, H);
    const n = Math.round(((2 + (p.cover / 100) * 4) * W * H) / (Math.PI * rd * rd));
    for (let k = 0; k < n; k++) {
      const x = r() * W, y = r() * H, i = (y | 0) * W + (x | 0);
      let [h, s, l] = rgb2hsl(ch[0][i], ch[1][i], ch[2][i]);
      h += (r() - 0.5) * 0.09 * vv; s = clamp(s * (1.08 + 0.3 * vv) + 0.04); l = clamp(l + (r() - 0.5) * 0.2 * vv);
      if (r() < 0.07 * vv) { h += 0.5; s = clamp(s * 0.7); }
      const [R, G, B] = hsl2rgb(h, s, l), rr = rd * (0.72 + r() * 0.5);
      ctx.fillStyle = `rgb(${R | 0},${G | 0},${B | 0})`;
      ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill();
    }
  },
});
