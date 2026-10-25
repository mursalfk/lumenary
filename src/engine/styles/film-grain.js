// src/engine/styles/film-grain.js
import { still, rng, hash2, vnoise, clamp, smoothstep, lerp } from '../utils.js';

// Each stock is a tone curve (S-shaped, with its own toe and shoulder), a colour balance and a grain character.
const STOCKS = {
  tri: { name: 'Black and white 400', mono: true, toe: 0.05, shoulder: 0.96, bal: [1, 1, 1], sat: 0, grainK: 1.0 },
  portra: { name: 'Portrait colour', mono: false, toe: 0.04, shoulder: 0.97, bal: [1.03, 1.0, 0.95], sat: 0.92, grainK: 0.7 },
  slide: { name: 'Slide film', mono: false, toe: 0.01, shoulder: 0.99, bal: [1.0, 1.0, 1.02], sat: 1.28, grainK: 0.5 },
  tungsten: { name: 'Night film', mono: false, toe: 0.07, shoulder: 0.93, bal: [0.9, 1.0, 1.14], sat: 1.05, grainK: 1.25 },
};

export default still({
  id: 'film-grain',
  name: 'Film Grain',
  blurb: 'Silver halide, up close: grain that is strongest in the mid-tones, a soft shoulder in the highlights, halation, dust and a scratch or two.',
  maxSide: 1100,
  params: [
    { key: 'stock', label: 'Film stock', type: 'select', default: 'tri', options: Object.entries(STOCKS).map(([k, v]) => [k, v.name]) },
    { key: 'amount', label: 'Grain amount', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'size', label: 'Grain size', type: 'range', min: 1, max: 5, step: 0.25, default: 1.8, fmt: (v) => v.toFixed(2) },
    { key: 'halation', label: 'Halation', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'fade', label: 'Faded blacks', type: 'range', min: 0, max: 100, step: 1, default: 25 },
    { key: 'dust', label: 'Dust and scratches', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'seed', label: 'New frame', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    const sc = W / 800, st = STOCKS[p.stock] || STOCKS.tri, seed = p.seed * 7 + 2;
    ctx.drawImage(work, 0, 0, W, H);
    const img = ctx.getImageData(0, 0, W, H), d = img.data, cell = Math.max(1, p.size * sc * 0.75), amt = (p.amount / 100) * 0.27 * st.grainK, fade = (p.fade / 100) * 0.12;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      let R = d[i] / 255, G = d[i + 1] / 255, B = d[i + 2] / 255;
      const l = 0.2126 * R + 0.7152 * G + 0.0722 * B;
      if (st.mono) { R = G = B = l; } else { R = l + (R - l) * st.sat; G = l + (G - l) * st.sat; B = l + (B - l) * st.sat; }
      R *= st.bal[0]; G *= st.bal[1]; B *= st.bal[2];
      // toe and shoulder
      const curve = (v) => { v = clamp(v); const t = smoothstep(0, 1, v); return st.toe + (st.shoulder - st.toe) * (0.55 * v + 0.45 * t); };
      R = curve(R); G = curve(G); B = curve(B);
      const ll = 0.2126 * R + 0.7152 * G + 0.0722 * B, mid = 4 * ll * (1 - ll) * 0.8 + 0.2;
      // clumped grain: soft blobs plus a fine speckle, independent per channel on colour stocks
      const gx = x / cell, gy = y / cell;
      const g0 = (vnoise(gx, gy, seed) - 0.5) * 1.5 + (hash2(x, y, seed + 1) - 0.5) * 0.9;
      if (st.mono) { const n = g0 * amt * mid; R += n; G += n; B += n; }
      else {
        const n1 = (vnoise(gx, gy, seed + 3) - 0.5) * 1.4 + (hash2(x, y, seed + 4) - 0.5) * 0.8, n2 = (vnoise(gx + 40, gy, seed + 5) - 0.5) * 1.4 + (hash2(x, y, seed + 6) - 0.5) * 0.8;
        R += (g0 * 0.6 + n1 * 0.4) * amt * mid; G += (g0 * 0.6 + n2 * 0.4) * amt * mid; B += (g0 * 0.6 - n1 * 0.2 + n2 * 0.2) * amt * mid;
      }
      d[i] = clamp(fade + R * (1 - fade)) * 255; d[i + 1] = clamp(fade + G * (1 - fade)) * 255; d[i + 2] = clamp(fade + B * (1 - fade)) * 255;
    }
    ctx.putImageData(img, 0, 0);
    // halation: light scattering back through the film base, red-orange around the brightest parts
    if (p.halation > 0) {
      const k = 8, a = env.makeCanvas(Math.max(2, W / k), Math.max(2, H / k)), ax = a.getContext('2d');
      ax.drawImage(ctx.canvas, 0, 0, a.width, a.height);
      const hi = ax.getImageData(0, 0, a.width, a.height), hd = hi.data;
      for (let i = 0; i < hd.length; i += 4) {
        const l = (0.3 * hd[i] + 0.59 * hd[i + 1] + 0.11 * hd[i + 2]) / 255, v = smoothstep(0.62, 0.95, l);
        const tint = st.mono ? [1, 1, 1] : [1, 0.38, 0.16];
        hd[i] = 255 * v * tint[0]; hd[i + 1] = 255 * v * tint[1]; hd[i + 2] = 255 * v * tint[2]; hd[i + 3] = 255;
      }
      ax.putImageData(hi, 0, 0);
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = (p.halation / 100) * 0.95; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(a, 0, 0, W, H); ctx.restore();
    }
    // dust, hair and long vertical scratches
    if (p.dust > 0) {
      const r = rng(seed * 13), k = p.dust / 100;
      ctx.save();
      for (let i = 0; i < Math.round(110 * k * (W * H) / 640000); i++) {
        const x = r() * W, y = r() * H, s = (0.5 + r() * 1.7) * sc * (r() < 0.06 ? 2.4 : 1);
        ctx.fillStyle = `rgba(${r() < 0.7 ? '240,238,230' : '10,10,10'},${0.35 + r() * 0.5})`;
        ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
      }
      ctx.lineWidth = Math.max(1, sc * 0.9); ctx.lineCap = 'round';
      for (let i = 0; i < Math.round(6 * k); i++) {
        ctx.strokeStyle = `rgba(245,243,235,${0.12 + r() * 0.25})`;
        const x = r() * W, len = H * (0.15 + r() * 0.7), y = r() * (H - len);
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let j = 1; j <= 8; j++) ctx.lineTo(x + (vnoise(j * 0.7, i, seed) - 0.5) * 3 * sc, y + (len * j) / 8);
        ctx.stroke();
      }
      for (let i = 0; i < Math.round(3 * k); i++) {
        ctx.strokeStyle = 'rgba(20,18,16,0.5)'; ctx.lineWidth = Math.max(1, sc * 0.7);
        const x0 = r() * W, y0 = r() * H; ctx.beginPath(); ctx.moveTo(x0, y0);
        let a = r() * 6.28; for (let j = 0; j < 7; j++) { a += (r() - 0.5) * 1.6; ctx.lineTo(x0 + Math.cos(a) * (j + 1) * 7 * sc, y0 + Math.sin(a) * (j + 1) * 7 * sc); }
        ctx.stroke();
      }
      ctx.restore();
    }
  },
});
