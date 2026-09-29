"use client"

import * as React from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VoiceOrb, type OrbPalette, type VoiceState } from "@/components/voice/voice-orb"
import { useSimulatedSpectrum } from "@/hooks/use-simulated-spectrum"

const palettes: OrbPalette[] = ["mist", "iris", "ember", "cocoa", "primary"]
const states: VoiceState[] = ["idle", "listening", "thinking", "speaking"]

export default function VoiceOrbAuraDemo() {
  const [state, setState] = React.useState<VoiceState>("idle")
  const { level } = useSimulatedSpectrum(state === "listening" || state === "speaking")
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="flex flex-wrap items-end justify-center gap-6">
        {palettes.map((p) => (
          <div key={p} className="flex flex-col items-center gap-3">
            <VoiceOrb variant="aura" palette={p} state={state} level={level} size={p === "ember" ? 150 : 110} />
            <code className="font-mono text-xs text-muted-foreground">{p}</code>
          </div>
        ))}
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
