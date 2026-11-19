import { lazy, Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useScrollToTop } from '../../hooks/useScrollToTop.js';
import { useTheme } from '../../hooks/useTheme.js';
import { SprayProvider } from '../../spray/SprayContext.jsx';
import { SoundProvider } from '../../sound/SoundContext.jsx';
import SprayLayer from '../../spray/SprayLayer.jsx';
import BuddyWorld from '../../buddies/BuddyWorld.jsx';
import Chatbot from '../../widgets/Chatbot.jsx';
import Footer from './Footer.jsx';
import Header from './Header.jsx';
import PixelBackground from './PixelBackground.jsx';
import SayHi from './SayHi.jsx';

const BugEvent = lazy(() => import('../../bugEvent/BugEvent.jsx'));

/** App shell. Pages render inside <main>. The shared Say hi block is skipped on /contact, which renders it as its own content. */
export default function Layout() {
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  const hideSayHi = pathname === '/contact';
  const [bugMounted, setBugMounted] = useState(() => {
    try { return sessionStorage.getItem('bug:unlocked') === '1'; } catch { return false; }
  });
  useScrollToTop();

  useEffect(() => {
    if (bugMounted) return undefined;
    const mount = () => setBugMounted(true);
    window.addEventListener('konami:unlock', mount);
    window.addEventListener('bugevent:toggle', mount);
    return () => {
      window.removeEventListener('konami:unlock', mount);
      window.removeEventListener('bugevent:toggle', mount);
    };
  }, [bugMounted]);

  return (
    <SoundProvider>
      <SprayProvider>
        <PixelBackground />
        <a href="#main" className="skip-link">Skip to content</a>
        <Header theme={theme} onToggleTheme={toggle} />
        <main id="main" tabIndex={-1}>
          <Outlet />
        </main>
        {!hideSayHi && <SayHi />}
        <Footer />
        {/* Pixel buddies: roam every page, standing on top of cards */}
        <BuddyWorld />
        {/* Bug Attack: lazy-loaded only when unlocked via Konami code */}
        {bugMounted && (
          <Suspense fallback={null}>
            <BugEvent />
          </Suspense>
        )}
        <Chatbot />
        <SprayLayer />
      </SprayProvider>
    </SoundProvider>
  );
}
