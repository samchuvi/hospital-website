/*
 * BYHARWANGA MEDICAL CENTER
 * Website configuration
 */

export const hospital = {
  draftMode: false,

  name: 'Byharwanga Medical Center',
  shortName: 'Byharwanga Medical Center',
  tagline: 'Equity in Practice',
  logo: null,

  contact: {
    phone: '0752884347',
    phoneSecondary: null,
    whatsapp: '256752884347',
    email: 'Byhhrwangamedical@gmail.com',
  },

  address: {
    line1: null,
    area: 'Ganda',
    city: 'Nansana',
    region: 'Kampala',
    country: 'Uganda',
    landmark: null,
  },

  location: {
    mapEmbedUrl: null,
    mapLink: null,
    latitude: null,
    longitude: null,
  },

  openingHours: [
    {
      days: 'Monday - Sunday',
      hours: 'Open 24 Hours',
    },
  ],

  emergencyNote: null,
  social: [],

  about: {
    overview:
      'Welcome to Byharwanga Medical Center. Located in Ganda, Nansana, Uganda, our goal is to help individuals and families access healthcare information and learn about available medical services. Our guiding principle is Equity in Practice.',

    mission:
      'To promote equitable access to healthcare and treat every individual with dignity, respect, and compassion.',

    vision:
      'To contribute to a community where people can access healthcare information and seek appropriate medical support when they need it.',

    values: [
      {
        title: 'Equity',
        text: 'Promoting fairness and respect in access to healthcare.',
      },
      {
        title: 'Compassion',
        text: 'Recognising the importance of treating every patient with dignity and care.',
      },
      {
        title: 'Professionalism',
        text: 'Encouraging responsible communication and patient-centred care.',
      },
      {
        title: 'Respect',
        text: 'Valuing every individual and their healthcare needs.',
      },
    ],

    history:
      'More information about the history of Byharwanga Medical Center will be added when provided by the management.',

    facilities: [
      'Medical facilities',
      'Maternity facilities',
    ],
  },

  doctors: [],

  gallery: [
    {
      src: '/images/gallery/medical-consultation.jpg',
      alt: 'Illustrative photograph of a healthcare consultation',
      category: 'Healthcare',
    },
    {
      src: '/images/gallery/modern-clinic.jpg',
      alt: 'Illustrative photograph of a clinical environment',
      category: 'Facilities',
    },
    {
      src: '/images/gallery/medical-team.jpg',
      alt: 'Illustrative photograph of healthcare professionals',
      category: 'Healthcare',
    },
    {
      src: '/images/gallery/patient-care.jpg',
      alt: 'Illustrative photograph representing patient care',
      category: 'Patient Care',
    },
  ],

  carousel: [
    {
      src: '/images/carousel/hero-hospital.jpg',
      alt: 'Illustrative photograph of a healthcare environment',
      caption: 'Equity in Practice',
    },
    {
      src: '/images/carousel/hero-doctor.jpg',
      alt: 'Illustrative photograph of a doctor',
      caption: 'Healthcare with Dignity and Respect',
    },
    {
      src: '/images/carousel/hero-care.jpg',
      alt: 'Illustrative photograph representing patient care',
      caption: 'Your Health Matters',
    },
  ],

  siteUrl: import.meta.env.VITE_SITE_URL || null,
};

export const services = [
  {
    slug: 'general-medical-care',
    title: 'General Medical Services',
    icon: 'Stethoscope',
    summary:
      'Contact the medical center to enquire about available general medical services.',
    verified: false,
  },
  {
    slug: 'maternity',
    title: 'Maternity Services',
    icon: 'HeartPulse',
    summary:
      'The medical center has confirmed that it provides maternity services. Contact the team for details about available care.',
    verified: true,
  },
  {
    slug: 'consultations',
    title: 'Medical Consultations',
    icon: 'ClipboardList',
    summary:
      'Contact the medical center for information about consultations and available medical care.',
    verified: false,
  },
  {
    slug: 'laboratory',
    title: 'Laboratory Services',
    icon: 'Microscope',
    summary:
      'Contact the medical center to confirm available laboratory tests and diagnostic services.',
    verified: false,
  },
  {
    slug: 'child-health',
    title: 'Child Health',
    icon: 'Baby',
    summary:
      'Contact the medical center to enquire about healthcare services for children.',
    verified: false,
  },
  {
    slug: 'inpatient',
    title: 'Inpatient Care',
    icon: 'BedDouble',
    summary:
      'Contact the medical center to enquire about admission and inpatient care.',
    verified: false,
  },
  {
    slug: 'pharmacy',
    title: 'Pharmacy Services',
    icon: 'Pill',
    summary:
      'Contact the medical center to confirm the availability of pharmacy services.',
    verified: false,
  },
  {
    slug: 'dental',
    title: 'Dental Services',
    icon: 'Smile',
    summary:
      'Contact the medical center to confirm the availability of dental care.',
    verified: false,
  },
  {
    slug: 'emergency',
    title: 'Emergency Services',
    icon: 'Siren',
    summary:
      'The medical center reports operating 24 hours a day. Contact the facility directly to confirm available emergency care.',
    verified: false,
  },
];

export const PLACEHOLDER_NAME = '[Hospital Name]';

export const displayName = hospital.name || PLACEHOLDER_NAME;

export const shortName =
  hospital.shortName || hospital.name || PLACEHOLDER_NAME;

export const visibleServices = hospital.draftMode
  ? services
  : services.filter((service) => service.verified);

export function telHref(phone) {
  return phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null;
}

export function whatsappHref(text = '') {
  const number = hospital.contact.whatsapp;

  if (!number) return null;

  const query = text ? `?text=${encodeURIComponent(text)}` : '';

  return `https://wa.me/${number.replace(/\D/g, '')}${query}`;
}

export function fullAddress() {
  const address = hospital.address;

  const parts = [
    address.line1,
    address.area,
    address.city,
    address.region,
    address.country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : null;
}

export function directionsHref() {
  const location = hospital.location;

  if (location.mapLink) return location.mapLink;

  if (location.latitude != null && location.longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
  }

  const address = fullAddress();

  if (hospital.name && address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${hospital.name}, ${address}`
    )}`;
  }

  return null;
}