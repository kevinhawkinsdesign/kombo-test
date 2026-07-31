import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Briefcase,
  Brain,
  Building2,
  Cake,
  DollarSign,
  FolderPlus,
  Globe,
  Grid2x2,
  Mail,
  MapPin,
  Megaphone,
  Pause,
  Pencil,
  Phone,
  Play,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProspectAvatar, ScoreBadge, StatusBadge } from "@/components/common/ProspectBits"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { AddToListDialog } from "@/components/prospect/AddToListDialog"
import { generateProspectSummary } from "@/lib/mock-ai-summary"
import { CrmBadge } from "@/components/common/CrmBadge"
import { useProspectEnrollments, campaignEnrollmentStore } from "@/lib/campaign-enrollment-store"
import { getCampaign } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import type { Locale } from "@/lib/locale"
import type { EnrollmentStatus, Prospect } from "@/lib/types"

const COPY = {
  en: {
    aiSummary: "AI Summary",
    regenerate: "Regenerate",
    customize: "Customize",
    customizeTitle: "Customize AI summary",
    customizeDescription: "Tell AI what the summary should focus on.",
    customizeLabel: "Focus on",
    customizePlaceholder: "e.g. budget authority, best opening angle…",
    cancel: "Cancel",
    apply: "Apply",
    regenerated: "Summary regenerated",
    prospectDetails: "Prospect",
    ageRange: "Age range",
    personality: "Personality",
    location: "Location",
    email: "Email",
    phone: "Phone",
    linkedin: "LinkedIn",
    addToList: "Add to list",
    addedToList: (firstName: string, name: string) =>
      `${firstName} added to "${name}"`,
    firmographics: "Company details",
    seniority: "Seniority",
    department: "Department",
    industry: "Industry",
    headcount: "Employees",
    revenue: "Revenue",
    companyLocation: "Location",
    website: "Website",
    companyLinkedin: "LinkedIn",
    campaigns: "Campaigns",
    noCampaigns: "Not enrolled in any campaign.",
    enrollmentStatus: {
      active: "Active",
      replied: "Replied",
      completed: "Completed",
      bounced: "Bounced",
      paused: "Paused",
    } as Record<EnrollmentStatus, string>,
    pauseEnrollment: "Pause",
    resumeEnrollment: "Resume",
    enrollmentPaused: (name: string) => `${name}'s enrollment paused`,
    enrollmentResumed: (name: string) => `${name}'s enrollment resumed`,
  },
  es: {
    aiSummary: "Resumen con IA",
    regenerate: "Regenerar",
    customize: "Personalizar",
    customizeTitle: "Personalizar resumen con IA",
    customizeDescription: "Dile a la IA en qué debe enfocarse el resumen.",
    customizeLabel: "Enfocarse en",
    customizePlaceholder: "p. ej. autoridad de presupuesto, mejor ángulo de apertura…",
    cancel: "Cancelar",
    apply: "Aplicar",
    regenerated: "Resumen regenerado",
    prospectDetails: "Prospecto",
    ageRange: "Rango de edad",
    personality: "Personalidad",
    location: "Ubicación",
    email: "Correo electrónico",
    phone: "Teléfono",
    linkedin: "LinkedIn",
    addToList: "Añadir a lista",
    addedToList: (firstName: string, name: string) =>
      `${firstName} añadido a "${name}"`,
    firmographics: "Datos de la empresa",
    seniority: "Antigüedad",
    department: "Departamento",
    industry: "Industria",
    headcount: "Empleados",
    revenue: "Ingresos",
    companyLocation: "Ubicación",
    website: "Sitio web",
    companyLinkedin: "LinkedIn",
    campaigns: "Campañas",
    noCampaigns: "No está inscrito en ninguna campaña.",
    enrollmentStatus: {
      active: "Activo",
      replied: "Respondió",
      completed: "Completado",
      bounced: "Rebotado",
      paused: "En pausa",
    } as Record<EnrollmentStatus, string>,
    pauseEnrollment: "Pausar",
    resumeEnrollment: "Reanudar",
    enrollmentPaused: (name: string) => `Inscripción de ${name} pausada`,
    enrollmentResumed: (name: string) => `Inscripción de ${name} reanudada`,
  },
  it: {
    aiSummary: "Riepilogo IA",
    regenerate: "Rigenera",
    customize: "Personalizza",
    customizeTitle: "Personalizza il riepilogo IA",
    customizeDescription: "Di' all'IA su cosa deve concentrarsi il riepilogo.",
    customizeLabel: "Concentrati su",
    customizePlaceholder: "es. autorità di budget, miglior angolo di apertura…",
    cancel: "Annulla",
    apply: "Applica",
    regenerated: "Riepilogo rigenerato",
    prospectDetails: "Prospect",
    ageRange: "Fascia d'età",
    personality: "Personalità",
    location: "Località",
    email: "Email",
    phone: "Telefono",
    linkedin: "LinkedIn",
    addToList: "Aggiungi a lista",
    addedToList: (firstName: string, name: string) =>
      `${firstName} aggiunto a "${name}"`,
    firmographics: "Dettagli azienda",
    seniority: "Seniority",
    department: "Reparto",
    industry: "Settore",
    headcount: "Dipendenti",
    revenue: "Fatturato",
    companyLocation: "Località",
    website: "Sito web",
    companyLinkedin: "LinkedIn",
    campaigns: "Campagne",
    noCampaigns: "Non iscritto a nessuna campagna.",
    enrollmentStatus: {
      active: "Attivo",
      replied: "Ha risposto",
      completed: "Completato",
      bounced: "Respinto",
      paused: "In pausa",
    } as Record<EnrollmentStatus, string>,
    pauseEnrollment: "Pausa",
    resumeEnrollment: "Riprendi",
    enrollmentPaused: (name: string) => `Iscrizione di ${name} messa in pausa`,
    enrollmentResumed: (name: string) => `Iscrizione di ${name} ripresa`,
  },
  fr: {
    aiSummary: "Résumé IA",
    regenerate: "Régénérer",
    customize: "Personnaliser",
    customizeTitle: "Personnaliser le résumé IA",
    customizeDescription: "Indiquez à l'IA sur quoi le résumé doit se concentrer.",
    customizeLabel: "Se concentrer sur",
    customizePlaceholder: "ex. pouvoir décisionnel budgétaire, meilleur angle d'approche…",
    cancel: "Annuler",
    apply: "Appliquer",
    regenerated: "Résumé régénéré",
    prospectDetails: "Prospect",
    ageRange: "Tranche d'âge",
    personality: "Personnalité",
    location: "Localisation",
    email: "E-mail",
    phone: "Téléphone",
    linkedin: "LinkedIn",
    addToList: "Ajouter à une liste",
    addedToList: (firstName: string, name: string) =>
      `${firstName} ajouté à "${name}"`,
    firmographics: "Détails de l'entreprise",
    seniority: "Ancienneté",
    department: "Département",
    industry: "Secteur",
    headcount: "Employés",
    revenue: "Chiffre d'affaires",
    companyLocation: "Localisation",
    website: "Site web",
    companyLinkedin: "LinkedIn",
    campaigns: "Campagnes",
    noCampaigns: "Non inscrit à une campagne.",
    enrollmentStatus: {
      active: "Actif",
      replied: "A répondu",
      completed: "Terminé",
      bounced: "Rejeté",
      paused: "En pause",
    } as Record<EnrollmentStatus, string>,
    pauseEnrollment: "Mettre en pause",
    resumeEnrollment: "Reprendre",
    enrollmentPaused: (name: string) => `Inscription de ${name} mise en pause`,
    enrollmentResumed: (name: string) => `Inscription de ${name} reprise`,
  },
  de: {
    aiSummary: "KI-Zusammenfassung",
    regenerate: "Neu generieren",
    customize: "Anpassen",
    customizeTitle: "KI-Zusammenfassung anpassen",
    customizeDescription: "Sag der KI, worauf sich die Zusammenfassung konzentrieren soll.",
    customizeLabel: "Fokus auf",
    customizePlaceholder: "z. B. Budgetverantwortung, bester Gesprächseinstieg…",
    cancel: "Abbrechen",
    apply: "Anwenden",
    regenerated: "Zusammenfassung neu generiert",
    prospectDetails: "Prospect",
    ageRange: "Altersgruppe",
    personality: "Persönlichkeit",
    location: "Standort",
    email: "E-Mail",
    phone: "Telefon",
    linkedin: "LinkedIn",
    addToList: "Zu Liste hinzufügen",
    addedToList: (firstName: string, name: string) =>
      `${firstName} zu "${name}" hinzugefügt`,
    firmographics: "Unternehmensdetails",
    seniority: "Karrierestufe",
    department: "Abteilung",
    industry: "Branche",
    headcount: "Mitarbeitende",
    revenue: "Umsatz",
    companyLocation: "Standort",
    website: "Website",
    companyLinkedin: "LinkedIn",
    campaigns: "Kampagnen",
    noCampaigns: "In keiner Kampagne angemeldet.",
    enrollmentStatus: {
      active: "Aktiv",
      replied: "Geantwortet",
      completed: "Abgeschlossen",
      bounced: "Unzustellbar",
      paused: "Pausiert",
    } as Record<EnrollmentStatus, string>,
    pauseEnrollment: "Pausieren",
    resumeEnrollment: "Fortsetzen",
    enrollmentPaused: (name: string) => `Anmeldung von ${name} pausiert`,
    enrollmentResumed: (name: string) => `Anmeldung von ${name} fortgesetzt`,
  },
  pt: {
    aiSummary: "Resumo com IA",
    regenerate: "Regenerar",
    customize: "Personalizar",
    customizeTitle: "Personalizar resumo com IA",
    customizeDescription: "Diz à IA em que se deve focar o resumo.",
    customizeLabel: "Foca em",
    customizePlaceholder: "p. ex. autoridade orçamental, melhor ângulo de abertura…",
    cancel: "Cancelar",
    apply: "Aplicar",
    regenerated: "Resumo regenerado",
    prospectDetails: "Prospect",
    ageRange: "Faixa etária",
    personality: "Personalidade",
    location: "Localização",
    email: "Email",
    phone: "Telefone",
    linkedin: "LinkedIn",
    addToList: "Adicionar a lista",
    addedToList: (firstName: string, name: string) =>
      `${firstName} adicionado a "${name}"`,
    firmographics: "Detalhes da empresa",
    seniority: "Senioridade",
    department: "Departamento",
    industry: "Setor",
    headcount: "Colaboradores",
    revenue: "Receita",
    companyLocation: "Localização",
    website: "Website",
    companyLinkedin: "LinkedIn",
    campaigns: "Campanhas",
    noCampaigns: "Não inscrito em nenhuma campanha.",
    enrollmentStatus: {
      active: "Ativo",
      replied: "Respondeu",
      completed: "Concluído",
      bounced: "Devolvido",
      paused: "Em pausa",
    } as Record<EnrollmentStatus, string>,
    pauseEnrollment: "Pausar",
    resumeEnrollment: "Retomar",
    enrollmentPaused: (name: string) => `Inscrição de ${name} pausada`,
    enrollmentResumed: (name: string) => `Inscrição de ${name} retomada`,
  },
  pt_BR: {
    aiSummary: "Resumo com IA",
    regenerate: "Regenerar",
    customize: "Personalizar",
    customizeTitle: "Personalizar resumo com IA",
    customizeDescription: "Diga à IA no que o resumo deve focar.",
    customizeLabel: "Foco em",
    customizePlaceholder: "ex. autoridade de orçamento, melhor ângulo de abertura…",
    cancel: "Cancelar",
    apply: "Aplicar",
    regenerated: "Resumo regenerado",
    prospectDetails: "Prospect",
    ageRange: "Faixa etária",
    personality: "Personalidade",
    location: "Localização",
    email: "Email",
    phone: "Telefone",
    linkedin: "LinkedIn",
    addToList: "Adicionar a lista",
    addedToList: (firstName: string, name: string) =>
      `${firstName} adicionado a "${name}"`,
    firmographics: "Detalhes da empresa",
    seniority: "Senioridade",
    department: "Departamento",
    industry: "Setor",
    headcount: "Funcionários",
    revenue: "Receita",
    companyLocation: "Localização",
    website: "Site",
    companyLinkedin: "LinkedIn",
    campaigns: "Campanhas",
    noCampaigns: "Não inscrito em nenhuma campanha.",
    enrollmentStatus: {
      active: "Ativo",
      replied: "Respondeu",
      completed: "Concluído",
      bounced: "Retornado",
      paused: "Em pausa",
    } as Record<EnrollmentStatus, string>,
    pauseEnrollment: "Pausar",
    resumeEnrollment: "Retomar",
    enrollmentPaused: (name: string) => `Inscrição de ${name} pausada`,
    enrollmentResumed: (name: string) => `Inscrição de ${name} retomada`,
  },
} as const

