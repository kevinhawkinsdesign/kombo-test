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
} from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
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
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { getProspect } from "@/lib/mock-data"
import { useLists, listStore } from "@/lib/store"
import { formatDate } from "@/lib/format"
import type { ProspectList } from "@/lib/types"

const SOURCE_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  salesnav: "Sales Navigator",
  csv: "CSV import",
  search: "Prospect search",
}

export default function Lists() {
  const lists = useLists()
  const [importOpen, setImportOpen] = React.useState(false)
  const [formOpen, setFormOpen] = React.useState(false)
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

  return (
    <Page>
      <PageHeading
        title="Lists"
        description="Organize prospects into targeted lists for outreach."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="size-4" />
              Import CSV
            </Button>
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              New list
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => {
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
                aria-label={`Open ${list.name}`}
                className="absolute inset-0 z-0 rounded-xl"
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="List actions"
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
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => setDeletingList(list)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <CardHeader>
                <div className="flex items-center gap-2">
                  <span
                    className="flex size-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${list.color}1a` }}
                  >
                    <FolderKanban
                      className="size-4"
                      style={{ color: list.color }}
                    />
                  </span>
                  <Badge
                    variant="secondary"
                    className="mr-8 ml-auto font-normal"
                  >
                    {SOURCE_LABELS[list.source]}
                  </Badge>
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
              <div className="text-muted-foreground px-6 text-xs">
                Created {formatDate(list.createdAt)}
              </div>
            </Card>
          )
        })}
      </div>

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
        title="Delete list?"
        description={
          deletingList
            ? `"${deletingList.name}" will be permanently removed. Prospects stay in your workspace.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deletingList) return
          listStore.remove(deletingList.id)
          toast.success("List deleted")
          setDeletingList(undefined)
        }}
      />

      <ImportCsvDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={(count) =>
          toast.success(`${count} prospects imported into a new list`)
        }
      />
    </Page>
  )
}
