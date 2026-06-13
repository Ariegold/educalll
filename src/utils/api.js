/**
 * api.js — HTTP API Utility
 * ──────────────────────────────────────────────────────────────
 * Centralises all HTTP calls to the backend (n8n webhooks → Neon).
 * Swap the base URLs here when Taiwo's NestJS backend is deployed.
 *
 * Security:
 *   - All requests include the Authorization header with a Bearer JWT.
 *   - The JWT is stored in memory (not localStorage) — see AuthContext.
 *   - For now, the token is not implemented (demo mode has no auth tokens).
 *     Taiwo: add `headers.Authorization = 'Bearer ' + getToken()` here.
 *
 * Error handling:
 *   - apiCall throws on non-2xx responses.
 *   - Components catch errors and show toasts — they do not crash.
 */

/**
 * Base fetch wrapper. All API calls go through here.
 * @param {string} url
 * @param {object} options - fetch options
 * @returns {Promise<any>} parsed JSON
 */
async function apiCall(url, options = {}) {
  if (!url) {
    // Webhook URL not yet configured — silently skip (demo mode).
    return null;
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      // TODO (Taiwo): Add JWT auth header here once backend is live:
      // 'Authorization': `Bearer ${getAccessToken()}`,
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`API error ${response.status}: ${text}`);
  }

  // 204 No Content — nothing to parse
  if (response.status === 204) return null;

  return response.json();
}

/* ── EXPORTED API METHODS ───────────────────────────────────── */

/**
 * loadSchoolData — called on login to hydrate app state from Neon.
 * Expects the webhook to return:
 * { students: [...], timetable: [...], attendance: {...}, alerts: [...] }
 */
export async function loadSchoolData(webhookUrl, schoolId) {
  return apiCall(webhookUrl, {
    method: 'POST',
    body: JSON.stringify({ action: 'load_all', school_id: schoolId }),
  });
}

/**
 * saveStudent — upserts a student record in Neon.
 */
export async function saveStudent(webhookUrl, schoolId, student) {
  return apiCall(webhookUrl, {
    method: 'POST',
    body: JSON.stringify({
      action:    student.id ? 'update' : 'insert',
      school_id: schoolId,
      student: {
        id:                   student.id,
        full_name:            student.name,
        admission_number:     student.admno,
        gender:               student.gender,
        class_name:           student.class,
        parent_name:          student.parent,
        parent_phone:         student.phone,
        fingerprint_enrolled: student.fp || false,
        has_sen:              student.sen || false,
        sen_type:             student.senType || null,
        equipment:            student.equipment || [],
      },
    }),
  });
}

/**
 * saveAttendance — writes a single scan record to Neon.
 * Taiwo: this should upsert on (student_id, date, subject, class_name).
 */
export async function saveAttendance(webhookUrl, schoolId, record) {
  return apiCall(webhookUrl, {
    method: 'POST',
    body: JSON.stringify({
      action:    'upsert',
      school_id: schoolId,
      record,
    }),
  });
}

/**
 * fireScanWebhook — fires on every biometric scan.
 * n8n workflow: receive → write Neon → check lateness → send WhatsApp if needed.
 */
export async function fireScanWebhook(webhookUrl, payload) {
  return apiCall(webhookUrl, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * getReports — fetches historical attendance data for the Reports page.
 */
export async function getReports(webhookUrl, schoolId, filters = {}) {
  return apiCall(webhookUrl, {
    method: 'POST',
    body: JSON.stringify({
      action:    'get_reports',
      school_id: schoolId,
      filters,
    }),
  });
}
