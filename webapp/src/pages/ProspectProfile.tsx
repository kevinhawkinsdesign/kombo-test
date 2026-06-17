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
  Lock,
  Copy,
  Target,
  Clock,
  MailCheck,
  MailOpen,
  Reply,
  CalendarCheck,
  UserPlus,
  StickyNote,
  PhoneCall,
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
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ProspectAvatar,
  ScoreBadge,
  StatusBadge,
} from "@/components/common/ProspectBits"
import { AddToListDialog } from "@/components/prospect/AddToListDialog"
import { ComposeDialog } from "@/components/prospect/ComposeDialog"
import { AddToCrmDialog } from "@/components/crm/AddToCrmDialog"
import { getProspect, conversations } from "@/lib/mock-data"
import {
  callPrep,
  emailPrep,
  getHistory,
  getNotes,
  qualification,
  SMART_TAGS,
  type HistoryType,
  type ProspectNote,
} from "@/lib/mock-prospect-depth"
import { useCredits } from "@/lib/credits"
import { useAuth } from "@/lib/auth"
import { relativeTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Prospect } from "@/lib/types"

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
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="prep">AI Prep</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
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
                              {m.direction === "outbound"
                                ? "You"
                                : prospect.firstName}{" "}
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
            </TabsContent>

            <TabsContent value="prep">
              <PrepTab prospect={prospect} onUse={() => setComposeOpen(true)} />
            </TabsContent>

            <TabsContent value="history">
              <HistoryTab prospect={prospect} />
            </TabsContent>

            <TabsContent value="notes">
              <NotesTab prospect={prospect} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <ContactCard prospect={prospect} onAddToCrm={() => setCrmOpen(true)} />
          <QualificationCard prospect={prospect} />
          <EnrichmentCard prospect={prospect} onAddToCrm={() => setCrmOpen(true)} />
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

/* ----------------------------- Contact (credit-gated reveal) ----------------------------- */

