import { create } from 'zustand'
import { User } from './auth.store'

/**
 * User Store
 * Reserved for future use - separate user state management if needed
 * Currently, user is managed in authStore
 * 
 * TODO: Remove if not needed, or implement if separate user state is required
 */
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


