import * as React from "react"
import { useNavigate, useSearchParams, useLocation } from "react-router-dom"
import { toast } from "sonner"
import {
  Sparkles,
  Search as SearchIcon,
  Plus,
  X,
  Loader2,
  Bookmark,
  Trash2,
  Building2,
  Users,
  ArrowRight,
  Coins,
  ListPlus,
  CheckCircle2,
  CircleDashed,
  ScanSearch,
  ArrowDownUp,
  MoreHorizontal,
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
} from "lucide-react"
import { LinkedinIcon } from "@/components/icons/BrandIcons"

import { Page, PageHeading } from "@/components/layout/Page"
import { useLocale, type Locale } from "@/lib/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { SAVE_COST } from "@/lib/enrichment"
import {
  interpretPrompt,
  searchLeads,
  searchCompanies,
  lookalikeLeads,
  lookalikeCompanies,
  LOOKALIKE_SEEDS,
  estimatedTotal,
  queryTitle,
  savedSearchStore,
  useSavedSearches,
  REGION_OPTIONS,
  INDUSTRY_OPTIONS,
  sortLeads,
  sortCompanies,
  type SortKey,
  EMPTY_QUERY,
  type AiEntity,
  type AiQuery,
  type AiLead,
  type AiCompany,
  type LookalikeSeed,
} from "@/lib/mock-ai-search"
import {
  listStore,
  prospectStore,
  accountStore,
  useLists,
  useBlacklistedKeys,
} from "@/lib/store"
import { getProspect } from "@/lib/mock-data"
import { libraryQueries, type LibraryQuery } from "@/lib/mock-library"
import { facetsForDb, facetSection, type FacetDef, type FacetDb } from "@/lib/search-facets"
import { SEARCH_FILTER_GROUPS } from "@/lib/search-filter-groups"
import { baseValue, excludeValue, isExcluded } from "@/lib/filter-polarity"
import {
  FilterCatalog,
  type CatalogFilterDef,
} from "@/components/common/FilterCatalog"
import { downloadCsv } from "@/lib/csv"
import { BulkAddDialog } from "@/components/common/BulkAddDialog"
import type { AccountTier } from "@/lib/types"

