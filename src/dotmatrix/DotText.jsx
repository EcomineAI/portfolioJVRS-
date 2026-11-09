// Text rendered as an interactive dot matrix (used for the hero name).
// The real text must be provided separately for screen readers (this is aria-hidden).
import { useMemo } from 'react';
import DotField from './DotField.jsx';

const FONT = '"Press Start 2P"';
const LINE_H = 1.18;

/** Press Start 2P is monospaced: every glyph advance is 1em, so we can size by character count. */
export default function DotText({ lines, className, colorVar = '--fg' }) {
  const longest = Math.max(...lines.map(l => l.length));
  const aspect = (lines.length * LINE_H) / longest;

  const sample = useMemo(() => async (ctx, cols, rows) => {
    try { await document.fonts?.load(`16px ${FONT}`); } catch { /* fall back to whatever loaded */ }
    const size = cols / longest;                 // 1 glyph = 1em wide
    ctx.clearRect(0, 0, cols, rows);
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'top';
    ctx.font = `${size}px ${FONT}, monospace`;
    lines.forEach((line, i) => ctx.fillText(line, 0, i * size * LINE_H + size * 0.06));
  }, [lines, longest]);

  return (
    <DotField
      className={className}
      sample={sample}
      aspect={aspect}
      // ~2–3 dots per font pixel (a Press Start 2P glyph is 8×8 font pixels)
      step={w => Math.max(3, Math.round(w / longest / 18))}
      radius={70}
      colorVar={colorVar}
      minLevel={0.35}
      deps={lines.join('|')}
    />
  );
}
