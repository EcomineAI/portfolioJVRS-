// /about — background, interests, evidence-based skills, troubleshooting, live activity, journey.
import { Link } from 'react-router-dom';
import ActivityPanel from '../activity/ActivityPanel.jsx';
import { Eyebrow, PixelCard, SectionHeading, Todo } from '../components/ui/index.jsx';
import { profile } from '../data/profile.js';
import { CASE_STUDY_SLUG, projectBySlug } from '../data/projects.js';
import { skillGroups, troubleshooting } from '../data/skills.js';
import './About.css';

const MAX_LVL = 5;
const hrefFor = slug => (slug === CASE_STUDY_SLUG ? '/case-study' : `/projects/${slug}`);

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

function XpBar({ name, count }) {
  const lvl = Math.min(count, MAX_LVL);
  return (
    <span
      className="xp-bar"
      role="img"
      aria-label={`${name}: used in ${count} project${count === 1 ? '' : 's'}`}
    >
      {Array.from({ length: MAX_LVL }, (_, i) => (
        <span key={i} className={i < lvl ? 'xp-bar__seg is-on' : 'xp-bar__seg'} />
      ))}
    </span>
  );
}

function Skill({ skill }) {
  const used = skill.projects.map(slug => projectBySlug[slug]).filter(Boolean);
  const count = used.length;
  return (
    <li className="skill">
      <div className="skill__head">
        <span className="skill__name">{skill.name}</span>
        <span className="skill__lvl" aria-hidden="true">· LVL {Math.min(count, MAX_LVL)}</span>
      </div>
      <XpBar name={skill.name} count={count} />
      {count > 0 && (
        <ul className="skill__projects" aria-label={`Projects using ${skill.name}`}>
          {used.map(p => (
            <li key={p.slug}><Link to={hrefFor(p.slug)}>{p.title}</Link></li>
          ))}
        </ul>
      )}
    </li>
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
          intro="No self-rated percentages. Each skill is levelled by the projects that actually use it."
        />
        <p className="skills-legend">
          <span className="xp-bar xp-bar--demo" aria-hidden="true">
            <span className="xp-bar__seg is-on" /><span className="xp-bar__seg" />
          </span>
          Level = number of my projects that use it (max {MAX_LVL}).
        </p>
        <div className="skill-groups">
          {skillGroups.map(g => (
            <PixelCard key={g.id} as="section" pad className="skill-group" aria-labelledby={`sg-${g.id}`} data-spray-surface="true">
              <h3 id={`sg-${g.id}`} className="skill-group__title">{g.title}</h3>
              <ul className="skill-list">
                {g.skills.map(s => <Skill key={s.name} skill={s} />)}
              </ul>
            </PixelCard>
          ))}
        </div>
      </section>

      {/* ---- Troubleshooting skill tree ---- */}
      <section className="container section about-section" aria-labelledby="trouble-title">
        <SectionHeading
          id="trouble-title"
          num="02"
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
          num="03"
          label="Proof of work"
          title="What I've been shipping"
          intro="My public GitHub activity over the last year, updated on every deploy."
        />
        <ActivityPanel headingLevel="h3" />
      </section>

      {/* ---- Journey ---- */}
      <section className="container section about-section" aria-labelledby="journey-title">
        <SectionHeading id="journey-title" num="04" label="Journey" title="So far" />
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
