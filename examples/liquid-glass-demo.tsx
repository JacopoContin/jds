"use client"

import { AmbientBackground } from "@/components/effects/ambient-background"
import { LiquidGlass } from "@/components/effects/liquid-glass"
import { CloseIcon, MicIcon, AddIcon } from "@/lib/icons"

const lines = [
  "Set a timer for ten minutes",
  "Remind me to water the plants",
  "What's on my calendar tomorrow?",
  "Move the design review to 10:30",
  "Draft a reply to Luca",
  "Summarize this thread",
]

export default function LiquidGlassDemo() {
  return (
    <div className="relative isolate flex h-80 w-full max-w-xl flex-col items-center justify-end gap-4 overflow-hidden rounded-3xl border bg-background p-6">
      <AmbientBackground variant="mesh" intensity={0.9} />
      {/* Busy content behind the glass, so the blur and the bent edges have something to show. */}
      <div aria-hidden className="absolute inset-0 -z-10 flex flex-col justify-center gap-3 px-8 text-2xl font-semibold text-foreground/70">
        {lines.map((l) => (
          <p key={l} className="truncate">
            {l}
          </p>
        ))}
      </div>
      <LiquidGlass blur={1} className="w-full max-w-sm rounded-3xl px-5 py-4 text-sm">
        Liquid glass blurs and tints what&apos;s behind it, and bends it at the rim in Chromium.
      </LiquidGlass>
      <LiquidGlass className="flex items-center gap-1 rounded-full p-1.5">
        {[AddIcon, MicIcon, CloseIcon].map((Icon, i) => (
          <button
            key={i}
            type="button"
            aria-label={["Add", "Mute", "Close"][i]}
            className="grid size-11 place-items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:bg-foreground/10"
          >
            <Icon className="size-5" />
          </button>
        ))}
      </LiquidGlass>
    </div>
  )
}
