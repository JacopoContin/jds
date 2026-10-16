"use client"

import * as React from "react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { VoiceGlow } from "@/components/voice/voice-glow"
import type { VoiceState } from "@/components/voice/voice-orb"
import { useSimulatedSpectrum } from "@/hooks/use-simulated-spectrum"

const states: VoiceState[] = ["idle", "listening", "thinking", "speaking"]

export default function VoiceGlowDemo() {
  const [state, setState] = React.useState<VoiceState>("speaking")
  const talking = state === "listening" || state === "speaking"
  const { level } = useSimulatedSpectrum(talking, 8)

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="relative isolate flex h-64 w-full max-w-sm items-end justify-center overflow-hidden rounded-4xl border bg-background pb-6">
        <VoiceGlow state={state} level={talking ? level : 0} />
        <p className="text-sm text-muted-foreground">{state === "thinking" ? "Thinking…" : "Set a timer for ten minutes"}</p>
      </div>
      <ToggleGroup value={[state]} onValueChange={(v) => v[0] && setState(v[0] as VoiceState)} variant="outline" size="sm">
        {states.map((s) => (
          <ToggleGroupItem key={s} value={s}>
            {s[0].toUpperCase() + s.slice(1)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
