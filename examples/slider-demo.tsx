"use client"

import * as React from "react"

import { Slider } from "@/components/ui/slider"

export default function SliderDemo() {
  const [value, setValue] = React.useState(0.7)
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <div className="flex justify-between text-sm">
        <span>Temperature</span>
        <span className="font-mono text-muted-foreground tabular-nums">{value.toFixed(1)}</span>
      </div>
      <Slider value={value} onValueChange={(v) => setValue(v as number)} min={0} max={2} step={0.1} />
    </div>
  )
}
