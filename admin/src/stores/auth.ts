import { defineStore } from 'pinia'

import { getCurrentUser } from '@/api/auth'
import type { User } from '@/types'
import { clearAuthSnapshot, readAuthSnapshot, writeAuthSnapshot } from '@/utils/storage'

interface AuthState {
  token: string | null
  user: User | null
  bootstrapped: boolean
}

const snapshot = readAuthSnapshot()

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: snapshot.token,
    user: snapshot.user,
    bootstrapped: false,
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    displayName: (state) => state.user?.username || '管理员',
  },
  actions: {
    setSession(token: string, user: User) {
      this.token = token
      this.user = user
      writeAuthSnapshot({ token, user })
    },
    setUser(user: User) {
      this.user = user
      writeAuthSnapshot({ token: this.token, user })
    },
    async bootstrap() {
      if (!this.token) {
        this.bootstrapped = true
        return
      }
      try {
        const user = await getCurrentUser()
        this.setUser(user)
      } catch {
        this.logout()
      } finally {
        this.bootstrapped = true
      }
    },
    logout() {
      this.token = null
      this.user = null
      this.bootstrapped = true
      clearAuthSnapshot()
    },
  },
})
