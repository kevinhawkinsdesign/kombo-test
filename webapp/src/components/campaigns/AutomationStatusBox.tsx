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
  it: {
    title: "Si esegue automaticamente",
    hintLabel: "Come funziona l'automazione",
    hint: "I passaggi si attivano in base al loro trigger — un ritardo, un'email aperta, un link cliccato o un segnale dai dati. La sequenza si mette in pausa nell'istante in cui un prospect risponde, così non scrivi mai a chi sta già interagendo.",
    autoPauseOn: "Si mette in pausa appena un prospect risponde.",
    autoPauseOff: "Continua indipendentemente dalle risposte.",
    toggleLabel: "Pausa automatica alla risposta",
    onBadge: "Pausa automatica attiva",
    offBadge: "Pausa automatica disattivata",
  },
  fr: {
    title: "S'exécute automatiquement",
    hintLabel: "Comment fonctionne l'automatisation",
    hint: "Les étapes se déclenchent selon leur déclencheur — un délai, un e-mail ouvert, un lien cliqué ou un signal de données. La séquence se met en pause dès qu'un prospect répond, pour ne jamais écrire à quelqu'un de déjà engagé.",
    autoPauseOn: "Se met en pause dès qu'un prospect répond.",
    autoPauseOff: "Continue quelles que soient les réponses.",
    toggleLabel: "Pause automatique à la réponse",
    onBadge: "Pause automatique activée",
    offBadge: "Pause automatique désactivée",
  },
  de: {
    title: "Läuft automatisch",
    hintLabel: "So funktioniert die Automatisierung",
    hint: "Schritte werden durch ihren Trigger ausgelöst — eine Verzögerung, eine geöffnete E-Mail, ein geklickter Link oder ein Datensignal. Die Sequenz pausiert in dem Moment, in dem ein Prospect antwortet, damit du nie jemanden anschreibst, der bereits reagiert hat.",
    autoPauseOn: "Pausiert automatisch, sobald ein Prospect antwortet.",
    autoPauseOff: "Läuft unabhängig von Antworten weiter.",
    toggleLabel: "Auto-Pause bei Antwort",
    onBadge: "Auto-Pause an",
    offBadge: "Auto-Pause aus",
  },
  pt: {
    title: "Executa-se automaticamente",
    hintLabel: "Como funciona a automatização",
    hint: "Os passos disparam consoante o seu gatilho — um atraso, um e-mail aberto, um link clicado ou um sinal de dados. A sequência entra em pausa no instante em que um prospect responde, para nunca escrever a alguém que já está a interagir.",
    autoPauseOn: "Entra em pausa assim que um prospect responde.",
    autoPauseOff: "Continua independentemente das respostas.",
    toggleLabel: "Pausar automaticamente ao responder",
    onBadge: "Pausa automática ativada",
    offBadge: "Pausa automática desativada",
  },
  pt_BR: {
    title: "Executa automaticamente",
    hintLabel: "Como funciona a automação",
    hint: "As etapas disparam de acordo com o gatilho — um atraso, um e-mail aberto, um link clicado ou um sinal de dados. A sequência pausa no instante em que um prospect responde, para você nunca escrever a alguém que já está interagindo.",
    autoPauseOn: "Pausa assim que um prospect responde.",
    autoPauseOff: "Continua independentemente das respostas.",
    toggleLabel: "Pausar automaticamente ao responder",
    onBadge: "Pausa automática ativada",
    offBadge: "Pausa automática desativada",
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
