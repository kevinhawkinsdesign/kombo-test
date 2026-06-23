import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  FolderKanban,
  Sparkles,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
} from "lucide-react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ProspectAvatar } from "@/components/common/ProspectBits"
import { useProspects, useAccounts, useLists } from "@/lib/store"
import { useLocale } from "@/lib/locale"
import {
  openProspectSearch,
  setProspectSearchOpen,
  useProspectSearchOpen,
} from "@/lib/prospect-search"
import { cn } from "@/lib/utils"
import type { Account, Prospect, ProspectList } from "@/lib/types"

const MAX_PEOPLE = 6
const MAX_OTHER = 4

type Item = { key: string; run: () => void; render: React.ReactNode }
type Section = { key: string; heading: string; items: Item[] }

function fullName(p: Prospect): string {
  return `${p.firstName} ${p.lastName}`
}

function personItem(p: Prospect, go: (path: string) => void): Item {
  return {
    key: `p-${p.id}`,
    run: () => go(`/prospects/${p.id}`),
    render: (
      <div className="flex min-w-0 items-center gap-3">
        <ProspectAvatar prospect={p} className="size-8" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{fullName(p)}</p>
          <p className="text-muted-foreground truncate text-xs">
            {p.title} · {p.company}
          </p>
        </div>
      </div>
    ),
  }
}

function companyItem(a: Account, go: (path: string) => void): Item {
  return {
    key: `c-${a.id}`,
    run: () => go(`/companies/${a.id}`),
    render: (
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white"
          style={{ backgroundColor: a.logoColor }}
        >
          {a.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{a.name}</p>
          <p className="text-muted-foreground truncate text-xs">{a.industry}</p>
        </div>
      </div>
    ),
  }
}

function listItem(l: ProspectList, go: (path: string) => void): Item {
  return {
    key: `l-${l.id}`,
    run: () => go(`/lists/${l.id}`),
    render: (
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `${l.color}1f` }}
        >
          <FolderKanban className="size-4" style={{ color: l.color }} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{l.name}</p>
          <p className="text-muted-foreground truncate text-xs">{l.description}</p>
        </div>
      </div>
    ),
  }
}

