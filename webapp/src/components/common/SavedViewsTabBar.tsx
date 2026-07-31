import * as React from "react"
import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import {
  savedViewsStore,
  useSavedViews,
  type FiltersForPage,
  type SavedView,
  type ViewPageScope,
} from "@/lib/saved-views"

const COPY = {
  en: {
    closeTab: (name: string) => `Delete ${name}`,
    addTab: "Save current filters as a view",
    saveViewTitle: "Save current filters as a view",
    viewNamePlaceholder: "View name…",
    cancel: "Cancel",
    save: "Save view",
  },
  es: {
    closeTab: (name: string) => `Eliminar ${name}`,
    addTab: "Guardar filtros actuales como vista",
    saveViewTitle: "Guardar filtros actuales como vista",
    viewNamePlaceholder: "Nombre de la vista…",
    cancel: "Cancelar",
    save: "Guardar vista",
  },
  it: {
    closeTab: (name: string) => `Elimina ${name}`,
    addTab: "Salva i filtri attuali come vista",
    saveViewTitle: "Salva i filtri attuali come vista",
    viewNamePlaceholder: "Nome della vista…",
    cancel: "Annulla",
    save: "Salva vista",
  },
  fr: {
    closeTab: (name: string) => `Supprimer ${name}`,
    addTab: "Enregistrer les filtres actuels comme vue",
    saveViewTitle: "Enregistrer les filtres actuels comme vue",
    viewNamePlaceholder: "Nom de la vue…",
    cancel: "Annuler",
    save: "Enregistrer la vue",
  },
  de: {
    closeTab: (name: string) => `${name} löschen`,
    addTab: "Aktuelle Filter als Ansicht speichern",
    saveViewTitle: "Aktuelle Filter als Ansicht speichern",
    viewNamePlaceholder: "Name der Ansicht…",
    cancel: "Abbrechen",
    save: "Ansicht speichern",
  },
  pt: {
    closeTab: (name: string) => `Eliminar ${name}`,
    addTab: "Guardar filtros atuais como vista",
    saveViewTitle: "Guardar filtros atuais como vista",
    viewNamePlaceholder: "Nome da vista…",
    cancel: "Cancelar",
    save: "Guardar vista",
  },
  pt_BR: {
    closeTab: (name: string) => `Excluir ${name}`,
    addTab: "Salvar filtros atuais como visualização",
    saveViewTitle: "Salvar filtros atuais como visualização",
    viewNamePlaceholder: "Nome da visualização…",
    cancel: "Cancelar",
    save: "Salvar visualização",
  },
} as const

// Chrome/Lemlist-style tab strip for saved, named filter bundles on the
// unfiltered Companies/People pages — visually modeled on
// components/lists/ListTabBar.tsx and CampaignTabBar.tsx, but a different
// concept underneath: those pin *specific records the user opened*, this
// pins *named snapshots of the page's current filter state*. Every saved
// view for this page scope renders as a tab (there's no separate
// open/closed distinction the way there is for lists), plus a permanent
// "All X" tab that clears every filter.
export function SavedViewsTabBar<P extends ViewPageScope>({
  page,
  allLabel,
  captureFilters,
  onApplyView,
  onClearAll,
}: {
  page: P
  allLabel: string
  // Reads the page's current toolbar + per-column filter state into a
  // SavedView-shaped snapshot, for the "+" save action.
  captureFilters: () => FiltersForPage<P>
  // Applies a saved view's captured filters back onto the page, overwriting
  // whatever's currently set.
  onApplyView: (filters: FiltersForPage<P>) => void
  // Clears every filter — the permanent "All X" tab's action.
  onClearAll: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const views = useSavedViews(page)
  const [activeId, setActiveId] = React.useState<string | "all">("all")
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const activeTabRef = React.useRef<HTMLDivElement>(null)

  // Keep the active tab visible, same as ListTabBar.
  React.useEffect(() => {
    activeTabRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }, [activeId])

  function selectAll() {
    setActiveId("all")
    onClearAll()
  }

  function selectView(v: SavedView<P>) {
    setActiveId(v.id)
    onApplyView(v.filters)
  }

  function deleteView(v: SavedView<P>) {
    savedViewsStore.remove(v.id)
    if (v.id === activeId) setActiveId("all")
  }

  function saveCurrent() {
    const trimmed = name.trim()
    if (!trimmed) return
    const created = savedViewsStore.create({
      name: trimmed,
      page,
      filters: captureFilters(),
    })
    setActiveId(created.id)
    setPopoverOpen(false)
    setName("")
  }

  return (
    <div className="scrollbar-thin-x mb-4 flex items-end gap-0.5 border-b">
      {/* Permanent "All X" tab — always first, never dismissable */}
      <div
        className={cn(
          "relative -mb-px flex shrink-0 items-center rounded-t-lg border transition-colors",
          activeId === "all"
            ? "border-border border-b-background bg-background text-foreground px-4 py-2.5 text-base font-semibold"
            : "border-transparent px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60"
        )}
      >
        <button type="button" onClick={selectAll}>
          {allLabel}
        </button>
      </div>

      {views.map((v) => {
        const active = v.id === activeId
        return (
          <div
            key={v.id}
            ref={active ? activeTabRef : undefined}
            className={cn(
              "group relative -mb-px flex shrink-0 items-center gap-2 rounded-t-lg border transition-colors",
              active
                ? "border-border border-b-background bg-background text-foreground px-4 py-2.5 text-base font-semibold"
                : "border-transparent px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60"
            )}
          >
            <button
              type="button"
              onClick={() => selectView(v)}
              className={cn("truncate", active ? "max-w-64" : "max-w-40")}
            >
              {v.name}
            </button>
            <button
              type="button"
              aria-label={c.closeTab(v.name)}
              onClick={() => deleteView(v)}
              className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )
      })}

      <Popover
        open={popoverOpen}
        onOpenChange={(v) => {
          setPopoverOpen(v)
          // Reset at open, not close — a stale name from the last save
          // shouldn't flash for a frame the next time this opens.
          if (v) setName("")
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={c.addTab}
            className="text-muted-foreground hover:bg-muted/60 hover:text-foreground mb-1 flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
          >
            <Plus className="size-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-3">
          <p className="mb-2 text-sm font-medium">{c.saveViewTitle}</p>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={c.viewNamePlaceholder}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveCurrent()
            }}
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPopoverOpen(false)}>
              {c.cancel}
            </Button>
            <Button variant="volt" size="sm" onClick={saveCurrent} disabled={!name.trim()}>
              {c.save}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
