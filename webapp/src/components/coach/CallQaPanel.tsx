import * as React from "react"
import { Sparkles, Send, MessageSquare } from "lucide-react"

import { useLocale } from "@/lib/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getCallQa, genericAnswer, type CoachQaPair } from "@/lib/mock-coach-qa"

const COPY = {
  en: {
    title: "Ask about this call",
    subtitle: "Kai answers from the transcript and scorecard.",
    suggested: "Suggested questions",
    placeholder: "Ask a precise question…",
    send: "Ask",
    disclaimer: "Answers are AI-generated from this call.",
  },
  es: {
    title: "Pregunta sobre esta llamada",
    subtitle: "Kai responde desde la transcripción y el informe.",
    suggested: "Preguntas sugeridas",
    placeholder: "Haz una pregunta precisa…",
    send: "Preguntar",
    disclaimer: "Las respuestas se generan con IA a partir de esta llamada.",
  },
} as const

interface Turn {
  role: "user" | "kai"
  text: string
}

export function CallQaPanel({ recordingId }: { recordingId: string }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const qa = getCallQa(recordingId, locale)
  const [thread, setThread] = React.useState<Turn[]>([])
  const [input, setInput] = React.useState("")

  // Match a typed question to a scripted answer, else fall back to a generic
  // on-topic reply — enough to feel responsive in a prototype.
  function answerFor(question: string): string {
    const q = question.trim().toLowerCase()
    const hit = qa.find(
      (p: CoachQaPair) =>
        p.q.toLowerCase() === q ||
        q.includes(p.q.toLowerCase()) ||
        p.q.toLowerCase().includes(q)
    )
    return hit ? hit.a : genericAnswer(locale)
  }

  function ask(question: string) {
    const text = question.trim()
    if (!text) return
    setThread((prev) => [
      ...prev,
      { role: "user", text },
      { role: "kai", text: answerFor(text) },
    ])
    setInput("")
  }

  const unasked = qa.filter(
    (p) => !thread.some((t) => t.role === "user" && t.text === p.q)
  )

  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <span className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-md">
          <Sparkles className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold">{c.title}</p>
          <p className="text-muted-foreground text-xs">{c.subtitle}</p>
        </div>
      </div>

      {thread.length > 0 && (
        <div className="mt-4 space-y-3">
          {thread.map((t, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2 text-sm",
                t.role === "user" && "justify-end"
              )}
            >
              {t.role === "kai" && (
                <span className="bg-primary/10 text-primary mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md">
                  <Sparkles className="size-3.5" />
                </span>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2",
                  t.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {t.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {unasked.length > 0 && (
        <div className="mt-4">
          <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-medium">
            <MessageSquare className="size-3.5" />
            {c.suggested}
          </p>
          <div className="flex flex-wrap gap-2">
            {unasked.map((p) => (
              <button
                key={p.q}
                type="button"
                onClick={() => ask(p.q)}
                className="hover:border-primary/40 hover:bg-muted/40 rounded-full border px-3 py-1.5 text-left text-xs transition-colors"
              >
                {p.q}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        className="mt-4 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          ask(input)
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={c.placeholder}
          aria-label={c.title}
        />
        <Button type="submit" size="sm" disabled={!input.trim()}>
          <Send className="size-4" />
          <span className="hidden sm:inline">{c.send}</span>
        </Button>
      </form>
      <p className="text-muted-foreground mt-2 text-[11px]">{c.disclaimer}</p>
    </div>
  )
}
