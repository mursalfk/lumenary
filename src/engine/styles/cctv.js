// src/engine/styles/cctv.js
import { clamp, lerp, smoothstep, hash2, sobel, boxBlur } from '../utils.js';
import { readFrame } from '../history.js';

const TODAY = (() => { const n = new Date(); return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0'); })();

const GX = 20;      // cells across for the motion detector

export default {
  id: 'cctv',
  name: 'CCTV',
  kind: 'animated',
  maxSide: 640,
  thumbAt: 2.4,
  blurb: 'Seen by a security camera: a wide lens, a few frames a second, blocky video compression, a clock that keeps counting, and a box that locks onto whatever moves. A still picture is watched too, and the detector picks out the busiest part of it.',
  params: [
    { key: 'name', label: 'Camera name', type: 'text', default: 'CAM 03  FRONT DOOR', max: 24 },
    { key: 'look', label: 'Look', type: 'select', default: 'colour', options: [['colour', 'Washed colour'], ['mono', 'Black and white'], ['night', 'Night vision green']] },
    { key: 'fps', label: 'Frames a second', type: 'range', min: 3, max: 15, step: 1, default: 8 },
    { key: 'quality', label: 'Compression blocks', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'noise', label: 'Noise', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'lens', label: 'Wide lens', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'detect', label: 'Motion tracking box', type: 'toggle', default: true },
    { key: 'osd', label: 'Camera name, clock and REC', type: 'toggle', default: true },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, cur = null, prev = null, cam = null, held = null, out = null, map = null, vig = null, mapKey = '', clock = 0, since = 1, frameNo = 0, vid = false, still = null, box = null, tgt = null, flick = 1, pending = false;
    const bs = () => Math.max(4, Math.round(W / 80));    // size of a compression block

    function lensMap() {
      const key = W + '|' + H + '|' + p.lens; if (key === mapKey) return; mapKey = key;
      map = new Int32Array(W * H); vig = new Float32Array(W * H);
      const k = (p.lens / 100) * 0.55, cx = W / 2, cy = H / 2, nr = Math.hypot(cx, cy);
      for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) {
        const dx = (x - cx) / nr, dy = (y - cy) / nr, r2 = dx * dx + dy * dy, f = 1 - k * r2 * 1.6 + k * 0.1;     // barrel: the middle bulges out, the corners pull in
        const sx = clamp(Math.round(cx + dx * nr / Math.max(0.35, f)), 0, W - 1), sy = clamp(Math.round(cy + dy * nr / Math.max(0.35, f)), 0, H - 1);
        map[i] = sy * W + sx; vig[i] = 1 - smoothstep(0.25, 1.0, Math.sqrt(r2)) * (0.35 + k * 0.5);
      }
    }

    // Where the detector looks: the cells of a coarse grid, scored by how much of the picture changed there (video)
    // or how much is going on in them (a still picture).
    function energy() {
      const gy = Math.max(4, Math.round((GX * H) / W)), cw = W / GX, ch = H / gy, e = new Float32Array(GX * gy);
      if (vid && prev) {
        for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) { const i = (y * W + x) * 4, d = Math.abs(cur[i] - prev[i]) + Math.abs(cur[i + 1] - prev[i + 1]) + Math.abs(cur[i + 2] - prev[i + 2]); e[Math.min(gy - 1, (y / ch) | 0) * GX + Math.min(GX - 1, (x / cw) | 0)] += d; }
      } else if (still) {
        for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) e[Math.min(gy - 1, (y / ch) | 0) * GX + Math.min(GX - 1, (x / cw) | 0)] += still[y * W + x];
      }
      return { e: boxBlur(e, GX, gy, 1), gy };
    }

    function aim() {
      const { e, gy } = energy();
      let best = 0, bi = -1;
      const second = { v: 0, i: -1 };
      for (let i = 0; i < e.length; i++) if (e[i] > best) { best = e[i]; bi = i; }
      if (bi < 0 || best <= 0) { tgt = null; return; }
      // on a still picture the detector hops between its two most interesting places
      if (!vid) {
        const bx = bi % GX, by = (bi / GX) | 0;
        for (let i = 0; i < e.length; i++) { const x = i % GX, y = (i / GX) | 0; if (Math.hypot(x - bx, y - by) > 4 && e[i] > second.v) { second.v = e[i]; second.i = i; } }
        if (second.i >= 0 && Math.floor(clock / 3.2) % 2 === 1) { bi = second.i; best = second.v; }
      }
      const px = bi % GX, py = (bi / GX) | 0;
      let x0 = px, x1 = px, y0 = py, y1 = py;
      for (let i = 0; i < e.length; i++) { const x = i % GX, y = (i / GX) | 0; if (e[i] > best * 0.45 && Math.abs(x - px) <= 3 && Math.abs(y - py) <= 3) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
      const cw = W / GX, ch = H / gy;
      tgt = [x0 * cw, y0 * ch, (x1 + 1) * cw, (y1 + 1) * ch];
      if (!box) box = tgt.slice(); else for (let k = 0; k < 4; k++) box[k] += (tgt[k] - box[k]) * 0.4;
    }

    function shoot() {
      lensMap();
      const look = p.look, nz = (p.noise / 100) * 46, q = p.quality / 100, B = bs();
      flick = 1 + (hash2(frameNo, 3, 1) - 0.5) * 0.09;
      // the lens and the sensor: one pixel at a time
      for (let i = 0, d = 0; i < map.length; i++, d += 4) {
        const s = map[i] * 4;
        let r = cur[s], g = cur[s + 1], b = cur[s + 2];
        const l = 0.299 * r + 0.587 * g + 0.114 * b;
        if (look === 'colour') { r = l + (r - l) * 0.55; g = l + (g - l) * 0.55; b = l + (b - l) * 0.55; r *= 0.97; g *= 1.02; b *= 1.0; }
        else if (look === 'mono') { r = g = b = l * 1.04; }
        else { const v = clamp((l - 110) * 1.45 + 120, 0, 255); r = v * 0.22; g = v * 1.0; b = v * 0.34; }
        const v = vig[i] * flick, n = (hash2(i, frameNo, 9) - 0.5) * nz;
        cam[d] = r * v + n * (look === 'night' ? 0.3 : 1); cam[d + 1] = g * v + n; cam[d + 2] = b * v + n * (look === 'night' ? 0.4 : 1);
      }
      // video compression: each block is flattened towards its own average, and a few blocks fail to update at all
      if (q > 0) {
        for (let by = 0; by < H; by += B) for (let bx = 0; bx < W; bx += B) {
          const x1 = Math.min(W, bx + B), y1 = Math.min(H, by + B), area = (x1 - bx) * (y1 - by);
          let mr = 0, mg = 0, mb = 0;
          for (let y = by; y < y1; y++) for (let x = bx, d = (y * W + bx) * 4; x < x1; x++, d += 4) { mr += cam[d]; mg += cam[d + 1]; mb += cam[d + 2]; }
          mr /= area; mg /= area; mb /= area;
          const stuck = held && hash2(bx / B, by / B, frameNo) < q * q * 0.045, keep = lerp(1, 0.22, q);
          for (let y = by; y < y1; y++) for (let x = bx, d = (y * W + bx) * 4; x < x1; x++, d += 4) {
            if (stuck) { cam[d] = held[d]; cam[d + 1] = held[d + 1]; cam[d + 2] = held[d + 2]; }
            else { cam[d] = mr + (cam[d] - mr) * keep; cam[d + 1] = mg + (cam[d + 1] - mg) * keep; cam[d + 2] = mb + (cam[d + 2] - mb) * keep; }
          }
        }
      }
      held.set(cam);
    }

    return {
      animated: true,
      setSource(w, ww, hh) {
        work = w; W = ww; H = hh; vid = false; out = null; mapKey = ''; box = null; clock = 0; since = 1;
        cur = readFrame(work, W, H); prev = null; cam = new Uint8ClampedArray(cur.length); held = new Uint8ClampedArray(cur.length);
        // what is going on in a still picture: the strength of its edges
        const L = new Float32Array(W * H); for (let i = 0; i < L.length; i++) L[i] = (0.299 * cur[i * 4] + 0.587 * cur[i * 4 + 1] + 0.114 * cur[i * 4 + 2]) / 255;
        const sb = sobel(boxBlur(L, W, H, 2), W, H, 1); still = sb.mag;
      },
      // a new video frame: the camera takes it when its shutter next opens
      setFrame(w) { work = w; vid = true; pending = true; },
      setParams(np) { p = np; },
      step(dt) {
        if (!W) return;
        clock += dt; since += dt;
        const every = 1 / p.fps;
        if (since >= every) {
          since = since % every; frameNo++;
          if (vid && pending) { if (!prev) prev = new Uint8ClampedArray(cur.length); prev.set(cur); cur = readFrame(work, W, H); pending = false; }
          shoot(); if (p.detect) aim();
        }
      },
      draw(ctx, t, dt) {
        if (!W) return;
        if (dt > 0) this.step(dt); else if (!frameNo) { frameNo = 1; shoot(); if (p.detect) aim(); }
        if (!out) out = ctx.createImageData(W, H);
        const o = out.data, night = p.look === 'night';
        // interlace: every other line a touch darker; held between camera frames
        for (let y = 0, d = 0; y < H; y++) { const m = y & 1 ? 0.88 : 1; for (let x = 0; x < W; x++, d += 4) { o[d] = held[d] * m; o[d + 1] = held[d + 1] * m; o[d + 2] = held[d + 2] * m; o[d + 3] = 255; } }
        ctx.putImageData(out, 0, 0);
        const u = H / 100, ink = night ? '#b8ffb8' : '#f2f2ee', alarm = night ? '#d8ffd8' : '#ff3b30';
        if (p.detect && box) {
          const w = box[2] - box[0], h = box[3] - box[1], pad = u * 0.8, x = box[0] - pad, y = box[1] - pad, bw = w + pad * 2, bh = h + pad * 2, c = Math.min(bw, bh) * 0.22;
          ctx.strokeStyle = alarm; ctx.lineWidth = Math.max(1.5, u * 0.38); ctx.beginPath();
          for (const [px, py, sx, sy] of [[x, y, 1, 1], [x + bw, y, -1, 1], [x, y + bh, 1, -1], [x + bw, y + bh, -1, -1]]) { ctx.moveTo(px, py + c * sy); ctx.lineTo(px, py); ctx.lineTo(px + c * sx, py); }
          ctx.stroke();
          ctx.globalAlpha = 0.35; ctx.lineWidth = Math.max(1, u * 0.18); ctx.strokeRect(x, y, bw, bh); ctx.globalAlpha = 1;
          const fs = Math.max(9, u * 2.3); ctx.font = `500 ${fs}px "DM Mono", ui-monospace, Menlo, monospace`; ctx.textBaseline = 'bottom'; ctx.textAlign = 'left';
          const tag = 'MOTION ' + String(60 + Math.floor(hash2(Math.floor(clock * 2), 5, 3) * 35)) + '%', tw = ctx.measureText(tag).width;
          ctx.fillStyle = alarm; ctx.fillRect(x, y - fs * 1.35, tw + fs * 0.8, fs * 1.35); ctx.fillStyle = night ? '#041004' : '#fff'; ctx.fillText(tag, x + fs * 0.4, y - fs * 0.2);
        }
        if (p.osd) {
          const fs = Math.max(10, u * 3.1); ctx.font = `500 ${fs}px "DM Mono", ui-monospace, Menlo, monospace`; ctx.textBaseline = 'top';
          ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowOffsetX = fs * 0.06; ctx.shadowOffsetY = fs * 0.06; ctx.shadowBlur = 0; ctx.fillStyle = ink;
          const m = u * 3.2; ctx.textAlign = 'left'; ctx.fillText((p.name || '').toUpperCase(), m, m);
          // the clock: today's date, and a fixed night counting from a quarter past three
          const s = 3 * 3600 + 17 * 60 + 42 + Math.floor(clock), hh = String(Math.floor(s / 3600) % 24).padStart(2, '0'), mm = String(Math.floor(s / 60) % 60).padStart(2, '0'), ss = String(s % 60).padStart(2, '0');
          ctx.textBaseline = 'bottom'; ctx.fillText(TODAY + '  ' + hh + ':' + mm + ':' + ss, m, H - m);
          ctx.textAlign = 'right'; ctx.textBaseline = 'top';
          ctx.fillText('REC', W - m, m);
          if (Math.floor(clock * 1.2) % 2 === 0) { ctx.shadowColor = 'transparent'; ctx.fillStyle = '#ff2d2d'; ctx.beginPath(); ctx.arc(W - m - ctx.measureText('REC').width - fs * 0.9, m + fs * 0.52, fs * 0.34, 0, Math.PI * 2); ctx.fill(); }
          ctx.shadowColor = 'transparent'; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
        }
      },
      dispose() { out = null; cam = null; held = null; },
    };
  },
};
