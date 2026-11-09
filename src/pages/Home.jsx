// Home: dot-matrix hero (portrait + name + live activity) with buddies → featured case study → Code / Create / Learn.
import {
  PixelButton, PixelCard, TagList, WorldDot, Eyebrow, SectionHeading,
  ItemRow, ViewAll, Reveal,
} from '../components/ui/index.jsx';
import { profile } from '../data/profile.js';
import { worlds } from '../data/worlds.js';
import { caseStudyProject, projectsInWorld, CASE_STUDY_SLUG } from '../data/projects.js';
import BuddyFloor from '../buddies/BuddyFloor.jsx';
import PixelSprite from '../buddies/PixelSprite.jsx';
import { worldIcons } from '../buddies/sprites.js';
import DotPortrait from '../dotmatrix/DotPortrait.jsx';
import DotText from '../dotmatrix/DotText.jsx';
import ActivityPanel from '../activity/ActivityPanel.jsx';
import './Home.css';

const NAME_LINES = [profile.name.first.toUpperCase(), profile.name.last.toUpperCase()];
const HERO_STACK = ['React', 'Supabase', 'Python', 'LM Studio'];

const MAX_ROWS = 4;

const projectPath = p => (p.slug === CASE_STUDY_SLUG ? '/case-study' : `/projects/${p.slug}`);

// Team projects show my role; until the owner fills it in, show the team size instead of a TODO.
const roleFor = p => {
  if (!p.team) return undefined;
  if (!p.role || p.role.startsWith('TODO')) return `Team of ${p.team.length}`;
  return p.role;
};

function WorldPlaceholder({ world }) {
  const icon = worldIcons[world];
  return (
    <div className="home-ph" data-world={world}>
      <PixelSprite grid={icon.grid} palette={icon.palette} scale={6} />
    </div>
  );
}

function Hero() {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="container home-hero__grid">
        {/* Portrait: dot-matrix of my photo; pixels move away from the cursor */}
        <figure className="home-hero__portrait pixel-card" data-spray-surface="true">
          <DotPortrait />
          <figcaption className="home-hero__portrait-cap">
            <span className="home-hero__live-dot" aria-hidden="true" /> {profile.name.full}
            <span className="sr-only"> — dot-matrix portrait</span>
          </figcaption>
        </figure>

        <div className="home-hero__main">
          <h1 id="home-title" className="home-hero__name" data-spray="true">
            <span className="sr-only">{profile.name.full}</span>
            <DotText lines={NAME_LINES} />
          </h1>

          <p className="home-hero__status">
            <span className="home-hero__live-dot" aria-hidden="true" />
            <span className="home-hero__status-tag">Open to work</span>
            <span aria-hidden="true" className="home-hero__status-sep">//</span>
            <span>{profile.role}</span>
          </p>

          <p className="home-hero__meta">
            {profile.program} · {profile.school} · {profile.location}
          </p>

          <ul className="home-hero__chips" aria-label="Main tools">
            {HERO_STACK.map(t => <li key={t}>{t}</li>)}
          </ul>

          <p className="home-hero__lead">{profile.lead}</p>

          <div className="home-hero__ctas">
            <PixelButton href={profile.resume} download size="sm">
              <span aria-hidden="true">↓</span> Download résumé
            </PixelButton>
            <PixelButton to="/case-study" variant="outline" size="sm">
              <span aria-hidden="true">★</span> View the case study
            </PixelButton>
            <PixelButton to="/contact" variant="ghost" size="sm">Contact</PixelButton>
          </div>

          <nav className="home-hero__jump" aria-label="Jump to a section">
            <ul>
              {worlds.map(w => (
                <li key={w.id}>
                  <a href={`#${w.id}`} className="home-pill" data-world={w.id}>
                    <WorldDot world={w.id} />
                    <span className="home-pill__num">{w.num}</span>
                    {w.label}
                  </a>
                </li>
              ))}
            </ul>
            <span className="home-hero__jump-arrow" aria-hidden="true">↓</span>
          </nav>
        </div>

        <div className="home-hero__activity">
          <ActivityPanel headingLevel="h2" id="hero-activity-title" />
        </div>
      </div>

      <div className="container">
        <BuddyFloor />
      </div>
    </section>
  );
}

function FeaturedCaseStudy() {
  const p = caseStudyProject;
  if (!p) return null;
  const teamSize = p.team?.length;
  return (
    <Reveal as="section" className="section home-featured" aria-labelledby="featured-title">
      <div className="container">
        <SectionHeading id="featured-title" label="★ Software engineering project" title="Featured case study" />
        <PixelCard as="article" pad className="home-featured__card" data-spray-surface="true" aria-labelledby="featured-project-title">
          <div className="home-featured__body">
            <Eyebrow world={p.world} num="★">{p.type}</Eyebrow>
            <h3 id="featured-project-title" className="home-featured__title">{p.title}</h3>
            <p className="home-featured__subtitle">{p.subtitle}</p>
            <p className="prose home-featured__summary">{p.summary}</p>
            <TagList tags={p.tags} />
            {teamSize && (
              <p className="home-featured__team">
                Team project · {teamSize} members
                {p.status && <span className="home-featured__status"> · {p.status}</span>}
              </p>
            )}
            <div className="home-featured__actions">
              <PixelButton to="/case-study">Read the case study <span aria-hidden="true">→</span></PixelButton>
              {p.links?.live && (
                <PixelButton href={p.links.live} variant="outline">
                  Live app <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span>
                </PixelButton>
              )}
              {p.links?.source && (
                <PixelButton href={p.links.source} variant="outline">
                  Source <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span>
                </PixelButton>
              )}
            </div>
          </div>
          <div className="home-featured__art" aria-hidden="true">
            <WorldPlaceholder world={p.world} />
          </div>
        </PixelCard>
      </div>
    </Reveal>
  );
}

function WorldSection({ world }) {
  const items = projectsInWorld(world.id);
  return (
    <Reveal as="section" id={world.id} className="section home-world" aria-labelledby={`${world.id}-title`}>
      <div className="container">
        <SectionHeading
          id={`${world.id}-title`}
          world={world.id}
          num={world.num}
          label={world.label}
          title={world.title}
          intro={world.intro}
        />
        <ul className="item-list">
          {items.slice(0, MAX_ROWS).map(p => (
            <ItemRow
              key={p.slug}
              to={projectPath(p)}
              title={p.title}
              description={p.subtitle}
              meta={[p.type, p.date]}
              role={roleFor(p)}
            />
          ))}
        </ul>
        <ViewAll to={`/projects#${world.id}`} label={`View all ${world.label.toLowerCase()}`} count={items.length} />
      </div>
    </Reveal>
  );
}

export default function Home() {
  return (
    <div className="home">
      <Hero />
      <FeaturedCaseStudy />
      {worlds.map(w => <WorldSection key={w.id} world={w} />)}
    </div>
  );
}
