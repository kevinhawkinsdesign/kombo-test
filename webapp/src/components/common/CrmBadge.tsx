import { Building2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { Locale } from "@/lib/locale"

const COPY: Record<Locale, { inCrm: string }> = {
  en: { inCrm: "In CRM" },
  es: { inCrm: "En el CRM" },
  it: { inCrm: "Nel CRM" },
  fr: { inCrm: "Dans le CRM" },
  de: { inCrm: "Im CRM" },
  pt: { inCrm: "No CRM" },
  pt_BR: { inCrm: "No CRM" },
}

// Shared "already synced to the connected CRM" badge — a plain "—" when not
// yet synced, a small badge otherwise. Originally search-result-columns.tsx's
// own private CrmBadge; pulled into its own file so it can be reused (Inbox's
// ProspectSummaryPanel) without also exporting it there, which would make
// that already-mixed-exports file trip react-refresh/only-export-components
// a 6th time.
export function CrmBadge({ inCrm, locale }: { inCrm: boolean; locale: Locale }) {
  const c = COPY[locale]
  if (!inCrm) return <span className="text-muted-foreground text-xs">—</span>
  return (
    <Badge variant="secondary" className="inline-flex items-center gap-1 font-normal">
      <Building2 className="size-3" />
      {c.inCrm}
    </Badge>
  )
}
