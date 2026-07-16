import * as React from "react"
import { toast } from "sonner"
import { CheckCircle2, CircleDashed, X, Lock, Building2 } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScoreBadge } from "@/components/common/ProspectBits"
import { TruncatedText } from "@/components/common/TruncatedText"
import type { ColumnDef, ColGroup } from "@/lib/table-columns"
import { mockLeadEmail, mockLeadPhone, type AiLead, type AiCompany } from "@/lib/mock-ai-search"
import type { Locale } from "@/lib/locale"
import { portraitFor } from "@/lib/avatars"
import { initials } from "@/lib/format"
import { useCredits } from "@/lib/credits"
import { ENRICH_COST } from "@/lib/enrichment"
import { cn } from "@/lib/utils"

// Shared result-table column registries for AI search results (people +
// companies). Used by both the full Search page and the Add-records dialog so
// the two surfaces expose the exact same columns + column picker.

type Loc = Record<Locale, string>
function L(
  en: string,
  es: string,
  it: string,
  fr: string,
  de: string,
  pt: string,
  pt_BR: string
): Loc {
  return { en, es, it, fr, de, pt, pt_BR }
}

export const LEAD_RESULT_GROUPS: ColGroup[] = [
  { id: "identity", label: L("Prospect", "Prospecto", "Prospect", "Prospect", "Prospect", "Prospect", "Prospect") },
  { id: "company", label: L("Company", "Empresa", "Azienda", "Entreprise", "Unternehmen", "Empresa", "Empresa") },
  { id: "engagement", label: L("Engagement", "Interacción", "Coinvolgimento", "Engagement", "Engagement", "Envolvimento", "Engajamento") },
]
export const LEAD_RESULT_DEFAULT_IDS = [
  "fit",
  "company",
  "seniority",
  "department",
  "region",
  "industry",
  "headcount",
  "revenue",
  "email",
  "phone",
  "crm",
  "signals",
]

export const COMPANY_RESULT_GROUPS: ColGroup[] = [
  { id: "company", label: L("Company", "Empresa", "Azienda", "Entreprise", "Unternehmen", "Empresa", "Empresa") },
  { id: "firmographics", label: L("Firmographics", "Firmográficos", "Firmografia", "Firmographie", "Firmografie", "Firmografia", "Firmografia") },
  { id: "signals", label: L("Signals", "Señales", "Segnali", "Signaux", "Signale", "Sinais", "Sinais") },
]
export const COMPANY_RESULT_DEFAULT_IDS = [
  "fit",
  "industry",
  "headcount",
  "region",
  "revenue",
  "roles",
  "crm",
  "signals",
]

function mutedCell(value: React.ReactNode) {
  return <span className="text-muted-foreground text-sm">{value}</span>
}

const REVEAL_COPY: Record<
  Locale,
  {
    missing: string
    noPhone: string
    findEmail: string
    findPhone: string
    emailRevealed: (name: string) => string
    phoneRevealed: (name: string) => string
    mobile: string
    direct: string
    inCrm: string
  }
