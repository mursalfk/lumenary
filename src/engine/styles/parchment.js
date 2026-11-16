// src/engine/styles/parchment.js
import { still, clamp, lerp, smoothstep, boxBlur, sobel, hash2, vnoise, rng } from '../utils.js';
import { pixels, stretchedL, fbm } from '../helpers.js';

const INKS = { gall: [52, 34, 22], black: [28, 24, 24], sepia: [104, 58, 32], blue: [36, 44, 86] };
const SKIN = [226, 204, 160], STAIN = [176, 138, 84], RED = [158, 36, 28], GOLD = [196, 152, 60];

export default still({
  id: 'parchment',
  name: 'Parchment',
  blurb: 'A leaf from an old manuscript: the picture drawn in iron-gall ink and hatched like an engraving, inside a red and gold border on stained vellum, with a drop capital and lines of script below.',
  maxSide: 1000,
  params: [
    { key: 'age', label: 'Age of the skin', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'hatch', label: 'Pen hatching', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'lines', label: 'Outlines', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'ink', label: 'Ink', type: 'select', default: 'gall', options: [['gall', 'Iron gall brown'], ['black', 'Lamp black'], ['sepia', 'Sepia'], ['blue', 'Indigo']] },
    { key: 'layout', label: 'Page', type: 'select', default: 'leaf', options: [['leaf', 'Picture with script below'], ['full', 'Picture alone']] },
    { key: 'text', label: 'Script', type: 'text', default: 'Here begins the book of light, in which every picture is written twice, once by the sun and once by the hand.', max: 120 },
    { key: 'seed', label: 'Another leaf', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const sc = W / 900, seed = p.seed * 21 + 4;
    if (!cache.edge) {
      const Ls = stretchedL(cache), r = Math.max(1, Math.round(2 * sc));
      cache.Lb = boxBlur(boxBlur(Ls, W, H, r), W, H, r);
      cache.edge = sobel(boxBlur(Ls, W, H, r), W, H, 1).mag;
    }
    const { Lb, edge } = cache, age = p.age / 100, hatch = p.hatch / 100, lines = p.lines / 100, ink = INKS[p.ink] || INKS.gall, leaf = p.layout === 'leaf';
    // where the picture sits on the leaf: a panel in the upper part, with room for the script under it
    const mx = W * (leaf ? 0.13 : 0.07), top = H * (leaf ? 0.09 : 0.07), pw = W - 2 * mx, ph = leaf ? Math.min(H * 0.56, (pw * H) / W) : H - 2 * top, sx0 = (W - pw) / 2;
    const out = ctx.createImageData(W, H), o = out.data, per = 5.2 * sc, thr = lerp(0.2, 0.06, lines);
    const kx = W / pw, ky = H / ph;
    for (let y = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, k += 4) {
      // vellum: a warm skin, mottled, darker and more stained toward the edges, with foxing and the pores of the hide
      const m = fbm(x / (190 * sc), y / (190 * sc), seed, 4), ex = Math.min(x, W - 1 - x) / W, ey = Math.min(y, H - 1 - y) / H, rim = 1 - smoothstep(0, 0.16, Math.min(ex, ey) + (fbm(x / (60 * sc), y / (60 * sc), seed + 2, 3) - 0.5) * 0.08);
      const fox = smoothstep(0.7, 0.8, fbm(x / (26 * sc), y / (26 * sc), seed + 5, 3)) * smoothstep(0.5, 0.7, fbm(x / (140 * sc), y / (140 * sc), seed + 7, 2));
      const st = clamp((m - 0.35) * 0.9 * age + rim * (0.35 + 0.5 * age) + fox * 0.5 * age), pore = (hash2(x, y, seed) - 0.5) * 0.045 + (vnoise(x * 0.3 / sc, y * 0.3 / sc, seed + 9) - 0.5) * 0.05;
      let r = lerp(SKIN[0], STAIN[0], st) * (1 + pore), g = lerp(SKIN[1], STAIN[1], st) * (1 + pore), b = lerp(SKIN[2], STAIN[2], st) * (1 + pore);
      const px = (x - sx0) * kx, py = (y - top) * ky;
      if (px >= 0 && py >= 0 && px < W && py < H) {
        const i = (py | 0) * W + (px | 0), dark = 1 - Lb[i];
        // engraver's shading: parallel pen lines that swell as the tone darkens, and a second set across them in the deepest shade
        const wave = Math.sin(y * 0.012 / sc + x * 0.004 / sc) * 6 * sc, d1 = Math.abs((((y + x * 0.35 + wave) / per) % 1) - 0.5) * 2, d2 = Math.abs((((y * 0.4 - x + 3000) / (per * 1.1)) % 1) - 0.5) * 2;
        const w1 = clamp((dark - 0.22) * 1.25) * hatch, w2 = clamp((dark - 0.62) * 1.9) * hatch;
        let a = Math.max(1 - smoothstep(w1 * 0.8, w1 * 0.8 + 0.22, d1), (1 - smoothstep(w2 * 0.7, w2 * 0.7 + 0.22, d2)) * 0.9) * (w1 > 0.02 ? 1 : 0);
        if (lines > 0) a = Math.max(a, smoothstep(thr, thr * 2.1, edge[i]) * (0.6 + 0.4 * lines));
        // ink sits unevenly on skin, and old ink has faded in patches
        a *= (0.74 + 0.26 * vnoise(x * 0.16 / sc, y * 0.16 / sc, seed + 11)) * (1 - 0.3 * age * smoothstep(0.55, 0.8, fbm(x / (90 * sc), y / (90 * sc), seed + 13, 3)));
        r += (ink[0] - r) * a; g += (ink[1] - g) * a; b += (ink[2] - b) * a;
      }
      o[k] = r; o[k + 1] = g; o[k + 2] = b; o[k + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
    const inkCss = `rgba(${ink[0]},${ink[1]},${ink[2]},0.88)`, red = `rgba(${RED[0]},${RED[1]},${RED[2]},0.86)`, gold = `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},0.9)`;
    // the border of the miniature: a gold band between two red rules, with a small square at each corner
    const b1 = 7 * sc; ctx.lineWidth = Math.max(1, 1.6 * sc);
    ctx.strokeStyle = gold; ctx.lineWidth = b1 * 0.7; ctx.strokeRect(sx0 - b1 * 0.5, top - b1 * 0.5, pw + b1, ph + b1);
    ctx.strokeStyle = red; ctx.lineWidth = Math.max(1, 1.5 * sc); ctx.strokeRect(sx0 - b1 * 1.1, top - b1 * 1.1, pw + b1 * 2.2, ph + b1 * 2.2); ctx.strokeRect(sx0, top, pw, ph);
    ctx.fillStyle = red; for (const [cx, cy] of [[sx0 - b1 * 1.1, top - b1 * 1.1], [sx0 + pw + b1 * 1.1, top - b1 * 1.1], [sx0 - b1 * 1.1, top + ph + b1 * 1.1], [sx0 + pw + b1 * 1.1, top + ph + b1 * 1.1]]) ctx.fillRect(cx - b1 * 0.7, cy - b1 * 0.7, b1 * 1.4, b1 * 1.4);
    if (!leaf) return;
    // the text block: ruled lines, a red drop capital two lines tall, and the sentence in a formal hand, repeated to fill
    const text = (p.text || '').trim() || 'Lumen', first = text[0].toUpperCase(), rest = text.slice(1), y0 = top + ph + b1 * 1.1 + H * 0.045, y1 = H * 0.94, n = Math.max(2, Math.floor((y1 - y0) / (27 * sc))), lh = (y1 - y0) / n, fs = lh * 0.86, r = rng(seed + 3);
    ctx.strokeStyle = `rgba(${ink[0]},${ink[1]},${ink[2]},0.16)`; ctx.lineWidth = Math.max(1, 0.8 * sc);
    for (let j = 0; j <= n; j++) { ctx.beginPath(); ctx.moveTo(sx0, y0 + j * lh); ctx.lineTo(sx0 + pw, y0 + j * lh); ctx.stroke(); }
    const capW = lh * 1.9;
    ctx.fillStyle = red; ctx.fillRect(sx0, y0 + lh * 0.12, capW, lh * 1.9);
    ctx.fillStyle = `rgba(${SKIN[0]},${SKIN[1]},${SKIN[2]},0.95)`; ctx.font = `600 ${lh * 1.6}px "Bodoni Moda", Georgia, serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(first, sx0 + capW / 2, y0 + lh * 1.12);
    ctx.strokeStyle = gold; ctx.lineWidth = Math.max(1, 1.4 * sc); ctx.strokeRect(sx0 + 3 * sc, y0 + lh * 0.12 + 3 * sc, capW - 6 * sc, lh * 1.9 - 6 * sc);
    ctx.font = `400 ${fs}px "Pinyon Script", "Bodoni Moda", cursive`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = inkCss;
    // after the first time through, the sentence starts again with its first letter in place
    const opening = rest.split(/\s+/).filter(Boolean), again = text.split(/\s+/).filter(Boolean), wordAt = (q) => (q < opening.length ? opening[q] : again[(q - opening.length) % again.length]); let wi = 0;
    for (let j = 0; j < n; j++) {
      let x = sx0 + (j < 2 ? capW + 10 * sc : 0); const end = sx0 + pw, base = y0 + (j + 1) * lh - lh * 0.24;
      for (;;) {
        const w = wordAt(wi), ww = ctx.measureText(w + ' ').width;
        if (x + ww > end) break;
        ctx.globalAlpha = 0.72 + 0.28 * r(); ctx.fillText(w, x, base + (r() - 0.5) * 1.2 * sc); x += ww; wi++;
      }
    }
    ctx.globalAlpha = 1;
  },
});
