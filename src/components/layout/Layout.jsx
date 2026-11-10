import { Outlet, useLocation } from 'react-router-dom';
import { useScrollToTop } from '../../hooks/useScrollToTop.js';
import { useTheme } from '../../hooks/useTheme.js';
import { SprayProvider } from '../../spray/SprayContext.jsx';
import SprayLayer from '../../spray/SprayLayer.jsx';
import BuddyWorld from '../../buddies/BuddyWorld.jsx';
import BugEvent from '../../bugEvent/BugEvent.jsx';
import Chatbot from '../../widgets/Chatbot.jsx';
import NowPlaying from '../../widgets/NowPlaying.jsx';
import Footer from './Footer.jsx';
import Header from './Header.jsx';
import PixelBackground from './PixelBackground.jsx';
import SayHi from './SayHi.jsx';

/** App shell. Pages render inside <main>. The shared Say hi block is skipped on /contact, which renders it as its own content. */
export default function Layout() {
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  const hideSayHi = pathname === '/contact';
  useScrollToTop();

  return (
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
      {/* Bug Attack: just-for-fun boss fight (green bug button in the header) */}
      <BugEvent />
      <NowPlaying />
      <Chatbot />
      <SprayLayer />
    </SprayProvider>
  );
}
