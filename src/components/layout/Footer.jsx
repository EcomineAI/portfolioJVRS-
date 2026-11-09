import { Link } from 'react-router-dom';
import { navItems, profile } from '../../data/profile.js';
import { Logo } from './Header.jsx';

export default function Footer() {
  return (
    <footer className="site-footer" data-no-spray="true">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <Logo />
          <p>{profile.name.full} · {profile.role}</p>
        </div>
        <nav aria-label="Footer">
          <ul className="site-footer__nav">
            {navItems.map(item => <li key={item.to}><Link to={item.to}>{item.label}</Link></li>)}
          </ul>
        </nav>
        <p className="site-footer__copy">© {new Date().getFullYear()} {profile.name.full}. Built with React + Vite.</p>
      </div>
    </footer>
  );
}
