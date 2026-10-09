"use client"

import * as React from "react"
import { AnimatePresence, motion, type Transition, type Variants } from "motion/react"
import { cn } from "cn"

import { ControlGroup, Range, Segmented, Toggle } from "@/components/studio/controls"
import { studioMarkdown } from "@/components/studio/markdown"
import { StudioCode } from "@/components/studio/studio-code"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSimulatedSpectrum } from "@/hooks/use-simulated-spectrum"
import { PlayIcon, SparkleIcon } from "@/lib/icons"

type SpringName = "snappy" | "gentle" | "soft"
/** Stiffness as set in lib/motion, and bounce as a percent: 0 settles without overshoot. */
type SpringConfig = { stiffness: number; bounce: number; mass: number }
type EaseName = "smooth" | "sharp" | "standard"

type Config = {
  springs: Record<SpringName, SpringConfig>
  /** Multiplies every tween duration. */
  durationScale: number
  ease: EaseName
  /** How far streamed content rises as it enters, in px. */
  rise: number
  blur: boolean
  /** Delay between cascading items, in ms. */
  stagger: number
}

const eases: Record<EaseName, readonly [number, number, number, number]> = {
  smooth: [0.22, 1, 0.36, 1],
  sharp: [0.16, 1, 0.3, 1],
  standard: [0.4, 0, 0.2, 1],
}

const baseDurations = { instant: 0.1, fast: 0.16, base: 0.24, slow: 0.4 }

/** JDS's shipped values, the same as lib/motion.ts. */
const defaults: Config = {
  springs: {
    snappy: { stiffness: 520, bounce: 4, mass: 0.6 },
    gentle: { stiffness: 260, bounce: 7, mass: 1 },
    soft: { stiffness: 120, bounce: 18, mass: 1 },
  },
  durationScale: 1,
  ease: "smooth",
  rise: 6,
  blur: true,
  stagger: 40,
}

const presets: { name: string; body: string; config: Config }[] = [
  { name: "Smooth", body: "JDS default, calm and quick", config: defaults },
  {
    name: "Crisp",
    body: "Fast, no overshoot, tool-like",
    config: {
      springs: {
        snappy: { stiffness: 700, bounce: 0, mass: 0.6 },
        gentle: { stiffness: 420, bounce: 0, mass: 1 },
        soft: { stiffness: 220, bounce: 8, mass: 1 },
      },
      durationScale: 0.75,
      ease: "sharp",
      rise: 4,
      blur: false,
      stagger: 25,
    },
  },
  {
    name: "Gentle",
    body: "Slower and softer, for calm products",
    config: {
      springs: {
        snappy: { stiffness: 360, bounce: 2, mass: 0.6 },
        gentle: { stiffness: 160, bounce: 2, mass: 1 },
        soft: { stiffness: 80, bounce: 10, mass: 1 },
      },
      durationScale: 1.3,
      ease: "smooth",
      rise: 10,
      blur: true,
      stagger: 60,
    },
  },
  {
    name: "Playful",
    body: "Visible bounce, for consumer apps",
    config: {
      springs: {
        snappy: { stiffness: 600, bounce: 30, mass: 0.6 },
        gentle: { stiffness: 300, bounce: 30, mass: 1 },
        soft: { stiffness: 140, bounce: 40, mass: 1 },
      },
      durationScale: 1,
      ease: "smooth",
      rise: 12,
      blur: false,
      stagger: 50,
    },
  },
]

const springUses: Record<SpringName, string> = {
  snappy: "Buttons, toggles, small affordances",
  gentle: "Panels, messages, layout shifts",
  soft: "Voice orbs and ambient elements",
}

/** Bounce is 1 minus the damping ratio, so damping = 2 × (1 − bounce) × √(stiffness × mass). */
const damping = (s: SpringConfig) => Math.round(2 * (1 - s.bounce / 100) * Math.sqrt(s.stiffness * s.mass))

const toSpring = (s: SpringConfig): Transition => ({
  type: "spring",
  stiffness: s.stiffness,
  damping: damping(s),
  mass: s.mass,
})

const round = (n: number) => Math.round(n * 1000) / 1000

function durations(c: Config) {
  return Object.fromEntries(
    Object.entries(baseDurations).map(([k, v]) => [k, round(v * c.durationScale)]),
  ) as typeof baseDurations
}

/* ---------- Code ---------- */

