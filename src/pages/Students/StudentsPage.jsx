import { useState, useMemo } from 'react'
import { useDataStore } from '../../store/dataStore'
import { useAttendanceStore } from '../../store/attendanceStore'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { MdAdd, MdEdit, MdDelete, MdSearch, MdPeople, MdClose, MdSchool } from 'react-icons/md'
import { en } from '../../locale/en'
import { useToastStore } from '../../store/toastStore'

const DEPTS = ['Computer Science', 'Information Systems']
const EMPTY = { name: '', email: '', phone: '', department: 'Computer Science', status: 'active', gpa: '', studyYear: '1', courses: [] }

function studentAttendanceInSubject(records, studentId, subjectCode) {
  const rows = records.filter((r) => r.subject === subjectCode && r.studentId === studentId)
  if (!rows.length) return null
  const present = rows.filter((r) => r.status === 'present').length
  return Math.round((present / rows.length) * 100)
}

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Name is required'
  if (!form.email.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email format'
  if (form.phone && !/^\d{10,15}$/.test(form.phone.replace(/\s/g, ''))) errors.phone = 'Invalid phone number'
  if (form.gpa !== '' && (Number(form.gpa) < 0 || Number(form.gpa) > 4)) errors.gpa = 'GPA must be 0–4'
  return errors
}

