"use client"

import * as React from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VoiceOrb, type VoiceState } from "@/components/voice/voice-orb"
import { useSimulatedSpectrum } from "@/hooks/use-simulated-spectrum"

const states: VoiceState[] = ["idle", "listening", "thinking", "speaking"]

export default function VoiceOrbVariantsDemo() {
  const [state, setState] = React.useState<VoiceState>("listening")
  const { level } = useSimulatedSpectrum(state === "listening" || state === "speaking")

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-wrap items-center justify-center gap-12">
        <div className="flex flex-col items-center gap-3">
          <VoiceOrb variant="particles" state={state} level={level} size={180} />
          <code className="font-mono text-xs text-muted-foreground">particles</code>
        </div>
        <div className="flex flex-col items-center gap-3">
          <VoiceOrb variant="ring" state={state} level={level} size={180} />
          <code className="font-mono text-xs text-muted-foreground">ring</code>
        </div>
        <div className="flex flex-col items-center gap-3">
          <VoiceOrb variant="wave" state={state} level={level} size={120} />
          <code className="font-mono text-xs text-muted-foreground">wave</code>
        </div>
      </div>
      <Tabs value={state} onValueChange={(v) => setState(v as VoiceState)}>
        <TabsList>
          {states.map((s) => (
            <TabsTrigger key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
