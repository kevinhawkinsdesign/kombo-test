import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SequenceCanvas } from "@/components/sequence/SequenceCanvas"
import { SequenceCostSummary } from "@/components/campaigns/SequenceCostSummary"
import { useLocale } from "@/lib/locale"
import type { SequenceTemplate } from "@/lib/sequence-templates"

const COPY = {
  en: {
    description:
      "Read-only preview of the saved sequence — steps, delays, and channels as they'll be reused.",
    close: "Close",
  },
  es: {
    description:
      "Vista previa de solo lectura de la secuencia guardada — pasos, retrasos y canales tal como se reutilizarán.",
    close: "Cerrar",
  },
  it: {
    description:
      "Anteprima di sola lettura della sequenza salvata — passaggi, ritardi e canali così come verranno riutilizzati.",
    close: "Chiudi",
  },
  fr: {
    description:
      "Aperçu en lecture seule de la séquence enregistrée — étapes, délais et canaux tels qu'ils seront réutilisés.",
    close: "Fermer",
  },
  de: {
    description:
      "Schreibgeschützte Vorschau der gespeicherten Sequenz — Schritte, Verzögerungen und Kanäle, so wie sie wiederverwendet werden.",
    close: "Schließen",
  },
  pt: {
    description:
      "Pré-visualização só de leitura da sequência guardada — passos, atrasos e canais tal como serão reutilizados.",
    close: "Fechar",
  },
  pt_BR: {
    description:
      "Pré-visualização somente leitura da sequência salva — etapas, atrasos e canais como serão reutilizados.",
    close: "Fechar",
  },
} as const

// Read-only preview of a saved sequence template — reuses SequenceCanvas in
// "readonly" mode, the same component WorkspaceDetail uses to show a live
// campaign's sequence without allowing edits, plus SequenceCostSummary
// (both take just `steps`, so neither needs a real campaign to render
// sensibly). Lets a rep see a template's steps, delays, and channels before
// duplicating it, with no save/edit path of its own.
//
// No `senderLabel`: that prop is a cosmetic per-campaign sending-identity
// avatar (see SequenceCanvas's own comment on it) — a saved template has no
// sender account of its own, so it's correctly omitted rather than filled
// with e.g. the template's name, which would misrepresent it as a sender.
//
// `template` is intentionally not cleared when the dialog closes (only
// `openSequencePreview` in Templates.tsx replaces it, on next open) so the
// closing animation doesn't flash empty content — same pattern Templates.tsx
// already uses for editingPrompt/promptFormOpen.
//
// max-h-[85vh] overflow-y-auto: the canvas alone is a fixed 600px block, so
// on shorter viewports the default (unconstrained) DialogContent would push
// the title and footer Close button off-screen with no way to reach them —
// Radix locks body scroll while a dialog is open, so there'd be no
// escape hatch but the Escape key. Capping and scrolling the dialog itself
// (same idea as AddListsDialog's max-h-[55vh] overflow-y-auto) keeps both
// always reachable.
export function SequenceTemplatePreviewDialog({
  open,
  onOpenChange,
  template,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: SequenceTemplate | null
}) {
  const { locale } = useLocale()
  const c = COPY[locale]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template?.name ?? ""}</DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>
        </DialogHeader>

        {template && (
          <div className="space-y-3">
            <SequenceCostSummary steps={template.steps} />
            <SequenceCanvas steps={template.steps} mode="readonly" />
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
