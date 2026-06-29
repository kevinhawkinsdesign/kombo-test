// Customizable table columns. Pages with data tables (Companies, Lists…) can
// surface a large catalogue of fields — inspired by LinkedIn Sales Navigator's
// advanced filters — and let users choose which columns show and in what order.
//
// A column registry defines every available field (grouped by category). User
// preferences (which columns are visible, and their order) are persisted per
// table key. Fields we don't hold in mock data are derived deterministically
// from the row id so the demo looks fully populated.

import * as React from "react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ProspectAvatar,
  ScoreBadge,
  StatusBadge,
  SourceBadge,
} from "@/components/common/ProspectBits"
import { cn } from "@/lib/utils"
import { formatMoney as money, initials, prospectSource } from "@/lib/format"
import { getRep } from "@/lib/team"
import type { Locale } from "@/lib/locale"
import type { Account, AccountTier, Prospect } from "@/lib/types"
import type { AiColumnDef } from "@/lib/ai-columns"

export type Loc = Record<Locale, string>
function L(en: string, es: string): Loc {
  return { en, es }
}

export interface ColumnDef<T> {
  id: string
  label: Loc
  group: string
  default?: boolean
  pinned?: boolean // always first, can't be hidden or moved
  align?: "right"
  minWidth?: string
  render: (row: T, locale: Locale) => React.ReactNode
  edit?: (
    row: T,
    update: (patch: Partial<T>) => void,
    locale: Locale
  ) => React.ReactNode
}

export interface ColGroup {
  id: string
  label: Loc
}

/* ----------------------------- deterministic mocks ----------------------- */

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
function pickFrom<T>(id: string, salt: string, pool: T[]): T {
  return pool[hash(id + salt) % pool.length]
}
function numFrom(id: string, salt: string, min: number, max: number): number {
  return min + (hash(id + salt) % (max - min + 1))
}

/* ------------------------------ render helpers --------------------------- */

const mut = (v: React.ReactNode) => (
  <span className="text-muted-foreground text-sm">{v}</span>
)
const num = (v: React.ReactNode) => (
  <span className="text-sm tabular-nums">{v}</span>
)
function pct(n: number) {
  const up = n >= 0
  return (
    <span
      className={cn(
        "text-sm font-medium tabular-nums",
        up ? "text-chart-1" : "text-destructive"
      )}
    >
      {up ? "+" : ""}
      {n}%
    </span>
  )
}
function scoreChip(n: number) {
  const tone =
    n >= 80
      ? "bg-chart-1/15 text-chart-1"
      : n >= 60
        ? "bg-chart-4/15 text-chart-4"
        : "bg-muted text-muted-foreground"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
        tone
      )}
    >
      <span className="bg-current size-1.5 rounded-full opacity-80" />
      {n}
    </span>
  )
}
function chips(values: string[]) {
  return (
    <div className="flex flex-wrap gap-1">
      {values.slice(0, 2).map((v) => (
        <Badge key={v} variant="secondary" className="font-normal">
          {v}
        </Badge>
      ))}
    </div>
  )
}
function yesNo(v: boolean, locale: Locale) {
  return v ? (
    <Badge variant="success" className="font-normal">
      {locale === "es" ? "Sí" : "Yes"}
    </Badge>
  ) : (
    mut("—")
  )
}

/* -------------------------------- companies ------------------------------ */

export const COMPANY_GROUPS: ColGroup[] = [
  { id: "firmo", label: L("Firmographics", "Firmografía") },
  { id: "growth", label: L("Growth & signals", "Crecimiento y señales") },
  { id: "crm", label: L("Engagement & CRM", "Interacción y CRM") },
  { id: "tech", label: L("Technographics", "Tecnología") },
  { id: "meta", label: L("Account details", "Detalles de cuenta") },
]

