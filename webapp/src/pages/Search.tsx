import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import {
  Sparkles,
  Send,
  Plus,
  X,
  Loader2,
  Bookmark,
  Trash2,
  Columns3,
  Building2,
  Users,
  ArrowRight,
  Coins,
  Wand2,
  ListPlus,
  CheckCircle2,
  CircleDashed,
  ScanSearch,
  ArrowDownUp,
  Database,
} from "lucide-react"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { Switch } from "@/components/ui/switch"

import { Page } from "@/components/layout/Page"
import { useLocale } from "@/lib/locale"
import { FeatureIntro } from "@/components/common/FeatureIntro"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { initials, scoreTone } from "@/lib/format"
import { portraitFor } from "@/lib/avatars"
import {
  interpretPrompt,
  searchLeads,
  searchCompanies,
  lookalikeLeads,
  lookalikeCompanies,
  smallerThan,
  largerThan,
  LOOKALIKE_SEEDS,
  estimatedTotal,
  queryTitle,
  isQueryEmpty,
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
  sortLeads,
  sortCompanies,
  matchReasons,
  companyMatchReasons,
  type SortKey,
  EMPTY_QUERY,
  type AiEntity,
  type AiQuery,
  type AiLead,
  type AiChatMessage,
  type LookalikeSeed,
} from "@/lib/mock-ai-search"
import { useCampaigns, campaignStore, listStore, prospectStore } from "@/lib/store"
import type { SavedSearchCriteria } from "@/lib/types"

const NEW_CAMPAIGN = "__new__"
const NO_CAMPAIGN = "__none__"

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
    linkedinSource: "LinkedIn",
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
    linkedinFilters: "LinkedIn",
    srTitle: "Search",
    spotlightsLabel: "Spotlights",
    matchLabel: "Matches",
    spotlights: ["Open to work", "Changed jobs", "Recently active", "Hiring", "High intent"],
    columns: "Columns",
    addToList: "Save as list",
    findPeople: "Find decision-makers",
    findPeopleToast: "Switched to people at these companies",
    lookalike: "Lookalikes",
    lookalikeTitle: "Find lookalikes",
    lookalikeDesc:
      "Lookalike search starts from a person or company you already like. Kai finds similar records — refine with the modifiers below.",
    pickSeed: "Pick a person or company",
    seedPeople: "People & customers",
    seedCompanies: "Companies",
    modifiers: "Modifiers",
    modSmaller: "But smaller",
    modLarger: "But larger",
    modRegion: "Same region",
    modSenior: "More senior",
    findSimilar: "Find similar",
    similarTo: "Similar to",
    clearLookalike: "Clear lookalike",
    lookalikeMsg: (name: string) =>
      `Showing records similar to ${name}. Add modifiers or filters to narrow the match.`,
    lookalikePrompt: (name: string, mod: string) =>
      `Find records similar to ${name}${mod}`,
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
    noResults: "No results yet — try a prompt or adjust your filters.",
    addFilter: "Add filter",
    filterTypeahead: "Search filters or describe them with AI…",
    addCustom: (v: string) => `Add "${v}"`,
    askAiFilter: (v: string) => `Ask AI: "${v}"`,
    viewAllFilters: "View all filters",
    backToFilterSearch: "Back to search",
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
    linkedinSource: "LinkedIn",
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
    linkedinFilters: "LinkedIn",
    srTitle: "Buscar",
    spotlightsLabel: "Destacados",
    matchLabel: "Coincide",
    spotlights: ["Open to work", "Cambió de empleo", "Activos recientemente", "Contratando", "Alta intención"],
    columns: "Columnas",
    addToList: "Guardar como lista",
    findPeople: "Buscar decisores",
    findPeopleToast: "Cambiado a personas en estas empresas",
    lookalike: "Similares",
    lookalikeTitle: "Buscar similares",
    lookalikeDesc:
      "La búsqueda de similares parte de una persona o empresa que ya te encaja. Kai encuentra registros parecidos — refina con los modificadores de abajo.",
    pickSeed: "Elige una persona o empresa",
    seedPeople: "Personas y clientes",
    seedCompanies: "Empresas",
    modifiers: "Modificadores",
    modSmaller: "Pero más pequeñas",
    modLarger: "Pero más grandes",
    modRegion: "Misma región",
    modSenior: "Más senior",
    findSimilar: "Buscar similares",
    similarTo: "Similar a",
    clearLookalike: "Quitar similares",
    lookalikeMsg: (name: string) =>
      `Mostrando registros similares a ${name}. Añade modificadores o filtros para afinar la coincidencia.`,
    lookalikePrompt: (name: string, mod: string) =>
      `Buscar registros similares a ${name}${mod}`,
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
    noResults: "Aún no hay resultados — prueba un prompt o ajusta los filtros.",
    addFilter: "Añadir filtro",
    filterTypeahead: "Busca filtros o descríbelos con IA…",
    addCustom: (v: string) => `Añadir "${v}"`,
    askAiFilter: (v: string) => `Pregunta a la IA: "${v}"`,
    viewAllFilters: "Ver todos los filtros",
    backToFilterSearch: "Volver a la búsqueda",
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