function generateCode(c: Config) {
  const d = durations(c)
  const spring = (name: SpringName, comment: string) => {
    const s = c.springs[name]
    const mass = s.mass !== 1 ? `, mass: ${s.mass}` : ""
    return `  /** ${comment} */\n  ${name}: { type: "spring", stiffness: ${s.stiffness}, damping: ${damping(s)}${mass} },`
  }
  const hidden = [`opacity: 0`, `y: ${c.rise}`, ...(c.blur ? [`filter: "blur(2px)"`] : [])].join(", ")
  const visible = ["opacity: 1", "y: 0", ...(c.blur ? [`filter: "blur(0px)"`] : [])].join(",\n    ")
  return `import type { Transition, Variants } from "motion/react"

/** Durations in seconds. Keep UI feedback under 250ms. */
export const duration = {
  instant: ${d.instant},
  fast: ${d.fast},
  base: ${d.base},
  slow: ${d.slow},
} as const

export const ease = {
  out: [${eases[c.ease].join(", ")}],
  inOut: [0.76, 0, 0.24, 1],
} as const

export const spring = {
${spring("snappy", "Buttons, toggles, small affordances.")}
${spring("gentle", "Panels, messages, layout shifts.")}
${spring("soft", "Voice orbs and ambient elements.")}
} satisfies Record<string, Transition>

/** Enter from below, used for streamed messages and list items. */
export const rise: Variants = {
  hidden: { ${hidden} },
  visible: {
    ${visible},
    transition: { duration: duration.base, ease: ease.out },
  },
}

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.fast } },
}

export const stagger = (staggerChildren = ${c.stagger / 1000}): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren } },
})
`
}

const feel = (s: SpringConfig) =>
  `${s.stiffness < 200 ? "slow" : s.stiffness < 450 ? "medium" : "fast"}, ${s.bounce === 0 ? "no bounce" : `${s.bounce}% bounce`}`

function generateMarkdown(c: Config) {
  return studioMarkdown({
    title: "Motion presets",
    intro:
      "The app's motion presets. Every JDS component imports its timing from lib/motion.ts, so replacing that file changes the whole app.",
    choices: [
      ["spring.snappy", `${feel(c.springs.snappy)} (buttons, toggles)`],
      ["spring.gentle", `${feel(c.springs.gentle)} (panels, messages)`],
      ["spring.soft", `${feel(c.springs.soft)} (orbs, ambient)`],
      ["Tween durations", `${c.durationScale}× (base ${durations(c).base * 1000}ms)`],
      ["Easing", c.ease],
      ["Streamed content", `rises ${c.rise}px${c.blur ? " with a short blur" : ""}, ${c.stagger}ms apart`],
    ],
    install: ["utils"],
    placement: ["Replace lib/motion.ts with the code below. Keep the export names: components import them."],
    code: generateCode(c),
    notes: [
      "Tailwind transitions use the CSS easings in globals.css (ease-out-quint, ease-in-out-quart); update those to match if you change the easing.",
    ],
  })
}

/* ---------- Demos ---------- */

function Demo({
  title,
  uses,
  children,
  className,
}: {
  title: string
  uses: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <div className="flex items-baseline justify-between gap-3 border-b px-4 py-2.5">
        <span className="text-sm font-medium">{title}</span>
        <code className="truncate font-mono text-xs text-muted-foreground">{uses}</code>
      </div>
      <div className={cn("relative grid h-44 place-items-center overflow-hidden bg-background p-4", className)}>
        {children}
      </div>
    </div>
  )
}

const lines = ["Found the design review at 2pm.", "Tomorrow you're both free at 10:30.", "Moved it and told Luca."]

function MessagesDemo({ c, play }: { c: Config; play: number }) {
  const d = durations(c)
  const rise: Variants = {
    hidden: { opacity: 0, y: c.rise, filter: c.blur ? "blur(2px)" : "blur(0px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: d.base, ease: eases[c.ease] } },
  }
  return (
    <motion.div
      key={play}
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: c.stagger / 1000, delayChildren: 0.15 } } }}
      className="flex w-full max-w-xs flex-col gap-2"
    >
      {lines.map((l) => (
        <motion.p key={l} variants={rise} className="text-sm">
          {l}
        </motion.p>
      ))}
    </motion.div>
  )
}

