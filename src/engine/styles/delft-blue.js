// src/engine/styles/delft-blue.js
import { still, clamp, smoothstep, boxBlur, hash2, rng, TAU } from '../utils.js';
import { pixels, sampler, stretchedL, slopes, cellular, edgeCanvas, fbm } from '../helpers.js';
import { css } from '../culture.js';

export default still({
  id: 'delft-blue',
  name: 'Delft Blue',
  blurb: 'Dutch Delftware: cobalt painted onto white tin glaze with a fine brush. The strokes follow the form, darker where the picture is darker, and the whole glaze is hair-cracked with age.',
  maxSide: 1100,
  params: [
    { key: 'stroke', label: 'Brush size', type: 'range', min: 1, max: 6, step: 0.5, default: 2.5 },
    { key: 'length', label: 'Stroke length', type: 'range', min: 6, max: 60, step: 1, default: 26 },
    { key: 'depth', label: 'Layers of paint', type: 'range', min: 1, max: 4, step: 1, default: 3 },
    { key: 'outline', label: 'Outline', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'crackle', label: 'Glaze crackle', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'shape', label: 'Piece', type: 'select', default: 'plate', options: [['plate', 'Plate'], ['full', 'Full picture']] },
    { key: 'seed', label: 'New strokes', type: 'shuffle', default: 3 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const sc = W / 800, plate = p.shape === 'plate', R = Math.min(W, H) * 0.485, cx = W / 2, cy = H / 2, Ri = R * 0.78;
    const L = stretchedL(cache), Tm = boxBlur(boxBlur(L, W, H, Math.max(1, Math.round(1.5 * sc))), W, H, Math.max(1, Math.round(1.5 * sc)));
    const Fl = boxBlur(boxBlur(L, W, H, Math.max(2, Math.round(5 * sc))), W, H, Math.max(2, Math.round(5 * sc))), { sx, sy } = slopes(Fl, W, H, 1);
    const idx = (x, y) => (y < 0 ? 0 : y >= H ? H - 1 : y | 0) * W + (x < 0 ? 0 : x >= W ? W - 1 : x | 0);
    // the table, and the glaze
    if (plate) {
      const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#2c2622'); g.addColorStop(1, '#17120f'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 24 * sc; ctx.shadowOffsetY = 10 * sc; ctx.fillStyle = '#e9ede9'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill(); ctx.restore();
    }
    const gl = ctx.createLinearGradient(0, 0, W, H); gl.addColorStop(0, '#f1f4f1'); gl.addColorStop(1, '#e1e7e4');
    ctx.save();
    if (plate) { ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip(); }
    ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);
    // strokes follow lines of equal light
    const r = rng(p.seed * 97 + 3), step = Math.max(2, 2.6 * sc), len = Math.round((p.length * sc) / step), sg = p.stroke * sc * 1.9, lw = p.stroke * sc;
    const seeds = [];
    for (let y = 0; y < H; y += sg) for (let x = 0; x < W; x += sg) { const px = x + r() * sg, py = y + r() * sg; if (plate && Math.hypot(px - cx, py - cy) > R) continue; seeds.push([px, py, r()]); }
    for (let i = seeds.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; const t = seeds[i]; seeds[i] = seeds[j]; seeds[j] = t; }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let layer = 0; layer < p.depth; layer++) {
      const thr = 0.7 - layer * 0.17;
      for (const [x0, y0, rr] of seeds) {
        const t0 = Tm[idx(x0, y0)];
        if (t0 > thr + (rr - 0.5) * 0.08) continue;
        const dark = 1 - t0, tone = clamp((thr - t0) / thr), al = 0.2 + 0.5 * tone;
        ctx.strokeStyle = `rgba(${(26 + 30 * (1 - dark)) | 0},${(52 + 40 * (1 - dark)) | 0},${(138 + 40 * (1 - dark)) | 0},${al})`; ctx.lineWidth = lw * (0.7 + 0.5 * dark);
        let px = x0, py = y0, dx0 = 0, dy0 = 0;
        for (const sign of [1, -1]) {
          px = x0; py = y0; dx0 = 0; dy0 = 0; ctx.beginPath(); ctx.moveTo(px, py);
          for (let j = 0; j < len; j++) {
            const ii = idx(px, py); let tx = sy[ii], ty = -sx[ii]; const m = Math.hypot(tx, ty);
            if (m < 0.004) { tx = Math.cos(0.7 + (hash2(x0 | 0, y0 | 0, 1) - 0.5) * 0.5); ty = Math.sin(0.7); } else { tx /= m; ty /= m; }
            if (j > 0 && tx * dx0 + ty * dy0 < 0) { tx = -tx; ty = -ty; } else if (j === 0 && sign < 0) { tx = -tx; ty = -ty; }
            px += tx * step; py += ty * step; dx0 = tx; dy0 = ty; ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      }
    }
    // fine dark line where the picture changes sharply
    if (p.outline > 0) { const ec = edgeCanvas(env, L, W, H, { r: Math.max(1, Math.round(1.2 * sc)), thr: 0.2 - 0.12 * (p.outline / 100), color: '#142a78' }); ctx.globalAlpha = 0.4 + 0.5 * (p.outline / 100); ctx.drawImage(ec, 0, 0); ctx.globalAlpha = 1; }
    ctx.restore();
    // the plate rim: scrolls between two painted rings
    if (plate) {
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
      ctx.strokeStyle = 'rgba(24,50,130,0.9)'; ctx.fillStyle = 'rgba(24,50,130,0.85)';
      for (const [rr, w] of [[Ri, 2.4], [Ri * 1.04, 1.1], [R * 0.985, 2.4], [R * 0.955, 1]]) { ctx.lineWidth = w * sc; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU); ctx.stroke(); }
      const n = 44; ctx.lineWidth = 1.5 * sc;
      for (let j = 0; j < n; j++) {
        const a = (j / n) * TAU, ca = Math.cos(a), sa = Math.sin(a), r0 = Ri * 1.07, r1 = R * 0.945;
        ctx.beginPath(); ctx.moveTo(cx + ca * r0, cy + sa * r0);
        const a2 = a + 0.04 * (j % 2 ? 1 : -1); ctx.quadraticCurveTo(cx + Math.cos(a2) * (r0 + r1) / 2, cy + Math.sin(a2) * (r0 + r1) / 2, cx + ca * r1, cy + sa * r1); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + ca * (r0 + r1) / 2, cy + sa * (r0 + r1) / 2, 2.3 * sc, 0, TAU); ctx.fill();
      }
      // a soft shine across the glaze
      const sh = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.05, cx, cy, R); sh.addColorStop(0, 'rgba(255,255,255,0.28)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.12)');
      ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
    // crackle
    if (p.crackle > 0) {
      const cr = p.crackle / 100, img = ctx.getImageData(0, 0, W, H), o = img.data, out = [0, 0, 0, 0, 0], cs = 16 * sc;
      for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
        if (plate && (x - cx) * (x - cx) + (y - cy) * (y - cy) > R * R) continue;
        cellular(x + (fbm(x / (30 * sc), y / (30 * sc), 4, 2) - 0.5) * 8 * sc, y, cs, 7 + p.seed, out);
        const vein = out[1] - out[0];
        if (vein < 0.9 * sc) { const q = (0.1 + 0.3 * cr) * (1 - vein / (0.9 * sc)); o[k] *= 1 - q; o[k + 1] *= 1 - q; o[k + 2] *= 1 - q * 0.75; }
      }
      ctx.putImageData(img, 0, 0);
    }
  },
});
