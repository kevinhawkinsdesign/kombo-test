import {
  TITLE_OPTIONS,
  SENIORITY_OPTIONS,
  DEPARTMENT_OPTIONS,
  REGION_OPTIONS,
  INDUSTRY_OPTIONS,
  HEADCOUNT_OPTIONS,
  REVENUE_OPTIONS,
  FOUNDED_OPTIONS,
  GROWTH_OPTIONS,
  TECH_OPTIONS,
  INTENT_OPTIONS,
  SIGNAL_OPTIONS,
  LINKEDIN_OPTIONS,
  CONNECTION_OPTIONS,
  PROFILE_LANGUAGE_OPTIONS,
  SERVICE_CATEGORY_OPTIONS,
  SCHOOL_OPTIONS,
  COMPANY_NAME_OPTIONS,
  PERSON_NAME_OPTIONS,
  JOB_LISTING_OPTIONS,
  type AiEntity,
  type AiQuery,
} from "@/lib/mock-ai-search"
import type { FilterSection } from "@/lib/search-facets"
import type { Locale } from "@/lib/locale"

type Loc = Record<Locale, string>
function L(
  en: string,
  es: string,
  it: string,
  fr: string,
  de: string,
  pt: string,
  pt_BR: string
): Loc {
  return { en, es, it, fr, de, pt, pt_BR }
}

// The single typed filter catalog shared by every search surface (the Search
// page sidebar + modal and the Add-records dialog). Each entry writes into a
// string[] field of AiQuery; per-database facets (search-facets.ts) are
// layered on top by the callers.
export interface FilterGroupDef {
  key: keyof AiQuery // string[] fields only
  label: Loc
  options: string[]
  scope?: AiEntity // undefined = both people and companies
  linkedinOnly?: boolean // shown only when the LinkedIn source is active
  section: FilterSection
  popular?: boolean
}