function PanelDemo({ c, play }: { c: Config; play: number }) {
  const [open, setOpen] = React.useState(true)
  // Each replay closes the panel, then opens it again so the entrance plays.
  React.useEffect(() => {
    if (!play) return
    const close = setTimeout(() => setOpen(false), 0)
    const reopen = setTimeout(() => setOpen(true), 350)
    return () => {
      clearTimeout(close)
      clearTimeout(reopen)
    }
  }, [play])
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className="absolute inset-0 text-left outline-none"
      aria-label="Toggle panel"
    >
      <div className="flex size-full flex-col gap-2 p-4">
        {["w-3/5", "w-11/12", "w-3/4", "w-5/6"].map((w) => (
          <span key={w} className={cn("h-2 rounded-full bg-muted", w)} />
        ))}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={toSpring(c.springs.gentle)}
            className="absolute inset-y-2 right-2 flex w-1/2 flex-col gap-2 rounded-lg border bg-card p-3 shadow-lg"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <SparkleIcon className="size-3" />
              Agent
            </span>
            <span className="h-2 w-4/5 rounded-full bg-muted" />
            <span className="h-2 w-3/5 rounded-full bg-muted" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}

function PressDemo({ c, play }: { c: Config; play: number }) {
  const [on, setOn] = React.useState(false)
  React.useEffect(() => {
    if (!play) return
    const id = setTimeout(() => setOn((o) => !o), 0)
    return () => clearTimeout(id)
  }, [play])
  const snappy = toSpring(c.springs.snappy)
  return (
    <div className="flex flex-col items-center gap-5">
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        transition={snappy}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Press and hold
      </motion.button>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Sample switch"
        onClick={() => setOn((o) => !o)}
        className={cn(
          "flex h-7 w-12 items-center rounded-full p-0.5 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          on ? "justify-end bg-primary" : "justify-start bg-muted",
        )}
      >
        <motion.span layout transition={snappy} className="size-6 rounded-full bg-background shadow-sm" />
      </button>
    </div>
  )
}

function OrbDemo({ c }: { c: Config }) {
  const { level } = useSimulatedSpectrum(true)
  return (
    <motion.div
      animate={{ scale: 1 + level * 0.35 }}
      transition={toSpring(c.springs.soft)}
      className="size-20 rounded-full bg-radial from-primary to-primary/30"
    />
  )
}

function TweenDemo({ c, play }: { c: Config; play: number }) {
  const d = durations(c)
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      {(["fast", "base", "slow"] as const).map((k) => (
        <div key={k} className="flex items-center gap-3">
          <code className="w-10 font-mono text-xs text-muted-foreground">{k}</code>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              key={play}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: d[k], ease: eases[c.ease], delay: 0.2 }}
              className="h-full origin-left rounded-full bg-primary"
            />
          </div>
          <span className="w-12 text-right font-mono text-xs text-muted-foreground tabular-nums">
            {Math.round(d[k] * 1000)}ms
          </span>
        </div>
      ))}
    </div>
  )
}

/** Position over time for a spring from 0 to 1, by integrating it, so overshoot shows as it will play. */
function springCurve(s: SpringConfig, seconds = 1.2, steps = 240) {
  const d = damping(s)
  let x = 0
  let v = 0
  const dt = seconds / steps
  const points: [number, number][] = [[0, 0]]
  for (let i = 1; i <= steps; i++) {
    for (let j = 0; j < 4; j++) {
      const a = (-s.stiffness * (x - 1) - d * v) / s.mass
      v += a * (dt / 4)
      x += v * (dt / 4)
    }
    points.push([i / steps, x])
  }
  return points
}

