"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * Semantic states every orb supports. Connecting breathes while a session opens;
 * error turns destructive and nearly still, so it reads without relying on color.
 */
type VoiceState = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "error"

/** A point on the sphere in latitude/longitude, so the surface can wave along its lines. */
type Particle = { lat: number; lon: number; size: number; phase: number }

/** Per-state motion targets. Values are eased toward, so state changes never jump. */
const targets: Record<VoiceState, { spin: number; swell: number; wave: number; speed: number; scale: number }> = {
  idle: { spin: 0.1, swell: 0, wave: 0.025, speed: 0.6, scale: 1 },
  connecting: { spin: 0.35, swell: 0, wave: 0.035, speed: 1.4, scale: 0.9 },
  listening: { spin: 0.16, swell: 1, wave: 0.03, speed: 1.2, scale: 1 },
  thinking: { spin: 0.7, swell: 0, wave: 0.06, speed: 2.4, scale: 0.95 },
  speaking: { spin: 0.2, swell: 0.7, wave: 0.045, speed: 1.6, scale: 1 },
  error: { spin: 0.02, swell: 0, wave: 0.012, speed: 0.3, scale: 0.94 },
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
  /** Animation speed multiplier. 1 is the designed pace. */
  speed?: number
  /** Soft light around the orb in its own color, 0 to 1. */
  glow?: number
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
  speed = 1,
  glow = 0,
  particles,
  className,
  ...props
}: OrbProps & {
  /** Approximate particle count. Defaults to scale with size. */
  particles?: number
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const input = React.useRef({ state, level, speed })
  const redraw = React.useRef<(() => void) | null>(null)
  const count = particles ?? Math.round(Math.min(6000, size * size * 0.07))

  React.useEffect(() => {
    input.current = { state, level, speed }
    redraw.current?.()
  }, [state, level, speed])

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
      const dt = reduced ? 0 : Math.max(0, Math.min(0.05, (now - last) / 1000))
      last = now
      const { state, level, speed } = input.current
      const target = targets[state]
      const k = reduced ? 1 : 1 - Math.exp(-dt * 5)
      cur.spin += (target.spin - cur.spin) * k
      cur.swell += (target.swell - cur.swell) * k
      cur.wave += (target.wave - cur.wave) * k
      cur.speed += (target.speed - cur.speed) * k
      cur.scale += (target.scale - cur.scale) * k
      const targetLevel = state === "listening" || state === "speaking" ? level : 0
      cur.level += (targetLevel - cur.level) * (reduced ? 1 : 1 - Math.exp(-dt * 12))
      cur.angle += cur.spin * dt * speed
      cur.time += cur.speed * dt * speed
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

  return orbFrame("particles", state, size, glow, className, props, <canvas ref={canvasRef} className="size-full" />)
}

/** Per-state targets for the ring. */
const ringTargets: Record<VoiceState, { wobble: number; spin: number; scale: number; width: number }> = {
  idle: { wobble: 0.018, spin: 0.15, scale: 1, width: 1 },
  connecting: { wobble: 0.02, spin: 0.9, scale: 0.9, width: 0.8 },
  listening: { wobble: 0.03, spin: 0.25, scale: 1, width: 1.2 },
  thinking: { wobble: 0.035, spin: 1.6, scale: 0.94, width: 0.9 },
  speaking: { wobble: 0.03, spin: 0.35, scale: 1, width: 1.3 },
  error: { wobble: 0.008, spin: 0.05, scale: 0.95, width: 0.9 },
}

const RING_POINTS = 120

/**
 * A soft glowing ring. Its outline wobbles like a membrane, stretching with `level`
 * while listening or speaking; the light sweeps around it faster while thinking.
 * Brightest along the bottom edge. Drawn as SVG, so it stays sharp at any size.
 */
