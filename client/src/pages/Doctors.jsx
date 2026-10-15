import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import DoctorCard from '../components/DoctorCard.jsx';
import CtaBand from '../components/CtaBand.jsx';
import { hospital, displayName } from '../config/hospital.js';

export default function Doctors() {
  const doctors = hospital.doctors;
  const departments = useMemo(() => ['All', ...new Set(doctors.map((d) => d.department).filter(Boolean))], [doctors]);
  const [dept, setDept] = useState('All');
  const shown = dept === 'All' ? doctors : doctors.filter((d) => d.department === dept);

  return (
    <>
      <Seo title="Doctors and medical team" description={`Meet the doctors and medical professionals at ${displayName}.`} />
      <PageHeader title="Doctors and medical team" crumb="Our team" intro="The professionals who care for our patients." />
      <Section id="team">
        {doctors.length === 0 ? (
          <div className="empty-state" data-reveal>
            <span className="empty-state__icon"><Users size={32} aria-hidden="true" /></span>
            <h2>Our team directory is being prepared</h2>
            <p>
              Details of our doctors and medical professionals will be published here once confirmed. To ask about a particular
              specialist, please <Link to="/contact">contact us</Link>.
            </p>
            {hospital.draftMode && (
              <p className="note">
                <strong>Setup:</strong> add confirmed staff to <code>doctors</code> in <code>src/config/hospital.js</code> (name,
                verified qualifications, specialty, department, authorised photo, availability).
              </p>
            )}
          </div>
        ) : (
          <>
            {departments.length > 2 && (
              <div className="filter-chips" role="group" aria-label="Filter by department">
                {departments.map((d) => (
                  <button key={d} type="button" className={`chip${d === dept ? ' is-active' : ''}`} aria-pressed={d === dept} onClick={() => setDept(d)}>
                    {d}
                  </button>
                ))}
              </div>
            )}
            <div className="card-grid card-grid--3">
              {shown.map((d) => (
                <DoctorCard key={d.name} doctor={d} />
              ))}
            </div>
          </>
        )}
      </Section>
      <CtaBand />
    </>
  );
}
