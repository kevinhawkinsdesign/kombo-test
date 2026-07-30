import * as React from "react"
import { toast } from "sonner"
import { Sparkles } from "lucide-react"

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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  conversationTagStore,
  type ConversationTag,
  type TagCategory,
} from "@/lib/conversation-tags"
import { useLocale } from "@/lib/locale"

const COPY = {
  en: {
    titleNew: "New conversation tag",
    titleEdit: "Edit conversation tag",
    description:
      "Define a prompt — the AI applies this tag automatically to matching replies.",
    nameLabel: "Name",
    namePlaceholder: "e.g. Bad timing",
    categoryLabel: "Category",
    category: {
      positive: "Positive",
      neutral: "Neutral",
      negative: "Negative",
    } as Record<TagCategory, string>,
    promptLabel: "Prompt",
    promptPlaceholder:
      "e.g. Classify replies where the prospect says now isn't a good time…",
    promptHint:
      "The AI checks every reply against this prompt and applies the tag when it matches.",
    cancel: "Cancel",
    create: "Create tag",
    save: "Save",
    created: "Tag created",
    updated: "Tag updated",
  },
  es: {
    titleNew: "Nueva etiqueta de conversación",
    titleEdit: "Editar etiqueta de conversación",
    description:
      "Define un prompt — la IA aplica esta etiqueta automáticamente a las respuestas que coincidan.",
    nameLabel: "Nombre",
    namePlaceholder: "p. ej. Mal momento",
    categoryLabel: "Categoría",
    category: {
      positive: "Positivo",
      neutral: "Neutral",
      negative: "Negativo",
    } as Record<TagCategory, string>,
    promptLabel: "Prompt",
    promptPlaceholder:
      "p. ej. Clasifica las respuestas en las que el prospecto dice que no es buen momento…",
    promptHint:
      "La IA compara cada respuesta con este prompt y aplica la etiqueta cuando coincide.",
    cancel: "Cancelar",
    create: "Crear etiqueta",
    save: "Guardar",
    created: "Etiqueta creada",
    updated: "Etiqueta actualizada",
  },
  it: {
    titleNew: "Nuovo tag di conversazione",
    titleEdit: "Modifica tag di conversazione",
    description:
      "Definisci un prompt — l'IA applica questo tag automaticamente alle risposte corrispondenti.",
    nameLabel: "Nome",
    namePlaceholder: "es. Momento sbagliato",
    categoryLabel: "Categoria",
    category: {
      positive: "Positivo",
      neutral: "Neutro",
      negative: "Negativo",
    } as Record<TagCategory, string>,
    promptLabel: "Prompt",
    promptPlaceholder:
      "es. Classifica le risposte in cui il prospect dice che non è un buon momento…",
    promptHint:
      "L'IA confronta ogni risposta con questo prompt e applica il tag quando corrisponde.",
    cancel: "Annulla",
    create: "Crea tag",
    save: "Salva",
    created: "Tag creato",
    updated: "Tag aggiornato",
  },
  fr: {
    titleNew: "Nouveau tag de conversation",
    titleEdit: "Modifier le tag de conversation",
    description:
      "Définissez un prompt — l'IA applique ce tag automatiquement aux réponses correspondantes.",
    nameLabel: "Nom",
    namePlaceholder: "ex. Mauvais moment",
    categoryLabel: "Catégorie",
    category: {
      positive: "Positif",
      neutral: "Neutre",
      negative: "Négatif",
    } as Record<TagCategory, string>,
    promptLabel: "Prompt",
    promptPlaceholder:
      "ex. Classez les réponses où le prospect dit que ce n'est pas le bon moment…",
    promptHint:
      "L'IA compare chaque réponse à ce prompt et applique le tag en cas de correspondance.",
    cancel: "Annuler",
    create: "Créer le tag",
    save: "Enregistrer",
    created: "Tag créé",
    updated: "Tag mis à jour",
  },
  de: {
    titleNew: "Neuer Konversations-Tag",
    titleEdit: "Konversations-Tag bearbeiten",
    description:
      "Definiere einen Prompt — die KI wendet diesen Tag automatisch auf passende Antworten an.",
    nameLabel: "Name",
    namePlaceholder: "z. B. Ungünstiger Zeitpunkt",
    categoryLabel: "Kategorie",
    category: {
      positive: "Positiv",
      neutral: "Neutral",
      negative: "Negativ",
    } as Record<TagCategory, string>,
    promptLabel: "Prompt",
    promptPlaceholder:
      "z. B. Klassifiziere Antworten, in denen der Interessent sagt, dass es gerade nicht passt…",
    promptHint:
      "Die KI gleicht jede Antwort mit diesem Prompt ab und wendet den Tag bei einer Übereinstimmung an.",
    cancel: "Abbrechen",
    create: "Tag erstellen",
    save: "Speichern",
    created: "Tag erstellt",
    updated: "Tag aktualisiert",
  },
  pt: {
    titleNew: "Nova etiqueta de conversa",
    titleEdit: "Editar etiqueta de conversa",
    description:
      "Defina um prompt — a IA aplica esta etiqueta automaticamente às respostas correspondentes.",
    nameLabel: "Nome",
    namePlaceholder: "ex.: Mau momento",
    categoryLabel: "Categoria",
    category: {
      positive: "Positivo",
      neutral: "Neutro",
      negative: "Negativo",
    } as Record<TagCategory, string>,
    promptLabel: "Prompt",
    promptPlaceholder:
      "ex.: Classifique as respostas em que o prospect diz que não é um bom momento…",
    promptHint:
      "A IA compara cada resposta com este prompt e aplica a etiqueta quando corresponde.",
    cancel: "Cancelar",
    create: "Criar etiqueta",
    save: "Guardar",
    created: "Etiqueta criada",
    updated: "Etiqueta atualizada",
  },
  pt_BR: {
    titleNew: "Nova tag de conversa",
    titleEdit: "Editar tag de conversa",
    description:
      "Defina um prompt — a IA aplica essa tag automaticamente às respostas correspondentes.",
    nameLabel: "Nome",
    namePlaceholder: "ex.: Momento ruim",
    categoryLabel: "Categoria",
    category: {
      positive: "Positivo",
      neutral: "Neutro",
      negative: "Negativo",
    } as Record<TagCategory, string>,
    promptLabel: "Prompt",
    promptPlaceholder:
      "ex.: Classifique as respostas em que o prospect diz que não é um bom momento…",
    promptHint:
      "A IA compara cada resposta com esse prompt e aplica a tag quando corresponde.",
    cancel: "Cancelar",
    create: "Criar tag",
    save: "Salvar",
    created: "Tag criada",
    updated: "Tag atualizada",
  },
} as const

