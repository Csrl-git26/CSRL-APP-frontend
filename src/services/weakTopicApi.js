// ============================================================
// weakTopicApi.js — API service for weak topic feature
//
// Follows the same pattern as dataService.js:
//   - Reads JWT from localStorage automatically
//   - Uses VITE_API_BASE_URL env var
//   - Handles multipart form data for file uploads
// ============================================================

const TOKEN_KEY = 'csrl_token';

function resolveApiBase() {
  if (import.meta.env.PROD || (typeof window !== 'undefined' && window.location.hostname !== 'localhost')) {
    return 'https://csrl-app-backed-1.onrender.com';
  }
  
  const envBase = String(import.meta.env.VITE_API_BASE_URL || '').trim();
  if (envBase && envBase !== '/') return envBase.replace(/\/$/, '');

  return '';
}

const BASE = resolveApiBase();

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const error = new Error(errData.message || `API error (${res.status})`);
    if (errData.validationErrors) error.validationErrors = errData.validationErrors;
    throw error;
  }
  return res.json();
}

const apiCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

async function cachedFetch(urlKey, originalUrl) {
  const now = Date.now();
  if (apiCache.has(urlKey)) {
    const { data, timestamp } = apiCache.get(urlKey);
    if (now - timestamp < CACHE_TTL) return data;
  }
  const promise = fetch(originalUrl, { headers: authHeaders() }).then(handleResponse);
  apiCache.set(urlKey, { data: promise, timestamp: now });
  try {
    await promise;
  } catch (err) {
    apiCache.delete(urlKey);
  }
  return promise;
}

export function clearWeakTopicsFrontendCache() {
  apiCache.clear();
}

/**
 * getStudentWeakTopics — fetch weak topic data for a student.
 * If testId provided: returns single doc or {}.
 * If not provided: returns array sorted by testId.
 */
export async function getStudentWeakTopics(studentId, testId = null) {
  let urlKey = `${BASE}/api/student/weak-topics/${encodeURIComponent(studentId)}`;
  const params = new URLSearchParams();
  if (testId) params.set('testId', testId);
  const qs = params.toString();
  if (qs) urlKey += `?${qs}`;
  
  const originalUrl = `${urlKey}${qs ? '&' : '?'}_t=${Date.now()}`;
  return cachedFetch(urlKey, originalUrl);
}

/**
 * getCenterWeakTopics — fetch weak topic data for a center.
 * If testId provided: returns single doc or {}.
 * If not provided: returns array sorted by testId.
 */
export async function getCenterWeakTopics(centerId, testId = null) {
  let urlKey = `${BASE}/api/center/weak-topics/${encodeURIComponent(centerId)}`;
  const params = new URLSearchParams();
  if (testId) params.set('testId', testId);
  const qs = params.toString();
  if (qs) urlKey += `?${qs}`;

  const originalUrl = `${urlKey}${qs ? '&' : '?'}_t=${Date.now()}`;
  return cachedFetch(urlKey, originalUrl);
}

/**
 * uploadTestSheet — upload a single unified test sheet CSV for admin.
 * @param {FormData} formData - fields: testId, file
 */
export async function uploadTestSheet(formData) {
  clearWeakTopicsFrontendCache();
  const res = await fetch(`${BASE}/api/admin/weak-topics/upload-test-sheet`, {
    method:  'POST',
    headers: authHeaders(), // Do NOT set Content-Type — browser sets multipart boundary
    body:    formData,
  });
  return handleResponse(res);
}

/**
 * getStudentOverallWeakTopics — fetch overall weak topic data for a student.
 */
export async function getStudentOverallWeakTopics(studentId) {
  const urlKey = `${BASE}/api/student/overall-weak-topics/${encodeURIComponent(studentId)}`;
  const originalUrl = `${urlKey}?_t=${Date.now()}`;
  return cachedFetch(urlKey, originalUrl);
}

/**
 * getCenterOverallWeakTopics — fetch overall weak topic data for a center.
 */
export async function getCenterOverallWeakTopics(centerId) {
  const urlKey = `${BASE}/api/center/overall-weak-topics/${encodeURIComponent(centerId)}`;
  const originalUrl = `${urlKey}?_t=${Date.now()}`;
  return cachedFetch(urlKey, originalUrl);
}

/**
 * clearWeakTopicsApi — Admin only: clear all weak topics data across all collections
 */
export async function clearWeakTopicsApi() {
  const url = `${BASE}/api/admin/weak-topics/clear`;
  const res = await fetch(url, { method: 'DELETE', headers: authHeaders() });
  return handleResponse(res);
}
