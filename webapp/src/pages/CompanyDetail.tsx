import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  Building2,
  Plus,
  Users,
  Sparkles,
  Newspaper,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

import { Page } from "@/components/layout/Page"
import { useLocale } from "@/lib/locale"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProspectAvatar, ScoreBadge } from "@/components/common/ProspectBits"
import { TrackButton } from "@/components/common/TrackButton"
import { BackLink } from "@/components/common/BackLink"
import { CompanyMetrics } from "@/components/company/CompanyMetrics"
import { AddToCrmDialog } from "@/components/crm/AddToCrmDialog"
import { getAccount, deals, DEAL_STAGES } from "@/lib/mock-extra"
import { getCompanyNews } from "@/lib/mock-depth"
import { prospects } from "@/lib/mock-data"
import { getRep } from "@/lib/team"
import {
  initials,
  formatDate,
  relativeTime,
  formatMoney as money,
} from "@/lib/format"
import type { Account, DealStage } from "@/lib/types"

const COPY = {
  en: {
    healthHealthy: "Healthy",
    healthAtWatch: "At watch",
    healthAtRisk: "At risk",
    companyNotFound: "Company not found.",
    backToCompanies: "Back to companies",
    companies: "Companies",
    addToCrm: "Add to CRM",
    addContact: "Add prospect",
    findPeople: "Find prospects here",
    addContactToast: "Add a prospect to this company",
    about: "About",
    buyingSignals: "Buying signals",
    recentNews: "Recent news",
    noNews: "No recent news for this account.",
    openDeals: "Open deals",
    dealName: "Deal name",
    stage: "Stage",
    value: "Value",
    closeDate: "Close date",
    noOpenDeals: "No open deals",
    contacts: "Prospects",
    noContacts: "No prospects yet — add some to get started.",
    keyExecutives: "Key executives",
    firmographics: "Firmographics",
    industry: "Industry",
    employees: "Employees",
    revenue: "Revenue",
    location: "Location",
    accountOwner: "Account owner",
    unassigned: "Unassigned",
    crmCompany: "Company",
    crmWebsite: "Website",
  },
  es: {
    healthHealthy: "Saludable",
    healthAtWatch: "En observación",
    healthAtRisk: "En riesgo",
    companyNotFound: "Empresa no encontrada.",
    backToCompanies: "Volver a empresas",
    companies: "Empresas",
    addToCrm: "Añadir al CRM",
    addContact: "Añadir prospecto",
    findPeople: "Buscar prospectos aquí",
    addContactToast: "Añadir un prospecto a esta empresa",
    about: "Acerca de",
    buyingSignals: "Señales de compra",
    recentNews: "Noticias recientes",
    noNews: "No hay noticias recientes de esta cuenta.",
    openDeals: "Negocios abiertos",
    dealName: "Nombre del negocio",
    stage: "Etapa",
    value: "Valor",
    closeDate: "Fecha de cierre",
    noOpenDeals: "Sin negocios abiertos",
    contacts: "Prospectos",
    noContacts: "Aún no hay prospectos — añade algunos para empezar.",
    keyExecutives: "Ejecutivos clave",
    firmographics: "Firmográficos",
    industry: "Sector",
    employees: "Empleados",
    revenue: "Ingresos",
    location: "Ubicación",
    accountOwner: "Responsable de la cuenta",
    unassigned: "Sin asignar",
    crmCompany: "Empresa",
    crmWebsite: "Sitio web",
  },
} as const

function nameInitials(name: string): string {
  const [first, ...rest] = name.split(" ")
  return initials(first, rest.at(-1))
}

function healthTone(
  score: number,
  c: (typeof COPY)[keyof typeof COPY]
): {
  label: string
  className: string
} {
  if (score >= 80)
    return { label: c.healthHealthy, className: "bg-chart-1/15 text-chart-1" }
  if (score >= 65)
    return { label: c.healthAtWatch, className: "bg-chart-4/15 text-chart-4" }
  return { label: c.healthAtRisk, className: "bg-destructive/15 text-destructive" }
}

const STAGE_VARIANT: Record<
  DealStage,
  "default" | "secondary" | "outline" | "success" | "destructive"
> = {
  interested: "outline",
  meeting_booked: "secondary",
  needs_review: "secondary",
  qualified: "default",
  won: "success",
  not_interested: "destructive",
  disqualified: "destructive",
  lost: "destructive",
}

