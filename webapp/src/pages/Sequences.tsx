import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Plus,
  Mail,
  Phone,
  MessageCircle,
  Sparkles,
  Clock,
  Workflow,
  Pencil,
  Copy,
  Trash2,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react"

import { Page, PageHeading } from "@/components/layout/Page"
import { useLocale, type Locale } from "@/lib/locale"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { CollectionToolbar } from "@/components/common/CollectionToolbar"
import { SequenceRecommendations } from "@/components/common/Recommendations"
import type { CollectionView } from "@/components/common/ViewToggle"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { useSequences, sequenceStore } from "@/lib/mock-sequences"
import { downloadCsv } from "@/lib/csv"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { SequenceChannelType } from "@/lib/types"
import type { SequenceItem } from "@/lib/mock-sequences"

const CHANNELS: Record<
  SequenceChannelType,
  { icon: React.ComponentType<{ className?: string }>; tint: string } & Record<Locale, string>
> = {
  email: { icon: Mail, tint: "bg-primary/15 text-primary", en: "Email", es: "Email", it: "Email", fr: "E-mail", de: "E-Mail", pt: "Email", pt_BR: "Email" },
  linkedin: { icon: LinkedinIcon, tint: "bg-[#0a66c2]/15 text-[#0a66c2]", en: "LinkedIn", es: "LinkedIn", it: "LinkedIn", fr: "LinkedIn", de: "LinkedIn", pt: "LinkedIn", pt_BR: "LinkedIn" },
  call: { icon: Phone, tint: "bg-chart-4/15 text-chart-4", en: "Call", es: "Llamada", it: "Chiamata", fr: "Appel", de: "Anruf", pt: "Chamada", pt_BR: "Ligação" },
  ai_call: { icon: Sparkles, tint: "bg-chart-5/15 text-chart-5", en: "AI call", es: "Llamada IA", it: "Chiamata IA", fr: "Appel IA", de: "KI-Anruf", pt: "Chamada IA", pt_BR: "Ligação IA" },
  whatsapp: { icon: MessageCircle, tint: "bg-chart-1/15 text-chart-1", en: "WhatsApp", es: "WhatsApp", it: "WhatsApp", fr: "WhatsApp", de: "WhatsApp", pt: "WhatsApp", pt_BR: "WhatsApp" },
  wait: { icon: Clock, tint: "bg-muted text-muted-foreground", en: "Wait", es: "Espera", it: "Attesa", fr: "Attente", de: "Wartezeit", pt: "Espera", pt_BR: "Espera" },
}

