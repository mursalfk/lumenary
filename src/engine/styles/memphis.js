// src/engine/styles/memphis.js
import { still, rng, TAU, hexToRgb } from '../utils.js';
import { pixels, paintPixels, rgbList } from '../helpers.js';

const SCHEMES = {
  classic: { bg: '#fff4d6', ink: '#111111', cols: ['#111111', '#2f6bff', '#ff4f9a', '#ffd23f'] },
  mint: { bg: '#d9f5ea', ink: '#14213d', cols: ['#14213d', '#00a896', '#ff7b54', '#ffe66d'] },
  lilac: { bg: '#e9defa', ink: '#1b1033', cols: ['#1b1033', '#7a4dff', '#ff8fb8', '#ffe45e'] },
};

export default still({
  id: 'memphis',
  name: 'Memphis',
  blurb: 'Eighties Memphis Group: a posterised panel among squiggles, confetti and dots.',
  maxSide: 1000,
  params: [
    { key: 'scheme', label: 'Colours', type: 'select', default: 'classic', options: [['classic', 'Classic'], ['mint', 'Mint'], ['lilac', 'Lilac']] },
    { key: 'panel', label: 'Panel', type: 'select', default: 'rounded', options: [['rounded', 'Rounded'], ['arch', 'Arch'], ['circle', 'Circle']] },
    { key: 'confetti', label: 'Confetti', type: 'range', min: 0, max: 100, step: 1, default: 60 },
    { key: 'seed', label: 'Shuffle', type: 'shuffle', default: 1 },
  ],
  render(ctx, work, p, env, W, H, cache) {
    pixels(work, W, H, cache);
    const sc = SCHEMES[p.scheme] || SCHEMES.classic, r = rng(p.seed * 29 + 2), u = Math.min(W, H) / 100;
    const pal = rgbList(sc.cols);
    ctx.fillStyle = sc.bg; ctx.fillRect(0, 0, W, H);
    // dot grid
    ctx.fillStyle = sc.ink; ctx.globalAlpha = 0.12;
    for (let y = u * 2; y < H; y += u * 4) for (let x = u * 2; x < W; x += u * 4) { ctx.beginPath(); ctx.arc(x, y, u * 0.28, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;

    const shape = (x, y, s, kind, col) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate((r() - 0.5) * 1.6);
      ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = u * 0.9; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      if (kind === 0) { ctx.beginPath(); ctx.moveTo(-s, s * 0.8); ctx.lineTo(s, s * 0.8); ctx.lineTo(0, -s); ctx.closePath(); ctx.fill(); }
      else if (kind === 1) { ctx.beginPath(); ctx.arc(0, 0, s * 0.8, 0, TAU); ctx.stroke(); }
      else if (kind === 2) { ctx.beginPath(); for (let i = 0; i <= 24; i++) { const t = i / 24; ctx.lineTo(-s * 1.4 + t * s * 2.8, Math.sin(t * TAU * 2.5) * s * 0.35); } ctx.stroke(); }
      else if (kind === 3) { ctx.beginPath(); ctx.arc(0, 0, s * 0.8, Math.PI, TAU); ctx.closePath(); ctx.fill(); }
      else if (kind === 4) { ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(s, 0); ctx.moveTo(0, -s); ctx.lineTo(0, s); ctx.stroke(); }
      else { for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * s * 0.55, 0, s * 0.14, 0, TAU); ctx.fill(); } }
      ctx.restore();
    };
    const count = Math.round(p.confetti / 100 * 46);
    const place = (n) => { for (let i = 0; i < n; i++) shape(r() * W, r() * H, u * (2.2 + r() * 3.2), (r() * 6) | 0, sc.cols[1 + ((r() * 3) | 0)]); };
    place(count);

    // posterised photograph
    const tmp = env.makeCanvas(W, H), tx = tmp.getContext('2d'), L = cache.L;
    paintPixels(tx, W, H, (x, y, o) => { const c = pal[Math.min(3, (L[y * W + x] * 4) | 0)]; o[0] = c[0]; o[1] = c[1]; o[2] = c[2]; });
    const pw = W * 0.7, ph = H * 0.68, px = (W - pw) / 2, py = H * 0.15;
    const outline = () => {
      ctx.beginPath();
      if (p.panel === 'circle') { const rr = Math.min(pw, ph) / 2; ctx.arc(W / 2, py + ph / 2, rr, 0, TAU); }
      else if (p.panel === 'arch') { ctx.moveTo(px, py + ph); ctx.lineTo(px, py + pw / 2); ctx.arc(W / 2, py + pw / 2, pw / 2, Math.PI, TAU); ctx.lineTo(px + pw, py + ph); ctx.closePath(); }
      else { const rr = u * 4; ctx.moveTo(px + rr, py); ctx.arcTo(px + pw, py, px + pw, py + ph, rr); ctx.arcTo(px + pw, py + ph, px, py + ph, rr); ctx.arcTo(px, py + ph, px, py, rr); ctx.arcTo(px, py, px + pw, py, rr); ctx.closePath(); }
    };
    ctx.save(); ctx.translate(u * 2.2, u * 2.2); outline(); ctx.fillStyle = sc.ink; ctx.fill(); ctx.restore();
    ctx.save(); outline(); ctx.clip();
    const s = Math.max(pw / W, ph / H) * 1.0;
    ctx.drawImage(tmp, W / 2 - (W * s) / 2, py + ph / 2 - (H * s) / 2, W * s, H * s);
    ctx.restore();
    outline(); ctx.lineWidth = u * 0.9; ctx.strokeStyle = sc.ink; ctx.stroke();
    // a few shapes on top, overlapping the edge
    for (let i = 0; i < Math.round(count / 7); i++) shape(px + r() * pw, py + (r() > 0.5 ? 0 : ph), u * (2.5 + r() * 2.5), (r() * 6) | 0, sc.cols[1 + ((r() * 3) | 0)]);
  },
});
