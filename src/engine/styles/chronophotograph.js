// src/engine/styles/chronophotograph.js
import { clamp, lerp, smoothstep } from '../utils.js';
import { makeRing, readFrame, med3 } from '../history.js';

const TONES = { silver: [0.97, 0.99, 1.03], sepia: [1.06, 0.9, 0.7], colour: [1, 1, 1] };
const FIT = 0.5;      // how much of the plate a still picture fills when it is sent across it

export default {
  id: 'chronophotograph',
  name: 'Chronophotograph',
  kind: 'animated',
  maxSide: 640,
  thumbAt: 4.75,
  blurb: 'Étienne-Jules Marey’s way of seeing motion: a single plate, exposed again and again, so every moment of a movement stays on the picture at once. A video leaves a trail of its own past. A still picture is sent across the plate to show the idea.',
  params: [
    { key: 'shots', label: 'Exposures', type: 'range', min: 3, max: 16, step: 1, default: 9 },
    { key: 'gap', label: 'Time between exposures', type: 'range', min: 40, max: 600, step: 10, default: 160, fmt: (v) => v + ' ms' },
    { key: 'fade', label: 'Fade of the older ones', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'ground', label: 'Background', type: 'select', default: 'dark', options: [['dark', 'Crushed to black'], ['keep', 'Kept as shot'], ['movers', 'Only what moves (video)']] },
    { key: 'crush', label: 'Black point', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'tone', label: 'Plate', type: 'select', default: 'silver', options: [['silver', 'Silver'], ['sepia', 'Sepia'], ['colour', 'Colour']] },
    { key: 'grid', label: 'Measuring grid', type: 'toggle', default: true },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, vid = false, raw = null, live = null, base = null, ring = null, offs = [], clock = 0, acc = 0, out = null, sig = '', dirty = true;

    // One frame turned into what goes on the plate: toned, and with the background pushed to black when asked.
    function extract(src, dst) {
      const tone = TONES[p.tone] || TONES.silver, mono = p.tone !== 'colour', lo = (p.crush / 100) * 0.55, crush = p.ground === 'dark';
      for (let i = 0; i < src.length; i += 4) {
        let r = src[i], g = src[i + 1], b = src[i + 2];
        const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255, s = crush ? smoothstep(lo, lo + 0.4, l) : 1;
        if (mono) { const v = 255 * Math.pow(l, 0.92) * s; r = v * tone[0]; g = v * tone[1]; b = v * tone[2]; } else { r *= s; g *= s; b *= s; }
        dst[i] = r; dst[i + 1] = g; dst[i + 2] = b; dst[i + 3] = 255;
      }
      return dst;
    }

    // A still picture, made smaller and centred on a black plate, so there is room to move it across.
    function buildBase() {
      const c = env.makeCanvas(W, H), x = c.getContext('2d'), w = W * FIT, h = H * FIT;
      x.fillStyle = '#000'; x.fillRect(0, 0, W, H); x.imageSmoothingQuality = 'high'; x.drawImage(work, (W - w) / 2, (H - h) / 2, w, h);
      base = new Uint8ClampedArray(W * H * 4); extract(readFrame(c, W, H), base);
      // a soft oval edge, so the picture floats on the plate as a figure instead of showing the corners of a rectangle
      const rx = w / 2, ry = h / 2;
      for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i += 4) {
        const e = Math.hypot((x - W / 2) / rx, (y - H / 2) / ry), m = 1 - smoothstep(0.78, 1.0, e);
        base[i] *= m; base[i + 1] *= m; base[i + 2] *= m;
      }
    }

    // Where a still picture is at time t: swinging across the plate with a small bounce.
    const path = (t) => [Math.round(Math.sin(t * 1.3) * 0.29 * W), Math.round(Math.sin(t * 2.6 + 0.8) * 0.03 * H)];

    function rebuild() {
      const K = p.shots;
      raw = readFrame(work, W, H); live = new Uint8ClampedArray(raw.length);
      ring = makeRing(K, W * H * 4); offs = [];
      if (vid) { extract(raw, live); ring.fill(live); }
      else { buildBase(); live = base; for (let i = 0; i < K; i++) offs.push(path(clock - (i + 1) * (p.gap / 1000))); }
      dirty = false; acc = 0;
    }

    function lighten(dst, src, wq, ox, oy) {
      const y0 = Math.max(0, oy), y1 = Math.min(H, H + oy), x0 = Math.max(0, ox), x1 = Math.min(W, W + ox);
      for (let y = y0; y < y1; y++) {
        let d = (y * W + x0) * 4, s = ((y - oy) * W + (x0 - ox)) * 4;
        for (let x = x0; x < x1; x++, d += 4, s += 4) {
          const r = (src[s] * wq) >> 8, g = (src[s + 1] * wq) >> 8, b = (src[s + 2] * wq) >> 8;
          if (r > dst[d]) dst[d] = r; if (g > dst[d + 1]) dst[d + 1] = g; if (b > dst[d + 2]) dst[d + 2] = b;
        }
      }
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; vid = false; dirty = true; clock = 0; out = null; },
      // A new video frame: from now on the trail is made of the video's own past.
      setFrame(w) { work = w; if (!vid) { vid = true; dirty = true; } else if (!dirty) { raw = readFrame(work, W, H); extract(raw, live); } },
      setParams(np) {
        const s = [np.shots, np.ground, np.crush, np.tone].join('|');
        p = np; if (s !== sig) { sig = s; dirty = true; }
      },
      step(dt) {
        if (!W) return;
        if (dirty) rebuild();
        clock += dt; acc += dt;
        const gap = p.gap / 1000;
        while (acc >= gap) {
          acc -= gap;
          if (vid) ring.push(live);
          else { offs.unshift(path(clock - acc)); offs.length = p.shots; }
        }
      },
      draw(ctx, t, dt) {
        if (!W) return;
        if (dt > 0) this.step(dt); else if (dirty) rebuild();
        if (!out) out = ctx.createImageData(W, H);
        const o = out.data, K = p.shots, fx = lerp(0.35, 3.2, p.fade / 100), movers = vid && p.ground === 'movers';
        o.fill(0); for (let i = 3; i < o.length; i += 4) o[i] = 255;
        const wq = (a) => Math.round(256 * Math.pow(1 - a / K, fx));
        if (movers) {
          // the still background is the median of the newest frame, one from the middle of the trail and the oldest
          const a = ring.at(0), b = ring.at(K >> 1), c = ring.at(K - 1), bg = new Uint8ClampedArray(o.length);
          for (let i = 0; i < bg.length; i++) bg[i] = med3(a[i], b[i], c[i]);
          for (let i = 0; i < o.length; i += 4) { o[i] = bg[i] * 0.5; o[i + 1] = bg[i + 1] * 0.5; o[i + 2] = bg[i + 2] * 0.5; }
          const thr = 22;
          const lay = (src, w) => {
            for (let i = 0; i < o.length; i += 4) {
              const d = Math.max(Math.abs(src[i] - bg[i]), Math.abs(src[i + 1] - bg[i + 1]), Math.abs(src[i + 2] - bg[i + 2]));
              if (d < thr) continue;
              const m = smoothstep(thr, thr * 2.6, d) * w;
              o[i] += (src[i] - o[i]) * m; o[i + 1] += (src[i + 1] - o[i + 1]) * m; o[i + 2] += (src[i + 2] - o[i + 2]) * m;
            }
          };
          for (let a2 = K - 1; a2 >= 1; a2--) lay(ring.at(a2 - 1), wq(a2) / 256);
          lay(live, 1);
        } else if (vid) {
          for (let a = K - 1; a >= 1; a--) lighten(o, ring.at(a - 1), wq(a), 0, 0);
          lighten(o, live, 256, 0, 0);
        } else {
          for (let a = K - 1; a >= 1; a--) { const f = offs[a - 1] || [0, 0]; lighten(o, base, wq(a), f[0], f[1]); }
          const f = path(clock); lighten(o, base, 256, f[0], f[1]);
        }
        ctx.putImageData(out, 0, 0);
        if (p.grid) {
          const step = W / 20; ctx.lineWidth = 1;
          for (let i = 1; i < 20; i++) { ctx.strokeStyle = `rgba(255,255,255,${i % 5 ? 0.05 : 0.11})`; ctx.beginPath(); ctx.moveTo(Math.round(i * step) + 0.5, 0); ctx.lineTo(Math.round(i * step) + 0.5, H); ctx.stroke(); }
          for (let j = 1; j * step < H; j++) { ctx.strokeStyle = `rgba(255,255,255,${j % 5 ? 0.05 : 0.11})`; ctx.beginPath(); ctx.moveTo(0, Math.round(j * step) + 0.5); ctx.lineTo(W, Math.round(j * step) + 0.5); ctx.stroke(); }
        }
        const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.4, W / 2, H / 2, Math.max(W, H) * 0.78);
        vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      },
      dispose() { ring = null; out = null; },
    };
  },
};
