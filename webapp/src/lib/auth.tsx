import * as React from "react"

import { currentUser } from "@/lib/mock-data"
import type { CurrentUser } from "@/lib/types"

interface AuthState {
  user: CurrentUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  loginWithDemo: () => void
  logout: () => void
  updateProfile: (patch: Partial<CurrentUser>) => void
}

const AuthContext = React.createContext<AuthState | undefined>(undefined)

const STORAGE_KEY = "kombo-auth"

// Persist the full user so profile edits (name, photo, …) survive reloads.
// Older sessions stored just "1" — treat that as the default user.
function loadUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    if (raw === "1") return currentUser
    return { ...currentUser, ...(JSON.parse(raw) as Partial<CurrentUser>) }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<CurrentUser | null>(loadUser)

  const persist = React.useCallback((next: CurrentUser | null) => {
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore quota errors (large data URLs) */
    }
    setUser(next)
  }, [])

  const value = React.useMemo<AuthState>(
    () => ({
      user,
      isAuthenticated: user !== null,
      // Mock auth — any credentials succeed in the prototype.
      login: async (email) => {
        await new Promise((r) => setTimeout(r, 500))
        persist({ ...currentUser, email: email || currentUser.email })
      },
      signup: async (name, email) => {
        await new Promise((r) => setTimeout(r, 600))
        persist({
          ...currentUser,
          name: name || currentUser.name,
          email: email || currentUser.email,
        })
      },
      loginWithDemo: () => persist(currentUser),
      logout: () => persist(null),
      updateProfile: (patch) => persist({ ...(user ?? currentUser), ...patch }),
    }),
    [user, persist]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
