import * as React from "react"
import { Copy, Gift, Mail, Share2 } from "lucide-react"
import { toast } from "sonner"

import { useLocale } from "@/lib/locale"
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
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { initials, relativeTime } from "@/lib/format"

const REFERRAL_LINK = "https://getkombo.ai/r/kevin-hawkins"
const CREDITS_PER_ACCEPT = 200
const EUR_PER_CUSTOMER = 350

type ReferralStatus = "pending" | "accepted" | "customer"

type ReferralRow = {
  id: string
  name?: string
  email: string
  status: ReferralStatus
  date: string // ISO
}

const INITIAL_REFERRALS: ReferralRow[] = [
  {
    id: "ref_1",
    email: "sara.oconnor@teamsystem.com",
    status: "pending",
    date: "2026-06-20T10:10:00Z",
  },
  {
    id: "ref_2",
    name: "Maya Chen",
    email: "maya.chen@northwind.io",
    status: "customer",
    date: "2026-06-14T09:20:00Z",
  },
  {
    id: "ref_3",
    name: "Daniel Osei",
    email: "daniel@brightloop.co",
    status: "customer",
    date: "2026-06-11T15:45:00Z",
  },
  {
    id: "ref_4",
    name: "Priya Nair",
    email: "priya.nair@quanta.dev",
    status: "accepted",
    date: "2026-06-08T11:05:00Z",
  },
  {
    id: "ref_5",
    name: "Tomás Rivera",
    email: "tomas@vela-sales.com",
    status: "accepted",
    date: "2026-06-05T18:30:00Z",
  },
  {
    id: "ref_6",
    name: "Hannah Wright",
    email: "hannah.wright@ledgerly.io",
    status: "customer",
    date: "2026-06-02T08:15:00Z",
  },
  {
    id: "ref_7",
    email: "morgan.lee@ext-agency.com",
    status: "pending",
    date: "2026-06-02T07:40:00Z",
  },
  {
    id: "ref_8",
    name: "Felix Bauer",
    email: "felix@orbital.team",
    status: "pending",
    date: "2026-05-30T13:50:00Z",
  },
  {
    id: "ref_9",
    email: "priya.n@salesloop.io",
    status: "accepted",
    date: "2026-05-14T12:00:00Z",
  },
  {
    id: "ref_10",
    email: "diego.f@revopshq.com",
    status: "customer",
    date: "2026-03-28T16:25:00Z",
  },
]

const statusVariant: Record<ReferralStatus, "outline" | "secondary" | "success"> = {
  pending: "outline",
  accepted: "secondary",
  customer: "success",
}

const COPY = {
  en: {
    title: "Refer & earn",
    description:
      "Earn 200 credits per accepted invite and €350 for every referral who becomes a paying customer.",
    shareLink: "Share link",
    yourReferralLink: "Your referral link",
    yourReferralLinkDesc: "Share this link anywhere — it's tied to your account.",
    linkAriaLabel: "Your referral link",
    copiedToast: "Copied to clipboard",
    copyErrorToast: "Couldn't copy link",
    copy: "Copy",
    emailToast: "Opening email draft — coming soon",
    email: "Email",
    linkedinToast: "Opening LinkedIn share — coming soon",
    linkedin: "LinkedIn",
    inviteByEmail: "Invite by email",
    inviteByEmailDesc: "Send an invite straight to a colleague's inbox.",
    invitePlaceholder: "Add referred email",
    inviteSend: "Send invite",
    inviteSentToast: (email: string) => `Invite sent to ${email}`,
    inviteDuplicateToast: "Already invited",
    statPeople: "People referred",
    statCredits: "Credits earned",
    statMoney: "Money earned",
    howItWorks: "How it works",
    howItWorksDesc: "Three steps to start earning.",
    yourReferrals: "Your referrals",
    yourReferralsDesc: "People you've invited and their current status.",
    person: "Person",
    status: "Status",
    date: "Date",
    reward: "Reward",
    creditsReward: "+200 credits",
    moneyReward: "+€350",
    steps: [
      {
        title: "Share your link",
        description:
          "Send your personal link, or invite colleagues directly by email.",
      },
      {
        title: "They sign up",
        description: "You earn 200 credits the moment your invite is accepted.",
      },
      {
        title: "They become a customer",
        description:
          "You earn €350 when your referral upgrades to a paid plan.",
      },
    ],
    statusLabels: {
      pending: "Pending",
      accepted: "Accepted",
      customer: "Customer",
    } as Record<ReferralStatus, string>,
  },
  es: {
    title: "Recomienda y gana",
    description:
      "Gana 200 créditos por invitación aceptada y 350€ por cada referido que se convierta en cliente de pago.",
    shareLink: "Compartir enlace",
    yourReferralLink: "Tu enlace de referido",
    yourReferralLinkDesc:
      "Comparte este enlace donde quieras: está vinculado a tu cuenta.",
    linkAriaLabel: "Tu enlace de referido",
    copiedToast: "Copiado al portapapeles",
    copyErrorToast: "No se pudo copiar el enlace",
    copy: "Copiar",
    emailToast: "Abriendo borrador de correo — próximamente",
    email: "Correo",
    linkedinToast: "Abriendo para compartir en LinkedIn — próximamente",
    linkedin: "LinkedIn",
    inviteByEmail: "Invitar por correo",
    inviteByEmailDesc: "Envía una invitación directa al correo de un colega.",
    invitePlaceholder: "Añadir correo del referido",
    inviteSend: "Enviar invitación",
    inviteSentToast: (email: string) => `Invitación enviada a ${email}`,
    inviteDuplicateToast: "Ya invitado",
    statPeople: "Personas referidas",
    statCredits: "Créditos ganados",
    statMoney: "Dinero ganado",
    howItWorks: "Cómo funciona",
    howItWorksDesc: "Tres pasos para empezar a ganar.",
    yourReferrals: "Tus referidos",
    yourReferralsDesc: "Personas que has invitado y su estado actual.",
    person: "Persona",
    status: "Estado",
    date: "Fecha",
    reward: "Recompensa",
    creditsReward: "+200 créditos",
    moneyReward: "+350€",
    steps: [
      {
        title: "Comparte tu enlace",
        description:
          "Envía tu enlace personal o invita a colegas directamente por correo.",
      },
      {
        title: "Se registran",
        description: "Ganas 200 créditos en cuanto aceptan tu invitación.",
      },
      {
        title: "Se convierten en cliente",
        description: "Ganas 350€ cuando tu referido pasa a un plan de pago.",
      },
    ],
    statusLabels: {
      pending: "Pendiente",
      accepted: "Aceptado",
      customer: "Cliente",
    } as Record<ReferralStatus, string>,
  },
} as const