function RingOrb({ state = "idle", level = 0, size = 160, speed = 1, glow = 0, className, ...props }: OrbProps) {
  const id = React.useId().replace(/:/g, "")
  const coreRef = React.useRef<SVGPathElement>(null)
  const glowRef = React.useRef<SVGPathElement>(null)
  const haloRef = React.useRef<SVGPathElement>(null)
  const gradientRef = React.useRef<SVGLinearGradientElement>(null)
  const input = React.useRef({ state, level, speed })
  const redraw = React.useRef<(() => void) | null>(null)

  React.useEffect(() => {
    input.current = { state, level, speed }
    redraw.current?.()
  }, [state, level, speed])

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const cur = { ...ringTargets.idle, level: 0, time: 0, angle: 0 }
    let last = performance.now()
    let raf = 0

    const draw = (now: number) => {
      const dt = reduced ? 0 : Math.max(0, Math.min(0.05, (now - last) / 1000))
      last = now
      const { state, level, speed } = input.current
      const target = ringTargets[state]
      const k = reduced ? 1 : 1 - Math.exp(-dt * 5)
      cur.wobble += (target.wobble - cur.wobble) * k
      cur.spin += (target.spin - cur.spin) * k
      cur.scale += (target.scale - cur.scale) * k
      cur.width += (target.width - cur.width) * k
      const targetLevel = state === "listening" || state === "speaking" ? level : 0
      cur.level += (targetLevel - cur.level) * (reduced ? 1 : 1 - Math.exp(-dt * 12))
      cur.time += dt * speed
      cur.angle += cur.spin * dt * speed
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

  return orbFrame(
    "ring",
    state,
    size,
    glow,
    className,
    props,
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
    </svg>,
  )
}

/** Per-state targets for the wave. `amp` is ribbon height; `speed` is how fast they travel. */
const waveTargets: Record<VoiceState, { amp: number; speed: number; twist: number }> = {
  idle: { amp: 0.14, speed: 0.6, twist: 0.8 },
  connecting: { amp: 0.08, speed: 2, twist: 1.2 },
  listening: { amp: 0.22, speed: 1.2, twist: 1 },
  thinking: { amp: 0.1, speed: 3.2, twist: 1.6 },
  speaking: { amp: 0.26, speed: 1.8, twist: 1.1 },
  error: { amp: 0.04, speed: 0.3, twist: 0.4 },
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
function WaveOrb({ state = "idle", level = 0, size = 160, speed = 1, glow = 0, className, ...props }: OrbProps) {
  const id = React.useId().replace(/:/g, "")
  const fillRefs = React.useRef<(SVGPathElement | null)[]>([])
  const edgeRefs = React.useRef<(SVGPathElement | null)[]>([])
  const input = React.useRef({ state, level, speed })
  const redraw = React.useRef<(() => void) | null>(null)

  React.useEffect(() => {
    input.current = { state, level, speed }
    redraw.current?.()
  }, [state, level, speed])

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const cur = { ...waveTargets.idle, level: 0, time: 0 }
    let last = performance.now()
    let raf = 0
    const W = 200
    const C = 50

    const draw = (now: number) => {
      const dt = reduced ? 0 : Math.max(0, Math.min(0.05, (now - last) / 1000))
      last = now
      const { state, level, speed } = input.current
      const target = waveTargets[state]
      const k = reduced ? 1 : 1 - Math.exp(-dt * 4)
      cur.amp += (target.amp - cur.amp) * k
      cur.speed += (target.speed - cur.speed) * k
      cur.twist += (target.twist - cur.twist) * k
      const targetLevel = state === "listening" || state === "speaking" ? level : 0
      cur.level += (targetLevel - cur.level) * (reduced ? 1 : 1 - Math.exp(-dt * 10))
      cur.time += cur.speed * dt * speed
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

  return orbFrame(
    "wave",
    state,
    size,
    glow,
    cn("h-[calc(var(--orb-size)*0.6)] w-[calc(var(--orb-size)*2)] max-w-full", className),
    props,
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
    </svg>,
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
  speed: number,
  targets: Record<VoiceState, T>,
  draw: (cur: T & { level: number; time: number; dt: number }, reduced: boolean) => void,
) {
  const input = React.useRef({ state, level, speed })
  const drawRef = React.useRef(draw)
  const redraw = React.useRef<(() => void) | null>(null)

  React.useEffect(() => {
    drawRef.current = draw
  })

  React.useEffect(() => {
    input.current = { state, level, speed }
    redraw.current?.()
  }, [state, level, speed])

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const cur = { ...targets.idle, level: 0, time: 0, dt: 0 } as T & { level: number; time: number; dt: number }
    let last = performance.now()
    let raf = 0
    const frame = (now: number) => {
      const dt = reduced ? 0 : Math.max(0, Math.min(0.05, (now - last) / 1000))
      last = now
      const { state, level, speed } = input.current
      const target = targets[state]
      const k = reduced ? 1 : 1 - Math.exp(-dt * 5)
      for (const key of Object.keys(target) as (keyof T)[]) {
        ;(cur[key] as number) += ((target[key] as number) - (cur[key] as number)) * k
      }
      const targetLevel = state === "listening" || state === "speaking" ? level : 0
      cur.level += (targetLevel - cur.level) * (reduced ? 1 : 1 - Math.exp(-dt * 12))
      // Time runs at `speed`; easing between states keeps its own pace.
      cur.dt = dt * speed
      cur.time += cur.dt
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

/**
 * Shared wrapper: sizing, state attributes, glow, and the cross-variant state cues
 * (connecting breathes, error turns destructive).
 */
function orbFrame(
  variant: string,
  state: VoiceState,
  size: number,
  glow: number,
  className: string | undefined,
  { style, ...props }: React.ComponentProps<"div">,
  children: React.ReactNode,
  /** Glow color when it shouldn't follow the text color, e.g. a named aura palette. */
  glowColor = "currentColor",
) {
  return (
    <div
      data-slot="voice-orb"
      data-variant={variant}
      data-state={state}
      role="img"
      aria-label={`Voice assistant ${state}`}
      className={cn(
        "relative size-(--orb-size) text-primary data-[state=connecting]:animate-pulse data-[state=error]:text-destructive motion-reduce:animate-none",
        glow > 0 && "drop-shadow-(--orb-glow)",
        className,
      )}
      style={
        {
          "--orb-size": `${size}px`,
          "--orb-glow": `0 0 ${Math.round(size * 0.12 * glow)}px ${glowColor}`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  )
}

/* ---------- Aura: grainy colored sphere ---------- */

/** Named aura palettes: base, then three drifting color fields. */
const auraPalettes = {
  iris: ["#6d5bd0", "#f48fe8", "#7aa2ff", "#b27bff"],
  ember: ["#e8552a", "#ffb86b", "#f47a3d", "#c93d1c"],
  cocoa: ["#4a3530", "#8a5a4c", "#c98a7a", "#2c2220"],
  mist: ["#d9ded6", "#f4efe2", "#b9cfc4", "#eef3ea"],
} as const

type OrbPalette = keyof typeof auraPalettes | "primary"

const auraTargets: Record<VoiceState, { speed: number; spread: number; swirl: number; swell: number }> = {
  idle: { speed: 0.25, spread: 0.5, swirl: 0, swell: 0 },
  connecting: { speed: 0.5, spread: 0.4, swirl: 0.5, swell: 0 },
  listening: { speed: 0.6, spread: 0.58, swirl: 0, swell: 1 },
  thinking: { speed: 0.9, spread: 0.46, swirl: 1, swell: 0 },
  speaking: { speed: 0.8, spread: 0.55, swirl: 0.2, swell: 0.8 },
  error: { speed: 0.1, spread: 0.45, swirl: 0, swell: 0 },
}

const AURA_FIELDS = [
  { w: 0.7, phase: 0, r: 1.15 },
  { w: -0.9, phase: 2.1, r: 1.05 },
  { w: 1.2, phase: 4.2, r: 0.9 },
]

/** Film grain, generated once per size: gray noise with transparent gaps, blended over the sphere. */
function makeGrain(px: number) {
  const grain = document.createElement("canvas")
  grain.width = px
  grain.height = px
  const g = grain.getContext("2d")!
  const img = g.createImageData(px, px)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  g.putImageData(img, 0, 0)
  return grain
}

/**
 * Resolves CSS colors (including color-mix and oklch) to [r, g, b] by painting each
 * into a 1×1 canvas. Gradients need explicit channels: fading to "transparent" means
 * transparent black, which drags every field through gray at its edges.
 */
function resolveColors(el: HTMLElement, colors: string[]): [number, number, number][] {
  const probe = document.createElement("span")
  probe.style.display = "none"
  el.appendChild(probe)
  const pixel = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!
  const out = colors.map((c) => {
    probe.style.color = ""
    probe.style.color = c
    pixel.clearRect(0, 0, 1, 1)
    pixel.fillStyle = getComputedStyle(probe).color
    pixel.fillRect(0, 0, 1, 1)
    const [r, g, b] = pixel.getImageData(0, 0, 1, 1).data
    return [r, g, b] as [number, number, number]
  })
  probe.remove()
  return out
}

const rgba = ([r, g, b]: [number, number, number], a = 1) => `rgba(${r},${g},${b},${a})`

type Palette = OrbPalette | string[]

/**
 * Resolves a palette to four RGB colors (base + three fields), again on theme changes.
 * "primary" builds shades from the text color. Error swaps any palette for shades of the
 * destructive color, so the state reads the same on every orb.
 */
function usePaletteColors(ref: React.RefObject<HTMLElement | null>, palette: Palette, error: boolean) {
  const colorsRef = React.useRef<[number, number, number][]>([])
  // Re-resolve when the palette's value changes, not its array identity.
  const key = Array.isArray(palette) ? palette.join(",") : palette
  const paletteRef = React.useRef(palette)
  React.useEffect(() => {
    paletteRef.current = palette
  })

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => {
      const palette = paletteRef.current
      const list =
        palette === "primary" || error
          ? [
              "color-mix(in oklch, currentColor 90%, black)",
              "color-mix(in oklch, currentColor 55%, white)",
              "currentColor",
              "color-mix(in oklch, currentColor 80%, white)",
            ]
          : Array.isArray(palette)
            ? palette
            : [...auraPalettes[palette]]
      colorsRef.current = resolveColors(el, list)
    }
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-color", "data-base"],
    })
    return () => observer.disconnect()
  }, [ref, key, error])

  return colorsRef
}

/** Named and custom palettes glow in their main field color; primary and error follow the text color. */
function paletteGlow(palette: Palette, error: boolean) {
  if (error || palette === "primary") return undefined
  return Array.isArray(palette) ? palette[2] : auraPalettes[palette][2]
}

/**
 * A grainy sphere of drifting color fields with a soft highlight and darker rim.
 * Fields drift slowly when idle, move and swell with `level` while listening or
 * speaking, and swirl while thinking. `palette` picks the colors.
 */
function AuraOrb({
  state = "idle",
  level = 0,
  size = 160,
  speed = 1,
  glow = 0,
  palette = "primary",
  className,
  ...props
}: OrbProps & { palette?: Palette }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const grainRef = React.useRef<HTMLCanvasElement | null>(null)
  const colorsRef = usePaletteColors(canvasRef, palette, state === "error")

  useOrbLoop(state, level, speed, auraTargets, (c) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    const colors = colorsRef.current
    if (!canvas || !ctx || colors.length < 4) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const px = Math.round(size * dpr)
    // Compare both sides: a fresh canvas is 300×150, so width alone can match by accident.
    if (canvas.width !== px || canvas.height !== px) {
      canvas.width = px
      canvas.height = px
      grainRef.current = makeGrain(px)
    }
    const r = px / 2
    const t = c.time * c.speed
    const swell = 1 + c.swell * c.level * 0.06

    ctx.clearRect(0, 0, px, px)
    ctx.save()
    ctx.translate(r, r)
    ctx.scale(swell, swell)
    ctx.translate(-r, -r)
    ctx.beginPath()
    ctx.arc(r, r, r * 0.96, 0, Math.PI * 2)
    ctx.clip()

    // Base, then three soft color fields orbiting inside.
    ctx.fillStyle = rgba(colors[0])
    ctx.fillRect(0, 0, px, px)
    AURA_FIELDS.forEach((f, i) => {
      const a = t * f.w + f.phase + c.swirl * c.time * 1.5
      const orbit = r * c.spread * (1 + c.level * c.swell * 0.5)
      const x = r + Math.cos(a) * orbit
      const y = r + Math.sin(a * 0.8) * orbit
      const rad = r * f.r * (1 + c.level * c.swell * 0.25)
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad)
      // Solid core, long soft falloff: fields read as distinct color areas, not spots.
      g.addColorStop(0, rgba(colors[i + 1]))
      g.addColorStop(0.45, rgba(colors[i + 1]))
      g.addColorStop(1, rgba(colors[i + 1], 0))
      ctx.fillStyle = g
      ctx.fillRect(0, 0, px, px)
    })

    // Sphere shading: soft highlight upper left, darker rim.
    const hl = ctx.createRadialGradient(r * 0.65, r * 0.55, 0, r * 0.65, r * 0.55, r * 1.1)
    hl.addColorStop(0, "rgba(255,255,255,0.28)")
    hl.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = hl
    ctx.fillRect(0, 0, px, px)
    // A light touch: the rim only deepens the last third, so edges stay blended.
    const rim = ctx.createRadialGradient(r, r, r * 0.7, r, r, r)
    rim.addColorStop(0, "rgba(0,0,0,0)")
    rim.addColorStop(1, "rgba(0,0,0,0.12)")
    ctx.fillStyle = rim
    ctx.fillRect(0, 0, px, px)

    // Grain.
    if (grainRef.current) {
      ctx.globalCompositeOperation = "overlay"
      ctx.globalAlpha = 0.22
      ctx.drawImage(grainRef.current, 0, 0)
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = "source-over"
    }
    ctx.restore()
  })

  return orbFrame(
    "aura",
    state,
    size,
    glow,
    className,
    props,
    <canvas ref={canvasRef} className="size-full" />,
    paletteGlow(palette, state === "error"),
  )
}

/* ---------- Bars: circular equalizer ---------- */

const barsTargets: Record<VoiceState, { base: number; speed: number; sweep: number; spin: number }> = {
  idle: { base: 0.08, speed: 1, sweep: 0, spin: 0.1 },
  connecting: { base: 0.06, speed: 0.8, sweep: 0.6, spin: 0.6 },
  listening: { base: 0.1, speed: 2.4, sweep: 0, spin: 0.15 },
  thinking: { base: 0.12, speed: 1.5, sweep: 1, spin: 1.4 },
  speaking: { base: 0.12, speed: 3, sweep: 0, spin: 0.2 },
  error: { base: 0.05, speed: 0.3, sweep: 0, spin: 0.02 },
}

const BAR_COUNT = 56

/**
 * Bars around a ring, like a circular equalizer. Bar length follows `level` while
 * listening or speaking; a bright arc sweeps around it while thinking.
 */
function BarsOrb({ state = "idle", level = 0, size = 160, speed = 1, glow = 0, className, ...props }: OrbProps) {
  const bars = React.useRef<(SVGLineElement | null)[]>([])
  const angle = React.useRef(0)

  useOrbLoop(state, level, speed, barsTargets, (c) => {
    angle.current += c.spin * c.dt
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
    glow,
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
  connecting: { speed: 1, freq: 0.3, swirl: 0.5, amp: 0.25 },
  listening: { speed: 2.2, freq: 0.45, swirl: 0, amp: 0.55 },
  thinking: { speed: 1.4, freq: 0.3, swirl: 1, amp: 0.5 },
  speaking: { speed: 2.8, freq: 0.5, swirl: 0, amp: 0.6 },
  error: { speed: 0.2, freq: 0.3, swirl: 0, amp: 0.2 },
}

/**
 * A disc of dots whose sizes ripple outward like a printed halftone wave. The
 * ripple speeds up with `level`; while thinking the pattern twists into a spiral.
 */
function HalftoneOrb({ state = "idle", level = 0, size = 160, speed = 1, glow = 0, className, ...props }: OrbProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const grid = Math.round(Math.max(14, Math.min(28, size / 7)))

  useOrbLoop(state, level, speed, halftoneTargets, (c) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const px = size * dpr
    // Compare both sides: a fresh canvas is 300×150, so width alone can match by accident.
    if (canvas.width !== px || canvas.height !== px) {
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

  return orbFrame("halftone", state, size, glow, className, props, <canvas ref={canvasRef} className="size-full" />)
}

/* ---------- Shader orbs: plasma and liquid ---------- */

const VERTEX = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}"

/** Shared GLSL: canvas size, palette, level, and value noise with fbm. */
const GLSL_COMMON = `precision mediump float;
uniform vec2 u_res;
uniform float u_level;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);
}
float fbm(vec2 p){float v=0.;float a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return v;}
`

type Shader = { gl: WebGLRenderingContext; uniform: (name: string) => WebGLUniformLocation | null }

let webgl: boolean | undefined
/** Whether this browser can draw shader orbs. Checked once; shader variants fall back to aura without it. */
function hasWebGL() {
  if (webgl === undefined) {
    try {
      webgl = !!document.createElement("canvas").getContext("webgl")
    } catch {
      webgl = false
    }
  }
  return webgl
}
const noSubscribe = () => () => {}

/** Compiles a fragment shader onto a quad covering the canvas. The ref stays null if it fails. */
function useShader(ref: React.RefObject<HTMLCanvasElement | null>, fragment: string) {
  const shader = React.useRef<Shader | null>(null)
  React.useEffect(() => {
    const gl = ref.current?.getContext("webgl", { premultipliedAlpha: true, antialias: false })
    if (!gl) return
    const compile = (type: number, source: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, source)
      gl.compileShader(s)
      return s
    }
    const program = gl.createProgram()!
    const vs = compile(gl.VERTEX_SHADER, VERTEX)
    const fs = compile(gl.FRAGMENT_SHADER, GLSL_COMMON + fragment)
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getShaderInfoLog(fs) ?? gl.getProgramInfoLog(program))
      return
    }
    gl.useProgram(program)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, "p")
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const locations = new Map<string, WebGLUniformLocation | null>()
    shader.current = {
      gl,
      uniform: (name) => {
        if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name))
        return locations.get(name)!
      },
    }
    return () => {
      shader.current = null
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [ref, fragment])
  return shader
}

/** Sizes the canvas, sets shared and per-orb uniforms (as u_<name>), and draws one frame. */
function drawShader(
  shader: Shader,
  canvas: HTMLCanvasElement,
  size: number,
  colors: [number, number, number][],
  level: number,
  uniforms: Record<string, number>,
) {
  const { gl, uniform } = shader
  const px = Math.round(size * Math.min(window.devicePixelRatio || 1, 2))
  if (canvas.width !== px || canvas.height !== px) {
    canvas.width = px
    canvas.height = px
  }
  gl.viewport(0, 0, px, px)
  gl.uniform2f(uniform("u_res"), px, px)
  gl.uniform1f(uniform("u_level"), level)
  colors.forEach(([r, g, b], i) => gl.uniform3f(uniform(`u_c${i}`), r / 255, g / 255, b / 255))
  for (const [name, value] of Object.entries(uniforms)) gl.uniform1f(uniform(`u_${name}`), value)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}

type ShaderOrbProps = OrbProps & { palette?: Palette }

/**
 * Wires a shader orb: palette colors, the compiled program, and a loop that advances
 * `phase` at the state's `pace` so speed changes never jump the pattern.
 */
function useShaderOrb<T extends { pace: number } & Record<string, number>>(
  { state = "idle", level = 0, size = 160, speed = 1, palette = "primary" }: ShaderOrbProps,
  fragment: string,
  targets: Record<VoiceState, T>,
) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const colorsRef = usePaletteColors(canvasRef, palette, state === "error")
  const shader = useShader(canvasRef, fragment)
  const phase = React.useRef(0)
  useOrbLoop(state, level, speed, targets, (c) => {
    const canvas = canvasRef.current
    if (!shader.current || !canvas || colorsRef.current.length < 4) return
    phase.current += c.dt * c.pace
    const uniforms: Record<string, number> = { phase: phase.current }
    for (const key of Object.keys(targets.idle)) if (key !== "pace") uniforms[key] = c[key]
    drawShader(shader.current, canvas, size, colorsRef.current, c.level, uniforms)
  })
  return canvasRef
}

