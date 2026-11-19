import { Link } from 'react-router-dom';
import { gmailCompose, navItems, profile } from '../../data/profile.js';
import { BriefcaseIcon, DownloadIcon, GithubIcon, LinkedinIcon, MailIcon } from '../Icons.jsx';

const CONNECT = [
  { href: profile.links.github, label: `GitHub (@${profile.links.githubHandle})`, Icon: GithubIcon, external: true },
  { href: profile.links.linkedin, label: 'LinkedIn profile', Icon: LinkedinIcon, external: true },
  { href: gmailCompose, label: `Email ${profile.email}`, Icon: MailIcon, external: true },
  { href: profile.links.onlinejobs, label: 'OnlineJobs.ph profile', Icon: BriefcaseIcon, external: true },
  { href: profile.resume, label: 'Download résumé (PDF)', Icon: DownloadIcon, download: true },
];

/** Site footer: navigation · connect. */
export default function Footer() {
  return (
    <footer className="site-footer" data-no-spray="true">
      <div className="container">
        <div className="site-footer__grid">
          <nav className="site-footer__col" aria-labelledby="footer-nav-title" data-uisfx-pack="minimal">
            <h2 id="footer-nav-title" className="site-footer__label" data-world="code"><span className="world-dot" aria-hidden="true" />Navigation</h2>
            <ul className="site-footer__nav">
              {navItems.map(item => <li key={item.to}><Link to={item.to} data-uisfx="forward">{item.label}</Link></li>)}
            </ul>
          </nav>

          <div className="site-footer__col" data-uisfx-pack="studio">
            <h2 className="site-footer__label" data-world="create"><span className="world-dot" aria-hidden="true" />Connect</h2>
            <ul className="site-footer__social">
              {CONNECT.map(({ href, label, Icon, external, download }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="site-footer__icon"
                    aria-label={label}
                    title={label}
                    data-uisfx={download ? 'complete' : 'open'}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    {...(download ? { download: '' } : {})}
                  >
                    <Icon width="20" height="20" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="site-footer__text">Let&apos;s connect and build something awesome together!</p>
          </div>
        </div>

      </div>
    </footer>
  );
}
