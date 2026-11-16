// src/engine/styles/pin-art.js
import { clamp, lerp, smoothstep, sampleImage } from '../utils.js';

const METALS = { steel: [196, 204, 214], brass: [222, 176, 96], copper: [214, 122, 84] };
const LIGHT = (() => { const v = [-0.42, -0.52, 0.74], n = Math.hypot(...v); return v.map((a) => a / n); })();

export default {
  id: 'pin-art',
  name: 'Pin Art',
  kind: 'animated',
  maxSide: 720,
  thumbAt: 2.2,
  blurb: 'The desk toy of a thousand loose metal pins. Each pin slides out as far as the picture is bright, so the picture stands up as a relief of shining heads. Press into it with the cursor and the pins sink, then spring back. On video the pins follow every frame.',
  params: [
    { key: 'pins', label: 'Pins across', type: 'range', min: 30, max: 140, step: 1, default: 72 },
    { key: 'relief', label: 'How far the pins stand', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'metal', label: 'Metal', type: 'select', default: 'steel', options: [['steel', 'Steel'], ['brass', 'Brass'], ['copper', 'Copper'], ['picture', 'Painted in the picture’s colours']] },
    { key: 'invert', label: 'Pins stand out where the picture is', type: 'select', default: 'light', options: [['light', 'Light'], ['dark', 'Dark']] },
    { key: 'wave', label: 'Idle ripple', type: 'range', min: 0, max: 100, step: 1, default: 30 },
    { key: 'spring', label: 'Springiness', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'hand', label: 'Press with the cursor', type: 'toggle', default: true },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, cols = 0, rows = 0, cw = 0, ch = 0, h = null, v = null, tone = null, colr = null, fresh = true, built = '', out = null, clock = 0, hx = 0.5, hy = 0.5, hold = 0, prevIn = false;

    function sample() {
      const d = sampleImage(env, work, cols, rows).data;
      for (let i = 0; i < cols * rows; i++) {
        const l = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255, c = Math.pow(clamp((l - 0.5) * 1.3 + 0.5), 0.8);
        tone[i] = p.invert === 'dark' ? 1 - c : c;
        colr[i * 3] = d[i * 4]; colr[i * 3 + 1] = d[i * 4 + 1]; colr[i * 3 + 2] = d[i * 4 + 2];
      }
      fresh = false;
    }
    function build() {
      const key = W + '|' + H + '|' + p.pins; if (key === built) return; built = key;
      cols = p.pins; cw = W / cols; rows = Math.max(4, Math.round(H / cw)); ch = H / rows;
      h = new Float32Array(cols * rows); v = new Float32Array(cols * rows); tone = new Float32Array(cols * rows); colr = new Float32Array(cols * rows * 3);
      fresh = true;
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; built = ''; out = null; clock = 0; },
      setFrame(w) { work = w; fresh = true; },
      setParams(np) { const inv = p.invert; p = np; if (inv !== np.invert) fresh = true; },
      step(dt, ptr) {
        if (!W) return;
        build(); if (fresh) sample();
        clock += dt;
        const k = lerp(60, 14, p.spring / 100), c = lerp(2 * Math.sqrt(k) * 1.05, 2 * Math.sqrt(k) * 0.32, p.spring / 100), sub = Math.max(1, Math.ceil(dt / 0.016)), dts = dt / sub, wave = p.wave / 100;
        const inside = p.hand && ptr && ptr.inside;
        if (inside) { hx += (ptr.x - hx) * Math.min(1, dt * 18); hy += (ptr.y - hy) * Math.min(1, dt * 18); if (!prevIn) { hx = ptr.x; hy = ptr.y; } }
        hold += ((inside ? 1 : 0) - hold) * Math.min(1, dt * 10); prevIn = !!inside;
        const rad = 0.075, aspect = H / W;
        for (let s = 0; s < sub; s++) {
          for (let j = 0, i = 0; j < rows; j++) for (let x = 0; x < cols; x++, i++) {
            let t = tone[i] + (Math.sin((x / cols * 1.3 + j / rows * 0.9) * 6.283 - clock * 1.5) * 0.5) * 0.16 * wave;
            // the hand: pins under it are pushed flat at once and then spring back as it moves on
            if (hold > 0.02) {
              const dx = (x + 0.5) / cols - hx, dy = ((j + 0.5) / rows - hy) * aspect, g = Math.exp(-(dx * dx + dy * dy) / (2 * rad * rad)) * hold;
              if (g > 0.01) { const cap = 1 - g * 1.0; if (h[i] > cap) { h[i] = cap; v[i] = Math.min(v[i], 0); } t = Math.min(t, cap); }
            }
            v[i] += (k * (clamp(t) - h[i]) - c * v[i]) * dts; h[i] += v[i] * dts;
            if (h[i] < 0) { h[i] = 0; v[i] = 0; } else if (h[i] > 1) { h[i] = 1; v[i] = 0; }
          }
        }
      },
      draw(ctx, t, dt, ptr) {
        if (!W) return;
        if (dt > 0) this.step(dt, ptr); else { build(); if (fresh) sample(); if (!clock) { clock = 1; for (let i = 0; i < h.length; i++) h[i] = tone[i]; } }
        if (!out) out = ctx.createImageData(W, H);
        const o = out.data, relief = p.relief / 100, paint = p.metal === 'picture', metal = METALS[p.metal] || METALS.steel;
        for (let y = 0; y < H; y++) {
          const j = Math.min(rows - 1, (y / ch) | 0), fy = (y - (j + 0.5) * ch) / (ch / 2);
          for (let x = 0; x < W; x++) {
            const i0 = Math.min(cols - 1, (x / cw) | 0), i = j * cols + i0, fx = (x - (i0 + 0.5) * cw) / (cw / 2), hh = h[i] * relief, rho = 0.6 + 0.33 * hh, r2 = fx * fx + fy * fy, d = (y * W + x) * 4;
            if (r2 < rho * rho) {
              // the pin's round head, lit from the upper left; a taller pin catches more of the light
              const nx = fx / rho, ny = fy / rho, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny)), diff = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
              const rz = 2 * nz * diff - LIGHT[2], spec = Math.pow(Math.max(0, rz), 36) * (0.4 + 0.9 * hh), lift = 0.3 + 1.05 * hh, edge = 0.55 + 0.45 * smoothstep(1, 0.82, Math.sqrt(r2) / rho);
              const base = 0.3 + 0.9 * diff;
              let r, g, b;
              if (paint) { r = colr[i * 3]; g = colr[i * 3 + 1]; b = colr[i * 3 + 2]; const m = Math.max(24, 0.3 * r + 0.59 * g + 0.11 * b), k = Math.min(4, 205 / m); r = clamp(r * k, 0, 255); g = clamp(g * k, 0, 255); b = clamp(b * k, 0, 255); }
              else { r = metal[0]; g = metal[1]; b = metal[2]; }
              const sh = base * lift * edge;
              o[d] = r * sh + spec * 255 * 0.9; o[d + 1] = g * sh + spec * 255 * 0.9; o[d + 2] = b * sh + spec * 255 * 0.9;
            } else {
              // between the pins: dark, with a thin rim of light on the shaft of a tall one
              const rim = Math.exp(-Math.pow((Math.sqrt(r2) - rho) / 0.14, 2)) * hh * 0.35;
              o[d] = 9 + rim * 70; o[d + 1] = 9 + rim * 72; o[d + 2] = 12 + rim * 80;
            }
            o[d + 3] = 255;
          }
        }
        ctx.putImageData(out, 0, 0);
      },
      dispose() { out = null; },
    };
  },
};