export const SEARCH_FILTER_GROUPS: FilterGroupDef[] = [
  /* ------------------------- Contact information ------------------------- */
  { key: "titles", label: L("Titles", "Cargos", "Ruoli", "Postes", "Berufsbezeichnungen", "Cargos", "Cargos"), options: TITLE_OPTIONS, scope: "people", section: "contact", popular: true },
  { key: "seniority", label: L("Seniority", "Antigüedad", "Anzianità", "Ancienneté", "Senioritätsstufe", "Senioridade", "Senioridade"), options: SENIORITY_OPTIONS, scope: "people", section: "contact", popular: true },
  { key: "departments", label: L("Departments", "Departamentos", "Reparti", "Départements", "Abteilungen", "Departamentos", "Departamentos"), options: DEPARTMENT_OPTIONS, scope: "people", section: "contact" },
  { key: "regions", label: L("Regions", "Regiones", "Regioni", "Régions", "Regionen", "Regiões", "Regiões"), options: REGION_OPTIONS, section: "contact", popular: true },
  // LinkedIn-only people facets (People search filters).
  { key: "connections", label: L("Connections", "Conexiones", "Connessioni", "Relations", "Kontakte", "Contactos", "Conexões"), options: CONNECTION_OPTIONS, linkedinOnly: true, section: "contact" },
  { key: "profileLanguages", label: L("Profile languages", "Idiomas del perfil", "Lingue del profilo", "Langues du profil", "Profilsprachen", "Idiomas do perfil", "Idiomas do perfil"), options: PROFILE_LANGUAGE_OPTIONS, linkedinOnly: true, scope: "people", section: "contact" },
  { key: "serviceCategories", label: L("Service categories", "Categorías de servicio", "Categorie di servizio", "Catégories de service", "Servicekategorien", "Categorias de serviço", "Categorias de serviço"), options: SERVICE_CATEGORY_OPTIONS, linkedinOnly: true, scope: "people", section: "contact" },
  { key: "schools", label: L("Schools", "Centros educativos", "Scuole", "Écoles", "Schulen", "Escolas", "Escolas"), options: SCHOOL_OPTIONS, linkedinOnly: true, scope: "people", section: "contact" },
  { key: "currentCompanies", label: L("Current companies", "Empresas actuales", "Aziende attuali", "Entreprises actuelles", "Aktuelle Unternehmen", "Empresas atuais", "Empresas atuais"), options: COMPANY_NAME_OPTIONS, linkedinOnly: true, scope: "people", section: "contact" },
  { key: "pastCompanies", label: L("Past companies", "Empresas anteriores", "Aziende precedenti", "Entreprises précédentes", "Vorherige Unternehmen", "Empresas anteriores", "Empresas anteriores"), options: COMPANY_NAME_OPTIONS, linkedinOnly: true, scope: "people", section: "contact" },
  { key: "connectionsOf", label: L("Connections of", "Conexiones de", "Connessioni di", "Relations de", "Kontakte von", "Contactos de", "Conexões de"), options: PERSON_NAME_OPTIONS, linkedinOnly: true, scope: "people", section: "contact" },
  { key: "followersOf", label: L("Followers of", "Seguidores de", "Follower di", "Abonnés de", "Follower von", "Seguidores de", "Seguidores de"), options: PERSON_NAME_OPTIONS, linkedinOnly: true, scope: "people", section: "contact" },

  /* ------------------------- Company information ------------------------- */
  { key: "industries", label: L("Industries", "Sectores", "Settori", "Secteurs", "Branchen", "Setores", "Setores"), options: INDUSTRY_OPTIONS, section: "company", popular: true },
  { key: "headcount", label: L("Headcount", "Plantilla", "Organico", "Effectif", "Mitarbeiterzahl", "Efetivo", "Headcount"), options: HEADCOUNT_OPTIONS, section: "company", popular: true },
  { key: "revenue", label: L("Revenue", "Ingresos", "Fatturato", "Chiffre d'affaires", "Umsatz", "Receita", "Receita"), options: REVENUE_OPTIONS, section: "company" },
  { key: "founded", label: L("Founded", "Año de fundación", "Anno di fondazione", "Année de fondation", "Gründungsjahr", "Ano de fundação", "Ano de fundação"), options: FOUNDED_OPTIONS, scope: "companies", section: "company" },
  { key: "growth", label: L("Headcount growth", "Crecimiento de plantilla", "Crescita organico", "Croissance des effectifs", "Personalwachstum", "Crescimento do efetivo", "Crescimento de headcount"), options: GROWTH_OPTIONS, scope: "companies", section: "company" },
  { key: "technologies", label: L("Technologies", "Tecnologías", "Tecnologie", "Technologies", "Technologien", "Tecnologias", "Tecnologias"), options: TECH_OPTIONS, section: "company" },
  { key: "jobListings", label: L("Job listings on LinkedIn", "Ofertas de empleo en LinkedIn", "Offerte di lavoro su LinkedIn", "Offres d'emploi sur LinkedIn", "Stellenanzeigen auf LinkedIn", "Ofertas de emprego no LinkedIn", "Vagas de emprego no LinkedIn"), options: JOB_LISTING_OPTIONS, linkedinOnly: true, scope: "companies", section: "company" },

  /* -------------------------------- Intent ------------------------------- */
  { key: "intent", label: L("Buyer intent", "Intención de compra", "Intenzione d'acquisto", "Intention d'achat", "Kaufabsicht", "Intenção de compra", "Intenção de compra"), options: INTENT_OPTIONS, scope: "people", section: "intent" },
  { key: "signals", label: L("Signals", "Señales", "Segnali", "Signaux", "Signale", "Sinais", "Sinais"), options: SIGNAL_OPTIONS, section: "intent", popular: true },
  { key: "linkedin", label: L("Sales Nav", "Sales Nav", "Sales Nav", "Sales Nav", "Sales Nav", "Sales Nav", "Sales Nav"), options: LINKEDIN_OPTIONS, linkedinOnly: true, scope: "people", section: "intent" },
]
