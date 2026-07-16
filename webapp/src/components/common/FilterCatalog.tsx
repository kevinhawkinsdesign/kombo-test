import * as React from "react"
import {
  Activity,
  Briefcase,
  Building2,
  Calendar,
  CircleDollarSign,
  CircleUser,
  Cpu,
  Eye,
  Factory,
  GraduationCap,
  Languages,
  ListOrdered,
  Mail,
  MapPin,
  MessageSquare,
  Minus,
  Newspaper,
  Phone,
  Plus,
  Repeat,
  Search,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { Locale } from "@/lib/locale"
import type { FilterSection } from "@/lib/search-facets"
import { baseValue, excludeValue, isExcluded, splitSelection } from "@/lib/filter-polarity"
import { useIcps } from "@/lib/mock-icps"

// One filter in the catalog — typed AiQuery groups and per-database facets
// both map onto this shape (the caller dispatches by id).
export interface CatalogFilterDef {
  id: string
  label: string
  options: string[]
  section: FilterSection
  popular?: boolean
  linkedin?: boolean
}

const COPY = {
  en: {
    include: "Include",
    exclude: "Exclude",
    clear: "Clear",
    popular: "Popular",
    not: (v: string) => `Not: ${v}`,
    sections: {
      contact: "Contact information",
      company: "Company information",
      intent: "Intent",
    } satisfies Record<FilterSection, string>,
    addValue: (label: string) => `Add ${label.toLowerCase()}…`,
    removeAria: (v: string) => `Remove ${v}`,
    includeAria: (v: string) => `Include ${v}`,
    excludeAria: (v: string) => `Exclude ${v}`,
    clearAria: (label: string) => `Clear ${label}`,
    autoAddIcpTitles: "Auto-add your ICP job titles",
  },
  es: {
    include: "Incluir",
    exclude: "Excluir",
    clear: "Limpiar",
    popular: "Popular",
    not: (v: string) => `No: ${v}`,
    sections: {
      contact: "Información de contacto",
      company: "Información de la empresa",
      intent: "Intención",
    } satisfies Record<FilterSection, string>,
    addValue: (label: string) => `Añadir ${label.toLowerCase()}…`,
    removeAria: (v: string) => `Quitar ${v}`,
    includeAria: (v: string) => `Incluir ${v}`,
    excludeAria: (v: string) => `Excluir ${v}`,
    clearAria: (label: string) => `Limpiar ${label}`,
    autoAddIcpTitles: "Añadir automáticamente los cargos de tu PCI",
  },
  it: {
    include: "Includi",
    exclude: "Escludi",
    clear: "Cancella",
    popular: "Popolare",
    not: (v: string) => `Non: ${v}`,
    sections: {
      contact: "Informazioni di contatto",
      company: "Informazioni sull'azienda",
      intent: "Intento",
    } satisfies Record<FilterSection, string>,
    addValue: (label: string) => `Aggiungi ${label.toLowerCase()}…`,
    removeAria: (v: string) => `Rimuovi ${v}`,
    includeAria: (v: string) => `Includi ${v}`,
    excludeAria: (v: string) => `Escludi ${v}`,
    clearAria: (label: string) => `Cancella ${label}`,
    autoAddIcpTitles: "Aggiungi automaticamente i ruoli del tuo ICP",
  },
  fr: {
    include: "Inclure",
    exclude: "Exclure",
    clear: "Effacer",
    popular: "Populaire",
    not: (v: string) => `Non : ${v}`,
    sections: {
      contact: "Informations de contact",
      company: "Informations sur l'entreprise",
      intent: "Intention",
    } satisfies Record<FilterSection, string>,
    addValue: (label: string) => `Ajouter ${label.toLowerCase()}…`,
    removeAria: (v: string) => `Retirer ${v}`,
    includeAria: (v: string) => `Inclure ${v}`,
    excludeAria: (v: string) => `Exclure ${v}`,
    clearAria: (label: string) => `Effacer ${label}`,
    autoAddIcpTitles: "Ajouter automatiquement les intitulés de poste de votre ICP",
  },
  de: {
    include: "Einschließen",
    exclude: "Ausschließen",
    clear: "Leeren",
    popular: "Beliebt",
    not: (v: string) => `Nicht: ${v}`,
    sections: {
      contact: "Kontaktinformationen",
      company: "Unternehmensinformationen",
      intent: "Intent",
    } satisfies Record<FilterSection, string>,
    addValue: (label: string) => `${label} hinzufügen…`,
    removeAria: (v: string) => `${v} entfernen`,
    includeAria: (v: string) => `${v} einschließen`,
    excludeAria: (v: string) => `${v} ausschließen`,
    clearAria: (label: string) => `${label} leeren`,
    autoAddIcpTitles: "Jobtitel deines ICP automatisch hinzufügen",
  },
  pt: {
    include: "Incluir",
    exclude: "Excluir",
    clear: "Limpar",
    popular: "Popular",
    not: (v: string) => `Não: ${v}`,
    sections: {
      contact: "Informações de contacto",
      company: "Informações da empresa",
      intent: "Intenção",
    } satisfies Record<FilterSection, string>,
    addValue: (label: string) => `Adicionar ${label.toLowerCase()}…`,
    removeAria: (v: string) => `Remover ${v}`,
    includeAria: (v: string) => `Incluir ${v}`,
    excludeAria: (v: string) => `Excluir ${v}`,
    clearAria: (label: string) => `Limpar ${label}`,
    autoAddIcpTitles: "Adicionar automaticamente os cargos do seu ICP",
  },
  pt_BR: {
    include: "Incluir",
    exclude: "Excluir",
    clear: "Limpar",
    popular: "Popular",
    not: (v: string) => `Não: ${v}`,
    sections: {
      contact: "Informações de contato",
      company: "Informações da empresa",
      intent: "Intenção",
    } satisfies Record<FilterSection, string>,
    addValue: (label: string) => `Adicionar ${label.toLowerCase()}…`,
    removeAria: (v: string) => `Remover ${v}`,
    includeAria: (v: string) => `Incluir ${v}`,
    excludeAria: (v: string) => `Excluir ${v}`,
    clearAria: (label: string) => `Limpar ${label}`,
    autoAddIcpTitles: "Adicionar automaticamente os cargos do seu ICP",
  },
} as const

type CatalogCopy = (typeof COPY)[keyof typeof COPY]

const SECTION_ORDER: FilterSection[] = ["contact", "company", "intent"]

type IconType = React.ComponentType<{ className?: string }>

// Semantic leading icon per filter (Enginy-style). Resolved by keywords in the
// filter id + label so both the typed groups and every facet catalog map
// without per-entry metadata; falls back by section.
const ICON_RULES: [RegExp, IconType][] = [
  [/title|cargo|persona\b/, Briefcase],
  [/keyword|palabras/, Search],
  [/region|geo|country|location|ubicaci|hq|sede|pa[ií]s/, MapPin],
  [/industr|sector|naics|sic\b/, Factory],
  [/seniority|management|antig|nivel/, Users],
  [/function|department|funci|departamento/, Target],
  [/years|años|founded|fundaci/, Calendar],
  [/experience|experiencia/, Star],
  [/revenue|ingresos|funding|financiaci/, CircleDollarSign],
  [/headcount|size|tama|plantilla|employees|growth|crecimiento/, TrendingUp],
  [/technolog|tecnolog/, Cpu],
  [/language|idioma/, Languages],
  [/school|escuela|educa/, GraduationCap],
  [/first name|last name|nombre|apellido|gender|género/, CircleUser],
  [/email/, Mail],
  [/contact info|datos de contacto|phone|tel[eé]fono/, Phone],
  [/posted|publicó|post\b/, MessageSquare],
  [/changed jobs|cambió/, Repeat],
  [/viewed|vio\b/, Eye],
  [/news|noticias/, Newspaper],
  [/fortune|list|lista/, ListOrdered],
  [/signal|señal|intent|intención|activit|actividad/, Activity],
  [/compan|empresa|account|cuenta/, Building2],
  [/connection|conexi|follower|seguidor|group|grupo|colleague|network/, Users],
]

const SECTION_FALLBACK: Record<FilterSection, IconType> = {
  contact: CircleUser,
  company: Building2,
  intent: Zap,
}

function filterIcon(f: CatalogFilterDef): IconType {
  const hay = `${f.id} ${f.label}`.toLowerCase()
  for (const [re, icon] of ICON_RULES) if (re.test(hay)) return icon
  return SECTION_FALLBACK[f.section]
}

// Filters where AI can suggest values (Enginy marks these with a sparkle):
// job titles, geography/locations and industries.
function isAiSuggestable(f: CatalogFilterDef): boolean {
  return /title|cargo|region|geo|country|location|ubicaci|hq|sede|pa[ií]s|industr|sector/.test(
    `${f.id} ${f.label}`.toLowerCase()
  )
}

// Single-option Intent filters render as one-tap toggle rows (Enginy style)
// instead of an expandable Include/Exclude list.
function isToggleFilter(f: CatalogFilterDef): boolean {
  return f.section === "intent" && f.options.length === 1
}

// Global-typeahead visibility: filters with options show when any option
// matches; option-less (free-text) filters match on their label.
function matchesQuery(f: CatalogFilterDef, q: string): boolean {
  if (!q) return true
  if (f.options.length > 0)
    return f.options.some((o) => o.toLowerCase().includes(q))
  return f.label.toLowerCase().includes(q)
}

/**
 * Enginy-style sectioned filter catalog: filters grouped under Contact /
 * Company / Intent headers, each expandable into selected-value chips, a
 * free-text input (Enter = include) and per-option Include | Exclude actions.
 * Selected values arrive raw — excluded ones carry the "!" prefix (see
 * filter-polarity.ts).
 */
export function FilterCatalog({
  filters,
  selected,
  onInclude,
  onExclude,
  onRemove,
  onClear,
  locale,
  query,
}: {
  filters: CatalogFilterDef[]
  selected: (id: string) => string[] // raw values incl. "!"-prefixed
  onInclude: (id: string, value: string) => void
  onExclude: (id: string, value: string) => void
  onRemove: (id: string, value: string) => void // removes either polarity (raw value)
  onClear: (id: string) => void
  locale: Locale
  query?: string // optional global type-ahead filter string
}) {
  const copy = COPY[locale]
  const [openFilters, setOpenFilters] = React.useState<Set<string>>(new Set())
  const q = (query ?? "").trim().toLowerCase()

  function toggleOpen(id: string) {
    setOpenFilters((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const sections = SECTION_ORDER.map((section) => ({
    section,
    filters: filters.filter((f) => f.section === section && matchesQuery(f, q)),
  })).filter((s) => s.filters.length > 0)

  return (
    <div>
      {sections.map(({ section, filters: sectionFilters }) => (
        <div key={section}>
          <p className="text-muted-foreground bg-muted/40 px-2 py-1.5 text-[10px] font-semibold tracking-wider uppercase">
            {copy.sections[section]}
          </p>
          {sectionFilters.map((f) =>
            isToggleFilter(f) ? (
              <ToggleRow
                key={f.id}
                filter={f}
                copy={copy}
                on={selected(f.id).length > 0}
                onChange={(checked) =>
                  checked ? onInclude(f.id, f.options[0]) : onClear(f.id)
                }
              />
            ) : (
              <FilterRow
                key={f.id}
                filter={f}
                copy={copy}
                // A global search force-expands the matching filters.
                open={q ? true : openFilters.has(f.id)}
                onToggleOpen={() => toggleOpen(f.id)}
                values={selected(f.id)}
                globalQuery={q}
                onInclude={onInclude}
                onExclude={onExclude}
                onRemove={onRemove}
                onClear={onClear}
              />
            )
          )}
        </div>
      ))}
    </div>
  )
}

// One-tap Intent filter (single option) — Enginy renders these as switches.
function ToggleRow({
  filter,
  copy,
  on,
  onChange,
}: {
  filter: CatalogFilterDef
  copy: CatalogCopy
  on: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="border-border/70 flex items-center gap-2 border-b px-2 py-2 last:border-b-0">
      {React.createElement(filterIcon(filter), {
        className: cn(
          "size-3.5 shrink-0",
          filter.linkedin ? "text-[#0a66c2]" : "text-muted-foreground"
        ),
      })}
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
        {filter.label}
      </span>
      {filter.popular && (
        <Badge
          variant="secondary"
          className="text-primary bg-primary/10 rounded-full px-1.5 py-0.5 text-[10px] leading-none"
        >
          {copy.popular}
        </Badge>
      )}
      <Switch checked={on} onCheckedChange={onChange} aria-label={filter.label} />
    </div>
  )
}

function FilterRow({
  filter,
  copy,
  open,
  onToggleOpen,
  values,
  globalQuery,
  onInclude,
  onExclude,
  onRemove,
  onClear,
}: {
  filter: CatalogFilterDef
  copy: CatalogCopy
  open: boolean
  onToggleOpen: () => void
  values: string[]
  globalQuery: string
  onInclude: (id: string, value: string) => void
  onExclude: (id: string, value: string) => void
  onRemove: (id: string, value: string) => void
  onClear: (id: string) => void
}) {
  const [text, setText] = React.useState("")
  const t = text.trim().toLowerCase()

  const { include, exclude } = splitSelection(values)
  const included = new Set(include)
  const excluded = new Set(exclude)

  const icps = useIcps()
  const primaryIcp = icps.find((i) => i.primary) ?? icps[0]
  const missingIcpTitles =
    filter.id === "titles" && primaryIcp
      ? primaryIcp.titles.filter((title) => !included.has(title))
      : []

  const shownOptions = filter.options.filter((o) => {
    const lo = o.toLowerCase()
    return (!globalQuery || lo.includes(globalQuery)) && (!t || lo.includes(t))
  })

  // Toggle-style handlers: clicking the active side removes the value,
  // clicking the other side switches polarity.
  function toggleInclude(value: string) {
    if (included.has(value)) {
      onRemove(filter.id, value)
      return
    }
    if (excluded.has(value)) onRemove(filter.id, excludeValue(value))
    onInclude(filter.id, value)
  }
  function toggleExclude(value: string) {
    if (excluded.has(value)) {
      onRemove(filter.id, excludeValue(value))
      return
    }
    if (included.has(value)) onRemove(filter.id, value)
    onExclude(filter.id, value)
  }

  // Enter on the free-text input = include. Resolve the typed text to a real
  // option (case-insensitive) when possible so the option row reflects it.
  function submitText() {
    const v = text.trim()
    if (!v) return
    const lower = v.toLowerCase()
    const match =
      filter.options.find((o) => o.toLowerCase() === lower) ??
      filter.options.find((o) => o.toLowerCase().includes(lower))
    const value = match ?? v
    if (excluded.has(value)) onRemove(filter.id, excludeValue(value))
    if (!included.has(value)) onInclude(filter.id, value)
    setText("")
  }

  return (
    <div className="border-border/70 border-b last:border-b-0">
      <div className="flex items-center">
        <button
          type="button"
          onClick={onToggleOpen}
          aria-expanded={open}
          className="hover:bg-muted/40 flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left"
        >
          {React.createElement(filterIcon(filter), {
            className: cn(
              "size-3.5 shrink-0",
              filter.linkedin ? "text-[#0a66c2]" : "text-muted-foreground"
            ),
          })}
          <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
            {filter.label}
          </span>
          {filter.popular && (
            <Badge
              variant="secondary"
              className="text-primary bg-primary/10 rounded-full px-1.5 py-0.5 text-[10px] leading-none"
            >
              {copy.popular}
            </Badge>
          )}
          {values.length > 0 && (
            <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
              {values.length}
            </span>
          )}
        </button>
        {open && values.length > 0 && (
          <button
            type="button"
            onClick={() => onClear(filter.id)}
            aria-label={copy.clearAria(filter.label)}
            className="text-muted-foreground hover:text-foreground shrink-0 px-1 py-1 text-xs font-medium"
          >
            {copy.clear}
          </button>
        )}
        {isAiSuggestable(filter) && (
          <Sparkles
            className="text-muted-foreground/70 size-3.5 shrink-0"
            aria-hidden="true"
          />
        )}
        <button
          type="button"
          onClick={onToggleOpen}
          aria-expanded={open}
          aria-label={filter.label}
          className="text-muted-foreground hover:text-foreground shrink-0 px-2 py-2"
        >
          {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
        </button>
      </div>

      {open && (
        <div className="pb-2">
          {/* Selected values — include chips normal, exclude chips destructive. */}
          {values.length > 0 && (
            <div className="flex flex-wrap gap-1 px-2 pb-1.5">
              {values.map((raw) => {
                const neg = isExcluded(raw)
                const label = neg ? copy.not(baseValue(raw)) : raw
                return (
                  <span
                    key={raw}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full py-0.5 pr-1 pl-2 text-xs font-medium",
                      neg
                        ? "bg-destructive/10 text-destructive"
                        : filter.linkedin
                          ? "bg-[#0a66c2]/10 text-[#0a66c2]"
                          : "bg-primary/10 text-primary"
                    )}
                  >
                    {label}
                    <button
                      type="button"
                      aria-label={copy.removeAria(label)}
                      onClick={() => onRemove(filter.id, raw)}
                      className="rounded-full p-0.5 hover:bg-black/10"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )
              })}
            </div>
          )}

          {/* Free-text entry — typing filters the list; Enter includes. */}
          <div className="relative px-2 pb-1">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  submitText()
                }
              }}
              placeholder={copy.addValue(filter.label)}
              clearable={false}
              className="h-7 pr-7 text-xs"
            />
            {text.trim() && (
              <button
                type="button"
                aria-label={copy.includeAria(text.trim())}
                onClick={submitText}
                className="text-primary hover:bg-muted absolute top-1/2 right-3 flex size-5 -translate-y-1/2 items-center justify-center rounded"
              >
                <Plus className="size-3.5" />
              </button>
            )}
          </div>

          {missingIcpTitles.length > 0 && (
            <button
              type="button"
              onClick={() => missingIcpTitles.forEach((title) => onInclude(filter.id, title))}
              className="text-primary hover:underline flex w-full items-center gap-1.5 px-2 pb-2 text-left text-xs font-medium"
            >
              <Sparkles className="size-3.5 shrink-0" />
              {copy.autoAddIcpTitles}
            </button>
          )}

          {/* Option rows — value left, Include | Exclude right. */}
          {shownOptions.map((value) => {
            const isIn = included.has(value)
            const isOut = excluded.has(value)
            return (
              <div
                key={value}
                className="hover:bg-muted/60 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
              >
                <span className="min-w-0 flex-1 truncate">{value}</span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    aria-label={copy.includeAria(value)}
                    aria-pressed={isIn}
                    onClick={() => toggleInclude(value)}
                    className={cn(
                      "text-xs transition-colors",
                      isIn
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:text-primary font-medium"
                    )}
                  >
                    {copy.include}
                  </button>
                  <span className="bg-border h-3 w-px" aria-hidden="true" />
                  <button
                    type="button"
                    aria-label={copy.excludeAria(value)}
                    aria-pressed={isOut}
                    onClick={() => toggleExclude(value)}
                    className={cn(
                      "text-xs transition-colors",
                      isOut
                        ? "text-destructive font-semibold"
                        : "text-muted-foreground hover:text-destructive font-medium"
                    )}
                  >
                    {copy.exclude}
                  </button>
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
