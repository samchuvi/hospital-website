import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createApp } from '../src/app.js';
import { createStore } from '../src/storage.js';
import { validateAppointment, todayInZone } from '../src/validation.js';

const ADMIN_KEY = 'test-admin-key-0123456789abcdef';
const silent = { info() {}, warn() {}, error() {} };
let server, base, dir;
const notified = [];

function cfg(overrides = {}) {
  return {
    allowedOrigins: ['http://localhost:5173'],
    adminApiKey: ADMIN_KEY,
    rateLimitWindowMs: 60_000,
    rateLimitMax: 6,
    minFormFillMs: 3000,
    trustProxy: '',
    ...overrides,
  };
}

async function start(app) {
  return new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
}

function tomorrow() {
  const d = new Date(`${todayInZone()}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

const validAppt = () => ({
  fullName: 'Test Patient',
  phone: '+256 700 000000',
  email: 'test@example.com',
  service: 'Outpatient consultations',
  preferredDate: tomorrow(),
  preferredTime: 'morning',
  message: 'Follow-up visit',
  consent: true,
  website: '',
  formStartedAt: Date.now() - 10_000,
});

const post = (p, body, headers = {}) =>
  fetch(base + p, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });

before(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'hospital-api-'));
  const store = await createStore({ allowFileStorage: true, dataFile: path.join(dir, 'requests.json') }, silent);
  const app = createApp({
    store,
    config: cfg(),
    log: silent,
    notify: {
      notifyAppointment: async (d) => (notified.push(d.reference), false),
      notifyMessage: async () => false,
    },
  });
  server = await start(app);
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.close();
  await rm(dir, { recursive: true, force: true });
});

test('health reports storage mode honestly', async () => {
  const r = await fetch(base + '/api/health');
  const j = await r.json();
  assert.equal(j.storage, 'file');
  assert.equal(typeof j.email, 'boolean');
  assert.equal(r.headers.get('x-powered-by'), null);
  assert.ok(r.headers.get('x-content-type-options'));
});

test('valid appointment request is stored and returns a reference', async () => {
  const r = await post('/api/appointments', validAppt());
  assert.equal(r.status, 201);
  const j = await r.json();
  assert.match(j.reference, /^APT-\d{8}-[0-9A-F]{6}$/);
  assert.ok(notified.includes(j.reference));
});

test('invalid appointment returns field errors', async () => {
  const r = await post('/api/appointments', { ...validAppt(), fullName: '', phone: 'abc', preferredDate: '2000-01-01', consent: false });
  assert.equal(r.status, 422);
  const j = await r.json();
  assert.ok(j.fields.fullName && j.fields.phone && j.fields.preferredDate && j.fields.consent);
});

test('honeypot and too-fast submissions are rejected', async () => {
  assert.equal((await post('/api/appointments', { ...validAppt(), website: 'http://spam' })).status, 400);
  assert.equal((await post('/api/appointments', { ...validAppt(), formStartedAt: Date.now() })).status, 400);
});

test('malformed JSON is handled without leaking details', async () => {
  const r = await fetch(base + '/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
  assert.equal(r.status, 400);
  const j = await r.json();
  assert.equal(j.error, 'Invalid request body.');
});

test('contact message validation and storage', async () => {
  const bad = await post('/api/messages', { fullName: 'A B', subject: 'Hi', message: 'short', consent: true, formStartedAt: Date.now() - 9000 });
  assert.equal(bad.status, 422);
  const ok = await post('/api/messages', {
    fullName: 'Visitor Name',
    email: 'visitor@example.com',
    subject: 'Visiting hours',
    message: 'I would like to ask about visiting arrangements.',
    consent: true,
    formStartedAt: Date.now() - 9000,
  });
  assert.equal(ok.status, 201);
});

test('admin endpoints require the key and export CSV safely', async () => {
  assert.equal((await fetch(base + '/api/admin/appointments')).status, 401);
  assert.equal((await fetch(base + '/api/admin/appointments', { headers: { Authorization: 'Bearer wrong' } })).status, 401);
  const r = await fetch(base + '/api/admin/appointments', { headers: { Authorization: `Bearer ${ADMIN_KEY}` } });
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.ok(j.count >= 1);
  const csv = await fetch(base + '/api/admin/appointments?format=csv', { headers: { Authorization: `Bearer ${ADMIN_KEY}` } });
  assert.match(csv.headers.get('content-type'), /text\/csv/);
  assert.match(await csv.text(), /^reference,createdAt,status/);
});

test('CORS only allows configured origins', async () => {
  const good = await fetch(base + '/api/health', { headers: { Origin: 'http://localhost:5173' } });
  assert.equal(good.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  const bad = await fetch(base + '/api/health', { headers: { Origin: 'https://evil.example' } });
  assert.equal(bad.headers.get('access-control-allow-origin'), null);
});

test('rate limiting kicks in on public submissions', async () => {
  let last;
  for (let i = 0; i < 8; i++) last = await post('/api/messages', {});
  assert.equal(last.status, 429);
});

test('without storage, submissions are refused rather than faked', async () => {
  const app = createApp({ store: null, config: cfg(), log: silent });
  const s = await start(app);
  const r = await fetch(`http://127.0.0.1:${s.address().port}/api/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validAppt()),
  });
  s.close();
  assert.equal(r.status, 503);
});

test('validation strips control characters and rejects far-future dates', () => {
  const far = new Date(Date.now() + 200 * 864e5).toISOString().slice(0, 10);
  const r = validateAppointment({ ...validAppt(), fullName: 'Jane\u0000 Doe', preferredDate: far });
  assert.equal(r.value.fullName, 'Jane Doe');
  assert.ok(r.errors.preferredDate);
});
