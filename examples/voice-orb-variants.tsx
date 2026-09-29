"use client"

import * as React from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VoiceOrb, type VoiceOrbVariant, type VoiceState } from "@/components/voice/voice-orb"
import { useSimulatedSpectrum } from "@/hooks/use-simulated-spectrum"

const states: VoiceState[] = ["idle", "listening", "thinking", "speaking"]
const variants: VoiceOrbVariant[] = ["particles", "ring", "aura", "plasma", "liquid", "bars", "halftone", "wave"]

export default function VoiceOrbVariantsDemo() {
  const [state, setState] = React.useState<VoiceState>("listening")
  const { level } = useSimulatedSpectrum(state === "listening" || state === "speaking")

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="grid w-full grid-cols-2 gap-8 sm:grid-cols-4">
        {variants.map((v) => (
          <div key={v} className="flex flex-col items-center justify-end gap-3">
            <VoiceOrb variant={v} state={state} level={level} size={v === "wave" ? 70 : 130} />
            <code className="font-mono text-xs text-muted-foreground">{v}</code>
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
