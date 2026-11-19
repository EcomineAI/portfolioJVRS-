// /about — background, interests, evidence-based skills, troubleshooting, live activity, journey.
import { useEffect, useRef, useState } from 'react';
import RetroType from '../components/showcase/RetroType';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Cartridge3D from '../components/showcase/Cartridge3D.jsx';

import { Link } from 'react-router-dom';
import activity from '../data/contributions.json';
import ActivityPanel from '../activity/ActivityPanel.jsx';
import { Eyebrow, PixelCard, SectionHeading } from '../components/ui/index.jsx';
import { profile } from '../data/profile.js';
import { troubleshooting } from '../data/skills.js';
import { certifications } from '../data/certifications.js';
import PixelGadget from '../components/showcase/PixelGadget.jsx';
import PegBoard from '../components/showcase/PegBoard.jsx';
import SkillChains from '../components/showcase/SkillChains.jsx';
import './About.css';


const facts = [
  { term: 'School', value: profile.school },
  { term: 'Program', value: profile.program },
  { term: 'Year', value: profile.year },
  { term: 'Location', value: `${profile.location} (${profile.timezone})` },
];

const journey = [
  { when: '2024', gadget: 'laptop', title: 'Started BS Computer Science', text: 'Enrolled at Gordon College, Olongapo City.' },
  { when: 'Mid 2024', gadget: 'terminal', title: 'Linux & cybersecurity basics', text: 'Linux experiments and hands-on practice with basic cybersecurity using Linux.' },
  { when: '2024 →', gadget: 'chip', title: 'Local LLM experiments', text: 'Running and prompting open models (Qwen, Gemma, Llama) on my own PC with LM Studio.' },
  { when: 'Jun–Jul 2025', gadget: 'badge', title: 'DOLE SPES (Subic Bay Freeport Zone)', text: 'Completed 20 days as Production Helper in the Assembly Group under the Department of Labor & Employment.' },
  { when: 'Feb–Nov 2026', gadget: 'bubble', title: 'Askademic (Ctrl Alt Elite)', text: 'Project & documentation lead for our team software engineering project: real-time faculty consultation system for Gordon College CCS.', to: '/case-study' },
  { when: 'May 2026', gadget: 'trophy', title: 'GCCCS TechFest Hackathon 2026', text: 'Competed with Team VisioMotus in Team1 Philippines × Gordon College CCS, building blockchain-based sustainability solutions.' },
  { when: 'Jun–Jul 2026', gadget: 'briefcase', title: '200-Hour OJT · Columban College, Inc.', text: 'Completed 200 hours of On-the-Job Training at the College of Arts, Sciences, and Education (CASEd).' },
  { when: '2026', gadget: 'robot', title: 'GC-Assist', text: 'Solo AI-powered conversational information system for Gordon College using a local open-source LLM and RAG over a JSON knowledge base.', to: '/projects/gc-assist' },
  { when: '2026 →', gadget: 'scissors', title: 'JALgorithm research', text: 'Lead developer for an ML salon booking chatbot and stylist dashboard (Makeup and Hair by Trev Luna).', to: '/projects/jalgorithm' },
  { when: 'Nov 2026', gadget: 'medal', title: 'Certifications & www.junevicabello.site', text: 'Completed Cisco, Fortinet NSE 1, DICT Data Privacy, OpenAI Academy, and Claude Academy certifications and shipped this portfolio.' },
];

/* Certificates: a pixel bulletin board. Each certificate is a picture pinned to the cork with a short name;
   click to enlarge (Esc or click to close). */
