// src/engine/styles/domain-warp.js
import { clamp, lerp } from '../utils.js';
import { fbm } from '../helpers.js';

export default {
  id: 'domain-warp',
  name: 'Domain Warp',
  kind: 'animated',
  maxSide: 720,
  thumbAt: 2.5,
  blurb: 'Noise bends the map that tells each pixel where to look in your picture, then noise bends that map again. The picture flows like marbled ink.',
  params: [
    { key: 'amount', label: 'How far it bends', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'scale', label: 'Size of the swirls', type: 'range', min: 10, max: 100, step: 1, default: 45 },
    { key: 'layers', label: 'Layers of warping', type: 'range', min: 1, max: 3, step: 1, default: 2 },
    { key: 'speed', label: 'Speed', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'shade', label: 'Shading in the folds', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'seed', label: 'New noise', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, ow = 0, oh = 0, img = null, small = null, sctx = null, sdata = null, time = 0, dx = null, dy = null, sh = null, built = '', ox = 0, oy = 0, tx = 0, ty = 0;
    const CELL = 5;

    function build() {
      const key = W + '|' + H; if (key === built) return;
      ow = Math.round(W / 2); oh = Math.round(H / 2);
      const c = env.makeCanvas(ow, oh), cx = c.getContext('2d'); cx.imageSmoothingQuality = 'high'; cx.drawImage(work, 0, 0, ow, oh); img = cx.getImageData(0, 0, ow, oh).data;
      small = env.makeCanvas(ow, oh); sctx = small.getContext('2d'); sdata = sctx.createImageData(ow, oh);
      const gw = Math.ceil(ow / CELL) + 2, gh = Math.ceil(oh / CELL) + 2; dx = new Float32Array(gw * gh); dy = new Float32Array(gw * gh); sh = new Float32Array(gw * gh); built = key;
    }

    function field() {
      const gw = Math.ceil(ow / CELL) + 2, gh = Math.ceil(oh / CELL) + 2, s = 0.8 + (p.scale / 100) * 3.4, aspect = oh / ow, t = time, sd = p.seed * 7, L = p.layers, amp = (p.amount / 100) * 0.34;
      for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
        const u = ((i * CELL) / ow) * s + tx, v = ((j * CELL) / oh) * s * aspect * (ow / oh) * 0.8 + ty;
        const qx = fbm(u + t * 0.07, v, sd, 3), qy = fbm(u + 5.2, v + 1.3 - t * 0.06, sd + 3, 3);
        let wx = qx, wy = qy, f = qx;
        if (L >= 2) { wx = fbm(u + 4 * qx + 1.7 + t * 0.09, v + 4 * qy + 9.2, sd + 5, 3); wy = fbm(u + 4 * qx + 8.3, v + 4 * qy + 2.8 - t * 0.08, sd + 8, 3); f = wx; }
        if (L >= 3) { const zx = fbm(u + 4 * wx + 3.1, v + 4 * wy + 0.7 + t * 0.05, sd + 11, 3), zy = fbm(u + 4 * wx + 6.4 - t * 0.04, v + 4 * wy + 5.5, sd + 13, 3); wx = zx; wy = zy; f = zx; }
        const k = j * gw + i; dx[k] = (wx - 0.5) * 2 * amp; dy[k] = (wy - 0.5) * 2 * amp * (ow / oh); sh[k] = f;
      }
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; built = ''; },
      setParams(np) { p = np; },
      step(dt, ptr) {
        build(); time += dt * (p.speed / 100) * 2.4;
        if (ptr && ptr.inside) { tx += ((ptr.x - 0.5) * 2 - tx) * Math.min(1, dt * 3); ty += ((ptr.y - 0.5) * 2 - ty) * Math.min(1, dt * 3); }
      },
      draw(ctx, t, dt, ptr) {
        if (!W) return;
        if (dt > 0) this.step(dt, ptr); else build();
        field();
        const gw = Math.ceil(ow / CELL) + 2, o4 = sdata.data, shade = p.shade / 100;
        for (let y = 0; y < oh; y++) {
          const gj = (y / CELL) | 0, fy = y / CELL - gj;
          for (let x = 0; x < ow; x++) {
            const gi = (x / CELL) | 0, fx = x / CELL - gi, a = gj * gw + gi, b = a + 1, c = a + gw, d = c + 1;
            const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
            const ddx = dx[a] * w00 + dx[b] * w10 + dx[c] * w01 + dx[d] * w11, ddy = dy[a] * w00 + dy[b] * w10 + dy[c] * w01 + dy[d] * w11, f = sh[a] * w00 + sh[b] * w10 + sh[c] * w01 + sh[d] * w11;
            let sx = x + ddx * ow, sy = y + ddy * ow;
            // mirror at the borders so the picture never runs out
            if (sx < 0) sx = -sx; if (sy < 0) sy = -sy; if (sx > ow - 1) sx = 2 * (ow - 1) - sx; if (sy > oh - 1) sy = 2 * (oh - 1) - sy; sx = clamp(sx, 0, ow - 1); sy = clamp(sy, 0, oh - 1);
            const x0 = sx | 0, y0 = sy | 0, x1 = Math.min(ow - 1, x0 + 1), y1 = Math.min(oh - 1, y0 + 1), ax = sx - x0, ay = sy - y0, i00 = (y0 * ow + x0) * 4, i10 = (y0 * ow + x1) * 4, i01 = (y1 * ow + x0) * 4, i11 = (y1 * ow + x1) * 4, o = (y * ow + x) * 4;
            const k = 1 + shade * (f - 0.5) * 0.9;
            for (let ch = 0; ch < 3; ch++) o4[o + ch] = ((img[i00 + ch] * (1 - ax) + img[i10 + ch] * ax) * (1 - ay) + (img[i01 + ch] * (1 - ax) + img[i11 + ch] * ax) * ay) * k;
            o4[o + 3] = 255;
          }
        }
        sctx.putImageData(sdata, 0, 0);
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(small, 0, 0, W, H);
      },
      dispose() {},
    };
  },
};
