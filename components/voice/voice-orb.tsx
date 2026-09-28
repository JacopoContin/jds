"use client"

import * as React from "react"
import { cn } from "cn"

type VoiceState = "idle" | "listening" | "thinking" | "speaking"

type Particle = { x: number; y: number; z: number; size: number; phase: number }

/** Per-state motion targets. Values are eased toward, so state changes never jump. */
const targets: Record<VoiceState, { spin: number; jitter: number; wave: number; scale: number }> = {
  idle: { spin: 0.12, jitter: 0, wave: 0, scale: 1 },
  listening: { spin: 0.2, jitter: 1, wave: 0, scale: 1 },
  thinking: { spin: 0.9, jitter: 0, wave: 1, scale: 0.94 },
  speaking: { spin: 0.25, jitter: 0.4, wave: 1, scale: 1 },
}

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => {
    // Uniform on the unit sphere.
    const u = Math.random() * 2 - 1
    const a = Math.random() * Math.PI * 2
    const s = Math.sqrt(1 - u * u)
    return {
      x: s * Math.cos(a),
      y: u,
      z: s * Math.sin(a),
      size: 0.9 + Math.random() ** 2.5 * 2.2,
      phase: Math.random() * Math.PI * 2,
    }
  })
}

/**
 * Presence for a voice agent: a rotating sphere of particles in the current text color.
 * Breathes when idle, scatters with `level` (0..1) while listening, spins and ripples
 * while thinking, and pulses in waves while speaking.
 */
function VoiceOrb({
  state = "idle",
  level = 0,
  size = 160,
  particles,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  state?: VoiceState
  level?: number
  size?: number
  /** Particle count. Defaults to scale with size. */
  particles?: number
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const input = React.useRef({ state, level })
  const redraw = React.useRef<(() => void) | null>(null)
  const count = particles ?? Math.round(Math.min(2400, size * 5))

  React.useEffect(() => {
    input.current = { state, level }
    redraw.current?.()
  }, [state, level])

  React.useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const px = size * dpr
    canvas.width = px
    canvas.height = px

    const points = createParticles(count)
    const cur = { ...targets.idle, level: 0, angle: 0 }
    let last = performance.now()
    let raf = 0

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const t = reduced ? 0 : now / 1000
      const { state, level } = input.current
      const target = targets[state]
      const k = reduced ? 1 : 1 - Math.exp(-dt * 6)
      cur.spin += (target.spin - cur.spin) * k
      cur.jitter += (target.jitter - cur.jitter) * k
      cur.wave += (target.wave - cur.wave) * k
      cur.scale += (target.scale - cur.scale) * k
      const targetLevel = state === "listening" || state === "speaking" ? level : 0
      cur.level += (targetLevel - cur.level) * (reduced ? 1 : 1 - Math.exp(-dt * 14))
      cur.angle += cur.spin * dt

      const breathe = 1 + Math.sin(t * 1.3) * 0.015
      const radius = px * 0.4 * cur.scale * breathe
      const c = px / 2
      const cosA = Math.cos(cur.angle)
      const sinA = Math.sin(cur.angle)
      const tilt = 0.35
      const cosT = Math.cos(tilt)
      const sinT = Math.sin(tilt)

      ctx.clearRect(0, 0, px, px)
      ctx.fillStyle = getComputedStyle(canvas).color

      for (const p of points) {
        // Spin around Y, then tilt toward the viewer so the axis reads as 3D.
        const x1 = p.x * cosA + p.z * sinA
        const z1 = -p.x * sinA + p.z * cosA
        const y2 = p.y * cosT - z1 * sinT
        const z2 = p.y * sinT + z1 * cosT

        const scatter = cur.jitter * cur.level * 0.28 * (0.5 + 0.5 * Math.sin(p.phase + t * 9))
        const ripple =
          cur.wave * (0.05 + cur.level * 0.12) * Math.sin(p.y * 5 - t * (4 + cur.level * 6) + p.phase * 0.3)
        const r = radius * (1 + scatter + ripple)

        const depth = (z2 + 1) / 2
        ctx.globalAlpha = 0.3 + depth * 0.7
        const s = p.size * dpr * (size / 320 + 0.35) * (0.65 + depth * 0.45)
        ctx.beginPath()
        ctx.arc(c + x1 * r, c + y2 * r, s / 2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      if (!reduced) raf = requestAnimationFrame(draw)
    }

    redraw.current = reduced ? () => draw(performance.now()) : null
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      redraw.current = null
    }
  }, [size, count])

  return (
    <div
      data-slot="voice-orb"
      data-state={state}
      role="img"
      aria-label={`Voice assistant ${state}`}
      className={cn("relative size-(--orb-size) text-foreground", className)}
      style={{ "--orb-size": `${size}px` } as React.CSSProperties}
      {...props}
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  )
}

export { VoiceOrb, type VoiceState }
