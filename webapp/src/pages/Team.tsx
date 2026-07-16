import * as React from "react"
import {
  Plus,
  Eye,
  MoreHorizontal,
  Users,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"

import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
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
    viewAs: (name: string) => `View as ${name}`,
    searchPlaceholder: "Search reps by name, email, or role…",
    noResults: "No reps match your search.",
    pageRange: (start: number, end: number, total: number) =>
      `${start}–${end} of ${total}`,
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
    viewAs: (name: string) => `Ver como ${name}`,
    searchPlaceholder: "Busca representantes por nombre, correo o rol…",
    noResults: "Ningún representante coincide con tu búsqueda.",
    pageRange: (start: number, end: number, total: number) =>
      `${start}–${end} de ${total}`,
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
  it: {
    title: "Team",
    description: "Gestisci i rappresentanti e consulta le loro prestazioni.",
    inviteSent: "Invito inviato — in arrivo",
    inviteMember: "Invita membro",
    introTitle: "Gestisci il tuo team",
    introDescription:
      "Invita rappresentanti, assegna ruoli e scopri chi guida la pipeline.",
    introPoints: [
      "Invita colleghi e assegna ruoli",
      "Prestazioni per rappresentante a colpo d'occhio",
      "Impersona per vedere la vista esatta di un rappresentante",
    ],
    teamSize: "Dimensione del team",
    totalQuota: "Quota totale",
    openPipeline: "Pipeline aperta",
    avgAttainment: "Raggiungimento medio",
    reps: "Rappresentanti",
    repsDescription:
      "Ordinati per raggiungimento della quota · consulta lo spazio di qualsiasi rappresentante",
    rep: "Rappresentante",
    email: "Email",
    quota: "Quota",
    attainment: "Raggiungimento",
    pipeline: "Pipeline",
    meetings: "Riunioni",
    actions: "Azioni",
    viewAs: (name: string) => `Vedi come ${name}`,
    searchPlaceholder: "Cerca rappresentanti per nome, email o ruolo…",
    noResults: "Nessun rappresentante corrisponde alla tua ricerca.",
    pageRange: (start: number, end: number, total: number) =>
      `${start}–${end} di ${total}`,
    viewingAs: (name: string) => `Stai vedendo come ${name}`,
    moreActions: (name: string) => `Altre azioni per ${name}`,
    message: "Messaggio",
    messageToast: (name: string) =>
      `Invia un messaggio a ${name} — in arrivo`,
    editRole: "Modifica ruolo",
    editRoleToast: (name: string) => `Modifica ruolo di ${name} — in arrivo`,
    remove: "Rimuovi",
    removeToast: (name: string) => `Rimuovi ${name} — in arrivo`,
  },
  fr: {
    title: "Équipe",
    description: "Gérez les commerciaux et consultez leurs performances.",
    inviteSent: "Invitation envoyée — bientôt disponible",
    inviteMember: "Inviter un membre",
    introTitle: "Gérez votre équipe",
    introDescription:
      "Invitez des commerciaux, attribuez des rôles et voyez qui alimente le pipeline.",
    introPoints: [
      "Invitez des collègues et attribuez des rôles",
      "Performance par commercial en un coup d'œil",
      "Prenez la vue d'un commercial pour voir exactement son espace",
    ],
    teamSize: "Taille de l'équipe",
    totalQuota: "Quota total",
    openPipeline: "Pipeline ouvert",
    avgAttainment: "Atteinte moyenne",
    reps: "Commerciaux",
    repsDescription:
      "Classés par atteinte du quota · consultez l'espace de n'importe quel commercial",
    rep: "Commercial",
    email: "E-mail",
    quota: "Quota",
    attainment: "Atteinte",
    pipeline: "Pipeline",
    meetings: "Rendez-vous",
    actions: "Actions",
    viewAs: (name: string) => `Voir en tant que ${name}`,
    searchPlaceholder: "Recherchez un commercial par nom, e-mail ou rôle…",
    noResults: "Aucun commercial ne correspond à votre recherche.",
    pageRange: (start: number, end: number, total: number) =>
      `${start}–${end} sur ${total}`,
    viewingAs: (name: string) => `Vue en tant que ${name}`,
    moreActions: (name: string) => `Plus d'actions pour ${name}`,
    message: "Message",
    messageToast: (name: string) =>
      `Envoyer un message à ${name} — bientôt disponible`,
    editRole: "Modifier le rôle",
    editRoleToast: (name: string) =>
      `Modifier le rôle de ${name} — bientôt disponible`,
    remove: "Retirer",
    removeToast: (name: string) => `Retirer ${name} — bientôt disponible`,
  },
  de: {
    title: "Team",
    description: "Verwalte Vertriebler und sieh dir ihre Performance an.",
    inviteSent: "Einladung gesendet — bald verfügbar",
    inviteMember: "Mitglied einladen",
    introTitle: "Verwalte dein Team",
    introDescription:
      "Lade Vertriebler ein, vergib Rollen und sieh, wer die Pipeline vorantreibt.",
    introPoints: [
      "Lade Teamkollegen ein & vergib Rollen",
      "Performance pro Vertriebler auf einen Blick",
      "Übernimm die Ansicht eines Vertrieblers, um genau seine Sicht zu sehen",
    ],
    teamSize: "Teamgröße",
    totalQuota: "Gesamtquote",
    openPipeline: "Offene Pipeline",
    avgAttainment: "Ø Zielerreichung",
    reps: "Vertriebler",
    repsDescription:
      "Sortiert nach Zielerreichung · sieh dir den Workspace jedes Vertrieblers an",
    rep: "Vertriebler",
    email: "E-Mail",
    quota: "Quote",
    attainment: "Zielerreichung",
    pipeline: "Pipeline",
    meetings: "Meetings",
    actions: "Aktionen",
    viewAs: (name: string) => `Ansehen als ${name}`,
    searchPlaceholder: "Suche Vertriebler nach Name, E-Mail oder Rolle…",
    noResults: "Keine Vertriebler entsprechen deiner Suche.",
    pageRange: (start: number, end: number, total: number) =>
      `${start}–${end} von ${total}`,
    viewingAs: (name: string) => `Ansicht als ${name}`,
    moreActions: (name: string) => `Weitere Aktionen für ${name}`,
    message: "Nachricht",
    messageToast: (name: string) =>
      `Nachricht an ${name} — bald verfügbar`,
    editRole: "Rolle bearbeiten",
    editRoleToast: (name: string) =>
      `Rolle von ${name} bearbeiten — bald verfügbar`,
    remove: "Entfernen",
    removeToast: (name: string) => `${name} entfernen — bald verfügbar`,
  },
  pt: {
    title: "Equipa",
    description: "Faça a gestão dos comerciais e veja o seu desempenho.",
    inviteSent: "Convite enviado — em breve",
    inviteMember: "Convidar membro",
    introTitle: "Faça a gestão da sua equipa",
    introDescription:
      "Convide comerciais, defina funções e veja quem está a impulsionar o pipeline.",
    introPoints: [
      "Convide colegas e atribua funções",
      "Desempenho por comercial num relance",
      "Assuma a vista de um comercial para ver exatamente o seu espaço",
    ],
    teamSize: "Tamanho da equipa",
    totalQuota: "Quota total",
    openPipeline: "Pipeline aberto",
    avgAttainment: "Cumprimento médio",
    reps: "Comerciais",
    repsDescription:
      "Ordenados por cumprimento da quota · veja o espaço de qualquer comercial",
    rep: "Comercial",
    email: "Email",
    quota: "Quota",
    attainment: "Cumprimento",
    pipeline: "Pipeline",
    meetings: "Reuniões",
    actions: "Ações",
    viewAs: (name: string) => `Ver como ${name}`,
    searchPlaceholder: "Pesquise comerciais por nome, email ou função…",
    noResults: "Nenhum comercial corresponde à sua pesquisa.",
    pageRange: (start: number, end: number, total: number) =>
      `${start}–${end} de ${total}`,
    viewingAs: (name: string) => `A ver como ${name}`,
    moreActions: (name: string) => `Mais ações para ${name}`,
    message: "Mensagem",
    messageToast: (name: string) =>
      `Enviar mensagem a ${name} — em breve`,
    editRole: "Editar função",
    editRoleToast: (name: string) => `Editar função de ${name} — em breve`,
    remove: "Remover",
    removeToast: (name: string) => `Remover ${name} — em breve`,
  },
  pt_BR: {
    title: "Time",
    description: "Gerencie os vendedores e veja o desempenho deles.",
    inviteSent: "Convite enviado — em breve",
    inviteMember: "Convidar membro",
    introTitle: "Gerencie seu time",
    introDescription:
      "Convide vendedores, defina papéis e veja quem está impulsionando o pipeline.",
    introPoints: [
      "Convide colegas e atribua papéis",
      "Desempenho por vendedor em um relance",
      "Assuma a visão de um vendedor para ver exatamente o espaço dele",
    ],
    teamSize: "Tamanho do time",
    totalQuota: "Meta total",
    openPipeline: "Pipeline aberto",
    avgAttainment: "Atingimento médio",
    reps: "Vendedores",
    repsDescription:
      "Classificados por atingimento de meta · veja o espaço de qualquer vendedor",
    rep: "Vendedor",
    email: "E-mail",
    quota: "Meta",
    attainment: "Atingimento",
    pipeline: "Pipeline",
    meetings: "Reuniões",
    actions: "Ações",
    viewAs: (name: string) => `Ver como ${name}`,
    searchPlaceholder: "Busque vendedores por nome, e-mail ou papel…",
    noResults: "Nenhum vendedor corresponde à sua busca.",
    pageRange: (start: number, end: number, total: number) =>
      `${start}–${end} de ${total}`,
    viewingAs: (name: string) => `Vendo como ${name}`,
    moreActions: (name: string) => `Mais ações para ${name}`,
    message: "Mensagem",
    messageToast: (name: string) =>
      `Enviar mensagem para ${name} — em breve`,
    editRole: "Editar papel",
    editRoleToast: (name: string) => `Editar papel de ${name} — em breve`,
    remove: "Remover",
    removeToast: (name: string) => `Remover ${name} — em breve`,
  },
} as const

