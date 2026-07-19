import * as React from "react"
import { useNavigate, useSearchParams, useLocation } from "react-router-dom"
import { toast } from "sonner"
import kaiUrl from "@/assets/kai-pleased.png"
import {
  Sparkles,
  Search as SearchIcon,
  Plus,
  X,
  Loader2,
  Bookmark,
  Building2,
  Users,
  ArrowRight,
  Coins,
  ListPlus,
  CheckCircle2,
  CircleDashed,
  ScanSearch,
  ArrowDownUp,
  Upload,
  SlidersHorizontal,
  Database,
  MapPin,
  Star,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Plug,
  Download,
  FolderPlus,
  Link2,
  Check,
} from "lucide-react"
import { LinkedinIcon } from "@/components/icons/BrandIcons"

import { Page, PageHeading } from "@/components/layout/Page"
import { SavedSearchesControl } from "@/components/common/SavedSearchesControl"
import { useLocale, type Locale } from "@/lib/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { DataTable, type TableSelection } from "@/components/common/DataTable"
import { ColumnManager } from "@/components/common/ColumnManager"
import { useColumnPrefs } from "@/lib/table-columns"
import {
  LEAD_RESULT_COLUMNS,
  COMPANY_RESULT_COLUMNS,
  LEAD_RESULT_GROUPS,
  LEAD_RESULT_DEFAULT_IDS,
  COMPANY_RESULT_GROUPS,
  COMPANY_RESULT_DEFAULT_IDS,
} from "@/lib/search-result-columns"
import { cn } from "@/lib/utils"
import { PerCompanyCap } from "@/components/common/PerCompanyCap"
import { SAVE_COST, MAX_ENRICH_BATCH } from "@/lib/enrichment"
import {
  interpretPrompt,
  searchLeads,
  searchCompanies,
  lookalikeLeads,
  lookalikeCompanies,
  LOOKALIKE_SEEDS,
  estimatedTotal,
  queryTitle,
  isQueryEmpty,
  savedSearchStore,
  useSavedSearches,
  REGION_OPTIONS,
  INDUSTRY_OPTIONS,
  sortLeads,
  sortCompanies,
  type SortKey,
  EMPTY_QUERY,
  parseDomainList,
  type AiEntity,
  type AiQuery,
  type AiLead,
  type AiCompany,
  type LookalikeSeed,
  type DataSource,
} from "@/lib/mock-ai-search"
import {
  listStore,
  prospectStore,
  accountStore,
  useLists,
  useBlacklistedKeys,
} from "@/lib/store"
import { getProspect } from "@/lib/mock-data"
import { facetsForDb, facetSection, type FacetDef, type FacetDb } from "@/lib/search-facets"
import { searchTabsStore, useSearchTabs, type SearchTab } from "@/lib/search-tabs"
import { SearchTabBar } from "@/components/search/SearchTabBar"
import { SEARCH_FILTER_GROUPS } from "@/lib/search-filter-groups"
import { baseValue, excludeValue, isExcluded } from "@/lib/filter-polarity"
import {
  FilterCatalog,
  type CatalogFilterDef,
} from "@/components/common/FilterCatalog"
import { downloadCsv } from "@/lib/csv"
import { BulkAddDialog } from "@/components/common/BulkAddDialog"
import { BulkActionsBar } from "@/components/common/BulkActionsBar"
import { AssigneePicker } from "@/components/common/AssigneePicker"
import { EnrichListDialog } from "@/components/lists/EnrichListDialog"
import type { AccountTier, Prospect } from "@/lib/types"

