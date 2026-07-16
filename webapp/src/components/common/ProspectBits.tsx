import { Search, FolderKanban, Upload, Puzzle } from "lucide-react"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { initials, scoreTone } from "@/lib/format"
import { portraitFor } from "@/lib/avatars"
import { STATUS_LABELS } from "@/lib/mock-data"
import type { Locale } from "@/lib/locale"
import type { Prospect, ProspectSource } from "@/lib/types"

export function ProspectAvatar({
  prospect,
  className,
}: {
  prospect: Pick<Prospect, "firstName" | "lastName" | "avatarColor">
  className?: string
}) {
  const name = `${prospect.firstName} ${prospect.lastName}`
  return (
    <Avatar className={className}>
      <AvatarImage src={portraitFor(name)} alt="" />
      <AvatarFallback
        style={{ backgroundColor: prospect.avatarColor, color: "white" }}
        className="text-xs font-medium"
      >
        {initials(prospect.firstName, prospect.lastName)}
      </AvatarFallback>
    </Avatar>
  )
}

const TONE_CLASSES: Record<ReturnType<typeof scoreTone>, string> = {
  high: "bg-chart-1/15 text-chart-1",
  mid: "bg-chart-4/15 text-chart-4",
  low: "bg-muted text-muted-foreground",
}

export function ScoreBadge({
  score,
  className,
  title = "AI lead score",
}: {
  score: number
  className?: string
  title?: string
}) {
  const tone = scoreTone(score)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
        TONE_CLASSES[tone],
        className
      )}
      title={title}
    >
      <span className="bg-current size-1.5 rounded-full opacity-80" />
      {score}
    </span>
  )
}

const STATUS_VARIANT: Record<
  Prospect["status"],
  "default" | "secondary" | "outline" | "success" | "destructive"
> = {
  new: "secondary",
  contacted: "outline",
  replied: "success",
  meeting: "default",
  customer: "success",
  not_interested: "destructive",
}

export function StatusBadge({ status }: { status: Prospect["status"] }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className="capitalize">
      {STATUS_LABELS[status]}
    </Badge>
  )
}

const SOURCE_META: Record<
  ProspectSource,
  {
    en: string
    es: string
    it: string
    fr: string
    de: string
    pt: string
    pt_BR: string
    icon: typeof Search
  }
> = {
  search: { en: "Search", es: "Búsqueda", it: "Ricerca", fr: "Recherche", de: "Suche", pt: "Pesquisa", pt_BR: "Busca", icon: Search },
  list: { en: "List", es: "Lista", it: "Lista", fr: "Liste", de: "Liste", pt: "Lista", pt_BR: "Lista", icon: FolderKanban },
  import: { en: "Import", es: "Importación", it: "Importazione", fr: "Import", de: "Import", pt: "Importação", pt_BR: "Importação", icon: Upload },
  extension: { en: "Extension", es: "Extensión", it: "Estensione", fr: "Extension", de: "Erweiterung", pt: "Extensão", pt_BR: "Extensão", icon: Puzzle },
}

export function SourceBadge({
  source,
  locale = "en",
}: {
  source: ProspectSource
  locale?: Locale
}) {
  const m = SOURCE_META[source]
  const Icon = m.icon
  return (
    <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
      <Icon className="size-3 shrink-0" />
      {m[locale]}
    </span>
  )
}
