import * as React from "react"
import { Mail, Linkedin } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Conversation, ConvStatus, Prospect } from "@/lib/types"
import { initials, relativeTime } from "@/lib/format"

// Forward-moving stages matching the "Set outcome" dropdown in the chrome extension.
// Left = earliest in the funnel, right = most qualified / closest to close.
const ACTIVE_STAGES = [
  {
    key: "outreach" as const,
    convStatus: undefined as ConvStatus | undefined,
    label: "In Outreach",
    description: "Active sequences, no outcome set yet",
    dot: "bg-slate-400",
    text: "text-slate-600 dark:text-slate-400",
  },
  {
    key: "interested" as const,
    convStatus: "interested" as ConvStatus,
    label: "Interested",
    description: "Prospect has shown buying intent",
    dot: "bg-sky-500",
    text: "text-sky-700 dark:text-sky-400",
  },
  {
    key: "qualified" as const,
    convStatus: "qualified" as ConvStatus,
    label: "Qualified",
    description: "ICP-fit confirmed, advancing",
    dot: "bg-violet-500",
    text: "text-violet-700 dark:text-violet-400",
  },
  {
    key: "meeting_booked" as const,
    convStatus: "meeting_booked" as ConvStatus,
    label: "Meeting Booked",
    description: "Demo or discovery call scheduled",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  {
    key: "won" as const,
    convStatus: "won" as ConvStatus,
    label: "Won",
    description: "Converted to customer",
    dot: "bg-green-600",
    text: "text-green-700 dark:text-green-400",
  },
]

// Off-track outcomes: shown in a separate row below the active funnel.
// Includes legacy values (positive, bad_timing, referred) so existing data still renders.
const PASSIVE_STAGES = [
  {
    key: "not_interested" as const,
    convStatus: "not_interested" as ConvStatus,
    label: "Not Interested",
    dot: "bg-rose-500",
    text: "text-rose-700 dark:text-rose-400",
  },
  {
    key: "disqualified" as const,
    convStatus: "disqualified" as ConvStatus,
    label: "Disqualified",
    dot: "bg-rose-700",
    text: "text-rose-800 dark:text-rose-400",
  },
  {
    key: "need_review" as const,
    convStatus: "need_review" as ConvStatus,
    label: "Need Review",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
  },
  {
    key: "referred" as const,
    convStatus: "referred" as ConvStatus,
    label: "Referred",
    dot: "bg-indigo-500",
    text: "text-indigo-700 dark:text-indigo-400",
  },
  {
    key: "bad_timing" as const,
    convStatus: "bad_timing" as ConvStatus,
    label: "Bad Timing",
    dot: "bg-amber-400",
    text: "text-amber-700 dark:text-amber-400",
  },
  {
    key: "positive" as const,
    convStatus: "positive" as ConvStatus,
    label: "Positive",
    dot: "bg-teal-500",
    text: "text-teal-700 dark:text-teal-400",
  },
]

type StageKey = "outreach" | ConvStatus

interface PipelineEntry {
  conv: Conversation
  prospect: Prospect
}

function buildPipelineData(
  conversations: Conversation[],
  prospects: Prospect[]
): Map<StageKey, PipelineEntry[]> {
  const prospectMap = new Map(prospects.map((p) => [p.id, p]))

  // Keep only the latest conversation per prospect (by lastMessageAt)
  const latestByProspect = new Map<string, Conversation>()
  for (const conv of conversations) {
    const prev = latestByProspect.get(conv.prospectId)
    if (!prev || conv.lastMessageAt > prev.lastMessageAt) {
      latestByProspect.set(conv.prospectId, conv)
    }
  }

  const result = new Map<StageKey, PipelineEntry[]>()
  result.set("outreach", [])
  for (const s of [...ACTIVE_STAGES.slice(1), ...PASSIVE_STAGES]) {
    result.set(s.convStatus, [])
  }

  for (const [prospectId, conv] of latestByProspect) {
    const prospect = prospectMap.get(prospectId)
    if (!prospect) continue
    const key: StageKey = conv.status ?? "outreach"
    const bucket = result.get(key)
    if (bucket) bucket.push({ conv, prospect })
  }

  // Sort each bucket newest-first
  for (const bucket of result.values()) {
    bucket.sort((a, b) =>
      b.conv.lastMessageAt.localeCompare(a.conv.lastMessageAt)
    )
  }

  return result
}

function ChannelIcon({ channel }: { channel: string }) {
  if (channel === "linkedin") {
    return <Linkedin className="size-3.5 text-[#0077b5]" />
  }
  return <Mail className="text-muted-foreground size-3.5" />
}

function ProspectCard({ entry }: { entry: PipelineEntry }) {
  const { conv, prospect } = entry
  return (
    <div className="bg-card hover:border-primary/40 space-y-2.5 rounded-lg border p-3 transition-colors">
      <div className="flex items-start gap-2">
        <Avatar className="size-7 shrink-0">
          <AvatarFallback
            style={{ backgroundColor: prospect.avatarColor, color: "white" }}
            className="text-[10px]"
          >
            {initials(prospect.firstName, prospect.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {prospect.firstName} {prospect.lastName}
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {prospect.title} · {prospect.company}
          </p>
        </div>
      </div>
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <ChannelIcon channel={conv.channel} />
        <span>{relativeTime(conv.lastMessageAt)}</span>
      </div>
    </div>
  )
}

function StageColumn({
  label,
  dot,
  entries,
  empty,
  muted,
}: {
  label: string
  dot: string
  entries: PipelineEntry[]
  empty: string
  muted?: boolean
}) {
  return (
    <div
      className={`w-[252px] min-w-[252px] shrink-0 space-y-3 rounded-lg p-2 ${muted ? "bg-muted/30" : "bg-muted/40"}`}
    >
      <div className="flex items-center gap-2 px-1 pt-1">
        <span className={`size-2 shrink-0 rounded-full ${dot}`} />
        <span className="text-sm font-medium">{label}</span>
        <Badge variant="secondary" className="ml-auto tabular-nums">
          {entries.length}
        </Badge>
      </div>
      <div className="space-y-2">
        {entries.length > 0 ? (
          entries.map((e) => <ProspectCard key={e.conv.id} entry={e} />)
        ) : (
          <p className="text-muted-foreground px-1 py-6 text-center text-xs">
            {empty}
          </p>
        )}
      </div>
    </div>
  )
}

export interface PipelineFunnelSummary {
  total: number
  meetingsSet: number
  conversionPct: number
}

export function usePipelineSummary(
  conversations: Conversation[],
  prospects: Prospect[]
): PipelineFunnelSummary {
  return React.useMemo(() => {
    const data = buildPipelineData(conversations, prospects)
    const activeKeys: StageKey[] = ["outreach", "interested", "qualified", "meeting_booked", "won"]
    const total = activeKeys.reduce((sum, k) => sum + (data.get(k)?.length ?? 0), 0)
    const meetingsSet = data.get("meeting_booked")?.length ?? 0
    const conversionPct = total > 0 ? Math.round((meetingsSet / total) * 100) : 0
    return { total, meetingsSet, conversionPct }
  }, [conversations, prospects])
}

export interface PipelineFunnelProps {
  conversations: Conversation[]
  prospects: Prospect[]
  noProspects?: string
}

export function PipelineFunnel({
  conversations,
  prospects,
  noProspects = "No prospects",
}: PipelineFunnelProps) {
  const data = React.useMemo(
    () => buildPipelineData(conversations, prospects),
    [conversations, prospects]
  )

  const activeCounts = ACTIVE_STAGES.map(
    (s) => data.get((s.convStatus ?? "outreach") as StageKey)?.length ?? 0
  )

  const passiveEntries = PASSIVE_STAGES.map((s) => ({
    stage: s,
    entries: data.get(s.convStatus) ?? [],
  })).filter((x) => x.entries.length > 0)

  return (
    <div className="space-y-6">
      {/* Funnel flow — stage counts + conversion arrows */}
      <div className="flex items-end gap-1 overflow-x-auto pb-1">
        {ACTIVE_STAGES.map((stage, i) => {
          const count = activeCounts[i]
          const nextCount = activeCounts[i + 1]
          const pct =
            nextCount !== undefined && count > 0
              ? Math.round((nextCount / count) * 100)
              : null
          return (
            <React.Fragment key={stage.key}>
              <div className="flex min-w-[80px] flex-col items-center gap-0.5">
                <span className="text-2xl font-bold tabular-nums">{count}</span>
                <div className={`flex items-center gap-1 text-xs font-medium ${stage.text}`}>
                  <span className={`size-1.5 rounded-full ${stage.dot}`} />
                  {stage.label}
                </div>
              </div>
              {i < ACTIVE_STAGES.length - 1 && (
                <div className="text-muted-foreground mb-1 flex min-w-[44px] flex-col items-center gap-0.5">
                  <span className="text-[10px] tabular-nums">
                    {pct !== null ? `${pct}%` : "—"}
                  </span>
                  <span className="text-base leading-none">→</span>
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Active stage columns */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {ACTIVE_STAGES.map((stage) => {
          const key = (stage.convStatus ?? "outreach") as StageKey
          return (
            <StageColumn
              key={stage.key}
              label={stage.label}
              dot={stage.dot}
              entries={data.get(key) ?? []}
              empty={noProspects}
            />
          )
        })}
      </div>

      {/* Off-track stages (collapsed unless there are entries) */}
      {passiveEntries.length > 0 && (
        <div className="border-t pt-4">
          <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-widest uppercase">
            Off-track
          </p>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {passiveEntries.map(({ stage, entries }) => (
              <StageColumn
                key={stage.key}
                label={stage.label}
                dot={stage.dot}
                entries={entries}
                empty={noProspects}
                muted
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
