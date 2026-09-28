"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

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
  type ChatStatus,
} from "@/components/ai/prompt-input"
import { PromptInputMic } from "@/components/ai/prompt-input-mic"
import { Response } from "@/components/ai/response"
import { TypingIndicator } from "@/components/ai/shimmer"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { LiveTranscript, type TranscriptSegment } from "@/components/voice/live-transcript"
import { PushToTalk } from "@/components/voice/push-to-talk"
import { VoiceOrb, type VoiceState } from "@/components/voice/voice-orb"
import { useSimulatedSpectrum } from "@/hooks/use-simulated-spectrum"
import { CloseIcon, FileIcon, SparkleIcon, VoiceIcon } from "@/lib/icons"
import { spring } from "@/lib/motion"

type ChatMessage = { id: string; from: "user" | "assistant"; text: string; via?: "voice" }

const REPLY = `Three orders are overdue by more than a week:

- **#4817** · Maria Rossi · 9 days
- **#4802** · Ken Adams · 12 days
- **#4795** · Lea Martin · 15 days

All three shipped with the same carrier. Want me to open a claim and email the customers?`

const VOICE_USER = "Open a claim for all three and email them."
const VOICE_AGENT = "Done. Claims are open and the customers have an email with the tracking update."

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Streams text word by word into a message. Returns false if cancelled. */
async function streamInto(text: string, onText: (t: string) => void, alive: () => boolean, speed = 18) {
  let out = ""
  for (const w of text.split(/(\s+)/)) {
    if (!alive()) return false
    out += w
    onText(out)
    await wait(speed + Math.random() * speed)
  }
  return true
}

