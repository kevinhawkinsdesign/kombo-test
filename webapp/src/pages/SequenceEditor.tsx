// The "New sequence" / library sequence editor. Uses the same
// SequenceCanvas-based building blocks as CampaignDetail's Sequence tab
// (CampaignStep + parallelSteps, StepTypePickerDialog, useSequenceDraft) so
// there's a single parallel-step data model and a single visual editor —
// the old BuilderStep/`parallel: boolean` flat-toggle model this page used
// to run on has been retired. See the migration notes at the bottom of this
// file for what's intentionally simplified vs. CampaignDetail's version.

import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CalendarClock,
  Check,
  GitFork,
  Trash2,
  Workflow,
  X,
  Zap,
} from "lucide-react"

import { Page } from "@/components/layout/Page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Segmented } from "@/components/common/Segmented"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { AssigneePicker } from "@/components/common/AssigneePicker"
import { RichTextEditor } from "@/components/common/RichTextEditor"
import { VoiceMessageRecorder } from "@/components/campaign/VoiceMessageRecorder"
import { SequenceCanvas } from "@/components/sequence/SequenceCanvas"
import { StepTypePickerDialog } from "@/components/sequence/StepTypePickerDialog"
import { SequenceCostSummary } from "@/components/campaigns/SequenceCostSummary"
import { useSequenceDraft } from "@/lib/sequence-draft"
import { findCampaignStep, locateCampaignStep } from "@/lib/store"
import {
  channelMeta,
  normalizeChannel,
  STEP_TYPES,
  stepTypeKeyFor,
  stepTypeLabel,
} from "@/lib/step-channels"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import type { AddNodeData } from "@/lib/sequence-layout"
import type { CampaignStep, ConditionKind, LinkedInAction, StepTypeSelection } from "@/lib/types"

