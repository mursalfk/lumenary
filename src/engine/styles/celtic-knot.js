// src/engine/styles/celtic-knot.js
import { still, hexToRgb, clamp, smoothstep, hash2 } from '../utils.js';
import { pixels, sampler, fbm } from '../helpers.js';
import { vivid } from '../culture.js';

const GROUNDS = { night: [16, 13, 12], vellum: [233, 220, 184], forest: [14, 30, 24] };
const GOLD = [226, 178, 82], EMERALD = [52, 150, 96];

export default still({
  id: 'celtic-knot',
  name: 'Celtic Knot',
  blurb: 'Interlace from the Book of Kells and the high crosses of Ireland: ribbons that pass over and under one another without end. Each length of ribbon takes the colour of the picture beneath it.',
  maxSide: 1100,
  params: [
    { key: 'size', label: 'Knot size', type: 'range', min: 16, max: 70, step: 1, default: 34 },
    { key: 'width', label: 'Ribbon width', type: 'range', min: 24, max: 46, step: 1, default: 36, fmt: (v) => v + '%' },
    { key: 'outline', label: 'Outline', type: 'range', min: 0, max: 100, step: 1, default: 75 },
    { key: 'colour', label: 'Ribbon', type: 'select', default: 'picture', options: [['picture', 'Colours of the picture'], ['gold', 'Gold'], ['emerald', 'Emerald']] },
    { key: 'ground', label: 'Ground', type: 'select', default: 'night', options: [['night', 'Night'], ['vellum', 'Vellum'], ['forest', 'Forest']] },
    { key: 'frame', label: 'Frame', type: 'toggle', default: true },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, sc = W / 800, c = p.size * sc * 1.4, hw = p.width / 200, smp = sampler(cache, d, W, H, c * 0.3), tmp = [0, 0, 0], ground = GROUNDS[p.ground], ol = p.outline / 100;
    const light = p.ground === 'vellum', inkc = light ? [40, 28, 18] : [10, 8, 8], m = p.frame ? Math.min(W, H) * 0.045 : 0;
    const img = ctx.createImageData(W, H), o = img.data;
    const pieceColour = (xc, yc, out) => {
      xc = clamp(xc, 0, W - 1); yc = clamp(yc, 0, H - 1);
      if (p.colour === 'picture') { vivid(smp.rgb(xc, yc), 1.35, light ? -0.08 : 0.04, tmp); out[0] = tmp[0]; out[1] = tmp[1]; out[2] = tmp[2]; return; }
      const t = smp.tone(xc, yc), base = p.colour === 'gold' ? GOLD : EMERALD, k = light ? 1 - 0.55 * t : 0.3 + 0.8 * t;
      out[0] = base[0] * k; out[1] = base[1] * k; out[2] = base[2] * k;
    };
    const cA = [0, 0, 0], cB = [0, 0, 0];
    for (let y = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, k += 4) {
      const gn = 0.96 + 0.08 * fbm(x / (40 * sc), y / (40 * sc), 3, 3);
      let r = ground[0] * gn, g = ground[1] * gn, b = ground[2] * gn;
      if (x >= m && y >= m && x < W - m && y < H - m) {
        const u = (x + y) / c, v = (x - y) / c, iu = Math.floor(u), iv = Math.floor(v), dA = u - iu - 0.5, dB = v - iv - 0.5, inA = Math.abs(dA) < hw, inB = Math.abs(dB) < hw, aOver = ((iu + iv) & 1) === 0;
        const edge = (s) => smoothstep(0.78, 0.9, Math.abs(s)) * ol;
        let layer = 0, s = 0, other = 0;
        if (inA && inB) { layer = aOver ? 1 : 2; } else if (inA) layer = 1; else if (inB) layer = 2;
        if (layer) {
          if (layer === 1) {
            s = dA / hw; const pj = Math.floor(v - 0.5), uc = iu + 0.5, vc = pj + 1; pieceColour((c * (uc + vc)) / 2, (c * (uc - vc)) / 2, cA);
            other = !aOver && Math.abs(dB) >= hw && Math.abs(dB) < hw + 0.16 ? 1 - (Math.abs(dB) - hw) / 0.16 : 0;
          } else {
            s = dB / hw; const pi = Math.floor(u - 0.5), vc = iv + 0.5, uc = pi + 1; pieceColour((c * (uc + vc)) / 2, (c * (uc - vc)) / 2, cA);
            other = aOver && Math.abs(dA) >= hw && Math.abs(dA) < hw + 0.16 ? 1 - (Math.abs(dA) - hw) / 0.16 : 0;
          }
          const cyl = Math.sqrt(Math.max(0, 1 - s * s)), lit = 0.55 + 0.5 * cyl + 0.18 * (-s) + 0.5 * Math.exp(-(((s + 0.38) / 0.16) ** 2)) * 0.5;
          const sh = 1 - 0.5 * other * other, f = lit * sh, e = edge(s);
          r = cA[0] * f; g = cA[1] * f; b = cA[2] * f;
          if (!(inA && inB) || true) { r += (inkc[0] - r) * e; g += (inkc[1] - g) * e; b += (inkc[2] - b) * e; }
          // where the ribbon passes under another, a shadow falls on it
          void cB;
        } else {
          // a small gold stud where four ribbons leave a gap
          const fu = u - iu, fv = v - iv, du = Math.min(fu, 1 - fu), dv = Math.min(fv, 1 - fv);
          if (Math.hypot(du, dv) < 0.075) { const q = 0.85; r += (GOLD[0] - r) * q; g += (GOLD[1] - g) * q; b += (GOLD[2] - b) * q; }
        }
      }
      o[k] = r; o[k + 1] = g; o[k + 2] = b; o[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    if (m > 0) {
      ctx.strokeStyle = 'rgb(226,178,82)'; ctx.lineWidth = 2.4 * sc; ctx.strokeRect(m * 0.5, m * 0.5, W - m, H - m);
      ctx.lineWidth = 1.1 * sc; ctx.strokeRect(m * 0.5 + 4 * sc, m * 0.5 + 4 * sc, W - m - 8 * sc, H - m - 8 * sc);
      ctx.fillStyle = 'rgb(226,178,82)';
      for (const [x, y] of [[m * 0.5, m * 0.5], [W - m * 0.5, m * 0.5], [m * 0.5, H - m * 0.5], [W - m * 0.5, H - m * 0.5]]) { ctx.beginPath(); ctx.arc(x, y, m * 0.3, 0, 6.2832); ctx.fill(); ctx.strokeStyle = 'rgb(40,28,18)'; ctx.lineWidth = 1.4 * sc; ctx.stroke(); }
    }
  },
});
