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
  Megaphone,
  LayoutTemplate,
  Database,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Plug,
  Download,
  Send,
} from "lucide-react"
import { LinkedinIcon } from "@/components/icons/BrandIcons"

import { Page } from "@/components/layout/Page"
import { useLocale, type Locale } from "@/lib/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { DataTable, type TableSelection } from "@/components/common/DataTable"
import { ColumnManager } from "@/components/common/ColumnManager"
import {
  useColumnPrefs,
  type ColumnDef,
  type ColGroup,
} from "@/lib/table-columns"
import { cn } from "@/lib/utils"
import { initials, scoreTone } from "@/lib/format"
import { portraitFor } from "@/lib/avatars"
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
  CREDITS_PER_LEAD,
  EXAMPLE_PROMPTS_EN,
  EXAMPLE_PROMPTS_ES,
  SENIORITY_OPTIONS,
  REGION_OPTIONS,
  HEADCOUNT_OPTIONS,
  INDUSTRY_OPTIONS,
  SIGNAL_OPTIONS,
  TITLE_OPTIONS,
  DEPARTMENT_OPTIONS,
  TECH_OPTIONS,
  REVENUE_OPTIONS,
  INTENT_OPTIONS,
  FOUNDED_OPTIONS,
  GROWTH_OPTIONS,
  LINKEDIN_OPTIONS,
  CONNECTION_OPTIONS,
  PROFILE_LANGUAGE_OPTIONS,
  SERVICE_CATEGORY_OPTIONS,
  SCHOOL_OPTIONS,
  COMPANY_NAME_OPTIONS,
  PERSON_NAME_OPTIONS,
  JOB_LISTING_OPTIONS,
  sortLeads,
  sortCompanies,
  matchReasons,
  companyMatchReasons,
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
} from "@/lib/store"
import { libraryQueries } from "@/lib/mock-library"
import { facetsForDb, type FacetDef } from "@/lib/search-facets"
import { downloadCsv } from "@/lib/csv"
import { useNewCampaign } from "@/components/campaign/NewCampaignWizard"
import { BulkAddDialog } from "@/components/common/BulkAddDialog"
import type { AccountTier } from "@/lib/types"

