import * as React from "react"
import { toast } from "sonner"
import {
  Sparkles,
  Type,
  Gauge,
  ToggleLeft,
  Pencil,
  Wand2,
  LayoutGrid,
  Settings2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import {
  aiColumnStore,
  useAiColumns,
  type AiColumnEntity,
  type AiColumnKind,
  type AiColumnOutput,
} from "@/lib/ai-columns"
import {
  useProspects,
  useAccounts,
  prospectStore,
  accountStore,
} from "@/lib/store"

const COPY = {
  en: {
    title: "Table columns — AI & custom",
    description:
      "Add a column the AI fills per row, a custom column you fill yourself, or let the AI rewrite an existing column's values.",
    tabTemplates: "Templates",
    tabScratch: "From scratch",
    tabTransform: "Transform a column",
    tabManage: "Manage",
    useTemplate: "Use this template",
    exampleBefore: "Before",
    exampleAfter: "After",
    name: "Column name",
    namePlaceholder: "e.g. Last funding round",
    fillLabel: "How is it filled?",
    fillAi: "AI fills it",
    fillAiDesc: "Runs the prompt per row.",
    fillCustom: "I'll fill it myself",
    fillCustomDesc: "Starts empty — type values in edit mode.",
    prompt: "AI prompt",
    output: "Output",
    outText: "Text",
    outScore: "Score",
    outYesNo: "Yes / No",
    cancel: "Cancel",
    create: "Create column",
    close: "Done",
    transformColumn: "Column to transform",
    transformHow: "What should the AI do?",
    transformApply: "Apply to all rows",
    transformed: (n: number) => `${n} ${n === 1 ? "value" : "values"} updated`,
    transformHint:
      "Rewrites this column's values in your workspace copy — the original source data is untouched.",
    manageEmpty: "No AI or custom columns yet.",
    renamed: "Column updated",
    deleted: "Column deleted",
    rename: "Rename",
    deleteAria: (name: string) => `Delete ${name}`,
    categories: {
      clean: "Clean",
      copywrite: "Copywrite",
      extract: "Extract",
      research: "Research",
    },
    transforms: {
      titlecase: "Fix casing (Title Case, keep acronyms)",
      clean_suffix: "Strip decorations (“VP of Marketing - Apply Now!” → “VP of Marketing”)",
      company_suffix: "Remove legal suffixes (Inc., LLC, GmbH…)",
      city: "Keep the city only",
      trim: "Trim & collapse whitespace",
    },
    fields: {
      title: "Job title",
      company: "Company",
      location: "Location",
      name: "Company name",
      industry: "Industry",
    },
  },
  es: {
    title: "Columnas de la tabla — IA y personalizadas",
    description:
      "Añade una columna que la IA rellena por fila, una columna personalizada que rellenas tú, o deja que la IA reescriba los valores de una columna existente.",
    tabTemplates: "Plantillas",
    tabScratch: "Desde cero",
    tabTransform: "Transformar una columna",
    tabManage: "Gestionar",
    useTemplate: "Usar esta plantilla",
    exampleBefore: "Antes",
    exampleAfter: "Después",
    name: "Nombre de columna",
    namePlaceholder: "p. ej. Última ronda de financiación",
    fillLabel: "¿Cómo se rellena?",
    fillAi: "La IA la rellena",
    fillAiDesc: "Ejecuta el prompt por fila.",
    fillCustom: "La relleno yo",
    fillCustomDesc: "Empieza vacía — escribe valores en modo edición.",
    prompt: "Prompt de IA",
    output: "Salida",
    outText: "Texto",
    outScore: "Puntuación",
    outYesNo: "Sí / No",
    cancel: "Cancelar",
    create: "Crear columna",
    close: "Listo",
    transformColumn: "Columna a transformar",
    transformHow: "¿Qué debe hacer la IA?",
    transformApply: "Aplicar a todas las filas",
    transformed: (n: number) =>
      `${n} ${n === 1 ? "valor actualizado" : "valores actualizados"}`,
    transformHint:
      "Reescribe los valores de esta columna en tu copia del espacio de trabajo — los datos de origen no se tocan.",
    manageEmpty: "Aún no hay columnas de IA ni personalizadas.",
    renamed: "Columna actualizada",
    deleted: "Columna eliminada",
    rename: "Renombrar",
    deleteAria: (name: string) => `Eliminar ${name}`,
    categories: {
      clean: "Limpieza",
      copywrite: "Redacción",
      extract: "Extracción",
      research: "Investigación",
    },
    transforms: {
      titlecase: "Corregir mayúsculas (Título, conserva siglas)",
      clean_suffix: "Quitar adornos (“VP of Marketing - Apply Now!” → “VP of Marketing”)",
      company_suffix: "Quitar sufijos legales (Inc., LLC, GmbH…)",
      city: "Dejar solo la ciudad",
      trim: "Recortar y compactar espacios",
    },
    fields: {
      title: "Cargo",
      company: "Empresa",
      location: "Ubicación",
      name: "Nombre de la empresa",
      industry: "Sector",
    },
  },
} as const

/* ------------------------------ templates -------------------------------- */

interface ColumnTemplate {
  id: string
  category: "clean" | "copywrite" | "extract" | "research"
  name: { en: string; es: string }
  desc: { en: string; es: string }
  prompt: { en: string; es: string }
  output: AiColumnOutput
  example?: { before: string; after: string }
}

// Mirrors Lemlist's AI Column Templates gallery, adapted to our fields.
const TEMPLATES: ColumnTemplate[] = [
  {
    id: "clean_job_title",
    category: "clean",
    name: { en: "Clean job title", es: "Limpiar cargo" },
    desc: {
      en: "Standardize and clean job titles for consistency.",
      es: "Estandariza y limpia los cargos para mantener consistencia.",
    },
    prompt: {
      en: "Clean and standardize the job title: title case, keep acronyms (CEO, VP…), remove decorations like “- Apply Now!”, never translate.",
      es: "Limpia y estandariza el cargo: mayúsculas de título, conserva siglas (CEO, VP…), elimina adornos como “- Apply Now!”, nunca traduzcas.",
    },
    output: "text",
    example: { before: "VP of Marketing - Apply Now!", after: "VP of Marketing" },
  },
  {
    id: "clean_company",
    category: "clean",
    name: { en: "Clean company name", es: "Limpiar nombre de empresa" },
    desc: {
      en: "Drop legal suffixes and decorations from company names.",
      es: "Quita sufijos legales y adornos de los nombres de empresa.",
    },
    prompt: {
      en: "Clean the company name: remove legal suffixes (Inc., LLC, GmbH, S.L.) and taglines, keep the brand name only.",
      es: "Limpia el nombre de la empresa: quita sufijos legales (Inc., LLC, GmbH, S.L.) y eslóganes, deja solo la marca.",
    },
    output: "text",
    example: { before: "Acme Corp, Inc. — We're hiring!", after: "Acme" },
  },
  {
    id: "icebreaker_desc",
    category: "copywrite",
    name: { en: "Icebreaker from description", es: "Rompehielos desde la descripción" },
    desc: {
      en: "A one-line personalized opener from the company description.",
      es: "Una primera línea personalizada a partir de la descripción de la empresa.",
    },
    prompt: {
      en: "Write a one-line, non-salesy icebreaker referencing what the company does.",
      es: "Escribe un rompehielos de una línea, sin sonar a venta, mencionando lo que hace la empresa.",
    },
    output: "text",
  },
  {
    id: "icebreaker_news",
    category: "copywrite",
    name: { en: "Icebreaker from news", es: "Rompehielos desde noticias" },
    desc: {
      en: "An opener referencing the company's latest news or launch.",
      es: "Una apertura que menciona la última noticia o lanzamiento de la empresa.",
    },
    prompt: {
      en: "Find the company's most recent news and write a one-line opener referencing it.",
      es: "Encuentra la noticia más reciente de la empresa y escribe una apertura de una línea que la mencione.",
    },
    output: "text",
  },
  {
    id: "extract_city",
    category: "extract",
    name: { en: "Extract city", es: "Extraer ciudad" },
    desc: {
      en: "Pull just the city out of a full location or address.",
      es: "Extrae solo la ciudad de una ubicación o dirección completa.",
    },
    prompt: {
      en: "Extract only the city from the location field.",
      es: "Extrae solo la ciudad del campo de ubicación.",
    },
    output: "text",
    example: { before: "Barcelona, Catalonia, Spain", after: "Barcelona" },
  },
  {
    id: "latest_news",
    category: "research",
    name: { en: "Find latest company news", es: "Buscar últimas noticias" },
    desc: {
      en: "One line summarizing the company's most recent announcement.",
      es: "Una línea que resume el anuncio más reciente de la empresa.",
    },
    prompt: {
      en: "Search for the company's most recent announcement and summarize it in one line.",
      es: "Busca el anuncio más reciente de la empresa y resúmelo en una línea.",
    },
    output: "text",
  },
  {
    id: "decision_maker",
    category: "research",
    name: { en: "Decision maker?", es: "¿Decide la compra?" },
    desc: {
      en: "Whether this person likely owns the buying decision.",
      es: "Si esta persona probablemente decide la compra.",
    },
    prompt: {
      en: "Based on title and seniority, is this person likely a decision maker? Yes or no.",
      es: "Según el cargo y la antigüedad, ¿es probable que esta persona decida la compra? Sí o no.",
    },
    output: "yesno",
  },
  {
    id: "fit_score",
    category: "research",
    name: { en: "ICP fit score", es: "Puntuación de encaje ICP" },
    desc: {
      en: "Scores each row against your primary ICP, 0-100.",
      es: "Puntúa cada fila contra tu ICP principal, 0-100.",
    },
    prompt: {
      en: "Score how well this record matches our primary ICP, 0-100.",
      es: "Puntúa qué tan bien encaja este registro con nuestro ICP principal, 0-100.",
    },
    output: "score",
  },
]

/* ------------------------------ transforms ------------------------------- */

const ACRONYMS = new Set(["CEO", "CTO", "CFO", "COO", "CMO", "CRO", "VP", "HR", "IT", "SDR", "AE"])

function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .map((w) => {
      const bare = w.replace(/[^A-Za-z]/g, "").toUpperCase()
      if (ACRONYMS.has(bare)) return w.toUpperCase()
      if (/^(of|the|and|for|de|la|el|y)$/i.test(w)) return w.toLowerCase()
      return w.charAt(0).toUpperCase() + w.slice(1)
    })
    .join(" ")
}

