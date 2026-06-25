import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Plus,
  Users,
  FolderKanban,
  Upload,
  MoreHorizontal,
  Pencil,
  Trash2,
  Sparkles,
  RefreshCw,
  Zap,
  Database,
  Building2,
} from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { useLocale } from "@/lib/locale"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { ProspectAvatar } from "@/components/common/ProspectBits"
import { ImportCsvDialog } from "@/components/lists/ImportCsvDialog"
import { ListFormDialog } from "@/components/lists/ListFormDialog"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { CollectionToolbar } from "@/components/common/CollectionToolbar"
import type { CollectionView } from "@/components/common/ViewToggle"
import { getProspect } from "@/lib/mock-data"
import { getAccount } from "@/lib/mock-extra"
import { useLists, listStore } from "@/lib/store"
import { downloadCsv } from "@/lib/csv"
import { isEnriched } from "@/lib/enrichment"
import { formatDate } from "@/lib/format"
import type { ProspectList } from "@/lib/types"

const COPY = {
  en: {
    sourceLinkedin: "LinkedIn",
    sourceSalesnav: "Sales Navigator",
    sourceCsv: "CSV import",
    sourceSearch: "Saved search",
    perWeek: "/week",
    autoEnriched: "Auto-enriched",
    enrichedOnce: "Enriched once",
    autoSending: "Auto-sending",
    title: "Lists & playlists",
    description:
      "The home base for your prospects — and the engine that keeps them flowing.",
    importCsv: "Import CSV",
    newList: "New list",
    buildPlaylist: "Build a playlist",
    introTitle: "Playlists: lists that fill, enrich, and reach out on their own",
    introDescription:
      "A playlist is a saved search that keeps adding matching prospects, enriches them, and auto-enrolls them into outreach — so your pipeline builds itself.",
    introPoints: [
      "Saved search drips in new matching prospects",
      "Enrich once or keep data fresh continuously",
      "Auto-enroll new prospects into a sequence",
      "Or build a simple static list or CSV import",
    ],
    openList: (name: string) => `Open ${name}`,
    listActions: "List actions",
    edit: "Edit",
    delete: "Delete",
    live: "Live",
    synced: (date: string) => `Synced ${date}`,
    created: (date: string) => `Created ${date}`,
    deleteTitle: "Delete list?",
    deleteDescription: (name: string) =>
      `"${name}" will be permanently removed. Prospects stay in your workspace.`,
    deleteConfirm: "Delete",
    listDeleted: "List deleted",
    imported: (count: number) =>
      `${count} prospects imported into a new list`,
    needEnrich: (count: number) => `${count} to enrich`,
    peopleList: "People",
    companyList: "Companies",
    search: "Search lists…",
    viewCards: "Cards",
    viewTable: "Table",
    exportLabel: "Export",
    exported: "Lists exported to CSV",
    noResults: "No lists match your search.",
    sortDefault: "Playlists first",
    sortName: "Name (A–Z)",
    sortMembers: "Most members",
    sortRecent: "Newest",
    colName: "List",
    colType: "Type",
    colSource: "Source",
    colMembers: "Members",
    colCreated: "Created",
  },
  es: {
    sourceLinkedin: "LinkedIn",
    sourceSalesnav: "Sales Navigator",
    sourceCsv: "Importación CSV",
    sourceSearch: "Búsqueda guardada",
    perWeek: "/semana",
    autoEnriched: "Enriquecida automáticamente",
    enrichedOnce: "Enriquecida una vez",
    autoSending: "Envío automático",
    title: "Listas y playlists",
    description:
      "El centro de operaciones de tus prospectos — y el motor que mantiene el flujo.",
    importCsv: "Importar CSV",
    newList: "Nueva lista",
    buildPlaylist: "Crear playlist",
    introTitle: "Playlists: listas que se llenan, enriquecen y contactan solas",
    introDescription:
      "Una playlist es una búsqueda guardada que sigue añadiendo prospectos que coinciden, los enriquece y los inscribe automáticamente en el contacto — para que tu pipeline se construya solo.",
    introPoints: [
      "La búsqueda guardada añade nuevos prospectos que coinciden",
      "Enriquece una vez o mantén los datos actualizados de forma continua",
      "Inscribe automáticamente a los nuevos prospectos en una secuencia",
      "O crea una lista estática simple o importa un CSV",
    ],
    openList: (name: string) => `Abrir ${name}`,
    listActions: "Acciones de la lista",
    edit: "Editar",
    delete: "Eliminar",
    live: "En vivo",
    synced: (date: string) => `Sincronizada ${date}`,
    created: (date: string) => `Creada ${date}`,
    deleteTitle: "¿Eliminar lista?",
    deleteDescription: (name: string) =>
      `"${name}" se eliminará de forma permanente. Los prospectos permanecen en tu espacio de trabajo.`,
    deleteConfirm: "Eliminar",
    listDeleted: "Lista eliminada",
    imported: (count: number) =>
      `${count} prospectos importados a una nueva lista`,
    needEnrich: (count: number) => `${count} por enriquecer`,
    peopleList: "Personas",
    companyList: "Empresas",
    search: "Buscar listas…",
    viewCards: "Tarjetas",
    viewTable: "Tabla",
    exportLabel: "Exportar",
    exported: "Listas exportadas a CSV",
    noResults: "Ninguna lista coincide con tu búsqueda.",
    sortDefault: "Playlists primero",
    sortName: "Nombre (A–Z)",
    sortMembers: "Más miembros",
    sortRecent: "Más recientes",
    colName: "Lista",
    colType: "Tipo",
    colSource: "Origen",
    colMembers: "Miembros",
    colCreated: "Creada",
  },
} as const

