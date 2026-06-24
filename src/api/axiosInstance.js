import axios from 'axios'

// غيّر الـ baseURL لما يجي الـ backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// بيحط الـ token تلقائياً في كل request
api.interceptors.request.use((config) => {
  const stored = JSON.parse(localStorage.getItem('uni-auth') || '{}')
  const token = stored?.state?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// معالجة الـ errors بشكل موحد
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('uni-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
