/**
 * AlertsPage — Parent alerts log with WhatsApp message previews.
 */
import React, { useState } from 'react';
import { useApp }  from '../context/AppContext';
import { TopBar }  from '../components/layout/TopBar';
import { Card }    from '../components/ui/Card';
import { Badge }   from '../components/ui/Badge';
import { Button }  from '../components/ui/Button';
import { Icon }    from '../components/ui/Icon';
import { StatCard } from '../components/ui/StatCard';

const TYPE_BADGE = {
  absent:    <Badge color="red"    icon="person_off">Absent</Badge>,
  late:      <Badge color="amber"  icon="schedule">Late</Badge>,
  equipment: <Badge color="purple" icon="backpack">Equipment</Badge>,
  early:     <Badge color="amber"  icon="logout">Early exit</Badge>,
};

export function AlertsPage({ showToast }) {
  const { alerts, retryPending } = useApp();
  const [filter, setFilter] = useState('');

  const filtered = filter ? alerts.filter(a => a.type === filter) : alerts;
  const sent    = alerts.filter(a => a.status === 'sent').length;
  const pending = alerts.filter(a => a.status === 'pending').length;
  const equip   = alerts.filter(a => a.type === 'equipment').length;
  const late    = alerts.filter(a => a.type === 'late').length;

  function handleRetry() { retryPending(); showToast('Pending alerts retried via n8n'); }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar title="Parent Alerts" subtitle="Automated via n8n — WhatsApp messages" />

      <div style={{ padding: '24px 32px 40px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
          <StatCard value={sent}    label="Sent alerts"     chip="Sent"      chipColor="green"  icon="check_circle"  />
          <StatCard value={pending} label="Pending alerts"  chip="Pending"   chipColor="amber"  icon="schedule"      />
          <StatCard value={equip}   label="Equipment (SEN)" chip="Equipment" chipColor="purple" icon="backpack"      />
          <StatCard value={late}    label="Late arrivals"   chip="Late"      chipColor="red"    icon="schedule"      />
        </div>

        {/* WhatsApp preview examples */}
        <Card style={{ marginBottom: '20px', background: 'var(--surface-container-low)' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="chat" size={16} style={{ color: '#25D366' }} />
            What parents receive — WhatsApp message examples
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
            {[
              { color: '#C0392B', icon: 'person_off', label: 'Absence Alert', msg: 'Good afternoon Mrs Okonkwo,\n\nYour child Adaeze Okonkwo (SS2A) was not present for Mathematics — Period 3 today.\n\nIf there is a reason please contact the school on 0800-EDUCALL.\n\nEduCall – Sunshine Secondary School' },
              { color: '#B45309', icon: 'schedule',   label: 'Late Arrival',  msg: 'Good morning Mr Adeleke,\n\nOluwafemi Adeleke (SS2A) arrived for Mathematics at 09:18 AM today — 28 minutes after class began.\n\nNo action required. For your information.\n\nEduCall – Sunshine Secondary School' },
              { color: '#7C3AED', icon: 'accessibility', label: 'SEN Equipment Alert', msg: 'Dear Mr Adeyemi,\n\nBabatunde Adeyemi (SS2A) arrived for class today without required SEN equipment:\n\n• Communication board\n\nPlease arrange to bring this today if possible.\n\nEduCall – Sunshine Secondary School' },
            ].map(({ color, icon, label, msg }) => (
              <div key={label} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--surface-container-high)' }}>
                <div style={{ padding: '8px 12px', background: color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name={icon} size={14} style={{ color: 'white' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>{label}</span>
                </div>
                <div style={{ padding: '10px 12px', background: '#ECE5DD' }}>
                  <div style={{ background: 'white', borderRadius: '8px', padding: '10px 12px', fontSize: '10.5px', color: '#111', lineHeight: 1.6, whiteSpace: 'pre-line', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>{msg}</div>
                  <div style={{ textAlign: 'right', marginTop: '4px', fontSize: '9px', color: '#667781' }}>✓✓ Delivered</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alerts table */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--surface-container-high)' }}>
            <div style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 700 }}>All Parent Alerts</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'var(--surface-container-low)', fontSize: '12px', minHeight: '36px', cursor: 'pointer' }}>
                <option value="">All types</option>
                <option value="absent">Absence</option>
                <option value="late">Late</option>
                <option value="equipment">Equipment (SEN)</option>
              </select>
              <Button variant="primary" size="sm" onClick={handleRetry} icon="refresh">Retry Pending</Button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-container-low)' }}>
                  {['Student', 'Class', 'Subject', 'Type', 'Details', 'Parent', 'Date', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--outline)' }}>No alerts</td></tr>
                )}
                {filtered.map((a, i) => (
                  <tr key={a.id || i} style={{ background: i % 2 === 1 ? 'var(--surface-container-low)' : 'transparent' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '13px' }}>
                      {a.student}{a.sen && <Badge color="amber" style={{ fontSize: '9px', marginLeft: '4px' }}>SEN</Badge>}
                    </td>
                    <td style={{ padding: '12px 14px' }}><Badge color="blue">{a.class}</Badge></td>
                    <td style={{ padding: '12px 14px', fontSize: '12px' }}>{a.subject}</td>
                    <td style={{ padding: '12px 14px' }}>{TYPE_BADGE[a.type] || <Badge>{a.type}</Badge>}</td>
                    <td style={{ padding: '12px 14px', fontSize: '11px', color: 'var(--outline)' }}>
                      {a.type === 'equipment' && a.missingEquipment ? `Missing: ${a.missingEquipment.join(', ')}` : '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '12px' }}>{a.parent}</td>
                    <td style={{ padding: '12px 14px', fontSize: '11px', color: 'var(--outline)' }}>{a.date}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <Badge color={a.status === 'sent' ? 'green' : 'amber'}>{a.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
