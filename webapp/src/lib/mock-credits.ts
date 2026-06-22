import type { CreditUsage } from "./credits"

// Per-teammate credit consumption this cycle — powers the "By teammate" view.
export interface TeammateUsage {
  id: string
  name: string
  role: string
  avatarColor: string
  reveals: number
  enrichment: number
  exports: number
  ai: number
}

export const teammateUsage: TeammateUsage[] = [
  {
    id: "u_kevin",
    name: "Kevin Hawkins",
    role: "Founder",
    avatarColor: "#7c3aed",
    reveals: 142,
    enrichment: 220,
    exports: 100,
    ai: 35,
  },
  {
    id: "u_ale",
    name: "Ale Romero",
    role: "Co-founder",
    avatarColor: "#0ea5e9",
    reveals: 96,
    enrichment: 144,
    exports: 50,
    ai: 28,
  },
  {
    id: "u_maria",
    name: "María Gómez",
    role: "SDR",
    avatarColor: "#10b981",
    reveals: 188,
    enrichment: 96,
    exports: 0,
    ai: 12,
  },
  {
    id: "u_james",
    name: "James Park",
    role: "Account Executive",
    avatarColor: "#f59e0b",
    reveals: 64,
    enrichment: 48,
    exports: 25,
    ai: 8,
  },
]

export function teammateTotal(t: TeammateUsage): number {
  return t.reveals + t.enrichment + t.exports + t.ai
}

// Build a CSV string from credit-usage rows for the History export action.
export function usageToCsv(rows: CreditUsage[]): string {
  const header = ["Date", "Activity", "Category", "Credits"]
  const lines = rows.map((r) => {
    const date = new Date(r.timestamp).toISOString().slice(0, 10)
    const credits = r.amount < 0 ? `+${-r.amount}` : `-${r.amount}`
    const activity = r.label.replace(/"/g, '""')
    return `"${date}","${activity}","${r.category ?? ""}","${credits}"`
  })
  return [header.join(","), ...lines].join("\n")
}

// Trigger a client-side download of the given text as a file.
export function downloadFile(filename: string, text: string, type = "text/csv"): void {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
