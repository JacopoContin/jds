"use client"

import * as React from "react"

import {
  AgentPanel,
  AgentPanelBody,
  AgentPanelFooter,
  AgentPanelHeader,
  AgentPanelVoiceButton,
  AgentPanelVoiceExit,
} from "@/components/ai/agent-panel"
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
        <AgentPanelHeader title="Agent" />
        <AgentPanelBody
          chat={<ConversationEmpty title="Ask about this page" />}
          voice={
            <div className="flex flex-1 flex-col items-center justify-center gap-6">
              <VoiceOrb state="idle" size={160} />
              <AgentPanelVoiceExit />
            </div>
          }
        />
        <AgentPanelFooter>
          <PromptInput onSubmit={() => {}}>
            <PromptInputTextarea />
            <PromptInputToolbar>
              <PromptInputTools />
              <div className="flex items-center gap-1">
                <AgentPanelVoiceButton />
                <PromptInputSubmit />
              </div>
            </PromptInputToolbar>
          </PromptInput>
        </AgentPanelFooter>
      </AgentPanel>
    </div>
  )
}
