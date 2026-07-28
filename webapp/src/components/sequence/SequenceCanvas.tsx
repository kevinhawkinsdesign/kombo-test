import * as React from "react"
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Clock,
  Copy,
  ListTodo,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  Split,
  Trash2,
} from "lucide-react"

import { channelMeta, missingIntegrationFor, normalizeChannel } from "@/lib/step-channels"
import {
  computeLayout,
  isPositiveTrack,
  type AddNodeData,
  type StepNodeData,
} from "@/lib/sequence-layout"
import { stripHtml } from "@/lib/rich-text"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CampaignStep, LinkedInAction, StepTrackKind } from "@/lib/types"

const COPY = {
  en: {
    channelLabel: {
      email: "Email",
      whatsapp: "WhatsApp",
      call: "Phone call",
      ai_call: "AI Voice Call",
      linkedin_message: "LinkedIn message",
      linkedin_dm: "LinkedIn DM",
      linkedin_inmail: "LinkedIn Sales Navigator message",
      manual: "Manual task",
    } as Record<string, string>,
      linkedinActionLabel: {
        connect: "LinkedIn connect",
        view_profile: "LinkedIn view profile",
        voice_message: "LinkedIn voice message",
        like_post: "LinkedIn like post",
      } as Partial<Record<LinkedInAction, string>>,
      whatsappVoiceMessageLabel: "WhatsApp voice message",
    sendImmediately: "Send immediately",
    waitDays: (n: number) => `Wait ${n} ${n === 1 ? "day" : "days"}`,
    manualTaskBadge: "Task",
    actionNeeded: "Action needed",
    trackLabel: {
      reply: "If they reply",
      no_reply: "If they don't reply",
      opened: "If opened",
      not_opened: "If not opened",
      clicked: "If clicked",
      not_clicked: "If not clicked",
      accepted: "If Connected",
      not_accepted: "If Not Connected",
      read: "If read",
      not_read: "If not read",
    } as Record<StepTrackKind, string>,
    addStep: "Add step",
    addParallel: "Add parallel step",
    inParallel: "In parallel",
    stepActions: "Step actions",
    moveStepUp: "Move up",
    moveStepDown: "Move down",
    duplicateStep: "Duplicate",
    deleteStep: "Delete",
    editStep: "Edit step",
    lockedBadge: "Locked",
    lockedReason: (name: string) => `Connect ${name} before this step can run.`,
  },
  es: {
    channelLabel: {
      email: "Correo",
      whatsapp: "WhatsApp",
      call: "Llamada",
      ai_call: "Llamada de voz IA",
      linkedin_message: "Mensaje de LinkedIn",
      linkedin_dm: "Mensaje directo de LinkedIn",
      linkedin_inmail: "Mensaje de Sales Navigator de LinkedIn",
      manual: "Tarea manual",
    } as Record<string, string>,
      linkedinActionLabel: {
        connect: "Conectar en LinkedIn",
        view_profile: "Ver perfil de LinkedIn",
        voice_message: "Mensaje de voz de LinkedIn",
        like_post: "Dar me gusta en LinkedIn",
      } as Partial<Record<LinkedInAction, string>>,
      whatsappVoiceMessageLabel: "Mensaje de voz de WhatsApp",
    sendImmediately: "Enviar inmediatamente",
    waitDays: (n: number) => `Espera ${n} ${n === 1 ? "día" : "días"}`,
    manualTaskBadge: "Tarea",
    actionNeeded: "Requiere acción",
    trackLabel: {
      reply: "Si responden",
      no_reply: "Si no responden",
      opened: "Si se abre",
      not_opened: "Si no se abre",
      clicked: "Si se hace clic",
      not_clicked: "Si no se hace clic",
      accepted: "Si están conectados",
      not_accepted: "Si no están conectados",
      read: "Si se lee",
      not_read: "Si no se lee",
    } as Record<StepTrackKind, string>,
    addStep: "Añadir paso",
    addParallel: "Añadir paso paralelo",
    inParallel: "En paralelo",
    stepActions: "Acciones del paso",
    moveStepUp: "Mover arriba",
    moveStepDown: "Mover abajo",
    duplicateStep: "Duplicar",
    deleteStep: "Eliminar",
    editStep: "Editar paso",
    lockedBadge: "Bloqueado",
    lockedReason: (name: string) => `Conecta ${name} para que este paso pueda ejecutarse.`,
  },
  it: {
    channelLabel: {
      email: "Email",
      whatsapp: "WhatsApp",
      call: "Chiamata",
      ai_call: "Chiamata vocale IA",
      linkedin_message: "Messaggio LinkedIn",
      linkedin_dm: "Messaggio diretto LinkedIn",
      linkedin_inmail: "Messaggio Sales Navigator di LinkedIn",
      manual: "Attività manuale",
    } as Record<string, string>,
      linkedinActionLabel: {
        connect: "Connessione LinkedIn",
        view_profile: "Visualizza profilo LinkedIn",
        voice_message: "Messaggio vocale LinkedIn",
        like_post: "Metti mi piace su LinkedIn",
      } as Partial<Record<LinkedInAction, string>>,
      whatsappVoiceMessageLabel: "Messaggio vocale WhatsApp",
    sendImmediately: "Invia subito",
    waitDays: (n: number) => `Attendi ${n} ${n === 1 ? "giorno" : "giorni"}`,
    manualTaskBadge: "Attività",
    actionNeeded: "Azione richiesta",
    trackLabel: {
      reply: "Se rispondono",
      no_reply: "Se non rispondono",
      opened: "Se aperto",
      not_opened: "Se non aperto",
      clicked: "Se cliccato",
      not_clicked: "Se non cliccato",
      accepted: "Se connesso",
      not_accepted: "Se non connesso",
      read: "Se letto",
      not_read: "Se non letto",
    } as Record<StepTrackKind, string>,
    addStep: "Aggiungi passaggio",
    addParallel: "Aggiungi passaggio parallelo",
    inParallel: "In parallelo",
    stepActions: "Azioni del passaggio",
    moveStepUp: "Sposta su",
    moveStepDown: "Sposta giù",
    duplicateStep: "Duplica",
    deleteStep: "Elimina",
    editStep: "Modifica passaggio",
    lockedBadge: "Bloccato",
    lockedReason: (name: string) => `Collega ${name} prima che questo passaggio possa essere eseguito.`,
  },
  fr: {
    channelLabel: {
      email: "E-mail",
      whatsapp: "WhatsApp",
      call: "Appel téléphonique",
      ai_call: "Appel vocal IA",
      linkedin_message: "Message LinkedIn",
      linkedin_dm: "Message privé LinkedIn",
      linkedin_inmail: "Message Sales Navigator LinkedIn",
      manual: "Tâche manuelle",
    } as Record<string, string>,
      linkedinActionLabel: {
        connect: "Connexion LinkedIn",
        view_profile: "Voir le profil LinkedIn",
        voice_message: "Message vocal LinkedIn",
        like_post: "Aimer une publication LinkedIn",
      } as Partial<Record<LinkedInAction, string>>,
      whatsappVoiceMessageLabel: "Message vocal WhatsApp",
    sendImmediately: "Envoyer immédiatement",
    waitDays: (n: number) => `Attendre ${n} ${n === 1 ? "jour" : "jours"}`,
    manualTaskBadge: "Tâche",
    actionNeeded: "Action requise",
    trackLabel: {
      reply: "S'ils répondent",
      no_reply: "S'ils ne répondent pas",
      opened: "Si ouvert",
      not_opened: "Si non ouvert",
      clicked: "Si cliqué",
      not_clicked: "Si non cliqué",
      accepted: "Si connecté",
      not_accepted: "Si non connecté",
      read: "Si lu",
      not_read: "Si non lu",
    } as Record<StepTrackKind, string>,
    addStep: "Ajouter une étape",
    addParallel: "Ajouter une étape parallèle",
    inParallel: "En parallèle",
    stepActions: "Actions de l'étape",
    moveStepUp: "Monter",
    moveStepDown: "Descendre",
    duplicateStep: "Dupliquer",
    deleteStep: "Supprimer",
    editStep: "Modifier l'étape",
    lockedBadge: "Verrouillé",
    lockedReason: (name: string) => `Connectez ${name} pour que cette étape puisse s'exécuter.`,
  },
  de: {
    channelLabel: {
      email: "E-Mail",
      whatsapp: "WhatsApp",
      call: "Telefonanruf",
      ai_call: "KI-Sprachanruf",
      linkedin_message: "LinkedIn-Nachricht",
      linkedin_dm: "LinkedIn-Direktnachricht",
      linkedin_inmail: "LinkedIn Sales Navigator-Nachricht",
      manual: "Manuelle Aufgabe",
    } as Record<string, string>,
      linkedinActionLabel: {
        connect: "LinkedIn-Vernetzung",
        view_profile: "LinkedIn-Profil ansehen",
        voice_message: "LinkedIn-Sprachnachricht",
        like_post: "LinkedIn-Beitrag liken",
      } as Partial<Record<LinkedInAction, string>>,
      whatsappVoiceMessageLabel: "WhatsApp-Sprachnachricht",
    sendImmediately: "Sofort senden",
    waitDays: (n: number) => `${n} ${n === 1 ? "Tag" : "Tage"} warten`,
    manualTaskBadge: "Aufgabe",
    actionNeeded: "Aktion erforderlich",
    trackLabel: {
      reply: "Wenn sie antworten",
      no_reply: "Wenn sie nicht antworten",
      opened: "Wenn geöffnet",
      not_opened: "Wenn nicht geöffnet",
      clicked: "Wenn geklickt",
      not_clicked: "Wenn nicht geklickt",
      accepted: "Wenn verbunden",
      not_accepted: "Wenn nicht verbunden",
      read: "Wenn gelesen",
      not_read: "Wenn nicht gelesen",
    } as Record<StepTrackKind, string>,
    addStep: "Schritt hinzufügen",
    addParallel: "Parallelen Schritt hinzufügen",
    inParallel: "Parallel",
    stepActions: "Schrittaktionen",
    moveStepUp: "Nach oben verschieben",
    moveStepDown: "Nach unten verschieben",
    duplicateStep: "Duplizieren",
    deleteStep: "Löschen",
    editStep: "Schritt bearbeiten",
    lockedBadge: "Gesperrt",
    lockedReason: (name: string) => `Verbinde ${name}, damit dieser Schritt ausgeführt werden kann.`,
  },
  pt: {
    channelLabel: {
      email: "Email",
      whatsapp: "WhatsApp",
      call: "Chamada",
      ai_call: "Chamada de voz IA",
      linkedin_message: "Mensagem do LinkedIn",
      linkedin_dm: "Mensagem direta do LinkedIn",
      linkedin_inmail: "Mensagem do Sales Navigator do LinkedIn",
      manual: "Tarefa manual",
    } as Record<string, string>,
      linkedinActionLabel: {
        connect: "Ligação no LinkedIn",
        view_profile: "Ver perfil do LinkedIn",
        voice_message: "Mensagem de voz do LinkedIn",
        like_post: "Gostar de publicação no LinkedIn",
      } as Partial<Record<LinkedInAction, string>>,
      whatsappVoiceMessageLabel: "Mensagem de voz do WhatsApp",
    sendImmediately: "Enviar imediatamente",
    waitDays: (n: number) => `Esperar ${n} ${n === 1 ? "dia" : "dias"}`,
    manualTaskBadge: "Tarefa",
    actionNeeded: "Ação necessária",
    trackLabel: {
      reply: "Se responderem",
      no_reply: "Se não responderem",
      opened: "Se abrirem",
      not_opened: "Se não abrirem",
      clicked: "Se clicarem",
      not_clicked: "Se não clicarem",
      accepted: "Se estiverem ligados",
      not_accepted: "Se não estiverem ligados",
      read: "Se lerem",
      not_read: "Se não lerem",
    } as Record<StepTrackKind, string>,
    addStep: "Adicionar passo",
    addParallel: "Adicionar passo paralelo",
    inParallel: "Em paralelo",
    stepActions: "Ações do passo",
    moveStepUp: "Mover para cima",
    moveStepDown: "Mover para baixo",
    duplicateStep: "Duplicar",
    deleteStep: "Eliminar",
    editStep: "Editar passo",
    lockedBadge: "Bloqueado",
    lockedReason: (name: string) => `Ligue o ${name} para que este passo possa ser executado.`,
  },
  pt_BR: {
    channelLabel: {
      email: "Email",
      whatsapp: "WhatsApp",
      call: "Ligação",
      ai_call: "Ligação de voz IA",
      linkedin_message: "Mensagem do LinkedIn",
      linkedin_dm: "Mensagem direta do LinkedIn",
      linkedin_inmail: "Mensagem do Sales Navigator do LinkedIn",
      manual: "Tarefa manual",
    } as Record<string, string>,
      linkedinActionLabel: {
        connect: "Conexão no LinkedIn",
        view_profile: "Ver perfil do LinkedIn",
        voice_message: "Mensagem de voz do LinkedIn",
        like_post: "Curtir publicação no LinkedIn",
      } as Partial<Record<LinkedInAction, string>>,
      whatsappVoiceMessageLabel: "Mensagem de voz do WhatsApp",
    sendImmediately: "Enviar imediatamente",
    waitDays: (n: number) => `Aguardar ${n} ${n === 1 ? "dia" : "dias"}`,
    manualTaskBadge: "Tarefa",
    actionNeeded: "Ação necessária",
    trackLabel: {
      reply: "Se responderem",
      no_reply: "Se não responderem",
      opened: "Se abrirem",
      not_opened: "Se não abrirem",
      clicked: "Se clicarem",
      not_clicked: "Se não clicarem",
      accepted: "Se estiverem conectados",
      not_accepted: "Se não estiverem conectados",
      read: "Se lerem",
      not_read: "Se não lerem",
    } as Record<StepTrackKind, string>,
    addStep: "Adicionar etapa",
    addParallel: "Adicionar etapa paralela",
    inParallel: "Em paralelo",
    stepActions: "Ações da etapa",
    moveStepUp: "Mover para cima",
    moveStepDown: "Mover para baixo",
    duplicateStep: "Duplicar",
    deleteStep: "Excluir",
    editStep: "Editar etapa",
    lockedBadge: "Bloqueado",
    lockedReason: (name: string) => `Conecte o ${name} para que esta etapa possa ser executada.`,
  },
} as const