/** Single command palette, mounted once at the app shell. */
export function ProspectSearch() {
  const open = useProspectSearchOpen()
  const navigate = useNavigate()
  const { t } = useLocale()
  const prospects = useProspects()
  const accounts = useAccounts()
  const lists = useLists()
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const listRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Global ⌘K / Ctrl+K opens the palette from anywhere.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        openProspectSearch()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const go = React.useCallback(
    (path: string) => {
      setProspectSearchOpen(false)
      setQuery("")
      setActive(0)
      navigate(path)
    },
    [navigate]
  )

  const q = query.trim().toLowerCase()

  const sections = React.useMemo<Section[]>(() => {
    if (!q) {
      const top = [...prospects].sort((a, b) => b.score - a.score).slice(0, MAX_PEOPLE)
      return [
        { key: "suggested", heading: t("search.suggested"), items: top.map((p) => personItem(p, go)) },
      ]
    }
    const people = prospects
      .filter((p) =>
        [fullName(p), p.company, p.title, p.email].some((s) => s?.toLowerCase().includes(q))
      )
      .slice(0, MAX_PEOPLE)
    const comps = accounts
      .filter((a) => [a.name, a.industry, a.domain].some((s) => s?.toLowerCase().includes(q)))
      .slice(0, MAX_OTHER)
    const lsts = lists
      .filter((l) => [l.name, l.description].some((s) => s?.toLowerCase().includes(q)))
      .slice(0, MAX_OTHER)

    const out: Section[] = []
    if (people.length)
      out.push({ key: "people", heading: t("search.people"), items: people.map((p) => personItem(p, go)) })
    if (comps.length)
      out.push({ key: "companies", heading: t("search.companies"), items: comps.map((a) => companyItem(a, go)) })
    if (lsts.length)
      out.push({ key: "lists", heading: t("search.lists"), items: lsts.map((l) => listItem(l, go)) })

    // Always offer a hand-off to the full Kai search.
    out.push({
      key: "action",
      heading: "",
      items: [
        {
          key: "search-all",
          run: () => go(`/search?q=${encodeURIComponent(query.trim())}`),
          render: (
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
                <Sparkles className="size-4" />
              </span>
              <span className="truncate text-sm">
                <span className="text-muted-foreground">{t("search.searchAll")} </span>
                <span className="font-medium">"{query.trim()}"</span>
              </span>
            </div>
          ),
        },
      ],
    })
    return out
  }, [q, query, prospects, accounts, lists, go, t])

  const flat = React.useMemo(() => sections.flatMap((s) => s.items), [sections])
  const indexOf = React.useMemo(
    () => new Map(flat.map((it, i) => [it.key, i])),
    [flat]
  )
  const activeIndex = Math.min(active, Math.max(0, flat.length - 1))
  const hasEntities = sections.some((s) => s.key !== "action")

  // Keep the highlighted row in view (no state writes — lint-safe).
  React.useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIndex}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((i) => (flat.length ? (i + 1) % flat.length : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      flat[activeIndex]?.run()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setProspectSearchOpen(v)
        if (!v) {
          setQuery("")
          setActive(0)
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          inputRef.current?.focus()
        }}
        className="top-[12%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">{t("search.navLabel")}</DialogTitle>

        <div className="flex items-center gap-2.5 border-b px-3.5">
          <Search className="text-muted-foreground size-4 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onInputKeyDown}
            placeholder={t("search.placeholder")}
            className="placeholder:text-muted-foreground h-12 flex-1 bg-transparent text-sm outline-none"
            aria-label={t("search.placeholder")}
          />
          <kbd className="text-muted-foreground bg-muted hidden rounded border px-1.5 py-0.5 text-[10px] font-medium sm:inline-block">
            esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-2">
          {q && !hasEntities && (
            <p className="text-muted-foreground px-2 py-2 text-xs">{t("search.noResults")}</p>
          )}
          {sections.map((sec) => (
            <div key={sec.key} className="mb-1 last:mb-0">
              {sec.heading && (
                <p className="text-muted-foreground px-2 pt-2 pb-1 text-[11px] font-semibold tracking-wide uppercase">
                  {sec.heading}
                </p>
              )}
              {sec.items.map((it) => {
                const i = indexOf.get(it.key) ?? 0
                return (
                  <button
                    key={it.key}
                    type="button"
                    data-idx={i}
                    onMouseMove={() => setActive(i)}
                    onClick={it.run}
                    className={cn(
                      "flex w-full items-center rounded-md px-2 py-2 text-left transition-colors",
                      i === activeIndex ? "bg-accent" : "hover:bg-accent/50"
                    )}
                  >
                    {it.render}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="text-muted-foreground flex items-center gap-3 border-t px-3.5 py-2 text-[11px]">
          <span className="inline-flex items-center gap-1">
            <kbd className="bg-muted inline-flex size-4 items-center justify-center rounded border">
              <ArrowUp className="size-2.5" />
            </kbd>
            <kbd className="bg-muted inline-flex size-4 items-center justify-center rounded border">
              <ArrowDown className="size-2.5" />
            </kbd>
            {t("search.navigate")}
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="bg-muted inline-flex size-4 items-center justify-center rounded border">
              <CornerDownLeft className="size-2.5" />
            </kbd>
            {t("search.open")}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Sidebar entry point that opens the palette. */
export function ProspectSearchTrigger({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const { t } = useLocale()

  function open() {
    onNavigate?.()
    openProspectSearch()
  }

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent/60 mx-auto flex size-9"
            aria-label={`${t("search.navLabel")} (⌘K)`}
            onClick={open}
          >
            <Search className="size-5" strokeWidth={2.25} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">{t("search.navLabel")} · ⌘K</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <button
      type="button"
      onClick={open}
      className="border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground flex h-9 w-full items-center gap-2 rounded-md border px-3 text-sm transition-colors"
    >
      <Search className="size-4 shrink-0" />
      <span className="flex-1 text-left">{t("search.navLabel")}</span>
      <kbd className="border-sidebar-border bg-sidebar text-sidebar-foreground/50 hidden rounded border px-1.5 py-0.5 text-[10px] font-medium lg:inline-block">
        ⌘K
      </kbd>
    </button>
  )
}
