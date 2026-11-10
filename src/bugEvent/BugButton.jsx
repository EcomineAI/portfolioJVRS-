// Header button (pixel green bug) that starts / stops the Bug Attack event.
import { useEffect, useState } from 'react';
import PixelSprite from '../buddies/PixelSprite.jsx';
import { BUG_ICON, BUG_ICON_PALETTE } from './bugSprites.js';
import { initAudio } from './sound.js';
import './bugEvent.css';

export default function BugButton() {
  const [running, setRunning] = useState(false);
  useEffect(() => {
    const on = e => setRunning(!!e.detail?.running);
    window.addEventListener('bugevent:state', on);
    return () => window.removeEventListener('bugevent:state', on);
  }, []);

  return (
    <button
      type="button"
      className={`pixel-btn pixel-btn--outline pixel-btn--icon bug-btn${running ? ' is-on' : ''}`}
      aria-label={running ? 'Retreat from the bug attack' : 'Start a bug attack (just for fun)'}
      aria-pressed={running}
      title={running ? 'Retreat! (ends the bug attack)' : 'Bug attack!'}
      onClick={() => { initAudio(); window.dispatchEvent(new CustomEvent('bugevent:toggle')); }}
    >
      <PixelSprite grid={BUG_ICON} palette={BUG_ICON_PALETTE} scale={2} />
    </button>
  );
}
