// Home for a job application: hero (who I am, résumé, contact) → selected projects → skills → contact block.
import {
  PixelButton, SectionHeading,
  Reveal, PixelArrow,
} from '../components/ui/index.jsx';
import { profile } from '../data/profile.js';
import { projectsInWorld, CASE_STUDY_SLUG } from '../data/projects.js';
import BuddyFloor from '../buddies/BuddyFloor.jsx';
import DotText from '../dotmatrix/DotText.jsx';
import SkillKeys from '../components/showcase/SkillKeys.jsx';
import WorldList from '../components/showcase/WorldList.jsx';
import './Home.css';

const NAME_LINES = [profile.name.first.toUpperCase(), profile.name.last.toUpperCase()];
const HERO_STACK = ['JavaScript', 'Python', 'SQL', 'React', 'Supabase', 'LM Studio'];

const FEATURED_COUNT = 3;

const projectPath = p => (p.slug === CASE_STUDY_SLUG ? '/case-study' : `/projects/${p.slug}`);

// Team projects show my role; until the owner fills it in, show the team size instead of a TODO.
const roleFor = p => {
  if (!p.team) return undefined;
  if (!p.role || p.role.startsWith('TODO')) return `Team of ${p.team.length}`;
  return p.role;
};

function Hero() {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="container home-hero__grid">
        {/* Portrait photo */}
        <figure className="home-hero__portrait pixel-card" data-spray-surface="true">
          <img className="home-hero__photo" src="/pfp.jpg" alt={`Portrait of ${profile.name.full}`} width="329" height="411" />
          <figcaption className="home-hero__portrait-cap">
            {profile.name.display}, {profile.year} {profile.program} student
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
            <span aria-hidden="true" className="home-hero__status-sep">·</span>
            <span>{profile.role}</span>
          </p>


          <ul className="home-hero__chips" aria-label="Main tools">
            {HERO_STACK.map(t => <li key={t}>{t}</li>)}
          </ul>

          <p className="home-hero__lead">{profile.lead}</p>

          <div className="home-hero__ctas">
            <PixelButton href={profile.resume} download>Download résumé</PixelButton>
            <PixelButton to="/contact" variant="outline">Contact me</PixelButton>
            <PixelButton to="/projects" variant="ghost">View projects <PixelArrow /></PixelButton>
          </div>
        </div>

        <div className="home-hero__keys"><SkillKeys scrollPose /></div>
      </div>

      <div className="container">
        <BuddyFloor />
      </div>
    </section>
  );
}

function FeaturedProjects() {
  const items = projectsInWorld('code').slice(0, FEATURED_COUNT);
  return (
    <Reveal as="section" id="projects" className="section home-featured" aria-labelledby="featured-title">
      <div className="container">
        <SectionHeading
          id="featured-title"
          title="Selected projects"
          intro="Live apps with the source code for each. Askademic has a full case study."
        />
        <WorldList world="code" items={items} hrefFor={projectPath} roleFor={roleFor} />
        <div className="home-featured__actions">
          <PixelButton to="/case-study">Read the Askademic case study <PixelArrow /></PixelButton>
          <PixelButton to="/projects" variant="outline">All projects</PixelButton>
        </div>
      </div>
    </Reveal>
  );
}

export default function Home() {
  return (
    <div className="home">
      <Hero />
      <FeaturedProjects />
    </div>
  );
}
