import { useState, useEffect, useMemo } from 'react'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useDataStore } from '../../store/dataStore'
import Modal from '../../components/common/Modal'
import { MdLocationOn, MdWifiOff, MdCheck, MdClose, MdEditNote } from 'react-icons/md'
import { en } from '../../locale/en'
import { studentsApi } from '../../api/students'

const TODAY = new Date().toISOString().split('T')[0]

export default function AttendancePage() {
  const { markAttendance, getFiltered, initSession } = useAttendanceStore()
  const { subjects, students, subjectEnrollments } = useDataStore()

  const [subject, setSubject] = useState(subjects[0]?.code || '')
  const [date, setDate]       = useState(TODAY)
  const [manModal, setManModal] = useState(false)
  const [manForm, setManForm]   = useState({ studentId: '', status: 'present', reason: '' })
  const [allStudents, setAllStudents] = useState(students)
  const [search, setSearch] = useState('')

  const rosterStudents = useMemo(() => {
    const code = subject?.toLowerCase?.() || ''
    const enrolledIds = subjectEnrollments[subject] || []

    return students.filter((s) => {
      const manuallyAssigned = (s.courses || []).some((c) =>
        String(c.code || '').toLowerCase() === code ||
        String(c.name || '').toLowerCase() === code
      )
      return enrolledIds.includes(s.id) || manuallyAssigned
    })
  }, [students, subject, subjectEnrollments])

  useEffect(() => {
    if (!subjects.length) return
    if (!subject || !subjects.some((s) => s.code === subject)) setSubject(subjects[0].code)
  }, [subjects, subject])

  useEffect(() => {
    if (!subject || !date || !rosterStudents.length) return
    initSession(rosterStudents, subject, date)
  }, [subject, date, rosterStudents, initSession])

  useEffect(() => {
    setManForm((f) => ({ ...f, studentId: rosterStudents[0]?.id || '' }))
  }, [subject, rosterStudents])

  useEffect(() => {
    if (!manModal) return
    // fetch full students list when modal opens
    studentsApi.getAll().then((res) => {
      setAllStudents(res.data || students)
    }).catch(() => setAllStudents(students))
  }, [manModal, students])

  const rosterStudentIds = useMemo(() => rosterStudents.map((s) => s.id), [rosterStudents])
  const filtered = getFiltered(subject, date).filter((r) => rosterStudentIds.includes(r.studentId))

  const present = filtered.filter((r) => r.status === 'present').length
  const absent  = filtered.filter((r) => r.status === 'absent').length
  const gps     = filtered.filter((r) => r.method === 'location').length
  const manual  = filtered.filter((r) => r.method === 'manual').length

  const handleManualSave = () => {
    const st = students.find((s) => s.id === manForm.studentId)
    if (!st) return
    markAttendance(manForm.studentId, subject, date, manForm.status, 'manual', st.name)
    setManModal(false)
  }

  const modalCandidates = useMemo(() => {
    const q = String(search || '').trim().toLowerCase()
    const list = (allStudents || []).filter((s) => {
      if (!q) return true
      return s.name.toLowerCase().includes(q) || String(s.id).toLowerCase().includes(q)
    })
    // put roster students first
    list.sort((a, b) => (rosterStudentIds.includes(a.id) === rosterStudentIds.includes(b.id) ? 0 : rosterStudentIds.includes(a.id) ? -1 : 1))
    return list
  }, [allStudents, search, rosterStudentIds])

  useEffect(() => {
    if (!manModal) return
    if (!modalCandidates.length) return
    setManForm((f) => ({ ...f, studentId: modalCandidates[0].id }))
  }, [manModal, modalCandidates])

  const handleToggle = (studentId, currentStatus) => {
    const st = students.find((s) => s.id === studentId)
    const next = currentStatus === 'present' ? 'absent' : 'present'
    markAttendance(studentId, subject, date, next, 'manual', st?.name)
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: 12, marginBottom: '1.25rem' }}>
        <div className="stat-card"><p className="stat-label">{en.attendance.present}</p><p className="stat-value" style={{ color: 'var(--success)' }}>{present}</p></div>
        <div className="stat-card"><p className="stat-label">{en.attendance.absent}</p><p className="stat-value" style={{ color: 'var(--danger)' }}>{absent}</p></div>
        <div className="stat-card"><p className="stat-label">{en.attendance.viaGps}</p><p className="stat-value" style={{ color: 'var(--primary)' }}>{gps}</p></div>
        <div className="stat-card"><p className="stat-label">{en.attendance.manual}</p><p className="stat-value" style={{ color: 'var(--warning)' }}>{manual}</p></div>
      </div>

      <div className="uni-card">
        <div className="uni-card-header">
          <h3>{en.attendance.register}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--success-light)', color: 'var(--success)', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            <MdLocationOn size={14} /> {en.attendance.locationBadge}
          </div>
        </div>
        <div className="uni-card-body">
          {!rosterStudents.length && (
            <p style={{ color: 'var(--gray-400)', padding: '1rem 0' }}>{en.attendance.noRosterAdmin}</p>
          )}
          <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="uni-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {subjects.map((s) => <option key={s.code} value={s.code}>{s.code} – {s.name}</option>)}
            </select>
            <input className="uni-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn-primary-uni" disabled={!rosterStudents.length} onClick={() => setManModal(true)}>
                <MdEditNote size={16} /> {en.attendance.markManual}
              </button>
            </div>
          </div>

          <table className="uni-table">
            <thead>
              <tr>
                <th>{en.attendance.table.student}</th><th>{en.attendance.table.id}</th>
                <th>{en.attendance.table.status}</th><th>{en.attendance.table.method}</th>
                <th>{en.attendance.table.time}</th><th>{en.attendance.table.toggle}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>{en.attendance.noRecords}</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.studentId}>
                  <td><strong style={{ fontWeight: 600 }}>{r.studentName}</strong></td>
                  <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{r.studentId}</td>
                  <td><span className={`badge-${r.status}`}>{r.status === 'present' ? en.attendance.present : en.attendance.absent}</span></td>
                  <td>
                    {r.method === 'location' && <span className="badge-location"><MdLocationOn size={11} /> GPS</span>}
                    {r.method === 'manual' && <span className="badge-manual"><MdWifiOff size={11} /> {en.attendance.manual}</span>}
                    {!r.method && <span style={{ color: 'var(--gray-400)', fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{r.time || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="icon-btn edit" title={en.attendance.present} onClick={() => handleToggle(r.studentId, r.status)} style={{ opacity: r.status === 'present' ? 0.3 : 1 }}><MdCheck size={15} /></button>
                      <button className="icon-btn del" title={en.attendance.absent} onClick={() => handleToggle(r.studentId, r.status)} style={{ opacity: r.status === 'absent' ? 0.3 : 1 }}><MdClose size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={manModal} onClose={() => setManModal(false)} title={en.attendance.manualModal}
        footer={<><button className="btn-outline-uni" onClick={() => setManModal(false)}>{en.common.cancel}</button><button className="btn-primary-uni" onClick={handleManualSave}>{en.common.confirm}</button></>}
      >
        <div style={{ background: 'var(--warning-light)', border: '1px solid #f5e0a0', borderRadius: 8, padding: '10px 12px', marginBottom: '1rem', fontSize: 12, color: 'var(--warning)', display: 'flex', gap: 8 }}>
          <MdWifiOff size={16} style={{ flexShrink: 0 }} />
          <span>{en.attendance.manualWarn}</span>
        </div>
        <div className="form-field">
          <label>{en.attendance.chooseStudent}</label>
          <input placeholder="Search name or id" className="uni-input" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select style={{ marginTop: 8 }} className="uni-select" value={manForm.studentId} onChange={(e) => setManForm({ ...manForm, studentId: e.target.value })}>
            {modalCandidates.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>{en.attendance.table.status}</label>
          <select className="uni-select" value={manForm.status} onChange={(e) => setManForm({ ...manForm, status: e.target.value })}>
            <option value="present">{en.attendance.present}</option>
            <option value="absent">{en.attendance.absent}</option>
          </select>
        </div>
        <div className="form-field">
          <label>{en.attendance.reason}</label>
          <input className="uni-input" value={manForm.reason} onChange={(e) => setManForm({ ...manForm, reason: e.target.value })} />
        </div>
      </Modal>
    </div>
  )
}