const CATEGORIES: TagCategory[] = ["positive", "neutral", "negative"]

export function ConversationTagFormDialog({
  open,
  onOpenChange,
  tag,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  /** Present = edit mode; absent = create mode. */
  tag?: ConversationTag | null
}) {
  const { locale } = useLocale()
  const c = COPY[locale]

  const [name, setName] = React.useState("")
  const [category, setCategory] = React.useState<TagCategory>("neutral")
  const [prompt, setPrompt] = React.useState("")

  // Reset on open (house pattern), seeding from `tag` in edit mode.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setName(tag?.name ?? "")
      setCategory(tag?.category ?? "neutral")
      setPrompt(tag?.prompt ?? "")
    }
  }

  const isEdit = Boolean(tag)
  const canSave = name.trim().length > 0 && prompt.trim().length > 0

  function handleSave() {
    if (!canSave) return
    if (tag) {
      conversationTagStore.update(tag.id, {
        name: name.trim(),
        category,
        prompt: prompt.trim(),
      })
      toast.success(c.updated)
    } else {
      conversationTagStore.create({
        name: name.trim(),
        category,
        prompt: prompt.trim(),
        active: true,
      })
      toast.success(c.created)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
              <Sparkles className="size-4" />
            </span>
            {isEdit ? c.titleEdit : c.titleNew}
          </DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tag-name">{c.nameLabel}</Label>
            <Input
              id="tag-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={c.namePlaceholder}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag-category">{c.categoryLabel}</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as TagCategory)}
            >
              <SelectTrigger id="tag-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {c.category[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag-prompt">{c.promptLabel}</Label>
            <Textarea
              id="tag-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={c.promptPlaceholder}
              className="min-h-32"
            />
            <p className="text-muted-foreground text-xs">{c.promptHint}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="volt" onClick={handleSave} disabled={!canSave}>
            {isEdit ? c.save : c.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
