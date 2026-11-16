// Turns a full-color logo (SVG or PNG) into crisp pixel art in its own colors, drawn on a tiny canvas
// and scaled up with image-rendering: pixelated.
// The logo is first reduced to a few of its own main colors, then each art pixel takes the majority
// color of its block in a high-res render (no blurry mixes or speckles), and faint edge pixels are dropped.
// Near-black pixels follow the theme text color in dark mode so black logos (GitHub, Vercel, Deno…)
// stay visible.
import { useEffect, useRef } from 'react';

const GRID = 48;     // pixel-art resolution (96 px logo = exactly 2× scale)
const SUPER = 4;     // each art pixel is sampled from a SUPER×SUPER block
const COVER = 0.4;   // share of a block that must be filled for the pixel to be drawn
const PALETTE = 8;   // max colors per logo (its own main colors)

const cache = new Map();   // src -> Promise<Array<[r,g,b] | null>>

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const dist2 = (p, c) => (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
const lumOf = c => (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;

/** The logo's own main colors (k-means, farthest-point start), so gradients become a few clean shades. */
function buildPalette(pts, k) {
  if (!pts.length) return [];
  const step = Math.max(1, Math.floor(pts.length / 5000));
  const sample = pts.filter((_, i) => i % step === 0);
  const cents = [sample[0].slice()];
  while (cents.length < k) {
    let far = null, farD = -1;
    for (const p of sample) {
      let dmin = Infinity;
      for (const c of cents) dmin = Math.min(dmin, dist2(p, c));
      if (dmin > farD) { farD = dmin; far = p; }
    }
    if (farD < 250) break;          // the logo has fewer distinct colors than k
    cents.push(far.slice());
  }
  for (let it = 0; it < 8; it++) {
    const acc = cents.map(() => [0, 0, 0, 0]);
    for (const p of sample) {
      let bi = 0, bd = Infinity;
      cents.forEach((c, i) => { const d = dist2(p, c); if (d < bd) { bd = d; bi = i; } });
      const a = acc[bi]; a[0] += p[0]; a[1] += p[1]; a[2] += p[2]; a[3]++;
    }
    acc.forEach((a, i) => { if (a[3]) cents[i] = [a[0] / a[3], a[1] / a[3], a[2] / a[3]]; });
  }
  return cents.map(c => c.map(Math.round));
}

async function pixelate(src) {
  const img = await loadImage(src);
  const N = GRID * SUPER;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = N;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const iw = img.naturalWidth || 128, ih = img.naturalHeight || 128;
  const s = Math.min(N / iw, N / ih);
  const dw = iw * s, dh = ih * s;
  ctx.drawImage(img, (N - dw) / 2, (N - dh) / 2, dw, dh);
  const d = ctx.getImageData(0, 0, N, N).data;

  // 1) palette of the logo's own colors
  const pts = [];
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] >= 128) pts.push([d[i], d[i + 1], d[i + 2]]);
  const pal = buildPalette(pts, PALETTE);
  if (!pal.length) return new Array(GRID * GRID).fill(null);
  const nearest = (r, g, b) => {
    let bi = 0, bd = Infinity;
    for (let i = 0; i < pal.length; i++) { const dd = dist2([r, g, b], pal[i]); if (dd < bd) { bd = dd; bi = i; } }
    return bi;
  };

  // 2) each art pixel = majority palette color of its block; a strongly contrasting color that fills
  //    a quarter of the block wins instead (eyes, outlines, thin bars stay visible)
  const px = new Array(GRID * GRID).fill(null);
  const votes = new Array(pal.length);
  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      votes.fill(0);
      let filled = 0;
      for (let sy = 0; sy < SUPER; sy++) {
        for (let sx = 0; sx < SUPER; sx++) {
          const i = ((gy * SUPER + sy) * N + gx * SUPER + sx) * 4;
          if (d[i + 3] < 128) continue;
          filled++;
          votes[nearest(d[i], d[i + 1], d[i + 2])]++;
        }
      }
      if (filled < SUPER * SUPER * COVER) continue;
      let best = 0;
      for (let i = 1; i < pal.length; i++) if (votes[i] > votes[best]) best = i;
      let pick = best, gap = 0.3;
      for (let i = 0; i < pal.length; i++) {
        if (i === best || votes[i] < SUPER * SUPER * 0.25) continue;
        const dl = Math.abs(lumOf(pal[i]) - lumOf(pal[best]));
        if (dl > gap) { gap = dl; pick = i; }
      }
      px[gy * GRID + gx] = pal[pick];
    }
  }
  return px;
}

const getPixels = src => {
  if (!cache.has(src)) cache.set(src, pixelate(src).catch(err => { cache.delete(src); throw err; }));
  return cache.get(src);
};

export default function PixelLogo({ src, size = 96, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    let alive = true;
    let pixels = null;

    const draw = () => {
      const canvas = ref.current;
      if (!alive || !canvas || !pixels) return;
      const ctx = canvas.getContext('2d');
      const out = ctx.createImageData(GRID, GRID);
      // Theme text color: when it is light (dark theme), near-black logo pixels are painted with it.
      const m = getComputedStyle(canvas).color.match(/\d+/g);
      const fg = m ? m.slice(0, 3).map(Number) : [255, 255, 255];
      const darkTheme = lumOf(fg) > 0.5;
      pixels.forEach((p, i) => {
        if (!p) return;
        const c = darkTheme && lumOf(p) < 0.16 ? fg : p;
        out.data[i * 4] = c[0]; out.data[i * 4 + 1] = c[1]; out.data[i * 4 + 2] = c[2]; out.data[i * 4 + 3] = 255;
      });
      ctx.clearRect(0, 0, GRID, GRID);
      ctx.putImageData(out, 0, 0);
    };

    getPixels(src).then(p => { pixels = p; draw(); }).catch(() => {});
    // the site fires 'themechange' before styles settle in some browsers: redraw on the next frame
    const onTheme = () => requestAnimationFrame(draw);
    window.addEventListener('themechange', onTheme);
    return () => { alive = false; window.removeEventListener('themechange', onTheme); };
  }, [src]);

  return (
    <canvas
      ref={ref}
      width={GRID}
      height={GRID}
      className={`pixel-logo ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
