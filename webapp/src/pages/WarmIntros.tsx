import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Users, GraduationCap, Briefcase, Waypoints } from "lucide-react"

import { useLocale } from "@/lib/locale"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ProspectAvatar, ScoreBadge } from "@/components/common/ProspectBits"
import { EmptyState } from "@/components/common/EmptyState"
import kaiUrl from "@/assets/kai-pleased.png"
import { LinkedinIcon } from "@/components/icons/BrandIcons"
import {
  introPaths,
  getIntroPaths,
  type IntroPath,
  type IntroStrength,
} from "@/lib/mock-network"
import { getProspect } from "@/lib/mock-data"
import { initials } from "@/lib/format"
import type { Prospect } from "@/lib/types"

const STRENGTH_ORDER: Record<IntroStrength, number> = {
  strong: 0,
  medium: 1,
  weak: 2,
}

const STRENGTH_VARIANT: Record<
  IntroStrength,
  "success" | "secondary" | "outline"
> = {
  strong: "success",
  medium: "secondary",
  weak: "outline",
}

const SOURCE_ICON: Record<
  IntroPath["source"],
  React.ComponentType<{ className?: string }>
> = {
  team: Users,
  linkedin: LinkedinIcon,
  alumni: GraduationCap,
  investor: Briefcase,
}

