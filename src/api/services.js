import api from './axiosInstance'

/**
 * طبقة استدعاء الـ API (جاهزة للربط مع الخادم). الواجهة الحالية تستخدم Zustand محليًا.
 */

// ── أعضاء هيئة التدريس ───────────────────────────
export const doctorsApi = {
  getAll: () => api.get('/doctors'),
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
}

// ── المقررات ─────────────────────────────────────
export const subjectsApi = {
  getAll: () => api.get('/subjects'),
  getById: (code) => api.get(`/subjects/${code}`),
  create: (data) => api.post('/subjects', data),
  update: (code, data) => api.put(`/subjects/${code}`, data),
  delete: (code) => api.delete(`/subjects/${code}`),
}

// ── الحضور (بدون تصدير CSV) ──────────────────────
export const attendanceApi = {
  getSession: (subject, date) => api.get('/attendance', { params: { subject, date } }),
  mark: (data) => api.post('/attendance/mark', data),
  markManual: (data) => api.post('/attendance/manual', data),
}

// ── المصادقة ─────────────────────────────────────
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}
