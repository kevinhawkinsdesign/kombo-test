import { Copy, Gift, Mail, Share2 } from "lucide-react"
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

const summary = [
  { label: "People referred", value: "8" },
  { label: "Signed up", value: "5" },
  { label: "Credits earned", value: "2,000" },
]

const steps = [
  {
    title: "Share your link",
    description: "Send your personal referral link to friends and colleagues.",
  },
  {
    title: "They sign up & activate",
    description: "Your referral creates an account and starts using Kombo.",
  },
  {
    title: "You both get 500 credits",
    description: "Credits land in both accounts the moment they activate.",
  },
]

function referralInitials(name: string): string {
  const [first, last] = name.split(" ")
  return initials(first, last)
}

export default function Referral() {
  const copyLink = async () => {
    try {
      await navigator.clipboard?.writeText(REFERRAL_LINK)
      toast.success("Copied to clipboard")
    } catch {
      toast.error("Couldn't copy link")
    }
  }

  return (
    <Page>
      <PageHeading
        title="Refer & earn"
        description="Give 500 credits, get 500 credits when a referral activates."
        action={
          <Button onClick={() => toast.success("Referral link copied")}>
            <Share2 className="size-4" />
            Share link
          </Button>
        }
      />

      {/* Referral link */}
      <Card>
        <CardHeader>
          <CardTitle>Your referral link</CardTitle>
          <CardDescription>
            Share this link anywhere — it&apos;s tied to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              readOnly
              value={REFERRAL_LINK}
              aria-label="Your referral link"
              className="font-mono"
            />
            <Button onClick={copyLink} className="shrink-0">
              <Copy className="size-4" />
              Copy
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Opening email draft — coming soon")}
            >
              <Mail className="size-4" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Opening LinkedIn share — coming soon")}
            >
              <LinkedinIcon className="size-4" />
              LinkedIn
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
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

      {/* How it works */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="text-primary size-4" />
              How it works
            </CardTitle>
            <CardDescription>
              Three steps to start earning credits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              {steps.map((step, index) => (
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
            <CardTitle>Your referrals</CardTitle>
            <CardDescription>
              People you&apos;ve invited and their current status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Reward</TableHead>
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
                          {referral.status}
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
