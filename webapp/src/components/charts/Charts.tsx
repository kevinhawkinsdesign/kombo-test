import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js"
import { Line, Doughnut } from "react-chartjs-2"

import { useTheme } from "@/components/theme-provider"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
)

const PALETTE = {
  violet: "#7c3aed",
  violetDark: "#8b5cf6",
  lime: "#84cc16",
  teal: "#14b8a6",
  amber: "#f59e0b",
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
  }
}

function hexAlpha(hex: string, alpha: number) {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0")
  return `${hex}${a}`
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
            pointHoverRadius: 4,
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
            pointHoverRadius: 4,
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
            pointHoverRadius: 4,
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