const COPY = {
  en: {
    title: "Search",
    description:
      "Search your entire prospect and company database — filter, sort, and save results as a dynamic list.",
    signalsTitle: "Signals",
    signalsDescription:
      "AI-matched prospects and companies, scored and ready to search, save, or add to a campaign.",
    inputPlaceholder: "e.g. VPs of Sales at European SaaS that just raised…",
    inputPlaceholderCompanies: "e.g. Series B fintechs hiring for sales in Europe…",
    searchBtn: "Search",
    clearQuery: "Clear search",
    srTitle: "Search",
    idleTitle: "Search prospects and companies your way",
    idleDesc:
      "Describe your ideal prospect or company, or search by name, role, location, industry, and more — then narrow with advanced filters. From your results, enrich contacts, build a list, or launch a campaign.",
    idleSuggestedTitle: "Or try one of these",
    idleSuggestionsPeople: [
      "VPs of Sales at SaaS scale-ups in EMEA",
      "Heads of RevOps at companies hiring SDRs",
      "Founders of B2B startups that raised a Series A this year",
      "CROs in Iberia at companies with 50-500 employees",
    ],
    idleSuggestionsCompanies: [
      "SaaS companies in Iberia with 50-500 employees",
      "Agencies using HubSpot that opened a sales role",
      "Logistics companies adopting AI tools in their stack",
      "E-commerce brands that just expanded into the US",
    ],
    urlsTab: "URLs",
    urlsIdleBtn: "Search by URLs",
    urlsPlaceholder: "acme.com, example.com — paste or type company URLs/domains",
    urlsAddMore: "Add another…",
    urlsClearAll: "Clear all",
    urlsRemove: (d: string) => `Remove ${d}`,
    urlsHint:
      "Separate with commas or spaces. We'll find prospects at these companies — refine with the usual filters.",
    urlsFieldAria: "Company URLs or domains",
    domainListScoped: (n: number) =>
      `Scoped to ${n} ${n === 1 ? "company" : "companies"} from your list`,
    domainListPrompt: (n: number) =>
      `Prospects at ${n} ${n === 1 ? "company" : "companies"} from your list`,
    editList: "Edit list",
    clearList: "Clear list",
    introTitle: "Prospect with a prompt",
    introDescription:
      "Ask in plain English or build an advanced query by hand. Kai returns a fit-scored table of prospects or companies you can refine, enrich, save as a dynamic list, and push into a campaign.",
    introPoints: [
      "Search the database or let AI find look-alikes",
      "Fit score every result against your ask",
      "Save as a dynamic list that keeps filling",
      "Connect straight to a campaign",
    ],
    assistantName: "Kai",
    chatHint: "Describe your ideal prospects, or pick an example.",
    examples: "Examples",
    thinking: "Kai is searching…",
    starter:
      "Here's a starter table for VPs of Sales at European SaaS companies that recently raised. Refine it with a prompt or edit the filters on the right.",
    showingOf: (count: number, total: number) =>
      `Showing ${count} of an estimated ${total.toLocaleString()}. Refine further or save these as a list.`,
    refinedTo: (label: string) => `Refined: ${label.toLowerCase()}.`,
    thinkingTitle: "Kai is analyzing your request…",
    thinkingSub: "Searching the database and scoring fit against your ask.",
    thinkingSteps: [
      "Understanding your request",
      "Searching 30M+ contacts & companies",
      "Scoring fit and enriching results",
    ],
    refine: "Quick refine",
    save: "Save",
    saved: "Saved searches",
    saveThis: "Save this search",
    saveSearchDesc:
      "Give it a name so you can find it again — we've suggested one based on your prompt and filters.",
    saveNameLabel: "Search name",
    noSaved: "No saved searches yet.",
    noSavedMatch: "No saved searches match your search.",
    searchSaved: "Search saved searches…",
    savedToast: "Search saved with its prompt history",
    loadedToast: "Saved search loaded",
    removedSaved: "Saved search removed",
    removeSaved: (name: string) => `Remove ${name}`,
    people: "Prospects",
    companies: "Companies",
    resultsFor: "Results",
    estLeads: (n: number) => `Est. ${n.toLocaleString()} total`,
    perProspect: (n: number) => `${n} credits / prospect`,
    freeToSave: "Free to save",
    projected: (n: number) => `≈ ${n.toLocaleString()} credits`,
    getMore: "Get more leads",
    getMoreToast: "Expanding the search across the full database…",
    komboData: "Kombo data",
    komboHint: "Verified emails, mobiles, firmographics & intent — blended from our data network.",
    dbLabel: "Search in",
    dbKombo: "KomboAI",
    dbKomboDesc: "Our verified network of prospects & companies.",
    dbLookalike: "Lookalike",
    dbLookalikeDesc: "Find records similar to a person or company.",
    dbLinkedinDesc: "Search with LinkedIn network filters.",
    dbSwitched: (name: string) => `Now searching ${name}`,
    dbMoreLabel: "More sources",
    dbSoon: "Soon",
    dbGmaps: "Google Maps",
    dbGmapsDesc: "Local businesses with address, phone & reviews.",
    dbTripadvisor: "TripAdvisor",
    dbTripadvisorDesc: "Hospitality & travel venues with ratings.",
    dbCompanyDbs: "Company databases",
    dbCompanyDbsDesc: "Crunchbase, Apollo & other firmographic sources.",
    linkedinSource: "Sales Nav",
    linkedinHint: "Turn on to target LinkedIn-only network filters (job changes, posts, connection degree…).",
    linkedinEnabled: "LinkedIn filters enabled",
    linkedinDisabled: "LinkedIn filters turned off",
    sortBy: "Sort",
    sortFit: "Best fit",
    sortName: "Name (A–Z)",
    sortCompany: "Company (A–Z)",
    sortHeadcount: "Largest company",
    sortRecent: "Recently active",
    departments: "Departments",
    technologies: "Technologies",
    revenue: "Revenue",
    intent: "Buyer intent",
    founded: "Founded",
    growth: "Headcount growth",
    linkedinFilters: "Sales Nav",
    connections: "Connections",
    profileLanguages: "Profile languages",
    serviceCategories: "Service categories",
    schools: "Schools",
    currentCompanies: "Current companies",
    pastCompanies: "Past companies",
    connectionsOf: "Connections of",
    followersOf: "Followers of",
    jobListings: "Job listings on LinkedIn",
    heroTitle: "Describe your ideal customer",
    heroSubtitle: "Search across 250M+ professionals and companies — or pick a quick start.",
    heroPlaceholder: "e.g. Heads of RevOps at Series B SaaS companies in EMEA…",
    searchWithFilters: "Search with filters",
    spotlightsLabel: "Spotlights",
    matchLabel: "Matches",
    spotlights: ["Open to work", "Changed jobs", "Recently active", "Hiring", "High intent"],
    columns: "Columns",
    addToList: "Save as list",
    findPeople: "Find prospects",
    findPeopleToast: "Switched to prospects at these companies",
    lookalike: "Lookalikes",
    lookalikeTitle: "Find lookalikes",
    lookalikeDesc:
      "Pick a person or company you already like — Kai finds records similar to that specific seed. Refine further with the sidebar filters.",
    pickSeed: "Pick a prospect or company",
    companySearch: "Search a company by name…",
    personSearch: "Search a prospect by name…",
    useCompany: (name: string) => `Use "${name}"`,
    seedPeople: "Prospects & customers",
    seedCompanies: "Companies",
    findSimilar: "Find similar",
    similarTo: "Similar to",
    newSearchTab: "New search",
    clearLookalike: "Clear lookalike",
    mapAreaHint: "Approximate search area — results are matched around this location.",
    previewLocation: "Location",
    previewRole: "Role",
    previewIndustry: "Industry",
    previewSize: "Company size",
    previewGrowth: "Growth",
    previewSignals: "Signals",
    previewSeeAllPeople: "See all prospects",
    previewSeeAllCompanies: "See all companies",
    previewEmpty: "No matches yet — try broadening your search.",
    lookalikePrompt: (name: string) => `Find records similar to ${name}`,
    colFit: "Fit",
    colName: "Name",
    colCompany: "Company",
    colIndustry: "Industry",
    colRegion: "Region",
    colHeadcount: "Size",
    colEmail: "Email",
    colSignals: "Signals",
    colRoles: "Open roles",
    emailVerified: "Verified",
    emailLikely: "Likely",
    emailMissing: "Missing",
    selected: (n: number) => `${n} selected`,
    clearSel: "Clear",
    bulkList: "Add to list",
    bulkExport: "Export",
    bulkCrm: "Add to CRM",
    crmToast: (n: number) => `Sent ${n} to your CRM`,
    noResults: "No results match your search or filters.",
    addFilter: "Add filter",
    filterTypeahead: "Search filters or describe them with AI…",
    addCustom: (v: string) => `Add "${v}"`,
    askAiFilter: (v: string) => `Ask AI: "${v}"`,
    viewAllFilters: "View all filters",
    backToFilterSearch: "Back to search",
    filtersTitle: "Filters",
    filtersDesc: (n: number) =>
      n === 0
        ? "Search or describe filters with AI, then tick to apply."
        : `${n} active · search or describe filters with AI, then tick to apply.`,
    activeFilters: "Active filters",
    noActiveFilters: "No filters yet — pick from the list.",
    notChip: (v: string) => `Not: ${v}`,
    filtersNoMatch: "No filters match.",
    addToGroup: (label: string) => `Add ${label.toLowerCase()}…`,
    clearAll: "Clear all",
    aiSuggestions: "AI-powered search suggestions",
    runThisSearch: "Run this search",
    viewAll: "View all",
    rowSelectAll: "Select all",
    editFilters: "Edit",
    done: "Done",
    columnsBtn: "Columns",
    columnsTitle: "Customize columns",
    columnsDesc: (n: number, total: number) =>
      `${n} of ${total} columns shown. Toggle fields to show or hide.`,
    alwaysShown: "Always shown",
    optionalCols: "Optional columns",
    alwaysTag: "Always",
    buildTitle: "Build a list",
    buildStepSetup: "Setup",
    buildStepSource: "Source",
    buildName: "List name",
    buildNamePlaceholder: "e.g. EMEA VPs of Sales",
    buildType: "What's in this list?",
    buildPeople: "Prospects",
    buildPeopleDesc: "Individual prospects & contacts.",
    buildCompanies: "Companies",
    buildCompaniesDesc: "Accounts & organizations.",
    capLabel: "Max contacts per company",
    capNoLimit: "No limit",
    capChip: (n: number) => `Max ${n}/company`,
    capBatchNote: (max: number) =>
      `Only ${max.toLocaleString()} can be added at a time.`,
    buildPopulate: "How do you want to populate it?",
    buildNext: "Next",
    buildBack: "Back",
    selectPage: "Select page",
    deselectPage: "Deselect page",
    selectAllCapped: (n: number) => `Select all ${n.toLocaleString()}`,
    enrichCompaniesToast: (n: number) =>
      `Enriching ${n} ${n === 1 ? "company" : "companies"}…`,
    buildAssign: "Owner",
    buildAssignHint:
      "New prospects entering this list are assigned to this teammate.",
    buildUnassigned: "Unassigned",
    hideInList: "Hide already in a list",
    hideInCrm: "Hide already in CRM",
    addRowToList: "Add to list",
    pageRange: (from: number, to: number, total: number) =>
      `${from.toLocaleString()}–${to.toLocaleString()} of ${total.toLocaleString()}`,
    srcFindPeople: "Find prospects",
    srcFindPeopleDesc: "Search our database for matching prospects.",
    srcFindCompanies: "Find companies",
    srcFindCompaniesDesc: "Search our database for matching accounts.",
    srcLookalike: "Lookalike",
    srcLookalikeDesc: "Find records similar to a person or company.",
    srcImport: "Import CSV",
    srcImportDesc: "Upload a CSV of prospects or companies.",
    srcCrm: "From CRM",
    srcCrmDesc: "Pull from HubSpot, Salesforce & more.",
    srcBlank: "Start blank",
    srcBlankDesc: "Create an empty list and add records later.",
    srcGroupAi: "Kombo AI",
    srcGroupLinkedin: "LinkedIn",
    srcGroupCrunchbase: "Crunchbase",
    srcGroupImportCat: "Import & manual",
    srcLiSearch: "Search on LinkedIn",
    srcLiPost: "Extract from a post",
    srcLiEvent: "Extract from an event",
    srcLiPoll: "Extract from a poll",
    srcLiConnections: "Your LinkedIn connections",
    srcLiFollowers: "Your LinkedIn followers",
    srcCb: "Search on Crunchbase",
    srcCbInvestors: "Search investors",
    srcManual: "Add manually",
    srcHubspot: "Import from HubSpot",
    srcHubspotList: "Import from a HubSpot list",
    buildSourceSoon: "Opening search — pick your filters",
    buildCreated: (name: string) => `Created "${name}"`,
    titles: "Titles",
    seniority: "Seniority",
    regions: "Regions",
    industries: "Industries",
    headcountF: "Headcount",
    signals: "Signals",
    saveTitle: "Save as a list",
    saveDesc: (n: number) =>
      `${n} ${n === 1 ? "lead" : "leads"} will be added to a new list as enriched prospects.`,
    listName: "List name",
    connectCampaign: "Connect to a campaign",
    noCampaign: "Don't connect now",
    newCampaign: "＋ New campaign",
    dynamicNote:
      "Saved as a dynamic list — new matching prospects keep flowing in over time.",
    cancel: "Cancel",
    saveList: "Save list",
    savedListToast: (name: string) => `Saved "${name}" with your results`,
    refineChips: [
      { label: "Only recently funded", patch: { signals: ["Recently funded"] } },
      { label: "EMEA only", patch: { regions: ["EMEA"] } },
      { label: "1000+ employees", patch: { headcount: ["1000+"] } },
      { label: "Add VP Marketing", patch: { titles: ["VP of Marketing"] } },
    ],
  },
  es: {
    title: "Buscar",
    description:
      "Busca en toda tu base de datos de prospectos y empresas — filtra, ordena y guarda los resultados como una lista dinámica.",
    signalsTitle: "Señales",
    signalsDescription:
      "Prospectos y empresas emparejados por IA, puntuados y listos para buscar, guardar o añadir a una campaña.",
    inputPlaceholder: "p. ej. VPs de Ventas en SaaS europeo que acaban de levantar…",
    inputPlaceholderCompanies: "p. ej. Fintechs Serie B contratando en ventas en Europa…",
    searchBtn: "Buscar",
    clearQuery: "Borrar búsqueda",
    srTitle: "Buscar",
    idleTitle: "Busca prospectos y empresas a tu manera",
    idleDesc:
      "Describe a tu prospecto o empresa ideal, o busca por nombre, cargo, ubicación, sector y más — luego afina con filtros avanzados. Con los resultados, enriquece contactos, crea una lista o lanza una campaña.",
    idleSuggestedTitle: "O prueba una de estas",
    idleSuggestionsPeople: [
      "VPs de Ventas en scale-ups SaaS de EMEA",
      "Responsables de RevOps en empresas que contratan SDRs",
      "Fundadores de startups B2B con Serie A este año",
      "CROs en Iberia en empresas de 50-500 empleados",
    ],
    idleSuggestionsCompanies: [
      "Empresas SaaS en Iberia de 50-500 empleados",
      "Agencias que usan HubSpot con vacantes de ventas",
      "Empresas de logística que adoptan herramientas de IA",
      "Marcas de e-commerce recién expandidas a EE. UU.",
    ],
    urlsTab: "URLs",
    urlsIdleBtn: "Buscar por URLs",
    urlsPlaceholder: "acme.com, ejemplo.com — pega o escribe URLs/dominios de empresas",
    urlsAddMore: "Añade otra…",
    urlsClearAll: "Borrar todo",
    urlsRemove: (d: string) => `Quitar ${d}`,
    urlsHint:
      "Separa con comas o espacios. Encontraremos prospectos en esas empresas — refina con los filtros de siempre.",
    urlsFieldAria: "URLs o dominios de empresas",
    domainListScoped: (n: number) =>
      `Limitado a ${n} ${n === 1 ? "empresa" : "empresas"} de tu lista`,
    domainListPrompt: (n: number) =>
      `Prospectos en ${n} ${n === 1 ? "empresa" : "empresas"} de tu lista`,
    editList: "Editar lista",
    clearList: "Quitar lista",
    introTitle: "Prospecta con un prompt",
    introDescription:
      "Pregunta en lenguaje natural o crea una consulta avanzada a mano. Kai devuelve una tabla de prospectos o empresas puntuada por encaje que puedes refinar, enriquecer, guardar como lista dinámica y enviar a una campaña.",
    introPoints: [
      "Busca en la base o deja que la IA encuentre similares",
      "Puntúa el encaje de cada resultado con tu petición",
      "Guarda como lista dinámica que se sigue llenando",
      "Conecta directamente con una campaña",
    ],
    assistantName: "Kai",
    chatHint: "Describe tus prospectos ideales, o elige un ejemplo.",
    examples: "Ejemplos",
    thinking: "Kai está buscando…",
    starter:
      "Aquí tienes una tabla inicial de VPs de Ventas en empresas SaaS europeas que han levantado financiación recientemente. Refínala con un prompt o edita los filtros de la derecha.",
    showingOf: (count: number, total: number) =>
      `Mostrando ${count} de unos ${total.toLocaleString()}. Sigue refinando o guarda estos como una lista.`,
    refinedTo: (label: string) => `Refinado: ${label.toLowerCase()}.`,
    thinkingTitle: "Kai está analizando tu petición…",
    thinkingSub: "Buscando en la base de datos y puntuando el encaje con tu petición.",
    thinkingSteps: [
      "Entendiendo tu petición",
      "Buscando en más de 30M de contactos y empresas",
      "Puntuando el encaje y enriqueciendo resultados",
    ],
    refine: "Refinar rápido",
    save: "Guardar",
    saved: "Búsquedas guardadas",
    saveThis: "Guardar esta búsqueda",
    saveSearchDesc:
      "Ponle un nombre para encontrarla después — sugerimos uno según tu prompt y filtros.",
    saveNameLabel: "Nombre de la búsqueda",
    noSaved: "Aún no hay búsquedas guardadas.",
    noSavedMatch: "Ninguna búsqueda guardada coincide.",
    searchSaved: "Buscar búsquedas guardadas…",
    savedToast: "Búsqueda guardada con su historial de prompts",
    loadedToast: "Búsqueda guardada cargada",
    removedSaved: "Búsqueda guardada eliminada",
    removeSaved: (name: string) => `Eliminar ${name}`,
    people: "Prospectos",
    companies: "Empresas",
    resultsFor: "Resultados",
    estLeads: (n: number) => `Est. ${n.toLocaleString()} en total`,
    perProspect: (n: number) => `${n} créditos / prospecto`,
    freeToSave: "Guardar es gratis",
    projected: (n: number) => `≈ ${n.toLocaleString()} créditos`,
    getMore: "Conseguir más leads",
    getMoreToast: "Ampliando la búsqueda a toda la base de datos…",
    komboData: "Datos de Kombo",
    komboHint: "Emails verificados, móviles, firmografía e intención — combinados desde nuestra red de datos.",
    dbLabel: "Buscar en",
    dbKombo: "KomboAI",
    dbKomboDesc: "Nuestra red verificada de prospectos y empresas.",
    dbLookalike: "Similares",
    dbLookalikeDesc: "Encuentra registros similares a una persona o empresa.",
    dbLinkedinDesc: "Busca con filtros de la red de LinkedIn.",
    dbSwitched: (name: string) => `Buscando en ${name}`,
    dbMoreLabel: "Más fuentes",
    dbSoon: "Pronto",
    dbGmaps: "Google Maps",
    dbGmapsDesc: "Negocios locales con dirección, teléfono y reseñas.",
    dbTripadvisor: "TripAdvisor",
    dbTripadvisorDesc: "Locales de hostelería y viajes con valoraciones.",
    dbCompanyDbs: "Bases de datos de empresas",
    dbCompanyDbsDesc: "Crunchbase, Apollo y otras fuentes firmográficas.",
    linkedinSource: "Sales Nav",
    linkedinHint: "Actívalo para usar filtros exclusivos de LinkedIn (cambios de empleo, publicaciones, grado de conexión…).",
    linkedinEnabled: "Filtros de LinkedIn activados",
    linkedinDisabled: "Filtros de LinkedIn desactivados",
    sortBy: "Ordenar",
    sortFit: "Mejor encaje",
    sortName: "Nombre (A–Z)",
    sortCompany: "Empresa (A–Z)",
    sortHeadcount: "Empresa más grande",
    sortRecent: "Actividad reciente",
    departments: "Departamentos",
    technologies: "Tecnologías",
    revenue: "Ingresos",
    intent: "Intención de compra",
    founded: "Año de fundación",
    growth: "Crecimiento de plantilla",
    linkedinFilters: "Sales Nav",
    connections: "Conexiones",
    profileLanguages: "Idiomas del perfil",
    serviceCategories: "Categorías de servicio",
    schools: "Centros educativos",
    currentCompanies: "Empresas actuales",
    pastCompanies: "Empresas anteriores",
    connectionsOf: "Conexiones de",
    followersOf: "Seguidores de",
    jobListings: "Ofertas de empleo en LinkedIn",
    heroTitle: "Describe tu cliente ideal",
    heroSubtitle: "Busca entre más de 250M de profesionales y empresas — o elige un inicio rápido.",
    heroPlaceholder: "p. ej. Heads de RevOps en SaaS Serie B en EMEA…",
    searchWithFilters: "Buscar con filtros",
    spotlightsLabel: "Destacados",
    matchLabel: "Coincide",
    spotlights: ["Open to work", "Cambió de empleo", "Activos recientemente", "Contratando", "Alta intención"],
    columns: "Columnas",
    addToList: "Guardar como lista",
    findPeople: "Buscar prospectos",
    findPeopleToast: "Cambiado a prospectos en estas empresas",
    lookalike: "Similares",
    lookalikeTitle: "Buscar similares",
    lookalikeDesc:
      "Elige una persona o empresa que ya te encaja — Kai encuentra registros similares a ese origen concreto. Refina con los filtros de la barra lateral.",
    pickSeed: "Elige un prospecto o empresa",
    companySearch: "Busca una empresa por nombre…",
    personSearch: "Busca un prospecto por nombre…",
    useCompany: (name: string) => `Usar "${name}"`,
    seedPeople: "Prospectos y clientes",
    seedCompanies: "Empresas",
    findSimilar: "Buscar similares",
    similarTo: "Similar a",
    newSearchTab: "Nueva búsqueda",
    clearLookalike: "Quitar similares",
    mapAreaHint: "Área de búsqueda aproximada — los resultados se buscan alrededor de esta ubicación.",
    previewLocation: "Ubicación",
    previewRole: "Cargo",
    previewIndustry: "Sector",
    previewSize: "Tamaño de empresa",
    previewGrowth: "Crecimiento",
    previewSignals: "Señales",
    previewSeeAllPeople: "Ver todos los prospectos",
    previewSeeAllCompanies: "Ver todas las empresas",
    previewEmpty: "Aún no hay coincidencias — prueba a ampliar la búsqueda.",
    lookalikePrompt: (name: string) => `Buscar registros similares a ${name}`,
    colFit: "Encaje",
    colName: "Nombre",
    colCompany: "Empresa",
    colIndustry: "Sector",
    colRegion: "Región",
    colHeadcount: "Tamaño",
    colEmail: "Email",
    colSignals: "Señales",
    colRoles: "Vacantes",
    emailVerified: "Verificado",
    emailLikely: "Probable",
    emailMissing: "Sin email",
    selected: (n: number) => `${n} seleccionados`,
    clearSel: "Limpiar",
    bulkList: "Añadir a lista",
    bulkExport: "Exportar",
    bulkCrm: "Añadir al CRM",
    crmToast: (n: number) => `Enviados ${n} a tu CRM`,
    noResults: "Ningún resultado coincide con tu búsqueda o filtros.",
    addFilter: "Añadir filtro",
    filterTypeahead: "Busca filtros o descríbelos con IA…",
    addCustom: (v: string) => `Añadir "${v}"`,
    askAiFilter: (v: string) => `Pregunta a la IA: "${v}"`,
    viewAllFilters: "Ver todos los filtros",
    backToFilterSearch: "Volver a la búsqueda",
    filtersTitle: "Filtros",
    filtersDesc: (n: number) =>
      n === 0
        ? "Busca o describe filtros con IA y luego márcalos para aplicarlos."
        : `${n} activos · busca o describe filtros con IA y luego márcalos para aplicarlos.`,
    activeFilters: "Filtros activos",
    noActiveFilters: "Aún no hay filtros — elige de la lista.",
    notChip: (v: string) => `No: ${v}`,
    filtersNoMatch: "Ningún filtro coincide.",
    addToGroup: (label: string) => `Añadir ${label.toLowerCase()}…`,
    clearAll: "Limpiar todo",
    aiSuggestions: "Sugerencias de búsqueda con IA",
    runThisSearch: "Ejecutar esta búsqueda",
    viewAll: "Ver todo",
    rowSelectAll: "Seleccionar todo",
    editFilters: "Editar",
    done: "Listo",
    columnsBtn: "Columnas",
    columnsTitle: "Personalizar columnas",
    columnsDesc: (n: number, total: number) =>
      `${n} de ${total} columnas visibles. Activa o desactiva campos.`,
    alwaysShown: "Siempre visibles",
    optionalCols: "Columnas opcionales",
    alwaysTag: "Fija",
    buildTitle: "Crear una lista",
    buildStepSetup: "Configuración",
    buildStepSource: "Fuente",
    buildName: "Nombre de la lista",
    buildNamePlaceholder: "p. ej. VPs de Ventas en EMEA",
    buildType: "¿Qué contiene esta lista?",
    buildPeople: "Prospectos",
    buildPeopleDesc: "Prospectos y contactos individuales.",
    buildCompanies: "Empresas",
    buildCompaniesDesc: "Cuentas y organizaciones.",
    capLabel: "Máx. contactos por empresa",
    capNoLimit: "Sin límite",
    capChip: (n: number) => `Máx. ${n}/empresa`,
    capBatchNote: (max: number) =>
      `Solo se pueden añadir ${max.toLocaleString()} a la vez.`,
    buildPopulate: "¿Cómo quieres llenarla?",
    buildNext: "Siguiente",
    buildBack: "Atrás",
    selectPage: "Seleccionar página",
    deselectPage: "Deseleccionar página",
    selectAllCapped: (n: number) => `Seleccionar todos (${n.toLocaleString()})`,
    enrichCompaniesToast: (n: number) =>
      `Enriqueciendo ${n} ${n === 1 ? "empresa" : "empresas"}…`,
    buildAssign: "Responsable",
    buildAssignHint:
      "Los nuevos prospectos que entren en esta lista se asignan a este compañero.",
    buildUnassigned: "Sin asignar",
    hideInList: "Ocultar ya en una lista",
    hideInCrm: "Ocultar ya en el CRM",
    addRowToList: "Añadir a lista",
    pageRange: (from: number, to: number, total: number) =>
      `${from.toLocaleString()}–${to.toLocaleString()} de ${total.toLocaleString()}`,
    srcFindPeople: "Buscar prospectos",
    srcFindPeopleDesc: "Busca prospectos que coincidan en nuestra base.",
    srcFindCompanies: "Buscar empresas",
    srcFindCompaniesDesc: "Busca cuentas que coincidan en nuestra base.",
    srcLookalike: "Similares",
    srcLookalikeDesc: "Encuentra registros similares a una persona o empresa.",
    srcImport: "Importar CSV",
    srcImportDesc: "Sube un CSV de prospectos o empresas.",
    srcCrm: "Desde el CRM",
    srcCrmDesc: "Importa de HubSpot, Salesforce y más.",
    srcBlank: "Empezar vacía",
    srcBlankDesc: "Crea una lista vacía y añade registros después.",
    srcGroupAi: "Kombo AI",
    srcGroupLinkedin: "LinkedIn",
    srcGroupCrunchbase: "Crunchbase",
    srcGroupImportCat: "Importar y manual",
    srcLiSearch: "Buscar en LinkedIn",
    srcLiPost: "Extraer de una publicación",
    srcLiEvent: "Extraer de un evento",
    srcLiPoll: "Extraer de una encuesta",
    srcLiConnections: "Tus conexiones de LinkedIn",
    srcLiFollowers: "Tus seguidores de LinkedIn",
    srcCb: "Buscar en Crunchbase",
    srcCbInvestors: "Buscar inversores",
    srcManual: "Añadir manualmente",
    srcHubspot: "Importar de HubSpot",
    srcHubspotList: "Importar de una lista de HubSpot",
    buildSourceSoon: "Abriendo búsqueda — elige tus filtros",
    buildCreated: (name: string) => `Creada "${name}"`,
    titles: "Cargos",
    seniority: "Antigüedad",
    regions: "Regiones",
    industries: "Sectores",
    headcountF: "Plantilla",
    signals: "Señales",
    saveTitle: "Guardar como lista",
    saveDesc: (n: number) =>
      `${n} ${n === 1 ? "lead" : "leads"} se añadirán a una nueva lista como prospectos enriquecidos.`,
    listName: "Nombre de la lista",
    connectCampaign: "Conectar con una campaña",
    noCampaign: "No conectar ahora",
    newCampaign: "＋ Nueva campaña",
    dynamicNote:
      "Guardada como lista dinámica — los nuevos prospectos que coincidan seguirán entrando con el tiempo.",
    cancel: "Cancelar",
    saveList: "Guardar lista",
    savedListToast: (name: string) => `Guardado "${name}" con tus resultados`,
    refineChips: [
      { label: "Solo financiación reciente", patch: { signals: ["Recently funded"] } },
      { label: "Solo EMEA", patch: { regions: ["EMEA"] } },
      { label: "1000+ empleados", patch: { headcount: ["1000+"] } },
      { label: "Añadir VP Marketing", patch: { titles: ["VP of Marketing"] } },
    ],
  },
  it: {
    title: "Cerca",
    description:
      "Cerca in tutto il tuo database di prospect e aziende — filtra, ordina e salva i risultati come lista dinamica.",
    signalsTitle: "Segnali",
    signalsDescription:
      "Prospect e aziende abbinati dall'IA, con punteggio e pronti da cercare, salvare o aggiungere a una campagna.",
    inputPlaceholder: "es. VP Sales in SaaS europee che hanno appena raccolto un round…",
    inputPlaceholderCompanies: "es. Fintech Serie B che assumono per le vendite in Europa…",
    searchBtn: "Cerca",
    clearQuery: "Cancella ricerca",
    srTitle: "Cerca",
    idleTitle: "Cerca prospect e aziende a modo tuo",
    idleDesc:
      "Descrivi il tuo prospect o azienda ideale, oppure cerca per nome, ruolo, posizione, settore e altro — poi affina con i filtri avanzati. Dai risultati, arricchisci i contatti, crea una lista o lancia una campagna.",
    idleSuggestedTitle: "O prova una di queste",
    idleSuggestionsPeople: [
      "VP Sales in scale-up SaaS in EMEA",
      "Responsabili RevOps in aziende che assumono SDR",
      "Founder di startup B2B con un round Serie A quest'anno",
      "CRO in Iberia in aziende con 50-500 dipendenti",
    ],
    idleSuggestionsCompanies: [
      "Aziende SaaS in Iberia con 50-500 dipendenti",
      "Agenzie che usano HubSpot con una posizione aperta nelle vendite",
      "Aziende di logistica che adottano strumenti IA nel loro stack",
      "Brand e-commerce appena espansi negli USA",
    ],
    urlsTab: "URL",
    urlsIdleBtn: "Cerca per URL",
    urlsPlaceholder: "acme.com, esempio.com — incolla o digita URL/domini aziendali",
    urlsAddMore: "Aggiungine un altro…",
    urlsClearAll: "Cancella tutto",
    urlsRemove: (d: string) => `Rimuovi ${d}`,
    urlsHint:
      "Separa con virgole o spazi. Troveremo i prospect in queste aziende — affina con i filtri abituali.",
    urlsFieldAria: "URL o domini aziendali",
    domainListScoped: (n: number) =>
      `Limitato a ${n} ${n === 1 ? "azienda" : "aziende"} dalla tua lista`,
    domainListPrompt: (n: number) =>
      `Prospect in ${n} ${n === 1 ? "azienda" : "aziende"} dalla tua lista`,
    editList: "Modifica lista",
    clearList: "Rimuovi lista",
    introTitle: "Trova prospect con un prompt",
    introDescription:
      "Chiedi in linguaggio naturale o crea una query avanzata a mano. Kai restituisce una tabella di prospect o aziende con punteggio di affinità che puoi affinare, arricchire, salvare come lista dinamica e inviare a una campagna.",
    introPoints: [
      "Cerca nel database o lascia che l'IA trovi record simili",
      "Assegna un punteggio di affinità a ogni risultato in base alla tua richiesta",
      "Salva come lista dinamica che continua a riempirsi",
      "Collega direttamente a una campagna",
    ],
    assistantName: "Kai",
    chatHint: "Descrivi i tuoi prospect ideali, oppure scegli un esempio.",
    examples: "Esempi",
    thinking: "Kai sta cercando…",
    starter:
      "Ecco una tabella iniziale di VP Sales in aziende SaaS europee che hanno raccolto finanziamenti di recente. Affinala con un prompt o modifica i filtri a destra.",
    showingOf: (count: number, total: number) =>
      `Mostrando ${count} di circa ${total.toLocaleString()}. Continua ad affinare o salva questi come lista.`,
    refinedTo: (label: string) => `Affinato: ${label.toLowerCase()}.`,
    thinkingTitle: "Kai sta analizzando la tua richiesta…",
    thinkingSub: "Ricerca nel database e calcolo dell'affinità in base alla tua richiesta.",
    thinkingSteps: [
      "Comprensione della richiesta",
      "Ricerca in oltre 30M di contatti e aziende",
      "Calcolo dell'affinità e arricchimento dei risultati",
    ],
    refine: "Affina rapido",
    save: "Salva",
    saved: "Ricerche salvate",
    saveThis: "Salva questa ricerca",
    saveSearchDesc:
      "Dalle un nome per ritrovarla facilmente — te ne suggeriamo uno in base al tuo prompt e ai filtri.",
    saveNameLabel: "Nome della ricerca",
    noSaved: "Nessuna ricerca salvata ancora.",
    noSavedMatch: "Nessuna ricerca salvata corrisponde.",
    searchSaved: "Cerca nelle ricerche salvate…",
    savedToast: "Ricerca salvata con la cronologia dei prompt",
    loadedToast: "Ricerca salvata caricata",
    removedSaved: "Ricerca salvata rimossa",
    removeSaved: (name: string) => `Rimuovi ${name}`,
    people: "Prospect",
    companies: "Aziende",
    resultsFor: "Risultati",
    estLeads: (n: number) => `Stimati ${n.toLocaleString()} in totale`,
    perProspect: (n: number) => `${n} crediti / prospect`,
    freeToSave: "Salvare è gratis",
    projected: (n: number) => `≈ ${n.toLocaleString()} crediti`,
    getMore: "Ottieni più lead",
    getMoreToast: "Ampliamento della ricerca su tutto il database…",
    komboData: "Dati Kombo",
    komboHint: "Email verificate, cellulari, firmografia e intent — combinati dalla nostra rete di dati.",
    dbLabel: "Cerca in",
    dbKombo: "KomboAI",
    dbKomboDesc: "La nostra rete verificata di prospect e aziende.",
    dbLookalike: "Simili",
    dbLookalikeDesc: "Trova record simili a una persona o azienda.",
    dbLinkedinDesc: "Cerca con i filtri della rete LinkedIn.",
    dbSwitched: (name: string) => `Ora stai cercando in ${name}`,
    dbMoreLabel: "Altre fonti",
    dbSoon: "Presto",
    dbGmaps: "Google Maps",
    dbGmapsDesc: "Attività locali con indirizzo, telefono e recensioni.",
    dbTripadvisor: "TripAdvisor",
    dbTripadvisorDesc: "Locali di ospitalità e viaggi con valutazioni.",
    dbCompanyDbs: "Database aziendali",
    dbCompanyDbsDesc: "Crunchbase, Apollo e altre fonti firmografiche.",
    linkedinSource: "Sales Nav",
    linkedinHint: "Attivalo per usare i filtri esclusivi di LinkedIn (cambi di lavoro, post, grado di connessione…).",
    linkedinEnabled: "Filtri LinkedIn attivati",
    linkedinDisabled: "Filtri LinkedIn disattivati",
    sortBy: "Ordina",
    sortFit: "Miglior affinità",
    sortName: "Nome (A–Z)",
    sortCompany: "Azienda (A–Z)",
    sortHeadcount: "Azienda più grande",
    sortRecent: "Attività recente",
    departments: "Dipartimenti",
    technologies: "Tecnologie",
    revenue: "Fatturato",
    intent: "Buyer intent",
    founded: "Fondazione",
    growth: "Crescita organico",
    linkedinFilters: "Sales Nav",
    connections: "Connessioni",
    profileLanguages: "Lingue del profilo",
    serviceCategories: "Categorie di servizio",
    schools: "Scuole",
    currentCompanies: "Aziende attuali",
    pastCompanies: "Aziende precedenti",
    connectionsOf: "Connessioni di",
    followersOf: "Follower di",
    jobListings: "Annunci di lavoro su LinkedIn",
    heroTitle: "Descrivi il tuo cliente ideale",
    heroSubtitle: "Cerca tra oltre 250M di professionisti e aziende — o scegli un avvio rapido.",
    heroPlaceholder: "es. Responsabili RevOps in aziende SaaS Serie B in EMEA…",
    searchWithFilters: "Cerca con i filtri",
    spotlightsLabel: "In evidenza",
    matchLabel: "Corrispondenze",
    spotlights: ["Open to work", "Cambio di lavoro", "Attivi di recente", "Assunzioni in corso", "Alta intent"],
    columns: "Colonne",
    addToList: "Salva come lista",
    findPeople: "Trova prospect",
    findPeopleToast: "Passato ai prospect di queste aziende",
    lookalike: "Simili",
    lookalikeTitle: "Trova simili",
    lookalikeDesc:
      "Scegli una persona o azienda che ti piace già — Kai trova record simili a quel riferimento specifico. Affina ulteriormente con i filtri della barra laterale.",
    pickSeed: "Scegli un prospect o un'azienda",
    companySearch: "Cerca un'azienda per nome…",
    personSearch: "Cerca un prospect per nome…",
    useCompany: (name: string) => `Usa "${name}"`,
    seedPeople: "Prospect e clienti",
    seedCompanies: "Aziende",
    findSimilar: "Trova simili",
    similarTo: "Simile a",
    newSearchTab: "Nuova ricerca",
    clearLookalike: "Rimuovi simili",
    mapAreaHint: "Area di ricerca approssimativa — i risultati corrispondono intorno a questa posizione.",
    previewLocation: "Posizione",
    previewRole: "Ruolo",
    previewIndustry: "Settore",
    previewSize: "Dimensione azienda",
    previewGrowth: "Crescita",
    previewSignals: "Segnali",
    previewSeeAllPeople: "Vedi tutti i prospect",
    previewSeeAllCompanies: "Vedi tutte le aziende",
    previewEmpty: "Ancora nessuna corrispondenza — prova ad ampliare la ricerca.",
    lookalikePrompt: (name: string) => `Trova record simili a ${name}`,
    colFit: "Affinità",
    colName: "Nome",
    colCompany: "Azienda",
    colIndustry: "Settore",
    colRegion: "Regione",
    colHeadcount: "Dimensione",
    colEmail: "Email",
    colSignals: "Segnali",
    colRoles: "Posizioni aperte",
    emailVerified: "Verificata",
    emailLikely: "Probabile",
    emailMissing: "Mancante",
    selected: (n: number) => `${n} selezionati`,
    clearSel: "Pulisci",
    bulkList: "Aggiungi a lista",
    bulkExport: "Esporta",
    bulkCrm: "Aggiungi al CRM",
    crmToast: (n: number) => `Inviati ${n} al tuo CRM`,
    noResults: "Nessun risultato corrisponde alla tua ricerca o ai filtri.",
    addFilter: "Aggiungi filtro",
    filterTypeahead: "Cerca filtri o descrivili con l'IA…",
    addCustom: (v: string) => `Aggiungi "${v}"`,
    askAiFilter: (v: string) => `Chiedi all'IA: "${v}"`,
    viewAllFilters: "Vedi tutti i filtri",
    backToFilterSearch: "Torna alla ricerca",
    filtersTitle: "Filtri",
    filtersDesc: (n: number) =>
      n === 0
        ? "Cerca o descrivi i filtri con l'IA, poi spuntali per applicarli."
        : `${n} attivi · cerca o descrivi i filtri con l'IA, poi spuntali per applicarli.`,
    activeFilters: "Filtri attivi",
    noActiveFilters: "Ancora nessun filtro — scegli dalla lista.",
    notChip: (v: string) => `No: ${v}`,
    filtersNoMatch: "Nessun filtro corrisponde.",
    addToGroup: (label: string) => `Aggiungi ${label.toLowerCase()}…`,
    clearAll: "Cancella tutto",
    aiSuggestions: "Suggerimenti di ricerca con IA",
    runThisSearch: "Esegui questa ricerca",
    viewAll: "Vedi tutto",
    rowSelectAll: "Seleziona tutto",
    editFilters: "Modifica",
    done: "Fatto",
    columnsBtn: "Colonne",
    columnsTitle: "Personalizza colonne",
    columnsDesc: (n: number, total: number) =>
      `${n} di ${total} colonne visibili. Attiva o disattiva i campi.`,
    alwaysShown: "Sempre visibili",
    optionalCols: "Colonne opzionali",
    alwaysTag: "Fissa",
    buildTitle: "Crea una lista",
    buildStepSetup: "Impostazioni",
    buildStepSource: "Origine",
    buildName: "Nome della lista",
    buildNamePlaceholder: "es. VP Sales EMEA",
    buildType: "Cosa contiene questa lista?",
    buildPeople: "Prospect",
    buildPeopleDesc: "Prospect e contatti singoli.",
    buildCompanies: "Aziende",
    buildCompaniesDesc: "Account e organizzazioni.",
    capLabel: "Contatti massimi per azienda",
    capNoLimit: "Nessun limite",
    capChip: (n: number) => `Max ${n}/azienda`,
    capBatchNote: (max: number) =>
      `Se ne possono aggiungere solo ${max.toLocaleString()} alla volta.`,
    buildPopulate: "Come vuoi popolarla?",
    buildNext: "Avanti",
    buildBack: "Indietro",
    selectPage: "Seleziona pagina",
    deselectPage: "Deseleziona pagina",
    selectAllCapped: (n: number) => `Seleziona tutti (${n.toLocaleString()})`,
    enrichCompaniesToast: (n: number) =>
      `Arricchimento di ${n} ${n === 1 ? "azienda" : "aziende"}…`,
    buildAssign: "Responsabile",
    buildAssignHint:
      "I nuovi prospect che entrano in questa lista vengono assegnati a questo collega.",
    buildUnassigned: "Non assegnato",
    hideInList: "Nascondi quelli già in una lista",
    hideInCrm: "Nascondi quelli già nel CRM",
    addRowToList: "Aggiungi a lista",
    pageRange: (from: number, to: number, total: number) =>
      `${from.toLocaleString()}–${to.toLocaleString()} di ${total.toLocaleString()}`,
    srcFindPeople: "Trova prospect",
    srcFindPeopleDesc: "Cerca nel nostro database i prospect corrispondenti.",
    srcFindCompanies: "Trova aziende",
    srcFindCompaniesDesc: "Cerca nel nostro database gli account corrispondenti.",
    srcLookalike: "Simili",
    srcLookalikeDesc: "Trova record simili a una persona o azienda.",
    srcImport: "Importa CSV",
    srcImportDesc: "Carica un CSV di prospect o aziende.",
    srcCrm: "Dal CRM",
    srcCrmDesc: "Importa da HubSpot, Salesforce e altro.",
    srcBlank: "Inizia vuota",
    srcBlankDesc: "Crea una lista vuota e aggiungi record in seguito.",
    srcGroupAi: "Kombo AI",
    srcGroupLinkedin: "LinkedIn",
    srcGroupCrunchbase: "Crunchbase",
    srcGroupImportCat: "Importa e manuale",
    srcLiSearch: "Cerca su LinkedIn",
    srcLiPost: "Estrai da un post",
    srcLiEvent: "Estrai da un evento",
    srcLiPoll: "Estrai da un sondaggio",
    srcLiConnections: "Le tue connessioni LinkedIn",
    srcLiFollowers: "I tuoi follower LinkedIn",
    srcCb: "Cerca su Crunchbase",
    srcCbInvestors: "Cerca investitori",
    srcManual: "Aggiungi manualmente",
    srcHubspot: "Importa da HubSpot",
    srcHubspotList: "Importa da una lista HubSpot",
    buildSourceSoon: "Apertura ricerca — scegli i tuoi filtri",
    buildCreated: (name: string) => `Creata "${name}"`,
    titles: "Cariche",
    seniority: "Anzianità",
    regions: "Regioni",
    industries: "Settori",
    headcountF: "Organico",
    signals: "Segnali",
    saveTitle: "Salva come lista",
    saveDesc: (n: number) =>
      `${n} lead ${n === 1 ? "sarà aggiunto" : "saranno aggiunti"} a una nuova lista come prospect arricchiti.`,
    listName: "Nome della lista",
    connectCampaign: "Collega a una campagna",
    noCampaign: "Non collegare ora",
    newCampaign: "＋ Nuova campagna",
    dynamicNote:
      "Salvata come lista dinamica — i nuovi prospect corrispondenti continueranno ad arrivare nel tempo.",
    cancel: "Annulla",
    saveList: "Salva lista",
    savedListToast: (name: string) => `Salvato "${name}" con i tuoi risultati`,
    refineChips: [
      { label: "Solo finanziati di recente", patch: { signals: ["Recently funded"] } },
      { label: "Solo EMEA", patch: { regions: ["EMEA"] } },
      { label: "1000+ dipendenti", patch: { headcount: ["1000+"] } },
      { label: "Aggiungi VP Marketing", patch: { titles: ["VP of Marketing"] } },
    ],
  },
  fr: {
    title: "Recherche",
    description:
      "Recherchez dans toute votre base de prospects et d'entreprises — filtrez, triez et enregistrez les résultats sous forme de liste dynamique.",
    signalsTitle: "Signaux",
    signalsDescription:
      "Prospects et entreprises identifiés par l'IA, notés et prêts à rechercher, enregistrer ou ajouter à une campagne.",
    inputPlaceholder: "ex. VP Sales dans des SaaS européens qui viennent de lever des fonds…",
    inputPlaceholderCompanies: "ex. Fintechs Série B qui recrutent dans les ventes en Europe…",
    searchBtn: "Rechercher",
    clearQuery: "Effacer la recherche",
    srTitle: "Recherche",
    idleTitle: "Recherchez des prospects et des entreprises à votre façon",
    idleDesc:
      "Décrivez votre prospect ou entreprise idéal, ou effectuez une recherche par nom, poste, lieu, secteur et plus encore — puis affinez avec des filtres avancés. À partir de vos résultats, enrichissez des contacts, créez une liste ou lancez une campagne.",
    idleSuggestedTitle: "Ou essayez l'une de ces suggestions",
    idleSuggestionsPeople: [
      "VP Sales dans des scale-ups SaaS en EMEA",
      "Responsables RevOps dans des entreprises qui recrutent des SDR",
      "Fondateurs de startups B2B ayant levé une Série A cette année",
      "CRO en Ibérie dans des entreprises de 50 à 500 salariés",
    ],
    idleSuggestionsCompanies: [
      "Entreprises SaaS en Ibérie de 50 à 500 salariés",
      "Agences utilisant HubSpot ayant ouvert un poste commercial",
      "Entreprises de logistique adoptant des outils IA dans leur stack",
      "Marques e-commerce qui viennent de se développer aux États-Unis",
    ],
    urlsTab: "URL",
    urlsIdleBtn: "Rechercher par URL",
    urlsPlaceholder: "acme.com, exemple.com — collez ou saisissez des URL/domaines d'entreprise",
    urlsAddMore: "Ajouter un autre…",
    urlsClearAll: "Tout effacer",
    urlsRemove: (d: string) => `Retirer ${d}`,
    urlsHint:
      "Séparez par des virgules ou des espaces. Nous trouverons des prospects dans ces entreprises — affinez avec les filtres habituels.",
    urlsFieldAria: "URL ou domaines d'entreprise",
    domainListScoped: (n: number) =>
      `Limité à ${n} ${n === 1 ? "entreprise" : "entreprises"} de votre liste`,
    domainListPrompt: (n: number) =>
      `Prospects dans ${n} ${n === 1 ? "entreprise" : "entreprises"} de votre liste`,
    editList: "Modifier la liste",
    clearList: "Retirer la liste",
    introTitle: "Prospectez avec un prompt",
    introDescription:
      "Posez votre question en langage naturel ou créez une requête avancée à la main. Kai renvoie un tableau de prospects ou d'entreprises noté selon leur adéquation, que vous pouvez affiner, enrichir, enregistrer comme liste dynamique et envoyer vers une campagne.",
    introPoints: [
      "Recherchez dans la base ou laissez l'IA trouver des profils similaires",
      "Notez chaque résultat selon son adéquation avec votre demande",
      "Enregistrez comme liste dynamique qui continue de se remplir",
      "Connectez directement à une campagne",
    ],
    assistantName: "Kai",
    chatHint: "Décrivez vos prospects idéaux, ou choisissez un exemple.",
    examples: "Exemples",
    thinking: "Kai recherche…",
    starter:
      "Voici un tableau de départ pour les VP Sales dans des entreprises SaaS européennes ayant récemment levé des fonds. Affinez-le avec un prompt ou modifiez les filtres à droite.",
    showingOf: (count: number, total: number) =>
      `Affichage de ${count} sur environ ${total.toLocaleString()}. Continuez à affiner ou enregistrez ces résultats comme liste.`,
    refinedTo: (label: string) => `Affiné : ${label.toLowerCase()}.`,
    thinkingTitle: "Kai analyse votre demande…",
    thinkingSub: "Recherche dans la base de données et calcul de l'adéquation avec votre demande.",
    thinkingSteps: [
      "Compréhension de votre demande",
      "Recherche parmi plus de 30 M de contacts et d'entreprises",
      "Calcul de l'adéquation et enrichissement des résultats",
    ],
    refine: "Affiner rapidement",
    save: "Enregistrer",
    saved: "Recherches enregistrées",
    saveThis: "Enregistrer cette recherche",
    saveSearchDesc:
      "Donnez-lui un nom pour la retrouver facilement — nous en suggérons un basé sur votre prompt et vos filtres.",
    saveNameLabel: "Nom de la recherche",
    noSaved: "Aucune recherche enregistrée pour le moment.",
    noSavedMatch: "Aucune recherche enregistrée ne correspond.",
    searchSaved: "Rechercher dans les recherches enregistrées…",
    savedToast: "Recherche enregistrée avec son historique de prompts",
    loadedToast: "Recherche enregistrée chargée",
    removedSaved: "Recherche enregistrée supprimée",
    removeSaved: (name: string) => `Retirer ${name}`,
    people: "Prospects",
    companies: "Entreprises",
    resultsFor: "Résultats",
    estLeads: (n: number) => `Est. ${n.toLocaleString()} au total`,
    perProspect: (n: number) => `${n} crédits / prospect`,
    freeToSave: "Enregistrement gratuit",
    projected: (n: number) => `≈ ${n.toLocaleString()} crédits`,
    getMore: "Obtenir plus de leads",
    getMoreToast: "Extension de la recherche à toute la base de données…",
    komboData: "Données Kombo",
    komboHint: "Emails vérifiés, mobiles, firmographie et intent — combinés à partir de notre réseau de données.",
    dbLabel: "Rechercher dans",
    dbKombo: "KomboAI",
    dbKomboDesc: "Notre réseau vérifié de prospects et d'entreprises.",
    dbLookalike: "Similaires",
    dbLookalikeDesc: "Trouvez des profils similaires à une personne ou une entreprise.",
    dbLinkedinDesc: "Recherchez avec les filtres du réseau LinkedIn.",
    dbSwitched: (name: string) => `Recherche en cours dans ${name}`,
    dbMoreLabel: "Autres sources",
    dbSoon: "Bientôt",
    dbGmaps: "Google Maps",
    dbGmapsDesc: "Commerces locaux avec adresse, téléphone et avis.",
    dbTripadvisor: "TripAdvisor",
    dbTripadvisorDesc: "Établissements d'hôtellerie et de voyage avec notes.",
    dbCompanyDbs: "Bases de données d'entreprises",
    dbCompanyDbsDesc: "Crunchbase, Apollo et autres sources firmographiques.",
    linkedinSource: "Sales Nav",
    linkedinHint: "Activez pour cibler les filtres réseau réservés à LinkedIn (changements de poste, publications, degré de connexion…).",
    linkedinEnabled: "Filtres LinkedIn activés",
    linkedinDisabled: "Filtres LinkedIn désactivés",
    sortBy: "Trier",
    sortFit: "Meilleure adéquation",
    sortName: "Nom (A–Z)",
    sortCompany: "Entreprise (A–Z)",
    sortHeadcount: "Plus grande entreprise",
    sortRecent: "Activité récente",
    departments: "Départements",
    technologies: "Technologies",
    revenue: "Chiffre d'affaires",
    intent: "Intention d'achat",
    founded: "Création",
    growth: "Croissance des effectifs",
    linkedinFilters: "Sales Nav",
    connections: "Relations",
    profileLanguages: "Langues du profil",
    serviceCategories: "Catégories de service",
    schools: "Établissements",
    currentCompanies: "Entreprises actuelles",
    pastCompanies: "Entreprises précédentes",
    connectionsOf: "Relations de",
    followersOf: "Abonnés de",
    jobListings: "Offres d'emploi sur LinkedIn",
    heroTitle: "Décrivez votre client idéal",
    heroSubtitle: "Recherchez parmi plus de 250 M de professionnels et d'entreprises — ou choisissez un démarrage rapide.",
    heroPlaceholder: "ex. Responsables RevOps dans des SaaS Série B en EMEA…",
    searchWithFilters: "Rechercher avec des filtres",
    spotlightsLabel: "À la une",
    matchLabel: "Correspondances",
    spotlights: ["Open to work", "A changé de poste", "Actif récemment", "Recrute", "Forte intention"],
    columns: "Colonnes",
    addToList: "Enregistrer comme liste",
    findPeople: "Trouver des prospects",
    findPeopleToast: "Basculé sur les prospects de ces entreprises",
    lookalike: "Similaires",
    lookalikeTitle: "Trouver des profils similaires",
    lookalikeDesc:
      "Choisissez une personne ou une entreprise qui vous convient déjà — Kai trouve des profils similaires à cette référence précise. Affinez encore avec les filtres de la barre latérale.",
    pickSeed: "Choisissez un prospect ou une entreprise",
    companySearch: "Rechercher une entreprise par nom…",
    personSearch: "Rechercher un prospect par nom…",
    useCompany: (name: string) => `Utiliser « ${name} »`,
    seedPeople: "Prospects et clients",
    seedCompanies: "Entreprises",
    findSimilar: "Trouver des profils similaires",
    similarTo: "Similaire à",
    newSearchTab: "Nouvelle recherche",
    clearLookalike: "Retirer les similaires",
    mapAreaHint: "Zone de recherche approximative — les résultats correspondent autour de cet emplacement.",
    previewLocation: "Lieu",
    previewRole: "Poste",
    previewIndustry: "Secteur",
    previewSize: "Taille d'entreprise",
    previewGrowth: "Croissance",
    previewSignals: "Signaux",
    previewSeeAllPeople: "Voir tous les prospects",
    previewSeeAllCompanies: "Voir toutes les entreprises",
    previewEmpty: "Aucune correspondance pour l'instant — essayez d'élargir votre recherche.",
    lookalikePrompt: (name: string) => `Trouver des profils similaires à ${name}`,
    colFit: "Adéquation",
    colName: "Nom",
    colCompany: "Entreprise",
    colIndustry: "Secteur",
    colRegion: "Région",
    colHeadcount: "Taille",
    colEmail: "Email",
    colSignals: "Signaux",
    colRoles: "Postes ouverts",
    emailVerified: "Vérifié",
    emailLikely: "Probable",
    emailMissing: "Manquant",
    selected: (n: number) => `${n} sélectionné(s)`,
    clearSel: "Effacer",
    bulkList: "Ajouter à une liste",
    bulkExport: "Exporter",
    bulkCrm: "Ajouter au CRM",
    crmToast: (n: number) => `${n} envoyé(s) vers votre CRM`,
    noResults: "Aucun résultat ne correspond à votre recherche ou à vos filtres.",
    addFilter: "Ajouter un filtre",
    filterTypeahead: "Recherchez des filtres ou décrivez-les avec l'IA…",
    addCustom: (v: string) => `Ajouter « ${v} »`,
    askAiFilter: (v: string) => `Demander à l'IA : « ${v} »`,
    viewAllFilters: "Voir tous les filtres",
    backToFilterSearch: "Retour à la recherche",
    filtersTitle: "Filtres",
    filtersDesc: (n: number) =>
      n === 0
        ? "Recherchez ou décrivez des filtres avec l'IA, puis cochez-les pour les appliquer."
        : `${n} actif(s) · recherchez ou décrivez des filtres avec l'IA, puis cochez-les pour les appliquer.`,
    activeFilters: "Filtres actifs",
    noActiveFilters: "Aucun filtre pour le moment — choisissez dans la liste.",
    notChip: (v: string) => `Sauf : ${v}`,
    filtersNoMatch: "Aucun filtre ne correspond.",
    addToGroup: (label: string) => `Ajouter ${label.toLowerCase()}…`,
    clearAll: "Tout effacer",
    aiSuggestions: "Suggestions de recherche par IA",
    runThisSearch: "Lancer cette recherche",
    viewAll: "Tout voir",
    rowSelectAll: "Tout sélectionner",
    editFilters: "Modifier",
    done: "Terminé",
    columnsBtn: "Colonnes",
    columnsTitle: "Personnaliser les colonnes",
    columnsDesc: (n: number, total: number) =>
      `${n} colonne(s) affichée(s) sur ${total}. Activez ou désactivez les champs.`,
    alwaysShown: "Toujours affichées",
    optionalCols: "Colonnes facultatives",
    alwaysTag: "Toujours",
    buildTitle: "Créer une liste",
    buildStepSetup: "Configuration",
    buildStepSource: "Source",
    buildName: "Nom de la liste",
    buildNamePlaceholder: "ex. VP Sales EMEA",
    buildType: "Que contient cette liste ?",
    buildPeople: "Prospects",
    buildPeopleDesc: "Prospects et contacts individuels.",
    buildCompanies: "Entreprises",
    buildCompaniesDesc: "Comptes et organisations.",
    capLabel: "Contacts max par entreprise",
    capNoLimit: "Aucune limite",
    capChip: (n: number) => `Max ${n}/entreprise`,
    capBatchNote: (max: number) =>
      `Seuls ${max.toLocaleString()} peuvent être ajoutés à la fois.`,
    buildPopulate: "Comment voulez-vous la remplir ?",
    buildNext: "Suivant",
    buildBack: "Retour",
    selectPage: "Sélectionner la page",
    deselectPage: "Désélectionner la page",
    selectAllCapped: (n: number) => `Tout sélectionner (${n.toLocaleString()})`,
    enrichCompaniesToast: (n: number) =>
      `Enrichissement de ${n} ${n === 1 ? "entreprise" : "entreprises"}…`,
    buildAssign: "Propriétaire",
    buildAssignHint:
      "Les nouveaux prospects entrant dans cette liste sont assignés à ce collègue.",
    buildUnassigned: "Non assigné",
    hideInList: "Masquer ceux déjà dans une liste",
    hideInCrm: "Masquer ceux déjà dans le CRM",
    addRowToList: "Ajouter à une liste",
    pageRange: (from: number, to: number, total: number) =>
      `${from.toLocaleString()}–${to.toLocaleString()} sur ${total.toLocaleString()}`,
    srcFindPeople: "Trouver des prospects",
    srcFindPeopleDesc: "Recherchez dans notre base les prospects correspondants.",
    srcFindCompanies: "Trouver des entreprises",
    srcFindCompaniesDesc: "Recherchez dans notre base les comptes correspondants.",
    srcLookalike: "Similaires",
    srcLookalikeDesc: "Trouvez des profils similaires à une personne ou une entreprise.",
    srcImport: "Importer un CSV",
    srcImportDesc: "Importez un CSV de prospects ou d'entreprises.",
    srcCrm: "Depuis le CRM",
    srcCrmDesc: "Importez depuis HubSpot, Salesforce et plus.",
    srcBlank: "Démarrer à vide",
    srcBlankDesc: "Créez une liste vide et ajoutez des profils plus tard.",
    srcGroupAi: "Kombo AI",
    srcGroupLinkedin: "LinkedIn",
    srcGroupCrunchbase: "Crunchbase",
    srcGroupImportCat: "Import et manuel",
    srcLiSearch: "Rechercher sur LinkedIn",
    srcLiPost: "Extraire d'une publication",
    srcLiEvent: "Extraire d'un événement",
    srcLiPoll: "Extraire d'un sondage",
    srcLiConnections: "Vos relations LinkedIn",
    srcLiFollowers: "Vos abonnés LinkedIn",
    srcCb: "Rechercher sur Crunchbase",
    srcCbInvestors: "Rechercher des investisseurs",
    srcManual: "Ajouter manuellement",
    srcHubspot: "Importer depuis HubSpot",
    srcHubspotList: "Importer depuis une liste HubSpot",
    buildSourceSoon: "Ouverture de la recherche — choisissez vos filtres",
    buildCreated: (name: string) => `« ${name} » créée`,
    titles: "Intitulés de poste",
    seniority: "Séniorité",
    regions: "Régions",
    industries: "Secteurs",
    headcountF: "Effectifs",
    signals: "Signaux",
    saveTitle: "Enregistrer comme liste",
    saveDesc: (n: number) =>
      `${n} ${n === 1 ? "lead sera ajouté" : "leads seront ajoutés"} à une nouvelle liste en tant que prospects enrichis.`,
    listName: "Nom de la liste",
    connectCampaign: "Connecter à une campagne",
    noCampaign: "Ne pas connecter maintenant",
    newCampaign: "＋ Nouvelle campagne",
    dynamicNote:
      "Enregistrée comme liste dynamique — les nouveaux prospects correspondants continueront d'arriver au fil du temps.",
    cancel: "Annuler",
    saveList: "Enregistrer la liste",
    savedListToast: (name: string) => `« ${name} » enregistrée avec vos résultats`,
    refineChips: [
      { label: "Financement récent uniquement", patch: { signals: ["Recently funded"] } },
      { label: "EMEA uniquement", patch: { regions: ["EMEA"] } },
      { label: "1000+ salariés", patch: { headcount: ["1000+"] } },
      { label: "Ajouter VP Marketing", patch: { titles: ["VP of Marketing"] } },
    ],
  },
  de: {
    title: "Suche",
    description:
      "Durchsuche deine gesamte Prospect- und Unternehmensdatenbank — filtern, sortieren und Ergebnisse als dynamische Liste speichern.",
    signalsTitle: "Signale",
    signalsDescription:
      "Von der KI abgeglichene Prospects und Unternehmen, bewertet und bereit zum Suchen, Speichern oder Hinzufügen zu einer Kampagne.",
    inputPlaceholder: "z. B. VP Sales bei europäischen SaaS-Firmen, die gerade Kapital aufgenommen haben…",
    inputPlaceholderCompanies: "z. B. Series-B-Fintechs, die im Vertrieb in Europa einstellen…",
    searchBtn: "Suchen",
    clearQuery: "Suche löschen",
    srTitle: "Suche",
    idleTitle: "Suche Prospects und Unternehmen auf deine Art",
    idleDesc:
      "Beschreibe deinen idealen Prospect oder dein ideales Unternehmen, oder suche nach Name, Rolle, Standort, Branche und mehr — und grenze dann mit erweiterten Filtern ein. Reichere aus deinen Ergebnissen Kontakte an, erstelle eine Liste oder starte eine Kampagne.",
    idleSuggestedTitle: "Oder probier eine dieser Optionen",
    idleSuggestionsPeople: [
      "VP Sales bei SaaS-Scale-ups in EMEA",
      "RevOps-Leads bei Unternehmen, die SDRs einstellen",
      "Gründer von B2B-Startups mit Series-A-Runde in diesem Jahr",
      "CROs in Iberien bei Unternehmen mit 50-500 Mitarbeitenden",
    ],
    idleSuggestionsCompanies: [
      "SaaS-Unternehmen in Iberien mit 50-500 Mitarbeitenden",
      "Agenturen mit HubSpot, die eine Vertriebsstelle ausgeschrieben haben",
      "Logistikunternehmen, die KI-Tools in ihren Stack integrieren",
      "E-Commerce-Marken, die gerade in die USA expandiert sind",
    ],
    urlsTab: "URLs",
    urlsIdleBtn: "Nach URLs suchen",
    urlsPlaceholder: "acme.com, beispiel.com — Unternehmens-URLs/Domains einfügen oder eingeben",
    urlsAddMore: "Weitere hinzufügen…",
    urlsClearAll: "Alle löschen",
    urlsRemove: (d: string) => `${d} entfernen`,
    urlsHint:
      "Mit Kommas oder Leerzeichen trennen. Wir finden Prospects bei diesen Unternehmen — verfeinere mit den gewohnten Filtern.",
    urlsFieldAria: "Unternehmens-URLs oder Domains",
    domainListScoped: (n: number) =>
      `Eingegrenzt auf ${n} Unternehmen aus deiner Liste`,
    domainListPrompt: (n: number) =>
      `Prospects bei ${n} Unternehmen aus deiner Liste`,
    editList: "Liste bearbeiten",
    clearList: "Liste entfernen",
    introTitle: "Prospecting per Prompt",
    introDescription:
      "Frag in natürlicher Sprache oder erstelle manuell eine erweiterte Abfrage. Kai liefert eine nach Fit bewertete Tabelle mit Prospects oder Unternehmen, die du verfeinern, anreichern, als dynamische Liste speichern und in eine Kampagne übernehmen kannst.",
    introPoints: [
      "Durchsuche die Datenbank oder lass die KI ähnliche Profile finden",
      "Bewerte jedes Ergebnis nach Fit zu deiner Anfrage",
      "Speichere als dynamische Liste, die sich stetig füllt",
      "Verbinde direkt mit einer Kampagne",
    ],
    assistantName: "Kai",
    chatHint: "Beschreibe deine idealen Prospects oder wähle ein Beispiel.",
    examples: "Beispiele",
    thinking: "Kai sucht…",
    starter:
      "Hier ist eine Starttabelle für VP Sales bei europäischen SaaS-Unternehmen, die kürzlich Kapital aufgenommen haben. Verfeinere sie mit einem Prompt oder bearbeite die Filter rechts.",
    showingOf: (count: number, total: number) =>
      `Zeigt ${count} von geschätzt ${total.toLocaleString()}. Weiter verfeinern oder als Liste speichern.`,
    refinedTo: (label: string) => `Verfeinert: ${label.toLowerCase()}.`,
    thinkingTitle: "Kai analysiert deine Anfrage…",
    thinkingSub: "Durchsucht die Datenbank und bewertet den Fit zu deiner Anfrage.",
    thinkingSteps: [
      "Anfrage wird verstanden",
      "Durchsucht 30M+ Kontakte & Unternehmen",
      "Fit wird bewertet und Ergebnisse werden angereichert",
    ],
    refine: "Schnell verfeinern",
    save: "Speichern",
    saved: "Gespeicherte Suchen",
    saveThis: "Diese Suche speichern",
    saveSearchDesc:
      "Gib ihr einen Namen, um sie wiederzufinden — wir haben schon einen anhand deines Prompts und deiner Filter vorgeschlagen.",
    saveNameLabel: "Name der Suche",
    noSaved: "Noch keine gespeicherten Suchen.",
    noSavedMatch: "Keine gespeicherte Suche passt.",
    searchSaved: "Gespeicherte Suchen durchsuchen…",
    savedToast: "Suche mit Prompt-Verlauf gespeichert",
    loadedToast: "Gespeicherte Suche geladen",
    removedSaved: "Gespeicherte Suche entfernt",
    removeSaved: (name: string) => `${name} entfernen`,
    people: "Prospects",
    companies: "Unternehmen",
    resultsFor: "Ergebnisse",
    estLeads: (n: number) => `Geschätzt ${n.toLocaleString()} insgesamt`,
    perProspect: (n: number) => `${n} Credits / Prospect`,
    freeToSave: "Speichern ist kostenlos",
    projected: (n: number) => `≈ ${n.toLocaleString()} Credits`,
    getMore: "Mehr Leads holen",
    getMoreToast: "Suche wird auf die gesamte Datenbank ausgeweitet…",
    komboData: "Kombo-Daten",
    komboHint: "Verifizierte E-Mails, Mobilnummern, Firmografie & Intent — kombiniert aus unserem Datennetzwerk.",
    dbLabel: "Suchen in",
    dbKombo: "KomboAI",
    dbKomboDesc: "Unser verifiziertes Netzwerk aus Prospects & Unternehmen.",
    dbLookalike: "Lookalike",
    dbLookalikeDesc: "Finde Datensätze ähnlich zu einer Person oder einem Unternehmen.",
    dbLinkedinDesc: "Suche mit LinkedIn-Netzwerkfiltern.",
    dbSwitched: (name: string) => `Suche jetzt in ${name}`,
    dbMoreLabel: "Weitere Quellen",
    dbSoon: "Bald",
    dbGmaps: "Google Maps",
    dbGmapsDesc: "Lokale Unternehmen mit Adresse, Telefonnummer & Bewertungen.",
    dbTripadvisor: "TripAdvisor",
    dbTripadvisorDesc: "Gastronomie- und Reisebetriebe mit Bewertungen.",
    dbCompanyDbs: "Unternehmensdatenbanken",
    dbCompanyDbsDesc: "Crunchbase, Apollo & weitere firmografische Quellen.",
    linkedinSource: "Sales Nav",
    linkedinHint: "Aktivieren, um exklusive LinkedIn-Netzwerkfilter zu nutzen (Jobwechsel, Beiträge, Verbindungsgrad…).",
    linkedinEnabled: "LinkedIn-Filter aktiviert",
    linkedinDisabled: "LinkedIn-Filter deaktiviert",
    sortBy: "Sortieren",
    sortFit: "Bester Fit",
    sortName: "Name (A–Z)",
    sortCompany: "Unternehmen (A–Z)",
    sortHeadcount: "Größtes Unternehmen",
    sortRecent: "Kürzlich aktiv",
    departments: "Abteilungen",
    technologies: "Technologien",
    revenue: "Umsatz",
    intent: "Kaufabsicht",
    founded: "Gründung",
    growth: "Mitarbeiterwachstum",
    linkedinFilters: "Sales Nav",
    connections: "Kontakte",
    profileLanguages: "Profilsprachen",
    serviceCategories: "Servicekategorien",
    schools: "Bildungseinrichtungen",
    currentCompanies: "Aktuelle Unternehmen",
    pastCompanies: "Frühere Unternehmen",
    connectionsOf: "Kontakte von",
    followersOf: "Follower von",
    jobListings: "Stellenanzeigen auf LinkedIn",
    heroTitle: "Beschreibe deinen idealen Kunden",
    heroSubtitle: "Durchsuche über 250M Fachkräfte und Unternehmen — oder wähle einen Schnellstart.",
    heroPlaceholder: "z. B. RevOps-Leads bei Series-B-SaaS-Unternehmen in EMEA…",
    searchWithFilters: "Mit Filtern suchen",
    spotlightsLabel: "Im Fokus",
    matchLabel: "Treffer",
    spotlights: ["Open to work", "Job gewechselt", "Kürzlich aktiv", "Stellt ein", "Hohe Kaufabsicht"],
    columns: "Spalten",
    addToList: "Als Liste speichern",
    findPeople: "Prospects finden",
    findPeopleToast: "Zu Prospects bei diesen Unternehmen gewechselt",
    lookalike: "Lookalikes",
    lookalikeTitle: "Lookalikes finden",
    lookalikeDesc:
      "Wähle eine Person oder ein Unternehmen, das dir bereits gefällt — Kai findet Datensätze ähnlich zu genau diesem Vorbild. Verfeinere weiter mit den Filtern in der Seitenleiste.",
    pickSeed: "Wähle einen Prospect oder ein Unternehmen",
    companySearch: "Unternehmen nach Namen suchen…",
    personSearch: "Prospect nach Namen suchen…",
    useCompany: (name: string) => `„${name}“ verwenden`,
    seedPeople: "Prospects & Kunden",
    seedCompanies: "Unternehmen",
    findSimilar: "Ähnliche finden",
    similarTo: "Ähnlich zu",
    newSearchTab: "Neue Suche",
    clearLookalike: "Lookalike entfernen",
    mapAreaHint: "Ungefährer Suchbereich — Ergebnisse werden rund um diesen Standort abgeglichen.",
    previewLocation: "Standort",
    previewRole: "Rolle",
    previewIndustry: "Branche",
    previewSize: "Unternehmensgröße",
    previewGrowth: "Wachstum",
    previewSignals: "Signale",
    previewSeeAllPeople: "Alle Prospects ansehen",
    previewSeeAllCompanies: "Alle Unternehmen ansehen",
    previewEmpty: "Noch keine Treffer — versuche, die Suche zu erweitern.",
    lookalikePrompt: (name: string) => `Datensätze ähnlich zu ${name} finden`,
    colFit: "Fit",
    colName: "Name",
    colCompany: "Unternehmen",
    colIndustry: "Branche",
    colRegion: "Region",
    colHeadcount: "Größe",
    colEmail: "E-Mail",
    colSignals: "Signale",
    colRoles: "Offene Stellen",
    emailVerified: "Verifiziert",
    emailLikely: "Wahrscheinlich",
    emailMissing: "Fehlt",
    selected: (n: number) => `${n} ausgewählt`,
    clearSel: "Zurücksetzen",
    bulkList: "Zur Liste hinzufügen",
    bulkExport: "Exportieren",
    bulkCrm: "Zum CRM hinzufügen",
    crmToast: (n: number) => `${n} an dein CRM gesendet`,
    noResults: "Keine Ergebnisse passen zu deiner Suche oder deinen Filtern.",
    addFilter: "Filter hinzufügen",
    filterTypeahead: "Filter suchen oder mit KI beschreiben…",
    addCustom: (v: string) => `„${v}“ hinzufügen`,
    askAiFilter: (v: string) => `KI fragen: „${v}“`,
    viewAllFilters: "Alle Filter ansehen",
    backToFilterSearch: "Zurück zur Suche",
    filtersTitle: "Filter",
    filtersDesc: (n: number) =>
      n === 0
        ? "Filter suchen oder mit KI beschreiben, dann zum Anwenden abhaken."
        : `${n} aktiv · Filter suchen oder mit KI beschreiben, dann zum Anwenden abhaken.`,
    activeFilters: "Aktive Filter",
    noActiveFilters: "Noch keine Filter — aus der Liste wählen.",
    notChip: (v: string) => `Nicht: ${v}`,
    filtersNoMatch: "Keine passenden Filter.",
    addToGroup: (label: string) => `${label.toLowerCase()} hinzufügen…`,
    clearAll: "Alle löschen",
    aiSuggestions: "KI-gestützte Suchvorschläge",
    runThisSearch: "Diese Suche ausführen",
    viewAll: "Alle ansehen",
    rowSelectAll: "Alle auswählen",
    editFilters: "Bearbeiten",
    done: "Fertig",
    columnsBtn: "Spalten",
    columnsTitle: "Spalten anpassen",
    columnsDesc: (n: number, total: number) =>
      `${n} von ${total} Spalten angezeigt. Felder ein- oder ausblenden.`,
    alwaysShown: "Immer angezeigt",
    optionalCols: "Optionale Spalten",
    alwaysTag: "Immer",
    buildTitle: "Liste erstellen",
    buildStepSetup: "Einrichtung",
    buildStepSource: "Quelle",
    buildName: "Listenname",
    buildNamePlaceholder: "z. B. EMEA VP Sales",
    buildType: "Was enthält diese Liste?",
    buildPeople: "Prospects",
    buildPeopleDesc: "Einzelne Prospects & Kontakte.",
    buildCompanies: "Unternehmen",
    buildCompaniesDesc: "Accounts & Organisationen.",
    capLabel: "Max. Kontakte pro Unternehmen",
    capNoLimit: "Kein Limit",
    capChip: (n: number) => `Max. ${n}/Unternehmen`,
    capBatchNote: (max: number) =>
      `Es können jeweils nur ${max.toLocaleString()} hinzugefügt werden.`,
    buildPopulate: "Wie möchtest du sie befüllen?",
    buildNext: "Weiter",
    buildBack: "Zurück",
    selectPage: "Seite auswählen",
    deselectPage: "Seitenauswahl aufheben",
    selectAllCapped: (n: number) => `Alle ${n.toLocaleString()} auswählen`,
    enrichCompaniesToast: (n: number) =>
      `${n} ${n === 1 ? "Unternehmen wird" : "Unternehmen werden"} angereichert…`,
    buildAssign: "Owner",
    buildAssignHint:
      "Neue Prospects, die in diese Liste aufgenommen werden, werden diesem Teammitglied zugewiesen.",
    buildUnassigned: "Nicht zugewiesen",
    hideInList: "Bereits gelistete ausblenden",
    hideInCrm: "Bereits im CRM ausblenden",
    addRowToList: "Zur Liste hinzufügen",
    pageRange: (from: number, to: number, total: number) =>
      `${from.toLocaleString()}–${to.toLocaleString()} von ${total.toLocaleString()}`,
    srcFindPeople: "Prospects finden",
    srcFindPeopleDesc: "Durchsuche unsere Datenbank nach passenden Prospects.",
    srcFindCompanies: "Unternehmen finden",
    srcFindCompaniesDesc: "Durchsuche unsere Datenbank nach passenden Accounts.",
    srcLookalike: "Lookalike",
    srcLookalikeDesc: "Finde Datensätze ähnlich zu einer Person oder einem Unternehmen.",
    srcImport: "CSV importieren",
    srcImportDesc: "Lade eine CSV-Datei mit Prospects oder Unternehmen hoch.",
    srcCrm: "Aus CRM",
    srcCrmDesc: "Aus HubSpot, Salesforce und mehr übernehmen.",
    srcBlank: "Leer starten",
    srcBlankDesc: "Erstelle eine leere Liste und füge Datensätze später hinzu.",
    srcGroupAi: "Kombo AI",
    srcGroupLinkedin: "LinkedIn",
    srcGroupCrunchbase: "Crunchbase",
    srcGroupImportCat: "Import & manuell",
    srcLiSearch: "Auf LinkedIn suchen",
    srcLiPost: "Aus einem Beitrag extrahieren",
    srcLiEvent: "Aus einem Event extrahieren",
    srcLiPoll: "Aus einer Umfrage extrahieren",
    srcLiConnections: "Deine LinkedIn-Kontakte",
    srcLiFollowers: "Deine LinkedIn-Follower",
    srcCb: "Auf Crunchbase suchen",
    srcCbInvestors: "Investoren suchen",
    srcManual: "Manuell hinzufügen",
    srcHubspot: "Aus HubSpot importieren",
    srcHubspotList: "Aus einer HubSpot-Liste importieren",
    buildSourceSoon: "Suche wird geöffnet — wähle deine Filter",
    buildCreated: (name: string) => `„${name}“ erstellt`,
    titles: "Positionen",
    seniority: "Seniorität",
    regions: "Regionen",
    industries: "Branchen",
    headcountF: "Mitarbeiterzahl",
    signals: "Signale",
    saveTitle: "Als Liste speichern",
    saveDesc: (n: number) =>
      `${n} ${n === 1 ? "Lead wird" : "Leads werden"} als angereicherte Prospects zu einer neuen Liste hinzugefügt.`,
    listName: "Listenname",
    connectCampaign: "Mit einer Kampagne verbinden",
    noCampaign: "Jetzt nicht verbinden",
    newCampaign: "＋ Neue Kampagne",
    dynamicNote:
      "Als dynamische Liste gespeichert — neue passende Prospects kommen mit der Zeit weiter hinzu.",
    cancel: "Abbrechen",
    saveList: "Liste speichern",
    savedListToast: (name: string) => `„${name}“ mit deinen Ergebnissen gespeichert`,
    refineChips: [
      { label: "Nur kürzlich finanziert", patch: { signals: ["Recently funded"] } },
      { label: "Nur EMEA", patch: { regions: ["EMEA"] } },
      { label: "1000+ Mitarbeitende", patch: { headcount: ["1000+"] } },
      { label: "VP Marketing hinzufügen", patch: { titles: ["VP of Marketing"] } },
    ],
  },
  pt: {
    title: "Pesquisar",
    description:
      "Pesquisa em toda a tua base de dados de prospects e empresas — filtra, ordena e guarda os resultados como uma lista dinâmica.",
    signalsTitle: "Sinais",
    signalsDescription:
      "Prospects e empresas identificados por IA, pontuados e prontos a pesquisar, guardar ou adicionar a uma campanha.",
    inputPlaceholder: "p. ex. VPs de Vendas em SaaS europeias que acabaram de angariar financiamento…",
    inputPlaceholderCompanies: "p. ex. Fintechs Série B a contratar para vendas na Europa…",
    searchBtn: "Pesquisar",
    clearQuery: "Limpar pesquisa",
    srTitle: "Pesquisar",
    idleTitle: "Pesquisa prospects e empresas à tua maneira",
    idleDesc:
      "Descreve o teu prospect ou empresa ideal, ou pesquisa por nome, cargo, localização, setor e mais — depois refina com filtros avançados. A partir dos resultados, enriquece contactos, cria uma lista ou lança uma campanha.",
    idleSuggestedTitle: "Ou experimenta uma destas",
    idleSuggestionsPeople: [
      "VPs de Vendas em scale-ups SaaS na EMEA",
      "Responsáveis de RevOps em empresas a contratar SDRs",
      "Fundadores de startups B2B com uma ronda Série A este ano",
      "CROs na Ibéria em empresas com 50-500 colaboradores",
    ],
    idleSuggestionsCompanies: [
      "Empresas SaaS na Ibéria com 50-500 colaboradores",
      "Agências que usam HubSpot com uma vaga aberta em vendas",
      "Empresas de logística a adotar ferramentas de IA na sua stack",
      "Marcas de e-commerce recém-expandidas para os EUA",
    ],
    urlsTab: "URLs",
    urlsIdleBtn: "Pesquisar por URLs",
    urlsPlaceholder: "acme.com, exemplo.com — cola ou escreve URLs/domínios de empresas",
    urlsAddMore: "Adicionar outro…",
    urlsClearAll: "Limpar tudo",
    urlsRemove: (d: string) => `Remover ${d}`,
    urlsHint:
      "Separa com vírgulas ou espaços. Vamos encontrar prospects nestas empresas — refina com os filtros habituais.",
    urlsFieldAria: "URLs ou domínios de empresas",
    domainListScoped: (n: number) =>
      `Limitado a ${n} ${n === 1 ? "empresa" : "empresas"} da tua lista`,
    domainListPrompt: (n: number) =>
      `Prospects em ${n} ${n === 1 ? "empresa" : "empresas"} da tua lista`,
    editList: "Editar lista",
    clearList: "Remover lista",
    introTitle: "Prospeta com um prompt",
    introDescription:
      "Pergunta em linguagem natural ou cria uma consulta avançada manualmente. O Kai devolve uma tabela de prospects ou empresas pontuada por adequação, que podes refinar, enriquecer, guardar como lista dinâmica e enviar para uma campanha.",
    introPoints: [
      "Pesquisa na base de dados ou deixa a IA encontrar semelhantes",
      "Pontua cada resultado por adequação ao teu pedido",
      "Guarda como lista dinâmica que continua a preencher-se",
      "Liga diretamente a uma campanha",
    ],
    assistantName: "Kai",
    chatHint: "Descreve os teus prospects ideais, ou escolhe um exemplo.",
    examples: "Exemplos",
    thinking: "O Kai está a pesquisar…",
    starter:
      "Aqui tens uma tabela inicial de VPs de Vendas em empresas SaaS europeias que angariaram financiamento recentemente. Refina-a com um prompt ou edita os filtros à direita.",
    showingOf: (count: number, total: number) =>
      `A mostrar ${count} de um total estimado de ${total.toLocaleString()}. Continua a refinar ou guarda estes como lista.`,
    refinedTo: (label: string) => `Refinado: ${label.toLowerCase()}.`,
    thinkingTitle: "O Kai está a analisar o teu pedido…",
    thinkingSub: "A pesquisar na base de dados e a pontuar a adequação ao teu pedido.",
    thinkingSteps: [
      "A perceber o teu pedido",
      "A pesquisar em mais de 30M de contactos e empresas",
      "A pontuar a adequação e a enriquecer resultados",
    ],
    refine: "Refinar rápido",
    save: "Guardar",
    saved: "Pesquisas guardadas",
    saveThis: "Guardar esta pesquisa",
    saveSearchDesc:
      "Dá-lhe um nome para a encontrares depois — sugerimos um com base no teu prompt e filtros.",
    saveNameLabel: "Nome da pesquisa",
    noSaved: "Ainda não há pesquisas guardadas.",
    noSavedMatch: "Nenhuma pesquisa guardada corresponde.",
    searchSaved: "Pesquisar pesquisas guardadas…",
    savedToast: "Pesquisa guardada com o histórico de prompts",
    loadedToast: "Pesquisa guardada carregada",
    removedSaved: "Pesquisa guardada removida",
    removeSaved: (name: string) => `Remover ${name}`,
    people: "Prospects",
    companies: "Empresas",
    resultsFor: "Resultados",
    estLeads: (n: number) => `Est. ${n.toLocaleString()} no total`,
    perProspect: (n: number) => `${n} créditos / prospect`,
    freeToSave: "Guardar é grátis",
    projected: (n: number) => `≈ ${n.toLocaleString()} créditos`,
    getMore: "Obter mais leads",
    getMoreToast: "A alargar a pesquisa a toda a base de dados…",
    komboData: "Dados Kombo",
    komboHint: "Emails verificados, telemóveis, firmografia e intenção — combinados a partir da nossa rede de dados.",
    dbLabel: "Pesquisar em",
    dbKombo: "KomboAI",
    dbKomboDesc: "A nossa rede verificada de prospects e empresas.",
    dbLookalike: "Semelhantes",
    dbLookalikeDesc: "Encontra registos semelhantes a uma pessoa ou empresa.",
    dbLinkedinDesc: "Pesquisa com filtros da rede do LinkedIn.",
    dbSwitched: (name: string) => `A pesquisar agora em ${name}`,
    dbMoreLabel: "Mais fontes",
    dbSoon: "Brevemente",
    dbGmaps: "Google Maps",
    dbGmapsDesc: "Negócios locais com morada, telefone e avaliações.",
    dbTripadvisor: "TripAdvisor",
    dbTripadvisorDesc: "Espaços de hotelaria e viagens com avaliações.",
    dbCompanyDbs: "Bases de dados de empresas",
    dbCompanyDbsDesc: "Crunchbase, Apollo e outras fontes firmográficas.",
    linkedinSource: "Sales Nav",
    linkedinHint: "Ativa para usar filtros exclusivos do LinkedIn (mudanças de emprego, publicações, grau de ligação…).",
    linkedinEnabled: "Filtros do LinkedIn ativados",
    linkedinDisabled: "Filtros do LinkedIn desativados",
    sortBy: "Ordenar",
    sortFit: "Melhor adequação",
    sortName: "Nome (A–Z)",
    sortCompany: "Empresa (A–Z)",
    sortHeadcount: "Empresa maior",
    sortRecent: "Atividade recente",
    departments: "Departamentos",
    technologies: "Tecnologias",
    revenue: "Receita",
    intent: "Intenção de compra",
    founded: "Fundação",
    growth: "Crescimento de colaboradores",
    linkedinFilters: "Sales Nav",
    connections: "Ligações",
    profileLanguages: "Idiomas do perfil",
    serviceCategories: "Categorias de serviço",
    schools: "Escolas",
    currentCompanies: "Empresas atuais",
    pastCompanies: "Empresas anteriores",
    connectionsOf: "Ligações de",
    followersOf: "Seguidores de",
    jobListings: "Ofertas de emprego no LinkedIn",
    heroTitle: "Descreve o teu cliente ideal",
    heroSubtitle: "Pesquisa entre mais de 250M de profissionais e empresas — ou escolhe um início rápido.",
    heroPlaceholder: "p. ex. Heads de RevOps em empresas SaaS Série B na EMEA…",
    searchWithFilters: "Pesquisar com filtros",
    spotlightsLabel: "Destaques",
    matchLabel: "Correspondências",
    spotlights: ["Open to work", "Mudou de emprego", "Ativo recentemente", "A contratar", "Alta intenção"],
    columns: "Colunas",
    addToList: "Guardar como lista",
    findPeople: "Encontrar prospects",
    findPeopleToast: "Mudado para prospects nestas empresas",
    lookalike: "Semelhantes",
    lookalikeTitle: "Encontrar semelhantes",
    lookalikeDesc:
      "Escolhe uma pessoa ou empresa de que já gostas — o Kai encontra registos semelhantes a essa referência concreta. Refina mais com os filtros da barra lateral.",
    pickSeed: "Escolhe um prospect ou empresa",
    companySearch: "Pesquisa uma empresa por nome…",
    personSearch: "Pesquisa um prospect por nome…",
    useCompany: (name: string) => `Usar "${name}"`,
    seedPeople: "Prospects e clientes",
    seedCompanies: "Empresas",
    findSimilar: "Encontrar semelhantes",
    similarTo: "Semelhante a",
    newSearchTab: "Nova pesquisa",
    clearLookalike: "Remover semelhantes",
    mapAreaHint: "Área de pesquisa aproximada — os resultados são associados em torno desta localização.",
    previewLocation: "Localização",
    previewRole: "Cargo",
    previewIndustry: "Setor",
    previewSize: "Dimensão da empresa",
    previewGrowth: "Crescimento",
    previewSignals: "Sinais",
    previewSeeAllPeople: "Ver todos os prospects",
    previewSeeAllCompanies: "Ver todas as empresas",
    previewEmpty: "Ainda sem correspondências — tenta alargar a pesquisa.",
    lookalikePrompt: (name: string) => `Encontrar registos semelhantes a ${name}`,
    colFit: "Adequação",
    colName: "Nome",
    colCompany: "Empresa",
    colIndustry: "Setor",
    colRegion: "Região",
    colHeadcount: "Dimensão",
    colEmail: "Email",
    colSignals: "Sinais",
    colRoles: "Vagas abertas",
    emailVerified: "Verificado",
    emailLikely: "Provável",
    emailMissing: "Em falta",
    selected: (n: number) => `${n} selecionados`,
    clearSel: "Limpar",
    bulkList: "Adicionar a lista",
    bulkExport: "Exportar",
    bulkCrm: "Adicionar ao CRM",
    crmToast: (n: number) => `${n} enviados para o teu CRM`,
    noResults: "Nenhum resultado corresponde à tua pesquisa ou filtros.",
    addFilter: "Adicionar filtro",
    filterTypeahead: "Pesquisa filtros ou descreve-os com IA…",
    addCustom: (v: string) => `Adicionar "${v}"`,
    askAiFilter: (v: string) => `Perguntar à IA: "${v}"`,
    viewAllFilters: "Ver todos os filtros",
    backToFilterSearch: "Voltar à pesquisa",
    filtersTitle: "Filtros",
    filtersDesc: (n: number) =>
      n === 0
        ? "Pesquisa ou descreve filtros com IA e depois marca-os para aplicar."
        : `${n} ativos · pesquisa ou descreve filtros com IA e depois marca-os para aplicar.`,
    activeFilters: "Filtros ativos",
    noActiveFilters: "Ainda sem filtros — escolhe da lista.",
    notChip: (v: string) => `Exceto: ${v}`,
    filtersNoMatch: "Nenhum filtro corresponde.",
    addToGroup: (label: string) => `Adicionar ${label.toLowerCase()}…`,
    clearAll: "Limpar tudo",
    aiSuggestions: "Sugestões de pesquisa com IA",
    runThisSearch: "Executar esta pesquisa",
    viewAll: "Ver tudo",
    rowSelectAll: "Selecionar tudo",
    editFilters: "Editar",
    done: "Concluído",
    columnsBtn: "Colunas",
    columnsTitle: "Personalizar colunas",
    columnsDesc: (n: number, total: number) =>
      `${n} de ${total} colunas visíveis. Ativa ou desativa campos.`,
    alwaysShown: "Sempre visíveis",
    optionalCols: "Colunas opcionais",
    alwaysTag: "Fixa",
    buildTitle: "Criar uma lista",
    buildStepSetup: "Configuração",
    buildStepSource: "Origem",
    buildName: "Nome da lista",
    buildNamePlaceholder: "p. ex. VPs de Vendas EMEA",
    buildType: "O que tem esta lista?",
    buildPeople: "Prospects",
    buildPeopleDesc: "Prospects e contactos individuais.",
    buildCompanies: "Empresas",
    buildCompaniesDesc: "Contas e organizações.",
    capLabel: "Máx. de contactos por empresa",
    capNoLimit: "Sem limite",
    capChip: (n: number) => `Máx. ${n}/empresa`,
    capBatchNote: (max: number) =>
      `Só é possível adicionar ${max.toLocaleString()} de cada vez.`,
    buildPopulate: "Como queres preenchê-la?",
    buildNext: "Seguinte",
    buildBack: "Voltar",
    selectPage: "Selecionar página",
    deselectPage: "Desmarcar página",
    selectAllCapped: (n: number) => `Selecionar todos (${n.toLocaleString()})`,
    enrichCompaniesToast: (n: number) =>
      `A enriquecer ${n} ${n === 1 ? "empresa" : "empresas"}…`,
    buildAssign: "Responsável",
    buildAssignHint:
      "Os novos prospects que entrarem nesta lista são atribuídos a este colega de equipa.",
    buildUnassigned: "Não atribuído",
    hideInList: "Ocultar os que já estão numa lista",
    hideInCrm: "Ocultar os que já estão no CRM",
    addRowToList: "Adicionar a lista",
    pageRange: (from: number, to: number, total: number) =>
      `${from.toLocaleString()}–${to.toLocaleString()} de ${total.toLocaleString()}`,
    srcFindPeople: "Encontrar prospects",
    srcFindPeopleDesc: "Pesquisa na nossa base de dados prospects correspondentes.",
    srcFindCompanies: "Encontrar empresas",
    srcFindCompaniesDesc: "Pesquisa na nossa base de dados contas correspondentes.",
    srcLookalike: "Semelhantes",
    srcLookalikeDesc: "Encontra registos semelhantes a uma pessoa ou empresa.",
    srcImport: "Importar CSV",
    srcImportDesc: "Carrega um CSV de prospects ou empresas.",
    srcCrm: "Do CRM",
    srcCrmDesc: "Importa do HubSpot, Salesforce e outros.",
    srcBlank: "Começar vazia",
    srcBlankDesc: "Cria uma lista vazia e adiciona registos mais tarde.",
    srcGroupAi: "Kombo AI",
    srcGroupLinkedin: "LinkedIn",
    srcGroupCrunchbase: "Crunchbase",
    srcGroupImportCat: "Importar e manual",
    srcLiSearch: "Pesquisar no LinkedIn",
    srcLiPost: "Extrair de uma publicação",
    srcLiEvent: "Extrair de um evento",
    srcLiPoll: "Extrair de uma sondagem",
    srcLiConnections: "As tuas ligações do LinkedIn",
    srcLiFollowers: "Os teus seguidores do LinkedIn",
    srcCb: "Pesquisar no Crunchbase",
    srcCbInvestors: "Pesquisar investidores",
    srcManual: "Adicionar manualmente",
    srcHubspot: "Importar do HubSpot",
    srcHubspotList: "Importar de uma lista do HubSpot",
    buildSourceSoon: "A abrir a pesquisa — escolhe os teus filtros",
    buildCreated: (name: string) => `"${name}" criada`,
    titles: "Cargos",
    seniority: "Senioridade",
    regions: "Regiões",
    industries: "Setores",
    headcountF: "Colaboradores",
    signals: "Sinais",
    saveTitle: "Guardar como lista",
    saveDesc: (n: number) =>
      `${n} lead${n === 1 ? "" : "s"} ${n === 1 ? "será adicionado" : "serão adicionados"} a uma nova lista como prospects enriquecidos.`,
    listName: "Nome da lista",
    connectCampaign: "Ligar a uma campanha",
    noCampaign: "Não ligar agora",
    newCampaign: "＋ Nova campanha",
    dynamicNote:
      "Guardada como lista dinâmica — novos prospects correspondentes continuam a entrar ao longo do tempo.",
    cancel: "Cancelar",
    saveList: "Guardar lista",
    savedListToast: (name: string) => `"${name}" guardada com os teus resultados`,
    refineChips: [
      { label: "Só financiamento recente", patch: { signals: ["Recently funded"] } },
      { label: "Só EMEA", patch: { regions: ["EMEA"] } },
      { label: "1000+ colaboradores", patch: { headcount: ["1000+"] } },
      { label: "Adicionar VP Marketing", patch: { titles: ["VP of Marketing"] } },
    ],
  },
  pt_BR: {
    title: "Pesquisar",
    description:
      "Pesquise em todo o seu banco de dados de prospects e empresas — filtre, ordene e salve os resultados como uma lista dinâmica.",
    signalsTitle: "Sinais",
    signalsDescription:
      "Prospects e empresas identificados por IA, pontuados e prontos para pesquisar, salvar ou adicionar a uma campanha.",
    inputPlaceholder: "ex.: VPs de Vendas em SaaS europeias que acabaram de levantar uma rodada…",
    inputPlaceholderCompanies: "ex.: Fintechs Série B contratando para vendas na Europa…",
    searchBtn: "Pesquisar",
    clearQuery: "Limpar pesquisa",
    srTitle: "Pesquisar",
    idleTitle: "Pesquise prospects e empresas do seu jeito",
    idleDesc:
      "Descreva seu prospect ou empresa ideal, ou pesquise por nome, cargo, localização, setor e mais — depois refine com filtros avançados. A partir dos resultados, enriqueça contatos, crie uma lista ou lance uma campanha.",
    idleSuggestedTitle: "Ou experimente uma destas",
    idleSuggestionsPeople: [
      "VPs de Vendas em scale-ups SaaS na EMEA",
      "Responsáveis de RevOps em empresas contratando SDRs",
      "Fundadores de startups B2B que levantaram uma Série A este ano",
      "CROs na Ibéria em empresas com 50-500 funcionários",
    ],
    idleSuggestionsCompanies: [
      "Empresas SaaS na Ibéria com 50-500 funcionários",
      "Agências que usam HubSpot com uma vaga aberta em vendas",
      "Empresas de logística adotando ferramentas de IA na sua stack",
      "Marcas de e-commerce recém-expandidas para os EUA",
    ],
    urlsTab: "URLs",
    urlsIdleBtn: "Pesquisar por URLs",
    urlsPlaceholder: "acme.com, exemplo.com — cole ou digite URLs/domínios de empresas",
    urlsAddMore: "Adicionar outro…",
    urlsClearAll: "Limpar tudo",
    urlsRemove: (d: string) => `Remover ${d}`,
    urlsHint:
      "Separe com vírgulas ou espaços. Vamos encontrar prospects nessas empresas — refine com os filtros de sempre.",
    urlsFieldAria: "URLs ou domínios de empresas",
    domainListScoped: (n: number) =>
      `Limitado a ${n} ${n === 1 ? "empresa" : "empresas"} da sua lista`,
    domainListPrompt: (n: number) =>
      `Prospects em ${n} ${n === 1 ? "empresa" : "empresas"} da sua lista`,
    editList: "Editar lista",
    clearList: "Remover lista",
    introTitle: "Prospecte com um prompt",
    introDescription:
      "Pergunte em linguagem natural ou crie uma consulta avançada manualmente. O Kai retorna uma tabela de prospects ou empresas com pontuação de fit, que você pode refinar, enriquecer, salvar como lista dinâmica e enviar para uma campanha.",
    introPoints: [
      "Pesquise no banco de dados ou deixe a IA encontrar semelhantes",
      "Pontue cada resultado pelo fit com seu pedido",
      "Salve como lista dinâmica que continua se preenchendo",
      "Conecte direto a uma campanha",
    ],
    assistantName: "Kai",
    chatHint: "Descreva seus prospects ideais, ou escolha um exemplo.",
    examples: "Exemplos",
    thinking: "Kai está pesquisando…",
    starter:
      "Aqui está uma tabela inicial de VPs de Vendas em empresas SaaS europeias que levantaram investimento recentemente. Refine com um prompt ou edite os filtros à direita.",
    showingOf: (count: number, total: number) =>
      `Mostrando ${count} de um total estimado de ${total.toLocaleString()}. Continue refinando ou salve estes como lista.`,
    refinedTo: (label: string) => `Refinado: ${label.toLowerCase()}.`,
    thinkingTitle: "Kai está analisando seu pedido…",
    thinkingSub: "Pesquisando no banco de dados e pontuando o fit com seu pedido.",
    thinkingSteps: [
      "Entendendo seu pedido",
      "Pesquisando em mais de 30 milhões de contatos e empresas",
      "Pontuando o fit e enriquecendo resultados",
    ],
    refine: "Refinar rápido",
    save: "Salvar",
    saved: "Pesquisas salvas",
    saveThis: "Salvar esta pesquisa",
    saveSearchDesc:
      "Dê um nome para encontrá-la depois — sugerimos um com base no seu prompt e filtros.",
    saveNameLabel: "Nome da pesquisa",
    noSaved: "Ainda não há pesquisas salvas.",
    noSavedMatch: "Nenhuma pesquisa salva corresponde.",
    searchSaved: "Pesquisar nas pesquisas salvas…",
    savedToast: "Pesquisa salva com o histórico de prompts",
    loadedToast: "Pesquisa salva carregada",
    removedSaved: "Pesquisa salva removida",
    removeSaved: (name: string) => `Remover ${name}`,
    people: "Prospects",
    companies: "Empresas",
    resultsFor: "Resultados",
    estLeads: (n: number) => `Est. ${n.toLocaleString()} no total`,
    perProspect: (n: number) => `${n} créditos / prospect`,
    freeToSave: "Salvar é grátis",
    projected: (n: number) => `≈ ${n.toLocaleString()} créditos`,
    getMore: "Conseguir mais leads",
    getMoreToast: "Expandindo a pesquisa para todo o banco de dados…",
    komboData: "Dados da Kombo",
    komboHint: "E-mails verificados, celulares, firmografia e intenção — combinados a partir da nossa rede de dados.",
    dbLabel: "Pesquisar em",
    dbKombo: "KomboAI",
    dbKomboDesc: "Nossa rede verificada de prospects e empresas.",
    dbLookalike: "Semelhantes",
    dbLookalikeDesc: "Encontre registros semelhantes a uma pessoa ou empresa.",
    dbLinkedinDesc: "Pesquise com filtros da rede do LinkedIn.",
    dbSwitched: (name: string) => `Pesquisando agora em ${name}`,
    dbMoreLabel: "Mais fontes",
    dbSoon: "Em breve",
    dbGmaps: "Google Maps",
    dbGmapsDesc: "Negócios locais com endereço, telefone e avaliações.",
    dbTripadvisor: "TripAdvisor",
    dbTripadvisorDesc: "Locais de hotelaria e viagens com avaliações.",
    dbCompanyDbs: "Bancos de dados de empresas",
    dbCompanyDbsDesc: "Crunchbase, Apollo e outras fontes firmográficas.",
    linkedinSource: "Sales Nav",
    linkedinHint: "Ative para usar filtros exclusivos do LinkedIn (mudanças de emprego, publicações, grau de conexão…).",
    linkedinEnabled: "Filtros do LinkedIn ativados",
    linkedinDisabled: "Filtros do LinkedIn desativados",
    sortBy: "Ordenar",
    sortFit: "Melhor fit",
    sortName: "Nome (A–Z)",
    sortCompany: "Empresa (A–Z)",
    sortHeadcount: "Maior empresa",
    sortRecent: "Atividade recente",
    departments: "Departamentos",
    technologies: "Tecnologias",
    revenue: "Receita",
    intent: "Intenção de compra",
    founded: "Fundação",
    growth: "Crescimento de funcionários",
    linkedinFilters: "Sales Nav",
    connections: "Conexões",
    profileLanguages: "Idiomas do perfil",
    serviceCategories: "Categorias de serviço",
    schools: "Escolas",
    currentCompanies: "Empresas atuais",
    pastCompanies: "Empresas anteriores",
    connectionsOf: "Conexões de",
    followersOf: "Seguidores de",
    jobListings: "Vagas de emprego no LinkedIn",
    heroTitle: "Descreva seu cliente ideal",
    heroSubtitle: "Pesquise entre mais de 250M de profissionais e empresas — ou escolha um início rápido.",
    heroPlaceholder: "ex.: Heads de RevOps em empresas SaaS Série B na EMEA…",
    searchWithFilters: "Pesquisar com filtros",
    spotlightsLabel: "Destaques",
    matchLabel: "Correspondências",
    spotlights: ["Open to work", "Mudou de emprego", "Ativo recentemente", "Contratando", "Alta intenção"],
    columns: "Colunas",
    addToList: "Salvar como lista",
    findPeople: "Encontrar prospects",
    findPeopleToast: "Mudou para prospects dessas empresas",
    lookalike: "Semelhantes",
    lookalikeTitle: "Encontrar semelhantes",
    lookalikeDesc:
      "Escolha uma pessoa ou empresa de que você já goste — o Kai encontra registros semelhantes a essa referência específica. Refine mais com os filtros da barra lateral.",
    pickSeed: "Escolha um prospect ou empresa",
    companySearch: "Pesquise uma empresa pelo nome…",
    personSearch: "Pesquise um prospect pelo nome…",
    useCompany: (name: string) => `Usar "${name}"`,
    seedPeople: "Prospects e clientes",
    seedCompanies: "Empresas",
    findSimilar: "Encontrar semelhantes",
    similarTo: "Semelhante a",
    newSearchTab: "Nova pesquisa",
    clearLookalike: "Remover semelhantes",
    mapAreaHint: "Área de pesquisa aproximada — os resultados correspondem ao redor desta localização.",
    previewLocation: "Localização",
    previewRole: "Cargo",
    previewIndustry: "Setor",
    previewSize: "Tamanho da empresa",
    previewGrowth: "Crescimento",
    previewSignals: "Sinais",
    previewSeeAllPeople: "Ver todos os prospects",
    previewSeeAllCompanies: "Ver todas as empresas",
    previewEmpty: "Ainda sem correspondências — tente ampliar sua pesquisa.",
    lookalikePrompt: (name: string) => `Encontrar registros semelhantes a ${name}`,
    colFit: "Fit",
    colName: "Nome",
    colCompany: "Empresa",
    colIndustry: "Setor",
    colRegion: "Região",
    colHeadcount: "Tamanho",
    colEmail: "E-mail",
    colSignals: "Sinais",
    colRoles: "Vagas abertas",
    emailVerified: "Verificado",
    emailLikely: "Provável",
    emailMissing: "Ausente",
    selected: (n: number) => `${n} selecionados`,
    clearSel: "Limpar",
    bulkList: "Adicionar a lista",
    bulkExport: "Exportar",
    bulkCrm: "Adicionar ao CRM",
    crmToast: (n: number) => `${n} enviados para o seu CRM`,
    noResults: "Nenhum resultado corresponde à sua pesquisa ou filtros.",
    addFilter: "Adicionar filtro",
    filterTypeahead: "Pesquise filtros ou descreva-os com IA…",
    addCustom: (v: string) => `Adicionar "${v}"`,
    askAiFilter: (v: string) => `Perguntar à IA: "${v}"`,
    viewAllFilters: "Ver todos os filtros",
    backToFilterSearch: "Voltar à pesquisa",
    filtersTitle: "Filtros",
    filtersDesc: (n: number) =>
      n === 0
        ? "Pesquise ou descreva filtros com IA e depois marque-os para aplicar."
        : `${n} ativos · pesquise ou descreva filtros com IA e depois marque-os para aplicar.`,
    activeFilters: "Filtros ativos",
    noActiveFilters: "Ainda sem filtros — escolha da lista.",
    notChip: (v: string) => `Exceto: ${v}`,
    filtersNoMatch: "Nenhum filtro corresponde.",
    addToGroup: (label: string) => `Adicionar ${label.toLowerCase()}…`,
    clearAll: "Limpar tudo",
    aiSuggestions: "Sugestões de pesquisa com IA",
    runThisSearch: "Executar esta pesquisa",
    viewAll: "Ver tudo",
    rowSelectAll: "Selecionar tudo",
    editFilters: "Editar",
    done: "Concluído",
    columnsBtn: "Colunas",
    columnsTitle: "Personalizar colunas",
    columnsDesc: (n: number, total: number) =>
      `${n} de ${total} colunas exibidas. Ative ou desative campos.`,
    alwaysShown: "Sempre exibidas",
    optionalCols: "Colunas opcionais",
    alwaysTag: "Fixa",
    buildTitle: "Criar uma lista",
    buildStepSetup: "Configuração",
    buildStepSource: "Origem",
    buildName: "Nome da lista",
    buildNamePlaceholder: "ex.: VPs de Vendas EMEA",
    buildType: "O que tem essa lista?",
    buildPeople: "Prospects",
    buildPeopleDesc: "Prospects e contatos individuais.",
    buildCompanies: "Empresas",
    buildCompaniesDesc: "Contas e organizações.",
    capLabel: "Máx. de contatos por empresa",
    capNoLimit: "Sem limite",
    capChip: (n: number) => `Máx. ${n}/empresa`,
    capBatchNote: (max: number) =>
      `Só é possível adicionar ${max.toLocaleString()} por vez.`,
    buildPopulate: "Como você quer preenchê-la?",
    buildNext: "Avançar",
    buildBack: "Voltar",
    selectPage: "Selecionar página",
    deselectPage: "Desmarcar página",
    selectAllCapped: (n: number) => `Selecionar todos (${n.toLocaleString()})`,
    enrichCompaniesToast: (n: number) =>
      `Enriquecendo ${n} ${n === 1 ? "empresa" : "empresas"}…`,
    buildAssign: "Responsável",
    buildAssignHint:
      "Novos prospects que entrarem nesta lista são atribuídos a este colega de equipe.",
    buildUnassigned: "Não atribuído",
    hideInList: "Ocultar os que já estão em uma lista",
    hideInCrm: "Ocultar os que já estão no CRM",
    addRowToList: "Adicionar a lista",
    pageRange: (from: number, to: number, total: number) =>
      `${from.toLocaleString()}–${to.toLocaleString()} de ${total.toLocaleString()}`,
    srcFindPeople: "Encontrar prospects",
    srcFindPeopleDesc: "Pesquise no nosso banco de dados por prospects correspondentes.",
    srcFindCompanies: "Encontrar empresas",
    srcFindCompaniesDesc: "Pesquise no nosso banco de dados por contas correspondentes.",
    srcLookalike: "Semelhantes",
    srcLookalikeDesc: "Encontre registros semelhantes a uma pessoa ou empresa.",
    srcImport: "Importar CSV",
    srcImportDesc: "Envie um CSV de prospects ou empresas.",
    srcCrm: "Do CRM",
    srcCrmDesc: "Importe do HubSpot, Salesforce e mais.",
    srcBlank: "Começar em branco",
    srcBlankDesc: "Crie uma lista vazia e adicione registros depois.",
    srcGroupAi: "Kombo AI",
    srcGroupLinkedin: "LinkedIn",
    srcGroupCrunchbase: "Crunchbase",
    srcGroupImportCat: "Importar e manual",
    srcLiSearch: "Pesquisar no LinkedIn",
    srcLiPost: "Extrair de uma publicação",
    srcLiEvent: "Extrair de um evento",
    srcLiPoll: "Extrair de uma enquete",
    srcLiConnections: "Suas conexões do LinkedIn",
    srcLiFollowers: "Seus seguidores do LinkedIn",
    srcCb: "Pesquisar no Crunchbase",
    srcCbInvestors: "Pesquisar investidores",
    srcManual: "Adicionar manualmente",
    srcHubspot: "Importar do HubSpot",
    srcHubspotList: "Importar de uma lista do HubSpot",
    buildSourceSoon: "Abrindo a pesquisa — escolha seus filtros",
    buildCreated: (name: string) => `"${name}" criada`,
    titles: "Cargos",
    seniority: "Senioridade",
    regions: "Regiões",
    industries: "Setores",
    headcountF: "Funcionários",
    signals: "Sinais",
    saveTitle: "Salvar como lista",
    saveDesc: (n: number) =>
      `${n} lead${n === 1 ? "" : "s"} ${n === 1 ? "será adicionado" : "serão adicionados"} a uma nova lista como prospects enriquecidos.`,
    listName: "Nome da lista",
    connectCampaign: "Conectar a uma campanha",
    noCampaign: "Não conectar agora",
    newCampaign: "＋ Nova campanha",
    dynamicNote:
      "Salva como lista dinâmica — novos prospects correspondentes continuarão chegando com o tempo.",
    cancel: "Cancelar",
    saveList: "Salvar lista",
    savedListToast: (name: string) => `"${name}" salva com seus resultados`,
    refineChips: [
      { label: "Só financiamento recente", patch: { signals: ["Recently funded"] } },
      { label: "Só EMEA", patch: { regions: ["EMEA"] } },
      { label: "1000+ funcionários", patch: { headcount: ["1000+"] } },
      { label: "Adicionar VP Marketing", patch: { titles: ["VP of Marketing"] } },
    ],
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

// Selectable databases per entity — Google Maps + TripAdvisor are company-only.
const PEOPLE_SOURCES: DataSource[] = ["kombo", "lookalike", "linkedin"]
const COMPANY_SOURCES: DataSource[] = [
  "kombo",
  "lookalike",
  "linkedin",
  "google_maps",
  "tripadvisor",
]
// A source maps to its facet catalog (kombo + lookalike share the Kombo set).
function facetDbForSource(s: DataSource): FacetDb {
  if (s === "linkedin") return "linkedin"
  if (s === "google_maps") return "google_maps"
  if (s === "tripadvisor") return "tripadvisor"
  return "kombo"
}

// How a freshly-built list gets populated.
type BuildSource =
  | "find"
  | "lookalike"
  | "li-search"
  | "li-post"
  | "li-event"
  | "li-poll"
  | "li-connections"
  | "li-followers"
  | "crunchbase"
  | "crunchbase-investors"
  | "import"
  | "manual"
  | "hubspot"
  | "hubspot-list"
  | "blank"

// Sources that are really a search — they don't pre-create an empty list.
const SEARCH_SOURCES: BuildSource[] = [
  "find",
  "li-search",
  "crunchbase",
  "crunchbase-investors",
]
// Sources only meaningful for people lists.
const PEOPLE_ONLY_SOURCES: BuildSource[] = [
  "li-post",
  "li-event",
  "li-poll",
  "li-connections",
  "li-followers",
  "crunchbase-investors",
]

const LIST_COLORS = ["#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"]

// Results are paged so "select page" never grabs the whole (1000+) result set.
const RESULTS_PER_PAGE = 25

function sortLabel(key: SortKey, c: Copy): string {
  switch (key) {
    case "name":
      return c.sortName
    case "company":
      return c.sortCompany
    case "headcount":
      return c.sortHeadcount
    case "recent":
      return c.sortRecent
    default:
      return c.sortFit
  }
}

// Turn preview leads/companies (from a live search or the empty-state
// suggestion carousels) into real prospectStore/accountStore records, so
// they can be added to a list, exported, or pushed to a CRM like any other
// search result.
function materializeLeadsToIds(records: AiLead[]): string[] {
  return records.map(
    (l) =>
      prospectStore.create({
        firstName: l.firstName,
        lastName: l.lastName,
        title: l.title,
        company: l.company,
        companyDomain: l.companyDomain,
        location: l.location,
        // Freshly sourced contacts arrive with only basic data — email is
        // revealed later via enrichment.
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
  )
}

function materializeCompaniesToIds(records: AiCompany[]): string[] {
  return records.map((co) => {
    const tier: AccountTier =
      co.headcountNum >= 1000 ? "Enterprise" : co.headcountNum >= 200 ? "Mid-market" : "SMB"
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
  })
}

export default function Search() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const location = useLocation()
  const headerPrompt = params.get("q")
  // "Search with filters" (from /find, or the idle state's own button below)
  // skips the AI prompt and jumps straight to the filterable results view.
  const filtersRequestedFromUrl = params.get("filters") === "1"
  // Lookalike is just a search: arrive here with a seed (from People/Companies
  // "Find lookalikes") and the page opens in lookalike mode, results and all.
  const incomingSeed =
    (location.state as { lookalikeSeed?: LookalikeSeed } | null)?.lookalikeSeed ??
    null
  const similarPrompt = incomingSeed ? `${c.similarTo} ${incomingSeed.name}` : ""
  // Arrive from the Signals page with a ready-made structured query (a signal
  // row's "View all" or its edited filters) — skip prompt interpretation.
  const incomingQuery =
    (
      location.state as {
        prefilledQuery?: { query: AiQuery; entity: AiEntity; label: string }
      } | null
    )?.prefilledQuery ?? null
  const savedSearches = useSavedSearches()
  // Arrive from a workspace with a saved-search id and the page opens preloaded.
  const incomingSearchId =
    (location.state as { loadSearchId?: string } | null)?.loadSearchId ?? null
  const loadedSearch = incomingSearchId
    ? (savedSearches.find((s) => s.id === incomingSearchId) ?? null)
    : null
  // Arrive from the Add modal's guided wizard: it already knows to open the
  // Lookalike picker, or to start on a source the wizard owns fully (Google
  // Maps is company-only, hence the entity default below).
  const incomingOpenLookalike =
    (location.state as { openLookalike?: boolean } | null)?.openLookalike ?? false
  const incomingSource =
    (
      location.state as {
        initialSource?: "google_maps" | "tripadvisor"
      } | null
    )?.initialSource ?? null

  // Multi-tab search sessions: any hand-off above (a saved search, a
  // prefilled query, a lookalike seed, the Add-modal wizard, a header prompt,
  // or "Search with filters") opens a brand-new tab rather than mutating
  // whichever tab happens to be active; a bare visit with no signal resumes
  // the tab that was already active.
  const hasIncoming = Boolean(
    loadedSearch ||
      incomingQuery ||
      incomingSeed ||
      incomingOpenLookalike ||
      incomingSource ||
      headerPrompt ||
      filtersRequestedFromUrl
  )
  const activeTab = hasIncoming ? null : searchTabsStore.peekActive()

  const [entity, setEntity] = React.useState<AiEntity>(
    loadedSearch
      ? loadedSearch.entity
      : incomingQuery
        ? incomingQuery.entity
        : incomingSeed
          ? incomingSeed.kind === "company"
            ? "companies"
            : "people"
          : incomingSource
            ? // Google Maps and TripAdvisor are company-only sources.
              "companies"
            : activeTab
              ? activeTab.entity
              : "people"
  )
  const [query, setQuery] = React.useState<AiQuery>(
    loadedSearch
      ? loadedSearch.query
      : incomingQuery
        ? incomingQuery.query
        : activeTab
          ? activeTab.query
          : { ...EMPTY_QUERY }
  )
  const [lastPrompt, setLastPrompt] = React.useState(
    loadedSearch
      ? loadedSearch.prompt
      : incomingQuery
        ? incomingQuery.label
        : activeTab
          ? activeTab.lastPrompt
          : similarPrompt
  )
  const [input, setInput] = React.useState(
    loadedSearch
      ? loadedSearch.prompt
      : incomingQuery
        ? incomingQuery.label
        : activeTab
          ? activeTab.input
          : similarPrompt || headerPrompt || ""
  )
  const [thinking, setThinking] = React.useState(Boolean(headerPrompt))
  const [selected, setSelected] = React.useState<Set<string>>(
    () => new Set(activeTab ? activeTab.selectedIds : [])
  )
  const [lookalikeOpen, setLookalikeOpen] = React.useState(incomingOpenLookalike)
  // URLs mode: the third entity tab. The prompt box becomes a pill field of
  // company URLs/domains; searching scopes results to those companies.
  const [urlsMode, setUrlsMode] = React.useState(activeTab ? activeTab.urlsMode : false)
  const [urlPills, setUrlPills] = React.useState<string[]>(
    activeTab ? activeTab.urlPills : []
  )
  const [urlInput, setUrlInput] = React.useState("")
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false)
  const [saveName, setSaveName] = React.useState("")
  const [filtersOpen, setFiltersOpen] = React.useState(false)
  const [columnsOpen, setColumnsOpen] = React.useState(false)
  const [buildOpen, setBuildOpen] = React.useState(false)
  const [bulkIds, setBulkIds] = React.useState<string[]>([])
  const [bulkListOpen, setBulkListOpen] = React.useState(false)
  // Bulk enrich (people): selected results are materialized into real
  // prospects first, then run through the standard enrich dialog.
  const [enrichRows, setEnrichRows] = React.useState<Prospect[]>([])
  const [bulkEnrichOpen, setBulkEnrichOpen] = React.useState(false)
  const [seed, setSeed] = React.useState<LookalikeSeed | null>(
    incomingSeed ?? (activeTab ? activeTab.seed : null)
  )
  const [db, setDb] = React.useState<Exclude<DataSource, "lookalike">>(
    incomingSource ?? (activeTab ? activeTab.db : "kombo")
  )
  const [sortKey, setSortKey] = React.useState<SortKey>(
    activeTab ? activeTab.sortKey : "fit"
  )
  const [filtersRequested, setFiltersRequested] = React.useState(
    activeTab ? activeTab.filtersRequested : filtersRequestedFromUrl
  )

  // Matching prospects/companies live behind a costly API call, so the page
  // stays idle — no query, no results — until the user defines a search: a
  // submitted prompt, a lookalike seed, an active filter, or an in-flight
  // interpretation. "Search with filters" (a query param or the idle state's
  // own button) skips the prompt and opens the filter sidebar directly.
  const searchStarted =
    filtersRequested ||
    thinking ||
    Boolean(seed) ||
    lastPrompt.trim() !== "" ||
    Object.entries(query).some(([k, v]) =>
      k === "facets"
        ? Object.values(v as Record<string, string[]>).some((a) => a.length > 0)
        : Array.isArray(v)
          ? v.length > 0
          : typeof v === "string" && v.trim() !== ""
    )

  // The active database. A seed means Lookalike; Google Maps / TripAdvisor are
  // company-only, so fall back to Kombo when viewing People.
  const effectiveDb: Exclude<DataSource, "lookalike"> =
    entity === "people" && (db === "google_maps" || db === "tripadvisor")
      ? "kombo"
      : db
  const source: DataSource = seed ? "lookalike" : effectiveDb
  const linkedinOn = source === "linkedin"
  // Local-business sources expose only their own facets (no firmographic groups).
  const localSource = source === "google_maps" || source === "tripadvisor"
  // Values typed into the Google Maps "Location" facet — drives the map preview.
  const gmLocationValues = query.facets["gm_location"] ?? []

  // "Hide prospects already in a list": key existing list members by identity so
  // people you've already saved don't clutter the results.
  const [hideInList, setHideInList] = React.useState(
    activeTab ? activeTab.hideInList : false
  )
  // "Hide already in CRM": applies to both people and company results.
  const [hideInCrm, setHideInCrm] = React.useState(
    activeTab ? activeTab.hideInCrm : false
  )
  const lists = useLists()
  const inListKeys = React.useMemo(() => {
    const set = new Set<string>()
    for (const l of lists) {
      for (const pid of l.prospectIds) {
        const p = getProspect(pid)
        if (p) set.add(`${p.firstName}|${p.lastName}|${p.company}`.toLowerCase())
      }
    }
    return set
  }, [lists])

  // Companies the user blacklisted are excluded from every result set here in
  // the page (reactive) — searchLeads / searchCompanies stay pure.
  const blacklistedKeys = useBlacklistedKeys()

  const leads = React.useMemo(() => {
    let base = capPerCompany(
      sortLeads(seed ? lookalikeLeads(seed, query) : searchLeads(query), sortKey),
      query.perCompanyCap
    )
    if (blacklistedKeys.size > 0) {
      base = base.filter(
        (l) =>
          !blacklistedKeys.has(l.company.toLowerCase()) &&
          !blacklistedKeys.has(l.companyDomain.toLowerCase())
      )
    }
    if (hideInCrm) base = base.filter((l) => !l.inCrm)
    if (!hideInList || inListKeys.size === 0) return base
    return base.filter(
      (l) => !inListKeys.has(`${l.firstName}|${l.lastName}|${l.company}`.toLowerCase())
    )
  }, [seed, query, sortKey, hideInList, inListKeys, blacklistedKeys, hideInCrm])
  const companies = React.useMemo(() => {
    let base = sortCompanies(
      seed ? lookalikeCompanies(seed, query) : searchCompanies(query),
      sortKey
    )
    if (blacklistedKeys.size > 0) {
      base = base.filter(
        (co) =>
          !blacklistedKeys.has(co.name.toLowerCase()) &&
          !blacklistedKeys.has(co.domain.toLowerCase())
      )
    }
    if (hideInCrm) base = base.filter((co) => !co.inCrm)
    return base
  }, [seed, query, sortKey, blacklistedKeys, hideInCrm])
  const shownCount = entity === "people" ? leads.length : companies.length
  const estTotal = estimatedTotal(shownCount, entity)
  const selectedCount = selected.size
  const creditBase = selectedCount > 0 ? selectedCount : estTotal
  // Saving to a list costs per prospect; companies are free. A saved search is
  // free either way.
  const perRecordCost =
    entity === "people" ? SAVE_COST.prospect : SAVE_COST.company
  const projectedCredits = creditBase * perRecordCost

  // Pagination — so "select page" imports a controlled batch instead of every
  // matching result. Reset to the first page whenever the result set changes.
  const [page, setPage] = React.useState(0)
  const pageCount = Math.max(1, Math.ceil(shownCount / RESULTS_PER_PAGE))
  const resultSig = `${entity}|${sortKey}|${seed?.id ?? ""}|${JSON.stringify(query)}`
  const [pageSig, setPageSig] = React.useState(resultSig)
  if (resultSig !== pageSig) {
    setPageSig(resultSig)
    setPage(0)
  }
  const safePage = Math.min(page, pageCount - 1)
  const pageStart = safePage * RESULTS_PER_PAGE
  const pageEnd = Math.min(pageStart + RESULTS_PER_PAGE, shownCount)
  const pagedLeads =
    entity === "people" ? leads.slice(pageStart, pageEnd) : []
  const pagedCompanies =
    entity === "companies" ? companies.slice(pageStart, pageEnd) : []
  const pagedIds =
    entity === "people"
      ? pagedLeads.map((l) => l.id)
      : pagedCompanies.map((co) => co.id)
  const perCompanyCap = query.perCompanyCap

  // Set the per-company cap (people only) from the action bar. Capping trims the
  // result set, so keep only the still-visible rows selected (rather than
  // clearing) so the action bar — where this control lives — stays open.
  function setMaxPerCompany(cap: number | null) {
    setQuery((q) => ({ ...q, perCompanyCap: cap }))
    const visible = new Set(capPerCompany(leads, cap).map((l) => l.id))
    setSelected((prev) => new Set([...prev].filter((id) => visible.has(id))))
  }

  // A prompt is treated as a search query — interpret it into structured
  // filters and run the search (with a brief "thinking" beat). No chat.
  const runPrompt = React.useCallback(
    // forcedEntity: interpretPrompt's entity guess is a naive regex over the
    // free-text prompt (e.g. "VPs of Sales at companies with..." reads
    // "companies" and misclassifies a people search). Curated suggestions
    // already know their entity — pass it through to skip the guess.
    (prompt: string, forcedEntity?: AiEntity) => {
      const text = prompt.trim()
      if (text.length < 2) return
      setInput(text)
      setThinking(true)
      setLastPrompt(text)
      window.setTimeout(() => {
        const { query: q, entity: e, seed: s } = interpretPrompt(text)
        setEntity(forcedEntity ?? e)
        setQuery(q)
        setSeed(s ?? null)
        setSelected(new Set())
        setThinking(false)
      }, 900)
    },
    []
  )

  // Run a prompt handed over from the header search exactly once.
  const ranHeaderPrompt = React.useRef(false)
  React.useEffect(() => {
    if (headerPrompt && !ranHeaderPrompt.current) {
      ranHeaderPrompt.current = true
      runPrompt(headerPrompt)
    }
  }, [headerPrompt, runPrompt])

  // Register this page load as a tab, exactly once: a hand-off from
  // elsewhere (a saved search, a prefilled query, a lookalike seed, a header
  // prompt…) opens a brand-new tab rather than mutating whatever was active;
  // a bare visit resumes the tab that was already active without re-opening
  // it. First-ever visit with nothing persisted yet opens one blank tab.
  const registeredSearchTab = React.useRef(false)
  React.useEffect(() => {
    if (registeredSearchTab.current) return
    registeredSearchTab.current = true
    if (hasIncoming) {
      searchTabsStore.open({
        entity,
        query,
        lastPrompt,
        input,
        seed,
        db,
        urlsMode,
        urlPills,
        selectedIds: [...selected],
        sortKey,
        filtersRequested,
        hideInList,
        hideInCrm,
      })
    } else if (searchTabsStore.peekTabs().length === 0) {
      searchTabsStore.open()
    }
    // Intentionally run once at mount only — this captures the initial
    // resolved values, it doesn't need to react to their later changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { tabs: searchTabs, activeId: activeSearchTabId } = useSearchTabs()

  // Keep the active tab's snapshot current continuously (not just on an
  // explicit switch), so navigating away to a different page entirely and
  // back still resumes exactly where the user left off.
  React.useEffect(() => {
    if (!activeSearchTabId) return
    searchTabsStore.update(activeSearchTabId, {
      entity,
      query,
      lastPrompt,
      input,
      seed,
      db,
      urlsMode,
      urlPills,
      selectedIds: [...selected],
      sortKey,
      filtersRequested,
      hideInList,
      hideInCrm,
    })
  }, [
    activeSearchTabId,
    entity,
    query,
    lastPrompt,
    input,
    seed,
    db,
    urlsMode,
    urlPills,
    selected,
    sortKey,
    filtersRequested,
    hideInList,
    hideInCrm,
  ])

  function hydrateSearchTab(t: SearchTab) {
    setEntity(t.entity)
    setQuery(t.query)
    setLastPrompt(t.lastPrompt)
    setInput(t.input)
    setSeed(t.seed)
    setDb(t.db)
    setUrlsMode(t.urlsMode)
    setUrlPills(t.urlPills)
    setSelected(new Set(t.selectedIds))
    setSortKey(t.sortKey)
    setFiltersRequested(t.filtersRequested)
    setHideInList(t.hideInList)
    setHideInCrm(t.hideInCrm)
    // Transient UI-only state always resets on a tab switch.
    setThinking(false)
    setLookalikeOpen(false)
    setSaveDialogOpen(false)
    setFiltersOpen(false)
    setColumnsOpen(false)
    setBuildOpen(false)
    setBulkIds([])
    setBulkListOpen(false)
    setEnrichRows([])
    setBulkEnrichOpen(false)
  }

  function switchSearchTab(id: string) {
    if (id === activeSearchTabId) return
    const next = searchTabs.find((t) => t.id === id)
    if (!next) return
    hydrateSearchTab(next)
    searchTabsStore.setActive(id)
  }

  function newSearchTab() {
    hydrateSearchTab(searchTabsStore.open())
  }

  function closeSearchTab(id: string) {
    const wasActive = id === activeSearchTabId
    const nextId = searchTabsStore.close(id)
    if (wasActive && nextId) {
      const next = searchTabsStore.peekTabs().find((t) => t.id === nextId)
      if (next) hydrateSearchTab(next)
    }
  }

  function searchTabLabel(t: SearchTab): string {
    if (t.lastPrompt.trim()) return t.lastPrompt
    if (t.seed) return `${c.similarTo} ${t.seed.name}`
    if (!isQueryEmpty(t.query)) return queryTitle(t.query, t.entity)
    return c.newSearchTab
  }

  function removeFilter(group: keyof AiQuery, value: string) {
    setQuery((prev) => ({
      ...prev,
      [group]: (prev[group] as string[]).filter((v) => v !== value),
    }))
  }

  function addFilter(group: keyof AiQuery, value: string) {
    setQuery((prev) => {
      const arr = prev[group] as string[]
      if (arr.includes(value)) return prev
      return { ...prev, [group]: [...arr, value] }
    })
  }

  // Per-filter "Clear" — wipe every selected value of one typed group.
  function clearFilterGroup(group: keyof AiQuery) {
    setQuery((prev) => ({ ...prev, [group]: [] }))
  }

  // Dynamic per-database facets (LinkedIn Sales Navigator / Kombo FullEnrich).
  function addFacet(id: string, value: string) {
    setQuery((prev) => {
      const cur = prev.facets[id] ?? []
      if (cur.includes(value)) return prev
      return { ...prev, facets: { ...prev.facets, [id]: [...cur, value] } }
    })
  }
  function removeFacet(id: string, value: string) {
    setQuery((prev) => {
      const cur = prev.facets[id] ?? []
      const next = cur.filter((v) => v !== value)
      const facets = { ...prev.facets }
      if (next.length) facets[id] = next
      else delete facets[id]
      return { ...prev, facets }
    })
  }
  function clearFacet(id: string) {
    setQuery((prev) => {
      const facets = { ...prev.facets }
      delete facets[id]
      return { ...prev, facets }
    })
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Select / deselect the current page (capped + paged), so a single click
  // never imports more than one page of results at a time.
  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (pagedIds.every((id) => next.has(id))) {
        pagedIds.forEach((id) => next.delete(id))
      } else {
        pagedIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  // Multi-page "select all", capped at one enrichment batch — the same
  // affordance (and cap) People/Companies have.
  const selectableCount = Math.min(shownCount, MAX_ENRICH_BATCH)
  function selectAllCapped() {
    const ids =
      entity === "people"
        ? leads.map((l) => l.id)
        : companies.map((co) => co.id)
    setSelected(new Set(ids.slice(0, MAX_ENRICH_BATCH)))
  }

  // Pick the database to search. Lookalike needs a seed, so it opens the picker;
  // Kombo / LinkedIn just flip the LinkedIn-filter set on or off.
  function selectSource(next: DataSource) {
    if (next === "lookalike") {
      setDb("kombo")
      setQuery((q) => ({ ...q, linkedin: [] }))
      setLookalikeOpen(true)
      return
    }
    setSeed(null)
    setDb(next)
    if (next !== "linkedin") setQuery((q) => ({ ...q, linkedin: [] }))
    toast.success(c.dbSwitched(sourceMeta(next).label))
  }

  function applyLookalike(s: LookalikeSeed, q: AiQuery) {
    setSeed(s)
    setEntity(s.kind === "company" ? "companies" : "people")
    setQuery(q)
    setSelected(new Set())
    setLookalikeOpen(false)
    const prompt = c.lookalikePrompt(s.name)
    setLastPrompt(prompt)
    setInput(prompt)
  }

  // Scope the search to a pasted list of company URLs/domains — finds
  // prospects at those companies, refinable with the usual filters.
  function applyDomainList(domains: string[]) {
    setSeed(null)
    setEntity("people")
    setQuery((q) => ({ ...q, companyDomains: domains }))
    setSelected(new Set())
    const prompt = c.domainListPrompt(domains.length)
    setLastPrompt(prompt)
    setInput(prompt)
  }

  // Enter URLs mode (the third entity tab), seeding pills from an already-
  // applied domain scope so "edit" flows land with the list in place.
  function enterUrlsMode() {
    setUrlsMode(true)
    setSeed(null)
    setSelected(new Set())
    if (urlPills.length === 0 && query.companyDomains.length > 0) {
      setUrlPills(query.companyDomains)
    }
  }

  // Turn separators (comma / space / newline — typed or pasted) into pills.
  function handleUrlInputChange(v: string) {
    if (!/[\s,]/.test(v)) {
      setUrlInput(v)
      return
    }
    const endsWithSep = /[\s,]$/.test(v)
    const parts = v.split(/[\s,]+/).filter(Boolean)
    const remainder = endsWithSep ? "" : (parts.pop() ?? "")
    const found = parseDomainList(parts.join(","))
    if (found.length > 0) {
      setUrlPills((prev) => [...new Set([...prev, ...found])])
    }
    setUrlInput(remainder)
  }

  function removeUrlPill(domain: string) {
    setUrlPills((prev) => prev.filter((d) => d !== domain))
  }

  // Search with the pills plus whatever is still in the input.
  function runUrlSearch() {
    const domains = [...new Set([...urlPills, ...parseDomainList(urlInput)])]
    if (domains.length === 0) return
    setUrlPills(domains)
    setUrlInput("")
    applyDomainList(domains)
  }

  const urlSearchReady =
    urlPills.length > 0 || parseDomainList(urlInput).length > 0

  function saveSearch(name: string) {
    savedSearchStore.create({
      name,
      entity,
      query,
      prompt: lastPrompt,
      messages: [],
      resultCount: shownCount,
    })
    toast.success(c.savedToast)
  }

  function openSaveDialog() {
    setSaveName(queryTitle(query, entity))
    setSaveDialogOpen(true)
  }

  function confirmSave() {
    saveSearch(saveName.trim() || queryTitle(query, entity))
    setSaveDialogOpen(false)
  }

  // Reopen a saved search directly — an entry point from the idle state, no
  // need to run a fresh search first.
  function loadSearch(id: string) {
    const s = savedSearches.find((x) => x.id === id)
    if (!s) return
    setEntity(s.entity)
    setQuery(s.query)
    setLastPrompt(s.prompt)
    setInput(s.prompt)
    setSelected(new Set())
    toast.success(c.loadedToast)
  }

  // "Build a list": route to the chosen population method. Search-style sources
  // don't pre-create an empty list; the rest create it and route accordingly.
  function buildList(
    name: string,
    type: AiEntity,
    src: BuildSource,
    perCompanyCap: number | null,
    assigneeId: string | undefined
  ) {
    setBuildOpen(false)
    if (src === "lookalike") {
      setLookalikeOpen(true)
      return
    }
    if (SEARCH_SOURCES.includes(src)) {
      setEntity(type)
      setSeed(null)
      setQuery((q) => ({
        ...q,
        perCompanyCap: type === "people" ? perCompanyCap : null,
      }))
      if (src !== "find") toast.success(c.buildSourceSoon)
      return
    }
    if (src === "import") {
      navigate("/lists?import=1")
      return
    }
    const trimmed =
      name.trim() || (type === "people" ? "New prospects list" : "New company list")
    const list = listStore.create({
      name: trimmed,
      description: "",
      color: LIST_COLORS[trimmed.length % LIST_COLORS.length],
      kind: type === "people" ? "people" : "company",
      assigneeId,
    })
    toast.success(c.buildCreated(list.name))
    if (src === "hubspot" || src === "hubspot-list") {
      navigate("/integrations")
      return
    }
    navigate(`/lists/${list.id}`)
  }

  const allSelected =
    pagedIds.length > 0 && pagedIds.every((id) => selected.has(id))
  const someSelected =
    !allSelected && pagedIds.some((id) => selected.has(id))

  // Customizable columns — the same shared registry + ColumnManager + DataTable
  // that the Add-records dialog reuses, so both surfaces stay in lockstep.
  const leadColPrefs = useColumnPrefs("search-people", LEAD_RESULT_DEFAULT_IDS)
  const companyColPrefs = useColumnPrefs(
    "search-companies",
    COMPANY_RESULT_DEFAULT_IDS
  )

  const leadColumns = LEAD_RESULT_COLUMNS
  const companyColumns = COMPANY_RESULT_COLUMNS

  const leadSelection: TableSelection<AiLead> = {
    isSelected: (l) => selected.has(l.id),
    toggle: (l) => toggleRow(l.id),
    toggleAll,
    allSelected,
    someSelected,
  }
  const companySelection: TableSelection<AiCompany> = {
    isSelected: (co) => selected.has(co.id),
    toggle: (co) => toggleRow(co.id),
    toggleAll,
    allSelected,
    someSelected,
  }

  // Selected search/lookalike results → real records, then the standard
  // search-result actions (add to list / campaign / export / CRM).
  function materializeSelected(): string[] {
    if (entity === "people") {
      return materializeLeadsToIds(leads.filter((l) => selected.has(l.id)))
    }
    return materializeCompaniesToIds(companies.filter((co) => selected.has(co.id)))
  }

  // Per-row "Add to list" — same materialize-then-add flow as the bulk action,
  // just scoped to a single search-result row.
  function addRowToList(ids: string[]) {
    setBulkIds(ids)
    setBulkListOpen(true)
  }
  function bulkAddToList() {
    const ids = materializeSelected()
    if (ids.length === 0) return
    // Adding to a list happens in one batch at a time — same cap as enrichment.
    setBulkIds(ids.slice(0, MAX_ENRICH_BATCH))
    setSelected(new Set())
    setBulkListOpen(true)
  }
  function bulkExportSelected() {
    if (entity === "people") {
      const rows = leads.filter((l) => selected.has(l.id))
      downloadCsv(
        "prospects.csv",
        ["Name", "Title", "Company", "Region", "Fit"],
        rows.map((l) => [
          `${l.firstName} ${l.lastName}`,
          l.title,
          l.company,
          l.region,
          l.fit,
        ])
      )
    } else {
      const rows = companies.filter((co) => selected.has(co.id))
      downloadCsv(
        "companies.csv",
        ["Company", "Industry", "Region", "Headcount", "Fit"],
        rows.map((co) => [co.name, co.industry, co.region, co.headcount, co.fit])
      )
    }
  }
  function bulkAddToCrm() {
    const ids = materializeSelected()
    if (ids.length === 0) return
    setSelected(new Set())
    toast.success(c.crmToast(ids.length))
  }
  // Bulk enrich: people are materialized into real prospects and run through
  // the standard enrich dialog; companies mirror the Companies page's stub.
  function bulkEnrich() {
    if (entity !== "people") {
      toast.success(c.enrichCompaniesToast(selectedCount))
      setSelected(new Set())
      return
    }
    const ids = materializeSelected().slice(0, MAX_ENRICH_BATCH)
    if (ids.length === 0) return
    const rows = ids.flatMap((id) => getProspect(id) ?? [])
    setEnrichRows(rows)
    setSelected(new Set())
    setBulkEnrichOpen(true)
  }
  // Lookalikes are seeded from the first selected row — the same convention
  // as People/Companies (via applyLookalike, which resets the search state).
  function bulkLookalikes() {
    if (entity === "people") {
      const l = leads.find((x) => selected.has(x.id))
      if (!l) return
      applyLookalike(
        {
          id: l.id,
          kind: "person",
          name: `${l.firstName} ${l.lastName}`,
          sub: `${l.title} @ ${l.company}`,
          industry: l.industry,
          region: l.region,
          headcount: l.headcount,
        },
        { ...EMPTY_QUERY }
      )
    } else {
      const co = companies.find((x) => selected.has(x.id))
      if (!co) return
      applyLookalike(
        {
          id: co.id,
          kind: "company",
          name: co.name,
          sub: `${co.industry} · ${co.region}`,
          industry: co.industry,
          region: co.region,
          headcount: co.headcount,
        },
        { ...EMPTY_QUERY }
      )
    }
  }

  // Label, description and icon for each searchable database.
  const sourceMeta = (k: DataSource) => {
    if (k === "linkedin")
      return {
        label: c.linkedinSource,
        desc: c.dbLinkedinDesc,
        icon: <LinkedinIcon className="size-4 text-[#0a66c2]" />,
      }
    if (k === "lookalike")
      return {
        label: c.dbLookalike,
        desc: c.dbLookalikeDesc,
        icon: <ScanSearch className="text-primary size-4" />,
      }
    if (k === "google_maps")
      return {
        label: c.dbGmaps,
        desc: c.dbGmapsDesc,
        icon: <MapPin className="size-4 text-emerald-600" />,
      }
    if (k === "tripadvisor")
      return {
        label: c.dbTripadvisor,
        desc: c.dbTripadvisorDesc,
        icon: <Star className="size-4 text-amber-500" />,
      }
    return {
      label: c.dbKombo,
      desc: c.dbKomboDesc,
      icon: <Database className="text-primary size-4" />,
    }
  }

  return (
    <Page>
      <>
      <PageHeading
        title={c.title}
        description={c.description}
        action={
          <SavedSearchesControl
            savedSearches={savedSearches}
            onLoad={loadSearch}
            onRemove={(id) => {
              savedSearchStore.remove(id)
              toast.success(c.removedSaved)
            }}
          />
        }
      />
      <SearchTabBar
        tabs={searchTabs.map((t) => ({ id: t.id, label: searchTabLabel(t) }))}
        activeId={activeSearchTabId}
        onSwitchTab={switchSearchTab}
        onCloseTab={closeSearchTab}
        onNewTab={newSearchTab}
      />
      <div className="space-y-3">
        {/* Prospect Search tabs — People, Companies, or a pasted URL list. */}
        <div className="bg-muted inline-flex rounded-md p-0.5">
          <EntityTab
            active={!urlsMode && entity === "people"}
            onClick={() => {
              setUrlsMode(false)
              setEntity("people")
              setSeed(null)
              setSelected(new Set())
            }}
            icon={Users}
            label={c.people}
          />
          <EntityTab
            active={!urlsMode && entity === "companies"}
            onClick={() => {
              setUrlsMode(false)
              setEntity("companies")
              setSeed(null)
              setSelected(new Set())
            }}
            icon={Building2}
            label={c.companies}
          />
          <EntityTab
            active={urlsMode}
            onClick={enterUrlsMode}
            icon={Link2}
            label={c.urlsTab}
          />
        </div>

        {/* Search query bar — the prompt IS the query, no chat thread. A soft
            brand-gradient halo behind the card makes it read as the page's
            hero control rather than one more toolbar. */}
        <div className="relative">
          <div
            aria-hidden
            className="from-primary/25 via-volt/20 to-primary/25 absolute -inset-1 rounded-2xl bg-gradient-to-r opacity-70 blur-md"
          />
          <Card className="border-primary/30 shadow-primary/10 from-primary/10 via-primary/5 relative bg-gradient-to-br to-transparent p-3 shadow-lg">
          <form
            className="flex items-start gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (urlsMode) runUrlSearch()
              else runPrompt(input)
            }}
          >
            {urlsMode ? (
              <div className="flex-1 space-y-1">
                <div
                  className="border-input focus-within:ring-ring/50 bg-background flex min-h-12 flex-wrap items-center gap-1.5 rounded-md border p-2 focus-within:ring-2"
                  role="group"
                  aria-label={c.urlsFieldAria}
                >
                  <Link2 className="text-muted-foreground ml-1 size-4 shrink-0" />
                  {urlPills.map((d) => (
                    <span
                      key={d}
                      className="bg-muted inline-flex items-center gap-1 rounded-full py-0.5 pr-1 pl-2.5 text-xs font-medium"
                    >
                      {d}
                      <button
                        type="button"
                        aria-label={c.urlsRemove(d)}
                        onClick={() => removeUrlPill(d)}
                        className="text-muted-foreground hover:bg-background hover:text-foreground flex size-4 items-center justify-center rounded-full transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    id="search-urls-input"
                    autoFocus
                    value={urlInput}
                    onChange={(e) => handleUrlInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        runUrlSearch()
                      }
                      if (
                        e.key === "Backspace" &&
                        urlInput === "" &&
                        urlPills.length > 0
                      ) {
                        removeUrlPill(urlPills[urlPills.length - 1])
                      }
                    }}
                    placeholder={
                      urlPills.length === 0 ? c.urlsPlaceholder : c.urlsAddMore
                    }
                    aria-label={c.urlsFieldAria}
                    className="placeholder:text-muted-foreground min-w-32 flex-1 bg-transparent text-sm outline-none"
                  />
                  {(urlPills.length > 0 || urlInput.length > 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        setUrlPills([])
                        setUrlInput("")
                        document.getElementById("search-urls-input")?.focus()
                      }}
                      className="text-muted-foreground hover:text-foreground ml-auto shrink-0 text-xs font-medium"
                    >
                      {c.urlsClearAll}
                    </button>
                  )}
                </div>
                <p className="text-muted-foreground px-1 text-xs">{c.urlsHint}</p>
              </div>
            ) : (
            <div className="flex-1 space-y-1">
              <div className="relative">
                <Sparkles className="text-primary pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="search-prompt"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    entity === "companies"
                      ? c.inputPlaceholderCompanies
                      : c.inputPlaceholder
                  }
                  aria-label={c.srTitle}
                  className="bg-background h-12 pr-9 pl-9"
                  clearable={false}
                />
                {input.length > 0 && (
                  <button
                    type="button"
                    aria-label={c.clearQuery}
                    title={c.clearQuery}
                    onClick={() => {
                      setInput("")
                      document.getElementById("search-prompt")?.focus()
                    }}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-1/2 right-2.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-md transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>
            )}
            <Button
              type="submit"
              variant="volt"
              className="h-12"
              disabled={
                urlsMode
                  ? !urlSearchReady || thinking
                  : input.trim().length < 2 || thinking
              }
            >
              {thinking ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <SearchIcon className="size-4" />
              )}
              <span className="hidden sm:inline">{c.searchBtn}</span>
            </Button>
          </form>
          </Card>
        </div>

        {/* Matching runs a real (costly) query, so nothing renders — no
            filter sidebar, no results — until a search actually starts. */}
        {!searchStarted && (
          <SearchIdleState
            c={c}
            entity={entity}
            urlsMode={urlsMode}
            onSuggestion={(s) => runPrompt(s, entity)}
          />
        )}

        {searchStarted && (
        <div className="flex flex-col gap-6 lg:flex-row">
          <FilterSidebar
            className="lg:w-64 lg:shrink-0"
            query={query}
            onAdd={addFilter}
            onRemove={removeFilter}
            onClear={() => setQuery({ ...EMPTY_QUERY })}
            onClearGroup={clearFilterGroup}
            onAddFacet={addFacet}
            onRemoveFacet={removeFacet}
            onClearFacet={clearFacet}
            facetDefs={facetsForDb(facetDbForSource(source), entity)}
            linkedinOn={linkedinOn}
            minimal={localSource}
            entity={entity}
            locale={locale}
            c={c}
          />
          <div className="min-w-0 flex-1">
        <div className="min-w-0 space-y-3">
          {/* Blended controls: sources, filters & sort */}
          <Card className="gap-3 p-3">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Database selector — KomboAI, Lookalike, or LinkedIn. */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5" title={c.dbLabel}>
                    {sourceMeta(source).icon}
                    <span className="hidden sm:inline">{sourceMeta(source).label}</span>
                    <ChevronDown className="text-muted-foreground size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="text-muted-foreground text-xs">
                    {c.dbLabel}
                  </DropdownMenuLabel>
                  {(entity === "companies" ? COMPANY_SOURCES : PEOPLE_SOURCES).map((k) => {
                    const meta = sourceMeta(k)
                    return (
                      <DropdownMenuItem
                        key={k}
                        onClick={() => selectSource(k)}
                        className="gap-2.5 py-2"
                      >
                        <span className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-md">
                          {meta.icon}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="text-sm font-medium">{meta.label}</span>
                          <span className="text-muted-foreground text-xs">
                            {meta.desc}
                          </span>
                        </span>
                        {source === k && (
                          <CheckCircle2 className="text-primary size-4 shrink-0" />
                        )}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowDownUp className="size-4" />
                    <span className="hidden sm:inline">
                      {sortLabel(sortKey, c)}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(["fit", "name", "company", "headcount", "recent"] as SortKey[]).map(
                    (k) => (
                      <DropdownMenuItem key={k} onClick={() => setSortKey(k)}>
                        {sortLabel(k, c)}
                        {sortKey === k && <CheckCircle2 className="ml-auto size-4" />}
                      </DropdownMenuItem>
                    )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm" onClick={() => setColumnsOpen(true)}>
                <Columns3 className="size-4" />
                <span className="hidden sm:inline">{c.columnsBtn}</span>
              </Button>

              {/* Secondary actions stay visible at every width — icon-only on
                  the narrowest screens, never collapsed behind an overflow
                  menu. */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLookalikeOpen(true)}
                aria-label={c.lookalike}
              >
                <ScanSearch className="size-4" />
                <span className="hidden sm:inline">{c.lookalike}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openSaveDialog}
                disabled={shownCount === 0}
                aria-label={c.saveThis}
              >
                <Bookmark className="size-4" />
                <span className="hidden sm:inline">{c.saveThis}</span>
              </Button>
            </div>
          </div>
          </Card>

          {thinking && <ThinkingPanel c={c} />}

          {/* Lookalike seed banner */}
          {!thinking && seed && (
            <div className="border-primary/30 bg-primary/5 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <ScanSearch className="text-primary size-4 shrink-0" />
              <span className="text-muted-foreground">{c.similarTo}</span>
              <span className="font-medium">{seed.name}</span>
              <span className="text-muted-foreground text-xs">· {seed.sub}</span>
              <button
                type="button"
                onClick={() => setSeed(null)}
                className="text-muted-foreground hover:text-foreground ml-auto inline-flex items-center gap-1 text-xs"
              >
                <X className="size-3" />
                {c.clearLookalike}
              </button>
            </div>
          )}

          {/* Company-list scope banner */}
          {!thinking && query.companyDomains.length > 0 && (
            <div className="border-primary/30 bg-primary/5 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <Link2 className="text-primary size-4 shrink-0" />
              <span className="text-muted-foreground">
                {c.domainListScoped(query.companyDomains.length)}
              </span>
              <button
                type="button"
                onClick={enterUrlsMode}
                className="text-primary text-xs font-medium hover:underline"
              >
                {c.editList}
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery((q) => ({ ...q, companyDomains: [] }))
                  setUrlPills([])
                  setUrlInput("")
                }}
                className="text-muted-foreground hover:text-foreground ml-auto inline-flex items-center gap-1 text-xs"
              >
                <X className="size-3" />
                {c.clearList}
              </button>
            </div>
          )}

          {!thinking && source === "google_maps" && entity === "companies" &&
            gmLocationValues.length > 0 && (
              <LocationMapPreview locations={gmLocationValues} c={c} />
            )}

          {!thinking && (
            <>
          {/* Stats strip */}
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-sm">
            <span>
              <span className="text-foreground font-semibold">{shownCount}</span>{" "}
              {entity === "people" ? c.people.toLowerCase() : c.companies.toLowerCase()}
              {selectedCount > 0 && <> · {c.selected(selectedCount)}</>}
            </span>
            <span className="inline-flex items-center gap-1">
              <CircleDashed className="size-3.5" />
              {c.estLeads(estTotal)}
            </span>
            {perRecordCost > 0 ? (
              <>
                <span className="inline-flex items-center gap-1">
                  <Coins className="text-chart-4 size-3.5" />
                  {c.perProspect(perRecordCost)}
                </span>
                <span className="text-foreground font-medium">
                  {c.projected(projectedCredits)}
                </span>
              </>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Coins className="text-chart-4 size-3.5" />
                {c.freeToSave}
              </span>
            )}
          </div>

          {/* Selection controls — keep imports small: pick a page at a time and,
              for people, cap how many contacts come from each company. */}
          {shownCount > 0 && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-1">
              <Button
                variant={allSelected ? "secondary" : "outline"}
                size="sm"
                onClick={toggleAll}
              >
                <Checkbox checked={allSelected} className="pointer-events-none" />
                {allSelected ? c.deselectPage : c.selectPage}
              </Button>

              {selectedCount < selectableCount && (
                <button
                  type="button"
                  onClick={selectAllCapped}
                  className="text-primary text-xs font-medium hover:underline"
                >
                  {c.selectAllCapped(selectableCount)}
                </button>
              )}

              {entity === "people" && (
                <button
                  type="button"
                  onClick={() => setHideInList((v) => !v)}
                  aria-pressed={hideInList}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                    hideInList
                      ? "border-primary bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  <Checkbox
                    checked={hideInList}
                    className="pointer-events-none size-3.5"
                  />
                  {c.hideInList}
                </button>
              )}

              <button
                type="button"
                onClick={() => setHideInCrm((v) => !v)}
                aria-pressed={hideInCrm}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                  hideInCrm
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/60"
                )}
              >
                <Checkbox
                  checked={hideInCrm}
                  className="pointer-events-none size-3.5"
                />
                {c.hideInCrm}
              </button>

              <div className="ml-auto flex items-center gap-1">
                <span className="text-muted-foreground px-1 text-xs tabular-nums">
                  {c.pageRange(pageStart + 1, pageEnd, shownCount)}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={safePage === 0}
                  onClick={() => setPage(Math.max(0, safePage - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))}
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Results table — shared DataTable + ColumnManager (like People). */}
          {entity === "people" ? (
            <DataTable
              columns={leadColumns}
              visible={leadColPrefs.visible}
              rows={pagedLeads}
              rowKey={(l) => l.id}
              locale={locale}
              selection={leadSelection}
              empty={c.noResults}
              actions={(l) => (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={c.addRowToList}
                  onClick={() => addRowToList(materializeLeadsToIds([l]))}
                >
                  <FolderPlus className="size-4" />
                </Button>
              )}
            />
          ) : (
            <DataTable
              columns={companyColumns}
              visible={companyColPrefs.visible}
              rows={pagedCompanies}
              rowKey={(co) => co.id}
              locale={locale}
              selection={companySelection}
              empty={c.noResults}
              actions={(co) => (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={c.addRowToList}
                  onClick={() => addRowToList(materializeCompaniesToIds([co]))}
                >
                  <FolderPlus className="size-4" />
                </Button>
              )}
            />
          )}

          {/* Search-result actions — the shared bulk bar People/Companies use.
              No Add-to-campaign here on purpose (list-first flow). The
              per-company cap is an action modifier (it trims the selection),
              not a search filter, so it lives with the actions. */}
          <BulkActionsBar
            count={selectedCount}
            capNote={
              selectedCount > MAX_ENRICH_BATCH
                ? c.capBatchNote(MAX_ENRICH_BATCH)
                : undefined
            }
            perCompanyCap={entity === "people" ? perCompanyCap : undefined}
            onPerCompanyCapChange={
              entity === "people" ? setMaxPerCompany : undefined
            }
            onClear={() => setSelected(new Set())}
            onExport={bulkExportSelected}
            onEnrich={bulkEnrich}
            onAddToList={bulkAddToList}
            onAddToCrm={bulkAddToCrm}
            onLookalikes={bulkLookalikes}
          />
            </>
          )}
        </div>
          </div>
        </div>
        )}
      </div>
      </>

      <LookalikeDialog
        open={lookalikeOpen}
        onOpenChange={setLookalikeOpen}
        c={c}
        defaultEntity={entity}
        onConfirm={applyLookalike}
      />

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bookmark className="text-primary size-5" />
              {c.saveThis}
            </DialogTitle>
            <DialogDescription>{c.saveSearchDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="save-search-name">{c.saveNameLabel}</Label>
            <Input
              id="save-search-name"
              autoFocus
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmSave()
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              {c.cancel}
            </Button>
            <Button variant="volt" onClick={confirmSave}>
              <Bookmark className="size-4" />
              {c.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FilterModal
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        query={query}
        onAdd={addFilter}
        onRemove={removeFilter}
        onClear={() => setQuery({ ...EMPTY_QUERY })}
        onClearGroup={clearFilterGroup}
        c={c}
        linkedinOn={linkedinOn}
        minimal={localSource}
        entity={entity}
        facetDefs={facetsForDb(facetDbForSource(source), entity)}
        onAddFacet={addFacet}
        onRemoveFacet={removeFacet}
        onClearFacet={clearFacet}
        locale={locale}
      />

      {entity === "people" ? (
        <ColumnManager
          open={columnsOpen}
          onOpenChange={setColumnsOpen}
          columns={leadColumns}
          groups={LEAD_RESULT_GROUPS}
          prefs={leadColPrefs}
          locale={locale}
        />
      ) : (
        <ColumnManager
          open={columnsOpen}
          onOpenChange={setColumnsOpen}
          columns={companyColumns}
          groups={COMPANY_RESULT_GROUPS}
          prefs={companyColPrefs}
          locale={locale}
        />
      )}

      <BuildListDialog
        open={buildOpen}
        onOpenChange={setBuildOpen}
        c={c}
        onChoose={buildList}
      />

      <BulkAddDialog
        open={bulkListOpen}
        onOpenChange={setBulkListOpen}
        mode="list"
        recordKind={entity === "people" ? "person" : "company"}
        ids={bulkIds}
      />

      <EnrichListDialog
        open={bulkEnrichOpen}
        onOpenChange={setBulkEnrichOpen}
        prospects={enrichRows}
      />
    </Page>
  )
}

// Signals: the AI-suggestion feed (curated carousel rows) only — a separate
// page from Search. Rows manage their own local query/results; picking one
// (or "View all") hands the structured query to the Search page via
// navigation state rather than rendering results here.
export function Signals() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  // Every curated signal here (funding, LinkedIn hiring, exec hires) is a
  // company-level attribute, so this page only ever searches companies —
  // no People/Companies toggle needed.
  const entity: AiEntity = "companies"
  const [lookalikeOpen, setLookalikeOpen] = React.useState(false)
  const [bulkIds, setBulkIds] = React.useState<string[]>([])
  const [bulkListOpen, setBulkListOpen] = React.useState(false)

  function runQuery(query: AiQuery, ent: AiEntity, label: string) {
    navigate("/search", { state: { prefilledQuery: { query, entity: ent, label } } })
  }

  return (
    <Page>
      <PageHeading title={c.signalsTitle} description={c.signalsDescription} />
      <div className="space-y-3">
        <SearchEmptyState
          c={c}
          locale={locale}
          entity={entity}
          onRunQuery={runQuery}
          onAddToList={(ids) => {
            setBulkIds(ids)
            setBulkListOpen(true)
          }}
          onOpenLookalike={() => setLookalikeOpen(true)}
        />
      </div>

      <LookalikeDialog
        open={lookalikeOpen}
        onOpenChange={setLookalikeOpen}
        c={c}
        defaultEntity={entity}
        onConfirm={(seed) => navigate("/search", { state: { lookalikeSeed: seed } })}
      />

      <BulkAddDialog
        open={bulkListOpen}
        onOpenChange={setBulkListOpen}
        mode="list"
        recordKind="company"
        ids={bulkIds}
      />
    </Page>
  )
}

function LookalikeDialog({
  open,
  onOpenChange,
  c,
  defaultEntity,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  c: Copy
  defaultEntity: AiEntity
  onConfirm: (seed: LookalikeSeed, query: AiQuery) => void
}) {
  const [seedKind, setSeedKind] = React.useState<"person" | "company">(
    defaultEntity === "companies" ? "company" : "person"
  )
  const [seedId, setSeedId] = React.useState<string | null>(null)
  const [seedQuery, setSeedQuery] = React.useState("")
  const [wasOpen, setWasOpen] = React.useState(false)

  if (open && !wasOpen) {
    setWasOpen(true)
    setSeedKind(defaultEntity === "companies" ? "company" : "person")
    setSeedId(null)
    setSeedQuery("")
  }
  if (!open && wasOpen) setWasOpen(false)

  const q = seedQuery.trim()
  const ql = q.toLowerCase()
  const match = (s: LookalikeSeed) => !ql || s.name.toLowerCase().includes(ql)
  const seeds = LOOKALIKE_SEEDS.filter((s) => s.kind === seedKind && match(s))
  // Typed a name we don't have a seed for? Build an ad-hoc one to search from.
  const hasExact = LOOKALIKE_SEEDS.some(
    (s) => s.kind === seedKind && s.name.toLowerCase() === ql
  )
  const customSeed: LookalikeSeed | null =
    q && !hasExact
      ? {
          id: "custom",
          kind: seedKind,
          name: q,
          sub: `${q} · custom seed`,
          industry: INDUSTRY_OPTIONS[0] ?? "SaaS",
          region: REGION_OPTIONS[0] ?? "EMEA",
          headcount: "201-500",
        }
      : null
  const seed =
    seedId === "custom"
      ? customSeed
      : LOOKALIKE_SEEDS.find((s) => s.id === seedId) ?? null

  function selectKind(kind: "person" | "company") {
    setSeedKind(kind)
    setSeedId(null)
  }

  function confirm() {
    // A lookalike must start from a specific selected person or company.
    if (!seed) return
    onConfirm(seed, { ...EMPTY_QUERY })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanSearch className="text-primary size-5" />
            {c.lookalikeTitle}
          </DialogTitle>
          <DialogDescription>{c.lookalikeDesc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="bg-muted inline-flex rounded-md p-0.5">
            <EntityTab
              active={seedKind === "person"}
              onClick={() => selectKind("person")}
              icon={Users}
              label={c.people}
            />
            <EntityTab
              active={seedKind === "company"}
              onClick={() => selectKind("company")}
              icon={Building2}
              label={c.companies}
            />
          </div>

          <div className="space-y-2">
            <Label>{c.pickSeed}</Label>
            <div className="relative">
              <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                value={seedQuery}
                onChange={(e) => setSeedQuery(e.target.value)}
                placeholder={seedKind === "company" ? c.companySearch : c.personSearch}
                className="pl-9"
              />
            </div>
            <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
              {customSeed && (
                <button
                  type="button"
                  onClick={() => setSeedId("custom")}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                    seedId === "custom"
                      ? "border-primary ring-primary bg-primary/[0.04] ring-1"
                      : "hover:bg-muted/60"
                  )}
                >
                  {seedKind === "company" ? (
                    <Building2 className="text-primary size-4 shrink-0" />
                  ) : (
                    <Users className="text-primary size-4 shrink-0" />
                  )}
                  <span className="font-medium">{c.useCompany(customSeed.name)}</span>
                </button>
              )}
              {seeds.length > 0 && (
                <SeedGroup seeds={seeds} selected={seedId} onSelect={setSeedId} />
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="volt" onClick={confirm} disabled={!seed}>
            <ScanSearch className="size-4" />
            {c.findSimilar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Paste a list of company URLs/domains — resolves to prospects at those
// companies (people search) or the matching companies themselves.
function SeedGroup({
  label,
  seeds,
  selected,
  onSelect,
}: {
  label?: string
  seeds: LookalikeSeed[]
  selected: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div>
      {label && (
        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
          {label}
        </p>
      )}
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {seeds.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={cn(
              "flex items-center gap-2 rounded-md border px-2.5 py-2 text-left text-sm transition-colors",
              selected === s.id
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/60"
            )}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                s.kind === "company"
                  ? "bg-chart-3/15 text-chart-3"
                  : "bg-primary/10 text-primary"
              )}
            >
              {s.kind === "company" ? <Building2 className="size-3.5" /> : <Users className="size-3.5" />}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium">{s.name}</span>
              <span className="text-muted-foreground block truncate text-xs">
                {s.sub}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}


// Persistent filter rail — filters are exposed by default (every search uses
// them), rendering the shared sectioned FilterCatalog (Include/Exclude per
// value) as an always-visible sidebar. Selecting any value runs the search.
function FilterSidebar({
  className,
  query,
  onAdd,
  onRemove,
  onClear,
  onClearGroup,
  onAddFacet,
  onRemoveFacet,
  onClearFacet,
  facetDefs,
  linkedinOn,
  minimal,
  entity,
  locale,
  c,
}: {
  className?: string
  query: AiQuery
  onAdd: (group: keyof AiQuery, value: string) => void
  onRemove: (group: keyof AiQuery, value: string) => void
  onClear: () => void
  onClearGroup: (group: keyof AiQuery) => void
  onAddFacet: (id: string, value: string) => void
  onRemoveFacet: (id: string, value: string) => void
  onClearFacet: (id: string) => void
  facetDefs: FacetDef[]
  linkedinOn: boolean
  minimal?: boolean
  entity: AiEntity
  locale: Locale
  c: Copy
}) {
  const [text, setText] = React.useState("")

  const groups = minimal
    ? []
    : SEARCH_FILTER_GROUPS.filter(
        (g) => !(g.linkedinOnly && !linkedinOn) && !(g.scope && g.scope !== entity)
      )
  const activeCount =
    groups.reduce((n, g) => n + (query[g.key] as string[]).length, 0) +
    facetDefs.reduce((n, f) => n + (query.facets[f.id]?.length ?? 0), 0)

  // Typed groups + per-database facets, flattened into the shared catalog
  // shape; handlers dispatch by id (group key vs facet id — no overlap).
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

  return (
    <aside className={className}>
      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <SlidersHorizontal className="size-4" />
            {c.filtersTitle}
            {activeCount > 0 && (
              <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                {activeCount}
              </span>
            )}
          </span>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium transition-colors"
            >
              <X className="size-3.5" />
              {c.clearAll}
            </button>
          )}
        </div>
        <div className="border-b p-2">
          <div className="relative">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={c.filterTypeahead}
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>
        <div className="max-h-[24rem] overflow-y-auto p-1 lg:max-h-[calc(100vh-16rem)]">
          <FilterCatalog
            filters={catalogFilters}
            selected={(id) =>
              groupKeys.has(id)
                ? (query[id as keyof AiQuery] as string[])
                : (query.facets[id] ?? [])
            }
            onInclude={(id, v) =>
              groupKeys.has(id) ? onAdd(id as keyof AiQuery, v) : onAddFacet(id, v)
            }
            onExclude={(id, v) =>
              groupKeys.has(id)
                ? onAdd(id as keyof AiQuery, excludeValue(v))
                : onAddFacet(id, excludeValue(v))
            }
            onRemove={(id, v) =>
              groupKeys.has(id)
                ? onRemove(id as keyof AiQuery, v)
                : onRemoveFacet(id, v)
            }
            onClear={(id) =>
              groupKeys.has(id)
                ? onClearGroup(id as keyof AiQuery)
                : onClearFacet(id)
            }
            locale={locale}
            query={text}
          />
        </div>
      </Card>
    </aside>
  )
}

// Pristine /search state: AI-powered suggestions + a "type your query" prompt.
function SearchEmptyState({
  c,
  locale,
  entity,
  onRunQuery,
  onAddToList,
  onOpenLookalike,
}: {
  c: Copy
  locale: Locale
  entity: AiEntity
  onRunQuery: (query: AiQuery, entity: AiEntity, label: string) => void
  onAddToList: (ids: string[]) => void
  onOpenLookalike: () => void
}) {
  // Selection spans every row — a record only counts once even if it shows
  // up in more than one suggestion's sample.
  const [selected, setSelected] = React.useState<Map<string, AiLead | AiCompany>>(
    new Map()
  )
  const selectedCount = selected.size

  const toggleRecord = React.useCallback((record: AiLead | AiCompany) => {
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(record.id)) next.delete(record.id)
      else next.set(record.id, record)
      return next
    })
  }, [])

  const setRowSelected = React.useCallback(
    (records: (AiLead | AiCompany)[], on: boolean) => {
      setSelected((prev) => {
        const next = new Map(prev)
        for (const r of records) {
          if (on) next.set(r.id, r)
          else next.delete(r.id)
        }
        return next
      })
    },
    []
  )

  return (
    <div className="space-y-8 py-1 pb-24">
      <p className="flex items-center gap-1.5 text-sm font-semibold">
        <Sparkles className="text-primary size-4" />
        {c.aiSuggestions}
      </p>

      <LookalikeSuggestionRow
        entity={entity}
        onOpenLookalike={onOpenLookalike}
        selected={selected}
        onToggleRecord={toggleRecord}
        onSetRowSelected={setRowSelected}
        c={c}
      />

      {SIGNAL_ROW_DEFS.map((def) => (
        <SignalSuggestionRow
          key={def.tag}
          def={def}
          entity={entity}
          locale={locale}
          onRunQuery={onRunQuery}
          selected={selected}
          onToggleRecord={toggleRecord}
          onSetRowSelected={setRowSelected}
          c={c}
        />
      ))}

      {selectedCount > 0 && (
        <div className="bg-background sticky bottom-4 z-20 flex flex-wrap items-center gap-1.5 rounded-xl border p-2 shadow-lg">
          <span className="px-2 text-sm font-medium tabular-nums">
            {c.selected(selectedCount)}
          </span>
          <span className="bg-border mx-1 h-5 w-px" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const records = [...selected.values()]
              const ids =
                entity === "people"
                  ? materializeLeadsToIds(records as AiLead[])
                  : materializeCompaniesToIds(records as AiCompany[])
              setSelected(new Map())
              onAddToList(ids)
            }}
          >
            <ListPlus className="size-4" />
            {c.bulkList}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const records = [...selected.values()]
              if (entity === "people") {
                const rows = records as AiLead[]
                downloadCsv(
                  "prospects.csv",
                  ["Name", "Title", "Company", "Region", "Fit"],
                  rows.map((l) => [
                    `${l.firstName} ${l.lastName}`,
                    l.title,
                    l.company,
                    l.region,
                    l.fit,
                  ])
                )
              } else {
                const rows = records as AiCompany[]
                downloadCsv(
                  "companies.csv",
                  ["Company", "Industry", "Region", "Headcount", "Fit"],
                  rows.map((co) => [co.name, co.industry, co.region, co.headcount, co.fit])
                )
              }
            }}
          >
            <Download className="size-4" />
            {c.bulkExport}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.success(c.crmToast(selectedCount))
              setSelected(new Map())
            }}
          >
            <Plug className="size-4" />
            {c.bulkCrm}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => setSelected(new Map())}
          >
            <X className="size-4" />
            {c.clearSel}
          </Button>
        </div>
      )}
    </div>
  )
}

