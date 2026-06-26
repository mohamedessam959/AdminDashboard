import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const INITIAL_ATTENDANCE = [
  { studentId: '2024001', studentName: 'Ahmed Samir',   status: 'present', method: 'location', time: '09:02', subject: 'CS101', date: new Date().toISOString().split('T')[0] },
  { studentId: '2024002', studentName: 'Sara Youssef',  status: 'present', method: 'location', time: '09:05', subject: 'CS101', date: new Date().toISOString().split('T')[0] },
  { studentId: '2024003', studentName: 'Omar Khalid',   status: 'present', method: 'manual',   time: '09:10', subject: 'CS101', date: new Date().toISOString().split('T')[0] },
  { studentId: '2024004', studentName: 'Nour Hassan',   status: 'absent',  method: null,       time: null,    subject: 'CS101', date: new Date().toISOString().split('T')[0] },
  { studentId: '2024005', studentName: 'Layla Mohamed', status: 'present', method: 'location', time: '09:01', subject: 'CS101', date: new Date().toISOString().split('T')[0] },
  { studentId: '2024006', studentName: 'Karim Ibrahim', status: 'absent',  method: null,       time: null,    subject: 'CS101', date: new Date().toISOString().split('T')[0] },
]

export const useAttendanceStore = create(
  persist(
    (set, get) => ({
      records: INITIAL_ATTENDANCE,

      getFiltered: (subject, date) =>
        get().records.filter((r) => r.subject === subject && r.date === date),

      markAttendance: (studentId, subject, date, status, method = 'manual', studentName) => {
        const now = new Date().toTimeString().slice(0, 5)
        set((s) => {
          const exists = s.records.find(
            (r) => r.studentId === studentId && r.subject === subject && r.date === date
          )
          if (exists) {
            return {
              records: s.records.map((r) =>
                r.studentId === studentId && r.subject === subject && r.date === date
                  ? { ...r, status, method, time: status === 'present' ? now : null }
                  : r
              ),
            }
          }
          return {
            records: [
              ...s.records,
              {
                studentId,
                studentName: studentName || '',
                status,
                method,
                time: status === 'present' ? now : null,
                subject,
                date,
              },
            ],
          }
        })
      },

      renameSubject: (oldCode, newCode) =>
        set((s) => ({
          records: s.records.map((r) =>
            r.subject === oldCode ? { ...r, subject: newCode } : r
          ),
        }))
      ,

      initSession: (students, subject, date) => {
        const existing = get().records.filter((r) => r.subject === subject && r.date === date)
        if (existing.length > 0) return
        const newRecords = students.map((st) => ({
          studentId: st.id,
          studentName: st.name,
          status: 'absent',
          method: null,
          time: null,
          subject,
          date,
        }))
        set((s) => ({ records: [...s.records, ...newRecords] }))
      },
    }),
    {
      name: 'uni-attendance-v1',
      partialize: (state) => ({ records: state.records }),
    }
  )
)
