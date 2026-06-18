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

type ReferralStatus = "Active" | "Signed up" | "Invited"

type Referral = {
  name: string
  email: string
  status: ReferralStatus
  date: string
  reward: number
}

const referrals: Referral[] = [
  {
    name: "Maya Chen",
    email: "maya.chen@northwind.io",
    status: "Active",
    date: "2026-06-14T09:20:00Z",
    reward: 500,
  },
  {
    name: "Daniel Osei",
    email: "daniel@brightloop.co",
    status: "Active",
    date: "2026-06-11T15:45:00Z",
    reward: 500,
  },
  {
    name: "Priya Nair",
    email: "priya.nair@quanta.dev",
    status: "Signed up",
    date: "2026-06-08T11:05:00Z",
    reward: 0,
  },
  {
    name: "Tomás Rivera",
    email: "tomas@vela-sales.com",
    status: "Signed up",
    date: "2026-06-05T18:30:00Z",
    reward: 0,
  },
  {
    name: "Hannah Wright",
    email: "hannah.wright@ledgerly.io",
    status: "Active",
    date: "2026-06-02T08:15:00Z",
    reward: 500,
  },
  {
    name: "Felix Bauer",
    email: "felix@orbital.team",
    status: "Invited",
    date: "2026-05-30T13:50:00Z",
    reward: 0,
  },
]

const statusVariant: Record<
  ReferralStatus,
  "success" | "secondary" | "outline"
> = {
  Active: "success",
  "Signed up": "secondary",
  Invited: "outline",
}

const COPY = {
  en: {
    title: "Refer & earn",
    description: "Give 500 credits, get 500 credits when a referral activates.",
    shareLinkToast: "Referral link copied",
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
    howItWorks: "How it works",
    howItWorksDesc: "Three steps to start earning credits.",
    yourReferrals: "Your referrals",
    yourReferralsDesc: "People you've invited and their current status.",
    person: "Person",
    status: "Status",
    date: "Date",
    reward: "Reward",
    summary: [
      { label: "People referred", value: "8" },
      { label: "Signed up", value: "5" },
      { label: "Credits earned", value: "2,000" },
    ],
    steps: [
      {
        title: "Share your link",
        description:
          "Send your personal referral link to friends and colleagues.",
      },
      {
        title: "They sign up & activate",
        description: "Your referral creates an account and starts using Kombo.",
      },
      {
        title: "You both get 500 credits",
        description: "Credits land in both accounts the moment they activate.",
      },
    ],
    statusLabels: {
      Active: "Active",
      "Signed up": "Signed up",
      Invited: "Invited",
    } as Record<ReferralStatus, string>,
  },
  es: {
    title: "Recomienda y gana",
    description:
      "Regala 500 créditos y gana 500 cuando un referido se active.",
    shareLinkToast: "Enlace de referido copiado",
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
    howItWorks: "Cómo funciona",
    howItWorksDesc: "Tres pasos para empezar a ganar créditos.",
    yourReferrals: "Tus referidos",
    yourReferralsDesc: "Personas que has invitado y su estado actual.",
    person: "Persona",
    status: "Estado",
    date: "Fecha",
    reward: "Recompensa",
    summary: [
      { label: "Personas referidas", value: "8" },
      { label: "Registradas", value: "5" },
      { label: "Créditos ganados", value: "2,000" },
    ],
    steps: [
      {
        title: "Comparte tu enlace",
        description:
          "Envía tu enlace personal de referido a amigos y colegas.",
      },
      {
        title: "Se registran y se activan",
        description: "Tu referido crea una cuenta y empieza a usar Kombo.",
      },
      {
        title: "Ambos ganáis 500 créditos",
        description:
          "Los créditos llegan a ambas cuentas en cuanto se activan.",
      },
    ],
    statusLabels: {
      Active: "Activo",
      "Signed up": "Registrado",
      Invited: "Invitado",
    } as Record<ReferralStatus, string>,
  },
} as const

function referralInitials(name: string): string {
  const [first, last] = name.split(" ")
  return initials(first, last)
}

export default function Referral() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const copyLink = async () => {
    try {
      await navigator.clipboard?.writeText(REFERRAL_LINK)
      toast.success(c.copiedToast)
    } catch {
      toast.error(c.copyErrorToast)
    }
  }

  return (
    <Page>
      <PageHeading
        title={c.title}
        description={c.description}
        action={
          <Button
            variant="volt"
            onClick={() => toast.success(c.shareLinkToast)}
          >
            <Share2 className="size-4" />
            {c.shareLink}
          </Button>
        }
      />

      {/* Referral link */}
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

      {/* Summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {c.summary.map((stat) => (
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
                {referrals.map((referral) => {
                  const isActive = referral.status === "Active"
                  return (
                    <TableRow key={referral.email}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            <AvatarFallback className="text-xs">
                              {referralInitials(referral.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {referral.name}
                            </p>
                            <p className="text-muted-foreground truncate text-xs">
                              {referral.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[referral.status]}>
                          {c.statusLabels[referral.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {relativeTime(referral.date)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {isActive ? (
                          <span className="text-chart-1 font-medium">
                            +{referral.reward}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
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
