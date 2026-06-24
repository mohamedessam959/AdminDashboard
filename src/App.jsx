import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import MainLayout from './components/layout/MainLayout'
import LoginPage from './pages/Login/LoginPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import StudentsPage from './pages/Students/StudentsPage'
import DoctorsPage from './pages/Doctors/DoctorsPage'
import DoctorProfilePage from './pages/Doctors/DoctorProfilePage'
import SubjectsPage from './pages/Subjects/SubjectsPage'
import AttendancePage from './pages/Attendance/AttendancePage'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"      element={<DashboardPage />} />
        <Route path="students"       element={<StudentsPage />} />
        <Route path="doctors"        element={<DoctorsPage />} />
        <Route path="doctors/:id"    element={<DoctorProfilePage />} />
        <Route path="subjects"       element={<SubjectsPage />} />
        <Route path="attendance"     element={<AttendancePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
