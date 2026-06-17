// Data for settings parity with the Kombo extension + credit top-up packages.

export const SALES_METHODOLOGIES = [
  "MEDDIC",
  "BANT",
  "SPIN Selling",
  "Challenger Sale",
  "Sandler",
  "Solution Selling",
  "Value Selling",
] as const

export interface BlacklistedCompany {
  id: string
  name: string
  domain: string
  reason: string
}

export const blacklistedCompanies: BlacklistedCompany[] = [
  { id: "bl_1", name: "Globex Corporation", domain: "globex.com", reason: "Existing customer" },
  { id: "bl_2", name: "Initech", domain: "initech.com", reason: "Competitor" },
  { id: "bl_3", name: "Soylent Corp", domain: "soylentcorp.com", reason: "Do not contact" },
]

export interface CreditPackage {
  id: string
  credits: number
  price: number // USD
  bonus?: number // bonus credits
  popular?: boolean
}

export const creditPackages: CreditPackage[] = [
  { id: "pk_500", credits: 500, price: 49 },
  { id: "pk_2000", credits: 2000, price: 149, bonus: 200, popular: true },
  { id: "pk_5000", credits: 5000, price: 299, bonus: 750 },
]
