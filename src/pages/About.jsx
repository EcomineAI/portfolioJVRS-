// /about — background, interests, evidence-based skills, troubleshooting, live activity, journey.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ActivityPanel from '../activity/ActivityPanel.jsx';
import { Eyebrow, PixelCard, SectionHeading, Todo } from '../components/ui/index.jsx';
import { profile } from '../data/profile.js';
import { CASE_STUDY_SLUG, projectBySlug } from '../data/projects.js';
import { skillGroups, troubleshooting } from '../data/skills.js';
import { certifications } from '../data/certifications.js';
import { brandColor, logoSrc } from '../data/techIcons.js';
import PixelLogo from '../components/PixelLogo.jsx';
import './About.css';


const facts = [
  { term: 'School', value: profile.school },
  { term: 'Program', value: profile.program },
  { term: 'Year', value: profile.year },
  { term: 'Location', value: `${profile.location} (${profile.timezone})` },
  { term: 'Status', value: profile.status },
];

const journey = [
  { when: '2024', title: 'Started BS Computer Science', text: 'Enrolled at Gordon College, Olongapo City.' },
  { when: '2024 →', title: 'Local LLM experiments', text: 'Running and prompting open models on my own PC with LM Studio.' },
  { when: 'Apr–Oct 2026', title: 'Askademic', text: 'Team software engineering project: real-time faculty appointments for the CCS department.', to: '/case-study' },
  { when: '2026', title: 'GC Assist', text: 'Solo AI campus assistant on a local model with a scraped knowledge base.', to: '/projects/gc-assist' },
  { when: '2026 →', title: 'JALgorithm thesis', text: 'Chatbot for salon booking and reminders. In progress.', to: '/projects/jalgorithm' },
];

const usedIn = skill => skill.projects.map(slug => projectBySlug[slug]).filter(Boolean);

/** A tool with a real logo: pixel-art logo tile. Hover or focus lists the projects that use it. */
function SkillTile({ skill }) {
  const used = usedIn(skill);
  const brand = brandColor(skill.icon);
  const names = used.map(p => p.title).join(', ');
  return (
    <li
      className="skill-tile"
      tabIndex={0}
      style={brand ? { '--brand': brand } : undefined}
      aria-label={`${skill.name}: used in ${used.length} project${used.length === 1 ? '' : 's'}, ${names}`}
    >
      <PixelLogo src={logoSrc(skill.icon)} size={48} />
      <span className="skill-tile__name">{skill.short || skill.name}</span>
      <span className="skill-tile__count" aria-hidden="true">×{used.length}</span>
      <span className="skill-tile__tip" aria-hidden="true">{names}</span>
    </li>
  );
}

