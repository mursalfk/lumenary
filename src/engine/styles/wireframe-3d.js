import { sampleImage, lumArray, boxBlur } from '../utils.js';

export default {
  id: 'wireframe-3d',
  number: 5,
  name: 'Wireframe 3D',
  kind: 'animated',
  maxSide: 800,
  thumbAt: 1.0,
  blurb: 'Brightness becomes terrain. Drag across it, or let it turn on its own.',
  params: [
    { key: 'mode', label: 'Style', type: 'select', default: 'ridges', options: [['ridges', 'Ridgelines'], ['mesh', 'Mesh']] },
    { key: 'lines', label: 'Line count', type: 'range', min: 24, max: 120, step: 1, default: 64 },
    { key: 'height', label: 'Relief height', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'tilt', label: 'Camera tilt', type: 'range', min: 15, max: 80, step: 1, default: 52, fmt: (v) => v + '°' },
    { key: 'spin', label: 'Auto turn', type: 'range', min: 0, max: 100, step: 1, default: 30 },
    { key: 'color', label: 'Lines', type: 'color', default: '#f2f2f0' },
    { key: 'bg', label: 'Background', type: 'color', default: '#050505' },
  ],
  create(env) {
    let W = 0, H = 0, work = null, p = {}, grid = null, gkey = '', yaw = 0;
    function build() {
      const aspect = W / H;
      const nz = Math.round(p.lines), nx = p.mode === 'ridges' ? 170 : Math.max(12, Math.round(nz * aspect));
      const img = sampleImage(env, work, nx, nz);
      grid = { nx, nz, Y: boxBlur(lumArray(img), nx, nz, 1) };
    }
    return {
      animated: true,
      setSource(w, ww, hh) { work = w; W = ww; H = hh; gkey = ''; },
      setParams(np) { p = np; },
      draw(ctx, t, dt, ptr) {
        const key = p.mode + '|' + p.lines;
        if (key !== gkey) { build(); gkey = key; }
        const { nx, nz, Y } = grid;
        ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H);
        const target = ptr && ptr.inside ? (ptr.x - 0.5) * 1.7 : Math.sin(t * p.spin * 0.014) * 0.75;
        yaw += (target - yaw) * Math.min(1, (dt || 1 / 60) * 6);
        if (!dt) yaw = target;
        const cy = Math.cos(yaw), sy = Math.sin(yaw);
        const pitch = (p.tilt * Math.PI) / 180, cp = Math.cos(pitch), sp = Math.sin(pitch);
        const a = W / H, hs = (p.height / 100) * 0.8, D = 3.2;
        const scale = (W * 0.5) / Math.max(a, 0.9) * 0.98;
        const cxs = W / 2, cys = H * 0.52;
        const sxA = new Float32Array(Math.max(nx, nz)), syA = new Float32Array(Math.max(nx, nz));
        function proj(x, y, z, i, arr) {
          const X = x * cy - z * sy, Z = x * sy + z * cy;
          const Yp = y * cp - Z * sp, Zd = Z * cp + y * sp;
          const s = (scale * D) / (D - Zd);
          sxA[i] = cxs + X * s; syA[i] = cys - Yp * s;
        }
        ctx.lineJoin = 'round';
        const lw = Math.max(1, W / 650);
        if (p.mode === 'ridges') {
          for (let j = 0; j < nz; j++) {
            const z = -1 + (2 * j) / (nz - 1);
            for (let i = 0; i < nx; i++) proj(-a + (2 * a * i) / (nx - 1), Y[j * nx + i] * hs, z, i);
            ctx.beginPath();
            ctx.moveTo(sxA[0], H + 20);
            for (let i = 0; i < nx; i++) ctx.lineTo(sxA[i], syA[i]);
            ctx.lineTo(sxA[nx - 1], H + 20);
            ctx.closePath();
            ctx.fillStyle = p.bg; ctx.fill();
            ctx.beginPath();
            ctx.moveTo(sxA[0], syA[0]);
            for (let i = 1; i < nx; i++) ctx.lineTo(sxA[i], syA[i]);
            ctx.globalAlpha = 0.3 + 0.7 * (j / (nz - 1));
            ctx.strokeStyle = p.color; ctx.lineWidth = lw * (0.8 + 0.5 * (j / nz));
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        } else {
          ctx.strokeStyle = p.color; ctx.lineWidth = lw * 0.8; ctx.globalAlpha = 0.75;
          for (let j = 0; j < nz; j++) {
            const z = -1 + (2 * j) / (nz - 1);
            for (let i = 0; i < nx; i++) proj(-a + (2 * a * i) / (nx - 1), Y[j * nx + i] * hs, z, i);
            ctx.beginPath(); ctx.moveTo(sxA[0], syA[0]);
            for (let i = 1; i < nx; i++) ctx.lineTo(sxA[i], syA[i]);
            ctx.stroke();
          }
          for (let i = 0; i < nx; i++) {
            const x = -a + (2 * a * i) / (nx - 1);
            for (let j = 0; j < nz; j++) proj(x, Y[j * nx + i] * hs, -1 + (2 * j) / (nz - 1), j);
            ctx.beginPath(); ctx.moveTo(sxA[0], syA[0]);
            for (let j = 1; j < nz; j++) ctx.lineTo(sxA[j], syA[j]);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
      },
      dispose() {},
    };
  },
};
