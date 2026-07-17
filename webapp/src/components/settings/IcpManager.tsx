import * as React from "react"
import { toast } from "sonner"
import { Plus, MoreHorizontal, Pencil, Trash2, Star, Target } from "lucide-react"

import { useLocale } from "@/lib/locale"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { TagInput } from "@/components/common/TagInput"
import {
  useIcps,
  icpStore,
  type Icp,
  DECISION_MAKER_SUGGESTIONS,
  INFLUENCER_SUGGESTIONS,
} from "@/lib/mock-icps"
import { cn } from "@/lib/utils"

const COPY = {
  en: {
    title: "Ideal Customer Profiles",
    description:
      "Define the segments you sell into. Kombo scores and recommends prospects against your primary ICP — switch primary anytime.",
    addIcp: "Add ICP",
    primary: "Primary",
    setPrimary: "Set as primary",
    edit: "Edit",
    delete: "Delete",
    actions: "ICP actions",
    industries: "Industries",
    headcount: "Company size",
    titles: "Target titles",
    decisionMakers: "Decision Makers",
    decisionMakersPlaceholder: "Add decision makers…",
    findingSimilarDecisionMakers: "Finding similar decision makers…",
    influencers: "Influencers",
    influencersPlaceholder: "Add influencers…",
    findingSimilarInfluencers: "Finding similar influencers…",
    clearAll: (n: number) => `Clear all (${n})`,
    removeValue: (v: string) => `Remove ${v}`,
    viewMore: (n: number) => `View more (${n})`,
    seniority: "Seniority",
    regions: "Regions",
    signals: "Signals",
    newTitle: "New ICP",
    editTitle: "Edit ICP",
    formDesc: "Separate multiple values with commas.",
    name: "Profile name",
    namePlaceholder: "e.g. Enterprise RevLeaders",
    color: "Color",
    cancel: "Cancel",
    save: "Save profile",
    created: "ICP created",
    updated: "ICP updated",
    deleted: "ICP deleted",
    primarySet: "Primary ICP updated",
    deleteTitle: "Delete ICP?",
    deleteDesc: (name: string) => `"${name}" will be permanently removed.`,
    deleteConfirm: "Delete",
    nameRequired: "Give the profile a name.",
  },
  es: {
    title: "Perfiles de cliente ideal",
    description:
      "Define los segmentos a los que vendes. Kombo puntúa y recomienda prospectos según tu PCI principal — cambia el principal cuando quieras.",
    addIcp: "Añadir PCI",
    primary: "Principal",
    setPrimary: "Marcar como principal",
    edit: "Editar",
    delete: "Eliminar",
    actions: "Acciones del PCI",
    industries: "Sectores",
    headcount: "Tamaño de empresa",
    titles: "Cargos objetivo",
    decisionMakers: "Responsables de decisión",
    decisionMakersPlaceholder: "Añade responsables de decisión…",
    findingSimilarDecisionMakers: "Buscando responsables de decisión similares…",
    influencers: "Influenciadores",
    influencersPlaceholder: "Añade influenciadores…",
    findingSimilarInfluencers: "Buscando influenciadores similares…",
    clearAll: (n: number) => `Borrar todo (${n})`,
    removeValue: (v: string) => `Eliminar ${v}`,
    viewMore: (n: number) => `Ver más (${n})`,
    seniority: "Antigüedad",
    regions: "Regiones",
    signals: "Señales",
    newTitle: "Nuevo PCI",
    editTitle: "Editar PCI",
    formDesc: "Separa varios valores con comas.",
    name: "Nombre del perfil",
    namePlaceholder: "ej. Líderes de ingresos enterprise",
    color: "Color",
    cancel: "Cancelar",
    save: "Guardar perfil",
    created: "PCI creado",
    updated: "PCI actualizado",
    deleted: "PCI eliminado",
    primarySet: "PCI principal actualizado",
    deleteTitle: "¿Eliminar PCI?",
    deleteDesc: (name: string) => `"${name}" se eliminará de forma permanente.`,
    deleteConfirm: "Eliminar",
    nameRequired: "Dale un nombre al perfil.",
  },
  it: {
    title: "Profili ICP",
    description:
      "Definisci i segmenti a cui vendi. Kombo valuta e consiglia i prospect in base al tuo ICP principale — puoi cambiare l'ICP principale quando vuoi.",
    addIcp: "Aggiungi ICP",
    primary: "Principale",
    setPrimary: "Imposta come principale",
    edit: "Modifica",
    delete: "Elimina",
    actions: "Azioni ICP",
    industries: "Settori",
    headcount: "Dimensione azienda",
    titles: "Ruoli target",
    decisionMakers: "Decisori",
    decisionMakersPlaceholder: "Aggiungi decisori…",
    findingSimilarDecisionMakers: "Ricerca di decisori simili…",
    influencers: "Influencer",
    influencersPlaceholder: "Aggiungi influencer…",
    findingSimilarInfluencers: "Ricerca di influencer simili…",
    clearAll: (n: number) => `Cancella tutto (${n})`,
    removeValue: (v: string) => `Rimuovi ${v}`,
    viewMore: (n: number) => `Mostra altri (${n})`,
    seniority: "Livello di seniority",
    regions: "Regioni",
    signals: "Segnali",
    newTitle: "Nuovo ICP",
    editTitle: "Modifica ICP",
    formDesc: "Separa più valori con una virgola.",
    name: "Nome del profilo",
    namePlaceholder: "es. Enterprise RevLeaders",
    color: "Colore",
    cancel: "Annulla",
    save: "Salva profilo",
    created: "ICP creato",
    updated: "ICP aggiornato",
    deleted: "ICP eliminato",
    primarySet: "ICP principale aggiornato",
    deleteTitle: "Eliminare l'ICP?",
    deleteDesc: (name: string) => `"${name}" verrà rimosso in modo permanente.`,
    deleteConfirm: "Elimina",
    nameRequired: "Assegna un nome al profilo.",
  },
  fr: {
    title: "Profils ICP",
    description:
      "Définissez les segments sur lesquels vous vendez. Kombo évalue et recommande des prospects par rapport à votre ICP principal — changez d'ICP principal à tout moment.",
    addIcp: "Ajouter un ICP",
    primary: "Principal",
    setPrimary: "Définir comme principal",
    edit: "Modifier",
    delete: "Supprimer",
    actions: "Actions ICP",
    industries: "Secteurs",
    headcount: "Taille de l'entreprise",
    titles: "Postes cibles",
    decisionMakers: "Décideurs",
    decisionMakersPlaceholder: "Ajouter des décideurs…",
    findingSimilarDecisionMakers: "Recherche de décideurs similaires…",
    influencers: "Influenceurs",
    influencersPlaceholder: "Ajouter des influenceurs…",
    findingSimilarInfluencers: "Recherche d'influenceurs similaires…",
    clearAll: (n: number) => `Tout effacer (${n})`,
    removeValue: (v: string) => `Retirer ${v}`,
    viewMore: (n: number) => `Voir plus (${n})`,
    seniority: "Ancienneté",
    regions: "Régions",
    signals: "Signaux",
    newTitle: "Nouvel ICP",
    editTitle: "Modifier l'ICP",
    formDesc: "Séparez plusieurs valeurs par des virgules.",
    name: "Nom du profil",
    namePlaceholder: "ex. Enterprise RevLeaders",
    color: "Couleur",
    cancel: "Annuler",
    save: "Enregistrer le profil",
    created: "ICP créé",
    updated: "ICP mis à jour",
    deleted: "ICP supprimé",
    primarySet: "ICP principal mis à jour",
    deleteTitle: "Supprimer l'ICP ?",
    deleteDesc: (name: string) => `"${name}" sera définitivement supprimé.`,
    deleteConfirm: "Supprimer",
    nameRequired: "Donnez un nom au profil.",
  },
  de: {
    title: "ICP-Profile",
    description:
      "Definiere die Segmente, an die du verkaufst. Kombo bewertet und empfiehlt Prospects anhand deines primären ICP — wechsle das primäre ICP jederzeit.",
    addIcp: "ICP hinzufügen",
    primary: "Primär",
    setPrimary: "Als primär festlegen",
    edit: "Bearbeiten",
    delete: "Löschen",
    actions: "ICP-Aktionen",
    industries: "Branchen",
    headcount: "Unternehmensgröße",
    titles: "Zielpositionen",
    decisionMakers: "Entscheider",
    decisionMakersPlaceholder: "Entscheider hinzufügen…",
    findingSimilarDecisionMakers: "Ähnliche Entscheider werden gesucht…",
    influencers: "Einflussnehmer",
    influencersPlaceholder: "Einflussnehmer hinzufügen…",
    findingSimilarInfluencers: "Ähnliche Einflussnehmer werden gesucht…",
    clearAll: (n: number) => `Alle löschen (${n})`,
    removeValue: (v: string) => `${v} entfernen`,
    viewMore: (n: number) => `Mehr anzeigen (${n})`,
    seniority: "Senioritätslevel",
    regions: "Regionen",
    signals: "Signale",
    newTitle: "Neues ICP",
    editTitle: "ICP bearbeiten",
    formDesc: "Trenne mehrere Werte durch Kommas.",
    name: "Profilname",
    namePlaceholder: "z. B. Enterprise RevLeaders",
    color: "Farbe",
    cancel: "Abbrechen",
    save: "Profil speichern",
    created: "ICP erstellt",
    updated: "ICP aktualisiert",
    deleted: "ICP gelöscht",
    primarySet: "Primäres ICP aktualisiert",
    deleteTitle: "ICP löschen?",
    deleteDesc: (name: string) => `"${name}" wird endgültig entfernt.`,
    deleteConfirm: "Löschen",
    nameRequired: "Gib dem Profil einen Namen.",
  },
  pt: {
    title: "Perfis ICP",
    description:
      "Defina os segmentos aos quais vende. O Kombo pontua e recomenda prospects com base no seu ICP principal — mude o ICP principal quando quiser.",
    addIcp: "Adicionar ICP",
    primary: "Principal",
    setPrimary: "Definir como principal",
    edit: "Editar",
    delete: "Eliminar",
    actions: "Ações do ICP",
    industries: "Setores",
    headcount: "Dimensão da empresa",
    titles: "Cargos-alvo",
    decisionMakers: "Decisores",
    decisionMakersPlaceholder: "Adicionar decisores…",
    findingSimilarDecisionMakers: "A procurar decisores semelhantes…",
    influencers: "Influenciadores",
    influencersPlaceholder: "Adicionar influenciadores…",
    findingSimilarInfluencers: "A procurar influenciadores semelhantes…",
    clearAll: (n: number) => `Limpar tudo (${n})`,
    removeValue: (v: string) => `Remover ${v}`,
    viewMore: (n: number) => `Ver mais (${n})`,
    seniority: "Senioridade",
    regions: "Regiões",
    signals: "Sinais",
    newTitle: "Novo ICP",
    editTitle: "Editar ICP",
    formDesc: "Separe vários valores com vírgulas.",
    name: "Nome do perfil",
    namePlaceholder: "ex. Enterprise RevLeaders",
    color: "Cor",
    cancel: "Cancelar",
    save: "Guardar perfil",
    created: "ICP criado",
    updated: "ICP atualizado",
    deleted: "ICP eliminado",
    primarySet: "ICP principal atualizado",
    deleteTitle: "Eliminar o ICP?",
    deleteDesc: (name: string) => `"${name}" será removido permanentemente.`,
    deleteConfirm: "Eliminar",
    nameRequired: "Dê um nome ao perfil.",
  },
  pt_BR: {
    title: "Perfis ICP",
    description:
      "Defina os segmentos para os quais você vende. O Kombo pontua e recomenda prospects com base no seu ICP principal — mude o ICP principal quando quiser.",
    addIcp: "Adicionar ICP",
    primary: "Principal",
    setPrimary: "Definir como principal",
    edit: "Editar",
    delete: "Excluir",
    actions: "Ações do ICP",
    industries: "Setores",
    headcount: "Tamanho da empresa",
    titles: "Cargos-alvo",
    decisionMakers: "Tomadores de decisão",
    decisionMakersPlaceholder: "Adicionar tomadores de decisão…",
    findingSimilarDecisionMakers: "Buscando tomadores de decisão semelhantes…",
    influencers: "Influenciadores",
    influencersPlaceholder: "Adicionar influenciadores…",
    findingSimilarInfluencers: "Buscando influenciadores semelhantes…",
    clearAll: (n: number) => `Limpar tudo (${n})`,
    removeValue: (v: string) => `Remover ${v}`,
    viewMore: (n: number) => `Ver mais (${n})`,
    seniority: "Senioridade",
    regions: "Regiões",
    signals: "Sinais",
    newTitle: "Novo ICP",
    editTitle: "Editar ICP",
    formDesc: "Separe vários valores com vírgulas.",
    name: "Nome do perfil",
    namePlaceholder: "ex.: Enterprise RevLeaders",
    color: "Cor",
    cancel: "Cancelar",
    save: "Salvar perfil",
    created: "ICP criado",
    updated: "ICP atualizado",
    deleted: "ICP excluído",
    primarySet: "ICP principal atualizado",
    deleteTitle: "Excluir o ICP?",
    deleteDesc: (name: string) => `"${name}" será removido permanentemente.`,
    deleteConfirm: "Excluir",
    nameRequired: "Dê um nome ao perfil.",
  },
} as const

