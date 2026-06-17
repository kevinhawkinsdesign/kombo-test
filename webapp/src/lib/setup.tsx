import * as React from "react"

export type SetupTaskId = "crm" | "linkedin" | "team" | "profile" | "links"

export const SETUP_TASKS: SetupTaskId[] = [
  "crm",
  "linkedin",
  "team",
  "profile",
  "links",
]

export interface QuickLink {
  id: string
  label: string
  url: string
}

interface SetupState {
  completed: Set<SetupTaskId>
  isDone: (id: SetupTaskId) => boolean
  complete: (id: SetupTaskId) => void
  toggle: (id: SetupTaskId) => void
  role: string
  goals: string
  setProfile: (role: string, goals: string) => void
  quickLinks: QuickLink[]
  addQuickLink: (label: string, url: string) => void
  removeQuickLink: (id: string) => void
  progress: number // 0-100
  dismissed: boolean
  dismiss: () => void
}

const SetupContext = React.createContext<SetupState | undefined>(undefined)

// CRM starts connected (HubSpot) so the checklist begins partially complete.
const SEED_COMPLETED: SetupTaskId[] = ["crm"]
const SEED_LINKS: QuickLink[] = [
  { id: "ql_1", label: "LinkedIn Sales Navigator", url: "https://www.linkedin.com/sales" },
  { id: "ql_2", label: "HubSpot CRM", url: "https://app.hubspot.com" },
]

export function SetupProvider({ children }: { children: React.ReactNode }) {
  const [completed, setCompleted] = React.useState<Set<SetupTaskId>>(
    () => new Set(SEED_COMPLETED)
  )
  const [role, setRole] = React.useState("VP of Sales")
  const [goals, setGoals] = React.useState("")
  const [quickLinks, setQuickLinks] = React.useState<QuickLink[]>(SEED_LINKS)
  const [dismissed, setDismissed] = React.useState(false)
  const idRef = React.useRef(0)

  const complete = React.useCallback((id: SetupTaskId) => {
    setCompleted((prev) => new Set(prev).add(id))
  }, [])

  const toggle = React.useCallback((id: SetupTaskId) => {
    setCompleted((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const setProfile = React.useCallback((r: string, g: string) => {
    setRole(r)
    setGoals(g)
    setCompleted((prev) => new Set(prev).add("profile"))
  }, [])

  const addQuickLink = React.useCallback((label: string, url: string) => {
    idRef.current += 1
    setQuickLinks((prev) => [
      ...prev,
      { id: `ql_new_${idRef.current}`, label, url },
    ])
    setCompleted((prev) => new Set(prev).add("links"))
  }, [])

  const removeQuickLink = React.useCallback((id: string) => {
    setQuickLinks((prev) => prev.filter((l) => l.id !== id))
  }, [])

  const value = React.useMemo<SetupState>(
    () => ({
      completed,
      isDone: (id) => completed.has(id),
      complete,
      toggle,
      role,
      goals,
      setProfile,
      quickLinks,
      addQuickLink,
      removeQuickLink,
      progress: Math.round((completed.size / SETUP_TASKS.length) * 100),
      dismissed,
      dismiss: () => setDismissed(true),
    }),
    [completed, complete, toggle, role, goals, setProfile, quickLinks, addQuickLink, removeQuickLink, dismissed]
  )

  return <SetupContext.Provider value={value}>{children}</SetupContext.Provider>
}

export function useSetup() {
  const ctx = React.useContext(SetupContext)
  if (!ctx) throw new Error("useSetup must be used within a SetupProvider")
  return ctx
}
