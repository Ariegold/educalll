/**
 * TimetablePage — Subject timetable for all classes.
 */
import React, { useState } from 'react';
import { useApp }  from '../context/AppContext';
import { TopBar }  from '../components/layout/TopBar';
import { Card }    from '../components/ui/Card';
import { Button }  from '../components/ui/Button';
import { Badge }   from '../components/ui/Badge';
import { Modal }   from '../components/ui/Modal';
import { CLASSES, SUBJECTS, PERIODS } from '../data/seedData';

export function TimetablePage({ showToast }) {
  const { timetable, addPeriod, deletePeriod } = useApp();
  const [classFilter, setClassFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ subject: 'Mathematics', class: 'SS2A', day: 'Monday', period: 'Period 1', time: '8:40–9:40', teacher: 'Mr Adeyemi' });

  const filtered = classFilter ? timetable.filter(t => t.class === classFilter) : timetable;
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  function handleAdd() {
    addPeriod(form);
    showToast('Period added to timetable');
    setModal(false);
  }

  const inputStyle = { width: '100%', padding: '10px 14px', border: 'none', borderRadius: '8px', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '14px', boxShadow: '0 0 0 1.5px var(--outline-variant)', minHeight: '44px', background: 'var(--surface-container-lowest)', boxSizing: 'border-box', cursor: 'pointer' };
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar title="Subject Timetable" subtitle="SS1–SS3 weekly schedule"
        actions={<Button variant="primary" size="sm" icon="add" onClick={() => setModal(true)}>Add Period</Button>} />
      <div style={{ padding: '24px 32px 40px' }}>
        {/* Class filter chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button onClick={() => setClassFilter('')} style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: !classFilter ? 'var(--primary)' : 'var(--surface-container-low)', color: !classFilter ? 'white' : 'var(--on-surface-variant)', minHeight: '36px' }}>All</button>
          {CLASSES.map(c => (
            <button key={c} onClick={() => setClassFilter(c)} style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: classFilter === c ? 'var(--primary)' : 'var(--surface-container-low)', color: classFilter === c ? 'white' : 'var(--on-surface-variant)', minHeight: '36px' }}>{c}</button>
          ))}
        </div>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--surface-container-low)' }}>{['Subject', 'Class', 'Day', 'Period', 'Time', 'Teacher', 'Actions'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--outline)', fontSize: '13px' }}>No periods configured</td></tr>}
                {filtered.map((t, i) => (
                  <tr key={t.id} style={{ background: i % 2 === 1 ? 'var(--surface-container-low)' : 'transparent' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '13px' }}>{t.subject}</td>
                    <td style={{ padding: '12px 14px' }}><Badge color="blue">{t.class}</Badge></td>
                    <td style={{ padding: '12px 14px', fontSize: '13px' }}>{t.day}</td>
                    <td style={{ padding: '12px 14px', fontSize: '13px' }}>{t.period}</td>
                    <td style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--outline)', fontFamily: 'monospace' }}>{t.time}</td>
                    <td style={{ padding: '12px 14px', fontSize: '13px' }}>{t.teacher}</td>
                    <td style={{ padding: '12px 14px' }}><Button variant="danger" size="sm" icon="delete" onClick={() => { deletePeriod(t.id); showToast('Period removed'); }} style={{ minWidth: '36px', minHeight: '36px', padding: '0 8px' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Subject Period" subtitle="Configure a subject period for a class"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button variant="primary" onClick={handleAdd} icon="add">Add Period</Button></>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {[['Subject', 'subject', SUBJECTS], ['Class', 'class', CLASSES], ['Day', 'day', ['Monday','Tuesday','Wednesday','Thursday','Friday']], ['Period', 'period', PERIODS.map(p => p.label)], ['Teacher', 'teacher', ['Mr Adeyemi','Mrs Okonkwo','Mr Nwosu','Mrs Aliyu','Mr Bakare']]].map(([label, key, opts], idx) => (
            <div key={key} style={idx === 4 ? { gridColumn: '1/-1' } : {}}>
              <label style={{ ...{display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px'} }}>{label}</label>
              <select style={inputStyle} value={form[key]} onChange={set(key)}>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
