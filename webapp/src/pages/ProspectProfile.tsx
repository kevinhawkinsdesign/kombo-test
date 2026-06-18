import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  Mail,
  Phone,
  Plus,
  Pencil,
  Send,
  Sparkles,
  Building2,
  Lock,
  Copy,
  Target,
  Clock,
  MailCheck,
  MailOpen,
  Reply,
  CalendarCheck,
  CheckCircle2,
  MoreHorizontal,
  Trash2,
  UserPlus,
  StickyNote,
  PhoneCall,
  Waypoints,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"

import { Page } from "@/components/layout/Page"
import { useLocale } from "@/lib/locale"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ProspectAvatar,
  ScoreBadge,
  StatusBadge,
} from "@/components/common/ProspectBits"
import { TrackButton } from "@/components/common/TrackButton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddToListDialog } from "@/components/prospect/AddToListDialog"
import { ProspectFormDialog } from "@/components/prospect/ProspectFormDialog"
import { ComposeDialog } from "@/components/prospect/ComposeDialog"
import { AddToCrmDialog } from "@/components/crm/AddToCrmDialog"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { conversations } from "@/lib/mock-data"
import { useProspects, prospectStore } from "@/lib/store"
import {
  callPrep,
  emailPrep,
  getHistory,
  getNotes,
  qualification,
  SMART_TAGS,
  type HistoryType,
  type ProspectNote,
} from "@/lib/mock-prospect-depth"
import { getIntroPaths, type IntroStrength } from "@/lib/mock-network"
import { useCredits } from "@/lib/credits"
import { useAuth } from "@/lib/auth"
import { initials, relativeTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Prospect } from "@/lib/types"

