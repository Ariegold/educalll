/**
 * ReportsPage — Attendance analytics, class-level summaries, and CSV exports.
 *
 * What this page does:
 *   - Shows attendance rate per class and per subject for the current week
 *   - Identifies students below the configurable threshold (default 75%)
 *   - Exports full attendance records as CSV for printing or Ofsted/WAEC compliance
 *   - In production (Taiwo): fetches data from the dbGetReports webhook which
 *     queries Neon PostgreSQL with date-range filters
 *
 * Data flow:
 *   AppContext.scans → local computation (demo)
 *   AppContext.webhooks.dbGetReports → POST → n8n → Neon → response (production)
 */
import React, { useState, useMemo } from 'react';
import { useApp }    from '../context/AppContext';
import { TopBar }    from '../components/layout/TopBar';
import { Card }      from '../components/ui/Card';
import { Button }    from '../components/ui/Button';
import { Badge }     from '../components/ui/Badge';
import { StatCard }  from '../components/ui/StatCard';
import { Icon }      from '../components/ui/Icon';
import { CLASSES, SUBJECTS } from '../data/seedData';
import { downloadCSV, todayISO } from '../utils/helpers';

/* ── HELPERS ─────────────────────────────────────────────────── */

/** Stable "simulated" attendance rate for demo — consistent per class/subject pair */
function demoRate(cls, subject) {
  const seed = (cls + subject).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return 60 + (seed % 38); // Range: 60–97%
}

/** Rate colour for status indicators */
function rateColor(rate) {
  if (rate >= 85) return 'var(--secondary)';
  if (rate >= 70) return '#f59e0b';
  return 'var(--tertiary)';
}

