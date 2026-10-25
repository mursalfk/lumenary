// src/engine/styles/duotone.js
import { still, hexToRgb, clamp } from '../utils.js';
import { pixels, paintPixels, contrast, addGrain } from '../helpers.js';

const PRESETS = {
  sunset: ['#2b1055', '#ff9a5a'],
  ocean: ['#04293a', '#8ef0d4'],
  riso: ['#1b2a9a', '#ff7fa8'],
  mono: ['#101012', '#f3efe6'],
  acid: ['#1a0b3b', '#d7ff3a'],
  ember: ['#2a0a0a', '#ffd27a'],
};

export default still({
  id: 'duotone',
  name: 'Duotone',
  blurb: 'Every tone mapped onto a blend between two colours: darks one, lights the other.',
  maxSide: 1400,
  params: [
    { key: 'preset', label: 'Pair', type: 'select', default: 'sunset', options: [['sunset', 'Dusk and peach'], ['ocean', 'Deep sea and mint'], ['riso', 'Ink blue and pink'], ['mono', 'Black and paper'], ['acid', 'Violet and lime'], ['ember', 'Ember and gold'], ['custom', 'Your own']] },
    { key: 'shadow', label: 'Shadows (your own)', type: 'color', default: '#1a1240' },
    { key: 'light', label: 'Highlights (your own)', type: 'color', default: '#ffb35c' },
    { key: 'contrast', label: 'Contrast', type: 'range', min: -50, max: 100, step: 1, default: 20 },
    { key: 'mid', label: 'Midpoint', type: 'range', min: 20, max: 80, step: 1, default: 50 },
    { key: 'grain', label: 'Grain', type: 'range', min: 0, max: 100, step: 1, default: 20 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const pair = p.preset === 'custom' ? [p.shadow, p.light] : PRESETS[p.preset] || PRESETS.sunset;
    const a = hexToRgb(pair[0]), b = hexToRgb(pair[1]), L = cache.L, c = p.contrast / 100, gam = Math.log(0.5) / Math.log(p.mid / 100);
    paintPixels(ctx, W, H, (x, y, o) => {
      const t = clamp(contrast(Math.pow(L[y * W + x], gam), c));
      o[0] = a[0] + (b[0] - a[0]) * t; o[1] = a[1] + (b[1] - a[1]) * t; o[2] = a[2] + (b[2] - a[2]) * t;
    });
    addGrain(ctx, W, H, p.grain / 100 * 0.6);
  },
});
