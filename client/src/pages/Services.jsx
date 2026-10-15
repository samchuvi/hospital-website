import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import Alert from '../components/Alert.jsx';
import CtaBand from '../components/CtaBand.jsx';
import { hospital, displayName, visibleServices } from '../config/hospital.js';

export default function Services() {
  const hasDrafts = visibleServices.some((s) => !s.verified);
  return (
    <>
      <Seo
        title="Medical services"
        description={`Medical services at ${displayName}${hospital.address.city ? ` in ${hospital.address.city}` : ''}: ${visibleServices
          .slice(0, 5)
          .map((s) => s.title.toLowerCase())
          .join(', ')} and more.`}
      />
      <PageHeader
        title="Medical services"
        intro="Find the service you need and send us an appointment request. If you are not sure which service is right for you, choose “General enquiry” and our team will advise."
      />
      <Section id="all-services" headingLevel={2}>
        {hospital.draftMode && hasDrafts && (
          <Alert tone="warning" title="Draft service list">
            Services marked “Draft — verify” are examples. Before publishing, keep only the services the hospital confirms and set{' '}
            <code>verified: true</code> for each in <code>src/config/hospital.js</code>.
          </Alert>
        )}
        {visibleServices.length > 0 ? (
          <div className="card-grid card-grid--services">
            {visibleServices.map((s) => (
              <ServiceCard key={s.slug} service={s} detailed headingLevel={2} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>Service information is being updated</h2>
            <p>
              Please <Link to="/contact">contact us</Link> to ask about the services currently available.
            </p>
          </div>
        )}
      </Section>
      <CtaBand title="Not sure which service you need?" text="Send a general enquiry or call us, and we will help you find the right care." />
    </>
  );
}
