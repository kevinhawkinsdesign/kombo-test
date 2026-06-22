import * as React from "react"
import { toast } from "sonner"
import {
  Zap,
  Mail,
  Phone,
  Database,
  Download,
  Sparkles,
  CalendarClock,
  Users,
  HelpCircle,
  Receipt,
} from "lucide-react"

import { useLocale } from "@/lib/locale"
import { Page, PageHeading } from "@/components/layout/Page"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCredits, type CreditCategory } from "@/lib/credits"
import { TopUpDialog } from "@/components/credits/TopUpDialog"
import { ENRICH_COST_PER_CONTACT } from "@/lib/enrichment"
import {
  teammateUsage,
  teammateTotal,
  usageToCsv,
  downloadFile,
} from "@/lib/mock-credits"
import { formatDate, relativeTime } from "@/lib/format"

const COPY = {
  en: {
    title: "Usage & credits",
    description: "Track your balance, see where credits go, and plan ahead.",
    topUp: "Add credits",
    tabOverview: "Overview",
    tabTeam: "By teammate",
    tabCosts: "Cost guide",
    tabHistory: "History",
    tabFaq: "FAQ",
    // Overview
    availableBalance: "Available balance",
    credits: "credits",
    creditsUsed: (used: string, allowance: string) =>
      `${used} of ${allowance} monthly credits used`,
    resets: (date: string) => `Resets ${date}`,
    usedThisMonth: "Used this month",
    remaining: "Remaining",
    monthlyAllowance: "Monthly allowance",
    expiringNote: (date: string) =>
      `Unused monthly credits don't roll over — they reset on ${date}.`,
    byType: "Usage by type",
    byTypeDesc: "Where your credits went this cycle",
    noUsage: "No credits used yet this cycle.",
    // Categories
    catEmail: "Email reveals",
    catPhone: "Phone reveals",
    catEnrichment: "Enrichment",
    catExport: "Exports",
    catAi: "AI search",
    catTopup: "Top-ups",
    // Team
    teamTitle: "Credits by teammate",
    teamDesc: "Consumption per seat this cycle",
    teammate: "Teammate",
    reveals: "Reveals",
    exportsCol: "Exports",
    total: "Total",
    exportCsv: "Export CSV",
    exported: "Exported to CSV",
    // Cost guide
    costsTitle: "What credits cost",
    costsDesc: "Credits are only charged on success — never for a miss.",
    action: "Action",
    unit: "Unit",
    cost: "Cost",
    perContact: "per contact",
    perExport: "per record",
    perReveal: "per reveal",
    perSearch: "per search",
    free: "Free",
    costEmail: "Verified email reveal",
    costPhone: "Direct dial / mobile reveal",
    costEnrich: "Full enrichment (30+ data points)",
    costExport: "Export to CSV or CRM",
    costAi: "AI lookalike / prompt search",
    costSearch: "Standard filtered search",
    costsFootnote:
      "A contact is only ever charged once — re-revealing or re-enriching the same person is free.",
    // History
    historyTitle: "Credit history",
    historyDesc: "Every credit-consuming activity, newest first",
    activity: "Activity",
    category: "Category",
    creditsCol: "Credits",
    when: "When",
    // FAQ
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "What is a credit?",
        a: "A credit is the unit Kombo charges for revealing or enriching contact data. One verified email costs 1 credit; a direct dial costs 2.",
      },
      {
        q: "Do unused credits roll over?",
        a: "Monthly plan credits reset at the start of each cycle. Credits you buy as a top-up never expire.",
      },
      {
        q: "Am I charged if data isn't found?",
        a: "No. Credits are only deducted when we return a verified result. Misses are always free.",
      },
      {
        q: "What happens if I run out?",
        a: "Reveals and enrichment pause until your cycle resets or you add more credits. Nothing else in Kombo is affected.",
      },
      {
        q: "Can I enrich a whole list at once?",
        a: "Yes — enrichment runs up to 1,000 contacts at a time, and you'll always see the exact cost before confirming.",
      },
    ],
  },
  es: {
    title: "Uso y créditos",
    description: "Controla tu saldo, mira a dónde van los créditos y planifica.",
    topUp: "Añadir créditos",
    tabOverview: "Resumen",
    tabTeam: "Por miembro",
    tabCosts: "Guía de costos",
    tabHistory: "Historial",
    tabFaq: "Preguntas",
    availableBalance: "Saldo disponible",
    credits: "créditos",
    creditsUsed: (used: string, allowance: string) =>
      `${used} de ${allowance} créditos mensuales usados`,
    resets: (date: string) => `Se restablece el ${date}`,
    usedThisMonth: "Usados este mes",
    remaining: "Restantes",
    monthlyAllowance: "Asignación mensual",
    expiringNote: (date: string) =>
      `Los créditos mensuales no usados no se acumulan — se restablecen el ${date}.`,
    byType: "Uso por tipo",
    byTypeDesc: "A dónde fueron tus créditos este ciclo",
    noUsage: "Aún no se han usado créditos este ciclo.",
    catEmail: "Correos revelados",
    catPhone: "Teléfonos revelados",
    catEnrichment: "Enriquecimiento",
    catExport: "Exportaciones",
    catAi: "Búsqueda con IA",
    catTopup: "Recargas",
    teamTitle: "Créditos por miembro",
    teamDesc: "Consumo por asiento este ciclo",
    teammate: "Miembro",
    reveals: "Revelados",
    exportsCol: "Exportaciones",
    total: "Total",
    exportCsv: "Exportar CSV",
    exported: "Exportado a CSV",
    costsTitle: "Cuánto cuestan los créditos",
    costsDesc: "Solo se cobran créditos cuando hay éxito — nunca por un fallo.",
    action: "Acción",
    unit: "Unidad",
    cost: "Costo",
    perContact: "por contacto",
    perExport: "por registro",
    perReveal: "por revelación",
    perSearch: "por búsqueda",
    free: "Gratis",
    costEmail: "Correo verificado revelado",
    costPhone: "Teléfono directo / móvil revelado",
    costEnrich: "Enriquecimiento completo (más de 30 datos)",
    costExport: "Exportar a CSV o CRM",
    costAi: "Búsqueda IA por similitud / prompt",
    costSearch: "Búsqueda filtrada estándar",
    costsFootnote:
      "Un contacto solo se cobra una vez — volver a revelar o enriquecer a la misma persona es gratis.",
    historyTitle: "Historial de créditos",
    historyDesc: "Toda actividad que consume créditos, lo más reciente primero",
    activity: "Actividad",
    category: "Categoría",
    creditsCol: "Créditos",
    when: "Cuándo",
    faqTitle: "Preguntas frecuentes",
    faq: [
      {
        q: "¿Qué es un crédito?",
        a: "Un crédito es la unidad que Kombo cobra por revelar o enriquecer datos de contacto. Un correo verificado cuesta 1 crédito; un teléfono directo cuesta 2.",
      },
      {
        q: "¿Los créditos no usados se acumulan?",
        a: "Los créditos del plan mensual se restablecen al inicio de cada ciclo. Los créditos que compras como recarga nunca caducan.",
      },
      {
        q: "¿Me cobran si no se encuentra el dato?",
        a: "No. Los créditos solo se descuentan cuando devolvemos un resultado verificado. Los fallos siempre son gratis.",
      },
      {
        q: "¿Qué pasa si me quedo sin créditos?",
        a: "Las revelaciones y el enriquecimiento se pausan hasta que el ciclo se restablezca o añadas más créditos. Nada más en Kombo se ve afectado.",
      },
      {
        q: "¿Puedo enriquecer una lista entera de una vez?",
        a: "Sí — el enriquecimiento procesa hasta 1.000 contactos a la vez, y siempre verás el costo exacto antes de confirmar.",
      },
    ],
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

const CATEGORY_META: Record<
  CreditCategory,
  { icon: typeof Mail; color: string; key: keyof Copy }
> = {
  email: { icon: Mail, color: "var(--chart-1)", key: "catEmail" },
  phone: { icon: Phone, color: "var(--chart-2)", key: "catPhone" },
  enrichment: { icon: Database, color: "var(--chart-3)", key: "catEnrichment" },
  export: { icon: Download, color: "var(--chart-4)", key: "catExport" },
  ai: { icon: Sparkles, color: "var(--chart-5)", key: "catAi" },
  topup: { icon: Zap, color: "var(--chart-1)", key: "catTopup" },
}

export default function Usage() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { balance, monthlyAllowance, resetsAt, usage } = useCredits()
  const [topUpOpen, setTopUpOpen] = React.useState(false)

  const used = monthlyAllowance - balance
  const usedPct = Math.min(100, Math.max(0, (used / monthlyAllowance) * 100))
  const resetLabel = formatDate(resetsAt)

  return (
    <Page>
      <PageHeading
        title={c.title}
        description={c.description}
        action={
          <Button variant="volt" onClick={() => setTopUpOpen(true)}>
            <Zap className="size-4" />
            {c.topUp}
          </Button>
        }
      />

      <Tabs defaultValue="overview" className="gap-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">
            <Receipt className="size-4" />
            {c.tabOverview}
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="size-4" />
            {c.tabTeam}
          </TabsTrigger>
          <TabsTrigger value="costs">
            <Zap className="size-4" />
            {c.tabCosts}
          </TabsTrigger>
          <TabsTrigger value="history">
            <CalendarClock className="size-4" />
            {c.tabHistory}
          </TabsTrigger>
          <TabsTrigger value="faq">
            <HelpCircle className="size-4" />
            {c.tabFaq}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab
            c={c}
            balance={balance}
            monthlyAllowance={monthlyAllowance}
            used={used}
            usedPct={usedPct}
            resetLabel={resetLabel}
            usage={usage}
          />
        </TabsContent>

        <TabsContent value="team">
          <TeamTab c={c} />
        </TabsContent>

        <TabsContent value="costs">
          <CostsTab c={c} />
        </TabsContent>

        <TabsContent value="history">
          <HistoryTab c={c} usage={usage} />
        </TabsContent>

        <TabsContent value="faq">
          <FaqTab c={c} />
        </TabsContent>
      </Tabs>

      <TopUpDialog open={topUpOpen} onOpenChange={setTopUpOpen} />
    </Page>
  )
}

