import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import Logo from './Logo.jsx';
import Pending from './Pending.jsx';
import { routes } from '../config/routes.js';
import { hospital, displayName, fullAddress, telHref, visibleServices } from '../config/hospital.js';

export default function Footer() {
  const { phone, email } = hospital.contact;
  const address = fullAddress();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo inverted />
          <p className="footer__about">
            {hospital.about.overview
              ? hospital.about.overview.split('. ')[0] + '.'
              : 'Information about our services, appointment requests and how to find us.'}
          </p>
          {hospital.social.length > 0 && (
            <ul className="footer__social">
              {hospital.social.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="footer__title">Explore</h2>
          <ul className="footer__links">
            {routes.map((r) => (
              <li key={r.path}>
                <Link to={r.path}>{r.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="footer__title">Services</h2>
          <ul className="footer__links">
            {visibleServices.slice(0, 6).map((s) => (
              <li key={s.slug}>
                <Link to={`/services#${s.slug}`}>{s.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="footer__title">Contact</h2>
          <ul className="footer__contact">
            <li>
              <Phone size={17} aria-hidden="true" />
              {phone ? <a href={telHref(phone)}>{phone}</a> : <Pending label="Phone" />}
            </li>
            <li>
              <Mail size={17} aria-hidden="true" />
              {email ? <a href={`mailto:${email}`}>{email}</a> : <Pending label="Email" />}
            </li>
            <li>
              <MapPin size={17} aria-hidden="true" />
              {address ? <span>{address}</span> : <Pending label="Address" />}
            </li>
            <li>
              <Clock size={17} aria-hidden="true" />
              {hospital.openingHours.length ? (
                <span>{hospital.openingHours.map((h) => `${h.days}: ${h.hours}`).join(' · ')}</span>
              ) : (
                <Pending label="Opening hours" />
              )}
            </li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {year} {displayName}. All rights reserved.</p>
          <p className="footer__disclaimer">
            Information on this website is general and is not a substitute for professional medical advice. In an emergency, go to the nearest emergency facility.
          </p>
          <Link to="/privacy">Privacy policy</Link>
        </div>
      </div>
    </footer>
  );
}
