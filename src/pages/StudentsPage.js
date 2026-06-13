/**
 * StudentsPage — Student roster with add/edit/delete and search.
 * Security: inputs are controlled React state — no innerHTML or dangerouslySetInnerHTML.
 */
import React, { useState } from 'react';
import { useApp }    from '../context/AppContext';
import { TopBar }    from '../components/layout/TopBar';
import { Card }      from '../components/ui/Card';
import { Button }    from '../components/ui/Button';
import { Badge }     from '../components/ui/Badge';
import { Modal }     from '../components/ui/Modal';
import { Icon }      from '../components/ui/Icon';
import { CLASSES }   from '../data/seedData';
import { getInitials, todayISO } from '../utils/helpers';

/* ── STUDENT FORM ────────────────────────────────────────────── */
function StudentForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: '', admno: '', gender: 'male', class: 'SS2A',
    parent: '', phone: '', sen: false, senType: '', equipment: [],
    ...initial,
  });
  const [equipInput, setEquipInput] = useState('');
  const [errors, setErrors] = useState({});

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  function addEquip() {
    if (!equipInput.trim()) return;
    setForm(f => ({ ...f, equipment: [...f.equipment, equipInput.trim()] }));
    setEquipInput('');
  }

  function removeEquip(item) {
    setForm(f => ({ ...f, equipment: f.equipment.filter(e => e !== item) }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim())   e.name   = 'Name is required';
    if (!form.parent.trim()) e.parent = 'Parent name is required';
    if (!form.phone.trim())  e.phone  = 'Parent phone is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave(form);
  }

  const inputStyle = { width: '100%', padding: '10px 14px', border: 'none', borderRadius: '8px', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '14px', boxShadow: '0 0 0 1.5px var(--outline-variant)', minHeight: '44px', background: 'var(--surface-container-lowest)', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {/* Full Name — spans both columns */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Full Name *</label>
          <input style={{ ...inputStyle, boxShadow: errors.name ? '0 0 0 2px var(--error)' : '0 0 0 1.5px var(--outline-variant)' }} value={form.name} onChange={set('name')} placeholder="e.g. Adaeze Okonkwo" />
          {errors.name && <div style={{ fontSize: '11px', color: 'var(--error)', marginTop: '4px' }}>{errors.name}</div>}
        </div>

        <div>
          <label style={labelStyle}>Admission No.</label>
          <input style={inputStyle} value={form.admno} onChange={set('admno')} placeholder="SCH/2024/001" />
        </div>
        <div>
          <label style={labelStyle}>Gender</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.gender} onChange={set('gender')}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Class</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.class} onChange={set('class')}>
            {CLASSES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Parent / Guardian *</label>
          <input style={{ ...inputStyle, boxShadow: errors.parent ? '0 0 0 2px var(--error)' : '0 0 0 1.5px var(--outline-variant)' }} value={form.parent} onChange={set('parent')} placeholder="Parent full name" />
          {errors.parent && <div style={{ fontSize: '11px', color: 'var(--error)', marginTop: '4px' }}>{errors.parent}</div>}
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Parent WhatsApp *</label>
          <input style={{ ...inputStyle, boxShadow: errors.phone ? '0 0 0 2px var(--error)' : '0 0 0 1.5px var(--outline-variant)' }} value={form.phone} onChange={set('phone')} placeholder="+234 800 000 0000" type="tel" />
          {errors.phone && <div style={{ fontSize: '11px', color: 'var(--error)', marginTop: '4px' }}>{errors.phone}</div>}
        </div>
      </div>

      {/* SEN toggle */}
      <div style={{ borderTop: '1px solid var(--surface-container-high)', marginTop: '16px', paddingTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>Special Educational Needs (SEN)</div>
            <div style={{ fontSize: '11px', color: 'var(--outline)', marginTop: '2px' }}>Parent receives alerts for missing equipment on check-in</div>
          </div>
          {/* Custom toggle */}
          <button
            onClick={() => setForm(f => ({ ...f, sen: !f.sen }))}
            role="switch" aria-checked={form.sen}
            style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', background: form.sen ? 'var(--primary)' : 'var(--surface-container-high)', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.2s', minHeight: '24px' }}
          >
            <div style={{ width: '20px', height: '20px', borderRadius: '10px', background: 'white', position: 'absolute', top: '2px', left: form.sen ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </button>
        </div>

        {form.sen && (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>SEN Type</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.senType} onChange={set('senType')}>
                <option value="">Select type…</option>
                {['Autism Spectrum Disorder (ASD)', 'ADHD / Attention Deficit Disorder', 'Dyslexia', 'Physical Disability', 'Speech and Language Needs', 'Hearing Impairment', 'Visual Impairment', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Required Equipment</label>
              <div style={{ fontSize: '11px', color: 'var(--outline)', marginBottom: '6px' }}>Parent alerted via WhatsApp if child arrives without any of these items</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {form.equipment.map(item => (
                  <span key={item} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'var(--primary)', color: 'white', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                    {item}
                    <button onClick={() => removeEquip(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', lineHeight: 1, padding: '0 0 0 2px', fontSize: '14px' }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={equipInput}
                  onChange={e => setEquipInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEquip(); } }}
                  placeholder="e.g. Hearing aid, Communication board"
                  style={{ ...inputStyle, flex: 1, fontSize: '12px' }}
                />
                <Button variant="secondary" size="sm" onClick={addEquip}>Add</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} icon="save">Save Student</Button>
      </div>
    </div>
  );
}

/* ── STUDENTS PAGE ───────────────────────────────────────────── */
export function StudentsPage({ showToast }) {
  const { students, addStudent, updateStudent, deleteStudent, enrolStudent } = useApp();
  const [search,   setSearch]   = useState('');
  const [cls,      setCls]      = useState('');
  const [modal,    setModal]    = useState(null); // null | 'add' | student object

  const filtered = students.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.admno.toLowerCase().includes(search.toLowerCase());
    const matchCls    = !cls   || s.class === cls;
    return matchSearch && matchCls;
  });

  function handleSave(form) {
    if (modal === 'add') {
      addStudent(form);
      showToast('Student added');
    } else {
      updateStudent({ ...form, id: modal.id });
      showToast('Student updated');
    }
    setModal(null);
  }

  const notEnrolled = students.filter(s => !s.fp).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar
        title="Students"
        subtitle={`${students.length} enrolled · SS1–SS3`}
        actions={
          <>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search students…"
              style={{ padding: '8px 14px 8px 32px', borderRadius: '8px', border: 'none', background: 'var(--surface-container-low)', fontSize: '13px', outline: 'none', minWidth: '200px', minHeight: '44px', fontFamily: 'var(--font-body)' }}
            />
            <select value={cls} onChange={e => setCls(e.target.value)} style={{ padding: '8px 28px 8px 12px', borderRadius: '8px', border: 'none', background: 'var(--surface-container-low)', fontSize: '13px', minHeight: '44px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              <option value="">All Classes</option>
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
            <Button variant="primary" size="sm" icon="person_add" onClick={() => setModal('add')}>Add Student</Button>
          </>
        }
      />

      <div style={{ padding: '24px 32px 40px' }}>
        {/* Unenrolled warning */}
        {notEnrolled > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'var(--error-container)', borderRadius: '10px', marginBottom: '16px' }}>
            <Icon name="warning" size={20} style={{ color: 'var(--error)', flexShrink: 0 }} />
            <div style={{ fontSize: '13px', color: '#690005', fontWeight: 600 }}>{notEnrolled} student{notEnrolled > 1 ? 's' : ''} without fingerprint enrolment</div>
          </div>
        )}

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-container-low)' }}>
                  {['#', 'Student', 'Adm. No.', 'Class', 'Parent', 'Fingerprint', 'Actions'].map((h, i) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.06em', borderRadius: i === 0 ? '12px 0 0 0' : i === 6 ? '0 12px 0 0' : 0 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--outline)', fontSize: '13px' }}>No students found</td></tr>
                )}
                {filtered.map((s, i) => (
                  <tr key={s.id} style={{ background: i % 2 === 1 ? 'var(--surface-container-low)' : 'transparent' }}>
                    <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--outline)', fontFamily: 'monospace' }}>{i + 1}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: s.fp ? 'var(--surface-container-high)' : 'var(--error-container)', color: s.fp ? 'var(--on-surface-variant)' : 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                          {getInitials(s.name)}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>{s.name}</div>
                          {s.sen && <Badge color="purple" style={{ fontSize: '9px', marginTop: '2px' }}>SEN</Badge>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--outline)' }}>{s.admno}</td>
                    <td style={{ padding: '12px 16px' }}><Badge color="blue">{s.class}</Badge></td>
                    <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                      {s.parent}<br />
                      <span style={{ color: 'var(--outline)' }}>{s.phone}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {s.fp
                        ? <Badge color="green" icon="fingerprint">Enrolled</Badge>
                        : <Badge color="red"   icon="fingerprint_off">Not enrolled</Badge>
                      }
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <Button variant="secondary" size="sm" icon="edit"   onClick={() => setModal(s)} style={{ minWidth: '44px', minHeight: '36px', padding: '0 8px' }} />
                        <Button variant="danger"    size="sm" icon="delete" onClick={() => { deleteStudent(s.id); showToast('Student removed'); }} style={{ minWidth: '44px', minHeight: '36px', padding: '0 8px' }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add/Edit modal */}
      <Modal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Add Student' : 'Edit Student'}
        subtitle="Fill in the student's details"
        maxWidth={560}
      >
        <StudentForm
          initial={modal !== 'add' ? modal : {}}
          onSave={handleSave}
          onCancel={() => setModal(null)}
        />
      </Modal>
    </div>
  );
}
