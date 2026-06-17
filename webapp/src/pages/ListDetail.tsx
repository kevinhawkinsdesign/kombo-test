import { Link, useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, Send, Download } from "lucide-react"

import { Page } from "@/components/layout/Page"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ProspectAvatar,
  ScoreBadge,
  StatusBadge,
} from "@/components/common/ProspectBits"
import { getList, getProspect } from "@/lib/mock-data"

export default function ListDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const list = id ? getList(id) : undefined

  if (!list) {
    return (
      <Page>
        <p className="text-muted-foreground">List not found.</p>
        <Button variant="link" asChild className="px-0">
          <Link to="/lists">Back to lists</Link>
        </Button>
      </Page>
    )
  }

  const members = list.prospectIds
    .map(getProspect)
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  return (
    <Page>
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/lists">
          <ArrowLeft className="size-4" />
          Lists
        </Link>
      </Button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className="mt-1 size-3 rounded-full"
            style={{ backgroundColor: list.color }}
          />
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{list.name}</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {list.description}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {members.length} prospects
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => toast.success("Exported to CSV")}
          >
            <Download className="size-4" />
            Export
          </Button>
          <Button onClick={() => toast.success(`${members.length} enrolled`)}>
            <Send className="size-4" />
            Start campaign
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Prospect</TableHead>
              <TableHead className="hidden md:table-cell">Company</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((p) => (
              <TableRow
                key={p.id}
                className="cursor-pointer"
                onClick={() => navigate(`/prospects/${p.id}`)}
              >
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <ProspectAvatar prospect={p} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {p.title}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <p className="font-medium">{p.company}</p>
                  <p className="text-muted-foreground text-xs">{p.location}</p>
                </TableCell>
                <TableCell>
                  <ScoreBadge score={p.score} />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <StatusBadge status={p.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Page>
  )
}