const TIER_VALUES: AccountTier[] = ["Enterprise", "Mid-market", "SMB"]
const COMPANY_TYPES = ["Public", "Private", "Subsidiary", "Nonprofit"]
const REGIONS = ["EMEA", "North America", "LATAM", "APAC"]
const FORTUNE = ["—", "Fortune 1000", "Fortune 500"]
const FUNDING = ["Seed", "Series A", "Series B", "Series C", "Series D", "Public"]
const QUARTERS = ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2024", "Q1 2026"]
const TECHS = ["Salesforce", "HubSpot", "AWS", "Segment", "Snowflake", "Marketo", "Outreach", "Gong"]
const CRMS = ["Salesforce", "HubSpot", "Pipedrive", "Dynamics"]
const CLOUDS = ["AWS", "GCP", "Azure"]
const LISTS = ["Target accounts", "Named accounts", "—"]
const TRAFFIC = ["High", "Medium", "Low"]
const PERSONAS = ["Economic buyer", "Champion", "Technical buyer", "End user"]
const ENGAGEMENT = ["High", "Medium", "Low"]
const LANGS = ["EN", "ES", "FR", "DE"]
const TZ = ["CET", "GMT", "EST", "PST", "BRT"]
const PARENTS = ["—", "—", "Prosus", "Cinven", "—"]

function mockText(
  id: string,
  label: Loc,
  group: string,
  salt: string,
  pool: string[]
): ColumnDef<Account> {
  return { id, label, group, render: (a) => mut(pickFrom(a.id, salt, pool)) }
}
function mockNum(
  id: string,
  label: Loc,
  group: string,
  salt: string,
  min: number,
  max: number,
  fmt: (n: number) => React.ReactNode = num
): ColumnDef<Account> {
  return {
    id,
    label,
    group,
    align: "right",
    render: (a) => fmt(numFrom(a.id, salt, min, max)),
  }
}

