/**
 * AppContext — Global Application State
 * ─────────────────────────────────────────────────────────────
 * Manages all school data: students, teachers, timetable, scans, and alerts.
 *
 * Architecture note for Taiwo:
 *   This context uses local state (demo mode). In production:
 *   - Replace seed data with API calls via src/utils/api.js
 *   - Each action (addStudent, markAttendance, etc.) should call the API
 *     and update local state only on success (optimistic updates optional).
 *   - For real-time updates from the kiosk, consider a WebSocket subscription
 *     that updates scans and alerts in this context automatically.
 *
 * Data isolation:
 *   All data is scoped to schoolId. Never mix data across schools.
 *   The Neon DB queries must always include a `WHERE school_id = $1` clause.
 */
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { SEED_STUDENTS, SEED_TEACHERS, SEED_TIMETABLE, SEED_ALERTS } from '../data/seedData';

/* ── CONTEXT ─────────────────────────────────────────────────── */
const AppContext = createContext(null);

/* ── INITIAL STATE ──────────────────────────────────────────── */
const initialState = {
  students:    SEED_STUDENTS,
  teachers:    SEED_TEACHERS,
  timetable:   SEED_TIMETABLE,
  alerts:      SEED_ALERTS,
  /**
   * scans — attendance records keyed by `date-class-subject-studentId`
   * Example: { '2026-06-12-SS2A-Mathematics-1': { in: '08:45', out: '09:40' } }
   * In production: persisted to Neon via n8n webhook on every scan event.
   */
  scans:       {},
  recentScans: [],  // Last N kiosk scans — shown on dashboard + kiosk feed
  nextStudentId: 13,
  nextTeacherId: 6,
  nextTTId:      10,
  webhooks: {
    scan:            '',  // Fires on every fingerprint check-in/out
    absent:          '',  // Fires when student misses a period entirely
    early:           '',  // Fires on early checkout
    dbLoad:          '',  // Loads all school data from Neon on login
    dbSaveStudent:   '',  // Saves new/updated student record to Neon
    dbSaveAttendance:'',  // Saves each scan record to Neon
    dbGetReports:    '',  // Fetches historical attendance for Reports page
  },
};

/* ── REDUCER ─────────────────────────────────────────────────── */
/**
 * Pure reducer — all state mutations go through here.
 * This makes the state history debuggable and testable.
 */
function appReducer(state, action) {
  switch (action.type) {

    /* ── STUDENTS ─────────────────────────────────────────────── */
    case 'ADD_STUDENT':
      return {
        ...state,
        students: [...state.students, { ...action.payload, id: state.nextStudentId }],
        nextStudentId: state.nextStudentId + 1,
      };
    case 'UPDATE_STUDENT':
      return {
        ...state,
        students: state.students.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s
        ),
      };
    case 'DELETE_STUDENT':
      return { ...state, students: state.students.filter(s => s.id !== action.id) };

    /* ── TEACHERS ─────────────────────────────────────────────── */
    case 'ADD_TEACHER':
      return {
        ...state,
        teachers: [...state.teachers, { ...action.payload, id: state.nextTeacherId }],
        nextTeacherId: state.nextTeacherId + 1,
      };
    case 'UPDATE_TEACHER':
      return {
        ...state,
        teachers: state.teachers.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      };
    case 'DELETE_TEACHER':
      return { ...state, teachers: state.teachers.filter(t => t.id !== action.id) };

    /* ── TIMETABLE ────────────────────────────────────────────── */
    case 'ADD_PERIOD':
      return {
        ...state,
        timetable: [...state.timetable, { ...action.payload, id: state.nextTTId }],
        nextTTId: state.nextTTId + 1,
      };
    case 'DELETE_PERIOD':
      return { ...state, timetable: state.timetable.filter(t => t.id !== action.id) };

    /* ── ATTENDANCE / SCANS ───────────────────────────────────── */
    case 'RECORD_SCAN': {
      const { key, type, time, student, subject } = action.payload;
      const existing = state.scans[key] || {};
      return {
        ...state,
        scans: { ...state.scans, [key]: { ...existing, [type]: time } },
        recentScans: [
          {
            name:     student.name,
            initials: student.name.split(' ').map(n => n[0]).join('').slice(0, 2),
            class:    student.class,
            subject,
            type,
            time,
          },
          ...state.recentScans.slice(0, 49), // Keep last 50
        ],
      };
    }

    /* ── ALERTS ───────────────────────────────────────────────── */
    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts] };
    case 'MARK_ALERT_SENT':
      return {
        ...state,
        alerts: state.alerts.map(a =>
          a.id === action.id ? { ...a, status: 'sent' } : a
        ),
      };
    case 'RETRY_ALL_PENDING':
      return {
        ...state,
        alerts: state.alerts.map(a =>
          a.status === 'pending' ? { ...a, status: 'sent' } : a
        ),
      };

    /* ── WEBHOOKS ─────────────────────────────────────────────── */
    case 'SAVE_WEBHOOKS':
      return { ...state, webhooks: { ...state.webhooks, ...action.payload } };

    /* ── ENROLMENT ────────────────────────────────────────────── */
    case 'ENROL_STUDENT':
      return {
        ...state,
        students: state.students.map(s =>
          s.id === action.id ? { ...s, fp: true } : s
        ),
      };

    default:
      console.warn(`Unknown action: ${action.type}`);
      return state;
  }
}