const COPY = {
  en: {
    title: "Sequences",
    description: "Reusable multi-channel cadences your campaigns run.",
    newSequence: "New sequence",
    introTitle: "Build sequences once, reuse everywhere",
    introDescription:
      "Design a multi-step, multi-channel cadence — email, LinkedIn, calls, WhatsApp, even AI calls — with waits and triggers between steps, then attach it to any campaign.",
    introPoints: [
      "Mix email, LinkedIn, calls & WhatsApp",
      "Time steps with waits and triggers",
      "Reuse a proven cadence across campaigns",
      "Track reply rate per sequence",
    ],
    steps: (n: number) => `${n} ${n === 1 ? "step" : "steps"}`,
    usedBy: (n: number) => `${n} ${n === 1 ? "campaign" : "campaigns"}`,
    replyRate: "reply rate",
    updated: (d: string) => `Updated ${d}`,
    edit: "Edit",
    duplicate: "Duplicate",
    delete: "Delete",
    duplicated: "Sequence duplicated",
    deleted: "Sequence deleted",
    deleteTitle: "Delete sequence?",
    deleteDesc: (name: string) =>
      `"${name}" will be removed. Campaigns already using it keep their steps.`,
    deleteConfirm: "Delete",
    more: "More actions",
    search: "Search sequences…",
    viewCards: "Cards",
    viewTable: "Table",
    exportLabel: "Export",
    exported: "Sequences exported to CSV",
    noResults: "No sequences match your search.",
    sortRecent: "Recently updated",
    sortName: "Name (A–Z)",
    sortReply: "Reply rate",
    sortUsage: "Most used",
    colName: "Sequence",
    colSteps: "Steps",
    colFlow: "Channels",
    colUsedBy: "Campaigns",
    colReply: "Reply rate",
    colUpdated: "Updated",
  },
  es: {
    title: "Secuencias",
    description: "Cadencias multicanal reutilizables que ejecutan tus campañas.",
    newSequence: "Nueva secuencia",
    introTitle: "Crea secuencias una vez, reutilízalas siempre",
    introDescription:
      "Diseña una cadencia multicanal de varios pasos — email, LinkedIn, llamadas, WhatsApp e incluso llamadas con IA — con esperas y disparadores entre pasos, y adjúntala a cualquier campaña.",
    introPoints: [
      "Combina email, LinkedIn, llamadas y WhatsApp",
      "Programa pasos con esperas y disparadores",
      "Reutiliza una cadencia probada en varias campañas",
      "Mide la tasa de respuesta por secuencia",
    ],
    steps: (n: number) => `${n} ${n === 1 ? "paso" : "pasos"}`,
    usedBy: (n: number) => `${n} ${n === 1 ? "campaña" : "campañas"}`,
    replyRate: "tasa de respuesta",
    updated: (d: string) => `Actualizada ${d}`,
    edit: "Editar",
    duplicate: "Duplicar",
    delete: "Eliminar",
    duplicated: "Secuencia duplicada",
    deleted: "Secuencia eliminada",
    deleteTitle: "¿Eliminar secuencia?",
    deleteDesc: (name: string) =>
      `"${name}" se eliminará. Las campañas que ya la usan conservan sus pasos.`,
    deleteConfirm: "Eliminar",
    more: "Más acciones",
    search: "Buscar secuencias…",
    viewCards: "Tarjetas",
    viewTable: "Tabla",
    exportLabel: "Exportar",
    exported: "Secuencias exportadas a CSV",
    noResults: "Ninguna secuencia coincide con tu búsqueda.",
    sortRecent: "Actualizadas recientemente",
    sortName: "Nombre (A–Z)",
    sortReply: "Tasa de respuesta",
    sortUsage: "Más usadas",
    colName: "Secuencia",
    colSteps: "Pasos",
    colFlow: "Canales",
    colUsedBy: "Campañas",
    colReply: "Tasa de respuesta",
    colUpdated: "Actualizada",
  },
  it: {
    title: "Sequenze",
    description: "Cadenze multicanale riutilizzabili che le tue campagne eseguono.",
    newSequence: "Nuova sequenza",
    introTitle: "Crea le sequenze una volta, riusale ovunque",
    introDescription:
      "Progetta una cadenza multicanale in più passaggi — email, LinkedIn, chiamate, WhatsApp e persino chiamate IA — con attese e trigger tra i passaggi, poi collegala a qualsiasi campagna.",
    introPoints: [
      "Combina email, LinkedIn, chiamate e WhatsApp",
      "Scandisci i passaggi con attese e trigger",
      "Riusa una cadenza collaudata in più campagne",
      "Monitora il tasso di risposta per sequenza",
    ],
    steps: (n: number) => `${n} ${n === 1 ? "passaggio" : "passaggi"}`,
    usedBy: (n: number) => `${n} ${n === 1 ? "campagna" : "campagne"}`,
    replyRate: "tasso di risposta",
    updated: (d: string) => `Aggiornata ${d}`,
    edit: "Modifica",
    duplicate: "Duplica",
    delete: "Elimina",
    duplicated: "Sequenza duplicata",
    deleted: "Sequenza eliminata",
    deleteTitle: "Eliminare la sequenza?",
    deleteDesc: (name: string) =>
      `"${name}" verrà rimossa. Le campagne che già la usano conservano i loro passaggi.`,
    deleteConfirm: "Elimina",
    more: "Altre azioni",
    search: "Cerca sequenze…",
    viewCards: "Schede",
    viewTable: "Tabella",
    exportLabel: "Esporta",
    exported: "Sequenze esportate in CSV",
    noResults: "Nessuna sequenza corrisponde alla tua ricerca.",
    sortRecent: "Aggiornate di recente",
    sortName: "Nome (A–Z)",
    sortReply: "Tasso di risposta",
    sortUsage: "Più usate",
    colName: "Sequenza",
    colSteps: "Passaggi",
    colFlow: "Canali",
    colUsedBy: "Campagne",
    colReply: "Tasso di risposta",
    colUpdated: "Aggiornata",
  },
  fr: {
    title: "Séquences",
    description: "Des cadences multicanales réutilisables exécutées par vos campagnes.",
    newSequence: "Nouvelle séquence",
    introTitle: "Construisez vos séquences une fois, réutilisez-les partout",
    introDescription:
      "Concevez une cadence multicanale en plusieurs étapes — e-mail, LinkedIn, appels, WhatsApp et même appels IA — avec des attentes et des déclencheurs entre les étapes, puis associez-la à n'importe quelle campagne.",
    introPoints: [
      "Mélangez e-mail, LinkedIn, appels et WhatsApp",
      "Rythmez les étapes avec des attentes et des déclencheurs",
      "Réutilisez une cadence éprouvée sur plusieurs campagnes",
      "Suivez le taux de réponse par séquence",
    ],
    steps: (n: number) => `${n} ${n === 1 ? "étape" : "étapes"}`,
    usedBy: (n: number) => `${n} ${n === 1 ? "campagne" : "campagnes"}`,
    replyRate: "taux de réponse",
    updated: (d: string) => `Mise à jour ${d}`,
    edit: "Modifier",
    duplicate: "Dupliquer",
    delete: "Supprimer",
    duplicated: "Séquence dupliquée",
    deleted: "Séquence supprimée",
    deleteTitle: "Supprimer la séquence ?",
    deleteDesc: (name: string) =>
      `« ${name} » sera supprimée. Les campagnes qui l'utilisent déjà conservent leurs étapes.`,
    deleteConfirm: "Supprimer",
    more: "Plus d'actions",
    search: "Rechercher des séquences…",
    viewCards: "Cartes",
    viewTable: "Tableau",
    exportLabel: "Exporter",
    exported: "Séquences exportées en CSV",
    noResults: "Aucune séquence ne correspond à votre recherche.",
    sortRecent: "Mises à jour récemment",
    sortName: "Nom (A–Z)",
    sortReply: "Taux de réponse",
    sortUsage: "Les plus utilisées",
    colName: "Séquence",
    colSteps: "Étapes",
    colFlow: "Canaux",
    colUsedBy: "Campagnes",
    colReply: "Taux de réponse",
    colUpdated: "Mise à jour",
  },
  de: {
    title: "Sequenzen",
    description: "Wiederverwendbare Multichannel-Kadenzen, die deine Kampagnen ausführen.",
    newSequence: "Neue Sequenz",
    introTitle: "Sequenzen einmal bauen, überall wiederverwenden",
    introDescription:
      "Gestalte eine mehrstufige Multichannel-Kadenz — E-Mail, LinkedIn, Anrufe, WhatsApp, sogar KI-Anrufe — mit Wartezeiten und Triggern zwischen den Schritten, und hänge sie an jede beliebige Kampagne.",
    introPoints: [
      "Kombiniere E-Mail, LinkedIn, Anrufe & WhatsApp",
      "Takte Schritte mit Wartezeiten und Triggern",
      "Nutze eine bewährte Kadenz über mehrere Kampagnen",
      "Verfolge die Antwortquote pro Sequenz",
    ],
    steps: (n: number) => `${n} ${n === 1 ? "Schritt" : "Schritte"}`,
    usedBy: (n: number) => `${n} ${n === 1 ? "Kampagne" : "Kampagnen"}`,
    replyRate: "Antwortquote",
    updated: (d: string) => `Aktualisiert am ${d}`,
    edit: "Bearbeiten",
    duplicate: "Duplizieren",
    delete: "Löschen",
    duplicated: "Sequenz dupliziert",
    deleted: "Sequenz gelöscht",
    deleteTitle: "Sequenz löschen?",
    deleteDesc: (name: string) =>
      `„${name}“ wird entfernt. Kampagnen, die sie bereits nutzen, behalten ihre Schritte.`,
    deleteConfirm: "Löschen",
    more: "Weitere Aktionen",
    search: "Sequenzen suchen…",
    viewCards: "Karten",
    viewTable: "Tabelle",
    exportLabel: "Exportieren",
    exported: "Sequenzen als CSV exportiert",
    noResults: "Keine Sequenzen entsprechen deiner Suche.",
    sortRecent: "Zuletzt aktualisiert",
    sortName: "Name (A–Z)",
    sortReply: "Antwortquote",
    sortUsage: "Am häufigsten genutzt",
    colName: "Sequenz",
    colSteps: "Schritte",
    colFlow: "Kanäle",
    colUsedBy: "Kampagnen",
    colReply: "Antwortquote",
    colUpdated: "Aktualisiert",
  },
  pt: {
    title: "Sequências",
    description: "Cadências multicanal reutilizáveis que as suas campanhas executam.",
    newSequence: "Nova sequência",
    introTitle: "Crie sequências uma vez, reutilize em todo o lado",
    introDescription:
      "Desenhe uma cadência multicanal de vários passos — email, LinkedIn, chamadas, WhatsApp e até chamadas com IA — com esperas e acionadores entre passos, e associe-a a qualquer campanha.",
    introPoints: [
      "Combine email, LinkedIn, chamadas e WhatsApp",
      "Programe passos com esperas e acionadores",
      "Reutilize uma cadência comprovada em várias campanhas",
      "Acompanhe a taxa de resposta por sequência",
    ],
    steps: (n: number) => `${n} ${n === 1 ? "passo" : "passos"}`,
    usedBy: (n: number) => `${n} ${n === 1 ? "campanha" : "campanhas"}`,
    replyRate: "taxa de resposta",
    updated: (d: string) => `Atualizada ${d}`,
    edit: "Editar",
    duplicate: "Duplicar",
    delete: "Eliminar",
    duplicated: "Sequência duplicada",
    deleted: "Sequência eliminada",
    deleteTitle: "Eliminar sequência?",
    deleteDesc: (name: string) =>
      `"${name}" será removida. As campanhas que já a usam mantêm os seus passos.`,
    deleteConfirm: "Eliminar",
    more: "Mais ações",
    search: "Pesquisar sequências…",
    viewCards: "Cartões",
    viewTable: "Tabela",
    exportLabel: "Exportar",
    exported: "Sequências exportadas para CSV",
    noResults: "Nenhuma sequência corresponde à sua pesquisa.",
    sortRecent: "Atualizadas recentemente",
    sortName: "Nome (A–Z)",
    sortReply: "Taxa de resposta",
    sortUsage: "Mais usadas",
    colName: "Sequência",
    colSteps: "Passos",
    colFlow: "Canais",
    colUsedBy: "Campanhas",
    colReply: "Taxa de resposta",
    colUpdated: "Atualizada",
  },
  pt_BR: {
    title: "Sequências",
    description: "Cadências multicanal reutilizáveis que suas campanhas executam.",
    newSequence: "Nova sequência",
    introTitle: "Crie sequências uma vez, reutilize em todo lugar",
    introDescription:
      "Desenhe uma cadência multicanal de várias etapas — email, LinkedIn, ligações, WhatsApp e até ligações com IA — com esperas e gatilhos entre as etapas, e associe-a a qualquer campanha.",
    introPoints: [
      "Combine email, LinkedIn, ligações e WhatsApp",
      "Programe etapas com esperas e gatilhos",
      "Reutilize uma cadência comprovada em várias campanhas",
      "Acompanhe a taxa de resposta por sequência",
    ],
    steps: (n: number) => `${n} ${n === 1 ? "etapa" : "etapas"}`,
    usedBy: (n: number) => `${n} ${n === 1 ? "campanha" : "campanhas"}`,
    replyRate: "taxa de resposta",
    updated: (d: string) => `Atualizada ${d}`,
    edit: "Editar",
    duplicate: "Duplicar",
    delete: "Excluir",
    duplicated: "Sequência duplicada",
    deleted: "Sequência excluída",
    deleteTitle: "Excluir sequência?",
    deleteDesc: (name: string) =>
      `"${name}" será removida. As campanhas que já a usam mantêm suas etapas.`,
    deleteConfirm: "Excluir",
    more: "Mais ações",
    search: "Buscar sequências…",
    viewCards: "Cartões",
    viewTable: "Tabela",
    exportLabel: "Exportar",
    exported: "Sequências exportadas para CSV",
    noResults: "Nenhuma sequência corresponde à sua busca.",
    sortRecent: "Atualizadas recentemente",
    sortName: "Nome (A–Z)",
    sortReply: "Taxa de resposta",
    sortUsage: "Mais usadas",
    colName: "Sequência",
    colSteps: "Etapas",
    colFlow: "Canais",
    colUsedBy: "Campanhas",
    colReply: "Taxa de resposta",
    colUpdated: "Atualizada",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

export default function Sequences() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const sequences = useSequences()
  const [toDelete, setToDelete] = React.useState<SequenceItem | null>(null)
  const [view, setView] = React.useState<CollectionView>("cards")
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState("recent")

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? sequences.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q)
        )
      : sequences
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name)
        case "reply":
          return b.replyRate - a.replyRate
        case "usage":
          return b.campaignsUsing - a.campaignsUsing
        default:
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
      }
    })
    return sorted
  }, [sequences, query, sort])

  function exportCsv() {
    downloadCsv(
      "kombo-sequences.csv",
      [c.colName, c.colSteps, c.colUsedBy, c.colReply, c.colUpdated],
      visible.map((s) => [
        s.name,
        s.steps.filter((step) => step !== "wait").length,
        s.campaignsUsing,
        `${s.replyRate}%`,
        formatDate(s.updatedAt),
      ])
    )
    toast.success(c.exported)
  }

  return (
    <Page>
      <PageHeading
        title={c.title}
        description={c.description}
        action={
          <Button variant="volt" asChild>
            <Link to="/sequence-builder">
              <Plus className="size-4" />
              {c.newSequence}
            </Link>
          </Button>
        }
      />

      <FeatureIntro
        featureKey="sequence"
        icon={Workflow}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        className="mb-6"
      />

      <SequenceRecommendations />

      <CollectionToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder={c.search}
        sort={sort}
        onSortChange={setSort}
        sortOptions={[
          { value: "recent", label: c.sortRecent },
          { value: "name", label: c.sortName },
          { value: "reply", label: c.sortReply },
          { value: "usage", label: c.sortUsage },
        ]}
        view={view}
        onViewChange={setView}
        cardsLabel={c.viewCards}
        tableLabel={c.viewTable}
        onExport={exportCsv}
        exportLabel={c.exportLabel}
      />

      {visible.length === 0 ? (
        <Card className="text-muted-foreground p-8 text-center text-sm">
          {c.noResults}
        </Card>
      ) : view === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((seq) => (
            <SequenceCard
              key={seq.id}
              seq={seq}
              c={c}
              locale={locale}
              onEdit={() => navigate("/sequence-builder")}
              onDuplicate={() => {
                sequenceStore.duplicate(seq.id)
                toast.success(c.duplicated)
              }}
              onDelete={() => setToDelete(seq)}
            />
          ))}
        </div>
      ) : (
        <SequenceTable
          rows={visible}
          c={c}
          locale={locale}
          onOpen={() => navigate("/sequence-builder")}
          onDuplicate={(seq) => {
            sequenceStore.duplicate(seq.id)
            toast.success(c.duplicated)
          }}
          onDelete={(seq) => setToDelete(seq)}
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={c.deleteTitle}
        description={toDelete ? c.deleteDesc(toDelete.name) : ""}
        confirmLabel={c.deleteConfirm}
        destructive
        onConfirm={() => {
          if (toDelete) {
            sequenceStore.remove(toDelete.id)
            toast.success(c.deleted)
          }
          setToDelete(null)
        }}
      />
    </Page>
  )
}

