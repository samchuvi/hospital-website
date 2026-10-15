// Export stored requests to CSV from the command line (for authorised staff
// or the site administrator). Uses the same storage settings as the server.
//
//   npm run export-requests -- appointments > appointments.csv
//   npm run export-requests -- messages > messages.csv

import { config } from '../src/config.js';
import { createStore } from '../src/storage.js';
import { toCsv } from '../src/app.js';

const collection = process.argv[2] || 'appointments';
const fields = {
  appointments: ['reference', 'createdAt', 'status', 'fullName', 'phone', 'email', 'service', 'preferredDate', 'preferredTime', 'message'],
  messages: ['reference', 'createdAt', 'status', 'fullName', 'phone', 'email', 'subject', 'message'],
}[collection];

if (!fields) {
  console.error('Usage: npm run export-requests -- <appointments|messages>');
  process.exit(1);
}

const quiet = { info() {}, warn: (m) => console.error(m) };
const store = await createStore({ ...config, allowFileStorage: true }, quiet);
const rows = await store.list(collection, { limit: 100000 });
process.stdout.write(toCsv(rows, fields) + '\r\n');
await store.close();