const plasmaTargets: Record<VoiceState, { pace: number; turb: number; swirl: number; bright: number }> = {
  idle: { pace: 0.6, turb: 0.4, swirl: 0, bright: 0.6 },
  connecting: { pace: 1.2, turb: 0.3, swirl: 0.6, bright: 0.4 },
  listening: { pace: 1, turb: 0.8, swirl: 0, bright: 1 },
  thinking: { pace: 2, turb: 1, swirl: 1, bright: 0.9 },
  speaking: { pace: 1.4, turb: 1, swirl: 0.2, bright: 1.2 },
  error: { pace: 0.2, turb: 0.2, swirl: 0, bright: 0.3 },
}

/** Domain-warped noise inside a shaded sphere, with bright filaments that flare with level. */
const PLASMA = `uniform float u_phase;
uniform float u_turb;
uniform float u_swirl;
uniform float u_bright;
void main(){
  vec2 uv=(gl_FragCoord.xy*2.-u_res)/u_res.y;
  float R=.9*(1.+u_level*.05);
  float r=length(uv)/R;
  float aa=3./u_res.y;
  float mask=1.-smoothstep(1.-aa,1.+aa,r);
  if(mask<=0.){gl_FragColor=vec4(0.);return;}
  float z=sqrt(max(0.,1.-r*r));
  vec2 p=uv/R/(z*.6+.4);
  float t=u_phase;
  float a=u_swirl*((1.-r)*2.5+t*.2);
  float ca=cos(a);float sa=sin(a);
  p=mat2(ca,-sa,sa,ca)*p;
  vec2 q=vec2(fbm(p*1.4+vec2(t*.15,0.)),fbm(p*1.4+vec2(3.1,-t*.12)));
  float n=fbm(p*1.8+q*(1.2+u_turb*1.6+u_level*1.5)+vec2(0.,t*.1));
  vec3 col=mix(u_c0,u_c1,smoothstep(.25,.65,n));
  col=mix(col,u_c2,smoothstep(.4,.75,q.x)*.8);
  col=mix(col,u_c3,smoothstep(.5,.85,q.y)*.6);
  float fil=pow(1.-abs(sin(n*10.+t*.5)),10.)*(.35+u_level*.8)*u_bright;
  col+=fil*mix(u_c1,vec3(1.),.5);
  col*=.7+.4*z;
  col+=pow(1.-z,2.5)*.4*u_c3;
  gl_FragColor=vec4(col*mask,mask);
}`

