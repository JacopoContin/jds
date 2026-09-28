"use client"

import * as React from "react"
import { motion } from "motion/react"
import { cn } from "cn"

/** Symmetric bar waveform. Pass `spectrum` (0..1 per band) from `useAudioLevel`. */
function Waveform({
  spectrum,
  active = true,
  className,
  ...props
}: React.ComponentProps<"div"> & { spectrum: number[]; active?: boolean }) {
  return (
    <div
      data-slot="waveform"
      aria-hidden
      className={cn("flex h-10 items-center justify-center gap-0.75", className)}
      {...props}
    >
      {spectrum.map((v, i) => (
        <motion.span
          key={i}
          className={cn("w-0.75 rounded-full", active ? "bg-ember" : "bg-muted-foreground/40")}
          animate={{ height: `${Math.max(12, (active ? v : 0) * 100)}%` }}
          transition={{ type: "spring", stiffness: 600, damping: 30, mass: 0.3 }}
        />
      ))}
    </div>
  )
}

export { Waveform }