/* Certificates are pictures: thumbnails in a grid, click to enlarge (Esc or click to close). */
function CertGrid({ items }) {
  const [open, setOpen] = useState(null);
  useEffect(() => {
    if (open === null) return undefined;
    const onKey = e => { if (e.key === 'Escape') setOpen(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!items.length) {
    return (
      <ul className="cert-grid">
        <li>
          <PixelCard pad className="cert-card cert-card--empty">
            <p className="cert-card__badge" aria-hidden="true">+</p>
            <h3 className="cert-card__title">Certificates coming soon</h3>
            <p className="cert-card__issuer">Drop images in public/assets/certs and list them in src/data/certifications.js</p>
          </PixelCard>
        </li>
      </ul>
    );
  }
  const current = open !== null ? items[open] : null;
  const label = (c, i) => c.title || `Certificate ${i + 1}`;
  return (
    <>
      <ul className="cert-grid">
        {items.map((c, i) => (
          <li key={c.image || c.title}>
            <PixelCard interactive className="cert-card" data-spray-surface="true">
              <button type="button" className="cert-card__open" onClick={() => setOpen(i)} aria-label={`View ${label(c, i)} larger`}>
                <img className="cert-card__img" src={c.image} alt={`${label(c, i)}${c.issuer ? `, ${c.issuer}` : ''}`} loading="lazy" />
              </button>
              {(c.title || c.issuer || c.date) && (
                <div className="cert-card__text">
                  {c.title && <h3 className="cert-card__title">{c.title}</h3>}
                  {(c.issuer || c.date) && (
                    <p className="cert-card__issuer">{c.issuer}{c.issuer && c.date && ' · '}{c.date && <time className="cert-card__date">{c.date}</time>}</p>
                  )}
                  {c.url && <a className="cert-card__link" href={c.url} target="_blank" rel="noopener noreferrer">Verify<span className="sr-only"> (opens in a new tab)</span></a>}
                </div>
              )}
            </PixelCard>
          </li>
        ))}
      </ul>
      {current && (
        <div className="cert-lightbox" role="dialog" aria-modal="true" aria-label={label(current, open)} onClick={() => setOpen(null)}>
          <img src={current.image} alt={label(current, open)} />
          <button type="button" className="pixel-btn pixel-btn--sm cert-lightbox__close" onClick={() => setOpen(null)}>Close</button>
        </div>
      )}
    </>
  );
}

export default function About() {
  return (
    <div className="about">
      {/* ---- Intro ---- */}
      <section className="container section about-intro" aria-labelledby="about-title">
        <div className="about-intro__text">
          <nav className="about-intro__jump" aria-label="On this page">
            <Eyebrow world="code">
              <a href="#skills-title">Skills</a><span aria-hidden="true">·</span>
              <a href="#certs-title">Certificates</a><span aria-hidden="true">·</span>
              <a href="#trouble-title">Side quests</a><span aria-hidden="true">·</span>
              <a href="#journey-title">Journey</a>
            </Eyebrow>
          </nav>
          <h1 id="about-title" className="about-intro__title">About</h1>
          <div className="prose about-intro__bio">
            <p>
              Hi, I'm <strong>{profile.name.full}</strong>, a {profile.year} {profile.program} student at {profile.school}.
              I build web apps and AI tools: campus systems with React and Supabase, and assistants that run on
              local language models.
            </p>
            <p>
              I'm most interested in <strong>local LLMs</strong> (getting useful answers out of models that run on my own
              hardware), <strong>UX</strong> (making tools that feel calm and obvious to use) and <strong>creative work</strong>
              {' '}like UI graphics, video and photography.
            </p>
          </div>
          <Todo>Rewrite this bio in your own voice (the prof requires personalized text).</Todo>
        </div>

        <figure className="about-photo pixel-card" data-spray-surface="true">
          <div className="about-photo__frame">
            <img src={profile.photo} alt={`Portrait of ${profile.name.full}`} width="320" height="320" />
          </div>
          <figcaption className="about-photo__caption">
            <span className="about-photo__dot" aria-hidden="true" /> {profile.name.display} · {profile.role}
          </figcaption>
        </figure>

        <dl className="facts" aria-label="Quick facts">
          {facts.map(f => (
            <div key={f.term} className="facts__item">
              <dt>{f.term}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---- Skills ---- */}
      <section className="container section about-section" aria-labelledby="skills-title">
        <SectionHeading
          id="skills-title"
          num="01"
          label="Skills"
          title="Skills, by evidence"
          intro="No self-rated percentages. Each tool is tied to the projects that actually use it."
        />
        <p className="skills-legend">Hover a logo to see which projects use it. ×N is how many of my projects use it.</p>
        <div className="stack-board pixel-card" data-spray-surface="true">
          {skillGroups.map(g => {
            const tiles = g.skills.filter(sk => sk.icon);
            const extra = g.skills.filter(sk => !sk.icon);
            return (
              <section key={g.id} className="stack-row" aria-labelledby={`sg-${g.id}`}>
                <h3 id={`sg-${g.id}`} className="stack-row__title">{g.title}</h3>
                <div className="stack-row__body">
                  {tiles.length > 0 && (
                    <ul className="skill-grid">
                      {tiles.map(sk => <SkillTile key={sk.name} skill={sk} />)}
                    </ul>
                  )}
                  {extra.length > 0 && (
                    <ul className="stack-row__also" aria-label={`More ${g.title} skills`}>
                      {extra.map(sk => {
                        const used = usedIn(sk);
                        return (
                          <li key={sk.name} className="also-chip" title={`Used in: ${used.map(p => p.title).join(', ')}`}>
                            {sk.name}<span className="also-chip__n"> ×{used.length}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </section>
            );
          })}
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
          title="Troubleshooting skill tree"
          intro="Fixing things is how I got into computers. These are the problems I get asked about most."
        />
        <ul className="trouble-grid">
          {troubleshooting.map((t, i) => (
            <li key={t.area}>
              <PixelCard pad className="trouble-card">
                <p className="trouble-card__node" aria-hidden="true">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="trouble-card__title">{t.area}</h3>
                <ul className="trouble-card__list">
                  {t.items.map(item => <li key={item}>{item}</li>)}
                </ul>
              </PixelCard>
            </li>
          ))}
        </ul>
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
        <ActivityPanel headingLevel="h3" />
      </section>

      {/* ---- Journey ---- */}
      <section className="container section about-section" aria-labelledby="journey-title">
        <SectionHeading id="journey-title" num="05" label="Journey" title="So far" />
        <ol className="journey">
          {journey.map(j => (
            <li key={j.title} className="journey__item">
              <p className="journey__when">{j.when}</p>
              <div className="journey__body">
                <h3 className="journey__title">
                  {j.to ? <Link to={j.to}>{j.title}</Link> : j.title}
                </h3>
                <p className="journey__text prose">{j.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
