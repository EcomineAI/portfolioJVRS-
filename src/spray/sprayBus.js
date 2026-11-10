// Tiny link between the spray engine and the pixel buddies (no React state).
// The engine attaches itself and announces when a spray starts/ends; the buddies
// listen, count paint on their platform and vacuum it up.
let engine = null;
const listeners = new Set();

export const sprayBus = {
  attach(e) { engine = e; },
  detach(e) { if (engine === e) engine = null; },
  /** fn(type: 'start' | 'end', detail: { mode }) → returns an unsubscribe function */
  on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  emit(type, detail) { for (const fn of listeners) fn(type, detail); },
  /** How much paint is inside a box (page coordinates). */
  countIn(box) { return engine ? engine.countIn(box) : 0; },
  /** Suck up paint within r px of (x, y) (page coordinates). Returns how much was removed. */
  vacuum(x, y, r) { return engine ? engine.vacuum(x, y, r) : 0; },
  /** Remove all paint inside a box at once (used with reduced motion). */
  vacuumBox(box) { return engine ? engine.vacuumBox(box) : 0; },
};
