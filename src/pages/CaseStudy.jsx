// /case-study — Askademic, the featured software engineering project (course R3/R4).
// Content comes from src/data/caseStudy.js; owner role/contributions also read from projects.js.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GithubIcon } from '../components/Icons.jsx';
import { Eyebrow, PixelArrow, PixelButton, PixelCard, TagList, Todo } from '../components/ui/index.jsx';
import { caseStudy } from '../data/caseStudy.js';
import { CASE_STUDY_SLUG, caseStudyProject, projects } from '../data/projects.js';
import './CaseStudy.css';

/** Display-only cleanup: drop "(README)" source markers. The data stays untouched. */
const clean = s => (typeof s === 'string' ? s.replace(/\s*\(README\)/gi, '').trim() : s);
const num = i => String(i + 1).padStart(2, '0');
const isTodo = s => !s || /^TODO/i.test(s);
const arr = v => (Array.isArray(v) ? v : []);

/** Sections that get empty image frames until real screenshots exist. */
const IMAGE_SLOTS = {
  designs: [
    { ratio: '16 / 10', label: 'Wireframe / mockup' },
    { ratio: '16 / 10', label: 'Style decisions' },
  ],
  result: [
    { ratio: '16 / 9', label: 'Desktop screenshot' },
    { ratio: '9 / 16', label: 'Phone screenshot' },
  ],
};

/** Tracks which section is currently being read. */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join('|');
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const els = key.split('|').map(id => document.getElementById(id)).filter(Boolean);
    const obs = new IntersectionObserver(
      entries => {
        const hit = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
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
    <nav className="cs-toc" aria-labelledby="cs-toc-title">
      <h2 id="cs-toc-title" className="cs-toc__title">In this story</h2>
      <ol className="cs-toc__list">
        {sections.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="cs-toc__link"
              aria-current={active === s.id ? 'true' : undefined}
            >
              <span className="cs-toc__num">{num(i)}</span>
              <span>{s.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ImageSlots({ id, images }) {
  const real = arr(images);
  if (real.length) {
    return (
      <div className="cs-gallery">
        {real.map((img, i) => (
          <figure key={i} className="cs-frame">
            <img src={img.src} alt={img.alt || ''} loading="lazy" />
            {img.caption && <figcaption>{img.caption}</figcaption>}
          </figure>
        ))}
      </div>
    );
  }
  const slots = IMAGE_SLOTS[id];
  if (!slots) return null;
  return (
    <div className="cs-gallery" aria-hidden="true">
      {slots.map((s, i) => (
        <div key={i} className={`cs-frame cs-frame--empty${s.ratio === '9 / 16' ? ' cs-frame--tall' : ''}`}>
          <div className="cs-frame__box" style={{ aspectRatio: s.ratio }}>
            <span className="cs-frame__label">{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Role section: prefers real data from projects.js, otherwise shows the TODO. */
function RoleContent({ section }) {
  const p = caseStudyProject || {};
  const team = arr(p.team);
  const contributions = arr(p.contributions);
  const hasRole = !isTodo(p.role);
  return (
    <>
      {team.length > 0 && (
        <p>
          Team of {team.length}: {team.join(', ')}.
        </p>
      )}
      {hasRole && <p><strong>My role:</strong> {p.role}</p>}
      {contributions.length > 0 && (
        <>
          <p><strong>My contributions:</strong></p>
          <ul>{contributions.map((c, i) => <li key={i}>{clean(c)}</li>)}</ul>
        </>
      )}
      {section.todo && (!hasRole || contributions.length === 0) && <Todo>{section.todo}</Todo>}
    </>
  );
}

function SectionBody({ section: s }) {
  if (s.id === 'role') return <RoleContent section={s} />;
  return (
    <>
      {arr(s.body).map((t, i) => <p key={i}>{clean(t)}</p>)}

      {arr(s.goals).length > 0 && (
        <>
          <h3 className="cs-h3">Goals</h3>
          <ul className="cs-checklist">{s.goals.map((g, i) => <li key={i}>{clean(g)}</li>)}</ul>
        </>
      )}

      {arr(s.users).length > 0 && (
        <ul className="cs-users">
          {s.users.map(u => (
            <li key={u.name} className="cs-user">
              <h3 className="cs-user__name">{u.name}</h3>
              <p>{clean(u.need)}</p>
            </li>
          ))}
        </ul>
      )}

      {arr(s.steps).length > 0 && (
        <ol className="cs-timeline">
          {s.steps.map((st, i) => (
            <li key={i} className="cs-step">
              <span className="cs-step__marker" aria-hidden="true">{num(i)}</span>
              <div className="cs-step__body">
                <p className="cs-step__date">{st.date}</p>
                <h3 className="cs-step__title">{st.title}</h3>
                <p>{clean(st.text)}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {arr(s.highlights).length > 0 && (
        <>
          <h3 className="cs-h3">Design highlights</h3>
          <ul className="cs-bullets">{s.highlights.map((h, i) => <li key={i}>{clean(h)}</li>)}</ul>
        </>
      )}

      {arr(s.features).length > 0 && (
        <>
          <h3 className="cs-h3">Key features</h3>
          <ul className="cs-bullets">{s.features.map((f, i) => <li key={i}>{clean(f)}</li>)}</ul>
        </>
      )}

      {s.todo && <Todo>{s.todo}</Todo>}

      <ImageSlots id={s.id} images={s.images} />
    </>
  );
}

export default function CaseStudy() {
  const cs = caseStudy;
  const sections = arr(cs.sections);
  const active = useActiveSection(sections.map(s => s.id));
  const tags = arr(caseStudyProject?.tags);
  const nextProject = projects.find(p => p.slug !== CASE_STUDY_SLUG);

  return (
    <article className="cs-page">
      {/* ---- Hero ---- */}
      <header className="container cs-hero">
        <Link to="/projects" className="cs-back"><span aria-hidden="true">←</span> Projects</Link>
        <PixelCard className="cs-hero__card" data-spray-surface="true">
          <Eyebrow world="code">Featured case study · Software engineering project</Eyebrow>
          <h1 className="cs-hero__title">{cs.title}</h1>
          {cs.tagline && <p className="cs-hero__tagline">{clean(cs.tagline)}</p>}
          {cs.formerNames && (
            <p className="cs-hero__former">
              <span className="cs-hero__former-label">Formerly</span> {cs.formerNames}
            </p>
          )}
          {arr(cs.meta).length > 0 && (
            <dl className="cs-meta">
              {cs.meta.map(m => (
                <div key={m.label} className="cs-meta__item">
                  <dt>{m.label}</dt>
                  <dd>{clean(m.value)}</dd>
                </div>
              ))}
            </dl>
          )}
          <TagList tags={tags} />
          <ExternalButtons links={cs.links} />
        </PixelCard>
      </header>

      {/* ---- Tools ---- */}
      {arr(cs.stack).length > 0 && (
        <section className="container cs-tools" aria-labelledby="cs-tools-title">
          <h2 id="cs-tools-title" className="cs-tools__title">Tools and their roles</h2>
          <ul className="cs-tools__list">
            {cs.stack.map(t => (
              <li key={t.name} className="cs-tool">
                <span className="cs-tool__name">{t.name}</span>
                <span className="cs-tool__role">{clean(t.role)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

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
                <SectionBody section={s} />
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
    </article>
  );
}
