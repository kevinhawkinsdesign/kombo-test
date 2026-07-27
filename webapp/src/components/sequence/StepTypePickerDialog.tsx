import * as React from "react"
import { FileText, Sparkles, ListChecks, GitFork, UserPlus, Eye, Mic, ThumbsUp } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Segmented } from "@/components/common/Segmented"
import { useLocale } from "@/lib/locale"
import { CHANNELS, conditionAllowedForChannel } from "@/lib/step-channels"
import { cn } from "@/lib/utils"
import type {
  ConditionKind,
  LinkedInAction,
  StepChannel,
  StepTypeSelection,
  WhatsAppAction,
} from "@/lib/types"

interface ChannelCardCopy {
  label: string
  description: string
}

// Every pickable step type, flattened — no category grouping — so adding a
// step never requires scrolling through collapsed sections. Several entries
// share a StepChannel but differ by linkedinAction/whatsappAction (e.g.
// LinkedIn message vs. LinkedIn connect), which is why this is its own list
// rather than one card per StepChannel.
type StepTypeKey =
  | "email"
  | "linkedin_message"
  | "linkedin_connect"
  | "linkedin_view_profile"
  | "linkedin_voice_message"
  | "linkedin_like_post"
  | "linkedin_inmail"
  | "whatsapp"
  | "whatsapp_voice_message"
  | "call"
  | "ai_call"
  | "manual"

const STEP_TYPES: {
  key: StepTypeKey
  channel: StepChannel
  linkedinAction?: LinkedInAction
  whatsappAction?: WhatsAppAction
}[] = [
  { key: "email", channel: "email" },
  { key: "linkedin_message", channel: "linkedin_message" },
  { key: "linkedin_connect", channel: "linkedin_message", linkedinAction: "connect" },
  { key: "linkedin_view_profile", channel: "linkedin_message", linkedinAction: "view_profile" },
  { key: "linkedin_voice_message", channel: "linkedin_message", linkedinAction: "voice_message" },
  { key: "linkedin_like_post", channel: "linkedin_message", linkedinAction: "like_post" },
  { key: "linkedin_inmail", channel: "linkedin_inmail" },
  { key: "whatsapp", channel: "whatsapp" },
  { key: "whatsapp_voice_message", channel: "whatsapp", whatsappAction: "voice_message" },
  { key: "call", channel: "call" },
  { key: "ai_call", channel: "ai_call" },
  { key: "manual", channel: "manual" },
]

// Distinguishes the LinkedIn/WhatsApp action-variant cards from each other —
// otherwise every LinkedIn entry would show the same brand glyph. Matches
// the icon vocabulary CampaignDetail.tsx's step editor already uses for
// these same actions.
const ACTION_ICON: Partial<Record<LinkedInAction | WhatsAppAction, React.ComponentType<{ className?: string }>>> = {
  connect: UserPlus,
  view_profile: Eye,
  voice_message: Mic,
  like_post: ThumbsUp,
}

const CONDITIONS: ConditionKind[] = ["reply", "open", "click", "accept", "read"]

interface ConditionCardCopy {
  label: string
  description: string
}

