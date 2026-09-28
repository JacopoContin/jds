"use client"

import * as React from "react"
import { motion, useSpring, useTransform } from "motion/react"
import { cn } from "cn"

import { spring } from "@/lib/motion"

type VoiceState = "idle" | "listening" | "thinking" | "speaking"

/**
 * Ambient presence for a voice agent. Breathes when idle, follows `level` (0..1)
 * while listening or speaking, and orbits while thinking.
 */
function VoiceOrb({
  state = "idle",
  level = 0,
  size = 160,
  className,
  ...props
}: React.ComponentProps<"div"> & { state?: VoiceState; level?: number; size?: number }) {
  const smoothed = useSpring(level, spring.soft)
  React.useEffect(() => smoothed.set(level), [level, smoothed])
  const scale = useTransform(smoothed, [0, 1], [1, 1.28])
  const glow = useTransform(smoothed, [0, 1], [0.35, 0.9])

  return (
    <div
      data-slot="voice-orb"
      data-state={state}
      role="img"
      aria-label={`Voice assistant ${state}`}
      className={cn("relative grid size-(--orb-size) place-items-center", className)}
      style={{ "--orb-size": `${size}px` } as React.CSSProperties}
      {...props}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 scale-(--orb-scale) rounded-full bg-ember opacity-(--orb-glow) blur-2xl"
        style={{ "--orb-glow": glow, "--orb-scale": scale } as unknown as React.CSSProperties}
        animate={state === "idle" ? { opacity: [0.2, 0.35, 0.2] } : undefined}
        transition={state === "idle" ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
      />
      <motion.div
        aria-hidden
        className="relative size-3/4 scale-(--orb-scale) rounded-full bg-[radial-gradient(circle_at_35%_30%,color-mix(in_oklch,var(--ember),white_75%)_0%,var(--ember)_38%,color-mix(in_oklch,var(--ember),var(--background)_55%)_100%)] shadow-[inset_0_-8px_24px_color-mix(in_oklch,var(--background),transparent_40%)]"
        style={{ "--orb-scale": state === "listening" || state === "speaking" ? scale : 1 } as unknown as React.CSSProperties}
        animate={
          state === "thinking"
            ? { rotate: 360, borderRadius: ["50%", "46% 54% 52% 48%", "50%"] }
            : state === "idle"
              ? { scale: [1, 1.03, 1] }
              : { rotate: 0 }
        }
        transition={
          state === "thinking"
            ? { rotate: { duration: 3, repeat: Infinity, ease: "linear" }, borderRadius: { duration: 2, repeat: Infinity } }
            : state === "idle"
              ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
              : spring.gentle
        }
      />
    </div>
  )
}

export { VoiceOrb, type VoiceState }