const COPY = {
  en: {
    title: "AI Search",
    description:
      "Describe who you're looking for. Kai searches our database of people and companies — or applies AI to build a custom table you can save as a list and run as a campaign.",
    introTitle: "Prospect with a prompt",
    introDescription:
      "Ask in plain English or build an advanced query by hand. Kai returns a fit-scored table of people or companies you can refine, enrich, save as a dynamic list, and push into a campaign.",
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
    saved: "Saved searches",
    saveThis: "Save this search",
    noSaved: "No saved searches yet.",
    savedToast: "Search saved with its prompt history",
    loadedToast: "Saved search loaded",
    removedSaved: "Saved search removed",
    people: "People",
    companies: "Companies",
    resultsFor: "Results",
    estLeads: (n: number) => `Est. ${n.toLocaleString()} total`,
    perLead: `${CREDITS_PER_LEAD} credits / lead`,
    projected: (n: number) => `≈ ${n.toLocaleString()} credits`,
    getMore: "Get more leads",
    getMoreToast: "Expanding the search across the full database…",
    komboData: "Kombo data",
    komboHint: "Verified emails, mobiles, firmographics & intent — blended from our data network.",
    dbLabel: "Search in",
    dbKombo: "KomboAI",
    dbKomboDesc: "Our verified network of people & companies.",
    dbLookalike: "Lookalike",
    dbLookalikeDesc: "Find records similar to a person or company.",
    dbLinkedinDesc: "Search with LinkedIn network filters.",
    dbSwitched: (name: string) => `Now searching ${name}`,
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
    startHere: "Start here",
    crmSoon: "Your CRM · soon",
    searchBtn: "Search",
    clearQuery: "Clear search",
    spotlightsLabel: "Spotlights",
    matchLabel: "Matches",
    spotlights: ["Open to work", "Changed jobs", "Recently active", "Hiring", "High intent"],
    columns: "Columns",
    addToList: "Save as list",
    findPeople: "Find prospects",
    findPeopleToast: "Switched to people at these companies",
    quickStart: "Start here",
    qaImport: "Import data",
    qaImportDesc: "Import your existing list from CRM or CSV.",
    qaAudience: "Build a list",
    qaAudienceDesc: "Define and enrich targeted lists of people and companies.",
    qaCampaign: "Create a campaign",
    qaCampaignDesc: "Build and automate your outreach campaigns.",
    qaTemplate: "Start from template",
    qaTemplateDesc: "Choose from pre-built workflows to get started.",
    lookalike: "Lookalikes",
    lookalikeTitle: "Find lookalikes",
    lookalikeDesc:
      "Pick a person or company you already like — Kai finds records similar to that specific seed. Refine further with the sidebar filters.",
    pickSeed: "Pick a person or company",
    companySearch: "Search a company by name…",
    useCompany: (name: string) => `Use "${name}"`,
    seedPeople: "People & customers",
    seedCompanies: "Companies",
    findSimilar: "Find similar",
    similarTo: "Similar to",
    clearLookalike: "Clear lookalike",
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
    bulkCampaign: "Add to campaign",
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
    filtersNoMatch: "No filters match.",
    addToGroup: (label: string) => `Add ${label.toLowerCase()}…`,
    clearAll: "Clear all",
    aiSuggestions: "AI-powered search suggestions",
    startTypeTitle: "Type your query",
    startTypeDesc: "Describe who you're looking for — a title, industry, or location.",
    startFiltersTitle: "Use search filters",
    startFiltersDesc: "Refine your search with the filters on the left.",
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
    buildPeople: "People",
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
    pageRange: (from: number, to: number, total: number) =>
      `${from.toLocaleString()}–${to.toLocaleString()} of ${total.toLocaleString()}`,
    srcFindPeople: "Find people",
    srcFindPeopleDesc: "Search our database for matching prospects.",
    srcFindCompanies: "Find companies",
    srcFindCompaniesDesc: "Search our database for matching accounts.",
    srcLookalike: "Lookalike",
    srcLookalikeDesc: "Find records similar to a person or company.",
    srcImport: "Import CSV",
    srcImportDesc: "Upload a CSV of people or companies.",
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
    title: "Búsqueda con IA",
    description:
      "Describe a quién buscas. Kai busca en nuestra base de personas y empresas — o aplica IA para construir una tabla a medida que puedes guardar como lista y lanzar como campaña.",
    introTitle: "Prospecta con un prompt",
    introDescription:
      "Pregunta en lenguaje natural o crea una consulta avanzada a mano. Kai devuelve una tabla de personas o empresas puntuada por encaje que puedes refinar, enriquecer, guardar como lista dinámica y enviar a una campaña.",
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
    saved: "Búsquedas guardadas",
    saveThis: "Guardar esta búsqueda",
    noSaved: "Aún no hay búsquedas guardadas.",
    savedToast: "Búsqueda guardada con su historial de prompts",
    loadedToast: "Búsqueda guardada cargada",
    removedSaved: "Búsqueda guardada eliminada",
    people: "Personas",
    companies: "Empresas",
    resultsFor: "Resultados",
    estLeads: (n: number) => `Est. ${n.toLocaleString()} en total`,
    perLead: `${CREDITS_PER_LEAD} créditos / lead`,
    projected: (n: number) => `≈ ${n.toLocaleString()} créditos`,
    getMore: "Conseguir más leads",
    getMoreToast: "Ampliando la búsqueda a toda la base de datos…",
    komboData: "Datos de Kombo",
    komboHint: "Emails verificados, móviles, firmografía e intención — combinados desde nuestra red de datos.",
    dbLabel: "Buscar en",
    dbKombo: "KomboAI",
    dbKomboDesc: "Nuestra red verificada de personas y empresas.",
    dbLookalike: "Similares",
    dbLookalikeDesc: "Encuentra registros similares a una persona o empresa.",
    dbLinkedinDesc: "Busca con filtros de la red de LinkedIn.",
    dbSwitched: (name: string) => `Buscando en ${name}`,
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
    startHere: "Empieza aquí",
    crmSoon: "Tu CRM · pronto",
    searchBtn: "Buscar",
    clearQuery: "Borrar búsqueda",
    spotlightsLabel: "Destacados",
    matchLabel: "Coincide",
    spotlights: ["Open to work", "Cambió de empleo", "Activos recientemente", "Contratando", "Alta intención"],
    columns: "Columnas",
    addToList: "Guardar como lista",
    findPeople: "Buscar prospectos",
    findPeopleToast: "Cambiado a personas en estas empresas",
    quickStart: "Empieza aquí",
    qaImport: "Importar datos",
    qaImportDesc: "Importa tu lista existente desde CRM o CSV.",
    qaAudience: "Crear una lista",
    qaAudienceDesc: "Define y enriquece listas segmentadas de personas y empresas.",
    qaCampaign: "Crear una campaña",
    qaCampaignDesc: "Crea y automatiza tus campañas de difusión.",
    qaTemplate: "Empezar con una plantilla",
    qaTemplateDesc: "Elige entre flujos predefinidos para empezar.",
    lookalike: "Similares",
    lookalikeTitle: "Buscar similares",
    lookalikeDesc:
      "Elige una persona o empresa que ya te encaja — Kai encuentra registros similares a ese origen concreto. Refina con los filtros de la barra lateral.",
    pickSeed: "Elige una persona o empresa",
    companySearch: "Busca una empresa por nombre…",
    useCompany: (name: string) => `Usar "${name}"`,
    seedPeople: "Personas y clientes",
    seedCompanies: "Empresas",
    findSimilar: "Buscar similares",
    similarTo: "Similar a",
    clearLookalike: "Quitar similares",
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
    bulkCampaign: "Añadir a campaña",
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
    filtersNoMatch: "Ningún filtro coincide.",
    addToGroup: (label: string) => `Añadir ${label.toLowerCase()}…`,
    clearAll: "Limpiar todo",
    aiSuggestions: "Sugerencias de búsqueda con IA",
    startTypeTitle: "Escribe tu consulta",
    startTypeDesc: "Describe a quién buscas — un cargo, sector o ubicación.",
    startFiltersTitle: "Usa los filtros",
    startFiltersDesc: "Refina tu búsqueda con los filtros de la izquierda.",
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
    buildPeople: "Personas",
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
    pageRange: (from: number, to: number, total: number) =>
      `${from.toLocaleString()}–${to.toLocaleString()} de ${total.toLocaleString()}`,
    srcFindPeople: "Buscar personas",
    srcFindPeopleDesc: "Busca prospectos que coincidan en nuestra base.",
    srcFindCompanies: "Buscar empresas",
    srcFindCompaniesDesc: "Busca cuentas que coincidan en nuestra base.",
    srcLookalike: "Similares",
    srcLookalikeDesc: "Encuentra registros similares a una persona o empresa.",
    srcImport: "Importar CSV",
    srcImportDesc: "Sube un CSV de personas o empresas.",
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
type DataSource = "kombo" | "lookalike" | "linkedin"
const DATA_SOURCES: DataSource[] = ["kombo", "lookalike", "linkedin"]

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

// Column registries for the results tables — same shared ColumnManager +
// DataTable as People/Companies/Lists. The pinned identity column always shows;
// the rest are toggleable/reorderable.
const LEAD_GROUPS: ColGroup[] = [
  { id: "identity", label: { en: "Prospect", es: "Prospecto" } },
  { id: "company", label: { en: "Company", es: "Empresa" } },
  { id: "engagement", label: { en: "Engagement", es: "Interacción" } },
]
const LEAD_DEFAULT_IDS = ["fit", "company", "region", "email", "signals"]

// Results are paged so "select page" never grabs the whole (1000+) result set.
const RESULTS_PER_PAGE = 25
// Caps offered for "max contacts per company" — matches the build-a-list dialog.
const PER_COMPANY_CAPS: (number | null)[] = [null, 1, 2, 3, 5, 10]

const COMPANY_RESULT_GROUPS: ColGroup[] = [
  { id: "company", label: { en: "Company", es: "Empresa" } },
  { id: "firmographics", label: { en: "Firmographics", es: "Firmográficos" } },
  { id: "signals", label: { en: "Signals", es: "Señales" } },
]
const COMPANY_RESULT_DEFAULT_IDS = [
  "fit",
  "industry",
  "headcount",
  "region",
  "roles",
  "signals",
]

function FitBadge({ fit }: { fit: number }) {
  const tone = scoreTone(fit)
  const cls =
    tone === "high"
      ? "bg-chart-1/15 text-chart-1"
      : tone === "mid"
        ? "bg-chart-4/15 text-chart-4"
        : "bg-muted text-muted-foreground"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
        cls
      )}
      title="AI fit score"
    >
      <span className="bg-current size-1.5 rounded-full opacity-80" />
      {fit}
    </span>
  )
}

function mutedCell(value: React.ReactNode) {
  return <span className="text-muted-foreground text-sm">{value}</span>
}

