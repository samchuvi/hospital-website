import { hospital } from '../config/hospital.js';

/**
 * schema.org "Hospital" data for search engines. Rendered only once the
 * hospital name is set, and only with fields that have been filled in —
 * nothing is guessed, and no ratings or reviews are ever included.
 */
export function buildHospitalSchema() {
  if (!hospital.name) return null;
  const a = hospital.address;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Hospital',
    name: hospital.name,
  };
  if (hospital.siteUrl) data.url = hospital.siteUrl;
  if (hospital.logo && hospital.siteUrl) data.logo = `${hospital.siteUrl}${hospital.logo}`;
  if (hospital.contact.phone) data.telephone = hospital.contact.phone;
  if (hospital.contact.email) data.email = hospital.contact.email;
  if (a.line1 || a.city) {
    data.address = {
      '@type': 'PostalAddress',
      ...(a.line1 && { streetAddress: a.line1 }),
      ...(a.city && { addressLocality: a.city }),
      ...(a.region && { addressRegion: a.region }),
      addressCountry: 'UG',
    };
  }
  if (hospital.location.latitude != null && hospital.location.longitude != null) {
    data.geo = { '@type': 'GeoCoordinates', latitude: hospital.location.latitude, longitude: hospital.location.longitude };
  }
  if (hospital.location.mapLink) data.hasMap = hospital.location.mapLink;
  const hours = hospital.openingHours.map((h) => h.schema).filter(Boolean);
  if (hours.length) data.openingHours = hours;
  if (hospital.social.length) data.sameAs = hospital.social.map((s) => s.url);
  return data;
}

export default function StructuredData() {
  const data = buildHospitalSchema();
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
