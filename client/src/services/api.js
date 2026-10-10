// Base HTTP client for all API calls.
// Components and hooks should import from feature-specific services (e.g. taskService.js),
// not call this directly.
import { auth } from '../config/firebase.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Mirrors the backend error format: { success: false, error: { code, message, fields? } }
export class ApiError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

// AI replies can take a while; everything else should answer quickly.
const TIMEOUT_MS = 30000;
const AI_TIMEOUT_MS = 130000;
const isAiRequest = (method, path) => method === 'POST' && /\/messages(\/[^/]+\/regenerate)?$/.test(path);

const request = async (method, path, body) => {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  // On page load Firebase restores the session asynchronously; without this wait,
  // early requests go out without a token and fail with 401.
  await auth.authStateReady();
  let token;
  try {
    token = await auth.currentUser?.getIdToken();
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not refresh your sign-in. Check your connection.');
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), isAiRequest(method, path) ? AI_TIMEOUT_MS : TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError(0, 'TIMEOUT', 'The server took too long to respond. Please try again.');
    }
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the server. Check your connection.');
  } finally {
    clearTimeout(timer);
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // Non-JSON body (e.g. proxy error page) — handled below.
  }

  if (!res.ok || payload?.success === false) {
    const err = payload?.error;
    throw new ApiError(res.status, err?.code || 'HTTP_ERROR', err?.message || `Request failed (${res.status})`, err?.fields);
  }

  return payload?.data;
};

export const get = (path) => request('GET', path);
export const post = (path, body = {}) => request('POST', path, body);
export const put = (path, body = {}) => request('PUT', path, body);
export const patch = (path, body = {}) => request('PATCH', path, body);
export const del = (path) => request('DELETE', path);
