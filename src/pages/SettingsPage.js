/**
 * SettingsPage — n8n webhook config, device settings, alert rules.
 * Taiwo: all webhook URLs are saved here and used by AppContext.recordScan().
 */
import React, { useState } from 'react';
import { useApp }  from '../context/AppContext';
import { TopBar }  from '../components/layout/TopBar';
import { Card }    from '../components/ui/Card';
import { Button }  from '../components/ui/Button';
import { Badge }   from '../components/ui/Badge';
import { Icon }    from '../components/ui/Icon';

export function SettingsPage({ showToast }) {
  const { webhooks, saveWebhooks } = useApp();
  const [form, setForm] = useState({ ...webhooks });

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  function handleSave() {
    saveWebhooks(form);
    // Persist to localStorage so settings survive refresh
    try { localStorage.setItem('educall_webhooks_demo', JSON.stringify(form)); } catch {}
    showToast('Webhook settings saved');
  }

  async function testWebhook() {
    const url = form.scan;
    if (!url) { showToast('Enter a scan webhook URL first', 'error'); return; }
    showToast('Sending test to n8n…');
    try {
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'test', message: 'EduCall webhook test', timestamp: new Date().toISOString() }) });
      showToast('Test sent — check your n8n workflow');
    } catch { showToast('Could not reach webhook URL', 'error'); }
  }

  const inputStyle = { width: '100%', padding: '10px 14px', border: 'none', borderRadius: '8px', outline: 'none', fontFamily: 'monospace', fontSize: '12px', boxShadow: '0 0 0 1.5px var(--outline-variant)', minHeight: '44px', background: 'var(--surface-container-lowest)', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' };
  const sectionLabel = { fontSize: '11px', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 8px', paddingTop: '8px', borderTop: '1px solid var(--surface-container-high)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar title="Settings" subtitle="School & system configuration" />

      <div style={{ padding: '24px 32px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* LEFT COLUMN */}
        <div>
          {/* School details */}
          <Card style={{ marginBottom: '20px' }}>
            <div style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>School Details</div>
            {[['School Name', 'Sunshine Secondary School, Lagos'], ['Academic Year', '2025/2026'], ['Timezone', 'Africa/Lagos (WAT UTC+1)']].map(([l, v]) => (
              <div key={l} style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>{l}</label>
                <input defaultValue={v} style={{ ...inputStyle, fontFamily: 'var(--font-body)', fontSize: '14px' }} />
              </div>
            ))}
            <Button variant="primary" size="sm" onClick={() => showToast('School details saved')} icon="save">Save Details</Button>
          </Card>

          {/* Biometric device — Taiwo: SecuGen Hamster Pro 20 */}
          <Card style={{ marginBottom: '20px' }}>
            <div style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Biometric Device</div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '14px', background: 'var(--surface-container-low)', borderRadius: '10px', marginBottom: '16px' }}>
              <Icon name="fingerprint" size={32} style={{ color: 'var(--outline)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Fingerprint Scanner</div>
                {/* Taiwo recommendation: SecuGen Hamster Pro 20 over Mantra MFS100 */}
                <div style={{ fontSize: '12px', color: 'var(--outline)' }}>SecuGen Hamster Pro 20 (recommended)</div>
              </div>
              <Badge color="red" style={{ marginLeft: 'auto' }}>Not connected</Badge>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--outline)', marginBottom: '12px' }}>
              Connect SecuGen SDK (Phase 0 hardware validation required before production build).
            </div>
            {/* Taiwo: renamed from "Scan for Devices" */}
            <Button variant="secondary" size="sm" icon="hardware" onClick={() => showToast('Starting Phase 0 hardware validation…')}>
              Run Phase 0 Hardware Validation
            </Button>
          </Card>

          {/* Phase 0 checklist — Taiwo's requirement */}
          <Card style={{ borderLeft: '4px solid #FFC000' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="hardware" size={16} style={{ color: '#FFC000' }} />
              Phase 0 — Hardware Validation
            </div>
            <div style={{ fontSize: '12px', color: 'var(--outline)', marginBottom: '12px' }}>Taiwo requires these hardware tests before any backend build begins.</div>
            {['SecuGen Hamster Pro 20 — fingerprint scan test', 'USB driver installation on Windows 11 kiosk', 'SDK API response time (<500ms target)', 'Offline queue — scan → SQLite → sync test'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'var(--surface-container-low)', borderRadius: '8px', marginBottom: '6px', fontSize: '11px', fontWeight: 600 }}>
                <Icon name="check_box_outline_blank" size={14} style={{ color: 'var(--outline)' }} />
                {item}
              </div>
            ))}
          </Card>
        </div>

        {/* RIGHT COLUMN — n8n Webhooks */}
        <div>
          <Card>
            <div style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>n8n Webhook Configuration</div>
            <div style={{ fontSize: '12px', color: 'var(--outline)', marginBottom: '16px' }}>Paste your n8n webhook URLs to activate parent alerts and database sync</div>

            {/* Taiwo tech stack reference */}
            <div style={{ background: 'var(--surface-container-low)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Taiwo's Architecture</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {[['Backend', 'NestJS'], ['Scanner', 'SecuGen Pro 20'], ['WhatsApp', 'Meta Cloud API'], ['Kiosk App', 'Tauri v2'], ['Offline', 'SQLite queue'], ['Database', 'Neon PostgreSQL']].map(([k, v]) => (
                  <div key={k} style={{ fontSize: '11px', padding: '5px 8px', background: 'var(--surface-container)', borderRadius: '6px' }}>
                    <span style={{ fontWeight: 700 }}>{k}:</span> <span style={{ color: 'var(--outline)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={sectionLabel}>Alert Webhooks</div>
            {[
              ['scan',   'Scan Webhook',     'https://your.n8n.cloud/webhook/educall-scan',    'Fires on every fingerprint check-in/out'],
              ['absent', 'Absence Webhook',  'https://your.n8n.cloud/webhook/educall-absent',  'Fires when student misses a period'],
              ['early',  'Early Exit',       'https://your.n8n.cloud/webhook/educall-early',   'Fires on early checkout'],
            ].map(([key, label, ph, hint]) => (
              <div key={key} style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>{label}</label>
                <input value={form[key] || ''} onChange={set(key)} placeholder={ph} style={inputStyle} />
                <div style={{ fontSize: '11px', color: 'var(--outline)', marginTop: '4px' }}>{hint}</div>
              </div>
            ))}

            <div style={sectionLabel}>Database Webhooks (n8n → Neon)</div>
            {[
              ['dbLoad',           'Load Data',           'https://your.n8n.cloud/webhook/educall-db-load',       'Loads all school data on login'],
              ['dbSaveStudent',    'Save Student',        'https://your.n8n.cloud/webhook/educall-db-student',    'Saves new/updated student to Neon'],
              ['dbSaveAttendance', 'Save Attendance',     'https://your.n8n.cloud/webhook/educall-db-attendance', 'Saves each scan record to Neon'],
              ['dbGetReports',     'Reports Webhook',     'https://your.n8n.cloud/webhook/educall-db-reports',    'Fetches historical data for Reports'],
            ].map(([key, label, ph, hint]) => (
              <div key={key} style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>{label}</label>
                <input value={form[key] || ''} onChange={set(key)} placeholder={ph} style={inputStyle} />
                <div style={{ fontSize: '11px', color: 'var(--outline)', marginTop: '4px' }}>{hint}</div>
              </div>
            ))}

            {/* Payload example */}
            <div style={{ background: 'var(--surface-container-low)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '8px' }}>n8n receives this on each scan:</div>
              <pre style={{ fontSize: '10px', color: 'var(--on-surface-variant)', lineHeight: 1.7, overflow: 'auto' }}>{`{
  "event": "student_checked_in",
  "student_name": "Adaeze Okonkwo",
  "admno": "SCH/24/001",
  "class": "SS2A",
  "subject": "Mathematics",
  "period": "Period 3",
  "timestamp": "2026-06-12T09:34:12",
  "type": "check_in",
  "parent_phone": "+234 803 111 2222"
}`}</pre>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="secondary" size="sm" onClick={testWebhook} style={{ flex: 1 }}>Test Connection</Button>
              <Button variant="primary"   size="sm" onClick={handleSave} icon="save" style={{ flex: 1 }}>Save Webhooks</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
