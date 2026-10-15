import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Send, LoaderCircle, CircleCheck } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import ContactDetails from '../components/ContactDetails.jsx';
import MapSection from '../components/MapSection.jsx';
import Field from '../components/Field.jsx';
import Alert from '../components/Alert.jsx';
import Honeypot from '../components/Honeypot.jsx';
import { useFormSubmit } from '../hooks/useFormSubmit.js';
import { validateContact } from '../lib/validation.js';
import { apiConfigured } from '../lib/api.js';
import { hospital, displayName, telHref } from '../config/hospital.js';

function ContactForm() {
  const { values, errors, status, serverError, reference, bind, onSubmit, reset, formRef } = useFormSubmit({
    endpoint: '/api/messages',
    validate: validateContact,
    initial: { fullName: '', email: '', phone: '', subject: '', message: '', consent: false },
  });
  const errorRef = useRef(null);
  const successRef = useRef(null);
  const submitting = status === 'submitting';
  const disabled = submitting || !apiConfigured;

  useEffect(() => {
    if (status === 'error') errorRef.current?.focus();
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  if (status === 'success') {
    return (
      <div className="form-success form-success--compact" ref={successRef} tabIndex={-1} role="status">
        <span className="form-success__icon"><CircleCheck size={36} aria-hidden="true" /></span>
        <h3>Message sent</h3>
        <p>Thank you. Your message (reference <strong>{reference}</strong>) has been received and our team will reply as soon as possible.</p>
        <button type="button" className="btn btn--outline" onClick={reset}>Send another message</button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={submitting}>
      {!apiConfigured && (
        <Alert tone="warning" title="The contact form is not switched on yet">
          Please use the phone number or email address shown on this page.
        </Alert>
      )}
      {status === 'error' && (
        <Alert tone="error" title="Your message was not sent" ref={errorRef} live>
          {serverError}
        </Alert>
      )}
      <fieldset className="form-group form-group--plain" disabled={disabled}>
        <legend className="sr-only">Your message</legend>
        <Field id="c-fullName" label="Full name" required error={errors.fullName}>
          {(p) => <input {...p} {...bind('fullName')} type="text" autoComplete="name" maxLength={100} />}
        </Field>
        <div className="form-grid form-grid--2">
          <Field id="c-email" label="Email address" hint="Email or phone required." error={errors.email}>
            {(p) => <input {...p} {...bind('email')} type="email" autoComplete="email" maxLength={254} />}
          </Field>
          <Field id="c-phone" label="Phone number" optional error={errors.phone}>
            {(p) => <input {...p} {...bind('phone')} type="tel" inputMode="tel" autoComplete="tel" maxLength={25} />}
          </Field>
        </div>
        <Field id="c-subject" label="Subject" required error={errors.subject}>
          {(p) => <input {...p} {...bind('subject')} type="text" maxLength={120} />}
        </Field>
        <Field
          id="c-message"
          label="Message"
          required
          hint="Please do not share medical history, test results or ID numbers through this form."
          error={errors.message}
        >
          {(p) => <textarea {...p} {...bind('message')} rows={5} maxLength={1500} />}
        </Field>
      </fieldset>
      <Honeypot />
      <div className={`consent${errors.consent ? ' consent--error' : ''}`}>
        <input
          id="c-consent"
          type="checkbox"
          name="consent"
          checked={values.consent}
          onChange={bind('consent').onChange}
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? 'c-consent-error' : undefined}
          disabled={disabled}
        />
        <label htmlFor="c-consent">
          I agree that {displayName} may use these details to reply to me, as described in the <Link to="/privacy" target="_blank">privacy policy</Link>.
          <span aria-hidden="true"> *</span>
        </label>
      </div>
      {errors.consent && <p id="c-consent-error" className="field__error">{errors.consent}</p>}
      <button type="submit" className="btn btn--primary btn--block-sm" disabled={disabled}>
        {submitting ? (
          <>
            <LoaderCircle size={18} className="spin" aria-hidden="true" /> Sending…
          </>
        ) : (
          <>
            <Send size={18} aria-hidden="true" /> Send message
          </>
        )}
      </button>
    </form>
  );
}

export default function Contact() {
  const { phone } = hospital.contact;
  return (
    <>
      <Seo title="Contact us" description={`Contact ${displayName}: phone, email, address, opening hours and directions.`} />
      <PageHeader title="Contact us" intro="Call, email or send us a message. For appointments, use the appointment request form." />

      <Section id="contact-details">
        <div className="contact-layout">
          <div className="card" data-reveal>
            <h2 className="card__title">Contact details</h2>
            <ContactDetails />
            <div className="contact-layout__actions">
              <Link to="/appointments" className="btn btn--primary">Request an appointment</Link>
              {phone && <a href={telHref(phone)} className="btn btn--outline">Call now</a>}
            </div>
          </div>
          <div className="card" data-reveal>
            <h2 className="card__title">Send us a message</h2>
            <p className="muted">For general questions. We aim to reply during working hours.</p>
            <ContactForm />
          </div>
        </div>
      </Section>

      <Section id="location" eyebrow="Directions" title="Our location" tone="white">
        <MapSection />
      </Section>
    </>
  );
}
