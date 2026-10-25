// src/engine/styles/double-exposure.js
import { still, rng, clamp, smoothstep, lerp, boxBlur, hexToRgb, TAU } from '../utils.js';
import { pixels, stretchedL, fbm, ramp } from '../helpers.js';

const TINTS = {
  blue: ['#0b1626', '#dfe9f2'], sepia: ['#2a1a10', '#f1e3cc'], mono: ['#101010', '#f1f1ee'], rose: ['#2b1224', '#f7e1e3'], forest: ['#0d1f17', '#e4eedd'],
};
const SCENES = [['mountains', 'Mountains'], ['pines', 'Pine forest'], ['skyline', 'City at dusk'], ['moon', 'Moon and clouds']];

const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

// A second exposure drawn from scratch in the same two inks as the photograph.
function drawScene(env, kind, W, H, seed, dark, light) {
  const cv = env.makeCanvas(W, H), x = cv.getContext('2d'), r = rng(seed * 41 + 3), sc = W / 800;
  const sky = x.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, css(mix(light, dark, 0.2))); sky.addColorStop(0.7, css(mix(light, dark, 0.02))); sky.addColorStop(1, css(mix(light, dark, 0.12)));
  x.fillStyle = sky; x.fillRect(0, 0, W, H);
  const fog = (y0, y1, a) => { const g = x.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, css(light, 0)); g.addColorStop(1, css(light, a)); x.fillStyle = g; x.fillRect(0, y0, W, y1 - y0); };
  if (kind === 'mountains') {
    for (let L = 0; L < 6; L++) {
      const base = H * (0.35 + L * 0.1), amp = H * (0.16 - L * 0.012), t = L / 5, col = mix(mix(light, dark, 0.3), mix(light, dark, 0.62), t);
      x.beginPath(); x.moveTo(0, H);
      for (let i = 0; i <= W; i += 3) x.lineTo(i, base - (fbm(i / (W * 0.33) + L * 5.3, L * 2.1, seed + L, 4) - 0.35) * amp * 2.2);
      x.lineTo(W, H); x.closePath(); x.fillStyle = css(col); x.fill();
      fog(base - amp, base + H * 0.12, 0.45 - t * 0.3);
    }
  } else if (kind === 'pines') {
    for (let L = 0; L < 5; L++) {
      const t = L / 4, base = H * (0.52 + L * 0.1), col = mix(mix(light, dark, 0.3), mix(light, dark, 0.66), t), n = Math.round(14 + L * 7), hh = H * (0.15 + L * 0.06);
      x.fillStyle = css(col);
      for (let i = 0; i < n; i++) {
        const cx = (i + r() * 0.8) * (W / n), h = hh * (0.7 + r() * 0.6), w = h * 0.34;
        for (let k = 0; k < 4; k++) { const y0 = base - h + (k / 4) * h * 0.78, y1 = base - h + ((k + 1.5) / 4) * h * 0.9, ww = w * (0.4 + (k + 1) * 0.22); x.beginPath(); x.moveTo(cx, y0); x.lineTo(cx + ww, y1); x.lineTo(cx - ww, y1); x.closePath(); x.fill(); }
        x.fillRect(cx - w * 0.04, base - h * 0.1, w * 0.08, h * 0.12);
      }
      x.fillRect(0, base, W, H - base);
      fog(base - hh * 1.1, base + 10 * sc, 0.5 - t * 0.35);
    }
  } else if (kind === 'skyline') {
    const warm = [255, 214, 140];
    for (let L = 0; L < 3; L++) {
      const t = L / 2, base = H * (0.72 + L * 0.08), col = mix(mix(light, dark, 0.42), mix(light, dark, 0.7), t);
      let px = -10;
      while (px < W) {
        const w = (28 + r() * 70) * sc * (1 + L * 0.35), h = H * (0.1 + r() * 0.3 - L * 0.04);
        x.fillStyle = css(col); x.fillRect(px, base - h, w, h + H);
        if (L > 0 || r() < 0.5) {
          x.fillStyle = css(lerp(1, 0.6, t) * 1 ? mix(col, warm, 0.65) : warm, 0.85);
          const ww = 3 * sc * (1 + L * 0.3), gx = 7 * sc * (1 + L * 0.3);
          for (let wy = base - h + gx; wy < base - gx; wy += gx * 1.5) for (let wx = px + gx * 0.7; wx < px + w - gx * 0.7; wx += gx) if (r() < 0.35) x.fillRect(wx, wy, ww, ww * 1.4);
        }
        px += w + r() * 5 * sc;
      }
      fog(base - H * 0.2, base, 0.35 - t * 0.2);
    }
  } else {
    // moon, stars and bands of cloud
    for (let i = 0; i < 160; i++) { x.fillStyle = css(light, 0.15 + r() * 0.6); const s = (0.4 + r() * 1.3) * sc; x.fillRect(r() * W, r() * H * 0.7, s, s); }
    const mx = W * (0.3 + r() * 0.4), my = H * 0.3, mr = W * 0.17, g = x.createRadialGradient(mx, my, mr * 0.2, mx, my, mr * 2.8);
    g.addColorStop(0, css(light, 0.55)); g.addColorStop(1, css(light, 0)); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = css(mix(light, [255, 255, 255], 0.3)); x.beginPath(); x.arc(mx, my, mr, 0, TAU); x.fill();
    x.fillStyle = css(mix(light, dark, 0.28), 0.5); for (let i = 0; i < 14; i++) { x.beginPath(); x.arc(mx + (r() - 0.5) * mr * 1.1, my + (r() - 0.5) * mr * 1.1, mr * (0.06 + r() * 0.1), 0, TAU); x.fill(); }
    for (let b = 0; b < 5; b++) {
      const y = H * (0.45 + b * 0.12);
      x.beginPath(); x.moveTo(0, H);
      for (let i = 0; i <= W; i += 4) x.lineTo(i, y - fbm(i / (W * 0.25), b * 3.3, seed + 70 + b, 4) * H * 0.16);
      x.lineTo(W, H); x.closePath(); x.fillStyle = css(mix(mix(light, dark, 0.36), mix(light, dark, 0.7), b / 4), 0.94); x.fill();
    }
  }
  return cv;
}