export const COMPANY_COLUMNS: ColumnDef<Account>[] = [
  // Pinned identity column.
  {
    id: "name",
    label: L("Company", "Empresa"),
    group: "firmo",
    pinned: true,
    minWidth: "200px",
    render: (a) => (
      <div className="flex items-center gap-3">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: a.logoColor }}
        >
          {a.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <Link
            to={`/companies/${a.id}`}
            className="truncate font-medium hover:underline"
          >
            {a.name}
          </Link>
          <p className="text-muted-foreground truncate text-xs">{a.domain}</p>
        </div>
      </div>
    ),
    edit: (a, update) => (
      <div className="flex items-center gap-3">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: a.logoColor }}
        >
          {a.name.charAt(0)}
        </span>
        <Input
          value={a.name}
          onChange={(e) => update({ name: e.target.value })}
          aria-label="Company"
          clearable={false}
          className="h-8 min-w-[140px]"
        />
      </div>
    ),
  },

  // Firmographics
  {
    id: "industry",
    label: L("Industry", "Sector"),
    group: "firmo",
    default: true,
    render: (a) => mut(a.industry),
    edit: (a, update) => (
      <Input
        value={a.industry}
        onChange={(e) => update({ industry: e.target.value })}
        aria-label="Industry"
        clearable={false}
        className="h-8 min-w-[120px]"
      />
    ),
  },
  {
    id: "tier",
    label: L("Tier", "Segmento"),
    group: "firmo",
    default: true,
    render: (a) => (
      <Badge variant="secondary" className="font-normal">
        {a.tier}
      </Badge>
    ),
    edit: (a, update) => (
      <Select value={a.tier} onValueChange={(v) => update({ tier: v as AccountTier })}>
        <SelectTrigger size="sm" className="h-8 w-[130px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TIER_VALUES.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
  },
  {
    id: "employees",
    label: L("Headcount", "Plantilla"),
    group: "firmo",
    default: true,
    align: "right",
    render: (a) => num(a.employees),
    edit: (a, update) => (
      <Input
        value={a.employees}
        onChange={(e) => update({ employees: e.target.value })}
        aria-label="Headcount"
        clearable={false}
        className="h-8 w-[110px]"
      />
    ),
  },
  {
    id: "revenue",
    label: L("Annual revenue", "Ingresos anuales"),
    group: "firmo",
    render: (a) => mut(a.revenue),
  },
  mockText("companyType", L("Company type", "Tipo de empresa"), "firmo", "ctype", COMPANY_TYPES),
  mockNum("founded", L("Founded", "Fundación"), "firmo", "fnd", 1996, 2021),
  { id: "hq", label: L("HQ location", "Sede"), group: "firmo", render: (a) => mut(a.location) },
  mockText("hqRegion", L("HQ region", "Región sede"), "firmo", "rgn", REGIONS),
  { id: "domain", label: L("Website", "Sitio web"), group: "firmo", render: (a) => mut(a.domain) },
  mockText("fortune", L("Fortune rank", "Ranking Fortune"), "firmo", "ftn", FORTUNE),

  // Growth & signals
  mockNum("headcountGrowth", L("Headcount growth", "Crec. plantilla"), "growth", "hgr", -4, 38, (n) => pct(n)),
  mockNum("deptHeadcount", L("Sales headcount", "Plantilla ventas"), "growth", "dhc", 4, 120),
  mockNum("deptGrowth", L("Sales growth", "Crec. ventas"), "growth", "dgr", -6, 45, (n) => pct(n)),
  mockText("fundingStage", L("Funding stage", "Etapa financiación"), "growth", "fst", FUNDING),
  mockText("lastFunding", L("Last funding", "Última ronda"), "growth", "lfd", QUARTERS),
  mockNum("fundingAmount", L("Funding raised", "Capital levantado"), "growth", "fam", 2, 240, (n) => num(`$${n}M`)),
  mockNum("jobOpenings", L("Open roles", "Vacantes"), "growth", "job", 0, 64),
  mockNum("seniorHires", L("Senior hires 90d", "Altas senior 90d"), "growth", "snr", 0, 9),
  mockNum("newsMentions", L("News mentions", "Menciones prensa"), "growth", "nws", 0, 18),
  {
    id: "intent",
    label: L("Buyer intent", "Intención de compra"),
    group: "growth",
    render: (a) => scoreChip(numFrom(a.id, "int", 35, 98)),
  },
  mockNum("growthRate", L("YoY growth", "Crec. interanual"), "growth", "yoy", -8, 60, (n) => pct(n)),

  // Engagement & CRM
  {
    id: "health",
    label: L("Health", "Salud"),
    group: "crm",
    default: true,
    render: (a) => scoreChip(a.healthScore),
  },
  { id: "openDeals", label: L("Open deals", "Negocios abiertos"), group: "crm", align: "right", render: (a) => num(a.openDeals) },
  {
    id: "pipeline",
    label: L("Pipeline", "Pipeline"),
    group: "crm",
    default: true,
    align: "right",
    render: (a) => <span className="text-sm font-medium tabular-nums">{money(a.pipeline)}</span>,
  },
  { id: "contacts", label: L("Contacts", "Contactos"), group: "crm", align: "right", render: (a) => num(a.contacts) },
  {
    id: "owner",
    label: L("Owner", "Responsable"),
    group: "crm",
    default: true,
    render: (a, locale) => {
      const owner = getRep(a.ownerId)
      if (!owner)
        return (
          <span className="text-muted-foreground text-xs">
            {locale === "es" ? "Sin asignar" : "Unassigned"}
          </span>
        )
      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarFallback
              style={{ backgroundColor: owner.avatarColor, color: "white" }}
              className="text-[10px] font-medium"
            >
              {initials(owner.name.split(" ")[0], owner.name.split(" ")[1])}
            </AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground text-xs">
            {owner.name.split(" ")[0]}
          </span>
        </div>
      )
    },
  },
  {
    id: "lastActivity",
    label: L("Last activity", "Última actividad"),
    group: "crm",
    render: (a, locale) =>
      mut(
        new Date(a.lastActivity).toLocaleDateString(
          locale === "es" ? "es-ES" : "en-US",
          { month: "short", day: "numeric" }
        )
      ),
  },
  {
    id: "inCRM",
    label: L("In CRM", "En CRM"),
    group: "crm",
    render: (a, locale) => yesNo(hash(a.id + "crm") % 3 !== 0, locale),
  },
  mockText("accountList", L("Account list", "Lista de cuentas"), "crm", "lst", LISTS),
  mockNum("followers", L("LinkedIn followers", "Seguidores LinkedIn"), "crm", "fol", 800, 240000, (n) => num(n.toLocaleString())),
  mockText("webTraffic", L("Web traffic", "Tráfico web"), "crm", "trf", TRAFFIC),

  // Technographics
  {
    id: "techStack",
    label: L("Technologies", "Tecnologías"),
    group: "tech",
    minWidth: "160px",
    render: (a) => chips([pickFrom(a.id, "t1", TECHS), pickFrom(a.id, "t2", TECHS)]),
  },
  mockNum("techCount", L("Tech count", "Nº tecnologías"), "tech", "tcn", 8, 140),
  mockText("crmTech", L("CRM", "CRM"), "tech", "crm2", CRMS),
  mockText("cloudTech", L("Cloud", "Nube"), "tech", "cld", CLOUDS),

  // Account details
  {
    id: "about",
    label: L("About", "Descripción"),
    group: "meta",
    minWidth: "220px",
    render: (a) => (
      <span className="text-muted-foreground line-clamp-1 max-w-[260px] text-sm">
        {a.about}
      </span>
    ),
  },
  {
    id: "signals",
    label: L("Signals", "Señales"),
    group: "meta",
    minWidth: "160px",
    render: (a) => chips(a.signals),
  },
  mockText("persona", L("Persona", "Persona"), "meta", "per", PERSONAS),
  mockNum("committee", L("Buying committee", "Comité de compra"), "meta", "cmt", 2, 11),
  mockText("engagement", L("Engagement", "Interacción"), "meta", "eng", ENGAGEMENT),
  mockText("timezone", L("Timezone", "Zona horaria"), "meta", "tz", TZ),
  mockText("language", L("Language", "Idioma"), "meta", "lng", LANGS),
  mockText("parent", L("Parent company", "Empresa matriz"), "meta", "par", PARENTS),
]

