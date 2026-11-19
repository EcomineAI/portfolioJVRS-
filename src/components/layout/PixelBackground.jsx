// Animated pixel-gradient background: a slow "plasma" of chunky cells in monochrome light/dark tones,
// quantized to 5 levels and updated at a low frame rate for a stepped, retro feel.
// Decorative: fixed behind everything, pointer-events none, very low opacity so text stays readable.
import { useEffect, useRef } from 'react';

const CELL = 22;          // CSS px per pixel block
const FPS = 10;           // stepped animation
const LEVELS = 5;

const hexToRgb = s => {
  const c = document.createElement('canvas').getContext('2d');
  c.fillStyle = s; const v = c.fillStyle;            // normalizes any CSS color to #rrggbb
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(v);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [20, 20, 20];
};

export default function PixelBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let cols = 0, rows = 0, raf = 0, last = 0, t = Math.random() * 100, hidden = document.hidden;
    let palette = [], maxAlpha = 0.085, scale = 1;

    const readTheme = () => {
      const dark = document.documentElement.dataset.theme === 'dark';
      // Monochrome theme-neutral palette (warm stone -> charcoal in light, ash -> warm bone in dark)
      palette = (dark ? ['#9ca3af', '#e8e5dd', '#9ca3af'] : ['#78716c', '#141414', '#78716c'])
        .map(hexToRgb);
      maxAlpha = dark ? 0.095 : 0.085;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(innerWidth * dpr);
      canvas.height = Math.round(innerHeight * dpr);
      scale = canvas.width / innerWidth;
      cols = Math.ceil(innerWidth / CELL) + 1;
      rows = Math.ceil(innerHeight / CELL) + 1;
      draw();
    };

    const lerp = (a, b, f) => a + (b - a) * f;
    const colorAt = f => {                            // horizontal gradient through the palette
      const p = f * (palette.length - 1);
      const i = Math.min(palette.length - 2, Math.floor(p));
      const k = p - i;
      const a = palette[i], b = palette[i + 1];
      return `${Math.round(lerp(a[0], b[0], k))},${Math.round(lerp(a[1], b[1], k))},${Math.round(lerp(a[2], b[2], k))}`;
    };

    function draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);          // draw in device pixels
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let x = 0; x < cols; x++) {
        const rgb = colorAt((x / cols + Math.sin(t * 0.05) * 0.15 + 1) % 1);
        for (let y = 0; y < rows; y++) {
          // plasma field
          const v = Math.sin(x * 0.16 + t * 0.6)
            + Math.sin(y * 0.21 - t * 0.45)
            + Math.sin((x + y) * 0.09 + t * 0.3)
            + Math.sin(Math.hypot(x - cols / 2, y - rows / 3) * 0.18 - t * 0.5);
          const level = Math.min(LEVELS - 1, Math.floor(((v + 4) / 8) * LEVELS)); // 0..LEVELS-1
          if (!level) continue;
          // gentle fade toward the bottom of the viewport
          const fade = 1 - (y / rows) * 0.5;
          ctx.fillStyle = `rgba(${rgb},${((level / (LEVELS - 1)) * maxAlpha * fade).toFixed(3)})`;
          // snap to whole device pixels so neighbouring blocks never leave hairline seams
          const x0 = Math.round(x * CELL * scale), y0 = Math.round(y * CELL * scale);
          const x1 = Math.round((x + 1) * CELL * scale), y1 = Math.round((y + 1) * CELL * scale);
          ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
        }
      }
    }

    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (hidden || now - last < 1000 / FPS) return;
      last = now;
      t += 0.08;   // slow drift
      draw();
    }

    readTheme();
    resize();
    if (!reduced) raf = requestAnimationFrame(loop);

    const onTheme = () => requestAnimationFrame(() => { readTheme(); draw(); });
    const onVis = () => { hidden = document.hidden; };
    window.addEventListener('resize', resize);
    window.addEventListener('themechange', onTheme);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('themechange', onTheme);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={ref} className="pixel-bg" aria-hidden="true" />;
}
