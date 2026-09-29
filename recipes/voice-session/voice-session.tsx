"use client"

import * as React from "react"

import { Kbd } from "@/components/ui/kbd"
import { LiveTranscript, type TranscriptSegment } from "@/components/voice/live-transcript"
import { PushToTalk } from "@/components/voice/push-to-talk"
import { VoiceOrb, type VoiceState } from "@/components/voice/voice-orb"
import { Waveform } from "@/components/voice/waveform"
import { useAudioLevel } from "@/hooks/use-audio-level"
import { useSimulatedSpectrum } from "@/hooks/use-simulated-spectrum"

const USER_LINE = "Move my 3pm with Luca to tomorrow morning."
const AGENT_LINE = "Done. You're meeting Luca tomorrow at 9:30. I've sent him the updated invite."
const BANDS = 28

export default function VoiceSession() {
  const mic = useAudioLevel({ bands: BANDS })
  const [state, setState] = React.useState<VoiceState>("idle")
  const [segments, setSegments] = React.useState<TranscriptSegment[]>([])
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const typing = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const simulate = state === "speaking" || (state === "listening" && !mic.active)
  const { spectrum: synthetic } = useSimulatedSpectrum(simulate, BANDS)
  const spectrum = state === "listening" && mic.active ? mic.spectrum : synthetic
  const level = Math.min(1, (spectrum.reduce((a, b) => a + b, 0) / BANDS) * 2.2)

  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (typing.current) clearInterval(typing.current)
  }

  const typeInto = (id: string, text: string, speed: number, onDone?: () => void) => {
    let i = 0
    typing.current = setInterval(() => {
      i += 1
      const words = text.split(" ")
      setSegments((prev) =>
        prev.map((s) => (s.id === id ? { ...s, text: words.slice(0, i).join(" "), final: i >= words.length } : s))
      )
      if (i >= words.length) {
        if (typing.current) clearInterval(typing.current)
        onDone?.()
      }
    }, speed)
  }

  const onPressStart = () => {
    clear()
    void mic.start()
    setState("listening")
    const id = `u-${Date.now()}`
    setSegments([{ id, speaker: "user", text: "", final: false }])
    typeInto(id, USER_LINE, 200)
  }

  const onPressEnd = () => {
    mic.stop()
    if (typing.current) clearInterval(typing.current)
    setSegments((prev) => prev.map((s) => (s.speaker === "user" ? { ...s, text: USER_LINE, final: true } : s)))
    setState("thinking")
    timers.current.push(
      setTimeout(() => {
        setState("speaking")
        const id = `a-${Date.now()}`
        setSegments((prev) => [...prev, { id, speaker: "agent", text: "", final: false }])
        typeInto(id, AGENT_LINE, 170, () => timers.current.push(setTimeout(() => setState("idle"), 400)))
      }, 1400)
    )
  }

  React.useEffect(() => clear, [])

  return (
    <div className="grid w-full overflow-hidden rounded-2xl border bg-card md:grid-cols-2">
      <div className="relative flex flex-col items-center justify-center gap-8 border-b p-10 md:border-r md:border-b-0">
        <VoiceOrb state={state} level={level} size={180} />
        <Waveform spectrum={spectrum} active={state === "listening" || state === "speaking"} className="w-56" />
        <div className="flex flex-col items-center gap-3">
          <PushToTalk onPressStart={onPressStart} onPressEnd={onPressEnd} level={level} />
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Hold the button or <Kbd>Space</Kbd>
          </p>
        </div>
      </div>
      <div className="flex min-h-80 flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Transcript</span>
          <span className="font-mono text-xs text-foreground">{state}</span>
        </div>
        {segments.length === 0 ? (
          <p className="my-auto text-center text-sm text-muted-foreground">
            Speak to the scheduling agent. Mic access is optional: the demo simulates input if you decline.
          </p>
        ) : (
          <LiveTranscript segments={segments} agentName="Agent" />
        )}
      </div>
    </div>
  )
}
