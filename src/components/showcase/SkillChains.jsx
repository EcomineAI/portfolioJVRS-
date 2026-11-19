// Skill keychains: one clear-housing keycap strip per category, hanging from the console on a chain.
// Hover or focus a key to see which projects use it.
import { useEffect, useRef, useState } from 'react';
import { keySound } from './keySound.js';
import PixelLogo from '../PixelLogo.jsx';
import { skillGroups } from '../../data/skills.js';
import { projectBySlug } from '../../data/projects.js';
import { brandColor, logoSrc } from '../../data/techIcons.js';
import './SkillChains.css';

const usedIn = skill => skill.projects.map(slug => projectBySlug[slug]).filter(Boolean);

function Key({ skill, index, intro, down, active, onPress }) {
  const used = usedIn(skill);
  const brand = brandColor(skill.icon);
  return (
    <li className="kc-li">
      <button
        type="button"
        className={`kc-key${down ? ' is-down' : ''}${active ? ' is-active' : ''}`}
        style={{ '--i': index, ...(brand ? { '--brand': brand } : {}) }}
        aria-pressed={active}
        aria-label={used.length ? `${skill.name}: used in ${used.length} project${used.length === 1 ? '' : 's'}` : `${skill.name}: a tool I use day to day`}
        onClick={() => onPress(skill)}
      >
        {intro && <span className="kc-sw" aria-hidden="true"><i /></span>}
        <span className="kc-f" aria-hidden="true">
          <PixelLogo src={logoSrc(skill.icon)} size={36} />
        </span>
      </button>
    </li>
  );
}

const LINKS = [0, 1, 2, 3, 4, 5, 6];

// Intro: blue switches sit in the strips first, then the caps drop onto them one by one, chain by chain
// from left to right; each switch disappears once its cap is seated. Plays once per page load.
const STEP_MS = 70;
const DROP_MS = 420;
const KEY_COUNT = skillGroups.reduce((n, g) => n + g.skills.filter(sk => sk.icon).length, 0);
let introPlayed = false;

export function SkillExtras() {
  const extras = skillGroups.flatMap(g => g.skills.filter(sk => !sk.icon));
  if (!extras.length) return null;
  return (
    <details className="chains__more">
      <summary>More skills <span aria-hidden="true">({extras.length})</span></summary>
      <ul className="chains__also" aria-label="More skills">
        {extras.map(sk => <li key={sk.name} className="also-chip">{sk.name}</li>)}
      </ul>
    </details>
  );
}

