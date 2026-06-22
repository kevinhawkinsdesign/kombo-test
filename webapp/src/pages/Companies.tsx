import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Search as SearchIcon,
  Plus,
  Briefcase,
  Users,
  Building2,
  Pencil,
  Check,
  Table2,
  LayoutGrid,
} from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { useLocale } from "@/lib/locale"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAccounts, accountStore } from "@/lib/store"
import { getRep } from "@/lib/team"
import { useView } from "@/lib/view-context"
import { initials, formatMoney as money } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Account, AccountTier } from "@/lib/types"

const ALL = "all"
const TIERS: (AccountTier | typeof ALL)[] = [ALL, "Enterprise", "Mid-market", "SMB"]
const TIER_VALUES: AccountTier[] = ["Enterprise", "Mid-market", "SMB"]

const COPY = {
  en: {
    title: "Companies",
    description: "Account intelligence across your book of business.",
    addCompany: "Add company",
    addCompanyToast: "Add company — coming soon",
    introTitle: "Target the accounts that fit",
    introDescription:
      "Track companies that match your ICP and get notified when something changes that's worth a call.",
    introPoints: [
      "See headcount, funding & tech stack",
      "Subscribe to hiring and growth signals",
      "Find the full buying committee",
      "Add a whole account to a list",
    ],
    searchPlaceholder: "Search by name, industry, or domain…",
    tier: "Tier",
    allTiers: "All tiers",
    company: "company",
    companies: "companies",
    noMatch: "No companies match your filters.",
    accountHealth: "Account health",
    openDeals: "Open deals",
    pipeline: "Pipeline",
    contacts: "Contacts",
    unassigned: "Unassigned",
    viewTable: "Table",
    viewCards: "Cards",
    edit: "Edit",
    done: "Done",
    editingHint: "Editing — changes save automatically",
    colCompany: "Company",
    colIndustry: "Industry",
    colTier: "Tier",
    colEmployees: "Employees",
    colHealth: "Health",
    colOwner: "Owner",
  },
  es: {
    title: "Empresas",
    description: "Inteligencia de cuentas en toda tu cartera de negocio.",
    addCompany: "Añadir empresa",
    addCompanyToast: "Añadir empresa — próximamente",
    introTitle: "Apunta a las cuentas que encajan",
    introDescription:
      "Sigue las empresas que coinciden con tu ICP y recibe avisos cuando cambie algo que merezca una llamada.",
    introPoints: [
      "Consulta plantilla, financiación y tecnología",
      "Suscríbete a señales de contratación y crecimiento",
      "Encuentra el comité de compra completo",
      "Añade una cuenta entera a una lista",
    ],
    searchPlaceholder: "Busca por nombre, sector o dominio…",
    tier: "Segmento",
    allTiers: "Todos los segmentos",
    company: "empresa",
    companies: "empresas",
    noMatch: "Ninguna empresa coincide con tus filtros.",
    accountHealth: "Salud de la cuenta",
    openDeals: "Negocios abiertos",
    pipeline: "Pipeline",
    contacts: "Contactos",
    unassigned: "Sin asignar",
    viewTable: "Tabla",
    viewCards: "Tarjetas",
    edit: "Editar",
    done: "Listo",
    editingHint: "Editando — los cambios se guardan solos",
    colCompany: "Empresa",
    colIndustry: "Sector",
    colTier: "Segmento",
    colEmployees: "Empleados",
    colHealth: "Salud",
    colOwner: "Responsable",
  },
} as const

function healthTone(score: number): string {
  if (score >= 80) return "bg-chart-1/15 text-chart-1"
  if (score >= 65) return "bg-chart-4/15 text-chart-4"
  return "bg-muted text-muted-foreground"
}

type ViewMode = "table" | "cards"

