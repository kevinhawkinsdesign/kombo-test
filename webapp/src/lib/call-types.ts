// Per-call-type analysis profiles for recorded calls. The AI classifies each
// recording into one of these types, and the type decides what the analysis
// scores, how the summary is framed, and how the follow-up draft opens.
// Changing a recording's type therefore requires re-analysis (see
// CoachRecordingDetail's confirm dialog).
import type { CallType } from "./types"

interface Localized {
  en: string
  es: string
  it: string
  fr: string
  de: string
  pt: string
  pt_BR: string
}

interface LocalizedList {
  en: string[]
  es: string[]
  it: string[]
  fr: string[]
  de: string[]
  pt: string[]
  pt_BR: string[]
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
    label: {
      en: "Intro",
      es: "Presentación",
      it: "Presentazione",
      fr: "Prise de contact",
      de: "Erstgespräch",
      pt: "Apresentação",
      pt_BR: "Apresentação",
    },
    focus: {
      en: ["Rapport & credibility", "Qualifying fit", "Next meeting secured"],
      es: ["Conexión y credibilidad", "Encaje del prospecto", "Próxima reunión agendada"],
      it: ["Rapport e credibilità", "Fit del prospect", "Prossima riunione fissata"],
      fr: ["Relationnel et crédibilité", "Adéquation du prospect", "Prochain rendez-vous obtenu"],
      de: ["Rapport und Glaubwürdigkeit", "Fit-Qualifizierung", "Nächstes Meeting gesichert"],
      pt: ["Relação e credibilidade", "Adequação do prospect", "Próxima reunião marcada"],
      pt_BR: ["Rapport e credibilidade", "Fit do prospect", "Próxima reunião agendada"],
    },
    summaryLens: {
      en: "Intro-call analysis — scored on rapport, qualification, and whether a next step was locked in.",
      es: "Análisis de llamada de presentación — evalúa la conexión, la cualificación y si se cerró un siguiente paso.",
      it: "Analisi della chiamata di presentazione — valuta il rapport, la qualificazione e se è stato fissato un passo successivo.",
      fr: "Analyse de la prise de contact — évalue le relationnel, la qualification et si une prochaine étape a été verrouillée.",
      de: "Analyse des Erstgesprächs — bewertet Rapport, Qualifizierung und ob ein nächster Schritt fixiert wurde.",
      pt: "Análise da chamada de apresentação — avalia a relação, a qualificação e se ficou fechado um próximo passo.",
      pt_BR: "Análise da ligação de apresentação — avalia o rapport, a qualificação e se um próximo passo foi definido.",
    },
    followUpOpener: {
      en: "Great connecting for the first time today — really enjoyed learning about {{company}}.",
      es: "Un placer conocernos hoy — me encantó saber más sobre {{company}}.",
      it: "È stato un piacere conoscerci oggi — mi è piaciuto molto scoprire di più su {{company}}.",
      fr: "Ravi d'avoir fait connaissance aujourd'hui — j'ai beaucoup apprécié d'en apprendre plus sur {{company}}.",
      de: "Schön, dass wir uns heute zum ersten Mal ausgetauscht haben — es war spannend, mehr über {{company}} zu erfahren.",
      pt: "Foi um prazer conhecermo-nos hoje — gostei muito de saber mais sobre a {{company}}.",
      pt_BR: "Foi um prazer nos conhecermos hoje — adorei saber mais sobre a {{company}}.",
    },
  },
  Discovery: {
    label: {
      en: "Discovery",
      es: "Descubrimiento",
      it: "Discovery",
      fr: "Découverte",
      de: "Discovery",
      pt: "Descoberta",
      pt_BR: "Descoberta",
    },
    focus: {
      en: ["Question quality & depth", "Pain and impact uncovered", "Stakeholders mapped", "Next step booked"],
      es: ["Calidad y profundidad de preguntas", "Dolores e impacto detectados", "Mapa de interlocutores", "Siguiente paso agendado"],
      it: ["Qualità e profondità delle domande", "Criticità e impatto emersi", "Stakeholder mappati", "Passo successivo fissato"],
      fr: ["Qualité et profondeur des questions", "Difficultés et impact identifiés", "Parties prenantes cartographiées", "Prochaine étape planifiée"],
      de: ["Qualität und Tiefe der Fragen", "Pain Points und Auswirkungen aufgedeckt", "Stakeholder erfasst", "Nächster Schritt vereinbart"],
      pt: ["Qualidade e profundidade das perguntas", "Dores e impacto identificados", "Mapa de stakeholders", "Próximo passo marcado"],
      pt_BR: ["Qualidade e profundidade das perguntas", "Dores e impacto identificados", "Stakeholders mapeados", "Próximo passo agendado"],
    },
    summaryLens: {
      en: "Discovery analysis — scored on question depth, the pain uncovered, and how well stakeholders were mapped.",
      es: "Análisis de descubrimiento — evalúa la profundidad de las preguntas, los dolores detectados y el mapa de interlocutores.",
      it: "Analisi di discovery — valuta la profondità delle domande, le criticità emerse e la mappatura degli stakeholder.",
      fr: "Analyse de découverte — évalue la profondeur des questions, les difficultés identifiées et la cartographie des parties prenantes.",
      de: "Discovery-Analyse — bewertet die Tiefe der Fragen, die aufgedeckten Pain Points und wie gut Stakeholder erfasst wurden.",
      pt: "Análise de descoberta — avalia a profundidade das perguntas, as dores identificadas e o mapa de stakeholders.",
      pt_BR: "Análise de descoberta — avalia a profundidade das perguntas, as dores identificadas e o mapeamento dos stakeholders.",
    },
    followUpOpener: {
      en: "Thanks for walking me through how the team at {{company}} works today.",
      es: "Gracias por contarme cómo trabaja hoy el equipo de {{company}}.",
      it: "Grazie per avermi raccontato come lavora oggi il team di {{company}}.",
      fr: "Merci de m'avoir expliqué comment l'équipe de {{company}} travaille aujourd'hui.",
      de: "Danke, dass du mir gezeigt hast, wie das Team bei {{company}} heute arbeitet.",
      pt: "Obrigado por me explicar como a equipa da {{company}} trabalha hoje.",
      pt_BR: "Obrigado por me contar como o time da {{company}} trabalha hoje.",
    },
  },
  Demo: {
    label: {
      en: "Demo",
      es: "Demo",
      it: "Demo",
      fr: "Démo",
      de: "Demo",
      pt: "Demo",
      pt_BR: "Demo",
    },
    focus: {
      en: ["Feature-to-pain mapping", "Prospect engagement", "Objections surfaced", "Concrete follow-up"],
      es: ["Funcionalidades ligadas a dolores", "Implicación del prospecto", "Objeciones detectadas", "Seguimiento concreto"],
      it: ["Funzionalità collegate alle criticità", "Coinvolgimento del prospect", "Obiezioni emerse", "Follow-up concreto"],
      fr: ["Fonctionnalités reliées aux difficultés", "Engagement du prospect", "Objections identifiées", "Suivi concret"],
      de: ["Features auf Pain Points gemappt", "Engagement des Prospects", "Einwände aufgedeckt", "Konkretes Follow-up"],
      pt: ["Funcionalidades ligadas às dores", "Envolvimento do prospect", "Objeções identificadas", "Seguimento concreto"],
      pt_BR: ["Funcionalidades ligadas às dores", "Engajamento do prospect", "Objeções levantadas", "Follow-up concreto"],
    },
    summaryLens: {
      en: "Demo analysis — scored on tying features to the prospect's pains and keeping them engaged throughout.",
      es: "Análisis de demo — evalúa cómo se ligaron las funcionalidades a los dolores del prospecto y su implicación durante la sesión.",
      it: "Analisi della demo — valuta come le funzionalità sono state collegate alle criticità del prospect e il suo coinvolgimento durante la sessione.",
      fr: "Analyse de la démo — évalue la façon dont les fonctionnalités ont été reliées aux difficultés du prospect et son engagement tout au long de la session.",
      de: "Demo-Analyse — bewertet, wie gut Features mit den Pain Points des Prospects verknüpft wurden und wie engagiert er durchgehend blieb.",
      pt: "Análise da demo — avalia como as funcionalidades foram ligadas às dores do prospect e o seu envolvimento ao longo da sessão.",
      pt_BR: "Análise da demo — avalia como as funcionalidades foram ligadas às dores do prospect e o engajamento dele durante a sessão.",
    },
    followUpOpener: {
      en: "Glad we could show you the product in action today — hope it made things concrete for {{company}}.",
      es: "Me alegra haberte enseñado el producto en acción — espero que lo haya aterrizado bien para {{company}}.",
      it: "Sono contento di averti mostrato il prodotto in azione oggi — spero abbia reso tutto più concreto per {{company}}.",
      fr: "Ravi d'avoir pu vous montrer le produit en action aujourd'hui — j'espère que cela a rendu les choses concrètes pour {{company}}.",
      de: "Schön, dass wir dir das Produkt heute live zeigen konnten — ich hoffe, es hat die Dinge für {{company}} greifbar gemacht.",
      pt: "Fico contente por lhe termos mostrado o produto em ação hoje — espero que tenha tornado tudo mais concreto para a {{company}}.",
      pt_BR: "Que bom que pudemos mostrar o produto em ação hoje — espero que tenha deixado tudo mais concreto para a {{company}}.",
    },
  },
  Negotiation: {
    label: {
      en: "Negotiation",
      es: "Negociación",
      it: "Negoziazione",
      fr: "Négociation",
      de: "Verhandlung",
      pt: "Negociação",
      pt_BR: "Negociação",
    },
    focus: {
      en: ["Pricing & terms handling", "Concession strategy", "Decision process clarity", "Close plan"],
      es: ["Gestión de precio y condiciones", "Estrategia de concesiones", "Claridad del proceso de decisión", "Plan de cierre"],
      it: ["Gestione di prezzo e condizioni", "Strategia delle concessioni", "Chiarezza del processo decisionale", "Piano di chiusura"],
      fr: ["Gestion du prix et des conditions", "Stratégie de concessions", "Clarté du processus de décision", "Plan de closing"],
      de: ["Umgang mit Preis und Konditionen", "Zugeständnis-Strategie", "Klarheit im Entscheidungsprozess", "Abschlussplan"],
      pt: ["Gestão de preço e condições", "Estratégia de concessões", "Clareza do processo de decisão", "Plano de fecho"],
      pt_BR: ["Gestão de preço e condições", "Estratégia de concessões", "Clareza do processo de decisão", "Plano de fechamento"],
    },
    summaryLens: {
      en: "Negotiation analysis — scored on terms handling, concession strategy, and how clear the close plan is.",
      es: "Análisis de negociación — evalúa la gestión de condiciones, las concesiones y la claridad del plan de cierre.",
      it: "Analisi della negoziazione — valuta la gestione delle condizioni, le concessioni e la chiarezza del piano di chiusura.",
      fr: "Analyse de la négociation — évalue la gestion des conditions, la stratégie de concessions et la clarté du plan de closing.",
      de: "Verhandlungsanalyse — bewertet den Umgang mit Konditionen, die Zugeständnis-Strategie und wie klar der Abschlussplan ist.",
      pt: "Análise da negociação — avalia a gestão das condições, as concessões e a clareza do plano de fecho.",
      pt_BR: "Análise da negociação — avalia a gestão das condições, as concessões e a clareza do plano de fechamento.",
    },
    followUpOpener: {
      en: "Thanks for working through the details with me today — I think we're close to something that works for {{company}}.",
      es: "Gracias por revisar los detalles conmigo — creo que estamos cerca de algo que funcione para {{company}}.",
      it: "Grazie per aver rivisto i dettagli con me oggi — credo che siamo vicini a qualcosa che funzioni per {{company}}.",
      fr: "Merci d'avoir passé en revue les détails avec moi aujourd'hui — je pense que nous sommes proches d'une solution qui convient à {{company}}.",
      de: "Danke, dass du die Details heute mit mir durchgegangen bist — ich glaube, wir sind nah an etwas, das für {{company}} funktioniert.",
      pt: "Obrigado por rever os detalhes comigo hoje — acho que estamos perto de algo que funcione para a {{company}}.",
      pt_BR: "Obrigado por revisar os detalhes comigo hoje — acho que estamos perto de algo que funcione para a {{company}}.",
    },
  },
  "Follow-up": {
    label: {
      en: "Follow-up",
      es: "Seguimiento",
      it: "Follow-up",
      fr: "Suivi",
      de: "Follow-up",
      pt: "Seguimento",
      pt_BR: "Follow-up",
    },
    focus: {
      en: ["Momentum since last call", "Open action items", "New blockers", "Timeline confirmation"],
      es: ["Avance desde la última llamada", "Acciones pendientes", "Nuevos bloqueos", "Confirmación de plazos"],
      it: ["Avanzamento dall'ultima chiamata", "Azioni aperte", "Nuovi blocchi", "Conferma delle tempistiche"],
      fr: ["Avancement depuis le dernier appel", "Actions en cours", "Nouveaux blocages", "Confirmation du calendrier"],
      de: ["Momentum seit dem letzten Call", "Offene Aufgaben", "Neue Blocker", "Bestätigung des Zeitplans"],
      pt: ["Progresso desde a última chamada", "Ações pendentes", "Novos bloqueios", "Confirmação de prazos"],
      pt_BR: ["Progresso desde a última ligação", "Ações pendentes", "Novos bloqueios", "Confirmação de prazos"],
    },
    summaryLens: {
      en: "Follow-up analysis — scored on momentum, open action items, and whether the timeline was reconfirmed.",
      es: "Análisis de seguimiento — evalúa el avance, las acciones pendientes y si se reconfirmaron los plazos.",
      it: "Analisi di follow-up — valuta l'avanzamento, le azioni aperte e se le tempistiche sono state riconfermate.",
      fr: "Analyse de suivi — évalue l'avancement, les actions en cours et si le calendrier a été reconfirmé.",
      de: "Follow-up-Analyse — bewertet das Momentum, offene Aufgaben und ob der Zeitplan erneut bestätigt wurde.",
      pt: "Análise de seguimento — avalia o progresso, as ações pendentes e se os prazos foram reconfirmados.",
      pt_BR: "Análise de follow-up — avalia o progresso, as ações pendentes e se os prazos foram reconfirmados.",
    },
    followUpOpener: {
      en: "Good to reconnect today and hear how things have moved at {{company}}.",
      es: "Qué bien retomar la conversación y saber cómo avanza todo en {{company}}.",
      it: "È stato bello risentirci oggi e sapere come stanno procedendo le cose in {{company}}.",
      fr: "Content d'avoir pu refaire le point aujourd'hui et d'entendre comment les choses avancent chez {{company}}.",
      de: "Schön, dass wir heute wieder gesprochen haben und ich hören konnte, wie es bei {{company}} vorangeht.",
      pt: "Foi bom retomar a conversa hoje e saber como as coisas têm avançado na {{company}}.",
      pt_BR: "Foi bom retomar a conversa hoje e saber como as coisas avançaram na {{company}}.",
    },
  },
}
