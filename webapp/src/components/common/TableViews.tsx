import * as React from "react"
import { toast } from "sonner"
import { LayoutGrid, Check, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLocale } from "@/lib/locale"
import { useTableViews, viewStore } from "@/lib/table-views"
import type { ColumnPrefs } from "@/lib/table-columns"

const COPY = {
  en: {
    views: "Views",
    savedViews: "Saved views",
    noViews: "No saved views yet",
    saveCurrent: "Save current as view…",
    deleteView: (name: string) => `Delete view ${name}`,
    saveTitle: "Save view",
    saveDesc: "Name this column layout so you can switch back to it anytime.",
    name: "View name",
    placeholder: "e.g. Outreach-ready",
    cancel: "Cancel",
    save: "Save view",
    applied: (name: string) => `Switched to "${name}"`,
    created: (name: string) => `View "${name}" saved`,
    deleted: "View deleted",
    nameRequired: "Give the view a name.",
  },
  es: {
    views: "Vistas",
    savedViews: "Vistas guardadas",
    noViews: "Aún no hay vistas guardadas",
    saveCurrent: "Guardar actual como vista…",
    deleteView: (name: string) => `Eliminar vista ${name}`,
    saveTitle: "Guardar vista",
    saveDesc:
      "Nombra esta disposición de columnas para volver a ella cuando quieras.",
    name: "Nombre de la vista",
    placeholder: "ej. Lista para contactar",
    cancel: "Cancelar",
    save: "Guardar vista",
    applied: (name: string) => `Cambiado a "${name}"`,
    created: (name: string) => `Vista "${name}" guardada`,
    deleted: "Vista eliminada",
    nameRequired: "Dale un nombre a la vista.",
  },
  it: {
    views: "Viste",
    savedViews: "Viste salvate",
    noViews: "Ancora nessuna vista salvata",
    saveCurrent: "Salva l'attuale come vista…",
    deleteView: (name: string) => `Elimina vista ${name}`,
    saveTitle: "Salva vista",
    saveDesc:
      "Dai un nome a questa disposizione di colonne per tornarci quando vuoi.",
    name: "Nome della vista",
    placeholder: "es. Pronti per l'outreach",
    cancel: "Annulla",
    save: "Salva vista",
    applied: (name: string) => `Passato a “${name}”`,
    created: (name: string) => `Vista “${name}” salvata`,
    deleted: "Vista eliminata",
    nameRequired: "Dai un nome alla vista.",
  },
  fr: {
    views: "Vues",
    savedViews: "Vues enregistrées",
    noViews: "Aucune vue enregistrée pour l'instant",
    saveCurrent: "Enregistrer l'actuelle comme vue…",
    deleteView: (name: string) => `Supprimer la vue ${name}`,
    saveTitle: "Enregistrer la vue",
    saveDesc:
      "Nommez cette disposition de colonnes pour y revenir à tout moment.",
    name: "Nom de la vue",
    placeholder: "p. ex. Prêts à contacter",
    cancel: "Annuler",
    save: "Enregistrer la vue",
    applied: (name: string) => `Passé à « ${name} »`,
    created: (name: string) => `Vue « ${name} » enregistrée`,
    deleted: "Vue supprimée",
    nameRequired: "Donnez un nom à la vue.",
  },
  de: {
    views: "Ansichten",
    savedViews: "Gespeicherte Ansichten",
    noViews: "Noch keine gespeicherten Ansichten",
    saveCurrent: "Aktuelle als Ansicht speichern…",
    deleteView: (name: string) => `Ansicht ${name} löschen`,
    saveTitle: "Ansicht speichern",
    saveDesc:
      "Gib diesem Spaltenlayout einen Namen, um jederzeit dorthin zurückzuwechseln.",
    name: "Name der Ansicht",
    placeholder: "z. B. Outreach-bereit",
    cancel: "Abbrechen",
    save: "Ansicht speichern",
    applied: (name: string) => `Zu „${name}“ gewechselt`,
    created: (name: string) => `Ansicht „${name}“ gespeichert`,
    deleted: "Ansicht gelöscht",
    nameRequired: "Gib der Ansicht einen Namen.",
  },
  pt: {
    views: "Vistas",
    savedViews: "Vistas guardadas",
    noViews: "Ainda não há vistas guardadas",
    saveCurrent: "Guardar a atual como vista…",
    deleteView: (name: string) => `Eliminar vista ${name}`,
    saveTitle: "Guardar vista",
    saveDesc:
      "Dê um nome a esta disposição de colunas para voltar a ela quando quiser.",
    name: "Nome da vista",
    placeholder: "p. ex. Prontos para contactar",
    cancel: "Cancelar",
    save: "Guardar vista",
    applied: (name: string) => `Mudou para “${name}”`,
    created: (name: string) => `Vista “${name}” guardada`,
    deleted: "Vista eliminada",
    nameRequired: "Dê um nome à vista.",
  },
  pt_BR: {
    views: "Visualizações",
    savedViews: "Visualizações salvas",
    noViews: "Ainda não há visualizações salvas",
    saveCurrent: "Salvar a atual como visualização…",
    deleteView: (name: string) => `Excluir visualização ${name}`,
    saveTitle: "Salvar visualização",
    saveDesc:
      "Dê um nome a este layout de colunas para voltar a ele quando quiser.",
    name: "Nome da visualização",
    placeholder: "ex.: Prontos para contatar",
    cancel: "Cancelar",
    save: "Salvar visualização",
    applied: (name: string) => `Mudou para “${name}”`,
    created: (name: string) => `Visualização “${name}” salva`,
    deleted: "Visualização excluída",
    nameRequired: "Dê um nome à visualização.",
  },
} as const

function sameColumns(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

export function TableViews({
  tableKey,
  prefs,
}: {
  tableKey: string
  prefs: ColumnPrefs
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const views = useTableViews(tableKey)
  const [saveOpen, setSaveOpen] = React.useState(false)
  const [name, setName] = React.useState("")

  const activeId = views.find((v) => sameColumns(v.columns, prefs.visible))?.id

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error(c.nameRequired)
      return
    }
    viewStore.create(tableKey, trimmed, prefs.visible)
    toast.success(c.created(trimmed))
    setSaveOpen(false)
    setName("")
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <LayoutGrid className="size-4" />
            <span className="hidden sm:inline">{c.views}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{c.savedViews}</DropdownMenuLabel>
          {views.length === 0 && (
            <p className="text-muted-foreground px-2 py-1.5 text-xs">
              {c.noViews}
            </p>
          )}
          {views.map((view) => (
            <DropdownMenuItem
              key={view.id}
              className="group justify-between"
              onSelect={() => {
                prefs.setVisible(view.columns)
                toast.success(c.applied(view.name))
              }}
            >
              <span className="flex items-center gap-2">
                <Check
                  className={
                    view.id === activeId
                      ? "text-primary size-4"
                      : "size-4 opacity-0"
                  }
                />
                {view.name}
              </span>
              <button
                type="button"
                aria-label={c.deleteView(view.name)}
                className="text-muted-foreground hover:text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  viewStore.remove(view.id)
                  toast.success(c.deleted)
                }}
              >
                <Trash2 className="size-3.5" />
              </button>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setSaveOpen(true)}>
            <Plus className="size-4" />
            {c.saveCurrent}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{c.saveTitle}</DialogTitle>
            <DialogDescription>{c.saveDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="view-name">{c.name}</Label>
            <Input
              id="view-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={c.placeholder}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave()
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSaveOpen(false)}>
              {c.cancel}
            </Button>
            <Button onClick={handleSave}>{c.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
