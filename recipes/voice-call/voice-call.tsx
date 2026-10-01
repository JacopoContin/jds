"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { Button } from "@/components/ui/button"
import {
  CallControls,
  CallEnd,
  CallInterrupt,
  CallMute,
  CallStatus,
  type CallState,
} from "@/components/voice/call-controls"
import { VoiceOrb, type VoiceState } from "@/components/voice/voice-orb"
import { useSimulatedSpectrum } from "@/hooks/use-simulated-spectrum"
import { duration, ease } from "@/lib/motion"

/** A scripted call. In a real app these come from your realtime voice session. */
const script: { speaker: "user" | "agent"; text: string }[] = [
  { speaker: "agent", text: "Hi Sam, you've got two meetings this afternoon. Want a quick rundown?" },
  { speaker: "user", text: "Yes, and push anything after four to tomorrow." },
  { speaker: "agent", text: "Done. The design review stays at two. I moved the call with Luca to tomorrow at 9:30." },
  { speaker: "user", text: "Perfect, thanks." },
  { speaker: "agent", text: "Anytime. I'll send a summary to your inbox." },
]

export default function VoiceCall() {
  const [call, setCall] = React.useState<CallState>("connecting")
  const [startedAt, setStartedAt] = React.useState<number>()
  const [line, setLine] = React.useState(-1)
  const [words, setWords] = React.useState(0)
  const [muted, setMuted] = React.useState(false)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])

  const current = script[line]
  const speaking = current && words < current.text.split(" ").length
  const orbState: VoiceState =
    call !== "connected"
      ? "idle"
      : !current
        ? "listening"
        : current.speaker === "agent"
          ? speaking
            ? "speaking"
            : "listening"
          : speaking
            ? "listening"
            : "thinking"
  const { level } = useSimulatedSpectrum(orbState === "speaking" || (orbState === "listening" && !!speaking && !muted))

  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  React.useEffect(() => clear, [])

  // Connect, then play the script one word at a time.
  React.useEffect(() => {
    if (call !== "connecting") return
    const id = setTimeout(() => {
      setCall("connected")
      setStartedAt(Date.now())
      setLine(0)
      setWords(0)
    }, 1400)
    return () => clearTimeout(id)
  }, [call])

  React.useEffect(() => {
    if (call !== "connected" || !current) return
    const total = current.text.split(" ").length
    const id = setTimeout(
      () => {
        if (words < total) setWords((w) => w + 1)
        else if (line < script.length - 1) {
          setLine((l) => l + 1)
          setWords(0)
        }
      },
      words < total ? 190 : 900,
    )
    timers.current.push(id)
    return () => clearTimeout(id)
  }, [call, current, words, line])

  const interrupt = () => {
    // Cut the agent off: show what was said, then hand the turn to the user.
    if (current?.speaker !== "agent") return
    setWords(current.text.split(" ").length)
  }

  const restart = () => {
    clear()
    setCall("connecting")
    setLine(-1)
    setWords(0)
  }

  const caption = current ? current.text.split(" ").slice(0, words).join(" ") : ""
  const previous = line > 0 ? script[line - 1] : undefined

  return (
    <div className="relative flex h-160 max-h-dvh w-full flex-col items-center justify-between overflow-hidden rounded-2xl border bg-background px-6 py-8">
      <div className="mt-(--safe-top) flex flex-col items-center gap-1 text-center">
        <span className="text-sm font-medium">Assistant</span>
        <CallStatus state={call} startedAt={startedAt} />
      </div>

      <VoiceOrb state={orbState} level={level} size={220} />

      <div className="flex h-24 w-full max-w-md flex-col items-center justify-end gap-2 text-center" aria-live="polite">
        {call === "ended" ? (
          <p className="text-sm text-muted-foreground">Call ended. A summary is on its way.</p>
        ) : (
          <>
            {previous && <p className="line-clamp-1 text-sm text-muted-foreground/60">{previous.text}</p>}
            <AnimatePresence mode="popLayout">
              {current && (
                <motion.p
                  key={line}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: duration.base, ease: ease.out }}
                  className={current.speaker === "agent" ? "text-base" : "text-base text-muted-foreground"}
                >
                  {caption}
                </motion.p>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {call === "ended" ? (
        <Button variant="outline" className="mb-(--safe-bottom)" onClick={restart}>
          Call again
        </Button>
      ) : (
        <CallControls className="mb-(--safe-bottom)">
          <CallMute pressed={muted} onPressedChange={setMuted} />
          <CallInterrupt disabled={current?.speaker !== "agent" || !speaking} onClick={interrupt} />
          <CallEnd
            onClick={() => {
              clear()
              setCall("ended")
            }}
          />
        </CallControls>
      )}
    </div>
  )
}
