// Sound for the Bug Attack event.
//
// Sound effects are SYNTHESIZED with the Web Audio API (square / triangle / sawtooth
// oscillators + noise, short envelopes): chiptune style, no files to load.
// Music is the 8-bit OST as mp3 files in /public/audio — drop the files in with the names
// in TRACKS (a missing file is simply silent).
// Mute is remembered in localStorage ('bug:sound'). Sound starts ON.

// The whole event runs to ONE track ("HERO" 8-bit, 3:37): BugEvent.jsx uses its playback time as the
// event clock (musicTime) and fires every stage / cinematic on the track's cue points.
export const TRACKS = {
  hero: '/audio/bug-hero.mp3',
  victory: '/audio/bug-victory.mp3',
};

const KEY = 'bug:sound';
let muted = (() => { try { return localStorage.getItem(KEY) === 'off'; } catch { return false; } })();
// no in-page volume: everything follows the SYSTEM volume (the browser always applies it).
// vol stays 1; setVolume() is kept for code that may call it.
let vol = 1;
// MIXER: every sound goes through ONE master gain (mute on/off), at levels normalised so the
// system volume feels the same as any other app. The mp3 is mastered very hot (peaks 0 dB,
// RMS −12 dB), so it sits on its own low bus behind a compressor.
let ctx = null, master = null, sfxBus = null, musicBus = null, noiseBuf = null;
let music = null, musicName = null, duck = 1;
const loops = new Map();
const tracks = new Set();   // every music element this copy created (so ALL of them can be silenced)

// ONE sound engine per page: if an older copy of this module is still playing (Vite hot reload
// while the event was running), silence it — otherwise its old, loud <audio> keeps playing forever.
if (typeof window !== 'undefined' && window.__bugSound) { try { window.__bugSound.kill(); } catch { /* ignore */ } }
function kill() {
  for (const n of [...loops.keys()]) stopLoop(n);
  for (const a of tracks) { try { a.pause(); a.removeAttribute('src'); a.load(); } catch { /* ignore */ } }
  tracks.clear(); music = null; musicName = null;
  try { ctx?.close(); } catch { /* ignore */ }
  ctx = null; master = null; sfxBus = null; musicBus = null;
}
if (typeof window !== 'undefined') window.__bugSound = { kill };
if (import.meta.hot) import.meta.hot.dispose(kill);
const SFX_LEVEL = 0.25;     // effects bus (same loudness as the original mix)
const MUSIC_LEVEL = 0.22;   // music bus (≈ −13 dB): a hot master, kept under the effects
const out = () => (muted ? 0 : vol);
const setGain = (node, v, sec = 0.05) => { if (node && ctx) node.gain.setTargetAtTime(v, ctx.currentTime, Math.max(0.01, sec / 3)); };

export const isMuted = () => muted;
export function setMuted(m) {
  muted = m;
  try { localStorage.setItem(KEY, m ? 'off' : 'on'); } catch { /* ignore */ }
  applyVolume();
}
export const getVolume = () => vol;
/** User volume 0–1 (0 = silent). Applies to music and effects at once. */
export function setVolume(v) {
  vol = Math.min(1, Math.max(0, v));
  applyVolume();
}
function applyVolume() {
  setGain(master, out());
  if (music && !music.bugGain) music.volume = out() * MUSIC_LEVEL * duck;   // fallback without Web Audio
}

/** Create / wake the audio context. Call from a user gesture (the bug button click). */
export function initAudio() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = out();
      master.connect(ctx.destination);
      if (import.meta.env.DEV) {   // dev only: a level meter on the final output (tests read window.__bugAudio)
        const an = ctx.createAnalyser(); an.fftSize = 2048; master.connect(an);
        window.__bugAudio = { ctx, an, rms: () => { const d = new Float32Array(an.fftSize); an.getFloatTimeDomainData(d); let s = 0, pk = 0; for (const x of d) { s += x * x; pk = Math.max(pk, Math.abs(x)); } return { rms: 20 * Math.log10(Math.sqrt(s / d.length) || 1e-9), peak: 20 * Math.log10(pk || 1e-9) }; } };
      }
      sfxBus = ctx.createGain(); sfxBus.gain.value = SFX_LEVEL; sfxBus.connect(master);
      // music: compressor (tames the hot master) → music bus → master
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -24; comp.knee.value = 12; comp.ratio.value = 6; comp.attack.value = 0.005; comp.release.value = 0.2;
      musicBus = ctx.createGain(); musicBus.gain.value = MUSIC_LEVEL * duck;
      comp.connect(musicBus); musicBus.connect(master);
      musicBus.input = comp;
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
  } catch { /* no audio */ }
}

