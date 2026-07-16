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

import { TruncatedText } from "@/components/common/TruncatedText"
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
import { INTL_LOCALE } from "@/lib/locale-meta"
import type { Account, AccountTier, Prospect } from "@/lib/types"
import { aiColumnStore, type AiColumnDef } from "@/lib/ai-columns"

export type Loc = Record<Locale, string>
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
const YES: Record<Locale, string> = {
  en: "Yes",
  es: "Sí",
  it: "Sì",
  fr: "Oui",
  de: "Ja",
  pt: "Sim",
  pt_BR: "Sim",
}
const UNASSIGNED: Record<Locale, string> = {
  en: "Unassigned",
  es: "Sin asignar",
  it: "Non assegnato",
  fr: "Non attribué",
  de: "Nicht zugewiesen",
  pt: "Não atribuído",
  pt_BR: "Não atribuído",
}
function yesNo(v: boolean, locale: Locale) {
  return v ? (
    <Badge variant="success" className="font-normal">
      {YES[locale]}
    </Badge>
  ) : (
    mut("—")
  )
}

/* -------------------------------- companies ------------------------------ */

export const COMPANY_GROUPS: ColGroup[] = [
  { id: "firmo", label: L("Firmographics", "Firmografía", "Firmografia", "Firmographie", "Firmografie", "Firmografia", "Firmografia") },
  { id: "growth", label: L("Growth & signals", "Crecimiento y señales", "Crescita e segnali", "Croissance et signaux", "Wachstum & Signale", "Crescimento e sinais", "Crescimento e sinais") },
  { id: "crm", label: L("Engagement & CRM", "Interacción y CRM", "Coinvolgimento e CRM", "Engagement et CRM", "Engagement & CRM", "Envolvimento e CRM", "Engajamento e CRM") },
  { id: "tech", label: L("Technographics", "Tecnología", "Tecnografia", "Technographie", "Technografie", "Tecnografia", "Tecnografia") },
  { id: "meta", label: L("Account details", "Detalles de cuenta", "Dettagli account", "Détails du compte", "Kontodetails", "Detalhes da conta", "Detalhes da conta") },
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
    label: L("Company", "Empresa", "Azienda", "Entreprise", "Unternehmen", "Empresa", "Empresa"),
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
          <TruncatedText label={a.name}>
            <Link
              to={`/companies/${a.id}`}
              className="truncate font-medium hover:underline"
            >
              {a.name}
            </Link>
          </TruncatedText>
          <TruncatedText label={a.domain}>
            <p className="text-muted-foreground truncate text-xs">{a.domain}</p>
          </TruncatedText>
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
    label: L("Industry", "Sector", "Settore", "Secteur", "Branche", "Setor", "Setor"),
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
    label: L("Tier", "Segmento", "Livello", "Catégorie", "Segment", "Segmento", "Segmento"),
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
    label: L("Headcount", "Plantilla", "Organico", "Effectif", "Mitarbeiterzahl", "Efetivo", "Headcount"),
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
    label: L("Annual revenue", "Ingresos anuales", "Fatturato annuo", "Chiffre d'affaires annuel", "Jahresumsatz", "Receita anual", "Receita anual"),
    group: "firmo",
    render: (a) => mut(a.revenue),
  },
  mockText("companyType", L("Company type", "Tipo de empresa", "Tipo di azienda", "Type d'entreprise", "Unternehmenstyp", "Tipo de empresa", "Tipo de empresa"), "firmo", "ctype", COMPANY_TYPES),
  mockNum("founded", L("Founded", "Fundación", "Fondazione", "Fondation", "Gründung", "Fundação", "Fundação"), "firmo", "fnd", 1996, 2021),
  { id: "hq", label: L("HQ location", "Sede", "Sede centrale", "Siège social", "Hauptsitz", "Sede", "Sede"), group: "firmo", render: (a) => mut(a.location) },
  mockText("hqRegion", L("HQ region", "Región sede", "Regione sede", "Région du siège", "Region des Hauptsitzes", "Região da sede", "Região da sede"), "firmo", "rgn", REGIONS),
  { id: "domain", label: L("Website", "Sitio web", "Sito web", "Site web", "Website", "Sítio web", "Site"), group: "firmo", render: (a) => mut(a.domain) },
  mockText("fortune", L("Fortune rank", "Ranking Fortune", "Classifica Fortune", "Classement Fortune", "Fortune-Ranking", "Classificação Fortune", "Ranking Fortune"), "firmo", "ftn", FORTUNE),

  // Growth & signals
  mockNum("headcountGrowth", L("Headcount growth", "Crec. plantilla", "Crescita organico", "Croissance des effectifs", "Personalwachstum", "Cresc. efetivo", "Cresc. de headcount"), "growth", "hgr", -4, 38, (n) => pct(n)),
  mockNum("deptHeadcount", L("Sales headcount", "Plantilla ventas", "Organico vendite", "Effectif commercial", "Vertriebsmitarbeiter", "Efetivo de vendas", "Headcount de vendas"), "growth", "dhc", 4, 120),
  mockNum("deptGrowth", L("Sales growth", "Crec. ventas", "Crescita vendite", "Croissance des ventes", "Umsatzwachstum", "Cresc. vendas", "Cresc. de vendas"), "growth", "dgr", -6, 45, (n) => pct(n)),
  mockText("fundingStage", L("Funding stage", "Etapa financiación", "Fase di finanziamento", "Étape de financement", "Finanzierungsphase", "Fase de financiamento", "Estágio de captação"), "growth", "fst", FUNDING),
  mockText("lastFunding", L("Last funding", "Última ronda", "Ultimo round", "Dernier tour de table", "Letzte Finanzierungsrunde", "Última ronda", "Última rodada"), "growth", "lfd", QUARTERS),
  mockNum("fundingAmount", L("Funding raised", "Capital levantado", "Capitale raccolto", "Capital levé", "Aufgenommenes Kapital", "Capital angariado", "Capital captado"), "growth", "fam", 2, 240, (n) => num(`$${n}M`)),
  mockNum("jobOpenings", L("Open roles", "Vacantes", "Posizioni aperte", "Postes ouverts", "Offene Stellen", "Vagas abertas", "Vagas abertas"), "growth", "job", 0, 64),
  mockNum("seniorHires", L("Senior hires 90d", "Altas senior 90d", "Assunzioni senior 90gg", "Recrutements senior 90j", "Senior-Neueinstellungen 90T", "Contratações sénior 90d", "Contratações sênior 90d"), "growth", "snr", 0, 9),
  mockNum("newsMentions", L("News mentions", "Menciones prensa", "Menzioni stampa", "Mentions presse", "Presseerwähnungen", "Menções na imprensa", "Menções na imprensa"), "growth", "nws", 0, 18),
  {
    id: "intent",
    label: L("Buyer intent", "Intención de compra", "Intenzione d'acquisto", "Intention d'achat", "Kaufabsicht", "Intenção de compra", "Intenção de compra"),
    group: "growth",
    render: (a) => scoreChip(numFrom(a.id, "int", 35, 98)),
  },
  mockNum("growthRate", L("YoY growth", "Crec. interanual", "Crescita annua", "Croissance annuelle", "Wachstum ggü. Vorjahr", "Cresc. anual", "Cresc. anual"), "growth", "yoy", -8, 60, (n) => pct(n)),

  // Engagement & CRM
  {
    id: "health",
    label: L("Health", "Salud", "Salute", "Santé", "Zustand", "Saúde", "Saúde"),
    group: "crm",
    default: true,
    render: (a) => scoreChip(a.healthScore),
  },
  { id: "openDeals", label: L("Open deals", "Negocios abiertos", "Trattative aperte", "Transactions ouvertes", "Offene Deals", "Negócios em aberto", "Negócios em aberto"), group: "crm", align: "right", render: (a) => num(a.openDeals) },
  {
    id: "pipeline",
    label: L("Pipeline", "Pipeline", "Pipeline", "Pipeline", "Pipeline", "Pipeline", "Pipeline"),
    group: "crm",
    default: true,
    align: "right",
    render: (a) => <span className="text-sm font-medium tabular-nums">{money(a.pipeline)}</span>,
  },
  { id: "contacts", label: L("Prospects", "Prospectos", "Prospect", "Prospects", "Prospects", "Prospects", "Prospects"), group: "crm", align: "right", render: (a) => num(a.contacts) },
  {
    id: "owner",
    label: L("Owner", "Responsable", "Proprietario", "Propriétaire", "Owner", "Proprietário", "Proprietário"),
    group: "crm",
    default: true,
    render: (a, locale) => {
      const owner = getRep(a.ownerId)
      if (!owner)
        return (
          <span className="text-muted-foreground text-xs">
            {UNASSIGNED[locale]}
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
    label: L("Last activity", "Última actividad", "Ultima attività", "Dernière activité", "Letzte Aktivität", "Última atividade", "Última atividade"),
    group: "crm",
    render: (a, locale) =>
      mut(
        new Date(a.lastActivity).toLocaleDateString(
          INTL_LOCALE[locale],
          { month: "short", day: "numeric" }
        )
      ),
  },
  {
    id: "inCRM",
    label: L("In CRM", "En CRM", "Nel CRM", "Dans le CRM", "Im CRM", "No CRM", "No CRM"),
    group: "crm",
    render: (a, locale) => yesNo(hash(a.id + "crm") % 3 !== 0, locale),
  },
  mockText("accountList", L("Account list", "Lista de cuentas", "Elenco account", "Liste de comptes", "Kontoliste", "Lista de contas", "Lista de contas"), "crm", "lst", LISTS),
  mockNum("followers", L("LinkedIn followers", "Seguidores LinkedIn", "Follower LinkedIn", "Abonnés LinkedIn", "LinkedIn-Follower", "Seguidores no LinkedIn", "Seguidores no LinkedIn"), "crm", "fol", 800, 240000, (n) => num(n.toLocaleString())),
  mockText("webTraffic", L("Web traffic", "Tráfico web", "Traffico web", "Trafic web", "Web-Traffic", "Tráfego web", "Tráfego web"), "crm", "trf", TRAFFIC),

  // Technographics
  {
    id: "techStack",
    label: L("Technologies", "Tecnologías", "Tecnologie", "Technologies", "Technologien", "Tecnologias", "Tecnologias"),
    group: "tech",
    minWidth: "160px",
    render: (a) => chips([pickFrom(a.id, "t1", TECHS), pickFrom(a.id, "t2", TECHS)]),
  },
  mockNum("techCount", L("Tech count", "Nº tecnologías", "N. tecnologie", "Nb technologies", "Anzahl Technologien", "N.º tecnologias", "Nº de tecnologias"), "tech", "tcn", 8, 140),
  mockText("crmTech", L("CRM", "CRM", "CRM", "CRM", "CRM", "CRM", "CRM"), "tech", "crm2", CRMS),
  mockText("cloudTech", L("Cloud", "Nube", "Cloud", "Cloud", "Cloud", "Cloud", "Cloud"), "tech", "cld", CLOUDS),

  // Account details
  {
    id: "about",
    label: L("About", "Descripción", "Descrizione", "Description", "Beschreibung", "Descrição", "Descrição"),
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
    label: L("Signals", "Señales", "Segnali", "Signaux", "Signale", "Sinais", "Sinais"),
    group: "meta",
    minWidth: "160px",
    render: (a) => chips(a.signals),
  },
  mockText("persona", L("Persona", "Persona", "Persona", "Persona", "Persona", "Persona", "Persona"), "meta", "per", PERSONAS),
  mockNum("committee", L("Buying committee", "Comité de compra", "Comitato d'acquisto", "Comité d'achat", "Einkaufsgremium", "Comité de compra", "Comitê de compra"), "meta", "cmt", 2, 11),
  mockText("engagement", L("Engagement", "Interacción", "Coinvolgimento", "Engagement", "Engagement", "Envolvimento", "Engajamento"), "meta", "eng", ENGAGEMENT),
  mockText("timezone", L("Timezone", "Zona horaria", "Fuso orario", "Fuseau horaire", "Zeitzone", "Fuso horário", "Fuso horário"), "meta", "tz", TZ),
  mockText("language", L("Language", "Idioma", "Lingua", "Langue", "Sprache", "Idioma", "Idioma"), "meta", "lng", LANGS),
  mockText("parent", L("Parent company", "Empresa matriz", "Società madre", "Société mère", "Muttergesellschaft", "Empresa-mãe", "Empresa-mãe"), "meta", "par", PARENTS),
]

// All non-pinned columns visible by default — the app shows off the full
// data catalog out of the box; users trim it down via the column picker.
export const COMPANY_DEFAULT_IDS = COMPANY_COLUMNS.filter(
  (c) => !c.pinned
).map((c) => c.id)

/* --------------------------------- people -------------------------------- */

export const PEOPLE_GROUPS: ColGroup[] = [
  { id: "role", label: L("Role", "Cargo", "Ruolo", "Poste", "Rolle", "Cargo", "Cargo") },
  { id: "company", label: L("Company", "Empresa", "Azienda", "Entreprise", "Unternehmen", "Empresa", "Empresa") },
  { id: "contact", label: L("Contact", "Contacto", "Contatto", "Contact", "Kontakt", "Contacto", "Contato") },
  { id: "engage", label: L("Engagement & signals", "Interacción y señales", "Coinvolgimento e segnali", "Engagement et signaux", "Engagement & Signale", "Envolvimento e sinais", "Engajamento e sinais") },
  { id: "background", label: L("Background", "Trayectoria", "Percorso", "Parcours", "Werdegang", "Percurso", "Histórico") },
]

const FUNCTIONS = ["Sales", "Marketing", "Operations", "Finance", "Engineering", "Product"]
const MGMT = ["C-Level", "VP", "Director", "Manager", "Individual contributor"]
const DEGREES = ["1st", "2nd", "3rd+"]
const SCHOOLS = ["IE Business School", "ESADE", "INSEAD", "LSE", "IESE", "Stanford"]
const PGROUPS = ["Sales Hackers", "RevGenius", "Pavilion", "Modern Sales Pros"]
const SKILLS = ["SaaS Sales", "Negotiation", "Forecasting", "ABM", "Outbound"]
const PAST_CO = ["Salesforce", "Oracle", "SAP", "Amazon", "Google", "Stripe"]
const PERSONAS_P = ["Decision maker", "Champion", "Influencer", "Gatekeeper"]
const EMAIL_STATUS: {
  en: string
  es: string
  it: string
  fr: string
  de: string
  pt: string
  pt_BR: string
  variant: "success" | "secondary" | "outline"
}[] = [
  { en: "Verified", es: "Verificado", it: "Verificata", fr: "Vérifié", de: "Verifiziert", pt: "Verificado", pt_BR: "Verificado", variant: "success" },
  { en: "Likely", es: "Probable", it: "Probabile", fr: "Probable", de: "Wahrscheinlich", pt: "Provável", pt_BR: "Provável", variant: "secondary" },
  { en: "Catch-all", es: "Genérico", it: "Generica", fr: "Générique", de: "Catch-all", pt: "Genérico", pt_BR: "Genérico", variant: "outline" },
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
    label: L("Prospect", "Prospecto", "Prospect", "Prospect", "Prospect", "Prospect", "Prospect"),
    group: "role",
    pinned: true,
    minWidth: "200px",
    render: (p) => (
      <div className="flex items-center gap-3">
        <ProspectAvatar prospect={p} />
        <div className="min-w-0">
          <TruncatedText label={`${p.firstName} ${p.lastName}`}>
            <Link
              to={`/prospects/${p.id}`}
              className="truncate font-medium hover:underline"
            >
              {p.firstName} {p.lastName}
            </Link>
          </TruncatedText>
          <TruncatedText label={p.title}>
            <p className="text-muted-foreground truncate text-xs">{p.title}</p>
          </TruncatedText>
        </div>
      </div>
    ),
  },

  // Role
  { id: "title", label: L("Job title", "Cargo", "Ruolo", "Poste", "Berufsbezeichnung", "Cargo", "Cargo"), group: "role", render: (p) => mut(p.title) },
  { id: "seniority", label: L("Seniority", "Antigüedad", "Anzianità", "Ancienneté", "Senioritätsstufe", "Senioridade", "Senioridade"), group: "role", render: (p) => (
    <Badge variant="secondary" className="font-normal">{p.seniority}</Badge>
  ) },
  { id: "department", label: L("Department", "Departamento", "Reparto", "Département", "Abteilung", "Departamento", "Departamento"), group: "role", render: (p) => mut(p.department) },
  pTxt("function", L("Function", "Función", "Funzione", "Fonction", "Funktion", "Função", "Função"), "role", "fn", FUNCTIONS),
  pTxt("mgmtLevel", L("Management level", "Nivel directivo", "Livello dirigenziale", "Niveau hiérarchique", "Führungsebene", "Nível de gestão", "Nível de gestão"), "role", "ml", MGMT),
  pNum("yearsInRole", L("Years in role", "Años en el puesto", "Anni nel ruolo", "Années dans le poste", "Jahre in der Rolle", "Anos na função", "Anos na função"), "role", "yir", 0, 9),
  pNum("yearsAtCompany", L("Years at company", "Años en la empresa", "Anni in azienda", "Années dans l'entreprise", "Jahre im Unternehmen", "Anos na empresa", "Anos na empresa"), "role", "yac", 0, 14),
  pNum("yearsExperience", L("Years of experience", "Años de experiencia", "Anni di esperienza", "Années d'expérience", "Jahre Erfahrung", "Anos de experiência", "Anos de experiência"), "role", "yex", 3, 28),
  pTxt("pastCompany", L("Past company", "Empresa anterior", "Azienda precedente", "Entreprise précédente", "Vorheriges Unternehmen", "Empresa anterior", "Empresa anterior"), "role", "pco", PAST_CO),
  pTxt("pastTitle", L("Past title", "Cargo anterior", "Ruolo precedente", "Poste précédent", "Vorherige Position", "Cargo anterior", "Cargo anterior"), "role", "pti", ["Account Executive", "Sales Manager", "BDR Lead", "Consultant"]),

  // Company
  { id: "company", label: L("Company", "Empresa", "Azienda", "Entreprise", "Unternehmen", "Empresa", "Empresa"), group: "company", default: true, render: (p) => (
    <div className="min-w-0">
      <TruncatedText label={p.company}>
        <p className="truncate font-medium">{p.company}</p>
      </TruncatedText>
      <TruncatedText label={p.location}>
        <p className="text-muted-foreground truncate text-xs">{p.location}</p>
      </TruncatedText>
    </div>
  ) },
  { id: "companyDomain", label: L("Company domain", "Dominio", "Dominio", "Domaine", "Domain", "Domínio", "Domínio"), group: "company", render: (p) => mut(p.companyDomain) },
  { id: "industry", label: L("Industry", "Sector", "Settore", "Secteur", "Branche", "Setor", "Setor"), group: "company", render: (p) => mut(p.industry) },
  { id: "headcount", label: L("Company size", "Tamaño empresa", "Dimensione azienda", "Taille de l'entreprise", "Unternehmensgröße", "Dimensão da empresa", "Tamanho da empresa"), group: "company", render: (p) => mut(p.headcount) },
  { id: "revenue", label: L("Company revenue", "Ingresos empresa", "Fatturato azienda", "Chiffre d'affaires de l'entreprise", "Unternehmensumsatz", "Receita da empresa", "Receita da empresa"), group: "company", render: (p) => mut(p.revenue) },
  pTxt("companyType", L("Company type", "Tipo de empresa", "Tipo di azienda", "Type d'entreprise", "Unternehmenstyp", "Tipo de empresa", "Tipo de empresa"), "company", "pct", COMPANY_TYPES),
  pTxt("companyRegion", L("Company region", "Región empresa", "Regione azienda", "Région de l'entreprise", "Unternehmensregion", "Região da empresa", "Região da empresa"), "company", "prg", REGIONS),

  // Contact
  { id: "email", label: L("Email", "Email", "Email", "E-mail", "E-Mail", "Email", "E-mail"), group: "contact", render: (p) => mut(p.email || "—") },
  {
    id: "emailStatus",
    label: L("Email status", "Estado del email", "Stato email", "Statut de l'e-mail", "E-Mail-Status", "Estado do email", "Status do e-mail"),
    group: "contact",
    render: (p, locale) => {
      const s = EMAIL_STATUS[hash(p.id + "es") % EMAIL_STATUS.length]
      return <Badge variant={s.variant} className="font-normal">{s[locale]}</Badge>
    },
  },
  { id: "phone", label: L("Phone", "Teléfono", "Telefono", "Téléphone", "Telefon", "Telefone", "Telefone"), group: "contact", render: (p) => mut(p.phone || "—") },
  { id: "location", label: L("Location", "Ubicación", "Posizione", "Lieu", "Standort", "Localização", "Localização"), group: "contact", render: (p) => mut(p.location) },
  pTxt("connectionDegree", L("Connection", "Conexión", "Connessione", "Connexion", "Verbindung", "Ligação", "Conexão"), "contact", "cd", DEGREES),
  pNum("mutualConnections", L("Mutual connections", "Conexiones en común", "Connessioni in comune", "Relations en commun", "Gemeinsame Kontakte", "Contactos em comum", "Conexões em comum"), "contact", "mc", 0, 24),
  pNum("followers", L("Followers", "Seguidores", "Follower", "Abonnés", "Follower", "Seguidores", "Seguidores"), "contact", "pf", 120, 38000, (n) => num(n.toLocaleString())),
  pTxt("timezone", L("Timezone", "Zona horaria", "Fuso orario", "Fuseau horaire", "Zeitzone", "Fuso horário", "Fuso horário"), "contact", "ptz", TZ),
  pTxt("language", L("Language", "Idioma", "Lingua", "Langue", "Sprache", "Idioma", "Idioma"), "contact", "plng", LANGS),

  // Engagement & signals
  { id: "score", label: L("Score", "Puntuación", "Punteggio", "Score", "Score", "Pontuação", "Pontuação"), group: "engage", default: true, render: (p) => <ScoreBadge score={p.score} /> },
  { id: "status", label: L("Status", "Estado", "Stato", "Statut", "Status", "Estado", "Status"), group: "engage", default: true, render: (p) => <StatusBadge status={p.status} /> },
  { id: "source", label: L("Source", "Origen", "Origine", "Source", "Quelle", "Origem", "Origem"), group: "engage", default: true, render: (p, locale) => <SourceBadge source={prospectSource(p)} locale={locale} /> },
  { id: "tags", label: L("Tags", "Etiquetas", "Tag", "Tags", "Tags", "Etiquetas", "Tags"), group: "engage", minWidth: "140px", render: (p) => chips(p.tags) },
  { id: "signals", label: L("Signals", "Señales", "Segnali", "Signaux", "Signale", "Sinais", "Sinais"), group: "engage", minWidth: "160px", render: (p) => chips(p.signals) },
  {
    id: "lastActivity",
    label: L("Last activity", "Última actividad", "Ultima attività", "Dernière activité", "Letzte Aktivität", "Última atividade", "Última atividade"),
    group: "engage",
    render: (p, locale) =>
      mut(
        new Date(p.lastActivity).toLocaleDateString(INTL_LOCALE[locale], {
          month: "short",
          day: "numeric",
        })
      ),
  },
  {
    id: "addedAt",
    label: L("Added", "Añadido", "Aggiunto", "Ajouté", "Hinzugefügt", "Adicionado", "Adicionado"),
    group: "engage",
    render: (p, locale) =>
      mut(
        new Date(p.addedAt).toLocaleDateString(INTL_LOCALE[locale], {
          month: "short",
          day: "numeric",
        })
      ),
  },
  pBool("changedJobs", L("Changed jobs recently", "Cambió de empleo", "Ha cambiato lavoro di recente", "A changé d'emploi récemment", "Kürzlich Job gewechselt", "Mudou de emprego recentemente", "Mudou de emprego recentemente"), "engage", "cj"),
  pBool("postedRecently", L("Posted recently", "Publicó recientemente", "Ha pubblicato di recente", "A publié récemment", "Kürzlich gepostet", "Publicou recentemente", "Publicou recentemente"), "engage", "pr"),
  pBool("mentionedInNews", L("In the news", "En las noticias", "Sui media", "Dans les médias", "In den Nachrichten", "Nas notícias", "Nas notícias"), "engage", "nw"),
  pBool("viewedProfile", L("Viewed your profile", "Vio tu perfil", "Ha visto il tuo profilo", "A consulté votre profil", "Hat dein Profil angesehen", "Viu o seu perfil", "Viu seu perfil"), "engage", "vp"),
  pBool("inCRM", L("In CRM", "En CRM", "Nel CRM", "Dans le CRM", "Im CRM", "No CRM", "No CRM"), "engage", "icr"),
  pTxt("persona", L("Persona", "Persona", "Persona", "Persona", "Persona", "Persona", "Persona"), "engage", "pp", PERSONAS_P),
  { id: "intent", label: L("Buyer intent", "Intención", "Intenzione", "Intention", "Absicht", "Intenção", "Intenção"), group: "engage", render: (p) => scoreChip(numFrom(p.id, "pint", 30, 97)) },

  // Background
  pTxt("school", L("School", "Universidad", "Università", "École", "Hochschule", "Universidade", "Universidade"), "background", "sch", SCHOOLS),
  pTxt("group", L("Groups", "Grupos", "Gruppi", "Groupes", "Gruppen", "Grupos", "Grupos"), "background", "grp", PGROUPS),
  pTxt("skill", L("Top skill", "Habilidad principal", "Competenza principale", "Compétence principale", "Wichtigste Fähigkeit", "Principal competência", "Principal habilidade"), "background", "skl", SKILLS),
  pTxt("certification", L("Certification", "Certificación", "Certificazione", "Certification", "Zertifizierung", "Certificação", "Certificação"), "background", "crt", ["MEDDIC", "Sandler", "Challenger", "—"]),
]

