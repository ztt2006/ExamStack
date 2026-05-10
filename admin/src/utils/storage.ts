import type { User } from '@/types'

const AUTH_STORAGE_KEY = 'examstack-admin-session'

interface AuthSnapshot {
  token: string | null
  user: User | null
}

const emptySnapshot: AuthSnapshot = {
  token: null,
  user: null,
}

function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function readAuthSnapshot(): AuthSnapshot {
  if (!hasStorage()) {
    return emptySnapshot
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) {
      return emptySnapshot
    }
    const parsed = JSON.parse(raw) as Partial<AuthSnapshot>
    return {
      token: parsed.token ?? null,
      user: parsed.user ?? null,
    }
  } catch {
    return emptySnapshot
  }
}

export function writeAuthSnapshot(snapshot: AuthSnapshot) {
  if (!hasStorage()) {
    return
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(snapshot))
}

export function clearAuthSnapshot() {
  if (!hasStorage()) {
    return
  }
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}
