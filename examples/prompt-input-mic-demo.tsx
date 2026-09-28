"use client"

import { toast } from "sonner"

import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai/prompt-input"
import { PromptInputMic } from "@/components/ai/prompt-input-mic"

export default function PromptInputMicDemo() {
  return (
    <PromptInput className="max-w-lg" onSubmit={({ text }) => toast(`Sent: ${text}`)}>
      <PromptInputTextarea placeholder="Press the mic and start talking" />
      <PromptInputToolbar>
        <PromptInputTools />
        <div className="flex items-center gap-1">
          <PromptInputMic />
          <PromptInputSubmit />
        </div>
      </PromptInputToolbar>
    </PromptInput>
  )
}
