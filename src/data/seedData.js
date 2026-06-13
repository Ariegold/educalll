/**
 * seedData.js — Demo / Seed Data
 * ──────────────────────────────────────────────────────────────
 * Used in demo mode so the app is fully functional without a backend.
 * In production, this data is replaced by API responses from Neon PostgreSQL.
 *
 * Taiwo: when the dbLoad webhook is configured in Settings, AppContext will
 * call it on login and overwrite these arrays with real school data.
 */

export const CLASSES = [
  'SS1A', 'SS1B', 'SS1C',
  'SS2A', 'SS2B', 'SS2C',
  'SS3A', 'SS3B', 'SS3C',
];

export const SUBJECTS = [
  'Mathematics', 'English Language', 'Physics', 'Chemistry',
  'Biology', 'Economics', 'Government', 'Literature',
  'Computer Science', 'Civic Education', 'Agricultural Science',
  'Geography', 'Commerce', 'Further Mathematics',
];

export const PERIODS = [
  { id: 1, label: 'Period 1', time: '8:40–9:40'   },
  { id: 2, label: 'Period 2', time: '9:40–10:40'  },
  { id: 3, label: 'Period 3', time: '10:40–11:40' },
  { id: 4, label: 'Period 4', time: '11:40–12:40' },
  { id: 5, label: 'Period 5', time: '12:40–13:40' },
  { id: 6, label: 'Period 6', time: '13:40–14:40' },
  { id: 7, label: 'Period 7', time: '14:40–15:40' },
];

export const SEED_STUDENTS = [
  { id: 1,  name: 'Adaeze Okonkwo',      admno: 'SCH/24/001', gender: 'female', class: 'SS2A', parent: 'Mrs Okonkwo',   phone: '+234 803 111 2222', fp: true,  sen: false, equipment: [] },
  { id: 2,  name: 'Chukwuemeka Eze',     admno: 'SCH/24/002', gender: 'male',   class: 'SS2A', parent: 'Mr Eze',        phone: '+234 806 333 4444', fp: true,  sen: false, equipment: [] },
  { id: 3,  name: 'Fatima Aliyu',        admno: 'SCH/24/003', gender: 'female', class: 'SS1A', parent: 'Alhaji Aliyu',  phone: '+234 807 555 6666', fp: true,  sen: false, equipment: [] },
  { id: 4,  name: 'Babatunde Adeyemi',   admno: 'SCH/24/004', gender: 'male',   class: 'SS2A', parent: 'Mr Adeyemi',    phone: '+234 809 777 8888', fp: false, sen: true,  senType: 'ASD',                equipment: ['Communication board'] },
  { id: 5,  name: 'Ngozi Obi',           admno: 'SCH/24/005', gender: 'female', class: 'SS3A', parent: 'Mrs Obi',       phone: '+234 802 999 0000', fp: true,  sen: false, equipment: [] },
  { id: 6,  name: 'Emeka Nwosu',         admno: 'SCH/24/006', gender: 'male',   class: 'SS1B', parent: 'Mr Nwosu',      phone: '+234 808 123 4567', fp: true,  sen: false, equipment: [] },
  { id: 7,  name: 'Blessing Udoh',       admno: 'SCH/24/007', gender: 'female', class: 'SS2B', parent: 'Mrs Udoh',      phone: '+234 803 234 5678', fp: true,  sen: false, equipment: [] },
  { id: 8,  name: 'Tunde Bakare',        admno: 'SCH/24/008', gender: 'male',   class: 'SS3A', parent: 'Mr Bakare',     phone: '+234 805 345 6789', fp: true,  sen: false, equipment: [] },
  { id: 9,  name: 'Chiamaka Osei',       admno: 'SCH/24/009', gender: 'female', class: 'SS2A', parent: 'Mrs Osei',      phone: '+234 811 456 7890', fp: true,  sen: false, equipment: [] },
  { id: 10, name: 'Ibrahim Hassan',      admno: 'SCH/24/010', gender: 'male',   class: 'SS1C', parent: 'Mr Hassan',     phone: '+234 812 567 8901', fp: false, sen: true,  senType: 'Hearing Impairment', equipment: ['Hearing aid'] },
  { id: 11, name: 'Aisha Mohammed',      admno: 'SCH/24/011', gender: 'female', class: 'SS3B', parent: 'Mrs Mohammed',  phone: '+234 813 678 9012', fp: true,  sen: false, equipment: [] },
  { id: 12, name: 'Oluwafemi Adeleke',   admno: 'SCH/24/012', gender: 'male',   class: 'SS2A', parent: 'Mr Adeleke',    phone: '+234 814 789 0123', fp: true,  sen: false, equipment: [] },
];

