// /contact — Say hi (email, Gmail, GitHub, OnlineJobs.ph, résumé) + FAQ + availability.
// The Layout skips its own Say hi block on this route, so it appears exactly once.
import { useEffect, useState } from 'react';
import SayHi from '../components/layout/SayHi.jsx';
import { Eyebrow, PixelCard, SectionHeading } from '../components/ui/index.jsx';
import { faqs } from '../data/faq.js';
import { profile } from '../data/profile.js';
import './Contact.css';

const TZ = 'Asia/Manila';

function useLocalTime() {
  const read = () => {
    try {
      return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ }).format(new Date());
    } catch { return null; }
  };
  const [time, setTime] = useState(read);
  useEffect(() => {
    const id = setInterval(() => setTime(read()), 30000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function Contact() {
  const time = useLocalTime();

  return (
    <div className="contact">
      <header className="container contact-intro">
        <Eyebrow world="create">Get in touch</Eyebrow>
        <h1 className="contact-intro__title">Contact</h1>
        <p className="prose contact-intro__lead">
          The quickest way to reach me is email. I usually reply within a day or two.
        </p>
      </header>

      <SayHi headingLevel="h2" />

      <section className="container section contact-more" aria-labelledby="faq-title">
        <div className="contact-faq">
          <SectionHeading id="faq-title" label="FAQ" title="Before you ask" />
          <div className="faq">
            {faqs.map(f => (
              <details key={f.q} className="faq__item">
                <summary className="faq__q">{f.q}</summary>
                <p className="faq__a prose">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <PixelCard as="aside" pad className="status-card" aria-labelledby="status-title" data-spray-surface="true">
          <h2 id="status-title" className="status-card__title">Status</h2>
          <dl className="status-card__list">
            <div>
              <dt>Availability</dt>
              <dd><span className="status-card__dot" aria-hidden="true" /> {profile.status}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{profile.location}</dd>
            </div>
            <div>
              <dt>Timezone</dt>
              <dd>
                {profile.timezone} (Philippine Time)
                {time && <span className="status-card__time"> · {time} for me right now</span>}
              </dd>
            </div>
          </dl>
        </PixelCard>
      </section>
    </div>
  );
}
