// src/engine/styles/knitted-pattern.js
import { still, sampleImage, clamp, rgb2hsl, hsl2rgb, TAU } from '../utils.js';
import { kmeans, nearest } from '../helpers.js';

const css = ([r, g, b], a = 1) => `rgba(${r | 0},${g | 0},${b | 0},${a})`;
const sh = ([r, g, b], k) => [clamp(r * k, 0, 255), clamp(g * k, 0, 255), clamp(b * k, 0, 255)];

// One stockinette stitch, a V of two plump legs, drawn once per yarn colour at 3x and scaled down when used.
function sprite(env, col, cw, ch) {
  const k = 3, w = Math.ceil(cw * 1.5 * k), h = Math.ceil(ch * 1.6 * k), c = env.makeCanvas(w, h), x = c.getContext('2d');
  const cx = w / 2, cy = h / 2, leg = (dir) => {
    x.save(); x.translate(cx + dir * cw * 0.2 * k, cy - ch * 0.02 * k); x.rotate(dir * -0.42);
    const rx = cw * 0.26 * k, ry = ch * 0.62 * k, g = x.createLinearGradient(-rx, 0, rx, 0);
    g.addColorStop(0, css(sh(col, 0.55))); g.addColorStop(0.28, css(sh(col, 1.0))); g.addColorStop(0.55, css(sh(col, 1.28))); g.addColorStop(1, css(sh(col, 0.6)));
    x.fillStyle = g; x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, TAU); x.fill();
    // the plies of the yarn: slanted strokes across the leg
    x.strokeStyle = css(sh(col, 0.62), 0.55); x.lineWidth = Math.max(1, cw * 0.035 * k); x.lineCap = 'round';
    for (let i = -3; i <= 3; i++) { const yy = i * ry * 0.27; x.beginPath(); x.moveTo(-rx * 0.8, yy + ry * 0.06); x.lineTo(rx * 0.8, yy - ry * 0.06); x.stroke(); }
    x.restore();
  };
  x.shadowColor = 'rgba(0,0,0,0.45)'; x.shadowBlur = cw * 0.1 * k; x.shadowOffsetY = ch * 0.04 * k;
  leg(-1); leg(1);
  return c;
}

export default still({
  id: 'knitted-pattern',
  name: 'Knitted Pattern',
  blurb: 'A jumper knitted from your picture: rows of V-shaped stitches in a handful of yarn colours, with an optional Fair Isle border.',
  maxSide: 1000,
  params: [
    { key: 'across', label: 'Stitches across', type: 'range', min: 22, max: 90, step: 1, default: 46 },
    { key: 'yarns', label: 'Colours of yarn', type: 'range', min: 3, max: 9, step: 1, default: 6 },
    { key: 'border', label: 'Fair Isle border', type: 'toggle', default: true },
    { key: 'seed', label: 'Different yarns', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H) {
    const n = p.across, cw = W / n, ch = cw * 0.74, rows = Math.ceil(H / ch) + 1, img = sampleImage(env, work, n, rows), d = img.data;
    const yarn = kmeans(d, p.yarns, p.seed * 3 + 2, 10, 1).map(([r, g, b]) => { const [h, s, l] = rgb2hsl(r, g, b); return hsl2rgb(h, clamp(s * 1.05), clamp(l * 0.92 + 0.03)); });
    // yarn order by brightness gives the border its dark and light pair
    const byL = yarn.map((c, i) => [c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11, i]).sort((a, b) => a[0] - b[0]), dk = yarn[byL[0][1]], lt = yarn[byL[byL.length - 1][1]];
    ctx.fillStyle = '#17120f'; ctx.fillRect(0, 0, W, H);
    const sprites = new Map(), get = (col) => { const k = col.join(','); if (!sprites.has(k)) sprites.set(k, sprite(env, col, cw, ch)); return sprites.get(k); };
    // a small snowflake motif, repeated every 8 stitches over 7 rows
    const MOTIF = ['..#...#.', '.#.#.#.#', '#...#...', '.#.#.#.#', '..#...#.', '........', '########'];
    const band = Math.min(8, Math.floor(rows * 0.14));
    for (let r = 0; r < rows; r++) for (let c = 0; c < n; c++) {
      let col;
      const inTop = r < band, inBot = r >= rows - band;
      if (p.border && (inTop || inBot)) {
        const rr = inTop ? r : rows - 1 - r, row = MOTIF[rr % MOTIF.length], on = row[c % 8] === '#';
        col = on ? lt : dk;
      } else { const o = (Math.min(rows - 1, r) * n + c) * 4; col = yarn[nearest(yarn, d[o], d[o + 1], d[o + 2])]; }
      const sp = get(col), sw = sp.width / 3, sh2 = sp.height / 3;
      ctx.drawImage(sp, c * cw - (sw - cw) / 2, r * ch - (sh2 - ch) / 2, sw, sh2);
    }
  },
});