export default function StudentsPage() {
  const { students, subjects, subjectEnrollments, addStudent, updateStudent, deleteStudent, enrollStudentInSubject, unenrollStudentFromSubject } = useDataStore()
  const { records } = useAttendanceStore()
  const showToast = useToastStore((s) => s.show)

  const [search, setSearch]   = useState('')
  const [dept, setDept]       = useState('')
  const [modal, setModal]     = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [form, setForm]       = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [errors, setErrors]   = useState({})
  const [profileId, setProfileId] = useState(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return students.filter((s) =>
      (!search || s.name.toLowerCase().includes(q) || s.id.includes(q) || (s.email && s.email.toLowerCase().includes(q))) &&
      (!dept || s.department === dept)
    )
  }, [students, search, dept])

  const profileStudent = students.find((s) => s.id === profileId)

  const enrolledCodes = useMemo(() => {
    if (!profileId) return []
    return Object.entries(subjectEnrollments)
      .filter(([, ids]) => ids.includes(profileId))
      .map(([code]) => code)
  }, [subjectEnrollments, profileId])

  const enrolledSubjects = useMemo(() =>
    enrolledCodes.map((code) => subjects.find((s) => s.code === code)).filter(Boolean),
    [enrolledCodes, subjects]
  )

  const addableSubjects = useMemo(() =>
    subjects.filter((s) => !enrolledCodes.includes(s.code)),
    [subjects, enrolledCodes]
  )

  const openAdd = () => { setForm(EMPTY); setEditing(null); setErrors({}); setModal(true) }
  const openEdit = (s) => {
    setForm({
      name: s.name,
      email: s.email,
      phone: s.phone || '',
      department: s.department,
      status: s.status,
      gpa: s.gpa ?? '',
      studyYear: s.studyYear || '1',
      courses: s.courses ? s.courses.map((c) => ({ ...c })) : [],
    })
    setEditing(s.id); setErrors({}); setModal(true)
  }

  const handleSave = () => {
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    const payload = {
      ...form,
      gpa: form.gpa === '' ? 0 : Number(form.gpa),
      studyYear: String(form.studyYear || '1'),
      courses: form.courses || [],
    }
    if (editing) updateStudent(editing, payload)
    else addStudent(payload)
    showToast(en.toast.saved, 'success')
    setModal(false)
  }

  const field = (key, label, type = 'text', extra = {}) => (
    <div className="form-field">
      <label>{label}</label>
      <input
        className={`uni-input${errors[key] ? ' input-error' : ''}`}
        type={type}
        value={form[key]}
        onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: undefined }) }}
        {...extra}
      />
      {errors[key] && <span className="field-error">{errors[key]}</span>}
    </div>
  )

  return (
    <div>
      {/* ── List ── */}
      <div className="uni-card">
        <div className="uni-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdPeople size={18} style={{ color: 'var(--primary)' }} />
            <h3>{en.students.title} <span style={{ color: 'var(--gray-400)', fontWeight: 400, fontSize: 13 }}>({filtered.length})</span></h3>
          </div>
          <button className="btn-primary-uni" onClick={openAdd}><MdAdd size={16} /> {en.students.addStudent}</button>
        </div>
        <div className="uni-card-body">
          <div className="search-bar">
            <div style={{ position: 'relative', flex: 1 }}>
              <MdSearch size={16} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input className="uni-input" style={{ width: '100%', paddingInlineEnd: 32 }} placeholder={en.students.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="uni-select" value={dept} onChange={(e) => setDept(e.target.value)}>
              <option value="">{en.common.allDepartments}</option>
              {DEPTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          <table className="uni-table">
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Department</th><th>Email</th><th>Phone</th><th>Year</th><th>GPA</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>{en.students.noResults}</td></tr>
              )}
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>{s.id}</td>
                  <td>
                    <button type="button" onClick={() => setProfileId(s.id)} style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}>
                      {s.name}
                    </button>
                  </td>
                  <td><span style={{ fontSize: 12 }}>{s.department}</span></td>
                  <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>{s.email}</td>
                  <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>{s.phone || '—'}</td>
                  <td>{s.studyYear ?? '—'}</td>
                  <td style={{ fontWeight: 600 }}>{s.gpa != null && s.gpa !== '' ? Number(s.gpa).toFixed(2) : '—'}</td>
                  <td><span className={`badge-${s.status}`}>{s.status === 'active' ? en.common.active : en.common.inactive}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="icon-btn edit" onClick={() => openEdit(s)} title={en.common.edit}><MdEdit size={15} /></button>
                      <button className="icon-btn del" onClick={() => setConfirm(s.id)} title={en.common.delete}><MdDelete size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? en.students.editModal : en.students.addModal}
        footer={<><button className="btn-outline-uni" onClick={() => setModal(false)}>{en.common.cancel}</button><button className="btn-primary-uni" onClick={handleSave}>{en.common.save}</button></>}
      >
        {field('name', en.students.fullName)}
        {field('email', en.common.email, 'email')}
        {field('phone', en.common.phone, 'tel', { placeholder: '01012345678' })}
        <div className="form-field">
          <label>{en.common.department}</label>
          <select className="uni-select" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
            {DEPTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        {field('studyYear', en.students.year, 'number', { min: 1, max: 6, placeholder: en.students.studyYearPh })}
        <div className="form-field">
          <label>{en.students.gpa} <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>({en.students.gpaHint})</span></label>
          <input className={`uni-input${errors.gpa ? ' input-error' : ''}`} type="number" step="0.01" min={0} max={4} value={form.gpa} onChange={(e) => { setForm({ ...form, gpa: e.target.value }); setErrors({ ...errors, gpa: undefined }) }} />
          {errors.gpa && <span className="field-error">{errors.gpa}</span>}
        </div>
        <div className="form-field">
          <label>{en.common.status}</label>
          <select className="uni-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">{en.common.active}</option>
            <option value="inactive">{en.common.inactive}</option>
          </select>
        </div>
        <div style={{ marginTop: 16, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Courses</h4>
          <button type="button" className="btn-outline-uni" style={{ fontSize: 12, padding: '6px 10px' }} onClick={() => setForm({ ...form, courses: [...(form.courses || []), { name: '', code: '', credits: '' }] })}>
            Add Course
          </button>
        </div>
        {(form.courses || []).length === 0 ? (
          <p style={{ color: 'var(--gray-400)', fontSize: 13, marginTop: 0 }}>No courses assigned yet.</p>
        ) : (
          (form.courses || []).map((course, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, marginBottom: 10, alignItems: 'flex-end' }}>
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label>Course Name</label>
                <input className="uni-input" type="text" value={course.name} onChange={(e) => {
                  const updated = [...form.courses]
                  updated[index] = { ...updated[index], name: e.target.value }
                  setForm({ ...form, courses: updated })
                }} />
              </div>
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label>Course Code</label>
                <input className="uni-input" type="text" value={course.code} onChange={(e) => {
                  const updated = [...form.courses]
                  updated[index] = { ...updated[index], code: e.target.value }
                  setForm({ ...form, courses: updated })
                }} />
              </div>
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label>Credit Hours</label>
                <input className="uni-input" type="text" value={course.credits} onChange={(e) => {
                  const updated = [...form.courses]
                  updated[index] = { ...updated[index], credits: e.target.value }
                  setForm({ ...form, courses: updated })
                }} />
              </div>
              <button type="button" className="btn-outline-uni" style={{ height: 36, alignSelf: 'flex-end' }} onClick={() => {
                const updated = [...form.courses]
                updated.splice(index, 1)
                setForm({ ...form, courses: updated })
              }}>
                Delete
              </button>
            </div>
          ))
        )}
      </Modal>

      {/* ── Student Profile Modal ── */}
      <Modal isOpen={!!profileId} onClose={() => setProfileId(null)} title={en.students.modal.profile} boxStyle={{ width: 620, maxWidth: '96vw' }}
        footer={<button className="btn-primary-uni" onClick={() => setProfileId(null)}>{en.common.close}</button>}
      >
        {profileStudent ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: '1.25rem', fontSize: 13 }}>
              <p><span style={{ color: 'var(--gray-400)' }}>{en.students.modal.id}:</span> <strong>{profileStudent.id}</strong></p>
              <p><span style={{ color: 'var(--gray-400)' }}>{en.students.modal.name}:</span> <strong>{profileStudent.name}</strong></p>
              <p><span style={{ color: 'var(--gray-400)' }}>{en.students.modal.email}:</span> {profileStudent.email}</p>
              <p><span style={{ color: 'var(--gray-400)' }}>{en.students.modal.phone}:</span> {profileStudent.phone || '—'}</p>
              <p><span style={{ color: 'var(--gray-400)' }}>{en.students.modal.department}:</span> {profileStudent.department}</p>
              <p><span style={{ color: 'var(--gray-400)' }}>{en.students.modal.studyYear}:</span> <strong>{profileStudent.studyYear || '—'}</strong></p>
              <p><span style={{ color: 'var(--gray-400)' }}>{en.students.modal.gpaLabel}:</span> <strong style={{ color: profileStudent.gpa >= 3.5 ? 'var(--success)' : profileStudent.gpa >= 2.5 ? 'var(--warning)' : 'var(--danger)' }}>{profileStudent.gpa != null ? Number(profileStudent.gpa).toFixed(2) : '—'}</strong></p>
              <p><span style={{ color: 'var(--gray-400)' }}>{en.students.modal.status}:</span> <span className={`badge-${profileStudent.status}`}>{profileStudent.status === 'active' ? en.common.active : en.common.inactive}</span></p>
            </div>

            <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{en.students.modal.enrolledTitle}</h4>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 12 }}>
              <div className="form-field" style={{ marginBottom: 0, flex: '1 1 200px' }}>
                <label>{en.students.modal.addCourse}</label>
                <select className="uni-select" value="" onChange={(e) => {
                  const code = e.target.value
                  if (!code) return
                  enrollStudentInSubject(code, profileStudent.id)
                  showToast(en.toast.enrolled, 'success')
                }}>
                  <option value="">{en.students.modal.chooseSubject}</option>
                  {addableSubjects.map((s) => <option key={s.code} value={s.code}>{s.code} – {s.name}</option>)}
                </select>
              </div>
            </div>

            <table className="uni-table">
              <thead>
                <tr><th>{en.subjects.code}</th><th>{en.subjects.name}</th><th>{en.subjects.doctor}</th><th>{en.students.modal.yourAttendance}</th><th /></tr>
              </thead>
              <tbody>
                {enrolledSubjects.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '1.25rem', color: 'var(--gray-400)' }}>{en.students.modal.notEnrolled}</td></tr>
                )}
                {enrolledSubjects.map((sub) => {
                  const pct = studentAttendanceInSubject(records, profileStudent.id, sub.code)
                  return (
                    <tr key={sub.code}>
                      <td style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 12 }}>{sub.code}</td>
                      <td><strong style={{ fontWeight: 600 }}>{sub.name}</strong></td>
                      <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{sub.doctor}</td>
                      <td>
                        {pct == null ? <span style={{ color: 'var(--gray-400)' }}>{en.students.modal.noSessions}</span>
                          : <span style={{ fontWeight: 600, color: pct >= 80 ? 'var(--success)' : pct >= 65 ? 'var(--warning)' : 'var(--danger)' }}>{pct}%</span>}
                      </td>
                      <td>
                        <button type="button" className="btn-outline-uni" style={{ fontSize: 11, padding: '4px 10px' }}
                          onClick={() => { unenrollStudentFromSubject(sub.code, profileStudent.id); showToast(en.toast.unenrolled, 'success') }}>
                          <MdClose size={13} /> {en.students.modal.remove}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </>
        ) : <p style={{ color: 'var(--gray-400)' }}>{en.students.modal.notFound}</p>}
      </Modal>

      <ConfirmDialog isOpen={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => { deleteStudent(confirm); showToast(en.toast.deleted, 'error') }} message={en.students.deleteConfirm} />
    </div>
  )
}
