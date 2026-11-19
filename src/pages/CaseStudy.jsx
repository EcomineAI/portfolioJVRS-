// /case-study — Askademic, the featured software engineering & UX case study.
// Content comes from src/data/caseStudy.js; owner role/contributions also read from projects.js.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GithubIcon } from '../components/Icons.jsx';
import { Eyebrow, PixelArrow, PixelButton, PixelCard, TagList } from '../components/ui/index.jsx';
import { caseStudy } from '../data/caseStudy.js';
import { CASE_STUDY_SLUG, caseStudyProject, projects } from '../data/projects.js';
import './CaseStudy.css';

const num = i => String(i + 1).padStart(2, '0');
const arr = v => (Array.isArray(v) ? v : []);

/** Tracks which section is currently being read. */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join('|');
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const els = key.split('|').map(id => document.getElementById(id)).filter(Boolean);
    const obs = new IntersectionObserver(
      entries => {
        const hit = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 },
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [key]);
  return active;
}

function ExternalButtons({ links = {} }) {
  return (
    <div className="cs-actions">
      {links.live && (
        <PixelButton href={links.live}>
          Live app <span aria-hidden="true">↗</span><span className="sr-only">(opens in a new tab)</span>
        </PixelButton>
      )}
      {links.source && (
        <PixelButton href={links.source} variant="outline">
          <GithubIcon aria-hidden="true" /> Source code<span className="sr-only">(opens in a new tab)</span>
        </PixelButton>
      )}
    </div>
  );
}

