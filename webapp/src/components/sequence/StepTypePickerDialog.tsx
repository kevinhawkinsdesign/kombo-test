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
  categoryMeta,
  conditionAppliesToStepType,
  CONDITION_CATALOG,
  CONDITION_CATEGORIES,
  STEP_TYPES,
  ACTION_ICON,
  stepTypeLabel,
  type ConditionCategory,
  type PickableCondition,
  type StepTypeKey,
} from "@/lib/step-channels"
import { cn } from "@/lib/utils"
import type { ConditionKind, StepTypeSelection } from "@/lib/types"

interface ChannelCardCopy {
  description: string
}

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
    conditionCategories: {
      linkedin: "LinkedIn",
      email: "Email",
      whatsapp: "WhatsApp",
      call: "Calls",
    } as Record<ConditionCategory, string>,
    conditions: {
      accept: {
        label: "Accepted LinkedIn connection",
        description:
          "Splits the sequence based on whether they accept your LinkedIn connection request — including if they were already connected before you sent it.",
      },
      is_connected: {
        label: "Is already a connection",
        description: "Splits the sequence based on whether the prospect is already a LinkedIn connection.",
      },
      has_linkedin_profile: {
        label: "Has LinkedIn Profile",
        description: "Splits the sequence based on whether the prospect has a LinkedIn profile on file.",
      },
      open: {
        label: "Email opened",
        description: "Splits the sequence based on whether they open the email.",
      },
      click: {
        label: "Email link clicked",
        description: "Splits the sequence based on whether they click a link in the email.",
      },
      professional_email: {
        label: "Has Professional Email",
        description:
          "Splits the sequence based on whether the prospect has a work email address rather than a personal one.",
      },
      read: {
        label: "WhatsApp message read",
        description: "Splits the sequence based on whether they read the WhatsApp message.",
      },
      call_answered: {
        label: "Call answered",
        description: "Splits the sequence based on whether they answer the call.",
      },
    } as Record<PickableCondition, ConditionCardCopy>,
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
    conditionCategories: {
      linkedin: "LinkedIn",
      email: "Correo",
      whatsapp: "WhatsApp",
      call: "Llamadas",
    } as Record<ConditionCategory, string>,
    conditions: {
      accept: {
        label: "Conexión de LinkedIn aceptada",
        description:
          "Divide la secuencia según si aceptan tu solicitud de conexión de LinkedIn, incluso si ya estaban conectados antes de enviarla.",
      },
      is_connected: {
        label: "Ya es una conexión",
        description: "Divide la secuencia según si el prospecto ya es una conexión de LinkedIn.",
      },
      has_linkedin_profile: {
        label: "Tiene perfil de LinkedIn",
        description: "Divide la secuencia según si el prospecto tiene un perfil de LinkedIn registrado.",
      },
      open: {
        label: "Correo abierto",
        description: "Divide la secuencia según si abren el correo.",
      },
      click: {
        label: "Clic en enlace del correo",
        description: "Divide la secuencia según si hacen clic en un enlace del correo.",
      },
      professional_email: {
        label: "Tiene correo profesional",
        description: "Divide la secuencia según si el prospecto tiene un correo de trabajo en lugar de uno personal.",
      },
      read: {
        label: "Mensaje de WhatsApp leído",
        description: "Divide la secuencia según si leen el mensaje de WhatsApp.",
      },
      call_answered: {
        label: "Llamada contestada",
        description: "Divide la secuencia según si contestan la llamada.",
      },
    } as Record<PickableCondition, ConditionCardCopy>,
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
    conditionCategories: {
      linkedin: "LinkedIn",
      email: "Email",
      whatsapp: "WhatsApp",
      call: "Chiamate",
    } as Record<ConditionCategory, string>,
    conditions: {
      accept: {
        label: "Connessione LinkedIn accettata",
        description:
          "Divide la sequenza a seconda che accettino la richiesta di connessione LinkedIn, anche se erano già connessi prima dell'invio.",
      },
      is_connected: {
        label: "Già connesso su LinkedIn",
        description: "Divide la sequenza a seconda che il prospect sia già una connessione LinkedIn.",
      },
      has_linkedin_profile: {
        label: "Ha un profilo LinkedIn",
        description: "Divide la sequenza a seconda che il prospect abbia un profilo LinkedIn registrato.",
      },
      open: {
        label: "Email aperta",
        description: "Divide la sequenza a seconda che aprano l'email.",
      },
      click: {
        label: "Clic su link nell'email",
        description: "Divide la sequenza a seconda che clicchino un link nell'email.",
      },
      professional_email: {
        label: "Ha un'email professionale",
        description: "Divide la sequenza a seconda che il prospect abbia un'email di lavoro anziché personale.",
      },
      read: {
        label: "Messaggio WhatsApp letto",
        description: "Divide la sequenza a seconda che leggano il messaggio WhatsApp.",
      },
      call_answered: {
        label: "Ha risposto alla chiamata",
        description: "Divide la sequenza a seconda che rispondano alla chiamata.",
      },
    } as Record<PickableCondition, ConditionCardCopy>,
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
    conditionCategories: {
      linkedin: "LinkedIn",
      email: "E-mail",
      whatsapp: "WhatsApp",
      call: "Appels",
    } as Record<ConditionCategory, string>,
    conditions: {
      accept: {
        label: "Connexion LinkedIn acceptée",
        description:
          "Scinde la séquence selon qu'ils acceptent votre demande de connexion LinkedIn — même s'ils étaient déjà connectés avant son envoi.",
      },
      is_connected: {
        label: "Déjà connecté sur LinkedIn",
        description: "Scinde la séquence selon que le prospect soit déjà une connexion LinkedIn.",
      },
      has_linkedin_profile: {
        label: "A un profil LinkedIn",
        description: "Scinde la séquence selon que le prospect ait un profil LinkedIn enregistré.",
      },
      open: {
        label: "E-mail ouvert",
        description: "Scinde la séquence selon qu'ils ouvrent l'e-mail ou non.",
      },
      click: {
        label: "Lien cliqué dans l'e-mail",
        description: "Scinde la séquence selon qu'ils cliquent sur un lien dans l'e-mail ou non.",
      },
      professional_email: {
        label: "A un e-mail professionnel",
        description:
          "Scinde la séquence selon que le prospect ait une adresse e-mail professionnelle plutôt que personnelle.",
      },
      read: {
        label: "Message WhatsApp lu",
        description: "Scinde la séquence selon qu'ils lisent le message WhatsApp ou non.",
      },
      call_answered: {
        label: "A répondu à l'appel",
        description: "Scinde la séquence selon qu'ils répondent à l'appel ou non.",
      },
    } as Record<PickableCondition, ConditionCardCopy>,
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
    conditionCategories: {
      linkedin: "LinkedIn",
      email: "E-Mail",
      whatsapp: "WhatsApp",
      call: "Anrufe",
    } as Record<ConditionCategory, string>,
    conditions: {
      accept: {
        label: "LinkedIn-Vernetzung angenommen",
        description:
          "Teilt die Sequenz danach, ob sie deine LinkedIn-Vernetzungsanfrage annehmen — auch wenn sie vor dem Senden bereits vernetzt waren.",
      },
      is_connected: {
        label: "Bereits vernetzt auf LinkedIn",
        description: "Teilt die Sequenz danach, ob der Lead bereits eine LinkedIn-Vernetzung ist.",
      },
      has_linkedin_profile: {
        label: "Hat ein LinkedIn-Profil",
        description: "Teilt die Sequenz danach, ob der Lead ein hinterlegtes LinkedIn-Profil hat.",
      },
      open: {
        label: "E-Mail geöffnet",
        description: "Teilt die Sequenz danach, ob sie die E-Mail öffnen.",
      },
      click: {
        label: "Link in E-Mail geklickt",
        description: "Teilt die Sequenz danach, ob sie auf einen Link in der E-Mail klicken.",
      },
      professional_email: {
        label: "Hat eine geschäftliche E-Mail",
        description:
          "Teilt die Sequenz danach, ob der Lead eine geschäftliche statt einer privaten E-Mail-Adresse hat.",
      },
      read: {
        label: "WhatsApp-Nachricht gelesen",
        description: "Teilt die Sequenz danach, ob sie die WhatsApp-Nachricht lesen.",
      },
      call_answered: {
        label: "Anruf beantwortet",
        description: "Teilt die Sequenz danach, ob sie den Anruf entgegennehmen.",
      },
    } as Record<PickableCondition, ConditionCardCopy>,
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
    conditionCategories: {
      linkedin: "LinkedIn",
      email: "Email",
      whatsapp: "WhatsApp",
      call: "Chamadas",
    } as Record<ConditionCategory, string>,
    conditions: {
      accept: {
        label: "Ligação do LinkedIn aceite",
        description:
          "Divide a sequência consoante aceitem o seu pedido de ligação do LinkedIn — mesmo que já estivessem ligados antes de o enviar.",
      },
      is_connected: {
        label: "Já é uma ligação",
        description: "Divide a sequência consoante o prospect já seja uma ligação do LinkedIn.",
      },
      has_linkedin_profile: {
        label: "Tem perfil do LinkedIn",
        description: "Divide a sequência consoante o prospect tenha um perfil do LinkedIn registado.",
      },
      open: {
        label: "Email aberto",
        description: "Divide a sequência consoante abram o email ou não.",
      },
      click: {
        label: "Clique num link do email",
        description: "Divide a sequência consoante cliquem num link do email ou não.",
      },
      professional_email: {
        label: "Tem email profissional",
        description: "Divide a sequência consoante o prospect tenha um email de trabalho em vez de um pessoal.",
      },
      read: {
        label: "Mensagem do WhatsApp lida",
        description: "Divide a sequência consoante leiam a mensagem do WhatsApp ou não.",
      },
      call_answered: {
        label: "Atendeu a chamada",
        description: "Divide a sequência consoante atendam a chamada.",
      },
    } as Record<PickableCondition, ConditionCardCopy>,
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
    conditionCategories: {
      linkedin: "LinkedIn",
      email: "Email",
      whatsapp: "WhatsApp",
      call: "Chamadas",
    } as Record<ConditionCategory, string>,
    conditions: {
      accept: {
        label: "Conexão do LinkedIn aceita",
        description:
          "Divide a sequência conforme aceitem sua solicitação de conexão do LinkedIn — mesmo que já estivessem conectados antes de enviá-la.",
      },
      is_connected: {
        label: "Já é uma conexão",
        description: "Divide a sequência conforme o prospect já seja uma conexão do LinkedIn.",
      },
      has_linkedin_profile: {
        label: "Tem perfil do LinkedIn",
        description: "Divide a sequência conforme o prospect tenha um perfil do LinkedIn registrado.",
      },
      open: {
        label: "Email aberto",
        description: "Divide a sequência conforme abram o email ou não.",
      },
      click: {
        label: "Clique em um link do email",
        description: "Divide a sequência conforme cliquem em um link do email ou não.",
      },
      professional_email: {
        label: "Tem email profissional",
        description: "Divide a sequência conforme o prospect tenha um email de trabalho em vez de um pessoal.",
      },
      read: {
        label: "Mensagem do WhatsApp lida",
        description: "Divide a sequência conforme leiam a mensagem do WhatsApp ou não.",
      },
      call_answered: {
        label: "Atendeu a ligação",
        description: "Divide a sequência conforme atendam a ligação.",
      },
    } as Record<PickableCondition, ConditionCardCopy>,
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
  // The exact step type this condition would anchor to — which conditions
  // are enabled depends on more than just the anchor's channel (e.g. only a
  // LinkedIn *connect* step, not any LinkedIn action, can have an accepted
  // invite). Unused when onSelectCondition is omitted.
  conditionStepType?: StepTypeKey
  // Set when this ghost is nested inside a track that already descends
  // from a LinkedIn-connect ("accept") fork — reassessing connection
  // status again doesn't depend on the anchor step's own type (the
  // reference case is re-checking after a follow-up *email*), so "Accepted
  // LinkedIn connection" stays enabled even when conditionStepType would
  // otherwise gate it out.
  forceAllowAccept?: boolean
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
  conditionStepType,
  forceAllowAccept,
  onUseTemplate,
  onUsePrompt,
}: StepTypePickerDialogProps) {
  const { locale } = useLocale()
  const c = COPY[locale]
  // Conditions render grouped by category (matching the reference this tab
  // is built from) with every condition always visible — inapplicable ones
  // stay in place but greyed out and non-clickable, rather than being
  // filtered out of the list entirely, so a user can see what exists and
  // why it's unavailable here. Without a step-type context (shouldn't
  // happen once onSelectCondition is set — see CampaignDetail's wiring),
  // everything defaults to enabled rather than everything disabled.
  const conditionsByCategory = CONDITION_CATEGORIES.map((category) => ({
    category,
    defs: CONDITION_CATALOG.filter((def) => def.category === category),
  })).filter((group) => group.defs.length > 0)
  const isConditionEnabled = (condition: PickableCondition): boolean =>
    !conditionStepType ||
    conditionAppliesToStepType(condition, conditionStepType, { forceAllowAccept })
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
          <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
            {conditionsByCategory.map(({ category, defs }) => {
              const meta = categoryMeta(category)
              return (
                <div key={category} className="space-y-2">
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase">
                    <meta.Icon className="size-3.5" />
                    {c.conditionCategories[category]}
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {defs.map((def) => {
                      const card = c.conditions[def.kind]
                      const enabled = isConditionEnabled(def.kind)
                      return (
                        <button
                          key={def.kind}
                          type="button"
                          disabled={!enabled}
                          onClick={() => {
                            if (!enabled) return
                            onSelectCondition(def.kind)
                            onOpenChange(false)
                          }}
                          className={cn(
                            "flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors",
                            enabled
                              ? "hover:border-primary/40 hover:bg-muted/30"
                              : "cursor-not-allowed opacity-50"
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-8 items-center justify-center rounded-md",
                              enabled ? meta.tint : "bg-muted text-muted-foreground"
                            )}
                          >
                            <def.Icon className="size-4" />
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
