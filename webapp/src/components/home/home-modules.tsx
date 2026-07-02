/* eslint-disable react-refresh/only-export-components --
   Registry file: the small module cards are intentionally colocated with their
   metadata (HOME_MODULES). Fast-refresh of these cards isn't needed. */
import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Sparkles,
  History,
  FolderKanban,
  Rocket,
  Users,
  ArrowRight,
} from "lucide-react"

import { useLocale } from "@/lib/locale"
import { Badge } from "@/components/ui/badge"
import { libraryQueries } from "@/lib/mock-library"
import { useSavedSearches } from "@/lib/mock-ai-search"
import { useLists, useProspects } from "@/lib/store"
import { useSetup } from "@/lib/setup"

/**
 * A Home module is a self-contained card body. The surrounding Card + icon/title
 * header is rendered by `HomeModules`, so each `Component` renders only its inner
 * content (a short list / empty state). Modules read their own data via hooks.
 *
 * Adding or removing a module is intentionally trivial: append/remove an entry
 * in `HOME_MODULES`. The layout store prunes ids that disappear and surfaces
 * newly-added ones, so saved layouts keep working as this list grows.
 */
export interface HomeModuleDef {
  id: string
  title: { en: string; es: string }
  icon: React.ComponentType<{ className?: string }>
  defaultOn: boolean
  Component: React.ComponentType
}

// Shared micro-copy for empty states — keeps each module body tiny.
const COPY = {
  en: {
    empty: "Nothing here yet.",
    noRecent: "Your recent searches will show up here.",
    noLists: "Create a list to see it here.",
    noProspects: "Prospects you add will show up here.",
    setupProgress: (n: number) => `${n}% complete`,
    continueSetup: "Continue setup",
    count: (n: number) => `${n} ${n === 1 ? "record" : "records"}`,
  },
  es: {
    empty: "Aún no hay nada aquí.",
    noRecent: "Tus búsquedas recientes aparecerán aquí.",
    noLists: "Crea una lista para verla aquí.",
    noProspects: "Los prospectos que añadas aparecerán aquí.",
    setupProgress: (n: number) => `${n}% completado`,
    continueSetup: "Continuar configuración",
    count: (n: number) => `${n} ${n === 1 ? "registro" : "registros"}`,
  },
} as const

// Shared row button styles so every module list reads consistently.
const ROW =
  "hover:bg-muted/60 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors"
const EMPTY = "text-muted-foreground px-2 py-1.5 text-sm"

function RecommendedModule() {
  const navigate = useNavigate()
  return (
    <div className="space-y-0.5">
      {libraryQueries.slice(0, 4).map((q) => (
        <button
          key={q.id}
          type="button"
          onClick={() =>
            navigate(`/search?q=${encodeURIComponent(q.prompt)}`)
          }
          className={ROW}
        >
          <Sparkles className="text-muted-foreground size-3.5 shrink-0" />
          <span className="truncate">{q.name}</span>
        </button>
      ))}
    </div>
  )
}

function RecentSearchesModule() {
  const { locale } = useLocale()
  const t = COPY[locale]
  const navigate = useNavigate()
  const saved = useSavedSearches()
  const recent = React.useMemo(
    () =>
      [...saved]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 4),
    [saved]
  )
  if (recent.length === 0) return <p className={EMPTY}>{t.noRecent}</p>
  return (
    <div className="space-y-0.5">
      {recent.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() =>
            navigate("/search", { state: { loadSearchId: s.id } })
          }
          className={ROW}
        >
          <History className="text-muted-foreground size-3.5 shrink-0" />
          <span className="truncate">{s.name}</span>
        </button>
      ))}
    </div>
  )
}

function ListsModule() {
  const { locale } = useLocale()
  const t = COPY[locale]
  const lists = useLists()
  if (lists.length === 0) return <p className={EMPTY}>{t.noLists}</p>
  return (
    <div className="space-y-0.5">
      {lists.slice(0, 5).map((l) => {
        const count =
          l.kind === "company"
            ? l.accountIds?.length ?? 0
            : l.prospectIds.length
        return (
          <Link key={l.id} to={`/lists/${l.id}`} className={ROW}>
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: l.color }}
            />
            <span className="truncate">{l.name}</span>
            <Badge variant="secondary" className="ml-auto shrink-0">
              {count}
            </Badge>
          </Link>
        )
      })}
    </div>
  )
}

function GetStartedModule() {
  const { locale } = useLocale()
  const t = COPY[locale]
  const { progress } = useSetup()
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t.setupProgress(progress)}</span>
        <span className="font-medium">{progress}%</span>
      </div>
      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <Link
        to="/get-started"
        className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
      >
        {t.continueSetup}
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  )
}

function RecentProspectsModule() {
  const { locale } = useLocale()
  const t = COPY[locale]
  const prospects = useProspects()
  const recent = React.useMemo(
    () =>
      [...prospects]
        .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
        .slice(0, 5),
    [prospects]
  )
  if (recent.length === 0) return <p className={EMPTY}>{t.noProspects}</p>
  return (
    <div className="space-y-0.5">
      {recent.map((p) => (
        <Link key={p.id} to={`/prospects/${p.id}`} className={ROW}>
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
            style={{ backgroundColor: p.avatarColor }}
          >
            {p.firstName.charAt(0)}
            {p.lastName.charAt(0)}
          </span>
          <span className="min-w-0 flex-1 truncate">
            {p.firstName} {p.lastName}
          </span>
          <span className="text-muted-foreground shrink-0 truncate text-xs">
            {p.company}
          </span>
        </Link>
      ))}
    </div>
  )
}

export const HOME_MODULES: HomeModuleDef[] = [
  {
    id: "recommended",
    title: { en: "Recommended searches", es: "Búsquedas recomendadas" },
    icon: Sparkles,
    defaultOn: true,
    Component: RecommendedModule,
  },
  {
    id: "recent-searches",
    title: { en: "Recent searches", es: "Búsquedas recientes" },
    icon: History,
    defaultOn: true,
    Component: RecentSearchesModule,
  },
  {
    id: "lists",
    title: { en: "Your lists", es: "Tus listas" },
    icon: FolderKanban,
    defaultOn: true,
    Component: ListsModule,
  },
  {
    id: "get-started",
    title: { en: "Get started", es: "Empezar" },
    icon: Rocket,
    defaultOn: false,
    Component: GetStartedModule,
  },
  {
    id: "recent-prospects",
    title: { en: "Recent prospects", es: "Prospectos recientes" },
    icon: Users,
    defaultOn: false,
    Component: RecentProspectsModule,
  },
]
