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
  it: {
    title: "Spazi di lavoro",
    description: "Raggruppa ricerche, liste e campagne per argomento.",
    newWorkspace: "Nuovo spazio di lavoro",
    introTitle: "Tieni un argomento in un solo posto",
    introDescription:
      "Uno spazio di lavoro riunisce le ricerche salvate, le liste e le campagne di una singola iniziativa — dagli un nome o lascialo senza titolo.",
    introPoints: [
      "Associa ricerche, liste e campagne",
      "Vai dritto a una qualsiasi di esse",
      "Dai un nome a uno spazio, o no",
    ],
    untitled: "Spazio di lavoro senza titolo",
    empty: "Ancora nessuno spazio di lavoro.",
    emptyHint: "Creane uno per raggruppare ricerche, liste e campagne correlate.",
    counts: (s: number, l: number, c: number) =>
      `${s} ${s === 1 ? "ricerca" : "ricerche"} · ${l} ${l === 1 ? "lista" : "liste"} · ${c} ${c === 1 ? "campagna" : "campagne"}`,
    created: (date: string) => `Creato ${date}`,
    actions: "Azioni dello spazio di lavoro",
    delete: "Elimina spazio di lavoro",
    deleteTitle: "Eliminare lo spazio di lavoro?",
    deleteDescription: (name: string) =>
      `«${name}» verrà eliminato. Le ricerche, le liste e le campagne al suo interno non vengono eliminate.`,
    deleted: "Spazio di lavoro eliminato",
  },
  fr: {
    title: "Espaces de travail",
    description: "Regroupez recherches, listes et campagnes par sujet.",
    newWorkspace: "Nouvel espace de travail",
    introTitle: "Gardez un sujet au même endroit",
    introDescription:
      "Un espace de travail rassemble les recherches enregistrées, les listes et les campagnes d'une même initiative — nommez-le, ou laissez-le sans titre.",
    introPoints: [
      "Associez recherches, listes et campagnes",
      "Accédez directement à l'une d'elles",
      "Nommez un espace de travail, ou non",
    ],
    untitled: "Espace de travail sans titre",
    empty: "Aucun espace de travail pour le moment.",
    emptyHint: "Créez-en un pour regrouper des recherches, listes et campagnes liées.",
    counts: (s: number, l: number, c: number) =>
      `${s} ${s === 1 ? "recherche" : "recherches"} · ${l} ${l === 1 ? "liste" : "listes"} · ${c} ${c === 1 ? "campagne" : "campagnes"}`,
    created: (date: string) => `Créé le ${date}`,
    actions: "Actions de l'espace de travail",
    delete: "Supprimer l'espace de travail",
    deleteTitle: "Supprimer l'espace de travail ?",
    deleteDescription: (name: string) =>
      `« ${name} » sera supprimé. Les recherches, listes et campagnes qu'il contient ne sont pas supprimées.`,
    deleted: "Espace de travail supprimé",
  },
  de: {
    title: "Workspaces",
    description: "Gruppiere Suchen, Listen und Kampagnen nach Thema.",
    newWorkspace: "Neuer Workspace",
    introTitle: "Ein Thema an einem Ort",
    introDescription:
      "Ein Workspace bündelt die gespeicherten Suchen, Listen und Kampagnen einer Initiative — gib ihm einen Namen oder lass ihn unbenannt.",
    introPoints: [
      "Verknüpfe Suchen, Listen & Kampagnen",
      "Springe direkt zu jeder von ihnen",
      "Gib einem Workspace einen Namen, oder auch nicht",
    ],
    untitled: "Unbenannter Workspace",
    empty: "Noch keine Workspaces.",
    emptyHint: "Erstelle einen, um zusammengehörige Suchen, Listen und Kampagnen zu gruppieren.",
    counts: (s: number, l: number, c: number) =>
      `${s} ${s === 1 ? "Suche" : "Suchen"} · ${l} ${l === 1 ? "Liste" : "Listen"} · ${c} ${c === 1 ? "Kampagne" : "Kampagnen"}`,
    created: (date: string) => `Erstellt am ${date}`,
    actions: "Workspace-Aktionen",
    delete: "Workspace löschen",
    deleteTitle: "Workspace löschen?",
    deleteDescription: (name: string) =>
      `„${name}" wird entfernt. Die enthaltenen Suchen, Listen und Kampagnen werden nicht gelöscht.`,
    deleted: "Workspace gelöscht",
  },
  pt: {
    title: "Espaços de trabalho",
    description: "Agrupe pesquisas, listas e campanhas por tema.",
    newWorkspace: "Novo espaço de trabalho",
    introTitle: "Mantenha um tema num só lugar",
    introDescription:
      "Um espaço de trabalho reúne as pesquisas guardadas, listas e campanhas de uma mesma iniciativa — dê-lhe um nome ou deixe-o sem título.",
    introPoints: [
      "Associe pesquisas, listas e campanhas",
      "Vá diretamente a qualquer uma delas",
      "Dê nome a um espaço, ou não",
    ],
    untitled: "Espaço de trabalho sem título",
    empty: "Ainda não há espaços de trabalho.",
    emptyHint: "Crie um para agrupar pesquisas, listas e campanhas relacionadas.",
    counts: (s: number, l: number, c: number) =>
      `${s} ${s === 1 ? "pesquisa" : "pesquisas"} · ${l} ${l === 1 ? "lista" : "listas"} · ${c} ${c === 1 ? "campanha" : "campanhas"}`,
    created: (date: string) => `Criado a ${date}`,
    actions: "Ações do espaço de trabalho",
    delete: "Eliminar espaço de trabalho",
    deleteTitle: "Eliminar o espaço de trabalho?",
    deleteDescription: (name: string) =>
      `"${name}" será removido. As pesquisas, listas e campanhas que contém não são eliminadas.`,
    deleted: "Espaço de trabalho eliminado",
  },
  pt_BR: {
    title: "Espaços de trabalho",
    description: "Agrupe buscas, listas e campanhas por tema.",
    newWorkspace: "Novo espaço de trabalho",
    introTitle: "Mantenha um tema em um só lugar",
    introDescription:
      "Um espaço de trabalho reúne as buscas salvas, listas e campanhas de uma mesma iniciativa — dê um nome a ele ou deixe sem título.",
    introPoints: [
      "Associe buscas, listas e campanhas",
      "Vá direto para qualquer uma delas",
      "Dê nome a um espaço, ou não",
    ],
    untitled: "Espaço de trabalho sem título",
    empty: "Ainda não há espaços de trabalho.",
    emptyHint: "Crie um para agrupar buscas, listas e campanhas relacionadas.",
    counts: (s: number, l: number, c: number) =>
      `${s} ${s === 1 ? "busca" : "buscas"} · ${l} ${l === 1 ? "lista" : "listas"} · ${c} ${c === 1 ? "campanha" : "campanhas"}`,
    created: (date: string) => `Criado em ${date}`,
    actions: "Ações do espaço de trabalho",
    delete: "Excluir espaço de trabalho",
    deleteTitle: "Excluir o espaço de trabalho?",
    deleteDescription: (name: string) =>
      `"${name}" será removido. As buscas, listas e campanhas dentro dele não são excluídas.`,
    deleted: "Espaço de trabalho excluído",
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