type RefinePatch = Partial<
  Record<
    "titles" | "seniority" | "regions" | "headcount" | "industries" | "signals",
    readonly string[]
  >
>

const LIST_COLORS = ["#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"]

// Spotlights — LinkedIn-style quick toggles (index-matched to c.spotlights).
const SPOTLIGHT_DEFS: { key: keyof AiQuery; value: string; needsLi: boolean }[] = [
  { key: "linkedin", value: "Open to work", needsLi: true },
  { key: "linkedin", value: "Changed jobs (90d)", needsLi: true },
  { key: "linkedin", value: "Posted recently", needsLi: true },
  { key: "signals", value: "Hiring sales", needsLi: false },
  { key: "signals", value: "High web intent", needsLi: false },
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

let chatSeq = 0
function chatId() {
  return `c_${(chatSeq += 1)}`
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

// A prompt is a general assistant question (not a prospecting search) when it
// asks Kai to do something conversational — draft, book, summarize pipeline…
function isAssistantQuestion(prompt: string): boolean {
  const q = prompt.toLowerCase()
  const conversational =
    /\b(draft|write|book|schedule|meeting|calendar|follow.?up|at risk|deal|deals|pipeline|forecast|summar|how many|team|performance|coach|remind|reply|respond|email to|message to)\b/.test(
      q
    )
  const searchy = /\b(find|search|similar to|look ?alike|leads?|prospects?|companies|accounts|list of|build a list)\b/.test(
    q
  )
  return conversational && !searchy
}

// The merged "Ask Kai" assistant — answers general questions inline in the
// same surface as search, so there's one Kai, not two.
function kaiAnswer(prompt: string): string {
  const q = prompt.toLowerCase()
  if (q.includes("top") && q.includes("prospect")) {
    return "Your highest-scoring prospects right now are Aisha Khan (CRO, Clarity AI — 95), Grace Liu (COO, Betterfly — 90) and Sarah Chen (VP Sales, Fever — 92, who just replied). I'd prioritize Sarah today — she's asking for meeting times."
  }
  if (q.includes("book") || q.includes("meeting") || q.includes("calendar")) {
    return "You're open Tue 2:00 PM and Wed 10:00 AM. I've drafted an invite to Grace Liu for Tue 2:00 PM (\"Betterfly × Kombo — intro\") and a short email to send it. Want me to send both?"
  }
  if (q.includes("follow") || q.includes("draft") || q.includes("write")) {
    return "Here's a draft for Sarah Chen:\n\n“Hi Sarah — great to hear you're hiring 5 SDRs this quarter. I have Tue 2pm or Wed 10am open for a quick 15-min walkthrough of how teams ramp new reps 3x faster with Kombo. Which works?”\n\nWant me to send it or tweak the tone?"
  }
  if (q.includes("risk") || q.includes("deal") || q.includes("pipeline") || q.includes("forecast")) {
    return "Two deals look at risk: Edicom — Pilot ($95K, 20%, no activity in 3 days) and Viajes El Corte Inglés — Pilot ($70K, 15%, still in Lead). Betterfly ($320K) is healthy at 55% in Proposal. Want a re-engagement sequence for the two stalled ones?"
  }
  if (q.includes("team") || q.includes("performance") || q.includes("coach")) {
    return "This week the team booked 23 meetings and influenced $412K in pipeline. Maya Patel leads on attainment (57%); Ethan Wright's reply rate (14%) is trending below average — a coaching opportunity. Want me to open his call recordings?"
  }
  return "I'm connected to your CRM, calendar, email, and the web, so I can find prospects, draft and send outreach, book meetings, and analyze pipeline. Describe who you're looking for, or ask about a specific account, deal, or rep."
}

export default function Search() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const headerPrompt = params.get("q")
  const campaigns = useCampaigns()
  const savedSearches = useSavedSearches()
  const examples = locale === "es" ? EXAMPLE_PROMPTS_ES : EXAMPLE_PROMPTS_EN

  // Seed with a starter query so the page lands populated for demos — unless we
  // arrived from the header search with a prompt to run.
  const initial = React.useMemo(() => interpretPrompt(EXAMPLE_PROMPTS_EN[0]), [])
  const [entity, setEntity] = React.useState<AiEntity>(initial.entity)
  const [query, setQuery] = React.useState<AiQuery>(
    headerPrompt ? { ...EMPTY_QUERY } : initial.query
  )
  const [lastPrompt, setLastPrompt] = React.useState(EXAMPLE_PROMPTS_EN[0])
  const [messages, setMessages] = React.useState<AiChatMessage[]>(
    headerPrompt ? [] : [{ id: chatId(), role: "assistant", content: c.starter }]
  )
  const [input, setInput] = React.useState("")
  const [thinking, setThinking] = React.useState(Boolean(headerPrompt))
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [saveOpen, setSaveOpen] = React.useState(false)
  const [lookalikeOpen, setLookalikeOpen] = React.useState(false)
  const [seed, setSeed] = React.useState<LookalikeSeed | null>(null)
  const [showEmail, setShowEmail] = React.useState(true)
  const [showSignals, setShowSignals] = React.useState(false)
  const [showRegion, setShowRegion] = React.useState(true)
  const [linkedinOn, setLinkedinOn] = React.useState(false)
  const [sortKey, setSortKey] = React.useState<SortKey>("fit")
  const endRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, thinking])

  const leads = React.useMemo(
    () => sortLeads(seed ? lookalikeLeads(seed, query) : searchLeads(query), sortKey),
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

  const runPrompt = React.useCallback(
    (prompt: string) => {
      const text = prompt.trim()
      if (!text) return
      setInput("")
      setMessages((m) => [...m, { id: chatId(), role: "user", content: text }])
      setThinking(true)
      setLastPrompt(text)
      // A deliberate ~1.5s pause makes Kai feel like it's reasoning before it
      // answers — then we reveal the prompt's results (or a chat reply).
      window.setTimeout(() => {
        if (isAssistantQuestion(text)) {
          setMessages((m) => [
            ...m,
            { id: chatId(), role: "assistant", content: kaiAnswer(text) },
          ])
          setThinking(false)
          return
        }
        const { query: q, entity: e, summary, seed: s } = interpretPrompt(text)
        setEntity(e)
        setQuery(q)
        setSeed(s ?? null)
        setSelected(new Set())
        const count = s
          ? e === "people"
            ? lookalikeLeads(s, q).length
            : lookalikeCompanies(s, q).length
          : e === "people"
            ? searchLeads(q).length
            : searchCompanies(q).length
        const total = estimatedTotal(count, e)
        setMessages((m) => [
          ...m,
          {
            id: chatId(),
            role: "assistant",
            content: `${summary} ${c.showingOf(count, total)}`,
          },
        ])
        setThinking(false)
      }, 1500)
    },
    [c]
  )

  // Run a prompt handed over from the header search exactly once.
  const ranHeaderPrompt = React.useRef(false)
  React.useEffect(() => {
    if (headerPrompt && !ranHeaderPrompt.current) {
      ranHeaderPrompt.current = true
      runPrompt(headerPrompt)
    }
  }, [headerPrompt, runPrompt])

  function applyRefine(patch: RefinePatch, label: string) {
    setQuery((prev) => {
      const next: AiQuery = { ...prev }
      ;(Object.keys(patch) as (keyof RefinePatch)[]).forEach((k) => {
        const add = patch[k]
        if (!add) return
        const cur = prev[k] as string[]
        next[k] = Array.from(new Set([...cur, ...add])) as never
      })
      return next
    })
    setMessages((m) => [
      ...m,
      { id: chatId(), role: "assistant", content: c.refinedTo(label) },
    ])
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

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    const ids = entity === "people" ? leads.map((l) => l.id) : companies.map((c) => c.id)
    setSelected((prev) =>
      ids.every((id) => prev.has(id)) ? new Set() : new Set(ids)
    )
  }

  function findDecisionMakers() {
    setEntity("people")
    setSeed(null)
    setSelected(new Set())
    toast.success(c.findPeopleToast)
  }

  function toggleLinkedin(v: boolean) {
    setLinkedinOn(v)
    if (!v) setQuery((q) => ({ ...q, linkedin: [] }))
    toast.success(v ? c.linkedinEnabled : c.linkedinDisabled)
  }

  function toggleSpotlight(i: number) {
    const def = SPOTLIGHT_DEFS[i]
    const active = (query[def.key] as string[]).includes(def.value)
    if (active) {
      removeFilter(def.key, def.value)
      return
    }
    if (def.needsLi && !linkedinOn) setLinkedinOn(true)
    addFilter(def.key, def.value)
  }

  function applyLookalike(s: LookalikeSeed, q: AiQuery, modLabel: string) {
    setSeed(s)
    setEntity(s.kind === "company" ? "companies" : "people")
    setQuery(q)
    setSelected(new Set())
    setLookalikeOpen(false)
    setLastPrompt(c.lookalikePrompt(s.name, modLabel))
    setMessages((m) => [
      ...m,
      { id: chatId(), role: "user", content: c.lookalikePrompt(s.name, modLabel) },
      { id: chatId(), role: "assistant", content: c.lookalikeMsg(s.name) },
    ])
  }

  function saveSearch() {
    savedSearchStore.create({
      name: queryTitle(query, entity),
      entity,
      query,
      prompt: lastPrompt,
      messages,
      resultCount: shownCount,
    })
    toast.success(c.savedToast)
  }

  function loadSearch(id: string) {
    const s = savedSearches.find((x) => x.id === id)
    if (!s) return
    setEntity(s.entity)
    setQuery(s.query)
    setLastPrompt(s.prompt)
    setMessages(s.messages.length ? s.messages : messages)
    setSelected(new Set())
    toast.success(c.loadedToast)
  }

  const allSelected =
    shownCount > 0 &&
    (entity === "people" ? leads : companies).every((r) => selected.has(r.id))

  return (
    <Page>
      {/* AI is native to the product, so the page isn't labelled "AI Search". */}
      <h1 className="sr-only">{c.srTitle}</h1>
      <p className="text-muted-foreground mb-6 max-w-3xl text-sm">{c.description}</p>

      <FeatureIntro
        featureKey="ai-search"
        icon={Sparkles}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        className="mb-6"
      />

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        {/* AI prompt / chat panel */}
        <Card className="flex h-fit flex-col gap-0 p-0 lg:sticky lg:top-20">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="bg-primary/10 flex size-7 items-center justify-center rounded-md">
                <Sparkles className="text-primary size-4" />
              </span>
              <span className="text-sm font-semibold">{c.assistantName}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
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
                          {s.resultCount} · {s.messages.length} msgs
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

          <div className="max-h-[320px] flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-muted-foreground text-sm">{c.chatHint}</p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[88%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted rounded-tl-sm"
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="text-muted-foreground bg-muted flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm">
                <Loader2 className="size-3.5 animate-spin" />
                {c.thinking}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="space-y-2 border-t p-3">
            <div className="flex flex-wrap gap-1.5">
              {examples.slice(0, 2).map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => runPrompt(ex)}
                  className="border-border hover:border-primary/40 hover:bg-muted/60 text-muted-foreground rounded-full border px-2.5 py-1 text-left text-xs transition-colors"
                >
                  {ex.length > 42 ? `${ex.slice(0, 42)}…` : ex}
                </button>
              ))}
            </div>
            <form
              className="flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                runPrompt(input)
              }}
            >
              <Textarea
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
                className="min-h-0 resize-none"
              />
              <Button
                type="submit"
                size="icon"
                variant="volt"
                disabled={!input.trim() || thinking}
                aria-label="Search"
              >
                <Send className="size-4" />
              </Button>
            </form>
            <div className="flex flex-wrap gap-1.5">
              {c.refineChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => applyRefine(chip.patch, chip.label)}
                  className="bg-muted/60 hover:bg-muted text-foreground inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors"
                >
                  <Wand2 className="size-3" />
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="min-w-0 space-y-3">
          {/* Data sources */}
          <div className="bg-muted/30 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-3 py-2">
            <span className="text-foreground inline-flex items-center gap-1.5 text-sm font-medium">
              <Database className="text-primary size-4" />
              {c.komboData}
            </span>
            <span className="text-muted-foreground hidden text-xs lg:inline">
              {c.komboHint}
            </span>
            <label className="ml-auto inline-flex items-center gap-2" title={c.linkedinHint}>
              <LinkedinIcon className="size-4 text-[#0a66c2]" />
              <span className="text-sm font-medium">{c.linkedinSource}</span>
              <Switch
                checked={linkedinOn}
                onCheckedChange={toggleLinkedin}
                aria-label={c.linkedinSource}
              />
            </label>
          </div>

          {/* Spotlights — LinkedIn-style quick toggles */}
          {entity === "people" && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-muted-foreground inline-flex items-center gap-1 text-xs font-medium">
                <Sparkles className="size-3.5" />
                {c.spotlightsLabel}
              </span>
              {c.spotlights.map((label, i) => {
                const def = SPOTLIGHT_DEFS[i]
                const active = (query[def.key] as string[]).includes(def.value)
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleSpotlight(i)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
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

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowDownUp className="size-4" />
                    <span className="hidden sm:inline">
                      {c.sortBy}: {sortLabel(sortKey, c)}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLookalikeOpen(true)}
              >
                <ScanSearch className="size-4" />
                <span className="hidden sm:inline">{c.lookalike}</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Columns3 className="size-4" />
                    <span className="hidden sm:inline">{c.columns}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem
                    checked={showRegion}
                    onCheckedChange={(v) => setShowRegion(!!v)}
                  >
                    {c.colRegion}
                  </DropdownMenuCheckboxItem>
                  {entity === "people" && (
                    <DropdownMenuCheckboxItem
                      checked={showEmail}
                      onCheckedChange={(v) => setShowEmail(!!v)}
                    >
                      {c.colEmail}
                    </DropdownMenuCheckboxItem>
                  )}
                  <DropdownMenuCheckboxItem
                    checked={showSignals}
                    onCheckedChange={(v) => setShowSignals(!!v)}
                  >
                    {c.colSignals}
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Any results can be saved as a saved search (people or companies). */}
              <Button
                variant="outline"
                size="sm"
                onClick={saveSearch}
                disabled={shownCount === 0}
              >
                <Bookmark className="size-4" />
                <span className="hidden sm:inline">{c.saveThis}</span>
              </Button>

              {entity === "companies" ? (
                <Button variant="secondary" size="sm" onClick={findDecisionMakers}>
                  <Users className="size-4" />
                  {c.findPeople}
                </Button>
              ) : (
                <Button
                  variant="volt"
                  size="sm"
                  onClick={() => setSaveOpen(true)}
                  disabled={shownCount === 0}
                >
                  <ListPlus className="size-4" />
                  {c.addToList}
                </Button>
              )}
            </div>
          </div>

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
          {/* Active query chips */}
          <Card className="gap-0 p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <QueryChips query={query} onRemove={removeFilter} c={c} />
              <AddFilterPopover query={query} onAdd={addFilter} c={c} linkedinOn={linkedinOn} entity={entity} />
              {!isQueryEmpty(query) && (
                <button
                  type="button"
                  onClick={() => setQuery({ ...EMPTY_QUERY })}
                  className="text-muted-foreground hover:text-foreground ml-1 inline-flex items-center gap-1 text-xs"
                >
                  <X className="size-3" />
                  {c.clearSel}
                </button>
              )}
            </div>
          </Card>

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
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => toast.success(c.getMoreToast)}
            >
              <Plus className="size-4" />
              {c.getMore}
            </Button>
          </div>

          {/* Results table */}
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              {entity === "people" ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-10 pl-4">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={toggleAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead className="w-14">{c.colFit}</TableHead>
                      <TableHead>{c.colName}</TableHead>
                      <TableHead className="hidden md:table-cell">
                        {c.colCompany}
                      </TableHead>
                      {showRegion && (
                        <TableHead className="hidden lg:table-cell">
                          {c.colRegion}
                        </TableHead>
                      )}
                      {showEmail && (
                        <TableHead className="hidden sm:table-cell">
                          {c.colEmail}
                        </TableHead>
                      )}
                      {showSignals && (
                        <TableHead className="hidden xl:table-cell">
                          {c.colSignals}
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="pl-4">
                          <Checkbox
                            checked={selected.has(l.id)}
                            onCheckedChange={() => toggleRow(l.id)}
                            aria-label={`Select ${l.firstName}`}
                          />
                        </TableCell>
                        <TableCell>
                          <FitBadge fit={l.fit} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarImage
                                src={portraitFor(`${l.firstName} ${l.lastName}`)}
                                alt=""
                              />
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
                              <p className="text-muted-foreground truncate text-xs">
                                {l.title}
                              </p>
                              <MatchLine reasons={matchReasons(l, query)} label={c.matchLabel} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <p className="font-medium">{l.company}</p>
                          <p className="text-muted-foreground text-xs">
                            {l.industry} · {l.headcount}
                          </p>
                        </TableCell>
                        {showRegion && (
                          <TableCell className="text-muted-foreground hidden text-sm lg:table-cell">
                            {l.region}
                          </TableCell>
                        )}
                        {showEmail && (
                          <TableCell className="hidden sm:table-cell">
                            <EmailStatus status={l.emailStatus} c={c} />
                          </TableCell>
                        )}
                        {showSignals && (
                          <TableCell className="hidden xl:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {l.signals.slice(0, 2).map((s) => (
                                <Badge key={s} variant="secondary" className="font-normal">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {leads.length === 0 && <EmptyRow span={7} text={c.noResults} />}
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-10 pl-4">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={toggleAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead className="w-14">{c.colFit}</TableHead>
                      <TableHead>{c.colCompany}</TableHead>
                      <TableHead className="hidden md:table-cell">
                        {c.colIndustry}
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        {c.colHeadcount}
                      </TableHead>
                      {showRegion && (
                        <TableHead className="hidden lg:table-cell">
                          {c.colRegion}
                        </TableHead>
                      )}
                      <TableHead className="hidden sm:table-cell">
                        {c.colRoles}
                      </TableHead>
                      {showSignals && (
                        <TableHead className="hidden xl:table-cell">
                          {c.colSignals}
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((co) => (
                      <TableRow key={co.id}>
                        <TableCell className="pl-4">
                          <Checkbox
                            checked={selected.has(co.id)}
                            onCheckedChange={() => toggleRow(co.id)}
                            aria-label={`Select ${co.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <FitBadge fit={co.fit} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span
                              className="flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white"
                              style={{ backgroundColor: co.logoColor }}
                            >
                              {co.name.slice(0, 2)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium">{co.name}</p>
                              <p className="text-muted-foreground truncate text-xs">
                                {co.domain}
                              </p>
                              <MatchLine reasons={companyMatchReasons(co, query)} label={c.matchLabel} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden text-sm md:table-cell">
                          {co.industry}
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden text-sm lg:table-cell">
                          {co.headcount}
                        </TableCell>
                        {showRegion && (
                          <TableCell className="text-muted-foreground hidden text-sm lg:table-cell">
                            {co.region}
                          </TableCell>
                        )}
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary" className="tabular-nums">
                            {co.openRoles}
                          </Badge>
                        </TableCell>
                        {showSignals && (
                          <TableCell className="hidden xl:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {co.signals.slice(0, 2).map((s) => (
                                <Badge key={s} variant="secondary" className="font-normal">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {companies.length === 0 && <EmptyRow span={8} text={c.noResults} />}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
            </>
          )}
        </div>
      </div>

      <SaveListDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        c={c}
        leads={selectedCount > 0 ? leads.filter((l) => selected.has(l.id)) : leads}
        defaultName={seed ? `${c.similarTo} ${seed.name}` : queryTitle(query, "people")}
        query={query}
        campaigns={campaigns}
        onSaved={(listId) => {
          setSaveOpen(false)
          navigate(`/lists/${listId}`)
        }}
      />

      <LookalikeDialog
        open={lookalikeOpen}
        onOpenChange={setLookalikeOpen}
        c={c}
        onConfirm={applyLookalike}
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
  onConfirm: (seed: LookalikeSeed, query: AiQuery, modLabel: string) => void
}) {
  const [seedId, setSeedId] = React.useState<string | null>(null)
  const [mods, setMods] = React.useState<Set<string>>(new Set())
  const [wasOpen, setWasOpen] = React.useState(false)

  if (open && !wasOpen) {
    setWasOpen(true)
    setSeedId(null)
    setMods(new Set())
  }
  if (!open && wasOpen) setWasOpen(false)

  const seed = LOOKALIKE_SEEDS.find((s) => s.id === seedId) ?? null
  const people = LOOKALIKE_SEEDS.filter((s) => s.kind === "person")
  const companies = LOOKALIKE_SEEDS.filter((s) => s.kind === "company")

  function toggleMod(m: string) {
    setMods((prev) => {
      const next = new Set(prev)
      // smaller / larger are mutually exclusive
      if (m === "smaller" && next.has("larger")) next.delete("larger")
      if (m === "larger" && next.has("smaller")) next.delete("smaller")
      if (next.has(m)) next.delete(m)
      else next.add(m)
      return next
    })
  }

  function confirm() {
    if (!seed) return
    const q: AiQuery = { ...EMPTY_QUERY }
    let modLabel = ""
    if (mods.has("smaller")) {
      q.headcount = smallerThan(seed.headcount)
      modLabel = c === COPY.es ? " pero más pequeñas" : " but smaller"
    }
    if (mods.has("larger")) {
      q.headcount = largerThan(seed.headcount)
      modLabel = c === COPY.es ? " pero más grandes" : " but larger"
    }
    if (mods.has("region")) q.regions = [seed.region]
    if (mods.has("senior") && seed.kind === "person") q.seniority = ["C-Level", "VP"]
    onConfirm(seed, q, modLabel)
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
            <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
              <SeedGroup
                label={c.seedCompanies}
                seeds={companies}
                selected={seedId}
                onSelect={setSeedId}
              />
              <SeedGroup
                label={c.seedPeople}
                seeds={people}
                selected={seedId}
                onSelect={setSeedId}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{c.modifiers}</Label>
            <div className="flex flex-wrap gap-1.5">
              <ModChip active={mods.has("smaller")} onClick={() => toggleMod("smaller")} label={c.modSmaller} />
              <ModChip active={mods.has("larger")} onClick={() => toggleMod("larger")} label={c.modLarger} />
              <ModChip active={mods.has("region")} onClick={() => toggleMod("region")} label={c.modRegion} />
              {seed?.kind === "person" && (
                <ModChip active={mods.has("senior")} onClick={() => toggleMod("senior")} label={c.modSenior} />
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

function ModChip({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "hover:bg-muted"
      )}
    >
      {label}
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

function EmptyRow({ span, text }: { span: number; text: string }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={span} className="h-32 text-center">
        <p className="text-muted-foreground text-sm">{text}</p>
      </TableCell>
    </TableRow>
  )
}

const CHIP_GROUPS: (keyof AiQuery)[] = [
  "titles",
  "seniority",
  "regions",
  "industries",
  "headcount",
  "departments",
  "technologies",
  "revenue",
  "founded",
  "growth",
  "intent",
  "signals",
  "linkedin",
]

function QueryChips({
  query,
  onRemove,
  c,
}: {
  query: AiQuery
  onRemove: (group: keyof AiQuery, value: string) => void
  c: Copy
}) {
  const chips = CHIP_GROUPS.flatMap((group) =>
    (query[group] as string[]).map((value) => ({ group, value }))
  )
  if (chips.length === 0) {
    return (
      <span className="text-muted-foreground text-sm">
        {c.addFilter} →
      </span>
    )
  }
  return (
    <>
      {chips.map(({ group, value }) => (
        <span
          key={`${group}:${value}`}
          className={cn(
            "inline-flex items-center gap-1 rounded-full py-1 pr-1 pl-2.5 text-xs font-medium",
            group === "linkedin"
              ? "bg-[#0a66c2]/10 text-[#0a66c2]"
              : "bg-primary/10 text-primary"
          )}
        >
          {group === "linkedin" && <LinkedinIcon className="size-3" />}
          {value}
          <button
            type="button"
            aria-label={`Remove ${value}`}
            onClick={() => onRemove(group, value)}
            className="rounded-full p-0.5 hover:bg-black/10"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
    </>
  )
}

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
]

// Type-ahead "Add filter": type to filter suggestions across every field, or
// type any custom value and add it as a title (manual entry).
function AddFilterPopover({
  query,
  onAdd,
  c,
  linkedinOn,
  entity,
}: {
  query: AiQuery
  onAdd: (group: keyof AiQuery, value: string) => void
  c: Copy
  linkedinOn: boolean
  entity: AiEntity
}) {
  const [open, setOpen] = React.useState(false)
  const [text, setText] = React.useState("")
  const [showAll, setShowAll] = React.useState(false)
  const q = text.trim().toLowerCase()

  // Groups available for the current entity / LinkedIn state.
  const groups = React.useMemo(
    () =>
      FILTER_OPTIONS.filter(
        (g) => !(g.linkedinOnly && !linkedinOn) && !(g.scope && g.scope !== entity)
      ),
    [linkedinOn, entity]
  )

  const suggestions = React.useMemo(() => {
    const rows: { group: keyof AiQuery; groupLabel: string; value: string }[] = []
    for (const group of groups) {
      for (const value of group.options) {
        if ((query[group.key] as string[]).includes(value)) continue
        if (q && !value.toLowerCase().includes(q)) continue
        rows.push({ group: group.key, groupLabel: group.label(c), value })
      }
    }
    return rows.slice(0, 40)
  }, [query, q, c, groups])

  const exact = text.trim()
    ? suggestions.some((s) => s.value.toLowerCase() === q)
    : true

  function reset() {
    setText("")
    setShowAll(false)
  }
  function add(group: keyof AiQuery, value: string) {
    onAdd(group, value)
    setText("")
  }
  // Describe filters in natural language — interpret and apply them all.
  function askAi(prompt: string) {
    const iq = interpretPrompt(prompt).query
    ;(Object.keys(iq) as (keyof AiQuery)[]).forEach((k) => {
      if (k === "keywords") return
      ;(iq[k] as string[]).forEach((v) => onAdd(k, v))
    })
    reset()
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) reset()
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs">
          <Plus className="size-3.5" />
          {c.addFilter}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        {/* AI-prompt + search box (always present) */}
        <div className="border-b p-2">
          <div className="relative">
            <Sparkles className="text-primary pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  if (text.trim() && !exact) askAi(text.trim())
                  else if (suggestions[0]) add(suggestions[0].group, suggestions[0].value)
                }
              }}
              placeholder={c.filterTypeahead}
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>

        {showAll ? (
          // View all filters — every group and option, grouped.
          <div className="max-h-72 overflow-y-auto p-2">
            {groups.map((group) => (
              <div key={group.key} className="mb-2">
                <p className="text-muted-foreground px-1 py-1 text-[10px] font-medium tracking-wide uppercase">
                  {group.label(c)}
                </p>
                <div className="flex flex-wrap gap-1 px-1">
                  {group.options
                    .filter((v) => !q || v.toLowerCase().includes(q))
                    .map((value) => {
                      const active = (query[group.key] as string[]).includes(value)
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => onAdd(group.key, value)}
                          disabled={active}
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-xs transition-colors",
                            active
                              ? "border-primary/40 bg-primary/10 text-primary cursor-default"
                              : "hover:bg-muted"
                          )}
                        >
                          {value}
                        </button>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto p-1">
            {text.trim() && !exact && (
              <>
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
                  onClick={() => add("titles", text.trim())}
                  className="hover:bg-muted flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                >
                  <Plus className="text-muted-foreground size-4 shrink-0" />
                  <span className="truncate">{c.addCustom(text.trim())}</span>
                </button>
              </>
            )}
            {suggestions.map((s) => (
              <button
                key={`${s.group}:${s.value}`}
                type="button"
                onClick={() => add(s.group, s.value)}
                className="hover:bg-muted flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
              >
                <span className="truncate">{s.value}</span>
                <span className="text-muted-foreground shrink-0 text-[10px] tracking-wide uppercase">
                  {s.groupLabel}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Footer: view all / back */}
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="text-primary hover:bg-muted flex w-full items-center gap-1.5 border-t px-3 py-2 text-xs font-medium"
        >
          {showAll ? (
            <>
              <ArrowRight className="size-3.5 rotate-180" />
              {c.backToFilterSearch}
            </>
          ) : (
            <>
              <ListPlus className="size-3.5" />
              {c.viewAllFilters}
            </>
          )}
        </button>
      </PopoverContent>
    </Popover>
  )
}

function aiLeadToCriteria(query: AiQuery): SavedSearchCriteria {
  return {
    titles: query.titles,
    seniority: query.seniority,
    industries: query.industries,
    headcount: query.headcount,
    locations: query.regions,
    keywords: query.keywords,
    signals: query.signals,
  }
}

function SaveListDialog({
  open,
  onOpenChange,
  c,
  leads,
  defaultName,
  query,
  campaigns,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  c: Copy
  leads: AiLead[]
  defaultName: string
  query: AiQuery
  campaigns: { id: string; name: string }[]
  onSaved: (listId: string) => void
}) {
  const [name, setName] = React.useState(defaultName)
  const [campaign, setCampaign] = React.useState<string>(NO_CAMPAIGN)
  const [wasOpen, setWasOpen] = React.useState(false)

  // Reset fields each time the dialog opens (render-time, no effect).
  if (open && !wasOpen) {
    setWasOpen(true)
    setName(defaultName)
    setCampaign(NO_CAMPAIGN)
  }
  if (!open && wasOpen) setWasOpen(false)

  function handleSave() {
    // Materialize AI leads into real prospects.
    const ids = leads.map((l) => {
      const email =
        l.emailStatus === "missing"
          ? ""
          : `${l.firstName}.${l.lastName}@${l.companyDomain}`.toLowerCase()
      const p = prospectStore.create({
        firstName: l.firstName,
        lastName: l.lastName,
        title: l.title,
        company: l.company,
        companyDomain: l.companyDomain,
        location: l.location,
        email,
        linkedinUrl: `https://linkedin.com/in/${l.firstName}${l.lastName}`.toLowerCase(),
        avatarColor: l.avatarColor,
        score: l.fit,
        status: "new",
        tags: ["AI search", l.region],
        seniority: l.seniority,
        department: l.department,
        headcount: l.headcount,
        industry: l.industry,
        revenue: l.revenue,
        about: `${l.title} at ${l.company}.`,
        signals: l.signals,
      })
      return p.id
    })

    const list = listStore.create({
      name: name.trim() || defaultName,
      description: `${ids.length} AI-sourced leads`,
      color: LIST_COLORS[Math.floor(Math.random() * LIST_COLORS.length)],
      source: "search",
      prospectIds: ids,
      dynamic: true,
      criteria: aiLeadToCriteria(query),
      enrichment: "continuous",
      newPerWeek: Math.max(5, Math.round(ids.length * 0.4)),
    })

    if (campaign === NEW_CAMPAIGN) {
      const camp = campaignStore.create({ name: `${list.name} outreach` })
      campaignStore.attachList(camp.id, list.id)
    } else if (campaign !== NO_CAMPAIGN) {
      campaignStore.attachList(campaign, list.id)
    }

    toast.success(c.savedListToast(list.name))
    onSaved(list.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{c.saveTitle}</DialogTitle>
          <DialogDescription>{c.saveDesc(leads.length)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="ai-list-name">{c.listName}</Label>
            <Input
              id="ai-list-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ai-list-campaign">{c.connectCampaign}</Label>
            <Select value={campaign} onValueChange={setCampaign}>
              <SelectTrigger id="ai-list-campaign" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CAMPAIGN}>{c.noCampaign}</SelectItem>
                <SelectItem value={NEW_CAMPAIGN}>{c.newCampaign}</SelectItem>
                {campaigns.map((cm) => (
                  <SelectItem key={cm.id} value={cm.id}>
                    {cm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-muted-foreground bg-muted/50 flex items-start gap-2 rounded-md px-3 py-2 text-xs">
            <ArrowRight className="mt-0.5 size-3.5 shrink-0" />
            {c.dynamicNote}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="volt" onClick={handleSave}>
            <ListPlus className="size-4" />
            {c.saveList}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