const COLORS = [
  "#7c3aed",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
]

export function IcpManager() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const icps = useIcps()
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Icp | undefined>(undefined)
  const [deleting, setDeleting] = React.useState<Icp | undefined>(undefined)

  function openCreate() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function openEdit(icp: Icp) {
    setEditing(icp)
    setFormOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
        <div>
          <CardTitle className="text-base">{c.title}</CardTitle>
          <CardDescription>{c.description}</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          {c.addIcp}
        </Button>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {icps.map((icp) => (
          <div
            key={icp.id}
            className={cn(
              "relative rounded-lg border p-4",
              icp.primary ? "border-primary/40 bg-primary/[0.03]" : ""
            )}
          >
            <div className="flex items-start gap-2">
              <span
                className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `${icp.color}1f` }}
              >
                <Target className="size-4" style={{ color: icp.color }} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{icp.name}</p>
                  {icp.primary && (
                    <Badge className="bg-primary/15 text-primary gap-1 border-transparent font-normal">
                      <Star className="size-3 fill-current" />
                      {c.primary}
                    </Badge>
                  )}
                </div>
                <dl className="mt-2 space-y-1.5">
                  <Detail label={c.titles} values={icp.titles} />
                  <Detail
                    label={c.decisionMakers}
                    values={icp.decisionMakers}
                  />
                  <Detail label={c.influencers} values={icp.influencers} />
                  <Detail label={c.industries} values={icp.industries} />
                  <Detail label={c.headcount} values={[icp.headcount]} />
                  <Detail label={c.seniority} values={icp.seniority} />
                  <Detail label={c.regions} values={icp.regions} />
                  <Detail label={c.signals} values={icp.signals} />
                </dl>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={c.actions}
                    className="size-8 shrink-0"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!icp.primary && (
                    <DropdownMenuItem
                      onSelect={() => {
                        icpStore.setPrimary(icp.id)
                        toast.success(c.primarySet)
                      }}
                    >
                      <Star className="size-4" />
                      {c.setPrimary}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={() => openEdit(icp)}>
                    <Pencil className="size-4" />
                    {c.edit}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={icps.length <= 1}
                    onSelect={() => setDeleting(icp)}
                  >
                    <Trash2 className="size-4" />
                    {c.delete}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </CardContent>

      <IcpFormDialog
        key={editing?.id ?? "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        icp={editing}
        c={c}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(undefined)
        }}
        title={c.deleteTitle}
        description={deleting ? c.deleteDesc(deleting.name) : undefined}
        confirmLabel={c.deleteConfirm}
        destructive
        onConfirm={() => {
          if (!deleting) return
          icpStore.remove(deleting.id)
          toast.success(c.deleted)
          setDeleting(undefined)
        }}
      />
    </Card>
  )
}

