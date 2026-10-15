// Client-side validation for instant feedback. The server re-validates
// everything; never rely on this alone.

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;
const NAME_RE = /^[\p{L}\p{M}' .-]+$/u;
const PHONE_ALLOWED = /^\+?[0-9\s()-]+$/;
export const TIME_PERIODS = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'any', label: 'Any time' },
];
export const MAX_DAYS_AHEAD = 90;

export function isValidPhone(phone) {
  if (!PHONE_ALLOWED.test(phone)) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

export function isValidEmail(email) {
  return email.length <= 254 && EMAIL_RE.test(email);
}

export function todayInUganda(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Kampala', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function checkName(v, errors) {
  const name = (v || '').trim();
  if (name.length < 2) errors.fullName = 'Please enter your full name.';
  else if (name.length > 100) errors.fullName = 'Name is too long.';
  else if (!NAME_RE.test(name)) errors.fullName = 'Name may only contain letters, spaces, apostrophes, dots and hyphens.';
}

export function validateAppointment(v, now = new Date()) {
  const errors = {};
  checkName(v.fullName, errors);

  const phone = (v.phone || '').trim();
  if (!phone) errors.phone = 'Please enter a phone number we can call you on.';
  else if (!isValidPhone(phone)) errors.phone = 'Please enter a valid phone number, e.g. +256 7XX XXX XXX.';

  const email = (v.email || '').trim();
  if (email && !isValidEmail(email)) errors.email = 'Please enter a valid email address.';

  if (!v.service) errors.service = 'Please choose a service or department.';

  const today = todayInUganda(now);
  if (!v.preferredDate) errors.preferredDate = 'Please choose a preferred date.';
  else if (v.preferredDate < today) errors.preferredDate = 'The preferred date cannot be in the past.';
  else if (v.preferredDate > addDays(today, MAX_DAYS_AHEAD)) errors.preferredDate = `Please choose a date within the next ${MAX_DAYS_AHEAD} days.`;

  if (!TIME_PERIODS.some((t) => t.value === v.preferredTime)) errors.preferredTime = 'Please choose a preferred time of day.';

  if ((v.message || '').length > 500) errors.message = 'Please keep your message under 500 characters.';
  if (!v.consent) errors.consent = 'Please confirm that you agree to the privacy notice.';
  return errors;
}

export function validateContact(v) {
  const errors = {};
  checkName(v.fullName, errors);
  const email = (v.email || '').trim();
  const phone = (v.phone || '').trim();
  if (!email && !phone) errors.email = 'Please give an email address or phone number so we can reply.';
  if (email && !isValidEmail(email)) errors.email = 'Please enter a valid email address.';
  if (phone && !isValidPhone(phone)) errors.phone = 'Please enter a valid phone number.';
  if ((v.subject || '').trim().length < 3) errors.subject = 'Please enter a short subject.';
  const msg = (v.message || '').trim();
  if (msg.length < 10) errors.message = 'Please enter a message of at least 10 characters.';
  else if (msg.length > 1500) errors.message = 'Please keep your message under 1,500 characters.';
  if (!v.consent) errors.consent = 'Please confirm that you agree to the privacy notice.';
  return errors;
}
