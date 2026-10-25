// src/engine/styles/kintsugi.js
import { still, clamp, smoothstep, hash2, vnoise } from '../utils.js';
import { pixels, sampler, cellular, fbm, ramp } from '../helpers.js';
import { vivid } from '../culture.js';

const GOLD = [[96, 62, 20], [170, 122, 44], [232, 190, 92], [255, 235, 160]];

export default still({
  id: 'kintsugi',
  name: 'Kintsugi',
  blurb: 'The Japanese art of mending broken pottery with gold lacquer. Your picture is the glaze of a shattered piece, put back together a little out of line, with every crack left shining.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Shard size', type: 'range', min: 40, max: 200, step: 1, default: 110 },
    { key: 'seam', label: 'Gold seam', type: 'range', min: 1, max: 12, step: 0.5, default: 4 },
    { key: 'shift', label: 'Misalignment', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'fill', label: 'Lost pieces', type: 'range', min: 0, max: 60, step: 1, default: 10 },
    { key: 'jag', label: 'Jaggedness', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'seed', label: 'New break', type: 'shuffle', default: 5 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, S = p.size * sc, sw = p.seam * sc, sh = (p.shift / 100) * 7 * sc, jag = (p.jag / 100) * S * 0.35, fl = p.fill / 100;
    const img = ctx.createImageData(W, H), o = img.data, out = [0, 0, 0, 0, 0], g = [0, 0, 0], seed = p.seed * 13 + 1;
    for (let y = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, k += 4) {
      const wx = x + (fbm(x / (S * 0.5), y / (S * 0.5), seed, 3) - 0.5) * jag * 2 + (vnoise(x / (S * 0.12), y / (S * 0.12), seed + 3) - 0.5) * jag * 0.5, wy = y + (fbm(x / (S * 0.5) + 31, y / (S * 0.5) + 17, seed, 3) - 0.5) * jag * 2 + (vnoise(x / (S * 0.12) + 9, y / (S * 0.12), seed + 4) - 0.5) * jag * 0.5;
      cellular(wx, wy, S, seed, out);
      const gap = out[1] - out[0], id = out[2], hx = hash2(id & 1023, (id >> 10) & 1023, 2), hy = hash2(id & 1023, (id >> 10) & 1023, 3), lost = hash2(id & 511, (id >> 9) & 511, 4) < fl;
      if (gap < sw && gap < sw) {
        // across the seam: a rounded bead of gold lit from the upper left
        const f = gap / sw, bead = Math.sin(Math.PI * clamp(f * 0.5 + 0.5 * (f > 0.5 ? 1 : 0)) ) , lite = clamp(0.35 + 0.5 * bead + (fbm(x / (4 * sc), y / (4 * sc), 6, 3) - 0.5) * 0.9);
        ramp(GOLD, lite, g);
        o[k] = g[0]; o[k + 1] = g[1]; o[k + 2] = g[2]; o[k + 3] = 255; continue;
      }
      if (lost) {
        const lt = clamp(0.3 + 0.45 * fbm(x / (30 * sc), y / (22 * sc), seed + 8, 4) + 0.3 * smoothstep(0, sw * 6, gap));
        ramp(GOLD, lt * (0.85 + 0.2 * fbm(x / (3 * sc), y / (3 * sc), 5, 2)), g);
        o[k] = g[0]; o[k + 1] = g[1]; o[k + 2] = g[2]; o[k + 3] = 255; continue;
      }
      // each shard is shifted slightly, and lit a little differently
      const px = clamp(Math.round(x + (hx - 0.5) * 2 * sh), 0, W - 1), py = clamp(Math.round(y + (hy - 0.5) * 2 * sh), 0, H - 1), i4 = (py * W + px) * 4, br = 0.92 + 0.1 * hash2(id & 255, (id >> 8) & 255, 6);
      let r = d[i4], gg = d[i4 + 1], b = d[i4 + 2];
      // glaze edge: lighter toward the break where the glaze is thick
      const rim = 1 - 0.22 * smoothstep(sw * 5, sw, gap) + 0.08 * smoothstep(sw * 1.2, sw, gap);
      // the biscuit shows through at the edge
      const bis = smoothstep(sw + 2.2 * sc, sw, gap) * 0.35;
      r = (r * br * rim) + (214 - r) * bis * 0.5; gg = (gg * br * rim) + (196 - gg) * bis * 0.5; b = (b * br * rim) + (170 - b) * bis * 0.5;
      o[k] = r; o[k + 1] = gg; o[k + 2] = b; o[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    void sampler; void vivid;
  },
});
