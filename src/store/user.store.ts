import { create } from 'zustand'
import { User } from './auth.store'

interface UserState {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  clearUser: () => void
}

export const userStore = create<UserState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  clearUser: () => set({ currentUser: null }),
}))


