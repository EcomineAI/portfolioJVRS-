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

  for (let k = 0; k < d.length; k += 4) {
    if (d[k + 3] < 128) { d[k] = 0; d[k + 3] = 0; continue; }
    let lum = (0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2]) / 255;
    lum = Math.min(1, Math.max(0, (lum - lo) / Math.max(0.05, hi - lo)));
    // S-curve for punchier midtones (eyes, brows, mouth read clearly)
    lum = lum * lum * (3 - 2 * lum);
    let v = dark ? lum : 1 - lum;
    v = 0.1 + 0.9 * Math.pow(v, dark ? 1.35 : 1.1);   // small floor keeps the silhouette visible
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
