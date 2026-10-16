"use client"

import * as React from "react"

import { PromptInputComposer, promptInputDefaults } from "@/components/studio/prompt-input-builder"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/** The parts you can switch on, each its own component. */
const parts = [
  { value: "suggestions", label: "Suggestions" },
  { value: "mentions", label: "Mentions" },
  { value: "context", label: "Context meter" },
  { value: "model", label: "Model picker" },
] as const

type Part = (typeof parts)[number]["value"]

/**
 * A small studio on the homepage: the real composer from the Prompt Input Studio, with its
 * add-ons as toggles, so people see how the pieces compose before opening the full Studio.
 */
export default function PromptInputStudioPreview() {
  const [on, setOn] = React.useState<Part[]>(["suggestions", "model"])
  const c = {
    ...promptInputDefaults,
    suggestions: on.includes("suggestions") ? ("below" as const) : ("off" as const),
    mentions: on.includes("mentions"),
    context: on.includes("context"),
    model: on.includes("model"),
    placeholder: on.includes("mentions") ? "Type @ to mention a file, tool or agent" : promptInputDefaults.placeholder,
  }

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <ToggleGroup
        multiple
        value={on}
        onValueChange={(v) => setOn(v as Part[])}
        variant="outline"
        size="sm"
        aria-label="Prompt input parts"
        className="flex-wrap justify-center"
      >
        {parts.map((p) => (
          <ToggleGroupItem key={p.value} value={p.value}>
            {p.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <PromptInputComposer c={c} status="ready" />
    </div>
  )
}
