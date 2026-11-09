// /projects — featured SE case study first, then work grouped by world (Code / Create / Learn).
import { GithubIcon } from '../components/Icons.jsx';
import { Eyebrow, ItemRow, PixelButton, PixelCard, SectionHeading, TagList, WorldDot } from '../components/ui/index.jsx';
import { CASE_STUDY_SLUG, caseStudyProject, projectsInWorld } from '../data/projects.js';
import { worlds } from '../data/worlds.js';
import './Projects.css';

const isTodo = s => !s || /^TODO/i.test(s);

/** Short role text for list rows. Team projects always say they are team work. */
function rowRole(p) {
  if (!Array.isArray(p.team) || p.team.length === 0) return null;
  const team = `Team of ${p.team.length}`;
  return isTodo(p.role) ? team : `${team} · ${p.role}`;
}

const hrefFor = p => (p.slug === CASE_STUDY_SLUG ? '/case-study' : `/projects/${p.slug}`);

function FeaturedCaseStudy({ project: p }) {
  if (!p) return null;
  const teamSize = Array.isArray(p.team) ? p.team.length : 0;
  return (
    <section className="projects-featured" aria-labelledby="featured-title">
      <PixelCard className="projects-featured__card" data-spray-surface="true">
        <div className="projects-featured__badge" aria-hidden="true">★</div>
        <Eyebrow world={p.world}>★ Featured case study · Software engineering project</Eyebrow>
        <h2 id="featured-title" className="projects-featured__title">{p.title}</h2>
        {p.subtitle && <p className="projects-featured__subtitle">{p.subtitle}</p>}
        {p.summary && <p className="prose projects-featured__summary">{p.summary}</p>}
        <TagList tags={p.tags || []} />
        <dl className="projects-featured__facts">
          {teamSize > 0 && (
            <div>
              <dt>Team</dt>
              <dd>Team project · {teamSize} members</dd>
            </div>
          )}
          <div>
            <dt>My role</dt>
            <dd>{isTodo(p.role) ? 'To be added (see case study)' : p.role}</dd>
          </div>
        </dl>
        <div className="projects-featured__actions">
          <PixelButton to="/case-study">Read the case study <span aria-hidden="true">→</span></PixelButton>
          {p.links?.live && (
            <PixelButton href={p.links.live} variant="outline">
              Live app <span aria-hidden="true">↗</span><span className="sr-only">(opens in a new tab)</span>
            </PixelButton>
          )}
          {p.links?.source && (
            <PixelButton href={p.links.source} variant="outline">
              <GithubIcon aria-hidden="true" /> Source<span className="sr-only">(opens in a new tab)</span>
            </PixelButton>
          )}
        </div>
      </PixelCard>
    </section>
  );
}

export default function Projects() {
  const groups = worlds.map(w => ({ ...w, items: projectsInWorld(w.id) }));

  return (
    <div className="projects-page">
      <div className="container projects-intro">
        <h1 className="projects-intro__title">Projects</h1>
        <p className="prose projects-intro__lead">
          Everything I have built, made and studied. The software engineering case study comes first;
          the rest is grouped into Code, Create and Learn. Team projects say exactly what my part was.
        </p>
      </div>

      <div className="container">
        <FeaturedCaseStudy project={caseStudyProject} />
      </div>

      <nav className="projects-pills" aria-label="Project groups">
        <ul className="container projects-pills__list">
          {groups.map(g => (
            <li key={g.id}>
              <a href={`#${g.id}`} className="projects-pill" data-world={g.id}>
                <WorldDot world={g.id} />
                <span className="projects-pill__num">{g.num}</span>
                {g.label}
                <span className="projects-pill__count">({g.items.length})</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {groups.map(g => (
        <section key={g.id} id={g.id} className="container projects-group" aria-labelledby={`${g.id}-title`}>
          <SectionHeading
            id={`${g.id}-title`}
            world={g.id}
            num={g.num}
            label={g.label}
            title={g.title}
            intro={g.intro}
          />
          <ul className="item-list">
            {g.items.map(p => (
              <ItemRow
                key={p.slug}
                to={hrefFor(p)}
                title={p.slug === CASE_STUDY_SLUG ? `★ ${p.title}` : p.title}
                description={p.subtitle}
                meta={[p.type, p.date]}
                role={rowRole(p)}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
