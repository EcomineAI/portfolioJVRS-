// Spray settings shared by the header button/panel and the canvas layer (plan §5).
// Exports: SprayProvider, useSpray() -> { enabled, setEnabled, mode, setMode, can, setCan,
//   flow, setFlow, color, setColor, panelOpen, setPanelOpen, clearToken, clear, touchMode, setTouchMode }
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CANS, FLOWS, MODES, PALETTES } from './engine.js';

const SprayContext = createContext(null);

const KEYS = { enabled: 'spray:enabled', mode: 'spray:mode', can: 'spray:can', flow: 'spray:flow', color: 'spray:palette' };

function load(key, fallback, allowed) {
  try {
    const v = localStorage.getItem(key);
    if (v != null && (!allowed || allowed.includes(v))) return v;
  } catch { /* storage blocked */ }
  return fallback;
}
function save(key, value) {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

export function SprayProvider({ children }) {
  const [enabled, setEnabled] = useState(() => load(KEYS.enabled, 'on', ['on', 'off']) === 'on');
  const [mode, setMode] = useState(() => load(KEYS.mode, 'string', MODES));
  const [can, setCan] = useState(() => load(KEYS.can, 'classic', Object.keys(CANS)));
  const [flow, setFlow] = useState(() => load(KEYS.flow, 'balanced', Object.keys(FLOWS)));
  const [color, setColor] = useState(() => load(KEYS.color, 'section', Object.keys(PALETTES)));
  const [panelOpen, setPanelOpen] = useState(false);
  const [clearToken, setClearToken] = useState(0);
  // Touch spraying is opt-in per visit so touch scrolling always works by default.
  const [touchMode, setTouchMode] = useState(false);

  useEffect(() => save(KEYS.enabled, enabled ? 'on' : 'off'), [enabled]);
  useEffect(() => save(KEYS.mode, mode), [mode]);
  useEffect(() => save(KEYS.can, can), [can]);
  useEffect(() => save(KEYS.flow, flow), [flow]);
  useEffect(() => save(KEYS.color, color), [color]);

  const clear = useCallback(() => setClearToken(t => t + 1), []);

  const value = useMemo(() => ({
    enabled, setEnabled, mode, setMode, can, setCan, flow, setFlow, color, setColor,
    panelOpen, setPanelOpen, clearToken, clear, touchMode, setTouchMode,
  }), [enabled, mode, can, flow, color, panelOpen, clearToken, clear, touchMode]);

  return <SprayContext.Provider value={value}>{children}</SprayContext.Provider>;
}

export function useSpray() {
  const ctx = useContext(SprayContext);
  if (!ctx) throw new Error('useSpray must be used inside <SprayProvider>');
  return ctx;
}
