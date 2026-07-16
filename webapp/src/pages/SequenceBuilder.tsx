import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, Check, Workflow } from "lucide-react"

import { Page } from "@/components/layout/Page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { SequenceBuilder } from "@/components/sequence/SequenceBuilder"
import { defaultSequence } from "@/lib/mock-sequence"
import { useLocale } from "@/lib/locale"
import type { BuilderStep } from "@/lib/types"

const COPY = {
  en: {
    defaultName: "Multi-channel — VP Sales",
    untitled: "Untitled",
    sequenceSaved: (name: string) => `Sequence "${name}" saved`,
    backToSequences: "Back to sequences",
    sequenceName: "Sequence name",
    description: "Design the touches, triggers, and branches for this sequence.",
    saveSequence: "Save sequence",
    introTitle: "Build sequences visually",
    introDescription:
      "Drag steps to reorder, branch on what prospects do, and fan out touches in parallel across email, LinkedIn, WhatsApp, and AI calls.",
    introPoints: [
      "Drag-and-drop step ordering",
      "Trigger on a delay, open, click, reply, or data signal",
      "Run steps in parallel or branch on reply",
      "Auto-pauses the moment someone responds",
    ],
  },
  es: {
    defaultName: "Multicanal — VP de Ventas",
    untitled: "Sin título",
    sequenceSaved: (name: string) => `Secuencia «${name}» guardada`,
    backToSequences: "Volver a secuencias",
    sequenceName: "Nombre de la secuencia",
    description:
      "Diseña los contactos, disparadores y ramificaciones de esta secuencia.",
    saveSequence: "Guardar secuencia",
    introTitle: "Crea secuencias de forma visual",
    introDescription:
      "Arrastra pasos para reordenarlos, ramifica según lo que hagan los prospectos y despliega contactos en paralelo por correo, LinkedIn, WhatsApp y llamadas con IA.",
    introPoints: [
      "Ordena pasos con arrastrar y soltar",
      "Dispara con un retraso, apertura, clic, respuesta o señal de datos",
      "Ejecuta pasos en paralelo o ramifica al responder",
      "Se pausa automáticamente en cuanto alguien responde",
    ],
  },
  it: {
    defaultName: "Multicanale — VP Sales",
    untitled: "Senza titolo",
    sequenceSaved: (name: string) => `Sequenza "${name}" salvata`,
    backToSequences: "Torna alle sequenze",
    sequenceName: "Nome della sequenza",
    description:
      "Progetta i tocchi, i trigger e le ramificazioni di questa sequenza.",
    saveSequence: "Salva sequenza",
    introTitle: "Crea sequenze in modo visuale",
    introDescription:
      "Trascina i passaggi per riordinarli, ramifica in base a ciò che fanno i prospect e distribuisci i tocchi in parallelo tra email, LinkedIn, WhatsApp e chiamate IA.",
    introPoints: [
      "Ordina i passaggi con il drag-and-drop",
      "Attiva con un ritardo, apertura, clic, risposta o segnale dai dati",
      "Esegui passaggi in parallelo o ramifica alla risposta",
      "Si mette in pausa appena qualcuno risponde",
    ],
  },
  fr: {
    defaultName: "Multicanal — VP Sales",
    untitled: "Sans titre",
    sequenceSaved: (name: string) => `Séquence « ${name} » enregistrée`,
    backToSequences: "Retour aux séquences",
    sequenceName: "Nom de la séquence",
    description:
      "Concevez les touches, les déclencheurs et les branches de cette séquence.",
    saveSequence: "Enregistrer la séquence",
    introTitle: "Construisez vos séquences visuellement",
    introDescription:
      "Glissez les étapes pour les réordonner, créez des branches selon les actions des prospects et déployez des touches en parallèle sur l'e-mail, LinkedIn, WhatsApp et les appels IA.",
    introPoints: [
      "Réordonnez les étapes par glisser-déposer",
      "Déclenchez sur un délai, une ouverture, un clic, une réponse ou un signal de données",
      "Exécutez des étapes en parallèle ou branchez sur la réponse",
      "Mise en pause automatique dès que quelqu'un répond",
    ],
  },
  de: {
    defaultName: "Multichannel — VP Sales",
    untitled: "Ohne Titel",
    sequenceSaved: (name: string) => `Sequenz „${name}“ gespeichert`,
    backToSequences: "Zurück zu den Sequenzen",
    sequenceName: "Name der Sequenz",
    description:
      "Gestalte die Touchpoints, Trigger und Verzweigungen dieser Sequenz.",
    saveSequence: "Sequenz speichern",
    introTitle: "Sequenzen visuell bauen",
    introDescription:
      "Ziehe Schritte zum Umsortieren, verzweige nach dem Verhalten der Prospects und fächere Touchpoints parallel über E-Mail, LinkedIn, WhatsApp und KI-Anrufe auf.",
    introPoints: [
      "Schritte per Drag-and-drop ordnen",
      "Auslösen per Wartezeit, Öffnung, Klick, Antwort oder Datensignal",
      "Schritte parallel ausführen oder bei Antwort verzweigen",
      "Pausiert automatisch, sobald jemand antwortet",
    ],
  },
  pt: {
    defaultName: "Multicanal — VP de Vendas",
    untitled: "Sem título",
    sequenceSaved: (name: string) => `Sequência "${name}" guardada`,
    backToSequences: "Voltar às sequências",
    sequenceName: "Nome da sequência",
    description:
      "Desenhe os toques, os acionadores e as ramificações desta sequência.",
    saveSequence: "Guardar sequência",
    introTitle: "Crie sequências de forma visual",
    introDescription:
      "Arraste passos para reordenar, ramifique consoante o que os prospects fazem e distribua toques em paralelo por email, LinkedIn, WhatsApp e chamadas com IA.",
    introPoints: [
      "Ordene passos com arrastar e largar",
      "Acione com um atraso, abertura, clique, resposta ou sinal de dados",
      "Execute passos em paralelo ou ramifique na resposta",
      "Pausa automaticamente assim que alguém responde",
    ],
  },
  pt_BR: {
    defaultName: "Multicanal — VP de Vendas",
    untitled: "Sem título",
    sequenceSaved: (name: string) => `Sequência "${name}" salva`,
    backToSequences: "Voltar para sequências",
    sequenceName: "Nome da sequência",
    description:
      "Desenhe os toques, os gatilhos e as ramificações desta sequência.",
    saveSequence: "Salvar sequência",
    introTitle: "Crie sequências de forma visual",
    introDescription:
      "Arraste etapas para reordenar, ramifique conforme o que os prospects fazem e distribua toques em paralelo por email, LinkedIn, WhatsApp e ligações com IA.",
    introPoints: [
      "Ordene etapas com arrastar e soltar",
      "Acione com um atraso, abertura, clique, resposta ou sinal de dados",
      "Execute etapas em paralelo ou ramifique na resposta",
      "Pausa automaticamente assim que alguém responde",
    ],
  },
} as const

