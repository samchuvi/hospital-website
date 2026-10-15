/*
 * ============================================================================
 *  HOSPITAL INFORMATION — EDIT THIS FILE TO CUSTOMISE THE WEBSITE
 * ============================================================================
 *
 *  Every hospital-specific detail lives here. Leave a value as `null` (or an
 *  empty list) until the hospital has CONFIRMED it in writing. The website
 *  then shows a clearly marked "to be confirmed" placeholder instead of
 *  inventing anything, and hides features that depend on it (call buttons,
 *  WhatsApp, map, structured data).
 *
 *  Before publishing:
 *    1. Fill in the confirmed details below.
 *    2. Set `verified: true` on each service the hospital actually offers.
 *    3. Set `draftMode: false` to remove the preview banner and draft badges.
 * ============================================================================
 */

export const hospital = {
  // Shows a "preview draft" banner and draft badges on unconfirmed content.
  draftMode: true,

  name: null, // e.g. 'St. Example Hospital'
  shortName: null, // e.g. 'St. Example' — used in tight spaces
  tagline: null, // e.g. 'Quality care for every family'
  logo: null, // e.g. '/images/logo.svg' (place file in client/public/images)

  contact: {
    phone: null, // e.g. '+256 700 000000' — displayed as written
    phoneSecondary: null,
    whatsapp: null, // international format, digits only, e.g. '256700000000'
    email: null, // e.g. 'info@yourhospital.ug'
  },

  address: {
    line1: null, // e.g. 'Plot 00, Example Road'
    area: null, // e.g. 'Ntinda'
    city: null, // e.g. 'Kampala'
    region: null, // e.g. 'Central Region'
    country: 'Uganda',
    landmark: null, // e.g. 'Opposite the Example Shopping Centre'
  },

  location: {
    // Only fill these in from the hospital's VERIFIED Google Maps listing.
    // Google Maps → search the hospital → Share → "Embed a map" → copy the
    // src="..." URL into mapEmbedUrl. Copy the "Send a link" URL into mapLink.
    mapEmbedUrl: null,
    mapLink: null,
    latitude: null,
    longitude: null,
  },

  // Confirmed opening hours. Leave empty until verified.
  // Example: [{ days: 'Monday – Friday', hours: '8:00 AM – 6:00 PM' }]
  openingHours: [],
  // Only set if the hospital confirms a 24-hour service, e.g. 'Emergency: open 24 hours'.
  emergencyNote: null,

  // Only add links the hospital actually owns.
  // Example: [{ label: 'Facebook', url: 'https://facebook.com/yourhospital' }]
  social: [],

  about: {
    overview: null, // 2–4 sentences describing the hospital
    mission: null,
    vision: null,
    values: [], // e.g. [{ title: 'Compassion', text: '...' }]
    history: null, // e.g. 'Founded in 20XX ...'
    facilities: [], // verified facilities, e.g. ['Laboratory', 'Pharmacy', 'Maternity ward']
  },

  // Confirmed medical staff ONLY. Never add names or credentials that the
  // hospital has not provided and approved for publication.
  // Example:
  // { name: 'Dr. Jane Example', qualifications: 'MBChB, MMed (Paediatrics)',
  //   specialty: 'Paediatrician', department: 'Child Health',
  //   photo: '/images/doctors/jane.jpg', availability: 'Mon, Wed, Fri' }
  doctors: [],

  // Photographs the hospital has authorised for use. Put files in
  // client/public/images/gallery/ and list them here. Do not include
  // identifiable patients without their written consent.
  // Example: { src: '/images/gallery/reception.jpg', alt: 'Main reception', category: 'Reception' }
  gallery: [],

  // Public website address once known, without trailing slash. Also set
  // VITE_SITE_URL in the deployment so the sitemap and canonical tags work.
  siteUrl: import.meta.env.VITE_SITE_URL || null,
};

/*
 * Services. Descriptions are deliberately general and make no clinical
 * claims. Set `verified: true` only for services the hospital confirms.
 * Unverified services are labelled as drafts while draftMode is true and
 * are HIDDEN when draftMode is false.
 */
export const services = [
  {
    slug: 'outpatient',
    title: 'Outpatient services',
    icon: 'Stethoscope',
    summary: 'Consultations and follow-up visits for patients who do not need to stay overnight.',
    verified: false,
  },
  {
    slug: 'consultations',
    title: 'Medical consultations',
    icon: 'ClipboardList',
    summary: 'Assessment and advice from clinicians for a wide range of general health concerns.',
    verified: false,
  },
  {
    slug: 'laboratory',
    title: 'Laboratory services',
    icon: 'Microscope',
    summary: 'Collection and testing of samples to support diagnosis and treatment decisions.',
    verified: false,
  },
  {
    slug: 'diagnostics',
    title: 'Diagnostic imaging',
    icon: 'ScanLine',
    summary: 'Imaging examinations requested by clinicians to help understand a patient’s condition.',
    verified: false,
  },
  {
    slug: 'maternity',
    title: 'Maternity services',
    icon: 'HeartPulse',
    summary: 'Care for mothers before, during and after childbirth.',
    verified: false,
  },
  {
    slug: 'child-health',
    title: 'Child health',
    icon: 'Baby',
    summary: 'Healthcare for babies, children and adolescents, including routine check-ups.',
    verified: false,
  },
  {
    slug: 'inpatient',
    title: 'Inpatient care',
    icon: 'BedDouble',
    summary: 'Admission and ward-based care for patients who need to stay under observation or treatment.',
    verified: false,
  },
  {
    slug: 'pharmacy',
    title: 'Pharmacy',
    icon: 'Pill',
    summary: 'Dispensing of prescribed medicines with guidance on how to take them safely.',
    verified: false,
  },
  {
    slug: 'dental',
    title: 'Dental services',
    icon: 'Smile',
    summary: 'Examination and treatment for teeth and gum health.',
    verified: false,
  },
  {
    slug: 'emergency',
    title: 'Emergency services',
    icon: 'Siren',
    summary: 'Urgent assessment and care. Confirm availability and hours with the hospital before publishing.',
    verified: false,
  },
];

// ---------------------------------------------------------------------------
// Helpers — you should not need to edit below this line.
// ---------------------------------------------------------------------------

export const PLACEHOLDER_NAME = '[Hospital Name]';

export const displayName = hospital.name || PLACEHOLDER_NAME;
export const shortName = hospital.shortName || hospital.name || PLACEHOLDER_NAME;

export const visibleServices = hospital.draftMode ? services : services.filter((s) => s.verified);

export function telHref(phone) {
  return phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null;
}

export function whatsappHref(text = '') {
  const n = hospital.contact.whatsapp;
  if (!n) return null;
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${n.replace(/\D/g, '')}${q}`;
}

export function fullAddress() {
  const a = hospital.address;
  const parts = [a.line1, a.area, a.city, a.country].filter(Boolean);
  // Only the country is known → treat the address as missing.
  return parts.length > 1 ? parts.join(', ') : null;
}

export function directionsHref() {
  const loc = hospital.location;
  if (loc.mapLink) return loc.mapLink;
  if (loc.latitude != null && loc.longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`;
  }
  const addr = fullAddress();
  if (hospital.name && addr) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hospital.name}, ${addr}`)}`;
  }
  return null;
}
