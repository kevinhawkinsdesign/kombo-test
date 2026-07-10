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