export const COMPANY_DEFAULT_IDS = COMPANY_COLUMNS.filter(
  (c) => c.default && !c.pinned
).map((c) => c.id)

/* --------------------------------- people -------------------------------- */

export const PEOPLE_GROUPS: ColGroup[] = [
  { id: "role", label: L("Role", "Cargo") },
  { id: "company", label: L("Company", "Empresa") },
  { id: "contact", label: L("Contact", "Contacto") },
  { id: "engage", label: L("Engagement & signals", "Interacción y señales") },
  { id: "background", label: L("Background", "Trayectoria") },
]

const FUNCTIONS = ["Sales", "Marketing", "Operations", "Finance", "Engineering", "Product"]
const MGMT = ["C-Level", "VP", "Director", "Manager", "Individual contributor"]
const DEGREES = ["1st", "2nd", "3rd+"]
const SCHOOLS = ["IE Business School", "ESADE", "INSEAD", "LSE", "IESE", "Stanford"]
const PGROUPS = ["Sales Hackers", "RevGenius", "Pavilion", "Modern Sales Pros"]
const SKILLS = ["SaaS Sales", "Negotiation", "Forecasting", "ABM", "Outbound"]
const PAST_CO = ["Salesforce", "Oracle", "SAP", "Amazon", "Google", "Stripe"]
const PERSONAS_P = ["Decision maker", "Champion", "Influencer", "Gatekeeper"]
const EMAIL_STATUS: { en: string; es: string; variant: "success" | "secondary" | "outline" }[] = [
  { en: "Verified", es: "Verificado", variant: "success" },
  { en: "Likely", es: "Probable", variant: "secondary" },
  { en: "Catch-all", es: "Genérico", variant: "outline" },
]

