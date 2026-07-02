import type { AiEntity } from "@/lib/mock-ai-search"
import type { Locale } from "@/lib/locale"

// Which database a facet belongs to. The active database decides which catalog
// of filters is shown. Kombo (Cognism) + Lookalike (Ocean) share the "kombo"
// set; Sales Nav (Unipile) uses "linkedin"; the local-business sources bring
// their own minimal catalogs.
export type FacetDb = "linkedin" | "kombo" | "google_maps" | "tripadvisor"

export interface FacetDef {
  id: string
  label: Record<Locale, string>
  options: string[]
  db: FacetDb
  // undefined = applies to both people and companies
  scope?: AiEntity
}

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Canada",
  "Brazil",
  "Mexico",
  "India",
  "Australia",
]

const SIZE_BANDS = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5001-10000",
  "10001+",
]

const YEAR_BANDS = ["Less than 1 year", "1-2 years", "3-5 years", "6-10 years", "10+ years"]

/**
 * The full per-database filter catalog. LinkedIn entries mirror the Sales
 * Navigator advanced-search filters; Kombo entries mirror the FullEnrich /
 * Kombo data enums. Stored generically in `query.facets[id]` so we don't need
 * a typed query field per filter.
 */
export const SEARCH_FACETS: FacetDef[] = [
  /* ---------------------- LinkedIn — Sales Navigator (lead) ---------------- */
  { id: "li_function", db: "linkedin", scope: "people", label: { en: "Function", es: "Función" }, options: ["Sales", "Marketing", "Engineering", "Finance", "Human Resources", "Operations", "Product", "Information Technology", "Legal", "Consulting", "Support"] },
  { id: "li_years_company", db: "linkedin", scope: "people", label: { en: "Years in current company", es: "Años en la empresa actual" }, options: YEAR_BANDS },
  { id: "li_years_position", db: "linkedin", scope: "people", label: { en: "Years in current position", es: "Años en el puesto actual" }, options: YEAR_BANDS },
  { id: "li_years_experience", db: "linkedin", scope: "people", label: { en: "Years of experience", es: "Años de experiencia" }, options: YEAR_BANDS },
  { id: "li_groups", db: "linkedin", scope: "people", label: { en: "Groups", es: "Grupos" }, options: ["Sales Hacker", "RevGenius", "Pavilion", "Modern Sales Pros", "SaaStr Community"] },
  { id: "li_following_company", db: "linkedin", scope: "people", label: { en: "Following your company", es: "Sigue tu empresa" }, options: ["Following your company"] },
  { id: "li_viewed_profile", db: "linkedin", scope: "people", label: { en: "Viewed your profile recently", es: "Vio tu perfil recientemente" }, options: ["Viewed your profile recently"] },
  { id: "li_past_colleague", db: "linkedin", scope: "people", label: { en: "Past colleague", es: "Excompañero" }, options: ["Past colleague"] },
  { id: "li_shared_experiences", db: "linkedin", scope: "people", label: { en: "Shared experiences", es: "Experiencias en común" }, options: ["Shared group", "Shared school", "Shared past company"] },
  { id: "li_teamlink", db: "linkedin", scope: "people", label: { en: "TeamLink connections", es: "Conexiones TeamLink" }, options: ["TeamLink intro available"] },
  { id: "li_changed_jobs", db: "linkedin", scope: "people", label: { en: "Changed jobs", es: "Cambió de empleo" }, options: ["Changed jobs in last 90 days"] },
  { id: "li_posted", db: "linkedin", scope: "people", label: { en: "Posted on LinkedIn", es: "Publicó en LinkedIn" }, options: ["Posted in last 30 days"] },
  { id: "li_mentioned_news", db: "linkedin", scope: "people", label: { en: "Mentioned in news", es: "Mencionado en noticias" }, options: ["Mentioned in the news"] },
  { id: "li_persona", db: "linkedin", scope: "people", label: { en: "Persona", es: "Persona" }, options: ["Economic buyer", "Champion", "Decision maker", "Influencer", "End user"] },
  { id: "li_lead_lists", db: "linkedin", scope: "people", label: { en: "Lead lists", es: "Listas de leads" }, options: ["My saved leads", "Q3 target leads", "Webinar attendees"] },
  { id: "li_people_crm", db: "linkedin", scope: "people", label: { en: "Prospects in CRM", es: "Prospectos en el CRM" }, options: ["In CRM", "Not in CRM"] },
  { id: "li_interacted", db: "linkedin", scope: "people", label: { en: "Prospects you interacted with", es: "Prospectos con los que interactuaste" }, options: ["Messaged", "Viewed", "Connected"] },
  { id: "li_saved_leads", db: "linkedin", scope: "people", label: { en: "Saved leads", es: "Leads guardados" }, options: ["Saved leads only"] },
  { id: "li_first_name", db: "linkedin", scope: "people", label: { en: "First name", es: "Nombre" }, options: [] },
  { id: "li_last_name", db: "linkedin", scope: "people", label: { en: "Last name", es: "Apellido" }, options: [] },

  /* -------------------- LinkedIn — Sales Navigator (account) -------------- */
  { id: "li_company_type", db: "linkedin", label: { en: "Company type", es: "Tipo de empresa" }, options: ["Public company", "Privately held", "Nonprofit", "Educational", "Government agency", "Partnership", "Self-employed"] },
  { id: "li_annual_revenue", db: "linkedin", scope: "companies", label: { en: "Annual revenue", es: "Ingresos anuales" }, options: ["< $1M", "$1M-$10M", "$10M-$50M", "$50M-$100M", "$100M-$500M", "$500M-$1B", "$1B+"] },
  { id: "li_headcount_growth", db: "linkedin", scope: "companies", label: { en: "Company headcount growth", es: "Crecimiento de plantilla" }, options: ["0-10%", "10-25%", "25-50%", "50-100%", "100%+"] },
  { id: "li_dept_headcount", db: "linkedin", scope: "companies", label: { en: "Department headcount", es: "Plantilla por departamento" }, options: ["Sales 1-10", "Sales 11-50", "Sales 51-200", "Marketing 1-10", "Marketing 11-50", "Engineering 51-200"] },
  { id: "li_dept_growth", db: "linkedin", scope: "companies", label: { en: "Department headcount growth", es: "Crecimiento por departamento" }, options: ["Sales growing", "Marketing growing", "Engineering growing"] },
  { id: "li_followers", db: "linkedin", scope: "companies", label: { en: "Number of followers", es: "Número de seguidores" }, options: ["1K-10K", "10K-50K", "50K-100K", "100K-500K", "500K+"] },
  { id: "li_fortune", db: "linkedin", scope: "companies", label: { en: "Fortune list", es: "Lista Fortune" }, options: ["Fortune 50", "Fortune 100", "Fortune 500", "Fortune 1000"] },
  { id: "li_job_opps", db: "linkedin", scope: "companies", label: { en: "Job opportunities", es: "Oportunidades de empleo" }, options: ["Hiring for sales", "Hiring for marketing", "Hiring for engineering"] },
  { id: "li_recent_activities", db: "linkedin", scope: "companies", label: { en: "Recent activities", es: "Actividad reciente" }, options: ["Senior leadership change", "Funding event", "Recent acquisition"] },
  { id: "li_account_lists", db: "linkedin", scope: "companies", label: { en: "Account lists", es: "Listas de cuentas" }, options: ["My saved accounts", "Target accounts", "Named accounts"] },
  { id: "li_companies_crm", db: "linkedin", scope: "companies", label: { en: "Companies in CRM", es: "Empresas en el CRM" }, options: ["In CRM", "Not in CRM"] },
  { id: "li_hq_location", db: "linkedin", scope: "companies", label: { en: "HQ location", es: "Ubicación de la sede" }, options: COUNTRIES },

  /* ------------------------- Kombo — FullEnrich ----------------------------- */
  { id: "fe_management_level", db: "kombo", scope: "people", label: { en: "Management level", es: "Nivel directivo" }, options: ["Owner", "Partner", "C-Level", "VP", "Head", "Director", "Manager", "Senior", "Entry", "Intern"] },
  { id: "fe_job_function", db: "kombo", scope: "people", label: { en: "Job function", es: "Función laboral" }, options: ["Sales", "Marketing", "Engineering", "Finance", "Human Resources", "Operations", "Product", "Information Technology", "Legal", "Customer Success", "Design", "Data"] },
  { id: "fe_country", db: "kombo", scope: "people", label: { en: "Country", es: "País" }, options: COUNTRIES },
  { id: "fe_years_experience", db: "kombo", scope: "people", label: { en: "Years of experience", es: "Años de experiencia" }, options: YEAR_BANDS },
  { id: "fe_email_status", db: "kombo", scope: "people", label: { en: "Email status", es: "Estado del email" }, options: ["Verified", "Catch-all", "Unknown"] },
  { id: "fe_contact_info", db: "kombo", scope: "people", label: { en: "Contact info available", es: "Datos de contacto" }, options: ["Has work email", "Has personal email", "Has mobile", "Has direct dial"] },
  { id: "fe_gender", db: "kombo", scope: "people", label: { en: "Gender", es: "Género" }, options: ["Female", "Male"] },
  { id: "fe_company_size", db: "kombo", scope: "companies", label: { en: "Company size", es: "Tamaño de empresa" }, options: SIZE_BANDS },
  { id: "fe_company_country", db: "kombo", scope: "companies", label: { en: "Company country", es: "País de la empresa" }, options: COUNTRIES },
  { id: "fe_funding_stage", db: "kombo", scope: "companies", label: { en: "Funding stage", es: "Etapa de financiación" }, options: ["Pre-seed", "Seed", "Series A", "Series B", "Series C", "Series D+", "Public", "Bootstrapped"] },
  { id: "fe_naics", db: "kombo", scope: "companies", label: { en: "NAICS code", es: "Código NAICS" }, options: ["5112 — Software", "5415 — Computer services", "5221 — Banking", "3345 — Electronics"] },
  { id: "fe_sic", db: "kombo", scope: "companies", label: { en: "SIC code", es: "Código SIC" }, options: ["7372 — Prepackaged software", "7389 — Business services", "6022 — Banks"] },

  /* ---------------------- Google Maps (local businesses) ------------------- */
  // Faithful to the extension: Google Maps company search exposes two free-text
  // filters — Keywords (the search query) and Location.
  { id: "gm_keywords", db: "google_maps", scope: "companies", label: { en: "Keywords", es: "Palabras clave" }, options: [] },
  { id: "gm_location", db: "google_maps", scope: "companies", label: { en: "Location", es: "Ubicación" }, options: [] },

  /* ------------------------- TripAdvisor (venues) -------------------------- */
  // Same as Google Maps: Keywords + Location free-text filters.
  { id: "ta_keywords", db: "tripadvisor", scope: "companies", label: { en: "Keywords", es: "Palabras clave" }, options: [] },
  { id: "ta_location", db: "tripadvisor", scope: "companies", label: { en: "Location", es: "Ubicación" }, options: [] },
]

export function facetsForDb(db: FacetDb, entity: AiEntity): FacetDef[] {
  return SEARCH_FACETS.filter(
    (f) => f.db === db && (!f.scope || f.scope === entity)
  )
}

const FACET_BY_ID = new Map(SEARCH_FACETS.map((f) => [f.id, f]))

export function facetLabel(id: string, locale: Locale): string {
  return FACET_BY_ID.get(id)?.label[locale] ?? id
}
