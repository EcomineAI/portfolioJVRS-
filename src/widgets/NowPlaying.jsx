// "EQUIPPED: <tool>" HUD badge (decorative). Bottom-left on desktop, hidden < 640px.
import { useEffect, useState } from 'react';
import './widgets.css';

const TOOLS = [
  'LM Studio + Gemma 3',
  'VS Code + React',
  'Supabase',
  'Python 3',
  'Vite',
];
const ROTATE_MS = 4000;

export default function NowPlaying() {
  const [index, setIndex] = useState(0);

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

  return (
    <div className="hud-badge" aria-hidden="true" data-no-spray="true">
      <span className="hud-badge__icon">
        <svg viewBox="0 0 8 8" width="16" height="16" shapeRendering="crispEdges" focusable="false">
          <path fill="var(--world-learn)" d="M3 0h2v1H3zM2 1h4v2H2zM1 3h6v2H1zM0 5h8v1H0zM3 6h2v2H3z" />
        </svg>
      </span>
      <span className="hud-badge__label">EQUIPPED:</span>
      <span key={index} className="hud-badge__tool">{TOOLS[index]}</span>
    </div>
  );
}
