// src/engine/styles/slit-scan.js
import { clamp, lerp, TAU } from '../utils.js';
import { makeRing, readFrame } from '../history.js';

const K = 18;     // frames kept for the time warp

export default {
  id: 'slit-scan',
  name: 'Slit-scan',
  kind: 'animated',
  maxSide: 640,
  thumbAt: 2.4,
  blurb: 'The camera trick behind the stargate in 2001 and the finish-line photo: not the whole frame, only a narrow slit of it, taken again and again. Either the slits are laid side by side as the seconds pass, or every row of the picture is taken from a different moment. A still picture is scanned back and forth so you can see it stretch.',
  params: [
    { key: 'mode', label: 'Kind of scan', type: 'select', default: 'finish', options: [['finish', 'Finish line: one slit, over time'], ['warp', 'Time warp: each row, a different moment']] },
    { key: 'speed', label: 'Scroll speed (finish line)', type: 'range', min: 10, max: 100, step: 1, default: 45 },
    { key: 'slit', label: 'Where the slit is (finish line)', type: 'range', min: 5, max: 95, step: 1, default: 50, fmt: (v) => v + '%' },
    { key: 'way', label: 'Scrolls towards (finish line)', type: 'select', default: 'left', options: [['left', 'Left'], ['right', 'Right'], ['up', 'Up'], ['down', 'Down']] },
    { key: 'spread', label: 'Time spread (time warp)', type: 'range', min: 10, max: 100, step: 1, default: 55 },
    { key: 'shape', label: 'Warp shape (time warp)', type: 'select', default: 'down', options: [['down', 'Top to bottom'], ['across', 'Left to right'], ['ripple', 'Rolling ripple'], ['tunnel', 'Tunnel from the middle']] },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, vid = false, live = null, strip = null, N = 0, Lh = 0, head = 0, ring = null, out = null, clock = 0, carry = 0, acc = 0, prev = null, sig = '', dirty = true, offs = [];

    const horizontal = () => p.way === 'left' || p.way === 'right';

    // Where the slit is at time t. On a video it stays put; on a still picture it swings across, so the picture is scanned
    // at a changing speed and stretches where the slit slows down.
    const slitAt = (t) => {
      const span = horizontal() ? W : H, c = ((p.slit / 100) * (span - 1)), rate = lerp(60, 520, p.speed / 100) * (span / 640), A = 0.46 * span, w = (0.8 * rate) / (0.788 * A);
      // a rounded triangle wave: the slit crosses the picture at a steady 80% of the scroll speed, and slows to turn at the ends
      return vid ? c : clamp(c + (Math.asin(0.92 * Math.sin(w * (t - 2.4) + 1.3)) / Math.asin(0.92)) * A, 0, span - 1);
    };
    // The slit's colours at position `s` of the current picture, written into `dst` at `at`.
    function readSlit(s, dst, at) {
      const s0 = Math.floor(s), s1 = Math.min((horizontal() ? W : H) - 1, s0 + 1), f = s - s0;
      for (let i = 0; i < Lh; i++) {
        const a = horizontal() ? (i * W + s0) * 4 : (s0 * W + i) * 4, b = horizontal() ? (i * W + s1) * 4 : (s1 * W + i) * 4, o = at + i * 4;
        dst[o] = live[a] + (live[b] - live[a]) * f; dst[o + 1] = live[a + 1] + (live[b + 1] - live[a + 1]) * f; dst[o + 2] = live[a + 2] + (live[b + 2] - live[a + 2]) * f; dst[o + 3] = 255;
      }
    }
    function push(s) { head = (head + 1) % N; readSlit(s, strip, head * Lh * 4); }

    // A still picture's path under the warp: the whole picture slides by a little, and older frames slid a different amount.
    const path = (t) => [Math.round(Math.sin(t * 1.1) * 0.1 * W), Math.round(Math.sin(t * 1.7 + 1) * 0.025 * H)];

    function rebuild() {
      live = readFrame(work, W, H);
      if (p.mode === 'finish') {
        N = horizontal() ? W : H; Lh = horizontal() ? H : W; strip = new Uint8ClampedArray(N * Lh * 4); head = 0;
        // start with the strip already full: for a still picture, what the slit has seen over the last N columns
        const per = 1 / (lerp(60, 520, p.speed / 100) * (Math.max(W, H) / 640));
        for (let i = 0; i < N; i++) { head = i; readSlit(slitAt(clock - (N - 1 - i) * per), strip, i * Lh * 4); }
        prev = vid ? slitAt(clock) : 0; carry = 0;
      } else {
        ring = makeRing(K, W * H * 4); offs = [];
        if (vid) ring.fill(live); else for (let i = 0; i < K; i++) offs.push(path(clock - (i / K) * lerp(0.3, 2.6, p.spread / 100)));
      }
      dirty = false; acc = 0;
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; vid = false; dirty = true; clock = 0; out = null; },
      setFrame(w) { work = w; if (!vid) { vid = true; dirty = true; } else if (!dirty) live = readFrame(work, W, H); },
      setParams(np) {
        const s = [np.mode, np.way].join('|');
        if (s !== sig) { sig = s; dirty = true; }
        p = np;
      },
      step(dt) {
        if (!W) return;
        if (dirty) rebuild();
        clock += dt;
        if (p.mode === 'finish') {
          // one slit per column that passes; on a video the slit slides from where it was to where it is now
          const rate = lerp(60, 520, p.speed / 100) * (Math.max(W, H) / 640);
          carry += rate * dt; const n = Math.floor(carry); carry -= n;
          const s1 = slitAt(clock);
          for (let k = 1; k <= n; k++) { const f = k / n; push(vid ? lerp(prev, s1, f) : slitAt(clock - dt + dt * f)); }
          prev = s1;
        } else {
          acc += dt; const every = lerp(0.3, 2.6, p.spread / 100) / K;
          while (acc >= every) { acc -= every; if (vid) ring.push(live); else { offs.unshift(path(clock - acc)); offs.length = K; } }
        }
      },
      draw(ctx, t, dt) {
        if (!W) return;
        if (dt > 0) this.step(dt); else if (dirty) rebuild();
        if (!out) out = ctx.createImageData(W, H);
        const o = out.data;
        if (p.mode === 'finish') {
          const way = p.way;
          for (let i = 0; i < N; i++) {
            // line i of the output: the newest slit is at the end the strip is scrolling away from
            const age = way === 'left' || way === 'up' ? N - 1 - i : i, src = ((head - age + N * 2) % N) * Lh * 4;
            if (horizontal()) for (let y = 0, d = i * 4, s = src; y < H; y++, d += W * 4, s += 4) { o[d] = strip[s]; o[d + 1] = strip[s + 1]; o[d + 2] = strip[s + 2]; o[d + 3] = 255; }
            else { const d = i * W * 4; for (let x = 0; x < W * 4; x++) o[d + x] = strip[src + x]; }
          }
        } else {
          const spread = lerp(0.3, 2.6, p.spread / 100), cx = W / 2, cy = H / 2, rmax = Math.hypot(cx, cy), shape = p.shape, A = new Array(K + 1), X = new Array(K + 1), Y = new Array(K + 1);
          for (let a = 0; a < K; a++) { A[a] = vid ? (a ? ring.at(a) : live) : live; const f = vid ? [0, 0] : offs[a] || [0, 0]; X[a] = f[0]; Y[a] = f[1]; }
          if (!vid) { const f = path(clock); X[0] = f[0]; Y[0] = f[1]; }
          for (let y = 0, d = 0; y < H; y++) for (let x = 0; x < W; x++, d += 4) {
            let f = shape === 'down' ? y / H : shape === 'across' ? x / W : shape === 'tunnel' ? Math.hypot(x - cx, y - cy) / rmax : 0.5 + 0.5 * Math.sin((x / W * 1.6 + y / H * 2.2) * TAU * 0.5 - clock * 1.6);
            f *= K - 1.001; const a = f | 0, k = f - a, b = a + 1;
            const A0 = A[a], A1 = A[b];
            let sx0 = x - X[a], sy0 = y - Y[a], sx1 = x - X[b], sy1 = y - Y[b];
            if (!vid) { sx0 = clamp(sx0, 0, W - 1); sy0 = clamp(sy0, 0, H - 1); sx1 = clamp(sx1, 0, W - 1); sy1 = clamp(sy1, 0, H - 1); }
            const i0 = ((sy0 | 0) * W + (sx0 | 0)) * 4, i1 = ((sy1 | 0) * W + (sx1 | 0)) * 4;
            o[d] = A0[i0] + (A1[i1] - A0[i0]) * k; o[d + 1] = A0[i0 + 1] + (A1[i1 + 1] - A0[i0 + 1]) * k; o[d + 2] = A0[i0 + 2] + (A1[i1 + 2] - A0[i0 + 2]) * k; o[d + 3] = 255;
          }
        }
        ctx.putImageData(out, 0, 0);
      },
      dispose() { strip = null; ring = null; out = null; },
    };
  },
};
