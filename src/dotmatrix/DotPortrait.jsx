// Dot-matrix portrait of June Vic from /jv.png.
// The photo has a busy background (laptop, mic, shelf), so we crop to head + shoulders and
// clip to a hand-traced silhouette before sampling. Coordinates are in the 2400×2400 source.
import DotField from './DotField.jsx';
import { profile } from '../data/profile.js';

const CROP = { x: 1200, y: 230, w: 1200, h: 1500 };     // 4:5 portrait crop

// Silhouette traced on the original photo (head, ear, neck, shoulders).
const OUTLINE = [
  [1366, 472], [1466, 360], [1615, 304], [1838, 288], [2037, 342], [2186, 453], [2251, 621],
  [2259, 870], [2236, 1068], [2224, 1230], [2193, 1330], [2224, 1391], [2335, 1440], [2400, 1466],
  [2400, 1730], [1490, 1730], [1478, 1566], [1416, 1478], [1373, 1317], [1323, 1118],
  [1292, 969], [1286, 770], [1311, 596],
];

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
  const img = await loadImage(profile.photo);
  const sx = cols / CROP.w, sy = rows / CROP.h;

  // 1) draw the cropped photo, clipped to the silhouette
  ctx.save();
  ctx.beginPath();
  OUTLINE.forEach(([x, y], i) => {
    const px = (x - CROP.x) * sx, py = (y - CROP.y) * sy;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  });
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, CROP.x, CROP.y, CROP.w, CROP.h, 0, 0, cols, rows);
  ctx.restore();

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