function CurvesDemo({ c }: { c: Config }) {
  const W = 300
  const H = 120
  // y from -0.1 to 1.5, so overshoot has room above the settle line.
  const y = (v: number) => H - ((v + 0.1) / 1.6) * H
  const tones: Record<SpringName, string> = {
    snappy: "text-primary",
    gentle: "text-foreground",
    soft: "text-muted-foreground",
  }
  return (
    <div className="flex w-full flex-col gap-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-28 w-full overflow-visible" preserveAspectRatio="none">
        <line
          x1="0"
          x2={W}
          y1={y(1)}
          y2={y(1)}
          className="stroke-border"
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
        />
        {(Object.keys(c.springs) as SpringName[]).map((name) => (
          <polyline
            key={name}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            className={tones[name]}
            points={springCurve(c.springs[name])
              .map(([t, v]) => `${t * W},${y(v)}`)
              .join(" ")}
          />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground">
        {(Object.keys(c.springs) as SpringName[]).map((name) => (
          <span key={name} className="flex items-center gap-1.5">
            <span className={cn("h-0.5 w-3 rounded-full bg-current", tones[name])} />
            {name}
          </span>
        ))}
        <span>1.2s</span>
      </div>
    </div>
  )
}

/* ---------- Builder ---------- */

function SpringControls({
  name,
  value,
  onChange,
}: {
  name: SpringName
  value: SpringConfig
  onChange: (v: SpringConfig) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <code className="font-mono text-xs">spring.{name}</code>
        <span className="truncate text-xs text-muted-foreground">{springUses[name]}</span>
      </div>
      <Range
        label="Speed"
        value={value.stiffness}
        min={60}
        max={900}
        step={10}
        onChange={(stiffness) => onChange({ ...value, stiffness })}
      />
      <Range
        label="Bounce"
        value={value.bounce}
        min={0}
        max={60}
        step={1}
        unit="%"
        onChange={(bounce) => onChange({ ...value, bounce })}
      />
    </div>
  )
}

export function MotionBuilder() {
  const [c, setC] = React.useState<Config>(defaults)
  const [play, setPlay] = React.useState(0)
  const set =
    <K extends keyof Config>(key: K) =>
    (value: Config[K]) =>
      setC((prev) => ({ ...prev, [key]: value }))
  const setSpring = (name: SpringName) => (value: SpringConfig) =>
    setC((prev) => ({ ...prev, springs: { ...prev.springs, [name]: value } }))
  // Replay the demos when a preset is picked, so the change is felt right away.
  const apply = (config: Config) => {
    setC(config)
    setPlay((p) => p + 1)
  }

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-5 overflow-y-auto border-b p-5 lg:h-[calc(100svh-3.5rem-1px)] lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold">Motion</h1>
          <Button variant="ghost" size="xs" onClick={() => apply(defaults)}>
            Reset
          </Button>
        </div>
        <ControlGroup title="Presets">
          <div className="flex flex-col gap-2">
            {presets.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => apply(p.config)}
                className="flex items-baseline justify-between gap-3 rounded-lg border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="font-medium">{p.name}</span>
                <span className="truncate text-xs text-muted-foreground">{p.body}</span>
              </button>
            ))}
          </div>
        </ControlGroup>
        <ControlGroup title="Springs">
          {(Object.keys(c.springs) as SpringName[]).map((name) => (
            <SpringControls key={name} name={name} value={c.springs[name]} onChange={setSpring(name)} />
          ))}
        </ControlGroup>
        <ControlGroup title="Tweens">
          <Range
            label="Duration"
            value={c.durationScale}
            min={0.5}
            max={2}
            step={0.05}
            unit="×"
            onChange={set("durationScale")}
          />
          <Segmented
            label="Easing"
            value={c.ease}
            onChange={set("ease")}
            options={[
              { value: "smooth", label: "Smooth" },
              { value: "sharp", label: "Sharp" },
              { value: "standard", label: "Standard" },
            ]}
          />
        </ControlGroup>
        <ControlGroup title="Streamed content">
          <Range label="Rise" value={c.rise} min={0} max={20} step={1} unit="px" onChange={set("rise")} />
          <Range label="Stagger" value={c.stagger} min={0} max={120} step={5} unit="ms" onChange={set("stagger")} />
          <Toggle label="Blur on enter" checked={c.blur} onChange={set("blur")} />
        </ControlGroup>
      </aside>

      <Tabs defaultValue="preview" className="min-w-0 gap-0 p-5 lg:h-[calc(100svh-3.5rem-1px)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={() => setPlay((p) => p + 1)}>
            <PlayIcon />
            Replay
          </Button>
        </div>
        <TabsContent value="preview" className="min-h-0 overflow-y-auto">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Demo title="Streamed messages" uses="rise · stagger">
              <MessagesDemo c={c} play={play} />
            </Demo>
            <Demo title="Side panel" uses="spring.gentle">
              <PanelDemo c={c} play={play} />
            </Demo>
            <Demo title="Press and toggle" uses="spring.snappy">
              <PressDemo c={c} play={play} />
            </Demo>
            <Demo title="Voice orb" uses="spring.soft">
              <OrbDemo c={c} />
            </Demo>
            <Demo title="Tweens" uses="duration · ease.out">
              <TweenDemo c={c} play={play} />
            </Demo>
            <Demo title="Spring curves" uses="spring.*">
              <CurvesDemo c={c} />
            </Demo>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Click the panel, press the button or flip the switch to feel them. Picking a preset replays everything.
          </p>
        </TabsContent>
        <TabsContent value="code" className="min-h-0 overflow-y-auto">
          <StudioCode
            markdown={() => generateMarkdown(c)}
            scopes={[
              {
                value: "app",
                label: "Whole app",
                code: generateCode(c),
                note: "Replace lib/motion.ts. Every JDS component imports its timing from it, so the whole app moves this way.",
              },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
