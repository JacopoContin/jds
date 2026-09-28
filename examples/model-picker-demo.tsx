"use client"

import { toast } from "sonner"

import { ModelPicker, type Model } from "@/components/ai/model-picker"
import {
  PromptInput,
  PromptInputAttachButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai/prompt-input"

const models: Model[] = [
  {
    id: "opus",
    name: "Claude Opus 5.5",
    description: "Hardest problems, long agentic work",
    capabilities: ["reasoning", "vision", "web"],
    meta: "$$$",
  },
  {
    id: "sonnet",
    name: "Claude Sonnet 5.5",
    description: "Balanced for everyday tasks",
    capabilities: ["reasoning", "vision"],
    meta: "$$",
  },
  {
    id: "haiku",
    name: "Claude Haiku 4.5",
    description: "Quick answers, high volume",
    capabilities: ["fast"],
    meta: "$",
  },
]

export default function ModelPickerDemo() {
  return (
    <PromptInput className="max-w-lg" onSubmit={({ text }) => toast(`Sent: ${text}`)}>
      <PromptInputTextarea />
      <PromptInputToolbar>
        <PromptInputTools>
          <PromptInputAttachButton />
        </PromptInputTools>
        <div className="flex items-center gap-1">
          <ModelPicker models={models} defaultValue="sonnet" />
          <PromptInputSubmit />
        </div>
      </PromptInputToolbar>
    </PromptInput>
  )
}
