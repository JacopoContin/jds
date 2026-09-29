"use client"

import * as React from "react"

import type { ToolState } from "@/components/ai/tool-call"
import type { CallState } from "@/components/voice/call-controls"
import type { TranscriptSegment } from "@/components/voice/live-transcript"
import type { VoiceState } from "@/components/voice/voice-orb"

/** Something the agent did during the call, shown as a tool call. */
type ReceptionistAction = {
  id: string
  /** Tool name, e.g. "calendar.availability". */
  tool: string
  state: ToolState
  input?: unknown
  output?: unknown
}

/**
 * Everything the receptionist UI needs from a voice session. Implement it on top of
 * your realtime provider (OpenAI Realtime, ElevenLabs, Vapi, LiveKit…) and pass it to
 * <VoiceReceptionist>. `useSimulatedReceptionist` is a scripted stand-in.
 */
type ReceptionistSession = {
  call: CallState
  /** When the call connected, for the timer. */
  startedAt?: number
  /** Drives the orb: speaking while the agent talks, listening while the caller does. */
  orb: VoiceState
  /** Loudness 0 to 1 of whoever is talking. */
  level: number
  transcript: TranscriptSegment[]
  actions: ReceptionistAction[]
  /** How the call ended, shown once it's over. */
  outcome?: { title: string; detail: string }
  muted: boolean
  setMuted: (muted: boolean) => void
  /** Cut the agent off mid-sentence. */
  interrupt: () => void
  /** Hand the caller to a person. */
  transfer: () => void
  end: () => void
  restart: () => void
}

type Step =
  | { say: "agent" | "user"; text: string }
  | { tool: string; input: unknown; output: unknown; ms: number }
  | { outcome: { title: string; detail: string } }

/** A caller moving a dental cleaning. Replace with your own session; this only exists to show the flow. */
const script: Step[] = [
  { say: "agent", text: "Thanks for calling Harbor Dental, this is Aria. How can I help?" },
  { say: "user", text: "Hi, I need to move my cleaning on Thursday to next week." },
  { tool: "patients.lookup", input: { phone: "+1 415 555 0142" }, output: { name: "Sam Rivera", appointment: "Thu 2:00 PM, cleaning" }, ms: 1100 },
  { tool: "calendar.availability", input: { type: "cleaning", week: "next" }, output: { slots: ["Tue 10:30 AM", "Wed 3:00 PM", "Fri 9:00 AM"] }, ms: 1500 },
  { say: "agent", text: "Sure, Sam. Next week I have Tuesday at 10:30, Wednesday at 3, or Friday at 9. Which works best?" },
  { say: "user", text: "Tuesday at 10:30, please." },
  { tool: "calendar.reschedule", input: { from: "Thu 2:00 PM", to: "Tue 10:30 AM" }, output: { confirmed: true }, ms: 1300 },
  { tool: "sms.send", input: { to: "+1 415 555 0142", template: "appointment-moved" }, output: { delivered: true }, ms: 700 },
  { say: "agent", text: "Done. You're booked for Tuesday at 10:30, and I've texted you a confirmation. Anything else?" },
  { say: "user", text: "No, that's it. Thanks!" },
  { say: "agent", text: "You're welcome. See you Tuesday." },
  { outcome: { title: "Appointment moved", detail: "Sam Rivera · cleaning · Tue 10:30 AM · confirmation texted" } },
]

const WORD_MS = 170
const PAUSE_MS = 700

/** A scripted session that plays `script`, for demos and for building the UI before the backend exists. */
function useSimulatedReceptionist(): ReceptionistSession {
  const [call, setCall] = React.useState<CallState>("connecting")
  const [startedAt, setStartedAt] = React.useState<number>()
  const [step, setStep] = React.useState(0)
  const [words, setWords] = React.useState(0)
  const [outcome, setOutcome] = React.useState<ReceptionistSession["outcome"]>()
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
  const actions: ReceptionistAction[] = played.flatMap((s, i) => {
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

  // A speech-like level while someone talks; the caller's side goes quiet when muted.
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
      setOutcome({ title: "Transferred to the front desk", detail: "The caller was handed to a person with the transcript." })
      setCall("ended")
    },
    end: () => setCall("ended"),
    restart: () => {
      reset()
      setCall("connecting")
    },
  }
}

export { useSimulatedReceptionist, type ReceptionistAction, type ReceptionistSession }
