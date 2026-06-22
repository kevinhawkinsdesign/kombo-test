import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Plus,
  Mail,
  Phone,
  MessageCircle,
  Sparkles,
  Clock,
  Workflow,
  Pencil,
  Copy,
  Trash2,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { useLocale } from "@/lib/locale"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { useSequences, sequenceStore } from "@/lib/mock-sequences"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { SequenceChannelType } from "@/lib/types"
import type { SequenceItem } from "@/lib/mock-sequences"

const CHANNELS: Record<
  SequenceChannelType,
  { icon: React.ComponentType<{ className?: string }>; tint: string; en: string; es: string }
> = {
  email: { icon: Mail, tint: "bg-primary/15 text-primary", en: "Email", es: "Email" },
  linkedin: { icon: LinkedinIcon, tint: "bg-[#0a66c2]/15 text-[#0a66c2]", en: "LinkedIn", es: "LinkedIn" },
  call: { icon: Phone, tint: "bg-chart-4/15 text-chart-4", en: "Call", es: "Llamada" },
  ai_call: { icon: Sparkles, tint: "bg-chart-5/15 text-chart-5", en: "AI call", es: "Llamada IA" },
  whatsapp: { icon: MessageCircle, tint: "bg-chart-1/15 text-chart-1", en: "WhatsApp", es: "WhatsApp" },
  wait: { icon: Clock, tint: "bg-muted text-muted-foreground", en: "Wait", es: "Espera" },
}

const COPY = {
  en: {
    title: "Sequences",
    description: "Reusable multi-channel cadences your campaigns run.",
    newSequence: "New sequence",
    introTitle: "Build sequences once, reuse everywhere",
    introDescription:
      "Design a multi-step, multi-channel cadence — email, LinkedIn, calls, WhatsApp, even AI calls — with waits and triggers between steps, then attach it to any campaign.",
    introPoints: [
      "Mix email, LinkedIn, calls & WhatsApp",
      "Time steps with waits and triggers",
      "Reuse a proven cadence across campaigns",
      "Track reply rate per sequence",
    ],
    steps: (n: number) => `${n} ${n === 1 ? "step" : "steps"}`,
    usedBy: (n: number) => `${n} ${n === 1 ? "campaign" : "campaigns"}`,
    replyRate: "reply rate",
    updated: (d: string) => `Updated ${d}`,
    edit: "Edit",
    duplicate: "Duplicate",
    delete: "Delete",
    duplicated: "Sequence duplicated",
    deleted: "Sequence deleted",
    deleteTitle: "Delete sequence?",
    deleteDesc: (name: string) =>
      `"${name}" will be removed. Campaigns already using it keep their steps.`,
    deleteConfirm: "Delete",
    more: "More actions",
  },
  es: {
    title: "Secuencias",
    description: "Cadencias multicanal reutilizables que ejecutan tus campañas.",
    newSequence: "Nueva secuencia",
    introTitle: "Crea secuencias una vez, reutilízalas siempre",
    introDescription:
      "Diseña una cadencia multicanal de varios pasos — email, LinkedIn, llamadas, WhatsApp e incluso llamadas con IA — con esperas y disparadores entre pasos, y adjúntala a cualquier campaña.",
    introPoints: [
      "Combina email, LinkedIn, llamadas y WhatsApp",
      "Programa pasos con esperas y disparadores",
      "Reutiliza una cadencia probada en varias campañas",
      "Mide la tasa de respuesta por secuencia",
    ],
    steps: (n: number) => `${n} ${n === 1 ? "paso" : "pasos"}`,
    usedBy: (n: number) => `${n} ${n === 1 ? "campaña" : "campañas"}`,
    replyRate: "tasa de respuesta",
    updated: (d: string) => `Actualizada ${d}`,
    edit: "Editar",
    duplicate: "Duplicar",
    delete: "Eliminar",
    duplicated: "Secuencia duplicada",
    deleted: "Secuencia eliminada",
    deleteTitle: "¿Eliminar secuencia?",
    deleteDesc: (name: string) =>
      `"${name}" se eliminará. Las campañas que ya la usan conservan sus pasos.`,
    deleteConfirm: "Eliminar",
    more: "Más acciones",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

export default function Sequences() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const sequences = useSequences()
  const [toDelete, setToDelete] = React.useState<SequenceItem | null>(null)

  return (
    <Page>
      <PageHeading
        title={c.title}
        description={c.description}
        action={
          <Button variant="volt" asChild>
            <Link to="/sequence-builder">
              <Plus className="size-4" />
              {c.newSequence}
            </Link>
          </Button>
        }
      />

      <FeatureIntro
        featureKey="sequence"
        icon={Workflow}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        className="mb-6"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sequences.map((seq) => (
          <SequenceCard
            key={seq.id}
            seq={seq}
            c={c}
            locale={locale}
            onEdit={() => navigate("/sequence-builder")}
            onDuplicate={() => {
              sequenceStore.duplicate(seq.id)
              toast.success(c.duplicated)
            }}
            onDelete={() => setToDelete(seq)}
          />
        ))}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={c.deleteTitle}
        description={toDelete ? c.deleteDesc(toDelete.name) : ""}
        confirmLabel={c.deleteConfirm}
        destructive
        onConfirm={() => {
          if (toDelete) {
            sequenceStore.remove(toDelete.id)
            toast.success(c.deleted)
          }
          setToDelete(null)
        }}
      />
    </Page>
  )
}

function SequenceCard({
  seq,
  c,
  locale,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  seq: SequenceItem
  c: Copy
  locale: "en" | "es"
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const stepCount = seq.steps.filter((s) => s !== "wait").length
  return (
    <Card className="gap-3 p-5">
      <div className="flex items-start justify-between gap-2">
        <Link
          to="/sequence-builder"
          className="min-w-0 flex-1 font-semibold hover:underline"
        >
          {seq.name}
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" aria-label={c.more}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-4" />
              {c.edit}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="size-4" />
              {c.duplicate}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 className="size-4" />
              {c.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-muted-foreground line-clamp-2 text-sm">{seq.description}</p>

      {/* Channel flow */}
      <div className="flex flex-wrap items-center gap-1">
        {seq.steps.map((step, i) => {
          const meta = CHANNELS[step]
          const Icon = meta.icon
          return (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="text-muted-foreground size-3" />}
              <span
                className={cn("flex size-6 items-center justify-center rounded-md", meta.tint)}
                title={meta[locale]}
              >
                <Icon className="size-3.5" />
              </span>
            </React.Fragment>
          )
        })}
      </div>

      <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="text-foreground font-medium">{c.steps(stepCount)}</span>
        <span>·</span>
        <span>{c.usedBy(seq.campaignsUsing)}</span>
        <span>·</span>
        <span className="text-chart-1 font-medium">
          {seq.replyRate}% {c.replyRate}
        </span>
      </div>
      <p className="text-muted-foreground text-xs">{c.updated(formatDate(seq.updatedAt))}</p>
    </Card>
  )
}
