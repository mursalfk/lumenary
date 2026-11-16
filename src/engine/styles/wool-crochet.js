// src/engine/styles/wool-crochet.js
import { still, clamp, lerp, sampleImage, hash2, rgb2hsl, hsl2rgb, rgbCss } from '../utils.js';
import { rgbList, nearest, kmeans } from '../helpers.js';
import { vivid } from '../culture.js';
import { dress } from '../toon.js';

const SETS = {
  pastel: rgbList(['#fbf3e4', '#f7c6c7', '#f4a6b8', '#f9e0a2', '#bfe3c0', '#9fd3c7', '#a9c9ee', '#c5b3e6', '#e9d5b5', '#9b8f8a']),
  earth: rgbList(['#f3e9d2', '#d9b382', '#c0763c', '#8c3b2a', '#5b2a22', '#8a8f4e', '#4d6b46', '#2f4b4f', '#b7a48a', '#2a2422']),
};

export default still({
  id: 'wool-crochet',
  name: 'Wool Crochet',
  blurb: 'A crocheted blanket: the picture worked in rows of chunky stitches, each a small knot of two strands with its own highlight, in a handful of wool colours and with a shell border.',
  maxSide: 1000,
  params: [
    { key: 'stitches', label: 'Stitches across', type: 'range', min: 24, max: 90, step: 1, default: 46 },
    { key: 'colours', label: 'Balls of wool', type: 'range', min: 3, max: 10, step: 1, default: 7 },
    { key: 'fuzz', label: 'Fuzz', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'wool', label: 'Wool', type: 'select', default: 'own', options: [['own', 'The picture’s own colours'], ['pastel', 'Baby pastels'], ['earth', 'Earth tones']] },
    { key: 'border', label: 'Shell border', type: 'toggle', default: true },
    { key: 'seed', label: 'Start again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H) {
    const cols = p.stitches, edge = p.border ? Math.round(W * 0.055) : 0, cw = (W - 2 * edge) / cols, chh = cw * 0.86, rows = Math.max(4, Math.round((H - 2 * edge) / chh)), ch = (H - 2 * edge) / rows, seed = p.seed * 13 + 1;
    const d = sampleImage(env, work, cols, rows).data, tmp = [0, 0, 0];
    const found = kmeans(d, p.colours, seed, 10, 1);
    let pal = found.map((c) => { vivid(c, 1.25, 0, tmp); return [tmp[0], tmp[1], tmp[2]]; });
    const set = SETS[p.wool];
    if (set) pal = dress(pal, set);
    else pal = pal.map((c) => { const [h, s, l] = rgb2hsl(c[0], c[1], c[2]); return hsl2rgb(h, clamp(s * 0.9), clamp(0.12 + l * 0.8)); });
    const mid = pal[Math.floor(pal.length / 2)], darkest = pal[0];
    ctx.fillStyle = rgbCss(darkest[0] * 0.45, darkest[1] * 0.45, darkest[2] * 0.45); ctx.fillRect(0, 0, W, H);
    ctx.lineCap = 'round';
    // One stitch: two strands of yarn leaning together into a V, the right one lying over the left. Each strand is
    // drawn three times, dark and wide, then its colour, then a thin light line, which reads as a round thread.
    const stitchAt = (x, y, w, h, c, flip) => {
      const lw = w * 0.36, a = [x + w * 0.22, y + h * 0.1], b = [x + w * 0.5, y + h * 0.92], e = [x + w * 0.78, y + h * 0.1];
      const strand = (p0, p1) => {
        ctx.strokeStyle = rgbCss(c[0] * 0.55, c[1] * 0.55, c[2] * 0.58); ctx.lineWidth = lw * 1.25; ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
        ctx.strokeStyle = rgbCss(c[0], c[1], c[2]); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
        ctx.strokeStyle = rgbCss(Math.min(255, c[0] * 1.18 + 22), Math.min(255, c[1] * 1.18 + 22), Math.min(255, c[2] * 1.18 + 22)); ctx.lineWidth = lw * 0.28;
        ctx.beginPath(); ctx.moveTo(lerp(p0[0], p1[0], 0.2) - lw * 0.18, lerp(p0[1], p1[1], 0.2)); ctx.lineTo(lerp(p0[0], p1[0], 0.75) - lw * 0.18, lerp(p0[1], p1[1], 0.75)); ctx.stroke();
      };
      if (flip) { strand(e, b); strand(a, b); } else { strand(a, b); strand(e, b); }
    };
    for (let j = 0; j < rows; j++) {
      // alternate rows are worked in the other direction, so they sit half a stitch across and lean the other way
      const shift = j % 2 ? cw / 2 : 0;
      for (let i = -1; i < cols; i++) {
        const si = clamp(Math.round(i + (j % 2 ? 0.5 : 0)), 0, cols - 1), q = (j * cols + si) * 4, c = pal[nearest(found, d[q], d[q + 1], d[q + 2])];
        const x = edge + i * cw + shift, y = edge + j * ch, k = 0.92 + 0.16 * hash2(i, j, seed);
        if (x + cw < edge || x > W - edge) continue;
        ctx.save(); ctx.beginPath(); ctx.rect(edge, edge, W - 2 * edge, H - 2 * edge); ctx.clip();
        stitchAt(x, y - ch * 0.12, cw, ch * 1.25, [c[0] * k, c[1] * k, c[2] * k], j % 2);
        ctx.restore();
      }
    }
    if (p.border) {
      // shells: fans of five stitches sharing a foot, all the way round
      const c = set ? set[2] : mid, n = Math.max(6, Math.round(W / (edge * 1.9))), m = Math.max(6, Math.round(H / (edge * 1.9)));
      const shell = (cx, cy, rot) => { for (let q = 0; q < 5; q++) { const an = rot - Math.PI / 2 + (q - 2) * 0.42, r = edge * 0.86; ctx.save(); ctx.translate(cx, cy); ctx.rotate(an + Math.PI / 2); stitchAt(-edge * 0.17, -r, edge * 0.34, r, c, q % 2); ctx.restore(); } };
      for (let i = 0; i < n; i++) { const x = ((i + 0.5) / n) * W; shell(x, edge, 0); shell(x, H - edge, Math.PI); }
      for (let j = 0; j < m; j++) { const y = ((j + 0.5) / m) * H; shell(edge, y, -Math.PI / 2); shell(W - edge, y, Math.PI / 2); }
    }
    // fuzz: stray fibres catching the light, and a soft unevenness over the whole piece
    if (p.fuzz > 0) {
      const img = ctx.getImageData(0, 0, W, H), o = img.data, f = p.fuzz / 100;
      for (let y = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, k += 4) {
        const n = (hash2(x, y, seed) - 0.5) * 26 * f + (hash2(x >> 1, (y + (x >> 2)) >> 1, seed + 3) > 0.975 ? 30 * f : 0);
        o[k] += n; o[k + 1] += n; o[k + 2] += n;
      }
      ctx.putImageData(img, 0, 0);
    }
  },
});
