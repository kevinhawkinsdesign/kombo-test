import type { AiEntity } from "@/lib/mock-ai-search"
import type { Locale } from "@/lib/locale"

// Which database a facet belongs to. The active database decides which catalog
// of filters is shown. Kombo (Cognism) + Lookalike (Ocean) share the "kombo"
// set; Sales Nav (Unipile) uses "linkedin"; the local-business sources bring
// their own minimal catalogs.
export type FacetDb = "linkedin" | "kombo" | "google_maps" | "tripadvisor"

// Filter-catalog sections (Enginy-style grouping) shared by facets and the
// typed filter groups.
export type FilterSection = "contact" | "company" | "intent"

export interface FacetDef {
  id: string
  label: Record<Locale, string>
  options: string[]
  db: FacetDb
  // undefined = applies to both people and companies
  scope?: AiEntity
  // Catalog section — defaults by scope (see facetSection).
  section?: FilterSection
  // Highlighted with a "Popular" badge in the catalog.
  popular?: boolean
}

/** Catalog section for a facet: explicit if set, else derived from scope. */
export function facetSection(f: FacetDef): FilterSection {
  if (f.section) return f.section
  return f.scope === "people" ? "contact" : "company"
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
  { id: "li_function", popular: true, db: "linkedin", scope: "people", label: { en: "Function", es: "Función", it: "Funzione", fr: "Fonction", de: "Funktion", pt: "Função", pt_BR: "Função" }, options: ["Sales", "Marketing", "Engineering", "Finance", "Human Resources", "Operations", "Product", "Information Technology", "Legal", "Consulting", "Support"] },
  { id: "li_years_company", db: "linkedin", scope: "people", label: { en: "Years in current company", es: "Años en la empresa actual", it: "Anni nell'azienda attuale", fr: "Années dans l'entreprise actuelle", de: "Jahre im aktuellen Unternehmen", pt: "Anos na empresa atual", pt_BR: "Anos na empresa atual" }, options: YEAR_BANDS },
  { id: "li_years_position", db: "linkedin", scope: "people", label: { en: "Years in current position", es: "Años en el puesto actual", it: "Anni nella posizione attuale", fr: "Années au poste actuel", de: "Jahre in der aktuellen Position", pt: "Anos no cargo atual", pt_BR: "Anos no cargo atual" }, options: YEAR_BANDS },
  { id: "li_years_experience", db: "linkedin", scope: "people", label: { en: "Years of experience", es: "Años de experiencia", it: "Anni di esperienza", fr: "Années d'expérience", de: "Jahre Berufserfahrung", pt: "Anos de experiência", pt_BR: "Anos de experiência" }, options: YEAR_BANDS },
  { id: "li_groups", db: "linkedin", scope: "people", label: { en: "Groups", es: "Grupos", it: "Gruppi", fr: "Groupes", de: "Gruppen", pt: "Grupos", pt_BR: "Grupos" }, options: ["Sales Hacker", "RevGenius", "Pavilion", "Modern Sales Pros", "SaaStr Community"] },
  { id: "li_following_company", section: "intent", db: "linkedin", scope: "people", label: { en: "Following your company", es: "Sigue tu empresa", it: "Segue la tua azienda", fr: "Suit votre entreprise", de: "Folgt deinem Unternehmen", pt: "Segue a sua empresa", pt_BR: "Segue sua empresa" }, options: ["Following your company"] },
  { id: "li_viewed_profile", section: "intent", db: "linkedin", scope: "people", label: { en: "Viewed your profile recently", es: "Vio tu perfil recientemente", it: "Ha visto il tuo profilo di recente", fr: "A consulté votre profil récemment", de: "Hat kürzlich dein Profil angesehen", pt: "Viu o seu perfil recentemente", pt_BR: "Viu seu perfil recentemente" }, options: ["Viewed your profile recently"] },
  { id: "li_past_colleague", db: "linkedin", scope: "people", label: { en: "Past colleague", es: "Excompañero", it: "Ex collega", fr: "Ancien collègue", de: "Ehemaliger Kollege", pt: "Antigo colega", pt_BR: "Ex-colega" }, options: ["Past colleague"] },
  { id: "li_shared_experiences", db: "linkedin", scope: "people", label: { en: "Shared experiences", es: "Experiencias en común", it: "Esperienze in comune", fr: "Expériences communes", de: "Gemeinsame Erfahrungen", pt: "Experiências em comum", pt_BR: "Experiências em comum" }, options: ["Shared group", "Shared school", "Shared past company"] },
  { id: "li_teamlink", db: "linkedin", scope: "people", label: { en: "TeamLink connections", es: "Conexiones TeamLink", it: "Connessioni TeamLink", fr: "Relations TeamLink", de: "TeamLink-Kontakte", pt: "Ligações TeamLink", pt_BR: "Conexões TeamLink" }, options: ["TeamLink intro available"] },
  { id: "li_changed_jobs", section: "intent", popular: true, db: "linkedin", scope: "people", label: { en: "Changed jobs", es: "Cambió de empleo", it: "Ha cambiato lavoro", fr: "A changé de poste", de: "Hat den Job gewechselt", pt: "Mudou de emprego", pt_BR: "Mudou de emprego" }, options: ["Changed jobs in last 90 days"] },
  { id: "li_posted", section: "intent", popular: true, db: "linkedin", scope: "people", label: { en: "Posted on LinkedIn", es: "Publicó en LinkedIn", it: "Ha pubblicato su LinkedIn", fr: "A publié sur LinkedIn", de: "Hat auf LinkedIn gepostet", pt: "Publicou no LinkedIn", pt_BR: "Publicou no LinkedIn" }, options: ["Posted in last 30 days"] },
  { id: "li_mentioned_news", section: "intent", db: "linkedin", scope: "people", label: { en: "Mentioned in news", es: "Mencionado en noticias", it: "Menzionato nelle notizie", fr: "Mentionné dans les actualités", de: "In den Nachrichten erwähnt", pt: "Mencionado nas notícias", pt_BR: "Mencionado nas notícias" }, options: ["Mentioned in the news"] },
  { id: "li_persona", db: "linkedin", scope: "people", label: { en: "Persona", es: "Persona", it: "Persona", fr: "Persona", de: "Persona", pt: "Persona", pt_BR: "Persona" }, options: ["Economic buyer", "Champion", "Decision maker", "Influencer", "End user"] },
  { id: "li_lead_lists", db: "linkedin", scope: "people", label: { en: "Lead lists", es: "Listas de leads", it: "Liste di lead", fr: "Listes de leads", de: "Lead-Listen", pt: "Listas de leads", pt_BR: "Listas de leads" }, options: ["My saved leads", "Q3 target leads", "Webinar attendees"] },
  { id: "li_people_crm", db: "linkedin", scope: "people", label: { en: "Prospects in CRM", es: "Prospectos en el CRM", it: "Prospect nel CRM", fr: "Prospects dans le CRM", de: "Prospects im CRM", pt: "Prospects no CRM", pt_BR: "Prospects no CRM" }, options: ["In CRM", "Not in CRM"] },
  { id: "li_interacted", db: "linkedin", scope: "people", label: { en: "Prospects you interacted with", es: "Prospectos con los que interactuaste", it: "Prospect con cui hai interagito", fr: "Prospects avec lesquels vous avez interagi", de: "Prospects, mit denen du interagiert hast", pt: "Prospects com quem interagiu", pt_BR: "Prospects com quem você interagiu" }, options: ["Messaged", "Viewed", "Connected"] },
  { id: "li_saved_leads", db: "linkedin", scope: "people", label: { en: "Saved leads", es: "Leads guardados", it: "Lead salvati", fr: "Leads enregistrés", de: "Gespeicherte Leads", pt: "Leads guardados", pt_BR: "Leads salvos" }, options: ["Saved leads only"] },
  { id: "li_first_name", db: "linkedin", scope: "people", label: { en: "First name", es: "Nombre", it: "Nome", fr: "Prénom", de: "Vorname", pt: "Nome", pt_BR: "Nome" }, options: [] },
  { id: "li_last_name", db: "linkedin", scope: "people", label: { en: "Last name", es: "Apellido", it: "Cognome", fr: "Nom", de: "Nachname", pt: "Apelido", pt_BR: "Sobrenome" }, options: [] },

  /* -------------------- LinkedIn — Sales Navigator (account) -------------- */
  { id: "li_company_type", db: "linkedin", label: { en: "Company type", es: "Tipo de empresa", it: "Tipo di azienda", fr: "Type d'entreprise", de: "Unternehmenstyp", pt: "Tipo de empresa", pt_BR: "Tipo de empresa" }, options: ["Public company", "Privately held", "Nonprofit", "Educational", "Government agency", "Partnership", "Self-employed"] },
  { id: "li_annual_revenue", popular: true, db: "linkedin", scope: "companies", label: { en: "Annual revenue", es: "Ingresos anuales", it: "Fatturato annuo", fr: "Chiffre d'affaires annuel", de: "Jahresumsatz", pt: "Receita anual", pt_BR: "Receita anual" }, options: ["< $1M", "$1M-$10M", "$10M-$50M", "$50M-$100M", "$100M-$500M", "$500M-$1B", "$1B+"] },
  { id: "li_headcount_growth", db: "linkedin", scope: "companies", label: { en: "Company headcount growth", es: "Crecimiento de plantilla", it: "Crescita dell'organico", fr: "Croissance des effectifs", de: "Mitarbeiterwachstum", pt: "Crescimento dos efetivos", pt_BR: "Crescimento do quadro de funcionários" }, options: ["0-10%", "10-25%", "25-50%", "50-100%", "100%+"] },
  { id: "li_dept_headcount", db: "linkedin", scope: "companies", label: { en: "Department headcount", es: "Plantilla por departamento", it: "Organico per reparto", fr: "Effectifs par département", de: "Mitarbeiter pro Abteilung", pt: "Efetivos por departamento", pt_BR: "Funcionários por departamento" }, options: ["Sales 1-10", "Sales 11-50", "Sales 51-200", "Marketing 1-10", "Marketing 11-50", "Engineering 51-200"] },
  { id: "li_dept_growth", db: "linkedin", scope: "companies", label: { en: "Department headcount growth", es: "Crecimiento por departamento", it: "Crescita per reparto", fr: "Croissance par département", de: "Wachstum pro Abteilung", pt: "Crescimento por departamento", pt_BR: "Crescimento por departamento" }, options: ["Sales growing", "Marketing growing", "Engineering growing"] },
  { id: "li_followers", db: "linkedin", scope: "companies", label: { en: "Number of followers", es: "Número de seguidores", it: "Numero di follower", fr: "Nombre d'abonnés", de: "Anzahl der Follower", pt: "Número de seguidores", pt_BR: "Número de seguidores" }, options: ["1K-10K", "10K-50K", "50K-100K", "100K-500K", "500K+"] },
  { id: "li_fortune", db: "linkedin", scope: "companies", label: { en: "Fortune list", es: "Lista Fortune", it: "Lista Fortune", fr: "Liste Fortune", de: "Fortune-Liste", pt: "Lista Fortune", pt_BR: "Lista Fortune" }, options: ["Fortune 50", "Fortune 100", "Fortune 500", "Fortune 1000"] },
  { id: "li_job_opps", db: "linkedin", scope: "companies", label: { en: "Job opportunities", es: "Oportunidades de empleo", it: "Opportunità di lavoro", fr: "Offres d'emploi", de: "Stellenangebote", pt: "Oportunidades de emprego", pt_BR: "Oportunidades de emprego" }, options: ["Hiring for sales", "Hiring for marketing", "Hiring for engineering"] },
  { id: "li_recent_activities", db: "linkedin", scope: "companies", label: { en: "Recent activities", es: "Actividad reciente", it: "Attività recenti", fr: "Activités récentes", de: "Aktuelle Aktivitäten", pt: "Atividade recente", pt_BR: "Atividade recente" }, options: ["Senior leadership change", "Funding event", "Recent acquisition"] },
  { id: "li_account_lists", db: "linkedin", scope: "companies", label: { en: "Account lists", es: "Listas de cuentas", it: "Liste di account", fr: "Listes de comptes", de: "Account-Listen", pt: "Listas de contas", pt_BR: "Listas de contas" }, options: ["My saved accounts", "Target accounts", "Named accounts"] },
  { id: "li_companies_crm", db: "linkedin", scope: "companies", label: { en: "Companies in CRM", es: "Empresas en el CRM", it: "Aziende nel CRM", fr: "Entreprises dans le CRM", de: "Unternehmen im CRM", pt: "Empresas no CRM", pt_BR: "Empresas no CRM" }, options: ["In CRM", "Not in CRM"] },
  { id: "li_hq_location", popular: true, db: "linkedin", scope: "companies", label: { en: "HQ location", es: "Ubicación de la sede", it: "Sede centrale", fr: "Emplacement du siège", de: "Hauptsitz", pt: "Localização da sede", pt_BR: "Localização da sede" }, options: COUNTRIES },

  /* ------------------------- Kombo — FullEnrich ----------------------------- */
  { id: "fe_management_level", popular: true, db: "kombo", scope: "people", label: { en: "Management level", es: "Nivel directivo", it: "Livello manageriale", fr: "Niveau hiérarchique", de: "Managementebene", pt: "Nível de gestão", pt_BR: "Nível de gestão" }, options: ["Owner", "Partner", "C-Level", "VP", "Head", "Director", "Manager", "Senior", "Entry", "Intern"] },
  { id: "fe_job_function", popular: true, db: "kombo", scope: "people", label: { en: "Job function", es: "Función laboral", it: "Funzione lavorativa", fr: "Fonction professionnelle", de: "Tätigkeitsbereich", pt: "Função profissional", pt_BR: "Função profissional" }, options: ["Sales", "Marketing", "Engineering", "Finance", "Human Resources", "Operations", "Product", "Information Technology", "Legal", "Customer Success", "Design", "Data"] },
  { id: "fe_country", popular: true, db: "kombo", scope: "people", label: { en: "Country", es: "País", it: "Paese", fr: "Pays", de: "Land", pt: "País", pt_BR: "País" }, options: COUNTRIES },
  { id: "fe_years_experience", db: "kombo", scope: "people", label: { en: "Years of experience", es: "Años de experiencia", it: "Anni di esperienza", fr: "Années d'expérience", de: "Jahre Berufserfahrung", pt: "Anos de experiência", pt_BR: "Anos de experiência" }, options: YEAR_BANDS },
  { id: "fe_email_status", db: "kombo", scope: "people", label: { en: "Email status", es: "Estado del email", it: "Stato dell'email", fr: "Statut de l'email", de: "E-Mail-Status", pt: "Estado do email", pt_BR: "Status do email" }, options: ["Verified", "Catch-all", "Unknown"] },
  { id: "fe_contact_info", db: "kombo", scope: "people", label: { en: "Contact info available", es: "Datos de contacto", it: "Dati di contatto", fr: "Coordonnées disponibles", de: "Verfügbare Kontaktdaten", pt: "Dados de contacto", pt_BR: "Dados de contato" }, options: ["Has work email", "Has personal email", "Has mobile", "Has direct dial"] },
  { id: "fe_gender", db: "kombo", scope: "people", label: { en: "Gender", es: "Género", it: "Genere", fr: "Genre", de: "Geschlecht", pt: "Género", pt_BR: "Gênero" }, options: ["Female", "Male"] },
  { id: "fe_company_size", popular: true, db: "kombo", scope: "companies", label: { en: "Company size", es: "Tamaño de empresa", it: "Dimensione dell'azienda", fr: "Taille de l'entreprise", de: "Unternehmensgröße", pt: "Dimensão da empresa", pt_BR: "Tamanho da empresa" }, options: SIZE_BANDS },
  { id: "fe_company_country", db: "kombo", scope: "companies", label: { en: "Company country", es: "País de la empresa", it: "Paese dell'azienda", fr: "Pays de l'entreprise", de: "Land des Unternehmens", pt: "País da empresa", pt_BR: "País da empresa" }, options: COUNTRIES },
  { id: "fe_funding_stage", db: "kombo", scope: "companies", label: { en: "Funding stage", es: "Etapa de financiación", it: "Fase di finanziamento", fr: "Stade de financement", de: "Finanzierungsphase", pt: "Fase de financiamento", pt_BR: "Estágio de financiamento" }, options: ["Pre-seed", "Seed", "Series A", "Series B", "Series C", "Series D+", "Public", "Bootstrapped"] },
  { id: "fe_naics", db: "kombo", scope: "companies", label: { en: "NAICS code", es: "Código NAICS", it: "Codice NAICS", fr: "Code NAICS", de: "NAICS-Code", pt: "Código NAICS", pt_BR: "Código NAICS" }, options: ["5112 — Software", "5415 — Computer services", "5221 — Banking", "3345 — Electronics"] },
  { id: "fe_sic", db: "kombo", scope: "companies", label: { en: "SIC code", es: "Código SIC", it: "Codice SIC", fr: "Code SIC", de: "SIC-Code", pt: "Código SIC", pt_BR: "Código SIC" }, options: ["7372 — Prepackaged software", "7389 — Business services", "6022 — Banks"] },

  /* ---------------------- Google Maps (local businesses) ------------------- */
  // Faithful to the extension: Google Maps company search exposes two free-text
  // filters — Keywords (the search query) and Location.
  { id: "gm_keywords", db: "google_maps", scope: "companies", label: { en: "Keywords", es: "Palabras clave", it: "Parole chiave", fr: "Mots-clés", de: "Suchbegriffe", pt: "Palavras-chave", pt_BR: "Palavras-chave" }, options: [] },
  { id: "gm_location", db: "google_maps", scope: "companies", label: { en: "Location", es: "Ubicación", it: "Posizione", fr: "Localisation", de: "Standort", pt: "Localização", pt_BR: "Localização" }, options: [] },

  /* ------------------------- TripAdvisor (venues) -------------------------- */
  // Same as Google Maps: Keywords + Location free-text filters.
  { id: "ta_keywords", db: "tripadvisor", scope: "companies", label: { en: "Keywords", es: "Palabras clave", it: "Parole chiave", fr: "Mots-clés", de: "Suchbegriffe", pt: "Palavras-chave", pt_BR: "Palavras-chave" }, options: [] },
  { id: "ta_location", db: "tripadvisor", scope: "companies", label: { en: "Location", es: "Ubicación", it: "Posizione", fr: "Localisation", de: "Standort", pt: "Localização", pt_BR: "Localização" }, options: [] },
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
