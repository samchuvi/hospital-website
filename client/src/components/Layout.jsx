import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ArrowUp, Info } from 'lucide-react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import Loader from './Loader.jsx';
import { WhatsAppIcon } from './Icon.jsx';
import { hospital, whatsappHref } from '../config/hospital.js';
import { useRevealOnScroll } from '../hooks/useReveal.js';

function DraftBanner() {
  if (!hospital.draftMode) return null;
  return (
    <div className="draft-banner" role="note">
      <Info size={16} aria-hidden="true" />
      <span>
        <strong>Preview draft.</strong> Items marked <span className="pending pending--inline">[… to be confirmed]</span> or “Draft” need the hospital’s confirmation before this site goes live.
      </span>
    </div>
  );
}

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // Wait for lazy pages to render before scrolling to an anchor.
      let tries = 0;
      const tick = () => {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (el) el.scrollIntoView({ block: 'start' });
        else if (tries++ < 20) setTimeout(tick, 50);
      };
      tick();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const wa = whatsappHref('Hello, I would like some information.');
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="floating-actions">
      {wa && (
        <a href={wa} className="fab fab--whatsapp" target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
          <WhatsAppIcon />
        </a>
      )}
      <button
        type="button"
        className={`fab fab--top${showTop ? ' is-visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
        aria-hidden={!showTop}
      >
        <ArrowUp size={20} aria-hidden="true" />
      </button>
    </div>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  useRevealOnScroll(pathname);
  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <DraftBanner />
      <Header />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <FloatingActions />
      <ScrollManager />
    </>
  );
}
