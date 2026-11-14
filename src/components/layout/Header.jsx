import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { navItems, profile } from '../../data/profile.js';
import { MoonIcon, SunIcon } from '../Icons.jsx';
import SprayButton from '../../spray/SprayButton.jsx';
import BugButton from '../../bugEvent/BugButton.jsx';

export function Logo({ className = '' }) {
  return (
    <Link to="/" className={`logo ${className}`} aria-label={`${profile.name.display}, home`}>
      <span aria-hidden="true">&lt;{profile.initials}/&gt;</span>
    </Link>
  );
}

export default function Header({ theme, onToggleTheme }) {
  const [open, setOpen] = useState(false);
  const [bugUnlocked, setBugUnlocked] = useState(() => {
    try { return sessionStorage.getItem('bug:unlocked') === '1'; } catch { return false; }
  });
  const { pathname } = useLocation();

  const hideBug = () => {
    setBugUnlocked(false);
    try { sessionStorage.setItem('bug:unlocked', '0'); } catch { /* ignore */ }
  };

  useEffect(() => {
    const onUnlock = () => {
      setBugUnlocked(true);
      try { sessionStorage.setItem('bug:unlocked', '1'); } catch { /* ignore */ }
    };
    window.addEventListener('konami:unlock', onUnlock);
    return () => window.removeEventListener('konami:unlock', onUnlock);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  const isDark = theme === 'dark';

  return (
    <header className="site-header" data-no-spray="true">
      <div className="site-header__inner container">
        <Logo />

        <nav className="site-nav" aria-label="Main">
          <ul className="site-nav__list">
            {navItems.map(item => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className="site-nav__link">{item.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__tools">
          {bugUnlocked && <BugButton onHide={hideBug} />}
          <SprayButton />
          <button
            type="button"
            className="pixel-btn pixel-btn--outline pixel-btn--icon"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Light theme' : 'Dark theme'}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            type="button"
            className="pixel-btn pixel-btn--outline pixel-btn--icon menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(o => !o)}
          >
            <span className={`menu-icon${open ? ' is-open' : ''}`} aria-hidden="true"><span /><span /><span /></span>
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`mobile-menu${open ? ' is-open' : ''}`} hidden={!open}>
        <nav aria-label="Mobile">
          <ul>
            {navItems.map((item, i) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className="mobile-menu__link">
                  <span className="mobile-menu__num" aria-hidden="true">0{i + 1}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
