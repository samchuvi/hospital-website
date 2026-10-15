import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ServiceIcon from './Icon.jsx';
import { DraftBadge } from './Pending.jsx';

export default function ServiceCard({ service, detailed = false, headingLevel = 3 }) {
  const H = `h${headingLevel}`;
  return (
    <article className={`service-card${detailed ? ' service-card--detailed' : ''}`} id={detailed ? service.slug : undefined} data-reveal>
      <div className="service-card__icon">
        <ServiceIcon name={service.icon} />
      </div>
      <div className="service-card__body">
        <H className="service-card__title">
          {service.title}
          {!service.verified && <DraftBadge />}
        </H>
        <p>{service.summary}</p>
      </div>
      <Link
        to={`/appointments?service=${encodeURIComponent(service.title)}`}
        className="service-card__link"
        aria-label={`Request an appointment for ${service.title}`}
      >
        Request appointment <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}
