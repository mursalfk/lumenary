// src/engine/styles/photomosaic.js
import { still, clamp, lerp, rng, scaleCanvas, sampleImage } from '../utils.js';

const GROUNDS = { black: [8, 8, 10], white: [244, 242, 236], grey: [74, 74, 78] };
const SCALES = [0.11, 0.17, 0.26, 0.4];    // the side of a piece, as a share of the picture's short side

// A tile's colours at tile size (RGB bytes) with its signature: the average colour of each quarter, then of the whole.
function makeTile(src, sw, x0, y0, tw, th, flip) {
  const px = new Uint8ClampedArray(tw * th * 3), sig = new Float32Array(15), cnt = [0, 0, 0, 0];
  for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
    const sx = flip ? tw - 1 - x : x, s = ((y0 + y) * sw + x0 + sx) * 4, o = (y * tw + x) * 3, q = (y * 2 >= th ? 2 : 0) + (x * 2 >= tw ? 1 : 0);
    px[o] = src[s]; px[o + 1] = src[s + 1]; px[o + 2] = src[s + 2];
    sig[q * 3] += src[s]; sig[q * 3 + 1] += src[s + 1]; sig[q * 3 + 2] += src[s + 2]; cnt[q]++;
  }
  for (let q = 0; q < 4; q++) for (let c = 0; c < 3; c++) { sig[q * 3 + c] /= Math.max(1, cnt[q]); sig[12 + c] += sig[q * 3 + c] / 4; }
  return { px, sig };
}

