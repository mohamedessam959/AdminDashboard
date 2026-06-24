import { useMemo } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'
import { useAttendanceStore } from '../../store/attendanceStore'
import { MdPeople, MdPerson, MdMenuBook, MdFactCheck, MdLocationOn, MdEdit, MdPersonAdd, MdLibraryAdd, MdWarning } from 'react-icons/md'
import { en } from '../../locale/en'
import styles from './DashboardPage.module.css'

const TODAY = new Date().toISOString().split('T')[0]

const ACTIVITY = [
  { icon: MdPersonAdd, color: 'var(--primary)', text: en.dashboard.act1, time: en.dashboard.act1t },
  { icon: MdLocationOn, color: 'var(--success)', text: en.dashboard.act2, time: en.dashboard.act2t },
  { icon: MdEdit, color: 'var(--warning)', text: en.dashboard.act3, time: en.dashboard.act3t },
  { icon: MdLibraryAdd, color: '#8b5cf6', text: en.dashboard.act4, time: en.dashboard.act4t },
]

function pctColor(p) {
  if (p >= 80) return 'fill-green'
  if (p >= 65) return 'fill-amber'
  return 'fill-red'
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { students, doctors, subjects } = useDataStore()
  const { records } = useAttendanceStore()

  const todayRecords = records.filter((r) => r.date === TODAY)
  const presentToday = todayRecords.filter((r) => r.status === 'present').length
  const totalToday = todayRecords.length
  const avgAtt = totalToday ? Math.round((presentToday / totalToday) * 100) : 0

  const sessionsToday = useMemo(() => {
    return subjects.map((sub) => {
      const dayRows = records.filter((r) => r.subject === sub.code && r.date === TODAY)
      const pct = dayRows.length
        ? Math.round((dayRows.filter((r) => r.status === 'present').length / dayRows.length) * 100)
        : null
      return { subject: sub.code, label: `${sub.code} – ${sub.name}`, pct }
    })
  }, [records, subjects])

  const doctorsPendingToday = useMemo(() => {
    return doctors.filter((d) => {
      const mine = subjects.filter((s) => s.doctor === d.name)
      if (!mine.length) return false
      return mine.some((sub) => !records.some((r) => r.subject === sub.code && r.date === TODAY))
    })
  }, [doctors, subjects, records])

  const lowestAttendanceSubjectToday = useMemo(() => {
    let best = null
    subjects.forEach((sub) => {
      const dayRows = records.filter((r) => r.subject === sub.code && r.date === TODAY)
      if (dayRows.length === 0) return
      const pct = Math.round((dayRows.filter((r) => r.status === 'present').length / dayRows.length) * 100)
      if (best == null || pct < best.pct) {
        best = { label: `${sub.code} – ${sub.name}`, pct, code: sub.code }
      }
    })
    return best
  }, [records, subjects])

  return (
    <div>
      <div className={styles.statsGrid}>
        <StatCard label={en.dashboard.totalStudents} value={students.length} sub={en.dashboard.semesterHint} color="var(--primary)" icon={MdPeople} />
        <StatCard label={en.dashboard.doctors} value={doctors.length} sub={en.dashboard.deptHint} color="var(--success)" icon={MdPerson} />
        <StatCard label={en.dashboard.subjects} value={subjects.length} sub={en.dashboard.facultiesHint} color="var(--warning)" icon={MdMenuBook} />
        <StatCard label={en.dashboard.avgAtt} value={`${avgAtt}%`} sub={en.dashboard.subToday} color="var(--primary)" icon={MdFactCheck} />
      </div>

      {user?.role === 'admin' && (
        <div className={styles.adminAlerts}>
          <div className="uni-card">
            <div className="uni-card-header">
              <h3>
                <MdPerson size={18} style={{ verticalAlign: 'text-bottom', marginInlineEnd: 6 }} />
                {en.dashboard.doctorsPending}
              </h3>
              <span className="badge-inactive" style={{ fontSize: 11 }}>{en.dashboard.pendingBadge}</span>
            </div>
            <div className="uni-card-body" style={{ fontSize: 13 }}>
              {doctorsPendingToday.length === 0 ? (
                <p style={{ color: 'var(--gray-400)', margin: 0 }}>{en.dashboard.pendingOk}</p>
              ) : (
                <ul style={{ margin: 0, paddingInlineStart: '1.1rem', color: 'var(--gray-600)' }}>
                  {doctorsPendingToday.map((d) => (
                    <li key={d.id}>
                      <strong style={{ fontWeight: 600 }}>{d.name}</strong>{' '}
                      <span style={{ color: 'var(--gray-400)' }}>({d.id})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="uni-card">
            <div className="uni-card-header">
              <h3>
                <MdWarning size={18} style={{ verticalAlign: 'text-bottom', marginInlineEnd: 6, color: 'var(--warning)' }} />
                {en.dashboard.lowestAtt}
              </h3>
            </div>
            <div className="uni-card-body" style={{ fontSize: 13 }}>
              {!lowestAttendanceSubjectToday ? (
                <p style={{ color: 'var(--gray-400)', margin: 0 }}>{en.dashboard.lowestNone}</p>
              ) : (
                <p style={{ margin: 0 }}>
                  <strong style={{ fontWeight: 600 }}>{lowestAttendanceSubjectToday.label}</strong>
                  <span
                    style={{
                      marginInlineStart: 8,
                      fontWeight: 700,
                      color:
                        lowestAttendanceSubjectToday.pct >= 80
                          ? 'var(--success)'
                          : lowestAttendanceSubjectToday.pct >= 65
                            ? 'var(--warning)'
                            : 'var(--danger)',
                    }}
                  >
                    {lowestAttendanceSubjectToday.pct}%
                  </span>{' '}
                  <span style={{ color: 'var(--gray-400)' }}>{en.dashboard.presentLabel}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={styles.twoCol}>
        <div className="uni-card">
          <div className="uni-card-header">
            <h3>{en.dashboard.todayAtt}</h3>
            <span className="badge-active">{en.common.live}</span>
          </div>
          <div className="uni-card-body">
            {sessionsToday.map((s) => (
              <div key={s.subject} className={styles.attRow}>
                <div className={styles.attMeta}>
                  <span>{s.label}</span>
                  <span
                    style={{
                      color:
                        s.pct == null
                          ? 'var(--gray-400)'
                          : s.pct >= 80
                            ? 'var(--success)'
                            : s.pct >= 65
                              ? 'var(--warning)'
                              : 'var(--danger)',
                      fontWeight: 600,
                    }}
                  >
                    {s.pct == null ? '—' : `${s.pct}%`}
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill ${s.pct == null ? 'fill-gray' : pctColor(s.pct)}`}
                    style={{ width: s.pct == null ? '0%' : `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="uni-card">
          <div className="uni-card-header"><h3>{en.dashboard.recent}</h3></div>
          <div style={{ padding: 0 }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} className={styles.activityItem}>
                <a.icon size={18} color={a.color} style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13 }}>{a.text}</p>
                  <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p className="stat-label">{label}</p>
          <p className="stat-value" style={{ color }}>{value}</p>
          <p className="stat-sub">{sub}</p>
        </div>
        <div style={{ background: color + '18', borderRadius: 8, padding: 8 }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </div>
  )
}
