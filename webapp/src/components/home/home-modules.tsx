/* eslint-disable react-refresh/only-export-components --
   Registry file: the small module cards are intentionally colocated with their
   metadata (HOME_MODULES). Fast-refresh of these cards isn't needed. */
import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Sparkles,
  History,
  FolderKanban,
  Rocket,
  Users,
  ArrowRight,
  Building2,
  Radar,
  Coins,
  UserPlus,
  Briefcase,
  Cpu,
  Globe,
  TrendingUp,
  Tags,
  Trophy,
  Share2,
} from "lucide-react"

import { useLocale, type Locale } from "@/lib/locale"
import { Badge } from "@/components/ui/badge"
import { libraryQueries } from "@/lib/mock-library"
import {
  useSavedSearches,
  searchLeads,
  searchCompanies,
  EMPTY_QUERY,
  SIGNAL_OPTIONS,
} from "@/lib/mock-ai-search"
import { useLists, useProspects } from "@/lib/store"
import { useSetup } from "@/lib/setup"

/**
 * A Home module is a self-contained card body. The surrounding Card + icon/title
 * header is rendered by `HomeModules`, so each `Component` renders only its inner
 * content (a short list / empty state). Modules read their own data via hooks.
 *
 * Adding or removing a module is intentionally trivial: append/remove an entry
 * in `HOME_MODULES`. The layout store prunes ids that disappear and surfaces
 * newly-added ones, so saved layouts keep working as this list grows.
 */
export interface HomeModuleDef {
  id: string
  title: Record<Locale, string>
  icon: React.ComponentType<{ className?: string }>
  defaultOn: boolean
  Component: React.ComponentType
  // Spans 2 grid rows in the sm:2-col layout — used by the Signals module so
  // it sits beside two stacked single-row cards (Suggested prospects/companies).
  rowSpan?: 2
}

// Shared micro-copy for empty states — keeps each module body tiny.
const COPY = {
  en: {
    empty: "Nothing here yet.",
    noRecent: "Your recent searches will show up here.",
    noLists: "Create a list to see it here.",
    noProspects: "Prospects you add will show up here.",
    noSuggestedProspects: "No matching prospects right now.",
    noSuggestedCompanies: "No matching companies right now.",
    setupProgress: (n: number) => `${n}% complete`,
    continueSetup: "Continue setup",
    count: (n: number) => `${n} ${n === 1 ? "record" : "records"}`,
    comingSoon: "Coming soon",
  },
  es: {
    empty: "Aún no hay nada aquí.",
    noRecent: "Tus búsquedas recientes aparecerán aquí.",
    noLists: "Crea una lista para verla aquí.",
    noProspects: "Los prospectos que añadas aparecerán aquí.",
    noSuggestedProspects: "No hay prospectos coincidentes por ahora.",
    noSuggestedCompanies: "No hay empresas coincidentes por ahora.",
    setupProgress: (n: number) => `${n}% completado`,
    continueSetup: "Continuar configuración",
    count: (n: number) => `${n} ${n === 1 ? "registro" : "registros"}`,
    comingSoon: "Próximamente",
  },
  it: {
    empty: "Non c'è ancora niente qui.",
    noRecent: "Le tue ricerche recenti appariranno qui.",
    noLists: "Crea una lista per vederla qui.",
    noProspects: "I prospect che aggiungi appariranno qui.",
    noSuggestedProspects: "Nessun prospect corrispondente al momento.",
    noSuggestedCompanies: "Nessuna azienda corrispondente al momento.",
    setupProgress: (n: number) => `${n}% completato`,
    continueSetup: "Continua la configurazione",
    count: (n: number) => `${n} record`,
    comingSoon: "In arrivo",
  },
  fr: {
    empty: "Rien ici pour l'instant.",
    noRecent: "Vos recherches récentes apparaîtront ici.",
    noLists: "Créez une liste pour la voir ici.",
    noProspects: "Les prospects que vous ajoutez apparaîtront ici.",
    noSuggestedProspects: "Aucun prospect correspondant pour le moment.",
    noSuggestedCompanies: "Aucune entreprise correspondante pour le moment.",
    setupProgress: (n: number) => `${n}% terminé`,
    continueSetup: "Poursuivre la configuration",
    count: (n: number) => `${n} ${n === 1 ? "enregistrement" : "enregistrements"}`,
    comingSoon: "Bientôt disponible",
  },
  de: {
    empty: "Hier ist noch nichts.",
    noRecent: "Deine letzten Suchen erscheinen hier.",
    noLists: "Erstelle eine Liste, um sie hier zu sehen.",
    noProspects: "Prospects, die du hinzufügst, erscheinen hier.",
    noSuggestedProspects: "Gerade keine passenden Prospects.",
    noSuggestedCompanies: "Gerade keine passenden Unternehmen.",
    setupProgress: (n: number) => `${n}% abgeschlossen`,
    continueSetup: "Einrichtung fortsetzen",
    count: (n: number) => `${n} ${n === 1 ? "Datensatz" : "Datensätze"}`,
    comingSoon: "Bald verfügbar",
  },
  pt: {
    empty: "Ainda não há nada aqui.",
    noRecent: "As suas pesquisas recentes vão aparecer aqui.",
    noLists: "Crie uma lista para a ver aqui.",
    noProspects: "Os prospects que adicionar vão aparecer aqui.",
    noSuggestedProspects: "Sem prospects correspondentes por agora.",
    noSuggestedCompanies: "Sem empresas correspondentes por agora.",
    setupProgress: (n: number) => `${n}% concluído`,
    continueSetup: "Continuar a configuração",
    count: (n: number) => `${n} ${n === 1 ? "registo" : "registos"}`,
    comingSoon: "Brevemente",
  },
  pt_BR: {
    empty: "Ainda não há nada aqui.",
    noRecent: "Suas buscas recentes vão aparecer aqui.",
    noLists: "Crie uma lista para vê-la aqui.",
    noProspects: "Os prospects que você adicionar vão aparecer aqui.",
    noSuggestedProspects: "Sem prospects correspondentes no momento.",
    noSuggestedCompanies: "Sem empresas correspondentes no momento.",
    setupProgress: (n: number) => `${n}% concluído`,
    continueSetup: "Continuar a configuração",
    count: (n: number) => `${n} ${n === 1 ? "registro" : "registros"}`,
    comingSoon: "Em breve",
  },
} as const