const COPY = {
  en: {
    title: "Add a step",
    description: "Pick what happens next in the sequence.",
    cancel: "Cancel",
    tabSteps: "Steps",
    tabConditions: "Conditions",
    useTemplate: "Use a template",
    usePrompt: "Use a prompt",
    orPickChannel: "Or pick a channel",
    channels: {
      email: { label: "Email", description: "Send a personalized email." },
      linkedin_message: { label: "LinkedIn message", description: "Send a personalized LinkedIn message." },
      linkedin_connect: { label: "LinkedIn connect", description: "Send a LinkedIn connection request." },
      linkedin_view_profile: { label: "LinkedIn view profile", description: "Visit their LinkedIn profile." },
      linkedin_voice_message: { label: "LinkedIn voice message", description: "Send a LinkedIn voice message." },
      linkedin_like_post: { label: "LinkedIn like post", description: "Like their latest LinkedIn post." },
      linkedin_inmail: {
        label: "LinkedIn Sales Navigator message",
        description: "Send a Sales Navigator message — works even without a connection.",
      },
      whatsapp: { label: "WhatsApp", description: "Send a WhatsApp message." },
      whatsapp_voice_message: { label: "WhatsApp voice message", description: "Send a WhatsApp voice message." },
      call: { label: "Phone call", description: "Log a phone call to place." },
      ai_call: { label: "AI Voice Call", description: "Place an agentic AI voice call." },
      manual: { label: "Manual task", description: "Create a manual task for the rep." },
    } as Record<StepTypeKey, ChannelCardCopy>,
    conditions: {
      reply: {
        label: "Replied",
        description: "Splits the sequence based on whether they reply.",
      },
      open: {
        label: "Opened",
        description: "Splits the sequence based on whether they open the message.",
      },
      click: {
        label: "Clicked a link",
        description: "Splits the sequence based on whether they click a link.",
      },
      accept: {
        label: "Accepted connection",
        description: "Splits the sequence based on whether they accept the connection.",
      },
      read: {
        label: "Read the message",
        description: "Splits the sequence based on whether they read the message.",
      },
    } as Record<ConditionKind, ConditionCardCopy>,
  },
  es: {
    title: "Añadir un paso",
    description: "Elige qué ocurre después en la secuencia.",
    tabSteps: "Pasos",
    tabConditions: "Condiciones",
    useTemplate: "Usar una plantilla",
    usePrompt: "Usar un prompt",
    orPickChannel: "O elige un canal",
    cancel: "Cancelar",
    channels: {
      email: { label: "Correo", description: "Envía un correo personalizado." },
      linkedin_message: { label: "Mensaje de LinkedIn", description: "Envía un mensaje personalizado de LinkedIn." },
      linkedin_connect: { label: "Conectar en LinkedIn", description: "Envía una solicitud de conexión de LinkedIn." },
      linkedin_view_profile: { label: "Ver perfil de LinkedIn", description: "Visita su perfil de LinkedIn." },
      linkedin_voice_message: { label: "Mensaje de voz de LinkedIn", description: "Envía un mensaje de voz de LinkedIn." },
      linkedin_like_post: { label: "Dar me gusta en LinkedIn", description: "Dale me gusta a su última publicación de LinkedIn." },
      linkedin_inmail: {
        label: "Mensaje de Sales Navigator",
        description: "Envía un mensaje de Sales Navigator — funciona incluso sin estar conectados.",
      },
      whatsapp: { label: "WhatsApp", description: "Envía un mensaje de WhatsApp." },
      whatsapp_voice_message: { label: "Mensaje de voz de WhatsApp", description: "Envía un mensaje de voz de WhatsApp." },
      call: { label: "Llamada", description: "Registra una llamada telefónica pendiente." },
      ai_call: { label: "Llamada de voz IA", description: "Realiza una llamada de voz con IA agente." },
      manual: { label: "Tarea manual", description: "Crea una tarea manual para el representante." },
    } as Record<StepTypeKey, ChannelCardCopy>,
    conditions: {
      reply: {
        label: "Respondió",
        description: "Divide la secuencia según si responden.",
      },
      open: {
        label: "Abrió",
        description: "Divide la secuencia según si abren el mensaje.",
      },
      click: {
        label: "Hizo clic en un enlace",
        description: "Divide la secuencia según si hacen clic en un enlace.",
      },
      accept: {
        label: "Aceptó la conexión",
        description: "Divide la secuencia según si aceptan la conexión.",
      },
      read: {
        label: "Leyó el mensaje",
        description: "Divide la secuencia según si leen el mensaje.",
      },
    } as Record<ConditionKind, ConditionCardCopy>,
  },
  it: {
    title: "Aggiungi un passaggio",
    description: "Scegli cosa succede dopo nella sequenza.",
    cancel: "Annulla",
    tabSteps: "Passaggi",
    tabConditions: "Condizioni",
    useTemplate: "Usa un modello",
    usePrompt: "Usa un prompt",
    orPickChannel: "Oppure scegli un canale",
    channels: {
      email: { label: "Email", description: "Invia un'email personalizzata." },
      linkedin_message: { label: "Messaggio LinkedIn", description: "Invia un messaggio LinkedIn personalizzato." },
      linkedin_connect: { label: "Connessione LinkedIn", description: "Invia una richiesta di connessione LinkedIn." },
      linkedin_view_profile: { label: "Visualizza profilo LinkedIn", description: "Visita il suo profilo LinkedIn." },
      linkedin_voice_message: { label: "Messaggio vocale LinkedIn", description: "Invia un messaggio vocale LinkedIn." },
      linkedin_like_post: { label: "Metti mi piace su LinkedIn", description: "Metti mi piace al suo ultimo post LinkedIn." },
      linkedin_inmail: {
        label: "Messaggio Sales Navigator",
        description: "Invia un messaggio Sales Navigator — funziona anche senza essere connessi.",
      },
      whatsapp: { label: "WhatsApp", description: "Invia un messaggio WhatsApp." },
      whatsapp_voice_message: { label: "Messaggio vocale WhatsApp", description: "Invia un messaggio vocale WhatsApp." },
      call: { label: "Chiamata", description: "Registra una chiamata da effettuare." },
      ai_call: { label: "Chiamata vocale IA", description: "Effettua una chiamata vocale con IA agentica." },
      manual: { label: "Attività manuale", description: "Crea un'attività manuale per il commerciale." },
    } as Record<StepTypeKey, ChannelCardCopy>,
    conditions: {
      reply: {
        label: "Ha risposto",
        description: "Divide la sequenza a seconda che rispondano o no.",
      },
      open: {
        label: "Ha aperto",
        description: "Divide la sequenza a seconda che aprano il messaggio.",
      },
      click: {
        label: "Ha cliccato un link",
        description: "Divide la sequenza a seconda che clicchino un link.",
      },
      accept: {
        label: "Ha accettato la connessione",
        description: "Divide la sequenza a seconda che accettino la connessione.",
      },
      read: {
        label: "Ha letto il messaggio",
        description: "Divide la sequenza a seconda che leggano il messaggio.",
      },
    } as Record<ConditionKind, ConditionCardCopy>,
  },
  fr: {
    title: "Ajouter une étape",
    description: "Choisissez la suite de la séquence.",
    cancel: "Annuler",
    tabSteps: "Étapes",
    tabConditions: "Conditions",
    useTemplate: "Utiliser un modèle",
    usePrompt: "Utiliser un prompt",
    orPickChannel: "Ou choisissez un canal",
    channels: {
      email: { label: "E-mail", description: "Envoyez un e-mail personnalisé." },
      linkedin_message: { label: "Message LinkedIn", description: "Envoyez un message LinkedIn personnalisé." },
      linkedin_connect: { label: "Connexion LinkedIn", description: "Envoyez une demande de connexion LinkedIn." },
      linkedin_view_profile: { label: "Voir le profil LinkedIn", description: "Consultez son profil LinkedIn." },
      linkedin_voice_message: { label: "Message vocal LinkedIn", description: "Envoyez un message vocal LinkedIn." },
      linkedin_like_post: { label: "Aimer une publication LinkedIn", description: "Aimez sa dernière publication LinkedIn." },
      linkedin_inmail: {
        label: "Message Sales Navigator",
        description: "Envoyez un message Sales Navigator — fonctionne même sans être connectés.",
      },
      whatsapp: { label: "WhatsApp", description: "Envoyez un message WhatsApp." },
      whatsapp_voice_message: { label: "Message vocal WhatsApp", description: "Envoyez un message vocal WhatsApp." },
      call: { label: "Appel téléphonique", description: "Consignez un appel à passer." },
      ai_call: { label: "Appel vocal IA", description: "Passez un appel vocal IA agentique." },
      manual: { label: "Tâche manuelle", description: "Créez une tâche manuelle pour le commercial." },
    } as Record<StepTypeKey, ChannelCardCopy>,
    conditions: {
      reply: {
        label: "A répondu",
        description: "Scinde la séquence selon qu'ils répondent ou non.",
      },
      open: {
        label: "A ouvert",
        description: "Scinde la séquence selon qu'ils ouvrent le message ou non.",
      },
      click: {
        label: "A cliqué sur un lien",
        description: "Scinde la séquence selon qu'ils cliquent sur un lien ou non.",
      },
      accept: {
        label: "A accepté la connexion",
        description: "Scinde la séquence selon qu'ils acceptent la connexion ou non.",
      },
      read: {
        label: "A lu le message",
        description: "Scinde la séquence selon qu'ils lisent le message ou non.",
      },
    } as Record<ConditionKind, ConditionCardCopy>,
  },
  de: {
    title: "Schritt hinzufügen",
    description: "Wähle, was als Nächstes in der Sequenz passiert.",
    cancel: "Abbrechen",
    tabSteps: "Schritte",
    tabConditions: "Bedingungen",
    useTemplate: "Vorlage verwenden",
    usePrompt: "Prompt verwenden",
    orPickChannel: "Oder wähle einen Kanal",
    channels: {
      email: { label: "E-Mail", description: "Sende eine personalisierte E-Mail." },
      linkedin_message: { label: "LinkedIn-Nachricht", description: "Sende eine personalisierte LinkedIn-Nachricht." },
      linkedin_connect: { label: "LinkedIn-Vernetzung", description: "Sende eine LinkedIn-Vernetzungsanfrage." },
      linkedin_view_profile: { label: "LinkedIn-Profil ansehen", description: "Besuche das LinkedIn-Profil." },
      linkedin_voice_message: { label: "LinkedIn-Sprachnachricht", description: "Sende eine LinkedIn-Sprachnachricht." },
      linkedin_like_post: { label: "LinkedIn-Beitrag liken", description: "Like den neuesten LinkedIn-Beitrag." },
      linkedin_inmail: {
        label: "Sales Navigator-Nachricht",
        description: "Sende eine Sales Navigator-Nachricht — funktioniert auch ohne Vernetzung.",
      },
      whatsapp: { label: "WhatsApp", description: "Sende eine WhatsApp-Nachricht." },
      whatsapp_voice_message: { label: "WhatsApp-Sprachnachricht", description: "Sende eine WhatsApp-Sprachnachricht." },
      call: { label: "Telefonanruf", description: "Erfasse einen zu führenden Anruf." },
      ai_call: { label: "KI-Sprachanruf", description: "Führe einen agentischen KI-Sprachanruf durch." },
      manual: { label: "Manuelle Aufgabe", description: "Erstelle eine manuelle Aufgabe für den Vertriebsmitarbeiter." },
    } as Record<StepTypeKey, ChannelCardCopy>,
    conditions: {
      reply: {
        label: "Geantwortet",
        description: "Teilt die Sequenz danach, ob sie antworten.",
      },
      open: {
        label: "Geöffnet",
        description: "Teilt die Sequenz danach, ob sie die Nachricht öffnen.",
      },
      click: {
        label: "Link geklickt",
        description: "Teilt die Sequenz danach, ob sie auf einen Link klicken.",
      },
      accept: {
        label: "Verbindung angenommen",
        description: "Teilt die Sequenz danach, ob sie die Verbindung annehmen.",
      },
      read: {
        label: "Nachricht gelesen",
        description: "Teilt die Sequenz danach, ob sie die Nachricht lesen.",
      },
    } as Record<ConditionKind, ConditionCardCopy>,
  },
  pt: {
    title: "Adicionar um passo",
    description: "Escolha o que acontece a seguir na sequência.",
    cancel: "Cancelar",
    tabSteps: "Passos",
    tabConditions: "Condições",
    useTemplate: "Usar um modelo",
    usePrompt: "Usar um prompt",
    orPickChannel: "Ou escolha um canal",
    channels: {
      email: { label: "Email", description: "Envie um email personalizado." },
      linkedin_message: { label: "Mensagem do LinkedIn", description: "Envie uma mensagem personalizada no LinkedIn." },
      linkedin_connect: { label: "Ligação no LinkedIn", description: "Envie um pedido de ligação no LinkedIn." },
      linkedin_view_profile: { label: "Ver perfil do LinkedIn", description: "Visite o perfil no LinkedIn." },
      linkedin_voice_message: { label: "Mensagem de voz do LinkedIn", description: "Envie uma mensagem de voz no LinkedIn." },
      linkedin_like_post: { label: "Gostar de publicação no LinkedIn", description: "Goste da publicação mais recente no LinkedIn." },
      linkedin_inmail: {
        label: "Mensagem do Sales Navigator",
        description: "Envie uma mensagem do Sales Navigator — funciona mesmo sem ligação.",
      },
      whatsapp: { label: "WhatsApp", description: "Envie uma mensagem de WhatsApp." },
      whatsapp_voice_message: { label: "Mensagem de voz do WhatsApp", description: "Envie uma mensagem de voz no WhatsApp." },
      call: { label: "Chamada", description: "Registe uma chamada a fazer." },
      ai_call: { label: "Chamada de voz IA", description: "Faça uma chamada de voz com um agente de IA." },
      manual: { label: "Tarefa manual", description: "Crie uma tarefa manual para o comercial." },
    } as Record<StepTypeKey, ChannelCardCopy>,
    conditions: {
      reply: {
        label: "Respondeu",
        description: "Divide a sequência consoante respondam ou não.",
      },
      open: {
        label: "Abriu",
        description: "Divide a sequência consoante abram a mensagem ou não.",
      },
      click: {
        label: "Clicou num link",
        description: "Divide a sequência consoante cliquem num link ou não.",
      },
      accept: {
        label: "Aceitou a ligação",
        description: "Divide a sequência consoante aceitem a ligação ou não.",
      },
      read: {
        label: "Leu a mensagem",
        description: "Divide a sequência consoante leiam a mensagem ou não.",
      },
    } as Record<ConditionKind, ConditionCardCopy>,
  },
  pt_BR: {
    title: "Adicionar uma etapa",
    description: "Escolha o que acontece em seguida na sequência.",
    cancel: "Cancelar",
    tabSteps: "Etapas",
    tabConditions: "Condições",
    useTemplate: "Usar um modelo",
    usePrompt: "Usar um prompt",
    orPickChannel: "Ou escolha um canal",
    channels: {
      email: { label: "Email", description: "Envie um email personalizado." },
      linkedin_message: { label: "Mensagem do LinkedIn", description: "Envie uma mensagem personalizada no LinkedIn." },
      linkedin_connect: { label: "Conexão no LinkedIn", description: "Envie um pedido de conexão no LinkedIn." },
      linkedin_view_profile: { label: "Ver perfil do LinkedIn", description: "Visite o perfil no LinkedIn." },
      linkedin_voice_message: { label: "Mensagem de voz do LinkedIn", description: "Envie uma mensagem de voz no LinkedIn." },
      linkedin_like_post: { label: "Curtir publicação no LinkedIn", description: "Curta a publicação mais recente no LinkedIn." },
      linkedin_inmail: {
        label: "Mensagem do Sales Navigator",
        description: "Envie uma mensagem do Sales Navigator — funciona mesmo sem conexão.",
      },
      whatsapp: { label: "WhatsApp", description: "Envie uma mensagem de WhatsApp." },
      whatsapp_voice_message: { label: "Mensagem de voz do WhatsApp", description: "Envie uma mensagem de voz no WhatsApp." },
      call: { label: "Ligação", description: "Registre uma ligação a fazer." },
      ai_call: { label: "Ligação de voz IA", description: "Faça uma ligação de voz com um agente de IA." },
      manual: { label: "Tarefa manual", description: "Crie uma tarefa manual para o representante." },
    } as Record<StepTypeKey, ChannelCardCopy>,
    conditions: {
      reply: {
        label: "Respondeu",
        description: "Divide a sequência conforme respondam ou não.",
      },
      open: {
        label: "Abriu",
        description: "Divide a sequência conforme abram a mensagem ou não.",
      },
      click: {
        label: "Clicou em um link",
        description: "Divide a sequência conforme cliquem em um link ou não.",
      },
      accept: {
        label: "Aceitou a conexão",
        description: "Divide a sequência conforme aceitem a conexão ou não.",
      },
      read: {
        label: "Leu a mensagem",
        description: "Divide a sequência conforme leiam a mensagem ou não.",
      },
    } as Record<ConditionKind, ConditionCardCopy>,
  },
} as const

