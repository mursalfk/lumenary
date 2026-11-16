// src/engine/styles/ridgeline.js
import { still, clamp, lerp, boxBlur, rgbCss } from '../utils.js';
import { pixels, stretchedL, blurRGB } from '../helpers.js';

// ground, line colour (null: taken from the picture) and whether the ground is dark
const INKS = {
  white: { bg: '#08090b', line: [255, 255, 255], dark: true },
  amber: { bg: '#0d0905', line: [255, 190, 92], dark: true },
  green: { bg: '#030a06', line: [120, 255, 160], dark: true },
  picture: { bg: '#07080a', line: null, dark: true },
  paper: { bg: '#f2efe7', line: [18, 18, 22], dark: false },
};

export default still({
  id: 'ridgeline',
  name: 'Ridgeline',
  blurb: 'The picture drawn as a stack of lines, each one lifted wherever the picture is bright, like the pulsar plot on a famous album sleeve. Every ridge hides the ones behind it, so the face rises out of the dark in a single unbroken contour at a time.',
  maxSide: 1400,
  params: [
    { key: 'lines', label: 'Lines', type: 'range', min: 16, max: 160, step: 1, default: 92 },
    { key: 'relief', label: 'Height of the ridges', type: 'range', min: 50, max: 900, step: 10, default: 230, fmt: (v) => (v / 100).toFixed(1) + ' lines' },
    { key: 'detail', label: 'Detail along a line', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'weight', label: 'Line weight', type: 'range', min: 4, max: 40, step: 1, default: 11, fmt: (v) => (v / 10).toFixed(1) },
    { key: 'ink', label: 'Ink', type: 'select', default: 'white', options: [['white', 'White on black'], ['amber', 'Amber on black'], ['green', 'Phosphor green'], ['picture', 'The picture’s colours'], ['paper', 'Black on paper']] },
    { key: 'tall', label: 'Ridges rise where the picture is', type: 'select', default: 'light', options: [['light', 'Light'], ['dark', 'Dark']] },
    { key: 'persp', label: 'Perspective', type: 'range', min: 0, max: 100, step: 1, default: 0, fmt: (v) => v + '%' },
    { key: 'hidden', label: 'Hide the lines behind', type: 'toggle', default: true },
    { key: 'glow', label: 'Glow', type: 'range', min: 0, max: 100, step: 1, default: 30, fmt: (v) => v + '%' },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, Ls = stretchedL(cache), ink = INKS[p.ink] || INKS.white, sc = W / 1000;
    const n = p.lines, margin = Math.round(W * 0.05), top = margin, spacing = (H - 2 * margin) / (n + p.relief / 100), amp = spacing * (p.relief / 100);
    // The picture is read through a blur about as wide as the gap between two lines, so a ridge follows shapes, not noise.
    const rad = Math.max(1, Math.round(spacing * 0.42)), Lb = boxBlur(boxBlur(Ls, W, H, rad), W, H, rad);
    const rgb = ink.line ? null : blurRGB(d, W, H, rad, 1);
    const step = lerp(7, 1.6, p.detail / 100) * sc * 1.5, cols = Math.max(24, Math.round((W - 2 * margin) / step)), dx = (W - 2 * margin) / cols;
    const lw = Math.max(1, (p.weight / 10) * sc * 1.15 * Math.min(1.5, spacing / (11 * sc) + 0.4)), persp = p.persp / 100, cx = W / 2, light = p.tall === 'light';
    ctx.fillStyle = ink.bg; ctx.fillRect(0, 0, W, H);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const xs = new Float32Array(cols + 1), ys = new Float32Array(cols + 1);
    for (let i = 0; i < n; i++) {
      const t = n > 1 ? i / (n - 1) : 0, base = top + amp + t * (H - 2 * margin - amp), row = clamp(((base - top - amp) / (H - 2 * margin - amp)) * (H - 1), 0, H - 1) | 0;
      // lines further back are drawn a little narrower, which turns the stack into a landscape
      const k = lerp(1 - persp * 0.42, 1, t);
      for (let j = 0; j <= cols; j++) {
        const u = margin + j * dx, sx = clamp(cx + (u - cx) / k, 0, W - 1) | 0, v = Lb[row * W + sx], h = light ? v : 1 - v;
        xs[j] = cx + (u - cx) * k; ys[j] = base - Math.pow(h, 1.12) * amp;
      }
      const trace = () => { ctx.beginPath(); ctx.moveTo(xs[0], ys[0]); for (let j = 1; j <= cols; j++) ctx.lineTo(xs[j], ys[j]); };
      if (p.hidden) { trace(); ctx.lineTo(xs[cols], H); ctx.lineTo(xs[0], H); ctx.closePath(); ctx.fillStyle = ink.bg; ctx.fill(); }
      let stroke;
      if (ink.line) stroke = rgbCss(ink.line[0], ink.line[1], ink.line[2]);
      else {
        const g = ctx.createLinearGradient(xs[0], 0, xs[cols], 0);
        for (let j = 0; j <= cols; j += 3) {
          const sx = clamp(cx + (margin + j * dx - cx) / k, 0, W - 1) | 0, q = row * W + sx, m = 255 / Math.max(120, rgb[0][q], rgb[1][q], rgb[2][q]);
          g.addColorStop(j / cols, rgbCss(Math.min(255, rgb[0][q] * m), Math.min(255, rgb[1][q] * m), Math.min(255, rgb[2][q] * m)));
        }
        stroke = g;
      }
      if (p.glow > 0 && ink.dark) { trace(); ctx.strokeStyle = stroke; ctx.globalAlpha = 0.07 + 0.16 * (p.glow / 100); ctx.lineWidth = lw * 3.4; ctx.stroke(); ctx.globalAlpha = 1; }
      trace(); ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke();
    }
  },
});
