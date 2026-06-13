/**
 * KioskPage — Full-screen biometric check-in/out terminal.
 * Designed for a tablet mounted at the classroom door.
 *
 * iOS spacing applied:
 *   - paddingTop: 44px (status bar reservation — Image 1)
 *   - Back button: 44×44px tap target (Image 2)
 *   - kiosk-sub margin: 40px below (card-above-gap — Image 4)
 *   - Fingerprint outer: 180px (Image 4: 64px image scaled for scan UI)
 *
 * Taiwo notes:
 *   - In production, replace simulateScan() with SecuGen SDK callback.
 *   - The scan result fires the n8n webhook via AppContext.recordScan().
 *   - Offline queue: if no internet, scans save to SQLite and sync when online.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp }  from '../context/AppContext';
import { Button }  from '../components/ui/Button';
import { Icon }    from '../components/ui/Icon';
import { Badge }   from '../components/ui/Badge';
import { SUBJECTS, CLASSES } from '../data/seedData';

/* ── CLOCK HOOK ──────────────────────────────────────────────── */
function useClock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  useEffect(() => {
    function tick() {
      setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
      setDate(new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return { time, date };
}

/* ── CONNECTIVITY HOOK ───────────────────────────────────────── */
function useConnectivity() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return online;
}

/* ── FINGERPRINT RING ────────────────────────────────────────── */
function FingerprintRing({ status, onClick }) {
  // status: 'idle' | 'scanning' | 'success' | 'error'
  const colors = { idle: 'rgba(255,255,255,0.7)', scanning: 'white', success: '#a0f399', error: '#ffa098' };
  const bgColors = { idle: 'rgba(255,255,255,0.08)', scanning: 'rgba(255,255,255,0.12)', success: 'rgba(160,243,153,0.2)', error: 'rgba(255,160,152,0.2)' };

  return (
    <div
      onClick={onClick}
      style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 32px', cursor: 'pointer' }}
      role="button"
      aria-label="Tap to scan fingerprint"
    >
      <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: bgColors[status], display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
        <span className="material-symbols-outlined" style={{
          fontSize: '80px',
          color: colors[status],
          fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 48",
          transition: 'color 0.3s',
        }}>fingerprint</span>
      </div>
      {/* Spinner ring when scanning */}
      {status === 'scanning' && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.15)', borderTopColor: 'rgba(255,255,255,0.8)', animation: 'spin 1s linear infinite' }} />
      )}
    </div>
  );
}

/* ── RECENT SCAN ITEM ────────────────────────────────────────── */
function RecentItem({ scan }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', marginBottom: '4px' }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>
        {scan.initials}
      </div>
      <div style={{ flex: 1, fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{scan.name}</div>
      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: scan.type === 'in' ? 'rgba(160,243,153,0.2)' : 'rgba(163,201,255,0.2)', color: scan.type === 'in' ? '#a0f399' : '#a3c9ff' }}>
        {scan.type === 'in' ? 'IN' : 'OUT'}
      </span>
      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{scan.time}</span>
    </div>
  );
}

