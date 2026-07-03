import {
  Settings2,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
} from "lucide-react"

import { useLocale } from "@/lib/locale"
import { useHomeLayout } from "@/lib/home-layout"
import { HOME_MODULES, type HomeModuleDef } from "@/components/home/home-modules"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const COPY = {
  en: {
    customize: "Customize",
    heading: "Customize your homepage",
    description: "Choose which cards show below your search and in what order.",
    reset: "Reset to default",
    empty: "Your homepage is empty — add a few cards to get started.",
    done: "Done",
    moveUp: "Move up",
    moveDown: "Move down",
  },
  es: {
    customize: "Personalizar",
    heading: "Personaliza tu página de inicio",
    description:
      "Elige qué tarjetas se muestran bajo tu búsqueda y en qué orden.",
    reset: "Restablecer",
    empty: "Tu página de inicio está vacía — añade algunas tarjetas para empezar.",
    done: "Listo",
    moveUp: "Subir",
    moveDown: "Bajar",
  },
} as const

const MODULE_BY_ID = new Map<string, HomeModuleDef>(
  HOME_MODULES.map((m) => [m.id, m])
)

/**
 * The modular Home grid: a responsive set of cards below the permanent search
 * hero. Users pick which modules show and their order via the Customize dialog;
 * the layout persists through `useHomeLayout`.
 */
export function HomeModules() {
  const { locale } = useLocale()
  const t = COPY[locale]
  const { order, enabled } = useHomeLayout()

  const enabledDefs = order
    .filter((id) => enabled.has(id))
    .map((id) => MODULE_BY_ID.get(id))
    .filter((m): m is HomeModuleDef => Boolean(m))

  return (
    <div className="mt-10 w-full">
      <div className="mb-3 flex items-center justify-end">
        <CustomizeDialog />
      </div>
      {enabledDefs.length === 0 ? (
        <Card className="text-muted-foreground flex items-center justify-center gap-2 py-10 text-sm">
          <LayoutGrid className="size-4" />
          {t.empty}
        </Card>
      ) : (
        // Capped at 2 columns (not a wider xl:3 breakpoint) so the Signals
        // module's row-span-2 lands beside the two stacked suggestion cards
        // exactly as designed, at every viewport size ≥ sm.
        <div className="grid gap-4 sm:grid-cols-2">
          {enabledDefs.map((m) => {
            const Icon = m.icon
            const Body = m.Component
            return (
              <Card
                key={m.id}
                className={cn("gap-3 p-4", m.rowSpan === 2 && "sm:row-span-2")}
              >
                <div className="flex items-center gap-2">
                  <Icon className="text-primary size-4" />
                  <h3 className="text-sm font-semibold">{m.title[locale]}</h3>
                </div>
                <Body />
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CustomizeDialog() {
  const { locale } = useLocale()
  const t = COPY[locale]
  const { order, enabled, toggle, move, reset } = useHomeLayout()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Settings2 className="size-4" />
          {t.customize}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.heading}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          {order.map((id) => {
            const m = MODULE_BY_ID.get(id)
            if (!m) return null
            const Icon = m.icon
            const on = enabled.has(id)
            // Reorder controls only make sense among enabled modules.
            const enabledIds = order.filter((x) => enabled.has(x))
            const pos = enabledIds.indexOf(id)
            return (
              <div
                key={id}
                className="flex items-center gap-3 rounded-md border px-3 py-2"
              >
                <Icon className="text-muted-foreground size-4 shrink-0" />
                <span className="flex-1 text-sm font-medium">
                  {m.title[locale]}
                </span>
                {on && (
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      aria-label={t.moveUp}
                      disabled={pos <= 0}
                      onClick={() => move(id, -1)}
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      aria-label={t.moveDown}
                      disabled={pos === enabledIds.length - 1}
                      onClick={() => move(id, 1)}
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                  </div>
                )}
                <Switch
                  checked={on}
                  onCheckedChange={() => toggle(id)}
                  aria-label={m.title[locale]}
                />
              </div>
            )
          })}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="ghost" onClick={reset} className="gap-1.5">
            <RotateCcw className="size-4" />
            {t.reset}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