// Intent-signal search shortcuts — one entry per real SIGNAL_OPTIONS value, so
// every tile is backed by an actual filter that returns real (mock) matches,
// not a dead link. Framed as "Find leads at companies that…" (Artisan.co's own
// phrasing) — including "leads" keeps interpretPrompt's entity guess on
// people even though the sentence also says "companies".
const SIGNAL_TILES: Record<
  string,
  {
    title: Record<Locale, string>
    desc: Record<Locale, string>
    prompt: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  "Recently funded": {
    title: {
      en: "Funding announcement",
      es: "Anuncio de financiación",
      it: "Annuncio di finanziamento",
      fr: "Annonce de financement",
      de: "Neue Finanzierungsrunde",
      pt: "Anúncio de financiamento",
      pt_BR: "Anúncio de investimento",
    },
    desc: {
      en: "Companies that recently raised a funding round.",
      es: "Empresas que acaban de levantar financiación.",
      it: "Aziende che hanno appena raccolto un round di finanziamento.",
      fr: "Entreprises qui viennent de lever des fonds.",
      de: "Unternehmen, die gerade eine Finanzierungsrunde abgeschlossen haben.",
      pt: "Empresas que acabaram de angariar uma ronda de financiamento.",
      pt_BR: "Empresas que acabaram de captar uma rodada de investimento.",
    },
    prompt: "Find leads at companies that recently raised a funding round",
    icon: Coins,
  },
  "New exec hire": {
    title: {
      en: "New leadership hire",
      es: "Nueva contratación de liderazgo",
      it: "Nuova assunzione dirigenziale",
      fr: "Nouveau dirigeant recruté",
      de: "Neue Führungskraft",
      pt: "Nova contratação de liderança",
      pt_BR: "Nova contratação de liderança",
    },
    desc: {
      en: "Companies that just hired a new senior leader.",
      es: "Empresas que acaban de contratar a un nuevo líder.",
      it: "Aziende che hanno appena assunto un nuovo senior leader.",
      fr: "Entreprises qui viennent de recruter un dirigeant senior.",
      de: "Unternehmen, die gerade eine neue Führungskraft eingestellt haben.",
      pt: "Empresas que acabaram de contratar um novo líder sénior.",
      pt_BR: "Empresas que acabaram de contratar um novo líder sênior.",
    },
    prompt: "Find leads at companies that just hired a new senior leader",
    icon: UserPlus,
  },
  "Hiring sales": {
    title: {
      en: "Actively hiring for sales",
      es: "Contratando para ventas",
      it: "Assunzioni attive nelle vendite",
      fr: "Recrutement commercial actif",
      de: "Stellt aktiv im Vertrieb ein",
      pt: "A contratar para vendas",
      pt_BR: "Contratando para vendas",
    },
    desc: {
      en: "Companies actively hiring for sales roles.",
      es: "Empresas contratando activamente para roles de ventas.",
      it: "Aziende che assumono attivamente per ruoli di vendita.",
      fr: "Entreprises qui recrutent activement des profils commerciaux.",
      de: "Unternehmen, die aktiv Vertriebsrollen besetzen.",
      pt: "Empresas a contratar ativamente para funções de vendas.",
      pt_BR: "Empresas contratando ativamente para cargos de vendas.",
    },
    prompt: "Find leads at companies actively hiring for sales roles",
    icon: Briefcase,
  },
  "Adopting AI": {
    title: {
      en: "Adopting AI tools",
      es: "Adoptando herramientas de IA",
      it: "Adozione di strumenti IA",
      fr: "Adoption d'outils IA",
      de: "Führt KI-Tools ein",
      pt: "A adotar ferramentas de IA",
      pt_BR: "Adotando ferramentas de IA",
    },
    desc: {
      en: "Companies adopting AI in their tech stack.",
      es: "Empresas que adoptan IA en su stack tecnológico.",
      it: "Aziende che adottano l'IA nel loro stack tecnologico.",
      fr: "Entreprises qui adoptent l'IA dans leur stack technique.",
      de: "Unternehmen, die KI in ihren Tech-Stack integrieren.",
      pt: "Empresas a adotar IA no seu stack tecnológico.",
      pt_BR: "Empresas adotando IA em seu stack de tecnologia.",
    },
    prompt: "Find leads at companies adopting AI tools in their tech stack",
    icon: Cpu,
  },
  "Expanding to EMEA": {
    title: {
      en: "Expanding to EMEA",
      es: "Expandiéndose a EMEA",
      it: "Espansione in EMEA",
      fr: "Expansion en EMEA",
      de: "Expansion nach EMEA",
      pt: "Expansão para a EMEA",
      pt_BR: "Expansão para a EMEA",
    },
    desc: {
      en: "Companies expanding their footprint into EMEA.",
      es: "Empresas que se expanden a EMEA.",
      it: "Aziende che stanno espandendo la loro presenza in EMEA.",
      fr: "Entreprises qui étendent leur présence en EMEA.",
      de: "Unternehmen, die nach EMEA expandieren.",
      pt: "Empresas a expandir a sua presença na EMEA.",
      pt_BR: "Empresas expandindo sua presença na EMEA.",
    },
    prompt: "Find leads at companies expanding their footprint into EMEA",
    icon: Globe,
  },
  "High web intent": {
    title: {
      en: "High web intent",
      es: "Alta intención web",
      it: "Alto intent web",
      fr: "Forte intention web",
      de: "Hoher Web-Intent",
      pt: "Alta intenção web",
      pt_BR: "Alta intenção na web",
    },
    desc: {
      en: "Companies showing high website buying intent.",
      es: "Empresas con alta intención de compra en su web.",
      it: "Aziende con alto intent di acquisto sul sito web.",
      fr: "Entreprises montrant une forte intention d'achat sur le web.",
      de: "Unternehmen mit hoher Kaufabsicht auf der Website.",
      pt: "Empresas com alta intenção de compra no site.",
      pt_BR: "Empresas com alta intenção de compra no site.",
    },
    prompt: "Find leads at companies showing high website buying intent",
    icon: TrendingUp,
  },
}

