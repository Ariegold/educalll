/**
 * helpers.js — Shared Utility Functions
 * Used across components to avoid code duplication.
 */

/** Get initials from a full name. "Adaeze Okonkwo" → "AO" */
export function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

/** Today's date as ISO string: "2026-06-12" */
export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

/** Today's date as display string: "Friday, 12 June 2026" */
export function todayDisplay() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

/** Current time as "08:45" */
export function nowTime() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/** Build the scan key used in AppContext.scans */
export function scanKey(date, cls, subject, studentId) {
  return `${date}-${cls}-${subject}-${studentId}`;
}

/** Convert a school name to a URL-safe slug */
export function toSlug(name = '') {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Count students by fingerprint status */
export function enrolmentStats(students) {
  const enrolled  = students.filter(s => s.fp).length;
  const pending   = students.filter(s => !s.fp).length;
  const sen       = students.filter(s => s.sen).length;
  return { enrolled, pending, sen, total: students.length };
}

/** Calculate attendance rate for a class/subject on a given date */
export function attendanceRate(students, scans, date, cls, subject) {
  const classStudents = students.filter(s => s.class === cls);
  if (!classStudents.length) return 0;
  const present = classStudents.filter(s => {
    const key = scanKey(date, cls, subject, s.id);
    return scans[key]?.in;
  }).length;
  return Math.round((present / classStudents.length) * 100);
}

/** Export data as a CSV download */
export function downloadCSV(rows, filename) {
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
