import { Plus, X } from "lucide-react"

import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"

const COPY = {
  en: {
    closeTab: (label: string) => `Close ${label}`,
    addTab: "New search",
  },
  es: {
    closeTab: (label: string) => `Cerrar ${label}`,
    addTab: "Nueva búsqueda",
  },
  it: {
    closeTab: (label: string) => `Chiudi ${label}`,
    addTab: "Nuova ricerca",
  },
  fr: {
    closeTab: (label: string) => `Fermer ${label}`,
    addTab: "Nouvelle recherche",
  },
  de: {
    closeTab: (label: string) => `${label} schließen`,
    addTab: "Neue Suche",
  },
  pt: {
    closeTab: (label: string) => `Fechar ${label}`,
    addTab: "Nova pesquisa",
  },
  pt_BR: {
    closeTab: (label: string) => `Fechar ${label}`,
    addTab: "Nova busca",
  },
} as const

export interface SearchTabBarItem {
  id: string
  label: string
}

// Chrome/Lemlist-style tab strip for search sessions the user has open at
// once. Purely presentational — Search() owns the live query state and
// computes each tab's label; this just renders the strip and reports clicks.
export function SearchTabBar({
  tabs,
  activeId,
  onSwitchTab,
  onCloseTab,
  onNewTab,
}: {
  tabs: SearchTabBarItem[]
  activeId: string | null
  onSwitchTab: (id: string) => void
  onCloseTab: (id: string) => void
  onNewTab: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]

  return (
    <div className="mb-4 flex items-end gap-0.5 overflow-x-auto border-b">
      {tabs.map((t) => {
        const active = t.id === activeId
        return (
          <div
            key={t.id}
            className={cn(
              "group relative -mb-px flex shrink-0 items-center gap-1.5 rounded-t-lg border px-3 py-2 text-sm transition-colors",
              active
                ? "border-border border-b-background bg-background text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:bg-muted/60"
            )}
          >
            <button
              type="button"
              onClick={() => onSwitchTab(t.id)}
              className="max-w-48 min-w-0 truncate text-left"
            >
              {t.label}
            </button>
            <button
              type="button"
              aria-label={c.closeTab(t.label)}
              onClick={() => onCloseTab(t.id)}
              className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )
      })}
      <button
        type="button"
        aria-label={c.addTab}
        onClick={onNewTab}
        className="text-muted-foreground hover:bg-muted/60 hover:text-foreground mb-1 flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}
