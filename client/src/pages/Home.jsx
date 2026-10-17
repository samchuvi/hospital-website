import { Link } from 'react-router-dom';
import { CalendarCheck, Phone, Navigation, ArrowRight, ListChecks, MessageSquareText, MapPinned, ShieldCheck, CircleCheck } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import StructuredData from '../components/StructuredData.jsx';
import Section from '../components/Section.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import DoctorCard from '../components/DoctorCard.jsx';
import Photo from '../components/Photo.jsx';
import HeroCarousel from '../components/HeroCarousel.jsx';
import Pending from '../components/Pending.jsx';
import CtaBand from '../components/CtaBand.jsx';
import ContactDetails from '../components/ContactDetails.jsx';
import MapSection from '../components/MapSection.jsx';
import { hospital, displayName, visibleServices, telHref, directionsHref } from '../config/hospital.js';

const REASONS = [
  {
    icon: ListChecks,
    title: 'Clear information',
    text: 'See the services available, our opening hours and how to reach us before you travel.',
  },
  {
    icon: MessageSquareText,
    title: 'Simple appointment requests',
    text: 'Send a request online with your preferred date. Our team calls you back to confirm.',
  },
  {
    icon: MapPinned,
    title: 'Easy to find',
    text: 'Get directions straight to our location from your phone with one tap.',
  },
  {
    icon: ShieldCheck,
    title: 'Respect for your privacy',
    text: 'We only ask for the details needed to arrange your visit — never medical records online.',
  },
];

function Hero() {
  const { phone } = hospital.contact;
  const city = hospital.address.city;
  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true" />
      <div className="container hero__inner">
        <div className="hero__content">
          <p className="eyebrow">
            <span>{city ? `Hospital in ${city}, Uganda` : <>Hospital in <Pending label="Location" />, Uganda</>}</span>
          </p>
          <h1 className="hero__title">
            {hospital.tagline || (
              <>
                Caring for the health of <em>our community</em>
              </>
            )}
          </h1>
          <p className="hero__lead">
            Welcome to {displayName}. Find the services available, request an appointment online, and get directions to us — all in one
            place.
          </p>
          <div className="hero__actions">
            <Link to="/appointments" className="btn btn--primary btn--lg">
              <CalendarCheck size={20} aria-hidden="true" />
              Request an appointment
            </Link>
            <Link to="/services" className="btn btn--outline btn--lg">
              View our services
            </Link>
          </div>
          <p className="hero__contact">
            <Phone size={17} aria-hidden="true" />
            {phone ? (
              <>
                Call us: <a href={telHref(phone)}>{phone}</a>
              </>
            ) : (
              <>
                Call us: <Pending label="Phone number" />
              </>
            )}
            <span className="hero__sep" aria-hidden="true">·</span>
            <Link to="/contact">All contact options</Link>
          </p>
        </div>

        <div className="hero__visual">
          <HeroCarousel slides={hospital.carousel} className="hero__photo" />
          <div className="hero__card">
            <span className="hero__card-icon">
              <CalendarCheck size={22} aria-hidden="true" />
            </span>
            <div>
              <p className="hero__card-title">Appointment requests</p>
              <p className="hero__card-text">Choose a service and date online. We contact you to confirm.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickActions() {
  const { phone } = hospital.contact;
  const directions = directionsHref();
  const items = [
    { to: '/appointments', icon: CalendarCheck, title: 'Request an appointment', text: 'Send your preferred date and service' },
    phone
      ? { href: telHref(phone), icon: Phone, title: 'Call the hospital', text: phone }
      : { to: '/contact', icon: Phone, title: 'Contact the hospital', text: 'Phone, email and opening hours' },
    directions
      ? { href: directions, external: true, icon: Navigation, title: 'Get directions', text: 'Open in Google Maps' }
      : { to: '/contact#location', icon: Navigation, title: 'Find our location', text: 'Address and map' },
  ];
  return (
    <div className="container">
      <ul className="quick-actions" aria-label="Quick actions">
        {items.map(({ icon: Icon, title, text, to, href, external }) => {
          const inner = (
            <>
              <span className="quick-actions__icon"><Icon size={22} aria-hidden="true" /></span>
              <span>
                <span className="quick-actions__title">{title}</span>
                <span className="quick-actions__text">{text}</span>
              </span>
              <ArrowRight size={18} aria-hidden="true" className="quick-actions__arrow" />
            </>
          );
          return (
            <li key={title}>
              {to ? (
                <Link to={to} className="quick-actions__item">{inner}</Link>
              ) : (
                <a href={href} className="quick-actions__item" {...(external && { target: '_blank', rel: 'noopener noreferrer' })}>
                  {inner}
                  {external && <span className="sr-only"> (opens in a new tab)</span>}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AboutIntro() {
  const { overview, facilities } = hospital.about;
  return (
    <Section id="about-intro" tone="white">
      <div className="split">
        <div className="split__media" data-reveal>
          <Photo src={hospital.gallery[1]?.src} alt={hospital.gallery[1]?.alt} label="Hospital facility" ratio="5 / 4" />
        </div>
        <div className="split__content" data-reveal>
          <p className="eyebrow">About us</p>
          <h2 className="section__title">Welcome to {displayName}</h2>
          {overview ? <p className="lead">{overview}</p> : <Pending label="Hospital overview (2–4 sentences)" block />}
          {facilities.length > 0 && (
            <ul className="check-list">
              {facilities.slice(0, 4).map((f) => (
                <li key={f}>
                  <CircleCheck size={18} aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          )}
          <Link to="/about" className="btn btn--outline">
            More about us <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Section>
  );
}

export default function Home() {
  const featuredDoctors = hospital.doctors.slice(0, 3);
  return (
    <>
      <Seo
        title={hospital.address.city ? `Hospital in ${hospital.address.city}, Uganda` : 'Hospital in Uganda'}
        description={`${displayName}: find our medical services, request an appointment online, and get contact details and directions.`}
      />
      <StructuredData />
      <Hero />
      <QuickActions />

      <Section
        id="services-preview"
        eyebrow="Our services"
        title="Care for you and your family"
        intro="An overview of the services available. Choose a service to request an appointment."
      >
        <div className="card-grid">
          {visibleServices.slice(0, 6).map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
        <div className="section__more">
          <Link to="/services" className="btn btn--outline">
            View all services <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </Section>

      <AboutIntro />

      {featuredDoctors.length > 0 && (
        <Section id="team-preview" eyebrow="Our team" title="Meet some of our medical team">
          <div className="card-grid card-grid--3">
            {featuredDoctors.map((d) => (
              <DoctorCard key={d.name} doctor={d} />
            ))}
          </div>
          <div className="section__more">
            <Link to="/doctors" className="btn btn--outline">
              See the full team <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </Section>
      )}

      <Section id="why-us" eyebrow="Visiting us" title="Getting care with us is straightforward" align="center">
        <ul className="reasons">
          {REASONS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="reason" data-reveal>
              <span className="reason__icon"><Icon size={24} aria-hidden="true" /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand />

      <Section id="location" eyebrow="Find us" title="Location and contact" tone="white">
        <div className="contact-summary">
          <div data-reveal>
            <ContactDetails compact />
            <Link to="/contact" className="btn btn--outline contact-summary__btn">
              Contact page <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <MapSection />
        </div>
      </Section>
    </>
  );
}
