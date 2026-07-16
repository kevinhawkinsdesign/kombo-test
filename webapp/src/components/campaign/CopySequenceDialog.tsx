import * as React from "react"
import { Copy, Mail, MessageCircle, Phone, Search, Sparkles } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { useCampaigns, flattenCampaignSteps } from "@/lib/store"
import { useSequenceTemplates } from "@/lib/sequence-templates"
import { normalizeChannel } from "@/lib/step-channels"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import type { CampaignStep, StepChannel } from "@/lib/types"

const COPY = {
  en: {
    title: "Copy a sequence in",
    description:
      "Bring in the steps from another campaign or a saved sequence template — delays and message content included.",
    fromCampaign: "From a campaign",
    fromTemplate: "From a template",
    emptyCampaigns: "No other campaigns with a sequence yet.",
    emptyTemplates:
      "No sequence templates yet — save one from any campaign's Sequence tab.",
    stepCount: (n: number) => `${n} ${n === 1 ? "step" : "steps"}`,
    search: "Search…",
    noMatch: "Nothing matches your search.",
    cancel: "Cancel",
    copyCta: (n: number) => `Copy ${n} ${n === 1 ? "step" : "steps"}`,
    copyCtaEmpty: "Copy steps",
  },
  es: {
    title: "Copiar una secuencia",
    description:
      "Trae los pasos de otra campaña o de una plantilla de secuencia guardada — con sus tiempos y contenido.",
    fromCampaign: "De una campaña",
    fromTemplate: "De una plantilla",
    emptyCampaigns: "Aún no hay otras campañas con secuencia.",
    emptyTemplates:
      "Aún no hay plantillas de secuencia — guarda una desde la pestaña Secuencia de cualquier campaña.",
    stepCount: (n: number) => `${n} ${n === 1 ? "paso" : "pasos"}`,
    search: "Buscar…",
    noMatch: "Nada coincide con tu búsqueda.",
    cancel: "Cancelar",
    copyCta: (n: number) => `Copiar ${n} ${n === 1 ? "paso" : "pasos"}`,
    copyCtaEmpty: "Copiar pasos",
  },
  it: {
    title: "Copia una sequenza",
    description:
      "Importa i passaggi di un'altra campagna o di un modello di sequenza salvato — tempi e contenuto dei messaggi inclusi.",
    fromCampaign: "Da una campagna",
    fromTemplate: "Da un modello",
    emptyCampaigns: "Ancora nessun'altra campagna con una sequenza.",
    emptyTemplates:
      "Ancora nessun modello di sequenza — salvane uno dalla scheda Sequenza di qualsiasi campagna.",
    stepCount: (n: number) => `${n} ${n === 1 ? "passaggio" : "passaggi"}`,
    search: "Cerca…",
    noMatch: "Nessun risultato per la tua ricerca.",
    cancel: "Annulla",
    copyCta: (n: number) => `Copia ${n} ${n === 1 ? "passaggio" : "passaggi"}`,
    copyCtaEmpty: "Copia passaggi",
  },
  fr: {
    title: "Copier une séquence",
    description:
      "Importez les étapes d'une autre campagne ou d'un modèle de séquence enregistré — délais et contenu des messages inclus.",
    fromCampaign: "Depuis une campagne",
    fromTemplate: "Depuis un modèle",
    emptyCampaigns: "Pas encore d'autre campagne avec une séquence.",
    emptyTemplates:
      "Pas encore de modèle de séquence — enregistrez-en un depuis l'onglet Séquence de n'importe quelle campagne.",
    stepCount: (n: number) => `${n} ${n === 1 ? "étape" : "étapes"}`,
    search: "Rechercher…",
    noMatch: "Aucun résultat pour votre recherche.",
    cancel: "Annuler",
    copyCta: (n: number) => `Copier ${n} ${n === 1 ? "étape" : "étapes"}`,
    copyCtaEmpty: "Copier les étapes",
  },
  de: {
    title: "Sequenz kopieren",
    description:
      "Übernimm die Schritte aus einer anderen Kampagne oder einer gespeicherten Sequenzvorlage — inklusive Wartezeiten und Nachrichteninhalt.",
    fromCampaign: "Aus einer Kampagne",
    fromTemplate: "Aus einer Vorlage",
    emptyCampaigns: "Noch keine anderen Kampagnen mit einer Sequenz.",
    emptyTemplates:
      "Noch keine Sequenzvorlagen — speichere eine über den Sequenz-Tab einer beliebigen Kampagne.",
    stepCount: (n: number) => `${n} ${n === 1 ? "Schritt" : "Schritte"}`,
    search: "Suchen…",
    noMatch: "Nichts entspricht deiner Suche.",
    cancel: "Abbrechen",
    copyCta: (n: number) => `${n} ${n === 1 ? "Schritt" : "Schritte"} kopieren`,
    copyCtaEmpty: "Schritte kopieren",
  },
  pt: {
    title: "Copiar uma sequência",
    description:
      "Importe os passos de outra campanha ou de um modelo de sequência guardado — com tempos e conteúdo das mensagens.",
    fromCampaign: "De uma campanha",
    fromTemplate: "De um modelo",
    emptyCampaigns: "Ainda não há outras campanhas com sequência.",
    emptyTemplates:
      "Ainda não há modelos de sequência — guarde um a partir do separador Sequência de qualquer campanha.",
    stepCount: (n: number) => `${n} ${n === 1 ? "passo" : "passos"}`,
    search: "Pesquisar…",
    noMatch: "Nada corresponde à sua pesquisa.",
    cancel: "Cancelar",
    copyCta: (n: number) => `Copiar ${n} ${n === 1 ? "passo" : "passos"}`,
    copyCtaEmpty: "Copiar passos",
  },
  pt_BR: {
    title: "Copiar uma sequência",
    description:
      "Importe as etapas de outra campanha ou de um modelo de sequência salvo — com tempos e conteúdo das mensagens.",
    fromCampaign: "De uma campanha",
    fromTemplate: "De um modelo",
    emptyCampaigns: "Ainda não há outras campanhas com sequência.",
    emptyTemplates:
      "Ainda não há modelos de sequência — salve um na aba Sequência de qualquer campanha.",
    stepCount: (n: number) => `${n} ${n === 1 ? "etapa" : "etapas"}`,
    search: "Buscar…",
    noMatch: "Nada corresponde à sua busca.",
    cancel: "Cancelar",
    copyCta: (n: number) => `Copiar ${n} ${n === 1 ? "etapa" : "etapas"}`,
    copyCtaEmpty: "Copiar etapas",
  },
} as const

