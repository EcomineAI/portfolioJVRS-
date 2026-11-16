// 3D "skyline": every day is an extruded column on a grid, drawn on a <canvas>.
// No Three.js. Columns are sorted by depth (painter's algorithm) and only the sides that face
// the viewer are drawn, so the view can spin and tilt freely.
// Drag sideways to spin, drag up/down to tilt, double-click to reset.
// Decorative for assistive tech (aria-hidden); the panel provides a summary + table instead.
import { useCallback, useEffect, useRef, useState } from 'react';
import { clampTipX, contributionLabel } from './stats.js';

const RAMP = [0, 0.3, 0.55, 0.8, 1]; // share of --primary mixed into --surface; matches activity.css
const STEPS = 5;                      // build-up animation steps (pixel-choppy)
const STEP_MS = 110;
const MAX_DPR = 2;

const YAW_DEFAULT = -0.45;            // radians; the diagonal look the skyline started with
const TILT_DEFAULT = 0.5;             // 0 = top-down plan, 1 = almost side-on
const TILT_MIN = 0.15;
const TILT_MAX = 0.95;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const SPIN_PER_PX = 0.01;             // radians per dragged pixel
const TILT_PER_PX = 0.005;

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

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

/** Convex hull (monotone chain): the silhouette of a column, used for hover hit-testing and the outline. */
function hull(points) {
  const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) {
    while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  up.pop(); lo.pop();
  return lo.concat(up);
}