// Lookalikes as one carousel row (folded in from the old per-page Lookalikes
// tab): previews records similar to one representative seed; the header and
// "View all" both open the full seed picker so the user can choose any seed.
function LookalikeSuggestionRow({
  entity,
  onOpenLookalike,
  selected,
  onToggleRecord,
  onSetRowSelected,
  c,
}: {
  entity: AiEntity
  onOpenLookalike: () => void
  selected: Map<string, AiLead | AiCompany>
  onToggleRecord: (record: AiLead | AiCompany) => void
  onSetRowSelected: (records: (AiLead | AiCompany)[], on: boolean) => void
  c: Copy
}) {
  const seed = LOOKALIKE_SEEDS.find(
    (s) => s.kind === (entity === "companies" ? "company" : "person")
  )
  const cards = React.useMemo(
    () =>
      !seed
        ? []
        : entity === "companies"
          ? lookalikeCompanies(seed, EMPTY_QUERY).slice(0, 12)
          : lookalikeLeads(seed, EMPTY_QUERY).slice(0, 12),
    [entity, seed]
  )
  const scrollRef = React.useRef<HTMLDivElement>(null)

  if (!seed || cards.length === 0) return null

  const rowAllSelected = cards.every((r) => selected.has(r.id))

  function scrollByPage(dir: 1 | -1) {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" })
  }

  return (
    <div className="group/row">
      <div className="mb-2 flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenLookalike}
          className="min-w-0 flex-1 truncate text-left"
        >
          <span className="text-sm font-semibold">{c.lookalike}</span>
          <span className="text-muted-foreground ml-2 hidden text-xs sm:inline">
            {c.similarTo} {seed.name}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onSetRowSelected(cards, !rowAllSelected)}
          className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1.5 text-xs"
        >
          <Checkbox checked={rowAllSelected} className="pointer-events-none" />
          <span className="hidden sm:inline">{c.rowSelectAll}</span>
        </button>
        <button
          type="button"
          onClick={onOpenLookalike}
          className="text-muted-foreground hover:text-foreground inline-flex shrink-0 items-center gap-1 text-xs font-medium"
        >
          <SlidersHorizontal className="size-3.5" />
          <span className="hidden sm:inline">{c.editFilters}</span>
        </button>
        <button
          type="button"
          onClick={onOpenLookalike}
          className="text-muted-foreground hover:text-foreground inline-flex shrink-0 items-center gap-1 text-xs font-medium"
        >
          {c.viewAll}
          <ArrowRight className="size-3.5" />
        </button>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1"
        >
          {entity === "companies"
            ? (cards as AiCompany[]).map((co) => (
                <CompanyPosterCard
                  key={co.id}
                  co={co}
                  selected={selected.has(co.id)}
                  onToggle={() => onToggleRecord(co)}
                />
              ))
            : (cards as AiLead[]).map((l) => (
                <LeadPosterCard
                  key={l.id}
                  l={l}
                  selected={selected.has(l.id)}
                  onToggle={() => onToggleRecord(l)}
                />
              ))}
        </div>

        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByPage(-1)}
          className="bg-background/95 absolute top-1/2 -left-3 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border opacity-0 shadow-md transition-opacity group-hover/row:flex group-hover/row:opacity-100 hover:bg-muted sm:flex"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByPage(1)}
          className="bg-background/95 absolute top-1/2 -right-3 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border opacity-0 shadow-md transition-opacity group-hover/row:flex group-hover/row:opacity-100 hover:bg-muted sm:flex"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
