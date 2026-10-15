import { Link } from 'react-router-dom';
import { CalendarCheck, Phone } from 'lucide-react';
import { hospital, telHref } from '../config/hospital.js';

export default function CtaBand({
  title = 'Ready to see a clinician?',
  text = 'Send us an appointment request with your preferred date. Our team will contact you to confirm a time.',
}) {
  const { phone } = hospital.contact;
  return (
    <section className="cta-band" aria-labelledby="cta-title">
      <div className="container cta-band__inner" data-reveal>
        <div>
          <h2 id="cta-title">{title}</h2>
          <p>{text}</p>
        </div>
        <div className="cta-band__actions">
          <Link to="/appointments" className="btn btn--light">
            <CalendarCheck size={18} aria-hidden="true" />
            Request appointment
          </Link>
          {phone ? (
            <a href={telHref(phone)} className="btn btn--outline-light">
              <Phone size={18} aria-hidden="true" />
              Call {phone}
            </a>
          ) : (
            <Link to="/contact" className="btn btn--outline-light">
              <Phone size={18} aria-hidden="true" />
              Contact us
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
