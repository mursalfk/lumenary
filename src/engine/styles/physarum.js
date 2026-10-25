// src/engine/styles/physarum.js
import { clamp, lerp, rng, TAU } from '../utils.js';
import { ramp } from '../helpers.js';

const EMBER = [[6, 4, 10], [86, 20, 34], [214, 84, 28], [255, 208, 118], [255, 248, 228]];
const MOSS = [[4, 8, 8], [14, 54, 52], [40, 150, 120], [180, 236, 160], [250, 255, 230]];

export default {
  id: 'physarum',
  name: 'Physarum',
  kind: 'animated',
  maxSide: 720,
  thumbAt: 5,
  blurb: 'Thousands of slime mould cells follow the scent trails of the others. They lay down a living transport network, drawn toward the light of your picture.',
  params: [
    { key: 'agents', label: 'Cells', type: 'range', min: 2, max: 40, step: 1, default: 9, fmt: (v) => v + '%' },
    { key: 'sense', label: 'Sensing distance', type: 'range', min: 3, max: 18, step: 1, default: 8 },
    { key: 'turn', label: 'Sharpness of turns', type: 'range', min: 10, max: 90, step: 1, default: 40, fmt: (v) => v + '°' },
    { key: 'decay', label: 'How long trails last', type: 'range', min: 80, max: 99, step: 1, default: 93, fmt: (v) => v + '%' },
    { key: 'food', label: 'Attraction to the picture', type: 'range', min: 0, max: 100, step: 1, default: 28 },
    { key: 'seek', label: 'Cells seek', type: 'select', default: 'light', options: [['light', 'The light areas'], ['dark', 'The dark areas']] },
    { key: 'colour', label: 'Colour', type: 'select', default: 'picture', options: [['picture', 'Colours of the picture'], ['ember', 'Ember'], ['moss', 'Moss']] },
    { key: 'seed', label: 'Release again', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, gw = 0, gh = 0, trail, tmp, food, img, ax, ay, aa, n = 0, built = '', small = null, sctx = null, sdata = null, r = rng(3);

    function build() {
      const key = [p.agents, p.seed, p.seek, p.food, W].join('|');
      if (key === built) return;
      gw = clamp(Math.round(W / 3), 90, 240); gh = Math.round((gw * H) / W);
      const c = env.makeCanvas(gw, gh), cx = c.getContext('2d'); cx.imageSmoothingQuality = 'high'; cx.drawImage(work, 0, 0, gw, gh); img = cx.getImageData(0, 0, gw, gh).data;
      const cells = gw * gh; trail = new Float32Array(cells); tmp = new Float32Array(cells); food = new Float32Array(cells);
      let lo = 1, hi = 0; const L = new Float32Array(cells);
      for (let i = 0; i < cells; i++) { const l = (0.2126 * img[i * 4] + 0.7152 * img[i * 4 + 1] + 0.0722 * img[i * 4 + 2]) / 255; L[i] = l; if (l < lo) lo = l; if (l > hi) hi = l; }
      for (let i = 0; i < cells; i++) { const t = (L[i] - lo) / (hi - lo + 1e-6); food[i] = p.seek === 'light' ? t : 1 - t; }
      n = Math.round(cells * (p.agents / 100)); ax = new Float32Array(n); ay = new Float32Array(n); aa = new Float32Array(n);
      r = rng(p.seed * 29 + 11);
      for (let i = 0; i < n; i++) { ax[i] = r() * gw; ay[i] = r() * gh; aa[i] = r() * TAU; }
      small = env.makeCanvas(gw, gh); sctx = small.getContext('2d'); sdata = sctx.createImageData(gw, gh); built = key;
    }

    function tick() {
      const w = gw, h = gh, sd = p.sense, sa = (28 * Math.PI) / 180, ts = (p.turn * Math.PI) / 180, fk = (p.food / 100) * 0.7;
      const sample = (x, y) => { const xi = x < 0 ? 0 : x >= w ? w - 1 : x | 0, yi = y < 0 ? 0 : y >= h ? h - 1 : y | 0, i = yi * w + xi; return trail[i] + fk * food[i]; };
      for (let i = 0; i < n; i++) {
        const a = aa[i], x = ax[i], y = ay[i];
        const fl = sample(x + Math.cos(a - sa) * sd, y + Math.sin(a - sa) * sd), fc = sample(x + Math.cos(a) * sd, y + Math.sin(a) * sd), fr = sample(x + Math.cos(a + sa) * sd, y + Math.sin(a + sa) * sd);
        let na = a;
        if (fc > fl && fc > fr) { /* straight ahead */ } else if (fc < fl && fc < fr) na += (r() < 0.5 ? -1 : 1) * ts; else if (fl < fr) na += ts; else if (fr < fl) na -= ts;
        let nx = x + Math.cos(na), ny = y + Math.sin(na);
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) { nx = clamp(nx, 0, w - 1.001); ny = clamp(ny, 0, h - 1.001); na = r() * TAU; }
        ax[i] = nx; ay[i] = ny; aa[i] = na; trail[(ny | 0) * w + (nx | 0)] += 0.3;
      }
      // blur a little, then fade
      const dc = p.decay / 100;
      for (let y = 0; y < h; y++) {
        const ym = (y > 0 ? y - 1 : y) * w, y0 = y * w, yp = (y < h - 1 ? y + 1 : y) * w;
        for (let x = 0; x < w; x++) {
          const xm = x > 0 ? x - 1 : x, xp = x < w - 1 ? x + 1 : x;
          const s = trail[ym + xm] + trail[ym + x] + trail[ym + xp] + trail[y0 + xm] + trail[y0 + x] * 4 + trail[y0 + xp] + trail[yp + xm] + trail[yp + x] + trail[yp + xp];
          tmp[y0 + x] = (s / 12) * dc;
        }
      }
      const t = trail; trail = tmp; tmp = t;
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; built = ''; },
      setParams(np) { p = np; },
      step(dt, ptr) {
        build();
        if (ptr && ptr.down && ptr.inside) {
          const cx = ptr.x * gw, cy = ptr.y * gh;
          for (let j = -6; j <= 6; j++) for (let i = -6; i <= 6; i++) { const x = (cx + i) | 0, y = (cy + j) | 0; if (x >= 0 && y >= 0 && x < gw && y < gh && i * i + j * j <= 36) trail[y * gw + x] += 2.5; }
        }
        tick(); tick();
      },
      draw(ctx, t, dt, ptr) {
        if (!W) return;
        if (dt > 0) this.step(dt, ptr); else build();
        const cells = gw * gh, o4 = sdata.data, rgb = [0, 0, 0];
        for (let i = 0; i < cells; i++) {
          const o = i * 4, v = clamp(Math.pow(trail[i] * 0.75, 0.8));
          if (p.colour === 'picture') { const k = 0.06 + 1.25 * v; o4[o] = img[o] * k + 255 * v * v * 0.45; o4[o + 1] = img[o + 1] * k + 255 * v * v * 0.45; o4[o + 2] = img[o + 2] * k + 255 * v * v * 0.45; }
          else { ramp(p.colour === 'moss' ? MOSS : EMBER, v, rgb); o4[o] = rgb[0]; o4[o + 1] = rgb[1]; o4[o + 2] = rgb[2]; }
          o4[o + 3] = 255;
        }
        sctx.putImageData(sdata, 0, 0);
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(small, 0, 0, W, H);
      },
      dispose() {},
    };
  },
};
