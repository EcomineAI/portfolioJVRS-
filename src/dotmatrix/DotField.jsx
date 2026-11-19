// Interactive dot-matrix canvas.
// A `sample` function draws a source (image, text…) into a small offscreen canvas;
// every cell becomes a square "pixel dot". Dots are pushed away from the pointer and
// spring back. The site-wide retro pixel cursor (base.css) is the only pointer indicator.
// Decorative only: the canvas is aria-hidden; give the real content as text elsewhere.
import { useEffect, useRef } from 'react';

const prefersReducedMotion = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const cssVar = (name, fallback) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

/**
 * @param {object}   props
 * @param {(ctx: CanvasRenderingContext2D, cols: number, rows: number, theme: string) => Promise<void>|void} props.sample
 *        Draw the source into a cols×rows canvas. Red channel (0–255) of each pixel = dot strength.
 * @param {number}   props.step       Dot pitch in CSS px (or a function of width).
 * @param {number}   [props.aspect]   height / width. Omit to use the container's CSS height.
 * @param {number}   [props.radius]   Pointer influence radius in CSS px.
 * @param {string}   [props.colorVar] CSS variable used for dot color.
 * @param {number}   [props.minLevel] Strength below this (0–1) draws no dot.
 * @param {any}      [props.deps]     Re-sample when this changes.
 */
export default function DotField({
  sample,
  step = 6,
  aspect,
  radius = 90,
  colorVar = '--fg',
  minLevel = 0.06,
  className = '',
  deps,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduced = prefersReducedMotion();

    let W = 0, H = 0, dpr = 1, pitch = 6;
    let n = 0;
    let hx, hy, ox, oy, vx, vy, size, alpha;     // typed arrays
    let color = '#fff';
    let pointer = { x: -9999, y: -9999, inside: false };
    let raf = 0, running = false, visible = true, disposed = false, sampleId = 0;

    const readColors = () => {
      color = cssVar(colorVar, '#c9d2e0');
    };

    async function build() {
      const id = ++sampleId;
      const rect = wrap.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(aspect ? W * aspect : rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.height = `${H}px`;
      pitch = typeof step === 'function' ? step(W) : step;

      const cols = Math.max(1, Math.floor(W / pitch));
      const rows = Math.max(1, Math.floor(H / pitch));
      const off = document.createElement('canvas');
      off.width = cols; off.height = rows;
      const octx = off.getContext('2d', { willReadFrequently: true });
      await sample(octx, cols, rows, document.documentElement.dataset.theme || 'light');
      if (disposed || id !== sampleId) return;
      const data = octx.getImageData(0, 0, cols, rows).data;

      // collect dots
      const xs = [], ys = [], ss = [], as = [];
      const padX = (W - cols * pitch) / 2 + pitch / 2;
      const padY = (H - rows * pitch) / 2 + pitch / 2;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = (j * cols + i) * 4;
          const v = (data[k] / 255) * (data[k + 3] / 255);
          if (v < minLevel) continue;
          const x = padX + i * pitch;
          const y = padY + j * pitch;
          const s = Math.max(1, pitch * (0.3 + 0.62 * v));
          const half = s / 2;
          if (x - half < minX) minX = x - half;
          if (x + half > maxX) maxX = x + half;
          if (y - half < minY) minY = y - half;
          if (y + half > maxY) maxY = y + half;
          xs.push(x);
          ys.push(y);
          ss.push(s);
          as.push(0.35 + 0.65 * v);
        }
      }
      n = xs.length;
      if (n > 0) {
        wrap.dataset.dotBounds = `${Math.round(minX)},${Math.round(minY)},${Math.round(maxX)},${Math.round(maxY)}`;
      } else {
        delete wrap.dataset.dotBounds;
      }
      hx = Float32Array.from(xs); hy = Float32Array.from(ys);
      ox = new Float32Array(n); oy = new Float32Array(n);
      vx = new Float32Array(n); vy = new Float32Array(n);
      size = Float32Array.from(ss); alpha = Float32Array.from(as);
      draw();
    }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = color;
      for (let i = 0; i < n; i++) {
        const s = size[i];
        ctx.globalAlpha = alpha[i];
        ctx.fillRect(hx[i] + ox[i] - s / 2, hy[i] + oy[i] - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    }

    function tick() {
      raf = 0;
      if (!visible || disposed) { running = false; return; }
      let moving = false;
      const R = radius, R2 = R * R;
      const px = pointer.inside ? pointer.x : -99999;
      const py = pointer.inside ? pointer.y : -99999;
      for (let i = 0; i < n; i++) {
        const x = hx[i] + ox[i], y = hy[i] + oy[i];
        const dx = x - px, dy = y - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const f = (1 - d / R) * 2.2;
          vx[i] += (dx / d) * f;
          vy[i] += (dy / d) * f;
        }
        vx[i] = (vx[i] - ox[i] * 0.08) * 0.8;   // spring home + damping
        vy[i] = (vy[i] - oy[i] * 0.08) * 0.8;
        ox[i] += vx[i]; oy[i] += vy[i];
        if (!moving && (Math.abs(ox[i]) > 0.15 || Math.abs(oy[i]) > 0.15 || Math.abs(vx[i]) > 0.05)) moving = true;
      }
      draw();
      if (moving || pointer.inside) raf = requestAnimationFrame(tick);
      else running = false;
    }

    const kick = () => {
      if (reduced) { draw(); return; }
      if (!running) { running = true; raf = requestAnimationFrame(tick); }
    };

    const onMove = e => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const inside = x >= -radius && y >= -radius && x <= r.width + radius && y <= r.height + radius;
      if (!inside && !pointer.inside) return;
      pointer = { x, y, inside: inside && x >= 0 && y >= 0 && x <= r.width && y <= r.height };
      if (inside) kick();
      else { pointer.inside = false; kick(); }
    };
    const onLeave = () => { pointer.inside = false; kick(); };

    readColors();
    build();

    const ro = new ResizeObserver(() => { clearTimeout(ro.t); ro.t = setTimeout(build, 120); });
    ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); });
    io.observe(wrap);
    const onTheme = () => requestAnimationFrame(() => { readColors(); build(); });

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('themechange', onTheme);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(ro.t);
      ro.disconnect(); io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('themechange', onTheme);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps]);

  return (
    <div ref={wrapRef} className={`dotfield ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="dotfield__canvas" />
    </div>
  );
}
