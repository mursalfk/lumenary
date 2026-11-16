// src/engine/styles/cinematic.js
import { still, clamp, smoothstep, boxBlur, hash2, vnoise } from '../utils.js';
import { pixels } from '../helpers.js';

// Each grade: what is added to the shadows, what to the highlights (as fractions of full scale), how much colour is
// kept, and how hard the contrast curve is.
const GRADES = {
  teal: { sh: [-0.03, 0.035, 0.07], hi: [0.075, 0.03, -0.05], sat: 1.12, con: 0.3 },
  gold: { sh: [0.03, 0.0, -0.035], hi: [0.09, 0.055, -0.03], sat: 1.05, con: 0.2 },
  bleach: { sh: [-0.01, 0.0, 0.015], hi: [0.01, 0.01, 0.0], sat: 0.45, con: 0.55 },
  noir: { sh: [-0.03, 0.0, 0.06], hi: [-0.02, 0.01, 0.05], sat: 0.3, con: 0.45 },
  green: { sh: [-0.03, 0.04, 0.0], hi: [0.02, 0.06, -0.03], sat: 0.85, con: 0.3 },
};
const RATIOS = { 239: 2.39, 185: 1.85, 133: 4 / 3 };

// Box blur along the rows only, for streaks that spread sideways and not up and down.
function smear(src, W, H, r) {
  const out = new Float32Array(W * H), d = 2 * r + 1, cl = (v) => (v < 0 ? 0 : v > W - 1 ? W - 1 : v);
  for (let y = 0; y < H; y++) {
    const row = y * W; let acc = 0;
    for (let i = -r; i <= r; i++) acc += src[row + cl(i)];
    for (let x = 0; x < W; x++) { out[row + x] = acc / d; acc += src[row + cl(x + r + 1)] - src[row + cl(x - r)]; }
  }
  return out;
}

export default still({
  id: 'cinematic',
  name: 'Cinematic',
  blurb: 'A frame from a feature film: shadows pulled toward teal and skin toward orange, a soft bloom, blue streaks drawn sideways from the brightest lights, grain and black bars.',
  maxSide: 1200,
  params: [
    { key: 'grade', label: 'Grade', type: 'select', default: 'teal', options: [['teal', 'Teal and orange'], ['gold', 'Golden hour'], ['bleach', 'Bleach bypass'], ['noir', 'Cold noir'], ['green', 'Sodium green']] },
    { key: 'amount', label: 'Grade strength', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'bloom', label: 'Bloom', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'streak', label: 'Lens streaks', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'grain', label: 'Grain', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'bars', label: 'Frame', type: 'select', default: '239', options: [['239', 'Scope, 2.39 to 1'], ['185', 'Flat, 1.85 to 1'], ['133', 'Academy, 4 to 3'], ['none', 'No bars']] },
    { key: 'text', label: 'Subtitle', type: 'text', default: '', max: 70 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const d = pixels(work, W, H, cache).data, N = W * H, sc = W / 1000, L = cache.L;
    if (!cache.glow) {
      // two masks of the bright parts: a broad one for bloom, and a much stricter one smeared sideways for streaks
      const hot = new Float32Array(N), hotter = new Float32Array(N);
      for (let i = 0; i < N; i++) { hot[i] = smoothstep(0.62, 0.95, L[i]); hotter[i] = smoothstep(0.84, 0.98, L[i]); }
      const r = Math.max(2, Math.round(11 * sc));
      cache.glow = boxBlur(boxBlur(hot, W, H, r), W, H, r);
      const lr = Math.max(4, Math.round(W * 0.07));
      cache.line = boxBlur(smear(smear(smear(hotter, W, H, lr), W, H, lr), W, H, lr), W, H, Math.max(1, Math.round(1.5 * sc)));
    }
    const G = GRADES[p.grade] || GRADES.teal, k = p.amount / 100, sat = 1 + (G.sat - 1) * k, con = G.con * k, bloom = (p.bloom / 100) * 0.55, streak = (p.streak / 100) * 2.4, grain = (p.grain / 100) * 26;
    const out = ctx.createImageData(W, H), o = out.data, cx = W / 2, cy = H / 2, rm = Math.hypot(cx, cy), { glow, line } = cache;
    for (let y = 0, i = 0, q = 0; y < H; y++) for (let x = 0; x < W; x++, i++, q += 4) {
      let r = d[q] / 255, g = d[q + 1] / 255, b = d[q + 2] / 255;
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = l + (r - l) * sat; g = l + (g - l) * sat; b = l + (b - l) * sat;
      // split toning: the tint for shadows fades out as the pixel gets brighter, the one for highlights fades in
      const ws = (1 - l) * (1 - l) * k, wh = l * l * k;
      r += G.sh[0] * ws * 2 + G.hi[0] * wh * 2; g += G.sh[1] * ws * 2 + G.hi[1] * wh * 2; b += G.sh[2] * ws * 2 + G.hi[2] * wh * 2;
      // an S curve round the middle grey
      const curve = (v) => { v = clamp(v); const s = v * v * (3 - 2 * v); return v + (s - v) * con * 1.6; };
      r = curve(r); g = curve(g); b = curve(b);
      const gl = glow[i] * bloom, st = clamp(line[i] * streak);
      r += (1 - r) * gl + 0.25 * st; g += (0.93 - g) * gl * 0.9 + 0.5 * st; b += (0.82 - b) * gl * 0.7 + 1.0 * st;
      const v = 1 - 0.34 * k * smoothstep(0.45, 1.05, Math.hypot(x - cx, y - cy) / rm);
      // grain is coarser than a pixel and strongest in the mid tones, as on film
      const n = ((hash2(x, y, 3) - 0.5) * 0.6 + (vnoise(x * 0.42 / sc, y * 0.42 / sc, 5) - 0.5)) * grain * (0.5 + 2 * l * (1 - l));
      o[q] = r * 255 * v + n; o[q + 1] = g * 255 * v + n; o[q + 2] = b * 255 * v + n; o[q + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
    // bars are added on the short side to bring the picture toward the chosen shape
    const ratio = RATIOS[p.bars]; let top = 0;
    ctx.fillStyle = '#000';
    if (ratio) {
      // On an upright picture a true scope frame would leave only a strip, so each bar stops at an eighth of the height.
      if (W / H < ratio) { top = Math.min((H - W / ratio) / 2, H * 0.125); ctx.fillRect(0, 0, W, Math.ceil(top)); ctx.fillRect(0, Math.floor(H - top), W, Math.ceil(top)); }
      else { const side = Math.min((W - H * ratio) / 2, W * 0.125); ctx.fillRect(0, 0, Math.ceil(side), H); ctx.fillRect(Math.floor(W - side), 0, Math.ceil(side), H); }
    }
    const text = (p.text || '').trim();
    if (text) {
      let px = Math.max(12, W * 0.03);
      ctx.font = `500 ${px}px "Hanken Grotesk", sans-serif`;
      const room = W * 0.84, need = ctx.measureText(text).width;
      if (need > room) { px *= room / need; ctx.font = `500 ${px}px "Hanken Grotesk", sans-serif`; }
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      const y = H - top - px * 1.1;
      ctx.lineJoin = 'round'; ctx.lineWidth = px * 0.16; ctx.strokeStyle = 'rgba(0,0,0,0.72)'; ctx.strokeText(text, W / 2, y);
      ctx.fillStyle = '#fbf6e6'; ctx.fillText(text, W / 2, y);
    }
  },
});
