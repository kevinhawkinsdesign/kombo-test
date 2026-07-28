import * as React from "react"
import { FileText, Sparkles, ListChecks, GitFork } from "lucide-react"

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
import {
  CHANNELS,
  conditionAllowedForChannel,
  STEP_TYPES,
  ACTION_ICON,
  stepTypeLabel,
  type StepTypeKey,
} from "@/lib/step-channels"
import { cn } from "@/lib/utils"
import type { ConditionKind, StepChannel, StepTypeSelection } from "@/lib/types"

interface ChannelCardCopy {
  description: string
}

// "reply" is deliberately not offered here: a reply auto-pauses the
// campaign (see the Sequence tab's "Auto-pauses the moment a prospect
// replies" setting), so there's no "if they reply, keep going" track to
// build — the ordinary unforked connector between two steps already means
// "no reply yet," labeled as such in SequenceCanvas.
type PickableCondition = Exclude<ConditionKind, "reply">
const CONDITIONS: PickableCondition[] = ["open", "click", "accept", "read"]

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
      email: { description: "Send a personalized email." },
      linkedin_message: { description: "Send a personalized LinkedIn message." },
      linkedin_connect: { description: "Send a LinkedIn connection request." },
      linkedin_view_profile: { description: "Visit their LinkedIn profile." },
      linkedin_voice_message: { description: "Send a LinkedIn voice message." },
      linkedin_like_post: { description: "Like their latest LinkedIn post." },
      linkedin_inmail: {
        description: "Send a Sales Navigator message — works even without a connection.",
      },
      whatsapp: { description: "Send a WhatsApp message." },
      whatsapp_voice_message: { description: "Send a WhatsApp voice message." },
      call: { description: "Log a phone call to place." },
      ai_call: { description: "Place an agentic AI voice call." },
      manual: { description: "Create a manual task for the rep." },
    } as Record<StepTypeKey, ChannelCardCopy>,
    conditions: {
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
    } as Record<Exclude<ConditionKind, "reply">, ConditionCardCopy>,
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
      email: { description: "Envía un correo personalizado." },
      linkedin_message: { description: "Envía un mensaje personalizado de LinkedIn." },
      linkedin_connect: { description: "Envía una solicitud de conexión de LinkedIn." },
      linkedin_view_profile: { description: "Visita su perfil de LinkedIn." },
      linkedin_voice_message: { description: "Envía un mensaje de voz de LinkedIn." },
      linkedin_like_post: { description: "Dale me gusta a su última publicación de LinkedIn." },
      linkedin_inmail: {
        description: "Envía un mensaje de Sales Navigator — funciona incluso sin estar conectados.",
      },
      whatsapp: { description: "Envía un mensaje de WhatsApp." },
      whatsapp_voice_message: { description: "Envía un mensaje de voz de WhatsApp." },
      call: { description: "Registra una llamada telefónica pendiente." },
      ai_call: { description: "Realiza una llamada de voz con IA agente." },
      manual: { description: "Crea una tarea manual para el representante." },
    } as Record<StepTypeKey, ChannelCardCopy>,
    conditions: {
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
    } as Record<Exclude<ConditionKind, "reply">, ConditionCardCopy>,
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
      email: { description: "Invia un'email personalizzata." },
      linkedin_message: { description: "Invia un messaggio LinkedIn personalizzato." },
      linkedin_connect: { description: "Invia una richiesta di connessione LinkedIn." },
      linkedin_view_profile: { description: "Visita il suo profilo LinkedIn." },
      linkedin_voice_message: { description: "Invia un messaggio vocale LinkedIn." },
      linkedin_like_post: { description: "Metti mi piace al suo ultimo post LinkedIn." },
      linkedin_inmail: {
        description: "Invia un messaggio Sales Navigator — funziona anche senza essere connessi.",
      },
      whatsapp: { description: "Invia un messaggio WhatsApp." },
      whatsapp_voice_message: { description: "Invia un messaggio vocale WhatsApp." },
      call: { description: "Registra una chiamata da effettuare." },
      ai_call: { description: "Effettua una chiamata vocale con IA agentica." },
      manual: { description: "Crea un'attività manuale per il commerciale." },
    } as Record<StepTypeKey, ChannelCardCopy>,
    conditions: {
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
    } as Record<Exclude<ConditionKind, "reply">, ConditionCardCopy>,
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
      email: { description: "Envoyez un e-mail personnalisé." },
      linkedin_message: { description: "Envoyez un message LinkedIn personnalisé." },
      linkedin_connect: { description: "Envoyez une demande de connexion LinkedIn." },
      linkedin_view_profile: { description: "Consultez son profil LinkedIn." },
      linkedin_voice_message: { description: "Envoyez un message vocal LinkedIn." },
      linkedin_like_post: { description: "Aimez sa dernière publication LinkedIn." },
      linkedin_inmail: {
        description: "Envoyez un message Sales Navigator — fonctionne même sans être connectés.",
      },
      whatsapp: { description: "Envoyez un message WhatsApp." },
      whatsapp_voice_message: { description: "Envoyez un message vocal WhatsApp." },
      call: { description: "Consignez un appel à passer." },
      ai_call: { description: "Passez un appel vocal IA agentique." },
      manual: { description: "Créez une tâche manuelle pour le commercial." },
    } as Record<StepTypeKey, ChannelCardCopy>,
    conditions: {
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
    } as Record<Exclude<ConditionKind, "reply">, ConditionCardCopy>,
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
      email: { description: "Sende eine personalisierte E-Mail." },
      linkedin_message: { description: "Sende eine personalisierte LinkedIn-Nachricht." },
      linkedin_connect: { description: "Sende eine LinkedIn-Vernetzungsanfrage." },
      linkedin_view_profile: { description: "Besuche das LinkedIn-Profil." },
      linkedin_voice_message: { description: "Sende eine LinkedIn-Sprachnachricht." },
      linkedin_like_post: { description: "Like den neuesten LinkedIn-Beitrag." },
      linkedin_inmail: {
        description: "Sende eine Sales Navigator-Nachricht — funktioniert auch ohne Vernetzung.",
      },
      whatsapp: { description: "Sende eine WhatsApp-Nachricht." },
      whatsapp_voice_message: { description: "Sende eine WhatsApp-Sprachnachricht." },
      call: { description: "Erfasse einen zu führenden Anruf." },
      ai_call: { description: "Führe einen agentischen KI-Sprachanruf durch." },
      manual: { description: "Erstelle eine manuelle Aufgabe für den Vertriebsmitarbeiter." },
    } as Record<StepTypeKey, ChannelCardCopy>,
    conditions: {
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
    } as Record<Exclude<ConditionKind, "reply">, ConditionCardCopy>,
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
      email: { description: "Envie um email personalizado." },
      linkedin_message: { description: "Envie uma mensagem personalizada no LinkedIn." },
      linkedin_connect: { description: "Envie um pedido de ligação no LinkedIn." },
      linkedin_view_profile: { description: "Visite o perfil no LinkedIn." },
      linkedin_voice_message: { description: "Envie uma mensagem de voz no LinkedIn." },
      linkedin_like_post: { description: "Goste da publicação mais recente no LinkedIn." },
      linkedin_inmail: {
        description: "Envie uma mensagem do Sales Navigator — funciona mesmo sem ligação.",
      },
      whatsapp: { description: "Envie uma mensagem de WhatsApp." },
      whatsapp_voice_message: { description: "Envie uma mensagem de voz no WhatsApp." },
      call: { description: "Registe uma chamada a fazer." },
      ai_call: { description: "Faça uma chamada de voz com um agente de IA." },
      manual: { description: "Crie uma tarefa manual para o comercial." },
    } as Record<StepTypeKey, ChannelCardCopy>,
    conditions: {
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
    } as Record<Exclude<ConditionKind, "reply">, ConditionCardCopy>,
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
      email: { description: "Envie um email personalizado." },
      linkedin_message: { description: "Envie uma mensagem personalizada no LinkedIn." },
      linkedin_connect: { description: "Envie um pedido de conexão no LinkedIn." },
      linkedin_view_profile: { description: "Visite o perfil no LinkedIn." },
      linkedin_voice_message: { description: "Envie uma mensagem de voz no LinkedIn." },
      linkedin_like_post: { description: "Curta a publicação mais recente no LinkedIn." },
      linkedin_inmail: {
        description: "Envie uma mensagem do Sales Navigator — funciona mesmo sem conexão.",
      },
      whatsapp: { description: "Envie uma mensagem de WhatsApp." },
      whatsapp_voice_message: { description: "Envie uma mensagem de voz no WhatsApp." },
      call: { description: "Registre uma ligação a fazer." },
      ai_call: { description: "Faça uma ligação de voz com um agente de IA." },
      manual: { description: "Crie uma tarefa manual para o representante." },
    } as Record<StepTypeKey, ChannelCardCopy>,
    conditions: {
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
    } as Record<Exclude<ConditionKind, "reply">, ConditionCardCopy>,
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
                  const Icon = type.icon || (actionKey && ACTION_ICON[actionKey]) || meta.Icon
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
                        <span className="block text-sm font-medium">
                          {stepTypeLabel(locale, type.key)}
                        </span>
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
