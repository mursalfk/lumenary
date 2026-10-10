// A built-in test picture so every style has something to show before the user uploads anything.
// Soft studio still life: three solids on a table against a graded wall.
export function makeSample(env, w = 800, h = 1000) {
  const c = env.makeCanvas(w, h);
  const x = c.getContext('2d');

  const wall = x.createLinearGradient(0, 0, 0, h * 0.62);
  wall.addColorStop(0, '#46506b');
  wall.addColorStop(1, '#c9b79c');
  x.fillStyle = wall;
  x.fillRect(0, 0, w, h);

  // window glow
  const glow = x.createRadialGradient(w * 0.2, h * 0.12, 10, w * 0.2, h * 0.12, w * 0.7);
  glow.addColorStop(0, 'rgba(255,244,214,0.75)');
  glow.addColorStop(1, 'rgba(255,244,214,0)');
  x.fillStyle = glow;
  x.fillRect(0, 0, w, h);

  // table
  const table = x.createLinearGradient(0, h * 0.62, 0, h);
  table.addColorStop(0, '#3a2a22');
  table.addColorStop(1, '#120c0a');
  x.fillStyle = table;
  x.fillRect(0, h * 0.62, w, h * 0.38);
  x.fillStyle = 'rgba(255,255,255,0.08)';
  x.fillRect(0, h * 0.62, w, 3);

  function shadow(cx, cy, rx, ry) {
    x.save();
    x.fillStyle = 'rgba(0,0,0,0.38)';
    x.filter = 'none';
    x.beginPath();
    x.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    x.fill();
    x.restore();
  }

  // sphere
  shadow(w * 0.4, h * 0.735, w * 0.27, h * 0.03);
  const s = x.createRadialGradient(w * 0.33, h * 0.45, 12, w * 0.4, h * 0.55, w * 0.3);
  s.addColorStop(0, '#fff4dc');
  s.addColorStop(0.3, '#ef8c46');
  s.addColorStop(0.75, '#a02f1c');
  s.addColorStop(1, '#2a0d0a');
  x.fillStyle = s;
  x.beginPath();
  x.arc(w * 0.4, h * 0.55, w * 0.26, 0, Math.PI * 2);
  x.fill();

  // cylinder
  const cx0 = w * 0.68, cw = w * 0.2, top = h * 0.36, bot = h * 0.72;
  shadow(cx0 + cw / 2 + 30, bot + 6, cw * 0.95, h * 0.022);
  const cyl = x.createLinearGradient(cx0, 0, cx0 + cw, 0);
  cyl.addColorStop(0, '#0e3b3f');
  cyl.addColorStop(0.35, '#46b3a8');
  cyl.addColorStop(0.55, '#b7f0e4');
  cyl.addColorStop(1, '#0a2a2d');
  x.fillStyle = cyl;
  x.fillRect(cx0, top, cw, bot - top);
  x.beginPath();
  x.ellipse(cx0 + cw / 2, bot, cw / 2, h * 0.018, 0, 0, Math.PI);
  x.fill();
  x.fillStyle = '#d9fbf3';
  x.beginPath();
  x.ellipse(cx0 + cw / 2, top, cw / 2, h * 0.018, 0, 0, Math.PI * 2);
  x.fill();

  // cone
  const kx = w * 0.14, kb = h * 0.76, kt = h * 0.5, kw = w * 0.15;
  shadow(kx + 28, kb + 4, kw * 1.1, h * 0.02);
  const cone = x.createLinearGradient(kx - kw, 0, kx + kw, 0);
  cone.addColorStop(0, '#2d2840');
  cone.addColorStop(0.45, '#cdbfee');
  cone.addColorStop(1, '#241f33');
  x.fillStyle = cone;
  x.beginPath();
  x.moveTo(kx, kt);
  x.lineTo(kx + kw, kb);
  x.ellipse(kx, kb, kw, h * 0.017, 0, 0, Math.PI);
  x.lineTo(kx - kw, kb);
  x.closePath();
  x.fill();

  // light film grain so flat areas have some tooth
  const img = x.getImageData(0, 0, w, h);
  const d = img.data;
  let seed = 12345;
  for (let i = 0; i < d.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) | 0;
    const n = ((seed >>> 16) & 255) / 255 - 0.5;
    d[i] += n * 10; d[i + 1] += n * 10; d[i + 2] += n * 10;
  }
  x.putImageData(img, 0, 0);
  return c;
}
