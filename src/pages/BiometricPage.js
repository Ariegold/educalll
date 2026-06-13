/**
 * BiometricPage — Per-subject attendance marking with manual override and CSV export.
 * Used by admins and teachers to view and manage attendance for a specific class/subject.
 */
import React, { useState } from 'react';
import { useApp }   from '../context/AppContext';
import { TopBar }   from '../components/layout/TopBar';
import { Card }     from '../components/ui/Card';
import { Button }   from '../components/ui/Button';
import { Badge }    from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Icon }     from '../components/ui/Icon';
import { CLASSES, SUBJECTS } from '../data/seedData';
import { todayISO, scanKey, downloadCSV, getInitials } from '../utils/helpers';

export function BiometricPage({ showToast, onOpenKiosk }) {
  const { students, scans, timetable, recordScan } = useApp();
  const [cls,     setCls]     = useState('SS2A');
  const [subject, setSubject] = useState('Mathematics');
  const today = todayISO();

  const classStudents = students.filter(s => s.class === cls);
  const getRecord = s => scans[scanKey(today, cls, subject, s.id)] || {};

  const checkedIn  = classStudents.filter(s => getRecord(s).in).length;
  const checkedOut = classStudents.filter(s => getRecord(s).out).length;
  const absent     = classStudents.length - checkedIn;
  const rate       = classStudents.length > 0 ? Math.round((checkedIn / classStudents.length) * 100) : 0;

  async function mark(student, type) {
    const result = await recordScan(student, type, cls, subject);
    showToast(`${type === 'in' ? 'Checked in' : 'Checked out'}: ${student.name}`);
  }

  async function markAll() {
    for (const s of classStudents) {
      if (!getRecord(s).in) await recordScan(s, 'in', cls, subject);
    }
    showToast(`All ${cls} students marked in`);
  }

  function exportCSV() {
    const rows = [['Name', 'Adm No', 'Class', 'Subject', 'Date', 'Check In', 'Check Out', 'Status']];
    classStudents.forEach(s => {
      const r = getRecord(s);
      rows.push([s.name, s.admno, s.class, subject, today, r.in || '—', r.out || '—', r.in ? 'Present' : 'Absent']);
    });
    downloadCSV(rows, `educall-${cls}-${subject}-${today}.csv`);
    showToast('CSV exported');
  }

  const barColor = rate >= 80 ? 'var(--secondary)' : rate >= 60 ? '#f59e0b' : 'var(--tertiary)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar title="Biometric Attendance" subtitle="Per-subject check-in & check-out" />
      <div style={{ padding: '24px 32px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

          {/* Controls */}
          <Card>
            <div style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Select Class & Subject</div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Class</label>
              <select value={cls} onChange={e => setCls(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: 'none', borderRadius: '8px', outline: 'none', fontSize: '14px', minHeight: '44px', background: 'var(--surface-container-low)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                {CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: 'none', borderRadius: '8px', outline: 'none', fontSize: '14px', minHeight: '44px', background: 'var(--surface-container-low)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <Button variant="primary" fullWidth icon="fingerprint" onClick={onOpenKiosk}>Open Biometric Kiosk</Button>
          </Card>

          {/* Stats */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <StatCard value={checkedIn}  label="Checked in today"  chip="In"     chipColor="green"   icon="login"      />
              <StatCard value={checkedOut} label="Checked out"       chip="Out"    chipColor="blue"    icon="logout"     />
              <StatCard value={absent}     label="Not yet checked in" chip="Absent" chipColor="red"    icon="person_off" />
              <StatCard value={`${rate}%`} label="Attendance rate"   chip="Rate"   chipColor="outline" icon="bar_chart"  />
            </div>
            <Card style={{ background: 'var(--surface-container-low)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Attendance rate</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: barColor }}>{rate}%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--surface-container-high)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${rate}%`, background: barColor, borderRadius: '4px', transition: 'width 0.5s ease' }} />
              </div>
            </Card>
          </div>
        </div>

        {/* Attendance list */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 700 }}>{cls} · {subject} — Today</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="secondary" size="sm" onClick={markAll}>Mark All In</Button>
              <Button variant="secondary" size="sm" icon="download" onClick={exportCSV}>CSV</Button>
            </div>
          </div>

          {classStudents.map((s, i) => {
            const rec = getRecord(s);
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', background: i % 2 === 1 ? 'var(--surface-container-low)' : 'transparent', marginBottom: '4px', minHeight: '44px' }}>
                <span style={{ fontSize: '11px', color: 'var(--outline)', width: '20px', flexShrink: 0 }}>{i + 1}</span>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: s.fp ? 'var(--surface-container-high)' : 'var(--error-container)', color: s.fp ? 'var(--on-surface-variant)' : 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>{getInitials(s.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--outline)' }}>{s.admno} · {s.fp ? <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>Enrolled</span> : <span style={{ color: 'var(--error)' }}>No fingerprint</span>}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                  {!rec.in  && <Badge color="red">Absent</Badge>}
                  {rec.in && !rec.out && <Badge color="green">In — {rec.in}</Badge>}
                  {rec.out && <Badge color="blue">Out — {rec.out}</Badge>}
                  {!rec.in  && <Button variant="success" size="sm" onClick={() => mark(s, 'in')}  icon="login"  style={{ minHeight: '32px' }}>In</Button>}
                  {rec.in && !rec.out && <Button variant="secondary" size="sm" onClick={() => mark(s, 'out')} icon="logout" style={{ minHeight: '32px' }}>Out</Button>}
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
