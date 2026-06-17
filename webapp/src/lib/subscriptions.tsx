import * as React from "react"

type Kind = "prospect" | "account"

interface SubscriptionsState {
  prospects: Set<string>
  accounts: Set<string>
  isSubscribed: (kind: Kind, id: string) => boolean
  toggle: (kind: Kind, id: string) => boolean // returns the new state
  count: number
}

const SubscriptionsContext = React.createContext<SubscriptionsState | undefined>(
  undefined
)

// A couple of prospects are tracked by default so the feature is discoverable.
const SEED_PROSPECTS = ["p_1", "p_9"]

export function SubscriptionsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [prospects, setProspects] = React.useState<Set<string>>(
    () => new Set(SEED_PROSPECTS)
  )
  const [accounts, setAccounts] = React.useState<Set<string>>(
    () => new Set()
  )

  const toggle = React.useCallback((kind: Kind, id: string): boolean => {
    const setter = kind === "prospect" ? setProspects : setAccounts
    let next = false
    setter((prev) => {
      const copy = new Set(prev)
      if (copy.has(id)) {
        copy.delete(id)
        next = false
      } else {
        copy.add(id)
        next = true
      }
      return copy
    })
    return next
  }, [])

  const value = React.useMemo<SubscriptionsState>(
    () => ({
      prospects,
      accounts,
      isSubscribed: (kind, id) =>
        kind === "prospect" ? prospects.has(id) : accounts.has(id),
      toggle,
      count: prospects.size + accounts.size,
    }),
    [prospects, accounts, toggle]
  )

  return (
    <SubscriptionsContext.Provider value={value}>
      {children}
    </SubscriptionsContext.Provider>
  )
}

export function useSubscriptions() {
  const ctx = React.useContext(SubscriptionsContext)
  if (!ctx)
    throw new Error(
      "useSubscriptions must be used within a SubscriptionsProvider"
    )
  return ctx
}