export default still({
  id: 'photomosaic',
  name: 'Photomosaic',
  blurb: 'The picture rebuilt from hundreds of small pieces of itself. Every tile is a crop of the same photograph, picked because its colours fit the spot it has to fill; seen from a step back the pieces melt into the whole.',
  maxSide: 1400,
  params: [
    { key: 'tiles', label: 'Tiles across', type: 'range', min: 14, max: 110, step: 1, default: 50 },
    { key: 'from', label: 'Each tile shows', type: 'select', default: 'pieces', options: [['pieces', 'A piece of the picture'], ['whole', 'The whole picture']] },
    { key: 'match', label: 'Colour match', type: 'range', min: 20, max: 100, step: 1, default: 80, fmt: (v) => v + '%' },
    { key: 'mix', label: 'Variety', type: 'range', min: 0, max: 100, step: 1, default: 55, fmt: (v) => v + '%' },
    { key: 'gap', label: 'Gap between tiles', type: 'range', min: 0, max: 20, step: 1, default: 4, fmt: (v) => v + '%' },
    { key: 'ground', label: 'Grout', type: 'select', default: 'black', options: [['black', 'Black'], ['grey', 'Grey'], ['white', 'White']] },
    { key: 'seed', label: 'Another arrangement', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const whole = p.from === 'whole', cols = p.tiles, cw = W / cols, rows = whole ? cols : Math.max(1, Math.round(H / cw)), ch = H / rows;
    const tw = Math.max(4, Math.round(cw)), th = Math.max(4, Math.round(ch)), r = rng(p.seed * 91 + 7);
    const src = work.getContext('2d').getImageData(0, 0, W, H).data;

    // The library of tiles: pieces of the picture at several sizes (and their mirror images), or its whole self.
    const lib = [];
    if (whole) {
      const c = scaleCanvas(env, work, tw, th), d = c.getContext('2d').getImageData(0, 0, tw, th).data;
      lib.push(makeTile(d, tw, 0, 0, tw, th, false));
    } else {
      const short = Math.min(W, H);
      for (const S of SCALES) {
        const side = S * short, f = tw / side, mw = Math.max(tw + 1, Math.ceil(W * f)), mh = Math.max(th + 1, Math.ceil(H * f));
        const m = scaleCanvas(env, work, mw, mh), md = m.getContext('2d').getImageData(0, 0, mw, mh).data, step = side / 2.3;
        const nx = Math.max(2, Math.floor((W - side) / step) + 1), ny = Math.max(2, Math.floor((H - side) / step) + 1);
        for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
          const cx = clamp(i * ((W - side) / (nx - 1)) + (r() - 0.5) * step * 0.7, 0, W - side), cy = clamp(j * ((H - side) / (ny - 1)) + (r() - 0.5) * step * 0.7, 0, H - side);
          const x0 = clamp(Math.round(cx * f), 0, mw - tw), y0 = clamp(Math.round(cy * f), 0, mh - th);
          lib.push(makeTile(md, mw, x0, y0, tw, th, false), makeTile(md, mw, x0, y0, tw, th, true));
        }
      }
    }

    // What each cell of the grid has to look like: the average colour of its four quarters.
    const tg = sampleImage(env, work, cols * 2, rows * 2).data, tgW = cols * 2, n = lib.length;
    const use = new Uint16Array(n), pick = new Int32Array(cols * rows).fill(-1), lam = (p.mix / 100) * 1400 + 1, sig = new Float32Array(15);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      for (let q = 0; q < 4; q++) { const a = ((j * 2 + (q >> 1)) * tgW + i * 2 + (q & 1)) * 4; sig[q * 3] = tg[a]; sig[q * 3 + 1] = tg[a + 1]; sig[q * 3 + 2] = tg[a + 2]; }
      for (let c = 0; c < 3; c++) sig[12 + c] = (sig[c] + sig[3 + c] + sig[6 + c] + sig[9 + c]) / 4;
      let best = 0, bd = Infinity;
      const left = i > 0 ? pick[j * cols + i - 1] : -1, up = j > 0 ? pick[(j - 1) * cols + i] : -1;
      if (n > 1) {
        for (let t = 0; t < n; t++) {
          if (t === left || t === up) continue;
          const s = lib[t].sig;
          let dd = lam * use[t] * 0.35;
          for (let k = 0; k < 12; k++) { const e = sig[k] - s[k]; dd += e * e; }
          if (dd < bd) { bd = dd; best = t; }
        }
      }
      pick[j * cols + i] = best; use[best]++;
    }

    // Lay the tiles. Each is shifted so that its average colour moves towards the cell's, by `match`, and its detail
    // is eased down in very dark and very light cells, where a real tile would have little contrast left.
    const g = ground(p.ground), out = ctx.createImageData(W, H), od = out.data, k = p.match / 100, gp = Math.round((p.gap / 100) * Math.min(cw, ch) * 0.5);
    for (let i = 0; i < W * H; i++) { od[i * 4] = g[0]; od[i * 4 + 1] = g[1]; od[i * 4 + 2] = g[2]; od[i * 4 + 3] = 255; }
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const t = lib[pick[j * cols + i]], x0 = Math.round(i * cw) + gp, x1 = Math.round((i + 1) * cw) - gp, y0 = Math.round(j * ch) + gp, y1 = Math.round((j + 1) * ch) - gp;
      const aw = Math.max(1, x1 - x0), ah = Math.max(1, y1 - y0), a = ((j * 2) * tgW + i * 2) * 4;
      const tc = [0, 0, 0];
      for (let c = 0; c < 3; c++) tc[c] = (tg[a + c] + tg[a + 4 + c] + tg[a + tgW * 4 + c] + tg[a + tgW * 4 + 4 + c]) / 4;
      const lum = 0.299 * tc[0] + 0.587 * tc[1] + 0.114 * tc[2], detail = clamp(0.38 + 0.62 * (1 - Math.abs(lum - 128) / 128), 0.38, 1);
      for (let y = 0; y < ah; y++) {
        const ty = Math.min(th - 1, Math.floor(((y + 0.5) / ah) * th)), edgeY = (y === 0 || y === ah - 1) && gp === 0;
        for (let x = 0; x < aw; x++) {
          const tx = Math.min(tw - 1, Math.floor(((x + 0.5) / aw) * tw)), o = (ty * tw + tx) * 3, q = ((y0 + y) * W + x0 + x) * 4, shade = edgeY || ((x === 0 || x === aw - 1) && gp === 0) ? 0.9 : 1;
          for (let c = 0; c < 3; c++) {
            const v = t.px[o + c], shifted = tc[c] + (v - t.sig[12 + c]) * detail;
            od[q + c] = lerp(v, shifted, k) * shade;
          }
        }
      }
    }
    ctx.putImageData(out, 0, 0);
  },
});

function ground(name) { return GROUNDS[name] || GROUNDS.black; }
