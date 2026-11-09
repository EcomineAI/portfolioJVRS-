// Header button (pixel spray can) that opens the spray settings popover.
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSpray } from './SprayContext.jsx';
import SprayPanel from './SprayPanel.jsx';
import './spray.css';

/** 16×16 pixel spray can drawn with rects (crisp edges). */
export function SprayCanIcon(props) {
  return (
    <svg viewBox="0 0 16 16" width="22" height="22" shapeRendering="crispEdges" aria-hidden="true" focusable="false" {...props}>
      <g fill="currentColor">
        <rect x="9" y="0" width="1" height="1" />
        <rect x="11" y="0" width="1" height="1" />
        <rect x="10" y="1" width="1" height="1" />
        <rect x="12" y="2" width="1" height="1" />
        <rect x="9" y="2" width="1" height="1" />
        <rect x="4" y="1" width="3" height="2" />
        <rect x="7" y="2" width="1" height="1" />
        <rect x="3" y="3" width="5" height="2" />
        <rect x="2" y="5" width="1" height="10" />
        <rect x="8" y="5" width="1" height="10" />
        <rect x="2" y="15" width="7" height="1" />
        <rect x="3" y="5" width="5" height="1" />
      </g>
      <rect x="3" y="8" width="5" height="4" fill="var(--world-create)" />
      <rect x="3" y="6" width="1" height="2" fill="currentColor" opacity=".35" />
    </svg>
  );
}

export default function SprayButton() {
  const { panelOpen, setPanelOpen, enabled } = useSpray();
  const btnRef = useRef(null);
  const wrapRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => { setPanelOpen(false); }, [pathname, setPanelOpen]);

  // close on outside click / Escape
  useEffect(() => {
    if (!panelOpen) return undefined;
    const onDown = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setPanelOpen(false);
    };
    const onKey = e => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setPanelOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [panelOpen, setPanelOpen]);

  return (
    <div className="spray-tool" ref={wrapRef} data-no-spray="true">
      <button
        ref={btnRef}
        type="button"
        className={`pixel-btn pixel-btn--outline pixel-btn--icon spray-tool__btn${enabled ? ' is-on' : ''}`}
        aria-label="Spray paint settings"
        aria-expanded={panelOpen}
        aria-controls="spray-panel"
        title="Spray paint"
        onClick={() => setPanelOpen(o => !o)}
      >
        <SprayCanIcon />
      </button>
      {panelOpen && <SprayPanel id="spray-panel" onClose={() => { setPanelOpen(false); btnRef.current?.focus(); }} />}
    </div>
  );
}
