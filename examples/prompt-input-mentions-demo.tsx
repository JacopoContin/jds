"use client"

import { toast } from "sonner"

import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai/prompt-input"
import { PromptInputMentions, type Mention } from "@/components/ai/prompt-input-mentions"

const items: Mention[] = [
  { id: "f1", label: "pricing.md", type: "file", description: "docs/" },
  { id: "f2", label: "checkout.tsx", type: "file", description: "app/checkout/" },
  { id: "d1", label: "components", type: "folder", description: "src/" },
  { id: "t1", label: "web-search", type: "tool", description: "Search the web" },
  { id: "t2", label: "linear", type: "tool", description: "Issues and projects" },
  { id: "a1", label: "researcher", type: "agent", description: "Deep research agent" },
  { id: "a2", label: "reviewer", type: "agent", description: "Code review agent" },
]

export default function PromptInputMentionsDemo() {
  return (
    <PromptInput className="max-w-lg" onSubmit={({ text }) => toast(`Sent: ${text}`)}>
      <PromptInputMentions items={items} />
      <PromptInputTextarea placeholder="Type @ to mention a file, tool or agent" />
      <PromptInputToolbar>
        <PromptInputTools />
        <PromptInputSubmit />
      </PromptInputToolbar>
    </PromptInput>
  )
}
