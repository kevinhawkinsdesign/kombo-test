import * as React from "react"
import { toast } from "sonner"
import { Sparkles, Send, Loader2, Mail } from "lucide-react"

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
import { plainToHtml, stripHtml } from "@/lib/rich-text"
import type { Channel, Prospect } from "@/lib/types"

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
  const [channel, setChannel] = React.useState<Channel>("email")
  const [subject, setSubject] = React.useState(
    `Quick idea for ${prospect.company}`
  )
  const [body, setBody] = React.useState("")
  const [generating, setGenerating] = React.useState(false)

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
      </DialogContent>
    </Dialog>
  )
}
