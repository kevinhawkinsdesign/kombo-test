import * as React from "react"
import { toast } from "sonner"

// Broad buckets a credit charge falls into — drives the "usage by type" view.
export type CreditCategory =
  | "email"
  | "phone"
  | "enrichment"
  | "export"
  | "ai"
  | "topup"

export interface CreditUsage {
  id: string
  label: string
  amount: number
  timestamp: string
  category?: CreditCategory
}

interface CreditsState {
  balance: number
  monthlyAllowance: number
  resetsAt: string
  usage: CreditUsage[]
  spend: (amount: number, label: string, category?: CreditCategory) => boolean
  topUp: (amount: number, label?: string) => void
}

const RESETS_AT = "2026-07-01T00:00:00Z"

const INITIAL_USAGE: CreditUsage[] = [
  { id: "cu_1", label: "Email reveal · Aisha Khan", amount: 1, timestamp: "2026-06-16T14:00:00Z", category: "email" },
  { id: "cu_2", label: "Bulk enrich · Q3 Enterprise (24)", amount: 48, timestamp: "2026-06-16T10:30:00Z", category: "enrichment" },
  { id: "cu_3", label: "Phone reveal · Grace Liu", amount: 2, timestamp: "2026-06-15T16:10:00Z", category: "phone" },
  { id: "cu_4", label: "Find Prospects export (50)", amount: 50, timestamp: "2026-06-15T09:00:00Z", category: "export" },
  { id: "cu_5", label: "AI lookalike search · Vicio", amount: 5, timestamp: "2026-06-14T15:40:00Z", category: "ai" },
  { id: "cu_6", label: "Email reveal · Sarah Chen", amount: 1, timestamp: "2026-06-14T11:20:00Z", category: "email" },
  { id: "cu_7", label: "Bulk enrich · RevOps Champions (18)", amount: 36, timestamp: "2026-06-13T13:05:00Z", category: "enrichment" },
  { id: "cu_8", label: "Phone reveal · Marcus Riley", amount: 2, timestamp: "2026-06-12T10:00:00Z", category: "phone" },
]

// Keyword fallback so charges logged without an explicit category still slot
// into the right bucket for the usage breakdown.
function inferCategory(label: string): CreditCategory {
  const l = label.toLowerCase()
  if (l.includes("phone") || l.includes("dial")) return "phone"
  if (l.includes("enrich")) return "enrichment"
  if (l.includes("export")) return "export"
  if (l.includes("search") || l.includes("ai ")) return "ai"
  return "email"
}

const CreditsContext = React.createContext<CreditsState | undefined>(undefined)

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const monthlyAllowance = 2000
  const [balance, setBalance] = React.useState(1240)
  const [usage, setUsage] = React.useState<CreditUsage[]>(INITIAL_USAGE)
  const idRef = React.useRef(0)

  const spend = React.useCallback(
    (amount: number, label: string, category?: CreditCategory): boolean => {
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
          category: category ?? inferCategory(label),
        },
        ...u,
      ])
      return true
    },
    []
  )

  const topUp = React.useCallback((amount: number, label = "Credit top-up") => {
    setBalance((b) => b + amount)
    idRef.current += 1
    setUsage((u) => [
      {
        id: `cu_topup_${idRef.current}`,
        label,
        amount: -amount, // negative amount = credit added
        timestamp: new Date().toISOString(),
        category: "topup",
      },
      ...u,
    ])
  }, [])

  const value = React.useMemo(
    () => ({
      balance,
      monthlyAllowance,
      resetsAt: RESETS_AT,
      usage,
      spend,
      topUp,
    }),
    [balance, monthlyAllowance, usage, spend, topUp]
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
