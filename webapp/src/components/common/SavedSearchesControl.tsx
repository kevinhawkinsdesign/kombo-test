import * as React from "react"
import { Bookmark, ChevronDown, Search as SearchIcon, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useLocale } from "@/lib/locale"
import type { SavedAiSearch } from "@/lib/mock-ai-search"

const COPY = {
  en: {
    saved: "Saved searches",
    searchSaved: "Search saved searches…",
    noSaved: "No saved searches yet.",
    noSavedMatch: "No saved searches match your search.",
    people: "Prospects",
    companies: "Companies",
    removeSaved: (name: string) => `Remove ${name}`,
  },
  es: {
    saved: "Búsquedas guardadas",
    searchSaved: "Buscar búsquedas guardadas…",
    noSaved: "Aún no hay búsquedas guardadas.",
    noSavedMatch: "Ninguna búsqueda guardada coincide.",
    people: "Prospectos",
    companies: "Empresas",
    removeSaved: (name: string) => `Eliminar ${name}`,
  },
  it: {
    saved: "Ricerche salvate",
    searchSaved: "Cerca nelle ricerche salvate…",
    noSaved: "Nessuna ricerca salvata ancora.",
    noSavedMatch: "Nessuna ricerca salvata corrisponde.",
    people: "Prospect",
    companies: "Aziende",
    removeSaved: (name: string) => `Rimuovi ${name}`,
  },
  fr: {
    saved: "Recherches enregistrées",
    searchSaved: "Rechercher dans les recherches enregistrées…",
    noSaved: "Aucune recherche enregistrée pour le moment.",
    noSavedMatch: "Aucune recherche enregistrée ne correspond.",
    people: "Prospects",
    companies: "Entreprises",
    removeSaved: (name: string) => `Retirer ${name}`,
  },
  de: {
    saved: "Gespeicherte Suchen",
    searchSaved: "Gespeicherte Suchen durchsuchen…",
    noSaved: "Noch keine gespeicherten Suchen.",
    noSavedMatch: "Keine gespeicherte Suche passt.",
    people: "Prospects",
    companies: "Unternehmen",
    removeSaved: (name: string) => `${name} entfernen`,
  },
  pt: {
    saved: "Pesquisas guardadas",
    searchSaved: "Pesquisar pesquisas guardadas…",
    noSaved: "Ainda não há pesquisas guardadas.",
    noSavedMatch: "Nenhuma pesquisa guardada corresponde.",
    people: "Prospects",
    companies: "Empresas",
    removeSaved: (name: string) => `Remover ${name}`,
  },
  pt_BR: {
    saved: "Pesquisas salvas",
    searchSaved: "Pesquisar nas pesquisas salvas…",
    noSaved: "Ainda não há pesquisas salvas.",
    noSavedMatch: "Nenhuma pesquisa salva corresponde.",
    people: "Prospects",
    companies: "Empresas",
    removeSaved: (name: string) => `Remover ${name}`,
  },
} as const

// Lives wherever a saved-AI-search entry point is reachable — the Search
// page header and the Add prospects/companies modal's results toolbar both
// use it — a Popover + filter Input + scrollable rows, the same "too many to
// list plainly" shape as ListSwitcher and the Lists "+" picker, since an
// enterprise account can accumulate hundreds of saved searches.
export function SavedSearchesControl({
  savedSearches,
  onLoad,
  onRemove,
}: {
  savedSearches: SavedAiSearch[]
  onLoad: (id: string) => void
  onRemove: (id: string) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [open, setOpen] = React.useState(false)
  const [q, setQ] = React.useState("")

  const query = q.trim().toLowerCase()
  const filtered = query
    ? savedSearches.filter((s) => s.name.toLowerCase().includes(query))
    : savedSearches

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setQ("")
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Bookmark className="size-4" />
          {c.saved}
          <ChevronDown className="text-muted-foreground size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b p-2">
          <div className="relative">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={c.searchSaved}
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground px-2 py-6 text-center text-sm">
              {savedSearches.length === 0 ? c.noSaved : c.noSavedMatch}
            </p>
          ) : (
            filtered.map((s) => (
              <div
                key={s.id}
                className="hover:bg-muted/60 group flex items-center gap-2 rounded-sm px-2 py-1.5"
              >
                <button
                  type="button"
                  onClick={() => {
                    onLoad(s.id)
                    setOpen(false)
                    setQ("")
                  }}
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
                  aria-label={c.removeSaved(s.name)}
                  onClick={() => onRemove(s.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
