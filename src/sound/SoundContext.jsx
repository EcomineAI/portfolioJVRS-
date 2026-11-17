import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createUISFX, cueNames, packNames } from 'uisfx';

const STORAGE_KEY = 'portfolio-jvrs:uisfx';
const DEFAULT_PACK = 'mechanical';
const DEFAULT_VOLUME = 0.55;

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { enabled: true, volume: DEFAULT_VOLUME };
    const parsed = JSON.parse(raw);
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : true,
      volume: typeof parsed.volume === 'number' ? parsed.volume : DEFAULT_VOLUME,
    };
  } catch {
    return { enabled: true, volume: DEFAULT_VOLUME };
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore storage errors */
  }
}

const initialPrefs = loadPrefs();

/** Shared global UI SFX player (caches synthesized buffers per pack:cue). */
export const uisfx = createUISFX({
  pack: DEFAULT_PACK,
  volume: initialPrefs.volume,
  enabled: initialPrefs.enabled,
});

const PRELOAD_MAP = {
  mechanical: ['select', 'toggle-on', 'toggle-off', 'expand', 'collapse', 'undo', 'close'],
  minimal: ['forward', 'back', 'open', 'close'],
  studio: ['open', 'complete', 'copy', 'swipe', 'expand', 'close', 'forward'],
  arcade: ['open', 'close', 'select', 'back', 'toggle-on', 'toggle-off', 'delete'],
  scifi: ['open', 'close', 'select', 'send', 'undo'],
};

/** Play a semantic cue, optionally using a specific uisfx pack without mutating persisted prefs. */
export function playSfx(cue, options = {}) {
  if (!uisfx.isEnabled() || !cueNames.includes(cue)) return null;
  const { pack = DEFAULT_PACK, ...playOpts } = options;
  const targetPack = packNames.includes(pack) ? pack : DEFAULT_PACK;
  if (uisfx.getPack() !== targetPack) uisfx.setPack(targetPack);
  return uisfx.play(cue, playOpts);
}

const SoundContext = createContext(null);

export function SoundProvider({ children }) {
  const [enabled, setEnabledState] = useState(() => uisfx.isEnabled());
  const [pack, setPackState] = useState(() => uisfx.getPack());
  const [volume, setVolumeState] = useState(() => uisfx.getVolume());

  useEffect(() => {
    let unlocked = false;
    const onFirstGesture = () => {
      if (unlocked) return;
      unlocked = true;
      uisfx.unlock().then(async () => {
        for (const [p, cues] of Object.entries(PRELOAD_MAP)) {
          uisfx.setPack(p);
          await uisfx.preload(cues);
        }
        uisfx.setPack(DEFAULT_PACK);
      }).catch(() => {});
      window.removeEventListener('pointerdown', onFirstGesture, true);
      window.removeEventListener('keydown', onFirstGesture, true);
    };

    window.addEventListener('pointerdown', onFirstGesture, { capture: true, passive: true });
    window.addEventListener('keydown', onFirstGesture, { capture: true, passive: true });

    const onClick = (e) => {
      if (!uisfx.isEnabled()) return;
      const el = e.target;
      if (!(el instanceof Element)) return;
      if (el.closest('[data-no-sfx]')) return;

      const sfxEl = el.closest('[data-uisfx]');
      if (sfxEl) {
        const cue = sfxEl.dataset.uisfx;
        const p = sfxEl.closest('[data-uisfx-pack]')?.dataset.uisfxPack || DEFAULT_PACK;
        uisfx.unlock().catch(() => {});
        playSfx(cue, { pack: p });
        return;
      }

      const target = el.closest('a, button, [role="button"], summary');
      if (!target || target.disabled) return;
      if (target.closest('[data-uisfx-press], [data-uisfx-release]')) return;

      const p = target.closest('[data-uisfx-pack]')?.dataset.uisfxPack || DEFAULT_PACK;
      uisfx.unlock().catch(() => {});
      playSfx('select', { pack: p });
    };

    document.addEventListener('click', onClick, true);

    return () => {
      window.removeEventListener('pointerdown', onFirstGesture, true);
      window.removeEventListener('keydown', onFirstGesture, true);
      document.removeEventListener('click', onClick, true);
    };
  }, []);

  const setEnabled = useCallback((next) => {
    const val = Boolean(next);
    uisfx.setEnabled(val);
    setEnabledState(val);
    savePrefs({ enabled: val, volume: uisfx.getVolume() });
  }, []);

  const toggleEnabled = useCallback(() => {
    const next = !uisfx.isEnabled();
    uisfx.setEnabled(next);
    setEnabledState(next);
    savePrefs({ enabled: next, volume: uisfx.getVolume() });
    if (next) {
      uisfx.unlock().then(() => playSfx('toggle-on', { pack: DEFAULT_PACK })).catch(() => {});
    }
  }, []);

  const setPack = useCallback((nextPack) => {
    if (!packNames.includes(nextPack)) return;
    uisfx.setPack(nextPack);
    setPackState(nextPack);
  }, []);

  const setVolume = useCallback((nextVol) => {
    uisfx.setVolume(nextVol);
    const actual = uisfx.getVolume();
    setVolumeState(actual);
    savePrefs({ enabled: uisfx.isEnabled(), volume: actual });
  }, []);

  const value = useMemo(() => ({
    player: uisfx,
    play: playSfx,
    enabled,
    setEnabled,
    toggleEnabled,
    pack,
    setPack,
    volume,
    setVolume,
    packs: packNames,
  }), [enabled, setEnabled, toggleEnabled, pack, setPack, volume, setVolume]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (ctx) return ctx;
  return {
    player: uisfx,
    play: playSfx,
    enabled: uisfx.isEnabled(),
    setEnabled: (v) => uisfx.setEnabled(v),
    toggleEnabled: () => uisfx.setEnabled(!uisfx.isEnabled()),
    pack: uisfx.getPack(),
    setPack: (p) => uisfx.setPack(p),
    volume: uisfx.getVolume(),
    setVolume: (v) => uisfx.setVolume(v),
    packs: packNames,
  };
}
