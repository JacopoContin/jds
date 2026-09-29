"use client"

import * as React from "react"

import { AgentPanel, AgentPanelBody, AgentPanelFooter, AgentPanelHeader } from "@/components/ai/agent-panel"
import { ConversationEmpty } from "@/components/ai/conversation"
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai/prompt-input"
import { Button } from "@/components/ui/button"
import { VoiceOrb } from "@/components/voice/voice-orb"

export default function AgentPanelDemo() {
  const [open, setOpen] = React.useState(true)
  return (
    <div className="relative h-112 w-full overflow-hidden rounded-xl border bg-background">
      {!open && (
        <Button size="sm" className="absolute top-3 right-3" onClick={() => setOpen(true)}>
          Open agent
        </Button>
      )}
      <AgentPanel open={open} onOpenChange={setOpen} variant="floating" width={340} contained>
        <AgentPanelHeader title="Agent" modes={["chat", "voice"]} />
        <AgentPanelBody
          chat={<ConversationEmpty title="Ask about this page" />}
          voice={
            <div className="flex flex-1 items-center justify-center">
              <VoiceOrb state="idle" size={160} />
            </div>
          }
        />
        <AgentPanelFooter>
          <PromptInput onSubmit={() => {}}>
            <PromptInputTextarea />
            <PromptInputToolbar>
              <PromptInputTools />
              <PromptInputSubmit />
            </PromptInputToolbar>
          </PromptInput>
        </AgentPanelFooter>
      </AgentPanel>
    </div>
  )
}
