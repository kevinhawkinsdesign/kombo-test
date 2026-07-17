import * as React from "react"
import { Pencil } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProspectAvatar } from "@/components/common/ProspectBits"
import { useLocale } from "@/lib/locale"
import { flattenCampaignSteps } from "@/lib/store"
import { channelMeta } from "@/lib/step-channels"
import { prospectMergeData } from "@/lib/merge-vars"
import { mergeVarsHighlighted } from "@/lib/merge-vars-highlight"
import { stripHtml } from "@/lib/rich-text"
import { cn } from "@/lib/utils"
import type { CampaignStep, EnrollmentStatus, Prospect } from "@/lib/types"

// A trimmed view over CampaignDetail's own CampaignProspectRow — this pane
// only needs identity + status, not the full table-row shape.
export interface PreviewLeadRow {
  id: string
  prospect: Prospect | undefined
  status: EnrollmentStatus
}

const ENROLLMENT_VARIANT: Record<
  EnrollmentStatus,
  "default" | "secondary" | "outline" | "success" | "destructive"
> = {
  replied: "success",
  active: "success",
  completed: "secondary",
  paused: "outline",
  bounced: "destructive",
}

const COPY = {
  en: {
    leadsHeading: "Leads",
    noProspects: "No prospects in this campaign yet — add some to preview real messages.",
    goToProspects: "Go to Prospects",
    noSteps: "No sequence steps yet — build your sequence to preview it here.",
    goToSequence: "Go to Sequence",
    sendImmediately: "Send immediately",
    waitDays: (n: number) => `Wait ${n} ${n === 1 ? "day" : "days"}`,
    editStep: "Edit this step",
    noSubject: "(no subject)",
    enrollmentLabel: {
      replied: "Replied",
      active: "Active",
      completed: "Completed",
      paused: "Paused",
      bounced: "Bounced",
    } as Record<EnrollmentStatus, string>,
  },
  es: {
    leadsHeading: "Leads",
    noProspects: "Aún no hay prospectos en esta campaña — añade algunos para ver mensajes reales.",
    goToProspects: "Ir a Prospectos",
    noSteps: "Aún no hay pasos de secuencia — crea tu secuencia para verla previsualizada aquí.",
    goToSequence: "Ir a Secuencia",
    sendImmediately: "Enviar inmediatamente",
    waitDays: (n: number) => `Espera ${n} ${n === 1 ? "día" : "días"}`,
    editStep: "Editar este paso",
    noSubject: "(sin asunto)",
    enrollmentLabel: {
      replied: "Respondió",
      active: "Activo",
      completed: "Completado",
      paused: "En pausa",
      bounced: "Rebotado",
    } as Record<EnrollmentStatus, string>,
  },
  it: {
    leadsHeading: "Lead",
    noProspects: "Ancora nessun prospect in questa campagna — aggiungine qualcuno per vedere messaggi reali.",
    goToProspects: "Vai a Prospect",
    noSteps: "Ancora nessun passaggio nella sequenza — creala per vederne l'anteprima qui.",
    goToSequence: "Vai alla Sequenza",
    sendImmediately: "Invia subito",
    waitDays: (n: number) => `Attendi ${n} ${n === 1 ? "giorno" : "giorni"}`,
    editStep: "Modifica questo passaggio",
    noSubject: "(nessun oggetto)",
    enrollmentLabel: {
      replied: "Ha risposto",
      active: "Attivo",
      completed: "Completato",
      paused: "In pausa",
      bounced: "Rimbalzato",
    } as Record<EnrollmentStatus, string>,
  },
  fr: {
    leadsHeading: "Leads",
    noProspects: "Pas encore de prospects dans cette campagne — ajoutez-en pour voir de vrais messages.",
    goToProspects: "Aller aux Prospects",
    noSteps: "Pas encore d'étapes de séquence — créez votre séquence pour la prévisualiser ici.",
    goToSequence: "Aller à la Séquence",
    sendImmediately: "Envoyer immédiatement",
    waitDays: (n: number) => `Attendre ${n} ${n === 1 ? "jour" : "jours"}`,
    editStep: "Modifier cette étape",
    noSubject: "(aucun objet)",
    enrollmentLabel: {
      replied: "A répondu",
      active: "Actif",
      completed: "Terminé",
      paused: "En pause",
      bounced: "Rejeté",
    } as Record<EnrollmentStatus, string>,
  },
  de: {
    leadsHeading: "Leads",
    noProspects: "Noch keine Prospects in dieser Kampagne — füge welche hinzu, um echte Nachrichten zu sehen.",
    goToProspects: "Zu Prospects",
    noSteps: "Noch keine Sequenzschritte — baue deine Sequenz, um sie hier als Vorschau zu sehen.",
    goToSequence: "Zur Sequenz",
    sendImmediately: "Sofort senden",
    waitDays: (n: number) => `${n} ${n === 1 ? "Tag" : "Tage"} warten`,
    editStep: "Diesen Schritt bearbeiten",
    noSubject: "(kein Betreff)",
    enrollmentLabel: {
      replied: "Hat geantwortet",
      active: "Aktiv",
      completed: "Abgeschlossen",
      paused: "Pausiert",
      bounced: "Unzustellbar",
    } as Record<EnrollmentStatus, string>,
  },
  pt: {
    leadsHeading: "Leads",
    noProspects: "Ainda não há prospects nesta campanha — adicione alguns para ver mensagens reais.",
    goToProspects: "Ir para Prospects",
    noSteps: "Ainda não há passos de sequência — crie a sua sequência para a pré-visualizar aqui.",
    goToSequence: "Ir para a Sequência",
    sendImmediately: "Enviar imediatamente",
    waitDays: (n: number) => `Esperar ${n} ${n === 1 ? "dia" : "dias"}`,
    editStep: "Editar este passo",
    noSubject: "(sem assunto)",
    enrollmentLabel: {
      replied: "Respondeu",
      active: "Ativo",
      completed: "Concluído",
      paused: "Em pausa",
      bounced: "Devolvido",
    } as Record<EnrollmentStatus, string>,
  },
  pt_BR: {
    leadsHeading: "Leads",
    noProspects: "Ainda não há prospects nesta campanha — adicione alguns para ver mensagens reais.",
    goToProspects: "Ir para Prospects",
    noSteps: "Ainda não há etapas de sequência — crie sua sequência para pré-visualizá-la aqui.",
    goToSequence: "Ir para a Sequência",
    sendImmediately: "Enviar imediatamente",
    waitDays: (n: number) => `Aguardar ${n} ${n === 1 ? "dia" : "dias"}`,
    editStep: "Editar esta etapa",
    noSubject: "(sem assunto)",
    enrollmentLabel: {
      replied: "Respondeu",
      active: "Ativo",
      completed: "Concluído",
      paused: "Em pausa",
      bounced: "Retornado",
    } as Record<EnrollmentStatus, string>,
  },
} as const

