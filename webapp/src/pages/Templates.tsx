import * as React from "react"
import { toast } from "sonner"
import { Plus, Mail, Trash2 } from "lucide-react"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { FeatureIntro } from "@/components/common/FeatureIntro"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTemplates, templateStore } from "@/lib/store"
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
  onDelete,
}: {
  template: EmailTemplate
  onOpen: (template: EmailTemplate) => void
  onDelete: (template: EmailTemplate) => void
}) {
  const isTopPerformer = template.replyRate > 25
  const strongReplyRate = template.replyRate >= 20
  const preview =
    template.channel === "email"
      ? template.subject
      : template.body.split("\n")[0]

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(template)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onOpen(template)
        }
      }}
      className="bg-card text-card-foreground hover:border-primary/40 focus-visible:border-primary/40 focus-visible:ring-ring/50 relative flex h-full cursor-pointer flex-col gap-3 rounded-xl border p-4 text-left shadow-sm transition-colors outline-none focus-visible:ring-[3px]"
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
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete ${template.name}`}
          className="text-muted-foreground hover:text-destructive size-8 shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(template)
          }}
        >
          <Trash2 className="size-4" />
        </Button>
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
    </div>
  )
}

const VARIABLE_HINT = "Variables: {{first_name}}, {{company}}, {{sender}}"

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

export default function Templates() {
  const templates = useTemplates()

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<EmailTemplate | null>(null)
  const [name, setName] = React.useState("")
  const [folder, setFolder] = React.useState("Cold outreach")
  const [channel, setChannel] = React.useState<Channel>("email")
  const [subject, setSubject] = React.useState("")
  const [body, setBody] = React.useState("")
  const [tags, setTags] = React.useState("")

  const [confirmTarget, setConfirmTarget] = React.useState<EmailTemplate | null>(
    null
  )

  function openEditor(template: EmailTemplate | null) {
    setEditing(template)
    setName(template?.name ?? "")
    setFolder(template?.folder ?? "Cold outreach")
    setChannel(template?.channel ?? "email")
    setSubject(template?.subject ?? "")
    setBody(template?.body ?? "")
    setTags(template?.tags.join(", ") ?? "")
    setOpen(true)
  }

  function handleSave() {
    const patch = {
      name,
      folder,
      channel,
      subject: channel === "email" ? subject : "",
      body,
      tags: parseTags(tags),
    }
    if (editing) {
      templateStore.update(editing.id, patch)
      toast.success("Template saved")
    } else {
      templateStore.create(patch)
      toast.success("Template created")
    }
    setOpen(false)
  }

  function handleDelete() {
    if (!confirmTarget) return
    templateStore.remove(confirmTarget.id)
    toast.success("Template deleted")
  }

  const groups = groupByFolder(templates)

  return (
    <Page>
      <PageHeading
        title="Email Templates"
        description="Reusable outreach templates with live performance."
        action={
          <Button variant="volt" onClick={() => openEditor(null)}>
            <Plus className="size-4" />
            New template
          </Button>
        }
      />

      <FeatureIntro
        featureKey="templates"
        icon={Mail}
        title="Reusable message templates"
        description="Save your best-performing copy and personalize it at scale."
        points={[
          "Merge variables for personalization",
          "See reply rate per template",
          "Share winners with your team",
        ]}
        className="mb-6"
      />

      <div className="space-y-8">
        {groups.map(([groupFolder, groupTemplates]) => (
          <section key={groupFolder} className="space-y-3">
            <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              {groupFolder}{" "}
              <span className="tabular-nums">({groupTemplates.length})</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groupTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onOpen={openEditor}
                  onDelete={setConfirmTarget}
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="template-channel">Channel</Label>
                <Select
                  value={channel}
                  onValueChange={(value) => setChannel(value as Channel)}
                >
                  <SelectTrigger id="template-channel" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-folder">Folder</Label>
                <Input
                  id="template-folder"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  placeholder="Cold outreach"
                />
              </div>
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

            <div className="space-y-2">
              <Label htmlFor="template-tags">Tags</Label>
              <Input
                id="template-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="revops, intro, short"
              />
              <p className="text-muted-foreground text-xs">
                Separate tags with commas.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="volt" onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmTarget !== null}
        onOpenChange={(next) => {
          if (!next) setConfirmTarget(null)
        }}
        title="Delete template?"
        description={
          confirmTarget
            ? `"${confirmTarget.name}" will be permanently removed.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </Page>
  )
}
