import { Zap } from "lucide-react"

import { useLocale } from "@/lib/locale"
import { InfoHint } from "@/components/common/InfoHint"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

const COPY = {
  en: {
    title: "Runs automatically",
    hintLabel: "How automation works",
    hint: "Steps fire on their trigger — a delay, an opened email, a clicked link, or a data signal. The sequence pauses the instant a prospect replies so you never message someone who's already engaged.",
    autoPauseOn: "Auto-pauses the moment a prospect replies.",
    autoPauseOff: "Continues regardless of replies.",
    toggleLabel: "Auto-pause on reply",
    onBadge: "Auto-pause on",
    offBadge: "Auto-pause off",
  },
  es: {
    title: "Se ejecuta automáticamente",
    hintLabel: "Cómo funciona la automatización",
    hint: "Los pasos se activan según su disparador — un retraso, un correo abierto, un enlace con clic, o una señal de datos. La secuencia se pausa en cuanto un prospecto responde, para que nunca le escribas a alguien que ya está interactuando.",
    autoPauseOn: "Se pausa en cuanto un prospecto responde.",
    autoPauseOff: "Continúa sin importar las respuestas.",
    toggleLabel: "Pausar automáticamente al responder",
    onBadge: "Pausa automática activada",
    offBadge: "Pausa automática desactivada",
  },
} as const

// Sequence-level automation status — shown above the steps in both the
// editable Sequence tab and the read-only Workspace preview. Pass onToggle
// only where the setting is actually editable; omit it for a read-only
// badge instead of a Switch.
export function AutomationStatusBox({
  autoPauseOnReply,
  onToggle,
}: {
  autoPauseOnReply: boolean
  onToggle?: (next: boolean) => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]

  return (
    <div className="bg-muted/40 flex flex-wrap items-center gap-3 rounded-xl border p-3 sm:p-4">
      <span className="bg-chart-4/15 text-chart-4 flex size-8 shrink-0 items-center justify-center rounded-lg">
        <Zap className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-sm font-medium">
          {c.title}
          <InfoHint label={c.hintLabel}>{c.hint}</InfoHint>
        </p>
        <p className="text-muted-foreground text-xs">
          {autoPauseOnReply ? c.autoPauseOn : c.autoPauseOff}
        </p>
      </div>
      {onToggle ? (
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground hidden sm:inline">
            {c.toggleLabel}
          </span>
          <Switch
            checked={autoPauseOnReply}
            onCheckedChange={onToggle}
            aria-label={c.toggleLabel}
          />
        </label>
      ) : (
        <Badge variant={autoPauseOnReply ? "secondary" : "outline"} className="font-normal">
          {autoPauseOnReply ? c.onBadge : c.offBadge}
        </Badge>
      )}
    </div>
  )
}