export default function AgentPanel() {
  const frameRef = React.useRef<HTMLDivElement>(null)
  const [open, setOpen] = React.useState(true)
  const [mode, setMode] = React.useState<"chat" | "voice">("chat")
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [status, setStatus] = React.useState<ChatStatus>("ready")
  const run = React.useRef(0)

  const send = async (text: string) => {
    const id = ++run.current
    const alive = () => run.current === id
    const replyId = `a-${Date.now()}`
    setMessages((m) => [...m, { id: `u-${Date.now()}`, from: "user", text }])
    setStatus("submitted")
    await wait(700)
    if (!alive()) return
    setStatus("streaming")
    setMessages((m) => [...m, { id: replyId, from: "assistant", text: "" }])
    await streamInto(REPLY, (t) => setMessages((m) => m.map((x) => (x.id === replyId ? { ...x, text: t } : x))), alive)
    if (alive()) setStatus("ready")
  }

  const stop = () => {
    run.current++
    setStatus("ready")
  }

  return (
    <div
      ref={frameRef}
      className="relative flex h-160 w-full transform-gpu overflow-hidden rounded-2xl border bg-background"
    >
      <FakeApp />

      <Sheet open={open} onOpenChange={setOpen} modal={false} disablePointerDismissal>
        {!open && (
          <SheetTrigger render={<Button size="sm" className="absolute top-3 right-3 z-10" />}>
            <SparkleIcon />
            Ask agent
          </SheetTrigger>
        )}
        <SheetContent
          container={frameRef}
          overlay={false}
          showCloseButton={false}
          className="w-full gap-0 p-0 shadow-2xl sm:w-96 sm:max-w-none"
        >
          <div className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
            <SparkleIcon className="size-4" />
            <SheetTitle className="text-sm">Agent</SheetTitle>
            <SheetDescription className="sr-only">Chat or talk with the agent about this page.</SheetDescription>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close agent"
              className="ml-auto"
              onClick={() => setOpen(false)}
            >
              <CloseIcon />
            </Button>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {mode === "chat" ? (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={spring.gentle}
                className="flex min-h-0 flex-1 flex-col"
              >
                <ChatView messages={messages} status={status} onSubmit={send} onStop={stop} onVoice={() => setMode("voice")} />
              </motion.div>
            ) : (
              <motion.div
                key="voice"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={spring.gentle}
                className="flex min-h-0 flex-1 flex-col"
              >
                <VoiceView
                  onEnd={(turns) => {
                    setMessages((m) => [...m, ...turns])
                    setMode("chat")
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function ChatView({
  messages,
  status,
  onSubmit,
  onStop,
  onVoice,
}: {
  messages: ChatMessage[]
  status: ChatStatus
  onSubmit: (text: string) => void
  onStop: () => void
  onVoice: () => void
}) {
  return (
    <>
      <Conversation>
        <ConversationContent className="gap-5 px-4 py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <p className="text-sm font-medium">Ask about this page</p>
              <p className="text-sm text-muted-foreground">Type, dictate with the mic, or switch to voice.</p>
            </div>
          )}
          {messages.map((m) => (
            <Message key={m.id} from={m.from}>
              <MessageContent>
                {m.from === "assistant" ? (
                  m.text ? (
                    <Response isAnimating={status === "streaming"}>{m.text}</Response>
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
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <TypingIndicator />
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="p-3 pt-0">
        <PromptInputFrame>
          <PromptInputHeader icon={<FileIcon />}>Orders · 128 rows</PromptInputHeader>
          <PromptInput status={status} onSubmit={({ text }) => text && onSubmit(text)}>
            <PromptInputTextarea placeholder="Which orders are overdue?" />
            <PromptInputToolbar>
              <PromptInputTools>
                <PromptInputAttachButton />
              </PromptInputTools>
              <div className="flex items-center gap-1">
                <PromptInputMic />
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Voice mode"
                        className="text-muted-foreground"
                        onClick={onVoice}
                      />
                    }
                  >
                    <VoiceIcon />
                  </TooltipTrigger>
                  <TooltipContent>Voice mode</TooltipContent>
                </Tooltip>
                <PromptInputSubmit onStop={onStop} />
              </div>
            </PromptInputToolbar>
          </PromptInput>
        </PromptInputFrame>
      </div>
    </>
  )
}

const stateLabel: Record<VoiceState, string> = {
  idle: "Hold to talk",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
}

function VoiceView({ onEnd }: { onEnd: (turns: ChatMessage[]) => void }) {
  const [state, setState] = React.useState<VoiceState>("idle")
  const [segments, setSegments] = React.useState<TranscriptSegment[]>([])
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const typing = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const { level } = useSimulatedSpectrum(state === "listening" || state === "speaking")

  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (typing.current) clearInterval(typing.current)
  }
  React.useEffect(() => clear, [])

  const typeInto = (id: string, text: string, speed: number, done?: () => void) => {
    const words = text.split(" ")
    let i = 0
    typing.current = setInterval(() => {
      i++
      setSegments((prev) =>
        prev.map((s) => (s.id === id ? { ...s, text: words.slice(0, i).join(" "), final: i >= words.length } : s))
      )
      if (i >= words.length) {
        if (typing.current) clearInterval(typing.current)
        done?.()
      }
    }, speed)
  }

  const onPressStart = () => {
    clear()
    setState("listening")
    const id = `vu-${Date.now()}`
    setSegments([{ id, speaker: "user", text: "", final: false }])
    typeInto(id, VOICE_USER, 180)
  }

  const onPressEnd = () => {
    if (typing.current) clearInterval(typing.current)
    setSegments((prev) => prev.map((s) => (s.speaker === "user" ? { ...s, text: VOICE_USER, final: true } : s)))
    setState("thinking")
    timers.current.push(
      setTimeout(() => {
        setState("speaking")
        const id = `va-${Date.now()}`
        setSegments((prev) => [...prev, { id, speaker: "agent", text: "", final: false }])
        typeInto(id, VOICE_AGENT, 160, () => timers.current.push(setTimeout(() => setState("idle"), 400)))
      }, 1200)
    )
  }

  const end = () => {
    clear()
    onEnd(
      segments
        .filter((s) => s.text)
        .map((s) => ({ id: s.id, from: s.speaker === "user" ? "user" : "assistant", text: s.text, via: "voice" }))
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center gap-6 px-6 py-8">
      <VoiceOrb state={state} level={level} size={200} />
      <p className="h-5 text-sm text-muted-foreground">{stateLabel[state]}</p>
      <LiveTranscript segments={segments} className="min-h-0 w-full flex-1 overflow-y-auto" />
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon-lg" className="rounded-full" aria-label="End voice mode" onClick={end}>
          <CloseIcon />
        </Button>
        <PushToTalk onPressStart={onPressStart} onPressEnd={onPressEnd} level={level} />
        <span className="w-9" />
      </div>
      <p className="-mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        Hold the button or <Kbd>Space</Kbd>
      </p>
    </div>
  )
}

/** Stand-in for the host app the panel sits over. */
function FakeApp() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 p-6">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">Orders</h3>
        <span className="text-sm text-muted-foreground">128</span>
      </div>
      <div className="flex flex-col divide-y rounded-xl border">
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
