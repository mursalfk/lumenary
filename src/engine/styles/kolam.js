// src/engine/styles/kolam.js
import { still, clamp, hexToRgb, hash2, TAU } from '../utils.js';
import { pixels, sampler, fbm } from '../helpers.js';
import { css, vivid } from '../culture.js';

const FLOORS = { slate: ['#26211e', '#1a1613'], oxide: ['#6e3022', '#4a1f16'], dusk: ['#1b2230', '#10151e'] };

export default still({
  id: 'kolam',
  name: 'Kolam',
  blurb: 'Rice-flour floor drawing from South India. Lines loop around a grid of dots; where your picture is dark the loops thicken into diamonds and petals.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Dot spacing', type: 'range', min: 14, max: 50, step: 1, default: 28 },
    { key: 'weight', label: 'Line weight', type: 'range', min: 0.4, max: 2, step: 0.05, default: 1, fmt: (v) => v.toFixed(2) },
    { key: 'density', label: 'Density', type: 'range', min: -30, max: 30, step: 1, default: 0 },
    { key: 'sym', label: 'Symmetry', type: 'select', default: 'mirror', options: [['none', 'None'], ['mirror', 'Left and right'], ['four', 'Four-fold']] },
    { key: 'colour', label: 'Flour', type: 'select', default: 'white', options: [['white', 'Rice flour'], ['picture', 'Rangoli colours']] },
    { key: 'floor', label: 'Floor', type: 'select', default: 'slate', options: [['slate', 'Slate'], ['oxide', 'Red oxide'], ['dusk', 'Dusk blue']] },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, s = p.size * sc, smp = sampler(cache, d, W, H, s * 0.55);
    const [f1, f2] = FLOORS[p.floor].map(hexToRgb), img = ctx.createImageData(W, H), o = img.data;
    for (let y = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, k += 4) {
      const t = fbm(x / (120 * sc), y / (120 * sc), 2, 3), f = 0.92 + 0.16 * fbm(x / (4 * sc), y / (4 * sc), 8, 2);
      o[k] = (f1[0] + (f2[0] - f1[0]) * t) * f; o[k + 1] = (f1[1] + (f2[1] - f1[1]) * t) * f; o[k + 2] = (f1[2] + (f2[2] - f1[2]) * t) * f; o[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const flour = env.makeCanvas(W, H), fx = flour.getContext('2d');
    const nx = Math.floor(W / s) - 1, ny = Math.floor(H / s) - 1, ox = (W - nx * s) / 2, oy = (H - ny * s) / 2, cx0 = W / 2, cy0 = H / 2;
    const mapT = (x, y) => {
      if (p.sym !== 'none') x = cx0 - Math.abs(x - cx0);
      if (p.sym === 'four') y = cy0 - Math.abs(y - cy0);
      return smp.tone(x, y);
    };
    const tmp = [0, 0, 0], pic = p.colour === 'picture', lw = s * 0.11 * p.weight, th = p.density / 100;
    fx.lineCap = 'round'; fx.lineJoin = 'round'; fx.lineWidth = lw;
    const ink = (x, y) => { if (!pic) return '#f6f1e6'; const c = smp.rgb(x, y); vivid(c, 1.5, 0.12, tmp); return css(tmp); };
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const x0 = ox + i * s, y0 = oy + j * s, x1 = x0 + s, y1 = y0 + s, cx = x0 + s / 2, cy = y0 + s / 2;
      const t = mapT(cx, cy) - th, h = s / 2;
      const diamond = t < 0.62, arcs = t < 0.78 && (t < 0.4 || t >= 0.62);
      if (!diamond && !arcs) continue;
      fx.strokeStyle = ink(cx, cy);
      if (diamond) { fx.beginPath(); fx.moveTo(cx, y0); fx.lineTo(x1, cy); fx.lineTo(cx, y1); fx.lineTo(x0, cy); fx.closePath(); fx.stroke(); }
      if (arcs) {
        fx.beginPath(); fx.arc(x0, y0, h, 0, Math.PI / 2); fx.stroke();
        fx.beginPath(); fx.arc(x1, y0, h, Math.PI / 2, Math.PI); fx.stroke();
        fx.beginPath(); fx.arc(x1, y1, h, Math.PI, Math.PI * 1.5); fx.stroke();
        fx.beginPath(); fx.arc(x0, y1, h, Math.PI * 1.5, TAU); fx.stroke();
      }
    }
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
      const x = ox + i * s, y = oy + j * s;
      fx.fillStyle = ink(x, y); fx.beginPath(); fx.arc(x, y, s * 0.075 * Math.max(0.7, p.weight), 0, TAU); fx.fill();
    }
    // rice flour is a little grainy at its edges
    const fi = fx.getImageData(0, 0, W, H), fd = fi.data;
    for (let y = 0, k = 3; y < H; y++) for (let x = 0; x < W; x++, k += 4) { if (fd[k]) fd[k] = fd[k] * (0.7 + 0.3 * hash2(x, y, 4)); }
    fx.putImageData(fi, 0, 0);
    ctx.save(); ctx.shadowColor = 'rgba(255,244,225,0.35)'; ctx.shadowBlur = 5 * sc; ctx.drawImage(flour, 0, 0); ctx.restore();
    ctx.drawImage(flour, 0, 0);
  },
});
