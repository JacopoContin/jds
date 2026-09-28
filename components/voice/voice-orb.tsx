"use client"

import * as React from "react"
import { cn } from "cn"

type VoiceState = "idle" | "listening" | "thinking" | "speaking"

/** 4x4 ordered-dither thresholds. Turns smooth gradients into pixel patterns. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16)

const HIGHLIGHT = "oklch(0.97 0.03 80)"

/**
 * Pixelated presence for a voice agent. Renders on a low-res canvas with ordered
 * dithering, scaled up without smoothing. Breathes when idle, swells with `level`
 * (0..1) while listening or speaking, and ripples while thinking.
 */
function VoiceOrb({
  state = "idle",
  level = 0,
  size = 160,
  resolution = 32,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  state?: VoiceState
  level?: number
  size?: number
  /** Pixels across. Lower is chunkier. */
  resolution?: number
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const input = React.useRef({ state, level })
  const redraw = React.useRef<(() => void) | null>(null)

  React.useEffect(() => {
    input.current = { state, level }
  }, [state, level])

  React.useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const n = resolution
    const c = n / 2
    const base = n * 0.3
    let smooth = 0
    let raf = 0

    const draw = (now: number) => {
      const t = reduced ? 0 : now
      const { state, level } = input.current
      const active = state === "listening" || state === "speaking"
      const target = active ? level : 0
      smooth = reduced ? target : smooth + (target - smooth) * 0.18

      const breathe = state === "idle" ? Math.sin(t / 700) * 0.04 : 0
      const r0 = base * (1 + breathe + smooth * 0.32)
      const ripple = state === "thinking" ? 0.1 : active ? smooth * 0.08 : 0
      const glow = state === "idle" ? 0.35 + Math.sin(t / 700) * 0.1 : state === "thinking" ? 0.5 : 0.45 + smooth * 0.8

      const ember = getComputedStyle(canvas).getPropertyValue("--ember").trim() || "orange"

      ctx.clearRect(0, 0, n, n)
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          const dx = x + 0.5 - c
          const dy = y + 0.5 - c
          const d = Math.hypot(dx, dy)
          const a = Math.atan2(dy, dx)
          const r = r0 * (1 + ripple * Math.sin(a * 3 + t / 260) * Math.sin(a * 2 - t / 410))
          const threshold = BAYER[(y % 4) * 4 + (x % 4)]

          if (d <= r) {
            // Light from the upper left: 1 at the highlight, falling to 0 at the far rim.
            const hx = dx + r * 0.35
            const hy = dy + r * 0.4
            const light = 1 - Math.hypot(hx, hy) / (r * 1.7)
            if (light * 2.2 - 1.45 > threshold) {
              ctx.fillStyle = HIGHLIGHT
              ctx.globalAlpha = 1
            } else if (light * 1.6 + 0.05 > threshold) {
              ctx.fillStyle = ember
              ctx.globalAlpha = 1
            } else {
              ctx.fillStyle = ember
              ctx.globalAlpha = 0.55
            }
            ctx.fillRect(x, y, 1, 1)
          } else {
            const halo = (1 - (d - r) / (r * 0.7)) * glow
            if (halo > threshold) {
              ctx.fillStyle = ember
              ctx.globalAlpha = 0.3
              ctx.fillRect(x, y, 1, 1)
            }
          }
        }
      }
      ctx.globalAlpha = 1
      if (!reduced) raf = requestAnimationFrame(draw)
    }

    redraw.current = reduced ? () => draw(0) : null
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      redraw.current = null
    }
  }, [resolution])

  // Reduced motion draws one frame per change instead of looping.
  React.useEffect(() => {
    redraw.current?.()
  }, [state, level])

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
      <canvas ref={canvasRef} width={resolution} height={resolution} className="size-full [image-rendering:pixelated]" />
    </div>
  )
}

export { VoiceOrb, type VoiceState }