function DynamicChips({ list }: { list: ProspectList }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  if (!list.dynamic) return null
  const autoSend = Boolean(list.campaignId) && list.sendMode === "continuous"
  return (
    <div className="flex flex-wrap items-center gap-1.5 px-6">
      {typeof list.newPerWeek === "number" && (
        <Badge variant="secondary" className="gap-1 font-normal">
          <RefreshCw className="size-3" />~{list.newPerWeek}
          {c.perWeek}
        </Badge>
      )}
      <Badge variant="secondary" className="gap-1 font-normal">
        <Sparkles className="size-3" />
        {list.enrichment === "continuous" ? c.autoEnriched : c.enrichedOnce}
      </Badge>
      {autoSend && (
        <Badge variant="secondary" className="text-chart-1 gap-1 font-normal">
          <Zap className="size-3" />
          {c.autoSending}
        </Badge>
      )}
    </div>
  )
}

export default function Lists() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const lists = useLists()
  const [importOpen, setImportOpen] = React.useState(false)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingList, setEditingList] = React.useState<ProspectList | undefined>(
    undefined
  )
  const [deletingList, setDeletingList] = React.useState<
    ProspectList | undefined
  >(undefined)
  const [view, setView] = React.useState<CollectionView>("cards")
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState("default")

  function openCreate() {
    setEditingList(undefined)
    setFormOpen(true)
  }

  function openEdit(list: ProspectList) {
    setEditingList(list)
    setFormOpen(true)
  }

  const memberCountOf = (list: ProspectList) =>
    list.kind === "company"
      ? list.accountIds?.length ?? 0
      : list.prospectIds.length

  const sortedLists = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? lists.filter(
          (l) =>
            l.name.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q)
        )
      : lists
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name)
        case "members":
          return memberCountOf(b) - memberCountOf(a)
        case "recent":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        default:
          // Dynamic "playlists" lead — they're the flagship way to work.
          return Number(Boolean(b.dynamic)) - Number(Boolean(a.dynamic))
      }
    })
    return sorted
  }, [lists, query, sort])

  function exportCsv() {
    downloadCsv(
      "kombo-lists.csv",
      [c.colName, c.colType, c.colSource, c.colMembers, c.colCreated],
      sortedLists.map((l) => [
        l.name,
        l.kind === "company" ? c.companyList : c.peopleList,
        l.source,
        memberCountOf(l),
        formatDate(l.createdAt),
      ])
    )
    toast.success(c.exported)
  }

  return (
    <Page>
      <PageHeading
        title={c.title}
        description={c.description}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setImportOpen(true)}>
              <Upload className="size-4" />
              {c.importCsv}
            </Button>
            <Button variant="volt" onClick={openCreate}>
              <Plus className="size-4" />
              {c.newList}
            </Button>
          </div>
        }
      />

      <FeatureIntro
        featureKey="lists"
        icon={Sparkles}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            {c.newList}
          </Button>
        }
        className="mb-6"
      />

      <CollectionToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder={c.search}
        sort={sort}
        onSortChange={setSort}
        sortOptions={[
          { value: "default", label: c.sortDefault },
          { value: "name", label: c.sortName },
          { value: "members", label: c.sortMembers },
          { value: "recent", label: c.sortRecent },
        ]}
        view={view}
        onViewChange={setView}
        cardsLabel={c.viewCards}
        tableLabel={c.viewTable}
        onExport={exportCsv}
        exportLabel={c.exportLabel}
      />

      {sortedLists.length === 0 ? (
        <Card className="text-muted-foreground p-8 text-center text-sm">
          {c.noResults}
        </Card>
      ) : view === "table" ? (
        <ListTable
          rows={sortedLists}
          c={c}
          memberCountOf={memberCountOf}
          onEdit={openEdit}
          onDelete={setDeletingList}
        />
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedLists.map((list) => {
          const isCompany = list.kind === "company"
          const members = list.prospectIds
            .map(getProspect)
            .filter((p): p is NonNullable<typeof p> => Boolean(p))
          const accounts = (list.accountIds ?? [])
            .map(getAccount)
            .filter((a): a is NonNullable<typeof a> => Boolean(a))
          const memberCount = isCompany
            ? list.accountIds?.length ?? 0
            : list.prospectIds.length
          const pendingCount = isCompany
            ? 0
            : members.filter((p) => !isEnriched(p)).length
          return (
            <Card
              key={list.id}
              className="hover:border-primary/40 relative h-full gap-4 transition-colors"
            >
              <Link
                to={`/lists/${list.id}`}
                aria-label={c.openList(list.name)}
                className="absolute inset-0 z-0 rounded-xl"
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={c.listActions}
                    className="absolute top-3 right-3 z-10 size-8"
                    onClick={(event) => {
                      event.stopPropagation()
                      event.preventDefault()
                    }}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => openEdit(list)}
                  >
                    <Pencil className="size-4" />
                    {c.edit}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => setDeletingList(list)}
                  >
                    <Trash2 className="size-4" />
                    {c.delete}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <CardHeader>
                <div className="flex items-center gap-2">
                  <span
                    className="flex size-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${list.color}1a` }}
                  >
                    {list.dynamic ? (
                      <Sparkles className="size-4" style={{ color: list.color }} />
                    ) : isCompany ? (
                      <Building2 className="size-4" style={{ color: list.color }} />
                    ) : (
                      <FolderKanban
                        className="size-4"
                        style={{ color: list.color }}
                      />
                    )}
                  </span>
                  <div className="mr-8 ml-auto flex items-center gap-1.5">
                    {list.dynamic && (
                      <Badge className="bg-chart-1/15 text-chart-1 gap-1 border-transparent font-normal">
                        <span className="relative flex size-1.5">
                          <span className="bg-chart-1 absolute inline-flex size-full animate-ping rounded-full opacity-60" />
                          <span className="bg-chart-1 relative inline-flex size-1.5 rounded-full" />
                        </span>
                        {c.live}
                      </Badge>
                    )}
                    <Badge variant="outline" className="gap-1 font-normal">
                      {isCompany ? (
                        <Building2 className="size-3" />
                      ) : (
                        <Users className="size-3" />
                      )}
                      {isCompany ? c.companyList : c.peopleList}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="font-semibold">{list.name}</p>
                  <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
                    {list.description}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {isCompany
                    ? accounts.slice(0, 4).map((a) => (
                        <span
                          key={a.id}
                          className="ring-background flex size-7 items-center justify-center rounded-md text-xs font-semibold text-white ring-2"
                          style={{ backgroundColor: a.logoColor }}
                          title={a.name}
                        >
                          {a.name.charAt(0)}
                        </span>
                      ))
                    : members.slice(0, 4).map((p) => (
                        <ProspectAvatar
                          key={p.id}
                          prospect={p}
                          className="ring-background size-7 ring-2"
                        />
                      ))}
                  {memberCount > 4 && (
                    <span className="bg-muted ring-background text-muted-foreground flex size-7 items-center justify-center rounded-full text-xs ring-2">
                      +{memberCount - 4}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {pendingCount > 0 && (
                    <Badge
                      variant="outline"
                      className="border-chart-4/40 text-chart-4 gap-1 font-normal"
                    >
                      <Database className="size-3" />
                      {c.needEnrich(pendingCount)}
                    </Badge>
                  )}
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    {isCompany ? (
                      <Building2 className="size-3.5" />
                    ) : (
                      <Users className="size-3.5" />
                    )}
                    {memberCount}
                  </div>
                </div>
              </CardContent>
              <DynamicChips list={list} />
              <div className="text-muted-foreground px-6 text-xs">
                {list.dynamic && list.lastSyncedAt
                  ? c.synced(formatDate(list.lastSyncedAt))
                  : c.created(formatDate(list.createdAt))}
              </div>
            </Card>
          )
        })}
      </div>
      )}


      <ListFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        list={editingList}
      />

      <ConfirmDialog
        open={Boolean(deletingList)}
        onOpenChange={(open) => {
          if (!open) setDeletingList(undefined)
        }}
        title={c.deleteTitle}
        description={
          deletingList ? c.deleteDescription(deletingList.name) : undefined
        }
        confirmLabel={c.deleteConfirm}
        destructive
        onConfirm={() => {
          if (!deletingList) return
          listStore.remove(deletingList.id)
          toast.success(c.listDeleted)
          setDeletingList(undefined)
        }}
      />

      <ImportCsvDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={(count) => toast.success(c.imported(count))}
      />
    </Page>
  )
}