type SortKey = "name" | "quota" | "attainment" | "pipeline" | "meetings"
type SortState = { key: SortKey; dir: "asc" | "desc" }
const PAGE_SIZE = 10

function SortHeader({
  sortKey,
  sort,
  onToggle,
  children,
}: {
  sortKey: SortKey
  sort: SortState
  onToggle: (key: SortKey) => void
  children: React.ReactNode
}) {
  const active = sort.key === sortKey
  const Icon = active ? (sort.dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <button
      type="button"
      onClick={() => onToggle(sortKey)}
      className="hover:text-foreground -m-2 flex items-center gap-1 p-2 text-inherit"
    >
      {children}
      <Icon className={cn("size-3", active ? "text-foreground" : "text-muted-foreground/50")} />
    </button>
  )
}

export default function Team() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { impersonate } = useView()
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState<SortState>({
    key: "attainment",
    dir: "desc",
  })
  const [page, setPage] = React.useState(0)

  const attainmentOf = (m: TeamMember) => m.metrics.won / m.quota

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q
      ? leaderboard().filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            m.role.toLowerCase().includes(q)
        )
      : leaderboard()
    const sorted = [...base].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1
      switch (sort.key) {
        case "name":
          return a.name.localeCompare(b.name) * dir
        case "quota":
          return (a.quota - b.quota) * dir
        case "attainment":
          return (attainmentOf(a) - attainmentOf(b)) * dir
        case "pipeline":
          return (a.metrics.pipeline - b.metrics.pipeline) * dir
        case "meetings":
          return (a.metrics.meetings - b.metrics.meetings) * dir
      }
    })
    return sorted
  }, [query, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageStart = safePage * PAGE_SIZE
  const pageEnd = Math.min(pageStart + PAGE_SIZE, filtered.length)
  const reps = filtered.slice(pageStart, pageEnd)

  const querySig = query
  const [querySigSeen, setQuerySigSeen] = React.useState(querySig)
  if (querySig !== querySigSeen) {
    setQuerySigSeen(querySig)
    setPage(0)
  }

  function toggleSort(key: SortKey) {
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }
    )
  }

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
          <CardContent className="space-y-3">
            <div className="relative max-w-sm">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={c.searchPlaceholder}
                className="pl-8"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortHeader sortKey="name" sort={sort} onToggle={toggleSort}>{c.rep}</SortHeader>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    {c.email}
                  </TableHead>
                  <TableHead className="text-right">
                    <SortHeader sortKey="quota" sort={sort} onToggle={toggleSort}>{c.quota}</SortHeader>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortHeader sortKey="attainment" sort={sort} onToggle={toggleSort}>{c.attainment}</SortHeader>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortHeader sortKey="pipeline" sort={sort} onToggle={toggleSort}>{c.pipeline}</SortHeader>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortHeader sortKey="meetings" sort={sort} onToggle={toggleSort}>{c.meetings}</SortHeader>
                  </TableHead>
                  <TableHead className="w-px text-right">{c.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reps.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={7}
                      className="text-muted-foreground py-10 text-center text-sm"
                    >
                      {c.noResults}
                    </TableCell>
                  </TableRow>
                )}
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
                            size="icon"
                            aria-label={c.viewAs(rep.name)}
                            onClick={() => handleImpersonate(rep)}
                          >
                            <Eye className="size-4" />
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

            {filtered.length > 0 && (
              <div className="flex items-center justify-end gap-1">
                <span className="text-muted-foreground px-1 text-xs tabular-nums">
                  {c.pageRange(pageStart + 1, pageEnd, filtered.length)}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={safePage === 0}
                  onClick={() => setPage(Math.max(0, safePage - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))}
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Page>
  )
}