// The three literal "signals" the Signals page surfaces as editable rows —
// each backed by a real signal tag (see SIGNAL_OPTIONS in mock-ai-search),
// with a friendlier display name where it differs from the underlying tag.
const SIGNAL_ROW_DEFS: {
  tag: string
  title: { en: string; es: string; it: string; fr: string; de: string; pt: string; pt_BR: string }
  description: { en: string; es: string; it: string; fr: string; de: string; pt: string; pt_BR: string }
}[] = [
  {
    tag: "Recently funded",
    title: {
      en: "Recently funded",
      es: "Financiación reciente",
      it: "Finanziato di recente",
      fr: "Financement récent",
      de: "Kürzlich finanziert",
      pt: "Financiamento recente",
      pt_BR: "Financiamento recente",
    },
    description: {
      en: "Companies that recently raised a funding round.",
      es: "Empresas que acaban de levantar financiación.",
      it: "Aziende che hanno raccolto un round di finanziamento di recente.",
      fr: "Entreprises ayant récemment levé des fonds.",
      de: "Unternehmen, die kürzlich eine Finanzierungsrunde abgeschlossen haben.",
      pt: "Empresas que angariaram financiamento recentemente.",
      pt_BR: "Empresas que levantaram uma rodada de investimento recentemente.",
    },
  },
  {
    tag: "Hiring sales",
    title: {
      en: "Hiring on LinkedIn",
      es: "Contratando en LinkedIn",
      it: "Assunzioni su LinkedIn",
      fr: "Recrutement sur LinkedIn",
      de: "Einstellungen auf LinkedIn",
      pt: "A contratar no LinkedIn",
      pt_BR: "Contratando no LinkedIn",
    },
    description: {
      en: "Companies actively posting sales roles on LinkedIn.",
      es: "Empresas publicando activamente roles de ventas en LinkedIn.",
      it: "Aziende che pubblicano attivamente posizioni di vendita su LinkedIn.",
      fr: "Entreprises publiant activement des postes commerciaux sur LinkedIn.",
      de: "Unternehmen, die aktiv Vertriebsstellen auf LinkedIn ausschreiben.",
      pt: "Empresas a publicar ativamente vagas de vendas no LinkedIn.",
      pt_BR: "Empresas publicando ativamente vagas de vendas no LinkedIn.",
    },
  },
  {
    tag: "New exec hire",
    title: {
      en: "New exec hire",
      es: "Nueva contratación ejecutiva",
      it: "Nuova assunzione executive",
      fr: "Nouvelle recrue dirigeante",
      de: "Neue Führungskraft eingestellt",
      pt: "Nova contratação executiva",
      pt_BR: "Nova contratação executiva",
    },
    description: {
      en: "Companies that just hired a new senior leader.",
      es: "Empresas que acaban de contratar a un nuevo líder.",
      it: "Aziende che hanno appena assunto un nuovo leader senior.",
      fr: "Entreprises qui viennent d'embaucher un nouveau dirigeant senior.",
      de: "Unternehmen, die gerade eine neue Führungskraft eingestellt haben.",
      pt: "Empresas que acabaram de contratar um novo líder sénior.",
      pt_BR: "Empresas que acabaram de contratar um novo líder sênior.",
    },
  },
]

