import 'dotenv/config';

const bool = (v, fallback = false) => (v === undefined || v === '' ? fallback : ['1', 'true', 'yes'].includes(String(v).toLowerCase()));

const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  isProduction,
  port: Number(process.env.PORT) || 4000,
  // Comma-separated list of front-end origins allowed to call the API.
  allowedOrigins: (process.env.ALLOWED_ORIGINS || (isProduction ? '' : 'http://localhost:5173,http://localhost:4173'))
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean),
  hospitalName: process.env.HOSPITAL_NAME || 'the hospital',

  // Storage: MongoDB (recommended for production) or a local JSON file.
  mongoUri: process.env.MONGODB_URI || '',
  mongoDbName: process.env.MONGODB_DB || 'hospital_website',
  dataFile: process.env.DATA_FILE || new URL('../data/requests.json', import.meta.url).pathname,
  // Local file storage is wiped on most free cloud hosts when the service restarts,
  // so in production it must be enabled explicitly.
  allowFileStorage: bool(process.env.ALLOW_FILE_STORAGE, !isProduction),

  // Admin access for authorised hospital staff (list / export requests).
  adminApiKey: process.env.ADMIN_API_KEY || '',

  // Email notifications (optional).
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: bool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || '',
  },
  notifyEmail: process.env.NOTIFY_EMAIL || '',
  sendPatientAcknowledgement: bool(process.env.SEND_PATIENT_ACK, false),

  // Abuse protection.
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 5,
  minFormFillMs: Number(process.env.MIN_FORM_FILL_MS ?? 3000),
  trustProxy: process.env.TRUST_PROXY ?? (isProduction ? '1' : ''),
};

export function emailConfigured() {
  const s = config.smtp;
  return Boolean(s.host && s.user && s.pass && s.from && config.notifyEmail);
}
