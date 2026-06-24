import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MOCK_ADMIN = {
  id: 1,
  name: 'Admin User',
  email: 'admin@university.edu',
  role: 'admin',
  avatar: 'AD',
}

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (email) => {
        if (!email) return { success: false }
        set({ user: { ...MOCK_ADMIN, email }, isAuthenticated: true })
        return { success: true }
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'uni-auth' }
  )
)
