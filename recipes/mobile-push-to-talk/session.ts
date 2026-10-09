"use client"

import * as React from "react"

import type { TranscriptSegment } from "@/components/voice/live-transcript"

type PushToTalkState = "idle" | "recording" | "thinking" | "speaking"

/**
 * Everything <MobilePushToTalk> reads from a push-to-talk session. Record while the button is
 * held, transcribe and send on release, then play the reply. Implement it on top of your speech
 * and agent stack; `useSimulatedPushToTalk` is a scripted stand-in so the UI runs first.
 */
type PushToTalkSession = {
  state: PushToTalkState
  /** Loudness 0 to 1 of whoever is talking. */
  level: number
  /** Finished turns, plus the agent's reply as it plays. */
  transcript: TranscriptSegment[]
  /** What the mic has heard so far while the button is held. */
  draft: string
  /** Start recording. While the agent speaks, this cuts it off. */
  start: () => void
  /** Stop recording and send what was heard. */
  send: () => void
  /** Stop recording and throw it away. */
  cancel: () => void
}

/** A sample exchange, one turn per hold. Replace the whole hook with your own session. */
const turns = [
  { user: "What's on my calendar tomorrow?", agent: "Three things: the design review at 10:30, lunch with Sam, and the team sync at 4." },
  { user: "Push the team sync to Friday.", agent: "Done. It's Friday at 4, and the team has the update." },
  { user: "Thanks, that's all.", agent: "Anytime. Hold the button whenever you need me." },
]

const HEAR_MS = 260
const WORD_MS = 170
const THINK_MS = 900

const words = (text: string) => text.split(" ")

/** A scripted session that plays `turns`, for demos and for building the UI before the backend exists. */
function useSimulatedPushToTalk(): PushToTalkSession {
  const [state, setState] = React.useState<PushToTalkState>("idle")
  const [turn, setTurn] = React.useState(0)
  const [heard, setHeard] = React.useState(0)
  const [spoken, setSpoken] = React.useState(0)
  const [done, setDone] = React.useState<TranscriptSegment[]>([])
  const [level, setLevel] = React.useState(0)

  const current = turns[turn % turns.length]
  const userWords = words(current.user)
  const agentWords = words(current.agent)

  // While held, the mic "hears" the next scripted line word by word.
  React.useEffect(() => {
    if (state !== "recording" || heard >= userWords.length) return
    const id = setTimeout(() => setHeard((h) => h + 1), HEAR_MS)
    return () => clearTimeout(id)
  }, [state, heard, userWords.length])

  React.useEffect(() => {
    if (state !== "thinking") return
    const id = setTimeout(() => setState("speaking"), THINK_MS)
    return () => clearTimeout(id)
  }, [state])

  // Play the reply, then hand the turn back to the user.
  React.useEffect(() => {
    if (state !== "speaking") return
    const id = setTimeout(() => {
      if (spoken < agentWords.length) return setSpoken((s) => s + 1)
      setDone((d) => [...d, { id: `${turn}-agent`, speaker: "agent", text: current.agent, final: true }])
      setSpoken(0)
      setTurn((t) => t + 1)
      setState("idle")
    }, WORD_MS)
    return () => clearTimeout(id)
  }, [state, spoken, agentWords.length, turn, current.agent])

  // A speech-like level while someone talks.
  React.useEffect(() => {
    if (state !== "recording" && state !== "speaking") {
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
  }, [state])

  const replying: TranscriptSegment[] =
    state === "speaking" && spoken > 0
      ? [{ id: `${turn}-agent`, speaker: "agent", text: agentWords.slice(0, spoken).join(" "), final: false }]
      : []

  return {
    state,
    level,
    transcript: [...done, ...replying],
    draft: state === "recording" ? userWords.slice(0, heard).join(" ") : "",
    start: () => {
      if (state === "thinking") return
      if (state === "speaking") {
        // Cut the agent off: keep what it said, move on to the next turn.
        const said = agentWords.slice(0, spoken).join(" ")
        if (said) setDone((d) => [...d, { id: `${turn}-agent`, speaker: "agent", text: said, final: true }])
        setSpoken(0)
        setTurn((t) => t + 1)
      }
      setHeard(0)
      setState("recording")
    },
    send: () => {
      if (state !== "recording") return
      // A tap with nothing heard sends nothing.
      if (heard === 0) return setState("idle")
      setDone((d) => [...d, { id: `${turn}-user`, speaker: "user", text: current.user, final: true }])
      setHeard(0)
      setState("thinking")
    },
    cancel: () => {
      if (state !== "recording") return
      setHeard(0)
      setState("idle")
    },
  }
}

export { useSimulatedPushToTalk, type PushToTalkSession, type PushToTalkState }