function SequenceCard({
  seq,
  c,
  locale,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  seq: SequenceItem
  c: Copy
  locale: Locale
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const stepCount = seq.steps.filter((s) => s !== "wait").length
  return (
    <Card className="gap-3 p-5">
      <div className="flex items-start justify-between gap-2">
        <Link
          to="/sequence-builder"
          className="min-w-0 flex-1 font-semibold hover:underline"
        >
          {seq.name}
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" aria-label={c.more}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-4" />
              {c.edit}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="size-4" />
              {c.duplicate}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 className="size-4" />
              {c.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-muted-foreground line-clamp-2 text-sm">{seq.description}</p>

      {/* Channel flow */}
      <div className="flex flex-wrap items-center gap-1">
        {seq.steps.map((step, i) => {
          const meta = CHANNELS[step]
          const Icon = meta.icon
          return (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="text-muted-foreground size-3" />}
              <span
                className={cn("flex size-6 items-center justify-center rounded-md", meta.tint)}
                title={meta[locale]}
              >
                <Icon className="size-3.5" />
              </span>
            </React.Fragment>
          )
        })}
      </div>

      <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="text-foreground font-medium">{c.steps(stepCount)}</span>
        <span>·</span>
        <span>{c.usedBy(seq.campaignsUsing)}</span>
        <span>·</span>
        <span className="text-chart-1 font-medium">
          {seq.replyRate}% {c.replyRate}
        </span>
      </div>
      <p className="text-muted-foreground text-xs">{c.updated(formatDate(seq.updatedAt))}</p>
    </Card>
  )
}

function ChannelFlow({
  steps,
  locale,
}: {
  steps: SequenceChannelType[]
  locale: Locale
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {steps.map((step, i) => {
        const meta = CHANNELS[step]
        const Icon = meta.icon
        return (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="text-muted-foreground size-3" />}
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-md",
                meta.tint
              )}
              title={meta[locale]}
            >
              <Icon className="size-3.5" />
            </span>
          </React.Fragment>
        )
      })}
    </div>
  )
}

