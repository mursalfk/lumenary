// src/engine/styles/underwater.js
import { clamp, lerp, rng, hash2, TAU } from '../utils.js';

// what the water adds to the picture (its own colour) and how fast it removes red, green and blue with depth
const WATERS = { blue: [[16, 110, 168], [0.92, 0.3, 0.1]], deep: [[6, 44, 96], [1.0, 0.5, 0.16]], green: [[30, 106, 84], [0.85, 0.22, 0.42]] };

export default {
  id: 'underwater',
  name: 'Underwater',
  kind: 'animated',
  maxSide: 720,
  thumbAt: 2.2,
  blurb: 'The picture seen from below the surface: it sways with the swell, red drains away with depth, nets of light slide over everything, sun rays slant down and bubbles rise. The cursor lets out more bubbles.',
  params: [
    { key: 'depth', label: 'Depth', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'waves', label: 'Swell', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'caustics', label: 'Nets of light', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'rays', label: 'Sun rays', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'bubbles', label: 'Bubbles', type: 'range', min: 0, max: 100, step: 1, default: 50 },
    { key: 'water', label: 'Water', type: 'select', default: 'blue', options: [['blue', 'Tropical blue'], ['deep', 'Open sea'], ['green', 'Lake green']] },
    { key: 'speed', label: 'Speed', type: 'range', min: 10, max: 100, step: 1, default: 50 },
    { key: 'seed', label: 'Dive again', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, ow = 0, oh = 0, img = null, small = null, sctx = null, sdata = null, built = '', time = 0, bub = [], r = rng(1), acc = 0, sinT = null;

    function read() {
      const c = env.makeCanvas(ow, oh), cx = c.getContext('2d'); cx.imageSmoothingQuality = 'high'; cx.drawImage(work, 0, 0, ow, oh);
      img = cx.getImageData(0, 0, ow, oh).data;
    }
    function build() {
      const key = [p.seed, W, H].join('|'); if (key === built) return;
      ow = Math.round(W / 2); oh = Math.round(H / 2);
      small = env.makeCanvas(ow, oh); sctx = small.getContext('2d'); sdata = sctx.createImageData(ow, oh);
      read(); r = rng(p.seed * 61 + 3); bub = []; acc = 0;
      // a table of sines: the loop below asks for six sines a pixel, and a lookup is several times faster
      if (!sinT) { sinT = new Float32Array(1024); for (let i = 0; i < 1024; i++) sinT[i] = Math.sin((i / 1024) * TAU); }
      built = key;
    }
    const sn = (a) => sinT[((a * 162.97466) | 0) & 1023];   // 1024 / TAU
    const spawn = (x, y) => { if (bub.length < 140) bub.push({ x, y, r: (2 + Math.pow(r(), 2) * 9) * (W / 720), ph: r() * TAU, v: 0.6 + r() * 0.8 }); };

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; built = ''; },
      // A new video frame of the same size: read it again, and leave the water and the bubbles as they are.
      setFrame(w) { work = w; if (built) read(); },
      setParams(np) { p = np; },
      step(dt, ptr) {
        build(); dt = Math.min(dt, 0.05); const k = p.speed / 50; time += dt * k;
        const sc = W / 720; acc += dt * (p.bubbles / 100) * 9;
        while (acc >= 1) { acc -= 1; spawn(r() * W, H + 10); }
        if (ptr && ptr.inside && r() < dt * 24) spawn(ptr.x * W + (r() - 0.5) * 20 * sc, ptr.y * H);
        for (const b of bub) { b.y -= (38 + b.r * 9) * b.v * sc * dt * k; b.x += Math.sin(time * 2.4 + b.ph) * 16 * sc * dt; }
        bub = bub.filter((b) => b.y > -20);
      },
      draw(ctx, t, dt, ptr) {
        if (!W) return;
        if (dt > 0) this.step(dt, ptr); else build();
        const [tint, fade] = WATERS[p.water] || WATERS.blue, depth = p.depth / 100, amp = (p.waves / 100) * 0.022 * ow, ca = (p.caustics / 100) * 1.1, o4 = sdata.data, T = time, mx = ow - 1.001, my = oh - 1.001, row = ow * 4;
        for (let y = 0; y < oh; y++) {
          const v = y / oh, D = depth * (0.4 + 0.6 * v), kr = 1 - fade[0] * D, kg = 1 - fade[1] * D, kb = 1 - fade[2] * D, fog = 0.12 + 0.5 * D, top = 1 - 0.65 * v;
          for (let x = 0; x < ow; x++) {
            const u = x / ow;
            // the swell: where each pixel is read from is pushed about by two slow, bent waves
            let fx = x + amp * sn(v * 9 + T * 1.3 + sn(u * 5 + T * 0.7) * 1.2), fy = y + amp * 0.6 * sn(u * 8 - T * 1.1 + 1.57 + sn(v * 6 + T * 0.5) * 1.1);
            fx = fx < 0 ? 0 : fx > mx ? mx : fx; fy = fy < 0 ? 0 : fy > my ? my : fy;
            // read between pixels, blending the four nearest, so straight edges bend smoothly and do not break into steps
            const x0 = fx | 0, y0 = fy | 0, ax = fx - x0, ay = fy - y0, s = (y0 * ow + x0) * 4, o = (y * ow + x) * 4;
            const r0 = img[s] + (img[s + 4] - img[s]) * ax, g0 = img[s + 1] + (img[s + 5] - img[s + 1]) * ax, b0 = img[s + 2] + (img[s + 6] - img[s + 2]) * ax;
            const r1 = img[s + row] + (img[s + row + 4] - img[s + row]) * ax, g1 = img[s + row + 1] + (img[s + row + 5] - img[s + row + 1]) * ax, b1 = img[s + row + 2] + (img[s + row + 6] - img[s + row + 2]) * ax;
            const pr = r0 + (r1 - r0) * ay, pg = g0 + (g1 - g0) * ay, pb = b0 + (b1 - b0) * ay;
            let R = pr * kr, G = pg * kg, B = pb * kb;
            R += (tint[0] - R) * fog; G += (tint[1] - G) * fog; B += (tint[2] - B) * fog;
            if (ca > 0) {
              // Caustics. Three sets of bent ripples are added up; light gathers into thin bright lines wherever the
              // sum passes through zero, and those lines close into the net seen on the floor of a pool.
              const f = sn(u * 29 + sn(v * 23 + T * 0.9) * 1.5 + T * 0.5) + sn(v * 27 + sn(u * 25 - T * 0.8) * 1.5 - T * 0.4) + sn((u + v) * 20 + sn((u - v) * 19 + T * 0.6) * 1.4 + T * 0.3);
              let n = 1 - (f < 0 ? -f : f) * 1.15; if (n < 0) n = 0;
              const c = n * n * n * n * ca * top * (0.3 + (0.3 * pr + 0.59 * pg + 0.11 * pb) / 255);
              R += 80 * c; G += 135 * c; B += 150 * c;
            }
            o4[o] = R; o4[o + 1] = G; o4[o + 2] = B; o4[o + 3] = 255;
          }
        }
        sctx.putImageData(sdata, 0, 0);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(small, 0, 0, W, H);
        const sc = W / 720;
        // sun rays: slanted shafts from the surface, each swaying and fading on its own
        if (p.rays > 0) {
          ctx.globalCompositeOperation = 'lighter';
          for (let j = 0; j < 7; j++) {
            const x0 = (hash2(j, 1, p.seed) * 1.1 - 0.05 + 0.03 * Math.sin(T * 0.5 + j)) * W, w = (26 + hash2(j, 2, p.seed) * 60) * sc, lean = W * 0.22, len = H * (0.55 + 0.4 * hash2(j, 3, p.seed));
            const a = (p.rays / 100) * 0.2 * (0.55 + 0.45 * Math.sin(T * 0.8 + j * 2.1)), g = ctx.createLinearGradient(x0, 0, x0 - lean, len);
            g.addColorStop(0, `rgba(210,245,255,${a})`); g.addColorStop(1, 'rgba(210,245,255,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + w, 0); ctx.lineTo(x0 + w * 1.6 - lean, len); ctx.lineTo(x0 - lean, len); ctx.closePath(); ctx.fill();
          }
        }
        // drifting specks, placed by a formula of time so they need no memory
        ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgb(200,235,245)';
        for (let j = 0; j < 70; j++) {
          const x = ((hash2(j, 5, p.seed) + T * 0.006 * (0.4 + hash2(j, 6, p.seed))) % 1) * W, y = ((hash2(j, 7, p.seed) + T * 0.011 * (0.3 + hash2(j, 8, p.seed)) + 0.02 * Math.sin(T * 0.6 + j)) % 1) * H, s = (0.8 + 1.8 * hash2(j, 9, p.seed)) * sc;
          ctx.globalAlpha = 0.12 + 0.28 * hash2(j, 10, p.seed); ctx.fillRect(x, y, s, s);
        }
        // bubbles: a rim, a faint body and one bright glint
        ctx.globalCompositeOperation = 'source-over';
        for (const b of bub) {
          const wob = 1 + 0.08 * Math.sin(time * 9 + b.ph);
          ctx.globalAlpha = 0.16; ctx.fillStyle = 'rgb(220,245,255)'; ctx.beginPath(); ctx.ellipse(b.x, b.y, b.r * wob, b.r / wob, 0, 0, TAU); ctx.fill();
          ctx.globalAlpha = 0.6; ctx.strokeStyle = 'rgb(225,248,255)'; ctx.lineWidth = Math.max(0.8, b.r * 0.16); ctx.stroke();
          ctx.globalAlpha = 0.9; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.38, Math.max(0.6, b.r * 0.18), 0, TAU); ctx.fill();
        }
        // it is darker toward the bottom and the corners
        ctx.globalAlpha = 1;
        const dim = ctx.createLinearGradient(0, 0, 0, H); dim.addColorStop(0, 'rgba(0,10,30,0)'); dim.addColorStop(1, `rgba(0,10,30,${lerp(0.1, 0.5, depth)})`);
        ctx.fillStyle = dim; ctx.fillRect(0, 0, W, H);
      },
      dispose() {},
    };
  },
};
