import * as React from "react"
import { toast } from "sonner"
import { Plus, Mail } from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { Page, PageHeading } from "@/components/layout/Page"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { emailTemplates } from "@/lib/mock-extra"
import type { Channel, EmailTemplate } from "@/lib/types"
import { cn } from "@/lib/utils"

function ChannelIcon({
  channel,
  className,
}: {
  channel: Channel
  className?: string
}) {
  return channel === "linkedin" ? (
    <LinkedinIcon className={className} />
  ) : (
    <Mail className={className} />
  )
}

function groupByFolder(templates: EmailTemplate[]): [string, EmailTemplate[]][] {
  const groups = new Map<string, EmailTemplate[]>()
  for (const template of templates) {
    const bucket = groups.get(template.folder)
    if (bucket) {
      bucket.push(template)
    } else {
      groups.set(template.folder, [template])
    }
  }
  return Array.from(groups.entries())
}

function TemplateCard({
  template,
  onOpen,
}: {
  template: EmailTemplate
  onOpen: (template: EmailTemplate) => void
}) {
  const isTopPerformer = template.replyRate > 25
  const strongReplyRate = template.replyRate >= 20
  const preview =
    template.channel === "email"
      ? template.subject
      : template.body.split("\n")[0]

  return (
    <button
      type="button"
      onClick={() => onOpen(template)}
      className="bg-card text-card-foreground hover:border-primary/40 flex h-full flex-col gap-3 rounded-xl border p-4 text-left shadow-sm transition-colors"
    >
      <div className="flex items-start gap-3">
        <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
          <ChannelIcon channel={template.channel} className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{template.name}</p>
          <p className="text-muted-foreground mt-0.5 truncate text-sm">
            {preview}
          </p>
        </div>
        {isTopPerformer && (
          <Badge variant="success" className="shrink-0">
            Top performer
          </Badge>
        )}
      </div>

      {template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {template.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="text-muted-foreground mt-auto flex items-center justify-between pt-1 text-xs">
        <span className="tabular-nums">
          {template.sent.toLocaleString()} sent
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-medium tabular-nums",
            strongReplyRate
              ? "bg-chart-1/15 text-chart-1"
              : "bg-muted text-muted-foreground"
          )}
        >
          {template.replyRate}% reply
        </span>
      </div>
    </button>
  )
}

const VARIABLE_HINT = "Variables: {{first_name}}, {{company}}, {{sender}}"

export default function Templates() {
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<EmailTemplate | null>(null)
  const [name, setName] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [body, setBody] = React.useState("")
  const [channel, setChannel] = React.useState<Channel>("email")

  function openEditor(template: EmailTemplate | null) {
    setEditing(template)
    setName(template?.name ?? "")
    setSubject(template?.subject ?? "")
    setBody(template?.body ?? "")
    setChannel(template?.channel ?? "email")
    setOpen(true)
  }

  function handleSave() {
    setOpen(false)
    toast.success("Template saved")
  }

  const groups = groupByFolder(emailTemplates)

  return (
    <Page>
      <PageHeading
        title="Email Templates"
        description="Reusable outreach templates with live performance."
        action={
          <Button onClick={() => openEditor(null)}>
            <Plus className="size-4" />
            New template
          </Button>
        }
      />

      <div className="space-y-8">
        {groups.map(([folder, templates]) => (
          <section key={folder} className="space-y-3">
            <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              {folder}{" "}
              <span className="tabular-nums">({templates.length})</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onOpen={openEditor}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit template" : "New template"}
            </DialogTitle>
            <DialogDescription>
              {channel === "email"
                ? "Email template"
                : "LinkedIn template — no subject line"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Name</Label>
              <Input
                id="template-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Cold outreach — RevOps angle"
              />
            </div>

            {channel === "email" && (
              <div className="space-y-2">
                <Label htmlFor="template-subject">Subject</Label>
                <Input
                  id="template-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Cleaner pipeline data at {{company}}"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="template-body">Body</Label>
              <Textarea
                id="template-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your template…"
                className="min-h-48"
              />
              <p className="text-muted-foreground text-xs">{VARIABLE_HINT}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  )
}