function MatchLine({ reasons, label }: { reasons: string[]; label: string }) {
  if (reasons.length === 0) return null
  return (
    <p className="text-chart-1 mt-0.5 flex items-center gap-1 text-[11px]">
      <CheckCircle2 className="size-3 shrink-0" />
      <span className="truncate">
        {label}: {reasons.slice(0, 3).join(" · ")}
      </span>
    </p>
  )
}

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

export default function Search() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const location = useLocation()
  const headerPrompt = params.get("q")
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
  const newCampaign = useNewCampaign()
  const examples = locale === "es" ? EXAMPLE_PROMPTS_ES : EXAMPLE_PROMPTS_EN

  // Seed with a starter query so the page lands populated for demos — unless we
  // arrived from the header search with a prompt to run, or a lookalike seed.
  const initial = React.useMemo(() => interpretPrompt(EXAMPLE_PROMPTS_EN[0]), [])
  const [entity, setEntity] = React.useState<AiEntity>(
    loadedSearch
      ? loadedSearch.entity
      : incomingSeed
        ? incomingSeed.kind === "company"
          ? "companies"
          : "people"
        : initial.entity
  )
  const [query, setQuery] = React.useState<AiQuery>(
    loadedSearch
      ? loadedSearch.query
      : incomingSeed || headerPrompt
        ? { ...EMPTY_QUERY }
        : initial.query
  )
  const [lastPrompt, setLastPrompt] = React.useState(
    loadedSearch ? loadedSearch.prompt : similarPrompt || EXAMPLE_PROMPTS_EN[0]
  )
  const [input, setInput] = React.useState(
    loadedSearch
      ? loadedSearch.prompt
      : similarPrompt || headerPrompt || EXAMPLE_PROMPTS_EN[0]
  )
  const [thinking, setThinking] = React.useState(Boolean(headerPrompt))
  // The home/empty state vs the results view. Arriving with a prompt, a
  // lookalike seed, or a loaded saved search jumps straight to results.
  const [hasSearched, setHasSearched] = React.useState(
    Boolean(headerPrompt || incomingSeed || loadedSearch)
  )
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [lookalikeOpen, setLookalikeOpen] = React.useState(false)
  const [filtersOpen, setFiltersOpen] = React.useState(false)
  const [columnsOpen, setColumnsOpen] = React.useState(false)
  const [buildOpen, setBuildOpen] = React.useState(false)
  const [bulkIds, setBulkIds] = React.useState<string[]>([])
  const [bulkListOpen, setBulkListOpen] = React.useState(false)
  const [bulkCampaignOpen, setBulkCampaignOpen] = React.useState(false)
  const [seed, setSeed] = React.useState<LookalikeSeed | null>(incomingSeed)
  const [linkedinOn, setLinkedinOn] = React.useState(false)
  const [sortKey, setSortKey] = React.useState<SortKey>("fit")

  // The active database is derived: a seed means lookalike, else LinkedIn or Kombo.
  const source: DataSource = seed ? "lookalike" : linkedinOn ? "linkedin" : "kombo"

  const leads = React.useMemo(
    () =>
      capPerCompany(
        sortLeads(seed ? lookalikeLeads(seed, query) : searchLeads(query), sortKey),
        query.perCompanyCap
      ),
    [seed, query, sortKey]
  )
  const companies = React.useMemo(
    () =>
      sortCompanies(seed ? lookalikeCompanies(seed, query) : searchCompanies(query), sortKey),
    [seed, query, sortKey]
  )
  const shownCount = entity === "people" ? leads.length : companies.length
  const estTotal = estimatedTotal(shownCount, entity)
  const selectedCount = selected.size
  const creditBase = selectedCount > 0 ? selectedCount : estTotal
  const projectedCredits = Math.round(creditBase * CREDITS_PER_LEAD)

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
  const runPrompt = React.useCallback((prompt: string) => {
    const text = prompt.trim()
    if (!text) return
    setInput(text)
    setHasSearched(true)
    setThinking(true)
    setLastPrompt(text)
    window.setTimeout(() => {
      const { query: q, entity: e, seed: s } = interpretPrompt(text)
      setEntity(e)
      setQuery(q)
      setSeed(s ?? null)
      setSelected(new Set())
      setThinking(false)
    }, 900)
  }, [])

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
    setHasSearched(true)
    setQuery((prev) => {
      const arr = prev[group] as string[]
      if (arr.includes(value)) return prev
      return { ...prev, [group]: [...arr, value] }
    })
  }

  // Dynamic per-database facets (LinkedIn Sales Navigator / Kombo FullEnrich).
  function addFacet(id: string, value: string) {
    setHasSearched(true)
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
      if (linkedinOn) setLinkedinOn(false)
      setQuery((q) => ({ ...q, linkedin: [] }))
      setLookalikeOpen(true)
      return
    }
    setSeed(null)
    const on = next === "linkedin"
    setLinkedinOn(on)
    if (!on) setQuery((q) => ({ ...q, linkedin: [] }))
    toast.success(c.dbSwitched(on ? c.linkedinSource : c.dbKombo))
  }

  function applyLookalike(s: LookalikeSeed, q: AiQuery) {
    setHasSearched(true)
    setSeed(s)
    setEntity(s.kind === "company" ? "companies" : "people")
    setQuery(q)
    setSelected(new Set())
    setLookalikeOpen(false)
    const prompt = c.lookalikePrompt(s.name)
    setLastPrompt(prompt)
    setInput(prompt)
  }

  function saveSearch() {
    savedSearchStore.create({
      name: queryTitle(query, entity),
      entity,
      query,
      prompt: lastPrompt,
      messages: [],
      resultCount: shownCount,
    })
    toast.success(c.savedToast)
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
      name.trim() || (type === "people" ? "New people list" : "New company list")
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
    setHasSearched(true)
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

  // Customizable columns — the same ColumnManager + DataTable as People/Companies.
  const leadColPrefs = useColumnPrefs("search-people", LEAD_DEFAULT_IDS)
  const companyColPrefs = useColumnPrefs(
    "search-companies",
    COMPANY_RESULT_DEFAULT_IDS
  )

  const leadColumns = React.useMemo<ColumnDef<AiLead>[]>(
    () => [
      {
        id: "prospect",
        group: "identity",
        pinned: true,
        minWidth: "16rem",
        label: { en: "Prospect", es: "Prospecto" },
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
              <p className="truncate font-medium">
                {l.firstName} {l.lastName}
              </p>
              <p className="text-muted-foreground truncate text-xs">{l.title}</p>
              <MatchLine reasons={matchReasons(l, query)} label={c.matchLabel} />
            </div>
          </div>
        ),
      },
      { id: "fit", group: "identity", label: { en: "Fit", es: "Encaje" }, render: (l) => <FitBadge fit={l.fit} /> },
      {
        id: "company",
        group: "company",
        label: { en: "Company", es: "Empresa" },
        render: (l) => (
          <div>
            <p className="font-medium">{l.company}</p>
            <p className="text-muted-foreground text-xs">
              {l.industry} · {l.headcount}
            </p>
          </div>
        ),
      },
      { id: "seniority", group: "identity", label: { en: "Seniority", es: "Antigüedad" }, render: (l) => mutedCell(l.seniority) },
      { id: "department", group: "identity", label: { en: "Department", es: "Departamento" }, render: (l) => mutedCell(l.department) },
      { id: "region", group: "company", label: { en: "Region", es: "Región" }, render: (l) => mutedCell(l.region) },
      { id: "industry", group: "company", label: { en: "Industry", es: "Sector" }, render: (l) => mutedCell(l.industry) },
      { id: "headcount", group: "company", label: { en: "Size", es: "Tamaño" }, render: (l) => mutedCell(l.headcount) },
      { id: "revenue", group: "company", label: { en: "Revenue", es: "Ingresos" }, render: (l) => mutedCell(l.revenue) },
      { id: "email", group: "engagement", label: { en: "Email", es: "Email" }, render: (l) => <EmailStatus status={l.emailStatus} c={c} /> },
      {
        id: "signals",
        group: "engagement",
        label: { en: "Signals", es: "Señales" },
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
    ],
    [query, c]
  )

  const companyColumns = React.useMemo<ColumnDef<AiCompany>[]>(
    () => [
      {
        id: "company",
        group: "company",
        pinned: true,
        minWidth: "16rem",
        label: { en: "Company", es: "Empresa" },
        render: (co) => (
          <div className="flex items-center gap-3">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white"
              style={{ backgroundColor: co.logoColor }}
            >
              {co.name.slice(0, 2)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{co.name}</p>
              <p className="text-muted-foreground truncate text-xs">{co.domain}</p>
              <MatchLine
                reasons={companyMatchReasons(co, query)}
                label={c.matchLabel}
              />
            </div>
          </div>
        ),
      },
      { id: "fit", group: "company", label: { en: "Fit", es: "Encaje" }, render: (co) => <FitBadge fit={co.fit} /> },
      { id: "industry", group: "firmographics", label: { en: "Industry", es: "Sector" }, render: (co) => mutedCell(co.industry) },
      { id: "headcount", group: "firmographics", label: { en: "Size", es: "Tamaño" }, render: (co) => mutedCell(co.headcount) },
      { id: "region", group: "firmographics", label: { en: "Region", es: "Región" }, render: (co) => mutedCell(co.region) },
      { id: "revenue", group: "firmographics", label: { en: "Revenue", es: "Ingresos" }, render: (co) => mutedCell(co.revenue) },
      {
        id: "roles",
        group: "firmographics",
        label: { en: "Open roles", es: "Vacantes" },
        render: (co) => (
          <Badge variant="secondary" className="tabular-nums">
            {co.openRoles}
          </Badge>
        ),
      },
      {
        id: "signals",
        group: "signals",
        label: { en: "Signals", es: "Señales" },
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
    ],
    [query, c]
  )

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
      return leads
        .filter((l) => selected.has(l.id))
        .map(
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
    return companies
      .filter((co) => selected.has(co.id))
      .map((co) => {
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
      })
  }
  function bulkAddToList() {
    const ids = materializeSelected()
    if (ids.length === 0) return
    setBulkIds(ids)
    setSelected(new Set())
    setBulkListOpen(true)
  }
  function bulkAddToCampaign() {
    const ids = materializeSelected()
    if (ids.length === 0) return
    setBulkIds(ids)
    setSelected(new Set())
    setBulkCampaignOpen(true)
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
    return {
      label: c.dbKombo,
      desc: c.dbKomboDesc,
      icon: <Database className="text-primary size-4" />,
    }
  }

  // Clay-style launcher: a row of suggested starting points above the search.
  const quickActions = [
    {
      key: "import",
      icon: Upload,
      tint: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
      title: c.qaImport,
      desc: c.qaImportDesc,
      onClick: () => navigate("/lists?import=1"),
    },
    {
      key: "audience",
      icon: SlidersHorizontal,
      tint: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      title: c.qaAudience,
      desc: c.qaAudienceDesc,
      onClick: () => setBuildOpen(true),
    },
    {
      key: "campaign",
      icon: Megaphone,
      tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      title: c.qaCampaign,
      desc: c.qaCampaignDesc,
      onClick: () => newCampaign.open(),
    },
    {
      key: "template",
      icon: LayoutTemplate,
      tint: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      title: c.qaTemplate,
      desc: c.qaTemplateDesc,
      onClick: () => navigate("/templates"),
    },
  ]

  return (
    <Page>
      {!hasSearched ? (
        <SearchHome
          c={c}
          input={input}
          setInput={setInput}
          onRun={runPrompt}
          entity={entity}
          setEntity={setEntity}
          examples={examples}
          quickActions={quickActions}
        />
      ) : (
        <>
      {/* Results view stays lean — the dense table is the focus, so the page
          title, blurb and intro panel live only on the pre-search home. */}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="gap-1.5">
                  <Bookmark className="size-4" />
                  <span className="hidden sm:inline">{c.saved}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuItem onClick={saveSearch}>
                  <Bookmark className="size-4" />
                  {c.saveThis}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
          </form>
        </Card>

        {/* Filters live in a persistent sidebar; results (or the home/empty
            state) fill the rest. */}
        <div className="flex flex-col gap-6 lg:flex-row">
          <FilterSidebar
            className="lg:w-64 lg:shrink-0"
            query={query}
            onAdd={addFilter}
            onRemove={removeFilter}
            onClear={() => setQuery({ ...EMPTY_QUERY })}
            onAddFacet={addFacet}
            onRemoveFacet={removeFacet}
            facetDefs={facetsForDb(linkedinOn ? "linkedin" : "kombo", entity)}
            linkedinOn={linkedinOn}
            entity={entity}
            locale={locale}
            c={c}
          />
          <div className="min-w-0 flex-1">
            {hasSearched ? (
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
                  {DATA_SOURCES.map((k) => {
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

              {/* Secondary actions tucked into one overflow menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label={c.more}>
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => setLookalikeOpen(true)}>
                    <ScanSearch className="size-4" />
                    {c.lookalike}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={saveSearch}
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
            <span className="inline-flex items-center gap-1">
              <Coins className="text-chart-4 size-3.5" />
              {c.perLead}
            </span>
            <span className="text-foreground font-medium">
              {c.projected(projectedCredits)}
            </span>
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
                  <span className="text-muted-foreground pl-1 text-xs font-medium">
                    {c.capLabel}
                  </span>
                  {PER_COMPANY_CAPS.map((n) => {
                    const active = perCompanyCap === n
                    return (
                      <button
                        key={n ?? "none"}
                        type="button"
                        onClick={() => setMaxPerCompany(n)}
                        aria-pressed={active}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted/60"
                        )}
                      >
                        {n === null ? c.capNoLimit : n}
                      </button>
                    )
                  })}
                </>
              )}
              <span className="bg-border mx-1 h-5 w-px" />
              <Button variant="outline" size="sm" onClick={bulkAddToList}>
                <ListPlus className="size-4" />
                {c.bulkList}
              </Button>
              {entity === "people" && (
                <Button variant="outline" size="sm" onClick={bulkAddToCampaign}>
                  <Send className="size-4" />
                  {c.bulkCampaign}
                </Button>
              )}
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
                examples={examples}
                onRun={runPrompt}
                onUseFilters={() => setFiltersOpen(true)}
              />
            )}
          </div>
        </div>
      </div>
        </>
      )}

      <LookalikeDialog
        open={lookalikeOpen}
        onOpenChange={setLookalikeOpen}
        c={c}
        onConfirm={applyLookalike}
      />

      <FilterModal
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        query={query}
        onAdd={addFilter}
        onRemove={removeFilter}
        onClear={() => setQuery({ ...EMPTY_QUERY })}
        c={c}
        linkedinOn={linkedinOn}
        entity={entity}
        facetDefs={facetsForDb(linkedinOn ? "linkedin" : "kombo", entity)}
        onAddFacet={addFacet}
        onRemoveFacet={removeFacet}
        locale={locale}
      />

      {entity === "people" ? (
        <ColumnManager
          open={columnsOpen}
          onOpenChange={setColumnsOpen}
          columns={leadColumns}
          groups={LEAD_GROUPS}
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
      <BulkAddDialog
        open={bulkCampaignOpen}
        onOpenChange={setBulkCampaignOpen}
        mode="campaign"
        recordKind="person"
        ids={bulkIds}
      />
    </Page>
  )
}

function LookalikeDialog({
  open,
  onOpenChange,
  c,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  c: Copy
  onConfirm: (seed: LookalikeSeed, query: AiQuery) => void
}) {
  const [seedId, setSeedId] = React.useState<string | null>(null)
  const [companyQuery, setCompanyQuery] = React.useState("")
  const [wasOpen, setWasOpen] = React.useState(false)

  if (open && !wasOpen) {
    setWasOpen(true)
    setSeedId(null)
    setCompanyQuery("")
  }
  if (!open && wasOpen) setWasOpen(false)

  const q = companyQuery.trim()
  const ql = q.toLowerCase()
  const match = (s: LookalikeSeed) => !ql || s.name.toLowerCase().includes(ql)
  const people = LOOKALIKE_SEEDS.filter((s) => s.kind === "person" && match(s))
  const companies = LOOKALIKE_SEEDS.filter((s) => s.kind === "company" && match(s))
  // Typed a company we don't have a seed for? Build an ad-hoc one to search from.
  const hasExact = LOOKALIKE_SEEDS.some(
    (s) => s.kind === "company" && s.name.toLowerCase() === ql
  )
  const customSeed: LookalikeSeed | null =
    q && !hasExact
      ? {
          id: "custom",
          kind: "company",
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
          <div className="space-y-2">
            <Label>{c.pickSeed}</Label>
            <div className="relative">
              <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                value={companyQuery}
                onChange={(e) => setCompanyQuery(e.target.value)}
                placeholder={c.companySearch}
                className="pl-9"
              />
            </div>
            <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
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
                  <Building2 className="text-primary size-4 shrink-0" />
                  <span className="font-medium">{c.useCompany(customSeed.name)}</span>
                </button>
              )}
              {companies.length > 0 && (
                <SeedGroup
                  label={c.seedCompanies}
                  seeds={companies}
                  selected={seedId}
                  onSelect={setSeedId}
                />
              )}
              {people.length > 0 && (
                <SeedGroup
                  label={c.seedPeople}
                  seeds={people}
                  selected={seedId}
                  onSelect={setSeedId}
                />
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
  label: string
  seeds: LookalikeSeed[]
  selected: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
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
// them), mirroring the catalog side of the FilterModal as an always-visible
// sidebar. Selecting any value runs the search via onAdd/onAddFacet.
function FilterSidebar({
  className,
  query,
  onAdd,
  onRemove,
  onClear,
  onAddFacet,
  onRemoveFacet,
  facetDefs,
  linkedinOn,
  entity,
  locale,
  c,
}: {
  className?: string
  query: AiQuery
  onAdd: (group: keyof AiQuery, value: string) => void
  onRemove: (group: keyof AiQuery, value: string) => void
  onClear: () => void
  onAddFacet: (id: string, value: string) => void
  onRemoveFacet: (id: string, value: string) => void
  facetDefs: FacetDef[]
  linkedinOn: boolean
  entity: AiEntity
  locale: Locale
  c: Copy
}) {
  const [text, setText] = React.useState("")
  const [openGroups, setOpenGroups] = React.useState<Set<string>>(new Set())
  const q = text.trim().toLowerCase()

  function toggleGroup(key: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const groups = FILTER_OPTIONS.filter(
    (g) => !(g.linkedinOnly && !linkedinOn) && !(g.scope && g.scope !== entity)
  )
  const activeCount =
    groups.reduce((n, g) => n + (query[g.key] as string[]).length, 0) +
    facetDefs.reduce((n, f) => n + (query.facets[f.id]?.length ?? 0), 0)

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
          {groups.map((group) => {
            const items = group.options.filter(
              (v) => !q || v.toLowerCase().includes(q)
            )
            if (items.length === 0) return null
            const groupActive = (query[group.key] as string[]).length
            const isOpen = q ? true : openGroups.has(group.key as string)
            return (
              <div
                key={group.key}
                className="border-border/70 border-b last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(group.key as string)}
                  aria-expanded={isOpen}
                  className="hover:bg-muted/40 flex w-full items-center gap-1.5 px-2 py-2 text-left"
                >
                  <ChevronDown
                    className={cn(
                      "text-muted-foreground size-3.5 shrink-0 transition-transform",
                      !isOpen && "-rotate-90"
                    )}
                  />
                  {LINKEDIN_KEYS.has(group.key) && (
                    <LinkedinIcon className="size-3 text-[#0a66c2]" />
                  )}
                  <span className="text-muted-foreground flex-1 text-[11px] font-medium tracking-wide uppercase">
                    {group.label(c)}
                  </span>
                  {groupActive > 0 && (
                    <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                      {groupActive}
                    </span>
                  )}
                </button>
                {isOpen && (
                  <div className="pb-2">
                    <FilterGroupInput
                      placeholder={c.addToGroup(group.label(c))}
                      options={group.options}
                      onSubmit={(value) => onAdd(group.key, value)}
                    />
                    {items.map((value) => {
                      const checked = (query[group.key] as string[]).includes(value)
                      return (
                        <label
                          key={value}
                          className="hover:bg-muted/60 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() =>
                              checked
                                ? onRemove(group.key, value)
                                : onAdd(group.key, value)
                            }
                          />
                          <span className="flex-1 truncate">{value}</span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
          {facetDefs.map((facet) => {
            const facetItems = facet.options.filter(
              (v) => !q || v.toLowerCase().includes(q)
            )
            const hasOptions = facet.options.length > 0
            if (hasOptions && facetItems.length === 0) return null
            if (!hasOptions && q && !facet.label[locale].toLowerCase().includes(q))
              return null
            const selectedVals = query.facets[facet.id] ?? []
            const facetActive = selectedVals.length
            const isOpen = q ? true : openGroups.has(facet.id)
            return (
              <div
                key={facet.id}
                className="border-border/70 border-b last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(facet.id)}
                  aria-expanded={isOpen}
                  className="hover:bg-muted/40 flex w-full items-center gap-1.5 px-2 py-2 text-left"
                >
                  <ChevronDown
                    className={cn(
                      "text-muted-foreground size-3.5 shrink-0 transition-transform",
                      !isOpen && "-rotate-90"
                    )}
                  />
                  {facet.db === "linkedin" && (
                    <LinkedinIcon className="size-3 text-[#0a66c2]" />
                  )}
                  <span className="text-muted-foreground flex-1 text-[11px] font-medium tracking-wide uppercase">
                    {facet.label[locale]}
                  </span>
                  {facetActive > 0 && (
                    <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                      {facetActive}
                    </span>
                  )}
                </button>
                {isOpen && (
                  <div className="pb-2">
                    <FilterGroupInput
                      placeholder={c.addToGroup(facet.label[locale])}
                      options={facet.options}
                      onSubmit={(value) => onAddFacet(facet.id, value)}
                    />
                    {facetItems.map((value) => {
                      const checked = selectedVals.includes(value)
                      return (
                        <label
                          key={value}
                          className="hover:bg-muted/60 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() =>
                              checked
                                ? onRemoveFacet(facet.id, value)
                                : onAddFacet(facet.id, value)
                            }
                          />
                          <span className="flex-1 truncate">{value}</span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </aside>
  )
}

// Home/empty state for Prospect Search: AI-powered suggestions, two ways to
// start (type a query / use filters), and example prompts.
function SearchEmptyState({
  c,
  entity,
  examples,
  onRun,
  onUseFilters,
}: {
  c: Copy
  entity: AiEntity
  examples: string[]
  onRun: (prompt: string) => void
  onUseFilters: () => void
}) {
  const suggestions = libraryQueries
    .filter((qq) => qq.entity === entity)
    .slice(0, 6)
  return (
    <div className="space-y-8 py-1">
      {suggestions.length > 0 && (
        <div>
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <Sparkles className="text-primary size-4" />
            {c.aiSuggestions}
          </p>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onRun(s.prompt)}
                className="bg-card hover:border-primary/40 hover:bg-muted/40 flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-colors"
              >
                <span className="text-sm leading-snug font-medium">{s.name}</span>
                <span className="text-muted-foreground line-clamp-2 text-xs">
                  {s.prompt}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border p-5 text-center">
          <span className="bg-muted mx-auto flex size-10 items-center justify-center rounded-full">
            <SearchIcon className="text-muted-foreground size-5" />
          </span>
          <p className="mt-3 font-medium">{c.startTypeTitle}</p>
          <p className="text-muted-foreground mt-1 text-sm">{c.startTypeDesc}</p>
        </div>
        <button
          type="button"
          onClick={onUseFilters}
          className="hover:border-primary/40 rounded-xl border p-5 text-center transition-colors"
        >
          <span className="bg-muted mx-auto flex size-10 items-center justify-center rounded-full">
            <SlidersHorizontal className="text-muted-foreground size-5" />
          </span>
          <p className="mt-3 font-medium">{c.startFiltersTitle}</p>
          <p className="text-muted-foreground mt-1 text-sm">{c.startFiltersDesc}</p>
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
          {c.examples}
        </p>
        {examples.slice(0, 5).map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => onRun(ex)}
            className="hover:bg-muted/60 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm"
          >
            <SearchIcon className="text-muted-foreground size-4 shrink-0" />
            <span className="truncate">{ex}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// The home / empty state: a centered hero with the AI prompt, suggested
// searches, and the "Start here" quick actions. Shown only before a search has
// run — once results exist, the page switches to the working layout.
function SearchHome({
  c,
  input,
  setInput,
  onRun,
  entity,
  setEntity,
  examples,
  quickActions,
}: {
  c: Copy
  input: string
  setInput: (v: string) => void
  onRun: (prompt: string) => void
  entity: AiEntity
  setEntity: (e: AiEntity) => void
  examples: string[]
  quickActions: {
    key: string
    icon: React.ComponentType<{ className?: string }>
    tint: string
    title: string
    onClick: () => void
  }[]
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center py-8">
      <h1 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
        {c.heroTitle}
      </h1>
      <p className="text-muted-foreground mt-2 text-center text-sm">
        {c.heroSubtitle}
      </p>

      {/* Database / entity tabs */}
      <div className="bg-muted mt-6 inline-flex rounded-lg p-[3px]">
        <EntityTab
          active={entity === "people"}
          onClick={() => setEntity("people")}
          icon={Users}
          label={c.people}
        />
        <EntityTab
          active={entity === "companies"}
          onClick={() => setEntity("companies")}
          icon={Building2}
          label={c.companies}
        />
        <span className="text-muted-foreground/60 inline-flex cursor-not-allowed items-center gap-1.5 rounded-[5px] px-3 py-1.5 text-sm font-medium">
          {c.crmSoon}
        </span>
      </div>

      {/* AI prompt */}
      <form
        className="mt-3 w-full"
        onSubmit={(e) => {
          e.preventDefault()
          onRun(input)
        }}
      >
        <div className="relative">
          <Textarea
            id="search-prompt"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                onRun(input)
              }
            }}
            placeholder={c.heroPlaceholder}
            rows={3}
            className="resize-none rounded-xl p-4 pr-14 text-base"
          />
          <Button
            type="submit"
            variant="volt"
            size="icon"
            disabled={!input.trim()}
            className="absolute right-3 bottom-3 rounded-lg"
            aria-label={c.searchBtn}
          >
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </form>

      {/* Suggested searches */}
      <div className="mt-4 w-full space-y-0.5">
        {examples.slice(0, 4).map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => onRun(ex)}
            className="hover:bg-muted/60 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm"
          >
            <SearchIcon className="text-muted-foreground size-4 shrink-0" />
            <span className="truncate">{ex}</span>
          </button>
        ))}
      </div>

      {/* Quick actions — "Start here" */}
      <div className="mt-7 w-full">
        <p className="text-muted-foreground mb-2 text-center text-[11px] font-medium tracking-wide uppercase">
          {c.startHere}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {quickActions.map((a) => {
            const Icon = a.icon
            return (
              <button
                key={a.key}
                type="button"
                onClick={a.onClick}
                className="hover:border-primary/40 hover:bg-muted/40 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded",
                    a.tint
                  )}
                >
                  <Icon className="size-3" />
                </span>
                {a.title}
              </button>
            )
          })}
        </div>
      </div>
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

function EmailStatus({
  status,
  c,
}: {
  status: AiLead["emailStatus"]
  c: Copy
}) {
  if (status === "verified")
    return (
      <span className="text-chart-1 inline-flex items-center gap-1 text-xs font-medium">
        <CheckCircle2 className="size-3.5" />
        {c.emailVerified}
      </span>
    )
  if (status === "likely")
    return (
      <span className="text-chart-4 inline-flex items-center gap-1 text-xs font-medium">
        <CircleDashed className="size-3.5" />
        {c.emailLikely}
      </span>
    )
  return (
    <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
      <X className="size-3.5" />
      {c.emailMissing}
    </span>
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

const FILTER_OPTIONS: {
  key: keyof AiQuery
  label: (c: Copy) => string
  options: string[]
  linkedinOnly?: boolean
  scope?: AiEntity
}[] = [
  { key: "titles", label: (c) => c.titles, options: TITLE_OPTIONS, scope: "people" },
  { key: "seniority", label: (c) => c.seniority, options: SENIORITY_OPTIONS, scope: "people" },
  { key: "departments", label: (c) => c.departments, options: DEPARTMENT_OPTIONS, scope: "people" },
  { key: "regions", label: (c) => c.regions, options: REGION_OPTIONS },
  { key: "industries", label: (c) => c.industries, options: INDUSTRY_OPTIONS },
  { key: "headcount", label: (c) => c.headcountF, options: HEADCOUNT_OPTIONS },
  { key: "revenue", label: (c) => c.revenue, options: REVENUE_OPTIONS },
  { key: "founded", label: (c) => c.founded, options: FOUNDED_OPTIONS, scope: "companies" },
  { key: "growth", label: (c) => c.growth, options: GROWTH_OPTIONS, scope: "companies" },
  { key: "technologies", label: (c) => c.technologies, options: TECH_OPTIONS },
  { key: "intent", label: (c) => c.intent, options: INTENT_OPTIONS, scope: "people" },
  { key: "signals", label: (c) => c.signals, options: SIGNAL_OPTIONS },
  { key: "linkedin", label: (c) => c.linkedinFilters, options: LINKEDIN_OPTIONS, linkedinOnly: true, scope: "people" },
  // LinkedIn-only facets (People & Company search).
  { key: "connections", label: (c) => c.connections, options: CONNECTION_OPTIONS, linkedinOnly: true },
  { key: "profileLanguages", label: (c) => c.profileLanguages, options: PROFILE_LANGUAGE_OPTIONS, linkedinOnly: true, scope: "people" },
  { key: "serviceCategories", label: (c) => c.serviceCategories, options: SERVICE_CATEGORY_OPTIONS, linkedinOnly: true, scope: "people" },
  { key: "schools", label: (c) => c.schools, options: SCHOOL_OPTIONS, linkedinOnly: true, scope: "people" },
  { key: "currentCompanies", label: (c) => c.currentCompanies, options: COMPANY_NAME_OPTIONS, linkedinOnly: true, scope: "people" },
  { key: "pastCompanies", label: (c) => c.pastCompanies, options: COMPANY_NAME_OPTIONS, linkedinOnly: true, scope: "people" },
  { key: "connectionsOf", label: (c) => c.connectionsOf, options: PERSON_NAME_OPTIONS, linkedinOnly: true, scope: "people" },
  { key: "followersOf", label: (c) => c.followersOf, options: PERSON_NAME_OPTIONS, linkedinOnly: true, scope: "people" },
  { key: "jobListings", label: (c) => c.jobListings, options: JOB_LISTING_OPTIONS, linkedinOnly: true, scope: "companies" },
]

// Type-ahead "Add filter": type to filter suggestions across every field, or
// type any custom value and add it as a title (manual entry).
// Per-group manual entry: type any value and press Enter (or +) to add it to
// that filter group — so filters aren't limited to the preset options.
function FilterGroupInput({
  placeholder,
  options,
  onSubmit,
}: {
  placeholder: string
  options: string[]
  onSubmit: (value: string) => void
}) {
  const [value, setValue] = React.useState("")
  function submit() {
    const v = value.trim()
    if (!v) return
    // Resolve the typed text to a real option (case-insensitive) so the matching
    // checkbox reflects the selection instead of adding an unmatched custom value.
    const lower = v.toLowerCase()
    const match =
      options.find((o) => o.toLowerCase() === lower) ??
      options.find((o) => o.toLowerCase().includes(lower))
    onSubmit(match ?? v)
    setValue("")
  }
  return (
    <div className="relative px-2 pb-1">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            submit()
          }
        }}
        placeholder={placeholder}
        className="h-7 pr-7 text-xs"
      />
      {value.trim() && (
        <button
          type="button"
          aria-label={placeholder}
          onClick={submit}
          className="text-primary hover:bg-muted absolute top-1/2 right-3 flex size-5 -translate-y-1/2 items-center justify-center rounded"
        >
          <Plus className="size-3.5" />
        </button>
      )}
    </div>
  )
}

// Filters live in a roomy two-pane modal (same shape as Customize columns):
// active filters on the left, the full searchable catalog on the right.
function FilterModal({
  open,
  onOpenChange,
  query,
  onAdd,
  onRemove,
  onClear,
  c,
  linkedinOn,
  entity,
  facetDefs,
  onAddFacet,
  onRemoveFacet,
  locale,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  query: AiQuery
  onAdd: (group: keyof AiQuery, value: string) => void
  onRemove: (group: keyof AiQuery, value: string) => void
  onClear: () => void
  c: Copy
  linkedinOn: boolean
  entity: AiEntity
  facetDefs: FacetDef[]
  onAddFacet: (id: string, value: string) => void
  onRemoveFacet: (id: string, value: string) => void
  locale: Locale
}) {
  const [text, setText] = React.useState("")
  const [openGroups, setOpenGroups] = React.useState<Set<string>>(new Set())
  const q = text.trim().toLowerCase()

  function toggleGroup(key: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const groups = React.useMemo(
    () =>
      FILTER_OPTIONS.filter(
        (g) => !(g.linkedinOnly && !linkedinOn) && !(g.scope && g.scope !== entity)
      ),
    [linkedinOn, entity]
  )

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
                        {g.label(c)}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {values.map((value) => (
                          <span
                            key={value}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full py-1 pr-1 pl-2.5 text-xs font-medium",
                              LINKEDIN_KEYS.has(g.key)
                                ? "bg-[#0a66c2]/10 text-[#0a66c2]"
                                : "bg-primary/10 text-primary"
                            )}
                          >
                            {value}
                            <button
                              type="button"
                              aria-label={`Remove ${value}`}
                              onClick={() => onRemove(g.key, value)}
                              className="rounded-full p-0.5 hover:bg-black/10"
                            >
                              <X className="size-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {activeFacets.map(({ f, values }) => (
                    <div key={f.id}>
                      <p className="text-muted-foreground mb-1 text-[11px] font-medium tracking-wide uppercase">
                        {f.label[locale]}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {values.map((value) => (
                          <span
                            key={value}
                            className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full py-1 pr-1 pl-2.5 text-xs font-medium"
                          >
                            {value}
                            <button
                              type="button"
                              aria-label={`Remove ${value}`}
                              onClick={() => onRemoveFacet(f.id, value)}
                              className="rounded-full p-0.5 hover:bg-black/10"
                            >
                              <X className="size-3" />
                            </button>
                          </span>
                        ))}
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
              {groups.map((group) => {
                const items = group.options.filter(
                  (v) => !q || v.toLowerCase().includes(q)
                )
                if (items.length === 0) return null
                const groupActive = (query[group.key] as string[]).length
                // Collapsed by default; a search query force-expands matches.
                const isOpen = q ? true : openGroups.has(group.key as string)
                return (
                  <div key={group.key} className="border-border/70 border-b last:border-b-0">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.key as string)}
                      aria-expanded={isOpen}
                      className="hover:bg-muted/40 flex w-full items-center gap-1.5 px-2 py-2 text-left"
                    >
                      <ChevronDown
                        className={cn(
                          "text-muted-foreground size-3.5 shrink-0 transition-transform",
                          !isOpen && "-rotate-90"
                        )}
                      />
                      {LINKEDIN_KEYS.has(group.key) && (
                        <LinkedinIcon className="size-3 text-[#0a66c2]" />
                      )}
                      <span className="text-muted-foreground flex-1 text-[11px] font-medium tracking-wide uppercase">
                        {group.label(c)}
                      </span>
                      {groupActive > 0 && (
                        <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                          {groupActive}
                        </span>
                      )}
                    </button>
                    {isOpen && (
                      <div className="pb-2">
                        {/* Manual entry — type any value, not just the presets. */}
                        <FilterGroupInput
                          placeholder={c.addToGroup(group.label(c))}
                          options={group.options}
                          onSubmit={(value) => onAdd(group.key, value)}
                        />
                        {items.map((value) => {
                          const checked = (query[group.key] as string[]).includes(
                            value
                          )
                          return (
                            <label
                              key={value}
                              className="hover:bg-muted/60 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() =>
                                  checked
                                    ? onRemove(group.key, value)
                                    : onAdd(group.key, value)
                                }
                              />
                              <span className="flex-1 truncate">{value}</span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
              {/* Per-database facets (LinkedIn Sales Navigator / Kombo FullEnrich). */}
              {facetDefs.map((facet) => {
                const facetItems = facet.options.filter(
                  (v) => !q || v.toLowerCase().includes(q)
                )
                const hasOptions = facet.options.length > 0
                if (hasOptions && facetItems.length === 0) return null
                if (
                  !hasOptions &&
                  q &&
                  !facet.label[locale].toLowerCase().includes(q)
                )
                  return null
                const selectedVals = query.facets[facet.id] ?? []
                const facetActive = selectedVals.length
                const isOpen = q ? true : openGroups.has(facet.id)
                return (
                  <div
                    key={facet.id}
                    className="border-border/70 border-b last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => toggleGroup(facet.id)}
                      aria-expanded={isOpen}
                      className="hover:bg-muted/40 flex w-full items-center gap-1.5 px-2 py-2 text-left"
                    >
                      <ChevronDown
                        className={cn(
                          "text-muted-foreground size-3.5 shrink-0 transition-transform",
                          !isOpen && "-rotate-90"
                        )}
                      />
                      {facet.db === "linkedin" && (
                        <LinkedinIcon className="size-3 text-[#0a66c2]" />
                      )}
                      <span className="text-muted-foreground flex-1 text-[11px] font-medium tracking-wide uppercase">
                        {facet.label[locale]}
                      </span>
                      {facetActive > 0 && (
                        <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                          {facetActive}
                        </span>
                      )}
                    </button>
                    {isOpen && (
                      <div className="pb-2">
                        <FilterGroupInput
                          placeholder={c.addToGroup(facet.label[locale])}
                          options={facet.options}
                          onSubmit={(value) => onAddFacet(facet.id, value)}
                        />
                        {facetItems.map((value) => {
                          const checked = selectedVals.includes(value)
                          return (
                            <label
                              key={value}
                              className="hover:bg-muted/60 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() =>
                                  checked
                                    ? onRemoveFacet(facet.id, value)
                                    : onAddFacet(facet.id, value)
                                }
                              />
                              <span className="flex-1 truncate">{value}</span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
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
                <div className="flex flex-wrap gap-1.5">
                  {[null, 1, 2, 3, 5, 10].map((n) => {
                    const isActive = perCompanyCap === n
                    return (
                      <button
                        key={n ?? "none"}
                        type="button"
                        onClick={() => setPerCompanyCap(n)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          isActive
                            ? "border-primary bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted/60"
                        )}
                      >
                        {n === null ? c.capNoLimit : n}
                      </button>
                    )
                  })}
                </div>
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


