import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Alert from '../components/Alert.jsx';
import Pending from '../components/Pending.jsx';
import { hospital, displayName, fullAddress } from '../config/hospital.js';

// Update this date whenever the policy changes.
const LAST_UPDATED = null; // e.g. '1 November 2026'

export default function Privacy() {
  const { email, phone } = hospital.contact;
  const address = fullAddress();
  return (
    <>
      <Seo title="Privacy policy" description={`How ${displayName} collects, uses and protects information submitted through this website.`} />
      <PageHeader title="Privacy policy" intro="How we handle the information you share with us through this website." />
      <section className="section">
        <div className="container prose">
          {hospital.draftMode && (
            <Alert tone="warning" title="Template — review required before publication">
              This policy is a starting template. The hospital must review it, complete the marked items, and confirm it reflects its actual
              practices and its obligations under Ugandan law (including the Data Protection and Privacy Act, 2019) before the website is
              published. It does not by itself make the hospital compliant with any law.
            </Alert>
          )}

          <p className="muted">Last updated: {LAST_UPDATED || <Pending label="Date" />}</p>

          <h2>1. Who we are</h2>
          <p>
            This website is operated by {displayName}
            {address ? <>, {address}</> : <> (<Pending label="Registered address" />)</>}. In this policy, “we”, “us” and “our” refer to the hospital.
          </p>

          <h2>2. Information we collect</h2>
          <p>We only collect information that you choose to give us through the forms on this website:</p>
          <ul>
            <li>
              <strong>Appointment request form:</strong> your full name, phone number, optional email address, the service you are interested in,
              your preferred date and time of day, and an optional short message.
            </li>
            <li>
              <strong>Contact form:</strong> your full name, email address and/or phone number, a subject and your message.
            </li>
          </ul>
          <p>
            We ask you <strong>not</strong> to send medical history, test results, national identification numbers or other sensitive information
            through these forms. Please share such information only directly with your clinician.
          </p>
          <p>
            Our web server may also record basic technical information (such as your IP address and the time of a request) for security, for
            example to prevent spam and abuse.
          </p>

          <h2>3. Why we use your information</h2>
          <ul>
            <li>To contact you about your appointment request and arrange a suitable appointment.</li>
            <li>To reply to your questions and messages.</li>
            <li>To keep this website secure and prevent misuse.</li>
          </ul>
          <p>We do not sell your information or use it for advertising.</p>

          <h2>4. How we store and protect your information</h2>
          <p>
            Form submissions are sent over an encrypted (HTTPS) connection and stored in a database that only authorised hospital staff can access.
            Where email notifications are enabled, details of your request are also emailed to the hospital’s appointments team.
          </p>
          <p>
            We keep form submissions for <Pending label="Retention period (e.g. 12 months)" />, after which they are deleted, unless they become part
            of your medical record through a confirmed appointment.
          </p>

          <h2>5. Third-party services</h2>
          <p>This website uses the following service providers to operate:</p>
          <ul>
            <li>Website hosting: <Pending label="Hosting provider (e.g. Vercel)" /></li>
            <li>Form processing and storage: <Pending label="API host and database provider (e.g. Render, MongoDB Atlas)" /></li>
            <li>Email delivery (if enabled): <Pending label="Email provider" /></li>
            <li>
              Maps: where a Google Maps map is shown, Google may collect information according to its own privacy policy when the map loads or
              when you open directions.
            </li>
            {hospital.contact.whatsapp && <li>WhatsApp: messages you send via WhatsApp are subject to WhatsApp’s own terms and privacy policy.</li>}
          </ul>
          <p>This website itself does not use advertising or analytics cookies.</p>

          <h2>6. Your rights</h2>
          <p>
            You may ask to see the information we hold about you from this website, ask us to correct it, or ask us to delete it. To make a request,
            contact us using the details below.
          </p>

          <h2>7. Contact us about privacy</h2>
          <p>
            Privacy contact: <Pending label="Name or role of privacy contact" /><br />
            Email: {email ? <a href={`mailto:${email}`}>{email}</a> : <Pending label="Email address" />}<br />
            Phone: {phone || <Pending label="Phone number" />}
          </p>

          <h2>8. Changes to this policy</h2>
          <p>We may update this policy from time to time. The “last updated” date at the top shows when it was last changed.</p>

          <p>
            <Link to="/contact">Contact us</Link> if you have any questions.
          </p>
        </div>
      </section>
    </>
  );
}
