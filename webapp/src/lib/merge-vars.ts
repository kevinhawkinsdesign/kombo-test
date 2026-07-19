// Shared {{merge_var}} substitution — resolves a template/prompt/sequence
// step's copy against a real Prospect's own data, so previews show what a
// specific recipient would actually receive instead of generic placeholders.
//
// This is the single tag vocabulary every variable picker in the app draws
// from (sequence steps, templates, and the inbox reply composer) so the same
// {{tag}} means the same thing everywhere it's offered.

import { currentUser } from "@/lib/mock-data"
import { valueProps } from "@/lib/mock-playbook"
import { relativeTime } from "@/lib/format"
import type { Prospect } from "@/lib/types"

export function mergeVars(text: string, data: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, tag: string) => data[tag] ?? `{{${tag}}}`)
}

export interface MergeVariable {
  tag: string
  en: string
  es: string
  it: string
  fr: string
  de: string
  pt: string
  pt_BR: string
}

// The tag set every merge-var picker in the app offers, kept in one place so
// "insert a variable" reads the same everywhere it appears.
export const MERGE_VARIABLES: MergeVariable[] = [
  { tag: "first_name", en: "First name", es: "Nombre", it: "Nome", fr: "Prénom", de: "Vorname", pt: "Nome", pt_BR: "Nome" },
  { tag: "last_name", en: "Last name", es: "Apellido", it: "Cognome", fr: "Nom", de: "Nachname", pt: "Apelido", pt_BR: "Sobrenome" },
  { tag: "full_name", en: "Full name", es: "Nombre completo", it: "Nome completo", fr: "Nom complet", de: "Vollständiger Name", pt: "Nome completo", pt_BR: "Nome completo" },
  { tag: "company", en: "Company", es: "Empresa", it: "Azienda", fr: "Entreprise", de: "Unternehmen", pt: "Empresa", pt_BR: "Empresa" },
  { tag: "title", en: "Job title", es: "Cargo", it: "Posizione", fr: "Intitulé de poste", de: "Jobtitel", pt: "Cargo", pt_BR: "Cargo" },
  { tag: "industry", en: "Industry", es: "Sector", it: "Settore", fr: "Secteur", de: "Branche", pt: "Setor", pt_BR: "Setor" },
  { tag: "city", en: "City", es: "Ciudad", it: "Città", fr: "Ville", de: "Stadt", pt: "Cidade", pt_BR: "Cidade" },
  { tag: "province", en: "Province", es: "Provincia", it: "Provincia", fr: "Province", de: "Provinz", pt: "Província", pt_BR: "Província" },
  { tag: "region", en: "Region", es: "Región", it: "Regione", fr: "Région", de: "Region", pt: "Região", pt_BR: "Região" },
  { tag: "country", en: "Country", es: "País", it: "Paese", fr: "Pays", de: "Land", pt: "País", pt_BR: "País" },
  { tag: "icebreaker", en: "Icebreaker", es: "Rompehielos", it: "Rompighiaccio", fr: "Amorce de conversation", de: "Eisbrecher", pt: "Quebra-gelo", pt_BR: "Quebra-gelo" },
  { tag: "pain_point", en: "Pain point", es: "Punto de dolor", it: "Punto critico", fr: "Point de douleur", de: "Schmerzpunkt", pt: "Ponto de dor", pt_BR: "Ponto de dor" },
  { tag: "linkedin_post", en: "LinkedIn post", es: "Publicación de LinkedIn", it: "Post di LinkedIn", fr: "Publication LinkedIn", de: "LinkedIn-Beitrag", pt: "Publicação no LinkedIn", pt_BR: "Post do LinkedIn" },
  { tag: "seniority", en: "Seniority", es: "Nivel de antigüedad", it: "Livello di seniority", fr: "Niveau d'ancienneté", de: "Senioritätsstufe", pt: "Nível de senioridade", pt_BR: "Nível de senioridade" },
  { tag: "department", en: "Department", es: "Departamento", it: "Reparto", fr: "Département", de: "Abteilung", pt: "Departamento", pt_BR: "Departamento" },
  { tag: "email", en: "Email", es: "Correo electrónico", it: "Email", fr: "E-mail", de: "E-Mail", pt: "E-mail", pt_BR: "E-mail" },
  { tag: "phone", en: "Phone", es: "Teléfono", it: "Telefono", fr: "Téléphone", de: "Telefon", pt: "Telefone", pt_BR: "Telefone" },
  { tag: "linkedin_url", en: "LinkedIn URL", es: "URL de LinkedIn", it: "URL LinkedIn", fr: "URL LinkedIn", de: "LinkedIn-URL", pt: "URL do LinkedIn", pt_BR: "URL do LinkedIn" },
  { tag: "founding_year", en: "Founding year", es: "Año de fundación", it: "Anno di fondazione", fr: "Année de création", de: "Gründungsjahr", pt: "Ano de fundação", pt_BR: "Ano de fundação" },
  { tag: "revenue", en: "Revenue", es: "Ingresos", it: "Fatturato", fr: "Chiffre d'affaires", de: "Umsatz", pt: "Receita", pt_BR: "Receita" },
  { tag: "top_traffic_country", en: "Country with highest traffic", es: "País con más tráfico", it: "Paese con più traffico", fr: "Pays au trafic le plus élevé", de: "Land mit dem meisten Traffic", pt: "País com mais tráfego", pt_BR: "País com mais tráfego" },
  { tag: "top_traffic_country_visits", en: "Monthly visits (top country)", es: "Visitas mensuales (país principal)", it: "Visite mensili (paese principale)", fr: "Visites mensuelles (pays principal)", de: "Monatliche Besuche (Top-Land)", pt: "Visitas mensais (país principal)", pt_BR: "Visitas mensais (país principal)" },
  { tag: "job_openings", en: "Job openings", es: "Vacantes abiertas", it: "Posizioni aperte", fr: "Postes ouverts", de: "Offene Stellen", pt: "Vagas em aberto", pt_BR: "Vagas em aberto" },
  { tag: "open_job_title", en: "Open job title", es: "Puesto vacante", it: "Posizione aperta", fr: "Intitulé du poste ouvert", de: "Offene Stelle", pt: "Cargo em aberto", pt_BR: "Cargo em aberto" },
  { tag: "headcount", en: "Company size", es: "Tamaño de la empresa", it: "Dimensione dell'azienda", fr: "Effectif de l'entreprise", de: "Unternehmensgröße", pt: "Dimensão da empresa", pt_BR: "Tamanho da empresa" },
  { tag: "office_count", en: "Number of offices", es: "Número de oficinas", it: "Numero di sedi", fr: "Nombre de bureaux", de: "Anzahl der Büros", pt: "Número de escritórios", pt_BR: "Número de escritórios" },
  { tag: "funding_amount", en: "Funding amount", es: "Monto de financiación", it: "Importo del finanziamento", fr: "Montant du financement", de: "Finanzierungsbetrag", pt: "Montante de financiamento", pt_BR: "Valor do investimento" },
  { tag: "latest_funding_date", en: "Latest funding date", es: "Fecha de la última financiación", it: "Data dell'ultimo finanziamento", fr: "Date du dernier financement", de: "Datum der letzten Finanzierung", pt: "Data do último financiamento", pt_BR: "Data do último investimento" },
  { tag: "latest_investor", en: "Latest investor", es: "Último inversor", it: "Ultimo investitore", fr: "Dernier investisseur", de: "Letzter Investor", pt: "Último investidor", pt_BR: "Último investidor" },
  { tag: "company_news", en: "Company news", es: "Noticias de la empresa", it: "Notizie aziendali", fr: "Actualités de l'entreprise", de: "Unternehmensnachrichten", pt: "Notícias da empresa", pt_BR: "Notícias da empresa" },
  { tag: "glassdoor_review", en: "Glassdoor review", es: "Reseña en Glassdoor", it: "Recensione su Glassdoor", fr: "Avis Glassdoor", de: "Glassdoor-Bewertung", pt: "Avaliação no Glassdoor", pt_BR: "Avaliação no Glassdoor" },
  { tag: "company_domain", en: "Company domain", es: "Dominio de la empresa", it: "Dominio aziendale", fr: "Domaine de l'entreprise", de: "Unternehmensdomain", pt: "Domínio da empresa", pt_BR: "Domínio da empresa" },
  { tag: "about", en: "About", es: "Acerca de", it: "Informazioni", fr: "À propos", de: "Über", pt: "Acerca de", pt_BR: "Sobre" },
  { tag: "signal_1", en: "Top signal", es: "Señal principal", it: "Segnale principale", fr: "Signal principal", de: "Wichtigstes Signal", pt: "Sinal principal", pt_BR: "Sinal principal" },
  { tag: "signal_2", en: "Second signal", es: "Segunda señal", it: "Secondo segnale", fr: "Deuxième signal", de: "Zweites Signal", pt: "Segundo sinal", pt_BR: "Segundo sinal" },
  { tag: "score", en: "Lead score", es: "Puntuación del lead", it: "Punteggio del lead", fr: "Score du prospect", de: "Lead-Score", pt: "Pontuação do lead", pt_BR: "Pontuação do lead" },
  { tag: "status", en: "Status", es: "Estado", it: "Stato", fr: "Statut", de: "Status", pt: "Estado", pt_BR: "Status" },
  { tag: "tags", en: "Tags", es: "Etiquetas", it: "Tag", fr: "Étiquettes", de: "Tags", pt: "Etiquetas", pt_BR: "Tags" },
  { tag: "last_activity", en: "Last activity", es: "Última actividad", it: "Ultima attività", fr: "Dernière activité", de: "Letzte Aktivität", pt: "Última atividade", pt_BR: "Última atividade" },
  { tag: "added_at", en: "Added", es: "Añadido", it: "Aggiunto", fr: "Ajouté", de: "Hinzugefügt", pt: "Adicionado", pt_BR: "Adicionado" },
  { tag: "sender", en: "Sender", es: "Remitente", it: "Mittente", fr: "Expéditeur", de: "Absender", pt: "Remetente", pt_BR: "Remetente" },
  { tag: "sender_first_name", en: "Your first name", es: "Tu nombre", it: "Il tuo nome", fr: "Votre prénom", de: "Dein Vorname", pt: "O seu primeiro nome", pt_BR: "Seu primeiro nome" },
  { tag: "sender_full_name", en: "Your full name", es: "Tu nombre completo", it: "Il tuo nome completo", fr: "Votre nom complet", de: "Dein vollständiger Name", pt: "O seu nome completo", pt_BR: "Seu nome completo" },
  { tag: "sender_email", en: "Your email", es: "Tu correo electrónico", it: "La tua email", fr: "Votre e-mail", de: "Deine E-Mail", pt: "O seu e-mail", pt_BR: "Seu e-mail" },
  { tag: "sender_company", en: "Your company", es: "Tu empresa", it: "La tua azienda", fr: "Votre entreprise", de: "Dein Unternehmen", pt: "A sua empresa", pt_BR: "Sua empresa" },
  { tag: "sender_title", en: "Your title", es: "Tu cargo", it: "La tua posizione", fr: "Votre poste", de: "Dein Jobtitel", pt: "O seu cargo", pt_BR: "Seu cargo" },
  { tag: "calendar_link", en: "Booking link", es: "Enlace de reserva", it: "Link di prenotazione", fr: "Lien de réservation", de: "Buchungslink", pt: "Link de marcação", pt_BR: "Link de agendamento" },
  { tag: "value_proposition", en: "Value proposition", es: "Propuesta de valor", it: "Proposta di valore", fr: "Proposition de valeur", de: "Wertversprechen", pt: "Proposta de valor", pt_BR: "Proposta de valor" },
  { tag: "day_of_week", en: "Day of the week", es: "Día de la semana", it: "Giorno della settimana", fr: "Jour de la semaine", de: "Wochentag", pt: "Dia da semana", pt_BR: "Dia da semana" },
]

