// Base HTTP client for all API calls.
// Components and hooks should import from feature-specific services (e.g. conversationsService.js),
// not call this directly.

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const getIdToken = async (auth) => {
  if (!auth?.currentUser) return null;
  return auth.currentUser.getIdToken();
};

const request = async (method, path, body = null, auth = null) => {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };

  if (auth) {
    const token = await getIdToken(auth);
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE_URL}${path}`, options);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} failed (${res.status}): ${text}`);
  }

  return res.json();
};

export const get = (path, auth) => request('GET', path, null, auth);
export const post = (path, body, auth) => request('POST', path, body, auth);
export const put = (path, body, auth) => request('PUT', path, body, auth);
export const del = (path, auth) => request('DELETE', path, null, auth);
