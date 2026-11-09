import { useEffect, useId, useRef, useState } from 'react';
import PixelSprite from './PixelSprite.jsx';

const DEFAULT_ACTIONS = [
  { id: 'walk', label: 'Walk' },
  { id: 'run', label: 'Run' },
  { id: 'hop', label: 'Hop' },
  { id: 'dance', label: 'Dance' },
];

/**
 * One buddy on the floor. Purely presentational for movement (BuddyFloor owns
 * position/mode); owns its own "What now?" menu.
 *
 * state: { x, dir (1 right / -1 left), mode, frame }
 */
export default function Buddy({ name, label, sprite, scale = 3, state, bubble, bubbleSide, bubbleLift = 0, onAction, actions = DEFAULT_ACTIONS, stageWidth }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const wrapRef = useRef(null);
  const menuId = useId();

  const moving = state.mode === 'walk' || state.mode === 'run';
  // Special poses override the standing sprite. A pose can be one grid or a list of frames.
  const pose = sprite.poses?.[state.mode];
  let grid = moving
    ? sprite.walk[state.frame % sprite.walk.length]
    : pose ? (Array.isArray(pose[0]) ? pose[state.frame % pose.length] : pose) : sprite.stand;
  // Blink: swap the eye pixels for the eyelid colour for a moment.
  if (state.blink && sprite.blinkChar) grid = grid.map(row => row.replaceAll('E', sprite.blinkChar));
  const width = sprite.stand[0].length * scale;
  // Keep bubbles and the menu inside the stage: anchor them toward the open side.
  // 'right' = bubble's right edge on the buddy, so it opens to the LEFT (and vice versa).
  // BuddyFloor passes bubbleSide so speech opens away from the other buddy.
  const anchor = bubbleSide || (state.x + width / 2 > stageWidth / 2 ? 'right' : 'left');

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) btnRef.current?.focus({ preventScroll: true });
  };

  // Focus the first item when the menu opens.
  useEffect(() => {
    if (open) menuRef.current?.querySelector('[role="menuitem"]')?.focus({ preventScroll: true });
  }, [open]);

  // Escape / outside click closes the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
    };
    const onDown = e => {
      if (!wrapRef.current?.contains(e.target)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const onMenuKey = e => {
    const items = [...menuRef.current.querySelectorAll('[role="menuitem"]')];
    const i = items.indexOf(document.activeElement);
    let next = null;
    if (e.key === 'ArrowDown') next = items[(i + 1) % items.length];
    else if (e.key === 'ArrowUp') next = items[(i - 1 + items.length) % items.length];
    else if (e.key === 'Home') next = items[0];
    else if (e.key === 'End') next = items[items.length - 1];
    else if (e.key === 'Tab') { setOpen(false); return; }
    if (next) { e.preventDefault(); next.focus(); }
  };

  const choose = id => {
    close();
    onAction(id);
  };

  return (
    <div
      ref={wrapRef}
      className={`buddy buddy--${name} is-${state.mode}${bubble || open ? ' is-talking' : ''}`}
      style={{ transform: `translateX(${Math.round(state.x)}px)` }}
    >
      {bubble && !open && (
        <p
          className={`buddy__bubble buddy__bubble--${anchor}`}
          style={bubbleLift ? { bottom: `calc(100% + ${6 + bubbleLift}px)` } : undefined}
          aria-hidden="true"
        >
          {bubble}
        </p>
      )}

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          className={`buddy__menu buddy__menu--${anchor}`}
          role="menu"
          aria-label={`What now, ${label}?`}
          onKeyDown={onMenuKey}
        >
          <p className="buddy__menu-title" aria-hidden="true">What now?</p>
          {actions.map(a => (
            <button key={a.id} type="button" role="menuitem" className="buddy__menu-item" onClick={() => choose(a.id)}>
              {a.label}
            </button>
          ))}
        </div>
      )}

      <button
        ref={btnRef}
        type="button"
        className="buddy__btn"
        aria-label={`${label}: open actions menu`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span className="buddy__body" style={{ transform: state.dir < 0 ? 'scaleX(-1)' : undefined }}>
          <PixelSprite grid={grid} palette={sprite.palette} scale={scale} className="buddy__sprite" />
        </span>
      </button>
    </div>
  );
}