function pTxt(
  id: string,
  label: Loc,
  group: string,
  salt: string,
  pool: string[]
): ColumnDef<Prospect> {
  return { id, label, group, render: (p) => mut(pickFrom(p.id, salt, pool)) }
}
function pNum(
  id: string,
  label: Loc,
  group: string,
  salt: string,
  min: number,
  max: number,
  fmt: (n: number) => React.ReactNode = num
): ColumnDef<Prospect> {
  return {
    id,
    label,
    group,
    align: "right",
    render: (p) => fmt(numFrom(p.id, salt, min, max)),
  }
}
function pBool(id: string, label: Loc, group: string, salt: string): ColumnDef<Prospect> {
  return {
    id,
    label,
    group,
    render: (p, locale) => yesNo(hash(p.id + salt) % 5 < 2, locale),
  }
}

export const PEOPLE_COLUMNS: ColumnDef<Prospect>[] = [
  {
    id: "name",
    label: L("Prospect", "Prospecto"),
    group: "role",
    pinned: true,
    minWidth: "200px",
    render: (p) => (
      <div className="flex items-center gap-3">
        <ProspectAvatar prospect={p} />
        <div className="min-w-0">
          <p className="truncate font-medium">
            {p.firstName} {p.lastName}
          </p>
          <p className="text-muted-foreground truncate text-xs">{p.title}</p>
        </div>
      </div>
    ),
  },

  // Role
  { id: "title", label: L("Job title", "Cargo"), group: "role", render: (p) => mut(p.title) },
  { id: "seniority", label: L("Seniority", "Antigüedad"), group: "role", render: (p) => (
    <Badge variant="secondary" className="font-normal">{p.seniority}</Badge>
  ) },
  { id: "department", label: L("Department", "Departamento"), group: "role", render: (p) => mut(p.department) },
  pTxt("function", L("Function", "Función"), "role", "fn", FUNCTIONS),
  pTxt("mgmtLevel", L("Management level", "Nivel directivo"), "role", "ml", MGMT),
  pNum("yearsInRole", L("Years in role", "Años en el puesto"), "role", "yir", 0, 9),
  pNum("yearsAtCompany", L("Years at company", "Años en la empresa"), "role", "yac", 0, 14),
  pNum("yearsExperience", L("Years of experience", "Años de experiencia"), "role", "yex", 3, 28),
  pTxt("pastCompany", L("Past company", "Empresa anterior"), "role", "pco", PAST_CO),
  pTxt("pastTitle", L("Past title", "Cargo anterior"), "role", "pti", ["Account Executive", "Sales Manager", "BDR Lead", "Consultant"]),

  // Company
  { id: "company", label: L("Company", "Empresa"), group: "company", default: true, render: (p) => (
    <div className="min-w-0">
      <p className="truncate font-medium">{p.company}</p>
      <p className="text-muted-foreground truncate text-xs">{p.location}</p>
    </div>
  ) },
  { id: "companyDomain", label: L("Company domain", "Dominio"), group: "company", render: (p) => mut(p.companyDomain) },
  { id: "industry", label: L("Industry", "Sector"), group: "company", render: (p) => mut(p.industry) },
  { id: "headcount", label: L("Company size", "Tamaño empresa"), group: "company", render: (p) => mut(p.headcount) },
  { id: "revenue", label: L("Company revenue", "Ingresos empresa"), group: "company", render: (p) => mut(p.revenue) },
  pTxt("companyType", L("Company type", "Tipo de empresa"), "company", "pct", COMPANY_TYPES),
  pTxt("companyRegion", L("Company region", "Región empresa"), "company", "prg", REGIONS),

  // Contact
  { id: "email", label: L("Email", "Email"), group: "contact", render: (p) => mut(p.email || "—") },
  {
    id: "emailStatus",
    label: L("Email status", "Estado del email"),
    group: "contact",
    render: (p, locale) => {
      const s = EMAIL_STATUS[hash(p.id + "es") % EMAIL_STATUS.length]
      return <Badge variant={s.variant} className="font-normal">{locale === "es" ? s.es : s.en}</Badge>
    },
  },
  { id: "phone", label: L("Phone", "Teléfono"), group: "contact", render: (p) => mut(p.phone || "—") },
  { id: "location", label: L("Location", "Ubicación"), group: "contact", render: (p) => mut(p.location) },
  pTxt("connectionDegree", L("Connection", "Conexión"), "contact", "cd", DEGREES),
  pNum("mutualConnections", L("Mutual connections", "Conexiones en común"), "contact", "mc", 0, 24),
  pNum("followers", L("Followers", "Seguidores"), "contact", "pf", 120, 38000, (n) => num(n.toLocaleString())),
  pTxt("timezone", L("Timezone", "Zona horaria"), "contact", "ptz", TZ),
  pTxt("language", L("Language", "Idioma"), "contact", "plng", LANGS),

  // Engagement & signals
  { id: "score", label: L("Score", "Puntuación"), group: "engage", default: true, render: (p) => <ScoreBadge score={p.score} /> },
  { id: "status", label: L("Status", "Estado"), group: "engage", default: true, render: (p) => <StatusBadge status={p.status} /> },
  { id: "source", label: L("Source", "Origen"), group: "engage", default: true, render: (p, locale) => <SourceBadge source={prospectSource(p)} locale={locale} /> },
  { id: "tags", label: L("Tags", "Etiquetas"), group: "engage", minWidth: "140px", render: (p) => chips(p.tags) },
  { id: "signals", label: L("Signals", "Señales"), group: "engage", minWidth: "160px", render: (p) => chips(p.signals) },
  {
    id: "lastActivity",
    label: L("Last activity", "Última actividad"),
    group: "engage",
    render: (p, locale) =>
      mut(
        new Date(p.lastActivity).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
          month: "short",
          day: "numeric",
        })
      ),
  },
  {
    id: "addedAt",
    label: L("Added", "Añadido"),
    group: "engage",
    render: (p, locale) =>
      mut(
        new Date(p.addedAt).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
          month: "short",
          day: "numeric",
        })
      ),
  },
  pBool("changedJobs", L("Changed jobs recently", "Cambió de empleo"), "engage", "cj"),
  pBool("postedRecently", L("Posted recently", "Publicó recientemente"), "engage", "pr"),
  pBool("mentionedInNews", L("In the news", "En las noticias"), "engage", "nw"),
  pBool("viewedProfile", L("Viewed your profile", "Vio tu perfil"), "engage", "vp"),
  pBool("inCRM", L("In CRM", "En CRM"), "engage", "icr"),
  pTxt("persona", L("Persona", "Persona"), "engage", "pp", PERSONAS_P),
  { id: "intent", label: L("Buyer intent", "Intención"), group: "engage", render: (p) => scoreChip(numFrom(p.id, "pint", 30, 97)) },

  // Background
  pTxt("school", L("School", "Universidad"), "background", "sch", SCHOOLS),
  pTxt("group", L("Groups", "Grupos"), "background", "grp", PGROUPS),
  pTxt("skill", L("Top skill", "Habilidad principal"), "background", "skl", SKILLS),
  pTxt("certification", L("Certification", "Certificación"), "background", "crt", ["MEDDIC", "Sandler", "Challenger", "—"]),
]

