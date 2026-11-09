// Spray settings popover (anchored under the header SprayButton).
// Groups: on/off · Mode · Can · Flow · Colour · (touch) · Clear the screen.
import { useEffect, useRef, useState } from 'react';
import { useSpray } from './SprayContext.jsx';

const MODES = [
  { id: 'string', label: 'Silly String', hint: 'Hold on an empty spot to shoot silly string. It drapes over headings and its loose ends swing when you scroll.' },
  { id: 'paint', label: 'Spray Paint', hint: 'Hold to spray paint. Drips run down the page and pool on top of headings.' },
  { id: 'sand', label: 'Sand', hint: 'Hold to pour pixel sand. It piles up on headings and slides off the edges.' },
  { id: 'confetti', label: 'Confetti', hint: 'Hold to throw confetti. It flutters down and settles on ledges.' },
  { id: 'letters', label: 'Letters', hint: 'Hold to spill the letters of my name. They tumble down and land on headings.' },
];
const CANS = [
  { id: 'classic', label: 'Classic' },
  { id: 'graffiti', label: 'Graffiti' },
  { id: 'marker', label: 'Marker' },
  { id: 'crosshair', label: 'Crosshair' },
];
const FLOWS = [
  { id: 'balanced', label: 'Balanced' },
  { id: 'curly', label: 'Curly' },
  { id: 'heavy', label: 'Heavy' },
  { id: 'floaty', label: 'Floaty' },
  { id: 'chaos', label: 'Chaos' },
];
const COLORS = [
  { id: 'section', label: 'By section', swatch: ['var(--world-code)', 'var(--world-create)', 'var(--world-learn)'] },
  { id: 'neon', label: 'Neon', swatch: ['#39ff14', '#ff2bd6', '#00e5ff'] },
  { id: 'ink', label: 'Ink', swatch: ['var(--fg)', 'var(--primary-soft)', 'var(--bg-purple)'] },
  { id: 'pastel', label: 'Pastel', swatch: ['#ffc8dd', '#bde0fe', '#caffbf'] },
];

function useIsTouch() {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setTouch(!!window.matchMedia?.('(any-pointer: coarse)').matches || navigator.maxTouchPoints > 0);
  }, []);
  return touch;
}

/** A labelled group of single-choice chips (aria-pressed buttons). */
function ChipGroup({ label, options, value, onChange, disabled, renderExtra }) {
  return (
    <fieldset className="spray-panel__group" disabled={disabled}>
      <legend className="spray-panel__label">{label}</legend>
      <div className="spray-chips">
        {options.map(o => (
          <button
            key={o.id}
            type="button"
            className={`spray-chip${value === o.id ? ' is-active' : ''}`}
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
          >
            {renderExtra?.(o)}
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function SprayPanel({ id, onClose }) {
  const {
    enabled, setEnabled, mode, setMode, can, setCan, flow, setFlow, color, setColor,
    clear, touchMode, setTouchMode,
  } = useSpray();
  const isTouch = useIsTouch();
  const firstRef = useRef(null);
  const [cleared, setCleared] = useState(false);
  const hint = MODES.find(m => m.id === mode)?.hint;

  useEffect(() => { firstRef.current?.focus(); }, []);
  useEffect(() => {
    if (!cleared) return undefined;
    const t = setTimeout(() => setCleared(false), 1500);
    return () => clearTimeout(t);
  }, [cleared]);

  return (
    <div id={id} className="spray-panel pixel-card" role="dialog" aria-label="Spray settings" data-no-spray="true">
      <div className="spray-panel__row spray-panel__row--head">
        <span className="spray-panel__title" id={`${id}-switch-label`}>Spray settings</span>
        <button
          ref={firstRef}
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-labelledby={`${id}-switch-label`}
          className={`spray-switch${enabled ? ' is-on' : ''}`}
          onClick={() => setEnabled(v => !v)}
        >
          <span className="spray-switch__track" aria-hidden="true"><span className="spray-switch__knob" /></span>
          <span className="spray-switch__state" aria-hidden="true">{enabled ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      <ChipGroup label="Mode" options={MODES} value={mode} onChange={setMode} disabled={!enabled} />
      {hint && (
        <p className="spray-panel__hint">
          {hint}
          {isTouch && ' On touch screens, turn on spray mode first.'}
        </p>
      )}

      <ChipGroup label="Can" options={CANS} value={can} onChange={setCan} disabled={!enabled} />
      <ChipGroup label="Flow" options={FLOWS} value={flow} onChange={setFlow} disabled={!enabled} />
      <ChipGroup
        label="Colour"
        options={COLORS}
        value={color}
        onChange={setColor}
        disabled={!enabled}
        renderExtra={o => (
          <span className="spray-chip__swatches" aria-hidden="true">
            {o.swatch.map((s, i) => <span key={i} className="spray-chip__swatch" style={{ background: s }} />)}
          </span>
        )}
      />

      {isTouch && (
        <div className="spray-panel__row">
          <span className="spray-panel__label" id={`${id}-touch-label`}>Spray mode for touch</span>
          <button
            type="button"
            role="switch"
            aria-checked={touchMode}
            aria-labelledby={`${id}-touch-label`}
            className={`spray-switch${touchMode ? ' is-on' : ''}`}
            onClick={() => setTouchMode(v => !v)}
            disabled={!enabled}
          >
            <span className="spray-switch__track" aria-hidden="true"><span className="spray-switch__knob" /></span>
            <span className="spray-switch__state" aria-hidden="true">{touchMode ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      )}

      <div className="spray-panel__row spray-panel__row--foot">
        <button type="button" className="pixel-btn pixel-btn--outline pixel-btn--sm" onClick={() => { clear(); setCleared(true); }}>
          Clear the screen
        </button>
        <span className="spray-panel__status" role="status">{cleared ? 'Cleared' : ''}</span>
        <button type="button" className="pixel-btn pixel-btn--ghost pixel-btn--sm" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