> = {
  en: {
    missing: "Missing",
    noPhone: "No number",
    findEmail: "Find email",
    findPhone: "Find number",
    emailRevealed: (name) => `Email found for ${name}`,
    phoneRevealed: (name) => `Phone number found for ${name}`,
    mobile: "Mobile",
    direct: "Direct dial",
    inCrm: "In CRM",
  },
  es: {
    missing: "Sin email",
    noPhone: "Sin número",
    findEmail: "Buscar email",
    findPhone: "Buscar número",
    emailRevealed: (name) => `Email encontrado para ${name}`,
    phoneRevealed: (name) => `Número encontrado para ${name}`,
    mobile: "Móvil",
    direct: "Línea directa",
    inCrm: "En el CRM",
  },
  it: {
    missing: "Nessuna email",
    noPhone: "Nessun numero",
    findEmail: "Trova email",
    findPhone: "Trova numero",
    emailRevealed: (name) => `Email trovata per ${name}`,
    phoneRevealed: (name) => `Numero trovato per ${name}`,
    mobile: "Cellulare",
    direct: "Linea diretta",
    inCrm: "Nel CRM",
  },
  fr: {
    missing: "Aucun email",
    noPhone: "Aucun numéro",
    findEmail: "Trouver l'email",
    findPhone: "Trouver le numéro",
    emailRevealed: (name) => `Email trouvé pour ${name}`,
    phoneRevealed: (name) => `Numéro trouvé pour ${name}`,
    mobile: "Mobile",
    direct: "Ligne directe",
    inCrm: "Dans le CRM",
  },
  de: {
    missing: "Keine E-Mail",
    noPhone: "Keine Nummer",
    findEmail: "E-Mail finden",
    findPhone: "Nummer finden",
    emailRevealed: (name) => `E-Mail für ${name} gefunden`,
    phoneRevealed: (name) => `Telefonnummer für ${name} gefunden`,
    mobile: "Mobil",
    direct: "Durchwahl",
    inCrm: "Im CRM",
  },
  pt: {
    missing: "Sem email",
    noPhone: "Sem número",
    findEmail: "Encontrar email",
    findPhone: "Encontrar número",
    emailRevealed: (name) => `Email encontrado para ${name}`,
    phoneRevealed: (name) => `Número encontrado para ${name}`,
    mobile: "Telemóvel",
    direct: "Linha direta",
    inCrm: "No CRM",
  },
  pt_BR: {
    missing: "Sem email",
    noPhone: "Sem número",
    findEmail: "Encontrar email",
    findPhone: "Encontrar número",
    emailRevealed: (name) => `Email encontrado para ${name}`,
    phoneRevealed: (name) => `Número encontrado para ${name}`,
    mobile: "Celular",
    direct: "Linha direta",
    inCrm: "No CRM",
  },
}

function RevealPill({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-primary/30 text-primary hover:bg-primary/10 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap"
    >
      <Lock className="size-3" />
      {label} +
    </button>
  )
}

function EmailCell({ lead, locale }: { lead: AiLead; locale: Locale }) {
  const t = REVEAL_COPY[locale]
  const { spend } = useCredits()
  const [revealed, setRevealed] = React.useState(false)

  if (lead.emailStatus === "missing") {
    return (
      <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
        <X className="size-3.5" />
        {t.missing}
      </span>
    )
  }

  if (revealed) {
    const verified = lead.emailStatus === "verified"
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium",
          verified ? "text-chart-1" : "text-chart-4"
        )}
      >
        {verified ? (
          <CheckCircle2 className="size-3.5 shrink-0" />
        ) : (
          <CircleDashed className="size-3.5 shrink-0" />
        )}
        <TruncatedText label={mockLeadEmail(lead)}>
          <span className="truncate">{mockLeadEmail(lead)}</span>
        </TruncatedText>
      </span>
    )
  }

  return (
    <RevealPill
      label={t.findEmail}
      onClick={() => {
        if (spend(ENRICH_COST.email, `Email reveal · ${lead.firstName} ${lead.lastName}`, "email")) {
          setRevealed(true)
          toast.success(t.emailRevealed(`${lead.firstName} ${lead.lastName}`))
        }
      }}
    />
  )
}

