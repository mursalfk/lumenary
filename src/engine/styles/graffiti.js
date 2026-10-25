// src/engine/styles/graffiti.js
import { still, rng, TAU, hexToRgb } from '../utils.js';
import { pixels, label } from '../helpers.js';

const PALETTES = {
  street: ['#111111', '#ff3d6e', '#ffe14d'],
  toxic: ['#0d0d12', '#7cff3d', '#ff4fd8'],
  ocean: ['#0b1220', '#18b7ff', '#fff0b3'],
};

export default still({
  id: 'graffiti',
  name: 'Graffiti',
  blurb: 'A three-colour spray stencil on a brick wall, with overspray, drips and a tag.',
  maxSide: 1000,
  params: [
    { key: 'palette', label: 'Cans', type: 'select', default: 'street', options: [['street', 'Pink and yellow'], ['toxic', 'Green and magenta'], ['ocean', 'Blue and cream']] },
    { key: 'wall', label: 'Wall', type: 'select', default: 'brick', options: [['brick', 'Red brick'], ['grey', 'Grey brick'], ['plaster', 'Plaster']] },
    { key: 'spray', label: 'Overspray', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'drips', label: 'Drips', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'tag', label: 'Tag', type: 'text', default: 'LUMEN', max: 10 },
    { key: 'seed', label: 'Respray', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const L = cache.L, r = rng(p.seed * 83 + 9), u = Math.min(W, H) / 100;
    const [dark, c1, c2] = PALETTES[p.palette] || PALETTES.street;

    // the wall
    const wallBase = { brick: [150, 70, 52], grey: [120, 118, 116], plaster: [196, 188, 172] }[p.wall] || [150, 70, 52];
    ctx.fillStyle = p.wall === 'plaster' ? '#c4bcac' : '#4a4540'; ctx.fillRect(0, 0, W, H);
    if (p.wall !== 'plaster') {
      const bh = u * 4.2, bw = u * 10, m = Math.max(1.5, u * 0.45);
      for (let row = 0, y = 0; y < H; row++, y += bh) {
        const off = row % 2 ? -bw / 2 : 0;
        for (let x = off; x < W; x += bw) {
          const v = 0.82 + r() * 0.3;
          ctx.fillStyle = `rgb(${wallBase[0] * v | 0},${wallBase[1] * v | 0},${wallBase[2] * v | 0})`;
          ctx.fillRect(x + m / 2, y + m / 2, bw - m, bh - m);
        }
      }
    } else {
      for (let i = 0; i < 900; i++) { ctx.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '90,80,60'},${0.03 + r() * 0.05})`; ctx.fillRect(r() * W, r() * H, 3 + r() * 14, 2 + r() * 8); }
    }
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 0, W, H);   // dim the wall so paint pops

    // stencil: lightest tones stay bare wall, so only two thirds of the picture is painted
    // thresholds come from the picture's own tones, so some wall always shows through
    const sorted = Float32Array.from(L).sort(), q = (f) => sorted[Math.min(sorted.length - 1, (sorted.length * f) | 0)];
    const t3 = q(0.2), t2 = q(0.4), t1 = q(0.58);
    const lvl = new Uint8Array(W * H);
    for (let i = 0; i < lvl.length; i++) lvl[i] = L[i] < t3 ? 3 : L[i] < t2 ? 2 : L[i] < t1 ? 1 : 0;
    const cols = [null, c2, c1, dark];
    const layer = env.makeCanvas(W, H), lx = layer.getContext('2d'), img = lx.createImageData(W, H);
    for (let i = 0; i < lvl.length; i++) {
      const c = cols[lvl[i]]; if (!c) continue;
      const [cr, cg, cb] = hexToRgb(c); img.data[i * 4] = cr; img.data[i * 4 + 1] = cg; img.data[i * 4 + 2] = cb; img.data[i * 4 + 3] = 255;
    }
    lx.putImageData(img, 0, 0);
    // soft edge: draw once sharp and once from a shrunken, blurred copy
    ctx.drawImage(layer, 0, 0);
    if (p.spray > 0) {
      const s = env.makeCanvas(W / 5, H / 5); s.getContext('2d').drawImage(layer, 0, 0, s.width, s.height);
      ctx.globalAlpha = 0.35 * p.spray / 100; ctx.drawImage(s, 0, 0, W, H); ctx.globalAlpha = 1;
      // speckle
      const n = Math.round(W * H * 0.012 * p.spray / 100);
      for (let i = 0; i < n; i++) {
        const x = (r() * W) | 0, y = (r() * H) | 0, k = lvl[y * W + x];
        if (!k) continue;
        const a = r() * TAU, d = u * (0.3 + r() * 2.2);
        ctx.fillStyle = cols[k]; ctx.globalAlpha = 0.35 + r() * 0.5;
        ctx.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d, 1.6, 1.6);
      }
      ctx.globalAlpha = 1;
    }
    // drips: from painted pixels that have bare wall just below
    const nd = Math.round(p.drips / 100 * 38);
    ctx.lineCap = 'round';
    for (let tries = 0, made = 0; tries < 4000 && made < nd; tries++) {
      const x = (r() * W) | 0, y = (r() * (H - 20)) | 0, k = lvl[y * W + x];
      if (k < 2 || lvl[Math.min(H - 1, y + 3) * W + x] !== 0 && lvl[Math.min(H - 1, y + 3) * W + x] === k) continue;
      if (lvl[Math.min(H - 1, y + 4) * W + x] >= k) continue;
      const len = u * (3 + r() * 11);
      ctx.strokeStyle = cols[k]; ctx.lineWidth = u * (0.35 + r() * 0.4);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + len); ctx.stroke();
      ctx.fillStyle = cols[k]; ctx.beginPath(); ctx.arc(x, y + len, ctx.lineWidth * 0.9, 0, TAU); ctx.fill();
      made++;
    }
    // tag
    if (p.tag) {
      ctx.save();
      ctx.translate(W * 0.06, H * 0.93); ctx.rotate(-0.05);
      ctx.font = `italic 900 ${u * 11}px "Hanken Grotesk", system-ui, sans-serif`;
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
      ctx.lineWidth = u * 1.5; ctx.strokeStyle = dark; ctx.strokeText(p.tag.toUpperCase(), 0, 0);
      ctx.fillStyle = c2; ctx.shadowColor = c1; ctx.shadowBlur = u * 1.2; ctx.fillText(p.tag.toUpperCase(), 0, 0);
      ctx.restore();
    }
  },
});
