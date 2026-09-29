"use client"

import * as React from "react"

import type { ToolState } from "@/components/ai/tool-call"
import type { CallState } from "@/components/voice/call-controls"
import type { TranscriptSegment } from "@/components/voice/live-transcript"
import type { VoiceState } from "@/components/voice/voice-orb"

/** Something the agent did during the call, shown as a tool call. */
type AgentAction = {
  id: string
  /** Tool name, e.g. "calendar.availability". */
  tool: string
  state: ToolState
  input?: unknown
  output?: unknown
}

/**
 * Everything <VoiceAgent> reads from a voice session. Implement it on top of your
 * realtime provider (OpenAI Realtime, ElevenLabs, Vapi, LiveKit…) and pass it in.
 * `useSimulatedVoiceAgent` is a scripted stand-in so the UI runs before the backend does.
 */
type VoiceAgentSession = {
  call: CallState
  /** When the call connected, for the timer. */
  startedAt?: number
  /** Drives the orb: speaking while the agent talks, listening while the user does. */
  orb: VoiceState
  /** Loudness 0 to 1 of whoever is talking. */
  level: number
  transcript: TranscriptSegment[]
  actions: AgentAction[]
  /** How the call ended, shown once it's over. */
  outcome?: { title: string; detail: string }
  muted: boolean
  setMuted: (muted: boolean) => void
  /** Cut the agent off mid-sentence. */
  interrupt: () => void
  /** Hand the conversation to a person. */
  transfer: () => void
  end: () => void
  restart: () => void
}

type Step =
  | { say: "agent" | "user"; text: string }
  | { tool: string; input: unknown; output: unknown; ms: number }
  | { outcome: { title: string; detail: string } }

/** A sample conversation to show the UI's states. Replace the whole hook with your own session. */
const script: Step[] = [
  { say: "agent", text: "Hi, I'm Aria. What can I help you with?" },
  { say: "user", text: "Can you move my two o'clock with Luca to tomorrow?" },
  { tool: "calendar.find", input: { with: "Luca", day: "today" }, output: { event: "Design review", at: "2:00 PM" }, ms: 1100 },
  { tool: "calendar.availability", input: { day: "tomorrow", minutes: 30 }, output: { slots: ["10:30 AM", "1:00 PM", "4:00 PM"] }, ms: 1400 },
  { say: "agent", text: "Sure. Tomorrow you're both free at 10:30, 1, or 4. Which works?" },
  { say: "user", text: "10:30, please." },
  { tool: "calendar.move", input: { event: "Design review", to: "Tomorrow 10:30 AM" }, output: { moved: true }, ms: 1200 },
  { tool: "email.send", input: { to: "Luca", template: "meeting-moved" }, output: { sent: true }, ms: 700 },
  { say: "agent", text: "Done. It's tomorrow at 10:30, and I let Luca know. Anything else?" },
  { say: "user", text: "No, that's all. Thanks!" },
  { say: "agent", text: "Anytime." },
  { outcome: { title: "Meeting moved", detail: "Design review with Luca · tomorrow 10:30 AM · Luca notified" } },
]

const WORD_MS = 170
const PAUSE_MS = 700

/** A scripted session that plays `script`, for demos and for building the UI before the backend exists. */
function useSimulatedVoiceAgent(): VoiceAgentSession {
  const [call, setCall] = React.useState<CallState>("connecting")
  const [startedAt, setStartedAt] = React.useState<number>()
  const [step, setStep] = React.useState(0)
  const [words, setWords] = React.useState(0)
  const [outcome, setOutcome] = React.useState<VoiceAgentSession["outcome"]>()
  const [muted, setMuted] = React.useState(false)
  const [level, setLevel] = React.useState(0)

  const current = call === "connected" ? script[step] : undefined
  const saying = current && "say" in current ? current : undefined
  const speaking = !!saying && words < saying.text.split(" ").length
  const running = current && "tool" in current

  // Transcript and actions are derived from how far the script has played, so there's one source of truth.
  const reached = call === "connecting" ? -1 : step
  const played = script.slice(0, reached + 1)
  const transcript: TranscriptSegment[] = played.flatMap((s, i) => {
    if (!("say" in s)) return []
    const done = i < reached || words >= s.text.split(" ").length
    const text = done ? s.text : s.text.split(" ").slice(0, words).join(" ")
    return text ? [{ id: String(i), speaker: s.say, text, final: done }] : []
  })
  const actions: AgentAction[] = played.flatMap((s, i) => {
    if (!("tool" in s)) return []
    const done = i < reached
    // A call ended mid-tool leaves that tool unfinished.
    const state: ToolState = done ? "output-available" : call === "ended" ? "output-error" : "input-available"
    return [{ id: String(i), tool: s.tool, state, input: s.input, output: done ? s.output : undefined }]
  })

  const orb: VoiceState =
    call === "connecting" || call === "reconnecting"
      ? "connecting"
      : call === "ended"
        ? "idle"
        : running
          ? "thinking"
          : saying?.say === "agent" && speaking
            ? "speaking"
            : "listening"

  // Connect.
  React.useEffect(() => {
    if (call !== "connecting") return
    const id = setTimeout(() => {
      setCall("connected")
      setStartedAt(Date.now())
    }, 1200)
    return () => clearTimeout(id)
  }, [call])

  // Advance the script: stream words, run tools, then settle the outcome.
  React.useEffect(() => {
    if (!current) return
    if ("outcome" in current) {
      const id = setTimeout(() => {
        setOutcome(current.outcome)
        setCall("ended")
      }, PAUSE_MS)
      return () => clearTimeout(id)
    }
    if ("tool" in current) {
      const id = setTimeout(() => setStep((s) => s + 1), current.ms)
      return () => clearTimeout(id)
    }
    const total = current.text.split(" ").length
    const id = setTimeout(
      () => {
        if (words < total) setWords((w) => w + 1)
        else {
          setStep((s) => s + 1)
          setWords(0)
        }
      },
      words < total ? WORD_MS : PAUSE_MS,
    )
    return () => clearTimeout(id)
  }, [current, words])

  // A speech-like level while someone talks; the user's side goes quiet when muted.
  React.useEffect(() => {
    const talking = speaking && !(saying?.say === "user" && muted)
    if (!talking) {
      const id = requestAnimationFrame(() => setLevel(0))
      return () => cancelAnimationFrame(id)
    }
    let raf = 0
    const tick = (t: number) => {
      setLevel(Math.max(0, 0.45 + Math.sin(t / 110) * 0.25 + Math.sin(t / 47) * 0.15))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [speaking, saying, muted])

  const reset = () => {
    setStep(0)
    setWords(0)
    setOutcome(undefined)
    setStartedAt(undefined)
  }

  return {
    call,
    startedAt,
    orb,
    level,
    transcript,
    actions,
    outcome,
    muted,
    setMuted,
    interrupt: () => {
      if (saying?.say === "agent") setWords(saying.text.split(" ").length)
    },
    transfer: () => {
      setOutcome({ title: "Handed to a person", detail: "They get the transcript and the actions so far." })
      setCall("ended")
    },
    end: () => setCall("ended"),
    restart: () => {
      reset()
      setCall("connecting")
    },
  }
}

export { useSimulatedVoiceAgent, type AgentAction, type VoiceAgentSession }