function PhoneCell({ lead, locale }: { lead: AiLead; locale: Locale }) {
  const t = REVEAL_COPY[locale]
  const { spend } = useCredits()
  const [revealed, setRevealed] = React.useState(false)

  if (lead.phoneStatus === "none") {
    return (
      <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
        <X className="size-3.5" />
        {t.noPhone}
      </span>
    )
  }

  if (revealed) {
    return (
      <span className="text-foreground inline-flex items-center gap-1.5 text-xs font-medium">
        <CheckCircle2 className="text-chart-1 size-3.5 shrink-0" />
        <TruncatedText label={mockLeadPhone(lead)}>
          <span className="truncate">{mockLeadPhone(lead)}</span>
        </TruncatedText>
        <span className="text-muted-foreground font-normal">
          · {lead.phoneStatus === "mobile" ? t.mobile : t.direct}
        </span>
      </span>
    )
  }

  return (
    <RevealPill
      label={t.findPhone}
      onClick={() => {
        if (spend(ENRICH_COST.phone, `Phone reveal · ${lead.firstName} ${lead.lastName}`, "phone")) {
          setRevealed(true)
          toast.success(t.phoneRevealed(`${lead.firstName} ${lead.lastName}`))
        }
      }}
    />
  )
}

function CrmBadge({ inCrm, locale }: { inCrm: boolean; locale: Locale }) {
  const t = REVEAL_COPY[locale]
  if (!inCrm) return <span className="text-muted-foreground text-xs">—</span>
  return (
    <Badge variant="secondary" className="inline-flex items-center gap-1 font-normal">
      <Building2 className="size-3" />
      {t.inCrm}
    </Badge>
  )
}

