// Per-call-type analysis profiles for recorded calls. The AI classifies each
// recording into one of these types, and the type decides what the analysis
// scores, how the summary is framed, and how the follow-up draft opens.
// Changing a recording's type therefore requires re-analysis (see
// CoachRecordingDetail's confirm dialog).
import type { CallType } from "./types"

interface Localized {
  en: string
  es: string
}

interface LocalizedList {
  en: string[]
  es: string[]
}

export interface CallTypeMeta {
  label: Localized
  // What this type's analysis pays attention to — shown on the Analysis tab.
  focus: LocalizedList
  // One-line framing that leads the Summary tab.
  summaryLens: Localized
  // Type-specific first line of the AI follow-up draft ({{company}} is merged).
  followUpOpener: Localized
}

// Funnel order, matching where each call type sits in a deal.
export const CALL_TYPES: CallType[] = [
  "Intro",
  "Discovery",
  "Demo",
  "Negotiation",
  "Follow-up",
]

export const CALL_TYPE_META: Record<CallType, CallTypeMeta> = {
  Intro: {
    label: { en: "Intro", es: "Presentación" },
    focus: {
      en: ["Rapport & credibility", "Qualifying fit", "Next meeting secured"],
      es: ["Conexión y credibilidad", "Encaje del prospecto", "Próxima reunión agendada"],
    },
    summaryLens: {
      en: "Intro-call analysis — scored on rapport, qualification, and whether a next step was locked in.",
      es: "Análisis de llamada de presentación — evalúa la conexión, la cualificación y si se cerró un siguiente paso.",
    },
    followUpOpener: {
      en: "Great connecting for the first time today — really enjoyed learning about {{company}}.",
      es: "Un placer conocernos hoy — me encantó saber más sobre {{company}}.",
    },
  },
  Discovery: {
    label: { en: "Discovery", es: "Descubrimiento" },
    focus: {
      en: ["Question quality & depth", "Pain and impact uncovered", "Stakeholders mapped", "Next step booked"],
      es: ["Calidad y profundidad de preguntas", "Dolores e impacto detectados", "Mapa de interlocutores", "Siguiente paso agendado"],
    },
    summaryLens: {
      en: "Discovery analysis — scored on question depth, the pain uncovered, and how well stakeholders were mapped.",
      es: "Análisis de descubrimiento — evalúa la profundidad de las preguntas, los dolores detectados y el mapa de interlocutores.",
    },
    followUpOpener: {
      en: "Thanks for walking me through how the team at {{company}} works today.",
      es: "Gracias por contarme cómo trabaja hoy el equipo de {{company}}.",
    },
  },
  Demo: {
    label: { en: "Demo", es: "Demo" },
    focus: {
      en: ["Feature-to-pain mapping", "Prospect engagement", "Objections surfaced", "Concrete follow-up"],
      es: ["Funcionalidades ligadas a dolores", "Implicación del prospecto", "Objeciones detectadas", "Seguimiento concreto"],
    },
    summaryLens: {
      en: "Demo analysis — scored on tying features to the prospect's pains and keeping them engaged throughout.",
      es: "Análisis de demo — evalúa cómo se ligaron las funcionalidades a los dolores del prospecto y su implicación durante la sesión.",
    },
    followUpOpener: {
      en: "Glad we could show you the product in action today — hope it made things concrete for {{company}}.",
      es: "Me alegra haberte enseñado el producto en acción — espero que lo haya aterrizado bien para {{company}}.",
    },
  },
  Negotiation: {
    label: { en: "Negotiation", es: "Negociación" },
    focus: {
      en: ["Pricing & terms handling", "Concession strategy", "Decision process clarity", "Close plan"],
      es: ["Gestión de precio y condiciones", "Estrategia de concesiones", "Claridad del proceso de decisión", "Plan de cierre"],
    },
    summaryLens: {
      en: "Negotiation analysis — scored on terms handling, concession strategy, and how clear the close plan is.",
      es: "Análisis de negociación — evalúa la gestión de condiciones, las concesiones y la claridad del plan de cierre.",
    },
    followUpOpener: {
      en: "Thanks for working through the details with me today — I think we're close to something that works for {{company}}.",
      es: "Gracias por revisar los detalles conmigo — creo que estamos cerca de algo que funcione para {{company}}.",
    },
  },
  "Follow-up": {
    label: { en: "Follow-up", es: "Seguimiento" },
    focus: {
      en: ["Momentum since last call", "Open action items", "New blockers", "Timeline confirmation"],
      es: ["Avance desde la última llamada", "Acciones pendientes", "Nuevos bloqueos", "Confirmación de plazos"],
    },
    summaryLens: {
      en: "Follow-up analysis — scored on momentum, open action items, and whether the timeline was reconfirmed.",
      es: "Análisis de seguimiento — evalúa el avance, las acciones pendientes y si se reconfirmaron los plazos.",
    },
    followUpOpener: {
      en: "Good to reconnect today and hear how things have moved at {{company}}.",
      es: "Qué bien retomar la conversación y saber cómo avanza todo en {{company}}.",
    },
  },
}
