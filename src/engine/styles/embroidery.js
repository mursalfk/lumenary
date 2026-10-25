// src/engine/styles/embroidery.js
import { still, rng, hash2, boxBlur, sobel, sampleImage, clamp, rgb2hsl, hsl2rgb, TAU } from '../utils.js';
import { pixels, stretchedL, kmeans, nearest } from '../helpers.js';

const css = ([r, g, b], a = 1) => `rgba(${r | 0},${g | 0},${b | 0},${a})`;
const sh = ([r, g, b], k) => [clamp(r * k, 0, 255), clamp(g * k, 0, 255), clamp(b * k, 0, 255)];

export default still({
  id: 'embroidery',
  name: 'Embroidery',
  blurb: 'Thousands of glossy thread strokes laid along the edges of the picture on linen, in a handful of floss colours.',
  maxSide: 900,
  params: [
    { key: 'density', label: 'Stroke size', type: 'range', min: 3, max: 14, step: 1, default: 7 },
    { key: 'flosses', label: 'Colours of thread', type: 'range', min: 4, max: 18, step: 1, default: 10 },
    { key: 'follow', label: 'Follow the shapes', type: 'range', min: 0, max: 100, step: 1, default: 75 },
    { key: 'sheen', label: 'Thread sheen', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'hoop', label: 'Embroidery hoop', type: 'toggle', default: true },
    { key: 'seed', label: 'Restitch', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d0 = pixels(work, W, H, cache).data, sc = W / 800, r = rng(p.seed * 23 + 5);
    const lin = '#e9e1cf';
    ctx.fillStyle = lin; ctx.fillRect(0, 0, W, H);
    // linen: a woven fleck of horizontal and vertical threads
    for (let i = 0; i < 2600; i++) { const x = r() * W, y = r() * H, hor = r() < 0.5; ctx.fillStyle = `rgba(${r() < 0.5 ? '110,90,60' : '255,255,250'},${0.05 + r() * 0.07})`; ctx.fillRect(x, y, hor ? 3 + r() * 9 : 1, hor ? 1 : 3 + r() * 9); }
    const flo = kmeans(d0, p.flosses, p.seed * 5 + 2, 9, 13).map(([rr, g, b]) => { const [h, s, l] = rgb2hsl(rr, g, b); return hsl2rgb(h, clamp(s * 1.12), clamp(l)); });
    const sm = sampleImage(env, work, Math.round(W / 4), Math.round(H / 4)), sw = sm.width, shh = sm.height;
    const L = boxBlur(stretchedL(cache), W, H, Math.max(2, Math.round(3 * sc))), { gx, gy, mag } = sobel(L, W, H, 2);
    const sp = p.density * sc * 0.9, len = p.density * sc * 2.4, wd = Math.max(1.6, p.density * sc * 0.62), fl = p.follow / 100, base = r() * Math.PI;
    const pts = [];
    for (let y = 0; y < H + sp; y += sp) for (let x = 0; x < W + sp; x += sp) pts.push([x + (r() - 0.5) * sp, y + (r() - 0.5) * sp]);
    for (let i = pts.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
    ctx.lineCap = 'round';
    const sheen = p.sheen / 100;
    for (const [x, y] of pts) {
      const xi = clamp(x | 0, 0, W - 1), yi = clamp(y | 0, 0, H - 1), i = yi * W + xi;
      // thread runs along the edge (perpendicular to the slope); on flat areas it takes a lazy, slowly turning direction
      const edge = Math.atan2(gx[i], -gy[i]) , strength = clamp(mag[i] * 14), flat = base + (hash2(xi >> 4, yi >> 4, p.seed) - 0.5) * 1.2;
      let ang = edge * 1; const wgt = fl * strength;
      const ax = Math.cos(edge) * wgt + Math.cos(flat) * (1 - wgt), ay = Math.sin(edge) * wgt + Math.sin(flat) * (1 - wgt);
      ang = Math.atan2(ay, ax);
      const sx = clamp(Math.floor((x / W) * sw), 0, sw - 1), sy = clamp(Math.floor((y / H) * shh), 0, shh - 1), o = (sy * sw + sx) * 4;
      const col = flo[nearest(flo, sm.data[o], sm.data[o + 1], sm.data[o + 2])], l = len * (0.75 + r() * 0.55), dx = Math.cos(ang) * l / 2, dy = Math.sin(ang) * l / 2;
      ctx.strokeStyle = 'rgba(0,0,0,0.24)'; ctx.lineWidth = wd * 1.15; ctx.beginPath(); ctx.moveTo(x - dx + wd * 0.18, y - dy + wd * 0.3); ctx.lineTo(x + dx + wd * 0.18, y + dy + wd * 0.3); ctx.stroke();
      ctx.strokeStyle = css(sh(col, 0.9 + r() * 0.2)); ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(x - dx, y - dy); ctx.lineTo(x + dx, y + dy); ctx.stroke();
      if (sheen > 0) { ctx.strokeStyle = css(sh(col, 1.55), 0.55 * sheen); ctx.lineWidth = wd * 0.3; ctx.beginPath(); ctx.moveTo(x - dx * 0.8 - dy * 0.12, y - dy * 0.8 + dx * 0.12); ctx.lineTo(x + dx * 0.8 - dy * 0.12, y + dy * 0.8 + dx * 0.12); ctx.stroke(); }
    }
    if (p.hoop) {
      const cx = W / 2, cy = H / 2, rx = W * 0.47, ry = H * 0.47, ring = Math.min(W, H) * 0.028;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.fillStyle = '#2b2622'; ctx.fill('evenodd'); ctx.restore();
      const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#e2b787'); g.addColorStop(0.5, '#b57e4c'); g.addColorStop(1, '#8a5a32');
      ctx.strokeStyle = g; ctx.lineWidth = ring; ctx.beginPath(); ctx.ellipse(cx, cy, rx + ring * 0.5, ry + ring * 0.5, 0, 0, TAU); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,240,220,0.28)'; ctx.lineWidth = ring * 0.2; ctx.beginPath(); ctx.ellipse(cx, cy, rx + ring * 0.2, ry + ring * 0.2, 0, 0, TAU); ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = ring * 0.25; ctx.beginPath(); ctx.ellipse(cx, cy, rx - 1, ry - 1, 0, 0, TAU); ctx.stroke();
    }
  },
});
