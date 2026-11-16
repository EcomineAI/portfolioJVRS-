// Dot-matrix portrait of June Vic from /pfp.jpg (profile.portrait).
// The photo is a 411×411 studio shot on a plain white background, so the background is removed
// automatically: a flood fill from the TOP and SIDE edges clears the near-white pixels (it never
// starts from the bottom edge, so the white shirt between the lapels stays).
import DotField from './DotField.jsx';
import { profile } from '../data/profile.js';

const CROP = { x: 41, y: 0, w: 329, h: 411 };     // 4:5 portrait crop of the 411×411 source

let imgPromise;
function loadImage(src) {
  if (!imgPromise) {
    imgPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
  return imgPromise;
}

async function samplePortrait(ctx, cols, rows, theme) {
  const img = await loadImage(profile.portrait || profile.photo);

  // 1) draw the cropped photo, then knock out the plain background
  ctx.drawImage(img, CROP.x, CROP.y, CROP.w, CROP.h, 0, 0, cols, rows);
  {
    const bg = ctx.getImageData(0, 0, cols, rows);
    const px = bg.data;
    const isBg = i => {
      const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
      return r > 214 && g > 214 && b > 214 && Math.max(r, g, b) - Math.min(r, g, b) < 26;
    };
    const seen = new Uint8Array(cols * rows);
    const stack = [];
    for (let x = 0; x < cols; x++) stack.push(x);                                   // top edge
    for (let y = 0; y < rows; y++) stack.push(y * cols, y * cols + cols - 1);        // side edges
    while (stack.length) {
      const i = stack.pop();
      if (seen[i] || !isBg(i)) continue;
      seen[i] = 1;
      px[i * 4 + 3] = 0;
      const x = i % cols, y = (i / cols) | 0;
      if (x > 0) stack.push(i - 1);
      if (x < cols - 1) stack.push(i + 1);
      if (y > 0) stack.push(i - cols);
      if (y < rows - 1) stack.push(i + cols);
    }
    ctx.putImageData(bg, 0, 0);
  }

  // 2) luminance → dot strength. Dark theme: bright = big dot. Light theme: dark = big dot.
  //    A floor keeps the silhouette visible where the photo is very dark/bright.
  const id = ctx.getImageData(0, 0, cols, rows);
  const d = id.data;
  const dark = theme === 'dark';

  // auto-levels: stretch between the 5th and 95th percentile of the subject's luminance
  const lums = [];
  for (let k = 0; k < d.length; k += 4) {
    if (d[k + 3] >= 128) lums.push((0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2]) / 255);
  }
  lums.sort((a, b) => a - b);
  const lo = lums[Math.floor(lums.length * 0.05)] ?? 0;
  const hi = lums[Math.floor(lums.length * 0.95)] ?? 1;

  // normalised luminance per pixel (-1 = background)
  const L = new Float32Array(cols * rows).fill(-1);
  for (let i = 0; i < cols * rows; i++) {
    const k = i * 4;
    if (d[k + 3] < 128) continue;
    const lum = (0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2]) / 255;
    L[i] = Math.min(1, Math.max(0, (lum - lo) / Math.max(0.05, hi - lo)));
  }

  // local contrast (unsharp mask, 5×5 box): separates collar, tie and jacket instead of one dark mass
  const R = 2, AMOUNT = 1.1;
  const sharp = new Float32Array(cols * rows).fill(-1);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (L[i] < 0) continue;
      let sum = 0, n = 0;
      for (let yy = Math.max(0, y - R); yy <= Math.min(rows - 1, y + R); yy++) {
        for (let xx = Math.max(0, x - R); xx <= Math.min(cols - 1, x + R); xx++) {
          const v = L[yy * cols + xx];
          if (v >= 0) { sum += v; n++; }
        }
      }
      sharp[i] = Math.min(1, Math.max(0, L[i] + AMOUNT * (L[i] - sum / n)));
    }
  }

  for (let i = 0; i < cols * rows; i++) {
    const k = i * 4;
    if (L[i] < 0) { d[k] = 0; d[k + 3] = 0; continue; }
    let lum = Math.pow(sharp[i], 0.8);             // lift the shadows (suit and hair keep detail)
    lum = lum * lum * (3 - 2 * lum);               // S-curve: punchier midtones (eyes, brows, mouth)
    let v = dark ? lum : 1 - lum;
    v = 0.16 + 0.78 * Math.pow(v, dark ? 1.35 : 1.1);   // floor keeps the silhouette, ceiling keeps the dots apart
    // silhouette: pixels touching the background get a firmer dot so the outline reads clean
    const x = i % cols, y = (i / cols) | 0;
    const edge = (x > 0 && L[i - 1] < 0) || (x < cols - 1 && L[i + 1] < 0) || (y > 0 && L[i - cols] < 0) || (y < rows - 1 && L[i + cols] < 0);
    if (edge) v = Math.max(v, 0.62);
    d[k] = d[k + 1] = d[k + 2] = Math.round(v * 255);
    d[k + 3] = 255;
  }
  ctx.putImageData(id, 0, 0);
}

export default function DotPortrait({ className }) {
  return (
    <DotField
      className={className}
      sample={samplePortrait}
      aspect={CROP.h / CROP.w}
      step={w => Math.max(4, Math.round(w / 78))}
      radius={80}
      colorVar="--fg"
      minLevel={0.08}
    />
  );
}
