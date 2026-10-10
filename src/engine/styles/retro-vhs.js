import { rng, hash2 } from '../utils.js';

const NT = (() => { const r = rng(99), a = new Float32Array(65536); for (let i = 0; i < a.length; i++) a[i] = r(); return a; })();

export default {
  id: 'retro-vhs',
  number: 14,
  name: 'Retro VHS',
  kind: 'animated',
  maxSide: 640,
  thumbAt: 2.0,
  blurb: 'Worn tape: color bleed, tracking glitches, scanlines and a PLAY stamp.',
  params: [
    { key: 'distortion', label: 'Tracking', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'noise', label: 'Tape noise', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    { key: 'scan', label: 'Scanlines', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'osd', label: 'PLAY overlay', type: 'toggle', default: true },
  ],
  create() {
    let W = 0, H = 0, src = null, p = {}, out = null;
    return {
      animated: true,
      setSource(work, w, h) {
        W = w; H = h; out = null;
        const d = work.getContext('2d').getImageData(0, 0, w, h).data;
        src = new Uint8ClampedArray(d.length);
        for (let i = 0; i < d.length; i += 4) {
          // crushed blacks, a little extra contrast and a faint cool cast, like a dubbed tape
          src[i] = (d[i] - 128) * 1.12 + 132; src[i + 1] = (d[i + 1] - 128) * 1.12 + 134; src[i + 2] = (d[i + 2] - 128) * 1.12 + 140; src[i + 3] = 255;
        }
      },
      setParams(np) { p = np; },
      draw(ctx, t) {
        if (!out) out = ctx.createImageData(W, H);
        const d = out.data, frame = Math.floor(t * 24);
        const dist = p.distortion / 100, nz = p.noise / 100, sc = p.scan / 100;
        const bc = ((t * 0.18 * (0.4 + dist)) % 1.5 - 0.25) * H, bh = H * 0.07;
        const ca = Math.max(1, Math.round(W * 0.0045 * (0.4 + dist * 1.2)));
        const mx = W - 1;
        for (let y = 0; y < H; y++) {
          let shift = Math.sin(y * 0.05 + t * 3.1) * dist * W * 0.0035 + Math.sin(y * 0.013 - t * 1.4) * dist * W * 0.005 + (hash2(y, frame) - 0.5) * dist * W * 0.004;
          const db = Math.abs(y - bc), inBand = db < bh;
          if (inBand) { const k = 1 - db / bh; shift += k * k * (hash2(y, frame, 7) - 0.3) * dist * W * 0.11; }
          if (y > H * 0.965) shift += (hash2(y, frame, 3) - 0.5) * dist * W * 0.12;
          const s = Math.round(shift), mult = y & 1 ? 1 - sc * 0.3 : 1, row = y * W;
          for (let x = 0; x < W; x++) {
            let sx = x - s; sx = sx < 0 ? 0 : sx > mx ? mx : sx;
            let rx = sx + ca; rx = rx > mx ? mx : rx;
            let rx2 = sx + ca + 3; rx2 = rx2 > mx ? mx : rx2;
            let bx = sx - ca; bx = bx < 0 ? 0 : bx;
            const o = (row + x) * 4;
            const r = (src[(row + rx) * 4] + src[(row + rx2) * 4]) * 0.5, g = src[(row + sx) * 4 + 1], b = src[(row + bx) * 4 + 2];
            let n = (NT[(x * 7 + y * 131 + frame * 977) & 65535] - 0.5) * nz * 80;
            if (inBand && NT[(x * 13 + y * 31 + frame * 389) & 65535] > 0.72) n += 120 * (1 - db / bh) * (0.3 + dist);
            d[o] = r * mult + n; d[o + 1] = g * mult + n; d[o + 2] = b * mult + n; d[o + 3] = 255;
          }
        }
        ctx.putImageData(out, 0, 0);
        const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
        vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)');
        ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
        if (p.osd) {
          const fs = H * 0.045;
          ctx.font = `500 ${fs}px "DM Mono", ui-monospace, Menlo, monospace`;
          ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
          ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowOffsetX = fs * 0.06; ctx.shadowOffsetY = fs * 0.06; ctx.shadowBlur = 0;
          ctx.fillStyle = '#f4f4f0';
          const x0 = W * 0.07, y0 = H * 0.085;
          ctx.beginPath(); ctx.moveTo(x0, y0 - fs * 0.45); ctx.lineTo(x0 + fs * 0.8, y0); ctx.lineTo(x0, y0 + fs * 0.45); ctx.closePath(); ctx.fill();
          ctx.fillText('PLAY', x0 + fs * 1.2, y0);
          const sec = Math.floor(t) % 60, tc = '00:00:' + String(sec).padStart(2, '0');
          ctx.textAlign = 'right';
          ctx.fillText(tc, W * 0.93, H * 0.925);
          ctx.shadowColor = 'transparent'; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
        }
      },
      dispose() {},
    };
  },
};