const COPY = {
  en: {
    defaultName: "Untitled sequence",
    untitled: "Untitled",
    sequenceSaved: (name: string) => `Sequence "${name}" saved`,
    backToSequences: "Back to sequences",
    sequenceName: "Sequence name",
    description: "Design the touches, triggers, and branches for this sequence.",
    saveSequence: "Save sequence",
    introTitle: "Build sequences visually",
    introDescription:
      "Drag steps to reorder, branch on what prospects do, and fan out touches in parallel across email, LinkedIn, WhatsApp, and AI calls.",
    introPoints: [
      "Mix email, LinkedIn, calls & WhatsApp",
      "Branch on replies, opens, clicks, and more",
      "Fan out steps in parallel",
      "Reuse a proven cadence across campaigns",
    ],
    stepChannelAria: "Step type",
    moveStepUp: "Move step up",
    moveStepDown: "Move step down",
    removeStep: "Delete step",
    closePanel: "Close panel",
    parallelStepNote: "Sends at the same time as the step next to it.",
    timeDelay: "Time Delay",
    sendImmediately: "Send immediately",
    delayByDays: "Delay by days",
    daysBeforeSending: "days before sending",
    clearDelay: "Reset to send immediately",
    manualTaskAssignee: "Owner",
    taskTitlePlaceholder: "Task title, e.g. \"Call to follow up\"",
    taskNotesPlaceholder: "Notes for the rep (optional)",
    subjectLine: "Subject line",
    messageBody: "Message body",
    aiScriptPlaceholder: "Script / instructions for the AI agent",
    conditionName: {
      reply: "Replied",
      open: "Opened",
      click: "Clicked a link",
      accept: "Accepted LinkedIn connection",
      read: "Read the message",
      is_connected: "Is already a connection",
      has_linkedin_profile: "Has LinkedIn Profile",
      professional_email: "Has Professional Email",
      call_answered: "Call answered",
    } as Record<ConditionKind, string>,
    conditionActiveLabel: (name: string) => `Forks on: ${name}`,
    removeCondition: "Remove condition",
    withinDaysLabel: "Check within",
    withinDaysSuffix: "days",
    withinDaysHint:
      'After this window, prospects who haven\'t connected yet continue down the "Not Connected" track.',
    linkedinActionDescription: {
      message: "",
      connect: "Sends a LinkedIn connection request — no message.",
      like_post: "Likes the prospect's most recent post.",
      view_profile: "Visits the prospect's LinkedIn profile.",
      voice_message: "Sends a recorded voice message.",
    } as Record<LinkedInAction, string>,
    connectStepAutoAdded:
      "Added a LinkedIn connect step first, since this step requires an accepted connection.",
  },
  es: {
    defaultName: "Secuencia sin título",
    untitled: "Sin título",
    sequenceSaved: (name: string) => `Secuencia «${name}» guardada`,
    backToSequences: "Volver a secuencias",
    sequenceName: "Nombre de la secuencia",
    description:
      "Diseña los contactos, disparadores y ramificaciones de esta secuencia.",
    saveSequence: "Guardar secuencia",
    introTitle: "Crea secuencias de forma visual",
    introDescription:
      "Arrastra pasos para reordenarlos, ramifica según lo que hagan los prospectos y despliega contactos en paralelo por correo, LinkedIn, WhatsApp y llamadas con IA.",
    introPoints: [
      "Combina email, LinkedIn, llamadas y WhatsApp",
      "Ramifica según respuestas, aperturas, clics y más",
      "Despliega pasos en paralelo",
      "Reutiliza una cadencia probada en varias campañas",
    ],
    stepChannelAria: "Tipo de paso",
    moveStepUp: "Subir paso",
    moveStepDown: "Bajar paso",
    removeStep: "Eliminar paso",
    closePanel: "Cerrar panel",
    parallelStepNote: "Se envía al mismo tiempo que el paso junto a él.",
    timeDelay: "Retraso de tiempo",
    sendImmediately: "Enviar inmediatamente",
    delayByDays: "Retrasar por días",
    daysBeforeSending: "días antes de enviar",
    clearDelay: "Restablecer a envío inmediato",
    manualTaskAssignee: "Responsable",
    taskTitlePlaceholder: "Título de la tarea, p. ej. «Llamar para dar seguimiento»",
    taskNotesPlaceholder: "Notas para el vendedor (opcional)",
    subjectLine: "Asunto",
    messageBody: "Cuerpo del mensaje",
    aiScriptPlaceholder: "Script / instrucciones para el agente de IA",
    conditionName: {
      reply: "Respondió",
      open: "Abrió",
      click: "Hizo clic en un enlace",
      accept: "Conexión de LinkedIn aceptada",
      read: "Leyó el mensaje",
      is_connected: "Ya es una conexión",
      has_linkedin_profile: "Tiene perfil de LinkedIn",
      professional_email: "Tiene correo profesional",
      call_answered: "Contestó la llamada",
    } as Record<ConditionKind, string>,
    conditionActiveLabel: (name: string) => `Bifurca en: ${name}`,
    removeCondition: "Quitar condición",
    withinDaysLabel: "Revisar dentro de",
    withinDaysSuffix: "días",
    withinDaysHint:
      'Pasado este plazo, los prospectos que aún no se hayan conectado continúan por la vía "No conectados".',
    linkedinActionDescription: {
      message: "",
      connect: "Envía una solicitud de conexión de LinkedIn — sin mensaje.",
      like_post: "Da me gusta a la publicación más reciente del prospecto.",
      view_profile: "Visita el perfil de LinkedIn del prospecto.",
      voice_message: "Envía un mensaje de voz grabado.",
    } as Record<LinkedInAction, string>,
    connectStepAutoAdded:
      "Se añadió primero un paso de conexión de LinkedIn, ya que este paso requiere una conexión aceptada.",
  },
  it: {
    defaultName: "Sequenza senza titolo",
    untitled: "Senza titolo",
    sequenceSaved: (name: string) => `Sequenza "${name}" salvata`,
    backToSequences: "Torna alle sequenze",
    sequenceName: "Nome della sequenza",
    description:
      "Progetta i tocchi, i trigger e le ramificazioni di questa sequenza.",
    saveSequence: "Salva sequenza",
    introTitle: "Crea sequenze in modo visuale",
    introDescription:
      "Trascina i passaggi per riordinarli, ramifica in base a ciò che fanno i prospect e distribuisci i tocchi in parallelo tra email, LinkedIn, WhatsApp e chiamate IA.",
    introPoints: [
      "Combina email, LinkedIn, chiamate e WhatsApp",
      "Ramifica su risposte, aperture, clic e altro",
      "Distribuisci passaggi in parallelo",
      "Riusa una cadenza collaudata in più campagne",
    ],
    stepChannelAria: "Tipo di passaggio",
    moveStepUp: "Sposta passaggio su",
    moveStepDown: "Sposta passaggio giù",
    removeStep: "Elimina passaggio",
    closePanel: "Chiudi pannello",
    parallelStepNote: "Viene inviato nello stesso momento del passaggio accanto.",
    timeDelay: "Ritardo di tempo",
    sendImmediately: "Invia subito",
    delayByDays: "Ritarda di giorni",
    daysBeforeSending: "giorni prima dell'invio",
    clearDelay: "Ripristina invio immediato",
    manualTaskAssignee: "Responsabile",
    taskTitlePlaceholder: "Titolo dell'attività, es. «Chiamare per un follow-up»",
    taskNotesPlaceholder: "Note per il rappresentante (facoltativo)",
    subjectLine: "Oggetto",
    messageBody: "Corpo del messaggio",
    aiScriptPlaceholder: "Script / istruzioni per l'agente IA",
    conditionName: {
      reply: "Ha risposto",
      open: "Ha aperto",
      click: "Ha cliccato un link",
      accept: "Connessione LinkedIn accettata",
      read: "Ha letto il messaggio",
      is_connected: "Già connesso su LinkedIn",
      has_linkedin_profile: "Ha un profilo LinkedIn",
      professional_email: "Ha un'email professionale",
      call_answered: "Ha risposto alla chiamata",
    } as Record<ConditionKind, string>,
    conditionActiveLabel: (name: string) => `Si dirama su: ${name}`,
    removeCondition: "Rimuovi condizione",
    withinDaysLabel: "Verifica entro",
    withinDaysSuffix: "giorni",
    withinDaysHint:
      'Trascorso questo periodo, i prospect non ancora connessi proseguono nel percorso "Non connesso".',
    linkedinActionDescription: {
      message: "",
      connect: "Invia una richiesta di connessione LinkedIn — senza messaggio.",
      like_post: "Mette mi piace all'ultimo post del prospect.",
      view_profile: "Visita il profilo LinkedIn del prospect.",
      voice_message: "Invia un messaggio vocale registrato.",
    } as Record<LinkedInAction, string>,
    connectStepAutoAdded:
      "È stato aggiunto prima un passaggio di connessione LinkedIn, poiché questo passaggio richiede una connessione accettata.",
  },
  fr: {
    defaultName: "Séquence sans titre",
    untitled: "Sans titre",
    sequenceSaved: (name: string) => `Séquence « ${name} » enregistrée`,
    backToSequences: "Retour aux séquences",
    sequenceName: "Nom de la séquence",
    description:
      "Concevez les touches, les déclencheurs et les branches de cette séquence.",
    saveSequence: "Enregistrer la séquence",
    introTitle: "Construisez vos séquences visuellement",
    introDescription:
      "Glissez les étapes pour les réordonner, créez des branches selon les actions des prospects et déployez des touches en parallèle sur l'e-mail, LinkedIn, WhatsApp et les appels IA.",
    introPoints: [
      "Mélangez e-mail, LinkedIn, appels et WhatsApp",
      "Ramifiez selon les réponses, ouvertures, clics et plus",
      "Déployez des étapes en parallèle",
      "Réutilisez une cadence éprouvée sur plusieurs campagnes",
    ],
    stepChannelAria: "Type d'étape",
    moveStepUp: "Monter l'étape",
    moveStepDown: "Descendre l'étape",
    removeStep: "Supprimer l'étape",
    closePanel: "Fermer le panneau",
    parallelStepNote: "Envoyé en même temps que l'étape voisine.",
    timeDelay: "Délai",
    sendImmediately: "Envoyer immédiatement",
    delayByDays: "Différer de plusieurs jours",
    daysBeforeSending: "jours avant l'envoi",
    clearDelay: "Revenir à un envoi immédiat",
    manualTaskAssignee: "Responsable",
    taskTitlePlaceholder: "Titre de la tâche, par ex. « Appeler pour relancer »",
    taskNotesPlaceholder: "Notes pour le commercial (facultatif)",
    subjectLine: "Objet",
    messageBody: "Corps du message",
    aiScriptPlaceholder: "Script / instructions pour l'agent IA",
    conditionName: {
      reply: "A répondu",
      open: "A ouvert",
      click: "A cliqué sur un lien",
      accept: "Connexion LinkedIn acceptée",
      read: "A lu le message",
      is_connected: "Déjà connecté sur LinkedIn",
      has_linkedin_profile: "A un profil LinkedIn",
      professional_email: "A un e-mail professionnel",
      call_answered: "A répondu à l'appel",
    } as Record<ConditionKind, string>,
    conditionActiveLabel: (name: string) => `Se divise sur : ${name}`,
    removeCondition: "Supprimer la condition",
    withinDaysLabel: "Vérifier sous",
    withinDaysSuffix: "jours",
    withinDaysHint:
      "Passé ce délai, les prospects non encore connectés poursuivent sur la voie « Non connecté ».",
    linkedinActionDescription: {
      message: "",
      connect: "Envoie une demande de connexion LinkedIn — sans message.",
      like_post: "Aime la publication la plus récente du prospect.",
      view_profile: "Visite le profil LinkedIn du prospect.",
      voice_message: "Envoie un message vocal enregistré.",
    } as Record<LinkedInAction, string>,
    connectStepAutoAdded:
      "Une étape de connexion LinkedIn a été ajoutée en premier, car cette étape nécessite une connexion acceptée.",
  },
  de: {
    defaultName: "Unbenannte Sequenz",
    untitled: "Ohne Titel",
    sequenceSaved: (name: string) => `Sequenz „${name}“ gespeichert`,
    backToSequences: "Zurück zu den Sequenzen",
    sequenceName: "Name der Sequenz",
    description:
      "Gestalte die Touchpoints, Trigger und Verzweigungen dieser Sequenz.",
    saveSequence: "Sequenz speichern",
    introTitle: "Sequenzen visuell bauen",
    introDescription:
      "Ziehe Schritte zum Umsortieren, verzweige nach dem Verhalten der Prospects und fächere Touchpoints parallel über E-Mail, LinkedIn, WhatsApp und KI-Anrufe auf.",
    introPoints: [
      "Kombiniere E-Mail, LinkedIn, Anrufe & WhatsApp",
      "Verzweige nach Antworten, Öffnungen, Klicks und mehr",
      "Führe Schritte parallel aus",
      "Nutze eine bewährte Kadenz über mehrere Kampagnen",
    ],
    stepChannelAria: "Schritttyp",
    moveStepUp: "Schritt nach oben verschieben",
    moveStepDown: "Schritt nach unten verschieben",
    removeStep: "Schritt löschen",
    closePanel: "Panel schließen",
    parallelStepNote: "Wird gleichzeitig mit dem danebenliegenden Schritt gesendet.",
    timeDelay: "Zeitverzögerung",
    sendImmediately: "Sofort senden",
    delayByDays: "Tage verzögern",
    daysBeforeSending: "Tage vor dem Versand",
    clearDelay: "Auf sofortigen Versand zurücksetzen",
    manualTaskAssignee: "Verantwortlich",
    taskTitlePlaceholder: "Aufgabentitel, z. B. „Rückruf zur Nachverfolgung“",
    taskNotesPlaceholder: "Notizen für den Vertriebsmitarbeiter (optional)",
    subjectLine: "Betreff",
    messageBody: "Nachrichtentext",
    aiScriptPlaceholder: "Skript / Anweisungen für den KI-Agenten",
    conditionName: {
      reply: "Hat geantwortet",
      open: "Hat geöffnet",
      click: "Hat auf einen Link geklickt",
      accept: "LinkedIn-Vernetzung angenommen",
      read: "Hat die Nachricht gelesen",
      is_connected: "Bereits vernetzt auf LinkedIn",
      has_linkedin_profile: "Hat ein LinkedIn-Profil",
      professional_email: "Hat eine geschäftliche E-Mail",
      call_answered: "Anruf beantwortet",
    } as Record<ConditionKind, string>,
    conditionActiveLabel: (name: string) => `Verzweigt bei: ${name}`,
    removeCondition: "Bedingung entfernen",
    withinDaysLabel: "Prüfen innerhalb von",
    withinDaysSuffix: "Tagen",
    withinDaysHint:
      "Nach diesem Zeitraum folgen noch nicht verbundene Interessenten dem Pfad „Nicht verbunden“.",
    linkedinActionDescription: {
      message: "",
      connect: "Sendet eine LinkedIn-Vernetzungsanfrage — ohne Nachricht.",
      like_post: "Liked den neuesten Beitrag des Prospects.",
      view_profile: "Besucht das LinkedIn-Profil des Prospects.",
      voice_message: "Sendet eine aufgezeichnete Sprachnachricht.",
    } as Record<LinkedInAction, string>,
    connectStepAutoAdded:
      "Zuerst wurde ein LinkedIn-Vernetzungsschritt hinzugefügt, da dieser Schritt eine angenommene Vernetzung erfordert.",
  },
  pt: {
    defaultName: "Sequência sem título",
    untitled: "Sem título",
    sequenceSaved: (name: string) => `Sequência "${name}" guardada`,
    backToSequences: "Voltar às sequências",
    sequenceName: "Nome da sequência",
    description:
      "Desenhe os toques, os acionadores e as ramificações desta sequência.",
    saveSequence: "Guardar sequência",
    introTitle: "Crie sequências de forma visual",
    introDescription:
      "Arraste passos para reordenar, ramifique consoante o que os prospects fazem e distribua toques em paralelo por email, LinkedIn, WhatsApp e chamadas com IA.",
    introPoints: [
      "Combine email, LinkedIn, chamadas e WhatsApp",
      "Ramifique consoante respostas, aberturas, cliques e mais",
      "Distribua passos em paralelo",
      "Reutilize uma cadência comprovada em várias campanhas",
    ],
    stepChannelAria: "Tipo de passo",
    moveStepUp: "Mover passo para cima",
    moveStepDown: "Mover passo para baixo",
    removeStep: "Eliminar passo",
    closePanel: "Fechar painel",
    parallelStepNote: "É enviado ao mesmo tempo que o passo ao lado.",
    timeDelay: "Atraso de tempo",
    sendImmediately: "Enviar de imediato",
    delayByDays: "Atrasar por dias",
    daysBeforeSending: "dias antes do envio",
    clearDelay: "Repor envio imediato",
    manualTaskAssignee: "Responsável",
    taskTitlePlaceholder: "Título da tarefa, p. ex. «Ligar para acompanhamento»",
    taskNotesPlaceholder: "Notas para o comercial (opcional)",
    subjectLine: "Assunto",
    messageBody: "Corpo da mensagem",
    aiScriptPlaceholder: "Guião / instruções para o agente de IA",
    conditionName: {
      reply: "Respondeu",
      open: "Abriu",
      click: "Clicou numa ligação",
      accept: "Ligação do LinkedIn aceite",
      read: "Leu a mensagem",
      is_connected: "Já é uma ligação",
      has_linkedin_profile: "Tem perfil do LinkedIn",
      professional_email: "Tem email profissional",
      call_answered: "Atendeu a chamada",
    } as Record<ConditionKind, string>,
    conditionActiveLabel: (name: string) => `Bifurca em: ${name}`,
    removeCondition: "Remover condição",
    withinDaysLabel: "Verificar em",
    withinDaysSuffix: "dias",
    withinDaysHint:
      'Após este período, os contactos que ainda não estejam ligados seguem pelo percurso "Não ligado".',
    linkedinActionDescription: {
      message: "",
      connect: "Envia um pedido de ligação no LinkedIn — sem mensagem.",
      like_post: "Gosta da publicação mais recente do prospect.",
      view_profile: "Visita o perfil do LinkedIn do prospect.",
      voice_message: "Envia uma mensagem de voz gravada.",
    } as Record<LinkedInAction, string>,
    connectStepAutoAdded:
      "Foi adicionado primeiro um passo de ligação no LinkedIn, uma vez que este passo requer uma ligação aceite.",
  },
  pt_BR: {
    defaultName: "Sequência sem título",
    untitled: "Sem título",
    sequenceSaved: (name: string) => `Sequência "${name}" salva`,
    backToSequences: "Voltar para sequências",
    sequenceName: "Nome da sequência",
    description:
      "Desenhe os toques, os gatilhos e as ramificações desta sequência.",
    saveSequence: "Salvar sequência",
    introTitle: "Crie sequências de forma visual",
    introDescription:
      "Arraste etapas para reordenar, ramifique conforme o que os prospects fazem e distribua toques em paralelo por email, LinkedIn, WhatsApp e ligações com IA.",
    introPoints: [
      "Combine email, LinkedIn, ligações e WhatsApp",
      "Ramifique conforme respostas, aberturas, cliques e mais",
      "Distribua etapas em paralelo",
      "Reutilize uma cadência comprovada em várias campanhas",
    ],
    stepChannelAria: "Tipo de etapa",
    moveStepUp: "Mover etapa para cima",
    moveStepDown: "Mover etapa para baixo",
    removeStep: "Excluir etapa",
    closePanel: "Fechar painel",
    parallelStepNote: "É enviado ao mesmo tempo que a etapa ao lado.",
    timeDelay: "Atraso de tempo",
    sendImmediately: "Enviar imediatamente",
    delayByDays: "Atrasar por dias",
    daysBeforeSending: "dias antes do envio",
    clearDelay: "Redefinir para envio imediato",
    manualTaskAssignee: "Responsável",
    taskTitlePlaceholder: "Título da tarefa, por ex. «Ligar para fazer follow-up»",
    taskNotesPlaceholder: "Notas para o vendedor (opcional)",
    subjectLine: "Assunto",
    messageBody: "Corpo da mensagem",
    aiScriptPlaceholder: "Roteiro / instruções para o agente de IA",
    conditionName: {
      reply: "Respondeu",
      open: "Abriu",
      click: "Clicou em um link",
      accept: "Conexão do LinkedIn aceita",
      read: "Leu a mensagem",
      is_connected: "Já é uma conexão",
      has_linkedin_profile: "Tem perfil do LinkedIn",
      professional_email: "Tem email profissional",
      call_answered: "Atendeu a ligação",
    } as Record<ConditionKind, string>,
    conditionActiveLabel: (name: string) => `Bifurca em: ${name}`,
    removeCondition: "Remover condição",
    withinDaysLabel: "Verificar em",
    withinDaysSuffix: "dias",
    withinDaysHint:
      'Após esse período, os contatos que ainda não estejam conectados seguem pelo caminho "Não conectado".',
    linkedinActionDescription: {
      message: "",
      connect: "Envia um pedido de conexão no LinkedIn — sem mensagem.",
      like_post: "Curte a publicação mais recente do prospect.",
      view_profile: "Visita o perfil do LinkedIn do prospect.",
      voice_message: "Envia uma mensagem de voz gravada.",
    } as Record<LinkedInAction, string>,
    connectStepAutoAdded:
      "Foi adicionada primeiro uma etapa de conexão no LinkedIn, já que esta etapa exige uma conexão aceita.",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

export default function SequenceEditor() {
  const { locale, t } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const location = useLocation()
  const hasHistory = location.key !== "default"
  const [name, setName] = React.useState<string>(c.defaultName)
  const [selectedStepId, setSelectedStepId] = React.useState<string | undefined>(undefined)
  const [stepPickerOpen, setStepPickerOpen] = React.useState(false)
  const [pendingGhost, setPendingGhost] = React.useState<AddNodeData | null>(null)
  const [pendingParallelStep, setPendingParallelStep] = React.useState<CampaignStep | null>(null)

  function goBack() {
    if (hasHistory) navigate(-1)
    else navigate("/sequences")
  }

  // No real backing store for a saved library sequence yet (see the note at
  // the bottom of this file) — Save just confirms and returns, same as the
  // component this page replaces.
  const draft = useSequenceDraft("new-sequence", [], () => {
    toast.success(c.sequenceSaved(name.trim() || c.untitled))
    goBack()
  })

  function stepContainsConnect(step: CampaignStep): boolean {
    if (step.linkedinAction === "connect") return true
    if (step.parallelSteps?.some((p) => p.linkedinAction === "connect")) return true
    return step.fork?.tracks.some((tr) => tr.steps.some(stepContainsConnect)) ?? false
  }
  function alreadyHasLinkedInConnect(beforeStepId?: string): boolean {
    if (!beforeStepId) return false
    const idx = draft.steps.findIndex((s) => s.id === beforeStepId)
    if (idx === -1) return false
    return draft.steps.slice(0, idx + 1).some(stepContainsConnect)
  }
  function requiresLinkedInConnection(selection: StepTypeSelection): boolean {
    return (
      selection.channel === "linkedin_message" &&
      (selection.linkedinAction === undefined ||
        selection.linkedinAction === "message" ||
        selection.linkedinAction === "voice_message")
    )
  }

  function handleStepTypeSelect(selection: StepTypeSelection) {
    const { channel, linkedinAction, whatsappAction } = selection
    if (pendingParallelStep) {
      draft.addParallelStep(pendingParallelStep.id, channel, { linkedinAction, whatsappAction })
      setPendingParallelStep(null)
      return
    }
    const ghost = pendingGhost
    if (!ghost) return
    if (ghost.trackId && ghost.forkStepId) {
      draft.addForkStep(ghost.forkStepId, ghost.trackId, channel, { linkedinAction, whatsappAction })
    } else if (
      requiresLinkedInConnection(selection) &&
      !alreadyHasLinkedInConnect(ghost.afterStepId)
    ) {
      draft.addConnectGatedStep(selection, ghost.afterStepId)
      toast.info(c.connectStepAutoAdded)
    } else if (ghost.afterStepId) {
      const idx = draft.steps.findIndex((s) => s.id === ghost.afterStepId)
      draft.insertStep(idx + 1, channel, { linkedinAction, whatsappAction })
    } else {
      draft.addStep(channel, { linkedinAction, whatsappAction })
    }
    setPendingGhost(null)
  }

  function handleConditionSelect(condition: ConditionKind) {
    if (!pendingGhost?.afterStepId) return
    draft.addCondition(pendingGhost.afterStepId, condition)
    setPendingGhost(null)
  }

  // Conditions only offered one level deep, anchored to a plain top-level
  // step — matches the common case in CampaignDetail's picker; the deeper
  // "nest a condition inside an accept-fork track" allowance there is out
  // of scope for this simplified standalone editor (see file footer).
  const conditionAnchorStep =
    pendingGhost?.afterStepId && !pendingGhost.trackId
      ? findCampaignStep(draft.steps, pendingGhost.afterStepId)
      : undefined
  const allowCondition = Boolean(
    conditionAnchorStep && !conditionAnchorStep.fork && !conditionAnchorStep.parallelSteps?.length
  )

  const selectedStep = selectedStepId ? findCampaignStep(draft.steps, selectedStepId) : undefined

  return (
    <Page>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label={hasHistory ? t("common.back") : c.backToSequences}
          onClick={goBack}
          className="-ml-2"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label={c.sequenceName}
            className="h-auto border-transparent bg-transparent px-0 text-xl font-semibold shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
          />
          <p className="text-muted-foreground text-sm">{c.description}</p>
        </div>
        <Button variant="volt" onClick={() => draft.apply()}>
          <Check className="size-4" />
          {c.saveSequence}
        </Button>
      </div>

      <FeatureIntro
        featureKey="sequence"
        icon={Workflow}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        className="mb-6"
      />

      <div className="mb-4">
        <SequenceCostSummary steps={draft.steps} />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-3">
          <SequenceCanvas
            steps={draft.steps}
            mode="interactive"
            selectedStepId={selectedStepId}
            onSelectStep={setSelectedStepId}
            onAddRequest={(ghost) => {
              setPendingGhost(ghost)
              setPendingParallelStep(null)
              setStepPickerOpen(true)
            }}
            onAddParallel={(step) => {
              setPendingParallelStep(step)
              setPendingGhost(null)
              setStepPickerOpen(true)
            }}
            onMoveStepDirection={(id, dir) => draft.moveStep(id, dir)}
            onDuplicateStep={(id) => draft.duplicateStep(id)}
            onDeleteStep={(id) => {
              draft.removeStep(id)
              if (selectedStepId === id) setSelectedStepId(undefined)
            }}
          />
        </div>

        {selectedStep && (
          <StepDetailPanel
            step={selectedStep}
            steps={draft.steps}
            c={c}
            locale={locale}
            onUpdate={(patch) => {
              const gated = draft.updateStep(selectedStep.id, patch)
              if (gated) toast.info(c.connectStepAutoAdded)
            }}
            onMove={(dir) => draft.moveStep(selectedStep.id, dir)}
            onDelete={() => {
              draft.removeStep(selectedStep.id)
              setSelectedStepId(undefined)
            }}
            onClose={() => setSelectedStepId(undefined)}
          />
        )}
      </div>

      <StepTypePickerDialog
        open={stepPickerOpen}
        onOpenChange={setStepPickerOpen}
        onSelect={handleStepTypeSelect}
        onSelectCondition={allowCondition ? handleConditionSelect : undefined}
        conditionStepType={
          conditionAnchorStep
            ? stepTypeKeyFor(
                conditionAnchorStep.channel,
                conditionAnchorStep.linkedinAction,
                conditionAnchorStep.whatsappAction
              )
            : undefined
        }
      />
    </Page>
  )
}

/* ------------------------------ step detail panel --------------------------- */
// A trimmed version of CampaignDetail's step editor — channel, timing,
// content, forks, manual-task assignment, and voice notes, but without the
// campaign-only surfaces (variable insertion, template/prompt shortcuts,
// sender avatar, delivery stats) that don't apply outside a real campaign.
// See the file footer for the full list of intentional differences.
function StepDetailPanel({
  step,
  steps,
  c,
  locale,
  onUpdate,
  onMove,
  onDelete,
  onClose,
}: {
  step: CampaignStep
  steps: CampaignStep[]
  c: Copy
  locale: import("@/lib/locale").Locale
  onUpdate: (patch: Partial<CampaignStep>) => void
  onMove: (dir: -1 | 1) => void
  onDelete: () => void
  onClose: () => void
}) {
  const { list: stepList, index: i } = locateCampaignStep(steps, step.id)
  const isParallelStep = steps.some((s) => s.parallelSteps?.some((p) => p.id === step.id))
  const meta = channelMeta(step.channel)
  const channel = normalizeChannel(step.channel)
  const isEmail = channel === "email"
  const isAiCall = channel === "ai_call"
  const isLinkedIn = ["linkedin_message", "linkedin_dm", "linkedin_inmail"].includes(channel)
  const isWhatsApp = channel === "whatsapp"
  const linkedinAction = step.linkedinAction ?? "message"
  const whatsappAction = step.whatsappAction ?? "message"
  const isVoiceMessage =
    (isLinkedIn && linkedinAction === "voice_message") ||
    (isWhatsApp && whatsappAction === "voice_message")
  const isLinkedInActionOnly =
    isLinkedIn && linkedinAction !== "message" && linkedinAction !== "voice_message"

  return (
    <Card className="w-full lg:w-[30rem] lg:shrink-0">
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", meta.tint)}>
            <meta.Icon className="size-4" />
          </span>
          <Select
            value={stepTypeKeyFor(channel, step.linkedinAction, step.whatsappAction)}
            onValueChange={(v) => {
              const picked = STEP_TYPES.find((t) => t.key === v)
              if (!picked) return
              onUpdate({
                channel: picked.channel,
                linkedinAction: picked.linkedinAction,
                whatsappAction: picked.whatsappAction,
                isManualTask: picked.channel === "manual",
              })
            }}
          >
            <SelectTrigger size="sm" className="min-w-0 flex-1" aria-label={c.stepChannelAria}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STEP_TYPES.map((type) => {
                const typeMeta = channelMeta(type.channel)
                return (
                  <SelectItem key={type.key} value={type.key}>
                    <span className="flex items-center gap-2">
                      <typeMeta.Icon className="size-3.5" />
                      {stepTypeLabel(locale, type.key)}
                    </span>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label={c.moveStepUp}
              disabled={i === 0}
              className="size-8"
              onClick={() => onMove(-1)}
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={c.moveStepDown}
              disabled={i === stepList.length - 1}
              className="size-8"
              onClick={() => onMove(1)}
            >
              <ArrowDown className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={c.removeStep}
              className="text-muted-foreground hover:text-destructive size-8"
              onClick={onDelete}
            >
              <Trash2 className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label={c.closePanel} className="size-8" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {isParallelStep ? (
          <p className="text-muted-foreground text-sm">{c.parallelStepNote}</p>
        ) : (
          <TimeDelayField step={step} onChange={onUpdate} c={c} />
        )}

        {step.isManualTask && (
          <div className="bg-muted/40 flex items-center gap-2.5 rounded-lg border p-2.5">
            <span className="text-muted-foreground min-w-0 flex-1 text-sm">{c.manualTaskAssignee}</span>
            <AssigneePicker
              className="w-56"
              value={step.assigneeId}
              onChange={(assigneeId) => onUpdate({ assigneeId })}
            />
          </div>
        )}

        {step.fork && (
          <div className="bg-muted/40 space-y-2 rounded-lg border p-2.5">
            <div className="flex items-center gap-2.5">
              <GitFork className="text-muted-foreground size-4 shrink-0" />
              <p className="text-muted-foreground min-w-0 flex-1 text-sm">
                {c.conditionActiveLabel(c.conditionName[step.fork.condition])}
              </p>
              <Button variant="ghost" size="sm" onClick={() => onUpdate({ fork: undefined })}>
                {c.removeCondition}
              </Button>
            </div>
            {step.fork.condition === "accept" && (
              <div className="space-y-1 pl-[26px]">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">{c.withinDaysLabel}</span>
                  <Input
                    type="number"
                    min={1}
                    value={String(step.fork.withinDays ?? 4)}
                    onChange={(e) => {
                      const n = Math.max(1, Math.round(Number(e.target.value)) || 1)
                      onUpdate({ fork: { ...step.fork!, withinDays: n } })
                    }}
                    clearable={false}
                    className="h-8 w-16 tabular-nums"
                  />
                  <span className="text-muted-foreground text-sm">{c.withinDaysSuffix}</span>
                </div>
                <p className="text-muted-foreground text-xs">{c.withinDaysHint}</p>
              </div>
            )}
          </div>
        )}

        {isVoiceMessage ? (
          <VoiceMessageRecorder
            recordingUrl={step.voiceRecordingUrl}
            durationSec={step.voiceDurationSec}
            onRecorded={(url, durationSec) => onUpdate({ voiceRecordingUrl: url, voiceDurationSec: durationSec })}
            onDelete={() => onUpdate({ voiceRecordingUrl: undefined, voiceDurationSec: undefined })}
          />
        ) : isLinkedInActionOnly ? (
          <p className="text-muted-foreground text-sm">{c.linkedinActionDescription[linkedinAction]}</p>
        ) : step.isManualTask ? (
          <>
            <Input
              value={step.subject ?? ""}
              placeholder={c.taskTitlePlaceholder}
              onChange={(e) => onUpdate({ subject: e.target.value })}
            />
            <RichTextEditor
              value={step.body}
              onChange={(html) => onUpdate({ body: html })}
              placeholder={c.taskNotesPlaceholder}
              minHeight="min-h-24"
            />
          </>
        ) : isAiCall ? (
          <Textarea
            value={step.body}
            placeholder={c.aiScriptPlaceholder}
            onChange={(e) => onUpdate({ body: e.target.value })}
            className="min-h-32"
          />
        ) : (
          <>
            {isEmail && (
              <Input
                value={step.subject ?? ""}
                placeholder={c.subjectLine}
                onChange={(e) => onUpdate({ subject: e.target.value })}
              />
            )}
            <RichTextEditor
              value={step.body}
              onChange={(html) => onUpdate({ body: html })}
              placeholder={c.messageBody}
              ariaLabel={c.messageBody}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

// A step's send timing: immediate, or delayed by N days. Same field as
// CampaignDetail's TimeDelayField, reproduced locally rather than exported
// from that page — CampaignDetail's version reads from that page's own
// COPY dict, which isn't exported.
function TimeDelayField({
  step,
  onChange,
  c,
}: {
  step: CampaignStep
  onChange: (patch: Partial<CampaignStep>) => void
  c: Copy
}) {
  const [text, setText] = React.useState(String(step.delayDays || ""))

  function commit(raw: string) {
    onChange({ delayDays: Math.max(1, Math.round(Number(raw)) || 1) })
  }

  return (
    <div className="space-y-2">
      <span className="text-muted-foreground text-sm">{c.timeDelay}</span>
      <Segmented
        options={[
          { v: "immediate", label: c.sendImmediately, icon: Zap },
          { v: "delay", label: c.delayByDays, icon: CalendarClock },
        ]}
        value={step.delayDays > 0 ? "delay" : "immediate"}
        onChange={(v) => {
          if (v === "immediate") {
            setText("")
            onChange({ delayDays: 0 })
          } else {
            const n = step.delayDays > 0 ? step.delayDays : 1
            setText(String(n))
            onChange({ delayDays: n })
          }
        }}
      />
      {step.delayDays > 0 && (
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              type="number"
              min={1}
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                if (e.target.value !== "") commit(e.target.value)
              }}
              onBlur={() => commit(text)}
              clearable={false}
              className="h-8 w-24 pr-7 tabular-nums"
            />
            <button
              type="button"
              tabIndex={-1}
              aria-label={c.clearDelay}
              onClick={() => {
                setText("")
                onChange({ delayDays: 0 })
              }}
              className="text-muted-foreground hover:text-foreground hover:bg-muted absolute top-1/2 right-1 flex size-6 -translate-y-1/2 items-center justify-center rounded-md transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <span className="text-muted-foreground text-sm">{c.daysBeforeSending}</span>
        </div>
      )}
    </div>
  )
}

// --- Intentional differences from CampaignDetail's Sequence tab ---
// This page reuses the real SequenceCanvas + StepTypePickerDialog +
// useSequenceDraft — the same parallel-step (CampaignStep/parallelSteps)
// model and mutators CampaignDetail uses, which was the point of this
// consolidation. What's deliberately NOT reproduced here, because it's
// either campaign-specific or a large, separately-scoped chunk of UI:
//   - Insert-variable menu (needs the campaign merge-var catalog)
//   - "Use a template" / "Use a prompt" quick-start shortcuts in the step
//     picker, and AI-prompt-driven (regenerated-per-recipient) steps
//   - The "already has a LinkedIn connect step" confirmation dialog (a
//     second connect pick here just inserts as a plain step, same as any
//     other repeat channel pick, instead of warning first)
//   - Nesting a condition inside a track that descends from an
//     accept-fork (conditions here are top-level only)
//   - Sender-account avatar on cards, and campaign-only "Copy sequence
//     from" / "Save as template" actions
//   - AI-call voice/agent pickers and retry-cadence controls (new ai_call
//     steps keep their code default voice/agent)
//   - The mocked sent/opened/replied stats block, which is derived from
//     campaign.enrolled and has no meaning for an un-enrolled sequence
// A brand-new sequence has no backing store to persist into yet (the old
// SequenceBuilder page had the same gap — Save just toasted and navigated
// back without writing anywhere); this page's Save behaves identically.
