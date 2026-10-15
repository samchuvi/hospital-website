import { config, emailConfigured } from './config.js';
import { createStore } from './storage.js';
import { createApp } from './app.js';

const store = await createStore(config);
const app = createApp({ store, config });

if (config.isProduction && config.allowedOrigins.length === 0) {
  console.warn('[cors] ALLOWED_ORIGINS is empty — browsers on your website will not be able to call this API.');
}
if (!emailConfigured()) console.warn('[mail] Email notifications are NOT configured (see README). Requests are stored only.');
if (!config.adminApiKey) console.warn('[admin] ADMIN_API_KEY is not set — staff export endpoints are disabled.');

const server = app.listen(config.port, () => {
  console.log(`[server] Listening on port ${config.port} (storage: ${store ? store.kind : 'none'})`);
});

async function shutdown() {
  server.close();
  await store?.close?.();
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