// A signal-based carousel row (Recently funded / Hiring on LinkedIn / New
// exec hire): starts from a fixed signal tag, but the row's own Edit button
// opens the same filter catalog used on the full results page — scoped to
// just this row's query — so the user can layer on extra criteria without
// losing the signal that defines the row.
function SignalSuggestionRow({
  def,
  entity,
  locale,
  onRunQuery,
  selected,
  onToggleRecord,
  onSetRowSelected,
  c,
}: {
  def: (typeof SIGNAL_ROW_DEFS)[number]
  entity: AiEntity
  locale: Locale
  onRunQuery: (query: AiQuery, entity: AiEntity, label: string) => void
  selected: Map<string, AiLead | AiCompany>
  onToggleRecord: (record: AiLead | AiCompany) => void
  onSetRowSelected: (records: (AiLead | AiCompany)[], on: boolean) => void
  c: Copy
}) {
  const baseQuery = React.useMemo(
    (): AiQuery => ({ ...EMPTY_QUERY, signals: [def.tag] }),
    [def.tag]
  )
  const [query, setQuery] = React.useState<AiQuery>(baseQuery)
  const [editOpen, setEditOpen] = React.useState(false)

  function addFilter(group: keyof AiQuery, value: string) {
    setQuery((prev) => {
      const arr = prev[group] as string[]
      if (arr.includes(value)) return prev
      return { ...prev, [group]: [...arr, value] }
    })
  }
  function removeFilter(group: keyof AiQuery, value: string) {
    setQuery((prev) => ({
      ...prev,
      [group]: (prev[group] as string[]).filter((v) => v !== value),
    }))
  }
  function clearFilterGroup(group: keyof AiQuery) {
    setQuery((prev) => ({ ...prev, [group]: [] }))
  }

  const cards = React.useMemo(
    () =>
      entity === "companies"
        ? searchCompanies(query).slice(0, 12)
        : searchLeads(query).slice(0, 12),
    [entity, query]
  )
  const scrollRef = React.useRef<HTMLDivElement>(null)

  if (cards.length === 0) return null

  const rowAllSelected = cards.every((r) => selected.has(r.id))
  const title = def.title[locale]
  const description = def.description[locale]

  function scrollByPage(dir: 1 | -1) {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" })
  }

  return (
    <div className="group/row">
      <div className="mb-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onRunQuery(query, entity, title)}
          className="min-w-0 flex-1 truncate text-left"
        >
          <span className="text-sm font-semibold">{title}</span>
          <span className="text-muted-foreground ml-2 hidden text-xs sm:inline">
            {description}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onSetRowSelected(cards, !rowAllSelected)}
          className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1.5 text-xs"
        >
          <Checkbox checked={rowAllSelected} className="pointer-events-none" />
          <span className="hidden sm:inline">{c.rowSelectAll}</span>
        </button>
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="text-muted-foreground hover:text-foreground inline-flex shrink-0 items-center gap-1 text-xs font-medium"
        >
          <SlidersHorizontal className="size-3.5" />
          <span className="hidden sm:inline">{c.editFilters}</span>
        </button>
        <button
          type="button"
          onClick={() => onRunQuery(query, entity, title)}
          className="text-muted-foreground hover:text-foreground inline-flex shrink-0 items-center gap-1 text-xs font-medium"
        >
          {c.viewAll}
          <ArrowRight className="size-3.5" />
        </button>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1"
        >
          {entity === "companies"
            ? (cards as AiCompany[]).map((co) => (
                <CompanyPosterCard
                  key={co.id}
                  co={co}
                  selected={selected.has(co.id)}
                  onToggle={() => onToggleRecord(co)}
                />
              ))
            : (cards as AiLead[]).map((l) => (
                <LeadPosterCard
                  key={l.id}
                  l={l}
                  selected={selected.has(l.id)}
                  onToggle={() => onToggleRecord(l)}
                />
              ))}
        </div>

        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByPage(-1)}
          className="bg-background/95 absolute top-1/2 -left-3 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border opacity-0 shadow-md transition-opacity group-hover/row:flex group-hover/row:opacity-100 hover:bg-muted sm:flex"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByPage(1)}
          className="bg-background/95 absolute top-1/2 -right-3 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border opacity-0 shadow-md transition-opacity group-hover/row:flex group-hover/row:opacity-100 hover:bg-muted sm:flex"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <FilterModal
        open={editOpen}
        onOpenChange={setEditOpen}
        query={query}
        onAdd={addFilter}
        onRemove={removeFilter}
        onClear={() => setQuery(baseQuery)}
        onClearGroup={clearFilterGroup}
        c={c}
        linkedinOn={false}
        entity={entity}
        facetDefs={[]}
        onAddFacet={() => {}}
        onRemoveFacet={() => {}}
        onClearFacet={() => {}}
        locale={locale}
      />
    </div>
  )
}