interface StepNodeExtraData extends StepNodeData {
  selectedStepId?: string
  interactive: boolean
  onClick?: (step: CampaignStep) => void
  onAddParallel?: (step: CampaignStep) => void
  // Cosmetic only — every card shows the same campaign-level sender, since
  // there's no per-step sending identity in the data model. Undefined hides
  // the avatar entirely rather than showing a placeholder.
  senderLabel?: string
  // The card's own "..." menu — Move up/down, Duplicate, Delete. Omitting a
  // handler drops that specific action from the menu; the menu itself is
  // hidden when none are provided.
  onMoveStepDirection?: (step: CampaignStep, dir: -1 | 1) => void
  onDuplicateStep?: (step: CampaignStep) => void
  onDeleteStep?: (step: CampaignStep) => void
}

// Invisible anchor points — nodesConnectable is false everywhere this canvas
// is used, so these only exist to give edges somewhere to attach; without a
// Handle, React Flow can't compute a connection point and silently drops
// the edge (no line, no console error visible to the user).
const HANDLE_CLASS = "invisible !size-0 !min-w-0 !border-0"

function initialsOf(label: string): string {
  const parts = label.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase()
}

// The plain channel label ("LinkedIn message") doesn't distinguish a
// Connect/View Profile/Voice Message/Like Post step from a regular one —
// they'd otherwise all render an identical card title. Falls back to the
// channel label for the default "message" action (or no action at all).
function stepTitle(c: (typeof COPY)[keyof typeof COPY], step: CampaignStep): string {
  const channel = normalizeChannel(step.channel)
  if (channel === "linkedin_message" && step.linkedinAction && step.linkedinAction !== "message") {
    return c.linkedinActionLabel[step.linkedinAction] ?? c.channelLabel[channel]
  }
  if (channel === "whatsapp" && step.whatsappAction === "voice_message") {
    return c.whatsappVoiceMessageLabel
  }
  return c.channelLabel[channel]
}

