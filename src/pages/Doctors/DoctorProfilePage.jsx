import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDataStore } from '../../store/dataStore'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useToastStore } from '../../store/toastStore'
import { MdArrowBack, MdMenuBook, MdEmail, MdPhone, MdAccessTime, MdSchool, MdBadge, MdClose } from 'react-icons/md'
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
  const { doctors, subjects, subjectEnrollments, updateSubject } = useDataStore()
  const { records } = useAttendanceStore()
  const showToast = useToastStore((s) => s.show)

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]     = useState('')

  const doctor = doctors.find((d) => d.id === id)

  const mySubjects = useMemo(() =>
    doctor ? subjects.filter((s) => s.doctor === doctor.name) : [],
    [doctor, subjects]
  )

  const unassignedSubjects = useMemo(() =>
    subjects.filter((s) => s.doctor !== doctor?.name),
    [subjects, doctor]
  )

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
          {/* Assign subject */}
          {unassignedSubjects.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'flex-end' }}>
              <div className="form-field" style={{ marginBottom: 0, flex: '1 1 220px' }}>
                <label>{en.doctorProfile.assignSubject}</label>
                <select className="uni-select" value="" onChange={(e) => {
                  const code = e.target.value
                  if (!code) return
                  const sub = subjects.find((s) => s.code === code)
                  if (sub) { updateSubject(code, { ...sub, doctor: doctor.name }); showToast(en.toast.saved, 'success') }
                }}>
                  <option value="">{en.doctorProfile.chooseSubject}</option>
                  {unassignedSubjects.map((s) => <option key={s.code} value={s.code}>{s.code} – {s.name}</option>)}
                </select>
              </div>
            </div>
          )}

          <table className="uni-table">
            <thead>
              <tr><th>{en.doctorProfile.code}</th><th>{en.doctorProfile.subject}</th><th>{en.doctorProfile.enrolled}</th><th>{en.doctorProfile.sessionAtt}</th><th /></tr>
            </thead>
            <tbody>
              {mySubjects.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--gray-400)' }}>{en.doctorProfile.noSubjects}</td></tr>
              )}
              {mySubjects.map((s) => {
                const pct = subjectAttendancePct(filteredRecords, s.code)
                const enrolled = (subjectEnrollments[s.code] || []).length
                return (
                  <tr key={s.code}>
                    <td style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 12 }}>{s.code}</td>
                    <td><strong style={{ fontWeight: 600 }}>{s.name}</strong></td>
                    <td>{enrolled}</td>
                    <td>
                      {pct == null ? <span style={{ color: 'var(--gray-400)' }}>{en.doctorProfile.noData}</span>
                        : <span style={{ fontWeight: 600, color: pct >= 80 ? 'var(--success)' : pct >= 65 ? 'var(--warning)' : 'var(--danger)' }}>{pct}%</span>}
                    </td>
                    <td>
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