/** One voice: an oscillator (or noise) with a pitch slide and a quick envelope. */
function voice({ type = 'square', f = 440, f2 = null, dur = 0.12, vol = 0.5, delay = 0, noise = false, lp = 0, hp = 0 }, pitch = 1) {
  if (!ctx || muted || vol <= 0) return;
  const t0 = ctx.currentTime + delay;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  let src;
  if (noise) {
    src = ctx.createBufferSource();
    src.buffer = noiseBuf;
  } else {
    src = ctx.createOscillator();
    src.type = type;
    src.frequency.setValueAtTime(f * pitch, t0);
    if (f2) src.frequency.exponentialRampToValueAtTime(Math.max(20, f2 * pitch), t0 + dur);
  }
  let node = src;
  if (lp) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; node.connect(fl); node = fl; }
  if (hp) { const fl = ctx.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = hp; node.connect(fl); node = fl; }
  node.connect(g);
  g.connect(sfxBus);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

const arp = (notes, step = 0.07, extra = {}) => notes.map((f, i) => ({ type: 'square', f, dur: step * 1.4, vol: 0.35, delay: i * step, ...extra }));

/** Every sound effect = a list of voices. */
const SFX = {
  // UI / flow
  start: arp([262, 330, 392, 523, 659], 0.06),
  locked: [{ type: 'square', f: 110, f2: 90, dur: 0.18, vol: 0.4 }, { type: 'square', f: 82, dur: 0.18, vol: 0.3, delay: 0.09 }],
  blip: [{ type: 'square', f: 880, f2: 1320, dur: 0.06, vol: 0.25 }],
  sting: arp([392, 466, 587, 784], 0.09, { type: 'sawtooth', vol: 0.25 }),
  wipe: [{ noise: true, dur: 0.6, vol: 0.25, hp: 800 }, { type: 'sawtooth', f: 200, f2: 1600, dur: 0.6, vol: 0.12 }],
  clear: arp([523, 659, 784, 1047, 784, 1047], 0.08),
  lose: arp([392, 349, 311, 262, 196], 0.12, { type: 'triangle', vol: 0.4 }),
  gameover: arp([196, 185, 175, 165, 147], 0.22, { type: 'triangle', vol: 0.45 }),
  fanfare: [...arp([523, 523, 523, 659, 784], 0.1), ...arp([659, 784, 1047], 0.16).map(v => ({ ...v, delay: v.delay + 0.55, dur: 0.3 }))],
  ding: [{ type: 'square', f: 1568, dur: 0.12, vol: 0.25 }, { type: 'square', f: 2093, dur: 0.15, vol: 0.2, delay: 0.06 }],
  // intro
  flicker: [{ type: 'square', f: 60, dur: 0.05, vol: 0.3 }, { noise: true, dur: 0.04, vol: 0.2, hp: 3000 }],
  alarm: [{ type: 'square', f: 660, dur: 0.22, vol: 0.18 }, { type: 'square', f: 494, dur: 0.22, vol: 0.18, delay: 0.25 }],
  crack: [{ noise: true, dur: 0.18, vol: 0.5, hp: 1500 }, { type: 'square', f: 300, f2: 80, dur: 0.15, vol: 0.2 }],
  rumble: [{ noise: true, dur: 0.4, vol: 0.4, lp: 200 }],
  boom: [{ noise: true, dur: 0.9, vol: 0.8, lp: 600 }, { type: 'sawtooth', f: 120, f2: 30, dur: 0.8, vol: 0.5 }],
  clank: [{ type: 'square', f: 1200, f2: 600, dur: 0.08, vol: 0.3 }, { noise: true, dur: 0.12, vol: 0.3, hp: 2500 }],
  // buddies
  swing: [{ noise: true, dur: 0.08, vol: 0.18, hp: 2000 }],
  hit: [{ type: 'square', f: 300, f2: 120, dur: 0.07, vol: 0.4 }, { noise: true, dur: 0.05, vol: 0.3, lp: 1500 }],
  kick: [{ type: 'square', f: 200, f2: 70, dur: 0.1, vol: 0.5 }, { noise: true, dur: 0.07, vol: 0.4, lp: 1200 }],
  type: Array.from({ length: 6 }, (_, i) => ({ noise: true, dur: 0.02, vol: 0.2, hp: 4000, delay: i * 0.06 })),
  zap: [{ type: 'sawtooth', f: 200, f2: 2000, dur: 0.5, vol: 0.2 }, { noise: true, dur: 0.3, vol: 0.4, hp: 1000, delay: 0.5 }],
  wave: [{ type: 'sawtooth', f: 150, f2: 600, dur: 0.35, vol: 0.25 }],
  coin: [{ type: 'square', f: 988, dur: 0.05, vol: 0.2 }, { type: 'square', f: 1319, dur: 0.12, vol: 0.2, delay: 0.05 }],
  boing: [{ type: 'triangle', f: 200, f2: 700, dur: 0.18, vol: 0.4 }],
  yeet: [{ type: 'square', f: 400, f2: 1200, dur: 0.25, vol: 0.25 }],
  // bugs
  thud: [{ type: 'square', f: 120, f2: 50, dur: 0.14, vol: 0.55 }, { noise: true, dur: 0.1, vol: 0.4, lp: 800 }],
  crunch: [{ noise: true, dur: 0.16, vol: 0.5, lp: 2500 }, { type: 'square', f: 180, f2: 90, dur: 0.1, vol: 0.3 }],
  grab: [{ type: 'square', f: 250, f2: 180, dur: 0.15, vol: 0.3 }],
  spit: [{ noise: true, dur: 0.25, vol: 0.35, hp: 2500 }, { type: 'square', f: 600, f2: 200, dur: 0.15, vol: 0.15 }],
  fire: [{ noise: true, dur: 0.5, vol: 0.45, lp: 1200 }],
  throw: [{ noise: true, dur: 0.2, vol: 0.3, hp: 1500 }],
  shield: [{ type: 'square', f: 220, dur: 0.1, vol: 0.3 }, { type: 'square', f: 330, dur: 0.15, vol: 0.3, delay: 0.08 }],
  blocked: [{ type: 'square', f: 1600, f2: 1200, dur: 0.06, vol: 0.25 }],
  shatter: [{ noise: true, dur: 0.35, vol: 0.5, hp: 2500 }, ...arp([1568, 1175, 880, 659], 0.04, { vol: 0.15 })],
  blink: [{ type: 'sawtooth', f: 1200, f2: 200, dur: 0.15, vol: 0.2 }],
  rollback: arp([784, 659, 523, 392], 0.06, { type: 'triangle', vol: 0.25 }),
  wings: [{ type: 'sawtooth', f: 90, f2: 110, dur: 0.12, vol: 0.06 }],
  bleep: [{ type: 'square', f: 600, dur: 0.05, vol: 0.12 }],
  // page damage
  fall: [{ type: 'square', f: 1200, f2: 150, dur: 0.6, vol: 0.2 }],
  crash: [{ noise: true, dur: 0.5, vol: 0.6, lp: 900 }],
  plink: [{ type: 'square', f: 1760, dur: 0.04, vol: 0.12 }],
  armorcrack: [{ noise: true, dur: 0.12, vol: 0.35, hp: 3000 }, { type: 'square', f: 900, f2: 500, dur: 0.08, vol: 0.2 }],
  // finisher / last stand
  ko: [{ type: 'sawtooth', f: 110, f2: 40, dur: 1.2, vol: 0.5 }, ...arp([262, 330, 392], 0.0, { dur: 1, vol: 0.2 })],
  heartbeat: [{ type: 'triangle', f: 60, f2: 40, dur: 0.12, vol: 0.7 }, { type: 'triangle', f: 55, f2: 38, dur: 0.12, vol: 0.5, delay: 0.18 }],
  roar: [{ type: 'sawtooth', f: 80, f2: 400, dur: 2.4, vol: 0.3 }, { noise: true, dur: 2.4, vol: 0.25, lp: 700 }],
  thunder: [{ noise: true, dur: 0.7, vol: 0.6, lp: 500 }, { type: 'square', f: 1500, f2: 300, dur: 0.1, vol: 0.2 }],
  flash: [{ noise: true, dur: 0.6, vol: 0.5, hp: 1200 }, ...arp([523, 784, 1047, 1568], 0.05)],
  dash: [{ noise: true, dur: 0.15, vol: 0.3, hp: 1800 }, { type: 'sawtooth', f: 400, f2: 1400, dur: 0.15, vol: 0.12 }],
  explode: [{ noise: true, dur: 0.4, vol: 0.55, lp: 1100 }, { type: 'square', f: 200, f2: 40, dur: 0.3, vol: 0.3 }],
  heal: arp([523, 659, 784, 1047, 1319], 0.12, { type: 'triangle', vol: 0.3 }),
  aura: [{ type: 'sawtooth', f: 110, f2: 130, dur: 0.3, vol: 0.08 }],
  vacuum: [{ noise: true, dur: 0.3, vol: 0.12, lp: 600 }],
  // crying, ending
  sad: arp([440, 392, 330, 294, 262], 0.42, { type: 'triangle', vol: 0.22, dur: 0.6 }),
  sob: [{ type: 'triangle', f: 330, f2: 260, dur: 0.16, vol: 0.12 }, { type: 'triangle', f: 300, f2: 240, dur: 0.18, vol: 0.1, delay: 0.2 }],
  clap: [{ noise: true, dur: 0.08, vol: 0.55, hp: 1200 }, { type: 'square', f: 900, dur: 0.04, vol: 0.2 }],
  shine: [{ type: 'triangle', f: 1047, f2: 2093, dur: 0.5, vol: 0.15 }, ...arp([1568, 2093, 2637], 0.08, { vol: 0.1 }).map(v => ({ ...v, delay: v.delay + 0.3 }))],
  silence: [],
  // v6: sky battle, dodges, swarm arrivals
  fsht: [{ noise: true, dur: 0.12, vol: 0.35, hp: 3000 }, { type: 'sawtooth', f: 1800, f2: 300, dur: 0.1, vol: 0.12 }],
  clash: [{ noise: true, dur: 0.5, vol: 0.7, lp: 900 }, { type: 'square', f: 160, f2: 40, dur: 0.4, vol: 0.5 }, { type: 'square', f: 900, f2: 200, dur: 0.12, vol: 0.2 }],
  rain: [{ noise: true, dur: 0.5, vol: 0.06, hp: 4000 }],
  beam: [{ type: 'sawtooth', f: 120, f2: 900, dur: 1.2, vol: 0.25 }, { noise: true, dur: 1.2, vol: 0.2, hp: 1500 }],
  struggle: [{ type: 'sawtooth', f: 180, f2: 220, dur: 0.3, vol: 0.18 }, { noise: true, dur: 0.3, vol: 0.15, lp: 2000 }],
  disintegrate: [{ noise: true, dur: 1.6, vol: 0.4, hp: 2500 }, ...arp([1568, 1319, 1047, 784, 523, 392], 0.2, { type: 'triangle', vol: 0.15 })],
  dodge: [{ noise: true, dur: 0.1, vol: 0.2, hp: 2500 }, { type: 'triangle', f: 600, f2: 1200, dur: 0.1, vol: 0.12 }],
  parry: [{ type: 'square', f: 2093, dur: 0.06, vol: 0.25 }, { type: 'square', f: 2637, dur: 0.1, vol: 0.2, delay: 0.04 }],
  notif: [{ type: 'square', f: 1319, dur: 0.06, vol: 0.2 }, { type: 'square', f: 1760, dur: 0.1, vol: 0.2, delay: 0.07 }],
  warn: [{ type: 'square', f: 1400, dur: 0.05, vol: 0.12 }],
  hatch: [{ type: 'square', f: 400, f2: 900, dur: 0.08, vol: 0.15 }, { noise: true, dur: 0.06, vol: 0.15, hp: 2000 }],
  laser: [{ type: 'sawtooth', f: 900, f2: 860, dur: 0.6, vol: 0.15 }, { type: 'square', f: 450, dur: 0.6, vol: 0.08 }],
};

