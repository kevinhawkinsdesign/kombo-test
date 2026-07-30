import * as React from "react"
import { toast } from "sonner"
import { Copy, Plus, Search, Trash2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Segmented } from "@/components/common/Segmented"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { ConversationTagFormDialog } from "@/components/playbook/ConversationTagFormDialog"
import {
  conversationTagStore,
  useConversationTags,
  type ConversationTag,
  type TagCategory,
} from "@/lib/conversation-tags"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"

const COPY = {
  en: {
    intro:
      "AI checks every reply against these prompts and applies matching tags automatically.",
    filterAll: "All",
    filterActive: "Active",
    searchPlaceholder: "Search tags…",
    createTag: "Create tag",
    category: {
      positive: "Positive",
      neutral: "Neutral",
      negative: "Negative",
    } as Record<TagCategory, string>,
    toggleAria: (name: string) => `Toggle ${name}`,
    tagEnabled: (name: string) => `${name} enabled`,
    tagDisabled: (name: string) => `${name} disabled`,
    duplicateAria: (name: string) => `Duplicate ${name}`,
    deleteAria: (name: string) => `Delete ${name}`,
    copySuffix: "(copy)",
    duplicated: (name: string) => `"${name}" created`,
    noTagsYet: "No tags yet — create one to get started.",
    noTagsMatch: "No tags match your filters.",
    deleteTitle: "Delete tag?",
    deleteDescription: (name: string) =>
      `"${name}" will be permanently removed.`,
    deleted: "Tag deleted",
    delete: "Delete",
    cancel: "Cancel",
  },
  es: {
    intro:
      "La IA compara cada respuesta con estos prompts y aplica las etiquetas correspondientes automáticamente.",
    filterAll: "Todas",
    filterActive: "Activas",
    searchPlaceholder: "Buscar etiquetas…",
    createTag: "Crear etiqueta",
    category: {
      positive: "Positivo",
      neutral: "Neutral",
      negative: "Negativo",
    } as Record<TagCategory, string>,
    toggleAria: (name: string) => `Activar o desactivar ${name}`,
    tagEnabled: (name: string) => `${name} activada`,
    tagDisabled: (name: string) => `${name} desactivada`,
    duplicateAria: (name: string) => `Duplicar ${name}`,
    deleteAria: (name: string) => `Eliminar ${name}`,
    copySuffix: "(copia)",
    duplicated: (name: string) => `«${name}» creada`,
    noTagsYet: "Aún no hay etiquetas — crea una para empezar.",
    noTagsMatch: "Ninguna etiqueta coincide con tus filtros.",
    deleteTitle: "¿Eliminar etiqueta?",
    deleteDescription: (name: string) =>
      `«${name}» se eliminará de forma permanente.`,
    deleted: "Etiqueta eliminada",
    delete: "Eliminar",
    cancel: "Cancelar",
  },
  it: {
    intro:
      "L'IA confronta ogni risposta con questi prompt e applica automaticamente i tag corrispondenti.",
    filterAll: "Tutti",
    filterActive: "Attivi",
    searchPlaceholder: "Cerca tag…",
    createTag: "Crea tag",
    category: {
      positive: "Positivo",
      neutral: "Neutro",
      negative: "Negativo",
    } as Record<TagCategory, string>,
    toggleAria: (name: string) => `Attiva o disattiva ${name}`,
    tagEnabled: (name: string) => `${name} attivato`,
    tagDisabled: (name: string) => `${name} disattivato`,
    duplicateAria: (name: string) => `Duplica ${name}`,
    deleteAria: (name: string) => `Elimina ${name}`,
    copySuffix: "(copia)",
    duplicated: (name: string) => `"${name}" creato`,
    noTagsYet: "Ancora nessun tag — creane uno per iniziare.",
    noTagsMatch: "Nessun tag corrisponde ai tuoi filtri.",
    deleteTitle: "Eliminare il tag?",
    deleteDescription: (name: string) =>
      `"${name}" verrà eliminato definitivamente.`,
    deleted: "Tag eliminato",
    delete: "Elimina",
    cancel: "Annulla",
  },
  fr: {
    intro:
      "L'IA compare chaque réponse à ces prompts et applique automatiquement les tags correspondants.",
    filterAll: "Tous",
    filterActive: "Actifs",
    searchPlaceholder: "Rechercher des tags…",
    createTag: "Créer un tag",
    category: {
      positive: "Positif",
      neutral: "Neutre",
      negative: "Négatif",
    } as Record<TagCategory, string>,
    toggleAria: (name: string) => `Activer ou désactiver ${name}`,
    tagEnabled: (name: string) => `${name} activé`,
    tagDisabled: (name: string) => `${name} désactivé`,
    duplicateAria: (name: string) => `Dupliquer ${name}`,
    deleteAria: (name: string) => `Supprimer ${name}`,
    copySuffix: "(copie)",
    duplicated: (name: string) => `« ${name} » créé`,
    noTagsYet: "Aucun tag pour l'instant — créez-en un pour commencer.",
    noTagsMatch: "Aucun tag ne correspond à vos filtres.",
    deleteTitle: "Supprimer le tag ?",
    deleteDescription: (name: string) =>
      `« ${name} » sera définitivement supprimé.`,
    deleted: "Tag supprimé",
    delete: "Supprimer",
    cancel: "Annuler",
  },
  de: {
    intro:
      "Die KI gleicht jede Antwort mit diesen Prompts ab und wendet passende Tags automatisch an.",
    filterAll: "Alle",
    filterActive: "Aktiv",
    searchPlaceholder: "Tags durchsuchen…",
    createTag: "Tag erstellen",
    category: {
      positive: "Positiv",
      neutral: "Neutral",
      negative: "Negativ",
    } as Record<TagCategory, string>,
    toggleAria: (name: string) => `${name} umschalten`,
    tagEnabled: (name: string) => `${name} aktiviert`,
    tagDisabled: (name: string) => `${name} deaktiviert`,
    duplicateAria: (name: string) => `${name} duplizieren`,
    deleteAria: (name: string) => `${name} löschen`,
    copySuffix: "(Kopie)",
    duplicated: (name: string) => `„${name}“ erstellt`,
    noTagsYet: "Noch keine Tags — erstelle einen, um loszulegen.",
    noTagsMatch: "Keine Tags entsprechen deinen Filtern.",
    deleteTitle: "Tag löschen?",
    deleteDescription: (name: string) => `„${name}“ wird endgültig gelöscht.`,
    deleted: "Tag gelöscht",
    delete: "Löschen",
    cancel: "Abbrechen",
  },
  pt: {
    intro:
      "A IA compara cada resposta com estes prompts e aplica automaticamente as etiquetas correspondentes.",
    filterAll: "Todas",
    filterActive: "Ativas",
    searchPlaceholder: "Pesquisar etiquetas…",
    createTag: "Criar etiqueta",
    category: {
      positive: "Positivo",
      neutral: "Neutro",
      negative: "Negativo",
    } as Record<TagCategory, string>,
    toggleAria: (name: string) => `Ativar ou desativar ${name}`,
    tagEnabled: (name: string) => `${name} ativada`,
    tagDisabled: (name: string) => `${name} desativada`,
    duplicateAria: (name: string) => `Duplicar ${name}`,
    deleteAria: (name: string) => `Eliminar ${name}`,
    copySuffix: "(cópia)",
    duplicated: (name: string) => `"${name}" criada`,
    noTagsYet: "Ainda não há etiquetas — crie uma para começar.",
    noTagsMatch: "Nenhuma etiqueta corresponde aos seus filtros.",
    deleteTitle: "Eliminar etiqueta?",
    deleteDescription: (name: string) =>
      `"${name}" será eliminada permanentemente.`,
    deleted: "Etiqueta eliminada",
    delete: "Eliminar",
    cancel: "Cancelar",
  },
  pt_BR: {
    intro:
      "A IA compara cada resposta com esses prompts e aplica automaticamente as tags correspondentes.",
    filterAll: "Todas",
    filterActive: "Ativas",
    searchPlaceholder: "Pesquisar tags…",
    createTag: "Criar tag",
    category: {
      positive: "Positivo",
      neutral: "Neutro",
      negative: "Negativo",
    } as Record<TagCategory, string>,
    toggleAria: (name: string) => `Ativar ou desativar ${name}`,
    tagEnabled: (name: string) => `${name} ativada`,
    tagDisabled: (name: string) => `${name} desativada`,
    duplicateAria: (name: string) => `Duplicar ${name}`,
    deleteAria: (name: string) => `Excluir ${name}`,
    copySuffix: "(cópia)",
    duplicated: (name: string) => `"${name}" criada`,
    noTagsYet: "Ainda não há tags — crie uma para começar.",
    noTagsMatch: "Nenhuma tag corresponde aos seus filtros.",
    deleteTitle: "Excluir tag?",
    deleteDescription: (name: string) =>
      `"${name}" será excluída permanentemente.`,
    deleted: "Tag excluída",
    delete: "Excluir",
    cancel: "Cancelar",
  },
} as const

