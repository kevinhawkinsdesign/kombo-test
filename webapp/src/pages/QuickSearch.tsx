import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, SlidersHorizontal, Users, Building2, CheckCircle2, CircleDashed } from "lucide-react"

import { Page } from "@/components/layout/Page"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { HomeModules } from "@/components/home/HomeModules"
import { useLocale, type Locale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import { portraitFor } from "@/lib/avatars"
import { initials } from "@/lib/format"
import {
  interpretPrompt,
  searchLeads,
  searchCompanies,
  estimatedTotal,
  type AiEntity,
  type AiLead,
  type AiCompany,
} from "@/lib/mock-ai-search"

const COPY = {
  en: {
    people: "Prospects",
    companies: "Companies",
    heroTitle: "Describe your ideal customer",
    heroSubtitle: "Search across 250M+ professionals and companies — or pick a quick start.",
    heroPlaceholder: "e.g. Heads of RevOps at Series B SaaS companies in EMEA…",
    searchBtn: "Search",
    searchWithFilters: "Search with filters",
    previewLocation: "Location",
    previewRole: "Role",
    previewIndustry: "Industry",
    previewSize: "Company size",
    previewGrowth: "Growth",
    previewSignals: "Signals",
    previewSeeAllPeople: "See all prospects",
    previewSeeAllCompanies: "See all companies",
    previewEmpty: "No matches yet — try broadening your search.",
  },
  es: {
    people: "Prospectos",
    companies: "Empresas",
    heroTitle: "Describe tu cliente ideal",
    heroSubtitle: "Busca entre más de 250M de profesionales y empresas — o elige un inicio rápido.",
    heroPlaceholder: "p. ej. Heads de RevOps en SaaS Serie B en EMEA…",
    searchBtn: "Buscar",
    searchWithFilters: "Buscar con filtros",
    previewLocation: "Ubicación",
    previewRole: "Cargo",
    previewIndustry: "Sector",
    previewSize: "Tamaño de empresa",
    previewGrowth: "Crecimiento",
    previewSignals: "Señales",
    previewSeeAllPeople: "Ver todos los prospectos",
    previewSeeAllCompanies: "Ver todas las empresas",
    previewEmpty: "Aún no hay coincidencias — prueba a ampliar la búsqueda.",
  },
  it: {
    people: "Prospect",
    companies: "Aziende",
    heroTitle: "Descrivi il tuo cliente ideale",
    heroSubtitle: "Cerca tra oltre 250M di professionisti e aziende — o scegli un avvio rapido.",
    heroPlaceholder: "es. Heads di RevOps in aziende SaaS Serie B in EMEA…",
    searchBtn: "Cerca",
    searchWithFilters: "Cerca con filtri",
    previewLocation: "Posizione",
    previewRole: "Ruolo",
    previewIndustry: "Settore",
    previewSize: "Dimensione azienda",
    previewGrowth: "Crescita",
    previewSignals: "Segnali",
    previewSeeAllPeople: "Vedi tutti i prospect",
    previewSeeAllCompanies: "Vedi tutte le aziende",
    previewEmpty: "Ancora nessuna corrispondenza — prova ad ampliare la ricerca.",
  },
  fr: {
    people: "Prospects",
    companies: "Entreprises",
    heroTitle: "Décrivez votre client idéal",
    heroSubtitle: "Recherchez parmi plus de 250M de professionnels et entreprises — ou choisissez un démarrage rapide.",
    heroPlaceholder: "p. ex. Heads de RevOps dans des entreprises SaaS Série B en EMEA…",
    searchBtn: "Rechercher",
    searchWithFilters: "Rechercher avec filtres",
    previewLocation: "Localisation",
    previewRole: "Poste",
    previewIndustry: "Secteur",
    previewSize: "Taille de l'entreprise",
    previewGrowth: "Croissance",
    previewSignals: "Signaux",
    previewSeeAllPeople: "Voir tous les prospects",
    previewSeeAllCompanies: "Voir toutes les entreprises",
    previewEmpty: "Aucun résultat pour l'instant — essayez d'élargir votre recherche.",
  },
  de: {
    people: "Prospects",
    companies: "Unternehmen",
    heroTitle: "Beschreibe deinen idealen Kunden",
    heroSubtitle: "Durchsuche über 250 Mio. Fachkräfte und Unternehmen — oder wähle einen Schnellstart.",
    heroPlaceholder: "z. B. Heads of RevOps bei SaaS-Unternehmen der Serie B in EMEA…",
    searchBtn: "Suchen",
    searchWithFilters: "Mit Filtern suchen",
    previewLocation: "Standort",
    previewRole: "Rolle",
    previewIndustry: "Branche",
    previewSize: "Unternehmensgröße",
    previewGrowth: "Wachstum",
    previewSignals: "Signale",
    previewSeeAllPeople: "Alle Prospects anzeigen",
    previewSeeAllCompanies: "Alle Unternehmen anzeigen",
    previewEmpty: "Noch keine Treffer — versuche, deine Suche zu erweitern.",
  },
  pt: {
    people: "Prospects",
    companies: "Empresas",
    heroTitle: "Descreve o teu cliente ideal",
    heroSubtitle: "Pesquisa entre mais de 250M de profissionais e empresas — ou escolhe um início rápido.",
    heroPlaceholder: "p. ex. Heads de RevOps em empresas SaaS Série B na EMEA…",
    searchBtn: "Pesquisar",
    searchWithFilters: "Pesquisar com filtros",
    previewLocation: "Localização",
    previewRole: "Cargo",
    previewIndustry: "Setor",
    previewSize: "Dimensão da empresa",
    previewGrowth: "Crescimento",
    previewSignals: "Sinais",
    previewSeeAllPeople: "Ver todos os prospects",
    previewSeeAllCompanies: "Ver todas as empresas",
    previewEmpty: "Ainda sem correspondências — tenta alargar a pesquisa.",
  },
  pt_BR: {
    people: "Prospects",
    companies: "Empresas",
    heroTitle: "Descreva seu cliente ideal",
    heroSubtitle: "Pesquise entre mais de 250M de profissionais e empresas — ou escolha um início rápido.",
    heroPlaceholder: "p. ex. Heads de RevOps em empresas SaaS Série B na EMEA…",
    searchBtn: "Pesquisar",
    searchWithFilters: "Pesquisar com filtros",
    previewLocation: "Localização",
    previewRole: "Cargo",
    previewIndustry: "Setor",
    previewSize: "Tamanho da empresa",
    previewGrowth: "Crescimento",
    previewSignals: "Sinais",
    previewSeeAllPeople: "Ver todos os prospects",
    previewSeeAllCompanies: "Ver todas as empresas",
    previewEmpty: "Ainda sem correspondências — tente ampliar sua busca.",
  },
} as const

type Copy = (typeof COPY)[Locale]

/**
 * Sidebar "Search" entry point: the permanent AI search prompt + entity tabs,
 * with the same customizable module grid that lives on Home (see
 * HomeModules). Submitting a prompt hands off to Signals (/search) so the
 * URL matches the results. Kept distinct from Signals' own AI-suggestion
 * feed and from Home's quick actions.
 */
export default function QuickSearch() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const [entity, setEntity] = React.useState<AiEntity>("people")
  const [input, setInput] = React.useState("")

  function runPrompt(prompt: string) {
    const text = prompt.trim()
    if (!text) return
    navigate(`/search?q=${encodeURIComponent(text)}`)
  }

  return (
    <Page>
      <SearchHero
        c={c}
        input={input}
        setInput={setInput}
        onRun={runPrompt}
        onSearchWithFilters={() => navigate("/search?filters=1")}
        entity={entity}
        setEntity={setEntity}
      />
    </Page>
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

function SearchHero({
  c,
  input,
  setInput,
  onRun,
  onSearchWithFilters,
  entity,
  setEntity,
}: {
  c: Copy
  input: string
  setInput: (v: string) => void
  onRun: (prompt: string) => void
  onSearchWithFilters: () => void
  entity: AiEntity
  setEntity: (e: AiEntity) => void
}) {
  // The live preview dropdown opens once there's text to interpret, and
  // closes on outside click / Escape / submit — a pointerdown listener
  // (rather than textarea onBlur) so clicking a button inside the preview
  // (e.g. "See all") doesn't get dismissed by the blur firing first.
  const previewRef = React.useRef<HTMLDivElement>(null)
  const [previewOpen, setPreviewOpen] = React.useState(false)

  React.useEffect(() => {
    if (!previewOpen) return
    function handlePointerDown(e: PointerEvent) {
      if (previewRef.current && !previewRef.current.contains(e.target as Node)) {
        setPreviewOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setPreviewOpen(false)
    }
    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [previewOpen])

  return (
    <div className="mx-auto max-w-5xl py-8">
      {/* The search hero stays permanently at the top; the customizable module
          grid flows below it. The hero keeps its narrow, centered column. */}
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <h1 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          {c.heroTitle}
        </h1>
        <p className="text-muted-foreground mt-2 text-center text-sm">{c.heroSubtitle}</p>

        {/* Entity tabs + AI prompt share one ref so switching tabs while the
            preview is open counts as "inside" — it should update the live
            preview for the new entity, not dismiss it. */}
        <div ref={previewRef} className="flex w-full flex-col items-center">
          {/* Entity tabs */}
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
          </div>

          {/* AI prompt */}
          <div className="relative mt-3 w-full">
            <form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault()
                setPreviewOpen(false)
                onRun(input)
              }}
            >
              <div className="relative">
                <Textarea
                  id="search-prompt"
                  autoFocus
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    setPreviewOpen(e.target.value.trim().length > 0)
                  }}
                  onFocus={() => {
                    if (input.trim()) setPreviewOpen(true)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      setPreviewOpen(false)
                      onRun(input)
                    }
                  }}
                  placeholder={c.heroPlaceholder}
                  rows={3}
                  className="resize-none items-center rounded-xl p-4 pr-14 text-base"
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

            {previewOpen && input.trim() && (
              <AiSearchPreview
                input={input}
                entity={entity}
                c={c}
                onSeeAll={() => {
                  setPreviewOpen(false)
                  onRun(input)
                }}
              />
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSearchWithFilters}
            className="text-muted-foreground hover:text-foreground mt-2 gap-1.5"
          >
            <SlidersHorizontal className="size-3.5" />
            {c.searchWithFilters}
          </Button>
        </div>
      </div>

      {/* Modular, customizable cards below the permanent search. */}
      <HomeModules />
    </div>
  )
}

