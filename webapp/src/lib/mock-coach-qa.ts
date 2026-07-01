// Scripted Q&A for the "Ask about this call" panel. Prototype-only: canned,
// on-topic answers per recording so the demo feels real without a backend.

import type { Locale } from "@/lib/locale"

export interface CoachQaPair {
  q: string
  a: string
}

const QA_EN: Record<string, CoachQaPair[]> = {
  r_1: [
    { q: "Why did next steps score low?", a: "You closed with \"I'll send some info over\" instead of proposing concrete times. No meeting was booked, so momentum will decay within a week — that's the single biggest deal risk on this call." },
    { q: "What should I have asked about budget?", a: "Nothing surfaced who owns the budget or when their fiscal cycle closes. A simple \"Who else weighs in on a decision like this, and when does your budget reset?\" would have de-risked sign-off." },
    { q: "What went well?", a: "Your opener was strong — referencing the Milan expansion earned an early yes, and you cited ROI timelines specific to their team size. Keep leading with researched, personalized hooks." },
    { q: "What's the biggest risk?", a: "No next meeting on the calendar and an unconfirmed budget owner. Send a calendar invite today and confirm authority before this stalls at sign-off." },
  ],
  r_2: [
    { q: "Why was the demo rated weak?", a: "It was a feature tour, not a story — reporting, dashboards, integrations, admin — none tied back to Marcus's forecasting-accuracy problem. Open the demo by restating his #1 pain and demo only to that." },
    { q: "How was my talk ratio?", a: "It ran high at 58%. You often answered your own \"does that make sense?\" Let silence do the work — pause after each key screen and let him react." },
    { q: "What was my best moment?", a: "The trial close: \"If we got the HubSpot sync live, what would need to be true for you to bring this to your VP?\" It surfaced the real decision criteria — do more of that, earlier." },
    { q: "What next step should I take?", a: "Send the ROI breakdown tied to forecasting accuracy and confirm who else needs to be in the room before the VP conversation." },
  ],
  r_3: [
    { q: "Where did this call go wrong?", a: "You led with the pitch — \"we're basically the best AI prospecting tool\" — before asking a single discovery question, and let a skeptical buyer disqualify himself on budget." },
    { q: "How should I have handled the budget objection?", a: "Treat \"no budget right now\" as a question about priority, not a hard no. Ask what \"right now\" means and what would make this a priority next quarter." },
    { q: "Was anything good here?", a: "Your value framing was quantified and team-size-specific — \"claws back about 8 hours a rep per week\" — it just landed after he'd already checked out. Lead with discovery so it lands earlier." },
    { q: "Can this deal be saved?", a: "Only with a reframe. There's no discovery to build an ROI case on, so re-engage with a specific, quantified hypothesis about his current outbound and earn a second look." },
  ],
}