const COPY = {
  en: {
    title: "Signals",
    description:
      "AI-matched prospects and companies, scored and ready to search, save, or add to a campaign.",
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
    inputPlaceholder: "e.g. VPs of Sales at European SaaS that just raised…",
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
    savedToast: "Search saved with its prompt history",
    loadedToast: "Saved search loaded",
    removedSaved: "Saved search removed",
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
    srTitle: "Search",
    heroTitle: "Describe your ideal customer",
    heroSubtitle: "Search across 250M+ professionals and companies — or pick a quick start.",
    heroPlaceholder: "e.g. Heads of RevOps at Series B SaaS companies in EMEA…",
    searchBtn: "Search",
    searchWithFilters: "Search with filters",
    clearQuery: "Clear search",
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
    noResults: "No results yet — try a prompt or adjust your filters.",
    addFilter: "Add filter",
    filterTypeahead: "Search filters or describe them with AI…",
    addCustom: (v: string) => `Add "${v}"`,
    askAiFilter: (v: string) => `Ask AI: "${v}"`,
    viewAllFilters: "View all filters",
    more: "More actions",
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
    startTypeTitle: "Type your query",
    startTypeDesc: "Describe who you're looking for — a title, industry, or location.",
    filtersAfterSearch: "Filters unlock once you run a search.",
    done: "Done",
    columnsBtn: "Columns",
    columnsTitle: "Customize columns",
    columnsDesc: (n: number, total: number) =>
      `${n} of ${total} columns shown. Toggle fields to show or hide.`,
    alwaysShown: "Always shown",
    optionalCols: "Optional columns",
    alwaysTag: "Always",
    buildTitle: "Build a list",
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
    buildPopulate: "How do you want to populate it?",
    buildNext: "Next",
    buildBack: "Back",
    selectPage: "Select page",
    deselectPage: "Deselect page",
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
    title: "Señales",
    description:
      "Prospectos y empresas emparejados por IA, puntuados y listos para buscar, guardar o añadir a una campaña.",
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
    inputPlaceholder: "p. ej. VPs de Ventas en SaaS europeo que acaban de levantar…",
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
    savedToast: "Búsqueda guardada con su historial de prompts",
    loadedToast: "Búsqueda guardada cargada",
    removedSaved: "Búsqueda guardada eliminada",
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
    srTitle: "Buscar",
    heroTitle: "Describe tu cliente ideal",
    heroSubtitle: "Busca entre más de 250M de profesionales y empresas — o elige un inicio rápido.",
    heroPlaceholder: "p. ej. Heads de RevOps en SaaS Serie B en EMEA…",
    searchBtn: "Buscar",
    searchWithFilters: "Buscar con filtros",
    clearQuery: "Borrar búsqueda",
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
    noResults: "Aún no hay resultados — prueba un prompt o ajusta los filtros.",
    addFilter: "Añadir filtro",
    filterTypeahead: "Busca filtros o descríbelos con IA…",
    addCustom: (v: string) => `Añadir "${v}"`,
    askAiFilter: (v: string) => `Pregunta a la IA: "${v}"`,
    viewAllFilters: "Ver todos los filtros",
    more: "Más acciones",
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
    startTypeTitle: "Escribe tu consulta",
    startTypeDesc: "Describe a quién buscas — un cargo, sector o ubicación.",
    filtersAfterSearch: "Los filtros se activan al ejecutar una búsqueda.",
    done: "Listo",
    columnsBtn: "Columnas",
    columnsTitle: "Personalizar columnas",
    columnsDesc: (n: number, total: number) =>
      `${n} de ${total} columnas visibles. Activa o desactiva campos.`,
    alwaysShown: "Siempre visibles",
    optionalCols: "Columnas opcionales",
    alwaysTag: "Fija",
    buildTitle: "Crear una lista",
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
    buildPopulate: "¿Cómo quieres llenarla?",
    buildNext: "Siguiente",
    buildBack: "Atrás",
    selectPage: "Seleccionar página",
    deselectPage: "Deseleccionar página",
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
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

// Which database the search runs against. Replaces the old LinkedIn on/off toggle.
type DataSource =
  | "kombo"
  | "lookalike"
  | "linkedin"
  | "google_maps"
  | "tripadvisor"
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
  // "Search with filters" (Home hero + splash) skips the AI prompt and jumps
  // straight to the filterable results view via ?filters=1.
  const [filtersRequested] = React.useState(() => params.get("filters") === "1")
  // Lookalike is just a search: arrive here with a seed (from People/Companies
  // "Find lookalikes") and the page opens in lookalike mode, results and all.
  const incomingSeed =
    (location.state as { lookalikeSeed?: LookalikeSeed } | null)?.lookalikeSeed ??
    null
  const similarPrompt = incomingSeed ? `${c.similarTo} ${incomingSeed.name}` : ""
  const savedSearches = useSavedSearches()
  // Arrive from a workspace with a saved-search id and the page opens preloaded.
  const incomingSearchId =
    (location.state as { loadSearchId?: string } | null)?.loadSearchId ?? null
  const loadedSearch = incomingSearchId
    ? (savedSearches.find((s) => s.id === incomingSearchId) ?? null)
    : null

  const [entity, setEntity] = React.useState<AiEntity>(
    loadedSearch
      ? loadedSearch.entity
      : incomingSeed
        ? incomingSeed.kind === "company"
          ? "companies"
          : "people"
        : "people"
  )
  const [query, setQuery] = React.useState<AiQuery>(
    loadedSearch ? loadedSearch.query : { ...EMPTY_QUERY }
  )
  const [lastPrompt, setLastPrompt] = React.useState(
    loadedSearch ? loadedSearch.prompt : similarPrompt
  )
  // The search box starts empty (placeholder only) — unless we arrived with a
  // lookalike seed or a header prompt, or reopened a saved search.
  const [input, setInput] = React.useState(
    loadedSearch ? loadedSearch.prompt : similarPrompt || headerPrompt || ""
  )
  const [thinking, setThinking] = React.useState(Boolean(headerPrompt))
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [lookalikeOpen, setLookalikeOpen] = React.useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false)
  const [saveName, setSaveName] = React.useState("")
  const [filtersOpen, setFiltersOpen] = React.useState(false)
  const [columnsOpen, setColumnsOpen] = React.useState(false)
  const [buildOpen, setBuildOpen] = React.useState(false)
  const [bulkIds, setBulkIds] = React.useState<string[]>([])
  const [bulkListOpen, setBulkListOpen] = React.useState(false)
  const [seed, setSeed] = React.useState<LookalikeSeed | null>(incomingSeed)
  const [db, setDb] = React.useState<Exclude<DataSource, "lookalike">>("kombo")
  const [sortKey, setSortKey] = React.useState<SortKey>("fit")

  // The search page is "pristine" until something defines a search — a prompt,
  // a lookalike seed, an active filter, or an in-flight interpretation.
  // Pristine shows the empty state instead of the whole unfiltered pool.
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
  const [hideInList, setHideInList] = React.useState(false)
  // "Hide already in CRM": applies to both people and company results.
  const [hideInCrm, setHideInCrm] = React.useState(false)
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
      if (!text) return
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

  // "Build a list": route to the chosen population method. Search-style sources
  // don't pre-create an empty list; the rest create it and route accordingly.
  function buildList(
    name: string,
    type: AiEntity,
    src: BuildSource,
    perCompanyCap: number | null
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
    })
    toast.success(c.buildCreated(list.name))
    if (src === "hubspot" || src === "hubspot-list") {
      navigate("/integrations")
      return
    }
    navigate(`/lists/${list.id}`)
  }

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
    setBulkIds(ids)
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
      <PageHeading title={c.title} description={c.description} />
      <div className="space-y-3">
        {/* Prospect Search tabs — People vs Companies (always shown). */}
        <div className="bg-muted inline-flex rounded-md p-0.5">
          <EntityTab
            active={entity === "people"}
            onClick={() => {
              setEntity("people")
              setSeed(null)
              setSelected(new Set())
            }}
            icon={Users}
            label={c.people}
          />
          <EntityTab
            active={entity === "companies"}
            onClick={() => {
              setEntity("companies")
              setSeed(null)
              setSelected(new Set())
            }}
            icon={Building2}
            label={c.companies}
          />
        </div>

        {/* Search query bar — the prompt IS the query, no chat thread. */}
        <Card className="p-3">
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              runPrompt(input)
            }}
          >
            <div className="relative flex-1">
              <SearchIcon className="text-muted-foreground pointer-events-none absolute top-3 left-3 size-4" />
              <Textarea
                id="search-prompt"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    runPrompt(input)
                  }
                }}
                placeholder={c.inputPlaceholder}
                rows={2}
                aria-label={c.srTitle}
                className="max-h-40 min-h-12 resize-y pr-9 pl-9"
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
                  className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-2.5 right-2.5 flex size-6 items-center justify-center rounded-md transition-colors"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              variant="volt"
              disabled={!input.trim() || thinking}
            >
              {thinking ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <SearchIcon className="size-4" />
              )}
              <span className="hidden sm:inline">{c.searchBtn}</span>
            </Button>
            {/* Split button: primary Save action + a dropdown to reopen
                previously saved searches. */}
            <div className="inline-flex">
            <Button
              type="button"
              variant="outline"
              className="gap-1.5 rounded-r-none"
              onClick={openSaveDialog}
              disabled={shownCount === 0}
            >
              <Bookmark className="size-4" />
              <span className="hidden sm:inline">{c.save}</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="-ml-px rounded-l-none"
                  aria-label={c.saved}
                >
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="text-muted-foreground text-xs">
                  {c.saved}
                </DropdownMenuLabel>
                {savedSearches.length === 0 ? (
                  <p className="text-muted-foreground px-2 py-1.5 text-xs">
                    {c.noSaved}
                  </p>
                ) : (
                  savedSearches.map((s) => (
                    <div
                      key={s.id}
                      className="hover:bg-muted/60 flex items-center gap-2 rounded-sm px-2 py-1.5"
                    >
                      <button
                        type="button"
                        onClick={() => loadSearch(s.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-sm font-medium">{s.name}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          {s.entity === "people" ? c.people : c.companies} ·{" "}
                          {s.resultCount}
                        </p>
                      </button>
                      <button
                        type="button"
                        aria-label="Remove"
                        onClick={() => {
                          savedSearchStore.remove(s.id)
                          toast.success(c.removedSaved)
                        }}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </form>
        </Card>

        {/* Filters live in a persistent sidebar; results (or the home/empty
            state) fill the rest. People are looked up via API, so filtering
            only opens once a search has started. */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {searchStarted && (
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
          )}
          <div className="min-w-0 flex-1">
            {searchStarted ? (
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

              {/* Secondary actions: inline when there's room, collapsed into an
                  overflow menu only when the toolbar runs out of space. */}
              <Button
                variant="outline"
                size="sm"
                className="hidden lg:inline-flex"
                onClick={() => setLookalikeOpen(true)}
              >
                <ScanSearch className="size-4" />
                {c.lookalike}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hidden lg:inline-flex"
                onClick={openSaveDialog}
                disabled={shownCount === 0}
              >
                <Bookmark className="size-4" />
                {c.saveThis}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={c.more}
                    className="lg:hidden"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => setLookalikeOpen(true)}>
                    <ScanSearch className="size-4" />
                    {c.lookalike}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={openSaveDialog}
                    disabled={shownCount === 0}
                  >
                    <Bookmark className="size-4" />
                    {c.saveThis}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

          {/* Search-result actions — same set for plain search & lookalike. */}
          {selectedCount > 0 && (
            <div className="bg-background sticky bottom-4 z-20 flex flex-wrap items-center gap-1.5 rounded-xl border p-2 shadow-lg">
              <span className="px-2 text-sm font-medium tabular-nums">
                {c.selected(selectedCount)}
              </span>
              {/* Max per company — an action modifier (caps the selection),
                  not a search filter, so it lives with the actions. */}
              {entity === "people" && (
                <>
                  <span className="bg-border mx-1 h-5 w-px" />
                  <PerCompanyCap
                    value={perCompanyCap}
                    onChange={setMaxPerCompany}
                    label={c.capLabel}
                    offLabel={c.capNoLimit}
                    ariaLabel={c.capLabel}
                  />
                </>
              )}
              <span className="bg-border mx-1 h-5 w-px" />
              <Button variant="outline" size="sm" onClick={bulkAddToList}>
                <ListPlus className="size-4" />
                {c.bulkList}
              </Button>
              <Button variant="outline" size="sm" onClick={bulkExportSelected}>
                <Download className="size-4" />
                {c.bulkExport}
              </Button>
              <Button variant="outline" size="sm" onClick={bulkAddToCrm}>
                <Plug className="size-4" />
                {c.bulkCrm}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => setSelected(new Set())}
              >
                <X className="size-4" />
                {c.clearSel}
              </Button>
            </div>
          )}
            </>
          )}
        </div>
            ) : (
              <SearchEmptyState
                c={c}
                entity={entity}
                onRun={(prompt) => runPrompt(prompt, entity)}
                onAddToList={(ids) => {
                  setBulkIds(ids)
                  setBulkListOpen(true)
                }}
                onOpenLookalike={() => setLookalikeOpen(true)}
              />
            )}
          </div>
        </div>
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
  entity,
  onRun,
  onAddToList,
  onOpenLookalike,
}: {
  c: Copy
  entity: AiEntity
  onRun: (prompt: string) => void
  onAddToList: (ids: string[]) => void
  onOpenLookalike: () => void
}) {
  // LibraryQuery.entity is singular ("company"), AiEntity is plural
  // ("companies") — they describe the same thing but don't share a literal.
  const suggestions = React.useMemo(
    () =>
      libraryQueries.filter((qq) =>
        entity === "companies" ? qq.entity === "company" : qq.entity === "people"
      ),
    [entity]
  )

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

  if (suggestions.length === 0) {
    return (
      <div className="rounded-xl border p-5 text-center">
        <span className="bg-muted mx-auto flex size-10 items-center justify-center rounded-full">
          <SearchIcon className="text-muted-foreground size-5" />
        </span>
        <p className="mt-3 font-medium">{c.startTypeTitle}</p>
        <p className="text-muted-foreground mt-1 text-sm">{c.startTypeDesc}</p>
        <p className="text-muted-foreground/80 mt-1 text-xs">{c.filtersAfterSearch}</p>
      </div>
    )
  }

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

      {suggestions.map((s) => (
        <SuggestionRow
          key={s.id}
          suggestion={s}
          entity={entity}
          onRun={onRun}
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

// One Netflix-style carousel row: a suggested query's name/description (the
// whole header is clickable and runs that search with its filters + prompt
// pre-applied) plus a horizontally-scrolling sample of matching records.
// Cards outnumber what fits in view — the row overflows and scrolls via
// drag/wheel, with hover-reveal prev/next buttons for the carousel feel.
function SuggestionRow({
  suggestion,
  entity,
  onRun,
  selected,
  onToggleRecord,
  onSetRowSelected,
  c,
}: {
  suggestion: LibraryQuery
  entity: AiEntity
  onRun: (prompt: string) => void
  selected: Map<string, AiLead | AiCompany>
  onToggleRecord: (record: AiLead | AiCompany) => void
  onSetRowSelected: (records: (AiLead | AiCompany)[], on: boolean) => void
  c: Copy
}) {
  const { query } = React.useMemo(
    () => interpretPrompt(suggestion.prompt),
    [suggestion.prompt]
  )
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
          onClick={() => onRun(suggestion.prompt)}
          className="min-w-0 flex-1 truncate text-left"
        >
          <span className="text-sm font-semibold">{suggestion.name}</span>
          <span className="text-muted-foreground ml-2 hidden text-xs sm:inline">
            {suggestion.description}
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
          onClick={() => onRun(suggestion.prompt)}
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
    perCompanyCap: number | null
  ) => void
}) {
  const [step, setStep] = React.useState<"setup" | "source">("setup")
  const [name, setName] = React.useState("")
  const [type, setType] = React.useState<AiEntity>("people")
  const [perCompanyCap, setPerCompanyCap] = React.useState<number | null>(null)
  const [wasOpen, setWasOpen] = React.useState(false)

  // Reset every time the dialog opens.
  if (open && !wasOpen) {
    setWasOpen(true)
    setStep("setup")
    setName("")
    setType("people")
    setPerCompanyCap(null)
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
                            type === "people" ? perCompanyCap : null
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
            <Button variant="outline" onClick={() => setStep("setup")}>
              {c.buildBack}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
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


