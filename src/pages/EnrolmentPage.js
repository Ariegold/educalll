/**
 * EnrolmentPage — Biometric fingerprint enrolment management.
 * Shows pending vs enrolled students. Simulates 3-scan enrolment flow.
 * In production: connect SecuGen SDK here (Taiwo's Phase 0 requirement).
 */
import React, { useState, useRef } from 'react';
import { useApp }  from '../context/AppContext';
import { TopBar }  from '../components/layout/TopBar';
import { Card }    from '../components/ui/Card';
import { Button }  from '../components/ui/Button';
import { Badge }   from '../components/ui/Badge';
import { Modal }   from '../components/ui/Modal';
import { Icon }    from '../components/ui/Icon';
import { CLASSES } from '../data/seedData';
import { getInitials } from '../utils/helpers';

export function EnrolmentPage({ showToast }) {
  const { students, enrolStudent } = useApp();
  const [classFilter, setClassFilter] = useState('');
  const [enrolModal,  setEnrolModal]  = useState(null); // null | student
  const [scanCount,   setScanCount]   = useState(0);
  const [scanning,    setScanning]    = useState(false);
  const scanningRef = useRef(false);

  const notEnrolled = students.filter(s => !s.fp && (!classFilter || s.class === classFilter));
  const enrolled    = students.filter(s =>  s.fp && (!classFilter || s.class === classFilter));

  function openEnrol(student) {
    setEnrolModal(student);
    setScanCount(0);
  }

  async function runScan() {
    if (scanningRef.current || scanCount >= 3) return;
    scanningRef.current = true;
    setScanning(true);
    await new Promise(r => setTimeout(r, 1400));
    const newCount = scanCount + 1;
    setScanCount(newCount);
    setScanning(false);
    scanningRef.current = false;
    if (newCount === 3) {
      // Mark student as enrolled
      enrolStudent(enrolModal.id);
      showToast(`Fingerprint enrolled: ${enrolModal.name}`);
      setTimeout(() => setEnrolModal(null), 800);
    }
  }

  const StudentList = ({ list, empty, isEnrolled }) => (
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {list.length === 0
        ? <div style={{ padding: '24px', textAlign: 'center', color: 'var(--outline)', fontSize: '13px' }}>{empty}</div>
        : list.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: '1px solid var(--surface-container-low)' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: isEnrolled ? 'var(--surface-container-high)' : 'var(--error-container)', color: isEnrolled ? 'var(--on-surface-variant)' : 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>{getInitials(s.name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{s.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--outline)' }}>{s.admno} · {s.class}</div>
            </div>
            {isEnrolled
              ? <Badge color="green" icon="check">Enrolled</Badge>
              : <Button variant="primary" size="sm" icon="fingerprint" onClick={() => openEnrol(s)} style={{ fontSize: '11px' }}>Enrol</Button>
            }
          </div>
        ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar title="Biometric Enrolment" subtitle={`${enrolled.length} enrolled · ${notEnrolled.length} pending`}
        actions={
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'var(--surface-container-low)', fontSize: '12px', minHeight: '44px', cursor: 'pointer' }}>
            <option value="">All Classes</option>
            {CLASSES.map(c => <option key={c}>{c}</option>)}
          </select>
        }
      />
      <div style={{ padding: '24px 32px 40px' }}>
        {notEnrolled.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'var(--error-container)', borderRadius: '10px', marginBottom: '16px' }}>
            <Icon name="warning" size={20} style={{ color: 'var(--error)', flexShrink: 0 }} />
            <div style={{ fontSize: '13px', color: '#690005', fontWeight: 600 }}>{notEnrolled.length} student{notEnrolled.length > 1 ? 's' : ''} cannot use the biometric kiosk until enrolled</div>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', background: 'var(--error-container)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="fingerprint_off" size={15} style={{ color: 'var(--error)' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#690005' }}>Pending ({notEnrolled.length})</span>
            </div>
            <StudentList list={notEnrolled} empty="All students enrolled" isEnrolled={false} />
          </Card>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', background: 'var(--secondary-container)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="fingerprint" size={15} style={{ color: 'var(--secondary)' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--on-secondary-container)' }}>Enrolled ({enrolled.length})</span>
            </div>
            <StudentList list={enrolled} empty="No students enrolled yet" isEnrolled={true} />
          </Card>
        </div>

        {/* How-to guide */}
        <Card style={{ background: 'var(--surface-container-low)' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="info" size={16} />How to Enrol Students
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
            {[['1','Connect Device','Plug SecuGen Hamster Pro 20 USB scanner into admin laptop'],['2','Select Student','Click "Enrol" next to the student\'s name'],['3','Scan 3 Times','Ask the student to place their finger on the scanner 3 times'],['4','Confirm','Green tick confirms — student is now active on all kiosks']].map(([n,t,d]) => (
              <div key={n} style={{ textAlign: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>{n}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '3px' }}>{t}</div>
                <div style={{ fontSize: '11px', color: 'var(--outline)', lineHeight: 1.4 }}>{d}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Enrolment modal */}
      <Modal isOpen={enrolModal !== null} onClose={() => setEnrolModal(null)} title="Biometric Enrolment" subtitle={enrolModal ? `Enrolling: ${enrolModal.name} — ${enrolModal.class}` : ''}>
        <div style={{ textAlign: 'center' }}>
          {/* Scan progress dots */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', background: i < scanCount ? 'var(--secondary)' : 'var(--surface-container-high)', border: `2px solid ${i < scanCount ? 'var(--secondary)' : 'var(--outline)'}`, transition: 'all 0.3s' }} />
            ))}
          </div>
          {/* Fingerprint icon */}
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--surface-container-low)', border: `3px solid ${scanCount === 3 ? 'var(--secondary)' : scanning ? 'var(--primary)' : 'var(--outline)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', transition: 'border-color 0.3s' }}>
            <Icon name="fingerprint" size={56} style={{ color: scanCount === 3 ? 'var(--secondary)' : scanning ? 'var(--primary)' : 'var(--outline)' }} />
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
            {scanCount === 3 ? 'Enrolment Complete ✓' : scanning ? 'Scanning…' : scanCount === 0 ? 'Ready to scan' : `Scan ${scanCount} of 3 — good!`}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--outline)', marginBottom: '20px' }}>
            {scanCount === 3 ? 'Fingerprint registered successfully' : `${3 - scanCount} more scan${3 - scanCount !== 1 ? 's' : ''} needed`}
          </div>
          <Button variant="primary" fullWidth icon="fingerprint" onClick={runScan} loading={scanning} disabled={scanCount >= 3}>
            {scanCount === 0 ? 'Start Fingerprint Scan' : scanCount < 3 ? 'Scan Again' : 'Done'}
          </Button>
          <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--outline)' }}>
            Production: connect SecuGen Hamster Pro 20 via USB (Phase 0 validation first)
          </div>
        </div>
      </Modal>
    </div>
  );
}