function StepCard({
  step,
  selected,
  interactive,
  senderLabel,
  onClick,
  onMove,
  onDuplicate,
  onDelete,
}: {
  step: CampaignStep
  selected: boolean
  interactive: boolean
  senderLabel?: string
  onClick?: (step: CampaignStep) => void
  onMove?: (step: CampaignStep, dir: -1 | 1) => void
  onDuplicate?: (step: CampaignStep) => void
  onDelete?: (step: CampaignStep) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const meta = channelMeta(step.channel)
  const needsAction = step.isManualTask
    ? stripHtml(step.subject ?? "").trim().length === 0
    : stripHtml(step.body).trim().length === 0
  const hasMenu = interactive && (onMove || onDuplicate || onDelete)
  // A step whose sending provider isn't connected yet can't run at all —
  // surfaced as a "locked" badge rather than the ordinary "needs content"
  // one, since the fix is connecting an integration, not writing copy.
  const missingIntegration = missingIntegrationFor(step.channel)

  return (
    // A real <button> here would make the "..." trigger below a nested
    // button, which browsers/AT don't handle — role="button" + a click/
    // keydown handler reproduces the same click-to-open-detail-panel
    // semantics without that nesting.
    <div
      role="button"
      tabIndex={interactive ? 0 : -1}
      onClick={() => interactive && onClick?.(step)}
      onKeyDown={(e) => {
        if (interactive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          onClick?.(step)
        }
      }}
      style={{ width: 240 }}
      className={cn(
        "bg-card flex shrink-0 flex-col overflow-hidden rounded-xl border text-left shadow-sm transition-all",
        interactive && "cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
        selected
          ? "border-primary ring-primary/25 shadow-md ring-2"
          : interactive && "hover:border-primary/40"
      )}
    >
      {/* Timing header — its own row, separate from the step content below,
          so the delay reads as metadata about when this fires rather than
          part of the step's own title. */}
      <div className="bg-muted/50 text-muted-foreground flex items-center justify-between gap-1.5 border-b px-3 py-1.5 text-xs">
        <span className="flex min-w-0 items-center gap-1.5">
          <Clock className="size-3 shrink-0" />
          {step.delayDays === 0 ? c.sendImmediately : c.waitDays(step.delayDays)}
        </span>
        {interactive && onClick && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                role="button"
                tabIndex={0}
                aria-label={c.editStep}
                onClick={(e) => {
                  e.stopPropagation()
                  onClick(step)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    e.stopPropagation()
                    onClick(step)
                  }
                }}
                className="text-muted-foreground hover:text-foreground hover:bg-background ml-auto flex size-6 shrink-0 items-center justify-center rounded-md transition-colors"
              >
                <Pencil className="size-3" />
              </span>
            </TooltipTrigger>
            <TooltipContent>{c.editStep}</TooltipContent>
          </Tooltip>
        )}
        {hasMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <span
                role="button"
                tabIndex={0}
                aria-label={c.stepActions}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-foreground hover:bg-background -m-1 flex size-6 shrink-0 items-center justify-center rounded-md transition-colors"
              >
                <MoreHorizontal className="size-3.5" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              {onMove && (
                <>
                  <DropdownMenuItem onClick={() => onMove(step, -1)}>
                    <ArrowUp className="size-4" />
                    {c.moveStepUp}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onMove(step, 1)}>
                    <ArrowDown className="size-4" />
                    {c.moveStepDown}
                  </DropdownMenuItem>
                </>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(step)}>
                  <Copy className="size-4" />
                  {c.duplicateStep}
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  {(onMove || onDuplicate) && <DropdownMenuSeparator />}
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(step)}>
                    <Trash2 className="size-4" />
                    {c.deleteStep}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex items-center gap-2.5 p-3">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            meta.tint
          )}
        >
          <meta.Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-medium">
            {stepTitle(c, step)}
          </p>
          {(step.isManualTask || needsAction || missingIntegration) && (
            <div className="flex flex-wrap gap-1">
              {step.isManualTask && (
                <span className="bg-secondary text-secondary-foreground flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]">
                  <ListTodo className="size-3" />
                  {c.manualTaskBadge}
                </span>
              )}
              {missingIntegration ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="bg-chart-4/15 text-chart-4 flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]">
                      <Lock className="size-3" />
                      {c.lockedBadge}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{c.lockedReason(missingIntegration)}</TooltipContent>
                </Tooltip>
              ) : (
                needsAction && (
                  <span className="bg-destructive/15 text-destructive flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]">
                    <AlertTriangle className="size-3" />
                    {c.actionNeeded}
                  </span>
                )
              )}
            </div>
          )}
        </div>
        {senderLabel && (
          <span
            className="bg-primary/15 text-primary flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
            title={senderLabel}
          >
            {initialsOf(senderLabel)}
          </span>
        )}
      </div>
    </div>
  )
}