// Placeholder tiles for signal types we don't have data for yet — matches the
// "Coming soon" cards on Artisan.co's own signals page.
const COMING_SOON_SIGNALS: {
  title: Record<Locale, string>
  desc: Record<Locale, string>
  icon: React.ComponentType<{ className?: string }>
}[] = [
  {
    title: {
      en: "Topic intent",
      es: "Intención por tema",
      it: "Intent per argomento",
      fr: "Intention thématique",
      de: "Themen-Intent",
      pt: "Intenção por tema",
      pt_BR: "Intenção por tema",
    },
    desc: {
      en: "Detect when a company researches topics relevant to your product.",
      es: "Detecta cuándo una empresa investiga temas relevantes para tu producto.",
      it: "Rileva quando un'azienda ricerca argomenti rilevanti per il tuo prodotto.",
      fr: "Détectez quand une entreprise recherche des sujets pertinents pour votre produit.",
      de: "Erkenne, wenn ein Unternehmen nach Themen sucht, die für dein Produkt relevant sind.",
      pt: "Descubra quando uma empresa pesquisa temas relevantes para o seu produto.",
      pt_BR: "Descubra quando uma empresa pesquisa temas relevantes para o seu produto.",
    },
    icon: Tags,
  },
  {
    title: {
      en: "Champion tracking",
      es: "Seguimiento de champions",
      it: "Monitoraggio dei champion",
      fr: "Suivi des champions",
      de: "Champion-Tracking",
      pt: "Acompanhamento de champions",
      pt_BR: "Acompanhamento de champions",
    },
    desc: {
      en: "Track champions and reach out when they land at a new company.",
      es: "Sigue a tus champions y contáctalos al llegar a una nueva empresa.",
      it: "Tieni traccia dei champion e contattali quando arrivano in una nuova azienda.",
      fr: "Suivez vos champions et contactez-les lorsqu'ils rejoignent une nouvelle entreprise.",
      de: "Verfolge deine Champions und melde dich, wenn sie zu einem neuen Unternehmen wechseln.",
      pt: "Acompanhe os seus champions e contacte-os quando chegarem a uma nova empresa.",
      pt_BR: "Acompanhe seus champions e entre em contato quando eles chegarem a uma nova empresa.",
    },
    icon: Trophy,
  },
  {
    title: {
      en: "Social post tracking",
      es: "Seguimiento en redes sociales",
      it: "Monitoraggio dei post social",
      fr: "Suivi des publications sociales",
      de: "Social-Media-Tracking",
      pt: "Monitorização de publicações nas redes sociais",
      pt_BR: "Monitoramento de publicações nas redes sociais",
    },
    desc: {
      en: "Monitor social posts to catch high-intent prospects.",
      es: "Monitoriza publicaciones sociales para detectar prospectos de alta intención.",
      it: "Monitora i post social per intercettare prospect ad alta intenzione d'acquisto.",
      fr: "Surveillez les publications sociales pour repérer les prospects à forte intention d'achat.",
      de: "Behalte Social-Media-Beiträge im Blick, um Prospects mit hoher Kaufabsicht zu erkennen.",
      pt: "Monitorize publicações nas redes sociais para identificar prospects com alta intenção de compra.",
      pt_BR: "Monitore publicações nas redes sociais para identificar prospects com alta intenção de compra.",
    },
    icon: Share2,
  },
]

