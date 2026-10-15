import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Clock, CalendarCheck } from 'lucide-react';
import Logo from './Logo.jsx';
import Pending from './Pending.jsx';
import { navRoutes } from '../config/routes.js';
import { hospital, telHref } from '../config/hospital.js';

function TopBar() {
  const { phone } = hospital.contact;
  const hours = hospital.openingHours[0];
  return (
    <div className="topbar">
      <div className="container topbar__inner">
        <span className="topbar__item">
          <Phone size={15} aria-hidden="true" />
          {phone ? <a href={telHref(phone)}>{phone}</a> : <Pending label="Phone number" />}
        </span>
        <span className="topbar__item topbar__item--hide-sm">
          <Clock size={15} aria-hidden="true" />
          {hours ? `${hours.days}: ${hours.hours}` : <Pending label="Opening hours" />}
        </span>
        {hospital.emergencyNote && <span className="topbar__item topbar__emergency">{hospital.emergencyNote}</span>}
      </div>
    </div>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const toggleRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mobile menu: lock page scroll, close on Escape, keep focus inside.
  useEffect(() => {
    if (!open) return undefined;
    document.body.classList.add('no-scroll');
    const panel = panelRef.current;
    panel?.querySelector('a, button')?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === 'Tab' && panel) {
        const items = [...panel.querySelectorAll('a, button')];
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <TopBar />
      <div className="container nav">
        <Logo />
        <nav className="nav__desktop" aria-label="Main">
          <ul>
            {navRoutes.map((r) => (
              <li key={r.path}>
                <NavLink to={r.path} end={r.path === '/'} className="nav__link">
                  {r.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Link to="/appointments" className="btn btn--primary nav__cta">
          <CalendarCheck size={18} aria-hidden="true" />
          Request appointment
        </Link>
        <button
          ref={toggleRef}
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      <div className={`mobile-menu${open ? ' is-open' : ''}`} id="mobile-menu" hidden={!open}>
        <div className="mobile-menu__backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
        <nav className="mobile-menu__panel" aria-label="Mobile" ref={panelRef}>
          <ul>
            {navRoutes.map((r) => (
              <li key={r.path}>
                <NavLink to={r.path} end={r.path === '/'} className="mobile-menu__link">
                  {r.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link to="/appointments" className="btn btn--primary btn--block">
            <CalendarCheck size={18} aria-hidden="true" />
            Request appointment
          </Link>
          {hospital.contact.phone && (
            <a href={telHref(hospital.contact.phone)} className="btn btn--outline btn--block">
              <Phone size={18} aria-hidden="true" />
              Call {hospital.contact.phone}
            </a>
          )}
          <button type="button" className="btn btn--ghost btn--block" onClick={() => { setOpen(false); toggleRef.current?.focus(); }}>
            Close menu
          </button>
        </nav>
      </div>
    </header>
  );
}
