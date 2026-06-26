import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Modal from '../../components/common/Modal'
import { useDataStore } from '../../store/dataStore'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useToastStore } from '../../store/toastStore'
import { MdArrowBack, MdMenuBook, MdEmail, MdPhone, MdAccessTime, MdSchool, MdBadge, MdClose, MdEdit } from 'react-icons/md'
import { en } from '../../locale/en'

function attendancePct(records) {
  if (!records.length) return null
  return Math.round((records.filter((r) => r.status === 'present').length / records.length) * 100)
}

function subjectAttendancePct(records, code) {
  const rows = records.filter((r) => r.subject === code)
  return attendancePct(rows)
}

export default function DoctorProfilePage() {
  const { id } = useParams()
  const { doctors, subjects, subjectEnrollments, addSubject, updateSubject } = useDataStore()
  const { records, renameSubject } = useAttendanceStore()
  const showToast = useToastStore((s) => s.show)

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]     = useState('')
  const [addCourseModal, setAddCourseModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [newCourseForm, setNewCourseForm] = useState({ name: '', code: '', credits: '', enrolled: '', attendancePct: '' })

  const resetCourseForm = () => setNewCourseForm({ name: '', code: '', credits: '', enrolled: '', attendancePct: '' })

  const doctor = doctors.find((d) => d.id === id)

  const openAddCourseModal = () => {
    resetCourseForm()
    setEditingCourse(null)
    setAddCourseModal(true)
  }

  const openEditCourseModal = (course) => {
    setEditingCourse(course)
    setNewCourseForm({
      name: course.name || '',
      code: course.code || '',
      credits: course.credits != null ? String(course.credits) : '',
      enrolled: course.enrolledCount != null ? String(course.enrolledCount) : String((subjectEnrollments[course.code] || []).length),
      attendancePct: course.attendancePct != null ? String(course.attendancePct) : '',
    })
    setAddCourseModal(true)
  }

  const mySubjects = useMemo(() =>
    doctor ? subjects.filter((s) => s.doctor === doctor.name) : [],
    [doctor, subjects]
  )

  const handleSaveCourse = () => {
    if (!doctor) return

    const name = newCourseForm.name.trim()
    const code = newCourseForm.code.trim()
    const credits = newCourseForm.credits.trim()
    const enrolled = newCourseForm.enrolled.trim()
    const attendancePct = newCourseForm.attendancePct.trim()

    if (!name || !code) {
      showToast('Course Name and Code are required.', 'error')
      return
    }

    const existingCode = subjects.find((s) => s.code.toLowerCase() === code.toLowerCase() && s.code !== editingCourse?.code)
    if (existingCode) {
      showToast('Course code already exists.', 'error')
      return
    }

    const courseData = {
      code,
      name,
      doctor: doctor.name,
      department: doctor.department,
      credits: Number(credits) || 0,
      enrolledCount: Number(enrolled) || 0,
    }

    if (attendancePct !== '') {
      courseData.attendancePct = Number(attendancePct)
    }

    if (editingCourse) {
      updateSubject(editingCourse.code, courseData)
      if (editingCourse.code !== code) {
        renameSubject(editingCourse.code, code)
      }
    } else {
      addSubject(courseData)
    }

    resetCourseForm()
    setEditingCourse(null)
    setAddCourseModal(false)
    showToast(en.toast.saved, 'success')
  }

  const filteredRecords = useMemo(() => {
    const codes = new Set(mySubjects.map((s) => s.code))
    return records.filter((r) => {
      if (!codes.has(r.subject)) return false
      if (dateFrom && r.date < dateFrom) return false
      if (dateTo && r.date > dateTo) return false
      return true
    })
  }, [records, mySubjects, dateFrom, dateTo])

  const overallPct = useMemo(() => attendancePct(filteredRecords), [filteredRecords])

  const absenceLog = useMemo(() => {
    const codes = new Set(mySubjects.map((s) => s.code))
    return records
      .filter((r) => codes.has(r.subject) && r.status === 'absent' &&
        (!dateFrom || r.date >= dateFrom) && (!dateTo || r.date <= dateTo))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 80)
  }, [records, mySubjects, dateFrom, dateTo])

  if (!doctor) {
    return (
      <div className="uni-card">
        <div className="uni-card-body" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--gray-400)', marginBottom: 12 }}>{en.doctorProfile.notFound}</p>
          <Link to="/doctors" className="btn-outline-uni">{en.doctorProfile.back}</Link>
        </div>
      </div>
    )
  }

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} style={{ color: 'var(--primary)' }} />
      </div>
      <div>
        <p style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <p style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{value || '—'}</p>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Link to="/doctors" className="btn-outline-uni" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <MdArrowBack size={16} /> {en.doctorProfile.back}
        </Link>
      </div>

      {/* ── Info Card ── */}
      <div className="uni-card" style={{ marginBottom: '1rem' }}>
        <div className="uni-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>
                {doctor.name.split(' ').filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join('')}
              </span>
            </div>
            <div>
              <h3 style={{ fontSize: 16 }}>{doctor.name}</h3>
              <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{doctor.academicPosition || 'Faculty'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {overallPct != null && (
              <span style={{ fontWeight: 700, fontSize: 15, color: overallPct >= 80 ? 'var(--success)' : overallPct >= 65 ? 'var(--warning)' : 'var(--danger)' }}>
                {overallPct}% {en.doctorProfile.overallAtt}
              </span>
            )}
            <span className={`badge-${doctor.status}`}>{doctor.status === 'active' ? en.common.active : en.common.inactive}</span>
          </div>
        </div>
        <div className="uni-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <InfoRow icon={MdBadge}      label={en.doctorProfile.id}        value={doctor.id} />
            <InfoRow icon={MdSchool}     label={en.doctorProfile.dept}      value={doctor.department} />
            <InfoRow icon={MdEmail}      label={en.doctorProfile.email}     value={doctor.email} />
            <InfoRow icon={MdPhone}      label={en.doctorProfile.phone}     value={doctor.phone} />
            <InfoRow icon={MdSchool}     label={en.doctorProfile.position}  value={doctor.academicPosition} />
            <InfoRow icon={MdAccessTime} label={en.doctorProfile.officeHours} value={doctor.officeHours} />
          </div>
        </div>
      </div>

      {/* ── Date Filter ── */}
      <div className="uni-card" style={{ marginBottom: '1rem' }}>
        <div className="uni-card-header"><h3 style={{ fontSize: 14 }}>{en.doctorProfile.filterTitle}</h3></div>
        <div className="uni-card-body" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label>{en.doctorProfile.dateFrom}</label>
            <input className="uni-input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label>{en.doctorProfile.dateTo}</label>
            <input className="uni-input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <button type="button" className="btn-outline-uni" onClick={() => { setDateFrom(''); setDateTo('') }}>
            {en.doctorProfile.clearFilter}
          </button>
        </div>
      </div>

      {/* ── Subjects ── */}
      <div className="uni-card" style={{ marginBottom: '1rem' }}>
        <div className="uni-card-header">
          <h3><MdMenuBook size={18} style={{ verticalAlign: 'text-bottom', marginRight: 6 }} />{en.doctorProfile.subjectsTitle}</h3>
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{mySubjects.length} {en.doctorProfile.catalogueCount}</span>
        </div>
        <div className="uni-card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <button type="button" className="btn-primary-uni" onClick={openAddCourseModal}>
              {en.subjects.add}
            </button>
          </div>

          <Modal
            isOpen={addCourseModal}
            onClose={() => {
              resetCourseForm()
              setEditingCourse(null)
              setAddCourseModal(false)
            }}
            title={editingCourse ? 'Edit Course' : en.subjects.add}
            footer={(
              <>
                <button className="btn-outline-uni" onClick={() => {
                  resetCourseForm()
                  setEditingCourse(null)
                  setAddCourseModal(false)
                }}>
                  {en.common.cancel}
                </button>
                <button className="btn-primary-uni" onClick={handleSaveCourse}>
                  {en.common.save}
                </button>
              </>
            )}
          >
            <div className="form-field"><label>Course Name</label><input className="uni-input" type="text" value={newCourseForm.name} onChange={(e) => setNewCourseForm({ ...newCourseForm, name: e.target.value })} /></div>
            <div className="form-field"><label>Course Code</label><input className="uni-input" type="text" value={newCourseForm.code} onChange={(e) => setNewCourseForm({ ...newCourseForm, code: e.target.value })} /></div>
            <div className="form-field"><label>Credit Hours</label><input className="uni-input" type="text" value={newCourseForm.credits} onChange={(e) => setNewCourseForm({ ...newCourseForm, credits: e.target.value })} /></div>
            <div className="form-field"><label>Number of Enrolled Students</label><input className="uni-input" type="text" value={newCourseForm.enrolled} onChange={(e) => setNewCourseForm({ ...newCourseForm, enrolled: e.target.value })} /></div>
            <div className="form-field"><label>Attendance Rate (%)</label><input className="uni-input" type="text" value={newCourseForm.attendancePct} onChange={(e) => setNewCourseForm({ ...newCourseForm, attendancePct: e.target.value })} /></div>
          </Modal>

          <table className="uni-table">
            <thead>
              <tr><th>{en.doctorProfile.code}</th><th>{en.doctorProfile.subject}</th><th>{en.doctorProfile.enrolled}</th><th>{en.doctorProfile.sessionAtt}</th><th /></tr>
            </thead>
            <tbody>
              {mySubjects.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--gray-400)' }}>{en.doctorProfile.noSubjects}</td></tr>
              )}
              {mySubjects.map((s) => {
                const pctValue = s.attendancePct != null ? s.attendancePct : subjectAttendancePct(filteredRecords, s.code)
                const enrolled = s.enrolledCount != null ? s.enrolledCount : (subjectEnrollments[s.code] || []).length
                return (
                  <tr key={s.code}>
                    <td style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 12 }}>{s.code}</td>
                    <td><strong style={{ fontWeight: 600 }}>{s.name}</strong></td>
                    <td>{enrolled}</td>
                    <td>
                      {pctValue == null ? <span style={{ color: 'var(--gray-400)' }}>{en.doctorProfile.noData}</span>
                        : <span style={{ fontWeight: 600, color: pctValue >= 80 ? 'var(--success)' : pctValue >= 65 ? 'var(--warning)' : 'var(--danger)' }}>{pctValue}%</span>}
                    </td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button type="button" className="btn-outline-uni" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => openEditCourseModal(s)}>
                        <MdEdit size={13} /> Edit
                      </button>
                      <button type="button" className="btn-outline-uni" style={{ fontSize: 11, padding: '4px 10px' }}
                        onClick={() => {
                          updateSubject(s.code, { ...s, doctor: '' })
                          showToast(en.toast.saved, 'info')
                        }}>
                        <MdClose size={13} /> {en.doctorProfile.removeSubject}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Absence Log ── */}
      <div className="uni-card">
        <div className="uni-card-header">
          <h3>{en.doctorProfile.absenceLog}</h3>
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{en.doctorProfile.absenceSub}</span>
        </div>
        <div className="uni-card-body" style={{ padding: 0 }}>
          <table className="uni-table">
            <thead>
              <tr><th>{en.doctorProfile.date}</th><th>Course</th><th>{en.doctorProfile.student}</th><th>ID</th></tr>
            </thead>
            <tbody>
              {absenceLog.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--gray-400)' }}>{en.doctorProfile.noAbsence}</td></tr>
              )}
              {absenceLog.map((r, i) => (
                <tr key={`${r.studentId}-${r.subject}-${r.date}-${i}`}>
                  <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{r.date}</td>
                  <td>{r.subject}</td>
                  <td><strong style={{ fontWeight: 600 }}>{r.studentName || '—'}</strong></td>
                  <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{r.studentId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
