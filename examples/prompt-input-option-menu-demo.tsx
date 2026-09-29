"use client"

import { toast } from "sonner"

import {
  PromptInput,
  PromptInputAttachButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai/prompt-input"
import { PromptInputOptionMenu, type PromptOption } from "@/components/ai/prompt-input-option-menu"
import { ReasoningIcon, ResearchIcon, WebSearchIcon } from "@/lib/icons"

const tools: PromptOption[] = [
  { id: "web", label: "Web search", icon: <WebSearchIcon />, description: "Look things up online" },
  { id: "research", label: "Deep research", icon: <ResearchIcon />, description: "Many sources, a full report" },
  { id: "think", label: "Think", icon: <ReasoningIcon />, description: "Reason longer before answering" },
]

export default function PromptInputOptionMenuDemo() {
  return (
    <PromptInput className="max-w-sm" onSubmit={({ text }) => toast(`Sent: ${text}`)}>
      <PromptInputTextarea />
      <PromptInputToolbar>
        <PromptInputTools>
          <PromptInputAttachButton />
          <PromptInputOptionMenu options={tools} defaultValue={["web"]} />
        </PromptInputTools>
        <PromptInputSubmit />
      </PromptInputToolbar>
    </PromptInput>
  )
}
