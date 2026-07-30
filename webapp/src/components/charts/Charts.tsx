import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type Plugin,
} from "chart.js"
import { Line, Doughnut, Bar, Radar } from "react-chartjs-2"

import { useTheme } from "@/components/theme-provider"

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
)

const PALETTE = {
  violet: "#6d5de6", // Lavender (brand primary)
  violetDark: "#8b7ff0",
  lime: "#8dab00", // Olive (brand success)
  teal: "#14b8a6",
  amber: "#f59e0b",
  rose: "#f43f5e", // matches the "bounced"/destructive tone used elsewhere
}

function useChartTheme() {
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === "dark"
  return {
    dark,
    primary: dark ? PALETTE.violetDark : PALETTE.violet,
    accent: PALETTE.lime,
    grid: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    ticks: dark ? "#a1a1aa" : "#71717a",
    tooltipBg: dark ? "#1f1b24" : "#ffffff",
    tooltipTitle: dark ? "#fafafa" : "#18181b",
    tooltipBody: dark ? "#d4d4d8" : "#3f3f46",
    border: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
    danger: PALETTE.rose,
  }
}

function hexAlpha(hex: string, alpha: number) {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0")
  return `${hex}${a}`
}

// Draws a dashed vertical guide at the hovered index so the exact data point a
// user is pointing at is spotlighted across a line chart.
const crosshair: Plugin<"line"> = {
  id: "crosshair",
  afterDatasetsDraw(chart) {
    const active = chart.getActiveElements()
    if (active.length === 0) return
    const { ctx, chartArea } = chart
    const x = active[0].element.x
    ctx.save()
    ctx.beginPath()
    ctx.setLineDash([4, 4])
    ctx.moveTo(x, chartArea.top)
    ctx.lineTo(x, chartArea.bottom)
    ctx.lineWidth = 1.5
    ctx.strokeStyle = "rgba(124, 95, 232, 0.45)"
    ctx.stroke()
    ctx.restore()
  },
}

// Shared point-hover styling: a filled white dot ringed in the series color.
function pointHover(color: string) {
  return {
    pointHoverRadius: 6,
    pointHoverBorderWidth: 3,
    pointHoverBackgroundColor: "#ffffff",
    pointHoverBorderColor: color,
    pointHitRadius: 14,
  } as const
}

export function TrendChart({
  labels,
  pipeline,
  won,
}: {
  labels: string[]
  pipeline: number[]
  won: number[]
}) {
  const t = useChartTheme()

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          color: t.ticks,
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 6,
          boxHeight: 6,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: t.tooltipBg,
        titleColor: t.tooltipTitle,
        bodyColor: t.tooltipBody,
        borderColor: t.border,
        borderWidth: 1,
        padding: 10,
        usePointStyle: true,
        callbacks: {
          label: (c) => ` ${c.dataset.label}: $${c.parsed.y}k`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: t.ticks },
      },
      y: {
        grid: { color: t.grid },
        border: { display: false },
        ticks: { color: t.ticks, callback: (v) => `$${v}k` },
      },
    },
  }

  return (
    <Line
      options={options}
      plugins={[crosshair]}
      data={{
        labels,
        datasets: [
          {
            label: "Pipeline created",
            data: pipeline,
            borderColor: t.primary,
            backgroundColor: hexAlpha(t.primary, 0.12),
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            ...pointHover(t.primary),
          },
          {
            label: "Closed won",
            data: won,
            borderColor: t.accent,
            backgroundColor: "transparent",
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            ...pointHover(t.accent),
          },
        ],
      }}
    />
  )
}

export function ReplyRateChart({
  labels,
  values,
}: {
  labels: string[]
  values: number[]
}) {
  const t = useChartTheme()

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: t.tooltipBg,
        titleColor: t.tooltipTitle,
        bodyColor: t.tooltipBody,
        borderColor: t.border,
        borderWidth: 1,
        padding: 10,
        callbacks: { label: (c) => ` Reply rate: ${c.parsed.y}%` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: t.ticks },
      },
      y: {
        grid: { color: t.grid },
        border: { display: false },
        ticks: { color: t.ticks, callback: (v) => `${v}%` },
        suggestedMin: 0,
      },
    },
  }

  return (
    <Line
      options={options}
      plugins={[crosshair]}
      data={{
        labels,
        datasets: [
          {
            label: "Reply rate",
            data: values,
            borderColor: t.primary,
            backgroundColor: hexAlpha(t.primary, 0.12),
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            ...pointHover(t.primary),
          },
        ],
      }}
    />
  )
}