/* ── KIOSK PAGE ──────────────────────────────────────────────── */
export function KioskPage({ onBack, showToast }) {
  const { students, recentScans, recordScan } = useApp();
  const { time, date } = useClock();
  const isOnline = useConnectivity();

  const [mode,       setMode]       = useState('in');     // 'in' | 'out'
  const [scanStatus, setScanStatus] = useState('idle');   // 'idle' | 'scanning' | 'success' | 'error'
  const [lastScan,   setLastScan]   = useState(null);
  const [cls,        setCls]        = useState('SS2A');
  const [subject,    setSubject]    = useState('Mathematics');
  const scanningRef = useRef(false);

  /**
   * simulateScan — mimics a physical fingerprint scanner response.
   * In production (Taiwo): replace this with the SecuGen SDK callback.
   * The SDK fires an event when a finger is placed; map that to this function.
   */
  const simulateScan = useCallback(async () => {
    if (scanningRef.current) return; // prevent double-tap
    scanningRef.current = true;
    setScanStatus('scanning');
    setLastScan(null);

    // Simulate scanner processing time (1.8s)
    await new Promise(r => setTimeout(r, 1800));

    const success = Math.random() > 0.1; // 90% success rate in demo

    if (success) {
      // Pick a random student from this class
      const classStudents = students.filter(s => s.class === cls);
      const student = classStudents[Math.floor(Math.random() * classStudents.length)] || students[0];

      setScanStatus('success');
      const result = await recordScan(student, mode, cls, subject);
      setLastScan({ student, type: mode, time: result.time });
      showToast(`${mode === 'in' ? '✓ Checked in' : '✓ Checked out'}: ${student.name}`);
    } else {
      setScanStatus('error');
      showToast('Fingerprint not recognised — try again', 'error');
    }

    // Reset to idle after 2.5s
    setTimeout(() => { setScanStatus('idle'); scanningRef.current = false; }, 2500);
  }, [students, cls, subject, mode, recordScan, showToast]);

  return (
    <div style={{
      background:    'var(--grad-primary)',
      minHeight:     '100vh',
      display:       'flex',
      flexDirection: 'column',
    }}>
      {/* ── HEADER — 44px status bar clearance (Image 1) ── */}
      <div style={{
        paddingTop:   '44px',  // iOS status bar reservation
        paddingLeft:  '32px',
        paddingRight: '32px',
        paddingBottom:'16px',
        display:      'flex',
        alignItems:   'center',
        justifyContent:'space-between',
        minHeight:    '108px', // Full nav bar height (Image 2)
      }}>
        <div style={{ fontFamily: 'var(--font-headline)', fontSize: '22px', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }}>
          EduCall
        </div>

        {/* Current period badge */}
        <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Icon name="schedule" size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
          {subject} · {cls}
        </div>

        {/* Online/offline indicator — Taiwo: ties to offline SQLite queue */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div style={{ fontFamily: 'var(--font-headline)', fontSize: '32px', fontWeight: 800, color: 'white', letterSpacing: '-0.04em', lineHeight: 1 }}>{time}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{date}</div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, background: isOnline ? 'rgba(160,243,153,0.2)' : 'rgba(255,193,0,0.2)', color: isOnline ? '#a0f399' : '#FFC000' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              {isOnline ? 'Online' : 'Offline — scans queued'}
            </span>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>

          {/* Class/Subject selectors (compact, inline for kiosk) */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
            <select value={cls} onChange={e => setCls(e.target.value)} style={{ padding: '6px 12px', borderRadius: '20px', border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              {CLASSES.map(c => <option key={c} value={c} style={{ color: '#000' }}>{c}</option>)}
            </select>
            <select value={subject} onChange={e => setSubject(e.target.value)} style={{ padding: '6px 12px', borderRadius: '20px', border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              {SUBJECTS.map(s => <option key={s} value={s} style={{ color: '#000' }}>{s}</option>)}
            </select>
          </div>

          {/* Check in / Check out toggle */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
            {['in', 'out'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                background: mode === m ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                color:      mode === m ? 'white' : 'rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', gap: '6px', minHeight: 'var(--tap)',
              }}>
                <Icon name={m === 'in' ? 'login' : 'logout'} size={16} style={{ color: 'currentColor' }} />
                Check {m === 'in' ? 'In' : 'Out'}
              </button>
            ))}
          </div>

          {/* Main kiosk card */}
          <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '48px 40px', textAlign: 'center' }}>
            {/* Title — 24px (Image 3) */}
            <div style={{ fontFamily: 'var(--font-headline)', fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
              {mode === 'in' ? 'Place Finger to Check In' : 'Place Finger to Check Out'}
            </div>
            {/* Subtitle — 40px gap below (Image 4) */}
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '40px' }}>
              Touch the fingerprint sensor below
            </div>

            {/* Fingerprint scanner UI */}
            <FingerprintRing status={scanStatus} onClick={simulateScan} />

            {/* Status text */}
            <div style={{ fontFamily: 'var(--font-headline)', fontSize: '18px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '6px' }}>
              {scanStatus === 'idle'     && 'Ready to scan'}
              {scanStatus === 'scanning' && 'Scanning fingerprint…'}
              {scanStatus === 'success'  && (lastScan ? `✓ Welcome, ${lastScan.student.name.split(' ')[0]}!` : '✓ Scanned')}
              {scanStatus === 'error'    && 'Fingerprint not recognised'}
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
              {scanStatus === 'idle'     && 'Tap the fingerprint icon to simulate a scan'}
              {scanStatus === 'scanning' && 'Please hold still'}
              {scanStatus === 'success'  && 'Check-in recorded'}
              {scanStatus === 'error'    && 'Please try again or see your teacher'}
            </div>

            {/* Result card — shown after successful scan */}
            {lastScan && scanStatus === 'success' && (
              <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px', animation: 'slideUp 0.3s ease-out' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--grad-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 800, flexShrink: 0 }}>
                  {lastScan.student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'var(--font-headline)' }}>{lastScan.student.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--outline)', marginTop: '2px' }}>{lastScan.student.class} · {subject}</div>
                </div>
                <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-headline)', color: 'var(--primary)', letterSpacing: '-0.02em' }}>{lastScan.time}</div>
                  <div style={{ fontSize: '10px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{lastScan.type === 'in' ? 'Checked In' : 'Checked Out'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Recent scans */}
          {recentScans.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Recent Scans</div>
              {recentScans.slice(0, 5).map((s, i) => <RecentItem key={i} scan={s} />)}
            </div>
          )}
        </div>
      </div>

      {/* ── BACK BUTTON — 106px clearance (Image 5) ── */}
      <div style={{ padding: '16px 32px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
        <Button
          variant="ghost"
          size="sm"
          icon="arrow_back"
          onClick={onBack}
          style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)', minHeight: '44px' }}
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