function Detail({ label, values }: { label: string; values: string[] }) {
  const shown = values.filter(Boolean)
  if (shown.length === 0) return null
  return (
    <div className="flex gap-2 text-xs">
      <dt className="text-muted-foreground w-20 shrink-0">{label}</dt>
      <dd className="flex flex-wrap gap-1">
        {shown.map((v) => (
          <Badge key={v} variant="secondary" className="font-normal">
            {v}
          </Badge>
        ))}
      </dd>
    </div>
  )
}

type Copy = (typeof COPY)[keyof typeof COPY]

function IcpFormDialog({
  open,
  onOpenChange,
  icp,
  c,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  icp?: Icp
  c: Copy
}) {
  const [name, setName] = React.useState(icp?.name ?? "")
  const [color, setColor] = React.useState(icp?.color ?? COLORS[0])
  const [titles, setTitles] = React.useState((icp?.titles ?? []).join(", "))
  const [decisionMakers, setDecisionMakers] = React.useState<string[]>(
    icp?.decisionMakers ?? []
  )
  const [influencers, setInfluencers] = React.useState<string[]>(
    icp?.influencers ?? []
  )
  const [industries, setIndustries] = React.useState(
    (icp?.industries ?? []).join(", ")
  )
  const [headcount, setHeadcount] = React.useState(icp?.headcount ?? "")
  const [seniority, setSeniority] = React.useState(
    (icp?.seniority ?? []).join(", ")
  )
  const [regions, setRegions] = React.useState((icp?.regions ?? []).join(", "))
  const [signals, setSignals] = React.useState((icp?.signals ?? []).join(", "))

  function toList(value: string): string[] {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
  }

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error(c.nameRequired)
      return
    }
    const payload = {
      name: trimmed,
      color,
      titles: toList(titles),
      decisionMakers,
      influencers,
      industries: toList(industries),
      headcount: headcount.trim(),
      seniority: toList(seniority),
      regions: toList(regions),
      signals: toList(signals),
    }
    if (icp) {
      icpStore.update(icp.id, payload)
      toast.success(c.updated)
    } else {
      icpStore.create(payload)
      toast.success(c.created)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{icp ? c.editTitle : c.newTitle}</DialogTitle>
          <DialogDescription>{c.formDesc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="icp-name">{c.name}</Label>
            <Input
              id="icp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={c.namePlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label>{c.color}</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  aria-label={swatch}
                  onClick={() => setColor(swatch)}
                  className={cn(
                    "size-7 rounded-full border-2 transition-transform",
                    color === swatch
                      ? "border-foreground scale-110"
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: swatch }}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TagInput
              label={c.decisionMakers}
              placeholder={c.decisionMakersPlaceholder}
              values={decisionMakers}
              onChange={setDecisionMakers}
              suggestions={DECISION_MAKER_SUGGESTIONS}
              suggestingLabel={c.findingSimilarDecisionMakers}
              clearAllLabel={c.clearAll}
              removeLabel={c.removeValue}
              viewMoreLabel={c.viewMore}
            />
            <TagInput
              label={c.influencers}
              placeholder={c.influencersPlaceholder}
              values={influencers}
              onChange={setInfluencers}
              suggestions={INFLUENCER_SUGGESTIONS}
              suggestingLabel={c.findingSimilarInfluencers}
              clearAllLabel={c.clearAll}
              removeLabel={c.removeValue}
              viewMoreLabel={c.viewMore}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Labelled id="icp-titles" label={c.titles} value={titles} onChange={setTitles} />
            <Labelled
              id="icp-industries"
              label={c.industries}
              value={industries}
              onChange={setIndustries}
            />
            <Labelled
              id="icp-headcount"
              label={c.headcount}
              value={headcount}
              onChange={setHeadcount}
            />
            <Labelled
              id="icp-seniority"
              label={c.seniority}
              value={seniority}
              onChange={setSeniority}
            />
            <Labelled
              id="icp-regions"
              label={c.regions}
              value={regions}
              onChange={setRegions}
            />
            <Labelled
              id="icp-signals"
              label={c.signals}
              value={signals}
              onChange={setSignals}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="volt" onClick={handleSave}>
            {c.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Labelled({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
