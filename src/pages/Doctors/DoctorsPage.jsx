import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDataStore } from '../../store/dataStore'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { MdAdd, MdEdit, MdDelete, MdSearch, MdPerson, MdOpenInNew } from 'react-icons/md'
import { en } from '../../locale/en'
import { useToastStore } from '../../store/toastStore'

const DEPTS = ['Computer Science', 'Mathematics', 'Physics', 'Engineering', 'Information Systems']
const EMPTY = { name: '', email: '', phone: '', department: 'Computer Science', academicPosition: 'Lecturer', officeHours: '', status: 'active' }

function subjectCodesForDoctor(subjects, doctorName) {
  return subjects.filter((s) => s.doctor === doctorName).map((s) => s.code)
}

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Name is required'
  if (!form.email.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email'
  if (form.phone && !/^\d{10,15}$/.test(form.phone.replace(/\s/g, ''))) errors.phone = 'Invalid phone'
  return errors
}

export default function DoctorsPage() {
  const { doctors, subjects, addDoctor, updateDoctor, deleteDoctor } = useDataStore()
  const showToast = useToastStore((s) => s.show)

  const [search, setSearch]   = useState('')
  const [modal, setModal]     = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [form, setForm]       = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [errors, setErrors]   = useState({})

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return doctors
    return doctors.filter((d) => {
      const codes = subjectCodesForDoctor(subjects, d.name).join(' ').toLowerCase()
      return d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q) ||
        (d.email && d.email.toLowerCase().includes(q)) || codes.includes(q)
    })
  }, [doctors, subjects, search])

  const openAdd = () => { setForm(EMPTY); setEditing(null); setErrors({}); setModal(true) }
  const openEdit = (d) => {
    setForm({ name: d.name, email: d.email || '', phone: d.phone || '', department: d.department, academicPosition: d.academicPosition || 'Lecturer', officeHours: d.officeHours || '', status: d.status })
    setEditing(d.id); setErrors({}); setModal(true)
  }

  const handleSave = () => {
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    if (editing) updateDoctor(editing, form)
    else addDoctor({ ...form })
    showToast(en.toast.saved, 'success')
    setModal(false)
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div className="form-field">
      <label>{label}</label>
      <input className={`uni-input${errors[key] ? ' input-error' : ''}`} type={type} placeholder={placeholder}
        value={form[key]} onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: undefined }) }} />
      {errors[key] && <span className="field-error">{errors[key]}</span>}
    </div>
  )

  return (
    <div>
      <div className="uni-card">
        <div className="uni-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdPerson size={18} style={{ color: 'var(--primary)' }} />
            <h3>{en.doctors.title} <span style={{ color: 'var(--gray-400)', fontWeight: 400, fontSize: 13 }}>({filtered.length})</span></h3>
          </div>
          <button className="btn-primary-uni" onClick={openAdd}><MdAdd size={16} /> {en.doctors.add}</button>
        </div>

        <div className="uni-card-body">
          <div className="search-bar">
            <div style={{ position: 'relative', flex: 1 }}>
              <MdSearch size={16} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input className="uni-input" style={{ width: '100%', paddingInlineEnd: 32 }} placeholder={en.doctors.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <table className="uni-table">
            <thead>
              <tr><th>ID</th><th>Name</th><th>Department</th><th>Position</th><th>Email</th><th>Phone</th><th>Subjects</th><th>Status</th><th>Profile</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>{en.doctors.noResults}</td></tr>
              )}
              {filtered.map((d) => {
                const codes = subjectCodesForDoctor(subjects, d.name)
                return (
                  <tr key={d.id}>
                    <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>{d.id}</td>
                    <td><strong style={{ fontWeight: 600 }}>{d.name}</strong></td>
                    <td style={{ fontSize: 12 }}>{d.department}</td>
                    <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{d.academicPosition || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{d.email || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{d.phone || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{codes.length ? codes.join(', ') : '—'}</td>
                    <td><span className={`badge-${d.status}`}>{d.status === 'active' ? en.common.active : en.common.inactive}</span></td>
                    <td>
                      <Link to={`/doctors/${d.id}`} className="btn-outline-uni" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 12 }}>
                        {en.common.open} <MdOpenInNew size={14} />
                      </Link>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="icon-btn edit" onClick={() => openEdit(d)} title={en.common.edit}><MdEdit size={15} /></button>
                        <button className="icon-btn del" onClick={() => setConfirm(d.id)} title={en.common.delete}><MdDelete size={15} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? en.doctors.editModal : en.doctors.addModal}
        footer={<><button className="btn-outline-uni" onClick={() => setModal(false)}>{en.common.cancel}</button><button className="btn-primary-uni" onClick={handleSave}>{en.common.save}</button></>}
      >
        {field('name', en.doctors.fullName)}
        {field('email', en.common.email, 'email')}
        {field('phone', en.common.phone, 'tel', '01012345678')}
        <div className="form-field">
          <label>{en.common.department}</label>
          <select className="uni-select" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
            {DEPTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>{en.doctors.academicPosition}</label>
          <select className="uni-select" value={form.academicPosition} onChange={(e) => setForm({ ...form, academicPosition: e.target.value })}>
            {en.doctors.positions.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        {field('officeHours', en.doctors.officeHours, 'text', 'e.g. Sun & Tue 10:00–12:00')}
        <div className="form-field">
          <label>{en.common.status}</label>
          <select className="uni-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">{en.common.active}</option>
            <option value="inactive">{en.common.inactive}</option>
          </select>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!confirm} onClose={() => setConfirm(null)}
        onConfirm={() => { deleteDoctor(confirm); showToast(en.toast.deleted, 'error'); setConfirm(null) }}
        message={en.doctors.deleteConfirm} />
    </div>
  )
}