function LeadPosterCard({
  l,
  selected,
  onToggle,
}: {
  l: AiLead
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "bg-card relative w-44 shrink-0 snap-start rounded-lg border p-3 text-left transition-colors",
        selected ? "border-primary ring-primary/30 ring-2" : "hover:border-primary/40"
      )}
    >
      <Checkbox
        checked={selected}
        className="pointer-events-none bg-background absolute top-2 right-2"
      />
      <p className="truncate pr-6 text-sm font-medium">
        {l.firstName} {l.lastName}
      </p>
      <p className="text-muted-foreground truncate text-xs">{l.title}</p>
      <p className="text-muted-foreground truncate text-xs">{l.company}</p>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span className="bg-chart-1/15 text-chart-1 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
          {l.fit}%
        </span>
        <span className="text-muted-foreground truncate text-[11px]">{l.location}</span>
      </div>
      <p className="text-muted-foreground mt-1 truncate text-[11px]">
        {l.industry} · {l.region} · {l.headcount}
      </p>
    </button>
  )
}

function CompanyPosterCard({
  co,
  selected,
  onToggle,
}: {
  co: AiCompany
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "bg-card relative w-44 shrink-0 snap-start rounded-lg border p-3 text-left transition-colors",
        selected ? "border-primary ring-primary/30 ring-2" : "hover:border-primary/40"
      )}
    >
      <Checkbox
        checked={selected}
        className="pointer-events-none bg-background absolute top-2 right-2"
      />
      <p className="truncate pr-6 text-sm font-medium">{co.name}</p>
      <p className="text-muted-foreground truncate text-xs">{co.domain}</p>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span className="bg-chart-1/15 text-chart-1 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
          {co.fit}%
        </span>
        <span className="text-muted-foreground truncate text-[11px]">{co.location}</span>
      </div>
      <p className="text-muted-foreground mt-1 truncate text-[11px]">
        {co.industry} · {co.region} · {co.headcount}
      </p>
    </button>
  )
}

