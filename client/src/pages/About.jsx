import { Target, Eye, CircleCheck } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import Photo from '../components/Photo.jsx';
import Pending from '../components/Pending.jsx';
import CtaBand from '../components/CtaBand.jsx';
import { hospital, displayName } from '../config/hospital.js';

export default function About() {
  const { overview, mission, vision, values, history, facilities } = hospital.about;
  const photos = hospital.gallery.slice(0, 3);
  const photoSlots = [0, 1, 2].map((i) => photos[i] || { label: ['Hospital exterior', 'Reception area', 'Clinical area'][i] });

  return (
    <>
      <Seo title="About us" description={`Learn about ${displayName}: who we are, our mission, values and facilities.`} />
      <PageHeader title="About us" intro={`Who we are and what guides our work at ${displayName}.`} />

      <Section id="overview" tone="white">
        <div className="split">
          <div className="split__content" data-reveal>
            <p className="eyebrow">Overview</p>
            <h2 className="section__title">{displayName}</h2>
            {overview ? <p className="lead">{overview}</p> : <Pending label="Hospital overview" block />}
            {history ? (
              <>
                <h3 className="subheading">Our history</h3>
                <p>{history}</p>
              </>
            ) : (
              hospital.draftMode && (
                <>
                  <h3 className="subheading">Our history</h3>
                  <Pending label="History (e.g. year founded, key milestones)" block />
                </>
              )
            )}
          </div>
          <div className="split__media" data-reveal>
            <Photo src={photoSlots[0].src} alt={photoSlots[0].alt} label={photoSlots[0].label} ratio="4 / 3" />
          </div>
        </div>
      </Section>

      <Section id="mission" eyebrow="What guides us" title="Mission and vision">
        <div className="mv-grid">
          <article className="mv-card" data-reveal>
            <span className="mv-card__icon"><Target size={24} aria-hidden="true" /></span>
            <h3>Our mission</h3>
            {mission ? <p>{mission}</p> : <Pending label="Mission statement" block />}
          </article>
          <article className="mv-card" data-reveal>
            <span className="mv-card__icon"><Eye size={24} aria-hidden="true" /></span>
            <h3>Our vision</h3>
            {vision ? <p>{vision}</p> : <Pending label="Vision statement" block />}
          </article>
        </div>
      </Section>

      {(values.length > 0 || hospital.draftMode) && (
        <Section id="values" eyebrow="Our values" title="The values we work by" tone="white">
          {values.length ? (
            <ul className="values-grid">
              {values.map((v) => (
                <li key={v.title} className="value" data-reveal>
                  <h3>{v.title}</h3>
                  {v.text && <p>{v.text}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <Pending label="Core values (e.g. 3–5 values with a short description each)" block />
          )}
        </Section>
      )}

      <Section id="facilities" eyebrow="Facilities" title="Facilities and capabilities">
        {facilities.length ? (
          <ul className="check-list check-list--grid">
            {facilities.map((f) => (
              <li key={f}>
                <CircleCheck size={18} aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
        ) : (
          <Pending label="Verified list of facilities (e.g. laboratory, pharmacy, wards)" block />
        )}
        <div className="photo-row" data-reveal>
          {photoSlots.map((p, i) => (
            <Photo key={i} src={p.src} alt={p.alt} label={p.label} ratio="4 / 3" />
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
