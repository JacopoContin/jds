"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"
import { cn } from "cn"

import type { VoiceState } from "@/components/voice/voice-orb"

/** Named glow palettes, left to right along the edge. */
const glowPalettes = {
  spectrum: ["#c8902a", "#2f8f86", "#8a3fb0", "#3f9a5a", "#c0507a", "#5a7fd6"],
  iris: ["#6d5bd0", "#f48fe8", "#7aa2ff", "#b27bff", "#6d5bd0"],
  ember: ["#e8552a", "#ffb86b", "#f47a3d", "#c93d1c", "#ffb86b"],
} as const

type VoiceGlowPalette = keyof typeof glowPalettes | "primary" | string[]

/**
 * How much light each state gives off. base: resting height, gain: how much loudness adds,
 * speed: how fast the colors drift, pulse: a slow breath on top (waiting states).
 */
const targets: Record<VoiceState, { base: number; gain: number; speed: number; pulse: number }> = {
  idle: { base: 0.15, gain: 0, speed: 0.3, pulse: 0 },
  connecting: { base: 0.25, gain: 0, speed: 0.6, pulse: 1 },
  listening: { base: 0.35, gain: 0.65, speed: 0.6, pulse: 0 },
  thinking: { base: 0.4, gain: 0, speed: 1.3, pulse: 0.6 },
  speaking: { base: 0.45, gain: 0.55, speed: 0.8, pulse: 0 },
  error: { base: 0.12, gain: 0, speed: 0.2, pulse: 0 },
}

type RGB = [number, number, number]

/** Any CSS color to RGB, through the canvas's own parser (so oklch and var-resolved colors work). */
function toRgb(color: string): RGB {
  const c = document.createElement("canvas").getContext("2d", { willReadFrequently: true })
  if (!c) return [255, 255, 255]
  c.fillStyle = color
  c.fillRect(0, 0, 1, 1)
  const [r, g, b] = c.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}

const mix = ([r, g, b]: RGB, [r2, g2, b2]: RGB, t: number): RGB => [
  r + (r2 - r) * t,
  g + (g2 - g) * t,
  b + (b2 - b) * t,
]
const rgba = ([r, g, b]: RGB, a: number) => `rgba(${r | 0},${g | 0},${b | 0},${Math.max(0, Math.min(1, a))})`

/** Resolves the palette to RGB, again when the theme changes (primary follows the text color). */
function usePalette(ref: React.RefObject<HTMLElement | null>, palette: VoiceGlowPalette) {
  const [colors, setColors] = React.useState<RGB[]>([])
  const key = JSON.stringify(palette)
  React.useEffect(() => {
    const palette = JSON.parse(key) as VoiceGlowPalette
    const resolve = () => {
      if (palette === "primary") {
        const el = ref.current
        if (!el) return
        const p = toRgb(getComputedStyle(el).color)
        const white: RGB = [255, 255, 255]
        setColors([p, mix(p, white, 0.35), p, mix(p, white, 0.2), mix(p, [0, 0, 0], 0.15)])
      } else setColors((Array.isArray(palette) ? palette : [...glowPalettes[palette]]).map(toRgb))
    }
    resolve()
    if (palette !== "primary") return
    const observer = new MutationObserver(resolve)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-color", "data-base"] })
    return () => observer.disconnect()
  }, [ref, key])
  return colors
}

/** How far the blurred fields overhang the box, so the blur doesn't fade them out at the edge. */
const BLEED = 64

/**
 * Light rising from the bottom edge of a voice surface, like it spills in from outside the
 * screen: soft colored fields, a bright swell at the center, and a thin line hugging the edge.
 * It grows with `level` while listening or speaking and breathes while connecting or thinking.
 * Put it in a `relative isolate overflow-hidden` container with the controls above it; the
 * edge line follows the container's bottom corner radius.
 */