// Shown until the user defines a search — matching runs a real (costly)
// query, so the page holds off rendering the filter sidebar or any results.
// Saved searches are a separate entry point: reopen one directly, no need to
// run anything first.
function SearchIdleState({
  c,
  entity,
  urlsMode,
  onSuggestion,
}: {
  c: Copy
  entity: AiEntity
  urlsMode: boolean
  onSuggestion: (prompt: string) => void
}) {
  const suggestions =
    entity === "companies" ? c.idleSuggestionsCompanies : c.idleSuggestionsPeople
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-16 text-center">
      <img src={kaiUrl} alt="" className="size-16" />
      <p className="text-lg font-semibold">{c.idleTitle}</p>
      <p className="text-muted-foreground max-w-md text-sm">{c.idleDesc}</p>
      {/* One-click curated prompts — swapped per entity tab; URL mode has its
          own pill input, so suggestions would mislead there. */}
      {!urlsMode && (
        <>
          <p className="text-muted-foreground mt-3 text-xs font-medium tracking-wide uppercase">
            {c.idleSuggestedTitle}
          </p>
          <div className="flex max-w-2xl flex-wrap justify-center gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSuggestion(s)}
                className="border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function EntityTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[5px] px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}

// A stylized, read-only map preview for local-business sources (Google Maps
// today) — confirms the searched location with a pin and a soft circle
// standing in for the matching radius/region. No live map API is wired up in
// this prototype, so the "map" is a decorative CSS/SVG backdrop rather than a
// real tile layer; it only appears once the user has typed a Location value.
function LocationMapPreview({ locations, c }: { locations: string[]; c: Copy }) {
  const label = locations.join(" · ")
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-emerald-50 dark:bg-emerald-950/30">
        {/* Decorative street-grid backdrop. */}
        <svg
          className="absolute inset-0 size-full opacity-40"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="map-grid" width="34" height="34" patternUnits="userSpaceOnUse">
              <path
                d="M 34 0 L 0 0 0 34"
                fill="none"
                className="stroke-emerald-700/25 dark:stroke-emerald-300/20"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#map-grid)" />
        </svg>
        {/* Radius / region overlay, centered on the pin. */}
        <span className="border-emerald-600/50 bg-emerald-500/10 absolute size-28 rounded-full border-2 border-dashed" />
        <span className="border-emerald-600/25 bg-emerald-500/5 absolute size-40 rounded-full border" />
        <span className="bg-emerald-600 relative flex size-8 items-center justify-center rounded-full text-white shadow-md">
          <MapPin className="size-4" />
        </span>
        <span className="bg-background/90 text-foreground absolute bottom-2 left-2 inline-flex max-w-[85%] items-center gap-1.5 truncate rounded-full px-2.5 py-1 text-xs font-medium shadow-sm">
          <MapPin className="text-emerald-600 size-3 shrink-0" />
          <span className="truncate">{label}</span>
        </span>
      </div>
      <p className="text-muted-foreground px-3 py-2 text-xs">{c.mapAreaHint}</p>
    </Card>
  )
}

function ThinkingPanel({ c }: { c: Copy }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-5 py-16">
      <div className="relative flex size-14 items-center justify-center">
        <span className="bg-primary/20 absolute inline-flex size-full animate-ping rounded-full" />
        <span className="bg-primary/10 relative flex size-14 items-center justify-center rounded-full">
          <Sparkles className="text-primary size-6 animate-pulse" />
        </span>
      </div>
      <div className="space-y-1 text-center">
        <p className="font-medium">{c.thinkingTitle}</p>
        <p className="text-muted-foreground text-sm">{c.thinkingSub}</p>
      </div>
      <div className="w-full max-w-sm space-y-2 px-6">
        {c.thinkingSteps.map((step, i) => (
          <div
            key={step}
            className="text-muted-foreground flex items-center gap-2 text-sm"
            style={{ animation: `pulse 1.4s ease-in-out ${i * 0.3}s infinite` }}
          >
            <Loader2 className="text-primary size-3.5 animate-spin" />
            {step}
          </div>
        ))}
      </div>
    </Card>
  )
}

// Facets that only apply when the LinkedIn data source is on — styled in the
// LinkedIn blue so it's obvious where they come from.
const LINKEDIN_KEYS = new Set<keyof AiQuery>([
  "linkedin",
  "connections",
  "profileLanguages",
  "serviceCategories",
  "schools",
  "currentCompanies",
  "pastCompanies",
  "connectionsOf",
  "followersOf",
  "jobListings",
])

// Filters live in a roomy two-pane modal (same shape as Customize columns):
// active filters on the left, the full searchable catalog on the right.
function FilterModal({
  open,
  onOpenChange,
  query,
  onAdd,
  onRemove,
  onClear,
  onClearGroup,
  c,
  linkedinOn,
  minimal,
  entity,
  facetDefs,
  onAddFacet,
  onRemoveFacet,
  onClearFacet,
  locale,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  query: AiQuery
  onAdd: (group: keyof AiQuery, value: string) => void
  onRemove: (group: keyof AiQuery, value: string) => void
  onClear: () => void
  onClearGroup: (group: keyof AiQuery) => void
  c: Copy
  linkedinOn: boolean
  minimal?: boolean
  entity: AiEntity
  facetDefs: FacetDef[]
  onAddFacet: (id: string, value: string) => void
  onRemoveFacet: (id: string, value: string) => void
  onClearFacet: (id: string) => void
  locale: Locale
}) {
  const [text, setText] = React.useState("")
  const q = text.trim().toLowerCase()

  const groups = minimal
    ? []
    : SEARCH_FILTER_GROUPS.filter(
        (g) => !(g.linkedinOnly && !linkedinOn) && !(g.scope && g.scope !== entity)
      )

  // Typed groups + facets mapped onto the shared sectioned catalog.
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

  const active = groups
    .map((g) => ({ g, values: query[g.key] as string[] }))
    .filter((x) => x.values.length > 0)
  const activeFacets = facetDefs
    .map((f) => ({ f, values: query.facets[f.id] ?? [] }))
    .filter((x) => x.values.length > 0)
  const activeCount =
    active.reduce((n, x) => n + x.values.length, 0) +
    activeFacets.reduce((n, x) => n + x.values.length, 0)

  const allValues = groups.flatMap((g) => g.options)
  const exact = !q || allValues.some((v) => v.toLowerCase() === q)
  const anyVisible = groups.some((g) =>
    g.options.some((v) => !q || v.toLowerCase().includes(q))
  )
  const anyFacetVisible = facetDefs.some(
    (f) =>
      f.label[locale].toLowerCase().includes(q) ||
      f.options.some((v) => v.toLowerCase().includes(q))
  )

  // Describe filters in natural language — interpret and apply them all.
  function askAi(prompt: string) {
    const iq = interpretPrompt(prompt).query
    ;(Object.keys(iq) as (keyof AiQuery)[]).forEach((k) => {
      if (k === "keywords") return
      ;(iq[k] as string[]).forEach((v) => onAdd(k, v))
    })
    setText("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b p-4">
          <DialogTitle>{c.filtersTitle}</DialogTitle>
          <DialogDescription>{c.filtersDesc(activeCount)}</DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[60vh] grid-cols-1 divide-y overflow-hidden sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {/* Active filters */}
          <div className="flex max-h-[40vh] flex-col overflow-hidden sm:max-h-[60vh]">
            <p className="text-muted-foreground bg-muted/30 px-4 py-2 text-xs font-medium tracking-wide uppercase">
              {c.activeFilters}
            </p>
            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              {active.length === 0 && activeFacets.length === 0 ? (
                <p className="text-muted-foreground px-1 py-2 text-sm">
                  {c.noActiveFilters}
                </p>
              ) : (
                <>
                  {active.map(({ g, values }) => (
                    <div key={g.key}>
                      <p className="text-muted-foreground mb-1 flex items-center gap-1 text-[11px] font-medium tracking-wide uppercase">
                        {LINKEDIN_KEYS.has(g.key) && (
                          <LinkedinIcon className="size-3 text-[#0a66c2]" />
                        )}
                        {g.label[locale]}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {values.map((value) => {
                          const neg = isExcluded(value)
                          const chipLabel = neg
                            ? c.notChip(baseValue(value))
                            : value
                          return (
                            <span
                              key={value}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full py-1 pr-1 pl-2.5 text-xs font-medium",
                                neg
                                  ? "bg-destructive/10 text-destructive"
                                  : LINKEDIN_KEYS.has(g.key)
                                    ? "bg-[#0a66c2]/10 text-[#0a66c2]"
                                    : "bg-primary/10 text-primary"
                              )}
                            >
                              {chipLabel}
                              <button
                                type="button"
                                aria-label={`Remove ${chipLabel}`}
                                onClick={() => onRemove(g.key, value)}
                                className="rounded-full p-0.5 hover:bg-black/10"
                              >
                                <X className="size-3" />
                              </button>
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  {activeFacets.map(({ f, values }) => (
                    <div key={f.id}>
                      <p className="text-muted-foreground mb-1 text-[11px] font-medium tracking-wide uppercase">
                        {f.label[locale]}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {values.map((value) => {
                          const neg = isExcluded(value)
                          const chipLabel = neg
                            ? c.notChip(baseValue(value))
                            : value
                          return (
                            <span
                              key={value}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full py-1 pr-1 pl-2.5 text-xs font-medium",
                                neg
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-primary/10 text-primary"
                              )}
                            >
                              {chipLabel}
                              <button
                                type="button"
                                aria-label={`Remove ${chipLabel}`}
                                onClick={() => onRemoveFacet(f.id, value)}
                                className="rounded-full p-0.5 hover:bg-black/10"
                              >
                                <X className="size-3" />
                              </button>
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Catalog */}
          <div className="flex max-h-[40vh] flex-col overflow-hidden sm:max-h-[60vh]">
            <div className="bg-muted/30 px-3 py-2">
              <div className="relative">
                <Sparkles className="text-primary pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && text.trim() && !exact) {
                      e.preventDefault()
                      askAi(text.trim())
                    }
                  }}
                  placeholder={c.filterTypeahead}
                  className="h-8 pl-8 text-sm"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {text.trim() && !exact && (
                <div className="mb-1">
                  <button
                    type="button"
                    onClick={() => askAi(text.trim())}
                    className="hover:bg-muted flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                  >
                    <Sparkles className="text-primary size-4 shrink-0" />
                    <span className="truncate">{c.askAiFilter(text.trim())}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAdd("titles", text.trim())
                      setText("")
                    }}
                    className="hover:bg-muted flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                  >
                    <Plus className="text-muted-foreground size-4 shrink-0" />
                    <span className="truncate">{c.addCustom(text.trim())}</span>
                  </button>
                </div>
              )}
              {/* Shared sectioned catalog — typed groups + per-database facets
                  with per-value Include | Exclude and per-filter Clear. */}
              <FilterCatalog
                filters={catalogFilters}
                selected={(id) =>
                  groupKeys.has(id)
                    ? (query[id as keyof AiQuery] as string[])
                    : (query.facets[id] ?? [])
                }
                onInclude={(id, v) =>
                  groupKeys.has(id)
                    ? onAdd(id as keyof AiQuery, v)
                    : onAddFacet(id, v)
                }
                onExclude={(id, v) =>
                  groupKeys.has(id)
                    ? onAdd(id as keyof AiQuery, excludeValue(v))
                    : onAddFacet(id, excludeValue(v))
                }
                onRemove={(id, v) =>
                  groupKeys.has(id)
                    ? onRemove(id as keyof AiQuery, v)
                    : onRemoveFacet(id, v)
                }
                onClear={(id) =>
                  groupKeys.has(id)
                    ? onClearGroup(id as keyof AiQuery)
                    : onClearFacet(id)
                }
                locale={locale}
                query={text}
              />
              {q && !anyVisible && !anyFacetVisible && exact && (
                <p className="text-muted-foreground p-3 text-sm">
                  {c.filtersNoMatch}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between border-t p-3 sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={activeCount === 0}
          >
            <X className="size-4" />
            {c.clearAll}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {c.done}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// "Build a list": name it, pick people vs companies, then choose how to fill it.
function BuildListDialog({
  open,
  onOpenChange,
  c,
  onChoose,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  c: Copy
  onChoose: (
    name: string,
    type: AiEntity,
    source: BuildSource,
    perCompanyCap: number | null,
    assigneeId: string | undefined
  ) => void
}) {
  const [step, setStep] = React.useState<"setup" | "source">("setup")
  const [name, setName] = React.useState("")
  const [type, setType] = React.useState<AiEntity>("people")
  const [perCompanyCap, setPerCompanyCap] = React.useState<number | null>(null)
  const [assigneeId, setAssigneeId] = React.useState<string | undefined>(
    undefined
  )
  const [wasOpen, setWasOpen] = React.useState(false)

  // Reset every time the dialog opens.
  if (open && !wasOpen) {
    setWasOpen(true)
    setStep("setup")
    setName("")
    setType("people")
    setPerCompanyCap(null)
    setAssigneeId(undefined)
  }
  if (!open && wasOpen) setWasOpen(false)

  const sourceGroups: {
    label: string
    items: {
      key: BuildSource
      icon: React.ComponentType<{ className?: string }>
      label: string
    }[]
  }[] = [
    {
      label: c.srcGroupAi,
      items: [
        type === "people"
          ? { key: "find", icon: Users, label: c.srcFindPeople }
          : { key: "find", icon: Building2, label: c.srcFindCompanies },
        { key: "lookalike", icon: ScanSearch, label: c.srcLookalike },
      ],
    },
    {
      label: c.srcGroupLinkedin,
      items: [
        { key: "li-search", icon: LinkedinIcon, label: c.srcLiSearch },
        { key: "li-post", icon: LinkedinIcon, label: c.srcLiPost },
        { key: "li-event", icon: LinkedinIcon, label: c.srcLiEvent },
        { key: "li-poll", icon: LinkedinIcon, label: c.srcLiPoll },
        { key: "li-connections", icon: LinkedinIcon, label: c.srcLiConnections },
        { key: "li-followers", icon: LinkedinIcon, label: c.srcLiFollowers },
      ],
    },
    {
      label: c.srcGroupCrunchbase,
      items: [
        { key: "crunchbase", icon: Database, label: c.srcCb },
        { key: "crunchbase-investors", icon: Database, label: c.srcCbInvestors },
      ],
    },
    {
      label: c.srcGroupImportCat,
      items: [
        { key: "import", icon: Upload, label: c.srcImport },
        { key: "manual", icon: Plus, label: c.srcManual },
        { key: "hubspot", icon: Plug, label: c.srcHubspot },
        { key: "hubspot-list", icon: Plug, label: c.srcHubspotList },
      ],
    },
  ]
  const groups = sourceGroups
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (it) => type === "people" || !PEOPLE_ONLY_SOURCES.includes(it.key)
      ),
    }))
    .filter((g) => g.items.length > 0)

  const buildSteps = [c.buildStepSetup, c.buildStepSource]
  const stepIndex = step === "setup" ? 0 : 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SlidersHorizontal className="text-primary size-5" />
            {c.buildTitle}
          </DialogTitle>
          <DialogDescription>
            {step === "setup" ? c.buildType : c.buildPopulate}
          </DialogDescription>

          {/* Stepper */}
          <ol className="mt-3 flex items-center gap-1.5">
            {buildSteps.map((label, i) => (
              <li key={label} className="flex flex-1 items-center gap-1.5">
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium",
                    i < stepIndex && "bg-primary text-primary-foreground",
                    i === stepIndex && "border-primary text-primary border-2",
                    i > stepIndex && "bg-muted text-muted-foreground"
                  )}
                >
                  {i < stepIndex ? <Check className="size-3" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:inline",
                    i === stepIndex ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
                {i < buildSteps.length - 1 && (
                  <span className="bg-border h-px flex-1" />
                )}
              </li>
            ))}
          </ol>
        </DialogHeader>

        {step === "setup" ? (
          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label htmlFor="build-list-name">{c.buildName}</Label>
              <Input
                id="build-list-name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={c.buildNamePlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label>{c.buildType}</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: "people" as AiEntity, icon: Users, label: c.buildPeople, desc: c.buildPeopleDesc },
                  { v: "companies" as AiEntity, icon: Building2, label: c.buildCompanies, desc: c.buildCompaniesDesc },
                ].map((t) => {
                  const Icon = t.icon
                  const isActive = type === t.v
                  return (
                    <button
                      key={t.v}
                      type="button"
                      onClick={() => setType(t.v)}
                      className={cn(
                        "flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors",
                        isActive
                          ? "border-primary ring-primary/30 bg-primary/[0.04] ring-1"
                          : "hover:bg-muted/60"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-5",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span className="text-sm font-medium">{t.label}</span>
                      <span className="text-muted-foreground text-xs">{t.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            {type === "people" && (
              <div className="space-y-2">
                <Label>{c.capLabel}</Label>
                <PerCompanyCap
                  value={perCompanyCap}
                  onChange={setPerCompanyCap}
                  offLabel={c.capNoLimit}
                  ariaLabel={c.capLabel}
                />
              </div>
            )}
            {type === "people" && (
              <div className="space-y-2">
                <Label htmlFor="build-list-assignee">{c.buildAssign}</Label>
                <AssigneePicker
                  id="build-list-assignee"
                  value={assigneeId}
                  onChange={setAssigneeId}
                  unassignedLabel={c.buildUnassigned}
                />
                <p className="text-muted-foreground text-xs">
                  {c.buildAssignHint}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="max-h-[55vh] space-y-3 overflow-y-auto py-1">
            {groups.map((g) => (
              <div key={g.label}>
                <p className="text-muted-foreground mb-1 px-1 text-[11px] font-medium tracking-wide uppercase">
                  {g.label}
                </p>
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {g.items.map((s) => {
                    const Icon = s.icon
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() =>
                          onChoose(
                            name,
                            type,
                            s.key,
                            type === "people" ? perCompanyCap : null,
                            type === "people" ? assigneeId : undefined
                          )
                        }
                        className="hover:border-primary/40 hover:bg-muted/40 flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors"
                      >
                        <span className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-md">
                          <Icon className="text-primary size-3.5" />
                        </span>
                        <span className="text-sm font-medium">{s.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          {step === "source" ? (
            <Button variant="ghost" onClick={() => setStep("setup")}>
              {c.buildBack}
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {c.cancel}
            </Button>
          )}
          {step === "setup" && (
            <Button variant="volt" onClick={() => setStep("source")}>
              {c.buildNext}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// People search only: keep at most `cap` contacts per company, preserving the
// incoming (sorted) order so the strongest matches per company survive.
function capPerCompany(leads: AiLead[], cap: number | null): AiLead[] {
  if (!cap || cap <= 0) return leads
  const counts = new Map<string, number>()
  const out: AiLead[] = []
  for (const lead of leads) {
    const key = lead.company || lead.companyDomain || lead.id
    const n = counts.get(key) ?? 0
    if (n >= cap) continue
    counts.set(key, n + 1)
    out.push(lead)
  }
  return out
}


