# EduCall — Biometric Subject Attendance System
**Mythros Support Services Ltd** | Company No. 16384279

---

## What this is
EduCall is a React.js web application for tracking **subject-by-subject biometric attendance** in Nigerian secondary schools (SS1–SS3). Students check in and out of each class period via a fingerprint scanner (SecuGen Hamster Pro 20). Parents receive automatic WhatsApp alerts for absences, late arrivals, and missing SEN equipment — powered by n8n workflows connecting to Neon PostgreSQL.

---

## Tech stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 18 | This repo |
| Backend (Taiwo) | NestJS | Phase 0 first |
| Scanner SDK | SecuGen Hamster Pro 20 | USB, Windows/Linux |
| Kiosk wrapper | Tauri v2 | Offline-first desktop |
| Middleware | n8n Cloud | Webhooks → Neon |
| Database | Neon PostgreSQL | Serverless |
| WhatsApp | Meta Cloud API | NOT Twilio |
| Offline | SQLite queue | Syncs when online |

---

## Quick start

```bash
npm install
npm start        # development server → http://localhost:3000
npm run build    # production build → /build
```

**Demo login:** any email and any password. The role tab (Admin / Teacher / Kiosk) determines which views you see.

---

## Project structure

```
src/
├── App.js                    ← Root: providers + view routing
├── index.js                  ← ReactDOM.createRoot
├── styles/
│   └── globals.css           ← Design tokens, 8pt grid, iOS spacing
├── context/
│   ├── AuthContext.js        ← Login / logout / session
│   └── AppContext.js         ← Students, timetable, scans, alerts (useReducer)
├── data/
│   └── seedData.js           ← Demo students, teachers, timetable
├── utils/
│   ├── api.js                ← All HTTP calls to n8n webhooks
│   └── helpers.js            ← Shared utility functions
├── hooks/
│   └── useToast.js           ← Toast notification hook
├── components/
│   ├── layout/
│   │   ├── AppShell.js       ← Sidebar + main area wrapper
│   │   ├── Sidebar.js        ← Navigation, role-based, badge counters
│   │   └── TopBar.js         ← Page header with title and actions slot
│   └── ui/
│       ├── Button.js         ← 5 variants, 44px tap target
│       ├── Card.js           ← Surface container
│       ├── Badge.js          ← Status chips
│       ├── Modal.js          ← Accessible dialog
│       ├── Toast.js          ← Notification banner
│       ├── StatCard.js       ← Dashboard metric card
│       ├── Icon.js           ← Material Symbols wrapper
│       └── index.js          ← Barrel export
└── pages/
    ├── LoginPage.js          ← 3-role tabs, demo mode
    ├── RegisterPage.js       ← 3-step school onboarding wizard
    ├── DashboardPage.js      ← Stats, sessions, SEN panel
    ├── KioskPage.js          ← Full-screen biometric terminal
    ├── BiometricPage.js      ← Per-subject attendance table
    ├── StudentsPage.js       ← Roster + SEN management
    ├── TeachersPage.js       ← Teacher management
    ├── TimetablePage.js      ← Weekly schedule CRUD
    ├── EnrolmentPage.js      ← Fingerprint enrolment workflow
    ├── ReportsPage.js        ← Analytics, at-risk list, CSV export
    ├── AlertsPage.js         ← Parent WhatsApp alert log
    └── SettingsPage.js       ← Webhooks, device config, Phase 0 checklist
```

---

## GitHub Pages deployment

```bash
npm install --save-dev gh-pages

# Add to package.json scripts:
# "predeploy": "npm run build",
# "deploy": "gh-pages -d build"

npm run deploy
# Deploys to: https://ariegold.github.io/educall
```

`"homepage": "."` is already set in package.json for relative asset paths.

---

## Connecting the backend (Taiwo)

1. **Run Phase 0 hardware validation first** (Settings page checklist)
2. Configure n8n webhook URLs in the Settings page
3. In `src/context/AuthContext.js`: replace the demo login with a real `fetch('/api/auth/login', ...)` call
4. In `src/context/AppContext.js → recordScan()`: the scan webhook is already firing — just set the URL
5. In `src/utils/api.js`: add `Authorization: Bearer ${token}` header once JWT is implemented
6. Replace `SEED_STUDENTS / SEED_TEACHERS / SEED_TIMETABLE` with API responses from the `dbLoad` webhook

**n8n payload on each scan:**
```json
{
  "event": "student_checked_in",
  "student_name": "Adaeze Okonkwo",
  "admno": "SCH/24/001",
  "class": "SS2A",
  "subject": "Mathematics",
  "timestamp": "2026-06-12T09:34:12",
  "type": "check_in",
  "parent_phone": "+234 803 111 2222"
}
```

---

## Security notes

- No `innerHTML` or `dangerouslySetInnerHTML` anywhere — all content is React-rendered
- All form inputs are controlled state — no direct DOM mutation
- Passwords are not stored in this repo — demo only uses localStorage
- JWT auth header placeholder is in `src/utils/api.js` — Taiwo to implement
- Every API call goes through `src/utils/api.js` — single place to add auth headers, logging, error handling

---

## Commercial context

| Item | Value |
|---|---|
| Pricing | ₦60,000 / classroom / month |
| Pilot gate | 5 Letters of Intent |
| Build estimate | £5,950–£6,500 |
| Developer | Taiwo Ibidapo-Obe (backend, NestJS) + Samson Ameh (frontend integration) |

---

*Built by Mythros Support Services Ltd — ariegold.github.io/educall*
