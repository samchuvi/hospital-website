import { config, emailConfigured } from './config.js';

// Email is optional. When SMTP settings are missing we do not pretend that
// notifications were sent: the API reports `notified: false` and logs why.

let transporterPromise = null;

async function getTransporter() {
  if (!emailConfigured()) return null;
  if (!transporterPromise) {
    transporterPromise = import('nodemailer').then(({ default: nodemailer }) =>
      nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: { user: config.smtp.user, pass: config.smtp.pass },
      }),
    );
  }
  return transporterPromise;
}

const PERIOD_LABEL = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', any: 'Any time' };

function appointmentText(doc) {
  return [
    `New appointment REQUEST (not yet confirmed) — ${doc.reference}`,
    '',
    `Name:            ${doc.fullName}`,
    `Phone:           ${doc.phone}`,
    `Email:           ${doc.email || '—'}`,
    `Service:         ${doc.service}`,
    `Preferred date:  ${doc.preferredDate}`,
    `Preferred time:  ${PERIOD_LABEL[doc.preferredTime] || doc.preferredTime}`,
    `Message:         ${doc.message || '—'}`,
    `Received:        ${doc.createdAt}`,
    '',
    'Please contact the patient to confirm, reschedule or decline this request.',
  ].join('\n');
}

function messageText(doc) {
  return [
    `New website message — ${doc.reference}`,
    '',
    `Name:     ${doc.fullName}`,
    `Phone:    ${doc.phone || '—'}`,
    `Email:    ${doc.email || '—'}`,
    `Subject:  ${doc.subject}`,
    `Received: ${doc.createdAt}`,
    '',
    doc.message,
  ].join('\n');
}

async function send(options, log) {
  try {
    const t = await getTransporter();
    if (!t) return false;
    await t.sendMail({ from: config.smtp.from, ...options });
    return true;
  } catch (err) {
    log.error?.(`[mail] Failed to send email: ${err.message}`);
    return false;
  }
}

export async function notifyAppointment(doc, log = console) {
  if (!emailConfigured()) return false;
  const staff = await send(
    { to: config.notifyEmail, subject: `Appointment request ${doc.reference}`, text: appointmentText(doc), replyTo: doc.email || undefined },
    log,
  );
  if (config.sendPatientAcknowledgement && doc.email) {
    await send(
      {
        to: doc.email,
        subject: `We received your appointment request (${doc.reference})`,
        text: [
          `Dear ${doc.fullName},`,
          '',
          `Thank you for contacting ${config.hospitalName}. We have received your appointment request (reference ${doc.reference}).`,
          'This is NOT yet a confirmed appointment. A member of our team will contact you to confirm a date and time.',
          '',
          'If you need urgent medical care, please go directly to the nearest emergency facility.',
        ].join('\n'),
      },
      log,
    );
  }
  return staff;
}

export async function notifyMessage(doc, log = console) {
  if (!emailConfigured()) return false;
  return send(
    { to: config.notifyEmail, subject: `Website message: ${doc.subject}`, text: messageText(doc), replyTo: doc.email || undefined },
    log,
  );
}
