import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import crypto from 'node:crypto';
import { rateLimit } from 'express-rate-limit';
import { config as defaultConfig, emailConfigured } from './config.js';
import { validateAppointment, validateMessage, looksLikeBot } from './validation.js';
import { makeReference } from './storage.js';
import { notifyAppointment, notifyMessage } from './mailer.js';

const CSV_FIELDS = {
  appointments: ['reference', 'createdAt', 'status', 'fullName', 'phone', 'email', 'service', 'preferredDate', 'preferredTime', 'message'],
  messages: ['reference', 'createdAt', 'status', 'fullName', 'phone', 'email', 'subject', 'message'],
};

function toCsv(rows, fields) {
  const esc = (v) => {
    let s = v == null ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // guard against spreadsheet formula injection
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [fields.join(','), ...rows.map((r) => fields.map((f) => esc(r[f])).join(','))].join('\r\n');
}

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function createApp({ store, config = defaultConfig, log = console, notify = { notifyAppointment, notifyMessage } } = {}) {
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', /^\d+$/.test(config.trustProxy) ? Number(config.trustProxy) : config.trustProxy);

  app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } } }));
  app.use(
    cors({
      origin(origin, cb) {
        // Same-origin / server-to-server requests have no Origin header.
        if (!origin || config.allowedOrigins.includes(origin)) return cb(null, true);
        return cb(null, false);
      },
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 600,
    }),
  );
  app.use(express.json({ limit: '10kb' }));

  const submitLimiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    limit: config.rateLimitMax,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { ok: false, error: 'Too many requests from this connection. Please try again later or call the hospital.' },
  });

  const adminLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, storage: store ? store.kind : 'none', email: emailConfigured() });
  });

  function makeSubmitHandler({ collection, prefix, validate, notifyFn }) {
    return async (req, res, next) => {
      try {
        const body = req.body && typeof req.body === 'object' ? req.body : {};
        if (looksLikeBot(body, config.minFormFillMs)) {
          // Respond vaguely; do not store anything.
          return res.status(400).json({ ok: false, error: 'Your submission could not be processed. Please try again.' });
        }
        const result = validate(body);
        if (!result.ok) return res.status(422).json({ ok: false, error: 'Please correct the highlighted fields.', fields: result.errors });

        if (!store) {
          return res.status(503).json({
            ok: false,
            error: 'Online requests are not available at the moment. Please contact the hospital by phone.',
          });
        }

        const doc = { reference: makeReference(prefix), status: 'new', ...result.value, createdAt: new Date().toISOString() };
        await store.insert(collection, doc);
        const notified = await notifyFn(doc, log);
        if (!notified) log.warn?.(`[${collection}] ${doc.reference} saved; email notification not sent (not configured or failed).`);
        res.status(201).json({ ok: true, reference: doc.reference });
      } catch (err) {
        next(err);
      }
    };
  }

  app.post(
    '/api/appointments',
    submitLimiter,
    makeSubmitHandler({ collection: 'appointments', prefix: 'APT', validate: validateAppointment, notifyFn: notify.notifyAppointment }),
  );
  app.post(
    '/api/messages',
    submitLimiter,
    makeSubmitHandler({ collection: 'messages', prefix: 'MSG', validate: validateMessage, notifyFn: notify.notifyMessage }),
  );

  // ---- Staff access (protected by ADMIN_API_KEY) ----
  function requireAdmin(req, res, next) {
    if (!config.adminApiKey || config.adminApiKey.length < 24) {
      return res.status(503).json({ ok: false, error: 'Admin access is not configured.' });
    }
    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token || !safeEqual(token, config.adminApiKey)) return res.status(401).json({ ok: false, error: 'Unauthorised.' });
    res.set('Cache-Control', 'no-store');
    next();
  }

  for (const collection of ['appointments', 'messages']) {
    app.get(`/api/admin/${collection}`, adminLimiter, requireAdmin, async (req, res, next) => {
      try {
        if (!store) return res.status(503).json({ ok: false, error: 'No storage configured.' });
        const limit = Math.min(Math.max(Number(req.query.limit) || 500, 1), 5000);
        const rows = await store.list(collection, { limit });
        if (req.query.format === 'csv') {
          res.type('text/csv').attachment(`${collection}-${new Date().toISOString().slice(0, 10)}.csv`);
          return res.send(toCsv(rows, CSV_FIELDS[collection]));
        }
        res.json({ ok: true, count: rows.length, items: rows });
      } catch (err) {
        next(err);
      }
    });
  }

  app.use('/api', (_req, res) => res.status(404).json({ ok: false, error: 'Not found.' }));
  app.use((_req, res) => res.status(404).json({ ok: false, error: 'Not found.' }));

  // Error handler: never leak internals to the client.
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ ok: false, error: 'Invalid request body.' });
    if (err.type === 'entity.too.large') return res.status(413).json({ ok: false, error: 'Request is too large.' });
    log.error?.('[error]', err);
    res.status(500).json({ ok: false, error: 'Something went wrong on our side. Please try again or call the hospital.' });
  });

  return app;
}

export { toCsv };
