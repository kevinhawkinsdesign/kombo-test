// Mock CRM field catalogs + default field mapping for the "Add to CRM" wizard.
// UI-only: mirrors how a real push-to-CRM mapping step would look.
import type { Account, Prospect } from "@/lib/types"

export type RecordKind = "person" | "company"
export type CrmObject = "contact" | "lead" | "company"

export const SKIP = "__skip__"

export interface CrmField {
  value: string
  label: string
}

export interface KomboField {
  key: string
  label: string
  value: string
}

export interface CrmInfo {
  id: string
  name: string
}

// Which CRM object types make sense for each record kind.
export const OBJECTS_FOR: Record<RecordKind, CrmObject[]> = {
  person: ["contact", "lead"],
  company: ["company", "contact"],
}

export const OBJECT_LABEL: Record<CrmObject, string> = {
  contact: "Contact",
  lead: "Lead",
  company: "Company",
}

// ---- Kombo-side fields (source) ----

export function komboFields(kind: RecordKind, record: Prospect | Account): KomboField[] {
  if (kind === "person") {
    const p = record as Prospect
    return [
      { key: "firstName", label: "First name", value: p.firstName },
      { key: "lastName", label: "Last name", value: p.lastName },
      { key: "email", label: "Email", value: p.email },
      { key: "title", label: "Title", value: p.title },
      { key: "company", label: "Company", value: p.company },
      { key: "phone", label: "Phone", value: p.phone ?? "—" },
      { key: "location", label: "Location", value: p.location },
      { key: "linkedin", label: "LinkedIn", value: p.linkedinUrl },
      { key: "industry", label: "Industry", value: p.industry },
    ]
  }
  const a = record as Account
  return [
    { key: "name", label: "Company", value: a.name },
    { key: "domain", label: "Website", value: a.domain },
    { key: "industry", label: "Industry", value: a.industry },
    { key: "employees", label: "Employees", value: a.employees },
    { key: "revenue", label: "Annual revenue", value: a.revenue },
    { key: "location", label: "Location", value: a.location },
    { key: "tier", label: "Tier", value: a.tier },
  ]
}

// ---- CRM-side fields (target) per CRM + object ----

const HUBSPOT: Partial<Record<CrmObject, CrmField[]>> = {
  contact: [
    { value: "firstname", label: "First name" },
    { value: "lastname", label: "Last name" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone number" },
    { value: "jobtitle", label: "Job title" },
    { value: "company", label: "Company name" },
    { value: "linkedinbio", label: "LinkedIn" },
    { value: "industry", label: "Industry" },
    { value: "city", label: "City" },
    { value: "lifecyclestage", label: "Lifecycle stage" },
  ],
  lead: [
    { value: "firstname", label: "First name" },
    { value: "lastname", label: "Last name" },
    { value: "email", label: "Email" },
    { value: "jobtitle", label: "Job title" },
    { value: "company", label: "Company name" },
    { value: "hs_lead_status", label: "Lead status" },
  ],
  company: [
    { value: "name", label: "Company name" },
    { value: "domain", label: "Company domain" },
    { value: "industry", label: "Industry" },
    { value: "numberofemployees", label: "Number of employees" },
    { value: "annualrevenue", label: "Annual revenue" },
    { value: "city", label: "City" },
  ],
}

const SALESFORCE: Partial<Record<CrmObject, CrmField[]>> = {
  contact: [
    { value: "FirstName", label: "First name" },
    { value: "LastName", label: "Last name" },
    { value: "Email", label: "Email" },
    { value: "Phone", label: "Phone" },
    { value: "Title", label: "Title" },
    { value: "Account", label: "Account name" },
    { value: "LinkedIn__c", label: "LinkedIn" },
    { value: "MailingCity", label: "Mailing city" },
  ],
  lead: [
    { value: "FirstName", label: "First name" },
    { value: "LastName", label: "Last name" },
    { value: "Email", label: "Email" },
    { value: "Title", label: "Title" },
    { value: "Company", label: "Company" },
    { value: "Industry", label: "Industry" },
    { value: "LeadSource", label: "Lead source" },
  ],
  company: [
    { value: "Name", label: "Account name" },
    { value: "Website", label: "Website" },
    { value: "Industry", label: "Industry" },
    { value: "NumberOfEmployees", label: "Employees" },
    { value: "AnnualRevenue", label: "Annual revenue" },
    { value: "BillingCity", label: "Billing city" },
  ],
}

const CATALOG: Record<string, Partial<Record<CrmObject, CrmField[]>>> = {
  hubspot: HUBSPOT,
  salesforce: SALESFORCE,
}

// Normalize a CRM integration name to a catalog key.
export function crmKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, "")
}

export function targetFields(crmName: string, object: CrmObject): CrmField[] {
  return CATALOG[crmKey(crmName)]?.[object] ?? HUBSPOT[object] ?? []
}

// Candidate target labels per Kombo field key, in priority order. Used to
// pre-fill a sensible default mapping; unmatched fields default to Skip.
const TARGET_LABELS: Record<string, string[]> = {
  firstName: ["first name"],
  lastName: ["last name"],
  email: ["email"],
  title: ["title", "job title"],
  company: ["company name", "account name", "company"],
  phone: ["phone", "phone number"],
  linkedin: ["linkedin"],
  industry: ["industry"],
  location: [], // no clean 1:1 — default to skip
  name: ["company name", "account name", "name"],
  domain: ["website", "company domain"],
  employees: [], // skip by default
  revenue: [], // skip by default
  tier: [], // skip by default
}

export function defaultMapping(
  fields: KomboField[],
  crmFields: CrmField[]
): Record<string, string> {
  const byLabel = new Map(crmFields.map((f) => [f.label.toLowerCase(), f.value]))
  const map: Record<string, string> = {}
  for (const f of fields) {
    const candidates = TARGET_LABELS[f.key] ?? []
    const hit = candidates.map((c) => byLabel.get(c)).find(Boolean)
    map[f.key] = hit ?? SKIP
  }
  return map
}
