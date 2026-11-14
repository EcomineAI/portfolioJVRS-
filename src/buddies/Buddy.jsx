import { useEffect, useId, useRef, useState } from 'react';
import PixelSprite from './PixelSprite.jsx';
import { accessories, emotes } from './sprites.js';

/** Replace face rows of a grid with an expression (only inside the face columns). */
export function applyFace(grid, face, [c0, c1]) {
  if (!face) return grid;
  return grid.map((row, r) => {
    const over = face[r];
    if (!over) return row;
    return row.slice(0, c0) + over.slice(c0, c1 + 1) + row.slice(c1 + 1);
  });
}

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
 * state: { dir (1 right / -1 left), mode, frame, … } · pos: { x, y } page position of the feet
 */
export default function Buddy({ name, label, sprite, scale = 3, state, pos, bubble, bubbleSide, bubbleLift = 0, onAction, onDrag, actions = DEFAULT_ACTIONS, stageWidth, costumes, costumeId, onCostume }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('main');          // 'main' | 'costumes'
  const [menuDown, setMenuDown] = useState(false);   // open below when there's no room above (sticky header)
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const wrapRef = useRef(null);
  const menuId = useId();
  // Dragging: press and move more than a few px → onDrag('start' | 'move' | 'end', point).
  // A press without moving is still a normal click (opens the menu).
  const drag = useRef(null);
  const skipClick = useRef(false);
  const pagePoint = e => ({ x: e.clientX + window.scrollX, y: e.clientY + window.scrollY, t: e.timeStamp });
  const onPointerDown = e => {
    if (!onDrag || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, active: false };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  };
  const onPointerMove = e => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.active) {
      if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return;
      d.active = true;
      setOpen(false);
      setView('main');
      document.documentElement.classList.add('is-grabbing-buddy');
      onDrag('start', pagePoint(e));
    }
    e.preventDefault();
    onDrag('move', pagePoint(e));
  };
  const onPointerEnd = e => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.active) return;
    document.documentElement.classList.remove('is-grabbing-buddy');
    skipClick.current = true;                       // the click that follows a drag must not open the menu
    setTimeout(() => { skipClick.current = false; }, 0);
    onDrag('end', pagePoint(e));
  };

  const moving = state.mode === 'walk' || state.mode === 'run' || state.mode === 'jump'
    || (state.mode === 'vacuum' && !sprite.poses?.vacuum);   // June Vic runs while vacuuming
  const lifted = state.mode === 'held' || state.mode === 'fall' || state.mode === 'vacuum';
  // Special poses override the standing sprite. A pose can be one grid or a list of frames.
  const pose = sprite.poses?.[state.mode];
  let grid = moving
    ? sprite.walk[state.frame % sprite.walk.length]
    : pose ? (Array.isArray(pose[0]) ? pose[state.frame % pose.length] : pose) : sprite.stand;
  // Expression (not on special poses like nap/laptop, which have their own eyes)
  if (state.face && sprite.faces?.[state.face] && (!pose || state.mode === 'wave' || lifted)) {
    grid = applyFace(grid, sprite.faces[state.face], sprite.faceCols);
  }
  // Blink: swap the eye pixels for the eyelid colour for a moment.
  if (state.blink && sprite.blinkChar) grid = grid.map(row => row.replaceAll('E', sprite.blinkChar));
  const activeCostume = costumes?.find(c => c.id === costumeId) || costumes?.[0];
  const palette = activeCostume?.palette || sprite.palette;
  const hat = activeCostume?.hat && accessories[activeCostume.hat];
  if (activeCostume?.spikyHair) {
    grid = grid.map((r, i) => (i === 0 ? '..H.HH.HH.HH.H..' : i === 1 ? '..HHHHHHHHHHHH..' : r));
  }
  const emote = state.emote && emotes[state.emote];
  const width = sprite.stand[0].length * scale;
  // Keep bubbles and the menu inside the stage: anchor them toward the open side.
  // 'right' = bubble's right edge on the buddy, so it opens to the LEFT (and vice versa).
  // BuddyFloor passes bubbleSide so speech opens away from the other buddy.
  const anchor = bubbleSide || (pos.x + width / 2 > stageWidth / 2 ? 'right' : 'left');

  const close = (refocus = true) => {
    setOpen(false);
    setView('main');
    if (refocus) btnRef.current?.focus({ preventScroll: true });
  };

  // Focus the first item when the menu opens or switches views.
  useEffect(() => {
    if (open) menuRef.current?.querySelector('[role="menuitem"], [role="menuitemradio"]')?.focus({ preventScroll: true });
  }, [open, view]);

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
    const items = [...menuRef.current.querySelectorAll('[role="menuitem"], [role="menuitemradio"]')];
    const i = items.indexOf(document.activeElement);
    let next = null;
    if (e.key === 'ArrowDown') next = items[(i + 1) % items.length];
    else if (e.key === 'ArrowUp') next = items[(i - 1 + items.length) % items.length];
    else if (e.key === 'Home') next = items[0];
    else if (e.key === 'End') next = items[items.length - 1];
    else if (e.key === 'Tab') { setOpen(false); setView('main'); return; }
    if (next) { e.preventDefault(); next.focus(); }
  };

  const choose = id => {
    if (id === 'costume' && costumes?.length) {
      setView('costumes');
      return;
    }
    close();
    onAction(id);
  };

  return (
    <div
      ref={wrapRef}
      className={`buddy buddy--${name} is-${state.mode}${bubble || open ? ' is-talking' : ''}${state.gulp ? ' is-gulp' : ''}`}
      style={{ transform: `translate(${Math.round(pos.x)}px, ${Math.round(pos.y)}px)` }}
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
          className={`buddy__menu buddy__menu--${anchor}${menuDown ? ' buddy__menu--down' : ''}`}
          role="menu"
          aria-label={view === 'costumes' ? `Wardrobe, ${label}` : `What now, ${label}?`}
          onKeyDown={onMenuKey}
        >
          <p className="buddy__menu-title" aria-hidden="true">
            {view === 'costumes' ? 'Wardrobe' : 'What now?'}
          </p>
          {view === 'costumes' ? (
            <>
              {costumes.map(c => {
                const active = c.id === activeCostume?.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    className={`buddy__menu-item${active ? ' is-active' : ''}`}
                    onClick={() => {
                      close();
                      onCostume?.(c.id);
                    }}
                  >
                    {c.label}{active ? ' ✓' : ''}
                  </button>
                );
              })}
              <button
                type="button"
                role="menuitem"
                className="buddy__menu-item buddy__menu-back"
                onClick={() => setView('main')}
              >
                ◀ Back
              </button>
            </>
          ) : (
            actions.map(a => (
              <button key={a.id} type="button" role="menuitem" className="buddy__menu-item" onClick={() => choose(a.id)}>
                {a.label}
              </button>
            ))
          )}
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
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClick={() => {
          if (skipClick.current) { skipClick.current = false; return; }
          if (open) { close(); return; }
          const top = wrapRef.current?.getBoundingClientRect().top ?? 999;
          const header = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
          setMenuDown(top - header < 240);
          setOpen(true);
        }}
      >
        <span
          className="buddy__body"
          style={{ transform: `${lifted && state.tilt ? `rotate(${state.tilt.toFixed(1)}deg) ` : ''}${state.swell ? `scale(${(1 + state.swell).toFixed(3)}) ` : ''}${state.dir < 0 ? 'scaleX(-1)' : ''}` || undefined }}
        >
          {hat && (
            <span className="buddy__hat" aria-hidden="true">
              <PixelSprite grid={hat.grid} palette={hat.palette} scale={scale} />
            </span>
          )}
          <PixelSprite grid={grid} palette={palette} scale={scale} className="buddy__sprite" />
        </span>
        {emote && (
          <span className={`buddy__emote buddy__emote--${state.emote}`} key={state.emoteId} aria-hidden="true">
            <PixelSprite grid={emote.grid} palette={emote.palette} scale={4} />
          </span>
        )}
      </button>
    </div>
  );
}