function SequenceTable({
  rows,
  c,
  locale,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  rows: SequenceItem[]
  c: Copy
  locale: Locale
  onOpen: () => void
  onDuplicate: (seq: SequenceItem) => void
  onDelete: (seq: SequenceItem) => void
}) {
  return (
    <Card className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{c.colName}</TableHead>
            <TableHead>{c.colFlow}</TableHead>
            <TableHead className="text-right">{c.colSteps}</TableHead>
            <TableHead className="text-right">{c.colUsedBy}</TableHead>
            <TableHead className="text-right">{c.colReply}</TableHead>
            <TableHead className="text-right">{c.colUpdated}</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((seq) => (
            <TableRow
              key={seq.id}
              className="cursor-pointer"
              onClick={onOpen}
            >
              <TableCell>
                <p className="font-medium">{seq.name}</p>
                <p className="text-muted-foreground line-clamp-1 max-w-[280px] text-xs">
                  {seq.description}
                </p>
              </TableCell>
              <TableCell>
                <ChannelFlow steps={seq.steps} locale={locale} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {seq.steps.filter((s) => s !== "wait").length}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {seq.campaignsUsing}
              </TableCell>
              <TableCell className="text-chart-1 text-right font-medium tabular-nums">
                {seq.replyRate}%
              </TableCell>
              <TableCell className="text-muted-foreground text-right text-xs whitespace-nowrap">
                {formatDate(seq.updatedAt)}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      aria-label={c.more}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onOpen}>
                      <Pencil className="size-4" />
                      {c.edit}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate(seq)}>
                      <Copy className="size-4" />
                      {c.duplicate}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(seq)}
                    >
                      <Trash2 className="size-4" />
                      {c.delete}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