function Toc({ sections, active }) {
  return (
    <nav className="cs-toc cs-locker" aria-labelledby="cs-toc-title">
      <div className="cs-locker__top" aria-hidden="true">
        <span className="cs-locker__vents"><i /><i /><i /><i /></span>
        <span className="cs-locker__plate">CS-01</span>
      </div>
      <span className="cs-locker__handle" aria-hidden="true"><i /></span>
      <div className="cs-locker__sheet">
        <span className="cs-locker__tape" aria-hidden="true" />
        <h2 id="cs-toc-title" className="cs-toc__title">In this story</h2>
        <ol className="cs-toc__list">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="cs-toc__link" aria-current={active === s.id ? 'true' : undefined}>
                <span className="cs-toc__num">{num(i)}</span>
                <span>{s.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
      <div className="cs-locker__bottom" aria-hidden="true">
        <span className="cs-locker__vents cs-locker__vents--sm"><i /><i /></span>
      </div>
    </nav>
  );
}

function ScreenshotFigure({ img, onZoom, className = '' }) {
  return (
    <figure className={`cs-frame${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className="cs-frame__zoom"
        data-uisfx="expand"
        onClick={() => onZoom(img)}
        aria-label={`Enlarge ${img.caption || img.alt || 'screenshot'}`}
      >
        <img src={img.src} alt={img.alt || ''} loading="lazy" />
        <span className="cs-frame__hint" aria-hidden="true">Click to enlarge ↗</span>
      </button>
      {img.caption && <figcaption>{img.caption}</figcaption>}
    </figure>
  );
}

function OverviewExtras({ section }) {
  const p = caseStudyProject || {};
  const team = arr(p.team);
  const contributions = arr(p.contributions);
  return (
    <>
      {(section.problemCard || section.goalCard) && (
        <div className="cs-split-2">
          {section.problemCard && (
            <div className="cs-subcard cs-subcard--red">
              <div className="cs-card-head">
                <span className="cs-num-badge cs-num-badge--red" aria-hidden="true">!</span>
                <h3>{section.problemCard.title}</h3>
              </div>
              <p>{section.problemCard.text}</p>
            </div>
          )}
          {section.goalCard && (
            <div className="cs-subcard cs-subcard--blue">
              <div className="cs-card-head">
                <span className="cs-num-badge cs-num-badge--code" aria-hidden="true">★</span>
                <h3>{section.goalCard.title}</h3>
              </div>
              <p>{section.goalCard.text}</p>
            </div>
          )}
        </div>
      )}

      {(p.role || contributions.length > 0) && (
        <div className="cs-subcard">
          <div className="cs-card-head">
            <span className="cs-num-badge cs-num-badge--slate" aria-hidden="true">JV</span>
            <div>
              <h3>My role: {p.role}</h3>
              {team.length > 0 && <p className="cs-subcard__meta">Team of {team.length}: {team.join(', ')}</p>}
            </div>
          </div>
          {contributions.length > 0 && (
            <ul className="cs-checklist">
              {contributions.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          )}
        </div>
      )}
    </>
  );
}

function InterfaceShowcase({ views, onZoom }) {
  const [mode, setMode] = useState('split');
  const panels = [
    { id: 'faculty', label: 'Faculty flow (Login + Workplace)', items: arr(views.faculty) },
    { id: 'student', label: 'Student flow (Login + Workplace)', items: arr(views.student) },
  ];
  const visible = mode === 'split' ? panels : panels.filter(p => p.id === mode);

  return (
    <div className="cs-interactive">
      <div className="cs-tabs" role="tablist" aria-label="Interface view selector">
        {[
          { id: 'split', label: 'Split Comparison' },
          { id: 'faculty', label: 'Faculty View' },
          { id: 'student', label: 'Student View' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mode === tab.id}
            className={`cs-tab${mode === tab.id ? ' is-active' : ''}`}
            data-uisfx="select"
            onClick={() => setMode(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={`cs-ui-grid${mode === 'split' ? ' is-split' : ''}`}>
        {visible.map(panel => (
          <div key={panel.id} className="cs-ui-col">
            <h3 className="cs-h3">{panel.label}</h3>
            <div className="cs-ui-stack">
              {panel.items.map((img, i) => (
                <ScreenshotFigure key={i} img={img} onZoom={onZoom} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NumberedGrid({ items, tone = 'red', columns = 2 }) {
  return (
    <div className={`cs-cards-grid cs-cards-grid--${columns}`}>
      {items.map((item, i) => (
        <article key={item.title} className={`cs-subcard cs-subcard--${tone}`}>
          <div className="cs-card-head">
            <span className={`cs-num-badge cs-num-badge--${tone}`} aria-hidden="true">{i + 1}</span>
            <h3>{item.title}</h3>
          </div>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

function PersonaCards({ personas, onZoom }) {
  return (
    <div className="cs-split-2">
      {personas.map(p => (
        <article key={p.name} className="cs-subcard cs-persona">
          <div className="cs-persona__top">
            <button
              type="button"
              className="cs-persona__photo"
              data-uisfx="expand"
              onClick={() => onZoom({ src: p.photo, alt: p.photoAlt, caption: `${p.name} — ${p.role} (${p.hometown})` })}
              aria-label={`Enlarge photo for persona ${p.name}`}
            >
              <img src={p.photo} alt={p.photoAlt} loading="lazy" />
            </button>
            <div className="cs-persona__id">
              <h3>{p.name}</h3>
              <p className="cs-persona__role">{p.role}</p>
              <div className="cs-persona__meta">
                <span>Age: {p.age}</span>
                <span>{p.education}</span>
                <span>{p.hometown}</span>
              </div>
            </div>
          </div>
          <blockquote className="cs-persona__quote">{p.quote}</blockquote>
          <p><strong>Problem statement:</strong> {p.problemStatement}</p>
          <p><strong>Goal:</strong> {p.goal}</p>
          <p><strong>Frustration:</strong> {p.frustration}</p>
          <p className="cs-persona__bio">{p.bio}</p>
        </article>
      ))}
    </div>
  );
}

function JourneyShowcase({ journeys, onZoom }) {
  const [activeId, setActiveId] = useState(journeys[0]?.id || 'student');
  const current = journeys.find(j => j.id === activeId) || journeys[0];
  if (!current) return null;

  return (
    <div className="cs-subcard cs-journey-box">
      <div className="cs-tabs" role="tablist" aria-label="User journey selector">
        {journeys.map(j => (
          <button
            key={j.id}
            type="button"
            role="tab"
            aria-selected={j.id === current.id}
            className={`cs-tab${j.id === current.id ? ' is-active' : ''}`}
            data-uisfx="select"
            onClick={() => setActiveId(j.id)}
          >
            {j.label}
          </button>
        ))}
      </div>

      <div className="cs-journey-head">
        <h3>{current.person}</h3>
        <p className="cs-subcard__meta">Goal: {current.goal}</p>
      </div>

      <ScreenshotFigure
        img={{ src: current.image, alt: current.imageAlt, caption: current.imageCaption }}
        onZoom={onZoom}
      />

      <div className="cs-journey-steps">
        {arr(current.steps).map(st => (
          <div key={st.title} className="cs-jstep">
            <h4 className="cs-jstep__title">{st.title}</h4>
            <span className={`cs-mood cs-mood--${st.tone}`}>{st.mood}</span>
            <p className="cs-jstep__opp">{st.opp}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FindingsPair({ round1, round2 }) {
  const rounds = [
    { heading: 'Round 1 findings (Final defense panel)', items: arr(round1) },
    { heading: 'Round 2 findings (Faculty representative review)', items: arr(round2) },
  ];
  return (
    <div className="cs-split-2">
      {rounds.map(r => (
        <div key={r.heading} className="cs-subcard cs-subcard--amber">
          <h3 className="cs-h3">{r.heading}</h3>
          <ol className="cs-finding-list">
            {r.items.map((item, i) => (
              <li key={item.title} className="cs-finding-item">
                <span className="cs-num-badge cs-num-badge--amber" aria-hidden="true">{i + 1}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

function SectionBody({ section: s, onZoom }) {
  return (
    <>
      {arr(s.body).map((t, i) => <p key={i}>{t}</p>)}

      {s.id === 'overview' && <OverviewExtras section={s} />}

      {s.interfaceViews && <InterfaceShowcase views={s.interfaceViews} onZoom={onZoom} />}

      {arr(s.painPoints).length > 0 && <NumberedGrid items={s.painPoints} tone="red" columns={2} />}

      {arr(s.personas).length > 0 && <PersonaCards personas={s.personas} onZoom={onZoom} />}

      {arr(s.journeys).length > 0 && <JourneyShowcase journeys={s.journeys} onZoom={onZoom} />}

      {(arr(s.round1).length > 0 || arr(s.round2).length > 0) && (
        <FindingsPair round1={s.round1} round2={s.round2} />
      )}

      {arr(s.steps).length > 0 && (
        <>
          <h3 className="cs-h3">Delivery &amp; iteration timeline</h3>
          <ol className="cs-timeline">
            {s.steps.map((st, i) => (
              <li key={st.title} className="cs-step">
                <span className="cs-step__marker" aria-hidden="true">{num(i)}</span>
                <div className="cs-step__body">
                  <p className="cs-step__date">{st.date}</p>
                  <h4 className="cs-step__title">{st.title}</h4>
                  <p>{st.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      {arr(s.accessibilityCards).length > 0 && (
        <NumberedGrid items={s.accessibilityCards} tone="code" columns={3} />
      )}

      {arr(s.highlights).length > 0 && (
        <>
          <h3 className="cs-h3">Design highlights</h3>
          <ul className="cs-bullets">{s.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>
        </>
      )}

      {(s.impact || s.learned) && (
        <div className="cs-split-2">
          {s.impact && (
            <div className="cs-subcard">
              <h3 className="cs-h3">Impact</h3>
              <p>{s.impact}</p>
            </div>
          )}
          {s.learned && (
            <div className="cs-subcard">
              <h3 className="cs-h3">What I learned</h3>
              <p>{s.learned}</p>
            </div>
          )}
        </div>
      )}

      {arr(s.nextSteps).length > 0 && (
        <>
          <h3 className="cs-h3">Next steps</h3>
          <NumberedGrid items={s.nextSteps} tone="blue" columns={2} />
        </>
      )}
    </>
  );
}

function ImageLightbox({ image, onClose }) {
  useEffect(() => {
    if (!image) return undefined;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [image, onClose]);

  if (!image) return null;
  return (
    <div
      className="cs-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={image.caption || image.alt || 'Image preview'}
      onClick={onClose}
    >
      <div className="cs-lightbox__panel" onClick={e => e.stopPropagation()}>
        <div className="cs-lightbox__head">
          <span>{image.caption || image.alt}</span>
          <button type="button" className="cs-lightbox__close" data-uisfx="close" onClick={onClose}>Close ×</button>
        </div>
        <img src={image.src} alt={image.alt || ''} />
      </div>
    </div>
  );
}

export default function CaseStudy() {
  const cs = caseStudy;
  const sections = arr(cs.sections);
  const active = useActiveSection(sections.map(s => s.id));
  const tags = arr(caseStudyProject?.tags);
  const nextProject = projects.find(p => p.slug !== CASE_STUDY_SLUG);
  const [zoomed, setZoomed] = useState(null);

  return (
    <article className="cs-page">
      {/* ---- Hero + Tools: Pixel Bulletin Board ---- */}
      <header className="container cs-hero">
        <Link to="/projects" className="cs-back" data-uisfx="back" data-uisfx-pack="minimal"><span aria-hidden="true">←</span> Projects</Link>
        <div className="cs-board" data-spray-surface="true">
          <div className="cs-hero__card">
            <span className="cs-pin cs-pin--tl" aria-hidden="true" />
            <span className="cs-pin cs-pin--tr" aria-hidden="true" />
            <div className="cs-hero__top">
              <div className="cs-hero__intro">
                <Eyebrow world="code">Featured case study · Software engineering &amp; UX project</Eyebrow>
                <h1 className="cs-hero__title">{cs.title}</h1>
                {cs.tagline && <p className="cs-hero__tagline">{cs.tagline}</p>}
                {cs.formerNames && (
                  <p className="cs-hero__former">
                    <span className="cs-hero__former-label">Formerly</span> {cs.formerNames}
                  </p>
                )}
              </div>
              {cs.cover && (
                <ScreenshotFigure
                  className="cs-hero__banner"
                  img={{ src: cs.cover, alt: cs.coverAlt || cs.title }}
                  onZoom={setZoomed}
                />
              )}
            </div>
            {arr(cs.meta).length > 0 && (
              <dl className="cs-meta">
                {cs.meta.map(m => (
                  <div key={m.label} className="cs-meta__item">
                    <dt>{m.label}</dt>
                    <dd>{m.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {arr(cs.kpis).length > 0 && (
              <div className="cs-kpis">
                {cs.kpis.map(k => (
                  <div key={k.label} className="cs-kpi">
                    <span className="cs-kpi__val">{k.value}</span>
                    <span className="cs-kpi__lbl">{k.label}</span>
                  </div>
                ))}
              </div>
            )}
            <TagList tags={tags} />
            <ExternalButtons links={cs.links} />
          </div>

          {arr(cs.stack).length > 0 && (
            <section className="cs-tools" aria-labelledby="cs-tools-title">
              <h2 id="cs-tools-title" className="cs-tools__title">
                <span className="cs-pin cs-pin--center" aria-hidden="true" />
                Tools and their roles
              </h2>
              <ul className="cs-tools__list">
                {cs.stack.map(t => (
                  <li key={t.name} className="cs-tool">
                    <span className="cs-tool__tack" aria-hidden="true" />
                    <span className="cs-tool__name">{t.name}</span>
                    <span className="cs-tool__role">{t.role}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </header>

      {/* ---- Story: TOC + sections ---- */}
      <div className="container cs-layout">
        <aside className="cs-layout__toc">
          <Toc sections={sections} active={active} />
        </aside>

        <div className="cs-layout__content">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="cs-section" aria-labelledby={`${s.id}-title`}>
              <h2 id={`${s.id}-title`} className="cs-section__title">
                <span className="cs-section__num">{num(i)}</span>
                {s.title}
              </h2>
              <div className="prose cs-section__body">
                <SectionBody section={s} onZoom={setZoomed} />
              </div>
            </section>
          ))}

          {/* ---- CTA repeat ---- */}
          <PixelCard as="section" className="cs-cta" aria-labelledby="cs-cta-title" data-spray-surface="true">
            <h2 id="cs-cta-title" className="cs-cta__title">Explore the project</h2>
            <p className="prose">Try the live app or read the source on GitHub.</p>
            <ExternalButtons links={cs.links} />
          </PixelCard>

          <nav className="cs-pager" aria-label="Case study navigation">
            <Link to="/projects" className="cs-pager__link">
              <span className="cs-pager__dir"><span aria-hidden="true">←</span> Back to</span>
              <span className="cs-pager__title">All projects</span>
            </Link>
            {nextProject && (
              <Link to={`/projects/${nextProject.slug}`} className="cs-pager__link cs-pager__link--next">
                <span className="cs-pager__dir">Next project <PixelArrow /></span>
                <span className="cs-pager__title">{nextProject.title}</span>
              </Link>
            )}
          </nav>
        </div>
      </div>

      <ImageLightbox image={zoomed} onClose={() => setZoomed(null)} />
    </article>
  );
}
