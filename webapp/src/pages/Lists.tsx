import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Plus, Users, FolderKanban, Upload } from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProspectAvatar } from "@/components/common/ProspectBits"
import { ImportCsvDialog } from "@/components/lists/ImportCsvDialog"
import { prospectLists, getProspect } from "@/lib/mock-data"
import { formatDate } from "@/lib/format"

const SOURCE_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  salesnav: "Sales Navigator",
  csv: "CSV import",
  search: "Prospect search",
}

export default function Lists() {
  const [importOpen, setImportOpen] = React.useState(false)

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
            <Button onClick={() => toast.info("New list — coming soon")}>
              <Plus className="size-4" />
              New list
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {prospectLists.map((list) => {
          const members = list.prospectIds
            .map(getProspect)
            .filter((p): p is NonNullable<typeof p> => Boolean(p))
          return (
            <Link key={list.id} to={`/lists/${list.id}`}>
              <Card className="hover:border-primary/40 h-full gap-4 transition-colors">
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
                    <Badge variant="secondary" className="ml-auto font-normal">
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
            </Link>
          )
        })}
      </div>

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
