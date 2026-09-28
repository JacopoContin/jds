"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  PromptInput,
  PromptInputAttachButton,
  PromptInputAttachments,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  type ChatStatus,
} from "@/components/ai/prompt-input"

export default function PromptInputDemo() {
  const [status, setStatus] = React.useState<ChatStatus>("ready")
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  return (
    <PromptInput
      className="max-w-lg"
      status={status}
      onSubmit={({ text, files }) => {
        toast(`Sent: ${text || `${files.length} file(s)`}`)
        setStatus("submitted")
        timer.current = setTimeout(() => {
          setStatus("streaming")
          timer.current = setTimeout(() => setStatus("ready"), 2500)
        }, 800)
      }}
    >
      <PromptInputAttachments />
      <PromptInputTextarea />
      <PromptInputToolbar>
        <PromptInputTools>
          <PromptInputAttachButton />
        </PromptInputTools>
        <PromptInputSubmit
          onStop={() => {
            clearTimeout(timer.current)
            setStatus("ready")
          }}
        />
      </PromptInputToolbar>
    </PromptInput>
  )
}
