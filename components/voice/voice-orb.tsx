"use client"

import * as React from "react"
import { cn } from "cn"

type VoiceState = "idle" | "listening" | "thinking" | "speaking"

/** A point on the sphere in latitude/longitude, so the surface can wave along its lines. */
type Particle = { lat: number; lon: number; size: number; phase: number }

/** Per-state motion targets. Values are eased toward, so state changes never jump. */
const targets: Record<VoiceState, { spin: number; swell: number; wave: number; speed: number; scale: number }> = {
  idle: { spin: 0.1, swell: 0, wave: 0.025, speed: 0.6, scale: 1 },
  listening: { spin: 0.16, swell: 1, wave: 0.03, speed: 1.2, scale: 1 },
  thinking: { spin: 0.7, swell: 0, wave: 0.06, speed: 2.4, scale: 0.95 },
  speaking: { spin: 0.2, swell: 0.7, wave: 0.045, speed: 1.6, scale: 1 },
}

/**
 * Rings of latitude with points spaced along each ring. Slight jitter keeps the
 * mesh organic; the ring structure shows up as fine wavy lines once displaced.
 */
function createParticles(target: number): Particle[] {
  const rings = Math.max(12, Math.round(Math.sqrt((target * Math.PI) / 4)))
  const points: Particle[] = []
  for (let i = 0; i < rings; i++) {
    const lat = -Math.PI / 2 + ((i + 0.5) / rings) * Math.PI
    const perRing = Math.max(6, Math.round(rings * 2 * Math.cos(lat)))
    const offset = Math.random() * Math.PI * 2
    for (let j = 0; j < perRing; j++) {
      points.push({
        lat: lat + (Math.random() - 0.5) * (Math.PI / rings) * 0.35,
        lon: offset + (j / perRing) * Math.PI * 2,
        size: 0.8 + Math.random() ** 3 * 0.9,
        phase: Math.random() * Math.PI * 2,
      })
    }
  }
  return points
}

/**
 * Presence for a voice agent: a rotating mesh of particles in the primary color.
 * Undulates gently when idle, swells with `level` (0..1) while listening, spins
 * faster while thinking, and pulses while speaking. Edges glow brighter than the
 * center, like light catching the rim of a sphere.
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
  /** Approximate particle count. Defaults to scale with size. */
  particles?: number
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const input = React.useRef({ state, level })
  const redraw = React.useRef<(() => void) | null>(null)
  const count = particles ?? Math.round(Math.min(6000, size * size * 0.07))

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
    const cur = { ...targets.idle, level: 0, angle: 0, time: 0 }
    let last = performance.now()
    let raf = 0

    const draw = (now: number) => {
      const dt = reduced ? 0 : Math.min(0.05, (now - last) / 1000)
      last = now
      const { state, level } = input.current
      const target = targets[state]
      const k = reduced ? 1 : 1 - Math.exp(-dt * 5)
      cur.spin += (target.spin - cur.spin) * k
      cur.swell += (target.swell - cur.swell) * k
      cur.wave += (target.wave - cur.wave) * k
      cur.speed += (target.speed - cur.speed) * k
      cur.scale += (target.scale - cur.scale) * k
      const targetLevel = state === "listening" || state === "speaking" ? level : 0
      cur.level += (targetLevel - cur.level) * (reduced ? 1 : 1 - Math.exp(-dt * 12))
      cur.angle += cur.spin * dt
      cur.time += cur.speed * dt
      const t = cur.time

      const radius = px * 0.4 * cur.scale
      const c = px / 2
      const tilt = 0.3
      const cosT = Math.cos(tilt)
      const sinT = Math.sin(tilt)
      const amp = cur.wave + cur.swell * cur.level * 0.16

      ctx.clearRect(0, 0, px, px)
      ctx.fillStyle = getComputedStyle(canvas).color

      for (const p of points) {
        // Longitude snakes a little, turning rings of dots into wavy lines.
        const lon = p.lon + cur.angle + Math.sin(p.lat * 7 + t * 0.9) * 0.05
        const cosLat = Math.cos(p.lat)
        const x = cosLat * Math.cos(lon)
        const y = Math.sin(p.lat)
        const z = cosLat * Math.sin(lon)

        // Tilt toward the viewer so the rotation axis reads as 3D.
        const y2 = y * cosT - z * sinT
        const z2 = y * sinT + z * cosT

        const bump =
          Math.sin(lon * 3 + p.lat * 4 + t) * Math.sin(p.lat * 5 - t * 0.7) +
          0.5 * Math.sin(lon * 7 - t * 1.3 + p.phase * 0.2)
        const r = radius * (1 + amp * bump)

        // Front faces are brighter, and the silhouette glows.
        const facing = (z2 + 1) / 2
        const rim = 1 - Math.abs(z2)
        ctx.globalAlpha = Math.min(1, 0.12 + facing * 0.5 + rim ** 3 * 0.5)
        const s = p.size * dpr * (0.7 + facing * 0.4)
        ctx.fillRect(c + x * r - s / 2, c + y2 * r - s / 2, s, s)
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
      className={cn("relative size-(--orb-size) text-primary", className)}
      style={{ "--orb-size": `${size}px` } as React.CSSProperties}
      {...props}
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  )
}

export { VoiceOrb, type VoiceState }