const COPY = {
  en: {
    title: "Warm Intros",
    description: "The warmest path to your top prospects.",
    howItWorks: "How it works",
    howItWorksToast:
      "We scan your team's relationships, LinkedIn, alumni, and investor networks to surface the warmest path to each prospect.",
    introTitle: "Get introduced — don't cold-call",
    introDescription:
      "Find the warmest path into an account through your team's combined network.",
    introPoints: [
      "See who on your team already knows a prospect",
      "Paths ranked by relationship strength",
      "Request an intro in one click",
    ],
    summaryIntroPaths: "Intro paths",
    summaryStrongPaths: "Strong paths",
    summaryReachable: "Prospects reachable",
    emptyState:
      "No warm intro paths yet. Connect your team and networks to find one.",
    sourceTeam: "Teammate",
    sourceLinkedin: "LinkedIn",
    sourceAlumni: "Alumni",
    sourceInvestor: "Investor",
    strengthStrong: "Strong",
    strengthMedium: "Medium",
    strengthWeak: "Weak",
    ask: (name: string) => `Ask ${name}`,
    requestIntro: "Request intro",
    introRequested: (name: string) => `Intro requested via ${name}`,
  },
  es: {
    title: "Presentaciones",
    description: "El camino más cálido hacia tus mejores prospectos.",
    howItWorks: "Cómo funciona",
    howItWorksToast:
      "Analizamos las relaciones de tu equipo, LinkedIn, exalumnos y redes de inversores para mostrar el camino más cálido hacia cada prospecto.",
    introTitle: "Consigue una presentación — no llames en frío",
    introDescription:
      "Encuentra el camino más cálido hacia una cuenta a través de la red combinada de tu equipo.",
    introPoints: [
      "Descubre quién en tu equipo ya conoce a un prospecto",
      "Caminos ordenados por la fuerza de la relación",
      "Solicita una presentación con un clic",
    ],
    summaryIntroPaths: "Caminos de presentación",
    summaryStrongPaths: "Caminos fuertes",
    summaryReachable: "Prospectos alcanzables",
    emptyState:
      "Aún no hay caminos de presentación cálidos. Conecta tu equipo y redes para encontrar uno.",
    sourceTeam: "Compañero",
    sourceLinkedin: "LinkedIn",
    sourceAlumni: "Exalumnos",
    sourceInvestor: "Inversor",
    strengthStrong: "Fuerte",
    strengthMedium: "Media",
    strengthWeak: "Débil",
    ask: (name: string) => `Pedir a ${name}`,
    requestIntro: "Solicitar presentación",
    introRequested: (name: string) => `Presentación solicitada a través de ${name}`,
  },
  it: {
    title: "Presentazioni",
    description: "Il percorso più caldo verso i tuoi prospect migliori.",
    howItWorks: "Come funziona",
    howItWorksToast:
      "Analizziamo le relazioni del tuo team, LinkedIn, la rete alumni e le reti di investitori per individuare il percorso più caldo verso ogni prospect.",
    introTitle: "Fatti presentare — non chiamare a freddo",
    introDescription:
      "Trova il percorso più caldo per entrare in un account grazie alla rete combinata del tuo team.",
    introPoints: [
      "Scopri chi nel tuo team conosce già un prospect",
      "Percorsi ordinati in base alla forza della relazione",
      "Richiedi una presentazione con un clic",
    ],
    summaryIntroPaths: "Percorsi di presentazione",
    summaryStrongPaths: "Percorsi forti",
    summaryReachable: "Prospect raggiungibili",
    emptyState:
      "Ancora nessun percorso di presentazione. Collega il tuo team e le tue reti per trovarne uno.",
    sourceTeam: "Collega",
    sourceLinkedin: "LinkedIn",
    sourceAlumni: "Alumni",
    sourceInvestor: "Investitore",
    strengthStrong: "Forte",
    strengthMedium: "Media",
    strengthWeak: "Debole",
    ask: (name: string) => `Chiedi a ${name}`,
    requestIntro: "Richiedi presentazione",
    introRequested: (name: string) => `Presentazione richiesta tramite ${name}`,
  },
  fr: {
    title: "Introductions",
    description: "Le chemin le plus chaleureux vers vos meilleurs prospects.",
    howItWorks: "Comment ça marche",
    howItWorksToast:
      "Nous analysons les relations de votre équipe, LinkedIn, le réseau des anciens et les réseaux d'investisseurs pour révéler le chemin le plus chaleureux vers chaque prospect.",
    introTitle: "Obtenez une présentation — pas de démarchage à froid",
    introDescription:
      "Trouvez le chemin le plus chaleureux vers un compte grâce au réseau combiné de votre équipe.",
    introPoints: [
      "Découvrez qui dans votre équipe connaît déjà un prospect",
      "Chemins classés par force de la relation",
      "Demandez une présentation en un clic",
    ],
    summaryIntroPaths: "Chemins de présentation",
    summaryStrongPaths: "Chemins solides",
    summaryReachable: "Prospects accessibles",
    emptyState:
      "Aucun chemin de présentation pour le moment. Connectez votre équipe et vos réseaux pour en trouver un.",
    sourceTeam: "Coéquipier",
    sourceLinkedin: "LinkedIn",
    sourceAlumni: "Anciens",
    sourceInvestor: "Investisseur",
    strengthStrong: "Forte",
    strengthMedium: "Moyenne",
    strengthWeak: "Faible",
    ask: (name: string) => `Demander à ${name}`,
    requestIntro: "Demander une présentation",
    introRequested: (name: string) => `Présentation demandée via ${name}`,
  },
  de: {
    title: "Warme Intros",
    description: "Der wärmste Weg zu deinen besten Prospects.",
    howItWorks: "So funktioniert's",
    howItWorksToast:
      "Wir analysieren die Beziehungen deines Teams, LinkedIn, Alumni- und Investorennetzwerke, um den wärmsten Weg zu jedem Prospect aufzuzeigen.",
    introTitle: "Lass dich vorstellen — keine Kaltakquise",
    introDescription:
      "Finde den wärmsten Weg in einen Account über das kombinierte Netzwerk deines Teams.",
    introPoints: [
      "Sieh, wer in deinem Team einen Prospect bereits kennt",
      "Wege nach Beziehungsstärke sortiert",
      "Fordere eine Vorstellung mit einem Klick an",
    ],
    summaryIntroPaths: "Vorstellungswege",
    summaryStrongPaths: "Starke Wege",
    summaryReachable: "Erreichbare Prospects",
    emptyState:
      "Noch keine Vorstellungswege. Verbinde dein Team und deine Netzwerke, um einen zu finden.",
    sourceTeam: "Teammitglied",
    sourceLinkedin: "LinkedIn",
    sourceAlumni: "Alumni",
    sourceInvestor: "Investor",
    strengthStrong: "Stark",
    strengthMedium: "Mittel",
    strengthWeak: "Schwach",
    ask: (name: string) => `Frag ${name}`,
    requestIntro: "Vorstellung anfragen",
    introRequested: (name: string) => `Vorstellung angefragt über ${name}`,
  },
  pt: {
    title: "Apresentações",
    description: "O caminho mais caloroso até aos seus melhores prospects.",
    howItWorks: "Como funciona",
    howItWorksToast:
      "Analisamos as relações da sua equipa, o LinkedIn, as redes de antigos alunos e de investidores para mostrar o caminho mais caloroso até cada prospect.",
    introTitle: "Consiga uma apresentação — nada de chamadas a frio",
    introDescription:
      "Encontre o caminho mais caloroso para uma conta através da rede combinada da sua equipa.",
    introPoints: [
      "Descubra quem na sua equipa já conhece um prospect",
      "Caminhos ordenados pela força da relação",
      "Peça uma apresentação com um clique",
    ],
    summaryIntroPaths: "Caminhos de apresentação",
    summaryStrongPaths: "Caminhos fortes",
    summaryReachable: "Prospects alcançáveis",
    emptyState:
      "Ainda não há caminhos de apresentação. Ligue a sua equipa e redes para encontrar um.",
    sourceTeam: "Colega de equipa",
    sourceLinkedin: "LinkedIn",
    sourceAlumni: "Antigos alunos",
    sourceInvestor: "Investidor",
    strengthStrong: "Forte",
    strengthMedium: "Média",
    strengthWeak: "Fraca",
    ask: (name: string) => `Pedir a ${name}`,
    requestIntro: "Pedir apresentação",
    introRequested: (name: string) => `Apresentação pedida através de ${name}`,
  },
  pt_BR: {
    title: "Apresentações",
    description: "O caminho mais caloroso até seus melhores prospects.",
    howItWorks: "Como funciona",
    howItWorksToast:
      "Analisamos as relações do seu time, o LinkedIn, as redes de ex-alunos e de investidores para mostrar o caminho mais caloroso até cada prospect.",
    introTitle: "Consiga uma apresentação — nada de ligações frias",
    introDescription:
      "Encontre o caminho mais caloroso para uma conta por meio da rede combinada do seu time.",
    introPoints: [
      "Descubra quem no seu time já conhece um prospect",
      "Caminhos ordenados pela força do relacionamento",
      "Peça uma apresentação com um clique",
    ],
    summaryIntroPaths: "Caminhos de apresentação",
    summaryStrongPaths: "Caminhos fortes",
    summaryReachable: "Prospects alcançáveis",
    emptyState:
      "Ainda não há caminhos de apresentação. Conecte seu time e suas redes para encontrar um.",
    sourceTeam: "Colega de time",
    sourceLinkedin: "LinkedIn",
    sourceAlumni: "Ex-alunos",
    sourceInvestor: "Investidor",
    strengthStrong: "Forte",
    strengthMedium: "Média",
    strengthWeak: "Fraca",
    ask: (name: string) => `Pedir a ${name}`,
    requestIntro: "Pedir apresentação",
    introRequested: (name: string) => `Apresentação solicitada por meio de ${name}`,
  },
} as const

