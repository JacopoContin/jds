"use client"

import * as React from "react"

import type { ChatStatus } from "@/components/ai/prompt-input"
import type { TranscriptSegment } from "@/components/voice/live-transcript"
import type { VoiceState } from "@/components/voice/voice-orb"
import { useSimulatedSpectrum } from "@/hooks/use-simulated-spectrum"

type PanelMessage = { id: string; from: "user" | "assistant"; text: string; via?: "voice" }

/**
 * Everything <AgentSidePanel> reads. `chat` has the shape of the AI SDK's useChat
 * (messages, status, sendMessage, stop), with messages flattened to text. `voice` drives
 * hold-to-talk; leave it out to hide voice mode. `useSimulatedPanel` is a scripted stand-in.
 */
type PanelSession = {
  chat: {
    messages: PanelMessage[]
    status: ChatStatus
    sendMessage: (message: { text: string; files?: File[] }) => void
    stop: () => void
  }
  voice?: {
    state: VoiceState
    /** Loudness 0 to 1 of whoever is talking. */
    level: number
    transcript: TranscriptSegment[]
    /** Hold to talk: start listening. */
    start: () => void
    /** Release: stop listening and let the agent answer. */
    release: () => void
    /** Leave voice mode. Implementations add the spoken turns to the chat. */
    end: () => void
  }
}

const REPLY = `Three orders are overdue by more than a week:

- **#4817** · Maria Rossi · 9 days
- **#4802** · Ken Adams · 12 days
- **#4795** · Lea Martin · 15 days

All three shipped with the same carrier. Want me to open a claim and email the customers?`

const VOICE_USER = "Open a claim for all three and email them."
const VOICE_AGENT = "Done. Claims are open and the customers have an email with the tracking update."

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** A scripted session: every message gets the same sample reply, and voice plays one exchange. */
function useSimulatedPanel(): PanelSession {
  const [messages, setMessages] = React.useState<PanelMessage[]>([])
  const [status, setStatus] = React.useState<ChatStatus>("ready")
  const [voiceState, setVoiceState] = React.useState<VoiceState>("idle")
  const [transcript, setTranscript] = React.useState<TranscriptSegment[]>([])
  const run = React.useRef(0)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const { level } = useSimulatedSpectrum(voiceState === "listening" || voiceState === "speaking")

  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  React.useEffect(() => clear, [])

  /** Types `text` into transcript segment `id` a word at a time. */
  const typeInto = (id: string, text: string, speed: number, done?: () => void) => {
    const words = text.split(" ")
    words.forEach((_, i) =>
      timers.current.push(
        setTimeout(() => {
          setTranscript((list) =>
            list.map((s) =>
              s.id === id ? { ...s, text: words.slice(0, i + 1).join(" "), final: i === words.length - 1 } : s,
            ),
          )
          if (i === words.length - 1) done?.()
        }, speed * (i + 1)),
      ),
    )
  }

  const sendMessage = async ({ text }: { text: string }) => {
    if (!text) return
    const id = ++run.current
    const alive = () => run.current === id
    const replyId = `a-${Date.now()}`
    setMessages((m) => [...m, { id: `u-${Date.now()}`, from: "user", text }])
    setStatus("submitted")
    await wait(700)
    if (!alive()) return
    setStatus("streaming")
    setMessages((m) => [...m, { id: replyId, from: "assistant", text: "" }])
    let out = ""
    for (const w of REPLY.split(/(\s+)/)) {
      if (!alive()) return
      out += w
      const snapshot = out
      setMessages((m) => m.map((x) => (x.id === replyId ? { ...x, text: snapshot } : x)))
      await wait(18 + Math.random() * 18)
    }
    if (alive()) setStatus("ready")
  }

  return {
    chat: {
      messages,
      status,
      sendMessage,
      stop: () => {
        run.current++
        setStatus("ready")
      },
    },
    voice: {
      state: voiceState,
      level,
      transcript,
      start: () => {
        clear()
        setVoiceState("listening")
        const id = `vu-${Date.now()}`
        setTranscript([{ id, speaker: "user", text: "", final: false }])
        typeInto(id, VOICE_USER, 180)
      },
      release: () => {
        clear()
        setTranscript((list) => list.map((s) => (s.speaker === "user" ? { ...s, text: VOICE_USER, final: true } : s)))
        setVoiceState("thinking")
        timers.current.push(
          setTimeout(() => {
            setVoiceState("speaking")
            const id = `va-${Date.now()}`
            setTranscript((list) => [...list, { id, speaker: "agent", text: "", final: false }])
            typeInto(id, VOICE_AGENT, 160, () => timers.current.push(setTimeout(() => setVoiceState("idle"), 400)))
          }, 1200),
        )
      },
      end: () => {
        clear()
        setVoiceState("idle")
        // Spoken turns land back in the chat, marked as voice.
        setMessages((m) => [
          ...m,
          ...transcript
            .filter((s) => s.text)
            .map((s) => ({
              id: s.id,
              from: s.speaker === "user" ? ("user" as const) : ("assistant" as const),
              text: s.text,
              via: "voice" as const,
            })),
        ])
        setTranscript([])
      },
    },
  }
}

export { useSimulatedPanel, type PanelMessage, type PanelSession }
