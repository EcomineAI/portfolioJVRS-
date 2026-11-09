// Full-viewport spray canvases + pointer handling (plan §5).
// The canvases never receive pointer events; we listen on window and only
// "take over" a gesture after a 150ms still hold on an empty spot.
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SprayEngine } from './engine.js';
import { useSpray } from './SprayContext.jsx';
import { useSprayTargets } from './useSprayTargets.js';
import './spray.css';

const IGNORE = [
  'a', 'button', 'input', 'textarea', 'select', 'label', 'summary', 'option',
  '[role="button"]', '[role="link"]', '[role="menuitem"]', '[role="slider"]', '[role="switch"]',
  '[data-no-spray]', '[contenteditable]:not([contenteditable="false"])', 'iframe', 'video', 'audio',
].join(',');
const HOLD_MS = 150;
const MOVE_TOLERANCE = 6;   // px of movement allowed before the hold counts as a drag/scroll
const HINT_KEY = 'spray:hint-seen';

const hasSelection = () => {
  const sel = window.getSelection?.();
  return !!sel && !sel.isCollapsed && sel.toString().length > 0;
};

export default function SprayLayer() {
  const { enabled, mode, color, can, flow, clearToken, touchMode } = useSpray();
  const { pathname } = useLocation();
  const paintRef = useRef(null);
  const canRef = useRef(null);
  const engineRef = useRef(null);
  const [spraying, setSpraying] = useState(false);
  const [hasSprayed, setHasSprayed] = useState(false);

  // ---- engine lifecycle ----------------------------------------------------
  useEffect(() => {
    const engine = new SprayEngine(paintRef.current, canRef.current);
    engineRef.current = engine;

    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const applyMotion = () => engine.setReducedMotion(!!mq?.matches);
    applyMotion();
    mq?.addEventListener?.('change', applyMotion);

    let lastY = window.scrollY;
    const onScroll = () => { const y = window.scrollY; engine.onScroll(y - lastY); lastY = y; };
    const onResize = () => engine.resize();
    const onTheme = () => requestAnimationFrame(() => engine.readColors());
    const onVisibility = () => engine.setHidden(document.hidden);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('themechange', onTheme);
    document.addEventListener('visibilitychange', onVisibility);
    onVisibility();

    return () => {
      mq?.removeEventListener?.('change', applyMotion);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('themechange', onTheme);
      document.removeEventListener('visibilitychange', onVisibility);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useSprayTargets(engineRef, pathname);

  useEffect(() => { engineRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { engineRef.current?.setColor(color); }, [color]);
  useEffect(() => { engineRef.current?.setCan(can); }, [can]);
  useEffect(() => { engineRef.current?.setFlow(flow); }, [flow]);
  // Paint belongs to a page: wipe on Clear, on route change and when switched off.
  useEffect(() => { engineRef.current?.clear(); }, [clearToken, pathname]);
  useEffect(() => { if (!enabled) engineRef.current?.clear(); }, [enabled]);

  // ---- pointer handling ----------------------------------------------------
  const touchModeRef = useRef(touchMode);
  touchModeRef.current = touchMode;

  useEffect(() => {
    if (!enabled) return undefined;
    let pending = null;     // { id, x, y, type, timer }
    let active = false;
    let suppressClick = false;

    const finish = (commit) => {
      if (!pending) return;
      clearTimeout(pending.timer);
      if (active) {
        engineRef.current?.end();
        document.documentElement.classList.remove('is-spraying');
        setSpraying(false);
        if (commit) {
          // swallow the click that follows a spray release
          suppressClick = true;
          setTimeout(() => { suppressClick = false; }, 0);
        }
      }
      active = false;
      pending = null;
    };

    const start = () => {
      if (!pending) return;
      if (hasSelection()) { finish(false); return; }
      active = true;
      window.getSelection?.()?.removeAllRanges();
      document.documentElement.classList.add('is-spraying');
      engineRef.current?.begin(pending.x, pending.y);
      setSpraying(true);
      setHasSprayed(true);
    };

    const onDown = (e) => {
      if (pending || !e.isPrimary) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.pointerType === 'touch' && !touchModeRef.current) return;
      if (e.pointerType === 'pen' && !touchModeRef.current && !window.matchMedia?.('(hover: hover)').matches) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      const t = e.target;
      if (!(t instanceof Element) || t.closest(IGNORE)) return;
      // clicks on the page scrollbar
      if (e.clientX >= document.documentElement.clientWidth) return;
      if (hasSelection()) return;
      pending = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, timer: setTimeout(start, HOLD_MS) };
    };

    const onMove = (e) => {
      if (!pending || e.pointerId !== pending.id) return;
      if (!active) {
        // moved before the threshold → it's a drag, text selection or scroll; let it be
        if (Math.hypot(e.clientX - pending.sx, e.clientY - pending.sy) > MOVE_TOLERANCE) finish(false);
        return;
      }
      e.preventDefault();
      if (hasSelection()) window.getSelection().removeAllRanges();
      pending.x = e.clientX; pending.y = e.clientY;
      engineRef.current?.move(e.clientX, e.clientY);
    };

    const onUp = (e) => {
      if (!pending || e.pointerId !== pending.id) return;
      if (active) e.preventDefault();
      finish(true);
    };
    const onCancel = (e) => { if (pending && e.pointerId === pending.id) finish(false); };
    const onClick = (e) => { if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; } };
    const blockWhileActive = (e) => { if (active) e.preventDefault(); };
    const onContextMenu = (e) => { if (pending) e.preventDefault(); };
    const onBlur = () => finish(false);

    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('click', onClick, true);
    window.addEventListener('touchmove', blockWhileActive, { passive: false });
    document.addEventListener('selectstart', blockWhileActive);
    document.addEventListener('dragstart', blockWhileActive);
    window.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('blur', onBlur);

    return () => {
      finish(false);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('click', onClick, true);
      window.removeEventListener('touchmove', blockWhileActive);
      document.removeEventListener('selectstart', blockWhileActive);
      document.removeEventListener('dragstart', blockWhileActive);
      window.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('blur', onBlur);
    };
  }, [enabled]);

  return (
    <>
      <div
        className={`spray-layer${spraying ? ' is-active' : ''}${enabled ? '' : ' is-off'}`}
        aria-hidden="true"
      >
        <canvas ref={paintRef} className="spray-layer__canvas" />
        <canvas ref={canRef} className="spray-layer__canvas spray-layer__canvas--can" />
      </div>
      {enabled && <SprayHint dismissNow={hasSprayed} />}
    </>
  );
}

/** One-time desktop tip. Remembered once dismissed (or once the visitor sprays). */
function SprayHint({ dismissNow }) {
  const [show, setShow] = useState(false);

  const remember = () => { try { localStorage.setItem(HINT_KEY, '1'); } catch { /* ignore */ } };

  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(HINT_KEY) === '1'; } catch { seen = true; }
    const desktop = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
    if (seen || !desktop) return undefined;
    const t = setTimeout(() => setShow(true), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (dismissNow) { remember(); setShow(false); }
  }, [dismissNow]);

  useEffect(() => {
    if (!show) return undefined;
    const t = setTimeout(() => { remember(); setShow(false); }, 14000);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;
  return (
    <div className="spray-hint" role="status" data-no-spray="true">
      <span className="spray-hint__icon" aria-hidden="true">■</span>
      <p className="spray-hint__text">Tip: press and hold anywhere empty to spray paint <span aria-hidden="true">🎨</span></p>
      <button
        type="button"
        className="spray-hint__close"
        onClick={() => { remember(); setShow(false); }}
        aria-label="Dismiss spray paint tip"
      >
        ✕
      </button>
    </div>
  );
}