/** Warm Intros content, embedded as a tab inside the People page. */
export function WarmIntrosPanel() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const strongPaths = React.useMemo(
    () => introPaths.filter((p) => p.strength === "strong").length,
    []
  )

  const reachableProspects = React.useMemo(
    () => new Set(introPaths.map((p) => p.prospectId)).size,
    []
  )

  const prospects = React.useMemo(() => {
    const ids = Array.from(new Set(introPaths.map((p) => p.prospectId)))
    const resolved = ids
      .map(getProspect)
      .filter((p): p is Prospect => Boolean(p))

    const bestStrength = (id: string): number => {
      const paths = getIntroPaths(id)
      return paths.length
        ? Math.min(...paths.map((path) => STRENGTH_ORDER[path.strength]))
        : STRENGTH_ORDER.weak + 1
    }

    return resolved.sort((a, b) => bestStrength(a.id) - bestStrength(b.id))
  }, [])

  return (
    <>
      <FeatureIntro
        featureKey="intros"
        icon={Waypoints}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        className="mb-6"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard label={c.summaryIntroPaths} value={introPaths.length} />
        <SummaryCard label={c.summaryStrongPaths} value={strongPaths} />
        <SummaryCard label={c.summaryReachable} value={reachableProspects} />
      </div>

      {prospects.length === 0 ? (
        <EmptyState
          icon={<img src={kaiUrl} alt="" className="size-16" />}
          description={c.emptyState}
        />
      ) : (
        <div className="space-y-4">
          {prospects.map((p) => (
            <ProspectIntroCard key={p.id} prospect={p} />
          ))}
        </div>
      )}
    </>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="gap-1 py-5">
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        <p className="text-muted-foreground text-sm">{label}</p>
      </CardContent>
    </Card>
  )
}