export const PEOPLE_DEFAULT_IDS = PEOPLE_COLUMNS.filter(
  (c) => !c.pinned
).map((c) => c.id)

/* ------------------------------ AI columns ------------------------------- */

// Group custom AI columns are filed under in the column manager.
export const AI_COLUMN_GROUP: ColGroup = {
  id: "ai",
  label: L("AI columns", "Columnas IA", "Colonne IA", "Colonnes IA", "KI-Spalten", "Colunas de IA", "Colunas de IA"),
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
  // The value shown for a row: a hand edit always wins; otherwise custom
  // columns start empty and AI columns derive a mock value.
  const textValue = (rowId: string): string => {
    const edited = col.values?.[rowId]
    if (edited !== undefined) return edited
    if (col.kind === "custom") return ""
    return pickFrom(rowId, col.id, AI_TEXT_POOL)
  }
  return {
    id: col.id,
    label: L(col.label, col.label, col.label, col.label, col.label, col.label, col.label),
    group: AI_COLUMN_GROUP.id,
    minWidth: "150px",
    render: (row, locale) => {
      if (col.output === "score") return scoreChip(numFrom(row.id, col.id, 30, 99))
      if (col.output === "yesno") return yesNo(hash(row.id + col.id) % 5 < 3, locale)
      const v = textValue(row.id)
      return v ? mut(v) : <span className="text-muted-foreground/50">—</span>
    },
    // Text columns are hand-editable in edit mode — the value is the user's
    // personal copy, stored on the column (not the record).
    ...(col.output === "text"
      ? {
          edit: (row: T) => (
            <Input
              value={textValue(row.id)}
              onChange={(e) => aiColumnStore.setValue(col.id, row.id, e.target.value)}
              className="h-8"
            />
          ),
        }
      : {}),
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
