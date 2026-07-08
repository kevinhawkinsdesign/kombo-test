import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Search,
  Upload,
  Plug,
  Users,
  Building2,
  ArrowRight,
  ArrowLeft,
  ArrowDownUp,
  SlidersHorizontal,
  ChevronDown,
  Database,
  MapPin,
  Star,
  CheckCircle2,
  Compass,
  Cloud,
  Link2,
  Columns3,
  Download,
  Globe,
  ScanSearch,
} from "lucide-react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { Segmented } from "@/components/common/Segmented"
import { PerCompanyCap } from "@/components/common/PerCompanyCap"
import { DataTable, type TableSelection } from "@/components/common/DataTable"
import { ColumnManager } from "@/components/common/ColumnManager"
import { AddCostConfirm } from "@/components/common/AddCostConfirm"
import { useColumnPrefs } from "@/lib/table-columns"
import {
  LEAD_RESULT_COLUMNS,
  COMPANY_RESULT_COLUMNS,
  LEAD_RESULT_GROUPS,
  LEAD_RESULT_DEFAULT_IDS,
  COMPANY_RESULT_GROUPS,
  COMPANY_RESULT_DEFAULT_IDS,
} from "@/lib/search-result-columns"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import { prospectStore, accountStore, listStore } from "@/lib/store"
import { integrations } from "@/lib/mock-data"
import { MAX_ENRICH_BATCH, SAVE_COST } from "@/lib/enrichment"
import { facetsForDb, facetSection } from "@/lib/search-facets"
import { SEARCH_FILTER_GROUPS } from "@/lib/search-filter-groups"
import { excludeValue } from "@/lib/filter-polarity"
import { downloadCsv } from "@/lib/csv"
import {
  FilterCatalog,
  type CatalogFilterDef,
} from "@/components/common/FilterCatalog"
import {
  interpretPrompt,
  searchLeads,
  searchCompanies,
  sortLeads,
  sortCompanies,
  parseDomainList,
  EMPTY_QUERY,
  type AiQuery,
  type AiLead,
  type AiCompany,
  type AiEntity,
  type SortKey,
} from "@/lib/mock-ai-search"
import type { AccountTier } from "@/lib/types"

type Kind = "contact" | "company"
type Mode = "search" | "import"
// "splash" is the entry pre-step (Search vs Guide Me); "wizard" is the guided
// flow's placeholder landing until its question steps are specified; "results"
// is today's existing search/import screen.
type Screen = "splash" | "wizard" | "results"