type Disc = NonNullable<Prospect["personalityType"]>

const DISC_LABELS: Record<Locale, Record<Disc, string>> = {
  en: { D: "Driver", I: "Influencer", S: "Steady", C: "Analytical" },
  es: { D: "Dominante", I: "Influyente", S: "Estable", C: "Analítico" },
  it: { D: "Dominante", I: "Influente", S: "Stabile", C: "Analitico" },
  fr: { D: "Dominant", I: "Influent", S: "Stable", C: "Analytique" },
  de: { D: "Macher", I: "Kommunikativ", S: "Beständig", C: "Analytisch" },
  pt: { D: "Dominante", I: "Influente", S: "Estável", C: "Analítico" },
  pt_BR: { D: "Dominante", I: "Influente", S: "Estável", C: "Analítico" },
}

// Reuses the app's neutral data-viz palette rather than raw red/yellow/green/
// blue — keeps this off the `destructive` token, which already means "error"
// elsewhere (bounced counts, not_interested status).
const DISC_CLASSES: Record<Disc, string> = {
  D: "bg-chart-5/15 text-chart-5",
  I: "bg-chart-4/15 text-chart-4",
  S: "bg-chart-1/15 text-chart-1",
  C: "bg-chart-3/15 text-chart-3",
}

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, "")
}

