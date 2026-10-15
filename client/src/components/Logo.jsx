import { Link } from 'react-router-dom';
import { hospital, displayName } from '../config/hospital.js';

export function LogoMark({ size = 40 }) {
  if (hospital.logo) return <img src={hospital.logo} alt="" width={size} height={size} className="logo__img" />;
  // Neutral placeholder mark: a rounded cross. Replace via `hospital.logo`.
  return (
    <svg className="logo__mark" width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="var(--brand)" />
      <path d="M17 9.5h6a1 1 0 0 1 1 1V16h5.5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H24v5.5a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V24h-5.5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1H16v-5.5a1 1 0 0 1 1-1Z" fill="#fff" />
      <circle cx="20" cy="20" r="2.2" fill="var(--accent)" />
    </svg>
  );
}

export default function Logo({ inverted = false, onClick }) {
  return (
    <Link to="/" className={`logo${inverted ? ' logo--inverted' : ''}`} onClick={onClick} aria-label={`${displayName} — home`}>
      <LogoMark />
      <span className="logo__text">
        <span className="logo__name">{displayName}</span>
        {hospital.address.city ? <span className="logo__sub">{hospital.address.city}, Uganda</span> : <span className="logo__sub">Uganda</span>}
      </span>
    </Link>
  );
}
