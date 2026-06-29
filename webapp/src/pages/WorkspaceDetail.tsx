import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Plus,
  X,
  Search as SearchIcon,
  FolderKanban,
  Send,
  Users,
  Building2,
  Check,
} from "lucide-react"

import { Page } from "@/components/layout/Page"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import { useLists, useCampaigns } from "@/lib/store"
import { useSavedSearches } from "@/lib/mock-ai-search"
import {
  useWorkspace,
  useWorkspaces,
  workspaceStore,
  ownerOf,
  type WorkspaceItemKind,
} from "@/lib/workspaces"
import type { SavedAiSearch } from "@/lib/mock-ai-search"
import type { Campaign, ProspectList } from "@/lib/types"

const COPY = {
  en: {
    back: "Workspaces",
    untitled: "Untitled workspace",
    namePlaceholder: "Name this workspace…",
    searches: "Saved searches",
    lists: "Lists",
    campaigns: "Campaigns",
    add: "Add",
    remove: "Remove from workspace",
    emptySearches: "No searches yet.",
    emptyLists: "No lists yet.",
    emptyCampaigns: "No campaigns yet.",
    notFound: "Workspace not found.",
    people: "People",
    company: "Companies",
    results: (n: number) => `${n.toLocaleString()} results`,
    members: (n: number) => `${n.toLocaleString()} ${n === 1 ? "record" : "records"}`,
    enrolled: (n: number) => `${n.toLocaleString()} enrolled`,
    addSearches: "Add saved searches",
    addLists: "Add lists",
    addCampaigns: "Add campaigns",
    pickerEmpty: "Nothing to add yet.",
    inOther: (name: string) => `In "${name}"`,
    inOtherUntitled: "In another workspace",
    done: "Done",
  },
  es: {
    back: "Espacios de trabajo",
    untitled: "Espacio sin título",
    namePlaceholder: "Nombra este espacio…",
    searches: "Búsquedas guardadas",
    lists: "Listas",
    campaigns: "Campañas",
    add: "Añadir",
    remove: "Quitar del espacio",
    emptySearches: "Aún no hay búsquedas.",
    emptyLists: "Aún no hay listas.",
    emptyCampaigns: "Aún no hay campañas.",
    notFound: "Espacio de trabajo no encontrado.",
    people: "Personas",
    company: "Empresas",
    results: (n: number) => `${n.toLocaleString()} resultados`,
    members: (n: number) => `${n.toLocaleString()} ${n === 1 ? "registro" : "registros"}`,
    enrolled: (n: number) => `${n.toLocaleString()} inscritos`,
    addSearches: "Añadir búsquedas guardadas",
    addLists: "Añadir listas",
    addCampaigns: "Añadir campañas",
    pickerEmpty: "Nada que añadir todavía.",
    inOther: (name: string) => `En «${name}»`,
    inOtherUntitled: "En otro espacio",
    done: "Listo",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

function listCount(l: ProspectList): number {
  return l.kind === "company"
    ? (l.accountIds?.length ?? 0)
    : l.prospectIds.length
}

export default function WorkspaceDetail() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const workspace = useWorkspace(id)

  const allSearches = useSavedSearches()
  const allLists = useLists()
  const allCampaigns = useCampaigns()

  const [picker, setPicker] = React.useState<WorkspaceItemKind | null>(null)

  if (!workspace) {
    return (
      <Page>
        <BackLink label={c.back} />
        <Card className="text-muted-foreground p-10 text-center text-sm">
          {c.notFound}
        </Card>
      </Page>
    )
  }

  const searchById = new Map(allSearches.map((s) => [s.id, s]))
  const listById = new Map(allLists.map((l) => [l.id, l]))
  const campaignById = new Map(allCampaigns.map((cm) => [cm.id, cm]))

  const searches = workspace.searchIds
    .map((sid) => searchById.get(sid))
    .filter((s): s is SavedAiSearch => Boolean(s))
  const lists = workspace.listIds
    .map((lid) => listById.get(lid))
    .filter((l): l is ProspectList => Boolean(l))
  const campaigns = workspace.campaignIds
    .map((cid) => campaignById.get(cid))
    .filter((cm): cm is Campaign => Boolean(cm))

  return (
    <Page>
      <BackLink label={c.back} />

      <div className="mb-6 flex items-center gap-3">
        <span
          className="size-9 shrink-0 rounded-lg"
          style={{ backgroundColor: workspace.color }}
        />
        <Input
          value={workspace.name}
          onChange={(e) => workspaceStore.rename(workspace.id, e.target.value)}
          placeholder={c.namePlaceholder}
          aria-label={c.namePlaceholder}
          clearable={false}
          className="h-11 max-w-md border-transparent !text-xl font-semibold shadow-none hover:border-input focus-visible:border-input"
        />
      </div>

      <div className="space-y-6">
        <Section
          icon={SearchIcon}
          label={c.searches}
          count={searches.length}
          onAdd={() => setPicker("search")}
          addLabel={c.add}
          empty={c.emptySearches}
        >
          {searches.map((s) => (
            <Row
              key={s.id}
              onOpen={() =>
                navigate("/search", { state: { loadSearchId: s.id } })
              }
              onRemove={() =>
                workspaceStore.dissociate(workspace.id, "search", s.id)
              }
              removeLabel={c.remove}
              icon={SearchIcon}
              title={s.name || s.prompt}
              meta={
                <>
                  <Badge variant="secondary" className="font-normal">
                    {s.entity === "companies" ? c.company : c.people}
                  </Badge>
                  <span>{c.results(s.resultCount)}</span>
                </>
              }
            />
          ))}
        </Section>

        <Section
          icon={FolderKanban}
          label={c.lists}
          count={lists.length}
          onAdd={() => setPicker("list")}
          addLabel={c.add}
          empty={c.emptyLists}
        >
          {lists.map((l) => (
            <Row
              key={l.id}
              to={`/lists/${l.id}`}
              onRemove={() =>
                workspaceStore.dissociate(workspace.id, "list", l.id)
              }
              removeLabel={c.remove}
              dot={l.color}
              title={l.name}
              meta={
                <>
                  {l.kind === "company" ? (
                    <Building2 className="size-3.5" />
                  ) : (
                    <Users className="size-3.5" />
                  )}
                  <span>{c.members(listCount(l))}</span>
                </>
              }
            />
          ))}
        </Section>

        <Section
          icon={Send}
          label={c.campaigns}
          count={campaigns.length}
          onAdd={() => setPicker("campaign")}
          addLabel={c.add}
          empty={c.emptyCampaigns}
        >
          {campaigns.map((cm) => (
            <Row
              key={cm.id}
              to={`/campaigns/${cm.id}`}
              onRemove={() =>
                workspaceStore.dissociate(workspace.id, "campaign", cm.id)
              }
              removeLabel={c.remove}
              icon={Send}
              title={cm.name}
              meta={
                <>
                  <Badge variant="secondary" className="font-normal capitalize">
                    {cm.status}
                  </Badge>
                  <span>{c.enrolled(cm.enrolled)}</span>
                </>
              }
            />
          ))}
        </Section>
      </div>

      {picker && (
        <AddItemsDialog
          kind={picker}
          workspaceId={workspace.id}
          onOpenChange={(open) => !open && setPicker(null)}
          c={c}
          searches={allSearches}
          lists={allLists}
          campaigns={allCampaigns}
        />
      )}
    </Page>
  )
}

function BackLink({ label }: { label: string }) {
  return (
    <Link
      to="/workspaces"
      className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
    >
      <ArrowLeft className="size-4" />
      {label}
    </Link>
  )
}

function Section({
  icon: Icon,
  label,
  count,
  onAdd,
  addLabel,
  empty,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  count: number
  onAdd: () => void
  addLabel: string
  empty: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Icon className="text-muted-foreground size-4" />
        <h2 className="text-sm font-semibold">{label}</h2>
        <Badge variant="secondary" className="tabular-nums">
          {count}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={onAdd}
        >
          <Plus className="size-4" />
          {addLabel}
        </Button>
      </div>
      {count === 0 ? (
        <Card className="text-muted-foreground p-6 text-center text-xs">
          {empty}
        </Card>
      ) : (
        <Card className="gap-0 overflow-hidden py-0">{children}</Card>
      )}
    </div>
  )
}

function Row({
  to,
  onOpen,
  onRemove,
  removeLabel,
  icon: Icon,
  dot,
  title,
  meta,
}: {
  to?: string
  onOpen?: () => void
  onRemove: () => void
  removeLabel: string
  icon?: React.ComponentType<{ className?: string }>
  dot?: string
  title: string
  meta: React.ReactNode
}) {
  const body = (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      {dot ? (
        <span
          className="size-7 shrink-0 rounded-md"
          style={{ backgroundColor: dot }}
        />
      ) : Icon ? (
        <span className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-md">
          <Icon className="size-3.5" />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2 text-xs">
          {meta}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex items-center gap-2 border-b px-4 py-3 last:border-b-0">
      {to ? (
        <Link to={to} className="hover:opacity-80 flex min-w-0 flex-1">
          {body}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="hover:opacity-80 flex min-w-0 flex-1 text-left"
        >
          {body}
        </button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive size-8 shrink-0"
        aria-label={removeLabel}
        onClick={onRemove}
      >
        <X className="size-4" />
      </Button>
    </div>
  )
}

function AddItemsDialog({
  kind,
  workspaceId,
  onOpenChange,
  c,
  searches,
  lists,
  campaigns,
}: {
  kind: WorkspaceItemKind
  workspaceId: string
  onOpenChange: (open: boolean) => void
  c: Copy
  searches: SavedAiSearch[]
  lists: ProspectList[]
  campaigns: Campaign[]
}) {
  const workspaces = useWorkspaces()

  const title =
    kind === "search" ? c.addSearches : kind === "list" ? c.addLists : c.addCampaigns

  const items: { id: string; label: string }[] =
    kind === "search"
      ? searches.map((s) => ({ id: s.id, label: s.name || s.prompt }))
      : kind === "list"
        ? lists.map((l) => ({ id: l.id, label: l.name }))
        : campaigns.map((cm) => ({ id: cm.id, label: cm.name }))

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>

        {items.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            {c.pickerEmpty}
          </p>
        ) : (
          <div className="-mx-2 max-h-[55vh] space-y-0.5 overflow-y-auto px-2">
            {items.map((it) => {
              const owner = ownerOf(workspaces, kind, it.id)
              const inThis = owner?.id === workspaceId
              const inOther = owner && !inThis
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() =>
                    inThis
                      ? workspaceStore.dissociate(workspaceId, kind, it.id)
                      : workspaceStore.associate(workspaceId, kind, it.id)
                  }
                  className="hover:bg-muted/60 flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left"
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-md border",
                      inThis
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input"
                    )}
                  >
                    {inThis && <Check className="size-3.5" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">{it.label}</span>
                  {inOther && (
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {owner.name ? c.inOther(owner.name) : c.inOtherUntitled}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {c.done}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
