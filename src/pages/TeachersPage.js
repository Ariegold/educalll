/**
 * TeachersPage — Teacher roster management.
 */
import React, { useState } from 'react';
import { useApp }  from '../context/AppContext';
import { TopBar }  from '../components/layout/TopBar';
import { Card }    from '../components/ui/Card';
import { Button }  from '../components/ui/Button';
import { Badge }   from '../components/ui/Badge';
import { Modal }   from '../components/ui/Modal';
import { Icon }    from '../components/ui/Icon';
import { CLASSES, SUBJECTS } from '../data/seedData';
import { getInitials } from '../utils/helpers';

function TeacherForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'teacher', access: 'yes', subjects: [], classes: [], ...initial });
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));
  const toggleArr = (key, val) => setForm(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val] }));
  const [error, setError] = useState('');

  function handleSave() {
    if (!form.name.trim()) { setError('Name is required'); return; }
    onSave(form);
  }

  const inputStyle = { width: '100%', padding: '10px 14px', border: 'none', borderRadius: '8px', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '14px', boxShadow: '0 0 0 1.5px var(--outline-variant)', minHeight: '44px', background: 'var(--surface-container-lowest)', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' };

  return (
    <div>
      {error && <div style={{ padding: '8px 12px', background: 'var(--error-container)', color: '#690005', borderRadius: '8px', fontSize: '12px', marginBottom: '12px' }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Full Name *</label><input style={inputStyle} value={form.name} onChange={set('name')} placeholder="e.g. Mr Adeyemi" /></div>
        <div><label style={labelStyle}>Email</label><input style={inputStyle} type="email" value={form.email} onChange={set('email')} placeholder="teacher@school.ng" /></div>
        <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={form.phone} onChange={set('phone')} placeholder="+234 800 000 0000" /></div>
        <div><label style={labelStyle}>Role</label><select style={{ ...inputStyle, cursor: 'pointer' }} value={form.role} onChange={set('role')}><option value="teacher">Class Teacher</option><option value="hod">Head of Department</option><option value="vp">Vice Principal</option><option value="principal">Principal</option></select></div>
        <div><label style={labelStyle}>Login Access</label><select style={{ ...inputStyle, cursor: 'pointer' }} value={form.access} onChange={set('access')}><option value="yes">Give EduCall login</option><option value="no">No login (attendance only)</option></select></div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={labelStyle}>Subjects Taught</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>{SUBJECTS.map(s => (<label key={s} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '20px', background: form.subjects.includes(s) ? 'var(--primary)' : 'var(--surface-container-low)', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: form.subjects.includes(s) ? 'white' : 'var(--on-surface)' }}><input type="checkbox" checked={form.subjects.includes(s)} onChange={() => toggleArr('subjects', s)} style={{ display: 'none' }} />{s}</label>))}</div>
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={labelStyle}>Classes Assigned</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>{CLASSES.map(c => (<label key={c} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '20px', background: form.classes.includes(c) ? 'var(--secondary)' : 'var(--surface-container-low)', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: form.classes.includes(c) ? 'white' : 'var(--on-surface)' }}><input type="checkbox" checked={form.classes.includes(c)} onChange={() => toggleArr('classes', c)} style={{ display: 'none' }} />{c}</label>))}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} icon="save">Save Teacher</Button>
      </div>
    </div>
  );
}

export function TeachersPage({ showToast }) {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useApp();
  const [modal, setModal] = useState(null);

  function handleSave(form) {
    if (modal === 'add') { addTeacher(form); showToast('Teacher added'); }
    else { updateTeacher({ ...form, id: modal.id }); showToast('Teacher updated'); }
    setModal(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar title="Teachers" subtitle={`${teachers.length} registered`} actions={<Button variant="primary" size="sm" icon="person_add" onClick={() => setModal('add')}>Add Teacher</Button>} />
      <div style={{ padding: '24px 32px 40px' }}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--surface-container-low)' }}>{['#', 'Teacher', 'Contact', 'Subjects', 'Classes', 'Role', 'Access', 'Actions'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>)}</tr></thead>
              <tbody>
                {teachers.map((t, i) => (
                  <tr key={t.id} style={{ background: i % 2 === 1 ? 'var(--surface-container-low)' : 'transparent' }}>
                    <td style={{ padding: '12px 14px', fontSize: '11px', color: 'var(--outline)' }}>{i + 1}</td>
                    <td style={{ padding: '12px 14px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>{getInitials(t.name)}</div><span style={{ fontSize: '13px', fontWeight: 600 }}>{t.name}</span></div></td>
                    <td style={{ padding: '12px 14px', fontSize: '12px' }}>{t.email}<br /><span style={{ color: 'var(--outline)' }}>{t.phone}</span></td>
                    <td style={{ padding: '12px 14px', maxWidth: '160px' }}><div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>{(t.subjects || []).map(s => <Badge key={s} color="blue" style={{ fontSize: '10px' }}>{s}</Badge>)}</div></td>
                    <td style={{ padding: '12px 14px' }}><div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>{(t.classes || []).map(c => <Badge key={c} color="green" style={{ fontSize: '10px' }}>{c}</Badge>)}</div></td>
                    <td style={{ padding: '12px 14px' }}><Badge color="amber" style={{ textTransform: 'capitalize' }}>{t.role}</Badge></td>
                    <td style={{ padding: '12px 14px' }}><Badge color={t.access === 'no' ? 'red' : 'green'}>{t.access === 'no' ? 'No login' : 'Has login'}</Badge></td>
                    <td style={{ padding: '12px 14px' }}><div style={{ display: 'flex', gap: '4px' }}><Button variant="secondary" size="sm" icon="edit" onClick={() => setModal(t)} style={{ minWidth: '36px', minHeight: '36px', padding: '0 8px' }} /><Button variant="danger" size="sm" icon="delete" onClick={() => { deleteTeacher(t.id); showToast('Teacher removed'); }} style={{ minWidth: '36px', minHeight: '36px', padding: '0 8px' }} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <Modal isOpen={modal !== null} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Teacher' : 'Edit Teacher'} maxWidth={580}>
        <TeacherForm initial={modal !== 'add' ? modal : {}} onSave={handleSave} onCancel={() => setModal(null)} />
      </Modal>
    </div>
  );
}
