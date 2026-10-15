"use client"

import * as React from "react"
import { motion, useReducedMotion, type Transition } from "motion/react"
import { cn } from "cn"

type AmbientBackgroundVariant = "mesh" | "aurora" | "spotlight" | "rays" | "waves" | "dots" | "grid"

/** Seconds for one drift at speed 1. Slow on purpose: ambient motion should never pull focus. */
const DRIFT_S = 18

/**
 * A soft, moving backdrop for agent surfaces: empty chats, voice calls, onboarding. Tinted
 * from the theme's primary color, so it follows the site theme. Put it first inside a
 * `relative isolate overflow-hidden` container; it sits behind the content and ignores
 * pointer events. It holds still under prefers-reduced-motion and at `speed={0}`.
 */
function AmbientBackground({
  variant = "mesh",
  intensity = 0.6,
  speed = 1,
  grain = 0,
  className,
}: {
  /**
   * mesh: drifting glows. aurora: soft bands across the top. spotlight: a breathing glow from above.
   * rays: light beams fanning down from the top. waves: layered swells along the bottom.
   * dots and grid: a dot or line field lit by a moving glow.
   */
  variant?: AmbientBackgroundVariant
  /** How strong the color is, 0 to 1. */
  intensity?: number
  /** Drift speed. 0 holds still; 1 is one slow drift every 18 seconds. */
  speed?: number
  /** Film grain over the top, 0 to 1. Takes the banding out of smooth gradients. */
  grain?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  const still = reduced || speed <= 0
  const drift = (seconds: number, delay = 0): Transition =>
    still
      ? { duration: 0 }
      : { duration: (seconds * DRIFT_S) / speed, delay, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }

  return (
    <div
      data-slot="ambient-background"
      data-variant={variant}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      {variant === "mesh" && <Mesh intensity={intensity} still={still} drift={drift} />}
      {variant === "aurora" && <Aurora intensity={intensity} still={still} drift={drift} />}
      {variant === "spotlight" && <Spotlight intensity={intensity} still={still} drift={drift} />}
      {variant === "rays" && <Rays intensity={intensity} still={still} drift={drift} />}
      {variant === "waves" && <Waves intensity={intensity} still={still} speed={speed} />}
      {(variant === "dots" || variant === "grid") && (
        <Field kind={variant} intensity={intensity} still={still} drift={drift} />
      )}
      {grain > 0 && <Grain amount={grain} />}
    </div>
  )
}

type LayerProps = { intensity: number; still: boolean; drift: (seconds: number, delay?: number) => Transition }

function Mesh({ intensity, still, drift }: LayerProps) {
  const blobs = [
    { className: "-top-1/4 -left-1/5 w-3/5", opacity: 0.55, x: ["0%", "22%", "8%"], y: ["0%", "6%", "16%"], seconds: 0.8 },
    { className: "-right-1/5 -bottom-1/4 w-3/5", opacity: 0.4, x: ["0%", "-10%", "-20%"], y: ["0%", "-14%", "-4%"], seconds: 1 },
    { className: "top-1/4 left-1/3 w-2/5", opacity: 0.25, x: ["0%", "-24%", "-8%"], y: ["0%", "10%", "20%"], seconds: 0.6 },
  ]
  return blobs.map((b, i) => (
    <motion.div
      key={i}
      className={cn("absolute aspect-square rounded-full bg-primary blur-3xl", b.className)}
      initial={false}
      animate={{
        opacity: b.opacity * intensity,
        x: still ? "0%" : b.x,
        y: still ? "0%" : b.y,
        scale: still ? 1 : [1, 1.15, 0.95],
      }}
      transition={{ opacity: { duration: 0.4 }, default: drift(b.seconds, i * 1.5) }}
    />
  ))
}

function Aurora({ intensity, still, drift }: LayerProps) {
  const bands = [
    { className: "top-0 h-1/3", opacity: 0.9, x: ["-12%", "8%"], rotate: [-6, -3], seconds: 0.8 },
    { className: "top-1/6 h-1/4", opacity: 0.6, x: ["10%", "-10%"], rotate: [3, 6], seconds: 1.1 },
    { className: "-top-1/12 h-1/5", opacity: 0.5, x: ["-6%", "12%"], rotate: [-2, 1], seconds: 0.6 },
  ]
  return bands.map((b, i) => (
    <motion.div
      key={i}
      className={cn(
        "absolute -inset-x-1/4 rounded-full bg-linear-to-r from-transparent via-primary to-transparent blur-2xl",
        b.className,
      )}
      initial={false}
      animate={{
        opacity: b.opacity * intensity,
        x: still ? "0%" : b.x,
        y: still ? "0%" : ["0%", "12%", "-6%"],
        rotate: still ? b.rotate[0] : b.rotate,
        scaleY: still ? 1 : [1, 1.35],
      }}
      transition={{ opacity: { duration: 0.4 }, default: drift(b.seconds, i) }}
    />
  ))
}

function Spotlight({ intensity, still, drift }: LayerProps) {
  return (
    <>
      <motion.div
        className="absolute -top-1/2 left-1/6 aspect-square w-2/3 rounded-full bg-primary blur-3xl"
        initial={false}
        animate={{
          opacity: still ? 0.5 * intensity : [0.5 * intensity, 0.3 * intensity],
          scale: still ? 1 : [1, 1.15],
          x: still ? "0%" : ["-6%", "6%"],
        }}
        transition={drift(0.35)}
      />
      {/* A tighter, brighter core so the light has a source. */}
      <motion.div
        className="absolute -top-1/6 left-3/8 aspect-square w-1/4 rounded-full bg-primary blur-2xl"
        initial={false}
        animate={{
          opacity: still ? 0.45 * intensity : [0.45 * intensity, 0.6 * intensity],
          x: still ? "0%" : ["-10%", "10%"],
          scale: still ? 1 : [0.9, 1.1],
        }}
        transition={drift(0.25, 1)}
      />
    </>
  )
}

function Rays({ intensity, still, drift }: LayerProps) {
  const rays = [
    { angle: -40, opacity: 0.4, sway: 6, seconds: 0.8 },
    { angle: -22, opacity: 0.7, sway: -5, seconds: 0.6 },
    { angle: -7, opacity: 0.5, sway: 5, seconds: 0.9 },
    { angle: 9, opacity: 0.8, sway: -6, seconds: 0.65 },
    { angle: 25, opacity: 0.45, sway: 5, seconds: 0.85 },
    { angle: 41, opacity: 0.35, sway: -5, seconds: 0.7 },
  ]
  return (
    // Fan out from a point above the top edge, fading before they reach the bottom.
    <div className="absolute inset-0 mask-b-from-30% mask-b-to-100%">
      {rays.map((r, i) => (
        <motion.div
          key={i}
          className="absolute -top-1/12 left-1/2 h-3/2 w-1/12 origin-top -translate-x-1/2 bg-linear-to-b from-primary to-transparent blur-sm"
          initial={false}
          animate={{
            rotate: still ? r.angle : [r.angle, r.angle + r.sway],
            opacity: still ? r.opacity * intensity : [r.opacity * intensity, r.opacity * intensity * 0.4],
            scaleX: still ? 1 : [1, 1.6, 0.8],
          }}
          transition={drift(r.seconds, i * 0.7)}
        />
      ))}
    </div>
  )
}

function Waves({ intensity, still, speed }: { intensity: number; still: boolean; speed: number }) {
  // Back layers are taller and slower; the middle one travels the other way so the layers cross.
  const layers = [
    { className: "h-2/5", opacity: 0.3, amp: 34, seconds: 0.55, swell: 1.3, reverse: false },
    { className: "h-1/3", opacity: 0.4, amp: 26, seconds: 0.4, swell: 1.4, reverse: true },
    { className: "h-1/4", opacity: 0.5, amp: 18, seconds: 0.3, swell: 1.5, reverse: false },
  ]
  const id = React.useId()
  const wave = (amp: number) => {
    let d = `M0 50 Q75 ${50 - amp} 150 50`
    for (let x = 300; x <= 1200; x += 150) d += ` T${x} 50`
    return `${d} V100 H0Z`
  }
  return layers.map((l, i) => (
    // The wrapper swells up and down from the bottom edge; the SVG inside slides sideways.
    <motion.div
      key={i}
      className={cn("absolute inset-x-0 bottom-0 origin-bottom", l.className)}
      initial={false}
      animate={{ opacity: l.opacity * intensity, scaleY: still ? 1 : [1, l.swell] }}
      transition={{
        opacity: { duration: 0.4 },
        default: still
          ? { duration: 0 }
          : {
              duration: (l.seconds * DRIFT_S * 0.6) / speed,
              delay: i * 0.8,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            },
      }}
    >
      {/* Twice as wide as the surface with an even number of periods, so sliding by half loops seamlessly. */}
      <motion.svg
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
        className="absolute inset-y-0 left-0 h-full w-2/1 text-primary"
        initial={false}
        animate={{ x: still ? "0%" : l.reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={
          still
            ? { duration: 0 }
            : { duration: (l.seconds * DRIFT_S) / speed, repeat: Infinity, ease: "linear", repeatType: "loop" }
        }
      >
        {/* Bright at the crest, fading toward the bottom edge, so each swell reads as light, not a solid band. */}
        <linearGradient id={`${id}-${i}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <path fill={`url(#${id}-${i})`} d={wave(l.amp)} />
      </motion.svg>
    </motion.div>
  ))
}

function Field({ kind, intensity, still, drift }: LayerProps & { kind: "dots" | "grid" }) {
  const id = React.useId()
  const field = (className: string, weight: number) => (
    <svg className={cn("absolute inset-0 size-full", className)}>
      <pattern
        id={`${id}-${className}`}
        width={kind === "dots" ? 18 : 32}
        height={kind === "dots" ? 18 : 32}
        patternUnits="userSpaceOnUse"
      >
        {kind === "dots" ? (
          <circle cx="9" cy="9" r={weight} fill="currentColor" />
        ) : (
          <path d="M32 0H0V32" fill="none" stroke="currentColor" strokeWidth={weight} />
        )}
      </pattern>
      <rect width="100%" height="100%" fill={`url(#${id}-${className})`} />
    </svg>
  )
  return (
    // Fade the field out toward the edges so it reads as a backdrop, not a grid.
    <div className="absolute inset-0 mask-radial-from-40% mask-radial-to-80%">
      {field(kind === "dots" ? "text-foreground/15" : "text-foreground/10", kind === "dots" ? 1.1 : 1)}
      {/* The same field in the primary color, shown only under a glow that drifts across it. */}
      <motion.div
        className="absolute inset-0 mask-radial-[35%_45%] mask-radial-from-0% mask-radial-to-100% mask-radial-at-(--glow)"
        initial={false}
        animate={{
          opacity: still ? Math.min(1, intensity * 1.4) : [Math.min(1, intensity * 1.4), Math.min(1, intensity)],
          "--glow": still ? "50% 45%" : ["30% 35%", "65% 30%", "70% 60%", "35% 65%"],
        }}
        transition={{ opacity: drift(0.3), default: drift(1.2) }}
      >
        {field("text-primary", kind === "dots" ? 1.6 : 1.5)}
      </motion.div>
    </div>
  )
}

/** SVG turbulence noise, blended over the color so gradients don't band. */
function Grain({ amount }: { amount: number }) {
  const id = React.useId()
  return (
    <svg className="absolute inset-0 size-full mix-blend-overlay" opacity={amount * 0.5}>
      <filter id={`${id}-grain`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id}-grain)`} />
    </svg>
  )
}

export { AmbientBackground, type AmbientBackgroundVariant }
