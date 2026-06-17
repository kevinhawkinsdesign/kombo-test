import { Plus, Eye, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { Page, PageHeading } from "@/components/layout/Page"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useView } from "@/lib/view-context"
import { team, leaderboard, type TeamMember } from "@/lib/team"
import { initials, formatMoney as money } from "@/lib/format"

function repInitials(name: string): string {
  const [first, last] = name.split(" ")
  return initials(first, last)
}

export default function Team() {
  const { impersonate } = useView()
  const reps = leaderboard()

  const totalQuota = team.reduce((a, m) => a + m.quota, 0)
  const openPipeline = team.reduce((a, m) => a + m.metrics.pipeline, 0)
  const avgAttainment = Math.round(
    (team.reduce((a, m) => a + m.metrics.won / m.quota, 0) / team.length) * 100
  )

  const summary = [
    { label: "Team size", value: String(team.length) },
    { label: "Total quota", value: money(totalQuota) },
    { label: "Open pipeline", value: money(openPipeline) },
    { label: "Avg attainment", value: `${avgAttainment}%` },
  ]

  const handleImpersonate = (rep: TeamMember) => {
    impersonate(rep.id)
    toast.success(`Viewing as ${rep.name}`)
  }

  return (
    <Page>
      <PageHeading
        title="Team"
        description="Manage reps and view their performance."
        action={
          <Button onClick={() => toast.info("Invite sent — coming soon")}>
            <Plus className="size-4" />
            Invite member
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        {summary.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {stat.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Reps table */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Reps</CardTitle>
            <CardDescription>
              Ranked by quota attainment · view any rep&apos;s workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rep</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="text-right">Quota</TableHead>
                  <TableHead className="text-right">Attainment</TableHead>
                  <TableHead className="text-right">Pipeline</TableHead>
                  <TableHead className="text-right">Meetings</TableHead>
                  <TableHead className="w-px text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reps.map((rep) => {
                  const attainment = Math.round(
                    (rep.metrics.won / rep.quota) * 100
                  )
                  return (
                    <TableRow key={rep.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            <AvatarFallback
                              style={{
                                backgroundColor: rep.avatarColor,
                                color: "white",
                              }}
                              className="text-xs"
                            >
                              {repInitials(rep.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{rep.name}</p>
                            <p className="text-muted-foreground truncate text-xs">
                              {rep.role}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">
                        {rep.email}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {money(rep.quota)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={attainment >= 60 ? "success" : "secondary"}
                          className="tabular-nums"
                        >
                          {attainment}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {money(rep.metrics.pipeline)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {rep.metrics.meetings}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleImpersonate(rep)}
                          >
                            <Eye className="size-4" />
                            View as
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`More actions for ${rep.name}`}
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  toast.info(`Message ${rep.name} — coming soon`)
                                }
                              >
                                Message
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  toast.info(
                                    `Edit role for ${rep.name} — coming soon`
                                  )
                                }
                              >
                                Edit role
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() =>
                                  toast.info(`Remove ${rep.name} — coming soon`)
                                }
                              >
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Page>
  )
}