// Minimal channel glyphs for the step chips (colors match the sequence tab).
function StepGlyph({ channel }: { channel: StepChannel }) {
  const ch = normalizeChannel(channel)
  const cls = "size-3"
  if (ch === "whatsapp") return <MessageCircle className={cn(cls, "text-chart-1")} />
  if (ch === "call") return <Phone className={cn(cls, "text-chart-4")} />
  if (ch === "ai_call") return <Sparkles className={cn(cls, "text-chart-5")} />
  if (ch.startsWith("linkedin")) return <LinkedinIcon className={cn(cls, "text-[#0a66c2]")} />
  return <Mail className={cn(cls, "text-primary")} />
}

function StepChips({ steps }: { steps: CampaignStep[] }) {
  const flat = flattenCampaignSteps(steps)
  const shown = flat.slice(0, 6)
  return (
    <span className="flex items-center gap-1">
      {shown.map((s) => (
        <span
          key={s.id}
          className="bg-muted flex size-5 items-center justify-center rounded"
        >
          <StepGlyph channel={s.channel} />
        </span>
      ))}
      {flat.length > shown.length && (
        <span className="text-muted-foreground text-xs">
          +{flat.length - shown.length}
        </span>
      )}
    </span>
  )
}

type Source = "campaign" | "template"

export function CopySequenceDialog({
  open,
  onOpenChange,
  currentCampaignId,
  onCopy,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  currentCampaignId: string
  /** Receives the source steps verbatim (caller clones ids before inserting) and the source's display name. */
  onCopy: (steps: CampaignStep[], sourceName: string) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const campaigns = useCampaigns()
  const templates = useSequenceTemplates()

  const [source, setSource] = React.useState<Source>("campaign")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [query, setQuery] = React.useState("")

  // Reset on open (house pattern — render-time check, never an effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setSource("campaign")
      setSelectedId(null)
      setQuery("")
    }
  }

  const sourceCampaigns = campaigns.filter(
    (cm) => cm.id !== currentCampaignId && cm.steps.length > 0
  )
  const allRows =
    source === "campaign"
      ? sourceCampaigns.map((cm) => ({ id: cm.id, name: cm.name, steps: cm.steps }))
      : templates.map((t) => ({ id: t.id, name: t.name, steps: t.steps }))
  // Client-side filter — same trade-off as every other search-to-filter list
  // in this app; a real backend would search/paginate server-side instead.
  const q = query.trim().toLowerCase()
  const rows = q ? allRows.filter((r) => r.name.toLowerCase().includes(q)) : allRows

  const selected = rows.find((r) => r.id === selectedId) ?? null
  const selectedCount = selected ? flattenCampaignSteps(selected.steps).length : 0

  function handleCopy() {
    if (!selected) return
    onCopy(selected.steps, selected.name)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
              <Copy className="size-4" />
            </span>
            {c.title}
          </DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-1.5">
          {(["campaign", "template"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSource(s)
                setSelectedId(null)
              }}
              aria-pressed={source === s}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                source === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {s === "campaign" ? c.fromCampaign : c.fromTemplate}
            </button>
          ))}
        </div>

        {allRows.length > 0 && (
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={c.search}
              className="h-8 pl-7 text-sm"
            />
          </div>
        )}

        <div className="max-h-72 space-y-1 overflow-y-auto">
          {allRows.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              {source === "campaign" ? c.emptyCampaigns : c.emptyTemplates}
            </p>
          ) : rows.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              {c.noMatch}
            </p>
          ) : (
            rows.map((row) => {
              const isActive = selectedId === row.id
              const count = flattenCampaignSteps(row.steps).length
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setSelectedId(row.id)}
                  aria-pressed={isActive}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                    isActive
                      ? "border-primary/40 bg-primary/[0.06]"
                      : "border-transparent hover:bg-muted"
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {row.name}
                    </span>
                    <StepChips steps={row.steps} />
                  </span>
                  <Badge variant="secondary" className="shrink-0 font-normal">
                    {c.stepCount(count)}
                  </Badge>
                </button>
              )
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="volt" onClick={handleCopy} disabled={!selected}>
            <Copy className="size-4" />
            {selected ? c.copyCta(selectedCount) : c.copyCtaEmpty}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