export default function Skyline3D({ grid }) {
  const { weeks, max } = grid;
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const st = useRef({
    width: 0, height: 0, progress: 0, hover: null, colors: null, boxes: [],
    yaw: YAW_DEFAULT, tilt: TILT_DEFAULT, zoom: 1, drag: null,
  });
  const [height, setHeight] = useState(320);
  const [tip, setTip] = useState(null);
  const [dragging, setDragging] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const s = st.current;
    if (!canvas || !s.width || !s.colors) return;
    const W = s.width;
    const nW = weeks.length || 53;
    const pad = 12;
    // Compact panel like before; zoom scales the grid inside it (zoomed-in parts are clipped).
    const H = Math.round(clamp(W * 0.3, 220, 340));
    const c = ((W - pad * 2) / (nW + 3.5)) * s.zoom;   // px per grid unit
    const maxH = c * 4.2;                              // tallest column
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    }
    if (H !== s.height) { s.height = H; setHeight(H); }

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2, cy = H * 0.62;
    const cs = Math.cos(s.yaw), sn = Math.sin(s.yaw), tilt = s.tilt;
    // Grid point (w, d) at height hh → screen point. z is depth: larger z is nearer the viewer.
    const project = (w, d, hh) => {
      const x0 = w - nW / 2, z0 = d - 3.5;
      const x1 = x0 * cs - z0 * sn, z1 = x0 * sn + z0 * cs;
      return { x: cx + x1 * c, y: cy + z1 * tilt * c - hh, z: z1 };
    };
    const poly = pts => { ctx.beginPath(); ctx.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) ctx.lineTo(...pts[i]); ctx.closePath(); };
    const t = s.progress / STEPS;
    const inset = 0.12;

    // Collect every column, then paint far to near.
    const cells = [];
    for (let d = 0; d < 7; d++) {
      for (let w = 0; w < nW; w++) {
        const cell = weeks[w]?.[d];
        if (!cell) continue;
        const h = cell.count > 0 ? Math.max(c * 0.4, Math.sqrt(cell.count / (max || 1)) * maxH) * t : 0;
        cells.push({ w, d, cell, h, depth: project(w + 0.5, d + 0.5, 0).z });
      }
    }
    cells.sort((a, b) => a.depth - b.depth);

    const boxes = [];
    for (const { w, d, cell, h } of cells) {
      // Ground corners A B C D (clockwise on the grid) and their tops.
      const g = [
        project(w + inset, d + inset, 0),
        project(w + 1 - inset, d + inset, 0),
        project(w + 1 - inset, d + 1 - inset, 0),
        project(w + inset, d + 1 - inset, 0),
      ];
      const top = g.map(p => ({ x: p.x, y: p.y - h, z: p.z }));
      const [A, B, C, D] = g, [A2, B2, C2, D2] = top;
      const col = s.colors.levels[cell.level];

      if (h > 0) {
        // Sides that face the viewer. Outward normals rotate with the grid; a side is visible when its normal points toward the viewer.
        const sides = [
          { facing: sn, pts: [B, C, C2, B2], tone: col.right },     // +w
          { facing: -sn, pts: [A, D, D2, A2], tone: col.right },    // -w
          { facing: cs, pts: [D, C, C2, D2], tone: col.front },     // +d
          { facing: -cs, pts: [A, B, B2, A2], tone: col.front },    // -d
        ];
        for (const side of sides) {
          if (side.facing <= 0) continue;
          ctx.fillStyle = side.tone;
          poly(side.pts.map(p => [p.x, p.y])); ctx.fill();
        }
      }
      ctx.fillStyle = col.top;
      poly([A2, B2, C2, D2].map(p => [p.x, p.y])); ctx.fill();

      const outline = hull([...top, ...g].map(p => [p.x, p.y]));
      const isHover = s.hover && s.hover.w === w && s.hover.d === d;
      if (isHover) {
        ctx.strokeStyle = s.colors.outline;
        ctx.lineWidth = 2;
        poly(outline); ctx.stroke();
      }
      boxes.push({
        w, d, cell, outline,
        topY: Math.min(...top.map(p => p.y)),
        cx: (A2.x + C2.x) / 2,
      });
    }
    s.boxes = boxes;   // draw order: far to near, so hit-tests go from the end
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

  const showHover = e => {
    const box = hitTest(e);
    const s = st.current;
    const prev = s.hover;
    s.hover = box ? { w: box.w, d: box.d } : null;
    if (prev?.w !== s.hover?.w || prev?.d !== s.hover?.d) draw();
    setTip(box ? { text: contributionLabel(box.cell.count, box.cell.date), x: box.cx, y: box.topY } : null);
  };

  const onDown = e => {
    if (e.button !== undefined && e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const s = st.current;
    s.drag = { x: e.clientX, y: e.clientY, yaw: s.yaw, tilt: s.tilt };
    setDragging(true);
    setTip(null);
  };

  const onMove = e => {
    const s = st.current;
    if (s.drag) {
      const dx = e.clientX - s.drag.x, dy = e.clientY - s.drag.y;
      s.yaw = s.drag.yaw + dx * SPIN_PER_PX;
      s.tilt = clamp(s.drag.tilt - dy * TILT_PER_PX, TILT_MIN, TILT_MAX);
      draw();
      return;
    }
    showHover(e);
  };

  const endDrag = () => {
    st.current.drag = null;
    setDragging(false);
  };

  const onLeave = () => { if (!st.current.drag) { st.current.hover = null; draw(); setTip(null); } };

  const zoomBy = f => {
    const s = st.current;
    s.zoom = clamp(s.zoom * f, ZOOM_MIN, ZOOM_MAX);
    draw();
  };

  // Mouse wheel over the chart zooms (the page doesn't scroll while the cursor is on it).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = e => {
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12);
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  });

  const onReset = () => {
    const s = st.current;
    s.yaw = YAW_DEFAULT;
    s.tilt = TILT_DEFAULT;
    s.zoom = 1;
    s.hover = null;
    setTip(null);
    draw();
  };

  return (
    <div className="skyline" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className={`skyline__canvas${dragging ? ' is-dragging' : ''}`}
        style={{ height }}
        aria-hidden="true"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={onLeave}
        onDoubleClick={onReset}
      />
      <div className="skyline__zoom">
        <button type="button" onClick={() => zoomBy(1.25)} aria-label="Zoom in">+</button>
        <button type="button" onClick={() => zoomBy(1 / 1.25)} aria-label="Zoom out">−</button>
        <button type="button" onClick={onReset} aria-label="Reset view">⟲</button>
      </div>
      <p className="skyline__hint" aria-hidden="true">
        Drag to spin and tilt · scroll or +/− to zoom · double-click to reset
      </p>
      {tip && (
        <div className="activity-tip" style={{ left: clampTipX(tip.x, st.current.width), top: tip.y }} aria-hidden="true">
          {tip.text}
        </div>
      )}
    </div>
  );
}
