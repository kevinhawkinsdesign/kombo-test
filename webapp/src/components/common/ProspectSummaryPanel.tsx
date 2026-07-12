import * as React from "react"
import { toast } from "sonner"
import {
  Briefcase,
  Brain,
  Building2,
  Cake,
  DollarSign,
  Globe,
  Grid2x2,
  MapPin,
  Pencil,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProspectAvatar, ScoreBadge, StatusBadge } from "@/components/common/ProspectBits"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { generateProspectSummary } from "@/lib/mock-ai-summary"
import { cn } from "@/lib/utils"
import type { Locale } from "@/lib/locale"
import type { Prospect } from "@/lib/types"

const COPY = {
  en: {
    aiSummary: "AI Summary",
    regenerate: "Regenerate",
    customize: "Customize",
    customizeTitle: "Customize AI summary",
    customizeDescription: "Tell Kai what the summary should focus on.",
    customizeLabel: "Focus on",
    customizePlaceholder: "e.g. budget authority, best opening angle…",
    cancel: "Cancel",
    apply: "Apply",
    regenerated: "Summary regenerated",
    prospectDetails: "Prospect",
    ageRange: "Age range",
    personality: "Personality",
    location: "Location",
    linkedin: "LinkedIn",
    firmographics: "Company details",
    seniority: "Seniority",
    department: "Department",
    industry: "Industry",
    headcount: "Employees",
    revenue: "Revenue",
    companyLocation: "Location",
    website: "Website",
    companyLinkedin: "LinkedIn",
  },
  es: {
    aiSummary: "Resumen con IA",
    regenerate: "Regenerar",
    customize: "Personalizar",
    customizeTitle: "Personalizar resumen con IA",
    customizeDescription: "Dile a Kai en qué debe enfocarse el resumen.",
    customizeLabel: "Enfocarse en",
    customizePlaceholder: "p. ej. autoridad de presupuesto, mejor ángulo de apertura…",
    cancel: "Cancelar",
    apply: "Aplicar",
    regenerated: "Resumen regenerado",
    prospectDetails: "Prospecto",
    ageRange: "Rango de edad",
    personality: "Personalidad",
    location: "Ubicación",
    linkedin: "LinkedIn",
    firmographics: "Datos de la empresa",
    seniority: "Antigüedad",
    department: "Departamento",
    industry: "Industria",
    headcount: "Empleados",
    revenue: "Ingresos",
    companyLocation: "Ubicación",
    website: "Sitio web",
    companyLinkedin: "LinkedIn",
  },
} as const

type Disc = NonNullable<Prospect["personalityType"]>

const DISC_LABELS: Record<Locale, Record<Disc, string>> = {
  en: { D: "Driver", I: "Influencer", S: "Steady", C: "Analytical" },
  es: { D: "Dominante", I: "Influyente", S: "Estable", C: "Analítico" },
}

// Reuses the app's neutral data-viz palette rather than raw red/yellow/green/
// blue — keeps this off the `destructive` token, which already means "error"
// elsewhere (bounced counts, not_interested status).
const DISC_CLASSES: Record<Disc, string> = {
  D: "bg-chart-5/15 text-chart-5",
  I: "bg-chart-4/15 text-chart-4",
  S: "bg-chart-1/15 text-chart-1",
  C: "bg-chart-3/15 text-chart-3",
}

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, "")
}

function Field({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  href?: string
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-primary block truncate font-medium hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="truncate font-medium">{value}</p>
        )}
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
  const [summary, setSummary] = React.useState(() => generateProspectSummary(prospect))
  const [customizeOpen, setCustomizeOpen] = React.useState(false)
  const [instructions, setInstructions] = React.useState("")

  // A fresh contextual summary whenever the open thread's prospect changes.
  const [shownId, setShownId] = React.useState(prospect.id)
  if (prospect.id !== shownId) {
    setShownId(prospect.id)
    setSummary(generateProspectSummary(prospect))
  }

  // Reset on open (house pattern — render-time check, never an effect).
  const [wasOpen, setWasOpen] = React.useState(customizeOpen)
  if (customizeOpen !== wasOpen) {
    setWasOpen(customizeOpen)
    if (customizeOpen) setInstructions("")
  }

  function regenerate() {
    setSummary(generateProspectSummary(prospect))
    toast.success(c.regenerated)
  }

  function applyCustomize() {
    setSummary(generateProspectSummary(prospect, instructions))
    setCustomizeOpen(false)
    toast.success(c.regenerated)
  }

  const disc = prospect.personalityType
  const website = `https://${prospect.companyDomain}`

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

      <div className="bg-primary/[0.03] space-y-2 rounded-lg border p-3">
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="text-primary size-3.5" />
          {c.aiSummary}
        </p>
        <p className="text-xs leading-snug">{summary}</p>
        <div className="flex gap-1.5 pt-1">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={regenerate}>
            <RefreshCw className="size-3.5" />
            {c.regenerate}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setCustomizeOpen(true)}
          >
            <Pencil className="size-3.5" />
            {c.customize}
          </Button>
        </div>
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
          {c.prospectDetails}
        </p>
        {prospect.ageRange && (
          <Field icon={Cake} label={c.ageRange} value={prospect.ageRange} />
        )}
        {disc && (
          <div className="flex items-start gap-2 text-sm">
            <Brain className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">{c.personality}</p>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold",
                  DISC_CLASSES[disc]
                )}
              >
                <span className="bg-current size-1.5 rounded-full opacity-80" />
                {DISC_LABELS[locale][disc]}
              </span>
            </div>
          </div>
        )}
        <Field icon={MapPin} label={c.location} value={prospect.location} />
        <Field
          icon={LinkedinIcon}
          label={c.linkedin}
          value={stripProtocol(prospect.linkedinUrl)}
          href={prospect.linkedinUrl}
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          {c.firmographics}
        </p>
        <Field icon={Briefcase} label={c.seniority} value={prospect.seniority} />
        <Field icon={Grid2x2} label={c.department} value={prospect.department} />
        <Field icon={Building2} label={c.industry} value={prospect.industry} />
        <Field icon={Users} label={c.headcount} value={prospect.headcount} />
        <Field icon={DollarSign} label={c.revenue} value={prospect.revenue} />
        {prospect.companyLocation && (
          <Field icon={MapPin} label={c.companyLocation} value={prospect.companyLocation} />
        )}
        <Field icon={Globe} label={c.website} value={prospect.companyDomain} href={website} />
        {prospect.companyLinkedinUrl && (
          <Field
            icon={LinkedinIcon}
            label={c.companyLinkedin}
            value={stripProtocol(prospect.companyLinkedinUrl)}
            href={prospect.companyLinkedinUrl}
          />
        )}
      </div>

      <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{c.customizeTitle}</DialogTitle>
            <DialogDescription>{c.customizeDescription}</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="summary-instructions">{c.customizeLabel}</Label>
            <Textarea
              id="summary-instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={c.customizePlaceholder}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCustomizeOpen(false)}>
              {c.cancel}
            </Button>
            <Button variant="volt" onClick={applyCustomize}>
              {c.apply}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
