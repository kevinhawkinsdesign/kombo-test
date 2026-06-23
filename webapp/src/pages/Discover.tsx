import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Telescope,
  Sparkles,
  Plus,
  X,
  Check,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  ListPlus,
  Download,
} from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ViewToggle, type CollectionView } from "@/components/common/ViewToggle"
import { useLocale } from "@/lib/locale"
import { initials } from "@/lib/format"
import { portraitFor } from "@/lib/avatars"
import {
  lookalikeLeads,
  LOOKALIKE_SEEDS,
  EMPTY_QUERY,
  type AiLead,
  type LookalikeSeed,
} from "@/lib/mock-ai-search"
import { useLists, prospectStore, listStore } from "@/lib/store"
import { downloadCsv } from "@/lib/csv"

const COPY = {
  en: {
    title: "Discover",
    description:
      "An endless stream of prospects who look like the customers you already win — fresh every time.",
    introTitle: "Lookalikes of your best customers, on tap",
    introDescription:
      "Kombo studies the accounts you've closed and keeps surfacing net-new people who match. Add the good ones to a list, skip the rest — the feed never runs dry.",
    introPoints: [
      "Seeded from your won deals and champions",
      "Every card shows why it's a match",
      "Add to a list in one click, or dismiss to refine",
    ],
    basedOn: "Based on",
    allWins: "All my customers",
    similarTo: (name: string) => `Similar to ${name}`,
    addToList: "Add to list",
    chooseList: "Choose a list",
    noLists: "No lists yet",
    dismiss: "Not a fit",
    added: (name: string, list: string) => `${name} added to "${list}"`,
    loadMore: "Show more lookalikes",
    refreshing: "Finding lookalikes…",
    emailVerified: "Verified email",
    emailLikely: "Likely email",
    phone: "Direct dial",
    viewCards: "Cards",
    viewTable: "Table",
    exportLabel: "Export",
    exported: "Lookalikes exported to CSV",
    colName: "Prospect",
    colTitle: "Title",
    colCompany: "Company",
    colSimilar: "Similar to",
    colFit: "Fit",
    colContact: "Contact",
  },
  es: {
    title: "Descubrir",
    description:
      "Un flujo infinito de prospectos parecidos a los clientes que ya ganas — siempre fresco.",
    introTitle: "Lookalikes de tus mejores clientes, siempre a mano",
    introDescription:
      "Kombo estudia las cuentas que has cerrado y sigue mostrando personas nuevas que encajan. Añade las buenas a una lista y descarta el resto — el flujo nunca se agota.",
    introPoints: [
      "Basado en tus negocios ganados y campeones",
      "Cada tarjeta muestra por qué encaja",
      "Añade a una lista con un clic, o descártala para afinar",
    ],
    basedOn: "Basado en",
    allWins: "Todos mis clientes",
    similarTo: (name: string) => `Similar a ${name}`,
    addToList: "Añadir a lista",
    chooseList: "Elige una lista",
    noLists: "Aún no hay listas",
    dismiss: "No encaja",
    added: (name: string, list: string) => `${name} añadido a "${list}"`,
    loadMore: "Mostrar más lookalikes",
    refreshing: "Buscando lookalikes…",
    emailVerified: "Email verificado",
    emailLikely: "Email probable",
    phone: "Teléfono directo",
    viewCards: "Tarjetas",
    viewTable: "Tabla",
    exportLabel: "Exportar",
    exported: "Lookalikes exportados a CSV",
    colName: "Prospecto",
    colTitle: "Cargo",
    colCompany: "Empresa",
    colSimilar: "Similar a",
    colFit: "Encaje",
    colContact: "Contacto",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

interface FeedItem {
  key: string
  lead: AiLead
  seed: LookalikeSeed
}

const PAGE_SIZE = 6

// Build the next batch of lookalikes. With "all" selected we rotate through the
// customer seeds so the feed stays varied and effectively endless.
function buildBatch(seedId: string, batch: number): FeedItem[] {
  const seeds =
    seedId === "all"
      ? LOOKALIKE_SEEDS
      : LOOKALIKE_SEEDS.filter((s) => s.id === seedId)
  if (seeds.length === 0) return []
  const seed = seeds[batch % seeds.length]
  const leads = lookalikeLeads(seed, EMPTY_QUERY)
  if (leads.length === 0) return []
  // Window into the pool that advances each batch, wrapping for an endless feel.
  const start = (batch * PAGE_SIZE) % leads.length
  const picked: AiLead[] = []
  for (let i = 0; i < Math.min(PAGE_SIZE, leads.length); i++) {
    picked.push(leads[(start + i) % leads.length])
  }
  return picked.map((lead, i) => ({
    key: `${seed.id}-${lead.id}-${batch}-${i}`,
    lead,
    seed,
  }))
}

function similarChips(lead: AiLead): string[] {
  return [lead.industry, lead.region, lead.headcount].filter(Boolean)
}

function leadToProspectInput(l: AiLead) {
  const email =
    l.emailStatus === "missing"
      ? ""
      : `${l.firstName}.${l.lastName}@${l.companyDomain}`.toLowerCase()
  return {
    firstName: l.firstName,
    lastName: l.lastName,
    title: l.title,
    company: l.company,
    companyDomain: l.companyDomain,
    location: l.location,
    email,
    linkedinUrl:
      `https://linkedin.com/in/${l.firstName}${l.lastName}`.toLowerCase(),
    avatarColor: l.avatarColor,
    score: l.fit,
    status: "new" as const,
    tags: ["Lookalike", l.region],
    seniority: l.seniority,
    department: l.department,
    headcount: l.headcount,
    industry: l.industry,
    revenue: l.revenue,
    about: `${l.title} at ${l.company}.`,
    signals: l.signals,
  }
}

export default function Discover() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [seedId, setSeedId] = React.useState("all")
  const [batch, setBatch] = React.useState(1)
  const [items, setItems] = React.useState<FeedItem[]>(() =>
    buildBatch("all", 0)
  )
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set())
  const [addedKeys, setAddedKeys] = React.useState<Set<string>>(new Set())
  const [view, setView] = React.useState<CollectionView>("cards")

  // Reset the feed when the seed selection changes (adjusting state during
  // render — the React-recommended pattern).
  const [activeSeed, setActiveSeed] = React.useState(seedId)
  if (seedId !== activeSeed) {
    setActiveSeed(seedId)
    setItems(buildBatch(seedId, 0))
    setBatch(1)
    setDismissed(new Set())
    setAddedKeys(new Set())
  }

  function loadMore() {
    setItems((current) => [...current, ...buildBatch(seedId, batch)])
    setBatch((b) => b + 1)
  }

  const visible = items.filter((item) => !dismissed.has(item.key))
  const seedChips = [{ id: "all", name: c.allWins }, ...LOOKALIKE_SEEDS]

  function dismiss(key: string) {
    setDismissed((prev) => new Set(prev).add(key))
  }
  function markAdded(key: string) {
    setAddedKeys((prev) => new Set(prev).add(key))
  }

  function exportCsv() {
    downloadCsv(
      "kombo-lookalikes.csv",
      [c.colName, c.colTitle, c.colCompany, c.colSimilar, c.colFit, "Region"],
      visible.map((item) => [
        `${item.lead.firstName} ${item.lead.lastName}`,
        item.lead.title,
        item.lead.company,
        item.seed.name,
        `${item.lead.fit}%`,
        item.lead.region,
      ])
    )
    toast.success(c.exported)
  }

  return (
    <Page>
      <PageHeading title={c.title} description={c.description} />

      <FeatureIntro
        featureKey="discover"
        icon={Telescope}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        className="mb-6"
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Sparkles className="size-4" />
          {c.basedOn}:
        </span>
        {seedChips.map((seed) => {
          const active = seed.id === seedId
          return (
            <button
              key={seed.id}
              type="button"
              onClick={() => setSeedId(seed.id)}
              className={
                active
                  ? "bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-medium"
                  : "bg-muted text-muted-foreground hover:bg-muted/70 rounded-full px-3 py-1 text-sm"
              }
            >
              {seed.name}
            </button>
          )
        })}
        <div className="ml-auto flex items-center gap-2">
          <ViewToggle
            view={view}
            onChange={setView}
            cardsLabel={c.viewCards}
            tableLabel={c.viewTable}
          />
          <Button variant="outline" onClick={exportCsv}>
            <Download className="size-4" />
            <span className="hidden sm:inline">{c.exportLabel}</span>
          </Button>
        </div>
      </div>

      {view === "table" ? (
        <LeadTable
          items={visible}
          c={c}
          addedKeys={addedKeys}
          onDismiss={dismiss}
          onAdded={markAdded}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <LeadCard
              key={item.key}
              item={item}
              c={c}
              added={addedKeys.has(item.key)}
              onDismiss={() => dismiss(item.key)}
              onAdded={() => markAdded(item.key)}
            />
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Button variant="outline" onClick={loadMore}>
          <RefreshCw className="size-4" />
          {c.loadMore}
        </Button>
      </div>
    </Page>
  )
}

function LeadCard({
  item,
  c,
  added,
  onDismiss,
  onAdded,
}: {
  item: FeedItem
  c: Copy
  added: boolean
  onDismiss: () => void
  onAdded: () => void
}) {
  const { lead, seed } = item

  return (
    <Card className="relative h-full gap-3 p-4">
      <button
        type="button"
        aria-label={c.dismiss}
        onClick={onDismiss}
        className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-3 right-3 flex size-7 items-center justify-center rounded-md"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-center gap-3 pr-8">
        <Avatar className="size-10">
          <AvatarImage
            src={portraitFor(`${lead.firstName} ${lead.lastName}`)}
            alt=""
          />
          <AvatarFallback
            style={{ backgroundColor: lead.avatarColor, color: "white" }}
            className="text-xs"
          >
            {initials(lead.firstName, lead.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {lead.firstName} {lead.lastName}
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {lead.title} · {lead.company}
          </p>
        </div>
        <span className="bg-chart-1/15 text-chart-1 shrink-0 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums">
          {lead.fit}%
        </span>
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 p-0">
        <p className="text-primary flex items-center gap-1.5 text-xs font-medium">
          <Sparkles className="size-3.5" />
          {c.similarTo(seed.name)}
        </p>

        <div className="flex flex-wrap gap-1">
          {similarChips(lead).map((chip) => (
            <Badge key={chip} variant="secondary" className="font-normal">
              {chip}
            </Badge>
          ))}
        </div>

        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            {lead.location}
          </span>
          {lead.emailStatus !== "missing" && (
            <span className="text-chart-1 flex items-center gap-1">
              <Mail className="size-3.5" />
              {lead.emailStatus === "verified" ? c.emailVerified : c.emailLikely}
            </span>
          )}
          {lead.phoneStatus !== "none" && (
            <span className="flex items-center gap-1">
              <Phone className="size-3.5" />
              {c.phone}
            </span>
          )}
        </div>

        <div className="mt-auto pt-1">
          {added ? (
            <Button variant="secondary" size="sm" disabled className="w-full">
              <Check className="size-4" />
              {c.addToList}
            </Button>
          ) : (
            <AddToListMenu lead={lead} c={c} onAdded={onAdded} onDismiss={onDismiss}>
              <Button variant="volt" size="sm" className="w-full">
                <Plus className="size-4" />
                {c.addToList}
              </Button>
            </AddToListMenu>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function AddToListMenu({
  lead,
  c,
  onAdded,
  onDismiss,
  children,
}: {
  lead: AiLead
  c: Copy
  onAdded: () => void
  onDismiss: () => void
  children: React.ReactNode
}) {
  const navigate = useNavigate()
  const lists = useLists()

  function addToList(listId: string, listName: string) {
    const prospect = prospectStore.create(leadToProspectInput(lead))
    listStore.addProspects(listId, [prospect.id])
    onAdded()
    toast.success(c.added(`${lead.firstName} ${lead.lastName}`, listName), {
      action: {
        label: "View",
        onClick: () => navigate(`/lists/${listId}`),
      },
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{c.chooseList}</DropdownMenuLabel>
        {lists.length === 0 && (
          <p className="text-muted-foreground px-2 py-1.5 text-xs">
            {c.noLists}
          </p>
        )}
        {lists.map((list) => (
          <DropdownMenuItem
            key={list.id}
            onSelect={() => addToList(list.id, list.name)}
          >
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: list.color }}
            />
            {list.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onDismiss}>
          <ListPlus className="size-4" />
          {c.dismiss}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function LeadTable({
  items,
  c,
  addedKeys,
  onDismiss,
  onAdded,
}: {
  items: FeedItem[]
  c: Copy
  addedKeys: Set<string>
  onDismiss: (key: string) => void
  onAdded: (key: string) => void
}) {
  return (
    <Card className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{c.colName}</TableHead>
            <TableHead>{c.colTitle}</TableHead>
            <TableHead>{c.colCompany}</TableHead>
            <TableHead>{c.colSimilar}</TableHead>
            <TableHead className="text-right">{c.colFit}</TableHead>
            <TableHead>{c.colContact}</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const { lead, seed } = item
            const added = addedKeys.has(item.key)
            return (
              <TableRow key={item.key}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-7">
                      <AvatarImage
                        src={portraitFor(`${lead.firstName} ${lead.lastName}`)}
                        alt=""
                      />
                      <AvatarFallback
                        style={{
                          backgroundColor: lead.avatarColor,
                          color: "white",
                        }}
                        className="text-[10px]"
                      >
                        {initials(lead.firstName, lead.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {lead.firstName} {lead.lastName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {lead.title}
                </TableCell>
                <TableCell className="text-sm">{lead.company}</TableCell>
                <TableCell>
                  <span className="text-primary flex items-center gap-1 text-xs">
                    <Sparkles className="size-3" />
                    {seed.name}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="bg-chart-1/15 text-chart-1 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums">
                    {lead.fit}%
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground flex items-center gap-2 text-xs">
                    {lead.emailStatus !== "missing" && (
                      <Mail className="text-chart-1 size-3.5" />
                    )}
                    {lead.phoneStatus !== "none" && (
                      <Phone className="size-3.5" />
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    {added ? (
                      <Check className="text-chart-1 size-4" />
                    ) : (
                      <AddToListMenu
                        lead={lead}
                        c={c}
                        onAdded={() => onAdded(item.key)}
                        onDismiss={() => onDismiss(item.key)}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label={c.addToList}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </AddToListMenu>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground size-8"
                      aria-label={c.dismiss}
                      onClick={() => onDismiss(item.key)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
