import * as React from "react"
import { Sparkles, Send, Loader2, Wrench } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KomboMark } from "@/components/KomboLogo"
import { cn } from "@/lib/utils"
import { connectedToolCount } from "@/lib/mock-network"
import type { KaiMessage } from "@/lib/types"

const SUGGESTIONS = [
  "Who are my top prospects to action today?",
  "Draft a follow-up to Sarah Chen",
  "Book a meeting with Grace Liu",
  "Which deals are at risk this quarter?",
]

interface KaiReply {
  content: string
  tools: string[]
}

function answerFor(prompt: string): KaiReply {
  const q = prompt.toLowerCase()
  if (q.includes("top") && q.includes("prospect")) {
    return {
      content:
        "Your highest-scoring prospects right now are **Aisha Khan** (CRO, Lumen Health — score 95), **Grace Liu** (COO, Meridian Bank — 90) and **Sarah Chen** (VP Sales, Northwind — 92, who just replied). I'd prioritize Sarah today since she's asking for meeting times.",
      tools: ["HubSpot MCP", "Web Search"],
    }
  }
  if (q.includes("book") || q.includes("meeting") || q.includes("calendar")) {
    return {
      content:
        "I checked your calendar — you're open Tue 2:00 PM and Wed 10:00 AM. I've drafted an invite to **Grace Liu** for Tue 2:00 PM (\"Meridian Bank × Kombo — intro\") and a short email to send it. Want me to send both?",
      tools: ["Google Calendar", "Gmail"],
    }
  }
  if (q.includes("follow-up") || q.includes("draft")) {
    return {
      content:
        "Here's a draft for Sarah Chen:\n\n“Hi Sarah — great to hear you're hiring 5 SDRs this quarter. I have Tue 2pm or Wed 10am open for a quick 15-min walkthrough of how teams ramp new reps 3x faster with Kombo. Which works?”\n\nWant me to send it or tweak the tone?",
      tools: ["Gmail", "HubSpot MCP"],
    }
  }
  if (q.includes("risk") || q.includes("deal")) {
    return {
      content:
        "Two deals look at risk: **Atlas — Pilot** ($95K, only 20% and no activity in 3 days) and **Harbor Financial — Pilot** ($70K, 15%, still in Lead). **Meridian Bank** ($320K) is healthy at 55% in Proposal. Want a re-engagement sequence for the two stalled ones?",
      tools: ["HubSpot MCP"],
    }
  }
  if (q.includes("team") || q.includes("performance")) {
    return {
      content:
        "This week the team booked 23 meetings and influenced $412K in pipeline. **Maya Patel** leads on quota attainment (57%), while **Ethan Wright**'s reply rate (14%) is trending below team average — a coaching opportunity. Want me to open his call recordings?",
      tools: ["HubSpot MCP"],
    }
  }
  return {
    content:
      "Got it. I'm connected to your CRM, calendar, email, and the web, so I can find prospects, draft and send outreach, book meetings, and analyze pipeline. Try a suggestion above, or ask about a specific account or rep.",
    tools: [],
  }
}

export function KaiAssistant() {
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<KaiMessage[]>([])
  const [input, setInput] = React.useState("")
  const [thinking, setThinking] = React.useState(false)
  const endRef = React.useRef<HTMLDivElement>(null)
  const idRef = React.useRef(0)
  const nextId = () => `m_${(idRef.current += 1)}`

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, thinking])

  function send(text: string) {
    const content = text.trim()
    if (!content) return
    const userMsg: KaiMessage = {
      id: nextId(),
      role: "user",
      content,
    }
    setMessages((m) => [...m, userMsg])
    setInput("")
    setThinking(true)
    setTimeout(() => {
      const reply = answerFor(content)
      setMessages((m) => [
        ...m,
        {
          id: nextId(),
          role: "assistant",
          content: reply.content,
          tools: reply.tools,
        },
      ])
      setThinking(false)
    }, 700)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="text-primary size-4" />
          <span className="hidden sm:inline">Ask Kai</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <div className="flex items-center gap-3">
            <KomboMark />
            <div>
              <SheetTitle>Kai</SheetTitle>
              <SheetDescription className="flex items-center gap-1.5">
                <Wrench className="size-3" />
                Connected to {connectedToolCount} tools
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="space-y-3 pt-4">
              <p className="text-muted-foreground text-sm">
                Ask me anything about your pipeline, prospects, or team.
              </p>
              <div className="space-y-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="hover:border-primary/40 hover:bg-muted/50 block w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex flex-col gap-1.5",
                m.role === "user" ? "items-end" : "items-start"
              )}
            >
              {m.tools && m.tools.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {m.tools.map((t) => (
                    <span
                      key={t}
                      className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                    >
                      <Wrench className="size-2.5" />
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted rounded-tl-sm"
                )}
              >
                {m.content}
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm">
                <Loader2 className="size-3.5 animate-spin" />
                Kai is thinking…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          className="flex items-center gap-2 border-t p-3"
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Kai…"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            aria-label="Send message"
          >
            <Send className="size-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
