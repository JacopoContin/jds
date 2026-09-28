"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  CallControls,
  CallEnd,
  CallInterrupt,
  CallMute,
  CallStatus,
  type CallState,
} from "@/components/voice/call-controls"
import { VoiceOrb } from "@/components/voice/voice-orb"
import { useSimulatedSpectrum } from "@/hooks/use-simulated-spectrum"

export default function CallControlsDemo() {
  const [state, setState] = React.useState<CallState>("connecting")
  const [startedAt, setStartedAt] = React.useState<number>()
  const [speaking, setSpeaking] = React.useState(true)
  const { level } = useSimulatedSpectrum(state === "connected" && speaking)

  React.useEffect(() => {
    if (state !== "connecting") return
    const id = setTimeout(() => {
      setState("connected")
      setStartedAt(Date.now())
    }, 1200)
    return () => clearTimeout(id)
  }, [state])

  return (
    <div className="flex flex-col items-center gap-6">
      <VoiceOrb
        state={state === "connected" ? (speaking ? "speaking" : "listening") : "idle"}
        level={level}
        size={140}
      />
      {state === "ended" ? (
        <Button variant="outline" onClick={() => setState("connecting")}>
          Call again
        </Button>
      ) : (
        <CallControls>
          <CallStatus state={state} startedAt={startedAt} />
          <CallMute onPressedChange={(muted) => toast(muted ? "Muted" : "Unmuted")} />
          <CallInterrupt disabled={!speaking || state !== "connected"} onClick={() => setSpeaking(false)} />
          <CallEnd onClick={() => setState("ended")} />
        </CallControls>
      )}
    </div>
  )
}
