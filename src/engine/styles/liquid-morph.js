export default {
  id: 'liquid-morph',
  number: 2,
  name: 'Liquid morph',
  kind: 'animated',
  maxSide: 600,
  thumbAt: 1.2,
  blurb: 'The picture melts and flows. Move over it to make ripples.',
  params: [
    { key: 'strength', label: 'Strength', type: 'range', min: 0, max: 100, step: 1, default: 55 },
    { key: 'scale', label: 'Wave scale', type: 'range', min: 0.5, max: 5, step: 0.1, default: 1.6, fmt: (v) => v.toFixed(1) },
    { key: 'speed', label: 'Speed', type: 'range', min: 0, max: 100, step: 1, default: 45 },
    { key: 'split', label: 'Color split', type: 'range', min: 0, max: 100, step: 1, default: 30 },
    { key: 'sheen', label: 'Sheen', type: 'range', min: 0, max: 100, step: 1, default: 35 },
  ],
  create() {
    let W = 0, H = 0, src = null, p = {}, out = null, fdx, fdy, gx = 0, gy = 0;
    const NODE = 6;
    return {
      animated: true,
      setSource(work, w, h) {
        W = w; H = h; src = work.getContext('2d').getImageData(0, 0, w, h).data; out = null;
        gx = Math.ceil(W / NODE) + 2; gy = Math.ceil(H / NODE) + 2;
        fdx = new Float32Array(gx * gy); fdy = new Float32Array(gx * gy);
      },
      setParams(np) { p = np; },
      draw(ctx, t, dt, ptr) {
        if (!out) out = ctx.createImageData(W, H);
        const A = (p.strength / 100) * 0.07 * W, F = p.scale, tt = t * (p.speed / 45);
        const inside = ptr && ptr.inside;
        for (let j = 0; j < gy; j++) {
          const v = (j * NODE) / H;
          for (let i = 0; i < gx; i++) {
            const u = (i * NODE) / W;
            const f1 = Math.sin(v * F * 5.5 + tt * 1.3 + Math.sin(u * F * 3.1 + tt * 0.7) * 1.6);
            const f2 = Math.cos(u * F * 5.0 - tt * 1.1 + Math.sin(v * F * 2.7 - tt * 0.9) * 1.5);
            let dx = f1 * A, dy = f2 * A;
            if (inside) {
              const ddx = (u - ptr.x) * W, ddy = (v - ptr.y) * H, d = Math.hypot(ddx, ddy);
              const k = Math.exp(-d / (W * 0.2)) * Math.sin(d * 0.07 - t * 7) * Math.max(A, W * 0.02) * 0.9;
              dx += (ddx / (d + 1)) * k; dy += (ddy / (d + 1)) * k;
            }
            fdx[j * gx + i] = dx; fdy[j * gx + i] = dy;
          }
        }
        const d = out.data, split = (p.split / 100) * 0.7, sheen = (p.sheen / 100) * 0.35 / Math.max(1, A);
        const mx = W - 1, my = H - 1;
        function ch(fx, fy, c) {
          if (fx < 0) fx = 0; else if (fx > mx) fx = mx;
          if (fy < 0) fy = 0; else if (fy > my) fy = my;
          const x0 = fx | 0, y0 = fy | 0, x1 = x0 < mx ? x0 + 1 : x0, y1 = y0 < my ? y0 + 1 : y0;
          const ax = fx - x0, ay = fy - y0;
          const a = src[(y0 * W + x0) * 4 + c], b = src[(y0 * W + x1) * 4 + c];
          const cc = src[(y1 * W + x0) * 4 + c], dd = src[(y1 * W + x1) * 4 + c];
          return (a * (1 - ax) + b * ax) * (1 - ay) + (cc * (1 - ax) + dd * ax) * ay;
        }
        for (let y = 0; y < H; y++) {
          const gj = y / NODE, j0 = gj | 0, fj = gj - j0;
          for (let x = 0; x < W; x++) {
            const gi = x / NODE, i0 = gi | 0, fi = gi - i0;
            const a = j0 * gx + i0, b = a + 1, c = a + gx, e = c + 1;
            const dx = (fdx[a] * (1 - fi) + fdx[b] * fi) * (1 - fj) + (fdx[c] * (1 - fi) + fdx[e] * fi) * fj;
            const dy = (fdy[a] * (1 - fi) + fdy[b] * fi) * (1 - fj) + (fdy[c] * (1 - fi) + fdy[e] * fi) * fj;
            const o = (y * W + x) * 4, k = 1 + dy * sheen;
            let r = ch(x + dx * (1 + split), y + dy * (1 + split), 0);
            let g = ch(x + dx, y + dy, 1);
            let b2 = ch(x + dx * (1 - split), y + dy * (1 - split), 2);
            d[o] = r * k; d[o + 1] = g * k; d[o + 2] = b2 * k; d[o + 3] = 255;
          }
        }
        ctx.putImageData(out, 0, 0);
      },
      dispose() {},
    };
  },
};