function CertGrid({ items }) {
  const [open, setOpen] = useState(null);
  const [loaded, setLoaded] = useState(() => ({}));
  useEffect(() => {
    if (open === null) return undefined;
    const onKey = e => { if (e.key === 'Escape') setOpen(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const preloadFull = (src) => {
    if (!src) return;
    const img = new Image();
    img.src = src;
  };

  const label = (c, i) => c.title || `Certificate ${i + 1}`;
  const current = open !== null ? items[open] : null;
  return (
    <>
      <div className="cert-board" data-spray-surface="true">
        {items.length === 0 ? (
          <p className="cert-board__empty">Nothing pinned yet. Add images in public/assets/certs and list them in src/data/certifications.js</p>
        ) : (
          <ul className="cert-grid">
            {items.map((c, i) => {
              const key = c.image || c.title;
              const isLoaded = !!loaded[key];
              return (
                <li key={key} className="cert-pin">
                  <button
                    type="button"
                    className="cert-pin__card"
                    onClick={() => setOpen(i)}
                    onMouseEnter={() => preloadFull(c.image)}
                    onFocus={() => preloadFull(c.image)}
                    aria-label={`View ${label(c, i)} larger`}
                  >
                    <span className="cert-pin__tack" aria-hidden="true" />
                    <span className={`cert-pin__frame${isLoaded ? ' is-loaded' : ''}`}>
                      <img
                        className="cert-pin__img"
                        src={c.thumb || c.image}
                        alt={`${label(c, i)}${c.issuer ? `, ${c.issuer}` : ''}`}
                        width="640"
                        height="480"
                        loading="lazy"
                        decoding="async"
                        onLoad={() => setLoaded(prev => (prev[key] ? prev : { ...prev, [key]: true }))}
                      />
                    </span>
                    <span className="cert-pin__name">{label(c, i)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {current && (
        <div className="cert-lightbox" role="dialog" aria-modal="true" aria-label={label(current, open)} onClick={() => setOpen(null)}>
          <img src={current.image} alt={label(current, open)} decoding="async" />
          <div className="cert-lightbox__bar">
            {current.url && (
              <a className="pixel-btn pixel-btn--sm" href={current.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                Verify<span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            <button type="button" className="pixel-btn pixel-btn--sm cert-lightbox__close" onClick={() => setOpen(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default function About() {
  const rootRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    const cleanups = [];

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // 1. Slot-in entrance for Cartridge + Bio card
      // Cartridge falls in from above: fast drop, hard stop, small rebound
      gsap.timeline({ defaults: { overwrite: 'auto' } })
        .fromTo('.cartridge-stage',
          { y: -520, rotateX: -24, opacity: 0 },
          { y: 0, rotateX: 0, opacity: 1, duration: 0.32, ease: 'power3.in', clearProps: 'opacity' })
        .to('.cartridge-stage', { y: -14, duration: 0.12, ease: 'power2.out' })
        .to('.cartridge-stage', { y: 0, duration: 0.16, ease: 'power2.in', clearProps: 'transform' });

      // 2. Idle: Zero-G 3D Levitation on Cartridge + grounded shadow (pauses on hover)
      const idleEl = rootRef.current?.querySelector('.cartridge-idle');
      const shadowEl = rootRef.current?.querySelector('.cartridge-shadow');
      if (idleEl) {
        const floatTween = gsap.to(idleEl, {
          y: -10,
          rotateZ: -0.8,
          rotateY: 3,
          duration: 2.4,
          delay: 0.9,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
        const shadowTween = shadowEl
          ? gsap.to(shadowEl, {
              scaleX: 0.86,
              opacity: 0.2,
              duration: 2.4,
              delay: 0.9,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
            })
          : null;

        const stageEl = rootRef.current?.querySelector('.cartridge-stage');
        const onEnter = () => {
          floatTween.pause();
          shadowTween?.pause();
        };
        const onLeave = () => {
          floatTween.resume();
          shadowTween?.resume();
        };
        stageEl?.addEventListener('mouseenter', onEnter);
        stageEl?.addEventListener('mouseleave', onLeave);
        cleanups.push(() => {
          stageEl?.removeEventListener('mouseenter', onEnter);
          stageEl?.removeEventListener('mouseleave', onLeave);
        });
      }
    });

    return () => {
      cleanups.forEach(fn => fn());
      mm.revert();
    };
  }, { scope: rootRef });

  return (
    <div className="about" ref={rootRef}>
      {/* ---- Intro: Clean Editorial Split + 3D Cartridge ---- */}
      <section className="container section about-intro" aria-labelledby="about-title">
        <nav className="about-intro__jump" aria-label="On this page">
          <Eyebrow world="code">
            <a href="#skills-title">01 Skills</a><span aria-hidden="true">·</span>
            <a href="#certs-title">02 Certificates</a><span aria-hidden="true">·</span>
            <a href="#trouble-title">03 Side quests</a><span aria-hidden="true">·</span>
            <a href="#proof-title">04 Proof of work</a><span aria-hidden="true">·</span>
            <a href="#journey-title">05 Journey</a>
          </Eyebrow>
        </nav>

        <div className="about-hero">
          <div className="about-hero__main-wrap">
          <div
            className="console about-hero__main"
            data-spray-surface="true"
          >
            <span className="console__face console__face--top" aria-hidden="true" />
            <span className="console__face console__face--right" aria-hidden="true" />
            <div className="console__top" aria-hidden="true">
              <span className="console__led" />
              <span className="console__brand">JV-OS · 64</span>
              <span className="console__stripe" />
              <span className="console__vents"><i /><i /><i /><i /><i /></span>
            </div>
            <div className="console__screen">
              <h1 id="about-title" className="about-hero__title"><RetroType text={profile.name.full} /></h1>

            <div className="prose plate-off about-hero__bio">
              <p>
                Hi, I'm <strong>{profile.name.first}</strong>, a {profile.year} {profile.program} student at {profile.school}.
                I build web apps and AI tools: campus systems with React and Supabase, and assistants that run on{' '}
                <span className="marker" data-world="code">local LLMs</span>.
              </p>
              <p>
                I care most about <span className="marker" data-world="learn">calm UX</span> (making tools that feel
                obvious to use), getting practical answers out of open models on my own hardware, and{' '}
                <span className="marker" data-world="create">creative work</span> like UI graphics and video.
              </p>
            </div>

            <dl className="about-facts" aria-label="Quick facts">
              {facts.map(f => (
                <div key={f.term} className="about-facts__item">
                  <dt>{f.term}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
            </div>
            <div className="console__bottom" aria-hidden="true">
              <span className="console__switch"><i />POWER</span>
              <span className="console__switch console__switch--reset"><i />RESET</span>
              <span className="console__ports"><i /><i /><i /></span>
              <span className="console__insert">INSERT CARTRIDGE ▶</span>
            </div>
          </div>
          <SkillChains />
          </div>

          <div className="cartridge-outro-wrap">
            <Cartridge3D
              photo={profile.photo}
              name={profile.name.full}
              displayName={profile.name.display}
              role={profile.role}
              year={profile.year}
              facts={facts}
            />
          </div>
        </div>
      </section>

      {/* ---- Certificates ---- */}
      <section className="container section about-section" aria-labelledby="certs-title">
        <SectionHeading
          id="certs-title"
          num="02"
          label="Certificates"
          title="Certificates & courses"
          intro="Proof of what I have studied, with a link to verify each one."
        />
        <CertGrid items={certifications} />
      </section>

      {/* ---- Troubleshooting skill tree ---- */}
      <section className="container section about-section" aria-labelledby="trouble-title">
        <SectionHeading
          id="trouble-title"
          num="03"
          label="Side quests"
          title="What I fix"
          intro="Fixing things is how I got into computers. These are the problems I get asked about most."
        />
        <PegBoard areas={troubleshooting} />
      </section>

      {/* ---- Activity ---- */}
      <section className="container section about-section" aria-labelledby="proof-title">
        <SectionHeading
          id="proof-title"
          num="04"
          label="Proof of work"
          title="What I've been shipping"
          intro="My public GitHub activity over the last year, updated on every deploy."
        />
        <div className="proof-row">
          <ActivityPanel headingLevel="h3" />
          <div className="proof-link" aria-hidden="true"><i /></div>
          <aside className="pcb" aria-label="GitHub activity at a glance">
            <span className="pcb__hole pcb__hole--tl" aria-hidden="true" />
            <span className="pcb__hole pcb__hole--tr" aria-hidden="true" />
            <span className="pcb__hole pcb__hole--bl" aria-hidden="true" />
            <span className="pcb__hole pcb__hole--br" aria-hidden="true" />
            <div className="pcb__gpio" aria-hidden="true">{Array.from({ length: 20 }, (_, i) => <i key={i} />)}</div>
            <p className="pcb__silk" aria-hidden="true">JV-PI 4B <span>· REV 1.0</span></p>
            <span className="pcb__led pcb__led--red" aria-hidden="true" />
            <span className="pcb__led pcb__led--green" aria-hidden="true" />
            <dl className="pcb__chips">
              <div className="pcb__chip"><dt>Events / yr</dt><dd>{activity.stats.last365.toLocaleString('en-US')}</dd></div>
              <div className="pcb__chip"><dt>Streak</dt><dd>{activity.stats.longestStreak}<small>d</small></dd></div>
              <div className="pcb__chip"><dt>Last 30d</dt><dd>{activity.stats.last30.toLocaleString('en-US')}</dd></div>
            </dl>
            <a className="pcb__port" href={activity.sources?.github?.url || `https://github.com/${activity.user}`} target="_blank" rel="noopener noreferrer">
              <span>GITHUB</span> ↗
              <span className="sr-only"> View on GitHub (opens in a new tab)</span>
            </a>
          </aside>
        </div>
      </section>

      {/* ---- Journey ---- */}
      <section className="container section about-section" aria-labelledby="journey-title">
        <SectionHeading id="journey-title" num="05" label="Journey" title="So far" />
        <ol className="stones">
          {journey.map((j, i) => (
            <li key={j.title} className="stone-row">
              <div className="stone" aria-hidden="true">
                <PixelGadget name={j.gadget} size={44} />
                <span className="stone__when">{j.when}</span>
              </div>
              <div className="stone-card">
                <p className="sr-only">{j.when}</p>
                <h3 className="stone-card__title">
                  {j.to ? <Link to={j.to}>{j.title}</Link> : j.title}
                </h3>
                <p className="stone-card__text">{j.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
