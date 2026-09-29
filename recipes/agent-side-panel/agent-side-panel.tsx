"use client"

import * as React from "react"

import {
  AgentPanel,
  AgentPanelBody,
  AgentPanelFooter,
  AgentPanelHeader,
  AgentPanelVoiceButton,
  AgentPanelVoiceExit,
  type PanelMode,
} from "@/components/ai/agent-panel"
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai/conversation"
import { Message, MessageContent } from "@/components/ai/message"
import {
  PromptInput,
  PromptInputAttachButton,
  PromptInputFrame,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai/prompt-input"
import { PromptInputMic } from "@/components/ai/prompt-input-mic"
import { Response } from "@/components/ai/response"
import { TypingIndicator } from "@/components/ai/shimmer"
import { Kbd } from "@/components/ui/kbd"
import { LiveTranscript } from "@/components/voice/live-transcript"
import { PushToTalk } from "@/components/voice/push-to-talk"
import { VoiceOrb, type VoiceState } from "@/components/voice/voice-orb"
import { FileIcon, VoiceIcon } from "@/lib/icons"

import type { PanelSession } from "./session"

/** Panel styling, exactly as the Side Panel Studio generates it. */
type PanelStyle = Pick<
  React.ComponentProps<typeof AgentPanel>,
  "side" | "variant" | "surface" | "width" | "inset" | "motion" | "contained"
>

/** Orb styling for voice mode, exactly as the Voice Orb Studio generates it. */
type PanelOrb = Omit<React.ComponentProps<typeof VoiceOrb>, "state" | "level">

/** What a custom composer gets: the same names the Prompt Input Studio's code uses. */
type ComposerApi = PanelSession["chat"]

const stateLabel: Record<VoiceState, string> = {
  idle: "Hold to talk",
  connecting: "Connecting…",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
  error: "Couldn't connect",
}

/**
 * An agent side panel over your app: chat, dictation and a hold-to-talk voice mode whose
 * turns land back in the chat. Style it with `panel` and `orb` from the Studio, swap the
 * composer with `composer`, and pass any `PanelSession`; `useSimulatedPanel` plays a sample.
 */
function AgentSidePanel({
  session,
  open,
  onOpenChange,
  panel,
  orb,
  title = "Agent",
  context,
  placeholder = "Ask about this page…",
  composer,
}: {
  session: PanelSession
  open: boolean
  onOpenChange?: (open: boolean) => void
  /** Paste the props from the Side Panel Studio. */
  panel?: PanelStyle
  /** Paste the props from the Voice Orb Studio. Without it, the orb follows the nearest VoiceOrbProvider. */
  orb?: PanelOrb
  title?: string
  /** What the agent is looking at, shown above the composer, e.g. "Orders · 128 rows". */
  context?: string
  placeholder?: string
  /** Replace the default composer, e.g. with code from the Prompt Input Studio. */
  composer?: (api: ComposerApi) => React.ReactNode
}) {
  const { chat, voice } = session
  const [mode, setMode] = React.useState<PanelMode>("chat")
  // One way out of voice mode, whether from the exit button or the header switch.
  const changeMode = (next: PanelMode) => {
    if (mode === "voice" && next === "chat") voice?.end()
    setMode(next)
  }

  const input = (
    <PromptInput status={chat.status} onSubmit={({ text, files }) => chat.sendMessage({ text, files })}>
      <PromptInputTextarea placeholder={placeholder} />
      <PromptInputToolbar>
        <PromptInputTools>
          <PromptInputAttachButton />
        </PromptInputTools>
        <div className="flex min-w-0 items-center gap-1">
          <PromptInputMic />
          {voice && <AgentPanelVoiceButton />}
          <PromptInputSubmit onStop={chat.stop} />
        </div>
      </PromptInputToolbar>
    </PromptInput>
  )

  return (
    <AgentPanel {...panel} open={open} onOpenChange={onOpenChange} mode={mode} onModeChange={changeMode}>
      <AgentPanelHeader title={title} />
      <AgentPanelBody
        chat={
          <Conversation>
            <ConversationContent className="gap-5 px-4 py-4">
              {chat.messages.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-16 text-center">
                  <p className="text-sm font-medium">Ask about this page</p>
                  <p className="text-sm text-muted-foreground">
                    {voice ? "Type, dictate with the mic, or switch to voice." : "Type or dictate with the mic."}
                  </p>
                </div>
              )}
              {chat.messages.map((m) => (
                <Message key={m.id} from={m.from}>
                  <MessageContent>
                    {m.from === "assistant" ? (
                      m.text ? (
                        <Response isAnimating={chat.status === "streaming"}>{m.text}</Response>
                      ) : (
                        <TypingIndicator />
                      )
                    ) : (
                      m.text
                    )}
                    {m.via === "voice" && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <VoiceIcon className="size-3" />
                        Voice
                      </span>
                    )}
                  </MessageContent>
                </Message>
              ))}
              {chat.status === "submitted" && (
                <Message from="assistant">
                  <MessageContent>
                    <TypingIndicator />
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        }
        voice={
          voice && (
            <div className="flex min-h-0 flex-1 flex-col items-center gap-4 px-6 py-6">
              <VoiceOrb size={160} {...orb} state={voice.state} level={voice.level} />
              <p className="flex h-5 items-center gap-1.5 text-sm text-muted-foreground">
                {stateLabel[voice.state]}
                {voice.state === "idle" && <Kbd>Space</Kbd>}
              </p>
              <LiveTranscript segments={voice.transcript} className="min-h-0 w-full flex-1 overflow-y-auto" />
              <div className="flex shrink-0 flex-col items-center gap-3">
                <PushToTalk onPressStart={voice.start} onPressEnd={voice.release} level={voice.level} />
                <AgentPanelVoiceExit />
              </div>
            </div>
          )
        }
      />
      <AgentPanelFooter>
        {composer ? (
          composer(chat)
        ) : context ? (
          <PromptInputFrame>
            <PromptInputHeader icon={<FileIcon />}>{context}</PromptInputHeader>
            {input}
          </PromptInputFrame>
        ) : (
          input
        )}
      </AgentPanelFooter>
    </AgentPanel>
  )
}

export { AgentSidePanel, type ComposerApi, type PanelOrb, type PanelStyle }
