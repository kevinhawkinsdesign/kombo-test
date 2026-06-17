import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { initials, scoreTone } from "@/lib/format"
import { STATUS_LABELS } from "@/lib/mock-data"
import type { Prospect } from "@/lib/types"

export function ProspectAvatar({
  prospect,
  className,
}: {
  prospect: Pick<Prospect, "firstName" | "lastName" | "avatarColor">
  className?: string
}) {
  return (
    <Avatar className={className}>
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
}: {
  score: number
  className?: string
}) {
  const tone = scoreTone(score)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
        TONE_CLASSES[tone],
        className
      )}
      title="AI lead score"
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
