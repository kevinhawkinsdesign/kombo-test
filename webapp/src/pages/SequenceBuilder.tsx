import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, Check, Workflow } from "lucide-react"

import { Page } from "@/components/layout/Page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FeatureIntro } from "@/components/common/FeatureIntro"
import { SequenceBuilder } from "@/components/sequence/SequenceBuilder"
import { defaultSequence } from "@/lib/mock-sequence"
import type { BuilderStep } from "@/lib/types"

export default function SequenceBuilderPage() {
  const navigate = useNavigate()
  const [name, setName] = React.useState("Multi-channel — VP Sales")
  const [initial] = React.useState<BuilderStep[]>(() => defaultSequence())

  function handleSave() {
    toast.success(`Sequence "${name.trim() || "Untitled"}" saved`)
    navigate("/campaigns")
  }

  return (
    <Page>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Back to campaigns"
          onClick={() => navigate("/campaigns")}
          className="-ml-2"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Sequence name"
            className="h-auto border-transparent bg-transparent px-0 text-xl font-semibold shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
          />
          <p className="text-muted-foreground text-sm">
            Design the touches, triggers, and branches for this sequence.
          </p>
        </div>
        <Button variant="volt" onClick={handleSave}>
          <Check className="size-4" />
          Save sequence
        </Button>
      </div>

      <FeatureIntro
        featureKey="sequence"
        icon={Workflow}
        title="Build sequences visually"
        description="Drag steps to reorder, branch on what prospects do, and fan out touches in parallel across email, LinkedIn, WhatsApp, and AI calls."
        points={[
          "Drag-and-drop step ordering",
          "Trigger on a delay, open, click, reply, or data signal",
          "Run steps in parallel or branch on reply",
          "Auto-pauses the moment someone responds",
        ]}
        className="mb-6"
      />

      <SequenceBuilder initialSteps={initial} />
    </Page>
  )
}
