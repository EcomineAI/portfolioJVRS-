import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { navItems, profile } from '../../data/profile.js';
import { prefetchRoute } from '../../routes.js';
import { MoonIcon, SunIcon, VolumeOffIcon, VolumeOnIcon } from '../Icons.jsx';
import { useSound } from '../../sound/SoundContext.jsx';
import SprayButton from '../../spray/SprayButton.jsx';

const BugButton = lazy(() => import('../../bugEvent/BugButton.jsx'));

export function Logo({ className = '' }) {
  return (
    <Link to="/" className={`logo ${className}`} data-uisfx="back" data-uisfx-pack="minimal" aria-label={`${profile.name.display}, home`}>
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
    return () => { document.removeEventListener('keydown', onKey); };
  }, [open]);

  const { enabled: soundEnabled, toggleEnabled: toggleSound } = useSound();
  const isDark = theme === 'dark';

  return (
    <>
      <header className="site-header" data-no-spray="true">
        <div className="site-header__inner container">
          <Logo />

          <nav className="site-nav" aria-label="Main" data-uisfx-pack="minimal">
            <ul className="site-nav__list">
              {navItems.map(item => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className="site-nav__link"
                    data-uisfx="forward"
                    onMouseEnter={() => prefetchRoute(item.to)}
                    onFocus={() => prefetchRoute(item.to)}
                    onTouchStart={() => prefetchRoute(item.to)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-header__tools">
            {bugUnlocked && (
              <Suspense fallback={null}>
                <BugButton onHide={hideBug} />
              </Suspense>
            )}
            <SprayButton />
            <button
              type="button"
              className="pixel-btn pixel-btn--outline pixel-btn--icon"
              onClick={toggleSound}
              data-no-sfx="true"
              aria-pressed={soundEnabled}
              aria-label={soundEnabled ? 'Mute UI sounds' : 'Unmute UI sounds'}
              title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
            >
              {soundEnabled ? <VolumeOnIcon /> : <VolumeOffIcon />}
            </button>
            <button
              type="button"
              className="pixel-btn pixel-btn--outline pixel-btn--icon"
              onClick={onToggleTheme}
              data-uisfx={isDark ? 'toggle-off' : 'toggle-on'}
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
              data-uisfx={open ? 'close' : 'open'}
              data-uisfx-pack="minimal"
              onClick={() => setOpen(o => !o)}
            >
              <span className={`menu-icon${open ? ' is-open' : ''}`} aria-hidden="true"><span /><span /><span /></span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`mobile-menu${open ? ' is-open' : ''}`}
        hidden={!open}
        data-uisfx-pack="minimal"
        onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
      >
        <nav className="mobile-menu__panel" aria-label="Mobile">
          <ul>
            {navItems.map((item, i) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className="mobile-menu__link"
                  data-uisfx="forward"
                  onFocus={() => prefetchRoute(item.to)}
                  onTouchStart={() => prefetchRoute(item.to)}
                  onClick={() => setOpen(false)}
                >
                  <span className="mobile-menu__num" aria-hidden="true">0{i + 1}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
