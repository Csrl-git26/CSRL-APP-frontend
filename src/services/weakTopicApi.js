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

/**
 * getStudentWeakTopics — fetch weak topic data for a student.
 * If testId provided: returns single doc or {}.
 * If not provided: returns array sorted by testId.
 */
export async function getStudentWeakTopics(studentId, testId = null) {
  let url = `${BASE}/api/student/weak-topics/${encodeURIComponent(studentId)}`;
  const params = new URLSearchParams();
  if (testId) params.set('testId', testId);
  const qs = params.toString();
  if (qs) url += `?${qs}&_t=${Date.now()}`;
  else url += `?_t=${Date.now()}`;

  const res = await fetch(url, { headers: authHeaders() });
  return handleResponse(res);
}

/**
 * getCenterWeakTopics — fetch weak topic data for a center.
 * If testId provided: returns single doc or {}.
 * If not provided: returns array sorted by testId.
 */
export async function getCenterWeakTopics(centerId, testId = null) {
  let url = `${BASE}/api/center/weak-topics/${encodeURIComponent(centerId)}`;
  const params = new URLSearchParams();
  if (testId) params.set('testId', testId);
  const qs = params.toString();
  if (qs) url += `?${qs}&_t=${Date.now()}`;
  else url += `?_t=${Date.now()}`;

  const res = await fetch(url, { headers: authHeaders() });
  return handleResponse(res);
}

/**
 * uploadTestSheet — upload a single unified test sheet CSV for admin.
 * @param {FormData} formData - fields: testId, file
 */
export async function uploadTestSheet(formData) {
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
  const url = `${BASE}/api/student/overall-weak-topics/${encodeURIComponent(studentId)}?_t=${Date.now()}`;
  const res = await fetch(url, { headers: authHeaders() });
  return handleResponse(res);
}

/**
 * getCenterOverallWeakTopics — fetch overall weak topic data for a center.
 */
export async function getCenterOverallWeakTopics(centerId) {
  const url = `${BASE}/api/center/overall-weak-topics/${encodeURIComponent(centerId)}?_t=${Date.now()}`;
  const res = await fetch(url, { headers: authHeaders() });
  return handleResponse(res);
}

/**
 * clearWeakTopicsApi — Admin only: clear all weak topics data across all collections
 */
export async function clearWeakTopicsApi() {
  const url = `${BASE}/api/admin/weak-topics/clear`;
  const res = await fetch(url, { method: 'DELETE', headers: authHeaders() });
  return handleResponse(res);
}