/**
 * Glowing plasma: warped noise flowing inside a shaded sphere. Bright filaments flare
 * with `level`; it churns faster and twists while thinking. `palette` picks the colors.
 */
function PlasmaOrb({ glow = 0, className, ...props }: ShaderOrbProps) {
  const { state = "idle", level, size = 160, speed, palette = "primary", ...rest } = props
  const canvasRef = useShaderOrb({ state, level, size, speed, palette }, PLASMA, plasmaTargets)
  return orbFrame(
    "plasma",
    state,
    size,
    glow,
    className,
    rest,
    <canvas ref={canvasRef} className="size-full" />,
    paletteGlow(palette, state === "error"),
  )
}

const liquidTargets: Record<VoiceState, { pace: number; spread: number; gloss: number }> = {
  idle: { pace: 0.5, spread: 0.8, gloss: 0.8 },
  connecting: { pace: 1.3, spread: 0.45, gloss: 0.6 },
  listening: { pace: 0.9, spread: 1, gloss: 0.9 },
  thinking: { pace: 1.8, spread: 0.7, gloss: 0.9 },
  speaking: { pace: 1.2, spread: 1.1, gloss: 1 },
  error: { pace: 0.2, spread: 0.55, gloss: 0.4 },
}

/** Five metaballs, lit as a glossy surface from the field's gradient. */
const LIQUID = `uniform float u_phase;
uniform float u_spread;
uniform float u_gloss;
// Surface height: 0 at the edge, easing smoothly to flat inside, so rims curve and centres stay calm.
float height(float f){return sqrt(1.-exp(-max(f-1.,0.)*1.5));}
float field(vec2 uv,out vec3 tint){
  float f=0.;vec3 acc=vec3(0.);
  for(int i=0;i<5;i++){
    float fi=float(i);
    vec2 c=vec2(sin(u_phase*(.7+fi*.17)+fi*1.7),cos(u_phase*(.6+fi*.13)+fi*2.3))*u_spread*(.26+.045*fi)*(1.+u_level*.25);
    float rad=(.36-.03*fi)*(1.+u_level*.3+.06*sin(u_phase*1.9+fi));
    vec2 d=uv-c;
    // Softened so ball centres stay finite; a raw 1/d² spike speckles the lighting.
    float v=rad*rad/(dot(d,d)+rad*rad*.15);
    vec3 col=fi<.5?u_c1:fi<1.5?u_c2:fi<2.5?u_c3:fi<3.5?u_c2:u_c1;
    f+=v;acc+=col*v;
  }
  tint=acc/max(f,.0001);
  return f;
}
void main(){
  vec2 uv=(gl_FragCoord.xy*2.-u_res)/u_res.y;
  float e=2./u_res.y;
  vec3 tint;vec3 unused;
  float f=field(uv,tint);
  float fx=field(uv+vec2(e,0.),unused);
  float fy=field(uv+vec2(0.,e),unused);
  float g=length(vec2(fx-f,fy-f));
  float m=clamp((f-1.)/max(g*1.5,.0001)+.5,0.,1.);
  if(m<=0.){gl_FragColor=vec4(0.);return;}
  float h=height(f);
  vec2 dh=vec2(height(fx)-h,height(fy)-h)/e;
  vec3 n=normalize(vec3(-dh*.18,1.));
  vec3 L=normalize(vec3(-.5,.6,.8));
  float diff=clamp(dot(n,L),0.,1.);
  float spec=pow(clamp(dot(n,normalize(L+vec3(0.,0.,1.))),0.,1.),40.)*u_gloss;
  vec3 col=tint*(.55+.55*diff);
  col=mix(col,u_c0,.2*(1.-diff));
  col+=spec*.9;
  gl_FragColor=vec4(col*m,m);
}`

