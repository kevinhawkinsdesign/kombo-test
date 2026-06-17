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
}

const AuthContext = React.createContext<AuthState | undefined>(undefined)

const STORAGE_KEY = "kombo-auth"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<CurrentUser | null>(() => {
    return localStorage.getItem(STORAGE_KEY) ? currentUser : null
  })

  const persist = React.useCallback((next: CurrentUser | null) => {
    if (next) localStorage.setItem(STORAGE_KEY, "1")
    else localStorage.removeItem(STORAGE_KEY)
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
