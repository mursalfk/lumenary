// src/engine/styles/x-ray.js
import { still, clamp, lerp, smoothstep, boxBlur, sobel, hash2, vnoise, roundRect } from '../utils.js';
import { pixels, stretchedL } from '../helpers.js';
import { bloom } from '../toon.js';

// film base colour (where nothing was exposed) and the colour of full density, per kind of film
const FILMS = { blue: [[3, 8, 20], [214, 234, 255]], grey: [[6, 6, 8], [240, 240, 236]], green: [[2, 12, 8], [200, 255, 220]], sepia: [[16, 9, 4], [255, 232, 196]] };

export default still({
  id: 'x-ray',
  name: 'X-ray',
  blurb: 'A radiograph on a light box: tones turned over into pale blue on black, edges shining like dense bone, a mottle of grain, the shadow of the collimator and a lead marker in the corner.',
  maxSide: 1100,
  params: [
    { key: 'invert', label: 'Dark things shine', type: 'toggle', default: true },
    { key: 'structure', label: 'Structure', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'edges', label: 'Bright edges', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'glow', label: 'Light box glow', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'grain', label: 'Mottle', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'film', label: 'Film', type: 'select', default: 'blue', options: [['blue', 'Blue base'], ['grey', 'Neutral'], ['green', 'Fluoroscope green'], ['sepia', 'Old glass plate']] },
    { key: 'marker', label: 'Lead marker and scale', type: 'toggle', default: true },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const N = W * H, sc = W / 1000;
    if (!cache.wide) {
      const Ls = stretchedL(cache), r = Math.max(3, Math.round(14 * sc));
      cache.wide = boxBlur(boxBlur(Ls, W, H, r), W, H, r);
      cache.edge = sobel(boxBlur(Ls, W, H, Math.max(1, Math.round(1.5 * sc))), W, H, 1).mag;
    }
    const Ls = stretchedL(cache), { wide, edge } = cache, st = (p.structure / 100) * 1.5, ed = (p.edges / 100) * 1.6, grain = (p.grain / 100) * 0.16;
    const [base, full] = FILMS[p.film] || FILMS.blue, out = ctx.createImageData(W, H), o = out.data, mx = W * 0.06, my = H * 0.05, feather = Math.min(W, H) * 0.05;
    for (let y = 0, i = 0, k = 0; y < H; y++) for (let x = 0; x < W; x++, i++, k += 4) {
      let v = p.invert ? 1 - Ls[i] : Ls[i];
      const w = p.invert ? 1 - wide[i] : wide[i];
      // structure: push each pixel away from the average of its surroundings, which is what makes fine detail read
      v = clamp(v + (v - w) * st + edge[i] * ed);
      v = Math.pow(v, 1.25);
      // quantum mottle: noise that is strongest where few photons arrived, that is, in the darker greys
      v += ((hash2(x, y, 9) - 0.5) + (vnoise(x * 0.5 / sc, y * 0.5 / sc, 4) - 0.5)) * grain * (0.4 + 0.6 * (1 - v));
      // the collimator: lead shutters that leave the edges of the film unexposed
      const cut = Math.min(smoothstep(mx - feather * 0.5, mx + feather, Math.min(x, W - 1 - x)), smoothstep(my - feather * 0.5, my + feather, Math.min(y, H - 1 - y)));
      v = clamp(v) * (0.06 + 0.94 * cut);
      const t = v * v * (3 - 2 * v) * 0.35 + v * 0.65;
      o[k] = lerp(base[0], full[0], t * t * 0.4 + t * 0.6); o[k + 1] = lerp(base[1], full[1], t); o[k + 2] = lerp(base[2], full[2], Math.pow(t, 0.82)); o[k + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
    bloom(env, ctx, W, H, (p.glow / 100) * 0.6, 10);
    if (!p.marker) return;
    const [fr, fg, fb] = full, ink = `rgba(${fr},${fg},${fb},0.92)`, faint = `rgba(${fr},${fg},${fb},0.55)`;
    // a lead letter in its plastic holder, a centimetre scale down one side and the line of data burned into the film
    const s = W * 0.062, bx = W - mx - s * 1.5, by = my + s * 0.5;
    ctx.strokeStyle = faint; ctx.lineWidth = Math.max(1, 1.5 * sc); roundRect(ctx, bx, by, s, s, s * 0.16); ctx.stroke();
    ctx.fillStyle = ink; ctx.font = `700 ${Math.round(s * 0.7)}px "Hanken Grotesk", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('L', bx + s / 2, by + s * 0.54);
    const x0 = mx + feather * 0.7, step = H * 0.022; ctx.fillStyle = faint;
    for (let j = 0, y = H * 0.3; y < H * 0.72; y += step, j++) ctx.fillRect(x0, y, (j % 5 === 0 ? 14 : 7) * sc, Math.max(1, 1.4 * sc));
    ctx.font = `500 ${Math.round(12 * sc)}px "DM Mono", monospace`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = faint;
    ctx.fillText('LUMENARY   AP   70 kVp   12 mAs   100 cm', x0, H - my - feather * 0.7);
  },
});