/**
 * Liquid metal: colored blobs that drift, merge and split, lit like a glossy surface.
 * They spread and swell with `level`, pull together while connecting, and churn while
 * thinking. `palette` picks the colors.
 */
function LiquidOrb({ glow = 0, className, ...props }: ShaderOrbProps) {
  const { state = "idle", level, size = 160, speed, palette = "primary", ...rest } = props
  const canvasRef = useShaderOrb({ state, level, size, speed, palette }, LIQUID, liquidTargets)
  return orbFrame(
    "liquid",
    state,
    size,
    glow,
    className,
    rest,
    <canvas ref={canvasRef} className="size-full" />,
    paletteGlow(palette, state === "error"),
  )
}

type VoiceOrbVariant = "particles" | "ring" | "wave" | "aura" | "bars" | "halftone" | "plasma" | "liquid"

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
 * `plasma`: glowing warped noise in a sphere. `liquid`: glossy merging metaballs. Both are
 * WebGL shaders and fall back to `aura` where WebGL is unavailable.
 * Every variant takes the same states, `speed`, `glow` and `sensitivity`.
 */
function VoiceOrb({
  variant,
  particles,
  palette,
  level = 0,
  sensitivity = 1,
  ...rest
}: OrbProps & {
  /** How strongly `level` moves the orb. 1 is as measured; 2 doubles it, capped at full. */
  sensitivity?: number
  /** Defaults to the nearest VoiceOrbProvider, then "particles". */
  variant?: VoiceOrbVariant
  /** Particle count for the particles variant. */
  particles?: number
  /** Aura, plasma and liquid colors: a named palette, custom colors (base + 3), or "primary" (default). */
  palette?: Palette
}) {
  const fallback = React.useContext(VoiceOrbContext)
  const webgl = React.useSyncExternalStore(noSubscribe, hasWebGL, () => true)
  const resolved = variant ?? fallback
  const props = { ...rest, level: Math.min(1, level * sensitivity) }
  if (resolved === "ring") return <RingOrb {...props} />
  if (resolved === "wave") return <WaveOrb {...props} />
  if (resolved === "aura") return <AuraOrb palette={palette} {...props} />
  if (resolved === "plasma") return webgl ? <PlasmaOrb palette={palette} {...props} /> : <AuraOrb palette={palette} {...props} />
  if (resolved === "liquid") return webgl ? <LiquidOrb palette={palette} {...props} /> : <AuraOrb palette={palette} {...props} />
  if (resolved === "bars") return <BarsOrb {...props} />
  if (resolved === "halftone") return <HalftoneOrb {...props} />
  return <ParticleOrb particles={particles} {...props} />
}

export { VoiceOrb, VoiceOrbProvider, auraPalettes, type OrbPalette, type VoiceOrbVariant, type VoiceState }
