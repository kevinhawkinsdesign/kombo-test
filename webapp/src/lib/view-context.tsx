import * as React from "react"

import {
  getRep,
  getTeam,
  type TeamMember,
  type SalesTeam,
  type ViewScope,
} from "@/lib/team"

interface ViewState {
  scope: ViewScope
  // Rep impersonation (kind === "rep")
  impersonatingId: string | null
  impersonating: TeamMember | null
  isImpersonating: boolean
  // Team / client scope (kind === "team")
  viewTeamId: string | null
  viewTeam: SalesTeam | null
  // Actions
  impersonate: (repId: string) => void
  viewAsTeam: (teamId: string) => void
  exitImpersonation: () => void // reset to the whole org
}

const ViewContext = React.createContext<ViewState | undefined>(undefined)

export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [scope, setScope] = React.useState<ViewScope>({ kind: "org" })

  const value = React.useMemo<ViewState>(() => {
    const rep =
      scope.kind === "rep" ? (getRep(scope.id) ?? null) : null
    const team =
      scope.kind === "team" ? (getTeam(scope.id) ?? null) : null
    return {
      scope,
      impersonatingId: rep ? rep.id : null,
      impersonating: rep,
      isImpersonating: rep !== null,
      viewTeamId: team ? team.id : null,
      viewTeam: team,
      impersonate: (repId: string) => setScope({ kind: "rep", id: repId }),
      viewAsTeam: (teamId: string) => setScope({ kind: "team", id: teamId }),
      exitImpersonation: () => setScope({ kind: "org" }),
    }
  }, [scope])

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>
}

export function useView() {
  const ctx = React.useContext(ViewContext)
  if (!ctx) throw new Error("useView must be used within a ViewProvider")
  return ctx
}
