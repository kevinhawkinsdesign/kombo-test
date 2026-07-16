import * as React from "react"
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  X,
  RotateCcw,
  Search as SearchIcon,
  Sparkles,
  Trash2,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { Locale } from "@/lib/locale"
import type { ColumnDef, ColGroup, ColumnPrefs } from "@/lib/table-columns"

const COPY = {
  en: {
    title: "Customize columns",
    desc: (n: number, total: number) =>
      `${n} of ${total} columns shown. Drag to reorder, or toggle fields on the right.`,
    shown: "Shown columns",
    available: "Available fields",
    searchPlaceholder: "Search fields…",
    pinned: "Pinned",
    reset: "Reset to default",
    done: "Done",
    noMatch: "No fields match.",
    moveUp: "Move up",
    moveDown: "Move down",
    remove: "Remove",
    newAiColumn: "New AI column",
    deleteColumn: "Delete column",
  },
  es: {
    title: "Personalizar columnas",
    desc: (n: number, total: number) =>
      `${n} de ${total} columnas visibles. Arrastra para reordenar o activa campos a la derecha.`,
    shown: "Columnas visibles",
    available: "Campos disponibles",
    searchPlaceholder: "Buscar campos…",
    pinned: "Fijada",
    reset: "Restablecer",
    done: "Listo",
    noMatch: "Ningún campo coincide.",
    moveUp: "Subir",
    moveDown: "Bajar",
    remove: "Quitar",
    newAiColumn: "Nueva columna IA",
    deleteColumn: "Eliminar columna",
  },
  it: {
    title: "Personalizza colonne",
    desc: (n: number, total: number) =>
      `${n} colonne su ${total} visibili. Trascina per riordinare o attiva i campi a destra.`,
    shown: "Colonne visibili",
    available: "Campi disponibili",
    searchPlaceholder: "Cerca campi…",
    pinned: "Fissata",
    reset: "Ripristina predefinite",
    done: "Fatto",
    noMatch: "Nessun campo corrisponde.",
    moveUp: "Sposta su",
    moveDown: "Sposta giù",
    remove: "Rimuovi",
    newAiColumn: "Nuova colonna IA",
    deleteColumn: "Elimina colonna",
  },
  fr: {
    title: "Personnaliser les colonnes",
    desc: (n: number, total: number) =>
      `${n} colonnes sur ${total} affichées. Glissez pour réordonner ou activez des champs à droite.`,
    shown: "Colonnes affichées",
    available: "Champs disponibles",
    searchPlaceholder: "Rechercher des champs…",
    pinned: "Épinglée",
    reset: "Réinitialiser",
    done: "Terminé",
    noMatch: "Aucun champ ne correspond.",
    moveUp: "Monter",
    moveDown: "Descendre",
    remove: "Retirer",
    newAiColumn: "Nouvelle colonne IA",
    deleteColumn: "Supprimer la colonne",
  },
  de: {
    title: "Spalten anpassen",
    desc: (n: number, total: number) =>
      `${n} von ${total} Spalten sichtbar. Ziehe zum Umsortieren oder aktiviere Felder rechts.`,
    shown: "Sichtbare Spalten",
    available: "Verfügbare Felder",
    searchPlaceholder: "Felder suchen…",
    pinned: "Fixiert",
    reset: "Auf Standard zurücksetzen",
    done: "Fertig",
    noMatch: "Kein Feld stimmt überein.",
    moveUp: "Nach oben",
    moveDown: "Nach unten",
    remove: "Entfernen",
    newAiColumn: "Neue KI-Spalte",
    deleteColumn: "Spalte löschen",
  },
  pt: {
    title: "Personalizar colunas",
    desc: (n: number, total: number) =>
      `${n} de ${total} colunas visíveis. Arraste para reordenar ou ative campos à direita.`,
    shown: "Colunas visíveis",
    available: "Campos disponíveis",
    searchPlaceholder: "Pesquisar campos…",
    pinned: "Fixada",
    reset: "Repor predefinições",
    done: "Concluído",
    noMatch: "Nenhum campo corresponde.",
    moveUp: "Mover para cima",
    moveDown: "Mover para baixo",
    remove: "Remover",
    newAiColumn: "Nova coluna de IA",
    deleteColumn: "Eliminar coluna",
  },
  pt_BR: {
    title: "Personalizar colunas",
    desc: (n: number, total: number) =>
      `${n} de ${total} colunas visíveis. Arraste para reordenar ou ative campos à direita.`,
    shown: "Colunas visíveis",
    available: "Campos disponíveis",
    searchPlaceholder: "Buscar campos…",
    pinned: "Fixada",
    reset: "Restaurar padrão",
    done: "Pronto",
    noMatch: "Nenhum campo corresponde.",
    moveUp: "Mover para cima",
    moveDown: "Mover para baixo",
    remove: "Remover",
    newAiColumn: "Nova coluna de IA",
    deleteColumn: "Excluir coluna",
  },
} as const