// Live typeahead preview: as the user types, show which filters Kai has
// picked up (checked once detected) and a sample of 5 matching results — so
// the search feels understood before running it.
function AiSearchPreview({
  input,
  entity,
  onSeeAll,
  c,
}: {
  input: string
  entity: AiEntity
  onSeeAll: () => void
  c: Copy
}) {
  const { query } = React.useMemo(() => interpretPrompt(input), [input])

  const results = React.useMemo(
    () => (entity === "companies" ? searchCompanies(query) : searchLeads(query)),
    [entity, query]
  )
  const sample = results.slice(0, 5)
  const total = estimatedTotal(results.length, entity)
  const entityLabel = entity === "companies" ? c.companies : c.people

  const chips: { key: string; label: string; active: boolean }[] =
    entity === "companies"
      ? [
          { key: "location", label: c.previewLocation, active: query.regions.length > 0 },
          { key: "industry", label: c.previewIndustry, active: query.industries.length > 0 },
          { key: "size", label: c.previewSize, active: query.headcount.length > 0 },
          { key: "growth", label: c.previewGrowth, active: query.growth.length > 0 },
          { key: "signals", label: c.previewSignals, active: query.signals.length > 0 },
        ]
      : [
          { key: "location", label: c.previewLocation, active: query.regions.length > 0 },
          {
            key: "role",
            label: c.previewRole,
            active: query.titles.length > 0 || query.seniority.length > 0,
          },
          { key: "industry", label: c.previewIndustry, active: query.industries.length > 0 },
          { key: "size", label: c.previewSize, active: query.headcount.length > 0 },
          { key: "signals", label: c.previewSignals, active: query.signals.length > 0 },
        ]

  return (
    <Card className="absolute inset-x-0 top-full z-20 mt-2 gap-0 overflow-hidden p-0 shadow-lg">
      <div className="flex flex-wrap gap-2 border-b p-3">
        {chips.map((chip) => (
          <span
            key={chip.key}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
              chip.active
                ? "border-chart-1/40 bg-chart-1/10 text-chart-1"
                : "text-muted-foreground border-border"
            )}
          >
            {chip.active ? (
              <CheckCircle2 className="size-3.5" />
            ) : (
              <CircleDashed className="size-3.5" />
            )}
            {chip.label}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between px-3 py-2.5">
        <p className="text-sm font-medium">
          {entityLabel} ({total.toLocaleString()})
        </p>
        <Button variant="ghost" size="sm" className="gap-1" onClick={onSeeAll}>
          {entity === "companies" ? c.previewSeeAllCompanies : c.previewSeeAllPeople}
          <ArrowRight className="size-3.5" />
        </Button>
      </div>

      {sample.length > 0 ? (
        <div className="divide-y border-t">
          {entity === "companies"
            ? (sample as AiCompany[]).map((co) => (
                <div key={co.id} className="flex items-center gap-3 px-3 py-2.5">
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white"
                    style={{ backgroundColor: co.logoColor }}
                  >
                    {co.name.slice(0, 2)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{co.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {co.industry} · {co.headcount}
                    </p>
                  </div>
                </div>
              ))
            : (sample as AiLead[]).map((l) => (
                <div key={l.id} className="flex items-center gap-3 px-3 py-2.5">
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={portraitFor(`${l.firstName} ${l.lastName}`)} alt="" />
                    <AvatarFallback
                      style={{ backgroundColor: l.avatarColor, color: "white" }}
                      className="text-xs"
                    >
                      {initials(l.firstName, l.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {l.firstName} {l.lastName}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {l.title} · {l.company}
                    </p>
                  </div>
                </div>
              ))}
        </div>
      ) : (
        <p className="text-muted-foreground border-t px-3 py-6 text-center text-sm">
          {c.previewEmpty}
        </p>
      )}
    </Card>
  )
}
