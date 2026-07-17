import * as React from "react"
import { toast } from "sonner"
import { Plus, Trash2, X } from "lucide-react"

import { useLocale } from "@/lib/locale"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { SALES_METHODOLOGIES } from "@/lib/mock-settings"
import {
  useCustomMethodologies,
  methodologyStore,
  type MethodologySection,
} from "@/lib/mock-methodologies"

const CUSTOM_PREFIX = "custom:"

const COPY = {
  en: {
    title: "Sales Methodology",
    description: "Kai uses this to structure call prep and qualification.",
    methodology: "Methodology",
    custom: "Custom",
    addCustom: "Add custom",
    deleteCustom: "Delete custom methodology",
    saveChanges: "Save changes",
    methodologySaved: "Methodology saved",
    deleteTitle: "Delete methodology?",
    deleteDesc: (name: string) => `"${name}" will be permanently removed.`,
    deleteConfirm: "Delete",
    deleted: "Methodology deleted",
    newTitle: "New sales methodology",
    formDesc:
      "Define the discovery sections and example questions Kai should draw on for this methodology.",
    name: "Methodology name",
    namePlaceholder: "e.g. Value Selling",
    sections: "Sections",
    sectionTitlePlaceholder: "Section title (e.g. Metrics)",
    questionPlaceholder: "Example question",
    addQuestion: "Add question",
    addSection: "Add section",
    removeSection: "Remove section",
    removeQuestion: "Remove question",
    cancel: "Cancel",
    saveCustom: "Save methodology",
    created: "Methodology created",
    nameRequired: "Give the methodology a name.",
    sectionRequired:
      "Add at least one section with a title and one example question.",
  },
  es: {
    title: "Metodología de ventas",
    description:
      "Kai la usa para estructurar la preparación de llamadas y la cualificación.",
    methodology: "Metodología",
    custom: "Personalizada",
    addCustom: "Añadir personalizada",
    deleteCustom: "Eliminar metodología personalizada",
    saveChanges: "Guardar cambios",
    methodologySaved: "Metodología guardada",
    deleteTitle: "¿Eliminar metodología?",
    deleteDesc: (name: string) => `"${name}" se eliminará de forma permanente.`,
    deleteConfirm: "Eliminar",
    deleted: "Metodología eliminada",
    newTitle: "Nueva metodología de ventas",
    formDesc:
      "Define las secciones de descubrimiento y las preguntas de ejemplo que Kai debe usar para esta metodología.",
    name: "Nombre de la metodología",
    namePlaceholder: "ej. Value Selling",
    sections: "Secciones",
    sectionTitlePlaceholder: "Título de la sección (ej. Métricas)",
    questionPlaceholder: "Pregunta de ejemplo",
    addQuestion: "Añadir pregunta",
    addSection: "Añadir sección",
    removeSection: "Quitar sección",
    removeQuestion: "Quitar pregunta",
    cancel: "Cancelar",
    saveCustom: "Guardar metodología",
    created: "Metodología creada",
    nameRequired: "Dale un nombre a la metodología.",
    sectionRequired:
      "Añade al menos una sección con un título y una pregunta de ejemplo.",
  },
  it: {
    title: "Metodologia di vendita",
    description:
      "Kai la usa per strutturare la preparazione delle chiamate e la qualificazione.",
    methodology: "Metodologia",
    custom: "Personalizzata",
    addCustom: "Aggiungi personalizzata",
    deleteCustom: "Elimina metodologia personalizzata",
    saveChanges: "Salva le modifiche",
    methodologySaved: "Metodologia salvata",
    deleteTitle: "Eliminare la metodologia?",
    deleteDesc: (name: string) => `"${name}" verrà rimossa in modo permanente.`,
    deleteConfirm: "Elimina",
    deleted: "Metodologia eliminata",
    newTitle: "Nuova metodologia di vendita",
    formDesc:
      "Definisci le sezioni di scoperta e le domande di esempio che Kai deve usare per questa metodologia.",
    name: "Nome della metodologia",
    namePlaceholder: "es. Value Selling",
    sections: "Sezioni",
    sectionTitlePlaceholder: "Titolo sezione (es. Metriche)",
    questionPlaceholder: "Domanda di esempio",
    addQuestion: "Aggiungi domanda",
    addSection: "Aggiungi sezione",
    removeSection: "Rimuovi sezione",
    removeQuestion: "Rimuovi domanda",
    cancel: "Annulla",
    saveCustom: "Salva metodologia",
    created: "Metodologia creata",
    nameRequired: "Assegna un nome alla metodologia.",
    sectionRequired:
      "Aggiungi almeno una sezione con un titolo e una domanda di esempio.",
  },
  fr: {
    title: "Méthodologie de vente",
    description:
      "Kai l'utilise pour structurer la préparation des appels et la qualification.",
    methodology: "Méthodologie",
    custom: "Personnalisée",
    addCustom: "Ajouter une personnalisée",
    deleteCustom: "Supprimer la méthodologie personnalisée",
    saveChanges: "Enregistrer les modifications",
    methodologySaved: "Méthodologie enregistrée",
    deleteTitle: "Supprimer la méthodologie ?",
    deleteDesc: (name: string) => `"${name}" sera définitivement supprimée.`,
    deleteConfirm: "Supprimer",
    deleted: "Méthodologie supprimée",
    newTitle: "Nouvelle méthodologie de vente",
    formDesc:
      "Définissez les sections de découverte et les questions types que Kai doit utiliser pour cette méthodologie.",
    name: "Nom de la méthodologie",
    namePlaceholder: "ex. Value Selling",
    sections: "Sections",
    sectionTitlePlaceholder: "Titre de la section (ex. Métriques)",
    questionPlaceholder: "Question type",
    addQuestion: "Ajouter une question",
    addSection: "Ajouter une section",
    removeSection: "Retirer la section",
    removeQuestion: "Retirer la question",
    cancel: "Annuler",
    saveCustom: "Enregistrer la méthodologie",
    created: "Méthodologie créée",
    nameRequired: "Donnez un nom à la méthodologie.",
    sectionRequired:
      "Ajoutez au moins une section avec un titre et une question type.",
  },
  de: {
    title: "Vertriebsmethodik",
    description:
      "Kai nutzt sie, um Gesprächsvorbereitung und Qualifizierung zu strukturieren.",
    methodology: "Methodik",
    custom: "Eigene",
    addCustom: "Eigene hinzufügen",
    deleteCustom: "Eigene Methodik löschen",
    saveChanges: "Änderungen speichern",
    methodologySaved: "Methodik gespeichert",
    deleteTitle: "Methodik löschen?",
    deleteDesc: (name: string) => `"${name}" wird endgültig entfernt.`,
    deleteConfirm: "Löschen",
    deleted: "Methodik gelöscht",
    newTitle: "Neue Vertriebsmethodik",
    formDesc:
      "Definiere die Discovery-Abschnitte und Beispielfragen, die Kai für diese Methodik verwenden soll.",
    name: "Name der Methodik",
    namePlaceholder: "z. B. Value Selling",
    sections: "Abschnitte",
    sectionTitlePlaceholder: "Abschnittstitel (z. B. Kennzahlen)",
    questionPlaceholder: "Beispielfrage",
    addQuestion: "Frage hinzufügen",
    addSection: "Abschnitt hinzufügen",
    removeSection: "Abschnitt entfernen",
    removeQuestion: "Frage entfernen",
    cancel: "Abbrechen",
    saveCustom: "Methodik speichern",
    created: "Methodik erstellt",
    nameRequired: "Gib der Methodik einen Namen.",
    sectionRequired:
      "Füge mindestens einen Abschnitt mit Titel und einer Beispielfrage hinzu.",
  },
  pt: {
    title: "Metodologia de vendas",
    description:
      "O Kai usa-a para estruturar a preparação de chamadas e a qualificação.",
    methodology: "Metodologia",
    custom: "Personalizada",
    addCustom: "Adicionar personalizada",
    deleteCustom: "Eliminar metodologia personalizada",
    saveChanges: "Guardar alterações",
    methodologySaved: "Metodologia guardada",
    deleteTitle: "Eliminar a metodologia?",
    deleteDesc: (name: string) => `"${name}" será removida permanentemente.`,
    deleteConfirm: "Eliminar",
    deleted: "Metodologia eliminada",
    newTitle: "Nova metodologia de vendas",
    formDesc:
      "Define as secções de descoberta e as perguntas de exemplo que o Kai deve usar para esta metodologia.",
    name: "Nome da metodologia",
    namePlaceholder: "ex. Value Selling",
    sections: "Secções",
    sectionTitlePlaceholder: "Título da secção (ex. Métricas)",
    questionPlaceholder: "Pergunta de exemplo",
    addQuestion: "Adicionar pergunta",
    addSection: "Adicionar secção",
    removeSection: "Remover secção",
    removeQuestion: "Remover pergunta",
    cancel: "Cancelar",
    saveCustom: "Guardar metodologia",
    created: "Metodologia criada",
    nameRequired: "Dê um nome à metodologia.",
    sectionRequired:
      "Adicione pelo menos uma secção com um título e uma pergunta de exemplo.",
  },
  pt_BR: {
    title: "Metodologia de vendas",
    description:
      "O Kai a usa para estruturar a preparação de ligações e a qualificação.",
    methodology: "Metodologia",
    custom: "Personalizada",
    addCustom: "Adicionar personalizada",
    deleteCustom: "Excluir metodologia personalizada",
    saveChanges: "Salvar alterações",
    methodologySaved: "Metodologia salva",
    deleteTitle: "Excluir a metodologia?",
    deleteDesc: (name: string) => `"${name}" será removida permanentemente.`,
    deleteConfirm: "Excluir",
    deleted: "Metodologia excluída",
    newTitle: "Nova metodologia de vendas",
    formDesc:
      "Defina as seções de descoberta e as perguntas de exemplo que o Kai deve usar para essa metodologia.",
    name: "Nome da metodologia",
    namePlaceholder: "ex.: Value Selling",
    sections: "Seções",
    sectionTitlePlaceholder: "Título da seção (ex.: Métricas)",
    questionPlaceholder: "Pergunta de exemplo",
    addQuestion: "Adicionar pergunta",
    addSection: "Adicionar seção",
    removeSection: "Remover seção",
    removeQuestion: "Remover pergunta",
    cancel: "Cancelar",
    saveCustom: "Salvar metodologia",
    created: "Metodologia criada",
    nameRequired: "Dê um nome à metodologia.",
    sectionRequired:
      "Adicione pelo menos uma seção com um título e uma pergunta de exemplo.",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

export function SalesMethodologyCard() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const custom = useCustomMethodologies()
  const [selected, setSelected] = React.useState<string>(
    SALES_METHODOLOGIES[1]
  )
  const [formOpen, setFormOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState<
    (typeof custom)[number] | undefined
  >(undefined)

  const selectedCustom = selected.startsWith(CUSTOM_PREFIX)
    ? custom.find((m) => m.id === selected.slice(CUSTOM_PREFIX.length))
    : undefined

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{c.title}</CardTitle>
        <CardDescription>{c.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{c.methodology}</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SALES_METHODOLOGIES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
                {custom.map((m) => (
                  <SelectItem key={m.id} value={`${CUSTOM_PREFIX}${m.id}`}>
                    <span className="flex items-center gap-2">
                      {m.name}
                      <Badge
                        variant="secondary"
                        className="font-normal"
                      >
                        {c.custom}
                      </Badge>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCustom && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={c.deleteCustom}
                className="text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => setDeleting(selectedCustom)}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFormOpen(true)}
            >
              <Plus className="size-4" />
              {c.addCustom}
            </Button>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => toast.success(c.methodologySaved)}>
            {c.saveChanges}
          </Button>
        </div>
      </CardContent>

      <CustomMethodologyDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        c={c}
        onCreated={(created) => setSelected(`${CUSTOM_PREFIX}${created.id}`)}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(undefined)
        }}
        title={c.deleteTitle}
        description={deleting ? c.deleteDesc(deleting.name) : undefined}
        confirmLabel={c.deleteConfirm}
        destructive
        onConfirm={() => {
          if (!deleting) return
          methodologyStore.remove(deleting.id)
          toast.success(c.deleted)
          setSelected(SALES_METHODOLOGIES[1])
          setDeleting(undefined)
        }}
      />
    </Card>
  )
}

function emptySection(): MethodologySection {
  return { title: "", questions: [""] }
}

function CustomMethodologyDialog({
  open,
  onOpenChange,
  c,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  c: Copy
  onCreated: (created: { id: string; name: string }) => void
}) {
  const [name, setName] = React.useState("")
  const [sections, setSections] = React.useState<MethodologySection[]>([
    emptySection(),
  ])

  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setName("")
      setSections([emptySection()])
    }
  }

  function updateSectionTitle(index: number, title: string) {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, title } : s))
    )
  }

  function updateQuestion(
    sectionIndex: number,
    questionIndex: number,
    value: string
  ) {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIndex
          ? {
              ...s,
              questions: s.questions.map((q, qi) =>
                qi === questionIndex ? value : q
              ),
            }
          : s
      )
    )
  }

  function addQuestion(sectionIndex: number) {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIndex ? { ...s, questions: [...s.questions, ""] } : s
      )
    )
  }

  function removeQuestion(sectionIndex: number, questionIndex: number) {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIndex
          ? {
              ...s,
              questions: s.questions.filter((_, qi) => qi !== questionIndex),
            }
          : s
      )
    )
  }

  function addSection() {
    setSections((prev) => [...prev, emptySection()])
  }

  function removeSection(index: number) {
    setSections((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSave() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error(c.nameRequired)
      return
    }
    const cleanedSections = sections
      .map((s) => ({
        title: s.title.trim(),
        questions: s.questions.map((q) => q.trim()).filter(Boolean),
      }))
      .filter((s) => s.title && s.questions.length > 0)

    if (cleanedSections.length === 0) {
      toast.error(c.sectionRequired)
      return
    }

    const created = methodologyStore.create({
      name: trimmedName,
      sections: cleanedSections,
    })
    toast.success(c.created)
    onCreated(created)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{c.newTitle}</DialogTitle>
          <DialogDescription>{c.formDesc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="methodology-name">{c.name}</Label>
            <Input
              id="methodology-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={c.namePlaceholder}
            />
          </div>

          <div className="space-y-3">
            <Label>{c.sections}</Label>
            {sections.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className="space-y-2 rounded-lg border p-3"
              >
                <div className="flex items-center gap-2">
                  <Input
                    value={section.title}
                    onChange={(e) =>
                      updateSectionTitle(sectionIndex, e.target.value)
                    }
                    placeholder={c.sectionTitlePlaceholder}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={c.removeSection}
                    disabled={sections.length <= 1}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => removeSection(sectionIndex)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="space-y-2 pl-1">
                  {section.questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="flex items-center gap-2">
                      <Input
                        value={question}
                        onChange={(e) =>
                          updateQuestion(
                            sectionIndex,
                            questionIndex,
                            e.target.value
                          )
                        }
                        placeholder={c.questionPlaceholder}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={c.removeQuestion}
                        disabled={section.questions.length <= 1}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() =>
                          removeQuestion(sectionIndex, questionIndex)
                        }
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addQuestion(sectionIndex)}
                  >
                    <Plus className="size-4" />
                    {c.addQuestion}
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addSection}>
              <Plus className="size-4" />
              {c.addSection}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="volt" onClick={handleSave}>
            {c.saveCustom}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