interface StepTypePickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (selection: StepTypeSelection) => void
  title?: string
  description?: string
  // Only offered when the ghost that opened this dialog is a top-level
  // append/insert (not a track-nested one, and not on a step that already
  // has parallel siblings) — conditions fork the sequence, which only
  // makes sense one level deep.
  onSelectCondition?: (condition: ConditionKind) => void
  // The channel of the step this condition would anchor to — some
  // conditions only make sense for certain channels (e.g. "Opened" only
  // means something for an email step). Unused when onSelectCondition is
  // omitted.
  conditionChannel?: StepChannel
  // Quick-start shortcuts — only offered when the ghost that opened this
  // dialog is an append (not a mid-sequence insert or fork track), since
  // these always add to the end of the top-level sequence.
  onUseTemplate?: () => void
  onUsePrompt?: () => void
}

export function StepTypePickerDialog({
  open,
  onOpenChange,
  onSelect,
  title,
  description,
  onSelectCondition,
  conditionChannel,
  onUseTemplate,
  onUsePrompt,
}: StepTypePickerDialogProps) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const availableConditions = conditionChannel
    ? CONDITIONS.filter((condition) => conditionAllowedForChannel(condition, conditionChannel))
    : CONDITIONS
  const hasQuickActions = onUseTemplate || onUsePrompt

  const [tab, setTab] = React.useState<"steps" | "conditions">("steps")
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setTab("steps")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title ?? c.title}</DialogTitle>
          <DialogDescription>{description ?? c.description}</DialogDescription>
        </DialogHeader>

        {onSelectCondition && (
          <div className="flex justify-center">
            <Segmented
              options={[
                { v: "steps", label: c.tabSteps, icon: ListChecks },
                { v: "conditions", label: c.tabConditions, icon: GitFork },
              ]}
              value={tab}
              onChange={setTab}
            />
          </div>
        )}

        {tab === "conditions" && onSelectCondition ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {availableConditions.map((condition) => {
              const card = c.conditions[condition]
              return (
                <button
                  key={condition}
                  type="button"
                  onClick={() => {
                    onSelectCondition(condition)
                    onOpenChange(false)
                  }}
                  className="hover:border-primary/40 hover:bg-muted/30 flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors"
                >
                  <span className="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-md">
                    <GitFork className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{card.label}</span>
                    <span className="text-muted-foreground block text-xs">
                      {card.description}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <>
            {hasQuickActions && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {onUseTemplate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onUseTemplate()
                        onOpenChange(false)
                      }}
                    >
                      <FileText className="size-4" />
                      {c.useTemplate}
                    </Button>
                  )}
                  {onUsePrompt && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onUsePrompt()
                        onOpenChange(false)
                      }}
                    >
                      <Sparkles className="size-4" />
                      {c.usePrompt}
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-muted-foreground text-xs uppercase">
                    {c.orPickChannel}
                  </span>
                  <Separator className="flex-1" />
                </div>
              </div>
            )}

            <div className="max-h-[65vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {STEP_TYPES.map((type) => {
                  const meta = CHANNELS[type.channel]
                  const actionKey = type.linkedinAction ?? type.whatsappAction
                  const Icon = (actionKey && ACTION_ICON[actionKey]) || meta.Icon
                  const card = c.channels[type.key]
                  return (
                    <button
                      key={type.key}
                      type="button"
                      onClick={() => {
                        onSelect({
                          channel: type.channel,
                          linkedinAction: type.linkedinAction,
                          whatsappAction: type.whatsappAction,
                        })
                        onOpenChange(false)
                      }}
                      className="hover:border-primary/40 hover:bg-muted/30 flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors"
                    >
                      <span
                        className={cn(
                          "flex size-8 items-center justify-center rounded-md",
                          meta.tint
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{card.label}</span>
                        <span className="text-muted-foreground block text-xs">
                          {card.description}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