function ContactCard({
  prospect,
  onAddToCrm,
}: {
  prospect: Prospect
  onAddToCrm: () => void
}) {
  const { spend } = useCredits()
  const [emailShown, setEmailShown] = React.useState(false)
  const [phoneShown, setPhoneShown] = React.useState(false)
  const [confirm, setConfirm] = React.useState<null | "email" | "phone">(null)

  const maskedEmail = `••••••@${prospect.companyDomain}`
  const maskedPhone = "+1 (•••) •••-••••"
  const cost = confirm === "phone" ? 2 : 1

  function doReveal() {
    if (!confirm) return
    const label = `${confirm === "email" ? "Email" : "Phone"} reveal · ${prospect.firstName} ${prospect.lastName}`
    if (spend(cost, label)) {
      if (confirm === "email") setEmailShown(true)
      else setPhoneShown(true)
      toast.success(`${confirm === "email" ? "Email" : "Phone"} revealed`)
    }
    setConfirm(null)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {/* Email */}
          <div className="flex items-center gap-3">
            <Mail className="text-muted-foreground size-4 shrink-0" />
            {emailShown ? (
              <a
                href={`mailto:${prospect.email}`}
                className="hover:text-primary truncate"
              >
                {prospect.email}
              </a>
            ) : (
              <button
                onClick={() => setConfirm("email")}
                className="text-muted-foreground hover:text-foreground flex flex-1 items-center justify-between gap-2"
              >
                <span className="truncate">{maskedEmail}</span>
                <span className="text-primary flex shrink-0 items-center gap-1 text-xs font-medium">
                  <Lock className="size-3" />
                  Reveal · 1
                </span>
              </button>
            )}
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3">
            <Phone className="text-muted-foreground size-4 shrink-0" />
            {phoneShown ? (
              <span>{prospect.phone ?? "Not available"}</span>
            ) : (
              <button
                onClick={() => setConfirm("phone")}
                className="text-muted-foreground hover:text-foreground flex flex-1 items-center justify-between gap-2"
              >
                <span className="truncate">{maskedPhone}</span>
                <span className="text-primary flex shrink-0 items-center gap-1 text-xs font-medium">
                  <Lock className="size-3" />
                  Reveal · 2
                </span>
              </button>
            )}
          </div>

          <a
            href={prospect.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary flex items-center gap-3"
          >
            <LinkedinIcon className="text-muted-foreground size-4" />
            <span className="truncate">LinkedIn profile</span>
          </a>

          <Separator />
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onAddToCrm}
          >
            <Building2 className="size-4" />
            Add to CRM
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reveal {confirm === "phone" ? "phone" : "email"}?</DialogTitle>
            <DialogDescription>
              This will use {cost} credit{cost > 1 ? "s" : ""} to reveal{" "}
              {prospect.firstName}'s {confirm === "phone" ? "phone number" : "email address"}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button onClick={doReveal}>
              <Lock className="size-4" />
              Use {cost} credit{cost > 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ----------------------------- Enrichment ----------------------------- */

function EnrichmentCard({
  prospect,
  onAddToCrm,
}: {
  prospect: Prospect
  onAddToCrm: () => void
}) {
  const enrichment = [
    { label: "Seniority", value: prospect.seniority },
    { label: "Department", value: prospect.department },
    { label: "Headcount", value: prospect.headcount },
    { label: "Industry", value: prospect.industry },
    { label: "Revenue", value: prospect.revenue },
    { label: "Location", value: prospect.location },
  ]
  return (
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
          onClick={onAddToCrm}
        >
          <Building2 className="size-4" />
          Add to CRM
        </Button>
      </CardContent>
    </Card>
  )
}

/* ----------------------------- Lead qualification ----------------------------- */

function QualificationCard({ prospect }: { prospect: Prospect }) {
  const q = qualification(prospect)
  const rows = [
    { label: "ICP fit", value: q.fit },
    { label: "Intent", value: q.intent },
    { label: "Engagement", value: q.engagement },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="text-primary size-4" />
          Lead qualification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="font-medium tabular-nums">{r.value}</span>
            </div>
            <Progress value={r.value} />
          </div>
        ))}
        <Separator />
        <ul className="space-y-1.5">
          {q.reasons.map((reason) => (
            <li
              key={reason}
              className="text-muted-foreground flex items-start gap-2 text-xs"
            >
              <span className="bg-muted-foreground/40 mt-1.5 size-1 shrink-0 rounded-full" />
              {reason}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

/* ----------------------------- AI Prep ----------------------------- */

function PrepTab({
  prospect,
  onUse,
}: {
  prospect: Prospect
  onUse: () => void
}) {
  const prep = callPrep(prospect)
  const emails = emailPrep(prospect)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PhoneCall className="text-primary size-4" />
            AI call prep
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <PrepSection title="Talking points" items={prep.talkingPoints} />
          <PrepSection
            title="Discovery questions"
            items={prep.discoveryQuestions}
          />
          <div>
            <p className="mb-2 text-sm font-medium">Likely objections</p>
            <div className="space-y-2">
              {prep.objections.map((o) => (
                <div key={o.objection} className="bg-muted/50 rounded-md p-3">
                  <p className="text-sm font-medium">“{o.objection}”</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    → {o.response}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="text-primary size-4" />
            AI email drafts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {emails.map((e) => (
            <div key={e.id} className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <Badge variant="secondary" className="font-normal">
                  {e.tone}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard?.writeText(`${e.subject}\n\n${e.body}`)
                      toast.success("Copied to clipboard")
                    }}
                  >
                    <Copy className="size-3.5" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={onUse}>
                    <Send className="size-3.5" />
                    Use
                  </Button>
                </div>
              </div>
              <p className="text-sm font-medium">{e.subject}</p>
              <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">
                {e.body}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function PrepSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm">
            <span className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ----------------------------- History ----------------------------- */

const HISTORY_META: Record<
  HistoryType,
  { icon: React.ComponentType<{ className?: string }>; tint: string }
> = {
  added: { icon: UserPlus, tint: "bg-muted text-muted-foreground" },
  enriched: { icon: Sparkles, tint: "bg-primary/15 text-primary" },
  email_sent: { icon: MailCheck, tint: "bg-chart-2/15 text-chart-2" },
  email_opened: { icon: MailOpen, tint: "bg-chart-2/15 text-chart-2" },
  replied: { icon: Reply, tint: "bg-chart-1/15 text-chart-1" },
  call: { icon: PhoneCall, tint: "bg-chart-4/15 text-chart-4" },
  meeting: { icon: CalendarCheck, tint: "bg-chart-1/15 text-chart-1" },
  note: { icon: StickyNote, tint: "bg-chart-4/15 text-chart-4" },
  status: { icon: Clock, tint: "bg-muted text-muted-foreground" },
}

function HistoryTab({ prospect }: { prospect: Prospect }) {
  const events = getHistory(prospect)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activity timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-5 border-l pl-6">
          {events.map((e) => {
            const meta = HISTORY_META[e.type]
            const Icon = meta.icon
            return (
              <li key={e.id} className="relative">
                <span
                  className={cn(
                    "absolute -left-[2.05rem] flex size-6 items-center justify-center rounded-full ring-4 ring-background",
                    meta.tint
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{e.label}</p>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {relativeTime(e.timestamp)}
                  </span>
                </div>
                {e.detail && (
                  <p className="text-muted-foreground text-xs">{e.detail}</p>
                )}
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}

/* ----------------------------- Notes ----------------------------- */

function NotesTab({ prospect }: { prospect: Prospect }) {
  const { user } = useAuth()
  const [notes, setNotes] = React.useState<ProspectNote[]>(() =>
    getNotes(prospect.id)
  )
  const [body, setBody] = React.useState("")
  const [tags, setTags] = React.useState<string[]>([])
  const idRef = React.useRef(0)

  function toggleTag(tag: string) {
    setTags((t) =>
      t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]
    )
  }

  function addNote() {
    if (!body.trim()) return
    idRef.current += 1
    setNotes((n) => [
      {
        id: `note_new_${idRef.current}`,
        author: user?.name ?? "You",
        body: body.trim(),
        tags,
        createdAt: new Date().toISOString(),
      },
      ...n,
    ])
    setBody("")
    setTags([])
    toast.success("Note added")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="What did you learn? Add context for your team…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-24"
          />
          <div className="flex flex-wrap gap-1.5">
            {SMART_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  tags.includes(tag)
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={addNote} disabled={!body.trim()}>
              <Plus className="size-4" />
              Add note
            </Button>
          </div>
        </CardContent>
      </Card>

      {notes.length === 0 ? (
        <p className="text-muted-foreground text-sm">No notes yet.</p>
      ) : (
        notes.map((note) => (
          <Card key={note.id}>
            <CardContent className="pt-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">{note.author}</p>
                <span className="text-muted-foreground text-xs">
                  {relativeTime(note.createdAt)}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{note.body}</p>
              {note.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {note.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="font-normal">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
