import * as React from "react"
import { toast } from "sonner"
import { Sparkles, Send, Loader2, Mail, FileText } from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"

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
import { RichTextEditor } from "@/components/common/RichTextEditor"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TemplatePickerDialog } from "@/components/templates/TemplatePickerDialog"
import { plainToHtml, stripHtml } from "@/lib/rich-text"
import { currentUser } from "@/lib/mock-data"
import { useLocale } from "@/lib/locale"
import type { Channel, Prospect } from "@/lib/types"

const COPY = {
  en: { templates: "Templates" },
  es: { templates: "Plantillas" },
  it: { templates: "Modelli" },
  fr: { templates: "Modèles" },
  de: { templates: "Vorlagen" },
  pt: { templates: "Modelos" },
  pt_BR: { templates: "Modelos" },
} as const

function draftFor(prospect: Prospect, channel: Channel): string {
  if (channel === "linkedin") {
    return `Hi ${prospect.firstName}, really impressed by what ${prospect.company} is doing in ${prospect.industry}. Given you're focused on ${prospect.department.toLowerCase()}, I'd love to share how teams like yours are building pipeline faster. Open to a quick chat?`
  }
  return `Hi ${prospect.firstName},\n\nI noticed ${prospect.company} ${prospect.signals[0]?.toLowerCase() ?? "is scaling"} — usually a sign the ${prospect.department.toLowerCase()} team is under pressure to deliver pipeline.\n\nKombo helps ${prospect.seniority}-level leaders like you find best-fit prospects and personalize outreach at scale. Worth a 15-minute look?\n\nBest,\nKevin`
}

export function ComposeDialog({
  open,
  onOpenChange,
  prospect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospect: Prospect
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [channel, setChannel] = React.useState<Channel>("email")
  const [subject, setSubject] = React.useState(
    `Quick idea for ${prospect.company}`
  )
  const [body, setBody] = React.useState("")
  const [generating, setGenerating] = React.useState(false)
  const [templateOpen, setTemplateOpen] = React.useState(false)

  // Resolved recipient/sender values for the template picker's live preview.
  const templateVars: Record<string, string> = {
    first_name: prospect.firstName,
    last_name: prospect.lastName,
    company: prospect.company,
    title: prospect.title,
    industry: prospect.industry,
    city: prospect.location,
    sender: currentUser.name,
    sender_company: currentUser.company,
    sender_title: currentUser.role,
  }

  function generate() {
    setGenerating(true)
    setTimeout(() => {
      setBody(plainToHtml(draftFor(prospect, channel)))
      setGenerating(false)
    }, 700)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Message {prospect.firstName} {prospect.lastName}
          </DialogTitle>
          <DialogDescription>
            {prospect.title} · {prospect.company}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={channel} onValueChange={(v) => setChannel(v as Channel)}>
          <TabsList>
            <TabsTrigger value="email">
              <Mail className="size-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="linkedin">
              <LinkedinIcon className="size-4" />
              LinkedIn
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          {channel === "email" && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="body">Message</Label>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setTemplateOpen(true)}
                  className="text-muted-foreground h-7"
                >
                  <FileText className="size-3.5" />
                  {c.templates}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generate}
                  disabled={generating}
                  className="text-primary h-7"
                >
                  {generating ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="size-3.5" />
                  )}
                  Generate with AI
                </Button>
              </div>
            </div>
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder="Write your message or generate a draft with AI…"
              ariaLabel="Message"
              minHeight="min-h-40"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!stripHtml(body)}
            onClick={() => {
              onOpenChange(false)
              toast.success(`Message sent to ${prospect.firstName}`)
            }}
          >
            <Send className="size-4" />
            Send
          </Button>
        </DialogFooter>

        <TemplatePickerDialog
          open={templateOpen}
          onOpenChange={setTemplateOpen}
          onInsert={(t) => {
            setBody(plainToHtml(t.body))
            if (channel === "email" && t.subject) setSubject(t.subject)
          }}
          vars={templateVars}
          recipientName={`${prospect.firstName} ${prospect.lastName}`}
          channel={channel}
          locale={locale}
        />
      </DialogContent>
    </Dialog>
  )
}
