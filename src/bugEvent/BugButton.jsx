// Header button (pixel green bug) that starts / stops the Bug Attack event.
import { useEffect, useRef, useState } from 'react';
import PixelSprite from '../buddies/PixelSprite.jsx';
import { BUG_ICON, BUG_ICON_PALETTE } from './bugSprites.js';
import { initAudio } from './sound.js';
import './bugEvent.css';

export default function BugButton({ onHide }) {
  const [running, setRunning] = useState(false);
  const holdTimer = useRef(null);
  const held = useRef(false);

  useEffect(() => {
    const on = e => setRunning(!!e.detail?.running);
    window.addEventListener('bugevent:state', on);
    return () => window.removeEventListener('bugevent:state', on);
  }, []);

  const startHold = () => {
    if (!onHide || running) return;
    held.current = false;
    holdTimer.current = setTimeout(() => {
      held.current = true;
      onHide();
    }, 700);
  };
  const cancelHold = () => clearTimeout(holdTimer.current);

  return (
    <button
      type="button"
      className={`pixel-btn pixel-btn--outline pixel-btn--icon bug-btn${running ? ' is-on' : ''}`}
      data-no-sfx="true"
      aria-label={running ? 'Retreat from the bug attack' : 'Start a bug attack (hold to hide)'}
      aria-pressed={running}
      title={running ? 'Retreat! (ends the bug attack)' : 'Bug attack! (hold to hide)'}
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      onClick={() => {
        if (held.current) { held.current = false; return; }
        initAudio();
        window.dispatchEvent(new CustomEvent('bugevent:toggle'));
      }}
    >
      <PixelSprite grid={BUG_ICON} palette={BUG_ICON_PALETTE} scale={2} />
    </button>
  );
}