// Shared row button styles so every module list reads consistently.
const ROW =
  "hover:bg-muted/60 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors"
const EMPTY = "text-muted-foreground px-2 py-1.5 text-sm"

// A lead/company's own top matching signal decides which canned search its
// row deep-links to — clicking "more like this" continues from what made it
// a suggestion in the first place.
function topSignalTile(signals: string[]) {
  const key = signals.find((s) => s in SIGNAL_TILES)
  return key ? SIGNAL_TILES[key] : undefined
}

function SuggestedProspectsModule() {
  const { locale } = useLocale()
  const t = COPY[locale]
  const navigate = useNavigate()
  const leads = React.useMemo(
    () => searchLeads({ ...EMPTY_QUERY, signals: SIGNAL_OPTIONS }).slice(0, 5),
    []
  )
  if (leads.length === 0) return <p className={EMPTY}>{t.noSuggestedProspects}</p>
  return (
    <div className="space-y-0.5">
      {leads.map((l) => {
        const tile = topSignalTile(l.signals)
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => tile && navigate(`/search?q=${encodeURIComponent(tile.prompt)}`)}
            className={ROW}
          >
            <span
              className="flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
              style={{ backgroundColor: l.avatarColor }}
            >
              {l.firstName.charAt(0)}
              {l.lastName.charAt(0)}
            </span>
            <span className="min-w-0 flex-1 truncate">
              {l.firstName} {l.lastName}
            </span>
            <span className="text-muted-foreground shrink-0 truncate text-xs">
              {l.company}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function SuggestedCompaniesModule() {
  const { locale } = useLocale()
  const t = COPY[locale]
  const navigate = useNavigate()
  const companies = React.useMemo(
    () => searchCompanies({ ...EMPTY_QUERY, signals: SIGNAL_OPTIONS }).slice(0, 5),
    []
  )
  if (companies.length === 0) return <p className={EMPTY}>{t.noSuggestedCompanies}</p>
  return (
    <div className="space-y-0.5">
      {companies.map((co) => {
        const tile = topSignalTile(co.signals)
        return (
          <button
            key={co.id}
            type="button"
            onClick={() => tile && navigate(`/search?q=${encodeURIComponent(tile.prompt)}`)}
            className={ROW}
          >
            <span
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold text-white"
              style={{ backgroundColor: co.logoColor }}
            >
              {co.name.slice(0, 2)}
            </span>
            <span className="min-w-0 flex-1 truncate">{co.name}</span>
            <span className="text-muted-foreground shrink-0 truncate text-xs">
              {co.industry}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function SignalsGridModule() {
  const { locale } = useLocale()
  const t = COPY[locale]
  const navigate = useNavigate()
  return (
    <div className="grid grid-cols-3 gap-2">
      {SIGNAL_OPTIONS.map((key) => {
        const tile = SIGNAL_TILES[key]
        const Icon = tile.icon
        return (
          <button
            key={key}
            type="button"
            onClick={() => navigate(`/search?q=${encodeURIComponent(tile.prompt)}`)}
            title={tile.desc[locale]}
            className="hover:border-primary/40 hover:bg-muted/40 flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-colors"
          >
            <Icon className="text-primary size-4" />
            <span className="text-xs leading-snug font-medium">{tile.title[locale]}</span>
          </button>
        )
      })}
      {COMING_SOON_SIGNALS.map((s) => {
        const Icon = s.icon
        return (
          <div
            key={s.title.en}
            title={s.desc[locale]}
            className="text-muted-foreground/80 flex flex-col items-start gap-1 rounded-lg border border-dashed p-2.5"
          >
            <Icon className="size-4" />
            <span className="text-xs leading-snug font-medium">{s.title[locale]}</span>
            <Badge variant="secondary" className="text-[9px]">
              {t.comingSoon}
            </Badge>
          </div>
        )
      })}
    </div>
  )
}

function RecommendedModule() {
  const navigate = useNavigate()
  return (
    <div className="space-y-0.5">
      {libraryQueries.slice(0, 4).map((q) => (
        <button
          key={q.id}
          type="button"
          onClick={() =>
            navigate(`/search?q=${encodeURIComponent(q.prompt)}`)
          }
          className={ROW}
        >
          <Sparkles className="text-muted-foreground size-3.5 shrink-0" />
          <span className="truncate">{q.name}</span>
        </button>
      ))}
    </div>
  )
}

function RecentSearchesModule() {
  const { locale } = useLocale()
  const t = COPY[locale]
  const navigate = useNavigate()
  const saved = useSavedSearches()
  const recent = React.useMemo(
    () =>
      [...saved]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 4),
    [saved]
  )
  if (recent.length === 0) return <p className={EMPTY}>{t.noRecent}</p>
  return (
    <div className="space-y-0.5">
      {recent.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() =>
            navigate("/search", { state: { loadSearchId: s.id } })
          }
          className={ROW}
        >
          <History className="text-muted-foreground size-3.5 shrink-0" />
          <span className="truncate">{s.name}</span>
        </button>
      ))}
    </div>
  )
}

function ListsModule() {
  const { locale } = useLocale()
  const t = COPY[locale]
  const lists = useLists()
  if (lists.length === 0) return <p className={EMPTY}>{t.noLists}</p>
  return (
    <div className="space-y-0.5">
      {lists.slice(0, 5).map((l) => {
        const count =
          l.kind === "company"
            ? l.accountIds?.length ?? 0
            : l.prospectIds.length
        return (
          <Link key={l.id} to={`/lists/${l.id}`} className={ROW}>
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: l.color }}
            />
            <span className="truncate">{l.name}</span>
            <Badge variant="secondary" className="ml-auto shrink-0">
              {count}
            </Badge>
          </Link>
        )
      })}
    </div>
  )
}

function GetStartedModule() {
  const { locale } = useLocale()
  const t = COPY[locale]
  const { progress } = useSetup()
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t.setupProgress(progress)}</span>
        <span className="font-medium">{progress}%</span>
      </div>
      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <Link
        to="/get-started"
        className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
      >
        {t.continueSetup}
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  )
}

function RecentProspectsModule() {
  const { locale } = useLocale()
  const t = COPY[locale]
  const prospects = useProspects()
  const recent = React.useMemo(
    () =>
      [...prospects]
        .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
        .slice(0, 5),
    [prospects]
  )
  if (recent.length === 0) return <p className={EMPTY}>{t.noProspects}</p>
  return (
    <div className="space-y-0.5">
      {recent.map((p) => (
        <Link key={p.id} to={`/prospects/${p.id}`} className={ROW}>
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
            style={{ backgroundColor: p.avatarColor }}
          >
            {p.firstName.charAt(0)}
            {p.lastName.charAt(0)}
          </span>
          <span className="min-w-0 flex-1 truncate">
            {p.firstName} {p.lastName}
          </span>
          <span className="text-muted-foreground shrink-0 truncate text-xs">
            {p.company}
          </span>
        </Link>
      ))}
    </div>
  )
}

export const HOME_MODULES: HomeModuleDef[] = [
  // Default layout (2 columns): Suggested prospects + Suggested companies
  // stacked on the left, Signals spanning both rows on the right — order here
  // drives CSS grid auto-placement in HomeModules.tsx, so keep this sequence.
  {
    id: "suggested-prospects",
    title: {
      en: "Suggested prospects",
      es: "Prospectos sugeridos",
      it: "Prospect suggeriti",
      fr: "Prospects suggérés",
      de: "Vorgeschlagene Prospects",
      pt: "Prospects sugeridos",
      pt_BR: "Prospects sugeridos",
    },
    icon: Users,
    defaultOn: true,
    Component: SuggestedProspectsModule,
  },
  {
    id: "signals",
    title: {
      en: "Signals",
      es: "Señales",
      it: "Segnali",
      fr: "Signaux",
      de: "Signale",
      pt: "Sinais",
      pt_BR: "Sinais",
    },
    icon: Radar,
    defaultOn: true,
    rowSpan: 2,
    Component: SignalsGridModule,
  },
  {
    id: "suggested-companies",
    title: {
      en: "Suggested companies",
      es: "Empresas sugeridas",
      it: "Aziende suggerite",
      fr: "Entreprises suggérées",
      de: "Vorgeschlagene Unternehmen",
      pt: "Empresas sugeridas",
      pt_BR: "Empresas sugeridas",
    },
    icon: Building2,
    defaultOn: true,
    Component: SuggestedCompaniesModule,
  },
  {
    id: "recommended",
    title: {
      en: "Recommended searches",
      es: "Búsquedas recomendadas",
      it: "Ricerche consigliate",
      fr: "Recherches recommandées",
      de: "Empfohlene Suchen",
      pt: "Pesquisas recomendadas",
      pt_BR: "Buscas recomendadas",
    },
    icon: Sparkles,
    defaultOn: false,
    Component: RecommendedModule,
  },
  {
    id: "recent-searches",
    title: {
      en: "Recent searches",
      es: "Búsquedas recientes",
      it: "Ricerche recenti",
      fr: "Recherches récentes",
      de: "Letzte Suchen",
      pt: "Pesquisas recentes",
      pt_BR: "Buscas recentes",
    },
    icon: History,
    defaultOn: false,
    Component: RecentSearchesModule,
  },
  {
    id: "lists",
    title: {
      en: "Your lists",
      es: "Tus listas",
      it: "Le tue liste",
      fr: "Vos listes",
      de: "Deine Listen",
      pt: "As suas listas",
      pt_BR: "Suas listas",
    },
    icon: FolderKanban,
    defaultOn: false,
    Component: ListsModule,
  },
  {
    id: "get-started",
    title: {
      en: "Get started",
      es: "Empezar",
      it: "Inizia",
      fr: "Commencer",
      de: "Loslegen",
      pt: "Começar",
      pt_BR: "Começar",
    },
    icon: Rocket,
    defaultOn: false,
    Component: GetStartedModule,
  },
  {
    id: "recent-prospects",
    title: {
      en: "Recent prospects",
      es: "Prospectos recientes",
      it: "Prospect recenti",
      fr: "Prospects récents",
      de: "Letzte Prospects",
      pt: "Prospects recentes",
      pt_BR: "Prospects recentes",
    },
    icon: Users,
    defaultOn: false,
    Component: RecentProspectsModule,
  },
]
