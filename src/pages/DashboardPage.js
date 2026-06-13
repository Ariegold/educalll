/**
 * DashboardPage — Home screen for admin and teacher.
 * Shows key stats, today's sessions, per-class attendance bars,
 * recent scans, and SEN student alerts.
 */
import React from 'react';
import { useApp }       from '../context/AppContext';
import { TopBar }       from '../components/layout/TopBar';
import { Card }         from '../components/ui/Card';
import { StatCard }     from '../components/ui/StatCard';
import { Badge }        from '../components/ui/Badge';
import { Button }       from '../components/ui/Button';
import { Icon }         from '../components/ui/Icon';
import { CLASSES }      from '../data/seedData';
import { todayDisplay, todayISO, attendanceRate } from '../utils/helpers';

/* ── PROGRESS BAR ────────────────────────────────────────────── */
function ProgressBar({ value, max = 100, color }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const barColor = pct >= 85 ? 'var(--secondary)' : pct >= 70 ? '#f59e0b' : 'var(--tertiary)';
  return (
    <div style={{ height: '4px', background: 'var(--surface-container-high)', borderRadius: '2px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color || barColor, borderRadius: '2px', transition: 'width 0.5s ease' }} />
    </div>
  );
}

/* ── RECENT SCAN ROW ─────────────────────────────────────────── */
function ScanRow({ scan }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', background: 'var(--surface-container-low)', marginBottom: '4px' }}>
      <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
        {scan.initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 600 }}>{scan.name}</div>
        <div style={{ fontSize: '11px', color: 'var(--outline)' }}>{scan.class} · {scan.subject}</div>
      </div>
      <Badge color={scan.type === 'in' ? 'green' : 'blue'}>{scan.type === 'in' ? 'Checked In' : 'Checked Out'}</Badge>
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', whiteSpace: 'nowrap' }}>{scan.time}</span>
    </div>
  );
}

/* ── DASHBOARD ───────────────────────────────────────────────── */
export function DashboardPage({ showToast, onOpenKiosk }) {
  const { students, teachers, timetable, scans, alerts, recentScans } = useApp();
  const today     = todayISO();
  const todayDay  = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySessions = timetable.filter(t => t.day === todayDay).slice(0, 5);
  const senStudents   = students.filter(s => s.sen);
  const pendingAlerts = alerts.filter(a => a.status === 'pending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar title="Dashboard" subtitle={todayDisplay()} />

      <div style={{ padding: '24px 32px 40px', animation: 'slideUp 0.3s ease-out' }}>

        {/* ── STAT CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
          <StatCard value={students.length}                          label="Total students (SS1–SS3)"        chip="Students"    chipColor="blue"   icon="groups"       />
          <StatCard value={students.filter(s => s.fp).length}       label="Fingerprints enrolled"            chip="Biometric"   chipColor="green"  icon="fingerprint"  />
          <StatCard value={senStudents.length}                       label="SEN students monitored"           chip="SEN"         chipColor="amber"  icon="accessibility"/>
          <StatCard value={pendingAlerts}                            label="Pending parent alerts"            chip="Alerts"      chipColor="red"    icon="notifications"/>
        </div>

        {/* ── TODAY + CLASS RATES ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>

          {/* Today's sessions */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 700 }}>Today's Subject Sessions</div>
              <Button variant="ghost" size="sm" onClick={onOpenKiosk} icon="fingerprint">Open Kiosk</Button>
            </div>
            {todaySessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--outline)', fontSize: '13px' }}>
                <Icon name="calendar_today" size={40} style={{ opacity: 0.3, display: 'block', margin: '0 auto 8px' }} />
                No sessions today
              </div>
            ) : todaySessions.map(s => {
              const rate = attendanceRate(students, scans, today, s.class, s.subject);
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', background: 'var(--surface-container-low)', marginBottom: '4px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="menu_book" size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{s.subject}</div>
                    <div style={{ fontSize: '11px', color: 'var(--outline)' }}>{s.class} · {s.period} · {s.time}</div>
                  </div>
                  <div style={{ width: '80px' }}>
                    <ProgressBar value={rate} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: rate >= 80 ? 'var(--secondary)' : 'var(--tertiary)', minWidth: '32px', textAlign: 'right' }}>
                    {rate}%
                  </span>
                </div>
              );
            })}
          </Card>

          {/* Class attendance bars */}
          <Card>
            <div style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Attendance by Class</div>
            {CLASSES.map(cls => {
              // In demo mode, show simulated rates. In production: use real scans.
              const rate = 70 + Math.floor(Math.abs(Math.sin(cls.charCodeAt(0) * 7)) * 28);
              return (
                <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', width: '40px', flexShrink: 0 }}>{cls}</div>
                  <div style={{ flex: 1 }}><ProgressBar value={rate} /></div>
                  <div style={{ fontSize: '12px', fontWeight: 700, width: '36px', textAlign: 'right' }}>{rate}%</div>
                </div>
              );
            })}
          </Card>
        </div>

        {/* ── RECENT SCANS ── */}
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 700 }}>Recent Biometric Scans</div>
            <Button variant="secondary" size="sm" onClick={onOpenKiosk} icon="fingerprint">Open Kiosk</Button>
          </div>
          {recentScans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--outline)' }}>
              <Icon name="fingerprint" size={40} style={{ opacity: 0.3, display: 'block', margin: '0 auto 8px' }} />
              <div style={{ fontSize: '13px' }}>No scans today. Open the kiosk to begin.</div>
            </div>
          ) : recentScans.slice(0, 8).map((s, i) => <ScanRow key={i} scan={s} />)}
        </Card>

        {/* ── SEN PANEL ── (shown only when SEN students exist) */}
        {senStudents.length > 0 && (
          <Card style={{ borderLeft: '4px solid #7C3AED' }}>
            <div style={{ fontFamily: 'var(--font-headline)', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Icon name="accessibility" size={18} style={{ color: '#7C3AED' }} />
              SEN / Inclusive Education — {senStudents.length} student{senStudents.length > 1 ? 's' : ''}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '10px' }}>
              {senStudents.map(s => {
                const todayAlert = alerts.find(a => a.student === s.name && a.date === today);
                return (
                  <div key={s.id} style={{ padding: '12px 14px', borderRadius: '10px', border: `1px solid ${todayAlert ? '#FCA5A5' : '#DDD6FE'}`, background: todayAlert ? '#FFF5F5' : 'white' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>{s.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--outline)', marginBottom: '6px' }}>{s.class} · {s.senType}</div>
                    {todayAlert
                      ? <Badge color="red" icon={todayAlert.type === 'equipment' ? 'backpack' : 'person_off'}>Alert today</Badge>
                      : <Badge color="green" icon="check">No alerts today</Badge>
                    }
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
