import * as React from "react"
import { toast } from "sonner"
import {
  Sparkles,
  Search,
  FolderKanban,
  Send,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  Plus,
  Zap,
  Clock,
  ChevronRight,
  LayoutGrid,
  ShieldCheck,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { useLocale } from "@/lib/locale"
import { relativeTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  useAutomations,
  automationStore,
  AUTOMATION_TEMPLATES,
  STEP_ORDER,
  type Automation,
  type StepKind,
  type AutomationTemplate,
} from "@/lib/mock-automations"

const STEP_META: Record<
  StepKind,
  { icon: React.ComponentType<{ className?: string }>; tint: string; en: string; es: string }
> = {
  search: { icon: Search, tint: "bg-primary/15 text-primary", en: "Search", es: "Buscar" },
  enrich: { icon: Sparkles, tint: "bg-chart-5/15 text-chart-5", en: "Enrich", es: "Enriquecer" },
  list: { icon: FolderKanban, tint: "bg-chart-3/15 text-chart-3", en: "Add to list", es: "Añadir a lista" },
  campaign: { icon: Send, tint: "bg-chart-1/15 text-chart-1", en: "Campaign", es: "Campaña" },
  crm: { icon: RefreshCw, tint: "bg-chart-4/15 text-chart-4", en: "Sync CRM", es: "Sincr. CRM" },
}

const COPY = {
  en: {
    recommendTitle: "Kai recommends",
    recommendBody: "You have hot signals worth automating. Turn one of these on to act on them on autopilot.",
    enable: "Enable",
    library: "Start from a template",
    viewAll: "View all templates",
    viewLess: "Show fewer",
    running: "Running automations",
    newAutomation: "New automation",
    none: "No automations yet — start from a template above.",
    statusRunning: "Running",
    statusPaused: "Paused",
    statusDraft: "Draft",
    cadenceRealtime: "Real-time",
    cadenceDaily: "Daily",
    cadenceWeekly: "Weekly",
    trigger: "Trigger",
    steps: "Steps",
    processed: "processed",
    perWeek: "/ week",
    lastRun: (t: string) => `Last run ${t}`,
    stepHint: "Click a step to turn it on or off.",
    turnOn: "Turn on",
    delete: "Delete",
    deleteTitle: "Delete automation?",
    deleteDesc: "This stops the automation and removes it. This can't be undone.",
    deleteConfirm: "Delete",
    created: (n: string) => `"${n}" added as a draft`,
    started: (n: string) => `"${n}" is now running`,
    paused: (n: string) => `"${n}" paused`,
    deleted: "Automation deleted",
    newName: "Untitled automation",
    newDesc: "Search, enrich, add to a list, and enroll into a campaign.",
    newTrigger: "Saved search",
    autoMode: "Auto",
    askMode: "Approval required",
    autoToAsk: "Now asks for approval before each run",
    askToAuto: "Now runs automatically",
    modeHint: "Switch between auto-run and approve-each-run",
  },
  es: {
    recommendTitle: "Kai recomienda",
    recommendBody: "Tienes señales calientes que merece automatizar. Activa una para actuar en piloto automático.",
    enable: "Activar",
    library: "Empieza con una plantilla",
    viewAll: "Ver todas las plantillas",
    viewLess: "Mostrar menos",
    running: "Automatizaciones activas",
    newAutomation: "Nueva automatización",
    none: "Aún no hay automatizaciones — empieza con una plantilla de arriba.",
    statusRunning: "Activa",
    statusPaused: "Pausada",
    statusDraft: "Borrador",
    cadenceRealtime: "Tiempo real",
    cadenceDaily: "Diaria",
    cadenceWeekly: "Semanal",
    trigger: "Disparador",
    steps: "Pasos",
    processed: "procesados",
    perWeek: "/ semana",
    lastRun: (t: string) => `Última ejecución ${t}`,
    stepHint: "Haz clic en un paso para activarlo o desactivarlo.",
    turnOn: "Activar",
    delete: "Eliminar",
    deleteTitle: "¿Eliminar automatización?",
    deleteDesc: "Esto detiene la automatización y la elimina. No se puede deshacer.",
    deleteConfirm: "Eliminar",
    created: (n: string) => `"${n}" añadida como borrador`,
    started: (n: string) => `"${n}" ya está activa`,
    paused: (n: string) => `"${n}" pausada`,
    deleted: "Automatización eliminada",
    newName: "Automatización sin título",
    newDesc: "Busca, enriquece, añade a una lista e inscribe en una campaña.",
    newTrigger: "Búsqueda guardada",
    autoMode: "Automática",
    askMode: "Requiere aprobación",
    autoToAsk: "Ahora pide aprobación antes de cada ejecución",
    askToAuto: "Ahora se ejecuta automáticamente",
    modeHint: "Cambia entre ejecución automática y aprobar cada ejecución",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

export function AutomationsPanel() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const automations = useAutomations()
  const [showAll, setShowAll] = React.useState(false)
  const [toDelete, setToDelete] = React.useState<string | null>(null)

  const templates = showAll ? AUTOMATION_TEMPLATES : AUTOMATION_TEMPLATES.slice(0, 4)

  function addFromTemplate(tpl: AutomationTemplate) {
    automationStore.createFromTemplate(tpl)
    toast.success(c.created(tpl.name))
  }

  function newBlank() {
    const au = automationStore.create({
      name: c.newName,
      description: c.newDesc,
      trigger: c.newTrigger,
      cadence: "daily",
      steps: [...STEP_ORDER],
    })
    toast.success(c.created(au.name))
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
      {/* Kai recommendation */}
      <Card className="border-primary/20 from-primary/[0.05] to-card gap-3 bg-gradient-to-br p-5">
        <div className="flex items-start gap-3">
          <span className="bg-primary/15 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
            <Sparkles className="size-4" />
          </span>
          <div className="flex-1">
            <p className="font-semibold">{c.recommendTitle}</p>
            <p className="text-muted-foreground text-sm">{c.recommendBody}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {AUTOMATION_TEMPLATES.slice(0, 2).map((tpl) => (
            <Button
              key={tpl.id}
              variant="secondary"
              size="sm"
              onClick={() => addFromTemplate(tpl)}
            >
              <Plus className="size-4" />
              {tpl.name}
            </Button>
          ))}
        </div>
      </Card>

      {/* Template library */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold">
            <LayoutGrid className="text-primary size-4" />
            {c.library}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setShowAll((v) => !v)}>
            {showAll ? c.viewLess : c.viewAll}
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="gap-2 p-4">
              <div className="flex items-center gap-1">
                {tpl.steps.map((kind) => {
                  const Icon = STEP_META[kind].icon
                  return (
                    <span
                      key={kind}
                      className={cn("flex size-5 items-center justify-center rounded", STEP_META[kind].tint)}
                    >
                      <Icon className="size-3" />
                    </span>
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-1">
                {tpl.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="font-normal">
                    {t}
                  </Badge>
                ))}
              </div>
              <p className="text-sm font-medium">{tpl.name}</p>
              <p className="text-muted-foreground line-clamp-2 text-xs">{tpl.description}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-1 w-full"
                onClick={() => addFromTemplate(tpl)}
              >
                <Plus className="size-4" />
                {c.enable}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Running automations */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            {c.running}{" "}
            <span className="text-muted-foreground tabular-nums">({automations.length})</span>
          </h3>
          <Button variant="volt" size="sm" onClick={newBlank}>
            <Plus className="size-4" />
            {c.newAutomation}
          </Button>
        </div>
        {automations.length === 0 ? (
          <p className="text-muted-foreground rounded-xl border border-dashed py-10 text-center text-sm">
            {c.none}
          </p>
        ) : (
          <div className="space-y-3">
            {automations.map((a) => (
              <AutomationCard
                key={a.id}
                automation={a}
                c={c}
                locale={locale}
                onDelete={() => setToDelete(a.id)}
              />
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={c.deleteTitle}
        description={c.deleteDesc}
        confirmLabel={c.deleteConfirm}
        destructive
        onConfirm={() => {
          if (toDelete) {
            automationStore.remove(toDelete)
            toast.success(c.deleted)
          }
          setToDelete(null)
        }}
      />
    </div>
  )
}

function AutomationCard({
  automation: a,
  c,
  locale,
  onDelete,
}: {
  automation: Automation
  c: Copy
  locale: "en" | "es"
  onDelete: () => void
}) {
  const isRunning = a.status === "running"
  const statusLabel =
    a.status === "running" ? c.statusRunning : a.status === "paused" ? c.statusPaused : c.statusDraft
  const cadenceLabel =
    a.cadence === "realtime" ? c.cadenceRealtime : a.cadence === "daily" ? c.cadenceDaily : c.cadenceWeekly

  function toggleStatus(on: boolean) {
    automationStore.setStatus(a.id, on ? "running" : "paused")
    toast.success(on ? c.started(a.name) : c.paused(a.name))
  }

  return (
    <Card className="gap-3 p-4">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{a.name}</p>
            <Badge
              className={cn(
                "gap-1 border-transparent font-normal",
                isRunning ? "bg-chart-1/15 text-chart-1" : "bg-muted text-muted-foreground"
              )}
            >
              {isRunning && (
                <span className="relative flex size-1.5">
                  <span className="bg-chart-1 absolute inline-flex size-full animate-ping rounded-full opacity-60" />
                  <span className="bg-chart-1 relative inline-flex size-1.5 rounded-full" />
                </span>
              )}
              {statusLabel}
            </Badge>
            <button
              type="button"
              title={c.modeHint}
              onClick={() => {
                const next = a.approvalMode === "auto" ? "ask" : "auto"
                automationStore.setApprovalMode(a.id, next)
                toast.success(next === "ask" ? c.autoToAsk : c.askToAuto)
              }}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-normal transition-colors",
                a.approvalMode === "ask"
                  ? "border-chart-4/30 bg-chart-4/10 text-chart-4"
                  : "border-transparent bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {a.approvalMode === "ask" ? (
                <ShieldCheck className="size-3" />
              ) : (
                <Zap className="size-3" />
              )}
              {a.approvalMode === "ask" ? c.askMode : c.autoMode}
            </button>
          </div>
          <p className="text-muted-foreground mt-0.5 text-sm">{a.description}</p>
        </div>
        <div className="flex items-center gap-1">
          <Switch
            checked={isRunning}
            onCheckedChange={toggleStatus}
            aria-label={statusLabel}
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive size-8"
            onClick={onDelete}
            aria-label={c.delete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Trigger → steps flow */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className="gap-1 font-normal">
          <Zap className="text-chart-4 size-3" />
          {a.trigger}
        </Badge>
        <ChevronRight className="text-muted-foreground size-3.5" />
        {a.steps.map((step, i) => {
          const meta = STEP_META[step.kind]
          const Icon = meta.icon
          return (
            <React.Fragment key={step.kind}>
              {i > 0 && <ChevronRight className="text-muted-foreground size-3.5" />}
              <button
                type="button"
                onClick={() => automationStore.toggleStep(a.id, step.kind)}
                aria-pressed={step.enabled}
                title={c.stepHint}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-1.5 py-1 text-xs font-medium transition-colors",
                  step.enabled
                    ? cn("border-transparent", meta.tint)
                    : "border-dashed text-muted-foreground line-through opacity-60"
                )}
              >
                <Icon className="size-3.5" />
                {locale === "es" ? meta.es : meta.en}
              </button>
            </React.Fragment>
          )
        })}
      </div>

      {/* Monitoring */}
      <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-2 text-xs">
        <span className="text-foreground inline-flex items-center gap-1 font-medium">
          {cadenceLabel}
        </span>
        <span className="inline-flex items-center gap-1 tabular-nums">
          <span className="text-foreground font-medium">{a.processed.toLocaleString()}</span>
          {c.processed}
        </span>
        <span className="inline-flex items-center gap-1 tabular-nums">
          <span className="text-foreground font-medium">+{a.perWeek}</span>
          {c.perWeek}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3" />
          {c.lastRun(relativeTime(a.lastRunAt))}
        </span>
        {a.status === "draft" && (
          <Button
            variant="volt"
            size="sm"
            className="ml-auto h-7"
            onClick={() => toggleStatus(true)}
          >
            <Play className="size-3.5" />
            {c.turnOn}
          </Button>
        )}
        {a.status === "paused" && (
          <span className="ml-auto inline-flex items-center gap-1">
            <Pause className="size-3" />
            {c.statusPaused}
          </span>
        )}
      </div>
    </Card>
  )
}
