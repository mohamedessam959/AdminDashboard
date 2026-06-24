import { describe, it, expect } from 'vitest'
import {
  attendancePct,
  filterRecordsByDateRange,
  studentAttendanceInSubject,
  subjectCodesForDoctorName,
} from './attendanceStats'

describe('attendancePct', () => {
  it('returns null for empty', () => {
    expect(attendancePct([])).toBeNull()
  })
  it('computes present share', () => {
    const rows = [
      { status: 'present' },
      { status: 'present' },
      { status: 'absent' },
    ]
    expect(attendancePct(rows)).toBe(67)
  })
})

describe('filterRecordsByDateRange', () => {
  const rows = [
    { date: '2026-01-01' },
    { date: '2026-01-15' },
    { date: '2026-02-01' },
  ]
  it('returns all when no bounds', () => {
    expect(filterRecordsByDateRange(rows, '', '').length).toBe(3)
  })
  it('filters inclusive range by string compare', () => {
    const f = filterRecordsByDateRange(rows, '2026-01-10', '2026-01-20')
    expect(f.map((r) => r.date)).toEqual(['2026-01-15'])
  })
})

describe('studentAttendanceInSubject', () => {
  it('scopes to student and subject', () => {
    const records = [
      { studentId: '1', subject: 'A', status: 'present', date: '2026-01-01' },
      { studentId: '1', subject: 'A', status: 'absent', date: '2026-01-02' },
      { studentId: '2', subject: 'A', status: 'present', date: '2026-01-01' },
    ]
    expect(studentAttendanceInSubject(records, '1', 'A')).toBe(50)
  })
})

describe('subjectCodesForDoctorName', () => {
  it('lists codes from catalogue', () => {
    const subjects = [
      { code: 'X', doctor: 'Dr. A' },
      { code: 'Y', doctor: 'Dr. B' },
    ]
    expect(subjectCodesForDoctorName(subjects, 'Dr. A')).toEqual(['X'])
  })
})
