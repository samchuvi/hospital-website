import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import CtaBand from '../components/CtaBand.jsx';
import { hospital, displayName, telHref, fullAddress, directionsHref } from '../config/hospital.js';

function buildFaqs() {
  const { phone, email, whatsapp } = hospital.contact;
  const address = fullAddress();
  const directions = directionsHref();
  return [
    {
      q: 'How do I contact the hospital?',
      a: (
        <>
          {phone ? <>You can call us on <a href={telHref(phone)}>{phone}</a>. </> : null}
          {email ? <>You can email <a href={`mailto:${email}`}>{email}</a>. </> : null}
          {whatsapp ? <>We are also available on WhatsApp. </> : null}
          All our contact details, including opening hours, are on the <Link to="/contact">contact page</Link>, where you can also send us a message.
        </>
      ),
    },
    {
      q: 'How do I request an appointment?',
      a: (
        <>
          Fill in the <Link to="/appointments">appointment request form</Link> with your name, phone number, the service you need and
          your preferred date and time of day. Our team will contact you to confirm. Your appointment is only confirmed once we have
          contacted you.
        </>
      ),
    },
    {
      q: 'Is an online request a confirmed appointment?',
      a: (
        <>
          No. An online request tells us when you would like to come. A member of our team will call you to confirm, suggest another
          time, or advise you on the right service.
        </>
      ),
    },
    {
      q: 'Where is the hospital located?',
      a: (
        <>
          {address ? <>We are at {address}. </> : null}
          {hospital.address.landmark ? <>{hospital.address.landmark}. </> : null}
          You can see our location on the map on the <Link to="/contact#location">contact page</Link>
          {directions ? <> or <a href={directions} target="_blank" rel="noopener noreferrer">open directions in Google Maps</a></> : null}.
        </>
      ),
    },
    {
      q: 'How can I find out which services are available?',
      a: (
        <>
          See our <Link to="/services">services page</Link> for an overview. If you cannot find what you need, please{' '}
          <Link to="/contact">contact us</Link> and we will advise.
        </>
      ),
    },
    {
      q: 'How do I get to the hospital?',
      a: (
        <>
          Use the “Get directions” button on our <Link to="/contact#location">contact page</Link> to open Google Maps with directions from
          your current location. {phone ? <>If you need help finding us, call <a href={telHref(phone)}>{phone}</a>.</> : null}
        </>
      ),
    },
    {
      q: 'What should I do in a medical emergency?',
      a: (
        <>
          Do not use the online forms for emergencies. Go to the nearest emergency facility immediately.
          {hospital.emergencyNote ? <> {hospital.emergencyNote}</> : null}
        </>
      ),
    },
    {
      q: 'What information do you collect through this website?',
      a: (
        <>
          Only what is needed to respond to your request, such as your name, phone number and preferred appointment date. We do not ask for
          medical records online. Read our <Link to="/privacy">privacy policy</Link> for details.
        </>
      ),
    },
  ];
}

export default function Faq() {
  const faqs = buildFaqs();
  return (
    <>
      <Seo title="Frequently asked questions" description={`Answers to common questions about contacting ${displayName}, appointments and finding us.`} />
      <PageHeader title="Frequently asked questions" crumb="FAQ" intro="Quick answers to common questions. Can’t find what you need? Contact us." />
      <Section id="faq-list">
        <div className="faq">
          {faqs.map((f, i) => (
            <details key={f.q} className="faq__item" data-reveal open={i === 0}>
              <summary>
                <h2 className="faq__q">{f.q}</h2>
                <ChevronDown size={20} aria-hidden="true" className="faq__chev" />
              </summary>
              <div className="faq__a">
                <p>{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </Section>
      <CtaBand title="Still have a question?" text="Send us a message or call, and our team will be glad to help." />
    </>
  );
}