const COPY = {
  en: {
    prospectNotFound: "Prospect not found.",
    backToSearch: "Back to search",
    message: "Message",
    addToList: "Add to list",
    edit: "Edit",
    prospectActions: "Prospect actions",
    deleteProspect: "Delete prospect",
    tabOverview: "Overview",
    tabPrep: "AI Prep",
    tabHistory: "History",
    tabNotes: "Notes",
    about: "About",
    buyingSignals: "Buying signals",
    conversation: "Conversation",
    openInInbox: "Open in inbox",
    you: "You",
    noConversation: "No conversation yet.",
    startOutreach: "Start outreach",
    addedToList: (firstName: string, name: string) =>
      `${firstName} added to "${name}"`,
    crmFirstName: "First name",
    crmLastName: "Last name",
    crmEmail: "Email",
    crmPhone: "Phone",
    crmCompany: "Company",
    crmJobTitle: "Job title",
    deleteTitle: "Delete prospect?",
    deleteDescription: (fullName: string) =>
      `This will permanently remove ${fullName} and remove them from any lists. This action cannot be undone.`,
    deleteConfirm: "Delete",
    prospectDeleted: "Prospect deleted",
    contact: "Contact",
    verified: "Verified",
    reveal: "Reveal",
    linkedinProfile: "LinkedIn profile",
    addToCrm: "Add to CRM",
    notAvailable: "Not available",
    revealEmailTitle: "Reveal email?",
    revealPhoneTitle: "Reveal phone?",
    revealDesc: (cost: number, firstName: string, what: string) =>
      `This will use ${cost} credit${cost > 1 ? "s" : ""} to reveal ${firstName}'s ${what}.`,
    phoneNumber: "phone number",
    emailAddress: "email address",
    cancel: "Cancel",
    useCredits: (cost: number) =>
      `Use ${cost} credit${cost > 1 ? "s" : ""}`,
    emailRevealed: "Email revealed",
    phoneRevealed: "Phone revealed",
    enrichment: "Enrichment",
    dataPoints: "30 data points",
    seniority: "Seniority",
    department: "Department",
    headcount: "Headcount",
    industry: "Industry",
    revenue: "Revenue",
    location: "Location",
    leadQualification: "Lead qualification",
    icpFit: "ICP fit",
    intent: "Intent",
    engagement: "Engagement",
    warmIntros: "Warm intros",
    all: "All",
    noWarmPaths: "No warm paths yet.",
    exploreNetwork: "Explore your network",
    strengthStrong: "Strong",
    strengthMedium: "Medium",
    strengthWeak: "Weak",
    ask: (name: string) => `Ask ${name}`,
    requestIntro: "Request intro",
    introRequested: (name: string) => `Intro requested via ${name}`,
    aiCallPrep: "AI call prep",
    talkingPoints: "Talking points",
    discoveryQuestions: "Discovery questions",
    likelyObjections: "Likely objections",
    aiEmailDrafts: "AI email drafts",
    copy: "Copy",
    copied: "Copied to clipboard",
    use: "Use",
    activityTimeline: "Activity timeline",
    addNote: "Add a note",
    notePlaceholder: "What did you learn? Add context for your team…",
    addNoteButton: "Add note",
    noteAdded: "Note added",
    noNotes: "No notes yet.",
    youAuthor: "You",
  },
  es: {
    prospectNotFound: "Prospecto no encontrado.",
    backToSearch: "Volver a la búsqueda",
    message: "Mensaje",
    addToList: "Añadir a lista",
    edit: "Editar",
    prospectActions: "Acciones del prospecto",
    deleteProspect: "Eliminar prospecto",
    tabOverview: "Resumen",
    tabPrep: "Preparación IA",
    tabHistory: "Historial",
    tabNotes: "Notas",
    about: "Acerca de",
    buyingSignals: "Señales de compra",
    conversation: "Conversación",
    openInInbox: "Abrir en la bandeja",
    you: "Tú",
    noConversation: "Aún no hay conversación.",
    startOutreach: "Iniciar contacto",
    addedToList: (firstName: string, name: string) =>
      `${firstName} añadido a "${name}"`,
    crmFirstName: "Nombre",
    crmLastName: "Apellidos",
    crmEmail: "Correo",
    crmPhone: "Teléfono",
    crmCompany: "Empresa",
    crmJobTitle: "Cargo",
    deleteTitle: "¿Eliminar prospecto?",
    deleteDescription: (fullName: string) =>
      `Esto eliminará de forma permanente a ${fullName} y lo quitará de cualquier lista. Esta acción no se puede deshacer.`,
    deleteConfirm: "Eliminar",
    prospectDeleted: "Prospecto eliminado",
    contact: "Contacto",
    verified: "Verificado",
    reveal: "Revelar",
    linkedinProfile: "Perfil de LinkedIn",
    addToCrm: "Añadir al CRM",
    notAvailable: "No disponible",
    revealEmailTitle: "¿Revelar correo?",
    revealPhoneTitle: "¿Revelar teléfono?",
    revealDesc: (cost: number, firstName: string, what: string) =>
      `Esto usará ${cost} crédito${cost > 1 ? "s" : ""} para revelar ${what} de ${firstName}.`,
    phoneNumber: "el número de teléfono",
    emailAddress: "el correo electrónico",
    cancel: "Cancelar",
    useCredits: (cost: number) =>
      `Usar ${cost} crédito${cost > 1 ? "s" : ""}`,
    emailRevealed: "Correo revelado",
    phoneRevealed: "Teléfono revelado",
    enrichment: "Enriquecimiento",
    dataPoints: "30 puntos de datos",
    seniority: "Antigüedad",
    department: "Departamento",
    headcount: "Empleados",
    industry: "Sector",
    revenue: "Ingresos",
    location: "Ubicación",
    leadQualification: "Cualificación del lead",
    icpFit: "Encaje con ICP",
    intent: "Intención",
    engagement: "Interacción",
    warmIntros: "Presentaciones",
    all: "Todas",
    noWarmPaths: "Aún no hay caminos cálidos.",
    exploreNetwork: "Explora tu red",
    strengthStrong: "Fuerte",
    strengthMedium: "Media",
    strengthWeak: "Débil",
    ask: (name: string) => `Pedir a ${name}`,
    requestIntro: "Solicitar presentación",
    introRequested: (name: string) =>
      `Presentación solicitada a través de ${name}`,
    aiCallPrep: "Preparación de llamada con IA",
    talkingPoints: "Puntos clave",
    discoveryQuestions: "Preguntas de descubrimiento",
    likelyObjections: "Objeciones probables",
    aiEmailDrafts: "Borradores de correo con IA",
    copy: "Copiar",
    copied: "Copiado al portapapeles",
    use: "Usar",
    activityTimeline: "Cronología de actividad",
    addNote: "Añadir una nota",
    notePlaceholder: "¿Qué has aprendido? Añade contexto para tu equipo…",
    addNoteButton: "Añadir nota",
    noteAdded: "Nota añadida",
    noNotes: "Aún no hay notas.",
    youAuthor: "Tú",
  },
} as const

