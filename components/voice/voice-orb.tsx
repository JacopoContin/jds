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

type OrbProps = React.ComponentProps<"div"> & {
  state?: VoiceState
  /** Input or output loudness, 0 to 1. */
  level?: number
  /** Rendered size in px. */
  size?: number
}

/**
 * Rotating mesh of particles. Undulates gently when idle, swells with `level` while
 * listening, spins faster while thinking, and pulses while speaking. Edges glow
 * brighter than the center, like light catching the rim of a sphere.
 */
function ParticleOrb({
  state = "idle",
  level = 0,
  size = 160,
  particles,
  className,
  ...props
}: OrbProps & {
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
      data-variant="particles"
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

/** Per-state targets for the ring. */
const ringTargets: Record<VoiceState, { wobble: number; spin: number; scale: number; width: number }> = {
  idle: { wobble: 0.018, spin: 0.15, scale: 1, width: 1 },
  listening: { wobble: 0.03, spin: 0.25, scale: 1, width: 1.2 },
  thinking: { wobble: 0.035, spin: 1.6, scale: 0.94, width: 0.9 },
  speaking: { wobble: 0.03, spin: 0.35, scale: 1, width: 1.3 },
}

const RING_POINTS = 120

/**
 * A soft glowing ring. Its outline wobbles like a membrane, stretching with `level`
 * while listening or speaking; the light sweeps around it faster while thinking.
 * Brightest along the bottom edge. Drawn as SVG, so it stays sharp at any size.
 */
function RingOrb({ state = "idle", level = 0, size = 160, className, ...props }: OrbProps) {
  const id = React.useId().replace(/:/g, "")
  const coreRef = React.useRef<SVGPathElement>(null)
  const glowRef = React.useRef<SVGPathElement>(null)
  const haloRef = React.useRef<SVGPathElement>(null)
  const gradientRef = React.useRef<SVGLinearGradientElement>(null)
  const input = React.useRef({ state, level })
  const redraw = React.useRef<(() => void) | null>(null)

  React.useEffect(() => {
    input.current = { state, level }
    redraw.current?.()
  }, [state, level])

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const cur = { ...ringTargets.idle, level: 0, time: 0, angle: 0 }
    let last = performance.now()
    let raf = 0

    const draw = (now: number) => {
      const dt = reduced ? 0 : Math.min(0.05, (now - last) / 1000)
      last = now
      const { state, level } = input.current
      const target = ringTargets[state]
      const k = reduced ? 1 : 1 - Math.exp(-dt * 5)
      cur.wobble += (target.wobble - cur.wobble) * k
      cur.spin += (target.spin - cur.spin) * k
      cur.scale += (target.scale - cur.scale) * k
      cur.width += (target.width - cur.width) * k
      const targetLevel = state === "listening" || state === "speaking" ? level : 0
      cur.level += (targetLevel - cur.level) * (reduced ? 1 : 1 - Math.exp(-dt * 12))
      cur.time += dt
      cur.angle += cur.spin * dt
      const t = cur.time

      const amp = cur.wobble + cur.level * 0.045
      const radius = 38 * cur.scale * (1 + cur.level * 0.06 + Math.sin(t * 1.2) * 0.008)
      let d = ""
      for (let i = 0; i <= RING_POINTS; i++) {
        const a = (i / RING_POINTS) * Math.PI * 2
        const r =
          radius *
          (1 +
            amp * Math.sin(a * 2 + t * 0.9) +
            amp * 0.6 * Math.sin(a * 3 - t * 1.3 + 1.7) +
            cur.level * 0.02 * Math.sin(a * 6 + t * 5))
        const x = 50 + Math.cos(a) * r
        const y = 50 + Math.sin(a) * r
        d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`
      }
      d += "Z"
      coreRef.current?.setAttribute("d", d)
      glowRef.current?.setAttribute("d", d)
      haloRef.current?.setAttribute("d", d)
      coreRef.current?.setAttribute("stroke-width", (1.8 * cur.width).toFixed(2))
      glowRef.current?.setAttribute("stroke-width", (5 * cur.width + cur.level * 3).toFixed(2))
      haloRef.current?.setAttribute("stroke-width", (10 + cur.level * 6).toFixed(2))
      gradientRef.current?.setAttribute(
        "gradientTransform",
        `rotate(${((cur.angle * 180) / Math.PI).toFixed(1)} 0.5 0.5)`,
      )
      if (!reduced) raf = requestAnimationFrame(draw)
    }

    redraw.current = reduced ? () => draw(performance.now()) : null
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      redraw.current = null
    }
  }, [])

  return (
    <div
      data-slot="voice-orb"
      data-variant="ring"
      data-state={state}
      role="img"
      aria-label={`Voice assistant ${state}`}
      className={cn("relative size-(--orb-size) text-primary", className)}
      style={{ "--orb-size": `${size}px` } as React.CSSProperties}
      {...props}
    >
      <svg viewBox="0 0 100 100" className="size-full overflow-visible">
        <defs>
          {/* Dim at the top, full strength at the bottom; rotated to sweep the light around. */}
          <linearGradient ref={gradientRef} id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.25" />
            <stop offset="0.6" stopColor="currentColor" stopOpacity="0.7" />
            <stop offset="1" stopColor="currentColor" stopOpacity="1" />
          </linearGradient>
          <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
          <filter id={`${id}-halo`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <path ref={haloRef} fill="none" stroke={`url(#${id}-g)`} filter={`url(#${id}-halo)`} opacity="0.35" />
        <path ref={glowRef} fill="none" stroke={`url(#${id}-g)`} filter={`url(#${id}-blur)`} opacity="0.85" />
        <path ref={coreRef} fill="none" stroke={`url(#${id}-g)`} strokeLinejoin="round" />
      </svg>
    </div>
  )
}

/** Per-state targets for the wave. `amp` is ribbon height; `speed` is how fast they travel. */
const waveTargets: Record<VoiceState, { amp: number; speed: number; twist: number }> = {
  idle: { amp: 0.14, speed: 0.6, twist: 0.8 },
  listening: { amp: 0.22, speed: 1.2, twist: 1 },
  thinking: { amp: 0.1, speed: 3.2, twist: 1.6 },
  speaking: { amp: 0.26, speed: 1.8, twist: 1.1 },
}

/** Each ribbon: frequency, phase offset, travel direction, and fill strength. */
const RIBBONS = [
  { k: 2.1, phase: 0, dir: 1, fill: 0.22 },
  { k: 2.6, phase: 1.9, dir: -1, fill: 0.16 },
  { k: 1.7, phase: 3.4, dir: 1, fill: 0.12 },
  { k: 3.1, phase: 4.6, dir: -1, fill: 0.1 },
  { k: 2.3, phase: 5.8, dir: 1, fill: 0.08 },
]
const WAVE_SAMPLES = 90

/**
 * Glowing ribbons that twist around a centre line and taper to a flat line at both
 * ends. They rise with `level` while listening or speaking and race while thinking.
 * Wider than it is tall: 2x `size` wide and 0.6x tall, capped to its container's width.
 */
function WaveOrb({ state = "idle", level = 0, size = 160, className, ...props }: OrbProps) {
  const id = React.useId().replace(/:/g, "")
  const fillRefs = React.useRef<(SVGPathElement | null)[]>([])
  const edgeRefs = React.useRef<(SVGPathElement | null)[]>([])
  const input = React.useRef({ state, level })
  const redraw = React.useRef<(() => void) | null>(null)

  React.useEffect(() => {
    input.current = { state, level }
    redraw.current?.()
  }, [state, level])

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const cur = { ...waveTargets.idle, level: 0, time: 0 }
    let last = performance.now()
    let raf = 0
    const W = 200
    const C = 50

    const draw = (now: number) => {
      const dt = reduced ? 0 : Math.min(0.05, (now - last) / 1000)
      last = now
      const { state, level } = input.current
      const target = waveTargets[state]
      const k = reduced ? 1 : 1 - Math.exp(-dt * 4)
      cur.amp += (target.amp - cur.amp) * k
      cur.speed += (target.speed - cur.speed) * k
      cur.twist += (target.twist - cur.twist) * k
      const targetLevel = state === "listening" || state === "speaking" ? level : 0
      cur.level += (targetLevel - cur.level) * (reduced ? 1 : 1 - Math.exp(-dt * 10))
      cur.time += cur.speed * dt
      const t = cur.time
      const height = Math.min(44, (cur.amp + cur.level * 0.3) * 100)

      RIBBONS.forEach((r, i) => {
        let top = ""
        let bottom = ""
        let edge = ""
        for (let j = 0; j <= WAVE_SAMPLES; j++) {
          const u = j / WAVE_SAMPLES
          const x = u * W
          // Gaussian envelope pins both ends to the centre line.
          const env = Math.exp(-(((u - 0.5) / 0.24) ** 2))
          const a = u * Math.PI * 2 * r.k + r.phase + t * r.dir
          const y1 = C + Math.sin(a) * height * env
          const y2 = C + Math.sin(a + cur.twist) * height * env * 0.8
          top += `${j === 0 ? "M" : "L"}${x.toFixed(1)} ${y1.toFixed(2)}`
          bottom = `L${x.toFixed(1)} ${y2.toFixed(2)}` + bottom
          edge += `${j === 0 ? "M" : "L"}${x.toFixed(1)} ${y1.toFixed(2)}`
        }
        fillRefs.current[i]?.setAttribute("d", top + bottom + "Z")
        edgeRefs.current[i]?.setAttribute("d", edge)
      })
      if (!reduced) raf = requestAnimationFrame(draw)
    }

    redraw.current = reduced ? () => draw(performance.now()) : null
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      redraw.current = null
    }
  }, [])

  return (
    <div
      data-slot="voice-orb"
      data-variant="wave"
      data-state={state}
      role="img"
      aria-label={`Voice assistant ${state}`}
      className={cn(
        "relative h-[calc(var(--orb-size)*0.6)] w-[calc(var(--orb-size)*2)] max-w-full text-primary",
        className,
      )}
      style={{ "--orb-size": `${size}px` } as React.CSSProperties}
      {...props}
    >
      <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="size-full overflow-visible">
        <defs>
          {/* Fade the ends into the flat centre line. */}
          <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.25" stopColor="currentColor" stopOpacity="1" />
            <stop offset="0.75" stopColor="currentColor" stopOpacity="1" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
          <filter id={`${id}-glow`} x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="1.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter={`url(#${id}-glow)`}>
          <line x1="0" y1="50" x2="200" y2="50" stroke={`url(#${id}-fade)`} strokeWidth="0.8" opacity="0.8" />
          {RIBBONS.map((r, i) => (
            <g key={i}>
              <path
                ref={(el) => {
                  fillRefs.current[i] = el
                }}
                fill={`url(#${id}-fade)`}
                fillOpacity={r.fill}
              />
              <path
                ref={(el) => {
                  edgeRefs.current[i] = el
                }}
                fill="none"
                stroke={`url(#${id}-fade)`}
                strokeWidth={i === 0 ? 0.9 : 0.5}
                strokeOpacity={i === 0 ? 0.95 : 0.6}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}

/**
 * Shared animation loop for orbs: eases numeric targets per state (k per second),
 * smooths `level`, advances time, and calls `draw` each frame. With reduced motion
 * it jumps to targets and draws once per change.
 */
function useOrbLoop<T extends Record<string, number>>(
  state: VoiceState,
  level: number,
  targets: Record<VoiceState, T>,
  draw: (cur: T & { level: number; time: number }, reduced: boolean) => void,
) {
  const input = React.useRef({ state, level })
  const drawRef = React.useRef(draw)
  const redraw = React.useRef<(() => void) | null>(null)

  React.useEffect(() => {
    drawRef.current = draw
  })

  React.useEffect(() => {
    input.current = { state, level }
    redraw.current?.()
  }, [state, level])

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const cur = { ...targets.idle, level: 0, time: 0 } as T & { level: number; time: number }
    let last = performance.now()
    let raf = 0
    const frame = (now: number) => {
      const dt = reduced ? 0 : Math.min(0.05, (now - last) / 1000)
      last = now
      const { state, level } = input.current
      const target = targets[state]
      const k = reduced ? 1 : 1 - Math.exp(-dt * 5)
      for (const key of Object.keys(target) as (keyof T)[]) {
        ;(cur[key] as number) += ((target[key] as number) - (cur[key] as number)) * k
      }
      const targetLevel = state === "listening" || state === "speaking" ? level : 0
      cur.level += (targetLevel - cur.level) * (reduced ? 1 : 1 - Math.exp(-dt * 12))
      cur.time += dt
      drawRef.current(cur, reduced)
      if (!reduced) raf = requestAnimationFrame(frame)
    }
    redraw.current = reduced ? () => frame(performance.now()) : null
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      redraw.current = null
    }
  }, [targets])
}

function orbFrame(
  variant: string,
  state: VoiceState,
  size: number,
  className: string | undefined,
  props: React.ComponentProps<"div">,
  children: React.ReactNode,
) {
  return (
    <div
      data-slot="voice-orb"
      data-variant={variant}
      data-state={state}
      role="img"
      aria-label={`Voice assistant ${state}`}
      className={cn("relative size-(--orb-size) text-primary", className)}
      style={{ "--orb-size": `${size}px` } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  )
}

/* ---------- Aura: soft blobs drifting inside a circle ---------- */

const auraTargets: Record<VoiceState, { speed: number; spread: number; scale: number; glow: number }> = {
  idle: { speed: 0.35, spread: 0.16, scale: 1, glow: 0.35 },
  listening: { speed: 0.7, spread: 0.2, scale: 1.02, glow: 0.5 },
  thinking: { speed: 1.8, spread: 0.24, scale: 0.94, glow: 0.4 },
  speaking: { speed: 0.9, spread: 0.18, scale: 1.04, glow: 0.6 },
}

const AURA_BLOBS = [
  { r: 26, w: 0.9, phase: 0, opacity: 0.95 },
  { r: 22, w: -1.2, phase: 2.1, opacity: 0.6 },
  { r: 18, w: 1.6, phase: 4.2, opacity: 0.45 },
]

/**
 * Soft, blurred blobs of the primary color drifting inside a circle. They swirl
 * faster while thinking and swell with `level` while listening or speaking.
 */
function AuraOrb({ state = "idle", level = 0, size = 160, className, ...props }: OrbProps) {
  const id = React.useId().replace(/:/g, "")
  const blobs = React.useRef<(SVGCircleElement | null)[]>([])
  const halo = React.useRef<SVGCircleElement>(null)
  const body = React.useRef<SVGGElement>(null)

  useOrbLoop(state, level, auraTargets, (c) => {
    const t = c.time * c.speed
    AURA_BLOBS.forEach((b, i) => {
      const el = blobs.current[i]
      if (!el) return
      const orbit = 50 * c.spread * (1 + c.level * 0.6)
      el.setAttribute("cx", (50 + Math.cos(t * b.w + b.phase) * orbit).toFixed(2))
      el.setAttribute("cy", (50 + Math.sin(t * b.w * 0.8 + b.phase) * orbit).toFixed(2))
      el.setAttribute("r", (b.r * (1 + c.level * 0.35 + Math.sin(t * 1.3 + b.phase) * 0.05)).toFixed(2))
    })
    halo.current?.setAttribute("opacity", (c.glow + c.level * 0.3).toFixed(2))
    body.current?.setAttribute(
      "transform",
      `translate(50 50) scale(${(c.scale * (1 + c.level * 0.05)).toFixed(3)}) translate(-50 -50)`,
    )
  })

  return orbFrame(
    "aura",
    state,
    size,
    className,
    props,
    <svg viewBox="0 0 100 100" className="size-full overflow-visible">
      <defs>
        <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id={`${id}-halo`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <clipPath id={`${id}-clip`}>
          <circle cx="50" cy="50" r="40" />
        </clipPath>
      </defs>
      <circle ref={halo} cx="50" cy="50" r="38" fill="currentColor" filter={`url(#${id}-halo)`} opacity="0.35" />
      <g ref={body}>
        <circle cx="50" cy="50" r="40" fill="currentColor" opacity="0.12" />
        <g clipPath={`url(#${id}-clip)`} filter={`url(#${id}-soft)`}>
          {AURA_BLOBS.map((b, i) => (
            <circle
              key={i}
              ref={(el) => {
                blobs.current[i] = el
              }}
              cx="50"
              cy="50"
              r={b.r}
              fill="currentColor"
              opacity={b.opacity}
            />
          ))}
        </g>
      </g>
    </svg>,
  )
}

/* ---------- Bars: circular equalizer ---------- */

const barsTargets: Record<VoiceState, { base: number; speed: number; sweep: number; spin: number }> = {
  idle: { base: 0.08, speed: 1, sweep: 0, spin: 0.1 },
  listening: { base: 0.1, speed: 2.4, sweep: 0, spin: 0.15 },
  thinking: { base: 0.12, speed: 1.5, sweep: 1, spin: 1.4 },
  speaking: { base: 0.12, speed: 3, sweep: 0, spin: 0.2 },
}

const BAR_COUNT = 56

/**
 * Bars around a ring, like a circular equalizer. Bar length follows `level` while
 * listening or speaking; a bright arc sweeps around it while thinking.
 */
function BarsOrb({ state = "idle", level = 0, size = 160, className, ...props }: OrbProps) {
  const bars = React.useRef<(SVGLineElement | null)[]>([])
  const angle = React.useRef(0)

  useOrbLoop(state, level, barsTargets, (c) => {
    angle.current += c.spin * 0.016
    const t = c.time * c.speed
    for (let i = 0; i < BAR_COUNT; i++) {
      const el = bars.current[i]
      if (!el) continue
      const a = (i / BAR_COUNT) * Math.PI * 2 + angle.current
      const noise = 0.5 + 0.5 * Math.sin(i * 1.7 + t) * Math.sin(i * 0.6 - t * 1.3)
      const len = 30 * (c.base + (0.15 + c.level * 0.85) * noise * (0.3 + c.level))
      const r0 = 26
      el.setAttribute("x1", (50 + Math.cos(a) * r0).toFixed(2))
      el.setAttribute("y1", (50 + Math.sin(a) * r0).toFixed(2))
      el.setAttribute("x2", (50 + Math.cos(a) * (r0 + 1.5 + len)).toFixed(2))
      el.setAttribute("y2", (50 + Math.sin(a) * (r0 + 1.5 + len)).toFixed(2))
      // While thinking, a highlight travels around the ring.
      const head = ((c.time * 0.9) % 1) * BAR_COUNT
      const dist = Math.min(Math.abs(i - head), BAR_COUNT - Math.abs(i - head))
      const lit = c.sweep * Math.max(0, 1 - dist / 10)
      el.setAttribute("opacity", Math.min(1, 0.35 + noise * 0.35 + c.level * 0.3 + lit).toFixed(2))
    }
  })

  return orbFrame(
    "bars",
    state,
    size,
    className,
    props,
    <svg viewBox="0 0 100 100" className="size-full overflow-visible">
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <line
          key={i}
          ref={(el) => {
            bars.current[i] = el
          }}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}
    </svg>,
  )
}

/* ---------- Halftone: dot matrix disc ---------- */

const halftoneTargets: Record<VoiceState, { speed: number; freq: number; swirl: number; amp: number }> = {
  idle: { speed: 0.8, freq: 0.35, swirl: 0, amp: 0.35 },
  listening: { speed: 2.2, freq: 0.45, swirl: 0, amp: 0.55 },
  thinking: { speed: 1.4, freq: 0.3, swirl: 1, amp: 0.5 },
  speaking: { speed: 2.8, freq: 0.5, swirl: 0, amp: 0.6 },
}

/**
 * A disc of dots whose sizes ripple outward like a printed halftone wave. The
 * ripple speeds up with `level`; while thinking the pattern twists into a spiral.
 */
function HalftoneOrb({ state = "idle", level = 0, size = 160, className, ...props }: OrbProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const grid = Math.round(Math.max(14, Math.min(28, size / 7)))

  useOrbLoop(state, level, halftoneTargets, (c) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const px = size * dpr
    if (canvas.width !== px) {
      canvas.width = px
      canvas.height = px
    }
    ctx.clearRect(0, 0, px, px)
    ctx.fillStyle = getComputedStyle(canvas).color
    const cell = px / grid
    const center = (grid - 1) / 2
    const radius = grid / 2 - 0.5
    const t = c.time * c.speed
    for (let y = 0; y < grid; y++) {
      for (let x = 0; x < grid; x++) {
        const dx = x - center
        const dy = y - center
        const d = Math.hypot(dx, dy)
        if (d > radius) continue
        const a = Math.atan2(dy, dx)
        const wave = 0.5 + 0.5 * Math.sin(d * c.freq * 3 - t * 2 + c.swirl * a * 2)
        const edge = 1 - Math.pow(d / radius, 3)
        const r = (cell / 2) * (0.12 + (c.amp + c.level * 0.5) * wave * edge)
        ctx.globalAlpha = 0.35 + 0.65 * edge
        ctx.beginPath()
        ctx.arc((x + 0.5) * cell, (y + 0.5) * cell, Math.max(0.4, Math.min(cell / 2, r)), 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1
  })

  return orbFrame("halftone", state, size, className, props, <canvas ref={canvasRef} className="size-full" />)
}

type VoiceOrbVariant = "particles" | "ring" | "wave" | "aura" | "bars" | "halftone"

const VoiceOrbContext = React.createContext<VoiceOrbVariant>("particles")

/** Sets the default orb variant for everything inside it. A `variant` prop still wins. */
function VoiceOrbProvider({ variant, children }: { variant: VoiceOrbVariant; children: React.ReactNode }) {
  return <VoiceOrbContext.Provider value={variant}>{children}</VoiceOrbContext.Provider>
}

/**
 * Presence for a voice agent, drawn in the primary color.
 * `particles`: a rotating particle mesh. `ring`: a soft glowing ring.
 * `wave`: twisting ribbons along a line, twice as wide as `size`.
 * `aura`: soft blurred blobs. `bars`: a circular equalizer. `halftone`: a rippling dot matrix.
 */
function VoiceOrb({
  variant,
  particles,
  ...props
}: OrbProps & {
  /** Defaults to the nearest VoiceOrbProvider, then "particles". */
  variant?: VoiceOrbVariant
  /** Particle count for the particles variant. */
  particles?: number
}) {
  const fallback = React.useContext(VoiceOrbContext)
  const resolved = variant ?? fallback
  if (resolved === "ring") return <RingOrb {...props} />
  if (resolved === "wave") return <WaveOrb {...props} />
  if (resolved === "aura") return <AuraOrb {...props} />
  if (resolved === "bars") return <BarsOrb {...props} />
  if (resolved === "halftone") return <HalftoneOrb {...props} />
  return <ParticleOrb particles={particles} {...props} />
}

export { VoiceOrb, VoiceOrbProvider, type VoiceOrbVariant, type VoiceState }