/* ── PROVIDER ────────────────────────────────────────────────── */
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  /* ── ACTION CREATORS ────────────────────────────────────────── */
  // Wrapping dispatch in named functions keeps component code clean
  // and makes it easy to add API calls alongside state updates.

  const addStudent    = useCallback(data => dispatch({ type: 'ADD_STUDENT',    payload: data }), []);
  const updateStudent = useCallback(data => dispatch({ type: 'UPDATE_STUDENT', payload: data }), []);
  const deleteStudent = useCallback(id   => dispatch({ type: 'DELETE_STUDENT', id            }), []);

  const addTeacher    = useCallback(data => dispatch({ type: 'ADD_TEACHER',    payload: data }), []);
  const updateTeacher = useCallback(data => dispatch({ type: 'UPDATE_TEACHER', payload: data }), []);
  const deleteTeacher = useCallback(id   => dispatch({ type: 'DELETE_TEACHER', id            }), []);

  const addPeriod    = useCallback(data => dispatch({ type: 'ADD_PERIOD',   payload: data }), []);
  const deletePeriod = useCallback(id   => dispatch({ type: 'DELETE_PERIOD', id           }), []);

  const enrolStudent = useCallback(id => dispatch({ type: 'ENROL_STUDENT', id }), []);

  const addAlert      = useCallback(alert => dispatch({ type: 'ADD_ALERT',       payload: alert }), []);
  const retryPending  = useCallback(()    => dispatch({ type: 'RETRY_ALL_PENDING'               }), []);

  const saveWebhooks  = useCallback(cfg => dispatch({ type: 'SAVE_WEBHOOKS', payload: cfg }), []);

  /**
   * recordScan — records a biometric scan and fires the n8n webhook.
   * Called from both the Kiosk page (hardware scan) and the Attendance
   * page (manual mark).
   *
   * @param {object} student
   * @param {'in'|'out'} type
   * @param {string} selectedClass
   * @param {string} selectedSubject
   */
  const recordScan = useCallback(async (student, type, selectedClass, selectedSubject) => {
    const now  = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const date = new Date().toISOString().split('T')[0];
    const key  = `${date}-${selectedClass}-${selectedSubject}-${student.id}`;

    dispatch({ type: 'RECORD_SCAN', payload: { key, type, time: now, student, subject: selectedSubject } });

    // ── Fire n8n webhook (non-blocking — don't await in UI) ──
    // Taiwo: this fires to the scan webhook which should then:
    //   1. Write the record to Neon PostgreSQL
    //   2. If type==='in' and late → trigger WhatsApp alert via Meta Cloud API
    //   3. If type==='absent' (end of period) → trigger absence alert
    if (state.webhooks.scan) {
      fetch(state.webhooks.scan, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event:        type === 'in' ? 'student_checked_in' : 'student_checked_out',
          student_name: student.name,
          admno:        student.admno,
          class:        student.class,
          subject:      selectedSubject,
          date,
          timestamp:    new Date().toISOString(),
          type:         type === 'in' ? 'check_in' : 'check_out',
          parent_phone: student.phone,
          school_id:    'demo',  // Replace with real schoolId from auth context
        }),
      }).catch(err => console.warn('Webhook failed (non-critical):', err.message));
    }

    return { key, time: now };
  }, [state.webhooks.scan]);

  const value = {
    ...state,
    // Actions
    addStudent, updateStudent, deleteStudent,
    addTeacher, updateTeacher, deleteTeacher,
    addPeriod, deletePeriod,
    enrolStudent,
    addAlert, retryPending,
    saveWebhooks,
    recordScan,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/* ── HOOK ────────────────────────────────────────────────────── */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
