import { Link } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';

function initials(name) {
  return name
    .replace(/^(Dr\.?|Prof\.?|Mr\.?|Mrs\.?|Ms\.?)\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export default function DoctorCard({ doctor }) {
  return (
    <article className="doctor-card" data-reveal>
      <div className="doctor-card__photo">
        {doctor.photo ? (
          <img src={doctor.photo} alt={`Portrait of ${doctor.name}`} loading="lazy" decoding="async" />
        ) : (
          <span className="doctor-card__initials" aria-hidden="true">{initials(doctor.name)}</span>
        )}
      </div>
      <div className="doctor-card__body">
        <h3>{doctor.name}</h3>
        {doctor.specialty && <p className="doctor-card__specialty">{doctor.specialty}</p>}
        {doctor.qualifications && <p className="doctor-card__quals">{doctor.qualifications}</p>}
        <dl className="doctor-card__meta">
          {doctor.department && (
            <div>
              <dt>Department</dt>
              <dd>{doctor.department}</dd>
            </div>
          )}
          {doctor.availability && (
            <div>
              <dt>Availability</dt>
              <dd>{doctor.availability}</dd>
            </div>
          )}
        </dl>
        <Link
          to={`/appointments?service=${encodeURIComponent(doctor.department || '')}`}
          className="btn btn--outline btn--sm"
        >
          <CalendarCheck size={16} aria-hidden="true" />
          Request appointment
        </Link>
      </div>
    </article>
  );
}
