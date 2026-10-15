import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Phone, CircleCheck, Send, LoaderCircle } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Field from '../components/Field.jsx';
import Alert from '../components/Alert.jsx';
import Honeypot from '../components/Honeypot.jsx';
import Pending from '../components/Pending.jsx';
import { useFormSubmit } from '../hooks/useFormSubmit.js';
import { validateAppointment, TIME_PERIODS, todayInUganda, addDays, MAX_DAYS_AHEAD } from '../lib/validation.js';
import { apiConfigured } from '../lib/api.js';
import { hospital, displayName, visibleServices, telHref } from '../config/hospital.js';

const GENERAL = 'General enquiry / not sure';

function formatDate(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function Success({ reference, values, onReset }) {
  const ref = useRef(null);
  useEffect(() => ref.current?.focus(), []);
  const { phone } = hospital.contact;
  return (
    <div className="form-success" ref={ref} tabIndex={-1} role="status" aria-live="polite">
      <span className="form-success__icon"><CircleCheck size={40} aria-hidden="true" /></span>
      <h2>Your request has been received</h2>
      <p className="form-success__ref">
        Reference number: <strong>{reference}</strong>
      </p>
      <p>
        Thank you, {values.fullName.split(' ')[0]}. We have received your request for <strong>{values.service}</strong> on{' '}
        <strong>{formatDate(values.preferredDate)}</strong> ({TIME_PERIODS.find((t) => t.value === values.preferredTime)?.label.toLowerCase()}).
      </p>
      <Alert tone="info" title="This is not yet a confirmed appointment">
        A member of our team will contact you on <strong>{values.phone}</strong> to confirm, reschedule or advise. Please keep your reference number.
      </Alert>
      <div className="form-success__actions">
        <button type="button" className="btn btn--outline" onClick={onReset}>Make another request</button>
        <Link to="/" className="btn btn--ghost">Back to home</Link>
        {phone && (
          <a href={telHref(phone)} className="btn btn--ghost">
            <Phone size={18} aria-hidden="true" /> {phone}
          </a>
        )}
      </div>
    </div>
  );
}

export default function Appointments() {
  const [params] = useSearchParams();
  const today = todayInUganda();
  const serviceOptions = [...visibleServices.map((s) => s.title), GENERAL];
  const preselected = params.get('service');
  const initialService = serviceOptions.includes(preselected) ? preselected : '';

  const form = useFormSubmit({
    endpoint: '/api/appointments',
    validate: validateAppointment,
    initial: { fullName: '', phone: '', email: '', service: initialService, preferredDate: '', preferredTime: '', message: '', consent: false },
  });
  const { values, errors, status, serverError, reference, bind, onSubmit, reset, formRef } = form;
  const errorRef = useRef(null);
  const submitting = status === 'submitting';

  useEffect(() => {
    if (status === 'error') errorRef.current?.focus();
  }, [status]);

  const { phone } = hospital.contact;

  return (
    <>
      <Seo title="Request an appointment" description={`Request an appointment at ${displayName}. Choose a service and preferred date; our team will contact you to confirm.`} />
      <PageHeader
        title="Request an appointment"
        intro="Tell us which service you need and when suits you. This is a request — our team will contact you to confirm the appointment."
      />

      <section className="section">
        <div className="container appt-layout">
          <div className="card form-card">
            {status === 'success' ? (
              <Success reference={reference} values={values} onReset={reset} />
            ) : (
              <form ref={formRef} onSubmit={onSubmit} noValidate aria-describedby="form-required-note" aria-busy={submitting}>
                {!apiConfigured && (
                  <Alert tone="warning" title="Online requests are not switched on yet">
                    Please contact the hospital directly to arrange an appointment
                    {phone ? <> on <a href={telHref(phone)}>{phone}</a></> : <> — see our <Link to="/contact">contact page</Link></>}.
                  </Alert>
                )}
                {status === 'error' && (
                  <Alert tone="error" title="Your request was not sent" ref={errorRef} live>
                    {serverError}
                    {phone && <> You can also call us on <a href={telHref(phone)}>{phone}</a>.</>}
                  </Alert>
                )}
                {Object.values(errors).some(Boolean) && status !== 'error' && (
                  <Alert tone="error" live>Please correct the highlighted fields below.</Alert>
                )}

                <p id="form-required-note" className="form-note">Fields marked <span aria-hidden="true">*</span><span className="sr-only">as required</span> are required.</p>

                <fieldset className="form-group" disabled={submitting || !apiConfigured}>
                  <legend>Your details</legend>
                  <div className="form-grid">
                    <Field id="fullName" label="Full name" required error={errors.fullName}>
                      {(p) => <input {...p} {...bind('fullName')} type="text" autoComplete="name" maxLength={100} />}
                    </Field>
                    <Field id="phone" label="Phone number" required hint="We will call this number to confirm." error={errors.phone}>
                      {(p) => <input {...p} {...bind('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="+256 7XX XXX XXX" maxLength={25} />}
                    </Field>
                    <Field id="email" label="Email address" optional error={errors.email}>
                      {(p) => <input {...p} {...bind('email')} type="email" autoComplete="email" maxLength={254} />}
                    </Field>
                  </div>
                </fieldset>

                <fieldset className="form-group" disabled={submitting || !apiConfigured}>
                  <legend>Appointment preferences</legend>
                  <div className="form-grid">
                    <Field id="service" label="Service or department" required error={errors.service}>
                      {(p) => (
                        <select {...p} {...bind('service')}>
                          <option value="">Choose a service…</option>
                          {serviceOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}
                    </Field>
                    <Field id="preferredDate" label="Preferred date" required hint={`Within the next ${MAX_DAYS_AHEAD} days.`} error={errors.preferredDate}>
                      {(p) => <input {...p} {...bind('preferredDate')} type="date" min={today} max={addDays(today, MAX_DAYS_AHEAD)} />}
                    </Field>
                    <Field id="preferredTime" label="Preferred time of day" required error={errors.preferredTime}>
                      {(p) => (
                        <select {...p} {...bind('preferredTime')}>
                          <option value="">Choose a time…</option>
                          {TIME_PERIODS.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      )}
                    </Field>
                  </div>
                  <Field
                    id="message"
                    label="Anything we should know to arrange your visit?"
                    optional
                    hint="For example, if you need wheelchair access or an interpreter. Please do not include medical history, test results or ID numbers."
                    error={errors.message}
                  >
                    {(p) => <textarea {...p} {...bind('message')} rows={4} maxLength={500} />}
                  </Field>
                  <p className="char-count" aria-live="polite">{values.message.length}/500</p>
                </fieldset>

                <Honeypot />

                <div className={`consent${errors.consent ? ' consent--error' : ''}`}>
                  <input
                    id="consent"
                    type="checkbox"
                    name="consent"
                    checked={values.consent}
                    onChange={bind('consent').onChange}
                    aria-invalid={errors.consent ? true : undefined}
                    aria-describedby={errors.consent ? 'consent-error' : undefined}
                    disabled={submitting || !apiConfigured}
                  />
                  <label htmlFor="consent">
                    I agree that {displayName} may use these details to contact me about this request, as described in the{' '}
                    <Link to="/privacy" target="_blank">privacy policy</Link>. <span aria-hidden="true">*</span>
                  </label>
                </div>
                {errors.consent && <p id="consent-error" className="field__error">{errors.consent}</p>}

                <button type="submit" className="btn btn--primary btn--lg btn--block-sm" disabled={submitting || !apiConfigured}>
                  {submitting ? (
                    <>
                      <LoaderCircle size={20} className="spin" aria-hidden="true" /> Sending request…
                    </>
                  ) : (
                    <>
                      <Send size={18} aria-hidden="true" /> Send appointment request
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <aside className="appt-aside" aria-label="About appointment requests">
            <div className="card">
              <h2 className="card__title">What happens next</h2>
              <ol className="steps">
                <li><strong>Send your request</strong> with your preferred service and date.</li>
                <li><strong>We contact you</strong> by phone to confirm, reschedule or advise.</li>
                <li><strong>Visit us</strong> at the confirmed time. Bring any referral letters you have.</li>
              </ol>
            </div>
            <Alert tone="warning" title="Not for emergencies">
              If you or someone else needs urgent medical help, do not use this form. Go to the nearest emergency facility immediately.
              {hospital.emergencyNote && <> {hospital.emergencyNote}</>}
            </Alert>
            <div className="card">
              <h2 className="card__title">Prefer to call?</h2>
              <p className="aside-phone">
                <Phone size={18} aria-hidden="true" />
                {phone ? <a href={telHref(phone)}>{phone}</a> : <Pending label="Phone number" />}
              </p>
              <Link to="/contact">More contact options</Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
