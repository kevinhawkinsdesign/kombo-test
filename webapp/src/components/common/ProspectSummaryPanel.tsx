import { Briefcase, Building2, DollarSign, Grid2x2, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ProspectAvatar, ScoreBadge, StatusBadge } from "@/components/common/ProspectBits"
import type { Locale } from "@/lib/locale"
import type { Prospect } from "@/lib/types"

const COPY = {
  en: {
    firmographics: "Company details",
    seniority: "Seniority",
    department: "Department",
    industry: "Industry",
    headcount: "Employees",
    revenue: "Revenue",
  },
  es: {
    firmographics: "Datos de la empresa",
    seniority: "Antigüedad",
    department: "Departamento",
    industry: "Industria",
    headcount: "Empleados",
    revenue: "Ingresos",
  },
} as const

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="truncate font-medium">{value}</p>
      </div>
    </div>
  )
}

/**
 * Collapsible context card for a prospect (and, since Prospect has no
 * separate Account record, their company via its own firmographic fields).
 * Used by Inbox's thread view — not a replacement for ProspectProfile.tsx.
 */
export function ProspectSummaryPanel({
  prospect,
  locale,
}: {
  prospect: Prospect
  locale: Locale
}) {
  const c = COPY[locale]
  return (
    <div className="space-y-5 p-4">
      <div className="space-y-2">
        <ProspectAvatar prospect={prospect} className="size-14 text-base" />
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-semibold">
              {prospect.firstName} {prospect.lastName}
            </p>
            <ScoreBadge score={prospect.score} />
          </div>
          <p className="text-muted-foreground text-sm">
            {prospect.title} · {prospect.company}
          </p>
        </div>
        <StatusBadge status={prospect.status} />
      </div>

      {prospect.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {prospect.tags.map((t) => (
            <Badge key={t} variant="secondary" className="font-normal">
              {t}
            </Badge>
          ))}
        </div>
      )}

      <div className="space-y-3 border-t pt-4">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          {c.firmographics}
        </p>
        <Field icon={Briefcase} label={c.seniority} value={prospect.seniority} />
        <Field icon={Grid2x2} label={c.department} value={prospect.department} />
        <Field icon={Building2} label={c.industry} value={prospect.industry} />
        <Field icon={Users} label={c.headcount} value={prospect.headcount} />
        <Field icon={DollarSign} label={c.revenue} value={prospect.revenue} />
      </div>
    </div>
  )
}
