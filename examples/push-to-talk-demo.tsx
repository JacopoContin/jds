"use client"

import * as React from "react"

import { Kbd } from "@/components/ui/kbd"
import { PushToTalk } from "@/components/voice/push-to-talk"
import { useSimulatedSpectrum } from "@/hooks/use-simulated-spectrum"

export default function PushToTalkDemo() {
  const [pressed, setPressed] = React.useState(false)
  const { level } = useSimulatedSpectrum(pressed)

  return (
    <div className="flex flex-col items-center gap-4">
      <PushToTalk level={level} onPressStart={() => setPressed(true)} onPressEnd={() => setPressed(false)} />
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {pressed ? (
          "Listening…"
        ) : (
          <>
            Hold the button or <Kbd>Space</Kbd>
          </>
        )}
      </p>
    </div>
  )
}