type Copy = (typeof COPY)[keyof typeof COPY]

function ListTable({
  rows,
  c,
  memberCountOf,
  onEdit,
  onDelete,
}: {
  rows: ProspectList[]
  c: Copy
  memberCountOf: (list: ProspectList) => number
  onEdit: (list: ProspectList) => void
  onDelete: (list: ProspectList) => void
}) {
  const sourceLabels: Record<string, string> = {
    linkedin: c.sourceLinkedin,
    salesnav: c.sourceSalesnav,
    csv: c.sourceCsv,
    search: c.sourceSearch,
  }
  return (
    <Card className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{c.colName}</TableHead>
            <TableHead>{c.colType}</TableHead>
            <TableHead>{c.colSource}</TableHead>
            <TableHead className="text-right">{c.colMembers}</TableHead>
            <TableHead className="text-right">{c.colCreated}</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((list) => {
            const isCompany = list.kind === "company"
            return (
              <TableRow key={list.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex size-7 shrink-0 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${list.color}1a` }}
                    >
                      {list.dynamic ? (
                        <Sparkles
                          className="size-3.5"
                          style={{ color: list.color }}
                        />
                      ) : isCompany ? (
                        <Building2
                          className="size-3.5"
                          style={{ color: list.color }}
                        />
                      ) : (
                        <FolderKanban
                          className="size-3.5"
                          style={{ color: list.color }}
                        />
                      )}
                    </span>
                    <Link
                      to={`/lists/${list.id}`}
                      className="font-medium hover:underline"
                    >
                      {list.name}
                    </Link>
                    {list.dynamic && (
                      <Badge className="bg-chart-1/15 text-chart-1 border-transparent font-normal">
                        {c.live}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="gap-1 font-normal">
                    {isCompany ? (
                      <Building2 className="size-3" />
                    ) : (
                      <Users className="size-3" />
                    )}
                    {isCompany ? c.companyList : c.peopleList}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {sourceLabels[list.source]}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {memberCountOf(list)}
                </TableCell>
                <TableCell className="text-muted-foreground text-right text-xs whitespace-nowrap">
                  {formatDate(list.createdAt)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={c.listActions}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onEdit(list)}>
                        <Pencil className="size-4" />
                        {c.edit}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => onDelete(list)}
                      >
                        <Trash2 className="size-4" />
                        {c.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
