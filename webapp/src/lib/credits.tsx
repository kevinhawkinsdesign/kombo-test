import * as React from "react"
import { toast } from "sonner"

interface CreditUsage {
  id: string
  label: string
  amount: number
  timestamp: string
}

interface CreditsState {
  balance: number
  monthlyAllowance: number
  usage: CreditUsage[]
  spend: (amount: number, label: string) => boolean
}

const INITIAL_USAGE: CreditUsage[] = [
  { id: "cu_1", label: "Email reveal · Aisha Khan", amount: 1, timestamp: "2026-06-16T14:00:00Z" },
  { id: "cu_2", label: "Bulk enrich · Q3 Enterprise (24)", amount: 24, timestamp: "2026-06-16T10:30:00Z" },
  { id: "cu_3", label: "Phone reveal · Grace Liu", amount: 2, timestamp: "2026-06-15T16:10:00Z" },
  { id: "cu_4", label: "Prospect search export (50)", amount: 50, timestamp: "2026-06-15T09:00:00Z" },
  { id: "cu_5", label: "Email reveal · Sarah Chen", amount: 1, timestamp: "2026-06-14T11:20:00Z" },
]

const CreditsContext = React.createContext<CreditsState | undefined>(undefined)

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const monthlyAllowance = 2000
  const [balance, setBalance] = React.useState(1240)
  const [usage, setUsage] = React.useState<CreditUsage[]>(INITIAL_USAGE)
  const idRef = React.useRef(0)

  const spend = React.useCallback(
    (amount: number, label: string): boolean => {
      let ok = true
      setBalance((b) => {
        if (b < amount) {
          ok = false
          return b
        }
        return b - amount
      })
      if (!ok) {
        toast.error("Not enough credits — top up to continue.")
        return false
      }
      idRef.current += 1
      setUsage((u) => [
        {
          id: `cu_new_${idRef.current}`,
          label,
          amount,
          timestamp: new Date().toISOString(),
        },
        ...u,
      ])
      return true
    },
    []
  )

  const value = React.useMemo(
    () => ({ balance, monthlyAllowance, usage, spend }),
    [balance, monthlyAllowance, usage, spend]
  )

  return (
    <CreditsContext.Provider value={value}>{children}</CreditsContext.Provider>
  )
}

export function useCredits() {
  const ctx = React.useContext(CreditsContext)
  if (!ctx) throw new Error("useCredits must be used within a CreditsProvider")
  return ctx
}