export default function SequenceBuilderPage() {
  const { locale, t } = useLocale()
  const c = COPY[locale]
  const navigate = useNavigate()
  const location = useLocation()
  const hasHistory = location.key !== "default"
  const [name, setName] = React.useState<string>(c.defaultName)
  const [initial] = React.useState<BuilderStep[]>(() => defaultSequence())

  function goBack() {
    if (hasHistory) navigate(-1)
    else navigate("/sequences")
  }

  function handleSave() {
    toast.success(c.sequenceSaved(name.trim() || c.untitled))
    goBack()
  }

  return (
    <Page>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label={hasHistory ? t("common.back") : c.backToSequences}
          onClick={goBack}
          className="-ml-2"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label={c.sequenceName}
            className="h-auto border-transparent bg-transparent px-0 text-xl font-semibold shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
          />
          <p className="text-muted-foreground text-sm">{c.description}</p>
        </div>
        <Button variant="volt" onClick={handleSave}>
          <Check className="size-4" />
          {c.saveSequence}
        </Button>
      </div>

      <FeatureIntro
        featureKey="sequence"
        icon={Workflow}
        title={c.introTitle}
        description={c.introDescription}
        points={[...c.introPoints]}
        className="mb-6"
      />

      <SequenceBuilder initialSteps={initial} />
    </Page>
  )
}
