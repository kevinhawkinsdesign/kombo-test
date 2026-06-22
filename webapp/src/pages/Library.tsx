import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  LibraryBig,
  Workflow,
  Mail,
  Search,
  Phone,
  Sparkles,
  MessageCircle,
  Clock,
  Plus,
  Users,
  Building2,
} from "lucide-react"

import { LinkedinIcon } from "@/components/icons/BrandIcons"
import { Page, PageHeading } from "@/components/layout/Page"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocale } from "@/lib/locale"
import { sequenceStore } from "@/lib/mock-sequences"
import { templateStore } from "@/lib/store"
import {
  librarySequences,
  libraryTemplates,
  libraryQueries,
  type LibrarySequence,
  type LibraryTemplate,
  type LibraryQuery,
} from "@/lib/mock-library"
import type { SequenceChannelType } from "@/lib/types"

const STEP_ICON: Record<
  SequenceChannelType,
  { icon: React.ComponentType<{ className?: string }>; tint: string }
> = {
  email: { icon: Mail, tint: "bg-primary/15 text-primary" },
  linkedin: { icon: LinkedinIcon, tint: "bg-[#0a66c2]/15 text-[#0a66c2]" },
  call: { icon: Phone, tint: "bg-chart-4/15 text-chart-4" },
  ai_call: { icon: Sparkles, tint: "bg-chart-5/15 text-chart-5" },
  whatsapp: { icon: MessageCircle, tint: "bg-chart-1/15 text-chart-1" },
  wait: { icon: Clock, tint: "bg-muted text-muted-foreground" },
}

const COPY = {
  en: {
    title: "Library",
    description:
      "Proven starter content from the Kombo team — clone a play into your workspace in one click.",
    introTitle: "Don't start from a blank page",
    introDescription:
      "Browse battle-tested sequences, templates, and search queries. Use one as-is or make it your own — every item drops straight into your workspace.",
    introPoints: [
      "Multi-channel sequences ready to attach to campaigns",
      "Email & LinkedIn templates with merge variables",
      "AI search queries that find your next accounts",
    ],
    tabAll: "All",
    tabSequences: "Sequences",
    tabTemplates: "Templates",
    tabQueries: "Search queries",
    sectionSequences: "Sequences",
    sectionTemplates: "Templates",
    sectionQueries: "Search queries",
    use: "Use",
    useSequence: "Use sequence",
    useTemplate: "Use template",
    runQuery: "Run search",
    steps: (n: number) => `${n} ${n === 1 ? "step" : "steps"}`,
    people: "People",
    company: "Companies",
    sequenceAdded: (name: string) => `"${name}" added to your sequences`,
    templateAdded: (name: string) => `"${name}" added to your templates`,
  },
  es: {
    title: "Biblioteca",
    description:
      "Contenido inicial probado del equipo de Kombo — clona una jugada en tu espacio con un clic.",
    introTitle: "No empieces desde cero",
    introDescription:
      "Explora secuencias, plantillas y búsquedas probadas. Úsalas tal cual o personalízalas — cada elemento entra directo en tu espacio de trabajo.",
    introPoints: [
      "Secuencias multicanal listas para adjuntar a campañas",
      "Plantillas de email y LinkedIn con variables",
      "Búsquedas con IA que encuentran tus próximas cuentas",
    ],
    tabAll: "Todo",
    tabSequences: "Secuencias",
    tabTemplates: "Plantillas",
    tabQueries: "Búsquedas",
    sectionSequences: "Secuencias",
    sectionTemplates: "Plantillas",
    sectionQueries: "Búsquedas",
    use: "Usar",
    useSequence: "Usar secuencia",
    useTemplate: "Usar plantilla",
    runQuery: "Ejecutar búsqueda",
    steps: (n: number) => `${n} ${n === 1 ? "paso" : "pasos"}`,
    people: "Personas",
    company: "Empresas",
    sequenceAdded: (name: string) => `"${name}" añadida a tus secuencias`,
    templateAdded: (name: string) => `"${name}" añadida a tus plantillas`,
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

export default function Library() {
  const { locale } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()

  function useSequence(item: LibrarySequence) {
    sequenceStore.create({
      name: item.name,
      description: item.description,
      steps: item.steps,
    })
    toast.success(c.sequenceAdded(item.name))
    navigate("/sequences")
  }

  function useTemplate(item: LibraryTemplate) {
    templateStore.create({
      name: item.name,
      folder: item.folder,
      channel: item.channel,
      subject: item.subject,
      body: item.body,
      tags: item.tags,
    })
    toast.success(c.templateAdded(item.name))
    navigate("/templates")
  }

  function runQuery(item: LibraryQuery) {
    navigate(`/search?q=${encodeURIComponent(item.prompt)}`)
  }

  const sequences = (
    <Grid>
      {librarySequences.map((item) => (
        <SequenceCard key={item.id} item={item} c={c} onUse={useSequence} />
      ))}
    </Grid>
  )
  const templates = (
    <Grid>
      {libraryTemplates.map((item) => (
        <TemplateCard key={item.id} item={item} c={c} onUse={useTemplate} />
      ))}
    </Grid>
  )
  const queries = (
    <Grid>
      {libraryQueries.map((item) => (
        <QueryCard key={item.id} item={item} c={c} onUse={runQuery} />
      ))}
    </Grid>
  )

  return (
    <Page>
      <PageHeading title={c.title} description={c.description} />

      <FeatureIntro
        featureKey="library"
        icon={LibraryBig}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        className="mb-6"
      />

      <Tabs defaultValue="all" className="gap-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">
            <LibraryBig className="size-4" />
            {c.tabAll}
          </TabsTrigger>
          <TabsTrigger value="sequences">
            <Workflow className="size-4" />
            {c.tabSequences}
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Mail className="size-4" />
            {c.tabTemplates}
          </TabsTrigger>
          <TabsTrigger value="queries">
            <Search className="size-4" />
            {c.tabQueries}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-8">
          <Section title={c.sectionSequences} icon={Workflow}>
            {sequences}
          </Section>
          <Section title={c.sectionTemplates} icon={Mail}>
            {templates}
          </Section>
          <Section title={c.sectionQueries} icon={Search}>
            {queries}
          </Section>
        </TabsContent>
        <TabsContent value="sequences">{sequences}</TabsContent>
        <TabsContent value="templates">{templates}</TabsContent>
        <TabsContent value="queries">{queries}</TabsContent>
      </Tabs>
    </Page>
  )
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Icon className="text-muted-foreground size-4" />
        {title}
      </h2>
      {children}
    </section>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  )
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="font-normal">
          {tag}
        </Badge>
      ))}
    </div>
  )
}