function TrackLabelPill({ kind }: { kind: StepTrackKind }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const positive = isPositiveTrack(kind)
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        positive
          ? "bg-chart-1/15 text-chart-1 border-chart-1/30"
          : "bg-destructive/10 text-destructive border-destructive/25"
      )}
    >
      {c.trackLabel[kind]}
    </span>
  )
}

function StepNodeComponent({ data }: NodeProps & { data: StepNodeExtraData }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const {
    step,
    selectedStepId,
    interactive,
    onClick,
    trackLabel,
    inTrack,
    onAddParallel,
    senderLabel,
    onMoveStepDirection,
    onDuplicateStep,
    onDeleteStep,
  } = data
  const parallelSteps = step.parallelSteps ?? []
  // A step is either a fork anchor or parallel-able, never both — keeps the
  // canvas geometry simple (no lane collisions between a wide parallel
  // cluster and fork-track lanes on the same row). Only top-level steps
  // qualify, so anything inside a condition track is out.
  const canAddParallel = interactive && !step.fork && !inTrack
  const hasParallel = parallelSteps.length > 0
  // Every node in this diagram — plain steps, parallel groups, and the "+"
  // ghosts — shares the same lane x position (its wrapper's left edge), so
  // the spine only stays a straight vertical line if every node's handle
  // sits at the same fixed offset from that shared edge: 120, half of a
  // plain 240px card.
  const handleLeft = 120
  // A parallel group's card cluster is visually centered on that same 120
  // spine (not left-anchored at the lane edge like a plain card) — a
  // translateX shift, computed from the cluster's actual width, pulls the
  // dashed box left by however much it's wider than a single 240px card.
  // translateX is a paint-only transform, so it can't perturb the layout
  // math the shared handleLeft invariant above depends on.
  const CARD_WIDTH = 240
  const CARD_GAP = 8 // gap-2
  const GROUP_PAD = 12 // p-3
  const GROUP_BORDER = 2 // border-2
  const clusterCount = 1 + parallelSteps.length
  const clusterWidth = clusterCount * CARD_WIDTH + (clusterCount - 1) * CARD_GAP
  const groupWidth = clusterWidth + 2 * (GROUP_PAD + GROUP_BORDER)
  const groupShift = groupWidth / 2 - handleLeft

  const cards = (
    <>
      <StepCard
        step={step}
        selected={step.id === selectedStepId}
        interactive={interactive}
        senderLabel={senderLabel}
        onClick={onClick}
        onMove={onMoveStepDirection}
        onDuplicate={onDuplicateStep}
        onDelete={onDeleteStep}
      />
      {parallelSteps.map((p) => (
        <StepCard
          key={p.id}
          step={p}
          selected={p.id === selectedStepId}
          interactive={interactive}
          senderLabel={senderLabel}
          onClick={onClick}
          onMove={onMoveStepDirection}
          onDuplicate={onDuplicateStep}
          onDelete={onDeleteStep}
        />
      ))}
    </>
  )

  const addParallelButton = canAddParallel && (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => onAddParallel?.(step)}
          aria-label={c.addParallel}
          className="border-muted-foreground/40 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 bg-background flex size-7 shrink-0 items-center justify-center self-center rounded-full border-2 transition-colors"
        >
          <Plus className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{c.addParallel}</TooltipContent>
    </Tooltip>
  )

  const row = (
    <div className="flex items-stretch gap-2">
      {cards}
      {addParallelButton}
    </div>
  )

  return (
    <div className="flex flex-col items-stretch gap-1">
      <Handle
        type="target"
        position={Position.Top}
        style={{ left: handleLeft }}
        className={HANDLE_CLASS}
      />
      {trackLabel && (
        <div className="flex justify-center">
          <TrackLabelPill kind={trackLabel} />
        </div>
      )}
      {hasParallel ? (
        <div className="flex items-stretch gap-2">
          <div
            className="border-primary/30 bg-primary/[0.03] flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-3"
            style={{ transform: `translateX(-${groupShift}px)` }}
          >
            <span className="text-primary flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase">
              <Split className="size-3" />
              {c.inParallel}
            </span>
            <div className="flex items-stretch gap-2">{cards}</div>
          </div>
          {addParallelButton}
        </div>
      ) : (
        row
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ left: handleLeft }}
        className={HANDLE_CLASS}
      />
    </div>
  )
}

