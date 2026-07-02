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

// The single typed filter catalog shared by every search surface (the Search
// page sidebar + modal and the Add-records dialog). Each entry writes into a
// string[] field of AiQuery; per-database facets (search-facets.ts) are
// layered on top by the callers.
export interface FilterGroupDef {
  key: keyof AiQuery // string[] fields only
  label: { en: string; es: string }
  options: string[]
  scope?: AiEntity // undefined = both people and companies
  linkedinOnly?: boolean // shown only when the LinkedIn source is active
  section: FilterSection
  popular?: boolean
}

export const SEARCH_FILTER_GROUPS: FilterGroupDef[] = [
  /* ------------------------- Contact information ------------------------- */
  { key: "titles", label: { en: "Titles", es: "Cargos" }, options: TITLE_OPTIONS, scope: "people", section: "contact", popular: true },
  { key: "seniority", label: { en: "Seniority", es: "Antigüedad" }, options: SENIORITY_OPTIONS, scope: "people", section: "contact", popular: true },
  { key: "departments", label: { en: "Departments", es: "Departamentos" }, options: DEPARTMENT_OPTIONS, scope: "people", section: "contact" },
  { key: "regions", label: { en: "Regions", es: "Regiones" }, options: REGION_OPTIONS, section: "contact", popular: true },
  // LinkedIn-only people facets (People search filters).
  { key: "connections", label: { en: "Connections", es: "Conexiones" }, options: CONNECTION_OPTIONS, linkedinOnly: true, section: "contact" },
  { key: "profileLanguages", label: { en: "Profile languages", es: "Idiomas del perfil" }, options: PROFILE_LANGUAGE_OPTIONS, linkedinOnly: true, scope: "people", section: "contact" },
  { key: "serviceCategories", label: { en: "Service categories", es: "Categorías de servicio" }, options: SERVICE_CATEGORY_OPTIONS, linkedinOnly: true, scope: "people", section: "contact" },
  { key: "schools", label: { en: "Schools", es: "Centros educativos" }, options: SCHOOL_OPTIONS, linkedinOnly: true, scope: "people", section: "contact" },
  { key: "currentCompanies", label: { en: "Current companies", es: "Empresas actuales" }, options: COMPANY_NAME_OPTIONS, linkedinOnly: true, scope: "people", section: "contact" },
  { key: "pastCompanies", label: { en: "Past companies", es: "Empresas anteriores" }, options: COMPANY_NAME_OPTIONS, linkedinOnly: true, scope: "people", section: "contact" },
  { key: "connectionsOf", label: { en: "Connections of", es: "Conexiones de" }, options: PERSON_NAME_OPTIONS, linkedinOnly: true, scope: "people", section: "contact" },
  { key: "followersOf", label: { en: "Followers of", es: "Seguidores de" }, options: PERSON_NAME_OPTIONS, linkedinOnly: true, scope: "people", section: "contact" },

  /* ------------------------- Company information ------------------------- */
  { key: "industries", label: { en: "Industries", es: "Sectores" }, options: INDUSTRY_OPTIONS, section: "company", popular: true },
  { key: "headcount", label: { en: "Headcount", es: "Plantilla" }, options: HEADCOUNT_OPTIONS, section: "company", popular: true },
  { key: "revenue", label: { en: "Revenue", es: "Ingresos" }, options: REVENUE_OPTIONS, section: "company" },
  { key: "founded", label: { en: "Founded", es: "Año de fundación" }, options: FOUNDED_OPTIONS, scope: "companies", section: "company" },
  { key: "growth", label: { en: "Headcount growth", es: "Crecimiento de plantilla" }, options: GROWTH_OPTIONS, scope: "companies", section: "company" },
  { key: "technologies", label: { en: "Technologies", es: "Tecnologías" }, options: TECH_OPTIONS, section: "company" },
  { key: "jobListings", label: { en: "Job listings on LinkedIn", es: "Ofertas de empleo en LinkedIn" }, options: JOB_LISTING_OPTIONS, linkedinOnly: true, scope: "companies", section: "company" },

  /* -------------------------------- Intent ------------------------------- */
  { key: "intent", label: { en: "Buyer intent", es: "Intención de compra" }, options: INTENT_OPTIONS, scope: "people", section: "intent" },
  { key: "signals", label: { en: "Signals", es: "Señales" }, options: SIGNAL_OPTIONS, section: "intent", popular: true },
  { key: "linkedin", label: { en: "Sales Nav", es: "Sales Nav" }, options: LINKEDIN_OPTIONS, linkedinOnly: true, scope: "people", section: "intent" },
]
