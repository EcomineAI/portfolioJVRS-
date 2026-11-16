// Isometric keycap board: one key per skill that has a logo. Hover, click, or press the letter on the key.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PixelLogo from '../PixelLogo.jsx';
import { skillGroups } from '../../data/skills.js';
import { projectBySlug } from '../../data/projects.js';
import { brandColor, logoSrc } from '../../data/techIcons.js';
import { keySound } from './keySound.js';
import './SkillKeys.css';

const LETTERS = 'QWERTYUIOPASDFGHJKLZXCVBNM';
const COLS = 6;

const KEYS = (() => {
  const seen = new Set();
  return skillGroups
    .flatMap(g => g.skills)
    .filter(sk => sk.icon && !seen.has(sk.icon) && seen.add(sk.icon))
    .slice(0, LETTERS.length)
    .map((sk, i) => ({ ...sk, letter: LETTERS[i] }));
})();

export default function SkillKeys() {
  const [active, setActive] = useState(null);
  const [down, setDown] = useState(null);
  const timer = useRef(0);

  const press = useCallback(letter => {
    setActive(letter);
    setDown(letter);
    keySound('down');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setDown(null); keySound('up'); }, 120);
  }, []);

  useEffect(() => {
    const onKey = e => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      if (/^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable) return;
      const k = e.key.toUpperCase();
      if (KEYS.some(x => x.letter === k)) press(k);
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); clearTimeout(timer.current); };
  }, [press]);

  const current = useMemo(() => KEYS.find(k => k.letter === active), [active]);
  const used = current ? current.projects.map(s => projectBySlug[s]?.title).filter(Boolean) : [];

  return (
    <div className="skillkeys">
      <p className="skillkeys__hint">Hint: press a key</p>
      <div className="skillkeys__stage">
        <div className="skillkeys__rig">
          <span className="case__left" aria-hidden="true" />
          <span className="case__front" aria-hidden="true" />
          <svg aria-hidden="true" className="case__cable" viewBox="0 0 110 100" fill="none" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M40 112 V84 H12 V60 H70 V36 H28 V14" stroke="#0d1226" strokeWidth="11" />
            <path d="M40 112 V84 H12 V60 H70 V36 H28 V14" stroke="#3b4770" strokeWidth="5" />
            <rect x="16" y="-4" width="24" height="18" fill="#0d1226" />
            <rect x="19" y="-1" width="18" height="12" fill="#aab6d3" />
          </svg>
        <div className="skillkeys__tilt">
        <span className="case__top" aria-hidden="true" />
        <ul className="skillkeys__board" style={{ '--cols': COLS }} aria-label="Skills, one key each">
          {KEYS.map(sk => {
            const brand = brandColor(sk.icon);
            const label = `${sk.name}: used in ${sk.projects.length} project${sk.projects.length === 1 ? '' : 's'}`;
            return (
              <li key={sk.icon}>
                <button
                  type="button"
                  className={`key${down === sk.letter ? ' is-down' : ''}${active === sk.letter ? ' is-active' : ''}`}
                  style={brand ? { '--brand': brand } : undefined}
                  aria-label={label}
                  onClick={() => press(sk.letter)}
                  onFocus={() => setActive(sk.letter)}
                  onMouseEnter={() => { setActive(sk.letter); keySound('tick'); }}
                >
                  <span className="key__left" aria-hidden="true" />
                  <span className="key__front" aria-hidden="true" />
                  <span className="key__top" aria-hidden="true">
                    <PixelLogo src={logoSrc(sk.icon)} size={48} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        </div>
        </div>
      </div>
      <div className="skillkeys__readout" aria-live="polite" data-filled={current ? 'true' : 'false'}>
        {current ? (
          <>
            <div className="skillkeys__head">
              <span className="skillkeys__name">{current.short || current.name}</span>
              <span className="skillkeys__count">{used.length} {used.length === 1 ? 'project' : 'projects'}</span>
            </div>
            <ul className="tag-list skillkeys__projects" aria-label="Projects using this skill">
              {used.map(t => <li key={t} className="tag">{t}</li>)}
            </ul>
          </>
        ) : (
          <p className="skillkeys__empty">Hover or press a key to see where I used it.</p>
        )}
      </div>
    </div>
  );
}
