// Mechanical-keyboard click, synthesized with Web Audio (no audio files).
// "down" = sharp click + low thock, "up" = lighter clack, "tick" = faint hover tick.
let ctx = null;
let noise = null;

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    const len = Math.floor(ctx.sampleRate * 0.05);
    noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx.state === 'closed' ? null : ctx;
}

function burst(c, t, { freq, q, dur, gain }) {
  const src = c.createBufferSource();
  src.buffer = noise;
  src.playbackRate.value = 0.9 + Math.random() * 0.2;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = freq * (0.95 + Math.random() * 0.1); bp.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp).connect(g).connect(c.destination);
  src.start(t); src.stop(t + dur + 0.01);
}

function thock(c, t, { from, to, dur, gain }) {
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t); o.stop(t + dur + 0.01);
}

// Clacky = hard, bright plastic: a sharp click, a high bottom-out clack, very little low end.
export function keySound(kind = 'down') {
  try {
    const c = ensure();
    if (!c || c.state !== 'running') return;
    const t = c.currentTime;
    if (kind === 'down') {
      burst(c, t, { freq: 4800, q: 1.4, dur: 0.02, gain: 0.55 });              // click
      burst(c, t + 0.012, { freq: 2600, q: 1.0, dur: 0.035, gain: 0.5 });      // clack (bottom-out)
      thock(c, t + 0.012, { from: 520, to: 260, dur: 0.035, gain: 0.2 });
    } else if (kind === 'up') {
      burst(c, t, { freq: 5600, q: 1.6, dur: 0.014, gain: 0.3 });
      burst(c, t + 0.006, { freq: 3200, q: 1.0, dur: 0.02, gain: 0.2 });
    } else {
      burst(c, t, { freq: 6000, q: 2, dur: 0.01, gain: 0.07 });
    }
  } catch { /* audio is optional */ }
}
