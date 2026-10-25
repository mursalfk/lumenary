// src/engine/styles/infrared.js
import { still, clamp, smoothstep, rng } from '../utils.js';
import { addGrain, vignette } from '../helpers.js';

const MODES = [['false', 'False colour'], ['mono', 'Black and white'], ['pink', 'Pink foliage']];

export default still({
  id: 'infrared',
  name: 'Infrared',
  blurb: 'What a camera sees just beyond red: leaves glow white or pink, skies sink to black and a dreamy halo spreads from the highlights.',
  maxSide: 1100,
  params: [
    { key: 'mode', label: 'Film', type: 'select', default: 'false', options: MODES },
    { key: 'glow', label: 'Glow', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'leaf', label: 'Foliage boost', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'sky', label: 'Sky darkening', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'contrast', label: 'Contrast', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'grain', label: 'Grain', type: 'range', min: 0, max: 100, step: 1, default: 25 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    ctx.drawImage(work, 0, 0, W, H);
    const img = ctx.getImageData(0, 0, W, H), d = img.data, leaf = p.leaf / 100, sky = p.sky / 100, ct = 1 + (p.contrast / 100) * 0.9;
    const S = (v) => clamp((v - 0.5) * ct + 0.5);
    for (let i = 0; i < d.length; i += 4) {
      const R = d[i] / 255, G = d[i + 1] / 255, B = d[i + 2] / 255, mx = Math.max(R, B);
      // "greenness": how much the green channel leads the others. Chlorophyll reflects near infrared strongly.
      const gr = clamp((G - mx * 0.85) * 3.2) * leaf, blueness = clamp((B - Math.max(R, G) * 0.9) * 3) * sky;
      let ir = clamp(0.18 * R + 0.62 * G + 0.1 * B + 0.65 * gr - 0.5 * blueness);
      let o0, o1, o2;
      if (p.mode === 'mono') { ir = S(ir); o0 = o1 = o2 = ir; }
      else if (p.mode === 'false') {
        // red and blue channels swapped, with infrared leading the blue (so leaves turn pale cyan-white)
        o0 = B * (1 - 0.35 * blueness) * 0.9 + 0.12 * ir; o1 = 0.55 * G + 0.45 * ir; o2 = clamp(0.55 * R + 0.55 * ir + 0.2 * gr);
        o0 = S(o0); o1 = S(o1); o2 = S(o2);
      } else {
        // pink foliage: infrared is recorded as red, red objects drift toward yellow, blue falls away
        o0 = clamp(ir * 1.05 + 0.35 * gr); o1 = clamp(0.8 * R + 0.12 * ir - 0.25 * gr); o2 = clamp(0.5 * B + 0.3 * G * (1 - gr) + 0.1 * ir - 0.2 * blueness);
        o0 = S(o0); o1 = S(o1); o2 = S(o2);
      }
      d[i] = o0 * 255; d[i + 1] = o1 * 255; d[i + 2] = o2 * 255;
    }
    ctx.putImageData(img, 0, 0);
    if (p.glow > 0) {
      const lay = env.makeCanvas(Math.max(2, W / 7), Math.max(2, H / 7)), lx = lay.getContext('2d'); lx.imageSmoothingQuality = 'high'; lx.drawImage(ctx.canvas, 0, 0, lay.width, lay.height);
      const gi = lx.getImageData(0, 0, lay.width, lay.height), gd = gi.data;
      for (let i = 0; i < gd.length; i += 4) { const l = (gd[i] + gd[i + 1] + gd[i + 2]) / 765, v = smoothstep(0.45, 0.9, l); gd[i] *= v; gd[i + 1] *= v; gd[i + 2] *= v; }
      lx.putImageData(gi, 0, 0);
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = (p.glow / 100) * 1.0; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(lay, 0, 0, W, H); ctx.restore();
    }
    vignette(ctx, W, H, 0.28);
    addGrain(ctx, W, H, (p.grain / 100) * 0.8, 17);
  },
});