const COPY = {
  en: {
    addPeople: "Add prospects",
    addCompanies: "Add companies",
    scopeBanner: (names: string) => `Finding prospects at ${names}`,
    contact: "Prospects",
    company: "Companies",
    search: "Search",
    import: "Import",
    splashSearchTitle: "Search",
    splashSearchDesc: "Describe who you're looking for and search our database directly.",
    splashSearchWithFilters: "Search with filters",
    splashGuideTitle: "Guide me",
    splashGuideDesc: "Answer a few quick questions and we'll build the search for you.",
    splashGuideCta: "Start guided search",
    splashBack: "Back",
    cancel: "Cancel",
    wizRootTitle: "Let's find who you need",
    wizRootDesc: "Start by telling us how you'd like to add records.",
    wizImportTitle: "Import",
    wizImportDesc: "Bring in prospects or companies you already have — a file, your CRM, or a link.",
    wizSearchTitle: "Search",
    wizSearchDesc: "Find new prospects or companies directly from our database.",
    wizImportSourceTitle: "Select your import source",
    wizImportSourceDesc: "Choose how you'd like to bring records in.",
    wizFileTitle: "File",
    wizFileDesc: "CSV, XLS, XLSX, JSON, or TSV",
    wizCrmTitle: "CRM",
    wizCrmDesc: "Import a view, list, query, or table from your connected CRM",
    wizLinkTitle: "Link",
    wizLinkDesc: "A LinkedIn URL, or your connected account",
    wizLinkSourceTitle: "Import from a LinkedIn link",
    wizLinkSourceDesc: "Paste a URL, or sync directly from your connected account.",
    wizLiFollowersDesc: "Import everyone following your connected LinkedIn account",
    wizConnectLinkedinPrompt: "Connect your LinkedIn account first to import your followers.",
    wizConnectLinkedinCta: "Connect LinkedIn",
    wizSearchEntityTitle: "What are you looking for?",
    wizSearchEntityDesc: "Choose the kind of record to search for.",
    wizProspectDesc: "Find contacts by role, seniority, or activity",
    wizCompanyDesc: "Find businesses by industry, size, or location",
    wizProspectSourceTitle: "Find prospects",
    wizProspectSourceDesc: "Choose where to search for people.",
    wizKomboDbTitle: "KomboAI database",
    wizKomboDbDesc:
      "Find persons from our database of 100+ million contacts. We use 19+ data providers through a waterfall enrichment system that searches for verified phone numbers and emails in sequence, then enrich personalization with information from 60+ external sources.",
    wizLiDbTitle: "LinkedIn database",
    wizLiDbDesc: "Find persons based on attributes and parameters of their LinkedIn profile or activity.",
    wizLookalikeTitle: "Lookalikes",
    wizLookalikeDesc:
      "Find persons based on being similar to another person you already know — by name, role, and more.",
    wizCompanySourceTitle: "Find companies",
    wizCompanySourceDesc: "Choose where to search for companies.",
    wizDomainTitle: "Website link, URL, or domain",
    wizDomainDesc: "Find a company by its website URL.",
    wizGmapsTitle: "Google Maps",
    wizGmapsDesc: "Find local businesses in or near a location.",
    wizSalesNavTitle: "LinkedIn Sales Navigator",
    wizSalesNavDesc: "Find companies by name or filters.",
    domainDialogTitle: "Search by website or domain",
    domainDialogDesc: "Paste one or more company URLs or domains, one per line.",
    domainDialogPlaceholder: "acme.com\nhttps://example.io\nwww.someco.com",
    domainDialogDetected: (n: number) => `${n} ${n === 1 ? "domain" : "domains"} detected`,
    domainDialogEmpty: "No domains detected yet.",
    domainDialogApply: "Search",
    searchPeoplePlaceholder: "Search prospects — e.g. VPs of Sales at SaaS companies",
    searchCompanyPlaceholder: "Search companies — e.g. Series B fintechs hiring sales",
    run: "Search",
    filters: "Filters",
    clearAll: "Clear all",
    findValue: "Search values…",
    noValueMatch: "No matching values",
    jobTitle: "Job title",
    addTitle: "Add a job title…",
    results: (n: number) => `${n.toLocaleString()} ${n === 1 ? "result" : "results"}`,
    selectAll: "Select all",
    selectedCount: (n: number) => `${n} selected`,
    selectPage: "Select page",
    deselectPage: "Deselect page",
    selectAllN: (n: number) => `Select all ${n.toLocaleString()}`,
    capLabel: "Max / company",
    capOff: "Off",
    capAria: "Max contacts per company",
    prev: "Prev",
    next: "Next",
    pageOf: (a: number, b: number) => `Page ${a} of ${b}`,
    saveEstimate: (n: number) => `≈ ${n.toLocaleString()} credits to save`,
    freeToSave: "Free to save",
    sortFit: "Best match",
    sortName: "Name (A–Z)",
    sortCompany: "Company",
    sortSize: "Company size",
    sortRecent: "Most recent",
    colName: "Name",
    colCompany: "Company",
    colIndustry: "Industry",
    colSize: "Size",
    colRegion: "Region",
    colFit: "Fit",
    columns: "Columns",
    addSelectedPeople: (n: number) =>
      n > 0 ? `Add ${n} ${n === 1 ? "prospect" : "prospects"}` : "Add prospects",
    addSelectedCompanies: (n: number) =>
      n > 0 ? `Add ${n} ${n === 1 ? "company" : "companies"}` : "Add companies",
    noResults: "No matches — broaden your search or filters.",
    addedPeople: (n: number) => `${n} ${n === 1 ? "prospect" : "prospects"} added`,
    addedCompanies: (n: number) => `${n} ${n === 1 ? "company" : "companies"} added`,
    importTitle: "Import from a file, link, or source",
    importSubtitle:
      "Bring in prospects or companies from a spreadsheet, a URL, or a connected tool.",
    dropHere: "Drag and drop your file here or ",
    browse: "browse",
    fileTypes: "Supports CSV, Excel, JSON, and TSV files (.csv, .xls, .xlsx, .json, .tsv)",
    fileLabel: "Upload a file",
    downloadTemplate: "Download template",
    linkLabel: "Import from a link",
    linkHintPeople: "Paste a URL and we'll import the people from it via our API.",
    linkHintCompanies:
      "Paste a URL and we'll import the companies from it via our API.",
    connectLabel: "Connect a source",
    hubspot: "HubSpot",
    hubspotList: "HubSpot list",
    liConnections: "LinkedIn connections",
    liFollowers: "LinkedIn followers",
    crmViews: (crm: string) => `${crm} views`,
    connectCrm: "Connect a CRM",
    snLeads: "Sales Navigator leads link",
    snCompanies: "Sales Navigator companies link",
    liPost: "LinkedIn post link",
    liSearch: "LinkedIn search results link",
    snLeadsPh: "Paste a Sales Navigator leads search URL",
    snCompaniesPh: "Paste a Sales Navigator companies search URL",
    liPostPh: "Paste a LinkedIn post URL — we'll import everyone who engaged",
    liSearchPh: "Paste a LinkedIn search results URL",
    importBtn: "Import",
    linkBack: "Choose another method",
    importingLink: (label: string) =>
      `Importing from ${label} — we'll add matches shortly`,
    importingFile: "Importing — we'll add matches shortly",
    syncing: "Syncing — this can take a moment",
    dbLabel: "Search in",
    dbKombo: "Kombo",
    dbSalesNav: "Sales Nav",
    dbMore: "More sources",
    dbSoon: "Soon",
    dbGmaps: "Google Maps",
    dbTripadvisor: "TripAdvisor",
    dbCompanyDbs: "Company databases",
  },
  es: {
    addPeople: "Añadir prospectos",
    addCompanies: "Añadir empresas",
    scopeBanner: (names: string) => `Buscando prospectos en ${names}`,
    contact: "Prospectos",
    company: "Empresas",
    search: "Buscar",
    import: "Importar",
    splashSearchTitle: "Buscar",
    splashSearchDesc: "Describe a quién buscas y busca directamente en nuestra base de datos.",
    splashSearchWithFilters: "Buscar con filtros",
    splashGuideTitle: "Guíame",
    splashGuideDesc: "Responde unas preguntas rápidas y crearemos la búsqueda por ti.",
    splashGuideCta: "Iniciar búsqueda guiada",
    splashBack: "Atrás",
    cancel: "Cancelar",
    wizRootTitle: "Encontremos a quién necesitas",
    wizRootDesc: "Empieza indicando cómo quieres añadir registros.",
    wizImportTitle: "Importar",
    wizImportDesc: "Trae prospectos o empresas que ya tienes — un archivo, tu CRM o un enlace.",
    wizSearchTitle: "Buscar",
    wizSearchDesc: "Encuentra nuevos prospectos o empresas directamente en nuestra base de datos.",
    wizImportSourceTitle: "Elige tu fuente de importación",
    wizImportSourceDesc: "Elige cómo quieres traer los registros.",
    wizFileTitle: "Archivo",
    wizFileDesc: "CSV, XLS, XLSX, JSON o TSV",
    wizCrmTitle: "CRM",
    wizCrmDesc: "Importa una vista, lista, consulta o tabla de tu CRM conectado",
    wizLinkTitle: "Enlace",
    wizLinkDesc: "Una URL de LinkedIn, o tu cuenta conectada",
    wizLinkSourceTitle: "Importar desde un enlace de LinkedIn",
    wizLinkSourceDesc: "Pega una URL, o sincroniza directamente desde tu cuenta conectada.",
    wizLiFollowersDesc: "Importa a todos los que siguen tu cuenta de LinkedIn conectada",
    wizConnectLinkedinPrompt: "Conecta tu cuenta de LinkedIn primero para importar tus seguidores.",
    wizConnectLinkedinCta: "Conectar LinkedIn",
    wizSearchEntityTitle: "¿Qué estás buscando?",
    wizSearchEntityDesc: "Elige el tipo de registro que quieres buscar.",
    wizProspectDesc: "Encuentra contactos por cargo, antigüedad o actividad",
    wizCompanyDesc: "Encuentra empresas por sector, tamaño o ubicación",
    wizProspectSourceTitle: "Buscar prospectos",
    wizProspectSourceDesc: "Elige dónde buscar personas.",
    wizKomboDbTitle: "Base de datos de KomboAI",
    wizKomboDbDesc:
      "Encuentra personas en nuestra base de datos de más de 100 millones de contactos. Usamos más de 19 proveedores de datos mediante un sistema de enriquecimiento en cascada que busca teléfonos y correos verificados en secuencia, y personalizamos con información de más de 60 fuentes externas.",
    wizLiDbTitle: "Base de datos de LinkedIn",
    wizLiDbDesc: "Encuentra personas según atributos y parámetros de su perfil o actividad en LinkedIn.",
    wizLookalikeTitle: "Similares",
    wizLookalikeDesc:
      "Encuentra personas similares a otra persona que ya conoces — por nombre, cargo y más.",
    wizCompanySourceTitle: "Buscar empresas",
    wizCompanySourceDesc: "Elige dónde buscar empresas.",
    wizDomainTitle: "Enlace, URL o dominio del sitio web",
    wizDomainDesc: "Encuentra una empresa por la URL de su sitio web.",
    wizGmapsTitle: "Google Maps",
    wizGmapsDesc: "Encuentra negocios locales en una ubicación o cerca de ella.",
    wizSalesNavTitle: "LinkedIn Sales Navigator",
    wizSalesNavDesc: "Encuentra empresas por nombre o filtros.",
    domainDialogTitle: "Buscar por sitio web o dominio",
    domainDialogDesc: "Pega una o más URLs o dominios de empresas, uno por línea.",
    domainDialogPlaceholder: "acme.com\nhttps://example.io\nwww.someco.com",
    domainDialogDetected: (n: number) => `${n} ${n === 1 ? "dominio detectado" : "dominios detectados"}`,
    domainDialogEmpty: "Aún no se ha detectado ningún dominio.",
    domainDialogApply: "Buscar",
    searchPeoplePlaceholder: "Busca prospectos — p. ej. VPs de Ventas en empresas SaaS",
    searchCompanyPlaceholder: "Busca empresas — p. ej. fintechs Serie B contratando ventas",
    run: "Buscar",
    filters: "Filtros",
    clearAll: "Limpiar todo",
    findValue: "Buscar valores…",
    noValueMatch: "Sin valores coincidentes",
    jobTitle: "Cargo",
    addTitle: "Añadir un cargo…",
    results: (n: number) => `${n.toLocaleString()} ${n === 1 ? "resultado" : "resultados"}`,
    selectAll: "Seleccionar todo",
    selectedCount: (n: number) => `${n} seleccionados`,
    selectPage: "Seleccionar página",
    deselectPage: "Deseleccionar página",
    selectAllN: (n: number) => `Seleccionar todos (${n.toLocaleString()})`,
    capLabel: "Máx / empresa",
    capOff: "Todos",
    capAria: "Máx contactos por empresa",
    prev: "Anterior",
    next: "Siguiente",
    pageOf: (a: number, b: number) => `Página ${a} de ${b}`,
    saveEstimate: (n: number) => `≈ ${n.toLocaleString()} créditos para guardar`,
    freeToSave: "Guardar es gratis",
    sortFit: "Mejor coincidencia",
    sortName: "Nombre (A–Z)",
    sortCompany: "Empresa",
    sortSize: "Tamaño de empresa",
    sortRecent: "Más reciente",
    colName: "Nombre",
    colCompany: "Empresa",
    colIndustry: "Sector",
    colSize: "Tamaño",
    colRegion: "Región",
    colFit: "Encaje",
    columns: "Columnas",
    addSelectedPeople: (n: number) =>
      n > 0 ? `Añadir ${n} ${n === 1 ? "prospecto" : "prospectos"}` : "Añadir prospectos",
    addSelectedCompanies: (n: number) =>
      n > 0 ? `Añadir ${n} ${n === 1 ? "empresa" : "empresas"}` : "Añadir empresas",
    noResults: "Sin coincidencias — amplía tu búsqueda o filtros.",
    addedPeople: (n: number) => `${n} ${n === 1 ? "prospecto añadido" : "prospectos añadidos"}`,
    addedCompanies: (n: number) => `${n} ${n === 1 ? "empresa añadida" : "empresas añadidas"}`,
    importTitle: "Importar desde un archivo, enlace o fuente",
    importSubtitle:
      "Trae prospectos o empresas desde una hoja de cálculo, una URL o una herramienta conectada.",
    dropHere: "Arrastra tu archivo aquí o ",
    browse: "explora",
    fileTypes: "Admite archivos CSV, Excel, JSON y TSV (.csv, .xls, .xlsx, .json, .tsv)",
    fileLabel: "Sube un archivo",
    downloadTemplate: "Descargar plantilla",
    linkLabel: "Importar desde un enlace",
    linkHintPeople:
      "Pega una URL y importaremos las personas desde ella con nuestra API.",
    linkHintCompanies:
      "Pega una URL y importaremos las empresas desde ella con nuestra API.",
    connectLabel: "Conecta una fuente",
    hubspot: "HubSpot",
    hubspotList: "Lista de HubSpot",
    liConnections: "Conexiones de LinkedIn",
    liFollowers: "Seguidores de LinkedIn",
    crmViews: (crm: string) => `Vistas de ${crm}`,
    connectCrm: "Conecta un CRM",
    snLeads: "Enlace de leads de Sales Navigator",
    snCompanies: "Enlace de empresas de Sales Navigator",
    liPost: "Enlace de publicación de LinkedIn",
    liSearch: "Enlace de resultados de búsqueda de LinkedIn",
    snLeadsPh: "Pega una URL de búsqueda de leads de Sales Navigator",
    snCompaniesPh: "Pega una URL de búsqueda de empresas de Sales Navigator",
    liPostPh: "Pega la URL de una publicación de LinkedIn — importaremos a quienes interactuaron",
    liSearchPh: "Pega una URL de resultados de búsqueda de LinkedIn",
    importBtn: "Importar",
    linkBack: "Elegir otro método",
    importingLink: (label: string) =>
      `Importando desde ${label} — añadiremos las coincidencias en breve`,
    importingFile: "Importando — añadiremos las coincidencias en breve",
    syncing: "Sincronizando — puede tardar un momento",
    dbLabel: "Buscar en",
    dbKombo: "Kombo",
    dbSalesNav: "Sales Nav",
    dbMore: "Más fuentes",
    dbSoon: "Pronto",
    dbGmaps: "Google Maps",
    dbTripadvisor: "TripAdvisor",
    dbCompanyDbs: "Bases de datos de empresas",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

function entityFromKind(kind: Kind): AiEntity {
  return kind === "company" ? "companies" : "people"
}

// The CRM the user has connected — the "views" import method is dynamic and
// points at whichever CRM is integrated (Salesforce in the mockups is just an
// example). Null when no CRM is connected yet.
const CONNECTED_CRM =
  integrations.find((i) => i.category === "crm" && i.connected)?.name ?? null

// Whether the user's LinkedIn account is connected — gates the "Followers"
// import method, which syncs from that account rather than a pasted URL.
const CONNECTED_LINKEDIN = Boolean(
  integrations.find((i) => i.name === "LinkedIn" && i.connected)
)

// Results paging + selection limits for the add flow.
const PAGE_SIZE = 25
const MAX_SELECT = MAX_ENRICH_BATCH // 1,000

// People search: keep at most `cap` contacts per company (order preserved).
function capLeads(leads: AiLead[], cap: number | null): AiLead[] {
  if (cap == null) return leads
  const seen = new Map<string, number>()
  const out: AiLead[] = []
  for (const l of leads) {
    const key = l.company.toLowerCase()
    const n = seen.get(key) ?? 0
    if (n < cap) {
      out.push(l)
      seen.set(key, n + 1)
    }
  }
  return out
}

/**
 * Full-screen, full-featured "add records" search. Adding prospects or
 * companies is always a search within a database (with filters, sorting, a
 * results table and multi-select) or an import from a file / source — never a
 * manual form. The same modal serves both, with the entity toggle pre-set.
 */
export function AddRecordsDialog({
  open,
  onOpenChange,
  kind,
  listId,
  scopeCompanies,
  allowEntityToggle = false,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  kind: Kind
  // When set, materialized records are also added to this list (used from a
  // list detail page so the full-screen search/import flow is reused there).
  listId?: string
  // When set, the people search is scoped to these company names (account-based
  // flow: pick companies → find their contacts).
  scopeCompanies?: string[]
  // Every existing entry point already knows its entity (a Prospects list,
  // a Companies list, "Find contacts" from an account, etc.) — the
  // Prospects/Companies toggle only makes sense for a generic, unscoped
  // entry point (Home's "Find prospects & companies" quick action, and the
  // sidebar's "Search" nav item).
  allowEntityToggle?: boolean
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()

  const [entity, setEntity] = React.useState<AiEntity>(entityFromKind(kind))
  const [mode, setMode] = React.useState<Mode>("search")
  const [screen, setScreen] = React.useState<Screen>("results")
  const [input, setInput] = React.useState("")
  const [query, setQuery] = React.useState<AiQuery>({ ...EMPTY_QUERY })
  const [sortKey, setSortKey] = React.useState<SortKey>("fit")
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [linkedinOn, setLinkedinOn] = React.useState(false)
  const [wasOpen, setWasOpen] = React.useState(false)
  const [page, setPage] = React.useState(0)
  const [perCompanyCap, setPerCompanyCap] = React.useState<number | null>(null)
  const [columnsOpen, setColumnsOpen] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  // Which link-paste method the guided wizard preselected, if any — read once
  // by ImportPane on mount to land straight on that method's URL box.
  const [pendingActiveLink, setPendingActiveLink] = React.useState<string | null>(null)

  // Customizable result columns — the same shared registry + ColumnManager the
  // Search page uses, so the add-modal exposes the identical columns + picker.
  const leadColPrefs = useColumnPrefs("add-people", LEAD_RESULT_DEFAULT_IDS)
  const companyColPrefs = useColumnPrefs("add-companies", COMPANY_RESULT_DEFAULT_IDS)

  const scoped = (scopeCompanies?.length ?? 0) > 0
  // Only opens that actually visited the splash have anywhere to go "back" to.
  const cameFromSplash = !scoped

  if (open && !wasOpen) {
    setWasOpen(true)
    // Scoping to companies means we're finding their people.
    setEntity(scoped ? "people" : entityFromKind(kind))
    setMode("search")
    // A scoped open (e.g. "Find contacts" from a company list) already has
    // clear intent — skip the splash and land straight on results, same as
    // before this screen existed.
    setScreen(scoped ? "results" : "splash")
    setInput("")
    setQuery({ ...EMPTY_QUERY })
    setSortKey("fit")
    setSelected(new Set())
    setLinkedinOn(false)
    setPage(0)
    setPerCompanyCap(null)
    setColumnsOpen(false)
    setConfirmOpen(false)
  }
  if (!open && wasOpen) setWasOpen(false)

  const scopeSet = React.useMemo(
    () => new Set((scopeCompanies ?? []).map((s) => s.toLowerCase())),
    [scopeCompanies]
  )
  const leads = React.useMemo(() => {
    const base = sortLeads(searchLeads(query), sortKey)
    if (!scopeSet.size) return base
    const filtered = base.filter((l) => scopeSet.has(l.company.toLowerCase()))
    // Mock fallback: the demo lead catalog may not overlap the selected
    // accounts, so still surface people rather than an empty table.
    return filtered.length ? filtered : base
  }, [query, sortKey, scopeSet])
  const companies = React.useMemo(
    () => sortCompanies(searchCompanies(query), sortKey),
    [query, sortKey]
  )

  function switchEntity(next: AiEntity) {
    setEntity(next)
    setSelected(new Set())
    setPage(0)
    setPerCompanyCap(null)
  }
  function runSearch() {
    setQuery((prev) => ({ ...interpretPrompt(input).query, facets: prev.facets }))
    setSelected(new Set())
    setPage(0)
  }
  // Submitting the splash screen's search box runs the same search and moves
  // to the results screen — "the screen they get today".
  function runSplashSearch() {
    runSearch()
    setScreen("results")
  }
  // "Search with filters" skips the AI prompt — it jumps to the same results
  // screen with the filters rail (always visible there) ready to build a
  // query from scratch instead of describing it in the prompt.
  function runSplashWithFilters() {
    setScreen("results")
  }
  // Guided-wizard resolutions — each leaf lands on the existing results/import
  // screens (or hands off to the Search page for sources it already owns fully)
  // instead of re-implementing that UI a second time inside the wizard.
  function wizardGoImport(activeLink?: string) {
    setPendingActiveLink(activeLink ?? null)
    setMode("import")
    setScreen("results")
  }
  function wizardGoSearch(source: "kombo" | "linkedin") {
    setLinkedinOn(source === "linkedin")
    setMode("search")
    setScreen("results")
  }
  function wizardDomainSearch(domains: string[]) {
    setEntity("companies")
    setQuery((prev) => ({ ...prev, companyDomains: domains }))
    setMode("search")
    setScreen("results")
  }
  function wizardLookalikes() {
    onOpenChange(false)
    navigate("/search", { state: { openLookalike: true, entity } })
  }
  function wizardGoogleMaps() {
    onOpenChange(false)
    navigate("/search", { state: { initialSource: "google_maps" } })
  }
  // Shared by every ImportPane instance (the splash frame's and the results
  // screen's) so both stay in sync with a single implementation.
  function handleImportFile() {
    toast.success(c.importingFile)
    onOpenChange(false)
  }
  function handleImportConnect() {
    leave("/integrations")
  }
  function handleImportSync() {
    toast.success(c.syncing)
    onOpenChange(false)
  }
  function handleImportLink(label: string) {
    toast.success(c.importingLink(label))
    onOpenChange(false)
  }
  // A blank CSV matching the columns the file-upload importer expects, with
  // one example row so it's clear what goes in each column.
  function downloadImportTemplate() {
    if (entity === "people") {
      downloadCsv(
        "kombo-prospects-template.csv",
        ["First Name", "Last Name", "Email", "Title", "Company", "LinkedIn URL"],
        [["Jane", "Doe", "jane@acme.com", "VP of Sales", "Acme Inc", "linkedin.com/in/janedoe"]]
      )
    } else {
      downloadCsv(
        "kombo-companies-template.csv",
        ["Company Name", "Website", "Industry", "Headcount", "Region"],
        [["Acme Inc", "acme.com", "SaaS", "51-200", "North America"]]
      )
    }
  }
  // Filter mutations (typed groups + facets). Every change resets the
  // selection & page, like the old toggle handlers did. Values arrive raw —
  // excluded ones carry the "!" prefix (see filter-polarity.ts).
  function resetSelection() {
    setSelected(new Set())
    setPage(0)
  }
  function addGroupValue(key: keyof AiQuery, value: string) {
    resetSelection()
    setQuery((prev) => {
      const arr = prev[key] as string[]
      return arr.includes(value) ? prev : { ...prev, [key]: [...arr, value] }
    })
  }
  function removeGroupValue(key: keyof AiQuery, value: string) {
    resetSelection()
    setQuery((prev) => ({
      ...prev,
      [key]: (prev[key] as string[]).filter((v) => v !== value),
    }))
  }
  function clearGroupValues(key: keyof AiQuery) {
    resetSelection()
    setQuery((prev) => ({ ...prev, [key]: [] }))
  }
  function addFacetValue(facetId: string, value: string) {
    resetSelection()
    setQuery((prev) => {
      const cur = prev.facets[facetId] ?? []
      if (cur.includes(value)) return prev
      return { ...prev, facets: { ...prev.facets, [facetId]: [...cur, value] } }
    })
  }
  function removeFacetValue(facetId: string, value: string) {
    resetSelection()
    setQuery((prev) => {
      const next = (prev.facets[facetId] ?? []).filter((v) => v !== value)
      const facets = { ...prev.facets }
      if (next.length) facets[facetId] = next
      else delete facets[facetId]
      return { ...prev, facets }
    })
  }
  function clearFacetValues(facetId: string) {
    resetSelection()
    setQuery((prev) => {
      const facets = { ...prev.facets }
      delete facets[facetId]
      return { ...prev, facets }
    })
  }
  function clearFilters() {
    setQuery((prev) => ({ ...EMPTY_QUERY, keywords: prev.keywords }))
    setSelected(new Set())
    setPage(0)
  }
  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function selectPage() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allPageSelected) pageIds.forEach((id) => next.delete(id))
      else pageIds.forEach((id) => next.add(id))
      return next
    })
  }
  function selectAllResults() {
    setSelected(new Set(allIds.slice(0, MAX_SELECT)))
  }
  function applyCap(cap: number | null) {
    setPerCompanyCap(cap)
    setPage(0)
    if (cap != null && entity === "people") {
      setSelected(
        new Set(capLeads(leads, cap).map((l) => l.id).slice(0, MAX_SELECT))
      )
    }
  }
  // Footer "Add" opens the credit-cost confirmation; the commit only runs once
  // the user confirms (see commitSelected), so the estimate is always the last
  // step before spending credits.
  function addSelected() {
    if (selected.size === 0) return
    setConfirmOpen(true)
  }
  function commitSelected() {
    if (selected.size === 0) return
    if (entity === "people") {
      const chosen = leads.filter((l) => selected.has(l.id))
      const newIds = chosen.map(materializeLead)
      if (listId) listStore.addProspects(listId, newIds)
      toast.success(c.addedPeople(chosen.length))
    } else {
      const chosen = companies.filter((co) => selected.has(co.id))
      const newIds = chosen.map(materializeCompany)
      if (listId) listStore.addAccounts(listId, newIds)
      toast.success(c.addedCompanies(chosen.length))
    }
    onOpenChange(false)
  }
  function leave(to: string) {
    onOpenChange(false)
    navigate(to)
  }

  const groups = SEARCH_FILTER_GROUPS.filter(
    (g) => !(g.linkedinOnly && !linkedinOn) && !(g.scope && g.scope !== entity)
  )
  const facetDefs = facetsForDb(linkedinOn ? "linkedin" : "kombo", entity)

  // Typed groups + per-database facets flattened into the shared sectioned
  // catalog; handlers dispatch by id (group key vs facet id — no overlap).
  const groupKeys = new Set<string>(groups.map((g) => g.key as string))
  const catalogFilters: CatalogFilterDef[] = [
    ...groups.map((g) => ({
      id: g.key as string,
      label: g.label[locale],
      options: g.options,
      section: g.section,
      popular: g.popular,
      linkedin: g.linkedinOnly,
    })),
    ...facetDefs.map((f) => ({
      id: f.id,
      label: f.label[locale],
      options: f.options,
      section: facetSection(f),
      popular: f.popular,
      linkedin: f.db === "linkedin",
    })),
  ]

  // External company databases — picking one hands off to the Search page
  // preset to that source, where the full flow (map preview, facets) lives.
  const externalDbs = [
    { key: "google_maps" as const, label: c.dbGmaps, icon: <MapPin className="size-4 text-emerald-600" /> },
    { key: "tripadvisor" as const, label: c.dbTripadvisor, icon: <Star className="size-4 text-amber-500" /> },
  ]
  // Databases on the roadmap — shown as disabled "Soon" entries so the selector
  // reads as an extensible list, not a fixed Kombo/Sales Nav toggle.
  const comingSoonDbs = [
    { key: "company-dbs", label: c.dbCompanyDbs, icon: <Building2 className="text-primary size-4" /> },
  ]
  const activeFilterCount =
    groups.reduce((n, g) => n + (query[g.key] as string[]).length, 0) +
    facetDefs.reduce((n, f) => n + (query.facets[f.id]?.length ?? 0), 0)

  // Per-company cap (people) → paged results → page/all selection. Plain consts
  // so the React compiler can memoize them (manual useMemo isn't preservable
  // here); capLeads is pure and cheap.
  const cappedLeads = capLeads(leads, entity === "people" ? perCompanyCap : null)
  const total = entity === "people" ? cappedLeads.length : companies.length
  const allIds =
    entity === "people"
      ? cappedLeads.map((l) => l.id)
      : companies.map((co) => co.id)
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount - 1)
  const pageStart = currentPage * PAGE_SIZE
  const pageLeads = cappedLeads.slice(pageStart, pageStart + PAGE_SIZE)
  const pageCompanies = companies.slice(pageStart, pageStart + PAGE_SIZE)
  const pageIds =
    entity === "people"
      ? pageLeads.map((l) => l.id)
      : pageCompanies.map((co) => co.id)
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id))
  const somePageSelected = pageIds.some((id) => selected.has(id))
  const selectableCount = Math.min(total, MAX_SELECT)

  // Selection wiring for the shared DataTable. The header checkbox toggles the
  // current page (matching the "Select page" affordance in the toolbar).
  const leadSelection: TableSelection<AiLead> = {
    isSelected: (l) => selected.has(l.id),
    toggle: (l) => toggle(l.id),
    toggleAll: selectPage,
    allSelected: allPageSelected,
    someSelected: somePageSelected && !allPageSelected,
  }
  const companySelection: TableSelection<AiCompany> = {
    isSelected: (co) => selected.has(co.id),
    toggle: (co) => toggle(co.id),
    toggleAll: selectPage,
    allSelected: allPageSelected,
    someSelected: somePageSelected && !allPageSelected,
  }
  const sortOptions: { key: SortKey; label: string }[] =
    entity === "people"
      ? [
          { key: "fit", label: c.sortFit },
          { key: "name", label: c.sortName },
          { key: "company", label: c.sortCompany },
          { key: "recent", label: c.sortRecent },
        ]
      : [
          { key: "fit", label: c.sortFit },
          { key: "name", label: c.sortName },
          { key: "headcount", label: c.sortSize },
          { key: "recent", label: c.sortRecent },
        ]
  const sortLabel = sortOptions.find((o) => o.key === sortKey)?.label ?? c.sortFit
  const title = entity === "people" ? c.addPeople : c.addCompanies

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton fullScreen>
        {screen !== "results" && <DialogTitle className="sr-only">{title}</DialogTitle>}
        {screen === "splash" ? (
          <>
            {/* Shared frame for both Search and Import — switching modes here
                never leaves this lightweight splash chrome for the busy
                results-screen header (that only happens once a search is
                actually submitted). */}
            <div className="flex flex-wrap items-center justify-center gap-3 border-b px-6 py-3">
              {allowEntityToggle && (
                <Segmented
                  options={[
                    { v: "people" as AiEntity, label: c.contact, icon: Users },
                    { v: "companies" as AiEntity, label: c.company, icon: Building2 },
                  ]}
                  value={entity}
                  onChange={switchEntity}
                />
              )}
              <Segmented
                options={[
                  { v: "search" as Mode, label: c.search, icon: Search },
                  { v: "import" as Mode, label: c.import, icon: Upload },
                ]}
                value={mode}
                onChange={setMode}
              />
            </div>
            {mode === "search" ? (
              <SplashScreen
                entity={entity}
                input={input}
                onInputChange={setInput}
                onSubmit={runSplashSearch}
                onSearchWithFilters={runSplashWithFilters}
                onGuideMe={() => setScreen("wizard")}
                c={c}
              />
            ) : (
              <ImportPane
                entity={entity}
                c={c}
                initialActiveLink={pendingActiveLink}
                onFile={handleImportFile}
                onConnect={handleImportConnect}
                onSync={handleImportSync}
                onLinkImport={handleImportLink}
                onDownloadTemplate={downloadImportTemplate}
              />
            )}
          </>
        ) : screen === "wizard" ? (
          <GuidedWizard
            entity={entity}
            allowEntityToggle={allowEntityToggle}
            onEntityChange={switchEntity}
            onBack={() => setScreen("splash")}
            onGoImportFile={() => wizardGoImport()}
            onGoImportCrm={() => wizardGoImport()}
            onGoImportLink={(method) => wizardGoImport(method)}
            connectedLinkedin={CONNECTED_LINKEDIN}
            onSyncLinkedin={() => {
              toast.success(c.syncing)
              onOpenChange(false)
            }}
            onConnectLinkedin={() => leave("/integrations")}
            onGoSearch={wizardGoSearch}
            onLookalikes={wizardLookalikes}
            onGoogleMaps={wizardGoogleMaps}
            onDomainSearch={wizardDomainSearch}
            c={c}
          />
        ) : (
        <>
        <header className="relative flex flex-wrap items-center gap-x-6 gap-y-3 border-b px-6 py-3 pr-14">
          {cameFromSplash && (
            <button
              type="button"
              onClick={() => {
                setMode("search")
                setScreen("splash")
              }}
              aria-label={c.splashBack}
              className="text-muted-foreground hover:text-foreground hover:bg-muted -ml-1.5 flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
          {/* Centered to match the splash screen's shared Search/Import chrome. */}
          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3">
            {allowEntityToggle && (
              <Segmented
                options={[
                  { v: "people" as AiEntity, label: c.contact, icon: Users },
                  { v: "companies" as AiEntity, label: c.company, icon: Building2 },
                ]}
                value={entity}
                onChange={switchEntity}
              />
            )}
            <Segmented
              options={[
                { v: "search" as Mode, label: c.search, icon: Search },
                { v: "import" as Mode, label: c.import, icon: Upload },
              ]}
              value={mode}
              onChange={setMode}
            />
          </div>
        </header>

        {scoped && (
          <div className="text-muted-foreground bg-primary/[0.04] flex items-center gap-2 border-b px-6 py-2 text-sm">
            <Building2 className="text-primary size-4 shrink-0" />
            <span className="truncate">
              {c.scopeBanner((scopeCompanies ?? []).join(", "))}
            </span>
          </div>
        )}

        {mode === "search" ? (
          <>
            <div className="flex min-h-0 flex-1 overflow-hidden">
              {/* Filters rail — exposed by default */}
              <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r md:flex">
                <div className="flex items-center justify-between border-b px-3 py-2.5">
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <SlidersHorizontal className="size-4" />
                    {c.filters}
                    {activeFilterCount > 0 && (
                      <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                        {activeFilterCount}
                      </span>
                    )}
                  </span>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >
                      {c.clearAll}
                    </button>
                  )}
                </div>
                {/* Database — switches the per-database facet catalog. Scales to
                    N sources; extras beyond Kombo/Sales Nav are on the roadmap. */}
                <div className="border-b p-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between"
                        title={c.dbLabel}
                      >
                        <span className="flex items-center gap-1.5">
                          {linkedinOn ? (
                            <LinkedinIcon className="size-4 text-[#0a66c2]" />
                          ) : (
                            <Database className="text-primary size-4" />
                          )}
                          {linkedinOn ? c.dbSalesNav : c.dbKombo}
                        </span>
                        <ChevronDown className="text-muted-foreground size-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel className="text-muted-foreground text-xs">
                        {c.dbLabel}
                      </DropdownMenuLabel>
                      <DropdownMenuItem className="gap-2" onClick={() => setLinkedinOn(false)}>
                        <Database className="text-primary size-4" />
                        <span className="flex-1">{c.dbKombo}</span>
                        {!linkedinOn && <CheckCircle2 className="text-primary size-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onClick={() => setLinkedinOn(true)}>
                        <LinkedinIcon className="size-4 text-[#0a66c2]" />
                        <span className="flex-1">{c.dbSalesNav}</span>
                        {linkedinOn && <CheckCircle2 className="text-primary size-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-muted-foreground text-xs">
                        {c.dbMore}
                      </DropdownMenuLabel>
                      {externalDbs.map((s) => (
                        <DropdownMenuItem
                          key={s.key}
                          className="gap-2"
                          onClick={() => {
                            onOpenChange(false)
                            navigate("/search", {
                              state: { initialSource: s.key },
                            })
                          }}
                        >
                          {s.icon}
                          <span className="flex-1">{s.label}</span>
                        </DropdownMenuItem>
                      ))}
                      {comingSoonDbs.map((s) => (
                        <DropdownMenuItem
                          key={s.key}
                          disabled
                          className="gap-2 opacity-100"
                        >
                          <span className="opacity-60">{s.icon}</span>
                          <span className="flex-1 opacity-60">{s.label}</span>
                          <Badge variant="secondary" className="shrink-0 text-[10px]">
                            {c.dbSoon}
                          </Badge>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="p-1">
                  <FilterCatalog
                    filters={catalogFilters}
                    selected={(id) =>
                      groupKeys.has(id)
                        ? (query[id as keyof AiQuery] as string[])
                        : (query.facets[id] ?? [])
                    }
                    onInclude={(id, v) =>
                      groupKeys.has(id)
                        ? addGroupValue(id as keyof AiQuery, v)
                        : addFacetValue(id, v)
                    }
                    onExclude={(id, v) =>
                      groupKeys.has(id)
                        ? addGroupValue(id as keyof AiQuery, excludeValue(v))
                        : addFacetValue(id, excludeValue(v))
                    }
                    onRemove={(id, v) =>
                      groupKeys.has(id)
                        ? removeGroupValue(id as keyof AiQuery, v)
                        : removeFacetValue(id, v)
                    }
                    onClear={(id) =>
                      groupKeys.has(id)
                        ? clearGroupValues(id as keyof AiQuery)
                        : clearFacetValues(id)
                    }
                    locale={locale}
                  />
                </div>
              </aside>

              {/* Main: prompt + sort, then results table */}
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap items-center gap-2 border-b px-6 py-3">
                  <div className="relative min-w-[16rem] flex-1">
                    <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                      autoFocus
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && input.trim().length >= 2) runSearch()
                      }}
                      placeholder={
                        entity === "people"
                          ? c.searchPeoplePlaceholder
                          : c.searchCompanyPlaceholder
                      }
                      clearable={false}
                      className="h-10 pl-9"
                    />
                  </div>
                  <Button
                    variant="volt"
                    className="h-10"
                    onClick={runSearch}
                    disabled={input.trim().length < 2}
                  >
                    <Search className="size-4" />
                    {c.run}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-10">
                        <ArrowDownUp className="size-4" />
                        <span className="hidden sm:inline">{sortLabel}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {sortOptions.map((o) => (
                        <DropdownMenuItem key={o.key} onClick={() => setSortKey(o.key)}>
                          {o.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    className="h-10"
                    onClick={() => setColumnsOpen(true)}
                  >
                    <Columns3 className="size-4" />
                    <span className="hidden sm:inline">{c.columns}</span>
                  </Button>
                </div>

                {/* Results toolbar: count, page/all selection, per-company cap */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-6 py-2 text-xs">
                  <span className="text-muted-foreground">{c.results(total)}</span>
                  {total > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={selectPage}
                        className="text-primary font-medium hover:underline"
                      >
                        {allPageSelected ? c.deselectPage : c.selectPage}
                      </button>
                      {selected.size < selectableCount && (
                        <button
                          type="button"
                          onClick={selectAllResults}
                          className="text-primary font-medium hover:underline"
                        >
                          {c.selectAllN(selectableCount)}
                        </button>
                      )}
                      {entity === "people" && (
                        <PerCompanyCap
                          className="ml-auto"
                          value={perCompanyCap}
                          onChange={applyCap}
                          label={c.capLabel}
                          offLabel={c.capOff}
                          ariaLabel={c.capAria}
                        />
                      )}
                    </>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-3">
                  {entity === "people" ? (
                    <DataTable
                      columns={LEAD_RESULT_COLUMNS}
                      visible={leadColPrefs.visible}
                      rows={pageLeads}
                      rowKey={(l) => l.id}
                      locale={locale}
                      selection={leadSelection}
                      empty={c.noResults}
                    />
                  ) : (
                    <DataTable
                      columns={COMPANY_RESULT_COLUMNS}
                      visible={companyColPrefs.visible}
                      rows={pageCompanies}
                      rowKey={(co) => co.id}
                      locale={locale}
                      selection={companySelection}
                      empty={c.noResults}
                    />
                  )}
                </div>

                {pageCount > 1 && (
                  <div className="flex items-center justify-center gap-3 border-t px-6 py-2 text-xs">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7"
                      disabled={currentPage === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                      {c.prev}
                    </Button>
                    <span className="text-muted-foreground tabular-nums">
                      {c.pageOf(currentPage + 1, pageCount)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7"
                      disabled={currentPage >= pageCount - 1}
                      onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                    >
                      {c.next}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Action bar */}
            <footer className="flex items-center justify-between gap-3 border-t px-6 py-3">
              <div className="min-w-0">
                <span className="text-muted-foreground text-sm tabular-nums">
                  {c.selectedCount(selected.size)}
                </span>
                {selected.size > 0 && (
                  <span className="text-muted-foreground ml-2 text-xs">
                    {entity === "people"
                      ? c.saveEstimate(selected.size * SAVE_COST.prospect)
                      : c.freeToSave}
                  </span>
                )}
              </div>
              <Button variant="volt" disabled={selected.size === 0} onClick={addSelected}>
                {entity === "people"
                  ? c.addSelectedPeople(selected.size)
                  : c.addSelectedCompanies(selected.size)}
              </Button>
            </footer>
          </>
        ) : (
          <ImportPane
            entity={entity}
            c={c}
            initialActiveLink={pendingActiveLink}
            onFile={handleImportFile}
            onConnect={handleImportConnect}
            onSync={handleImportSync}
            onLinkImport={handleImportLink}
            onDownloadTemplate={downloadImportTemplate}
          />
        )}
        </>
        )}
      </DialogContent>
    </Dialog>

    {entity === "people" ? (
      <ColumnManager
        open={columnsOpen}
        onOpenChange={setColumnsOpen}
        columns={LEAD_RESULT_COLUMNS}
        groups={LEAD_RESULT_GROUPS}
        prefs={leadColPrefs}
        locale={locale}
      />
    ) : (
      <ColumnManager
        open={columnsOpen}
        onOpenChange={setColumnsOpen}
        columns={COMPANY_RESULT_COLUMNS}
        groups={COMPANY_RESULT_GROUPS}
        prefs={companyColPrefs}
        locale={locale}
      />
    )}

    <AddCostConfirm
      open={confirmOpen}
      onOpenChange={setConfirmOpen}
      count={selected.size}
      entity={entity}
      onConfirm={commitSelected}
    />
    </>
  )
}

// A row of numbered circles previewing the guided flow's step count — shown
// both on the splash's "Guide me" side and on the wizard placeholder itself.
function StepPreview() {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3].map((n, i) => (
        <React.Fragment key={n}>
          <span className="border-primary/40 text-primary bg-primary/5 flex size-7 items-center justify-center rounded-full border text-xs font-semibold">
            {n}
          </span>
          {i < 2 && <span className="bg-border h-px w-4" />}
        </React.Fragment>
      ))}
    </div>
  )
}

// The pre-step splash screen: a vertical split between a direct search (left,
// submits into today's existing results screen) and the entry point for a
// guided, step-by-step wizard (right — its actual questions arrive later).
function SplashScreen({
  entity,
  input,
  onInputChange,
  onSubmit,
  onSearchWithFilters,
  onGuideMe,
  c,
}: {
  entity: AiEntity
  input: string
  onInputChange: (v: string) => void
  onSubmit: () => void
  onSearchWithFilters: () => void
  onGuideMe: () => void
  c: Copy
}) {
  return (
    <div className="divide-border flex min-h-0 flex-1 divide-x">
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
          <Search className="text-primary size-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">{c.splashSearchTitle}</h2>
          <p className="text-muted-foreground mt-1 max-w-xs text-sm">{c.splashSearchDesc}</p>
        </div>
        <form
          className="flex w-full max-w-sm items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (input.trim().length >= 2) onSubmit()
          }}
        >
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              autoFocus
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={
                entity === "people" ? c.searchPeoplePlaceholder : c.searchCompanyPlaceholder
              }
              clearable={false}
              className="h-10 pl-9"
            />
          </div>
          <Button
            type="submit"
            variant="volt"
            size="icon"
            className="h-10 shrink-0"
            aria-label={c.run}
            disabled={input.trim().length < 2}
          >
            <ArrowRight className="size-4" />
          </Button>
        </form>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onSearchWithFilters}
          className="text-muted-foreground hover:text-foreground gap-1.5"
        >
          <SlidersHorizontal className="size-3.5" />
          {c.splashSearchWithFilters}
        </Button>
      </div>

      <button
        type="button"
        onClick={onGuideMe}
        className="hover:bg-muted/40 flex min-w-0 flex-1 flex-col items-center justify-center gap-4 p-8 text-center transition-colors"
      >
        <span className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
          <Compass className="text-primary size-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">{c.splashGuideTitle}</h2>
          <p className="text-muted-foreground mt-1 max-w-xs text-sm">{c.splashGuideDesc}</p>
        </div>
        <StepPreview />
        <span className="text-primary inline-flex items-center gap-1 text-sm font-medium">
          {c.splashGuideCta}
          <ArrowRight className="size-4" />
        </span>
      </button>
    </div>
  )
}

// The guided wizard's question tree — a Lemlist-style "pick a big card"
// narrowing flow. The root question is always Import vs Search; each answer
// pushes one step deeper until a leaf is reached, at which point the parent
// resolves it onto the existing results/import screens (or, for sources the
// Search page already owns fully — Lookalikes, Google Maps — hands off there
// instead of duplicating that experience a second time).
type WizStep =
  | "root"
  | "import-source"
  | "import-link"
  | "search-entity"
  | "prospect-source"
  | "company-source"

function WizardStepHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{desc}</p>
    </div>
  )
}

function WizardOption({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: React.ReactNode
  description: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:border-primary/40 hover:bg-muted/40 group flex w-full items-start gap-3.5 rounded-xl border p-4 text-left transition-colors"
    >
      <span className="bg-muted flex size-11 shrink-0 items-center justify-center rounded-lg">
        <Icon className="text-muted-foreground size-5" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
      </div>
      <ArrowRight className="text-muted-foreground mt-3 size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  )
}

// Import → Link: a URL-paste method per entity, plus "Followers" — which
// syncs the connected LinkedIn account instead of taking a pasted URL, so it
// needs its own connected/not-connected branch.
function ImportLinkStep({
  entity,
  c,
  connectedLinkedin,
  onPick,
  onSync,
  onConnect,
}: {
  entity: AiEntity
  c: Copy
  connectedLinkedin: boolean
  onPick: (method: string) => void
  onSync: () => void
  onConnect: () => void
}) {
  const [needsConnect, setNeedsConnect] = React.useState(false)

  const methods: {
    key: string
    label: string
    desc: string
    icon: React.ComponentType<{ className?: string }>
  }[] =
    entity === "people"
      ? [
          { key: "sn-leads", label: c.snLeads, desc: c.snLeadsPh, icon: Compass },
          { key: "li-search", label: c.liSearch, desc: c.liSearchPh, icon: LinkedinIcon },
          { key: "li-post", label: c.liPost, desc: c.liPostPh, icon: LinkedinIcon },
        ]
      : [{ key: "sn-companies", label: c.snCompanies, desc: c.snCompaniesPh, icon: Compass }]

  return (
    <>
      <WizardStepHeader title={c.wizLinkSourceTitle} desc={c.wizLinkSourceDesc} />
      <div className="space-y-3">
        {methods.map((m) => (
          <WizardOption
            key={m.key}
            icon={m.icon}
            title={m.label}
            description={m.desc}
            onClick={() => onPick(m.key)}
          />
        ))}
        {entity === "people" && (
          <WizardOption
            icon={LinkedinIcon}
            title={c.liFollowers}
            description={c.wizLiFollowersDesc}
            onClick={() => {
              if (connectedLinkedin) onSync()
              else setNeedsConnect(true)
            }}
          />
        )}
      </div>
      {needsConnect && (
        <div className="border-primary/30 bg-primary/5 text-primary mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed p-3 text-sm">
          <span>{c.wizConnectLinkedinPrompt}</span>
          <Button size="sm" variant="outline" onClick={onConnect}>
            {c.wizConnectLinkedinCta}
          </Button>
        </div>
      )}
    </>
  )
}

// Search → Company → "Link/URL/domain": paste a list of company URLs or
// domains, same parsing the Search page uses, applied via `companyDomains`
// (a generic filter both people-at-these-companies and company search share).
function DomainListDialog({
  open,
  onOpenChange,
  c,
  onApply,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  c: Copy
  onApply: (domains: string[]) => void
}) {
  const [text, setText] = React.useState("")
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open && !wasOpen) {
    setWasOpen(true)
    setText("")
  }
  if (!open && wasOpen) setWasOpen(false)

  const domains = React.useMemo(() => parseDomainList(text), [text])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogTitle className="flex items-center gap-2">
          <Globe className="text-primary size-5" />
          {c.domainDialogTitle}
        </DialogTitle>
        <p className="text-muted-foreground -mt-3 text-sm">{c.domainDialogDesc}</p>
        <Textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={c.domainDialogPlaceholder}
          rows={7}
          className="font-mono text-xs"
        />
        <p className="text-muted-foreground text-xs">
          {domains.length > 0 ? c.domainDialogDetected(domains.length) : c.domainDialogEmpty}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button
            variant="volt"
            disabled={domains.length === 0}
            onClick={() => onApply(domains)}
          >
            <Search className="size-4" />
            {c.domainDialogApply}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function GuidedWizard({
  entity,
  allowEntityToggle,
  onEntityChange,
  onBack,
  onGoImportFile,
  onGoImportCrm,
  onGoImportLink,
  connectedLinkedin,
  onSyncLinkedin,
  onConnectLinkedin,
  onGoSearch,
  onLookalikes,
  onGoogleMaps,
  onDomainSearch,
  c,
}: {
  entity: AiEntity
  allowEntityToggle: boolean
  onEntityChange: (e: AiEntity) => void
  onBack: () => void
  onGoImportFile: () => void
  onGoImportCrm: () => void
  onGoImportLink: (method: string) => void
  connectedLinkedin: boolean
  onSyncLinkedin: () => void
  onConnectLinkedin: () => void
  onGoSearch: (source: "kombo" | "linkedin") => void
  onLookalikes: () => void
  onGoogleMaps: () => void
  onDomainSearch: (domains: string[]) => void
  c: Copy
}) {
  const [path, setPath] = React.useState<WizStep[]>(["root"])
  const [domainDialogOpen, setDomainDialogOpen] = React.useState(false)
  const step = path[path.length - 1]

  function go(next: WizStep) {
    setPath((prev) => [...prev, next])
  }
  function back() {
    if (path.length > 1) setPath((prev) => prev.slice(0, -1))
    else onBack()
  }
  // "Search" only asks Prospect-vs-Company when the modal is generic — a
  // scoped entry point (e.g. a Prospects list) already knows its entity.
  function chooseSearch() {
    go(allowEntityToggle ? "search-entity" : entity === "people" ? "prospect-source" : "company-source")
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-lg px-6 py-8">
        <button
          type="button"
          onClick={back}
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-medium"
        >
          <ArrowLeft className="size-4" />
          {c.splashBack}
        </button>

        {step === "root" && (
          <>
            <WizardStepHeader title={c.wizRootTitle} desc={c.wizRootDesc} />
            <div className="space-y-3">
              <WizardOption
                icon={Upload}
                title={c.wizImportTitle}
                description={c.wizImportDesc}
                onClick={() => go("import-source")}
              />
              <WizardOption
                icon={Search}
                title={c.wizSearchTitle}
                description={c.wizSearchDesc}
                onClick={chooseSearch}
              />
            </div>
          </>
        )}

        {step === "import-source" && (
          <>
            <WizardStepHeader title={c.wizImportSourceTitle} desc={c.wizImportSourceDesc} />
            <div className="space-y-3">
              <WizardOption
                icon={Upload}
                title={c.wizFileTitle}
                description={c.wizFileDesc}
                onClick={onGoImportFile}
              />
              <WizardOption
                icon={Database}
                title={c.wizCrmTitle}
                description={c.wizCrmDesc}
                onClick={onGoImportCrm}
              />
              <WizardOption
                icon={Link2}
                title={c.wizLinkTitle}
                description={c.wizLinkDesc}
                onClick={() => go("import-link")}
              />
            </div>
          </>
        )}

        {step === "import-link" && (
          <ImportLinkStep
            entity={entity}
            c={c}
            connectedLinkedin={connectedLinkedin}
            onPick={onGoImportLink}
            onSync={onSyncLinkedin}
            onConnect={onConnectLinkedin}
          />
        )}

        {step === "search-entity" && (
          <>
            <WizardStepHeader title={c.wizSearchEntityTitle} desc={c.wizSearchEntityDesc} />
            <div className="space-y-3">
              <WizardOption
                icon={Users}
                title={c.contact}
                description={c.wizProspectDesc}
                onClick={() => {
                  onEntityChange("people")
                  go("prospect-source")
                }}
              />
              <WizardOption
                icon={Building2}
                title={c.company}
                description={c.wizCompanyDesc}
                onClick={() => {
                  onEntityChange("companies")
                  go("company-source")
                }}
              />
            </div>
          </>
        )}

        {step === "prospect-source" && (
          <>
            <WizardStepHeader title={c.wizProspectSourceTitle} desc={c.wizProspectSourceDesc} />
            <div className="space-y-3">
              <WizardOption
                icon={Database}
                title={c.wizKomboDbTitle}
                description={c.wizKomboDbDesc}
                onClick={() => onGoSearch("kombo")}
              />
              <WizardOption
                icon={LinkedinIcon}
                title={c.wizLiDbTitle}
                description={c.wizLiDbDesc}
                onClick={() => onGoSearch("linkedin")}
              />
              <WizardOption
                icon={ScanSearch}
                title={c.wizLookalikeTitle}
                description={c.wizLookalikeDesc}
                onClick={onLookalikes}
              />
            </div>
          </>
        )}

        {step === "company-source" && (
          <>
            <WizardStepHeader title={c.wizCompanySourceTitle} desc={c.wizCompanySourceDesc} />
            <div className="space-y-3">
              <WizardOption
                icon={Globe}
                title={c.wizDomainTitle}
                description={c.wizDomainDesc}
                onClick={() => setDomainDialogOpen(true)}
              />
              <WizardOption
                icon={MapPin}
                title={c.wizGmapsTitle}
                description={c.wizGmapsDesc}
                onClick={onGoogleMaps}
              />
              <WizardOption
                icon={LinkedinIcon}
                title={c.wizSalesNavTitle}
                description={c.wizSalesNavDesc}
                onClick={() => onGoSearch("linkedin")}
              />
            </div>
          </>
        )}
      </div>

      <DomainListDialog
        open={domainDialogOpen}
        onOpenChange={setDomainDialogOpen}
        c={c}
        onApply={(domains) => {
          setDomainDialogOpen(false)
          onDomainSearch(domains)
        }}
      />
    </div>
  )
}

type ImportMethod = {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  tint: string
}

function ImportPane({
  entity,
  c,
  initialActiveLink = null,
  onFile,
  onConnect,
  onSync,
  onLinkImport,
  onDownloadTemplate,
}: {
  entity: AiEntity
  c: Copy
  // Preselects a link-paste method — set by the guided wizard when the user
  // already named a specific LinkedIn link type.
  initialActiveLink?: string | null
  onFile: () => void
  onConnect: () => void
  onSync: () => void
  onLinkImport: (label: string) => void
  onDownloadTemplate: () => void
}) {
  // Which "link" method is being entered, plus the pasted URL.
  const [activeLink, setActiveLink] = React.useState<string | null>(initialActiveLink)
  const [url, setUrl] = React.useState("")

  const linkTint = "bg-[#0a66c2]/10 text-[#0a66c2]"

  // Link-based imports: paste a URL, the API pulls the records from it.
  const linkMethods: (ImportMethod & { placeholder: string })[] =
    entity === "people"
      ? [
          { key: "sn-leads", label: c.snLeads, placeholder: c.snLeadsPh, icon: Compass, tint: linkTint },
          { key: "li-post", label: c.liPost, placeholder: c.liPostPh, icon: LinkedinIcon, tint: linkTint },
          { key: "li-search", label: c.liSearch, placeholder: c.liSearchPh, icon: LinkedinIcon, tint: linkTint },
        ]
      : [
          { key: "sn-companies", label: c.snCompanies, placeholder: c.snCompaniesPh, icon: Compass, tint: linkTint },
        ]

  // The CRM "views" method is dynamic — it reflects whichever CRM is connected
  // (its contact lists / segments), or prompts to connect one when none is.
  const crmMethod: ImportMethod & { onClick: () => void } = CONNECTED_CRM
    ? {
        key: "crm-views",
        label: c.crmViews(CONNECTED_CRM),
        icon: CONNECTED_CRM === "HubSpot" ? Plug : Cloud,
        tint:
          CONNECTED_CRM === "HubSpot"
            ? "bg-[#ff7a59]/15 text-[#ff7a59]"
            : "bg-[#00a1e0]/10 text-[#00a1e0]",
        onClick: onConnect,
      }
    : {
        key: "connect-crm",
        label: c.connectCrm,
        icon: Database,
        tint: "bg-muted text-muted-foreground",
        onClick: onConnect,
      }

  const connectMethods: (ImportMethod & { onClick: () => void })[] = [
    crmMethod,
    ...(entity === "people"
      ? [{ key: "li-followers", label: c.liFollowers, icon: LinkedinIcon, tint: linkTint, onClick: onSync }]
      : []),
  ]

  const active = linkMethods.find((m) => m.key === activeLink)
  const ActiveIcon = active?.icon
  const sectionLabel =
    "text-muted-foreground mt-6 mb-2 text-xs font-medium tracking-wide uppercase"

  const renderMethod = (m: ImportMethod, onClick: () => void) => {
    const Icon = m.icon
    return (
      <button
        key={m.key}
        type="button"
        onClick={onClick}
        className="hover:border-primary/40 hover:bg-muted/40 flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors"
      >
        <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", m.tint)}>
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1 truncate">{m.label}</span>
        <ArrowRight className="text-muted-foreground size-4 shrink-0" />
      </button>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <h2 className="text-lg font-semibold">{c.importTitle}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{c.importSubtitle}</p>

        {/* Upload a file */}
        <div className="flex items-center justify-between">
          <p className={sectionLabel}>{c.fileLabel}</p>
          <button
            type="button"
            onClick={onDownloadTemplate}
            className="text-primary inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
          >
            <Download className="size-3.5" />
            {c.downloadTemplate}
          </button>
        </div>
        <button
          type="button"
          onClick={onFile}
          className="hover:border-primary/50 hover:bg-muted/40 flex w-full flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center transition-colors"
        >
          <span className="bg-muted flex size-12 items-center justify-center rounded-full">
            <Upload className="text-muted-foreground size-5" />
          </span>
          <span className="mt-3 text-sm font-medium">
            {c.dropHere}
            <span className="text-primary underline">{c.browse}</span>
          </span>
          <span className="text-muted-foreground mt-1 text-xs">{c.fileTypes}</span>
        </button>

        {/* Import from a link — paste a URL, the API pulls the records */}
        <p className={sectionLabel}>{c.linkLabel}</p>
        <p className="text-muted-foreground -mt-1 mb-2 text-xs">
          {entity === "people" ? c.linkHintPeople : c.linkHintCompanies}
        </p>
        {active && ActiveIcon ? (
          <div className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", active.tint)}>
                <ActiveIcon className="size-4" />
              </span>
              {active.label}
            </div>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Link2 className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                <Input
                  autoFocus
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && url.trim()) {
                      e.preventDefault()
                      onLinkImport(active.label)
                    }
                  }}
                  placeholder={active.placeholder}
                  clearable={false}
                  className="h-9 pl-8"
                />
              </div>
              <Button
                variant="volt"
                className="h-9"
                disabled={!url.trim()}
                onClick={() => onLinkImport(active.label)}
              >
                {c.importBtn}
              </Button>
            </div>
            <button
              type="button"
              onClick={() => setActiveLink(null)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              {c.linkBack}
            </button>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {linkMethods.map((m) =>
              renderMethod(m, () => {
                setActiveLink(m.key)
                setUrl("")
              })
            )}
          </div>
        )}

        {/* Connect a source */}
        <p className={sectionLabel}>{c.connectLabel}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {connectMethods.map((m) => renderMethod(m, m.onClick))}
        </div>
      </div>
    </div>
  )
}

/* ----------------------------- materializers ----------------------------- */

function materializeLead(l: AiLead): string {
  return prospectStore.create({
    firstName: l.firstName,
    lastName: l.lastName,
    title: l.title,
    company: l.company,
    companyDomain: l.companyDomain,
    location: l.location,
    // Freshly sourced contacts arrive with only basic data — email is revealed
    // later via enrichment.
    email: "",
    linkedinUrl: "",
    avatarColor: l.avatarColor,
    score: l.fit,
    status: "new",
    tags: [],
    seniority: l.seniority,
    department: l.department,
    headcount: l.headcount,
    industry: l.industry,
    revenue: l.revenue,
    about: "",
    signals: l.signals,
    source: "search",
    enriched: false,
  }).id
}

function materializeCompany(co: AiCompany): string {
  const tier: AccountTier =
    co.headcountNum >= 1000
      ? "Enterprise"
      : co.headcountNum >= 200
        ? "Mid-market"
        : "SMB"
  return accountStore.create({
    name: co.name,
    domain: co.domain,
    industry: co.industry,
    employees: co.headcount,
    revenue: co.revenue,
    location: co.location,
    logoColor: co.logoColor,
    tier,
    healthScore: co.fit,
    openDeals: 0,
    pipeline: 0,
    contacts: 0,
    ownerId: "",
    about: "",
    signals: co.signals,
    keyExecutives: [],
  }).id
}
