// src/engine/styles/phulkari.js
import { still, clamp, lerp, smoothstep, hash2, vnoise, boxBlur, sampleImage, TAU } from '../utils.js';
import { nearest, kmeans } from '../helpers.js';
import { bayer } from '../retro.js';

// Silk floss colours, as dyed in Punjab: marigold, saffron, madder red, undyed white, leaf green, rose, indigo.
const GOLD = [236, 178, 52], ORANGE = [224, 108, 38], CRIMSON = [176, 32, 46], WHITE = [242, 234, 212], GREEN = [58, 132, 72], ROSE = [208, 70, 126], INDIGO = [36, 34, 74];
const PALETTES = {
  classic: [GOLD, ORANGE, CRIMSON, WHITE, GREEN, ROSE, INDIGO],
  warm: [GOLD, ORANGE, CRIMSON, WHITE, [112, 38, 30], [236, 150, 70]],
  cream: [WHITE, [214, 200, 168], [168, 150, 118], [112, 98, 78]],
};
const GROUNDS = { rust: [120, 42, 32], indigo: [30, 36, 74], natural: [198, 176, 138], black: [26, 22, 24] };
const TRIM = [GOLD, CRIMSON, WHITE];     // the colours of the border, whatever silk the picture is stitched in
const EDGE = 5;                          // rows of stitches in the border: a line, a gap, then three rows of teeth

