"use client"

import { AmbientBackground } from "@/components/effects/ambient-background"

export default function AmbientBackgroundDemo() {
  return (
    <div className="relative isolate grid h-80 w-full place-items-center overflow-hidden rounded-xl border bg-background">
      <AmbientBackground variant="mesh" grain={0.3} />
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-lg font-medium">Good morning</p>
        <p className="text-sm text-muted-foreground">What should we work on?</p>
      </div>
    </div>
  )
}