export default function Companies() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { impersonatingId } = useView()
  const accounts = useAccounts()
  const [query, setQuery] = React.useState("")
  const [tier, setTier] = React.useState<string>(ALL)
  const [view, setView] = React.useState<ViewMode>("table")
  const [editing, setEditing] = React.useState(false)

  const source = impersonatingId
    ? accounts.filter((a) => a.ownerId === impersonatingId)
    : accounts

  const q = query.trim().toLowerCase()
  const results = source.filter((a) => {
    const matchesQuery =
      !q || `${a.name} ${a.industry} ${a.domain}`.toLowerCase().includes(q)
    const matchesTier = tier === ALL || a.tier === tier
    return matchesQuery && matchesTier
  })

  return (
    <Page>
      <PageHeading
        title={c.title}
        description={c.description}
        action={
          <Button variant="volt" onClick={() => toast.info(c.addCompanyToast)}>
            <Plus className="size-4" />
            {c.addCompany}
          </Button>
        }
      />

      <FeatureIntro
        featureKey="companies"
        icon={Building2}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        className="mb-6"
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={c.searchPlaceholder}
            className="pl-9"
          />
        </div>
        <Select value={tier} onValueChange={setTier}>
          <SelectTrigger className="min-w-[150px]">
            <SelectValue placeholder={c.tier} />
          </SelectTrigger>
          <SelectContent>
            {TIERS.map((t) => (
              <SelectItem key={t} value={t}>
                {t === ALL ? c.allTiers : t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View toggle */}
        <div className="bg-muted text-muted-foreground inline-flex h-9 shrink-0 items-center rounded-lg p-[3px]">
          <ViewToggleButton
            active={view === "table"}
            onClick={() => setView("table")}
            icon={Table2}
            label={c.viewTable}
          />
          <ViewToggleButton
            active={view === "cards"}
            onClick={() => setView("cards")}
            icon={LayoutGrid}
            label={c.viewCards}
          />
        </div>

        {view === "table" && (
          <Button
            variant={editing ? "secondary" : "outline"}
            className="shrink-0"
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? (
              <>
                <Check className="size-4" />
                {c.done}
              </>
            ) : (
              <>
                <Pencil className="size-4" />
                {c.edit}
              </>
            )}
          </Button>
        )}
      </div>

      <div className="text-muted-foreground mb-3 flex items-center gap-2 text-sm">
        <span>
          <span className="text-foreground font-medium tabular-nums">
            {results.length}
          </span>{" "}
          {results.length === 1 ? c.company : c.companies}
        </span>
        {view === "table" && editing && (
          <span className="text-primary flex items-center gap-1 text-xs">
            <Pencil className="size-3" />
            {c.editingHint}
          </span>
        )}
      </div>

      {results.length === 0 ? (
        <div className="text-muted-foreground rounded-xl border border-dashed py-16 text-center text-sm">
          {c.noMatch}
        </div>
      ) : view === "table" ? (
        <CompaniesTable accounts={results} editing={editing} c={c} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((a) => (
            <CompanyCard key={a.id} account={a} />
          ))}
        </div>
      )}
    </Page>
  )
}

function ViewToggleButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-full items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors",
        active ? "bg-background text-foreground shadow-sm" : "hover:text-foreground"
      )}
    >
      <Icon className="size-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

type Copy = (typeof COPY)[keyof typeof COPY]