// Category → dot color + badge treatment. Derived from category (not an
// independent per-tag color field) so the row dot and the pill always agree —
// mirrors the existing positive/neutral/negative idiom in Coach.tsx.
const CATEGORY_META: Record<
  TagCategory,
  {
    dot: string
    badgeVariant: "success" | "outline"
    badgeClassName?: string
  }
> = {
  positive: { dot: "bg-chart-1", badgeVariant: "success" },
  neutral: {
    dot: "bg-chart-4",
    badgeVariant: "outline",
    badgeClassName: "border-transparent bg-chart-4/15 text-chart-4",
  },
  negative: {
    dot: "bg-destructive",
    badgeVariant: "outline",
    badgeClassName: "border-transparent bg-destructive/15 text-destructive",
  },
}

type Filter = "all" | "active"

export function ConversationTagsTab() {
  const { locale } = useLocale()
  const c = COPY[locale]

  const tags = useConversationTags()
  const [filter, setFilter] = React.useState<Filter>("all")
  const [query, setQuery] = React.useState("")
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingTag, setEditingTag] = React.useState<ConversationTag | null>(
    null
  )
  const [deleteTarget, setDeleteTarget] = React.useState<ConversationTag | null>(
    null
  )

  const q = query.trim().toLowerCase()
  const filtered = tags.filter((t) => {
    if (filter === "active" && !t.active) return false
    if (q && !t.name.toLowerCase().includes(q) && !t.prompt.toLowerCase().includes(q)) {
      return false
    }
    return true
  })

  function openCreate() {
    setEditingTag(null)
    setFormOpen(true)
  }

  function openEdit(tag: ConversationTag) {
    setEditingTag(tag)
    setFormOpen(true)
  }

  function handleToggle(tag: ConversationTag) {
    conversationTagStore.toggleActive(tag.id)
    toast(tag.active ? c.tagDisabled(tag.name) : c.tagEnabled(tag.name))
  }

  function handleDuplicate(tag: ConversationTag) {
    const created = conversationTagStore.duplicate(
      tag.id,
      `${tag.name} ${c.copySuffix}`
    )
    if (created) toast.success(c.duplicated(created.name))
  }

  function handleDelete() {
    if (!deleteTarget) return
    conversationTagStore.remove(deleteTarget.id)
    toast.success(c.deleted)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">{c.intro}</p>

      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          options={[
            { v: "all" as const, label: c.filterAll },
            { v: "active" as const, label: c.filterActive },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={c.searchPlaceholder}
            className="pl-9"
          />
        </div>
        <Button variant="volt" className="shrink-0" onClick={openCreate}>
          <Plus className="size-4" />
          {c.createTag}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          {tags.length === 0 ? c.noTagsYet : c.noTagsMatch}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((tag) => {
            const meta = CATEGORY_META[tag.category]
            return (
              <Card
                key={tag.id}
                role="button"
                tabIndex={0}
                onClick={() => openEdit(tag)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    openEdit(tag)
                  }
                }}
                className="hover:border-primary/40 focus-visible:border-primary/40 focus-visible:ring-ring/50 cursor-pointer py-4 outline-none transition-colors focus-visible:ring-[3px]"
              >
                <CardContent className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={cn("size-2 shrink-0 rounded-full", meta.dot)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{tag.name}</p>
                    <p className="text-muted-foreground truncate text-sm">
                      {tag.prompt}
                    </p>
                  </div>
                  <Badge
                    variant={meta.badgeVariant}
                    className={cn("shrink-0", meta.badgeClassName)}
                  >
                    {c.category[tag.category]}
                  </Badge>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={c.duplicateAria(tag.name)}
                      className="text-muted-foreground size-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicate(tag)
                      }}
                    >
                      <Copy className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={c.deleteAria(tag.name)}
                      className="text-muted-foreground hover:text-destructive size-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteTarget(tag)
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center"
                    >
                      <Switch
                        checked={tag.active}
                        onCheckedChange={() => handleToggle(tag)}
                        aria-label={c.toggleAria(tag.name)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <ConversationTagFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        tag={editingTag}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null)
        }}
        title={c.deleteTitle}
        description={
          deleteTarget ? c.deleteDescription(deleteTarget.name) : undefined
        }
        confirmLabel={c.delete}
        cancelLabel={c.cancel}
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}
