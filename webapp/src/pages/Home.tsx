import * as React from "react"
import { Link } from "react-router-dom"
import { Search, FolderKanban, Send, Mail, Plug, UserPlus } from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocale } from "@/lib/locale"
import { AddRecordsDialog } from "@/components/common/AddRecordsDialog"
import { HomeModules } from "@/components/home/HomeModules"
import { DealFlowBoard } from "@/components/home/DealFlowBoard"

const COPY = {
  en: {
    title: "Home",
    description: "Jump back in, or start something new.",
    tabHome: "Quick Actions",
    tabDealFlow: "Deal Flow",
    findTitle: "Find prospects & companies",
    findDesc: "Search our database or import a CSV.",
    listTitle: "Create a list",
    listDesc: "Organize prospects and companies.",
    campaignTitle: "Start a campaign",
    campaignDesc: "Reach out across email & LinkedIn.",
    templateTitle: "Write a template",
    templateDesc: "Reusable outreach messaging.",
    crmTitle: "Connect your CRM",
    crmDesc: "Sync with HubSpot, Salesforce & more.",
    teamTitle: "Invite your team",
    teamDesc: "Bring teammates into the workspace.",
  },
  es: {
    title: "Inicio",
    description: "Retoma donde lo dejaste, o empieza algo nuevo.",
    tabHome: "Acciones rápidas",
    tabDealFlow: "Flujo de negocio",
    findTitle: "Buscar prospectos y empresas",
    findDesc: "Busca en nuestra base de datos o importa un CSV.",
    listTitle: "Crear una lista",
    listDesc: "Organiza prospectos y empresas.",
    campaignTitle: "Iniciar una campaña",
    campaignDesc: "Contacta por email y LinkedIn.",
    templateTitle: "Redactar una plantilla",
    templateDesc: "Mensajes de difusión reutilizables.",
    crmTitle: "Conecta tu CRM",
    crmDesc: "Sincroniza con HubSpot, Salesforce y más.",
    teamTitle: "Invita a tu equipo",
    teamDesc: "Suma compañeros al workspace.",
  },
} as const

/**
 * The Home page: a lightweight quick-actions launcher, plus the same
 * customizable module grid that used to live below the search hero (see
 * HomeModules). Actual search/results live at "/search" (Signals) now — Home
 * is a jumping-off point, not a search surface.
 */
export default function Home() {
  const { locale } = useLocale()
  const t = COPY[locale]
  const [findOpen, setFindOpen] = React.useState(false)

  const actions: {
    key: string
    title: string
    desc: string
    icon: React.ComponentType<{ className?: string }>
    to?: string
    onClick?: () => void
  }[] = [
    { key: "find", title: t.findTitle, desc: t.findDesc, icon: Search, onClick: () => setFindOpen(true) },
    { key: "list", title: t.listTitle, desc: t.listDesc, icon: FolderKanban, to: "/lists" },
    { key: "campaign", title: t.campaignTitle, desc: t.campaignDesc, icon: Send, to: "/campaigns" },
    { key: "template", title: t.templateTitle, desc: t.templateDesc, icon: Mail, to: "/templates" },
    { key: "crm", title: t.crmTitle, desc: t.crmDesc, icon: Plug, to: "/integrations" },
    { key: "team", title: t.teamTitle, desc: t.teamDesc, icon: UserPlus, to: "/team" },
  ]

  return (
    <Page>
      <PageHeading title={t.title} description={t.description} />

      <Tabs defaultValue="home">
        <TabsList>
          <TabsTrigger value="home">{t.tabHome}</TabsTrigger>
          <TabsTrigger value="dealFlow">{t.tabDealFlow}</TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="mt-4 space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((a) => {
              const Icon = a.icon
              const body = (
                <>
                  <span className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="text-primary size-4.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{a.title}</span>
                    <span className="text-muted-foreground block text-xs">{a.desc}</span>
                  </span>
                </>
              )
              const className =
                "hover:border-primary/40 hover:bg-muted/30 flex items-start gap-3 rounded-xl border p-4 text-left transition-colors"
              return a.to ? (
                <Link key={a.key} to={a.to} className={className}>
                  {body}
                </Link>
              ) : (
                <button key={a.key} type="button" onClick={a.onClick} className={className}>
                  {body}
                </button>
              )
            })}
          </div>

          <HomeModules />
        </TabsContent>

        <TabsContent value="dealFlow" className="mt-4">
          <DealFlowBoard />
        </TabsContent>
      </Tabs>

      <AddRecordsDialog
        open={findOpen}
        onOpenChange={setFindOpen}
        kind="contact"
        allowEntityToggle
      />
    </Page>
  )
}