type TransformId = "titlecase" | "clean_suffix" | "company_suffix" | "city" | "trim"

const TRANSFORMERS: Record<TransformId, (v: string) => string> = {
  titlecase: (v) => titleCase(v.trim()),
  clean_suffix: (v) => v.split(/\s+[-–|(]/)[0].trim(),
  company_suffix: (v) =>
    v
      .replace(/[,]?\s*(inc\.?|llc|ltd\.?|gmbh|s\.l\.|s\.a\.|corp\.?)\s*$/i, "")
      .trim(),
  city: (v) => v.split(",")[0].trim(),
  trim: (v) => v.replace(/\s+/g, " ").trim(),
}

// The base record fields the transform mode can rewrite, per entity.
const PEOPLE_FIELDS = ["title", "company", "location"] as const
const COMPANY_FIELDS = ["name", "industry", "location"] as const

/* -------------------------------- dialog --------------------------------- */

type Mode = "templates" | "scratch" | "transform" | "manage"

export function AddAiColumnDialog({
  open,
  onOpenChange,
  entity,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  entity: AiColumnEntity
  onCreated?: (id: string) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const prospects = useProspects()
  const accounts = useAccounts()
  const ownColumns = useAiColumns(entity)

  const [mode, setMode] = React.useState<Mode>("templates")
  const [name, setName] = React.useState("")
  const [prompt, setPrompt] = React.useState("")
  const [output, setOutput] = React.useState<AiColumnOutput>("text")
  const [kind, setKind] = React.useState<AiColumnKind>("ai")
  const [transformField, setTransformField] = React.useState<string>(
    entity === "company" ? "name" : "title"
  )
  const [transformId, setTransformId] = React.useState<TransformId>("titlecase")
  const [wasOpen, setWasOpen] = React.useState(false)

  if (open && !wasOpen) {
    setWasOpen(true)
    setMode("templates")
    setName("")
    setPrompt("")
    setOutput("text")
    setKind("ai")
    setTransformField(entity === "company" ? "name" : "title")
    setTransformId("titlecase")
  }
  if (!open && wasOpen) setWasOpen(false)

  const outputs: { value: AiColumnOutput; label: string; icon: typeof Type }[] = [
    { value: "text", label: c.outText, icon: Type },
    { value: "score", label: c.outScore, icon: Gauge },
    { value: "yesno", label: c.outYesNo, icon: ToggleLeft },
  ]

  const canCreate =
    name.trim().length > 0 && (kind === "custom" || prompt.trim().length > 0)

  function create() {
    if (!canCreate) return
    const col = aiColumnStore.add({
      entity,
      label: name.trim(),
      prompt: prompt.trim(),
      output: kind === "custom" ? "text" : output,
      kind,
    })
    onCreated?.(col.id)
    onOpenChange(false)
  }

  function applyTemplate(t: ColumnTemplate) {
    setName(t.name[locale])
    setPrompt(t.prompt[locale])
    setOutput(t.output)
    setKind("ai")
    setMode("scratch")
  }

  // Rewrite an existing column's values (the user's workspace copy).
  function applyTransform() {
    const fn = TRANSFORMERS[transformId]
    let changed = 0
    const isCustomCol = transformField.startsWith("ai_")
    if (isCustomCol) {
      const col = ownColumns.find((x) => x.id === transformField)
      const rows = entity === "company" ? accounts : prospects
      rows.forEach((r) => {
        const cur = col?.values?.[r.id] ?? ""
        const next = fn(cur)
        if (cur && next !== cur) {
          aiColumnStore.setValue(transformField, r.id, next)
          changed++
        }
      })
    } else if (entity === "company") {
      accounts.forEach((a) => {
        const cur = String(a[transformField as (typeof COMPANY_FIELDS)[number]] ?? "")
        const next = fn(cur)
        if (cur && next !== cur) {
          accountStore.update(a.id, { [transformField]: next })
          changed++
        }
      })
    } else {
      prospects.forEach((p) => {
        const cur = String(p[transformField as (typeof PEOPLE_FIELDS)[number]] ?? "")
        const next = fn(cur)
        if (cur && next !== cur) {
          prospectStore.update(p.id, { [transformField]: next })
          changed++
        }
      })
    }
    toast.success(c.transformed(changed))
    onOpenChange(false)
  }

  const baseFields = entity === "company" ? COMPANY_FIELDS : PEOPLE_FIELDS
  const textColumns = ownColumns.filter((x) => x.output === "text")

  const tabs: { key: Mode; label: string; icon: typeof Type }[] = [
    { key: "templates", label: c.tabTemplates, icon: LayoutGrid },
    { key: "scratch", label: c.tabScratch, icon: Pencil },
    { key: "transform", label: c.tabTransform, icon: Wand2 },
    { key: "manage", label: c.tabManage, icon: Settings2 },
  ]

  const grouped = new Map<ColumnTemplate["category"], ColumnTemplate[]>()
  for (const t of TEMPLATES) grouped.set(t.category, [...(grouped.get(t.category) ?? []), t])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
              <Sparkles className="size-4" />
            </span>
            {c.title}
          </DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>
        </DialogHeader>

        {/* Mode tabs */}
        <div className="bg-muted flex w-fit max-w-full flex-wrap rounded-lg p-[3px]">
          {tabs.map((t) => {
            const Icon = t.icon
            const active = mode === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setMode(t.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                {t.label}
              </button>
            )
          })}
        </div>

        {mode === "templates" && (
          <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
            {[...grouped.entries()].map(([cat, items]) => (
              <div key={cat}>
                <p className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-wide uppercase">
                  {c.categories[cat]}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {items.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => applyTemplate(t)}
                      className="hover:border-primary/40 hover:bg-muted/40 rounded-lg border p-3 text-left transition-colors"
                    >
                      <p className="text-sm font-medium">{t.name[locale]}</p>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {t.desc[locale]}
                      </p>
                      {t.example && (
                        <p className="text-muted-foreground mt-1.5 truncate text-[11px]">
                          <span className="line-through opacity-70">
                            {t.example.before}
                          </span>{" "}
                          → <span className="text-foreground">{t.example.after}</span>
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {mode === "scratch" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-col-name">{c.name}</Label>
              <Input
                id="ai-col-name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={c.namePlaceholder}
              />
            </div>

            <div className="space-y-2">
              <Label>{c.fillLabel}</Label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { v: "ai", label: c.fillAi, desc: c.fillAiDesc, icon: Sparkles },
                    { v: "custom", label: c.fillCustom, desc: c.fillCustomDesc, icon: Pencil },
                  ] as const
                ).map((o) => {
                  const Icon = o.icon
                  const active = kind === o.v
                  return (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => setKind(o.v)}
                      className={cn(
                        "flex flex-col gap-1 rounded-lg border p-2.5 text-left transition-colors",
                        active
                          ? "border-primary ring-primary/30 bg-primary/[0.04] ring-1"
                          : "hover:bg-muted/60"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4",
                          active ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span className="text-xs font-medium">{o.label}</span>
                      <span className="text-muted-foreground text-[11px]">
                        {o.desc}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {kind === "ai" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ai-col-prompt">{c.prompt}</Label>
                  <Textarea
                    id="ai-col-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{c.output}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {outputs.map((o) => {
                      const Icon = o.icon
                      const isActive = output === o.value
                      return (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => setOutput(o.value)}
                          className={cn(
                            "flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs font-medium transition-colors",
                            isActive
                              ? "border-primary ring-primary/30 bg-primary/[0.04] ring-1"
                              : "hover:bg-muted/60"
                          )}
                        >
                          <Icon
                            className={cn(
                              "size-4",
                              isActive ? "text-primary" : "text-muted-foreground"
                            )}
                          />
                          {o.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {mode === "transform" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{c.transformColumn}</Label>
              <Select value={transformField} onValueChange={setTransformField}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {baseFields.map((f) => (
                    <SelectItem key={f} value={f}>
                      {c.fields[f]}
                    </SelectItem>
                  ))}
                  {textColumns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{c.transformHow}</Label>
              <div className="grid gap-2">
                {(Object.keys(TRANSFORMERS) as TransformId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTransformId(id)}
                    className={cn(
                      "rounded-lg border p-2.5 text-left text-sm transition-colors",
                      transformId === id
                        ? "border-primary ring-primary/30 bg-primary/[0.04] ring-1"
                        : "hover:bg-muted/60"
                    )}
                  >
                    {c.transforms[id]}
                  </button>
                ))}
              </div>
              <p className="text-muted-foreground text-xs">{c.transformHint}</p>
            </div>
          </div>
        )}

        {mode === "manage" && (
          <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
            {ownColumns.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                {c.manageEmpty}
              </p>
            ) : (
              ownColumns.map((col) => (
                <div key={col.id} className="flex items-center gap-2 rounded-lg border p-2">
                  <Input
                    value={col.label}
                    aria-label={c.rename}
                    onChange={(e) =>
                      aiColumnStore.update(col.id, { label: e.target.value })
                    }
                    className="h-8"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={c.deleteAria(col.label)}
                    className="text-muted-foreground hover:text-destructive size-8 shrink-0"
                    onClick={() => {
                      aiColumnStore.remove(col.id)
                      toast.success(c.deleted)
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          {mode === "scratch" && (
            <Button variant="volt" onClick={create} disabled={!canCreate}>
              <Sparkles className="size-4" />
              {c.create}
            </Button>
          )}
          {mode === "transform" && (
            <Button variant="volt" onClick={applyTransform}>
              <Wand2 className="size-4" />
              {c.transformApply}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
