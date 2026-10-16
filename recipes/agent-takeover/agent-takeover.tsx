"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "cn"

import { Shimmer } from "@/components/ai/shimmer"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { VoiceGlow } from "@/components/voice/voice-glow"
import { VoiceOrb } from "@/components/voice/voice-orb"
import { PauseIcon } from "@/lib/icons"
import { ease } from "@/lib/motion"

import type { TakeoverState } from "./session"

/** Milliseconds per character as the agent types a value: a pace you can read along with. */
const TYPE_MS = 55

/** How far the light's bloom reaches past the frame, in px. */
const BLEED = 32

/**
 * The agent works directly on your app's UI, and you supervise it. Wrap the surface it works
 * on: while it works, a light runs round the edge, a faint wash marks the surface as the
 * agent's, and a scrim takes your clicks so you never fight it for a control. A bar says what
 * it's doing, with Take back to stop after the current step. Finishing flashes the edge once.
 */
function AgentTakeover({
  state,
  status,
  detail,
  agentName = "Aria",
  finished = 0,
  lap = 10,
  light = "beam",
  onTakeBack,
  onResume,
  children,
  className,
}: {
  state: TakeoverState
  /** What the agent is doing, e.g. "Emailing supplier". */
  status: string
  /** What it's doing it to, e.g. the row's title. */
  detail?: string
  agentName?: string
  /** Bump to flash the edge once, when the agent finishes. */
  finished?: number
  /**
   * beam: a light runs round the edge while the agent works. track: just the edge in the agent's
   * color. glow: light rises from the bottom edge across the whole surface and breathes.
   */
  light?: "beam" | "track" | "glow"
  /** Seconds for the light to go once round the edge. */
  lap?: number
  /** Leave out while the agent can't stop cleanly yet. */
  onTakeBack?: () => void
  onResume?: () => void
  children: React.ReactNode
  className?: string
}) {
  const working = state === "working"
  const active = working || state === "paused"
  return (
    <div
      data-slot="agent-takeover"
      data-state={state}
      className={cn("relative isolate rounded-xl border bg-background", className)}
    >
      {children}

      <AnimatePresence>
        {working && (
          <motion.div
            key="scrim"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: ease.out } }}
            transition={{ duration: 0.8, ease: ease.out }}
            // Takes the clicks while the agent works; a wash so faint it reads as warmth, not tint.
            className="absolute inset-0 z-20 cursor-default rounded-xl bg-primary/5"
          />
        )}
      </AnimatePresence>

      <EdgeLight state={state} finished={finished} lap={lap} beam={light === "beam"} strongTrack={light === "track"} />

      {/* Glow: the whole surface lit from its bottom edge, breathing while the agent works. */}
      <AnimatePresence>
        {light === "glow" && active && (
          <motion.div
            key="glow"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: working ? 1 : 0.4 }}
            exit={{ opacity: 0, transition: { duration: 1.2, ease: ease.out } }}
            transition={{ duration: 1, ease: ease.out }}
            className="pointer-events-none absolute inset-0 isolate z-20 overflow-hidden rounded-xl"
          >
            <VoiceGlow
              state={working ? "thinking" : "idle"}
              palette="primary"
              intensity={0.7}
              reach={0.9}
              className="h-2/5"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <motion.div
            key="bar"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 160, damping: 22, delay: 0.2 }}
            className="pointer-events-none absolute inset-x-0 bottom-6 z-40 flex justify-center px-4"
          >
            {/* Fixed width: the status changes every second or so, the bar shouldn't. */}
            <div
              role="status"
              aria-live="polite"
              // The surface theme's material, with a rim in the agent's color.
              className="pointer-events-auto flex w-lg max-w-full items-center gap-3 rounded-full border border-primary/40 bg-popover py-2 pr-2 pl-2.5 shadow-2xl inset-shadow-surface surface-sheen"
            >
              {/* Follows your VoiceOrbProvider, so it's the same orb as the rest of your app. */}
              <VoiceOrb state={working ? "thinking" : "idle"} size={24} />
              <p className="flex min-w-0 flex-1 items-baseline gap-2 text-sm">
                <span className="shrink-0 font-medium">{working ? `${agentName} is working here` : "Paused"}</span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={`${status}${detail}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.3, ease: ease.out }}
                    className="truncate text-muted-foreground"
                  >
                    {working ? <Shimmer>{status}</Shimmer> : status}
                  </motion.span>
                </AnimatePresence>
              </p>
              {working
                ? onTakeBack && (
                    <Button size="sm" variant="outline" onClick={onTakeBack}>
                      Take back
                    </Button>
                  )
                : onResume && (
                    <Button size="sm" onClick={onResume}>
                      Resume
                    </Button>
                  )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- The edge light ---------- */

type Frame = { x: number; y: number; w: number; h: number; r: number }

const perimeterOf = (c: Frame) => 2 * (c.w + c.h - 4 * c.r) + 2 * Math.PI * c.r

/** The point `s` px clockwise round the frame, starting where the top edge leaves its corner. */
function pointAt(c: Frame, s: number): [number, number] {
  const { x, y, w, h, r } = c
  const sw = w - 2 * r
  const sh = h - 2 * r
  const arc = (Math.PI * r) / 2
  const P = perimeterOf(c)
  s = ((s % P) + P) % P
  const corner = (cx: number, cy: number, from: number, t: number): [number, number] => {
    const a = from + (t / arc) * (Math.PI / 2)
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  }
  if (s < sw) return [x + r + s, y]
  if ((s -= sw) < arc) return corner(x + w - r, y + r, -Math.PI / 2, s)
  if ((s -= arc) < sh) return [x + w, y + r + s]
  if ((s -= sh) < arc) return corner(x + w - r, y + h - r, 0, s)
  if ((s -= arc) < sw) return [x + w - r - s, y + h]
  if ((s -= sw) < arc) return corner(x + r, y + h - r, Math.PI / 2, s)
  if ((s -= arc) < sh) return [x, y + h - r - s]
  return corner(x + r, y + r, Math.PI, s - sh)
}

/** Speed through corners, as a share of speed on the straights. */
const CORNER_PACE = 0.4
/** How far before and after a corner the light eases in and out of it, in px. */
const EASE_PX = 200

/** 0 to 1: full speed on the straights, easing into each corner and back out, like it has momentum. */
function paceAt(c: Frame, s: number) {
  const sw = c.w - 2 * c.r
  const sh = c.h - 2 * c.r
  const arc = (Math.PI * c.r) / 2
  const P = perimeterOf(c)
  const corners = [sw + arc / 2, sw + arc + sh + arc / 2, 2 * sw + 3 * arc + sh + arc / 2, 2 * (sw + sh) + 3.5 * arc]
  s = ((s % P) + P) % P
  const d = Math.min(...corners.map((m) => Math.min(Math.abs(s - m), P - Math.abs(s - m))))
  const t = Math.min(1, Math.max(0, (d - arc / 2) / EASE_PX))
  return CORNER_PACE + (1 - CORNER_PACE) * t * t * (3 - 2 * t)
}

type RGB = [number, number, number]

/** Any CSS color to RGB, through the canvas's own parser. */
function toRgb(color: string): RGB {
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true })
  if (!probe) return [255, 255, 255]
  probe.fillStyle = color
  probe.fillRect(0, 0, 1, 1)
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}

/** A soft round glow, rendered once and stamped many times a frame. */
function sprite([r, g, b]: RGB) {
  const size = 128
  const el = document.createElement("canvas")
  el.width = el.height = size
  const ctx = el.getContext("2d")
  if (!ctx) return el
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  // Roughly Gaussian, so overlapping stamps blend into one smooth band.
  for (const [at, a] of [
    [0, 1],
    [0.25, 0.7],
    [0.5, 0.3],
    [0.75, 0.08],
    [1, 0],
  ]) {
    grad.addColorStop(at, `rgba(${r},${g},${b},${a})`)
  }
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  return el
}

/** The frame inside the light's canvas: the surface's border box, half a pixel in. */
function frameOf(surface: HTMLElement): Frame {
  const r = Math.max(0, parseFloat(getComputedStyle(surface).borderTopLeftRadius) - 0.5)
  return { x: BLEED + 0.5, y: BLEED + 0.5, w: surface.offsetWidth - 1, h: surface.offsetHeight - 1, r }
}

function outlinePath(c: Frame) {
  const { r } = c
  const [L, T, R, B] = [c.x, c.y, c.x + c.w, c.y + c.h]
  return (
    `M ${L + r} ${T} H ${R - r} A ${r} ${r} 0 0 1 ${R} ${T + r} V ${B - r} A ${r} ${r} 0 0 1 ${R - r} ${B}` +
    ` H ${L + r} A ${r} ${r} 0 0 1 ${L} ${B - r} V ${T + r} A ${r} ${r} 0 0 1 ${L + r} ${T} Z`
  )
}

/**
 * A comet of the theme's primary color running round the surface's edge at an even pace,
 * tapering to a hairline behind a white-hot head. Drawn on a canvas each frame, so it can
 * bloom without full-screen blur filters. Paused, only the track stays; done, the edge flashes.
 */
function EdgeLight({
  state,
  finished,
  lap,
  beam,
  strongTrack,
}: {
  state: TakeoverState
  finished: number
  lap: number
  beam: boolean
  /** Track mode: the edge is the only signal, so it shows stronger. */
  strongTrack: boolean
}) {
  const root = React.useRef<HTMLDivElement>(null)
  const canvas = React.useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const [frame, setFrame] = React.useState<Frame>()
  const working = state === "working"

  React.useEffect(() => {
    const surface = root.current?.parentElement
    if (!surface) return
    const update = () => setFrame(frameOf(surface))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(surface)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    const el = canvas.current
    const ctx = el?.getContext("2d")
    const surface = root.current?.parentElement
    if (!working || !beam || reduced || !el || !ctx || !surface) return
    const rgb = toRgb(getComputedStyle(el).color)
    const tint = sprite(rgb)
    const white = sprite([255, 255, 255])
    const stamp = (img: HTMLCanvasElement, [x, y]: [number, number], radius: number, alpha: number) => {
      ctx.globalAlpha = alpha
      ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2)
    }
    // k: 0 is the theme color, 1 is white.
    const color = (k: number, a: number) => {
      const m = (v: number) => Math.round(v + (255 - v) * k)
      return `rgba(${m(rgb[0])},${m(rgb[1])},${m(rgb[2])},${a})`
    }

    // Where the head is, as a share of the outline, so a resize keeps it in place.
    let along = 0
    let last = performance.now()
    let raf = 0
    const draw = (now: number) => {
      // Clamped, so a frame after the tab was hidden doesn't jump the light.
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      raf = requestAnimationFrame(draw)
      const c = frameOf(surface)
      const dpr = window.devicePixelRatio || 1
      const W = Math.round((c.w + 1 + BLEED * 2) * dpr)
      const H = Math.round((c.h + 1 + BLEED * 2) * dpr)
      if (el.width !== W || el.height !== H) {
        el.width = W
        el.height = H
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = "source-over"
      ctx.clearRect(0, 0, W, H)
      const P = perimeterOf(c)
      // Time per lap depends on the mean of 1/pace, so scaling by it keeps a lap at `lap` seconds.
      let slowness = 0
      for (let i = 0; i < 64; i++) slowness += 1 / paceAt(c, (i / 64) * P) / 64
      const pace = paceAt(c, along * P)
      along = (along + (dt * pace * slowness) / lap) % 1
      const head = along * P
      // The tail stretches on the straights and gathers up as the light slows into a corner.
      const tail = Math.min(P * 0.3, 900) * (0.6 + 0.4 * pace)
      const at = (k: number) => pointAt(c, head - k * tail)

      // Bloom: wide soft light behind the head, kept mostly outside the surface.
      ctx.globalCompositeOperation = "lighter"
      const reach = tail * 0.55
      for (let d = 0; d <= reach; d += 5) {
        const f = 1 - d / reach
        stamp(tint, at(d / tail), 16 + 18 * f, 0.01 * f ** 1.6)
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = "destination-out"
      ctx.fillStyle = "rgba(0,0,0,0.7)"
      ctx.beginPath()
      ctx.roundRect(c.x, c.y, c.w, c.h, c.r)
      ctx.fill()

      // Halo hugging the line.
      ctx.globalCompositeOperation = "lighter"
      const halo = tail * 0.8
      for (let d = 0; d <= halo; d += 2) {
        const f = 1 - d / halo
        stamp(tint, at(d / tail), 2 + 5 * f ** 2, 0.016 * f ** 2)
      }

      // The line: thins to a hairline and fades out, heating to white towards the head. Drawn in
      // short runs that overlap by half a pixel, so no seams show.
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = "source-over"
      ctx.lineCap = "butt"
      ctx.lineJoin = "round"
      const run = 8
      for (let d = 0; d < tail; d += run) {
        const f = 1 - (d + run / 2) / tail
        ctx.strokeStyle = color(0.5 * f ** 8, 0.5 * f ** 1.5)
        ctx.lineWidth = 0.5 + 0.6 * f ** 2.5
        ctx.beginPath()
        const [x0, y0] = at(Math.max(0, d - 0.5) / tail)
        ctx.moveTo(x0, y0)
        for (let s = 2; s <= run; s += 2) {
          const [x, y] = at(Math.min(tail, d + s) / tail)
          ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      // The head: a white point in a hot glow, so it reads as a point of light, not a streak.
      ctx.globalCompositeOperation = "lighter"
      const tip = at(0)
      stamp(tint, tip, 22, 0.6)
      stamp(white, tip, 9, 0.75)
      stamp(white, tip, 3, 1)
      ctx.globalAlpha = 1
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [working, beam, reduced, lap])

  const path = frame ? outlinePath(frame) : undefined
  const glowId = React.useId()

  return (
    <div ref={root} aria-hidden className="pointer-events-none absolute -inset-8 z-30 text-primary">
      {path && (
        <svg className="absolute inset-0 size-full overflow-visible">
          <defs>
            <filter id={glowId} filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          {/* The track the light runs on, faintly in the agent's color while it has the surface. */}
          <AnimatePresence>
            {state !== "idle" && state !== "done" && (
              <motion.path
                key="track"
                d={path}
                fill="none"
                // Without the beam, the track carries the signal on its own, so it shows stronger.
                className={strongTrack ? "stroke-primary/70" : "stroke-primary/25"}
                strokeWidth={1}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              />
            )}
          </AnimatePresence>
          {/* Done: the whole edge brightens at once, then settles. */}
          {finished > 0 && (
            <motion.path
              key={finished}
              d={path}
              fill="none"
              className="stroke-primary"
              strokeWidth={1.5}
              filter={`url(#${glowId})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.8, times: [0, 0.22, 1], ease: "easeOut" }}
            />
          )}
        </svg>
      )}
      <AnimatePresence>
        {working && beam && !reduced && (
          <motion.canvas
            key="light"
            ref={canvas}
            className="absolute inset-0 size-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- Inline signals ---------- */

/** Types `text` in a character at a time, with a caret in the agent's color: how it writes a new value. */
function AgentTyped({ text }: { text: string }) {
  const [shown, setShown] = React.useState(0)
  React.useEffect(() => {
    const id = setInterval(() => setShown((n) => (n >= text.length ? n : n + 1)), TYPE_MS)
    return () => clearInterval(id)
  }, [text])
  return (
    <>
      <span aria-hidden>
        {text.slice(0, shown)}
        <span className="ml-px inline-block h-4 w-px animate-pulse bg-primary align-middle" />
      </span>
      <span className="sr-only">{text}</span>
    </>
  )
}

/**
 * A value the agent fills in: pending until its turn, lit up while it writes, then the value
 * blurs in. Outside a takeover, render the value alone.
 */
function AgentField({
  state,
  label,
  paused = false,
  children,
}: {
  state: "pending" | "writing" | "done"
  /** What the agent says while it writes this one, e.g. "Emailing…". */
  label: string
  paused?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      data-active={state === "writing" || undefined}
      className="-mx-2 flex h-9 items-center rounded-md px-2 transition-colors duration-800 data-active:bg-primary/10 data-active:ring-1 data-active:ring-primary/60"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={state}
          initial={{ opacity: 0, filter: "blur(3px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: ease.out }}
          className="flex items-center gap-2 text-sm"
        >
          {state === "done" ? (
            children
          ) : state === "writing" ? (
            <>
              {paused ? (
                <PauseIcon className="size-3.5 text-primary" />
              ) : (
                <span className="flex text-primary">
                  <Spinner className="size-3.5" />
                </span>
              )}
              {paused ? "Paused" : label}
            </>
          ) : (
            <span className="text-muted-foreground">Pending</span>
          )}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

export { AgentField, AgentTakeover, AgentTyped }