// Fixed-order color cycle for CampaignChannelChart's series — the caller
// only controls which channels are included and their labels, not their
// colors, so any subset of channels still reads consistently across
// campaigns. First slot uses the theme's primary (matches every other line
// chart here); the rest are static palette hues that don't shift with theme.
const CHANNEL_LINE_COLORS: ((primary: string) => string)[] = [
  (primary) => primary,
  () => PALETTE.teal,
  () => PALETTE.amber,
  () => PALETTE.lime,
  () => PALETTE.rose,
]

// Per-channel daily send volume — the Overview tab's "Campaign Performance
// Overview" chart. Same CategoryScale/crosshair convention as every other
// line chart in this file (no TimeScale/date-fns adapter, matching house
// style rather than the extension's date-axis version). Series are
// caller-supplied so this stays agnostic to which channels a given
// campaign's sequence actually uses.
export function CampaignChannelChart({
  labels,
  series,
}: {
  labels: string[]
  series: { key: string; label: string; data: number[] }[]
}) {
  const t = useChartTheme()

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          color: t.ticks,
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 6,
          boxHeight: 6,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: t.tooltipBg,
        titleColor: t.tooltipTitle,
        bodyColor: t.tooltipBody,
        borderColor: t.border,
        borderWidth: 1,
        padding: 10,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: t.ticks },
      },
      y: {
        grid: { color: t.grid },
        border: { display: false },
        ticks: { color: t.ticks, precision: 0 },
      },
    },
  }

  return (
    <Line
      options={options}
      plugins={[crosshair]}
      data={{
        labels,
        datasets: series.map((s, i) => {
          const color = CHANNEL_LINE_COLORS[i % CHANNEL_LINE_COLORS.length](
            t.primary
          )
          return {
            label: s.label,
            data: s.data,
            borderColor: color,
            backgroundColor: "transparent",
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            ...pointHover(color),
          }
        }),
      }}
    />
  )
}

export function CampaignDailyChart({
  labels,
  sent,
  opened,
  replied,
  bounced,
}: {
  labels: string[]
  sent: number[]
  opened: number[]
  replied: number[]
  bounced: number[]
}) {
  const t = useChartTheme()

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          color: t.ticks,
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 6,
          boxHeight: 6,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: t.tooltipBg,
        titleColor: t.tooltipTitle,
        bodyColor: t.tooltipBody,
        borderColor: t.border,
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: t.ticks },
        stacked: false,
      },
      y: {
        grid: { color: t.grid },
        border: { display: false },
        ticks: { color: t.ticks, precision: 0 },
      },
    },
  }

  return (
    <Bar
      options={options}
      data={{
        labels,
        datasets: [
          {
            label: "Sent",
            data: sent,
            backgroundColor: hexAlpha(t.ticks, 0.35),
            hoverBackgroundColor: hexAlpha(t.ticks, 0.65),
            borderRadius: 4,
            categoryPercentage: 0.6,
            barPercentage: 0.9,
          },
          {
            label: "Opened",
            data: opened,
            backgroundColor: hexAlpha(t.primary, 0.85),
            hoverBackgroundColor: t.primary,
            borderRadius: 4,
            categoryPercentage: 0.6,
            barPercentage: 0.9,
          },
          {
            label: "Replied",
            data: replied,
            backgroundColor: t.accent,
            hoverBackgroundColor: hexAlpha(t.accent, 0.85),
            borderRadius: 4,
            categoryPercentage: 0.6,
            barPercentage: 0.9,
          },
          {
            label: "Bounced",
            data: bounced,
            backgroundColor: hexAlpha(t.danger, 0.75),
            hoverBackgroundColor: t.danger,
            borderRadius: 4,
            categoryPercentage: 0.6,
            barPercentage: 0.9,
          },
        ],
      }}
    />
  )
}

export function AttainmentDoughnut({
  won,
  quota,
}: {
  won: number
  quota: number
}) {
  const t = useChartTheme()
  const pct = Math.min(100, Math.round((won / quota) * 100))
  const remaining = Math.max(0, quota - won)

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  }

  return (
    <div className="relative h-full w-full">
      <Doughnut
        options={options}
        data={{
          labels: ["Closed won", "Remaining"],
          datasets: [
            {
              data: [won, remaining],
              backgroundColor: [t.primary, t.grid],
              borderWidth: 0,
              borderRadius: 6,
            },
          ],
        }}
      />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tabular-nums">{pct}%</span>
        <span className="text-muted-foreground text-xs">to quota</span>
      </div>
    </div>
  )
}

