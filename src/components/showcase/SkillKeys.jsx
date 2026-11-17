// Isometric keycap board: one key per skill that has a logo. Click a key (or press its letter) to summon
// the description box under the board; click the same key again, or press Esc, to dismiss it.
import { useEffect, useMemo, useRef, useState } from 'react';
import PixelLogo from '../PixelLogo.jsx';
import { skillGroups } from '../../data/skills.js';
import { projectBySlug } from '../../data/projects.js';
import { brandColor, logoSrc } from '../../data/techIcons.js';
import { keySound } from './keySound.js';
import './SkillKeys.css';

// The intro plays once per page load (a refresh), not when you navigate between pages inside the app.
let introPlayed = false;
const INTRO_MS = 2700;

const LETTERS = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890';
const COLS = 6;

const KEYS = (() => {
  const seen = new Set();
  return skillGroups
    .flatMap(g => g.skills)
    .filter(sk => sk.icon && !sk.noKey && !seen.has(sk.icon) && seen.add(sk.icon))
    .slice(0, LETTERS.length)
    .map((sk, i) => ({ ...sk, letter: LETTERS[i] }));
})();

export default function SkillKeys({ scrollPose = false }) {
  const [active, setActive] = useState(null);
  const [shown, setShown] = useState(false);
  const [down, setDown] = useState(null);
  const timer = useRef(0);
  const rigRef = useRef(null);
  const rootRef = useRef(null);

  // Scroll flattens the board to the top view, gradually, in step with the scroll. It reaches the final top view when
  // only the last two rows of caps are still visible under the header. It never pins; scrolling up restores the tilt.
  useEffect(() => {
    if (!scrollPose || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const stage = rootRef.current?.querySelector('.skillkeys__stage');
      if (!stage) return;
      const header = document.querySelector('header');
      const headerBottom = header ? header.getBoundingClientRect().bottom : 72;
      const r = stage.getBoundingClientRect();
      const y = window.scrollY;
      // scroll distance at which the stage's bottom is two rows of caps below the header
      const end = Math.max(1, r.bottom + y - headerBottom - r.height * 0.36);
      rigRef.current?.style.setProperty('--pose', Math.min(1, Math.max(0, y / end)).toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [scrollPose]);
  const [playing, setPlaying] = useState(() => !introPlayed && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    introPlayed = true;
    if (!playing) return undefined;
    const t = setTimeout(() => setPlaying(false), INTRO_MS);   // then the switches and all intro animation are gone
    return () => clearTimeout(t);
  }, [playing]);


  // Click or letter press: summon the description for that key, or dismiss it if it is already open.
  const summon = letter => {
    setDown(letter);
    keySound('down');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setDown(null); keySound('up'); }, 120);
    if (shown && active === letter) { setShown(false); return; }
    setActive(letter);
    setShown(true);
  };

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') { setShown(false); return; }
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      if (/^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable) return;
      const k = e.key.toUpperCase();
      if (KEYS.some(x => x.letter === k)) summon(k);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // summon reads the current open state, so re-subscribe when it changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, active]);

  // Clear the key-release timer only on unmount. (Clearing it in the effect above cancelled the release every time the
  // open state changed, so the key stayed stuck pressed instead of returning to its resting state.)
  useEffect(() => () => clearTimeout(timer.current), []);

  const current = useMemo(() => KEYS.find(k => k.letter === active), [active]);
  const used = current ? current.projects.map(s => projectBySlug[s]?.title).filter(Boolean) : [];

  return (
    <div ref={rootRef} className={`skillkeys${playing ? ' skillkeys--intro' : ''}`} data-no-sfx="true">
      <p className="skillkeys__hint">Hint: press a key</p>
      <div className="skillkeys__stage">
        <div className="skillkeys__rig" ref={rigRef}>
          <span className="case__left" aria-hidden="true" />
          <span className="case__front" aria-hidden="true" />
          <span className="case__right" aria-hidden="true" />
          <span className="case__back" aria-hidden="true" />
          <span className="case__bottom" aria-hidden="true" />
        <div className="skillkeys__tilt">
        <span className="case__top" aria-hidden="true" />
        <ul className="skillkeys__board" style={{ '--cols': COLS }} aria-label="Skills, one key each">
          {KEYS.map((sk, i) => {
            const brand = brandColor(sk.icon);
            const label = sk.projects.length ? `${sk.name}: used in ${sk.projects.length} project${sk.projects.length === 1 ? '' : 's'}` : `${sk.name}: a tool I use day to day`;
            return (
              <li key={sk.icon} style={{ '--i': i }}>
                <button
                  type="button"
                  className={`key${down === sk.letter ? ' is-down' : ''}${shown && active === sk.letter ? ' is-active' : ''}`}
                  style={brand ? { '--brand': brand } : undefined}
                  aria-label={label}
                  aria-pressed={shown && active === sk.letter}
                  onClick={() => summon(sk.letter)}
                >
                  <span className="key__left" aria-hidden="true" />
                  <span className="key__front" aria-hidden="true" />
                  <span className="key__right" aria-hidden="true" />
                  <span className="key__back" aria-hidden="true" />
                  <span className="key__top" aria-hidden="true">
                    <PixelLogo src={logoSrc(sk.icon)} size={48} />
                  </span>
                </button>
                {playing && (
                  <>
                    {/* blue mechanical switch under the cap (housing + cross stem) */}
                    <span className="switch" aria-hidden="true">
                      <i className="sw-f sw-top" /><i className="sw-f sw-front" /><i className="sw-f sw-back" /><i className="sw-f sw-left" /><i className="sw-f sw-right" />
                      <span className="switch__stem">
                        <i className="sw-f sw-top" /><i className="sw-f sw-front" /><i className="sw-f sw-back" /><i className="sw-f sw-left" /><i className="sw-f sw-right" />
                      </span>
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
        </div>
        </div>
      </div>
      <div className={`skillkeys__readout${shown && current ? '' : ' is-hidden'}`} aria-live="polite">
        {shown && current && (
          // keyed on the key, so the summon animation plays again when you open a different key
          <div key={current.letter} className="skillkeys__content">
            <div className="skillkeys__head">
              <span className="skillkeys__name">{current.short || current.name}</span>
              <span className="skillkeys__count">{used.length ? `${used.length} ${used.length === 1 ? 'project' : 'projects'}` : 'daily tool'}</span>
            </div>
            {used.length ? (
              <ul className="tag-list skillkeys__projects" aria-label="Projects using this skill">
                {used.map(t => <li key={t} className="tag">{t}</li>)}
              </ul>
            ) : (
              <p className="skillkeys__note">Not tied to one project; I use it day to day.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
