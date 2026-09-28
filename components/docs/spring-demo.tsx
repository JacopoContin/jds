"use client"

import * as React from "react"
import { motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { spring } from "@/lib/motion"

const rows = [
  ["snappy", "Buttons, toggles, icon swaps"],
  ["gentle", "Messages, panels, layout"],
  ["soft", "Voice orb, ambient elements"],
] as const

export function SpringDemo() {
  const [on, setOn] = React.useState(false)
  return (
    <div className="flex flex-col gap-5 rounded-xl border bg-card p-6">
      {rows.map(([name, use]) => (
        <div key={name} className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between text-xs">
            <code className="font-mono">spring.{name}</code>
            <span className="text-muted-foreground">{use}</span>
          </div>
          <div data-on={on || undefined} className="flex h-8 items-center rounded-lg bg-muted px-1 data-on:justify-end">
            <motion.div layout className="size-6 rounded-md bg-ember" transition={spring[name]} />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="self-start" onClick={() => setOn((v) => !v)}>
        Play
      </Button>
    </div>
  )
}