function ProspectIntroCard({ prospect: p }: { prospect: Prospect }) {
  const paths = getIntroPaths(p.id)

  return (
    <Card className="gap-4">
      <CardHeader>
        <Link
          to={`/prospects/${p.id}`}
          className="group flex items-center gap-3"
        >
          <ProspectAvatar prospect={p} className="size-10" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold group-hover:underline">
              {p.firstName} {p.lastName}
            </p>
            <p className="text-muted-foreground truncate text-sm">
              {p.title} · {p.company}
            </p>
          </div>
          <ScoreBadge score={p.score} />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {paths.map((path) => (
          <IntroPathRow key={path.id} path={path} />
        ))}
      </CardContent>
    </Card>
  )
}

function IntroPathRow({ path }: { path: IntroPath }) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const sourceLabels: Record<IntroPath["source"], string> = {
    team: c.sourceTeam,
    linkedin: c.sourceLinkedin,
    alumni: c.sourceAlumni,
    investor: c.sourceInvestor,
  }
  const strengthLabels: Record<IntroStrength, string> = {
    strong: c.strengthStrong,
    medium: c.strengthMedium,
    weak: c.strengthWeak,
  }
  const SourceIcon = SOURCE_ICON[path.source]
  const firstName = path.connectorName.split(" ")[0]
  const cta = path.connectorIsTeam ? c.ask(firstName) : c.requestIntro

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
      <Avatar className="size-9 shrink-0">
        <AvatarFallback
          style={{ backgroundColor: path.connectorAvatarColor, color: "white" }}
          className="text-xs font-medium"
        >
          {initials(firstName, path.connectorName.split(" ")[1])}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium">{path.connectorName}</span>
          <span className="text-muted-foreground text-xs">
            {path.connectorTitle}
          </span>
        </div>
        <p className="text-muted-foreground mt-0.5 text-sm">{path.via}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant={STRENGTH_VARIANT[path.strength]}>
            {strengthLabels[path.strength]}
          </Badge>
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <SourceIcon className="size-3.5" />
            {sourceLabels[path.source]}
          </span>
        </div>
      </div>

      <Button
        size="sm"
        variant={path.connectorIsTeam ? "default" : "outline"}
        className="shrink-0 sm:self-center"
        onClick={() => toast.success(c.introRequested(path.connectorName))}
      >
        {cta}
      </Button>
    </div>
  )
}
