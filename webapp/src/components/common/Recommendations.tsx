import * as React from "react"
import { toast } from "sonner"
import { Sparkles, X, Plus, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { useLocale } from "@/lib/locale"
import { sequenceStore } from "@/lib/mock-sequences"
import { templateStore } from "@/lib/store"
import { librarySequences, libraryTemplates } from "@/lib/mock-library"
import { cn } from "@/lib/utils"

// Persisted dismissals so a hidden recommendation strip stays hidden.
const KEY = "kombo_recs_dismissed_v1"
const subs = new Set<() => void>()
function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return new Set(JSON.parse(raw) as string[])
  } catch {
    /* ignore */
  }
  return new Set()
}
let dismissed = load()
function dismissRec(key: string): void {
  dismissed = new Set(dismissed)
  dismissed.add(key)
  try {
    localStorage.setItem(KEY, JSON.stringify([...dismissed]))
  } catch {
    /* ignore */
  }
  subs.forEach((s) => s())
}
function useDismissed(key: string): boolean {
  return React.useSyncExternalStore(
    (cb) => {
      subs.add(cb)
      return () => subs.delete(cb)
    },
    () => dismissed.has(key),
    () => dismissed.has(key)
  )
}

const COPY = {
  en: {
    seqTitle: "Start from a proven sequence",
    seqSubtitle: "Battle-tested multi-channel plays — use one as-is or tweak it.",
    tmplTitle: "Start from a proven template",
    tmplSubtitle: "Email & LinkedIn templates with merge variables, ready to send.",
    use: "Use",
    steps: (n: number) => `${n} steps`,
    seqAdded: (name: string) => `"${name}" added to your sequences`,
    tmplAdded: (name: string) => `"${name}" added to your templates`,
    dismiss: "Dismiss",
  },
  es: {
    seqTitle: "Empieza con una secuencia probada",
    seqSubtitle: "Jugadas multicanal que funcionan — úsala tal cual o ajústala.",
    tmplTitle: "Empieza con una plantilla probada",
    tmplSubtitle: "Plantillas de correo y LinkedIn con variables, listas para enviar.",
    use: "Usar",
    steps: (n: number) => `${n} pasos`,
    seqAdded: (name: string) => `«${name}» añadida a tus secuencias`,
    tmplAdded: (name: string) => `«${name}» añadida a tus plantillas`,
    dismiss: "Descartar",
  },
} as const

function RecShell({
  dismissKey,
  title,
  subtitle,
  children,
}: {
  dismissKey: string
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const isDismissed = useDismissed(dismissKey)
  if (isDismissed) return null
  return (
    <div className="border-primary/20 bg-primary/5 mb-6 rounded-xl border p-4">
      <div className="mb-3 flex items-start gap-2">
        <span className="bg-primary/15 text-primary flex size-7 shrink-0 items-center justify-center rounded-lg">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-muted-foreground text-xs">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => dismissRec(dismissKey)}
          aria-label={c.dismiss}
          title={c.dismiss}
          className="text-muted-foreground hover:bg-muted hover:text-foreground -mt-1 -mr-1 flex size-7 shrink-0 items-center justify-center rounded-md transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  )
}

function RecCard({
  title,
  desc,
  meta,
  onUse,
  useLabel,
}: {
  title: string
  desc: string
  meta?: React.ReactNode
  onUse: () => void
  useLabel: string
}) {
  return (
    <div className="bg-background flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="text-muted-foreground line-clamp-2 text-xs">{desc}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <span className="text-muted-foreground truncate text-xs">{meta}</span>
        <Button size="sm" variant="outline" className="h-7 shrink-0" onClick={onUse}>
          <Plus className="size-3.5" />
          {useLabel}
        </Button>
      </div>
    </div>
  )
}

export function SequenceRecommendations() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const items = librarySequences.slice(0, 3)

  return (
    <RecShell dismissKey="recs-sequences" title={c.seqTitle} subtitle={c.seqSubtitle}>
      {items.map((s) => {
        const stepCount = s.steps.filter((step) => step !== "wait").length
        return (
          <RecCard
            key={s.id}
            title={s.name}
            desc={s.description}
            meta={c.steps(stepCount)}
            useLabel={c.use}
            onUse={() => {
              sequenceStore.create({
                name: s.name,
                description: s.description,
                steps: s.steps,
              })
              toast.success(c.seqAdded(s.name))
            }}
          />
        )
      })}
    </RecShell>
  )
}

export function TemplateRecommendations() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const items = libraryTemplates.slice(0, 3)

  return (
    <RecShell dismissKey="recs-templates" title={c.tmplTitle} subtitle={c.tmplSubtitle}>
      {items.map((t) => (
        <RecCard
          key={t.id}
          title={t.name}
          desc={t.subject || t.body.split("\n")[0]}
          meta={
            <span className="inline-flex items-center gap-1">
              {t.channel === "linkedin" ? (
                <LinkedinIcon className={cn("size-3", "text-linkedin")} />
              ) : (
                <Mail className="size-3" />
              )}
              {t.folder}
            </span>
          }
          useLabel={c.use}
          onUse={() => {
            templateStore.create({
              name: t.name,
              folder: t.folder,
              channel: t.channel,
              subject: t.subject,
              body: t.body,
              tags: t.tags,
            })
            toast.success(c.tmplAdded(t.name))
          }}
        />
      ))}
    </RecShell>
  )
}
