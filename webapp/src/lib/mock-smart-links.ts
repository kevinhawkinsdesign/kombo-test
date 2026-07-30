// A small set of reusable "smart links" a rep can drop into a reply —
// mirrors the extension's inline "Links" dropdown in the message composer
// (kombo-extension/src/components/inbox/MessageEnhancerBox.tsx, backed by
// SettingsSmartUploads' SmartLink type). This is a minimal read-only list
// for composer parity, not a managed feature — no settings/CRUD surface
// here, just a fixed catalog. Widen into a real store (see mock-products.ts
// for the shape) if a settings UI for these is ever scoped.

import type { Locale } from "@/lib/locale"

export interface SmartLink {
  id: string
  url: string
  label: Record<Locale, string>
}

export const SMART_LINKS: SmartLink[] = [
  {
    id: "calendar",
    url: "https://cal.getkombo.ai/demo",
    label: {
      en: "Calendar link",
      es: "Enlace de calendario",
      it: "Link al calendario",
      fr: "Lien de calendrier",
      de: "Kalender-Link",
      pt: "Link de calendário",
      pt_BR: "Link de agenda",
    },
  },
  {
    id: "pricing",
    url: "https://getkombo.ai/pricing",
    label: {
      en: "Pricing page",
      es: "Página de precios",
      it: "Pagina dei prezzi",
      fr: "Page tarifs",
      de: "Preisseite",
      pt: "Página de preços",
      pt_BR: "Página de preços",
    },
  },
  {
    id: "case_study",
    url: "https://getkombo.ai/customers/fever",
    label: {
      en: "Case study",
      es: "Caso de estudio",
      it: "Case study",
      fr: "Étude de cas",
      de: "Fallstudie",
      pt: "Estudo de caso",
      pt_BR: "Estudo de caso",
    },
  },
]
