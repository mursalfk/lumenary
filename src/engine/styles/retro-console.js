// src/engine/styles/retro-console.js
import { still, clamp, hash2, sampleImage, lumOf } from '../utils.js';
import { dither, pixelText } from '../retro.js';

const DEPTHS = { 15: [32, 32, 32], 8: [8, 8, 4], 6: [4, 4, 4] };

export default still({
  id: 'retro-console',
  name: 'Retro Console',
  blurb: 'A frame from an early 3D games console: a few hundred lines of picture, a small colour depth held together by dithering, textures that swim across wobbling polygons, and fog in the distance.',
  maxSide: 960,
  params: [
    { key: 'lines', label: 'Picture lines', type: 'range', min: 96, max: 320, step: 8, default: 200 },
    { key: 'depth', label: 'Colour depth', type: 'select', default: '15', options: [['15', '15 bit, 32 768 colours'], ['8', '8 bit, 256 colours'], ['6', '6 bit, 64 colours']] },
    { key: 'dither', label: 'Dithering', type: 'range', min: 0, max: 100, step: 1, default: 70 },
    { key: 'wobble', label: 'Polygon wobble', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'fog', label: 'Distance fog', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'scan', label: 'Scan lines', type: 'toggle', default: true },
    { key: 'hud', label: 'Game display', type: 'toggle', default: true },
    { key: 'seed', label: 'New mesh', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H) {
    // `lines` counts the picture's longer side; the shorter side follows from its shape
    const longSide = Math.max(W, H), lh = Math.max(24, Math.round(H * (p.lines / longSide))), lw = Math.max(24, Math.round(W * (p.lines / longSide)));
    const src = sampleImage(env, work, lw, lh).data, seed = p.seed * 31 + 7, G = Math.max(6, Math.round(lh / 11)), wob = (p.wobble / 100) * G * 0.34;
    // the average colour of the top third, paled, is the fog the far distance fades into
    let fr = 0, fg = 0, fb = 0, n = 0;
    for (let i = 0; i < lw * Math.round(lh / 3); i++) { fr += src[i * 4]; fg += src[i * 4 + 1]; fb += src[i * 4 + 2]; n++; }
    fr = fr / n * 0.55 + 105; fg = fg / n * 0.55 + 108; fb = fb / n * 0.55 + 118;
    const levels = DEPTHS[p.depth] || DEPTHS[15], da = p.dither / 100, fog = p.fog / 100;
    const small = env.makeCanvas(lw, lh), sx = small.getContext('2d'), img = sx.createImageData(lw, lh), o = img.data;
    // where each corner of the mesh thinks it is in the picture: its true place, nudged, then rounded to a whole pixel
    const vx = (i, j) => Math.round(i * G + (hash2(i, j, seed) - 0.5) * 2 * wob), vy = (i, j) => Math.round(j * G + (hash2(i, j, seed + 5) - 0.5) * 2 * wob);
    for (let y = 0; y < lh; y++) for (let x = 0; x < lw; x++) {
      const ci = Math.floor(x / G), cj = Math.floor(y / G), fx = (x - ci * G) / G, fy = (y - cj * G) / G;
      // each square of the mesh is two triangles; inside one, the texture position is a straight blend of its three corners
      let u, v, tri;
      if (fx + fy < 1) { u = vx(ci, cj) * (1 - fx - fy) + vx(ci + 1, cj) * fx + vx(ci, cj + 1) * fy; v = vy(ci, cj) * (1 - fx - fy) + vy(ci + 1, cj) * fx + vy(ci, cj + 1) * fy; tri = 0; }
      else { const a = fx + fy - 1, b = 1 - fx, c = 1 - fy; u = vx(ci + 1, cj + 1) * a + vx(ci, cj + 1) * b + vx(ci + 1, cj) * c; v = vy(ci + 1, cj + 1) * a + vy(ci, cj + 1) * b + vy(ci + 1, cj) * c; tri = 1; }
      const s = (clamp(Math.round(v), 0, lh - 1) * lw + clamp(Math.round(u), 0, lw - 1)) * 4;
      // every triangle is lit as one flat face
      const light = 1 + (hash2(ci * 2 + tri, cj, seed + 9) - 0.5) * 0.16 * (p.wobble / 100);
      let r = src[s] * light, g = src[s + 1] * light, b = src[s + 2] * light;
      const far = fog * Math.max(0, 1 - y / (lh * 0.62)) * (0.55 + 0.45 * lumOf(src[s], src[s + 1], src[s + 2]));
      r += (fr - r) * far; g += (fg - g) * far; b += (fb - b) * far;
      const q = (y * lw + x) * 4;
      o[q] = dither(clamp(r, 0, 255), levels[0], x, y, da); o[q + 1] = dither(clamp(g, 0, 255), levels[1], x, y, da); o[q + 2] = dither(clamp(b, 0, 255), levels[2], x, y, da); o[q + 3] = 255;
    }
    sx.putImageData(img, 0, 0);
    if (p.hud) {
      // the display is drawn into the small frame, so its pixels are the same size as the picture's
      const h = Math.max(6, Math.round(lh / 22)), pad = Math.round(h * 0.9);
      sx.drawImage(pixelText(env, 'STAGE 1  ' + String(p.seed * 4200 % 1000000).padStart(6, '0'), h, '#000000'), pad + 1, pad + 1);
      sx.drawImage(pixelText(env, 'STAGE 1  ' + String(p.seed * 4200 % 1000000).padStart(6, '0'), h, '#fff7d6'), pad, pad);
      const bw = Math.round(lw * 0.3), bx = lw - pad - bw, bh = Math.max(3, Math.round(h * 0.6));
      sx.fillStyle = '#000'; sx.fillRect(bx - 1, pad, bw + 2, bh + 2); sx.fillStyle = '#3b1010'; sx.fillRect(bx, pad + 1, bw, bh);
      sx.fillStyle = '#ffd23c'; sx.fillRect(bx, pad + 1, Math.round(bw * 0.72), bh); sx.fillStyle = '#fff3a8'; sx.fillRect(bx, pad + 1, Math.round(bw * 0.72), 1);
      const t = pixelText(env, 'PRESS START', h, '#ffffff'), tx = Math.round((lw - t.width) / 2), ty = lh - pad - h - 2;
      sx.drawImage(pixelText(env, 'PRESS START', h, '#000000'), tx + 1, ty + 1); sx.drawImage(t, tx, ty);
    }
    ctx.imageSmoothingEnabled = false; ctx.drawImage(small, 0, 0, W, H); ctx.imageSmoothingEnabled = true;
    if (p.scan) { ctx.fillStyle = 'rgba(0,0,0,0.17)'; const rh = H / lh; for (let y = 0; y < lh; y++) ctx.fillRect(0, Math.round((y + 0.62) * rh), W, Math.max(1, Math.round(rh * 0.38))); }
  },
});
