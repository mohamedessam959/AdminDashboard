import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const INITIAL_STUDENTS = [
  { id: '2024001', name: 'Ahmed Samir',   department: 'Computer Science',       email: 'ahmed.samir@uni.edu',  phone: '01012345678', status: 'active',   gpa: 3.48, studyYear: '2', courses: [] },
  { id: '2024002', name: 'Sara Youssef',  department: 'Information Systems',    email: 'sara.y@uni.edu',       phone: '01123456789', status: 'active',   gpa: 3.72, studyYear: '3', courses: [] },
  { id: '2024003', name: 'Omar Khalid',   department: 'Computer Science',       email: 'omar.k@uni.edu',       phone: '01234567890', status: 'active',   gpa: 3.15, studyYear: '2', courses: [] },
  { id: '2024004', name: 'Nour Hassan',   department: 'Information Systems',    email: 'nour.h@uni.edu',       phone: '01098765432', status: 'inactive', gpa: 2.91, studyYear: '4', courses: [] },
  { id: '2024005', name: 'Layla Mohamed', department: 'Computer Science',       email: 'layla.m@uni.edu',      phone: '01187654321', status: 'active',   gpa: 3.55, studyYear: '1', courses: [] },
  { id: '2024006', name: 'Karim Ibrahim', department: 'Information Systems',    email: 'karim.i@uni.edu',      phone: '01276543210', status: 'active',   gpa: 3.22, studyYear: '3', courses: [] },
]

const INITIAL_DOCTORS = [
  { id: 'D001', name: 'Dr. Hassan Ali',  department: 'Computer Science',    email: 'hassan.ali@uni.edu',   phone: '01011112222', academicPosition: 'Professor',        officeHours: 'Sun & Tue 10:00–12:00', status: 'active' },
  { id: 'D002', name: 'Dr. Sara Khalil', department: 'Mathematics',         email: 'sara.khalil@uni.edu',  phone: '01122223333', academicPosition: 'Associate Professor',officeHours: 'Mon & Wed 09:00–11:00', status: 'active' },
  { id: 'D003', name: 'Dr. Omar Nasser', department: 'Physics',             email: 'omar.nasser@uni.edu',  phone: '01233334444', academicPosition: 'Assistant Professor',officeHours: 'Tue & Thu 13:00–15:00', status: 'active' },
  { id: 'D004', name: 'Dr. Mona Fares',  department: 'Engineering',         email: 'mona.fares@uni.edu',   phone: '01044445555', academicPosition: 'Lecturer',          officeHours: 'Wed 10:00–13:00',       status: 'inactive' },
]

const INITIAL_SUBJECTS = [
  { code: 'CS101',   name: 'Algorithms',       doctor: 'Dr. Hassan Ali',  department: 'Computer Science', credits: 3 },
  { code: 'CS201',   name: 'Data Structures',  doctor: 'Dr. Hassan Ali',  department: 'Computer Science', credits: 3 },
  { code: 'MATH203', name: 'Calculus II',       doctor: 'Dr. Sara Khalil', department: 'Mathematics',      credits: 4 },
  { code: 'PHY101',  name: 'Physics I',         doctor: 'Dr. Omar Nasser', department: 'Physics',          credits: 3 },
  { code: 'ENG102',  name: 'Technical English', doctor: 'Dr. Mona Fares',  department: 'Engineering',      credits: 2 },
]

const INITIAL_ENROLLMENTS = {
  CS101:   ['2024001', '2024002', '2024003', '2024004', '2024005', '2024006'],
  CS201:   ['2024001', '2024005', '2024003'],
  MATH203: ['2024002', '2024006', '2024001'],
  PHY101:  ['2024003', '2024004'],
  ENG102:  ['2024004', '2024002'],
}