// Call Score radar graph (Analysis tab, Call Analytics aggregation panel):
// one axis per scoring metric, up to 3 overlaid series (this call/rep
// average/team average). Series are dropped entirely rather than plotted at
// 0 when their average isn't available, since 0 would misleadingly read as
// a failing score.
export function CallScoreRadarChart({
  labels,
  callSeries,
  repAvgSeries,
  teamAvgSeries,
  callLabel,
  repAvgLabel,
  teamAvgLabel,
}: {
  labels: string[]
  callSeries: number[]
  repAvgSeries?: number[]
  teamAvgSeries?: number[]
  callLabel: string
  repAvgLabel: string
  teamAvgLabel: string
}) {
  const t = useChartTheme()

  const options: ChartOptions<"radar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: t.ticks,
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 6,
          boxHeight: 6,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: t.tooltipBg,
        titleColor: t.tooltipTitle,
        bodyColor: t.tooltipBody,
        borderColor: t.border,
        borderWidth: 1,
        padding: 10,
        callbacks: { label: (c) => ` ${c.dataset.label}: ${c.parsed.r}%` },
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        grid: { color: t.grid },
        angleLines: { color: t.grid },
        pointLabels: { color: t.ticks, font: { size: 11 } },
        ticks: { display: false, stepSize: 25 },
      },
    },
  }

  const datasets = [
    {
      label: callLabel,
      data: callSeries,
      borderColor: t.primary,
      backgroundColor: hexAlpha(t.primary, 0.2),
      pointBackgroundColor: t.primary,
      borderWidth: 2,
    },
  ]
  if (repAvgSeries) {
    datasets.push({
      label: repAvgLabel,
      data: repAvgSeries,
      borderColor: t.accent,
      backgroundColor: hexAlpha(t.accent, 0.12),
      pointBackgroundColor: t.accent,
      borderWidth: 2,
    })
  }
  if (teamAvgSeries) {
    datasets.push({
      label: teamAvgLabel,
      data: teamAvgSeries,
      borderColor: PALETTE.amber,
      backgroundColor: hexAlpha(PALETTE.amber, 0.12),
      pointBackgroundColor: PALETTE.amber,
      borderWidth: 2,
    })
  }

  return <Radar options={options} data={{ labels, datasets }} />
}

// A small inline donut showing how one rubric question was answered across a
// set of calls (Coach Analytics' per-question aggregate). Plain SVG rather
// than a chart.js canvas — these render one per question, and at this size
// strokes stay crisper and far cheaper than a canvas each.
export function AnswerDistributionDonut({
  segments,
  centerValue,
  centerLabel,
  centerColor,
}: {
  segments: { share: number; color: string }[]
  centerValue: string
  centerLabel: string
  centerColor: string
}) {
  const R = 26
  const C = 2 * Math.PI * R
  // Arc lengths and their running start offsets, resolved up front so the
  // render pass itself stays free of accumulator mutation.
  const arcs = segments.reduce<{ len: number; offset: number; color: string }[]>(
    (acc, s) => {
      const prev = acc[acc.length - 1]
      const offset = prev ? prev.offset + prev.len : 0
      acc.push({ len: s.share * C, offset, color: s.color })
      return acc
    },
    []
  )

  return (
    <div className="relative size-[72px] shrink-0">
      <svg viewBox="0 0 72 72" className="size-full -rotate-90">
        {arcs.map((a, i) => (
          <circle
            key={i}
            cx="36"
            cy="36"
            r={R}
            fill="none"
            stroke={a.color}
            strokeWidth="10"
            strokeDasharray={`${a.len} ${C - a.len}`}
            strokeDashoffset={-a.offset}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-tight">
        <span className="text-xs font-semibold tabular-nums">{centerValue}</span>
        <span className="text-[10px]" style={{ color: centerColor }}>
          {centerLabel}
        </span>
      </div>
    </div>
  )
}

export function HeadcountChart({
  labels,
  values,
}: {
  labels: string[]
  values: number[]
}) {
  const t = useChartTheme()

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: t.tooltipBg,
        titleColor: t.tooltipTitle,
        bodyColor: t.tooltipBody,
        borderColor: t.border,
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (c) => ` ${(c.parsed.y ?? 0).toLocaleString()} employees`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: t.ticks },
      },
      y: {
        grid: { color: t.grid },
        border: { display: false },
        ticks: { color: t.ticks, precision: 0 },
      },
    },
  }

  return (
    <Line
      options={options}
      plugins={[crosshair]}
      data={{
        labels,
        datasets: [
          {
            label: "Headcount",
            data: values,
            borderColor: t.primary,
            backgroundColor: hexAlpha(t.primary, 0.12),
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            ...pointHover(t.primary),
          },
        ],
      }}
    />
  )
}