/** Bar component reused in table */
function MiniBar({ rate }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
      <div style={{ flex: 1, height: '5px', background: 'var(--surface-container-high)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${rate}%`, background: rateColor(rate), borderRadius: '3px', transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: 700, color: rateColor(rate), minWidth: '32px' }}>{rate}%</span>
    </div>
  );
}

/* ── REPORTS PAGE ────────────────────────────────────────────── */
export function ReportsPage({ showToast }) {
  const { students, scans, timetable } = useApp();

  // Configurable at-risk threshold
  const [threshold, setThreshold] = useState(75);
  const [view,      setView]      = useState('classes'); // 'classes' | 'subjects' | 'students' | 'atrisk'
  const today = todayISO();

  /* ── COMPUTED DATA ── */

  /** Per-class summary (demo: stable pseudorandom rates) */
  const classSummary = useMemo(() => CLASSES.map(cls => {
    const classStudents = students.filter(s => s.class === cls);
    // Sum across all subjects taught to this class
    const classTT = timetable.filter(t => t.class === cls);
    const rateSum = classTT.length > 0
      ? classTT.reduce((sum, t) => sum + demoRate(cls, t.subject), 0) / classTT.length
      : demoRate(cls, 'Overall');
    return { cls, students: classStudents.length, rate: Math.round(rateSum) };
  }), [students, timetable]);

  /** Per-subject summary */
  const subjectSummary = useMemo(() => SUBJECTS.slice(0, 10).map(sub => {
    const rate = CLASSES.reduce((sum, cls) => sum + demoRate(cls, sub), 0) / CLASSES.length;
    return { subject: sub, rate: Math.round(rate) };
  }).sort((a, b) => b.rate - a.rate), []);

  /** Student-level summary — calculates % of subjects attended */
  const studentSummary = useMemo(() => students.map(s => {
    // In demo, rate based on student index for variety
    const base = 60 + ((s.id * 17) % 38);
    const days = Math.floor(base / 5);
    return { ...s, rate: base, days };
  }), [students]);

  /** At-risk students below threshold */
  const atRisk = useMemo(() => studentSummary.filter(s => s.rate < threshold), [studentSummary, threshold]);

  /* ── EXPORT ── */
  function exportClasses() {
    const rows = [['Class', 'Students', 'Attendance Rate', 'Status']];
    classSummary.forEach(({ cls, students: n, rate }) =>
      rows.push([cls, n, `${rate}%`, rate >= 85 ? 'Good' : rate >= 70 ? 'Satisfactory' : 'Needs improvement'])
    );
    downloadCSV(rows, `educall-class-report-${today}.csv`);
    showToast('Class report exported');
  }

  function exportStudents() {
    const rows = [['Name', 'Adm No', 'Class', 'Attendance %', 'Status']];
    studentSummary.forEach(s =>
      rows.push([s.name, s.admno, s.class, `${s.rate}%`, s.rate >= threshold ? 'OK' : 'At risk'])
    );
    downloadCSV(rows, `educall-student-report-${today}.csv`);
    showToast('Student report exported');
  }

  /* ── STATS ── */
  const overallRate   = Math.round(classSummary.reduce((s, c) => s + c.rate, 0) / classSummary.length);
  const bestClass     = [...classSummary].sort((a, b) => b.rate - a.rate)[0];
  const worstClass    = [...classSummary].sort((a, b) => a.rate - b.rate)[0];

  /* ── TABS ── */
  const tabs = [
    { id: 'classes',  label: 'By Class',   icon: 'school' },
    { id: 'subjects', label: 'By Subject',  icon: 'menu_book' },
    { id: 'students', label: 'All Students',icon: 'groups' },
    { id: 'atrisk',   label: `At Risk (${atRisk.length})`, icon: 'warning' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar
        title="Reports & Analytics"
        subtitle="Attendance summaries · Export to CSV"
        actions={
          <>
            <Button variant="secondary" size="sm" icon="download" onClick={exportClasses}>Class Report</Button>
            <Button variant="primary"   size="sm" icon="download" onClick={exportStudents}>Student Report</Button>
          </>
        }
      />

      <div style={{ padding: '24px 32px 40px' }}>

        {/* ── TOP STATS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
          <StatCard value={`${overallRate}%`}    label="Overall attendance"       chip="School average"  chipColor={overallRate >= 80 ? 'green' : 'amber'} icon="bar_chart"    />
          <StatCard value={students.length}       label="Students tracked"         chip="Active"          chipColor="blue"                                   icon="groups"       />
          <StatCard value={bestClass?.cls || '—'} label={`Best class — ${bestClass?.rate || 0}%`}  chip="Top class"   chipColor="green"   icon="emoji_events" />
          <StatCard value={atRisk.length}         label={`Below ${threshold}% threshold`}           chip="At risk"     chipColor="red"     icon="warning"      />
        </div>

        {/* ── VIEW TABS ── */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', borderBottom: '1px solid var(--surface-container-high)', paddingBottom: '0' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              style={{
                display:     'flex', alignItems: 'center', gap: '6px',
                padding:     '10px 16px', border: 'none', cursor: 'pointer',
                background:  'transparent', fontSize: '13px', fontWeight: 600,
                color:       view === tab.id ? 'var(--primary)' : 'var(--outline)',
                borderBottom:`2px solid ${view === tab.id ? 'var(--primary)' : 'transparent'}`,
                marginBottom:'-1px', transition: 'all 0.15s', minHeight: '44px',
                fontFamily:  'var(--font-body)',
              }}
            >
              <Icon name={tab.icon} size={15} />
              {tab.label}
            </button>
          ))}

          {/* Threshold control — shown on At Risk tab */}
          {view === 'atrisk' && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--outline)' }}>At-risk below:</label>
              <input
                type="number" min={50} max={95} value={threshold}
                onChange={e => setThreshold(Number(e.target.value))}
                style={{ width: '64px', padding: '6px 10px', border: 'none', borderRadius: '8px', background: 'var(--surface-container-low)', fontSize: '13px', fontWeight: 700, minHeight: '36px', textAlign: 'center', outline: 'none', boxShadow: '0 0 0 1.5px var(--outline-variant)' }}
              />
              <span style={{ fontSize: '12px', color: 'var(--outline)' }}>%</span>
            </div>
          )}
        </div>

        {/* ── BY CLASS ── */}
        {view === 'classes' && (
          <Card>
            <div style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Attendance by Class</div>
            {classSummary.map(({ cls, students: n, rate }) => (
              <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--surface-container-low)' }}>
                <div style={{ width: '52px', flexShrink: 0 }}>
                  <Badge color={rate >= 85 ? 'green' : rate >= 70 ? 'amber' : 'red'}>{cls}</Badge>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--outline)', width: '80px', flexShrink: 0 }}>{n} students</div>
                <MiniBar rate={rate} />
                <Badge color={rate >= 85 ? 'green' : rate >= 70 ? 'amber' : 'red'} style={{ flexShrink: 0 }}>
                  {rate >= 85 ? 'Good' : rate >= 70 ? 'OK' : 'Low'}
                </Badge>
              </div>
            ))}
          </Card>
        )}

        {/* ── BY SUBJECT ── */}
        {view === 'subjects' && (
          <Card>
            <div style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Attendance by Subject</div>
            {subjectSummary.map(({ subject, rate }, i) => (
              <div key={subject} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--surface-container-low)' }}>
                <span style={{ fontSize: '11px', color: 'var(--outline)', width: '16px', flexShrink: 0 }}>#{i + 1}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, width: '180px', flexShrink: 0 }}>{subject}</span>
                <MiniBar rate={rate} />
              </div>
            ))}
          </Card>
        )}

        {/* ── ALL STUDENTS ── */}
        {view === 'students' && (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--surface-container-high)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 700 }}>All Students</div>
              <Button variant="secondary" size="sm" icon="download" onClick={exportStudents}>Export CSV</Button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-container-low)' }}>
                    {['#', 'Student', 'Class', 'Attendance', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {studentSummary.map((s, i) => (
                    <tr key={s.id} style={{ background: i % 2 === 1 ? 'var(--surface-container-low)' : 'transparent' }}>
                      <td style={{ padding: '10px 16px', fontSize: '11px', color: 'var(--outline)' }}>{i + 1}</td>
                      <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 600 }}>{s.name}</td>
                      <td style={{ padding: '10px 16px' }}><Badge color="blue">{s.class}</Badge></td>
                      <td style={{ padding: '10px 16px', minWidth: '180px' }}><MiniBar rate={s.rate} /></td>
                      <td style={{ padding: '10px 16px' }}>
                        <Badge color={s.rate >= threshold ? 'green' : 'red'}>
                          {s.rate >= threshold ? 'On track' : 'At risk'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ── AT RISK ── */}
        {view === 'atrisk' && (
          <div>
            {atRisk.length === 0 ? (
              <Card>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Icon name="check_circle" size={48} style={{ color: 'var(--secondary)', display: 'block', margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>No students at risk</div>
                  <div style={{ fontSize: '13px', color: 'var(--outline)', marginTop: '4px' }}>All students are above the {threshold}% threshold</div>
                </div>
              </Card>
            ) : (
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 700 }}>
                    {atRisk.length} student{atRisk.length !== 1 ? 's' : ''} below {threshold}% attendance
                  </div>
                  <Button variant="danger" size="sm" icon="download" onClick={exportStudents}>Export list</Button>
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--error-container)', borderRadius: '10px', fontSize: '12px', color: '#690005', marginBottom: '16px' }}>
                  These students require intervention. WhatsApp alerts have been sent to their parents for missed sessions.
                </div>
                {atRisk.map((s, i) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: 'var(--surface-container-low)', marginBottom: '6px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--tertiary-container)', color: 'var(--on-tertiary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                      {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--outline)' }}>{s.admno} · {s.class}</div>
                    </div>
                    <div style={{ width: '160px' }}><MiniBar rate={s.rate} /></div>
                    <Badge color="red">{s.rate}%</Badge>
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}

        {/* Production note for Taiwo */}
        <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--surface-container-low)', borderRadius: '10px', fontSize: '11px', color: 'var(--outline)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <Icon name="info" size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span><strong>Developer note:</strong> Demo uses computed data. In production, configure the Reports Webhook in Settings — this page will POST date/class/subject filters to n8n, which queries Neon PostgreSQL and returns real records. See <code>src/utils/api.js → getReports()</code> for the API call shape.</span>
        </div>
      </div>
    </div>
  );
}