export default function SkillChains() {
  const [active, setActive] = useState(null);
  const [down, setDown] = useState(null);
  const timer = useRef(0);
  const rootRef = useRef(null);
  const [intro, setIntro] = useState(() =>
    introPlayed || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'done' : 'pre');

  // Start the intro when the keychains scroll into view, then drop the switches once every cap is seated.
  useEffect(() => {
    if (intro !== 'pre') return undefined;
    const el = rootRef.current;
    if (!el || !('IntersectionObserver' in window)) { setIntro('done'); return undefined; }
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        io.disconnect();
        introPlayed = true;
        setIntro('play');
      }
    }, { threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, [intro]);
  useEffect(() => {
    if (intro !== 'play') return undefined;
    const t = setTimeout(() => setIntro('done'), KEY_COUNT * STEP_MS + DROP_MS + 250);
    return () => clearTimeout(t);
  }, [intro]);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setActive(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Same mechanical click as the home keyboard: down on press, up 120ms later.
  const press = skill => {
    setDown(skill.name);
    keySound('down');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setDown(null); keySound('up'); }, 120);
    setActive(cur => (cur?.name === skill.name ? null : skill));
  };

  const used = active ? usedIn(active) : [];

  // Grab a keychain by its housing (anywhere but a key) and swing it around the point where the chain
  // hangs from the console. On release it swings back and settles like a pendulum.
  const startSwing = e => {
    if (e.button !== 0 || e.target.closest('.kc-key')) return;
    const sway = e.currentTarget;
    const r = sway.parentElement.getBoundingClientRect();     // the li is never rotated
    const px = r.left + r.width / 2;
    const py = r.top;
    const angleAt = (x, y) => (Math.atan2(x - px, y - py) * 180) / Math.PI;
    cancelAnimationFrame(sway._swingRaf);
    const startRot = sway._rot || 0;
    const startAng = angleAt(e.clientX, e.clientY);
    let lastRot = startRot;
    let lastT = performance.now();
    let vel = 0;
    sway.setPointerCapture(e.pointerId);
    sway.classList.add('is-held');
    sway.parentElement.style.zIndex = '5';   // in front of its neighbours while held or swinging

    const move = ev => {
      const rot = Math.max(-40, Math.min(40, startRot - (angleAt(ev.clientX, ev.clientY) - startAng)));
      const now = performance.now();
      const dt = Math.max(1, now - lastT) / 1000;
      vel = (rot - lastRot) / dt;
      lastRot = rot; lastT = now;
      sway._rot = rot;
      sway.style.transform = `rotate(${rot}deg)`;
    };
    const release = () => {
      sway.removeEventListener('pointermove', move);
      sway.removeEventListener('pointerup', release);
      sway.removeEventListener('pointercancel', release);
      sway.classList.remove('is-held');
      // damped spring back to hanging straight down
      let rot = sway._rot || 0;
      let v = Math.max(-400, Math.min(400, vel));
      let prev = performance.now();
      const step = now => {
        const dt = Math.min(0.032, (now - prev) / 1000);
        prev = now;
        v += (-60 * rot - 5 * v) * dt;
        rot += v * dt;
        if (Math.abs(rot) < 0.05 && Math.abs(v) < 0.5) {
          sway._rot = 0;
          sway.style.transform = '';
          sway.parentElement.style.zIndex = '';
          return;
        }
        sway._rot = rot;
        sway.style.transform = `rotate(${rot}deg)`;
        sway._swingRaf = requestAnimationFrame(step);
      };
      sway._swingRaf = requestAnimationFrame(step);
    };
    sway.addEventListener('pointermove', move);
    sway.addEventListener('pointerup', release);
    sway.addEventListener('pointercancel', release);
  };

  return (
    <div ref={rootRef} className={`chains chains--${intro}`} data-no-sfx="true">
      <ul className="chains__row" aria-label="Skills, one keychain per category">
        {skillGroups.map((g, gi) => {
          const keys = g.skills.filter(sk => sk.icon);
          const base = skillGroups.slice(0, gi).reduce((n, x) => n + x.skills.filter(sk => sk.icon).length, 0);
          return (
            <li key={g.id} className="chain">
              <div className="chain__sway" onPointerDown={startSwing}>
                <span className="chain__links" aria-hidden="true">
                  {LINKS.map(i => <i key={i} />)}
                </span>
                <span className="chain__ring" aria-hidden="true" />
                <section className="chain__housing" aria-label={`${g.title} skills`}>
                  <h3 className="chain__title">{g.title}</h3>
                  <ul className="chain__keys">
                    {keys.map((sk, ki) => (
                      <Key
                        key={sk.name}
                        skill={sk}
                        index={base + ki}
                        intro={intro !== 'done'}
                        down={down === sk.name}
                        active={active?.name === sk.name}
                        onPress={press}
                      />
                    ))}
                  </ul>
                </section>
              </div>
            </li>
          );
        })}
      </ul>
      <aside className="chains__side" aria-labelledby="skills-title">
        <p className="chains__eyebrow">01 · Skills</p>
        <h2 id="skills-title" className="chains__heading">Skills, by evidence</h2>
        <p className="chains__intro">Press a key to see the projects behind it.</p>
        <div className={`chains__readout${active ? '' : ' is-idle'}`} aria-live="polite">
          {active ? (
            <div key={active.name} className="chains__content">
              <div className="chains__head">
                <span className="chains__name">{active.short || active.name}</span>
                <span className="chains__count">{used.length ? `${used.length} ${used.length === 1 ? 'project' : 'projects'}` : 'daily tool'}</span>
              </div>
              {used.length ? (
                <ul className="tag-list" aria-label="Projects using this skill">
                  {used.map(p => <li key={p.slug || p.title} className="tag">{p.title}</li>)}
                </ul>
              ) : (
                <p className="chains__note">Not tied to one project; I use it day to day.</p>
              )}
            </div>
          ) : (
            <p className="chains__note">Hint: press a key</p>
          )}
        </div>
        <SkillExtras />
      </aside>
    </div>
  );
}
