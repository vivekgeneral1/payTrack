import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  userId: string | null
  email: string | null
  fullName: string | null
  setSession: (session: { accessToken: string; refreshToken: string; userId: string; email: string; fullName: string }) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      email: null,
      fullName: null,
      setSession: (session) =>
        set({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          userId: session.userId,
          email: session.email,
          fullName: session.fullName,
        }),
      clear: () => set({ accessToken: null, refreshToken: null, userId: null, email: null, fullName: null }),
    }),
    { name: 'paytrack-auth' },
  ),
)