export const PEOPLE_DEFAULT_IDS = PEOPLE_COLUMNS.filter(
  (c) => c.default && !c.pinned
).map((c) => c.id)

/* ------------------------------ AI columns ------------------------------- */

// Group custom AI columns are filed under in the column manager.
export const AI_COLUMN_GROUP: ColGroup = {
  id: "ai",
  label: L("AI columns", "Columnas IA"),
}

// Plausible short "AI" answers for free-text columns, picked deterministically
// per row + column so the demo looks fully populated and stable across renders.
const AI_TEXT_POOL = [
  "Strong fit",
  "Worth a call",
  "Recently funded",
  "Actively hiring",
  "Mentioned in the news",
  "Likely champion",
  "Uses a competitor",
  "Budget likely",
  "Expanding to EMEA",
  "Early-stage adopter",
]

// Turn a user-defined AI column into a render-ready table column. The value is
// mocked from the row id + column id so it stays consistent between renders.
export function aiColumnToDef<T extends { id: string }>(
  col: AiColumnDef
): ColumnDef<T> {
  return {
    id: col.id,
    label: L(col.label, col.label),
    group: AI_COLUMN_GROUP.id,
    minWidth: "150px",
    render: (row, locale) => {
      if (col.output === "score") return scoreChip(numFrom(row.id, col.id, 30, 99))
      if (col.output === "yesno") return yesNo(hash(row.id + col.id) % 5 < 3, locale)
      return mut(pickFrom(row.id, col.id, AI_TEXT_POOL))
    },
  }
}