function CompaniesTable({
  accounts,
  editing,
  c,
}: {
  accounts: Account[]
  editing: boolean
  c: Copy
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">{c.colCompany}</TableHead>
              <TableHead>{c.colIndustry}</TableHead>
              <TableHead>{c.colTier}</TableHead>
              <TableHead className="hidden md:table-cell">
                {c.colEmployees}
              </TableHead>
              <TableHead className="hidden lg:table-cell">{c.pipeline}</TableHead>
              <TableHead>{c.colHealth}</TableHead>
              <TableHead className="hidden sm:table-cell">{c.colOwner}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((a) => (
              <CompanyRow key={a.id} account={a} editing={editing} c={c} />
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

function CompanyRow({
  account: a,
  editing,
  c,
}: {
  account: Account
  editing: boolean
  c: Copy
}) {
  const owner = getRep(a.ownerId)

  function update(patch: Partial<Account>) {
    accountStore.update(a.id, patch)
  }

  return (
    <TableRow>
      {/* Company */}
      <TableCell className="pl-4">
        <div className="flex items-center gap-3">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: a.logoColor }}
          >
            {a.name.charAt(0)}
          </span>
          {editing ? (
            <Input
              value={a.name}
              onChange={(e) => update({ name: e.target.value })}
              aria-label={c.colCompany}
              className="h-8 min-w-[140px]"
            />
          ) : (
            <div className="min-w-0">
              <Link
                to={`/companies/${a.id}`}
                className="truncate font-medium hover:underline"
              >
                {a.name}
              </Link>
              <p className="text-muted-foreground truncate text-xs">
                {a.domain}
              </p>
            </div>
          )}
        </div>
      </TableCell>

      {/* Industry */}
      <TableCell>
        {editing ? (
          <Input
            value={a.industry}
            onChange={(e) => update({ industry: e.target.value })}
            aria-label={c.colIndustry}
            className="h-8 min-w-[120px]"
          />
        ) : (
          <span className="text-muted-foreground text-sm">{a.industry}</span>
        )}
      </TableCell>

      {/* Tier */}
      <TableCell>
        {editing ? (
          <Select
            value={a.tier}
            onValueChange={(v) => update({ tier: v as AccountTier })}
          >
            <SelectTrigger size="sm" className="h-8 w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIER_VALUES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge variant="secondary" className="font-normal">
            {a.tier}
          </Badge>
        )}
      </TableCell>

      {/* Employees */}
      <TableCell className="hidden md:table-cell">
        {editing ? (
          <Input
            value={a.employees}
            onChange={(e) => update({ employees: e.target.value })}
            aria-label={c.colEmployees}
            className="h-8 w-[110px]"
          />
        ) : (
          <span className="text-muted-foreground text-sm tabular-nums">
            {a.employees}
          </span>
        )}
      </TableCell>

      {/* Pipeline (read-only) */}
      <TableCell className="hidden lg:table-cell">
        <span className="text-sm font-medium tabular-nums">
          {money(a.pipeline)}
        </span>
      </TableCell>

      {/* Health */}
      <TableCell>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
            healthTone(a.healthScore)
          )}
          title={c.accountHealth}
        >
          <span className="bg-current size-1.5 rounded-full opacity-80" />
          {a.healthScore}
        </span>
      </TableCell>

      {/* Owner */}
      <TableCell className="hidden sm:table-cell">
        {owner ? (
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarFallback
                style={{ backgroundColor: owner.avatarColor, color: "white" }}
                className="text-[10px] font-medium"
              >
                {initials(owner.name.split(" ")[0], owner.name.split(" ")[1])}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground text-xs">
              {owner.name.split(" ")[0]}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">{c.unassigned}</span>
        )}
      </TableCell>
    </TableRow>
  )
}

function CompanyCard({ account: a }: { account: Account }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const owner = getRep(a.ownerId)

  return (
    <Link
      to={`/companies/${a.id}`}
      className="hover:border-primary/40 flex flex-col rounded-xl border p-4 transition-colors"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-base font-semibold text-white"
          style={{ backgroundColor: a.logoColor }}
        >
          {a.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{a.name}</p>
          <p className="text-muted-foreground truncate text-sm">{a.domain}</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
            healthTone(a.healthScore)
          )}
          title={c.accountHealth}
        >
          <span className="bg-current size-1.5 rounded-full opacity-80" />
          {a.healthScore}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Badge variant="secondary" className="font-normal">
          {a.tier}
        </Badge>
        <span className="text-muted-foreground truncate text-xs">
          {a.industry}
        </span>
      </div>

      <div className="text-muted-foreground mt-3 grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-foreground font-semibold tabular-nums">
            {a.openDeals}
          </p>
          <p>{c.openDeals}</p>
        </div>
        <div>
          <p className="text-foreground font-semibold tabular-nums">
            {money(a.pipeline)}
          </p>
          <p>{c.pipeline}</p>
        </div>
        <div>
          <p className="text-foreground font-semibold tabular-nums">
            {a.contacts}
          </p>
          <p>{c.contacts}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {a.signals.slice(0, 2).map((signal) => (
          <Badge key={signal} variant="secondary" className="font-normal">
            {signal}
          </Badge>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-4">
        {owner ? (
          <>
            <Avatar className="size-6">
              <AvatarFallback
                style={{ backgroundColor: owner.avatarColor, color: "white" }}
                className="text-[10px] font-medium"
              >
                {initials(owner.name.split(" ")[0], owner.name.split(" ")[1])}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground text-xs">
              {owner.name.split(" ")[0]}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Users className="size-3.5" />
            {c.unassigned}
          </span>
        )}
        <Briefcase className="text-muted-foreground ml-auto size-3.5" />
      </div>
    </Link>
  )
}
