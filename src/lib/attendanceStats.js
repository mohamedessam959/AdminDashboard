/**
 * دوال خالصة لحساب نسب الحضور (سهلة الاختبار).
 */

export function filterRecordsByDateRange(records, dateFrom, dateTo) {
  if (!dateFrom && !dateTo) return records
  return records.filter((r) => {
    if (dateFrom && r.date < dateFrom) return false
    if (dateTo && r.date > dateTo) return false
    return true
  })
}

export function recordsForSubject(records, subjectCode) {
  return records.filter((r) => r.subject === subjectCode)
}

/** نسبة الحضور من مصفوفة صفوف (نفس المقرر أو مختلطة) */
export function attendancePct(rows) {
  if (!rows?.length) return null
  const present = rows.filter((r) => r.status === 'present').length
  return Math.round((present / rows.length) * 100)
}

export function subjectAttendancePct(records, subjectCode, dateFrom, dateTo) {
  let rows = recordsForSubject(records, subjectCode)
  rows = filterRecordsByDateRange(rows, dateFrom, dateTo)
  return attendancePct(rows)
}

export function studentAttendanceInSubject(records, studentId, subjectCode, dateFrom, dateTo) {
  let rows = records.filter((r) => r.studentId === studentId && r.subject === subjectCode)
  rows = filterRecordsByDateRange(rows, dateFrom, dateTo)
  return attendancePct(rows)
}

export function doctorTeachingRecordFilter(records, subjectCodesSet, dateFrom, dateTo) {
  let rows = records.filter((r) => subjectCodesSet.has(r.subject))
  rows = filterRecordsByDateRange(rows, dateFrom, dateTo)
  return rows
}

export function subjectCodesForDoctorName(subjects, doctorName) {
  return subjects.filter((s) => s.doctor === doctorName).map((s) => s.code)
}