/** Play a sound effect. `pitch` raises/lowers it (combo hits climb). */
export function sfx(name, pitch = 1) {
  if (!ctx || muted) return;
  for (const v of SFX[name] || []) voice(v, pitch);
}

/** A repeating sound (alarm, heartbeat, wings, aura, vacuum) until stopLoop(name). */
export function loop(name, every) {
  if (loops.has(name)) return;
  sfx(name);
  loops.set(name, setInterval(() => sfx(name), every));
}
export function stopLoop(name) { clearInterval(loops.get(name)); loops.delete(name); }

/** Switch the music track (crossfade). Missing files are silent. */
export function playMusic(name) {
  if (musicName === name) return;
  stopMusic(0.6);
  musicName = name;
  const src = TRACKS[name];
  if (!src) return;
  const a = new Audio(src);
  a.loop = false;
  tracks.add(a);
  a.addEventListener('error', () => { if (music === a) music = null; });
  if (ctx && musicBus) {
    // through the mixer: element at full volume, level set by the gains (obeys the slider + mute)
    try {
      const node = ctx.createMediaElementSource(a);
      const g = ctx.createGain();
      g.gain.value = 0;
      node.connect(g); g.connect(musicBus.input);
      a.bugGain = g;
      setGain(g, 1, 0.6);
    } catch { a.bugGain = null; }
  }
  if (!a.bugGain) a.volume = out() * MUSIC_LEVEL * duck;
  a.play().catch(() => { /* not available */ });
  music = a;
}
/** Jump the current track to `t` seconds (dev tests start mid-show). */
export function seekMusic(t) {
  const a = music;
  if (!a) return;
  const go = () => { try { a.currentTime = t; } catch { /* ignore */ } };
  if (a.readyState >= 1) go(); else a.addEventListener('loadedmetadata', go, { once: true });
}
/** Playback position of the current track in seconds, or null when no track is actually playing. */
export function musicTime() {
  if (!music || music.paused || music.readyState < 2 || !Number.isFinite(music.currentTime)) return null;
  return music.currentTime;
}
export function stopMusic(sec = 0.4) {
  const a = music;
  music = null; musicName = null;
  if (!a) return;
  if (a.bugGain) setGain(a.bugGain, 0, sec); else a.volume = 0;
  setTimeout(() => { a.pause(); tracks.delete(a); try { a.bugGain?.disconnect(); } catch { /* ignore */ } }, sec * 1000 + 50);
}
/** Quieter music during cinematics. */
export function duckMusic(level) {
  duck = level;
  setGain(musicBus, MUSIC_LEVEL * level, 0.4);
  if (music && !music.bugGain) music.volume = out() * MUSIC_LEVEL * duck;
}

/** Tab hidden / shown. */
export function pauseAll() { ctx?.suspend?.(); music?.pause(); }
export function resumeAll() { ctx?.resume?.(); music?.play().catch(() => {}); }
/** Event over: silence everything. */
export function stopAll() {
  for (const n of [...loops.keys()]) stopLoop(n);
  stopMusic(0.8);
  // anything else still playing (a track that never got its fade-out) stops too
  setTimeout(() => { for (const a of tracks) if (a !== music) { a.pause(); tracks.delete(a); } }, 900);
}
