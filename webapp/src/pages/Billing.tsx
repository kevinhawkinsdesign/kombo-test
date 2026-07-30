import { useLocale } from "@/lib/locale"
import { Page, PageHeading } from "@/components/layout/Page"
import { BillingCard } from "@/pages/Settings"

// Billing used to be a Settings tab — promoted to its own Manage-nav page,
// at the same level as Team and Playbook, per Ale's feedback that Billing
// (and Blacklists) don't belong buried inside Settings.
const COPY = {
  en: {
    title: "Billing",
    description: "Your plan, usage, and payment details.",
  },
  es: {
    title: "Facturación",
    description: "Tu plan, uso y datos de pago.",
  },
  it: {
    title: "Fatturazione",
    description: "Il tuo piano, utilizzo e dati di pagamento.",
  },
  fr: {
    title: "Facturation",
    description: "Votre plan, votre utilisation et vos informations de paiement.",
  },
  de: {
    title: "Abrechnung",
    description: "Dein Plan, deine Nutzung und deine Zahlungsdaten.",
  },
  pt: {
    title: "Faturação",
    description: "O seu plano, utilização e dados de pagamento.",
  },
  pt_BR: {
    title: "Faturamento",
    description: "Seu plano, uso e dados de pagamento.",
  },
} as const

export default function Billing() {
  const { locale } = useLocale()
  const c = COPY[locale]

  return (
    <Page>
      <PageHeading title={c.title} description={c.description} />
      <BillingCard />
    </Page>
  )
}
