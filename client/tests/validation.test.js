import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateAppointment, validateContact, isValidPhone, todayInUganda, addDays } from '../src/lib/validation.js';

const base = () => ({
  fullName: 'Test Patient',
  phone: '0700 000000',
  email: '',
  service: 'Pharmacy',
  preferredDate: addDays(todayInUganda(), 2),
  preferredTime: 'afternoon',
  message: '',
  consent: true,
});

test('accepts a complete appointment request', () => {
  assert.deepEqual(validateAppointment(base()), {});
});

test('flags missing and invalid appointment fields', () => {
  const e = validateAppointment({ ...base(), fullName: 'X', phone: '12', email: 'nope', service: '', preferredTime: 'night', consent: false });
  for (const k of ['fullName', 'phone', 'email', 'service', 'preferredTime', 'consent']) assert.ok(e[k], k);
});

test('rejects past and far-future dates', () => {
  assert.ok(validateAppointment({ ...base(), preferredDate: addDays(todayInUganda(), -1) }).preferredDate);
  assert.ok(validateAppointment({ ...base(), preferredDate: addDays(todayInUganda(), 120) }).preferredDate);
});

test('phone formats', () => {
  assert.ok(isValidPhone('+256 700 000000'));
  assert.ok(isValidPhone('0772-123-456'));
  assert.ok(!isValidPhone('call me'));
  assert.ok(!isValidPhone('12345'));
});

test('contact form requires a way to reply', () => {
  const e = validateContact({ fullName: 'Ann Visitor', email: '', phone: '', subject: 'Hello', message: 'A question about parking.', consent: true });
  assert.ok(e.email);
  assert.deepEqual(validateContact({ fullName: 'Ann Visitor', email: 'a@b.co', phone: '', subject: 'Hello', message: 'A question about parking.', consent: true }), {});
});
