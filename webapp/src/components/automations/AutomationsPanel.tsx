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
import { useLocale, type Locale } from "@/lib/locale"
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
  {
    icon: React.ComponentType<{ className?: string }>
    tint: string
    en: string
    es: string
    it: string
    fr: string
    de: string
    pt: string
    pt_BR: string
  }
> = {
  search: {
    icon: Search,
    tint: "bg-primary/15 text-primary",
    en: "Search",
    es: "Buscar",
    it: "Cerca",
    fr: "Rechercher",
    de: "Suche",
    pt: "Pesquisar",
    pt_BR: "Buscar",
  },
  enrich: {
    icon: Sparkles,
    tint: "bg-chart-5/15 text-chart-5",
    en: "Enrich",
    es: "Enriquecer",
    it: "Arricchisci",
    fr: "Enrichir",
    de: "Anreicherung",
    pt: "Enriquecer",
    pt_BR: "Enriquecer",
  },
  list: {
    icon: FolderKanban,
    tint: "bg-chart-3/15 text-chart-3",
    en: "Add to list",
    es: "Añadir a lista",
    it: "Aggiungi a lista",
    fr: "Ajouter à la liste",
    de: "Zur Liste hinzufügen",
    pt: "Adicionar a lista",
    pt_BR: "Adicionar a lista",
  },
  campaign: {
    icon: Send,
    tint: "bg-chart-1/15 text-chart-1",
    en: "Campaign",
    es: "Campaña",
    it: "Campagna",
    fr: "Campagne",
    de: "Kampagne",
    pt: "Campanha",
    pt_BR: "Campanha",
  },
  crm: {
    icon: RefreshCw,
    tint: "bg-chart-4/15 text-chart-4",
    en: "Sync CRM",
    es: "Sincr. CRM",
    it: "Sincr. CRM",
    fr: "Synchro CRM",
    de: "CRM-Sync",
    pt: "Sincr. CRM",
    pt_BR: "Sincr. CRM",
  },
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
  it: {
    recommendTitle: "Kai consiglia",
    recommendBody: "Hai segnali caldi che vale la pena automatizzare. Attivane uno per agire in pilota automatico.",
    enable: "Attiva",
    library: "Inizia da un modello",
    viewAll: "Vedi tutti i modelli",
    viewLess: "Mostra meno",
    running: "Automazioni attive",
    newAutomation: "Nuova automazione",
    none: "Ancora nessuna automazione — inizia da un modello qui sopra.",
    statusRunning: "Attiva",
    statusPaused: "In pausa",
    statusDraft: "Bozza",
    cadenceRealtime: "Tempo reale",
    cadenceDaily: "Giornaliera",
    cadenceWeekly: "Settimanale",
    trigger: "Trigger",
    steps: "Passaggi",
    processed: "elaborati",
    perWeek: "/ settimana",
    lastRun: (t: string) => `Ultima esecuzione ${t}`,
    stepHint: "Fai clic su un passaggio per attivarlo o disattivarlo.",
    turnOn: "Attiva",
    delete: "Elimina",
    deleteTitle: "Eliminare l'automazione?",
    deleteDesc: "Questo interrompe l'automazione e la rimuove. Non può essere annullato.",
    deleteConfirm: "Elimina",
    created: (n: string) => `"${n}" aggiunta come bozza`,
    started: (n: string) => `"${n}" è ora attiva`,
    paused: (n: string) => `"${n}" messa in pausa`,
    deleted: "Automazione eliminata",
    newName: "Automazione senza titolo",
    newDesc: "Cerca, arricchisci, aggiungi a una lista e iscrivi in una campagna.",
    newTrigger: "Ricerca salvata",
    autoMode: "Automatica",
    askMode: "Richiede approvazione",
    autoToAsk: "Ora chiede l'approvazione prima di ogni esecuzione",
    askToAuto: "Ora viene eseguita automaticamente",
    modeHint: "Passa tra esecuzione automatica e approvazione di ogni esecuzione",
  },
  fr: {
    recommendTitle: "Kai recommande",
    recommendBody: "Vous avez des signaux prioritaires à automatiser. Activez-en un pour agir en pilote automatique.",
    enable: "Activer",
    library: "Commencer avec un modèle",
    viewAll: "Voir tous les modèles",
    viewLess: "Afficher moins",
    running: "Automatisations actives",
    newAutomation: "Nouvelle automatisation",
    none: "Aucune automatisation pour le moment — commencez avec un modèle ci-dessus.",
    statusRunning: "Active",
    statusPaused: "En pause",
    statusDraft: "Brouillon",
    cadenceRealtime: "Temps réel",
    cadenceDaily: "Quotidienne",
    cadenceWeekly: "Hebdomadaire",
    trigger: "Déclencheur",
    steps: "Étapes",
    processed: "traités",
    perWeek: "/ semaine",
    lastRun: (t: string) => `Dernière exécution ${t}`,
    stepHint: "Cliquez sur une étape pour l'activer ou la désactiver.",
    turnOn: "Activer",
    delete: "Supprimer",
    deleteTitle: "Supprimer l'automatisation ?",
    deleteDesc: "Cela arrête l'automatisation et la supprime. Cette action est irréversible.",
    deleteConfirm: "Supprimer",
    created: (n: string) => `« ${n} » ajoutée comme brouillon`,
    started: (n: string) => `« ${n} » est maintenant active`,
    paused: (n: string) => `« ${n} » mise en pause`,
    deleted: "Automatisation supprimée",
    newName: "Automatisation sans titre",
    newDesc: "Recherchez, enrichissez, ajoutez à une liste et inscrivez dans une campagne.",
    newTrigger: "Recherche enregistrée",
    autoMode: "Automatique",
    askMode: "Approbation requise",
    autoToAsk: "Demande désormais une approbation avant chaque exécution",
    askToAuto: "S'exécute désormais automatiquement",
    modeHint: "Basculez entre l'exécution automatique et l'approbation à chaque exécution",
  },
  de: {
    recommendTitle: "Kai empfiehlt",
    recommendBody: "Du hast heiße Signale, die sich zu automatisieren lohnen. Aktiviere eines davon, um im Autopilot zu handeln.",
    enable: "Aktivieren",
    library: "Mit einer Vorlage starten",
    viewAll: "Alle Vorlagen ansehen",
    viewLess: "Weniger anzeigen",
    running: "Aktive Automatisierungen",
    newAutomation: "Neue Automatisierung",
    none: "Noch keine Automatisierungen — starte oben mit einer Vorlage.",
    statusRunning: "Aktiv",
    statusPaused: "Pausiert",
    statusDraft: "Entwurf",
    cadenceRealtime: "Echtzeit",
    cadenceDaily: "Täglich",
    cadenceWeekly: "Wöchentlich",
    trigger: "Auslöser",
    steps: "Schritte",
    processed: "verarbeitet",
    perWeek: "/ Woche",
    lastRun: (t: string) => `Letzte Ausführung ${t}`,
    stepHint: "Klicke auf einen Schritt, um ihn ein- oder auszuschalten.",
    turnOn: "Aktivieren",
    delete: "Löschen",
    deleteTitle: "Automatisierung löschen?",
    deleteDesc: "Dadurch wird die Automatisierung gestoppt und entfernt. Das kann nicht rückgängig gemacht werden.",
    deleteConfirm: "Löschen",
    created: (n: string) => `„${n}“ als Entwurf hinzugefügt`,
    started: (n: string) => `„${n}“ läuft jetzt`,
    paused: (n: string) => `„${n}“ pausiert`,
    deleted: "Automatisierung gelöscht",
    newName: "Unbenannte Automatisierung",
    newDesc: "Suchen, anreichern, zu einer Liste hinzufügen und in eine Kampagne aufnehmen.",
    newTrigger: "Gespeicherte Suche",
    autoMode: "Automatisch",
    askMode: "Genehmigung erforderlich",
    autoToAsk: "Fragt jetzt vor jeder Ausführung um Genehmigung",
    askToAuto: "Wird jetzt automatisch ausgeführt",
    modeHint: "Wechsle zwischen automatischer Ausführung und Genehmigung pro Ausführung",
  },
  pt: {
    recommendTitle: "Kai recomenda",
    recommendBody: "Tens sinais quentes que vale a pena automatizar. Ativa um deles para agir em piloto automático.",
    enable: "Ativar",
    library: "Começa com um modelo",
    viewAll: "Ver todos os modelos",
    viewLess: "Mostrar menos",
    running: "Automatizações ativas",
    newAutomation: "Nova automatização",
    none: "Ainda não há automatizações — começa com um modelo acima.",
    statusRunning: "Ativa",
    statusPaused: "Em pausa",
    statusDraft: "Rascunho",
    cadenceRealtime: "Tempo real",
    cadenceDaily: "Diária",
    cadenceWeekly: "Semanal",
    trigger: "Gatilho",
    steps: "Passos",
    processed: "processados",
    perWeek: "/ semana",
    lastRun: (t: string) => `Última execução ${t}`,
    stepHint: "Clica num passo para o ativar ou desativar.",
    turnOn: "Ativar",
    delete: "Eliminar",
    deleteTitle: "Eliminar automatização?",
    deleteDesc: "Isto para a automatização e remove-a. Não pode ser anulado.",
    deleteConfirm: "Eliminar",
    created: (n: string) => `"${n}" adicionada como rascunho`,
    started: (n: string) => `"${n}" está agora ativa`,
    paused: (n: string) => `"${n}" em pausa`,
    deleted: "Automatização eliminada",
    newName: "Automatização sem título",
    newDesc: "Pesquisa, enriquece, adiciona a uma lista e inscreve numa campanha.",
    newTrigger: "Pesquisa guardada",
    autoMode: "Automática",
    askMode: "Requer aprovação",
    autoToAsk: "Agora pede aprovação antes de cada execução",
    askToAuto: "Agora executa-se automaticamente",
    modeHint: "Alterna entre execução automática e aprovação de cada execução",
  },
  pt_BR: {
    recommendTitle: "Kai recomenda",
    recommendBody: "Você tem sinais quentes que vale a pena automatizar. Ative um deles para agir no piloto automático.",
    enable: "Ativar",
    library: "Comece com um modelo",
    viewAll: "Ver todos os modelos",
    viewLess: "Mostrar menos",
    running: "Automações ativas",
    newAutomation: "Nova automação",
    none: "Ainda não há automações — comece com um modelo acima.",
    statusRunning: "Ativa",
    statusPaused: "Pausada",
    statusDraft: "Rascunho",
    cadenceRealtime: "Tempo real",
    cadenceDaily: "Diária",
    cadenceWeekly: "Semanal",
    trigger: "Gatilho",
    steps: "Etapas",
    processed: "processados",
    perWeek: "/ semana",
    lastRun: (t: string) => `Última execução ${t}`,
    stepHint: "Clique em uma etapa para ativá-la ou desativá-la.",
    turnOn: "Ativar",
    delete: "Excluir",
    deleteTitle: "Excluir automação?",
    deleteDesc: "Isso interrompe a automação e a remove. Essa ação não pode ser desfeita.",
    deleteConfirm: "Excluir",
    created: (n: string) => `"${n}" adicionada como rascunho`,
    started: (n: string) => `"${n}" está ativa agora`,
    paused: (n: string) => `"${n}" pausada`,
    deleted: "Automação excluída",
    newName: "Automação sem título",
    newDesc: "Busque, enriqueça, adicione a uma lista e inscreva em uma campanha.",
    newTrigger: "Busca salva",
    autoMode: "Automática",
    askMode: "Requer aprovação",
    autoToAsk: "Agora pede aprovação antes de cada execução",
    askToAuto: "Agora é executada automaticamente",
    modeHint: "Alterne entre execução automática e aprovação a cada execução",
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
  locale: Locale
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
                {meta[locale]}
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
