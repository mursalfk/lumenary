// src/engine/styles/hologram-hud.js
import { clamp, lerp, boxBlur, sobel, hash2, vnoise, TAU } from '../utils.js';

const HUES = { cyan: [70, 220, 255], amber: [255, 176, 60], green: [90, 255, 150], magenta: [255, 90, 220] };

export default {
  id: 'hologram-hud',
  name: 'Hologram HUD',
  kind: 'animated',
  maxSide: 720,
  thumbAt: 1.3,
  blurb: 'A projected hologram: the picture in translucent scan lines that flicker, tear and drift, framed by brackets, dials and readouts. The reticle follows your cursor.',
  params: [
    { key: 'colour', label: 'Light', type: 'select', default: 'cyan', options: [['cyan', 'Cyan'], ['amber', 'Amber'], ['green', 'Green'], ['magenta', 'Magenta']] },
    { key: 'lines', label: 'Scan lines', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'edges', label: 'Outline strength', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'flicker', label: 'Flicker', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'glitch', label: 'Tearing', type: 'range', min: 0, max: 100, step: 1, default: 35 },
    { key: 'hud', label: 'Instruments', type: 'range', min: 0, max: 100, step: 1, default: 75 },
    { key: 'seed', label: 'Recalibrate', type: 'shuffle', default: 1 },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, holo = null, hctx = null, built = '', time = 0, rx = 0.5, ry = 0.45, scan = null, scanKey = '';

    // The picture as light: brighter and more opaque where it is bright, and brightest of all along its outlines.
    function read() {
      const d = work.getContext('2d').getImageData(0, 0, W, H).data, N = W * H, L = new Float32Array(N), c = HUES[p.colour] || HUES.cyan;
      for (let i = 0; i < N; i++) L[i] = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255;
      const e = sobel(boxBlur(L, W, H, 1), W, H, 1).mag, img = hctx.createImageData(W, H), o = img.data, es = (p.edges / 100) * 2.6;
      for (let i = 0, k = 0; i < N; i++, k += 4) {
        const v = clamp(0.1 + 0.75 * L[i] + e[i] * es), w = clamp(e[i] * es * 0.9 + L[i] * L[i] * 0.35);
        o[k] = c[0] + (255 - c[0]) * w; o[k + 1] = c[1] + (255 - c[1]) * w; o[k + 2] = c[2] + (255 - c[2]) * w; o[k + 3] = v * 235;
      }
      hctx.putImageData(img, 0, 0);
    }
    function build() {
      const key = [p.colour, p.edges, W, H].join('|');
      if (key === built) return;
      if (!holo || holo.width !== W || holo.height !== H) { holo = env.makeCanvas(W, H); hctx = holo.getContext('2d'); }
      read(); built = key;
    }
    // One period of the scan line pattern, tiled down the frame and slid upward as time passes.
    function lines(period) {
      const key = period + '|' + W;
      if (key === scanKey) return scan;
      scan = env.makeCanvas(8, period); const x = scan.getContext('2d');
      x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(0, 0, 8, Math.max(1, Math.round(period * 0.45)));
      scanKey = key; return scan;
    }

    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; built = ''; },
      // A new video frame of the same size: project the new frame, keep the instruments running.
      setFrame(w) { work = w; if (built) read(); },
      setParams(np) { p = np; },
      step(dt, ptr) {
        build(); time += dt;
        // the reticle chases the cursor; left alone it wanders on a slow figure of eight
        const tx = ptr && ptr.inside ? ptr.x : 0.5 + 0.28 * Math.sin(time * 0.37 + p.seed), ty = ptr && ptr.inside ? ptr.y : 0.45 + 0.2 * Math.sin(time * 0.74 + p.seed * 2);
        const k = Math.min(1, dt * 6); rx += (tx - rx) * k; ry += (ty - ry) * k;
      },
      draw(ctx, t, dt, ptr) {
        if (!W) return;
        if (dt > 0) this.step(dt, ptr); else build();
        const sc = W / 720, c = HUES[p.colour] || HUES.cyan, rgb = `${c[0]},${c[1]},${c[2]}`, seed = p.seed * 17, fl = p.flicker / 100, gl = p.glitch / 100, hud = p.hud / 100;
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        ctx.fillStyle = '#02040a'; ctx.fillRect(0, 0, W, H);
        // the projector: a pool of light at the foot of the image
        const pool = ctx.createRadialGradient(W / 2, H * 1.02, 0, W / 2, H * 1.02, W * 0.75);
        pool.addColorStop(0, `rgba(${rgb},0.3)`); pool.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = pool; ctx.fillRect(0, 0, W, H);
        // the image itself, flickering as a whole and now and then dropping out for an instant
        const tick = Math.floor(time * 14), drop = hash2(tick, 3, seed) > 1 - fl * 0.12 ? 0.45 : 1;
        const a = (0.86 + 0.14 * (1 - fl) + 0.14 * fl * Math.sin(time * 31) * Math.sin(time * 7.3)) * drop;
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = clamp(a);
        ctx.drawImage(holo, 0, 0);
        // tearing: a few bands of rows are drawn again, pushed sideways
        if (gl > 0) {
          const g = Math.floor(time * 9);
          for (let j = 0; j < 3; j++) {
            if (hash2(g, j, seed + 5) > gl * 0.55) continue;
            const y0 = Math.floor(hash2(g, j + 9, seed) * H), hh = Math.max(2, Math.floor((4 + hash2(g, j + 4, seed) * 36) * sc)), dx = (hash2(g, j + 2, seed) - 0.5) * 70 * sc * gl;
            ctx.globalAlpha = 0.7; ctx.drawImage(holo, 0, y0, W, hh, dx, y0, W, hh);
          }
        }
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        if (p.lines > 0) {
          const period = Math.max(2, Math.round(lerp(9, 3, p.lines / 100) * sc)), pat = ctx.createPattern(lines(period), 'repeat'), off = (time * 18 * sc) % period;
          ctx.save(); ctx.translate(0, -off); ctx.fillStyle = pat; ctx.globalAlpha = 0.35 + 0.5 * (p.lines / 100); ctx.fillRect(0, 0, W, H + period); ctx.restore();
        }
        // a brighter band sweeps down the image every few seconds
        const sy = ((time * 0.22) % 1.3 - 0.15) * H, band = ctx.createLinearGradient(0, sy - 46 * sc, 0, sy + 8 * sc);
        band.addColorStop(0, `rgba(${rgb},0)`); band.addColorStop(0.85, `rgba(${rgb},0.26)`); band.addColorStop(1, `rgba(${rgb},0)`);
        ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = band; ctx.fillRect(0, sy - 46 * sc, W, 54 * sc);
        if (hud <= 0) { ctx.globalCompositeOperation = 'source-over'; return; }
        // instruments
        ctx.globalAlpha = 0.35 + 0.65 * hud; ctx.strokeStyle = `rgba(${rgb},0.9)`; ctx.fillStyle = `rgba(${rgb},0.9)`; ctx.lineWidth = Math.max(1, 1.4 * sc); ctx.lineCap = 'butt';
        const m = 18 * sc, arm = 34 * sc;
        for (const [x, y, dx, dy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) { ctx.beginPath(); ctx.moveTo(x + dx * arm, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * arm); ctx.stroke(); }
        // reticle: a ring, four ticks and an arc that turns
        const px = rx * W, py = ry * H, R = 34 * sc;
        ctx.beginPath(); ctx.arc(px, py, R, 0, TAU); ctx.stroke();
        ctx.beginPath(); ctx.arc(px, py, R * 1.35, time * 1.6, time * 1.6 + 1.3); ctx.stroke(); ctx.beginPath(); ctx.arc(px, py, R * 1.35, time * 1.6 + Math.PI, time * 1.6 + Math.PI + 1.3); ctx.stroke();
        for (let j = 0; j < 4; j++) { const an = (j * Math.PI) / 2; ctx.beginPath(); ctx.moveTo(px + Math.cos(an) * R * 0.55, py + Math.sin(an) * R * 0.55); ctx.lineTo(px + Math.cos(an) * R * 1.1, py + Math.sin(an) * R * 1.1); ctx.stroke(); }
        ctx.fillRect(px - 1.5 * sc, py - 1.5 * sc, 3 * sc, 3 * sc);
        ctx.font = `500 ${Math.round(11 * sc)}px "JetBrains Mono", monospace`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
        ctx.fillText(`X ${rx.toFixed(3)}  Y ${ry.toFixed(3)}`, px + R * 1.6, py - 8 * sc); ctx.fillText(`RNG ${(120 + 60 * Math.sin(time * 0.7)).toFixed(1)} M`, px + R * 1.6, py + 8 * sc);
        // dial: three rings of ticks turning at different speeds
        const dx0 = m + 62 * sc, dy0 = H - m - 62 * sc;
        for (let ring = 0; ring < 3; ring++) {
          const rr = (26 + ring * 13) * sc, n = 12 + ring * 8, spin = time * (0.5 - ring * 0.35);
          for (let j = 0; j < n; j++) { if ((j + ring) % 4 === 3) continue; const an = spin + (j / n) * TAU; ctx.beginPath(); ctx.arc(dx0, dy0, rr, an, an + (TAU / n) * 0.6); ctx.stroke(); }
        }
        // bars: a small spectrum that never settles
        const bx = W - m - 96 * sc, by = H - m - 10 * sc;
        for (let j = 0; j < 9; j++) { const hgt = (8 + 46 * vnoise(time * 1.6 + j * 3.1, j, seed + 2)) * sc; ctx.fillRect(bx + j * 10.5 * sc, by - hgt, 6 * sc, hgt); }
        ctx.textAlign = 'left'; ctx.fillText(`SCAN ${String(Math.floor(((time * 22) % 100))).padStart(3, '0')}%`, m + 8 * sc, m + arm + 14 * sc);
        ctx.fillText(`SIG ${(11.5 + 2.5 * vnoise(time * 0.9, 1, seed)).toFixed(1)} DB`, m + 8 * sc, m + arm + 30 * sc);
        ctx.textAlign = 'right'; ctx.fillText(`T+${time.toFixed(2).padStart(6, '0')}`, W - m - 8 * sc, m + arm + 14 * sc);
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      },
      dispose() {},
    };
  },
};
