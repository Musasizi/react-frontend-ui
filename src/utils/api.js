/**
 * utils/api.js – Centralised API Client
 *
 * KEY CONCEPT – Separation of Concerns
 * All HTTP requests live here so every component calls a clean function
 * instead of writing raw fetch() calls with headers and JSON.stringify.
 * If the base URL changes, you only need to update one constant.
 *
 * KEY CONCEPT – async/await with fetch
 * fetch() returns a Promise.  We use async/await so the code reads like
 * synchronous code.  We also check res.ok so that HTTP error responses
 * (4xx, 5xx) are thrown as errors, not silently returned as data.
 *
 * KEY CONCEPT – Authorization header
 * Protected routes require the JWT in every request:
 *   Authorization: Bearer <token>
 * The helper function authHeaders() builds this object so we don't repeat it.
 */

// The Express server base URL. Change this when you deploy to production.
const API_BASE = 'http://localhost:3000/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build the common JSON + Authorization headers.
 * @param {string} token – JWT from localStorage
 * @returns {Object} headers object ready for fetch()
 */
const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

/**
 * Wrapper around fetch that throws a proper Error for non-2xx responses.
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<any>} parsed JSON body
 */
const request = async (url, options = {}) => {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) {
    // Throw an Error so components can catch it and show a message
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
};

// ── Auth ──────────────────────────────────────────────────────────────────────

/** POST /api/login – Returns { token, user } on success */
export const login = ({ username, password }) =>
  request(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

/** POST /api/register – Returns { message } on success */
export const register = (username, password, email) =>
  request(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email }),
  });

// ── Chapters ──────────────────────────────────────────────────────────────────

/** GET /api/chapters – Public; returns array of chapters */
export const getChapters = () =>
  request(`${API_BASE}/chapters`);

/** GET /api/chapters/stats – Returns aggregate stats (requires auth) */
export const getChapterStats = (token) =>
  request(`${API_BASE}/chapters/stats`, { headers: authHeaders(token) });

/** GET /api/chapters/:id – Public; returns a single chapter */
export const getChapter = (id) =>
  request(`${API_BASE}/chapters/${id}`);

/** POST /api/chapters – Protected; creates a new chapter */
export const createChapter = (chapter, token) =>
  request(`${API_BASE}/chapters`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(chapter),
  });

/** PUT /api/chapters/:id – Protected; updates name/description */
export const updateChapter = (id, chapter, token) =>
  request(`${API_BASE}/chapters/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(chapter),
  });

/** DELETE /api/chapters/:id – Protected; removes a chapter */
export const deleteChapter = (id, token) =>
  request(`${API_BASE}/chapters/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });

/** GET /api/chapters/:id/users – Protected; returns enrolled users */
export const getUsersInChapter = (chapterId, token) =>
  request(`${API_BASE}/chapters/${chapterId}/users`, {
    headers: authHeaders(token),
  });

/** POST /api/chapters/add-user – Protected; enrols a user */
export const addUserToChapter = (userId, chapterId, token) =>
  request(`${API_BASE}/chapters/add-user`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ userId, chapterId }),
  });

// ── Users ─────────────────────────────────────────────────────────────────────

/** GET /api/users – Protected; returns all users */
export const getUsers = (token) =>
  request(`${API_BASE}/users`, {
    headers: authHeaders(token),
  });

/** GET /api/users/:id – Protected; returns a single user */
export const getUserById = (id, token) =>
  request(`${API_BASE}/users/${id}`, {
    headers: authHeaders(token),
  });

/** PUT /api/users/:id – Protected; updates username/email */
export const updateUser = (id, user, token) =>
  request(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(user),
  });

/** DELETE /api/users/:id – Protected; removes a user */
export const deleteUser = (id, token) =>
  request(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
