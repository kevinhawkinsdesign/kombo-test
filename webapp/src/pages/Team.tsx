import { Plus, Eye, MoreHorizontal, Users } from "lucide-react"
import { toast } from "sonner"

import { useLocale } from "@/lib/locale"
import { Page, PageHeading } from "@/components/layout/Page"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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
import { portraitFor } from "@/lib/avatars"

function repInitials(name: string): string {
  const [first, last] = name.split(" ")
  return initials(first, last)
}

const COPY = {
  en: {
    title: "Team",
    description: "Manage reps and view their performance.",
    inviteSent: "Invite sent — coming soon",
    inviteMember: "Invite member",
    introTitle: "Manage your team",
    introDescription: "Invite reps, set roles, and see who's driving pipeline.",
    introPoints: [
      "Invite teammates & assign roles",
      "Per-rep performance at a glance",
      "Impersonate to see a rep's exact view",
    ],
    teamSize: "Team size",
    totalQuota: "Total quota",
    openPipeline: "Open pipeline",
    avgAttainment: "Avg attainment",
    reps: "Reps",
    repsDescription: "Ranked by quota attainment · view any rep's workspace",
    rep: "Rep",
    email: "Email",
    quota: "Quota",
    attainment: "Attainment",
    pipeline: "Pipeline",
    meetings: "Meetings",
    actions: "Actions",
    viewAs: "View as",
    viewingAs: (name: string) => `Viewing as ${name}`,
    moreActions: (name: string) => `More actions for ${name}`,
    message: "Message",
    messageToast: (name: string) => `Message ${name} — coming soon`,
    editRole: "Edit role",
    editRoleToast: (name: string) => `Edit role for ${name} — coming soon`,
    remove: "Remove",
    removeToast: (name: string) => `Remove ${name} — coming soon`,
  },
  es: {
    title: "Equipo",
    description: "Gestiona a los representantes y consulta su rendimiento.",
    inviteSent: "Invitación enviada — próximamente",
    inviteMember: "Invitar miembro",
    introTitle: "Gestiona tu equipo",
    introDescription:
      "Invita a representantes, asigna roles y descubre quién impulsa el pipeline.",
    introPoints: [
      "Invita a compañeros y asigna roles",
      "Rendimiento por representante de un vistazo",
      "Suplanta para ver la vista exacta de un representante",
    ],
    teamSize: "Tamaño del equipo",
    totalQuota: "Cuota total",
    openPipeline: "Pipeline abierto",
    avgAttainment: "Cumplimiento medio",
    reps: "Representantes",
    repsDescription:
      "Ordenados por cumplimiento de cuota · consulta el espacio de cualquier representante",
    rep: "Representante",
    email: "Correo",
    quota: "Cuota",
    attainment: "Cumplimiento",
    pipeline: "Pipeline",
    meetings: "Reuniones",
    actions: "Acciones",
    viewAs: "Ver como",
    viewingAs: (name: string) => `Viendo como ${name}`,
    moreActions: (name: string) => `Más acciones para ${name}`,
    message: "Mensaje",
    messageToast: (name: string) =>
      `Enviar mensaje a ${name} — próximamente`,
    editRole: "Editar rol",
    editRoleToast: (name: string) => `Editar rol de ${name} — próximamente`,
    remove: "Eliminar",
    removeToast: (name: string) => `Eliminar a ${name} — próximamente`,
  },
} as const

export default function Team() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { impersonate } = useView()
  const reps = leaderboard()

  const totalQuota = team.reduce((a, m) => a + m.quota, 0)
  const openPipeline = team.reduce((a, m) => a + m.metrics.pipeline, 0)
  const avgAttainment = Math.round(
    (team.reduce((a, m) => a + m.metrics.won / m.quota, 0) / team.length) * 100
  )

  const summary = [
    { label: c.teamSize, value: String(team.length) },
    { label: c.totalQuota, value: money(totalQuota) },
    { label: c.openPipeline, value: money(openPipeline) },
    { label: c.avgAttainment, value: `${avgAttainment}%` },
  ]

  const handleImpersonate = (rep: TeamMember) => {
    impersonate(rep.id)
    toast.success(c.viewingAs(rep.name))
  }

  return (
    <Page>
      <PageHeading
        title={c.title}
        description={c.description}
        action={
          <Button variant="volt" onClick={() => toast.info(c.inviteSent)}>
            <Plus className="size-4" />
            {c.inviteMember}
          </Button>
        }
      />

      <FeatureIntro
        featureKey="team"
        icon={Users}
        title={c.introTitle}
        description={c.introDescription}
        points={c.introPoints}
        className="mb-6"
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
            <CardTitle>{c.reps}</CardTitle>
            <CardDescription>{c.repsDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{c.rep}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {c.email}
                  </TableHead>
                  <TableHead className="text-right">{c.quota}</TableHead>
                  <TableHead className="text-right">{c.attainment}</TableHead>
                  <TableHead className="text-right">{c.pipeline}</TableHead>
                  <TableHead className="text-right">{c.meetings}</TableHead>
                  <TableHead className="w-px text-right">{c.actions}</TableHead>
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
                            <AvatarImage src={portraitFor(rep.name)} alt="" />
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
                            {c.viewAs}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={c.moreActions(rep.name)}
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  toast.info(c.messageToast(rep.name))
                                }
                              >
                                {c.message}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  toast.info(c.editRoleToast(rep.name))
                                }
                              >
                                {c.editRole}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() =>
                                  toast.info(c.removeToast(rep.name))
                                }
                              >
                                {c.remove}
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
