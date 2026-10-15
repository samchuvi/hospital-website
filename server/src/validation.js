// Server-side validation and sanitisation for public form submissions.
// Every value is treated as untrusted. We only accept the fields we expect,
// strip control characters, enforce lengths and formats, and never store
// anything that was not explicitly asked for.

const CONTROL_CHARS = new RegExp("[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F\\u200B-\\u200F\\u2028\\u2029]", "g");
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;
const NAME_RE = /^[\p{L}\p{M}' .-]+$/u;
const PHONE_ALLOWED = /^\+?[0-9\s()-]+$/;
const TIME_PERIODS = ['morning', 'afternoon', 'evening', 'any'];
const MAX_DAYS_AHEAD = 90;

export function clean(value, { multiline = false, max = 200 } = {}) {
  if (typeof value !== 'string') return '';
  let v = value.normalize('NFC').replace(CONTROL_CHARS, '');
  v = multiline ? v.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n') : v.replace(/\s+/g, ' ');
  return v.trim().slice(0, max);
}

export function isValidPhone(phone) {
  if (!PHONE_ALLOWED.test(phone)) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

export function isValidEmail(email) {
  return email.length <= 254 && EMAIL_RE.test(email);
}

// Today's date in the hospital's time zone (Uganda, UTC+3) as YYYY-MM-DD.
export function todayInZone(timeZone = 'Africa/Kampala', now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

function addDays(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function isRealDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const d = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso;
}

// Looks like a spam bot: honeypot filled in, or the form was submitted
// implausibly quickly after it was rendered.
export function looksLikeBot(body, minMs = 3000, now = Date.now()) {
  if (typeof body.website === 'string' && body.website.trim() !== '') return true;
  const started = Number(body.formStartedAt);
  if (Number.isFinite(started) && started > 0 && now - started < minMs) return true;
  return false;
}

function common(body, errors) {
  const fullName = clean(body.fullName, { max: 100 });
  if (fullName.length < 2) errors.fullName = 'Please enter your full name.';
  else if (!NAME_RE.test(fullName)) errors.fullName = 'Name may only contain letters, spaces, apostrophes, dots and hyphens.';

  const phone = clean(body.phone, { max: 25 });
  const email = clean(body.email, { max: 254 }).toLowerCase();
  if (email && !isValidEmail(email)) errors.email = 'Please enter a valid email address.';

  if (body.consent !== true) errors.consent = 'Please confirm that you agree to the privacy notice.';
  return { fullName, phone, email };
}

export function validateAppointment(body = {}, { now = new Date() } = {}) {
  const errors = {};
  const { fullName, phone, email } = common(body, errors);

  if (!phone) errors.phone = 'Please enter a phone number we can call you on.';
  else if (!isValidPhone(phone)) errors.phone = 'Please enter a valid phone number, e.g. +256 7XX XXX XXX.';

  const service = clean(body.service, { max: 80 });
  if (!service) errors.service = 'Please choose a service or department.';

  const preferredDate = clean(body.preferredDate, { max: 10 });
  const today = todayInZone('Africa/Kampala', now);
  if (!preferredDate) errors.preferredDate = 'Please choose a preferred date.';
  else if (!isRealDate(preferredDate)) errors.preferredDate = 'Please choose a valid date.';
  else if (preferredDate < today) errors.preferredDate = 'The preferred date cannot be in the past.';
  else if (preferredDate > addDays(today, MAX_DAYS_AHEAD)) errors.preferredDate = `Please choose a date within the next ${MAX_DAYS_AHEAD} days.`;

  const preferredTime = clean(body.preferredTime, { max: 20 }).toLowerCase();
  if (!TIME_PERIODS.includes(preferredTime)) errors.preferredTime = 'Please choose a preferred time of day.';

  const message = clean(body.message, { multiline: true, max: 500 });

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: { fullName, phone, email: email || null, service, preferredDate, preferredTime, message: message || null },
  };
}

export function validateMessage(body = {}) {
  const errors = {};
  const { fullName, phone, email } = common(body, errors);

  if (!email && !phone) errors.email = 'Please give an email address or phone number so we can reply.';
  if (phone && !isValidPhone(phone)) errors.phone = 'Please enter a valid phone number.';

  const subject = clean(body.subject, { max: 120 });
  if (subject.length < 3) errors.subject = 'Please enter a short subject.';

  const message = clean(body.message, { multiline: true, max: 1500 });
  if (message.length < 10) errors.message = 'Please enter a message of at least 10 characters.';

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: { fullName, phone: phone || null, email: email || null, subject, message },
  };
}

export const constants = { TIME_PERIODS, MAX_DAYS_AHEAD };