// A small "+" living on the connector line between two step cards, not a
// full-width pill with its own row — the wrapper matches the step card's
// width purely so the button centers on the line the edge actually draws.
function AddNodeComponent({
  data,
}: NodeProps & {
  data: AddNodeData & { onClick?: (ghost: AddNodeData) => void }
}) {
  const { locale } = useLocale()
  const c = COPY[locale]

  return (
    <div className="flex flex-col items-center gap-1">
      {data.trackLabel && <TrackLabelPill kind={data.trackLabel} />}
      <div style={{ width: 240 }} className="flex justify-center">
        <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
        <button
          type="button"
          onClick={() => data.onClick?.(data)}
          aria-label={c.addStep}
          className="border-muted-foreground/40 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 bg-background flex size-7 items-center justify-center rounded-full border-2 transition-colors" 
        >
          <Plus className="size-4" />
        </button>
        <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
      </div>
    </div>
  )
}

const nodeTypes: NodeTypes = {
  step: StepNodeComponent as unknown as NodeTypes[string],
  add: AddNodeComponent as unknown as NodeTypes[string],
}

interface SequenceCanvasProps {
  steps: CampaignStep[]
  mode: "interactive" | "readonly"
  selectedStepId?: string
  onSelectStep?: (stepId: string) => void
  onAddRequest?: (ghost: AddNodeData) => void
  onAddParallel?: (step: CampaignStep) => void
  className?: string
  // Cosmetic only — shown as a small avatar on every step card. There's no
  // per-step sending identity in the data model, so this is typically the
  // campaign's single sender account, not something that varies per step.
  senderLabel?: string
  // The card's own "..." menu (Move up/down, Duplicate, Delete) — a faster
  // path than opening the detail panel for the same actions. Omitting a
  // handler drops that action from the menu.
  onMoveStepDirection?: (stepId: string, dir: -1 | 1) => void
  onDuplicateStep?: (stepId: string) => void
  onDeleteStep?: (stepId: string) => void
}

