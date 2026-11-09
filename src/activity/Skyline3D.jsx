// 3D "skyline": every day is an extruded column on an axonometric grid, drawn on a <canvas>.
// No Three.js — painter's algorithm (back-to-front) is enough for boxes on a grid.
// Decorative for assistive tech (aria-hidden); the panel provides a summary + table instead.
import { useCallback, useEffect, useRef, useState } from 'react';
import { clampTipX, contributionLabel } from './stats.js';

const RAMP = [0, 0.3, 0.55, 0.8, 1]; // share of --primary mixed into --surface; matches activity.css
const STEPS = 5;                      // build-up animation steps (pixel-choppy)
const STEP_MS = 110;
const MAX_DPR = 2;

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Resolve any CSS color string to [r,g,b] by painting it on a 1×1 canvas. */
function toRGB(color, fallback = [128, 128, 128]) {
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.fillStyle = `rgb(${fallback.join(',')})`;
    x.fillStyle = color; // ignored if the browser can't parse it
    x.fillRect(0, 0, 1, 1);
    const [r, g, b] = x.getImageData(0, 0, 1, 1).data;
    return [r, g, b];
  } catch { return fallback; }
}
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const css = ([r, g, b]) => `rgb(${r},${g},${b})`;

function readColors(el) {
  const cs = getComputedStyle(el);
  const v = name => cs.getPropertyValue(name).trim();
  const surface = toRGB(v('--surface'), [221, 226, 240]);
  const primary = toRGB(v('--primary'), [46, 82, 230]);
  const fg = toRGB(v('--fg'), [26, 36, 71]);
  return {
    levels: RAMP.map(t => {
      const base = mix(surface, primary, t);
      return { top: css(base), front: css(mix(base, [0, 0, 0], 0.22)), right: css(mix(base, [0, 0, 0], 0.4)) };
    }),
    outline: css(fg),
  };
}

/** Point-in-polygon (ray casting). */
function inside(px, py, pts) {
  let hit = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

export default function Skyline3D({ grid }) {
  const { weeks, max } = grid;
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const st = useRef({ width: 0, height: 0, progress: 0, hover: null, colors: null, boxes: [] });
  const [height, setHeight] = useState(320);
  const [tip, setTip] = useState(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const s = st.current;
    if (!canvas || !s.width || !s.colors) return;
    const W = s.width;
    const nW = weeks.length || 53;
    const pad = 12;
    const c = (W - pad * 2) / (nW + 3.5);   // one grid unit in CSS px
    const SLOPE = 0.12;                      // how much each week steps down (flatter = shorter panel)
    const maxH = c * 4.2;
    const H = Math.ceil(pad * 2 + maxH + c * (nW * SLOPE + 3.5));
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    }
    if (H !== s.height) { s.height = H; setHeight(H); }

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const ox = pad + 3.5 * c, oy = pad + maxH;
    // weeks run right & slightly down; weekdays run toward the viewer (left & down)
    const P = (w, d) => [ox + w * c - d * c * 0.5, oy + w * c * SLOPE + d * c * 0.5];
    const t = s.progress / STEPS;
    const inset = 0.12;
    const boxes = [];

    // Painter's order: back row (Sun) first, and within a row left (old) to right (new).
    for (let d = 0; d < 7; d++) {
      for (let w = 0; w < nW; w++) {
        const cell = weeks[w]?.[d];
        if (!cell) continue;
        const A = P(w + inset, d + inset), B = P(w + 1 - inset, d + inset);
        const C = P(w + 1 - inset, d + 1 - inset), D = P(w + inset, d + 1 - inset);
        const h = cell.count > 0 ? Math.max(c * 0.4, Math.sqrt(cell.count / (max || 1)) * maxH) * t : 0;
        const up = ([x, y]) => [x, y - h];
        const A2 = up(A), B2 = up(B), C2 = up(C), D2 = up(D);
        const col = s.colors.levels[cell.level];
        const poly = pts => { ctx.beginPath(); ctx.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) ctx.lineTo(...pts[i]); ctx.closePath(); };

        if (h > 0) {
          ctx.fillStyle = col.right; poly([B, C, C2, B2]); ctx.fill();
          ctx.fillStyle = col.front; poly([D, C, C2, D2]); ctx.fill();
        }
        ctx.fillStyle = col.top; poly([A2, B2, C2, D2]); ctx.fill();

        const isHover = s.hover && s.hover.w === w && s.hover.d === d;
        const outline = h > 0 ? [A2, B2, B, C, D, D2] : [A, B, C, D];
        if (isHover) {
          ctx.strokeStyle = s.colors.outline;
          ctx.lineWidth = 2;
          poly(outline); ctx.stroke();
        }
        boxes.push({ w, d, cell, outline, topY: Math.min(A2[1], B2[1]), cx: (A2[0] + C2[0]) / 2 });
      }
    }
    s.boxes = boxes;
  }, [weeks, max]);

  // Size + colors: ResizeObserver and the site's 'themechange' event.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const s = st.current;
    s.colors = readColors(wrap);
    s.width = wrap.clientWidth;
    const ro = 'ResizeObserver' in window ? new ResizeObserver(() => { s.width = wrap.clientWidth; draw(); }) : null;
    ro?.observe(wrap);
    // themechange fires before styles settle in some browsers; read on the next frame.
    const onTheme = () => requestAnimationFrame(() => { s.colors = readColors(wrap); draw(); });
    window.addEventListener('themechange', onTheme);
    draw();
    return () => { ro?.disconnect(); window.removeEventListener('themechange', onTheme); };
  }, [draw]);

  // Build-up animation the first time the skyline scrolls into view.
  useEffect(() => {
    const s = st.current;
    const wrap = wrapRef.current;
    if (s.progress >= STEPS) { draw(); return; }
    if (reducedMotion() || !('IntersectionObserver' in window)) { s.progress = STEPS; draw(); return; }
    let timer;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const tick = () => {
        s.progress += 1;
        draw();
        if (s.progress < STEPS) timer = setTimeout(tick, STEP_MS);
      };
      tick();
    }, { threshold: 0.25 });
    obs.observe(wrap);
    return () => { obs.disconnect(); clearTimeout(timer); };
  }, [draw]);

  const hitTest = e => {
    const canvas = canvasRef.current;
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const boxes = st.current.boxes;
    for (let i = boxes.length - 1; i >= 0; i--) { // front-most first
      if (inside(x, y, boxes[i].outline)) return boxes[i];
    }
    return null;
  };

  const onMove = e => {
    const box = hitTest(e);
    const s = st.current;
    const prev = s.hover;
    s.hover = box ? { w: box.w, d: box.d } : null;
    if (prev?.w !== s.hover?.w || prev?.d !== s.hover?.d) draw();
    setTip(box ? { text: contributionLabel(box.cell.count, box.cell.date), x: box.cx, y: box.topY } : null);
  };
  const onLeave = () => { st.current.hover = null; draw(); setTip(null); };

  return (
    <div className="skyline" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className="skyline__canvas"
        style={{ height }}
        aria-hidden="true"
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={onLeave}
      />
      {tip && (
        <div className="activity-tip" style={{ left: clampTipX(tip.x, st.current.width), top: tip.y }} aria-hidden="true">
          {tip.text}
        </div>
      )}
    </div>
  );
}
