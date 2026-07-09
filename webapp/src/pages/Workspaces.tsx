import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Plus,
  LayoutGrid,
  Search as SearchIcon,
  FolderKanban,
  Send,
  MoreHorizontal,
  Trash2,
} from "lucide-react"

import kaiUrl from "@/assets/kai-pleased.png"
import { Page, PageHeading } from "@/components/layout/Page"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { useLocale } from "@/lib/locale"
import { formatDate } from "@/lib/format"
import { useWorkspaces, workspaceStore, type Workspace } from "@/lib/workspaces"

const COPY = {
  en: {
    title: "Workspaces",
    description: "Group searches, lists, and campaigns by topic.",
    newWorkspace: "New workspace",
    introTitle: "Keep one topic in one place",
    introDescription:
      "A workspace ties together the saved searches, lists, and campaigns for a single initiative — name it, or leave it untitled.",
    introPoints: [
      "Associate searches, lists & campaigns",
      "Jump straight to any of them",
      "Name a workspace, or not",
    ],
    untitled: "Untitled workspace",
    empty: "No workspaces yet.",
    emptyHint: "Create one to group related searches, lists, and campaigns.",
    counts: (s: number, l: number, c: number) =>
      `${s} ${s === 1 ? "search" : "searches"} · ${l} ${l === 1 ? "list" : "lists"} · ${c} ${c === 1 ? "campaign" : "campaigns"}`,
    created: (date: string) => `Created ${date}`,
    actions: "Workspace actions",
    delete: "Delete workspace",
    deleteTitle: "Delete workspace?",
    deleteDescription: (name: string) =>
      `"${name}" will be removed. The searches, lists, and campaigns inside it are not deleted.`,
    deleted: "Workspace deleted",
  },
  es: {
    title: "Espacios de trabajo",
    description: "Agrupa búsquedas, listas y campañas por tema.",
    newWorkspace: "Nuevo espacio",
    introTitle: "Un tema en un solo lugar",
    introDescription:
      "Un espacio de trabajo reúne las búsquedas guardadas, listas y campañas de una misma iniciativa — ponle nombre o déjalo sin título.",
    introPoints: [
      "Asocia búsquedas, listas y campañas",
      "Salta directo a cualquiera de ellas",
      "Nombra un espacio, o no",
    ],
    untitled: "Espacio sin título",
    empty: "Aún no hay espacios de trabajo.",
    emptyHint: "Crea uno para agrupar búsquedas, listas y campañas relacionadas.",
    counts: (s: number, l: number, c: number) =>
      `${s} ${s === 1 ? "búsqueda" : "búsquedas"} · ${l} ${l === 1 ? "lista" : "listas"} · ${c} ${c === 1 ? "campaña" : "campañas"}`,
    created: (date: string) => `Creado ${date}`,
    actions: "Acciones del espacio",
    delete: "Eliminar espacio",
    deleteTitle: "¿Eliminar espacio de trabajo?",
    deleteDescription: (name: string) =>
      `«${name}» se eliminará. Las búsquedas, listas y campañas que contiene no se eliminan.`,
    deleted: "Espacio eliminado",
  },
} as const

export default function Workspaces() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const workspaces = useWorkspaces()
  const [deleting, setDeleting] = React.useState<Workspace | null>(null)

  function createWorkspace() {
    const ws = workspaceStore.create("")
    navigate(`/workspaces/${ws.id}`)
  }

  return (
    <Page>
      <PageHeading
        title={c.title}
        description={c.description}
        action={
          <Button variant="volt" onClick={createWorkspace}>
            <Plus className="size-4" />
            {c.newWorkspace}
          </Button>
        }
      />

      <FeatureIntro
        featureKey="workspaces"
        icon={LayoutGrid}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        className="mb-6"
      />

      {workspaces.length === 0 ? (
        <Card className="text-muted-foreground flex flex-col items-center gap-1 py-16 text-center text-sm">
          <img src={kaiUrl} alt="" className="mb-2 size-16" />
          <p className="font-medium">{c.empty}</p>
          <p className="text-xs">{c.emptyHint}</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <div key={ws.id} className="relative">
              <Link
                to={`/workspaces/${ws.id}`}
                className="hover:border-primary/40 block rounded-xl border p-4 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="size-8 shrink-0 rounded-lg"
                    style={{ backgroundColor: ws.color }}
                  />
                  <p
                    className={
                      ws.name
                        ? "min-w-0 flex-1 truncate font-semibold"
                        : "text-muted-foreground min-w-0 flex-1 truncate font-medium italic"
                    }
                  >
                    {ws.name || c.untitled}
                  </p>
                </div>

                <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <SearchIcon className="size-3.5" />
                    {ws.searchIds.length}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FolderKanban className="size-3.5" />
                    {ws.listIds.length}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Send className="size-3.5" />
                    {ws.campaignIds.length}
                  </span>
                </div>

                <p className="text-muted-foreground mt-3 text-xs">
                  {c.created(formatDate(ws.createdAt))}
                </p>
              </Link>

              <div className="absolute top-3 right-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label={c.actions}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setDeleting(ws)}
                    >
                      <Trash2 className="size-4" />
                      {c.delete}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        title={c.deleteTitle}
        description={
          deleting
            ? c.deleteDescription(deleting.name || c.untitled)
            : undefined
        }
        confirmLabel={c.delete}
        destructive
        onConfirm={() => {
          if (deleting) {
            workspaceStore.remove(deleting.id)
            toast.success(c.deleted)
          }
        }}
      />
    </Page>
  )
}
