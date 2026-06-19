import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Sparkles, Plus, Check, Building2, ArrowUpRight } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProspectAvatar, ScoreBadge } from "@/components/common/ProspectBits"
import { prospects } from "@/lib/mock-data"
import { accounts } from "@/lib/mock-extra"
import { useLocale } from "@/lib/locale"

const COPY = {
  en: {
    title: "Recommended for you today",
    description: "Fresh, in-ICP picks with a buying signal — one click to save.",
    people: "People",
    companies: "Companies",
    add: "Add",
    added: "Added",
    addedToast: (name: string) => `${name} added to your daily picks`,
    viewAll: "Open search",
    signal: "Signal",
  },
  es: {
    title: "Recomendado para ti hoy",
    description:
      "Selección fresca dentro de tu ICP con señal de compra — guarda con un clic.",
    people: "Personas",
    companies: "Empresas",
    add: "Añadir",
    added: "Añadido",
    addedToast: (name: string) => `${name} añadido a tus selecciones del día`,
    viewAll: "Abrir búsqueda",
    signal: "Señal",
  },
} as const

// Deterministic "today's picks": highest-scoring prospects + accounts with a
// buying signal.
const topProspects = [...prospects].sort((a, b) => b.score - a.score).slice(0, 4)
const topAccounts = accounts
  .filter((a) => a.signals.length > 0)
  .sort((a, b) => b.healthScore - a.healthScore)
  .slice(0, 3)

export function DailyRecommendations() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [added, setAdded] = React.useState<Set<string>>(new Set())

  function add(id: string, name: string) {
    setAdded((prev) => new Set(prev).add(id))
    toast.success(c.addedToast(name))
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="text-primary size-4" />
            {c.title}
          </CardTitle>
          <CardDescription>{c.description}</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/search">
            {c.viewAll}
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        {/* People */}
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {c.people}
          </p>
          {topProspects.map((p) => {
            const name = `${p.firstName} ${p.lastName}`
            const isAdded = added.has(p.id)
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-lg border p-2.5"
              >
                <Link to={`/prospects/${p.id}`} className="shrink-0">
                  <ProspectAvatar prospect={p} className="size-9" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/prospects/${p.id}`}
                    className="block truncate text-sm font-medium hover:underline"
                  >
                    {name}
                  </Link>
                  <p className="text-muted-foreground truncate text-xs">
                    {p.title} · {p.company}
                  </p>
                </div>
                <ScoreBadge score={p.score} className="hidden sm:inline-flex" />
                <Button
                  variant={isAdded ? "secondary" : "outline"}
                  size="sm"
                  className="shrink-0"
                  disabled={isAdded}
                  onClick={() => add(p.id, name)}
                >
                  {isAdded ? (
                    <>
                      <Check className="size-4" />
                      {c.added}
                    </>
                  ) : (
                    <>
                      <Plus className="size-4" />
                      {c.add}
                    </>
                  )}
                </Button>
              </div>
            )
          })}
        </div>

        {/* Companies */}
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {c.companies}
          </p>
          {topAccounts.map((a) => {
            const isAdded = added.has(a.id)
            return (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-lg border p-2.5"
              >
                <Link
                  to={`/companies/${a.id}`}
                  className="shrink-0"
                  aria-label={a.name}
                >
                  <span
                    className="flex size-9 items-center justify-center rounded-lg text-sm font-semibold text-white"
                    style={{ backgroundColor: a.logoColor }}
                  >
                    {a.name.charAt(0)}
                  </span>
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/companies/${a.id}`}
                    className="block truncate text-sm font-medium hover:underline"
                  >
                    {a.name}
                  </Link>
                  <Badge
                    variant="secondary"
                    className="mt-0.5 max-w-full gap-1 font-normal"
                  >
                    <Building2 className="size-3 shrink-0" />
                    <span className="truncate">{a.signals[0]}</span>
                  </Badge>
                </div>
                <Button
                  variant={isAdded ? "secondary" : "outline"}
                  size="sm"
                  className="shrink-0"
                  disabled={isAdded}
                  onClick={() => add(a.id, a.name)}
                >
                  {isAdded ? (
                    <>
                      <Check className="size-4" />
                      {c.added}
                    </>
                  ) : (
                    <>
                      <Plus className="size-4" />
                      {c.add}
                    </>
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
