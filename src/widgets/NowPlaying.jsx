// HUD badge (decorative). Bottom-left on desktop, hidden < 640px.
// Normally "EQUIPPED: <tool>"; when a pixel buddy does something it flips to
// "JUNE VIC: prompting on the laptop" for a few seconds, then goes back.
import { useEffect, useState } from 'react';
import { buddyBus } from '../buddies/buddyBus.js';
import './widgets.css';

const TOOLS = [
  'LM Studio + Gemma 3',
  'VS Code + React',
  'Supabase',
  'Python 3',
  'Vite',
];
const ROTATE_MS = 4000;
const STATUS_MS = 4500;

export default function NowPlaying() {
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState(null);   // { who, what, id }

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let timer = 0;
    const startStop = () => {
      clearInterval(timer);
      timer = 0;
      if (mq?.matches || document.hidden) return;
      timer = setInterval(() => setIndex(i => (i + 1) % TOOLS.length), ROTATE_MS);
    };
    startStop();
    mq?.addEventListener?.('change', startStop);
    document.addEventListener('visibilitychange', startStop);
    return () => {
      clearInterval(timer);
      mq?.removeEventListener?.('change', startStop);
      document.removeEventListener('visibilitychange', startStop);
    };
  }, []);

  // Buddy status: show the latest one, clear it after a moment
  useEffect(() => {
    let timer = 0;
    const off = buddyBus.on(s => {
      if (!s) return;
      clearTimeout(timer);
      setStatus({ ...s, id: performance.now() });
      timer = setTimeout(() => setStatus(null), STATUS_MS);
    });
    return () => { off(); clearTimeout(timer); };
  }, []);

  const buddy = status != null;
  return (
    <div className="hud-badge" aria-hidden="true" data-no-spray="true" data-buddy={buddy || undefined}>
      <span className="hud-badge__icon">
        {buddy ? (
          <svg viewBox="0 0 8 8" width="16" height="16" shapeRendering="crispEdges" focusable="false">
            {/* speech bubble */}
            <path fill="var(--primary-soft)" d="M1 0h6v1H1zM0 1h8v4H0zM1 5h6v1H1zM2 6h2v1H2zM2 7h1v1H2z" />
            <path fill="var(--ink)" d="M2 2h1v2H2zM4 2h1v2H4zM6 2h1v2H6z" />
          </svg>
        ) : (
          <svg viewBox="0 0 8 8" width="16" height="16" shapeRendering="crispEdges" focusable="false">
            <path fill="var(--world-learn)" d="M3 0h2v1H3zM2 1h4v2H2zM1 3h6v2H1zM0 5h8v1H0zM3 6h2v2H3z" />
          </svg>
        )}
      </span>
      <span className="hud-badge__label">{buddy ? `${status.who.toUpperCase()}:` : 'EQUIPPED:'}</span>
      <span key={buddy ? status.id : `tool-${index}`} className="hud-badge__tool">
        {buddy ? status.what : TOOLS[index]}
      </span>
    </div>
  );
}
