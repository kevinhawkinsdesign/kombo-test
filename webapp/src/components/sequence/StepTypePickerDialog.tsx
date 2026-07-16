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
import { CHANNELS } from "@/lib/step-channels"
import { cn } from "@/lib/utils"
import type { ConditionKind, StepChannel } from "@/lib/types"

interface ChannelCardCopy {
  label: string
  description: string
}

type GroupKey = "email" | "linkedin" | "messaging" | "aiPowered" | "other"

const GROUPS: { key: GroupKey; channels: StepChannel[] }[] = [
  { key: "email", channels: ["email"] },
  { key: "linkedin", channels: ["linkedin_message"] },
  { key: "messaging", channels: ["whatsapp", "call"] },
  { key: "aiPowered", channels: ["ai_call"] },
  { key: "other", channels: ["manual"] },
]

const CONDITIONS: ConditionKind[] = ["reply", "open", "click"]

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
    groups: {
      email: "Email",
      linkedin: "LinkedIn",
      messaging: "Phone & Messaging",
      aiPowered: "AI-powered",
      other: "Other",
    } as Record<GroupKey, string>,
    channels: {
      email: { label: "Email", description: "Send a personalized email." },
      whatsapp: { label: "WhatsApp", description: "Send a WhatsApp message." },
      call: { label: "Phone call", description: "Log a phone call to place." },
      ai_call: {
        label: "AI Voice Call — ElevenLabs",
        description: "Place an agentic AI voice call.",
      },
      linkedin_message: {
        label: "LinkedIn message",
        description: "Send a LinkedIn connection message.",
      },
      linkedin_dm: {
        label: "LinkedIn DM",
        description: "Send a LinkedIn direct message.",
      },
      linkedin_inmail: {
        label: "LinkedIn InMail",
        description: "Send a LinkedIn InMail.",
      },
      manual: {
        label: "Manual task",
        description: "Create a manual task for the rep.",
      },
    } as Record<StepChannel, ChannelCardCopy>,
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
    groups: {
      email: "Correo",
      linkedin: "LinkedIn",
      messaging: "Teléfono y mensajería",
      aiPowered: "Con IA",
      other: "Otro",
    } as Record<GroupKey, string>,
    channels: {
      email: { label: "Correo", description: "Envía un correo personalizado." },
      whatsapp: { label: "WhatsApp", description: "Envía un mensaje de WhatsApp." },
      call: { label: "Llamada", description: "Registra una llamada telefónica pendiente." },
      ai_call: {
        label: "Llamada de voz IA — ElevenLabs",
        description: "Realiza una llamada de voz con IA agente.",
      },
      linkedin_message: {
        label: "Mensaje de LinkedIn",
        description: "Envía un mensaje de conexión de LinkedIn.",
      },
      linkedin_dm: {
        label: "Mensaje directo de LinkedIn",
        description: "Envía un mensaje directo de LinkedIn.",
      },
      linkedin_inmail: {
        label: "InMail de LinkedIn",
        description: "Envía un InMail de LinkedIn.",
      },
      manual: {
        label: "Tarea manual",
        description: "Crea una tarea manual para el representante.",
      },
    } as Record<StepChannel, ChannelCardCopy>,
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
    groups: {
      email: "Email",
      linkedin: "LinkedIn",
      messaging: "Telefono e messaggistica",
      aiPowered: "Con IA",
      other: "Altro",
    } as Record<GroupKey, string>,
    channels: {
      email: { label: "Email", description: "Invia un'email personalizzata." },
      whatsapp: { label: "WhatsApp", description: "Invia un messaggio WhatsApp." },
      call: { label: "Chiamata", description: "Registra una chiamata da effettuare." },
      ai_call: {
        label: "Chiamata vocale IA — ElevenLabs",
        description: "Effettua una chiamata vocale con IA agentica.",
      },
      linkedin_message: {
        label: "Messaggio LinkedIn",
        description: "Invia un messaggio di collegamento su LinkedIn.",
      },
      linkedin_dm: {
        label: "Messaggio diretto LinkedIn",
        description: "Invia un messaggio diretto su LinkedIn.",
      },
      linkedin_inmail: {
        label: "InMail di LinkedIn",
        description: "Invia un InMail su LinkedIn.",
      },
      manual: {
        label: "Attività manuale",
        description: "Crea un'attività manuale per il commerciale.",
      },
    } as Record<StepChannel, ChannelCardCopy>,
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
    groups: {
      email: "E-mail",
      linkedin: "LinkedIn",
      messaging: "Téléphone et messagerie",
      aiPowered: "Avec IA",
      other: "Autre",
    } as Record<GroupKey, string>,
    channels: {
      email: { label: "E-mail", description: "Envoyez un e-mail personnalisé." },
      whatsapp: { label: "WhatsApp", description: "Envoyez un message WhatsApp." },
      call: { label: "Appel téléphonique", description: "Consignez un appel à passer." },
      ai_call: {
        label: "Appel vocal IA — ElevenLabs",
        description: "Passez un appel vocal IA agentique.",
      },
      linkedin_message: {
        label: "Message LinkedIn",
        description: "Envoyez un message de connexion LinkedIn.",
      },
      linkedin_dm: {
        label: "Message privé LinkedIn",
        description: "Envoyez un message privé LinkedIn.",
      },
      linkedin_inmail: {
        label: "InMail LinkedIn",
        description: "Envoyez un InMail LinkedIn.",
      },
      manual: {
        label: "Tâche manuelle",
        description: "Créez une tâche manuelle pour le commercial.",
      },
    } as Record<StepChannel, ChannelCardCopy>,
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
    groups: {
      email: "E-Mail",
      linkedin: "LinkedIn",
      messaging: "Telefon & Messaging",
      aiPowered: "KI-gestützt",
      other: "Sonstiges",
    } as Record<GroupKey, string>,
    channels: {
      email: { label: "E-Mail", description: "Sende eine personalisierte E-Mail." },
      whatsapp: { label: "WhatsApp", description: "Sende eine WhatsApp-Nachricht." },
      call: { label: "Telefonanruf", description: "Erfasse einen zu führenden Anruf." },
      ai_call: {
        label: "KI-Sprachanruf — ElevenLabs",
        description: "Führe einen agentischen KI-Sprachanruf durch.",
      },
      linkedin_message: {
        label: "LinkedIn-Nachricht",
        description: "Sende eine LinkedIn-Vernetzungsnachricht.",
      },
      linkedin_dm: {
        label: "LinkedIn-Direktnachricht",
        description: "Sende eine LinkedIn-Direktnachricht.",
      },
      linkedin_inmail: {
        label: "LinkedIn InMail",
        description: "Sende eine LinkedIn InMail.",
      },
      manual: {
        label: "Manuelle Aufgabe",
        description: "Erstelle eine manuelle Aufgabe für den Vertriebsmitarbeiter.",
      },
    } as Record<StepChannel, ChannelCardCopy>,
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
    groups: {
      email: "Email",
      linkedin: "LinkedIn",
      messaging: "Telefone e mensagens",
      aiPowered: "Com IA",
      other: "Outro",
    } as Record<GroupKey, string>,
    channels: {
      email: { label: "Email", description: "Envie um email personalizado." },
      whatsapp: { label: "WhatsApp", description: "Envie uma mensagem de WhatsApp." },
      call: { label: "Chamada", description: "Registe uma chamada a fazer." },
      ai_call: {
        label: "Chamada de voz IA — ElevenLabs",
        description: "Faça uma chamada de voz com um agente de IA.",
      },
      linkedin_message: {
        label: "Mensagem do LinkedIn",
        description: "Envie uma mensagem de ligação no LinkedIn.",
      },
      linkedin_dm: {
        label: "Mensagem direta do LinkedIn",
        description: "Envie uma mensagem direta no LinkedIn.",
      },
      linkedin_inmail: {
        label: "InMail do LinkedIn",
        description: "Envie um InMail no LinkedIn.",
      },
      manual: {
        label: "Tarefa manual",
        description: "Crie uma tarefa manual para o comercial.",
      },
    } as Record<StepChannel, ChannelCardCopy>,
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
    groups: {
      email: "Email",
      linkedin: "LinkedIn",
      messaging: "Telefone e mensagens",
      aiPowered: "Com IA",
      other: "Outro",
    } as Record<GroupKey, string>,
    channels: {
      email: { label: "Email", description: "Envie um email personalizado." },
      whatsapp: { label: "WhatsApp", description: "Envie uma mensagem de WhatsApp." },
      call: { label: "Ligação", description: "Registre uma ligação a fazer." },
      ai_call: {
        label: "Ligação de voz IA — ElevenLabs",
        description: "Faça uma ligação de voz com um agente de IA.",
      },
      linkedin_message: {
        label: "Mensagem do LinkedIn",
        description: "Envie uma mensagem de conexão no LinkedIn.",
      },
      linkedin_dm: {
        label: "Mensagem direta do LinkedIn",
        description: "Envie uma mensagem direta no LinkedIn.",
      },
      linkedin_inmail: {
        label: "InMail do LinkedIn",
        description: "Envie um InMail no LinkedIn.",
      },
      manual: {
        label: "Tarefa manual",
        description: "Crie uma tarefa manual para o representante.",
      },
    } as Record<StepChannel, ChannelCardCopy>,
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
    } as Record<ConditionKind, ConditionCardCopy>,
  },
} as const

interface StepTypePickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (channel: StepChannel) => void
  title?: string
  description?: string
  // Only offered when the ghost that opened this dialog is a top-level
  // append/insert (not a track-nested one, and not on a step that already
  // has parallel siblings) — conditions fork the sequence, which only
  // makes sense one level deep.
  onSelectCondition?: (condition: ConditionKind) => void
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
  onUseTemplate,
  onUsePrompt,
}: StepTypePickerDialogProps) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const hasQuickActions = onUseTemplate || onUsePrompt

  const [tab, setTab] = React.useState<"steps" | "conditions">("steps")
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setTab("steps")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
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
            {CONDITIONS.map((condition) => {
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

            <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-1">
              {GROUPS.map((group) => (
                <div key={group.key} className="space-y-2">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {c.groups[group.key]}
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {group.channels.map((channel) => {
                      const meta = CHANNELS[channel]
                      const Icon = meta.Icon
                      const card = c.channels[channel]
                      return (
                        <button
                          key={channel}
                          type="button"
                          onClick={() => {
                            onSelect(channel)
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
              ))}
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