export const LEAD_RESULT_COLUMNS: ColumnDef<AiLead>[] = [
  {
    id: "prospect",
    group: "identity",
    pinned: true,
    minWidth: "16rem",
    label: L("Prospect", "Prospecto", "Prospect", "Prospect", "Prospect", "Prospect", "Prospect"),
    render: (l) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-8">
          <AvatarImage src={portraitFor(`${l.firstName} ${l.lastName}`)} alt="" />
          <AvatarFallback
            style={{ backgroundColor: l.avatarColor, color: "white" }}
            className="text-xs"
          >
            {initials(l.firstName, l.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <TruncatedText label={`${l.firstName} ${l.lastName}`}>
            <p className="truncate font-medium">
              {l.firstName} {l.lastName}
            </p>
          </TruncatedText>
          <TruncatedText label={l.title}>
            <p className="text-muted-foreground truncate text-xs">{l.title}</p>
          </TruncatedText>
        </div>
      </div>
    ),
  },
  { id: "fit", group: "identity", label: L("Fit", "Encaje", "Idoneità", "Adéquation", "Eignung", "Adequação", "Adequação"), render: (l) => <ScoreBadge score={l.fit} title="AI fit score" /> },
  {
    id: "company",
    group: "company",
    label: L("Company", "Empresa", "Azienda", "Entreprise", "Unternehmen", "Empresa", "Empresa"),
    render: (l) => (
      <div>
        <p className="font-medium">{l.company}</p>
        <p className="text-muted-foreground text-xs">
          {l.industry} · {l.headcount}
        </p>
      </div>
    ),
  },
  { id: "seniority", group: "identity", label: L("Seniority", "Antigüedad", "Anzianità", "Ancienneté", "Senioritätsstufe", "Senioridade", "Senioridade"), render: (l) => mutedCell(l.seniority) },
  { id: "department", group: "identity", label: L("Department", "Departamento", "Reparto", "Département", "Abteilung", "Departamento", "Departamento"), render: (l) => mutedCell(l.department) },
  { id: "region", group: "company", label: L("Region", "Región", "Regione", "Région", "Region", "Região", "Região"), render: (l) => mutedCell(l.region) },
  { id: "industry", group: "company", label: L("Industry", "Sector", "Settore", "Secteur", "Branche", "Setor", "Setor"), render: (l) => mutedCell(l.industry) },
  { id: "headcount", group: "company", label: L("Size", "Tamaño", "Dimensione", "Taille", "Größe", "Dimensão", "Tamanho"), render: (l) => mutedCell(l.headcount) },
  { id: "revenue", group: "company", label: L("Revenue", "Ingresos", "Fatturato", "Chiffre d'affaires", "Umsatz", "Receita", "Receita"), render: (l) => mutedCell(l.revenue) },
  { id: "email", group: "engagement", label: L("Email", "Email", "Email", "E-mail", "E-Mail", "Email", "E-mail"), render: (l, locale) => <EmailCell lead={l} locale={locale} /> },
  { id: "phone", group: "engagement", label: L("Phone", "Teléfono", "Telefono", "Téléphone", "Telefon", "Telefone", "Telefone"), render: (l, locale) => <PhoneCell lead={l} locale={locale} /> },
  { id: "crm", group: "engagement", label: L("CRM", "CRM", "CRM", "CRM", "CRM", "CRM", "CRM"), render: (l, locale) => <CrmBadge inCrm={l.inCrm} locale={locale} /> },
  {
    id: "signals",
    group: "engagement",
    label: L("Signals", "Señales", "Segnali", "Signaux", "Signale", "Sinais", "Sinais"),
    render: (l) => (
      <div className="flex flex-wrap gap-1">
        {l.signals.slice(0, 2).map((s) => (
          <Badge key={s} variant="secondary" className="font-normal">
            {s}
          </Badge>
        ))}
      </div>
    ),
  },
]

export const COMPANY_RESULT_COLUMNS: ColumnDef<AiCompany>[] = [
  {
    id: "company",
    group: "company",
    pinned: true,
    minWidth: "16rem",
    label: L("Company", "Empresa", "Azienda", "Entreprise", "Unternehmen", "Empresa", "Empresa"),
    render: (co) => (
      <div className="flex items-center gap-3">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white"
          style={{ backgroundColor: co.logoColor }}
        >
          {co.name.slice(0, 2)}
        </span>
        <div className="min-w-0">
          <TruncatedText label={co.name}>
            <p className="truncate font-medium">{co.name}</p>
          </TruncatedText>
          <TruncatedText label={co.domain}>
            <p className="text-muted-foreground truncate text-xs">{co.domain}</p>
          </TruncatedText>
        </div>
      </div>
    ),
  },
  { id: "fit", group: "company", label: L("Fit", "Encaje", "Idoneità", "Adéquation", "Eignung", "Adequação", "Adequação"), render: (co) => <ScoreBadge score={co.fit} title="AI fit score" /> },
  { id: "industry", group: "firmographics", label: L("Industry", "Sector", "Settore", "Secteur", "Branche", "Setor", "Setor"), render: (co) => mutedCell(co.industry) },
  { id: "headcount", group: "firmographics", label: L("Size", "Tamaño", "Dimensione", "Taille", "Größe", "Dimensão", "Tamanho"), render: (co) => mutedCell(co.headcount) },
  { id: "region", group: "firmographics", label: L("Region", "Región", "Regione", "Région", "Region", "Região", "Região"), render: (co) => mutedCell(co.region) },
  { id: "revenue", group: "firmographics", label: L("Revenue", "Ingresos", "Fatturato", "Chiffre d'affaires", "Umsatz", "Receita", "Receita"), render: (co) => mutedCell(co.revenue) },
  {
    id: "roles",
    group: "firmographics",
    label: L("Open roles", "Vacantes", "Posizioni aperte", "Postes ouverts", "Offene Stellen", "Vagas abertas", "Vagas abertas"),
    render: (co) => (
      <Badge variant="secondary" className="tabular-nums">
        {co.openRoles}
      </Badge>
    ),
  },
  { id: "crm", group: "firmographics", label: L("CRM", "CRM", "CRM", "CRM", "CRM", "CRM", "CRM"), render: (co, locale) => <CrmBadge inCrm={co.inCrm} locale={locale} /> },
  {
    id: "signals",
    group: "signals",
    label: L("Signals", "Señales", "Segnali", "Signaux", "Signale", "Sinais", "Sinais"),
    render: (co) => (
      <div className="flex flex-wrap gap-1">
        {co.signals.slice(0, 2).map((s) => (
          <Badge key={s} variant="secondary" className="font-normal">
            {s}
          </Badge>
        ))}
      </div>
    ),
  },
]
