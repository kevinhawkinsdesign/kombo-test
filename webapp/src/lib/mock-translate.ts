// A lightweight, offline EN<->ES translator for the inbox demo. It does a
// phrase-first then word-level substitution so typed sales messages come out
// believably translated. Not a real MT engine — good enough to demo a
// multilingual chat where both sides write in their own language.

import type { ChatLang } from "./types"

export const LANG_LABEL: Record<ChatLang, string> = {
  en: "English",
  es: "Español",
}
export const LANG_FLAG: Record<ChatLang, string> = {
  en: "🇬🇧",
  es: "🇪🇸",
}

// Multi-word phrases are replaced before single words (longest first).
const PHRASES_EN_ES: [string, string][] = [
  ["looking forward", "con muchas ganas"],
  ["follow up", "hacer seguimiento"],
  ["follow-up", "seguimiento"],
  ["next steps", "próximos pasos"],
  ["next week", "la próxima semana"],
  ["this week", "esta semana"],
  ["let me know", "avísame"],
  ["does that work", "te viene bien"],
  ["sounds good", "me parece bien"],
  ["thank you", "gracias"],
  ["talk soon", "hablamos pronto"],
  ["best regards", "un saludo"],
  ["sales team", "equipo de ventas"],
  ["a quick call", "una llamada rápida"],
  ["a demo", "una demo"],
  ["the demo", "la demo"],
  ["a meeting", "una reunión"],
]

const WORDS_EN_ES: Record<string, string> = {
  hi: "hola",
  hello: "hola",
  hey: "hola",
  thanks: "gracias",
  yes: "sí",
  no: "no",
  please: "por favor",
  meeting: "reunión",
  demo: "demo",
  call: "llamada",
  schedule: "agendar",
  book: "agendar",
  pricing: "precios",
  price: "precio",
  team: "equipo",
  week: "semana",
  day: "día",
  days: "días",
  time: "hora",
  today: "hoy",
  tomorrow: "mañana",
  morning: "mañana",
  afternoon: "tarde",
  available: "disponible",
  free: "libre",
  interested: "interesado",
  great: "genial",
  good: "bueno",
  thanks_for: "gracias por",
  the: "el",
  and: "y",
  with: "con",
  for: "para",
  your: "tu",
  our: "nuestro",
  we: "nosotros",
  you: "tú",
  i: "yo",
  to: "a",
  on: "en",
  at: "a las",
  is: "es",
  are: "son",
  can: "puedo",
  could: "podría",
  would: "podría",
  works: "funciona",
  work: "funciona",
  send: "enviar",
  sent: "enviado",
  reply: "responder",
  question: "pregunta",
  questions: "preguntas",
  quick: "rápida",
  link: "enlace",
  let: "deja",
  know: "saber",
  about: "sobre",
  outbound: "outbound",
  pipeline: "pipeline",
  quarter: "trimestre",
}

function invert(map: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(map)) if (!out[v]) out[v] = k
  return out
}
const WORDS_ES_EN = invert(WORDS_EN_ES)
const PHRASES_ES_EN: [string, string][] = PHRASES_EN_ES.map(([en, es]) => [es, en])

const ES_HINTS = [
  "hola", "gracias", "reunión", "mañana", "precio", "equipo", "semana",
  "disponible", "podría", "saludo", "próxim", "está", "qué", "sí", "para",
  "una", "nuestro", "podemos", "encantaría",
]

export function detectLang(text: string): ChatLang {
  const lower = text.toLowerCase()
  if (/[áéíóúñ¿¡]/.test(lower)) return "es"
  const hits = ES_HINTS.filter((w) => lower.includes(w)).length
  return hits >= 2 ? "es" : "en"
}

function applyCase(source: string, translated: string): string {
  if (source[0] && source[0] === source[0].toUpperCase()) {
    return translated.charAt(0).toUpperCase() + translated.slice(1)
  }
  return translated
}

export function translate(text: string, to: ChatLang): string {
  const from: ChatLang = detectLang(text)
  if (from === to || !text.trim()) return text

  const phrases = to === "es" ? PHRASES_EN_ES : PHRASES_ES_EN
  const words = to === "es" ? WORDS_EN_ES : WORDS_ES_EN

  let result = text
  // Phrase pass (case-insensitive, keep it simple).
  for (const [src, dst] of [...phrases].sort((a, b) => b[0].length - a[0].length)) {
    const re = new RegExp(src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
    result = result.replace(re, (m) => applyCase(m, dst))
  }
  // Word pass.
  result = result.replace(/\b[\wáéíóúñ]+\b/gi, (token) => {
    const key = token.toLowerCase()
    const hit = words[key]
    return hit ? applyCase(token, hit) : token
  })
  return result
}