function SequenceCard({
  item,
  c,
  onUse,
}: {
  item: LibrarySequence
  c: Copy
  onUse: (item: LibrarySequence) => void
}) {
  return (
    <Card className="h-full gap-3">
      <CardHeader>
        <p className="font-semibold">{item.name}</p>
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {item.description}
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1">
          {item.steps.map((step, i) => {
            const meta = STEP_ICON[step]
            const Icon = meta.icon
            return (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-muted-foreground/50">·</span>}
                <span
                  className={`flex size-6 items-center justify-center rounded-md ${meta.tint}`}
                >
                  <Icon className="size-3.5" />
                </span>
              </React.Fragment>
            )
          })}
        </div>
        <Tags tags={item.tags} />
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-muted-foreground text-xs">
            {c.steps(item.steps.filter((s) => s !== "wait").length)}
          </span>
          <Button variant="volt" size="sm" onClick={() => onUse(item)}>
            <Plus className="size-4" />
            {c.useSequence}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TemplateCard({
  item,
  c,
  onUse,
}: {
  item: LibraryTemplate
  c: Copy
  onUse: (item: LibraryTemplate) => void
}) {
  const ChannelIcon = item.channel === "linkedin" ? LinkedinIcon : Mail
  return (
    <Card className="h-full gap-3">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="bg-muted flex size-7 items-center justify-center rounded-md">
            <ChannelIcon className="size-3.5" />
          </span>
          <p className="flex-1 font-semibold">{item.name}</p>
        </div>
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {item.description}
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="bg-muted/50 rounded-md border p-2.5 text-xs">
          {item.subject && (
            <p className="mb-1 font-medium">{item.subject}</p>
          )}
          <p className="text-muted-foreground line-clamp-3 whitespace-pre-line">
            {item.body}
          </p>
        </div>
        <Tags tags={item.tags} />
        <div className="mt-auto flex items-center justify-between pt-1">
          <Badge variant="outline" className="font-normal">
            {item.folder}
          </Badge>
          <Button variant="volt" size="sm" onClick={() => onUse(item)}>
            <Plus className="size-4" />
            {c.useTemplate}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function QueryCard({
  item,
  c,
  onUse,
}: {
  item: LibraryQuery
  c: Copy
  onUse: (item: LibraryQuery) => void
}) {
  const EntityIcon = item.entity === "company" ? Building2 : Users
  return (
    <Card className="h-full gap-3">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-md">
            <EntityIcon className="size-3.5" />
          </span>
          <p className="flex-1 font-semibold">{item.name}</p>
        </div>
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {item.description}
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="bg-muted/50 text-muted-foreground rounded-md border p-2.5 text-xs italic">
          "{item.prompt}"
        </p>
        <Tags tags={item.tags} />
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-muted-foreground text-xs">
            {item.entity === "company" ? c.company : c.people}
          </span>
          <Button variant="volt" size="sm" onClick={() => onUse(item)}>
            <Search className="size-4" />
            {c.runQuery}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