function rowInitials(row: ReferralRow): string {
  if (row.name) {
    const [first, last] = row.name.split(" ")
    return initials(first, last)
  }
  return row.email.slice(0, 2).toUpperCase()
}

export default function Referral() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [rows, setRows] = React.useState<ReferralRow[]>(INITIAL_REFERRALS)
  const [inviteEmail, setInviteEmail] = React.useState("")

  const creditsEarned =
    rows.filter((r) => r.status !== "pending").length * CREDITS_PER_ACCEPT
  const moneyEarned =
    rows.filter((r) => r.status === "customer").length * EUR_PER_CUSTOMER
  const numberLocale = locale === "es" ? "es-ES" : "en-GB"
  const stats = [
    { label: c.statPeople, value: rows.length.toLocaleString(numberLocale) },
    { label: c.statCredits, value: creditsEarned.toLocaleString(numberLocale) },
    {
      label: c.statMoney,
      value:
        locale === "es"
          ? `${moneyEarned.toLocaleString(numberLocale)}€`
          : `€${moneyEarned.toLocaleString(numberLocale)}`,
    },
  ]

  const copyLink = async () => {
    try {
      await navigator.clipboard?.writeText(REFERRAL_LINK)
      toast.success(c.copiedToast)
    } catch {
      toast.error(c.copyErrorToast)
    }
  }

  function sendInvite() {
    const email = inviteEmail.trim()
    if (!email) return
    if (rows.some((r) => r.email.toLowerCase() === email.toLowerCase())) {
      toast.error(c.inviteDuplicateToast)
      return
    }
    setRows((rs) => [
      {
        id: `ref_new_${rs.length + 1}`,
        email,
        status: "pending",
        date: new Date().toISOString(),
      },
      ...rs,
    ])
    setInviteEmail("")
    toast.success(c.inviteSentToast(email))
  }

  return (
    <Page>
      <PageHeading
        title={c.title}
        description={c.description}
        action={
          <Button variant="volt" onClick={copyLink}>
            <Share2 className="size-4" />
            {c.shareLink}
          </Button>
        }
      />

      {/* Share link + email invite */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{c.yourReferralLink}</CardTitle>
            <CardDescription>{c.yourReferralLinkDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                readOnly
                value={REFERRAL_LINK}
                aria-label={c.linkAriaLabel}
                className="font-mono"
              />
              <Button onClick={copyLink} className="shrink-0">
                <Copy className="size-4" />
                {c.copy}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info(c.emailToast)}
              >
                <Mail className="size-4" />
                {c.email}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info(c.linkedinToast)}
              >
                <LinkedinIcon className="size-4" />
                {c.linkedin}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{c.inviteByEmail}</CardTitle>
            <CardDescription>{c.inviteByEmailDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendInvite()
                }}
                placeholder={c.invitePlaceholder}
                type="email"
              />
              <Button onClick={sendInvite} className="shrink-0">
                <Gift className="size-4" />
                {c.inviteSend}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
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

      {/* How it works */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="text-primary size-4" />
              {c.howItWorks}
            </CardTitle>
            <CardDescription>{c.howItWorksDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              {c.steps.map((step, index) => (
                <div key={step.title} className="flex flex-col gap-2">
                  <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full text-sm font-semibold tabular-nums">
                    {index + 1}
                  </span>
                  <p className="font-medium">{step.title}</p>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals table */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{c.yourReferrals}</CardTitle>
            <CardDescription>{c.yourReferralsDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{c.person}</TableHead>
                  <TableHead>{c.status}</TableHead>
                  <TableHead>{c.date}</TableHead>
                  <TableHead className="text-right">{c.reward}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="text-xs">
                            {rowInitials(row)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {row.name ?? row.email}
                          </p>
                          {row.name && (
                            <p className="text-muted-foreground truncate text-xs">
                              {row.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[row.status]}>
                        {c.statusLabels[row.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {relativeTime(row.date)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.status === "pending" ? (
                        <span className="text-muted-foreground">—</span>
                      ) : row.status === "accepted" ? (
                        <span className="text-chart-1 font-medium">
                          {c.creditsReward}
                        </span>
                      ) : (
                        <div>
                          <p className="text-chart-1 font-medium">
                            {c.moneyReward}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {c.creditsReward}
                          </p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Page>
  )
}