function Field({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  href?: string
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-primary block truncate font-medium hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="truncate font-medium">{value}</p>
        )}
      </div>
    </div>
  )
}

/**
 * Collapsible context card for a prospect (and, since Prospect has no
 * separate Account record, their company via its own firmographic fields).
 * Used by Inbox's thread view — not a replacement for ProspectProfile.tsx.
 */
export function ProspectSummaryPanel({
  prospect,
  locale,
}: {
  prospect: Prospect
  locale: Locale
}) {
  const c = COPY[locale]
  const [summary, setSummary] = React.useState(() => generateProspectSummary(prospect))
  const [customizeOpen, setCustomizeOpen] = React.useState(false)
  const [instructions, setInstructions] = React.useState("")
  const [addListOpen, setAddListOpen] = React.useState(false)
  const enrollments = useProspectEnrollments(prospect.id)

  // A fresh contextual summary whenever the open thread's prospect changes.
  const [shownId, setShownId] = React.useState(prospect.id)
  if (prospect.id !== shownId) {
    setShownId(prospect.id)
    setSummary(generateProspectSummary(prospect))
  }

  // Reset on open (house pattern — render-time check, never an effect).
  const [wasOpen, setWasOpen] = React.useState(customizeOpen)
  if (customizeOpen !== wasOpen) {
    setWasOpen(customizeOpen)
    if (customizeOpen) setInstructions("")
  }

  function regenerate() {
    setSummary(generateProspectSummary(prospect))
    toast.success(c.regenerated)
  }

  function applyCustomize() {
    setSummary(generateProspectSummary(prospect, instructions))
    setCustomizeOpen(false)
    toast.success(c.regenerated)
  }

  const disc = prospect.personalityType
  const website = `https://${prospect.companyDomain}`

  return (
    <div className="space-y-5 p-4">
      <div className="space-y-2">
        <ProspectAvatar prospect={prospect} className="size-14 text-base" />
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-semibold">
              {prospect.firstName} {prospect.lastName}
            </p>
            <ScoreBadge score={prospect.score} />
          </div>
          <p className="text-muted-foreground text-sm">
            {prospect.title} · {prospect.company}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={prospect.status} />
          <CrmBadge inCrm={Boolean(prospect.inCrm)} locale={locale} />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setAddListOpen(true)}
        >
          <FolderPlus className="size-3.5" />
          {c.addToList}
        </Button>
      </div>

      <div className="bg-primary/[0.03] space-y-2 rounded-lg border p-3">
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="text-primary size-3.5" />
          {c.aiSummary}
        </p>
        <p className="text-xs leading-snug">{summary}</p>
        <div className="flex gap-1.5 pt-1">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={regenerate}>
            <RefreshCw className="size-3.5" />
            {c.regenerate}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setCustomizeOpen(true)}
          >
            <Pencil className="size-3.5" />
            {c.customize}
          </Button>
        </div>
      </div>

      {prospect.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {prospect.tags.map((t) => (
            <Badge key={t} variant="secondary" className="font-normal">
              {t}
            </Badge>
          ))}
        </div>
      )}

      <div className="space-y-2 border-t pt-4">
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
          <Megaphone className="size-3.5" />
          {c.campaigns}
        </p>
        {enrollments.length === 0 ? (
          <p className="text-muted-foreground text-xs">{c.noCampaigns}</p>
        ) : (
          <div className="space-y-1.5">
            {enrollments.map(({ campaignId, enrollment }) => {
              const campaign = getCampaign(campaignId)
              const prospectName = `${prospect.firstName} ${prospect.lastName}`
              return (
                <div
                  key={campaignId}
                  className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-sm"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/campaigns/${campaignId}`}
                      className="block truncate font-medium hover:underline"
                    >
                      {campaign?.name ?? campaignId}
                    </Link>
                    <Badge
                      variant={enrollment.status === "paused" ? "outline" : "secondary"}
                      className="mt-0.5 font-normal"
                    >
                      {c.enrollmentStatus[enrollment.status]}
                    </Badge>
                  </div>
                  {enrollment.status === "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 shrink-0 text-xs"
                      onClick={() => {
                        campaignEnrollmentStore.pause(campaignId, prospect.id)
                        toast.success(c.enrollmentPaused(prospectName))
                      }}
                    >
                      <Pause className="size-3.5" />
                      {c.pauseEnrollment}
                    </Button>
                  )}
                  {enrollment.status === "paused" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 shrink-0 text-xs"
                      onClick={() => {
                        campaignEnrollmentStore.resume(campaignId, prospect.id)
                        toast.success(c.enrollmentResumed(prospectName))
                      }}
                    >
                      <Play className="size-3.5" />
                      {c.resumeEnrollment}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          {c.prospectDetails}
        </p>
        {prospect.ageRange && (
          <Field icon={Cake} label={c.ageRange} value={prospect.ageRange} />
        )}
        {disc && (
          <div className="flex items-start gap-2 text-sm">
            <Brain className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">{c.personality}</p>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold",
                  DISC_CLASSES[disc]
                )}
              >
                <span className="bg-current size-1.5 rounded-full opacity-80" />
                {DISC_LABELS[locale][disc]}
              </span>
            </div>
          </div>
        )}
        <Field icon={MapPin} label={c.location} value={prospect.location} />
        <Field
          icon={Mail}
          label={c.email}
          value={prospect.email}
          href={`mailto:${prospect.email}`}
        />
        {prospect.phone && (
          <Field
            icon={Phone}
            label={c.phone}
            value={prospect.phone}
            href={`tel:${prospect.phone}`}
          />
        )}
        <Field
          icon={LinkedinIcon}
          label={c.linkedin}
          value={stripProtocol(prospect.linkedinUrl)}
          href={prospect.linkedinUrl}
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          {c.firmographics}
        </p>
        <Field icon={Briefcase} label={c.seniority} value={prospect.seniority} />
        <Field icon={Grid2x2} label={c.department} value={prospect.department} />
        <Field icon={Building2} label={c.industry} value={prospect.industry} />
        <Field icon={Users} label={c.headcount} value={prospect.headcount} />
        <Field icon={DollarSign} label={c.revenue} value={prospect.revenue} />
        {prospect.companyLocation && (
          <Field icon={MapPin} label={c.companyLocation} value={prospect.companyLocation} />
        )}
        <Field icon={Globe} label={c.website} value={prospect.companyDomain} href={website} />
        {prospect.companyLinkedinUrl && (
          <Field
            icon={LinkedinIcon}
            label={c.companyLinkedin}
            value={stripProtocol(prospect.companyLinkedinUrl)}
            href={prospect.companyLinkedinUrl}
          />
        )}
      </div>

      <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{c.customizeTitle}</DialogTitle>
            <DialogDescription>{c.customizeDescription}</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="summary-instructions">{c.customizeLabel}</Label>
            <Textarea
              id="summary-instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={c.customizePlaceholder}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCustomizeOpen(false)}>
              {c.cancel}
            </Button>
            <Button variant="volt" onClick={applyCustomize}>
              {c.apply}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddToListDialog
        open={addListOpen}
        onOpenChange={setAddListOpen}
        count={1}
        onAdded={(name) =>
          toast.success(c.addedToList(prospect.firstName, name))
        }
      />
    </div>
  )
}