export default function CompanyDetail() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { id } = useParams()
  const account: Account | undefined = id ? getAccount(id) : undefined
  const [crmOpen, setCrmOpen] = React.useState(false)

  if (!account) {
    return (
      <Page>
        <p className="text-muted-foreground">{c.companyNotFound}</p>
        <BackLink to="/companies" label={c.backToCompanies} variant="link" />
      </Page>
    )
  }

  const health = healthTone(account.healthScore, c)
  const openDeals = deals.filter((d) => d.accountId === account.id)
  const contacts = prospects.filter(
    (p) => p.companyDomain === account.domain
  )
  const owner = getRep(account.ownerId)

  const firmographics = [
    { label: c.industry, value: account.industry },
    { label: c.employees, value: account.employees },
    { label: c.revenue, value: account.revenue },
    { label: c.location, value: account.location },
  ]

  return (
    <Page>
      <BackLink to="/companies" label={c.companies} />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start">
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-xl text-2xl font-semibold text-white"
            style={{ backgroundColor: account.logoColor }}
          >
            {account.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold">{account.name}</h1>
            <a
              href={`https://${account.domain}`}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary text-sm"
            >
              {account.domain}
            </a>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="font-normal">
                {account.tier}
              </Badge>
              <Badge
                className={`border-transparent font-medium ${health.className}`}
              >
                {health.label} · {account.healthScore}
              </Badge>
              <Badge variant="outline" className="font-normal">
                {account.industry}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="volt" onClick={() => setCrmOpen(true)}>
              <Building2 className="size-4" />
              {c.addToCrm}
            </Button>
            <TrackButton kind="account" id={account.id} name={account.name} />
            <Button variant="outline" asChild>
              <Link to={`/people?q=${encodeURIComponent(account.name)}`}>
                <Users className="size-4" />
                {c.findPeople}
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info(c.addContactToast)}
            >
              <Plus className="size-4" />
              {c.addContact}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.about}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {account.about}
              </p>
            </CardContent>
          </Card>

          <CompanyMetrics accountId={account.id} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="text-primary size-4" />
                {c.buyingSignals}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {account.signals.map((s) => (
                <div
                  key={s}
                  className="bg-chart-1/10 text-chart-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
                >
                  <span className="bg-current size-1.5 rounded-full" />
                  {s}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Newspaper className="text-muted-foreground size-4" />
                {c.recentNews}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {getCompanyNews(account.id).length > 0 ? (
                getCompanyNews(account.id).map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 rounded-md px-2 py-2"
                  >
                    <span
                      className={
                        n.sentiment === "negative"
                          ? "text-destructive mt-0.5"
                          : "text-chart-1 mt-0.5"
                      }
                    >
                      {n.sentiment === "negative" ? (
                        <TrendingDown className="size-4" />
                      ) : (
                        <TrendingUp className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {n.source} · {relativeTime(n.date)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">{c.noNews}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.openDeals}</CardTitle>
            </CardHeader>
            <CardContent>
              {openDeals.length > 0 ? (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>{c.dealName}</TableHead>
                      <TableHead>{c.stage}</TableHead>
                      <TableHead>{c.value}</TableHead>
                      <TableHead>{c.closeDate}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {openDeals.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.name}</TableCell>
                        <TableCell>
                          <Badge variant={STAGE_VARIANT[d.stage]}>
                            {DEAL_STAGES.find((s) => s.key === d.stage)?.label ??
                              d.stage}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium tabular-nums">
                          {money(d.value)}
                        </TableCell>
                        <TableCell className="text-muted-foreground tabular-nums">
                          {formatDate(d.closeDate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">{c.noOpenDeals}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.contacts}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {contacts.length > 0 ? (
                contacts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/prospects/${p.id}`}
                    className="hover:bg-muted/60 flex items-center gap-3 rounded-md px-2 py-2"
                  >
                    <ProspectAvatar prospect={p} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {p.title}
                      </p>
                    </div>
                    <ScoreBadge score={p.score} />
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">{c.noContacts}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.keyExecutives}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {account.keyExecutives.map((exec) => (
                <div key={exec.name} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                      {nameInitials(exec.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{exec.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {exec.title}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.firmographics}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {firmographics.map((f) => (
                  <div key={f.label}>
                    <p className="text-muted-foreground text-xs">{f.label}</p>
                    <p className="text-sm font-medium">{f.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{c.accountOwner}</CardTitle>
            </CardHeader>
            <CardContent>
              {owner ? (
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback
                      style={{ backgroundColor: owner.avatarColor, color: "white" }}
                      className="text-xs font-medium"
                    >
                      {nameInitials(owner.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{owner.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {owner.role}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">{c.unassigned}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddToCrmDialog
        open={crmOpen}
        onOpenChange={setCrmOpen}
        kind="company"
        recordId={account.id}
        recordName={account.name}
        accountName={account.name}
        fields={[
          { label: c.crmCompany, value: account.name },
          { label: c.crmWebsite, value: account.domain },
          { label: c.industry, value: account.industry },
          { label: c.employees, value: account.employees },
          { label: c.location, value: account.location },
        ]}
      />
    </Page>
  )
}