function VoiceGlow({
  state = "idle",
  level = 0,
  palette = "spectrum",
  intensity = 1,
  reach = 1,
  speed = 1,
  grain = 0,
  edge: showEdge = true,
  radius,
  className,
}: {
  state?: VoiceState
  /** Loudness 0 to 1 of whoever is talking. */
  level?: number
  /** A named palette, "primary" for shades of the theme's primary color, or your own colors. */
  palette?: VoiceGlowPalette
  /** Overall brightness, 0 to 1. */
  intensity?: number
  /** How far the light rises, as a multiple of the default height. 0.5 hugs the edge, 1.5 climbs higher. */
  reach?: number
  /** Drift speed of the colors. 0 holds still; 1 is the default pace. */
  speed?: number
  /** Film grain over the light, 0 to 1, for a printed, less digital texture. */
  grain?: number
  /** The thin line of light along the bottom edge. */
  edge?: boolean
  /**
   * Corner radius in px the edge line follows. Defaults to the container's bottom radius. At the
   * bottom of a phone screen, pass the display's corner radius so the light wraps the device.
   */
  radius?: number
  className?: string
}) {
  const root = React.useRef<HTMLDivElement>(null)
  const fields = React.useRef<HTMLCanvasElement>(null)
  const edge = React.useRef<HTMLCanvasElement>(null)
  const colors = usePalette(root, palette)
  const reduced = useReducedMotion()
  // Read every frame without restarting the loop.
  const live = React.useRef({ state, level, intensity, reach, speed, showEdge, radius })
  React.useLayoutEffect(() => {
    live.current = { state, level, intensity, reach, speed, showEdge, radius }
  })
  const redraw = reduced ? `${state}:${level}:${intensity}:${reach}:${showEdge}` : ""

  React.useEffect(() => {
    const el = root.current
    const back = fields.current?.getContext("2d")
    const front = edge.current?.getContext("2d")
    if (!el || !back || !front || colors.length === 0) return

    let w = 0
    let h = 0
    let radius = 0
    let dpr = 1
    const resize = () => {
      const rect = el.getBoundingClientRect()
      w = rect.width
      h = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      // The fields are blurred heavily, so half resolution is plenty.
      fields.current!.width = Math.max(1, (w + BLEED * 2) / 2)
      fields.current!.height = Math.max(1, (h + BLEED) / 2)
      edge.current!.width = Math.max(1, w * dpr)
      edge.current!.height = Math.max(1, h * dpr)
      const parent = el.parentElement
      radius = parent ? parseFloat(getComputedStyle(parent).borderBottomLeftRadius) || 0 : 0
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(el)

    let energy = targets[live.current.state].base
    let phase = 0
    let last = performance.now()
    let frame = 0
    const n = colors.length

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const { state, level, intensity, reach, speed, showEdge } = live.current
      const t = targets[state]
      const target = t.base + t.gain * level + t.pulse * 0.08 * Math.sin(now / 600)
      if (reduced) energy = t.base + t.gain * level
      else {
        energy += (target - energy) * Math.min(1, dt * 8)
        phase += dt * t.speed * speed
      }

      // Colored fields, each a tall ellipse anchored below the edge.
      back.setTransform(0.5, 0, 0, 0.5, BLEED / 2, 0)
      back.clearRect(-BLEED, 0, w + BLEED * 2, h + BLEED)
      back.globalCompositeOperation = "lighter"
      colors.forEach((c, i) => {
        const cx = w * (0.08 + (0.84 * i) / Math.max(1, n - 1)) + Math.sin(phase * 0.7 + i * 1.9) * w * 0.05
        const ry = h * reach * (0.45 + 0.55 * energy) * (0.85 + 0.15 * Math.sin(phase + i * 2.3))
        const rx = w * 0.22
        back.save()
        back.translate(cx, h)
        back.scale(rx, ry)
        const g = back.createRadialGradient(0, 0, 0, 0, 0, 1)
        g.addColorStop(0, rgba(c, 0.7 * intensity))
        g.addColorStop(1, rgba(c, 0))
        back.fillStyle = g
        back.fillRect(-1, -1, 2, 2)
        back.restore()
      })
      // The swell: a bright, iridescent mound rising from the center of the edge.
      const swell = (rx: number, ry: number, stops: [number, RGB, number][]) => {
        back.save()
        back.translate(w / 2, h)
        back.scale(rx, ry)
        const g = back.createRadialGradient(0, 0, 0, 0, 0, 1)
        for (const [at, c, a] of stops) g.addColorStop(at, rgba(c, a * intensity))
        back.fillStyle = g
        back.fillRect(-1, -1, 2, 2)
        back.restore()
      }
      const white: RGB = [255, 255, 255]
      swell(w * (0.34 + 0.14 * energy), h * reach * (0.16 + 0.3 * energy), [
        [0, white, 0.55 + 0.35 * energy],
        [0.45, colors[(n - 2 + n) % n], 0.45],
        [0.75, colors[n - 1], 0.2],
        [1, colors[n - 1], 0],
      ])

      // The edge: a thin line of the palette hugging the bottom corners, brightest in the middle.
      front.setTransform(dpr, 0, 0, dpr, 0, 0)
      front.clearRect(0, 0, w, h)
      if (!showEdge) {
        if (!reduced) frame = requestAnimationFrame(draw)
        return
      }
      const r = Math.min(live.current.radius ?? radius, w / 2, h)
      const inset = 0.75
      front.beginPath()
      front.moveTo(inset, h - r - 8)
      front.lineTo(inset, h - r)
      front.arcTo(inset, h - inset, r + inset, h - inset, Math.max(0, r - inset))
      front.lineTo(w - r - inset, h - inset)
      front.arcTo(w - inset, h - inset, w - inset, h - r, Math.max(0, r - inset))
      front.lineTo(w - inset, h - r - 8)
      const line = front.createLinearGradient(0, 0, w, 0)
      colors.forEach((c, i) => line.addColorStop(i / Math.max(1, n - 1), rgba(mix(c, white, 0.35), 0.9)))
      front.strokeStyle = line
      front.lineWidth = 1.5
      front.globalAlpha = Math.min(1, (0.25 + energy) * intensity)
      front.stroke()
      // A white-hot core where the swell meets the edge.
      front.globalAlpha = 1
      const core = front.createRadialGradient(w / 2, h, 0, w / 2, h, w * (0.18 + 0.1 * energy))
      core.addColorStop(0, rgba(white, (0.35 + 0.4 * energy) * intensity))
      core.addColorStop(1, rgba(white, 0))
      front.fillStyle = core
      front.fillRect(0, h - 4, w, 4)

      if (!reduced) frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
    // Reduced motion draws one frame per change instead of looping.
  }, [colors, reduced, redraw])

  return (
    <div
      ref={root}
      data-slot="voice-glow"
      data-state={state}
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-3/5 text-primary", className)}
    >
      <canvas ref={fields} className="absolute top-0 -left-16 h-[calc(100%+4rem)] w-[calc(100%+8rem)] blur-2xl" />
      <canvas ref={edge} className="absolute inset-0 size-full blur-[1px]" />
      {grain > 0 && <Grain amount={grain} />}
    </div>
  )
}

/** SVG turbulence noise blended over the light, so it reads as texture rather than a smooth gradient. */
function Grain({ amount }: { amount: number }) {
  const id = React.useId()
  return (
    // Fades out upward with the light, so the texture has no top edge.
    <svg className="absolute inset-0 size-full mask-t-from-0% mask-t-to-100% mix-blend-overlay" opacity={Math.min(1, amount)}>
      <filter id={`${id}-grain`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id}-grain)`} />
    </svg>
  )
}

export { VoiceGlow, glowPalettes, type VoiceGlowPalette }
