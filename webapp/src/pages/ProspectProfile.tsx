import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  Mail,
  Phone,
  Plus,
  Send,
  Sparkles,
  Building2,
  MapPin,
  Users,
  TrendingUp,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"

import { Page } from "@/components/layout/Page"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ProspectAvatar,
  ScoreBadge,
  StatusBadge,
} from "@/components/common/ProspectBits"
import { AddToListDialog } from "@/components/prospect/AddToListDialog"
import { ComposeDialog } from "@/components/prospect/ComposeDialog"
import { AddToCrmDialog } from "@/components/crm/AddToCrmDialog"
import { getProspect, conversations } from "@/lib/mock-data"
import { relativeTime } from "@/lib/format"

export default function ProspectProfile() {
  const { id } = useParams()
  const prospect = id ? getProspect(id) : undefined
  const [addOpen, setAddOpen] = React.useState(false)
  const [composeOpen, setComposeOpen] = React.useState(false)
  const [crmOpen, setCrmOpen] = React.useState(false)

  if (!prospect) {
    return (
      <Page>
        <p className="text-muted-foreground">Prospect not found.</p>
        <Button variant="link" asChild className="px-0">
          <Link to="/search">Back to search</Link>
        </Button>
      </Page>
    )
  }

  const conversation = conversations.find((c) => c.prospectId === prospect.id)

  const enrichment = [
    { label: "Seniority", value: prospect.seniority, icon: TrendingUp },
    { label: "Department", value: prospect.department, icon: Users },
    { label: "Headcount", value: prospect.headcount, icon: Users },
    { label: "Industry", value: prospect.industry, icon: Building2 },
    { label: "Revenue", value: prospect.revenue, icon: TrendingUp },
    { label: "Location", value: prospect.location, icon: MapPin },
  ]

  return (
    <Page>
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/search">
          <ArrowLeft className="size-4" />
          Back to search
        </Link>
      </Button>

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start">
          <ProspectAvatar
            prospect={prospect}
            className="size-16 text-lg sm:size-20"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold">
                {prospect.firstName} {prospect.lastName}
              </h1>
              <ScoreBadge score={prospect.score} />
              <StatusBadge status={prospect.status} />
            </div>
            <p className="text-muted-foreground mt-1">
              {prospect.title} · {prospect.company}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {prospect.tags.map((t) => (
                <Badge key={t} variant="secondary" className="font-normal">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setComposeOpen(true)}>
              <Send className="size-4" />
              Message
            </Button>
            <Button variant="outline" onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              Add to list
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {prospect.about}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="text-primary size-4" />
                Buying signals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {prospect.signals.map((s) => (
                <div
                  key={s}
                  className="bg-chart-1/10 text-chart-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
                >
                  <span className="bg-current size-1.5 rounded-full" />
                  {s}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Conversation</CardTitle>
              {conversation && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/inbox">Open in inbox</Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {conversation ? (
                <div className="space-y-3">
                  {conversation.messages.map((m) => (
                    <div
                      key={m.id}
                      className={
                        m.direction === "outbound"
                          ? "ml-8 rounded-lg rounded-tr-sm bg-primary/10 px-3 py-2"
                          : "mr-8 rounded-lg rounded-tl-sm bg-muted px-3 py-2"
                      }
                    >
                      <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
                        <span>
                          {m.direction === "outbound" ? "You" : prospect.firstName}{" "}
                          · {m.channel}
                        </span>
                        <span>{relativeTime(m.timestamp)}</span>
                      </div>
                      <p className="text-sm">{m.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-muted-foreground text-sm">
                    No conversation yet.
                  </p>
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => setComposeOpen(true)}
                  >
                    <Send className="size-4" />
                    Start outreach
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <a
                href={`mailto:${prospect.email}`}
                className="hover:text-primary flex items-center gap-3"
              >
                <Mail className="text-muted-foreground size-4" />
                <span className="truncate">{prospect.email}</span>
              </a>
              {prospect.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="text-muted-foreground size-4" />
                  <span>{prospect.phone}</span>
                </div>
              )}
              <a
                href={prospect.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary flex items-center gap-3"
              >
                <LinkedinIcon className="text-muted-foreground size-4" />
                <span className="truncate">LinkedIn profile</span>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Enrichment</CardTitle>
              <Badge variant="secondary" className="font-normal">
                30 data points
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {enrichment.map((e) => (
                  <div key={e.label}>
                    <p className="text-muted-foreground text-xs">{e.label}</p>
                    <p className="text-sm font-medium">{e.value}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setCrmOpen(true)}
              >
                <Building2 className="size-4" />
                Add to CRM
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddToListDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        count={1}
        onAdded={(name) =>
          toast.success(`${prospect.firstName} added to “${name}”`)
        }
      />
      <ComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        prospect={prospect}
      />
      <AddToCrmDialog
        open={crmOpen}
        onOpenChange={setCrmOpen}
        kind="prospect"
        recordName={`${prospect.firstName} ${prospect.lastName}`}
        fields={[
          { label: "First name", value: prospect.firstName },
          { label: "Last name", value: prospect.lastName },
          { label: "Email", value: prospect.email },
          { label: "Phone", value: prospect.phone ?? "—" },
          { label: "Company", value: prospect.company },
          { label: "Job title", value: prospect.title },
        ]}
      />
    </Page>
  )
}