export function aiColumnsToDefs<T extends { id: string }>(
  cols: AiColumnDef[]
): ColumnDef<T>[] {
  return cols.map((c) => aiColumnToDef<T>(c))
}

/* ----------------------------- preferences store ------------------------- */

const COLS_KEY = "kombo_table_cols_v1"
type Prefs = Record<string, string[]>

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(COLS_KEY)
    if (raw) return JSON.parse(raw) as Prefs
  } catch {
    /* ignore */
  }
  return {}
}

let prefs: Prefs = loadPrefs()
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(COLS_KEY, JSON.stringify(prefs))
  } catch {
    /* ignore */
  }
}
function emit() {
  persist()
  listeners.forEach((l) => l())
}

function getVisible(tableKey: string, defaults: string[]): string[] {
  return prefs[tableKey] ?? defaults
}

export interface ColumnPrefs {
  visible: string[]
  setVisible: (ids: string[]) => void
  toggle: (id: string) => void
  move: (id: string, dir: -1 | 1) => void
  reset: () => void
  isDefault: boolean
}

export function useColumnPrefs(
  tableKey: string,
  defaults: string[]
): ColumnPrefs {
  const visible = React.useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => getVisible(tableKey, defaults),
    () => getVisible(tableKey, defaults)
  )

  const setVisible = React.useCallback(
    (ids: string[]) => {
      prefs = { ...prefs, [tableKey]: ids }
      emit()
    },
    [tableKey]
  )

  const toggle = React.useCallback(
    (id: string) => {
      const current = getVisible(tableKey, defaults)
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id]
      prefs = { ...prefs, [tableKey]: next }
      emit()
    },
    [tableKey, defaults]
  )

  const move = React.useCallback(
    (id: string, dir: -1 | 1) => {
      const current = [...getVisible(tableKey, defaults)]
      const i = current.indexOf(id)
      const t = i + dir
      if (i === -1 || t < 0 || t >= current.length) return
      ;[current[i], current[t]] = [current[t], current[i]]
      prefs = { ...prefs, [tableKey]: current }
      emit()
    },
    [tableKey, defaults]
  )

  const reset = React.useCallback(() => {
    const next = { ...prefs }
    delete next[tableKey]
    prefs = next
    emit()
  }, [tableKey])

  return {
    visible,
    setVisible,
    toggle,
    move,
    reset,
    isDefault: prefs[tableKey] === undefined,
  }
}
