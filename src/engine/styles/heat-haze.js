// src/engine/styles/heat-haze.js
import { clamp, lerp, smoothstep } from '../utils.js';
import { fbm } from '../helpers.js';

export default {
  id: 'heat-haze',
  name: 'Heat Haze',
  kind: 'animated',
  maxSide: 720,
  thumbAt: 2.2,
  blurb: 'Warm air rising bends the light that passes through it. The picture shimmers upward from the heat, tinted a little warmer where it is hottest. The cursor is a flame.',
  params: [
    { key: 'strength', label: 'Strength', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'scale', label: 'Size of the ripples', type: 'range', min: 10, max: 100, step: 1, default: 45 },
    { key: 'speed', label: 'How fast it rises', type: 'range', min: 5, max: 100, step: 1, default: 45 },
    { key: 'source', label: 'Heat comes from', type: 'select', default: 'bottom', options: [['bottom', 'The ground'], ['centre', 'The middle'], ['all', 'Everywhere']] },
    { key: 'warm', label: 'Warm tint', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'split', label: 'Colour fringes', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'seed', label: 'New air', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, ow = 0, oh = 0, img = null, small = null, sctx = null, sdata = null, time = 0, dx = null, dy = null, built = '', hx = 0.5, hy = 0.5, heat = 0;
    const CELL = 6;

    function build() {
      const key = W + '|' + H; if (key === built) return;
      ow = Math.round(W / 2); oh = Math.round(H / 2);
      const c = env.makeCanvas(ow, oh), cx = c.getContext('2d'); cx.imageSmoothingQuality = 'high'; cx.drawImage(work, 0, 0, ow, oh); img = cx.getImageData(0, 0, ow, oh).data;
      small = env.makeCanvas(ow, oh); sctx = small.getContext('2d'); sdata = sctx.createImageData(ow, oh);
      const gw = Math.ceil(ow / CELL) + 2, gh = Math.ceil(oh / CELL) + 2; dx = new Float32Array(gw * gh * 2); built = key;
    }

    function field() {
      const gw = Math.ceil(ow / CELL) + 2, gh = Math.ceil(oh / CELL) + 2, s = 2 + (p.scale / 100) * 9, sd = p.seed * 5, amp = (p.strength / 100) * 0.032 * ow, t = time;
      for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
        const u = (i * CELL) / ow, v = (j * CELL) / oh;
        let w;
        if (p.source === 'bottom') w = Math.pow(smoothstep(0.1, 1.0, v), 1.3);
        else if (p.source === 'centre') w = Math.exp(-(((u - 0.5) * 2) ** 2 + ((v - 0.55) * 1.6) ** 2) * 1.6);
        else w = 0.8;
        if (heat > 0.01) w = Math.max(w, heat * Math.exp(-(((u - hx) * 4) ** 2 + ((v - hy) * 3) ** 2)));
        const nx = fbm(u * s * 1.3, v * s * 0.45 + t * 1.4, sd, 3), ny = fbm(u * s * 1.3 + 7.3, v * s * 0.45 + t * 1.1 + 3.1, sd + 3, 3);
        const k = (j * gw + i) * 2; dx[k] = (nx - 0.5) * 2 * amp * w; dx[k + 1] = (ny - 0.5) * 2 * amp * 0.55 * w - amp * 0.12 * w;
      }
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; built = ''; },
      setParams(np) { p = np; },
      step(dt, ptr) {
        build(); time += dt * (p.speed / 100) * 1.6;
        if (ptr && ptr.inside) { hx += (ptr.x - hx) * Math.min(1, dt * 8); hy += (ptr.y - hy) * Math.min(1, dt * 8); heat += (1 - heat) * Math.min(1, dt * 4); } else heat *= 1 - Math.min(1, dt * 2);
      },
      draw(ctx, t, dt, ptr) {
        if (!W) return;
        if (dt > 0) this.step(dt, ptr); else build();
        field();
        const gw = Math.ceil(ow / CELL) + 2, o4 = sdata.data, warm = p.warm / 100, split = (p.split / 100) * 0.9, mx = ow - 1.001, my = oh - 1.001, row = ow * 4, hot0 = p.source === 'bottom', hotK = 0.8 / (0.012 * ow);
        // one bilinear lookup of one colour channel, with the coordinates held inside the picture
        const bil = (sx, sy, ch) => {
          sx = sx < 0 ? 0 : sx > mx ? mx : sx; sy = sy < 0 ? 0 : sy > my ? my : sy;
          const x0 = sx | 0, y0 = sy | 0, ax = sx - x0, ay = sy - y0, i = y0 * row + x0 * 4 + ch;
          const t = img[i] + (img[i + 4] - img[i]) * ax, b = img[i + row] + (img[i + row + 4] - img[i + row]) * ax;
          return t + (b - t) * ay;
        };
        for (let y = 0; y < oh; y++) {
          const gj = (y / CELL) | 0, fy = y / CELL - gj, hv = y / oh, hv2 = hv * hv, base = gj * gw;
          for (let x = 0; x < ow; x++) {
            const gi = (x / CELL) | 0, fx = x / CELL - gi, a = (base + gi) * 2, b = a + 2, c = a + gw * 2, d = c + 2, w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
            const ddx = dx[a] * w00 + dx[b] * w10 + dx[c] * w01 + dx[d] * w11, ddy = dx[a + 1] * w00 + dx[b + 1] * w10 + dx[c + 1] * w01 + dx[d + 1] * w11, o = (y * ow + x) * 4;
            const hot = warm * Math.min(1, Math.abs(ddx) * hotK) * (hot0 ? hv2 : 0.6), add = 14 * warm * hv2;
            if (split < 0.02) {
              const sx = x + ddx, sy = y + ddy;
              o4[o] = bil(sx, sy, 0) + 36 * hot + add; o4[o + 1] = bil(sx, sy, 1) + 10 * hot; o4[o + 2] = bil(sx, sy, 2) - 14 * hot;
            } else {
              o4[o] = bil(x + ddx * (1 - split), y + ddy * (1 - split), 0) + 36 * hot + add; o4[o + 1] = bil(x + ddx, y + ddy, 1) + 10 * hot; o4[o + 2] = bil(x + ddx * (1 + split), y + ddy * (1 + split), 2) - 14 * hot;
            }
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