export function ColumnManager<T>({
  open,
  onOpenChange,
  columns,
  groups,
  prefs,
  locale,
  onAddAiColumn,
  aiColumnIds,
  onDeleteColumn,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  columns: ColumnDef<T>[]
  groups: ColGroup[]
  prefs: ColumnPrefs
  locale: Locale
  onAddAiColumn?: () => void
  aiColumnIds?: Set<string>
  onDeleteColumn?: (id: string) => void
}) {
  const c = COPY[locale]
  const [search, setSearch] = React.useState("")
  const [dragId, setDragId] = React.useState<string | null>(null)

  const byId = React.useMemo(() => {
    const map = new Map<string, ColumnDef<T>>()
    for (const col of columns) map.set(col.id, col)
    return map
  }, [columns])

  const pinned = columns.find((col) => col.pinned)
  const selectable = columns.filter((col) => !col.pinned)
  const total = selectable.length

  const shownCols = prefs.visible
    .map((id) => byId.get(id))
    .filter((col): col is ColumnDef<T> => Boolean(col))

  function reorder(src: string, target: string) {
    if (src === target) return
    const order = [...prefs.visible]
    const from = order.indexOf(src)
    const to = order.indexOf(target)
    if (from === -1 || to === -1) return
    order.splice(from, 1)
    order.splice(to, 0, src)
    prefs.setVisible(order)
  }

  const q = search.trim().toLowerCase()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b p-4">
          <DialogTitle>{c.title}</DialogTitle>
          <DialogDescription>{c.desc(prefs.visible.length, total)}</DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[60vh] grid-cols-1 divide-y overflow-hidden sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {/* Shown / ordered */}
          <div className="flex max-h-[40vh] flex-col overflow-hidden sm:max-h-[60vh]">
            <p className="text-muted-foreground bg-muted/30 px-4 py-2 text-xs font-medium tracking-wide uppercase">
              {c.shown}
            </p>
            <div className="flex-1 space-y-1 overflow-y-auto p-2">
              {pinned && (
                <div className="text-muted-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm">
                  <GripVertical className="size-4 opacity-30" />
                  <span className="flex-1">{pinned.label[locale]}</span>
                  <span className="bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium uppercase">
                    {c.pinned}
                  </span>
                </div>
              )}
              {shownCols.map((col, i) => (
                <div
                  key={col.id}
                  draggable
                  onDragStart={() => setDragId(col.id)}
                  onDragEnd={() => setDragId(null)}
                  onDragOver={(e) => {
                    e.preventDefault()
                    if (dragId && dragId !== col.id) reorder(dragId, col.id)
                  }}
                  className={cn(
                    "group flex cursor-grab items-center gap-2 rounded-md border px-2 py-1.5 text-sm active:cursor-grabbing",
                    dragId === col.id
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted/60"
                  )}
                >
                  <GripVertical className="text-muted-foreground size-4 shrink-0" />
                  <span className="flex-1 truncate">{col.label[locale]}</span>
                  <button
                    type="button"
                    onClick={() => prefs.move(col.id, -1)}
                    disabled={i === 0}
                    aria-label={c.moveUp}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => prefs.move(col.id, 1)}
                    disabled={i === shownCols.length - 1}
                    aria-label={c.moveDown}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => prefs.toggle(col.id)}
                    aria-label={c.remove}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Available */}
          <div className="flex max-h-[40vh] flex-col overflow-hidden sm:max-h-[60vh]">
            <div className="bg-muted/30 space-y-2 px-3 py-2">
              <div className="relative">
                <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={c.searchPlaceholder}
                  className="h-8 pl-8 text-sm"
                />
              </div>
              {onAddAiColumn && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={onAddAiColumn}
                >
                  <Sparkles className="size-4" />
                  {c.newAiColumn}
                </Button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {groups.map((group) => {
                const items = selectable.filter(
                  (col) =>
                    col.group === group.id &&
                    (!q || col.label[locale].toLowerCase().includes(q))
                )
                if (items.length === 0) return null
                return (
                  <div key={group.id} className="mb-2">
                    <p className="text-muted-foreground px-2 py-1 text-[11px] font-medium tracking-wide uppercase">
                      {group.label[locale]}
                    </p>
                    {items.map((col) => {
                      const checked = prefs.visible.includes(col.id)
                      return (
                        <label
                          key={col.id}
                          className="hover:bg-muted/60 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => prefs.toggle(col.id)}
                          />
                          <span className="flex-1 truncate">{col.label[locale]}</span>
                          {aiColumnIds?.has(col.id) && onDeleteColumn && (
                            <button
                              type="button"
                              aria-label={c.deleteColumn}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                onDeleteColumn(col.id)
                              }}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </label>
                      )
                    })}
                  </div>
                )
              })}
              {q &&
                selectable.filter((col) =>
                  col.label[locale].toLowerCase().includes(q)
                ).length === 0 && (
                  <p className="text-muted-foreground p-3 text-sm">{c.noMatch}</p>
                )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between border-t p-3 sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={prefs.reset}
            disabled={prefs.isDefault}
          >
            <RotateCcw className="size-4" />
            {c.reset}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {c.done}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