function OverviewTab({
  c,
  balance,
  monthlyAllowance,
  used,
  usedPct,
  resetLabel,
  usage,
}: {
  c: Copy
  balance: number
  monthlyAllowance: number
  used: number
  usedPct: number
  resetLabel: string
  usage: ReturnType<typeof useCredits>["usage"]
}) {
  const stats = [
    { label: c.usedThisMonth, value: used },
    { label: c.remaining, value: balance },
    { label: c.monthlyAllowance, value: monthlyAllowance },
  ]

  // Sum spend (positive amounts only) per category for the breakdown.
  const byCategory = React.useMemo(() => {
    const totals = new Map<CreditCategory, number>()
    for (const item of usage) {
      if (item.amount <= 0 || !item.category || item.category === "topup") continue
      totals.set(item.category, (totals.get(item.category) ?? 0) + item.amount)
    }
    return Array.from(totals.entries())
      .map(([cat, amount]) => ({ cat, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [usage])

  const breakdownTotal = byCategory.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardDescription>{c.availableBalance}</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">
            {balance.toLocaleString()}{" "}
            <span className="text-muted-foreground text-base font-normal">
              {c.credits}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={usedPct} />
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <p className="text-muted-foreground text-sm tabular-nums">
              {c.creditsUsed(
                used.toLocaleString(),
                monthlyAllowance.toLocaleString()
              )}
            </p>
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <CalendarClock className="size-3.5" />
              {c.resets(resetLabel)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {stat.value.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{c.byType}</CardTitle>
          <CardDescription>{c.byTypeDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {byCategory.length === 0 ? (
            <p className="text-muted-foreground text-sm">{c.noUsage}</p>
          ) : (
            byCategory.map(({ cat, amount }) => {
              const meta = CATEGORY_META[cat]
              const Icon = meta.icon
              const pct = breakdownTotal > 0 ? (amount / breakdownTotal) * 100 : 0
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Icon className="size-4" style={{ color: meta.color }} />
                      {c[meta.key] as string}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {amount.toLocaleString()} {c.credits}
                    </span>
                  </div>
                  <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: meta.color }}
                    />
                  </div>
                </div>
              )
            })
          )}
          <p className="text-muted-foreground border-t pt-3 text-xs">
            {c.expiringNote(resetLabel)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function TeamTab({ c }: { c: Copy }) {
  const rows = [...teammateUsage].sort(
    (a, b) => teammateTotal(b) - teammateTotal(a)
  )
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle>{c.teamTitle}</CardTitle>
          <CardDescription>{c.teamDesc}</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success(c.exported)}
        >
          <Download className="size-4" />
          {c.exportCsv}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{c.teammate}</TableHead>
              <TableHead className="text-right">{c.reveals}</TableHead>
              <TableHead className="text-right">{c.catEnrichment}</TableHead>
              <TableHead className="text-right">{c.exportsCol}</TableHead>
              <TableHead className="text-right">{c.catAi}</TableHead>
              <TableHead className="text-right">{c.total}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex size-7 items-center justify-center rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: t.avatarColor }}
                    >
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.name}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {t.reveals}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {t.enrichment}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {t.exports}
                </TableCell>
                <TableCell className="text-right tabular-nums">{t.ai}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {teammateTotal(t).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function CostsTab({ c }: { c: Copy }) {
  const costs: { icon: typeof Mail; label: string; unit: string; cost: string }[] = [
    { icon: Mail, label: c.costEmail, unit: c.perReveal, cost: "1" },
    { icon: Phone, label: c.costPhone, unit: c.perReveal, cost: "2" },
    {
      icon: Database,
      label: c.costEnrich,
      unit: c.perContact,
      cost: String(ENRICH_COST_PER_CONTACT),
    },
    { icon: Download, label: c.costExport, unit: c.perExport, cost: "1" },
    { icon: Sparkles, label: c.costAi, unit: c.perSearch, cost: "5" },
    { icon: Receipt, label: c.costSearch, unit: c.perSearch, cost: c.free },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>{c.costsTitle}</CardTitle>
        <CardDescription>{c.costsDesc}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{c.action}</TableHead>
              <TableHead>{c.unit}</TableHead>
              <TableHead className="text-right">{c.cost}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costs.map((row) => {
              const Icon = row.icon
              const isFree = row.cost === c.free
              return (
                <TableRow key={row.label}>
                  <TableCell>
                    <span className="flex items-center gap-2 font-medium">
                      <Icon className="text-muted-foreground size-4" />
                      {row.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {row.unit}
                  </TableCell>
                  <TableCell className="text-right">
                    {isFree ? (
                      <Badge variant="success" className="font-normal">
                        {c.free}
                      </Badge>
                    ) : (
                      <span className="font-semibold tabular-nums">
                        {row.cost} {c.credits}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <p className="text-muted-foreground mt-4 text-xs">{c.costsFootnote}</p>
      </CardContent>
    </Card>
  )
}

function HistoryTab({
  c,
  usage,
}: {
  c: Copy
  usage: ReturnType<typeof useCredits>["usage"]
}) {
  function handleExport() {
    downloadFile("kombo-credit-history.csv", usageToCsv(usage))
    toast.success(c.exported)
  }
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle>{c.historyTitle}</CardTitle>
          <CardDescription>{c.historyDesc}</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="size-4" />
          {c.exportCsv}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{c.activity}</TableHead>
              <TableHead>{c.category}</TableHead>
              <TableHead className="text-right">{c.creditsCol}</TableHead>
              <TableHead className="text-right">{c.when}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usage.map((item) => {
              const added = item.amount < 0 // negative = credits added
              const meta = item.category
                ? CATEGORY_META[item.category]
                : undefined
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.label}</TableCell>
                  <TableCell>
                    {meta && (
                      <Badge variant="secondary" className="gap-1 font-normal">
                        <meta.icon
                          className="size-3"
                          style={{ color: meta.color }}
                        />
                        {c[meta.key] as string}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell
                    className={
                      added
                        ? "text-chart-1 text-right tabular-nums"
                        : "text-destructive/80 text-right tabular-nums"
                    }
                  >
                    {added ? "+" : "-"}
                    {Math.abs(item.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right tabular-nums">
                    {relativeTime(item.timestamp)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function FaqTab({ c }: { c: Copy }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{c.faqTitle}</CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        {c.faq.map((item) => (
          <div key={item.q} className="py-4 first:pt-0 last:pb-0">
            <p className="flex items-start gap-2 text-sm font-medium">
              <HelpCircle className="text-primary mt-0.5 size-4 shrink-0" />
              {item.q}
            </p>
            <p className="text-muted-foreground mt-1.5 pl-6 text-sm">{item.a}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
