import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import Pending from './Pending.jsx';
import { WhatsAppIcon } from './Icon.jsx';
import { hospital, telHref, fullAddress, whatsappHref } from '../config/hospital.js';

function Item({ icon, title, children }) {
  return (
    <li className="contact-item">
      <span className="contact-item__icon">{icon}</span>
      <div>
        <h3 className="contact-item__title">{title}</h3>
        <div className="contact-item__value">{children}</div>
      </div>
    </li>
  );
}

export default function ContactDetails({ compact = false }) {
  const { phone, phoneSecondary, email } = hospital.contact;
  const address = fullAddress();
  const wa = whatsappHref();
  return (
    <ul className={`contact-list${compact ? ' contact-list--compact' : ''}`}>
      <Item icon={<Phone size={20} aria-hidden="true" />} title="Phone">
        {phone ? (
          <>
            <a href={telHref(phone)}>{phone}</a>
            {phoneSecondary && (
              <>
                <br />
                <a href={telHref(phoneSecondary)}>{phoneSecondary}</a>
              </>
            )}
          </>
        ) : (
          <Pending label="Phone number" />
        )}
      </Item>
      {wa && (
        <Item icon={<WhatsAppIcon size={20} />} title="WhatsApp">
          <a href={wa} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
        </Item>
      )}
      <Item icon={<Mail size={20} aria-hidden="true" />} title="Email">
        {email ? <a href={`mailto:${email}`}>{email}</a> : <Pending label="Email address" />}
      </Item>
      <Item icon={<MapPin size={20} aria-hidden="true" />} title="Address">
        {address ? (
          <>
            {address}
            {hospital.address.landmark && <span className="muted"><br />{hospital.address.landmark}</span>}
          </>
        ) : (
          <Pending label="Physical address" />
        )}
      </Item>
      <Item icon={<Clock size={20} aria-hidden="true" />} title="Opening hours">
        {hospital.openingHours.length ? (
          <dl className="hours">
            {hospital.openingHours.map((h) => (
              <div key={h.days}>
                <dt>{h.days}</dt>
                <dd>{h.hours}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <Pending label="Opening hours" />
        )}
        {hospital.emergencyNote && <p className="hours__note">{hospital.emergencyNote}</p>}
      </Item>
    </ul>
  );
}