export function SequencePreviewPane({
  steps,
  leads,
  onEditStep,
  onGoToSequence,
  onGoToProspects,
}: {
  steps: CampaignStep[]
  leads: PreviewLeadRow[]
  onEditStep: (stepId: string) => void
  onGoToSequence: () => void
  onGoToProspects: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]

  const flatSteps = flattenCampaignSteps(steps)
  const [leadId, setLeadId] = React.useState(leads[0]?.id ?? "")
  const lead = leads.find((l) => l.id === leadId) ?? leads[0]

  if (leads.length === 0) {
    return (
      <div className="text-muted-foreground space-y-3 rounded-lg border py-12 text-center text-sm">
        <p>{c.noProspects}</p>
        <Button variant="outline" size="sm" onClick={onGoToProspects}>
          {c.goToProspects}
        </Button>
      </div>
    )
  }

  if (flatSteps.length === 0) {
    return (
      <div className="text-muted-foreground space-y-3 rounded-lg border py-12 text-center text-sm">
        <p>{c.noSteps}</p>
        <Button variant="outline" size="sm" onClick={onGoToSequence}>
          {c.goToSequence}
        </Button>
      </div>
    )
  }

  const data = lead.prospect ? prospectMergeData(lead.prospect) : undefined

  return (
    <div className="grid min-h-0 grid-cols-[16rem_1fr] gap-4 overflow-hidden rounded-lg border">
      {/* Leads — numbered, selectable, each carrying its enrollment-status
          badge (same Badge/variant the Prospects tab table uses). */}
      <div className="bg-muted/30 min-h-0 space-y-1 overflow-y-auto border-r p-2">
        <p className="text-muted-foreground px-2 pt-1 pb-2 text-xs font-medium tracking-wide uppercase">
          {c.leadsHeading}
        </p>
        {leads.map((row, i) => {
          const isActive = row.id === lead.id
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => setLeadId(row.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                isActive ? "bg-primary/10 text-primary" : "hover:bg-background"
              )}
            >
              <span className="text-muted-foreground w-4 shrink-0 text-xs tabular-nums">
                {i + 1}
              </span>
              {row.prospect && <ProspectAvatar prospect={row.prospect} className="size-6" />}
              <span className="min-w-0 flex-1 truncate">
                {row.prospect ? `${row.prospect.firstName} ${row.prospect.lastName}` : row.id}
              </span>
              <Badge variant={ENROLLMENT_VARIANT[row.status]} className="shrink-0 text-[10px]">
                {c.enrollmentLabel[row.status]}
              </Badge>
            </button>
          )
        })}
      </div>

      {/* Message thread — every step in the sequence, in order, personalized
          for the selected lead, with a day-gap pill between consecutive
          messages (reuses the exact "Wait N days"/"Send immediately" copy
          the sequence canvas already uses for the same delayDays value). */}
      <div className="min-h-0 space-y-3 overflow-y-auto p-5">
        {flatSteps.map((step, i) => {
          const meta = channelMeta(step.channel)
          const Icon = meta.Icon
          return (
            <React.Fragment key={step.id}>
              {i > 0 && (
                <div className="flex items-center gap-3">
                  <div className="bg-border h-px flex-1" />
                  <span className="text-muted-foreground text-xs whitespace-nowrap">
                    {step.delayDays === 0 ? c.sendImmediately : c.waitDays(step.delayDays)}
                  </span>
                  <div className="bg-border h-px flex-1" />
                </div>
              )}
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <span className="bg-muted text-muted-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold">
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-md",
                      meta.tint
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <span className="text-muted-foreground flex-1 text-xs font-medium">
                    #{i + 1}
                  </span>
                  <button
                    type="button"
                    aria-label={c.editStep}
                    onClick={() => onEditStep(step.id)}
                    className="text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                </div>
                {step.subject && (
                  <p className="text-sm font-semibold">
                    {data
                      ? mergeVarsHighlighted(stripHtml(step.subject), data)
                      : stripHtml(step.subject)}
                  </p>
                )}
                {!step.subject && !step.body && (
                  <p className="text-muted-foreground text-sm">{c.noSubject}</p>
                )}
                {step.body && (
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {data
                      ? mergeVarsHighlighted(stripHtml(step.body), data)
                      : stripHtml(step.body)}
                  </p>
                )}
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
