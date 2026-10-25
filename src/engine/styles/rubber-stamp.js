// src/engine/styles/rubber-stamp.js
import { still, rng, vnoise, hash2, boxBlur, hexToRgb, TAU } from '../utils.js';
import { pixels, stretchedL, label, rrPath } from '../helpers.js';

const INKS = { red: '#c0272d', blue: '#1f3f9a', black: '#1a1a1a', green: '#1f6a43' };

export default still({
  id: 'rubber-stamp',
  name: 'Rubber Stamp',
  blurb: 'Your picture as a hand-inked rubber stamp pressed a little crooked on paper: patchy ink, a border and a stamped word.',
  maxSide: 1000,
  params: [
    { key: 'word', label: 'Stamped word', type: 'text', default: 'APPROVED', max: 16 },
    { key: 'ink', label: 'Ink', type: 'select', default: 'red', options: [['red', 'Red'], ['blue', 'Blue'], ['black', 'Black'], ['green', 'Green']] },
    { key: 'cut', label: 'Where the ink goes', type: 'range', min: 25, max: 75, step: 1, default: 52 },
    { key: 'wear', label: 'Worn rubber', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'tilt', label: 'Tilt', type: 'range', min: -15, max: 15, step: 1, default: -4, fmt: (v) => v + '°' },
    { key: 'seed', label: 'Press again', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const N = W * H, u = Math.min(W, H) / 100, sc = W / 800, r = rng(p.seed * 31 + 7), seed = p.seed * 5 + 1;
    // paper
    ctx.fillStyle = '#efe9db'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 1400; i++) { ctx.fillStyle = `rgba(${r() < 0.5 ? '120,100,70' : '255,255,250'},${0.02 + r() * 0.04})`; ctx.fillRect(r() * W, r() * H, 1 + r() * 5, 1 + r() * 2); }
    // the plate, drawn solid black on a transparent layer
    const plate = env.makeCanvas(W, H), px = plate.getContext('2d');
    const m = u * 6, inset = u * 1.8, bandH = u * 15;
    px.strokeStyle = '#000'; px.lineWidth = u * 1.0; px.beginPath(); rrPath(px, m, m, W - 2 * m, H - 2 * m, u * 2.6); px.stroke();
    px.lineWidth = u * 0.4; px.beginPath(); rrPath(px, m + inset, m + inset, W - 2 * (m + inset), H - 2 * (m + inset), u * 1.6); px.stroke();
    const x0 = m + inset * 1.6, y0 = m + inset * 1.6, pw = W - 2 * x0, ph = H - 2 * y0 - bandH;
    // the picture, as a hard black-and-white cut, with a ragged edge
    const L = boxBlur(stretchedL(cache), W, H, Math.max(1, Math.round(sc * 1.5))), ink = px.createImageData(W, H), d = ink.data, thr = p.cut / 100;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4;
      if (x < x0 || x >= x0 + pw || y < y0 || y >= y0 + ph) continue;
      const sx = Math.min(W - 1, Math.floor(((x - x0) / pw) * W)), sy = Math.min(H - 1, Math.floor(((y - y0) / ph) * H));
      const noise = (vnoise(x * 0.35 / sc, y * 0.35 / sc, seed) - 0.5) * 0.12 + (hash2(x, y, 9) - 0.5) * 0.05;
      if (L[sy * W + sx] + noise < thr) d[o + 3] = 255;
    }
    const tmp = env.makeCanvas(W, H); tmp.getContext('2d').putImageData(ink, 0, 0); px.drawImage(tmp, 0, 0);
    // the word in a banner
    px.fillStyle = '#000'; px.beginPath(); rrPath(px, x0, H - y0 - bandH + u * 0.8, pw, bandH - u * 0.8, u * 1.2); px.fill();
    px.globalCompositeOperation = 'destination-out';
    px.font = `900 100px "Hanken Grotesk", Arial, sans-serif`;
    const word = (p.word || ' ').toUpperCase(), fs = Math.min(bandH * 0.72, ((pw * 0.9) / Math.max(1, px.measureText(word).width)) * 100);
    label(px, word, W / 2, H - y0 - bandH / 2 + u * 0.5, `900 ${fs}px "Hanken Grotesk", Arial, sans-serif`, '#000');
    px.globalCompositeOperation = 'source-over';
    // inking: patchy pressure, worn spots and pinholes remove ink from the plate
    const A = px.getImageData(0, 0, W, H), a = A.data, [ir, ig, ib] = hexToRgb(INKS[p.ink] || INKS.red), wear = p.wear / 100;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4, k = a[o + 3] / 255;
      if (k === 0) continue;
      const pressure = 0.62 + 0.38 * vnoise(x * 0.012 / sc, y * 0.012 / sc, seed + 3) + 0.14 * (vnoise(x * 0.08 / sc, y * 0.08 / sc, seed + 6) - 0.5);
      const hole = vnoise(x * 0.5 / sc, y * 0.5 / sc, seed + 9) > 1 - wear * 0.34 ? 0.1 : 1;
      const speck = hash2(x, y, 17) < wear * 0.06 ? 0 : 1;
      a[o] = ir; a[o + 1] = ig; a[o + 2] = ib; a[o + 3] = Math.max(0, Math.min(255, 255 * k * pressure * hole * speck * 0.96));
    }
    px.putImageData(A, 0, 0);
    // press it down a little crooked, ink soaking into the paper (multiply)
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate((p.tilt * Math.PI) / 180); ctx.translate(-W / 2, -H / 2);
    ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(plate, 0, 0); ctx.restore();
  },
});