// The groupings every variable picker in the app uses — the same "Your
// Details / Prospect Info / Prospect Company" taxonomy the Chrome extension
// uses, plus an "Activity" bucket for CRM/engagement fields (lead score,
// signals, last-activity) that only the inbox reply composer offers.
export type MergeVarGroupKey = "yourDetails" | "prospectInfo" | "prospectCompany" | "activity"

export const MERGE_VARIABLE_GROUPS: { key: MergeVarGroupKey; tags: string[] }[] = [
  {
    key: "yourDetails",
    tags: [
      "sender",
      "sender_first_name",
      "sender_full_name",
      "sender_email",
      "sender_company",
      "sender_title",
      "calendar_link",
      "value_proposition",
      "day_of_week",
    ],
  },
  {
    key: "prospectInfo",
    tags: [
      "first_name",
      "last_name",
      "full_name",
      "title",
      "city",
      "province",
      "region",
      "country",
      "icebreaker",
      "pain_point",
      "linkedin_post",
      "seniority",
      "department",
      "email",
      "phone",
      "linkedin_url",
    ],
  },
  {
    key: "prospectCompany",
    tags: [
      "company",
      "industry",
      "founding_year",
      "revenue",
      "top_traffic_country",
      "top_traffic_country_visits",
      "job_openings",
      "open_job_title",
      "headcount",
      "office_count",
      "funding_amount",
      "latest_funding_date",
      "latest_investor",
      "company_news",
      "glassdoor_review",
      "company_domain",
      "about",
    ],
  },
  { key: "activity", tags: ["signal_1", "signal_2", "score", "status", "tags", "last_activity", "added_at"] },
]

