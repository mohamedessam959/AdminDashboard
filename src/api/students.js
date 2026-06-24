import api from './axiosInstance'

// كل الـ functions دي جاهزة للـ backend
// دلوقتي بيشتغل بـ mock data من الـ store

export const studentsApi = {
  getAll: ()            => api.get('/students'),
  getById: (id)         => api.get(`/students/${id}`),
  create: (data)        => api.post('/students', data),
  update: (id, data)    => api.put(`/students/${id}`, data),
  delete: (id)          => api.delete(`/students/${id}`),
  getAttendance: (id)   => api.get(`/students/${id}/attendance`),
}