const QA_ES: Record<string, CoachQaPair[]> = {
  r_1: [
    { q: "¿Por qué puntuaron bajo los próximos pasos?", a: "Cerraste con \"te envío información\" en vez de proponer horarios concretos. No se agendó ninguna reunión, así que el impulso se perderá en una semana: es el mayor riesgo de esta llamada." },
    { q: "¿Qué debí preguntar sobre el presupuesto?", a: "No quedó claro quién controla el presupuesto ni cuándo cierra su ciclo fiscal. Un simple \"¿quién más decide y cuándo se renueva el presupuesto?\" habría reducido el riesgo en la aprobación." },
    { q: "¿Qué salió bien?", a: "Tu apertura fue fuerte: mencionar la expansión en Milán logró un sí temprano, y citaste plazos de ROI específicos para su tamaño de equipo. Sigue con ganchos personalizados y bien investigados." },
    { q: "¿Cuál es el mayor riesgo?", a: "No hay próxima reunión en el calendario y no se confirmó quién aprueba el presupuesto. Envía una invitación hoy y confirma la autoridad antes de que se atasque." },
  ],
  r_2: [
    { q: "¿Por qué la demo se valoró como floja?", a: "Fue un recorrido de funciones, no una historia — informes, paneles, integraciones, admin — nada conectaba con su problema de precisión de forecast. Abre la demo replanteando su dolor principal y muestra solo eso." },
    { q: "¿Cómo estuvo mi ratio de conversación?", a: "Alto, al 58%. A menudo respondías tu propio \"¿tiene sentido?\". Deja que el silencio trabaje: haz una pausa tras cada pantalla clave y deja que reaccione." },
    { q: "¿Cuál fue mi mejor momento?", a: "El cierre de prueba: \"Si tuviéramos la sincronización con HubSpot en vivo, ¿qué tendría que ser cierto para llevarlo a tu VP?\" Reveló los criterios de decisión reales — haz más de eso, antes." },
    { q: "¿Qué próximo paso debo dar?", a: "Envía el desglose de ROI ligado a la precisión del forecast y confirma quién más debe estar antes de la conversación con el VP." },
  ],
  r_3: [
    { q: "¿Dónde falló esta llamada?", a: "Empezaste con el pitch — \"somos la mejor herramienta de prospección con IA\" — antes de una sola pregunta de descubrimiento, y dejaste que un comprador escéptico se descalificara por presupuesto." },
    { q: "¿Cómo debí manejar la objeción de presupuesto?", a: "Trata \"ahora no hay presupuesto\" como una pregunta de prioridad, no un no rotundo. Pregunta qué significa \"ahora\" y qué lo convertiría en prioridad el próximo trimestre." },
    { q: "¿Hubo algo bueno?", a: "Tu propuesta de valor fue cuantificada y específica — \"recupera unas 8 horas por rep a la semana\" — pero llegó cuando ya se había desconectado. Empieza con descubrimiento para que aterrice antes." },
    { q: "¿Se puede salvar este trato?", a: "Solo con un replanteo. No hay descubrimiento para construir un caso de ROI, así que vuelve con una hipótesis concreta y cuantificada sobre su outbound actual y gánate una segunda mirada." },
  ],
}

const FALLBACK_EN: CoachQaPair[] = [
  { q: "What went well on this call?", a: "Focus on the strengths in the scorecard above — lead with what earned positive grades and repeat it deliberately on your next call." },
  { q: "What's my biggest area to improve?", a: "Start with the lowest-scoring section in the scorecard. Fixing your weakest moment usually moves the overall score the most." },
  { q: "What should my next step be?", a: "Lock a concrete next action — ideally a booked meeting — before the call ends, and send it in writing the same day." },
]

const FALLBACK_ES: CoachQaPair[] = [
  { q: "¿Qué salió bien en esta llamada?", a: "Fíjate en las fortalezas del informe de arriba: apóyate en lo que obtuvo buenas notas y repítelo de forma deliberada en tu próxima llamada." },
  { q: "¿Cuál es mi mayor área de mejora?", a: "Empieza por la sección con menor puntuación del informe. Corregir tu momento más débil suele ser lo que más sube la nota global." },
  { q: "¿Cuál debería ser mi próximo paso?", a: "Fija una acción concreta — idealmente una reunión agendada — antes de que termine la llamada, y envíala por escrito el mismo día." },
]

const GENERIC = {
  en: "I can only speak to what's in this call's transcript and scorecard. Try one of the suggested questions, or ask about the opening, discovery, objections, talk ratio, or next steps.",
  es: "Solo puedo hablar de lo que está en la transcripción y el informe de esta llamada. Prueba una de las preguntas sugeridas, o pregunta por la apertura, el descubrimiento, las objeciones, el ratio de conversación o los próximos pasos.",
}

export function getCallQa(id: string, locale: Locale): CoachQaPair[] {
  const table = locale === "es" ? QA_ES : QA_EN
  const fallback = locale === "es" ? FALLBACK_ES : FALLBACK_EN
  return table[id] ?? fallback
}

export function genericAnswer(locale: Locale): string {
  return GENERIC[locale]
}
