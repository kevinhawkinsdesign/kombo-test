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
import { ProspectAvatar } from "@/components/common/ProspectBits"
import { ImportCsvDialog } from "@/components/lists/ImportCsvDialog"
import { ListFormDialog } from "@/components/lists/ListFormDialog"
import { PlaylistWizard } from "@/components/playlist/PlaylistWizard"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { getProspect } from "@/lib/mock-data"
import { useLists, listStore } from "@/lib/store"
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
  const sourceLabels: Record<string, string> = {
    linkedin: c.sourceLinkedin,
    salesnav: c.sourceSalesnav,
    csv: c.sourceCsv,
    search: c.sourceSearch,
  }
  const lists = useLists()
  const [importOpen, setImportOpen] = React.useState(false)
  const [formOpen, setFormOpen] = React.useState(false)
  const [wizardOpen, setWizardOpen] = React.useState(false)
  const [editingList, setEditingList] = React.useState<ProspectList | undefined>(
    undefined
  )
  const [deletingList, setDeletingList] = React.useState<
    ProspectList | undefined
  >(undefined)

  function openCreate() {
    setEditingList(undefined)
    setFormOpen(true)
  }

  function openEdit(list: ProspectList) {
    setEditingList(list)
    setFormOpen(true)
  }

  // Dynamic "playlists" lead — they're the flagship way to work.
  const sortedLists = [...lists].sort(
    (a, b) => Number(Boolean(b.dynamic)) - Number(Boolean(a.dynamic))
  )

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
            <Button variant="outline" onClick={openCreate}>
              <Plus className="size-4" />
              {c.newList}
            </Button>
            <Button variant="volt" onClick={() => setWizardOpen(true)}>
              <Sparkles className="size-4" />
              {c.buildPlaylist}
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
          <Button size="sm" onClick={() => setWizardOpen(true)}>
            <Sparkles className="size-4" />
            {c.buildPlaylist}
          </Button>
        }
        className="mb-6"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedLists.map((list) => {
          const members = list.prospectIds
            .map(getProspect)
            .filter((p): p is NonNullable<typeof p> => Boolean(p))
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
                    <Badge variant="secondary" className="font-normal">
                      {sourceLabels[list.source]}
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
                  {members.slice(0, 4).map((p) => (
                    <ProspectAvatar
                      key={p.id}
                      prospect={p}
                      className="ring-background size-7 ring-2"
                    />
                  ))}
                  {members.length > 4 && (
                    <span className="bg-muted ring-background text-muted-foreground flex size-7 items-center justify-center rounded-full text-xs ring-2">
                      +{members.length - 4}
                    </span>
                  )}
                </div>
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Users className="size-3.5" />
                  {list.prospectIds.length}
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

      <PlaylistWizard open={wizardOpen} onOpenChange={setWizardOpen} />

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