export function SequenceCanvas({
  steps,
  mode,
  selectedStepId,
  onSelectStep,
  onAddRequest,
  onAddParallel,
  className,
  senderLabel,
  onMoveStepDirection,
  onDuplicateStep,
  onDeleteStep,
}: SequenceCanvasProps) {
  const interactive = mode === "interactive"

  const { nodes, edges } = React.useMemo(() => {
    const layout = computeLayout(steps, { interactive })
    const nodes = layout.nodes.map((node) => {
      if (node.type === "step") {
        const stepData = node.data as StepNodeData
        // Draggable only for "plain" steps — a fork's tracks or a
        // parallel anchor's siblings would need to travel with it, which
        // this drop-target model doesn't support; those still reorder via
        // the move up/down buttons in the detail panel instead.
        const draggable =
          interactive && !stepData.step.fork && !stepData.step.parallelSteps?.length
        return {
          ...node,
          draggable,
          data: {
            ...stepData,
            selectedStepId,
            interactive,
            onClick: (step: CampaignStep) => onSelectStep?.(step.id),
            onAddParallel,
            senderLabel,
            onMoveStepDirection: onMoveStepDirection
              ? (step: CampaignStep, dir: -1 | 1) => onMoveStepDirection(step.id, dir)
              : undefined,
            onDuplicateStep: onDuplicateStep
              ? (step: CampaignStep) => onDuplicateStep(step.id)
              : undefined,
            onDeleteStep: onDeleteStep
              ? (step: CampaignStep) => onDeleteStep(step.id)
              : undefined,
          } satisfies StepNodeExtraData,
        }
      }
      return {
        ...node,
        data: {
          ...(node.data as AddNodeData),
          onClick: (ghost: AddNodeData) => onAddRequest?.(ghost),
        },
      }
    })
    return { nodes, edges: layout.edges }
  }, [
    steps,
    interactive,
    selectedStepId,
    onSelectStep,
    onAddRequest,
    onAddParallel,
    senderLabel,
    onMoveStepDirection,
    onDuplicateStep,
    onDeleteStep,
  ])

  return (
    <div
      className={cn(
        "from-muted/40 to-background h-[600px] w-full rounded-xl border bg-gradient-to-b",
        className
      )}
    >
      {/* Nothing on this canvas is draggable — positions are always computed
          from the step tree, and letting a user drag a node or re-route an
          edge would only produce tangled visuals the layout would snap back
          anyway. Reordering happens through each card's "..." menu. */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
        // Still selectable — React Flow drops pointer events entirely on a
        // node that is neither draggable, connectable, nor selectable,
        // which would make the cards' own buttons unclickable. Selection
        // has no visual side effect here and nothing listens for it.
        elementsSelectable={interactive}
        panOnScroll
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
      >
        <Background gap={24} size={1} />
        <Controls position="bottom-left" showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
