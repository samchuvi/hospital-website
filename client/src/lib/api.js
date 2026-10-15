// Talks to the Express API. In development Vite proxies /api to localhost:4000.
// In production set VITE_API_URL to the deployed API, e.g. https://your-api.onrender.com

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Online forms only work when an API is available. We never fake a success.
export const apiConfigured = Boolean(API_URL) || import.meta.env.DEV;

export class ApiError extends Error {
  constructor(message, { status, fields } = {}) {
    super(message);
    this.status = status;
    this.fields = fields || {};
  }
}

export async function submitForm(path, payload, { timeoutMs = 20000 } = {}) {
  if (!apiConfigured) throw new ApiError('Online requests are not switched on yet.', { status: 0 });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    const msg = err.name === 'AbortError'
      ? 'The request took too long. Please check your connection and try again.'
      : 'We could not reach our server. Please check your internet connection and try again.';
    throw new ApiError(msg, { status: 0 });
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok || !data?.ok) {
    const fallback = res.status === 429
      ? 'Too many attempts. Please wait a little and try again, or call us.'
      : 'Something went wrong while sending your request. Please try again or contact us by phone.';
    throw new ApiError(data?.error || fallback, { status: res.status, fields: data?.fields });
  }
  return data;
}