export const SEED_TEACHERS = [
  { id: 1, name: 'Mr Adeyemi',    email: 'adeyemi@school.ng', phone: '+234 809 111 2222', subjects: ['Mathematics', 'Further Mathematics'], classes: ['SS2A', 'SS3A'], role: 'teacher', access: 'yes', fp: false },
  { id: 2, name: 'Mrs Okonkwo',   email: 'okonkwo@school.ng', phone: '+234 803 222 3333', subjects: ['English Language', 'Literature'],     classes: ['SS2A', 'SS1C'], role: 'teacher', access: 'yes', fp: false },
  { id: 3, name: 'Mr Nwosu',      email: 'nwosu@school.ng',   phone: '+234 808 333 4444', subjects: ['Physics', 'Computer Science'],         classes: ['SS1A', 'SS2C'], role: 'teacher', access: 'yes', fp: false },
  { id: 4, name: 'Mrs Aliyu',     email: 'aliyu@school.ng',   phone: '+234 807 444 5555', subjects: ['Chemistry'],                           classes: ['SS3A'],         role: 'hod',     access: 'yes', fp: false },
  { id: 5, name: 'Mr Bakare',     email: 'bakare@school.ng',  phone: '+234 805 555 6666', subjects: ['Biology'],                             classes: ['SS2B'],         role: 'teacher', access: 'no',  fp: false },
];

export const SEED_TIMETABLE = [
  { id: 1, subject: 'Mathematics',      class: 'SS2A', day: 'Monday',    period: 'Period 3', time: '10:40–11:40', teacher: 'Mr Adeyemi'  },
  { id: 2, subject: 'English Language', class: 'SS2A', day: 'Monday',    period: 'Period 1', time: '8:40–9:40',   teacher: 'Mrs Okonkwo' },
  { id: 3, subject: 'Physics',          class: 'SS1A', day: 'Monday',    period: 'Period 2', time: '9:40–10:40',  teacher: 'Mr Nwosu'    },
  { id: 4, subject: 'Chemistry',        class: 'SS3A', day: 'Tuesday',   period: 'Period 4', time: '11:40–12:40', teacher: 'Mrs Aliyu'   },
  { id: 5, subject: 'Biology',          class: 'SS2B', day: 'Wednesday', period: 'Period 3', time: '10:40–11:40', teacher: 'Mr Bakare'   },
  { id: 6, subject: 'Economics',        class: 'SS3B', day: 'Thursday',  period: 'Period 5', time: '12:40–13:40', teacher: 'Mrs Eze'     },
  { id: 7, subject: 'Government',       class: 'SS1B', day: 'Friday',    period: 'Period 2', time: '9:40–10:40',  teacher: 'Mr Adeyemi'  },
  { id: 8, subject: 'Literature',       class: 'SS1C', day: 'Monday',    period: 'Period 4', time: '11:40–12:40', teacher: 'Mrs Okonkwo' },
  { id: 9, subject: 'Computer Science', class: 'SS2C', day: 'Tuesday',   period: 'Period 1', time: '8:40–9:40',   teacher: 'Mr Nwosu'    },
];

export const SEED_ALERTS = [
  { id: 1, student: 'Babatunde Adeyemi', class: 'SS2A', subject: 'Mathematics',     type: 'absent',    date: '2026-06-10', parent: 'Mr Adeyemi',   status: 'sent',    sen: true,  senType: 'ASD' },
  { id: 2, student: 'Ibrahim Hassan',    class: 'SS1C', subject: 'English Language', type: 'absent',    date: '2026-06-10', parent: 'Mr Hassan',    status: 'sent' },
  { id: 3, student: 'Babatunde Adeyemi', class: 'SS2A', subject: 'Physics',          type: 'equipment', date: '2026-06-11', parent: 'Mr Adeyemi',   status: 'sent',    sen: true,  senType: 'ASD',               missingEquipment: ['Communication board'] },
  { id: 4, student: 'Ibrahim Hassan',    class: 'SS1C', subject: 'Chemistry',        type: 'equipment', date: '2026-06-11', parent: 'Mr Hassan',    status: 'sent',    sen: true,  senType: 'Hearing Impairment', missingEquipment: ['Hearing aid'] },
  { id: 5, student: 'Adaeze Okonkwo',   class: 'SS2A', subject: 'Physics',          type: 'late',      date: '2026-06-12', parent: 'Mrs Okonkwo',  status: 'pending' },
];