export default still({
  id: 'double-exposure',
  name: 'Double Exposure',
  blurb: 'Two frames on one piece of film: the picture’s tones become a window, and a second scene (mountains, pines, a city) shows through it.',
  maxSide: 1000,
  params: [
    { key: 'scene', label: 'Second scene', type: 'select', default: 'mountains', options: SCENES },
    { key: 'tint', label: 'Ink', type: 'select', default: 'blue', options: [['blue', 'Blue'], ['sepia', 'Sepia'], ['mono', 'Mono'], ['rose', 'Rose'], ['forest', 'Forest']] },
    { key: 'fill', label: 'Scene shows in', type: 'select', default: 'dark', options: [['dark', 'The shadows'], ['light', 'The highlights']] },
    { key: 'level', label: 'Where the window opens', type: 'range', min: 10, max: 90, step: 1, default: 38 },
    { key: 'soft', label: 'Softness of the window', type: 'range', min: 5, max: 60, step: 1, default: 28 },
    { key: 'detail', label: 'Photo detail kept', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'seed', label: 'New scene', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const img = pixels(work, W, H, cache), sc = W / 800, N = W * H;
    const [dk, lt] = (TINTS[p.tint] || TINTS.blue).map(hexToRgb);
    const skey = p.scene + '|' + p.tint + '|' + p.seed + '|' + W;
    if (cache.skey !== skey) { cache.scene = drawScene(env, p.scene, W, H, p.seed, dk, lt).getContext('2d').getImageData(0, 0, W, H).data; cache.skey = skey; }
    if (cache.bkey !== W) { cache.Lb = boxBlur(boxBlur(stretchedL(cache), W, H, Math.round(5 * sc)), W, H, Math.round(5 * sc)); cache.bkey = W; }
    const S = cache.scene, Lb = cache.Lb, L = cache.Ls, lv = p.level / 100, sf = p.soft / 100 * 0.5 + 0.02, det = p.detail / 100, out = ctx.createImageData(W, H), o4 = out.data, rgb = [0, 0, 0];
    for (let i = 0; i < N; i++) {
      const o = i * 4, v = p.fill === 'dark' ? 1 - Lb[i] : Lb[i], m = smoothstep(lv - sf, lv + sf, v);
      ramp([dk, lt], L[i], rgb);
      const hold = 0.82;
      for (let c = 0; c < 3; c++) {
        const scn = S[o + c] * clamp(hold + det * (L[i] - 0.5) * 0.9 + 0.05, 0, 1.15);
        const base = rgb[c], film = 255 - (255 - base) * (255 - scn * m * 0.55) / 255;
        o4[o + c] = lerp(base, scn, m * 0.96) * 0.8 + film * 0.2;
      }
      o4[o + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  },
});