export default function ProspectProfile() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { id } = useParams()
  const navigate = useNavigate()
  const prospects = useProspects()
  const prospect = id ? prospects.find((p) => p.id === id) : undefined
  const [addOpen, setAddOpen] = React.useState(false)
  const [composeOpen, setComposeOpen] = React.useState(false)
  const [crmOpen, setCrmOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  if (!prospect) {
    return (
      <Page>
        <p className="text-muted-foreground">{c.prospectNotFound}</p>
        <Button variant="link" asChild className="px-0">
          <Link to="/search">{c.backToSearch}</Link>
        </Button>
      </Page>
    )
  }

  const conversation = conversations.find((c) => c.prospectId === prospect.id)

  return (
    <Page>
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/search">
          <ArrowLeft className="size-4" />
          {c.backToSearch}
        </Link>
      </Button>

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start">
          <ProspectAvatar
            prospect={prospect}
            className="size-16 text-lg sm:size-20"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold">
                {prospect.firstName} {prospect.lastName}
              </h1>
              <ScoreBadge score={prospect.score} />
              <StatusBadge status={prospect.status} />
            </div>
            <p className="text-muted-foreground mt-1">
              {prospect.title} · {prospect.company}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {prospect.tags.map((t) => (
                <Badge key={t} variant="secondary" className="font-normal">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="volt" onClick={() => setComposeOpen(true)}>
              <Send className="size-4" />
              {c.message}
            </Button>
            <Button variant="outline" onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              {c.addToList}
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              {c.edit}
            </Button>
            <TrackButton
              kind="prospect"
              id={prospect.id}
              name={prospect.firstName}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={c.prospectActions}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setDeleteOpen(true)}
                >
                  <Trash2 className="size-4" />
                  {c.deleteProspect}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">{c.tabOverview}</TabsTrigger>
              <TabsTrigger value="prep">{c.tabPrep}</TabsTrigger>
              <TabsTrigger value="history">{c.tabHistory}</TabsTrigger>
              <TabsTrigger value="notes">{c.tabNotes}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{c.about}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {prospect.about}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="text-primary size-4" />
                    {c.buyingSignals}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {prospect.signals.map((s) => (
                    <div
                      key={s}
                      className="bg-chart-1/10 text-chart-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
                    >
                      <span className="bg-current size-1.5 rounded-full" />
                      {s}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-base">{c.conversation}</CardTitle>
                  {conversation && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/inbox">{c.openInInbox}</Link>
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {conversation ? (
                    <div className="space-y-3">
                      {conversation.messages.map((m) => (
                        <div
                          key={m.id}
                          className={
                            m.direction === "outbound"
                              ? "ml-8 rounded-lg rounded-tr-sm bg-primary/10 px-3 py-2"
                              : "mr-8 rounded-lg rounded-tl-sm bg-muted px-3 py-2"
                          }
                        >
                          <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
                            <span>
                              {m.direction === "outbound"
                                ? c.you
                                : prospect.firstName}{" "}
                              · {m.channel}
                            </span>
                            <span>{relativeTime(m.timestamp)}</span>
                          </div>
                          <p className="text-sm">{m.body}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-muted-foreground text-sm">
                        {c.noConversation}
                      </p>
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => setComposeOpen(true)}
                      >
                        <Send className="size-4" />
                        {c.startOutreach}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prep">
              <PrepTab prospect={prospect} onUse={() => setComposeOpen(true)} />
            </TabsContent>

            <TabsContent value="history">
              <HistoryTab prospect={prospect} />
            </TabsContent>

            <TabsContent value="notes">
              <NotesTab prospect={prospect} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <ContactCard prospect={prospect} onAddToCrm={() => setCrmOpen(true)} />
          <WarmIntroCard prospect={prospect} />
          <QualificationCard prospect={prospect} />
          <EnrichmentCard prospect={prospect} onAddToCrm={() => setCrmOpen(true)} />
        </div>
      </div>

      <AddToListDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        count={1}
        onAdded={(name) =>
          toast.success(c.addedToList(prospect.firstName, name))
        }
      />
      <ComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        prospect={prospect}
      />
      <AddToCrmDialog
        open={crmOpen}
        onOpenChange={setCrmOpen}
        kind="prospect"
        recordName={`${prospect.firstName} ${prospect.lastName}`}
        fields={[
          { label: c.crmFirstName, value: prospect.firstName },
          { label: c.crmLastName, value: prospect.lastName },
          { label: c.crmEmail, value: prospect.email },
          { label: c.crmPhone, value: prospect.phone ?? "—" },
          { label: c.crmCompany, value: prospect.company },
          { label: c.crmJobTitle, value: prospect.title },
        ]}
      />
      <ProspectFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        prospect={prospect}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={c.deleteTitle}
        description={c.deleteDescription(
          `${prospect.firstName} ${prospect.lastName}`
        )}
        confirmLabel={c.deleteConfirm}
        destructive
        onConfirm={() => {
          prospectStore.remove(prospect.id)
          toast.success(c.prospectDeleted)
          navigate("/search")
        }}
      />
    </Page>
  )
}

/* ----------------------------- Contact (credit-gated reveal) ----------------------------- */

function ContactCard({
  prospect,
  onAddToCrm,
}: {
  prospect: Prospect
  onAddToCrm: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { spend } = useCredits()
  const [emailShown, setEmailShown] = React.useState(false)
  const [phoneShown, setPhoneShown] = React.useState(false)
  const [confirm, setConfirm] = React.useState<null | "email" | "phone">(null)

  const maskedEmail = `••••••@${prospect.companyDomain}`
  const maskedPhone = "+1 (•••) •••-••••"
  const cost = confirm === "phone" ? 2 : 1

  function doReveal() {
    if (!confirm) return
    const label = `${confirm === "email" ? "Email" : "Phone"} reveal · ${prospect.firstName} ${prospect.lastName}`
    if (spend(cost, label)) {
      if (confirm === "email") setEmailShown(true)
      else setPhoneShown(true)
      toast.success(confirm === "email" ? c.emailRevealed : c.phoneRevealed)
    }
    setConfirm(null)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{c.contact}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {/* Email */}
          <div className="flex items-center gap-3">
            <Mail className="text-muted-foreground size-4 shrink-0" />
            {emailShown ? (
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <a
                  href={`mailto:${prospect.email}`}
                  className="hover:text-primary truncate"
                >
                  {prospect.email}
                </a>
                <span className="text-chart-1 flex shrink-0 items-center gap-1 text-xs font-medium">
                  <CheckCircle2 className="size-3.5" />
                  {c.verified}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setConfirm("email")}
                className="text-muted-foreground hover:text-foreground flex flex-1 items-center justify-between gap-2"
              >
                <span className="truncate">{maskedEmail}</span>
                <span className="text-primary flex shrink-0 items-center gap-1 text-xs font-medium">
                  <Lock className="size-3" />
                  {c.reveal} · 1
                </span>
              </button>
            )}
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3">
            <Phone className="text-muted-foreground size-4 shrink-0" />
            {phoneShown ? (
              <span>{prospect.phone ?? c.notAvailable}</span>
            ) : (
              <button
                onClick={() => setConfirm("phone")}
                className="text-muted-foreground hover:text-foreground flex flex-1 items-center justify-between gap-2"
              >
                <span className="truncate">{maskedPhone}</span>
                <span className="text-primary flex shrink-0 items-center gap-1 text-xs font-medium">
                  <Lock className="size-3" />
                  {c.reveal} · 2
                </span>
              </button>
            )}
          </div>

          <a
            href={prospect.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary flex items-center gap-3"
          >
            <LinkedinIcon className="text-muted-foreground size-4" />
            <span className="truncate">{c.linkedinProfile}</span>
          </a>

          <Separator />
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onAddToCrm}
          >
            <Building2 className="size-4" />
            {c.addToCrm}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {confirm === "phone" ? c.revealPhoneTitle : c.revealEmailTitle}
            </DialogTitle>
            <DialogDescription>
              {c.revealDesc(
                cost,
                prospect.firstName,
                confirm === "phone" ? c.phoneNumber : c.emailAddress
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              {c.cancel}
            </Button>
            <Button onClick={doReveal}>
              <Lock className="size-4" />
              {c.useCredits(cost)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ----------------------------- Enrichment ----------------------------- */

function EnrichmentCard({
  prospect,
  onAddToCrm,
}: {
  prospect: Prospect
  onAddToCrm: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const enrichment = [
    { label: c.seniority, value: prospect.seniority },
    { label: c.department, value: prospect.department },
    { label: c.headcount, value: prospect.headcount },
    { label: c.industry, value: prospect.industry },
    { label: c.revenue, value: prospect.revenue },
    { label: c.location, value: prospect.location },
  ]
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">{c.enrichment}</CardTitle>
        <Badge variant="secondary" className="font-normal">
          {c.dataPoints}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {enrichment.map((e) => (
            <div key={e.label}>
              <p className="text-muted-foreground text-xs">{e.label}</p>
              <p className="text-sm font-medium">{e.value}</p>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onAddToCrm}
        >
          <Building2 className="size-4" />
          {c.addToCrm}
        </Button>
      </CardContent>
    </Card>
  )
}

/* ----------------------------- Lead qualification ----------------------------- */

function QualificationCard({ prospect }: { prospect: Prospect }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const q = qualification(prospect)
  const rows = [
    { label: c.icpFit, value: q.fit },
    { label: c.intent, value: q.intent },
    { label: c.engagement, value: q.engagement },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="text-primary size-4" />
          {c.leadQualification}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="font-medium tabular-nums">{r.value}</span>
            </div>
            <Progress value={r.value} />
          </div>
        ))}
        <Separator />
        <ul className="space-y-1.5">
          {q.reasons.map((reason) => (
            <li
              key={reason}
              className="text-muted-foreground flex items-start gap-2 text-xs"
            >
              <span className="bg-muted-foreground/40 mt-1.5 size-1 shrink-0 rounded-full" />
              {reason}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

/* ----------------------------- Warm intros ----------------------------- */

const INTRO_VARIANT: Record<
  IntroStrength,
  "success" | "secondary" | "outline"
> = {
  strong: "success",
  medium: "secondary",
  weak: "outline",
}

function WarmIntroCard({ prospect }: { prospect: Prospect }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const strengthLabels: Record<IntroStrength, string> = {
    strong: c.strengthStrong,
    medium: c.strengthMedium,
    weak: c.strengthWeak,
  }
  const paths = getIntroPaths(prospect.id)
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Waypoints className="text-primary size-4" />
          {c.warmIntros}
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/intros">{c.all}</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {paths.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {c.noWarmPaths}{" "}
            <Link to="/intros" className="text-primary">
              {c.exploreNetwork}
            </Link>
          </p>
        ) : (
          paths.slice(0, 2).map((path) => (
            <div key={path.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="size-7">
                  <AvatarFallback
                    style={{ backgroundColor: path.connectorAvatarColor, color: "white" }}
                    className="text-[10px]"
                  >
                    {initials(
                      path.connectorName.split(" ")[0],
                      path.connectorName.split(" ")[1]
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {path.connectorName}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {path.connectorTitle}
                  </p>
                </div>
                <Badge variant={INTRO_VARIANT[path.strength]}>
                  {strengthLabels[path.strength]}
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs">{path.via}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => toast.success(c.introRequested(path.connectorName))}
              >
                {path.connectorIsTeam
                  ? c.ask(path.connectorName.split(" ")[0])
                  : c.requestIntro}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

/* ----------------------------- AI Prep ----------------------------- */

function PrepTab({
  prospect,
  onUse,
}: {
  prospect: Prospect
  onUse: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const prep = callPrep(prospect)
  const emails = emailPrep(prospect)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PhoneCall className="text-primary size-4" />
            {c.aiCallPrep}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <PrepSection title={c.talkingPoints} items={prep.talkingPoints} />
          <PrepSection
            title={c.discoveryQuestions}
            items={prep.discoveryQuestions}
          />
          <div>
            <p className="mb-2 text-sm font-medium">{c.likelyObjections}</p>
            <div className="space-y-2">
              {prep.objections.map((o) => (
                <div key={o.objection} className="bg-muted/50 rounded-md p-3">
                  <p className="text-sm font-medium">“{o.objection}”</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    → {o.response}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="text-primary size-4" />
            {c.aiEmailDrafts}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {emails.map((e) => (
            <div key={e.id} className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <Badge variant="secondary" className="font-normal">
                  {e.tone}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard?.writeText(`${e.subject}\n\n${e.body}`)
                      toast.success(c.copied)
                    }}
                  >
                    <Copy className="size-3.5" />
                    {c.copy}
                  </Button>
                  <Button variant="outline" size="sm" onClick={onUse}>
                    <Send className="size-3.5" />
                    {c.use}
                  </Button>
                </div>
              </div>
              <p className="text-sm font-medium">{e.subject}</p>
              <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">
                {e.body}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function PrepSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm">
            <span className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ----------------------------- History ----------------------------- */

const HISTORY_META: Record<
  HistoryType,
  { icon: React.ComponentType<{ className?: string }>; tint: string }
> = {
  added: { icon: UserPlus, tint: "bg-muted text-muted-foreground" },
  enriched: { icon: Sparkles, tint: "bg-primary/15 text-primary" },
  email_sent: { icon: MailCheck, tint: "bg-chart-2/15 text-chart-2" },
  email_opened: { icon: MailOpen, tint: "bg-chart-2/15 text-chart-2" },
  replied: { icon: Reply, tint: "bg-chart-1/15 text-chart-1" },
  call: { icon: PhoneCall, tint: "bg-chart-4/15 text-chart-4" },
  meeting: { icon: CalendarCheck, tint: "bg-chart-1/15 text-chart-1" },
  note: { icon: StickyNote, tint: "bg-chart-4/15 text-chart-4" },
  status: { icon: Clock, tint: "bg-muted text-muted-foreground" },
}

function HistoryTab({ prospect }: { prospect: Prospect }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const events = getHistory(prospect)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{c.activityTimeline}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-5 border-l pl-6">
          {events.map((e) => {
            const meta = HISTORY_META[e.type]
            const Icon = meta.icon
            return (
              <li key={e.id} className="relative">
                <span
                  className={cn(
                    "absolute -left-[2.05rem] flex size-6 items-center justify-center rounded-full ring-4 ring-background",
                    meta.tint
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{e.label}</p>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {relativeTime(e.timestamp)}
                  </span>
                </div>
                {e.detail && (
                  <p className="text-muted-foreground text-xs">{e.detail}</p>
                )}
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}

/* ----------------------------- Notes ----------------------------- */

function NotesTab({ prospect }: { prospect: Prospect }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const { user } = useAuth()
  const [notes, setNotes] = React.useState<ProspectNote[]>(() =>
    getNotes(prospect.id)
  )
  const [body, setBody] = React.useState("")
  const [tags, setTags] = React.useState<string[]>([])
  const idRef = React.useRef(0)

  function toggleTag(tag: string) {
    setTags((t) =>
      t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]
    )
  }

  function addNote() {
    if (!body.trim()) return
    idRef.current += 1
    setNotes((n) => [
      {
        id: `note_new_${idRef.current}`,
        author: user?.name ?? c.youAuthor,
        body: body.trim(),
        tags,
        createdAt: new Date().toISOString(),
      },
      ...n,
    ])
    setBody("")
    setTags([])
    toast.success(c.noteAdded)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{c.addNote}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder={c.notePlaceholder}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-24"
          />
          <div className="flex flex-wrap gap-1.5">
            {SMART_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  tags.includes(tag)
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={addNote} disabled={!body.trim()}>
              <Plus className="size-4" />
              {c.addNoteButton}
            </Button>
          </div>
        </CardContent>
      </Card>

      {notes.length === 0 ? (
        <p className="text-muted-foreground text-sm">{c.noNotes}</p>
      ) : (
        notes.map((note) => (
          <Card key={note.id}>
            <CardContent className="pt-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">{note.author}</p>
                <span className="text-muted-foreground text-xs">
                  {relativeTime(note.createdAt)}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{note.body}</p>
              {note.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {note.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="font-normal">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