export default still({
  id: 'phulkari',
  name: 'Phulkari',
  blurb: 'The picture embroidered in the Punjabi way: long silk stitches darned across rough hand-woven cloth, running one way in some blocks and the other in the next so the light catches them differently. A zigzag border closes it, as on a bride’s shawl.',
  maxSide: 1300,
  params: [
    { key: 'stitches', label: 'Stitches across', type: 'range', min: 30, max: 160, step: 1, default: 90 },
    { key: 'pattern', label: 'Direction of the stitches', type: 'select', default: 'diamond', options: [['diamond', 'Diamonds'], ['check', 'Squares'], ['flow', 'Following the picture'], ['rows', 'All one way']] },
    { key: 'block', label: 'Size of the blocks', type: 'range', min: 2, max: 12, step: 1, default: 5 },
    { key: 'float', label: 'Length of a stitch', type: 'range', min: 1, max: 8, step: 1, default: 4 },
    { key: 'palette', label: 'Silk', type: 'select', default: 'classic', options: [['classic', 'Marigold, madder and rose'], ['warm', 'Warm only'], ['picture', 'The picture’s own colours'], ['cream', 'Undyed, cream on cloth']] },
    { key: 'ground', label: 'Cloth', type: 'select', default: 'rust', options: [['rust', 'Madder red'], ['indigo', 'Indigo'], ['natural', 'Natural cotton'], ['black', 'Black']] },
    { key: 'show', label: 'Cloth showing through', type: 'range', min: 0, max: 100, step: 1, default: 18, fmt: (v) => v + '%' },
    { key: 'shade', label: 'Shading between colours', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'sheen', label: 'Shine of the silk', type: 'range', min: 0, max: 100, step: 1, default: 60, fmt: (v) => v + '%' },
    { key: 'border', label: 'Zigzag border', type: 'toggle', default: true },
    { key: 'seed', label: 'Another hand', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const cols = p.stitches, cw = W / cols, rows = Math.max(8, Math.round(H / cw)), ch = H / rows, n = cols * rows, seed = p.seed, Lmax = p.float, blk = p.block;
    const tg = sampleImage(env, work, cols, rows).data, tone = new Float32Array(n);
    for (let c = 0; c < n; c++) tone[c] = (0.299 * tg[c * 4] + 0.587 * tg[c * 4 + 1] + 0.114 * tg[c * 4 + 2]) / 255;

    // Which way does the thread run in each cell: 0 across, 1 up and down.
    const dir = new Uint8Array(n), cx0 = (cols - 1) / 2, cy0 = (rows - 1) / 2, pat = p.pattern;
    const checker = (i, j) => (Math.floor(i / blk) + Math.floor(j / blk)) & 1, diamond = (i, j) => Math.floor((Math.abs(i - cx0) + Math.abs(j - cy0)) / blk) & 1;
    let gx, gy;
    if (pat === 'flow') {
      gx = new Float32Array(n); gy = new Float32Array(n);
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const c = j * cols + i, l = tone[j * cols + Math.max(0, i - 1)], r = tone[j * cols + Math.min(cols - 1, i + 1)], u = tone[Math.max(0, j - 1) * cols + i], d = tone[Math.min(rows - 1, j + 1) * cols + i];
        gx[c] = r - l; gy[c] = d - u;
      }
      gx = boxBlur(gx, cols, rows, 1); gy = boxBlur(gy, cols, rows, 1);
    }
    for (let j = 0, c = 0; j < rows; j++) for (let i = 0; i < cols; i++, c++) {
      if (pat === 'diamond') dir[c] = diamond(i, j);
      else if (pat === 'check') dir[c] = checker(i, j);
      else if (pat === 'rows') dir[c] = 0;
      else dir[c] = Math.hypot(gx[c], gy[c]) < 0.03 ? diamond(i, j) : (Math.abs(gy[c]) > Math.abs(gx[c]) ? 0 : 1);   // a thread runs along an edge, not across it
    }

    // The border: a gold line, a gap of bare cloth, and three rows of crimson and white teeth.
    const fixed = new Int8Array(n).fill(-2), hasBorder = p.border && Math.min(cols, rows) >= 24;
    if (hasBorder) {
      for (let j = 0, c = 0; j < rows; j++) for (let i = 0; i < cols; i++, c++) {
        const e = Math.min(i, j, cols - 1 - i, rows - 1 - j);
        if (e >= EDGE) continue;
        const alongX = Math.min(i, cols - 1 - i) >= Math.min(j, rows - 1 - j), pos = alongX ? i : j;
        dir[c] = alongX ? 0 : 1;
        if (e === 0) fixed[c] = 0;
        else if (e === 1) fixed[c] = -1;
        else {
          const m = pos % 6, h = Math.round(3 - Math.abs(m - 2.5));
          fixed[c] = e - 2 < h ? (Math.floor(pos / 6) & 1 ? 2 : 1) : -1;
        }
      }
    }

    // Colours of the silk: the chosen set, or the picture's own six main colours made a little richer.
    let pal = PALETTES[p.palette];
    if (p.palette === 'picture') {
      pal = kmeans(tg, 6, seed + 3, 8, 2).map((c) => { const l = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]; return [clamp(l + (c[0] - l) * 1.3, 0, 255), clamp(l + (c[1] - l) * 1.3, 0, 255), clamp(l + (c[2] - l) * 1.3, 0, 255)]; });
    }
    const ground = GROUNDS[p.ground] || GROUNDS.rust, gate = (p.show / 100) * 0.45, dither = (p.shade / 100) * 110;

    // Cut each row (or column) of same-way cells into stitches. A stitch is one colour, so it is coloured from the average of
    // the picture under it; the lengths vary a little and the stitches are not lined up from row to row, as by hand.
    const has = new Uint8Array(n), segLen = new Uint8Array(n), segPos = new Uint8Array(n), segId = new Float32Array(n);
    const TR = new Uint8Array(n), TG = new Uint8Array(n), TB = new Uint8Array(n);
    const lay = (start, step, len) => {
      const mid = start + (len >> 1) * step, f = fixed[start], id = hash2(start, len, seed + 5);
      let r = 0, g = 0, b = 0, colour = null;
      if (f >= 0) colour = TRIM[f];
      else if (f === -2) {
        for (let k = 0; k < len; k++) { const c = start + k * step; r += tg[c * 4]; g += tg[c * 4 + 1]; b += tg[c * 4 + 2]; }
        r /= len; g /= len; b /= len;
        const l = 0.299 * r + 0.587 * g + 0.114 * b, d = (bayer(mid % cols, (mid / cols) | 0) - 0.5) * dither;
        r = clamp((l + (r - l) * 1.35 - 128) * 1.12 + 128 + d, 0, 255); g = clamp((l + (g - l) * 1.35 - 128) * 1.12 + 128 + d, 0, 255); b = clamp((l + (b - l) * 1.35 - 128) * 1.12 + 128 + d, 0, 255);
        if (l / 255 >= gate) colour = pal[nearest(pal, r, g, b)];
      }
      for (let k = 0; k < len; k++) {
        const c = start + k * step;
        segLen[c] = len; segPos[c] = k; segId[c] = id;
        if (colour) { const v = 0.92 + 0.15 * id; has[c] = 1; TR[c] = clamp(colour[0] * v, 0, 255); TG[c] = clamp(colour[1] * v, 0, 255); TB[c] = clamp(colour[2] * v, 0, 255); }
      }
    };
    const want = (a, b, f) => (f >= 0 ? 99 : Math.max(1, Math.round(Lmax * (0.55 + 0.45 * hash2(a, b, seed + 11)))));
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols;) {
      const c = j * cols + i;
      if (dir[c] !== 0) { i++; continue; }
      const f = fixed[c], w = want(i, j, f);
      let e = i + 1;
      while (e < cols && e - i < w && dir[j * cols + e] === 0 && fixed[j * cols + e] === f) e++;
      lay(c, 1, e - i); i = e;
    }
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows;) {
      const c = j * cols + i;
      if (dir[c] !== 1) { j++; continue; }
      const f = fixed[c], w = want(i, j, f);
      let e = j + 1;
      while (e < rows && e - j < w && dir[e * cols + i] === 1 && fixed[e * cols + i] === f) e++;
      lay(c, cols, e - j); j = e;
    }

    // Paint. Each stitch is a capsule of thread lying on the cloth; its shading comes from a rounded surface lit from the
    // upper left, with a bright band of silk sheen that threads running one way show more strongly than the other.
    const img = ctx.createImageData(W, H), o = img.data, rt = 0.44 * Math.min(cw, ch), sheen = p.sheen / 100, pitch = Math.max(2, Math.min(cw, ch) / 3.2);
    for (let y = 0, k4 = 0; y < H; y++) {
      const j = Math.min(rows - 1, (y / ch) | 0);
      for (let x = 0; x < W; x++, k4 += 4) {
        const i = Math.min(cols - 1, (x / cw) | 0), c = j * cols + i;
        let cover = 0, dist = 1e9, R = 0, G = 0, B = 0;
        if (has[c]) {
          const horiz = dir[c] === 0, len = segLen[c], pos = segPos[c];
          let across, along, s0, s1;
          if (horiz) { across = y - (j + 0.5) * ch; along = x; s0 = (i - pos) * cw; s1 = s0 + len * cw; }
          else { across = x - (i + 0.5) * cw; along = y; s0 = (j - pos) * ch; s1 = s0 + len * ch; }
          const over = Math.max(s0 + rt - along, along - (s1 - rt), 0), signed = along < s0 + rt ? along - (s0 + rt) : along > s1 - rt ? along - (s1 - rt) : 0;
          dist = Math.hypot(over, across); cover = clamp(rt - dist + 0.5);
          if (cover > 0) {
            const na = clamp(across / rt, -1, 1), nb = clamp(signed / rt, -1, 1), z = Math.sqrt(Math.max(0, 1 - na * na - nb * nb));
            const nx = horiz ? nb : na, ny = horiz ? na : nb, ndl = nx * -0.45 + ny * -0.55 + z * 0.7, id = segId[c];
            const body = (0.5 + 0.75 * ndl) * (horiz ? 1.04 : 0.86);
            const strand = 0.055 * Math.sin(na * 6.5 + id * 40 + Math.sin(along / (rt * 3.1) + id * 9) * 0.9), grain = (hash2(x, y, seed + 2) - 0.5) * 0.06;
            const endDark = lerp(0.58, 1, smoothstep(0, rt * 1.3, Math.min(along - s0, s1 - along)));
            const band = Math.exp(-Math.pow((na + 0.32) / 0.3, 2)) * z * sheen * (horiz ? 1 : 0.62), lit = (body + strand + grain) * endDark;
            R = TR[c] * lit + band * (70 + TR[c] * 0.3); G = TG[c] * lit + band * (70 + TG[c] * 0.3); B = TB[c] * lit + band * (70 + TB[c] * 0.3);
          }
        }
        if (cover < 1) {
          // the cloth: a plain weave with uneven, slubby yarn, darkened close to a thread and beside stitched cells
          const wv = 0.8 + 0.2 * (0.5 + 0.5 * Math.sin((x / pitch) * TAU) * Math.sin((y / pitch) * TAU)), sl = (0.9 + 0.2 * vnoise(x / (cw * 7), y / (ch * 0.5), seed)) * (0.9 + 0.2 * vnoise(x / (cw * 0.5), y / (ch * 7), seed + 4)), gr = 0.96 + 0.08 * hash2(x, y, seed + 6);
          let m = wv * sl * gr;
          if (has[c]) m *= 1 - 0.55 * Math.exp(-Math.max(0, dist - rt) / (rt * 0.45));
          else {
            const fx = x - i * cw, fy = y - j * ch;
            let occ = 0;
            if (i > 0 && has[c - 1]) occ += 1 - clamp(fx / (cw * 0.6));
            if (i < cols - 1 && has[c + 1]) occ += 1 - clamp((cw - fx) / (cw * 0.6));
            if (j > 0 && has[c - cols]) occ += 1 - clamp(fy / (ch * 0.6));
            if (j < rows - 1 && has[c + cols]) occ += 1 - clamp((ch - fy) / (ch * 0.6));
            m *= 1 - 0.42 * Math.min(1, occ);
          }
          const cr = ground[0] * m, cg = ground[1] * m, cb = ground[2] * m;
          R = lerp(cr, R, cover); G = lerp(cg, G, cover); B = lerp(cb, B, cover);
        }
        o[k4] = R; o[k4 + 1] = G; o[k4 + 2] = B; o[k4 + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  },
});