// A reusable template/sequence step is authored once and sent to many
// different prospects over time, so the live CRM/engagement fields in
// "activity" (lead score, signals, last-activity) don't make sense there —
// those only resolve meaningfully in the inbox composer, which replies to one
// real, current conversation. Templates and sequence steps get everything
// else.
export const TEMPLATE_MERGE_VARIABLE_GROUPS = MERGE_VARIABLE_GROUPS.filter(
  (g) => g.key !== "activity"
)
const TEMPLATE_TAGS = new Set(TEMPLATE_MERGE_VARIABLE_GROUPS.flatMap((g) => g.tags))
export const TEMPLATE_MERGE_VARIABLES: MergeVariable[] = MERGE_VARIABLES.filter((v) =>
  TEMPLATE_TAGS.has(v.tag)
)

// Buckets any tagged list (MergeVariable, or a page's own local variable
// type) into the given groups, in group order, dropping empty groups — e.g.
// after a search filter has removed every tag from a group. Any tag not
// covered by the supplied groups (a page with a richer catalog than the
// shared ones) lands in a trailing "other" bucket instead of silently
// disappearing.
export function groupByMergeVarGroup<T extends { tag: string }, K extends string>(
  items: T[],
  groups: { key: K; tags: string[] }[]
): { key: K | "other"; items: T[] }[] {
  const matched = new Set<string>()
  const grouped = groups
    .map((g) => {
      const groupItems = items.filter((i) => g.tags.includes(i.tag))
      groupItems.forEach((i) => matched.add(i.tag))
      return { key: g.key as K | "other", items: groupItems }
    })
    .filter((g) => g.items.length > 0)
  const leftover = items.filter((i) => !matched.has(i.tag))
  if (leftover.length > 0) grouped.push({ key: "other", items: leftover })
  return grouped
}

export function prospectMergeData(p: Prospect): Record<string, string> {
  return {
    first_name: p.firstName,
    last_name: p.lastName,
    full_name: `${p.firstName} ${p.lastName}`,
    company: p.company,
    title: p.title,
    industry: p.industry,
    city: p.location,
    seniority: p.seniority,
    department: p.department,
    email: p.email,
    phone: p.phone ?? "",
    linkedin_url: p.linkedinUrl,
    headcount: p.headcount,
    revenue: p.revenue,
    about: p.about,
    company_domain: p.companyDomain,
    signal_1: p.signals[0] ?? "",
    signal_2: p.signals[1] ?? "",
    score: String(p.score),
    status: p.status,
    tags: p.tags.join(", "),
    last_activity: relativeTime(p.lastActivity),
    added_at: relativeTime(p.addedAt),
    sender: currentUser.name,
    sender_first_name: currentUser.name.split(" ")[0],
    sender_full_name: currentUser.name,
    sender_email: currentUser.email,
    sender_company: currentUser.company,
    sender_title: currentUser.role,
    calendar_link: "kombo.ai/meet/kevin",
    value_proposition: valueProps[0]?.text ?? "",
    day_of_week: new Date().toLocaleDateString("en-US", { weekday: "long" }),
  }
}
