import { useLocale } from "@/lib/locale"
import { Page, PageHeading } from "@/components/layout/Page"
import { BlacklistCard } from "@/pages/Settings"

// Blacklists used to be a Settings tab — promoted to its own Manage-nav
// page, at the same level as Team and Playbook, per Ale's feedback that
// Blacklists (and Billing) don't belong buried inside Settings.
const COPY = {
  en: {
    title: "Blacklists",
    description: "Companies excluded from search, outreach, and enrichment.",
  },
  es: {
    title: "Listas negras",
    description: "Empresas excluidas de la búsqueda, el contacto y el enriquecimiento.",
  },
  it: {
    title: "Liste nere",
    description: "Aziende escluse da ricerca, outreach e arricchimento.",
  },
  fr: {
    title: "Listes noires",
    description: "Entreprises exclues de la recherche, de la prospection et de l'enrichissement.",
  },
  de: {
    title: "Blacklists",
    description: "Unternehmen, die von Suche, Outreach und Anreicherung ausgeschlossen sind.",
  },
  pt: {
    title: "Listas negras",
    description: "Empresas excluídas da pesquisa, do contacto e do enriquecimento.",
  },
  pt_BR: {
    title: "Listas negras",
    description: "Empresas excluídas da pesquisa, do contato e do enriquecimento.",
  },
} as const

export default function Blacklists() {
  const { locale } = useLocale()
  const c = COPY[locale]

  return (
    <Page>
      <PageHeading title={c.title} description={c.description} />
      <BlacklistCard />
    </Page>
  )
}
