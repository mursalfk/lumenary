// src/engine/styles/embossed-leather.js
import { still, boxBlur, smoothstep, clamp, hexToRgb, rng, TAU } from '../utils.js';
import { pixels, stretchedL, slopes, cellular } from '../helpers.js';

const LEATHERS = { tan: '#b8743a', chestnut: '#6d3a1e', black: '#25201e', oxblood: '#6e1c24', forest: '#27483a' };

export default still({
  id: 'embossed-leather',
  name: 'Embossed Leather',
  blurb: 'Your picture pressed into pebbled leather with a hot die, finished with a row of saddle stitches.',
  maxSide: 1000,
  params: [
    { key: 'leather', label: 'Leather', type: 'select', default: 'tan', options: [['tan', 'Tan'], ['chestnut', 'Chestnut'], ['black', 'Black'], ['oxblood', 'Oxblood'], ['forest', 'Forest green']] },
    { key: 'emboss', label: 'Emboss depth', type: 'range', min: 5, max: 100, step: 1, default: 60 },
    { key: 'grain', label: 'Grain', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'size', label: 'Grain size', type: 'range', min: 3, max: 16, step: 1, default: 7 },
    { key: 'sheen', label: 'Sheen', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'stitch', label: 'Stitching', type: 'toggle', default: true },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const N = W * H, sc = W / 800, Lb = boxBlur(boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(2 * sc))), W, H, Math.max(1, Math.round(2 * sc)));
    // height: the die (bright parts stand proud) plus pebbles, each a dome with a crease between neighbours
    const s = p.size * sc * 2.2, g = p.grain / 100, hgt = new Float32Array(N), c3 = [0, 0, 0];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x; cellular(x, y, s, 11, c3);
      const crease = smoothstep(0, 0.22 * s, c3[1] - c3[0]), dome = 1 - Math.pow(c3[0] / (0.75 * s), 2);
      hgt[i] = Lb[i] * (0.7 + p.emboss / 40) + g * 0.07 * (crease * (0.55 + 0.45 * Math.max(0, dome)) - 1);
    }
    const { sx, sy } = slopes(hgt, W, H, 5 * sc * 3), base = hexToRgb(LEATHERS[p.leather] || LEATHERS.tan), sheen = p.sheen / 100;
    const lx = -0.5, ly = -0.55, lz = 0.67, hx = lx, hy = ly, hz = lz + 1, hn = Math.hypot(hx, hy, hz);
    const out = ctx.createImageData(W, H), o4 = out.data;
    for (let i = 0; i < N; i++) {
      let nx = sx[i], ny = sy[i]; const nl = 1 / Math.sqrt(nx * nx + ny * ny + 1); nx *= nl; ny *= nl; const nz = nl;
      const diff = Math.max(0, nx * lx + ny * ly + nz * lz), spec = Math.pow(Math.max(0, (nx * hx + ny * hy + nz * hz) / hn), 14) * sheen * 0.5;
      // pressed areas are a little darker and shinier, as real embossing burnishes the hide
      const press = 0.9 + 0.2 * (1 - Lb[i]), shade = (0.3 + 0.85 * diff) * press, o = i * 4;
      o4[o] = base[0] * shade + spec * 255; o4[o + 1] = base[1] * shade + spec * 230; o4[o + 2] = base[2] * shade + spec * 200; o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
    if (p.stitch) {
      const m = Math.min(W, H) * 0.045, step = Math.min(W, H) * 0.028, len = step * 0.62, wd = Math.max(1.5, step * 0.17);
      const row = (x0, y0, x1, y1) => {
        const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), n = Math.floor(L / step), ux = dx / L, uy = dy / L;
        for (let k = 0; k < n; k++) {
          const cx = x0 + ux * (k + 0.5) * (L / n), cy = y0 + uy * (k + 0.5) * (L / n);
          ctx.lineCap = 'round';
          ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = wd * 1.5; ctx.beginPath(); ctx.moveTo(cx - ux * len / 2 + 1, cy - uy * len / 2 + 1.5); ctx.lineTo(cx + ux * len / 2 + 1, cy + uy * len / 2 + 1.5); ctx.stroke();
          ctx.strokeStyle = '#eadfc4'; ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(cx - ux * len / 2, cy - uy * len / 2); ctx.lineTo(cx + ux * len / 2, cy + uy * len / 2); ctx.stroke();
          ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = wd * 0.35; ctx.beginPath(); ctx.moveTo(cx - ux * len / 2, cy - uy * len / 2 - wd * 0.2); ctx.lineTo(cx + ux * len / 2, cy + uy * len / 2 - wd * 0.2); ctx.stroke();
        }
      };
      row(m, m, W - m, m); row(W - m, m, W - m, H - m); row(W - m, H - m, m, H - m); row(m, H - m, m, m);
    }
  },
});
