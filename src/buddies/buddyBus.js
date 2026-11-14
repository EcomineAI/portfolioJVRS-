// Tiny link between the pixel buddies and the HUD badge (no React state).
// BuddyWorld announces what a buddy is doing; the badge shows it for a moment.
const listeners = new Set();

export const buddyBus = {
  /** fn({ who: 'June Vic' | 'Claude', what: string }) → returns an unsubscribe function */
  on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  emit(status) { for (const fn of listeners) fn(status); },
};

export const BUDDY_NAME = { vic: 'June Vic', claude: 'Claude' };

/** Human wording for an action key, per buddy. */
export const ACTION_STATUS = {
  walk: 'taking a walk',
  run: { vic: 'going for a run', claude: 'scuttling around' },
  hop: 'hopping about',
  dance: 'busting a move',
  wave: 'waving hello',
  wiggle: 'wiggling',
  nap: 'napping (Z z z)',
  laptop: { vic: 'prompting on the laptop', claude: 'typing on the laptop' },
  chase: 'chasing Claude',
  vacuum: 'vacuuming the paint',
  talk: 'chatting with the other buddy',
  held: 'being picked up!',
  roamOn: 'exploring the site',
  roamOff: 'heading back to the floor',
};

export function statusFor(key, action) {
  const s = ACTION_STATUS[action];
  if (!s) return null;
  return { who: BUDDY_NAME[key], what: typeof s === 'string' ? s : s[key] };
}