const dataSlice = (set, get) => ({
  students: INITIAL_STUDENTS,
  doctors:  INITIAL_DOCTORS,
  subjects: INITIAL_SUBJECTS,
  subjectEnrollments: INITIAL_ENROLLMENTS,

  // ── Students ──────────────────────────────────────
  addStudent: (student) => {
    const id = '2024' + String(get().students.length + 1).padStart(3, '0')
    set((s) => ({
      students: [...s.students, {
        ...student,
        id,
        gpa: student.gpa !== '' && student.gpa != null ? Number(student.gpa) : 0,
        studyYear: student.studyYear || '1',
        phone: student.phone || '',
        courses: student.courses || [],
      }],
    }))
  },
  updateStudent: (id, data) =>
    set((s) => ({ students: s.students.map((st) => (st.id === id ? { ...st, ...data } : st)) })),
  deleteStudent: (id) =>
    set((s) => ({
      students: s.students.filter((st) => st.id !== id),
      subjectEnrollments: Object.fromEntries(
        Object.entries(s.subjectEnrollments).map(([code, ids]) => [code, ids.filter((sid) => sid !== id)])
      ),
    })),

  // ── Doctors ───────────────────────────────────────
  addDoctor: (doctor) => {
    const newDoctor = {
      ...doctor,
      id: 'D' + String(get().doctors.length + 1).padStart(3, '0'),
      status: doctor.status || 'active',
      phone: doctor.phone || '',
      academicPosition: doctor.academicPosition || 'Lecturer',
      officeHours: doctor.officeHours || '',
    }
    set((s) => ({ doctors: [...s.doctors, newDoctor] }))
  },
  updateDoctor: (id, data) =>
    set((s) => ({ doctors: s.doctors.map((d) => (d.id === id ? { ...d, ...data } : d)) })),
  deleteDoctor: (id) =>
    set((s) => ({ doctors: s.doctors.filter((d) => d.id !== id) })),

  // ── Subjects ──────────────────────────────────────
  addSubject: (subject) =>
    set((s) => ({
      subjects: [...s.subjects, subject],
      subjectEnrollments: { ...s.subjectEnrollments, [subject.code]: [] },
    })),
  updateSubject: (code, data) =>
    set((s) => {
      const updatedSubjects = s.subjects.map((sub) =>
        sub.code === code ? { ...sub, ...data } : sub
      )
      let updatedEnrollments = s.subjectEnrollments
      if (data.code && data.code !== code) {
        updatedEnrollments = {
          ...s.subjectEnrollments,
          [data.code]: s.subjectEnrollments[code] || [],
        }
        const { [code]: _, ...rest } = updatedEnrollments
        updatedEnrollments = rest
      }
      return { subjects: updatedSubjects, subjectEnrollments: updatedEnrollments }
    }),
  deleteSubject: (code) =>
    set((s) => {
      const { [code]: _, ...rest } = s.subjectEnrollments
      return { subjects: s.subjects.filter((sub) => sub.code !== code), subjectEnrollments: rest }
    }),

  // ── Enrollments ───────────────────────────────────
  enrollStudentInSubject: (subjectCode, studentId) =>
    set((s) => {
      const cur = s.subjectEnrollments[subjectCode] || []
      if (cur.includes(studentId)) return s
      return { subjectEnrollments: { ...s.subjectEnrollments, [subjectCode]: [...cur, studentId] } }
    }),
  unenrollStudentFromSubject: (subjectCode, studentId) =>
    set((s) => ({
      subjectEnrollments: {
        ...s.subjectEnrollments,
        [subjectCode]: (s.subjectEnrollments[subjectCode] || []).filter((id) => id !== studentId),
      },
    })),
  getEnrolledStudentIds: (subjectCode) => get().subjectEnrollments[subjectCode] || [],
})

export const useDataStore = create(
  persist(dataSlice, {
    name: 'uni-data-v2',
    partialize: (state) => ({
      students: state.students,
      doctors: state.doctors,
      subjects: state.subjects,
      subjectEnrollments: state.subjectEnrollments,
    }),
  })
)
