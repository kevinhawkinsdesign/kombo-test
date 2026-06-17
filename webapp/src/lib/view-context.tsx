import * as React from "react"

import { getRep, type TeamMember } from "@/lib/team"

interface ViewState {
  /** Rep being impersonated, or null when viewing as the leader / whole team. */
  impersonatingId: string | null
  impersonating: TeamMember | null
  isImpersonating: boolean
  impersonate: (repId: string) => void
  exitImpersonation: () => void
}

const ViewContext = React.createContext<ViewState | undefined>(undefined)

export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [impersonatingId, setImpersonatingId] = React.useState<string | null>(
    null
  )

  const value = React.useMemo<ViewState>(() => {
    const impersonating = impersonatingId ? getRep(impersonatingId) ?? null : null
    return {
      impersonatingId: impersonating ? impersonatingId : null,
      impersonating,
      isImpersonating: impersonating !== null,
      impersonate: (repId: string) => setImpersonatingId(repId),
      exitImpersonation: () => setImpersonatingId(null),
    }
  }, [impersonatingId])

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>
}

export function useView() {
  const ctx = React.useContext(ViewContext)
  if (!ctx) throw new Error("useView must be used within a ViewProvider")
  return ctx
}
