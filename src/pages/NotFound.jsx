// 404 — "Game over" screen. Countdown is decorative; nothing auto-redirects.
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PixelButton } from '../components/ui/index.jsx';
import './NotFound.css';

export default function NotFound() {
  const { pathname } = useLocation();
  const [count, setCount] = useState(9);

  useEffect(() => {
    if (count <= 0) return;
    const id = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [count]);

  useEffect(() => {
    const prev = document.title;
    document.title = 'Game over · Page not found';
    return () => { document.title = prev; };
  }, []);

  return (
    <section className="container section game-over" aria-labelledby="game-over-title">
      <div className="game-over__screen pixel-card" data-spray-surface="true">
        <p className="game-over__code" aria-hidden="true">404</p>
        <h1 id="game-over-title" className="game-over__title">Game over</h1>
        <p className="game-over__line prose">This page doesn't exist (yet).</p>
        <p className="game-over__path">
          <span className="sr-only">Requested address: </span>
          <code>{pathname}</code>
        </p>

        <p className="game-over__continue" aria-hidden="true">
          <span className={count > 0 ? 'game-over__blink' : undefined}>Continue?</span>
          <span className="game-over__count">{count}</span>
        </p>

        <div className="game-over__actions">
          <PixelButton to="/">Continue → Home</PixelButton>
          <PixelButton to="/projects" variant="outline">Projects</PixelButton>
        </div>
        {count === 0 && <p className="game-over__hint">No coins left. Press a button above to keep playing.</p>}
      </div>
    </section>
  );
}
