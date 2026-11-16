// /projects/:slug — short project page. Team projects always show My role + My contributions (course R3).
import { Link, useParams } from 'react-router-dom';
import { GithubIcon } from '../components/Icons.jsx';
import { Eyebrow, PixelArrow, PixelButton, PixelCard, TagList, Todo } from '../components/ui/index.jsx';
import { CASE_STUDY_SLUG, projectBySlug, projects } from '../data/projects.js';
import { worldById } from '../data/worlds.js';
import './ProjectDetail.css';

const OWNER = 'June Vic M. Abello';
const isTodo = s => !s || /^TODO/i.test(s);
const hrefFor = p => (p.slug === CASE_STUDY_SLUG ? '/case-study' : `/projects/${p.slug}`);

function NotFound({ slug }) {
  return (
    <div className="container pd-page pd-missing">
      <Link to="/projects" className="pd-back"><span aria-hidden="true">←</span> Projects</Link>
      <PixelCard pad className="pd-missing__card" data-spray-surface="true">
        <p className="pd-missing__code" aria-hidden="true">404</p>
        <h1 className="pd-missing__title">Project not found</h1>
        <p className="prose">
          There is no project called <strong>“{slug}”</strong>. It may have been renamed or moved.
        </p>
        <PixelButton to="/projects">Back to all projects</PixelButton>
      </PixelCard>
    </div>
  );
}

function CoverPanel({ project: p }) {
  if (p.cover) {
    return (
      <figure className="pd-cover">
        <img src={p.cover} alt={p.coverAlt || `Screenshot of ${p.title}`} onError={e => { e.currentTarget.parentElement.hidden = true; }} />
        {p.coverCaption && <figcaption>{p.coverCaption}</figcaption>}
      </figure>
    );
  }
  return (
    <div className="pd-cover pd-cover--placeholder" data-world={p.world} aria-hidden="true">
      <span className="pd-cover__glyph">{p.title.slice(0, 2).toUpperCase()}</span>
      <span className="pd-cover__note">screenshot coming soon</span>
    </div>
  );
}

function TeamBlock({ project: p }) {
  const team = Array.isArray(p.team) ? p.team : [];
  const contributions = Array.isArray(p.contributions) ? p.contributions : [];
  const roleMissing = isTodo(p.role);

  if (team.length === 0) {
    return (
      <section className="pd-role pd-role--solo" aria-labelledby="pd-role-title">
        <h2 id="pd-role-title" className="pd-h2">My role</h2>
        <p className="prose">{p.role || 'Solo project'}</p>
      </section>
    );
  }

  return (
    <PixelCard as="section" className="pd-team" aria-labelledby="pd-team-title" data-spray-surface="true">
      <h2 id="pd-team-title" className="pd-h2">Team project</h2>

      <div className="pd-team__grid">
        <div>
          <h3 className="pd-h3">Team ({team.length})</h3>
          <ul className="pd-team__members">
            {team.map(m => (
              <li key={m}>
                {m}
                {m === OWNER && <span className="pd-team__me">me</span>}
              </li>
            ))}
          </ul>
        </div>

        <div className="pd-team__mine">
          <h3 className="pd-h3">My role</h3>
          {roleMissing ? (
            <Todo>Write your role on this team (e.g. “Lead developer · frontend & Supabase”). Set <code>role</code> in src/data/projects.js.</Todo>
          ) : (
            <p className="prose pd-team__role">{p.role}</p>
          )}

          <h3 className="pd-h3">My contributions</h3>
          {contributions.length === 0 ? (
            <Todo>List exactly what YOU built or designed, separate from your teammates. Fill <code>contributions</code> in src/data/projects.js.</Todo>
          ) : (
            <ul className="prose pd-team__list">
              {contributions.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          )}
        </div>
      </div>
    </PixelCard>
  );
}

function Pager({ slug }) {
  const i = projects.findIndex(p => p.slug === slug);
  const prev = i > 0 ? projects[i - 1] : null;
  const next = i >= 0 && i < projects.length - 1 ? projects[i + 1] : null;
  return (
    <nav className="pd-pager" aria-label="More projects">
      {prev ? (
        <Link to={hrefFor(prev)} className="pd-pager__link pd-pager__link--prev">
          <span className="pd-pager__dir"><span aria-hidden="true">←</span> Previous</span>
          <span className="pd-pager__title">{prev.title}</span>
        </Link>
      ) : <span />}
      {next ? (
        <Link to={hrefFor(next)} className="pd-pager__link pd-pager__link--next">
          <span className="pd-pager__dir">Next <PixelArrow /></span>
          <span className="pd-pager__title">{next.title}</span>
        </Link>
      ) : (
        <Link to="/projects" className="pd-pager__link pd-pager__link--next">
          <span className="pd-pager__dir">That's all <PixelArrow /></span>
          <span className="pd-pager__title">All projects</span>
        </Link>
      )}
    </nav>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const p = projectBySlug[slug];
  if (!p) return <NotFound slug={slug} />;

  const world = worldById[p.world];
  const links = p.links || {};

  return (
    <article className="container pd-page" data-world={p.world}>
      <Link to="/projects" className="pd-back"><span aria-hidden="true">←</span> Projects</Link>

      <header className="pd-head">
        <div className="pd-meta">
          {world && <Eyebrow world={p.world} num={world.num}>{world.label}</Eyebrow>}
          <ul className="pd-meta__list" aria-label="Project details">
            {p.type && <li>{p.type}</li>}
            {p.date && <li>{p.date}</li>}
            {p.status && <li>{p.status}</li>}
          </ul>
        </div>
        <h1 className="pd-title">{p.title}</h1>
        {p.subtitle && <p className="pd-subtitle">{p.subtitle}</p>}
        {p.summary && <div className="prose pd-summary"><p>{p.summary}</p></div>}
        <TagList tags={p.tags || []} />
        {(links.live || links.source) && (
          <div className="pd-actions">
            {links.live && (
              <PixelButton href={links.live}>
                Live <span aria-hidden="true">↗</span><span className="sr-only">(opens in a new tab)</span>
              </PixelButton>
            )}
            {links.source && (
              <PixelButton href={links.source} variant="outline">
                <GithubIcon aria-hidden="true" /> Source<span className="sr-only">(opens in a new tab)</span>
              </PixelButton>
            )}
          </div>
        )}
      </header>

      <CoverPanel project={p} />

      <TeamBlock project={p} />

      <Pager slug={p.slug} />
    </article>
  );
}
