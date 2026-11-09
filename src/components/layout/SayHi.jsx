import { useEffect, useRef, useState } from 'react';
import { gmailCompose, profile } from '../../data/profile.js';
import { BriefcaseIcon, GithubIcon, MailIcon } from '../Icons.jsx';
import { PixelButton } from '../ui/index.jsx';

/** "Say hi" block — ends every page (plan §2). Also the main content of /contact. */
export default function SayHi({ headingLevel = 'h2', id = 'say-hi' }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked: the mailto link still works */ }
  };

  const Heading = headingLevel;

  return (
    <section className="say-hi section" aria-labelledby={id}>
      <div className="container say-hi__inner">
        <Heading id={id} className="say-hi__title">Say hi</Heading>
        <p className="say-hi__lead prose">
          Have a project, an internship opening or a question? Email is the fastest way to reach me.
        </p>

        <div className="say-hi__email pixel-card pixel-card--pad">
          <a className="say-hi__address" href={`mailto:${profile.email}`}>{profile.email}</a>
          <div className="say-hi__actions">
            <PixelButton onClick={copy} variant="outline" size="sm" aria-live="polite">
              {copied ? 'Copied ✓' : 'Copy'}
            </PixelButton>
            <PixelButton href={gmailCompose} size="sm">
              <MailIcon /> Open Gmail
            </PixelButton>
          </div>
        </div>

        <ul className="say-hi__links">
          <li><a href={profile.links.github} target="_blank" rel="noopener noreferrer"><GithubIcon /> GitHub <span className="say-hi__muted">@{profile.links.githubHandle}</span></a></li>
          <li><a href={profile.links.onlinejobs} target="_blank" rel="noopener noreferrer"><BriefcaseIcon /> OnlineJobs.ph <span className="say-hi__muted">hire me</span></a></li>
          <li><a href={profile.resume} download><span aria-hidden="true">↓</span> Download résumé <span className="say-hi__muted">PDF</span></a></li>
        </ul>

        <p className="say-hi__muted">{profile.location} · {profile.timezone}</p>
      </div>
    </section>
  );
}
