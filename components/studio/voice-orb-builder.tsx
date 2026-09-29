"use client"

import * as React from "react"
import { cn } from "cn"

import { CopyButton } from "@/components/docs/copy-button"
import { ControlGroup, Range, Segmented, Toggle } from "@/components/studio/controls"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { VoiceOrb, type OrbPalette, type VoiceOrbVariant, type VoiceState } from "@/components/voice/voice-orb"
import { useSimulatedSpectrum } from "@/hooks/use-simulated-spectrum"

type Config = {
  variant: VoiceOrbVariant
  palette: OrbPalette
  color: "primary" | "foreground"
  size: number
  glow: number
  speed: number
  sensitivity: number
  /** Particles variant only. Null follows the size. */
  particles: number | null
}

const defaults: Config = {
  variant: "particles",
  palette: "primary",
  color: "primary",
  size: 200,
  glow: 0,
  speed: 1,
  sensitivity: 1,
  particles: null,
}

/** Starting points: a variant plus the settings that make it read well. */
const presets: { name: string; config: Partial<Config> }[] = [
  { name: "Sphere", config: { variant: "particles" } },
  { name: "Halo", config: { variant: "ring", glow: 0.5 } },
  { name: "Signal", config: { variant: "wave", glow: 0.3, speed: 1.1 } },
  { name: "Iris", config: { variant: "aura", palette: "iris", glow: 0.35 } },
  { name: "Ember", config: { variant: "aura", palette: "ember", speed: 0.8 } },
  { name: "Mist", config: { variant: "aura", palette: "mist", speed: 0.7 } },
  { name: "Plasma", config: { variant: "plasma", palette: "iris", glow: 0.4 } },
  { name: "Lava", config: { variant: "liquid", palette: "ember", glow: 0.25 } },
  { name: "Mercury", config: { variant: "liquid", palette: "mist", speed: 0.8 } },
  { name: "Equalizer", config: { variant: "bars", sensitivity: 1.4 } },
  { name: "Print", config: { variant: "halftone", color: "foreground" } },
  { name: "Pulse", config: { variant: "ring", color: "foreground", speed: 1.4, sensitivity: 1.6 } },
]

const states: { value: VoiceState; label: string; body: string }[] = [
  { value: "idle", label: "Idle", body: "Waiting. Slow, low-energy motion." },
  { value: "connecting", label: "Connecting", body: "Session opening. Breathes until ready." },
  { value: "listening", label: "Listening", body: "Hearing the user. Follows mic level." },
  { value: "thinking", label: "Thinking", body: "Working. Faster, turning motion." },
  { value: "speaking", label: "Speaking", body: "Agent talking. Follows output level." },
  { value: "error", label: "Error", body: "Something failed. Destructive and nearly still." },
]

const voiced = (s: VoiceState) => s === "listening" || s === "speaking"
const paletted = (v: VoiceOrbVariant) => v === "aura" || v === "plasma" || v === "liquid"
const usesColor = (c: Config) => !paletted(c.variant) || c.palette === "primary"

/** Props that differ from the component's defaults, one per line. */
function generateCode(c: Config) {
  const p = [`variant="${c.variant}"`]
  if (paletted(c.variant) && c.palette !== "primary") p.push(`palette="${c.palette}"`)
  p.push("state={state}", "level={level}")
  if (c.size !== 160) p.push(`size={${c.size}}`)
  if (c.glow > 0) p.push(`glow={${c.glow}}`)
  if (c.speed !== 1) p.push(`speed={${c.speed}}`)
  if (c.sensitivity !== 1) p.push(`sensitivity={${c.sensitivity}}`)
  if (c.variant === "particles" && c.particles !== null) p.push(`particles={${c.particles}}`)
  if (usesColor(c) && c.color === "foreground") p.push(`className="text-foreground"`)
  return `import { VoiceOrb } from "@/components/voice/voice-orb"

<VoiceOrb
  ${p.join("\n  ")}
/>`
}

function Orb({ c, state, level, size }: { c: Config; state: VoiceState; level: number; size?: number }) {
  return (
    <VoiceOrb
      variant={c.variant}
      palette={c.palette}
      state={state}
      level={level}
      size={size ?? c.size}
      glow={c.glow}
      speed={c.speed}
      sensitivity={c.sensitivity}
      particles={c.particles ?? undefined}
      className={cn(usesColor(c) && c.color === "foreground" && "text-foreground")}
    />
  )
}

function StateCard({ c, state }: { c: Config; state: (typeof states)[number] }) {
  const { level } = useSimulatedSpectrum(voiced(state.value))
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border bg-background p-6">
      <div className="flex h-40 items-center justify-center">
        <Orb c={c} state={state.value} level={level} size={Math.min(c.size, 140)} />
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-sm font-medium">{state.label}</span>
        <span className="text-xs text-muted-foreground">{state.body}</span>
      </div>
    </div>
  )
}

export function VoiceOrbBuilder() {
  const [c, setC] = React.useState<Config>(defaults)
  const [state, setState] = React.useState<VoiceState>("listening")
  const [cycle, setCycle] = React.useState(false)
  const { level } = useSimulatedSpectrum(voiced(state))
  const set =
    <K extends keyof Config>(key: K) =>
    (value: Config[K]) =>
      setC((prev) => ({ ...prev, [key]: value }))

  // Walk through every state so transitions can be judged, not just end points.
  React.useEffect(() => {
    if (!cycle) return
    const id = setInterval(() => {
      setState((s) => states[(states.findIndex((x) => x.value === s) + 1) % states.length].value)
    }, 2600)
    return () => clearInterval(id)
  }, [cycle])

  const current = states.find((s) => s.value === state)!

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-5 overflow-y-auto border-b p-5 lg:h-[calc(100svh-3.5rem)] lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold">Voice orb</h1>
          <Button variant="ghost" size="xs" onClick={() => setC(defaults)}>
            Reset
          </Button>
        </div>
        <ControlGroup title="Presets">
          <div className="grid grid-cols-3 gap-2">
            {presets.map((p) => {
              const preset = { ...defaults, ...p.config }
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setC(preset)}
                  className="flex flex-col items-center gap-2 rounded-lg border bg-background p-2 text-xs transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <span className="flex h-10 items-center justify-center">
                    <Orb c={preset} state="idle" level={0} size={preset.variant === "wave" ? 24 : 40} />
                  </span>
                  {p.name}
                </button>
              )
            })}
          </div>
        </ControlGroup>
        <ControlGroup title="Look">
          <Segmented
            label="Style"
            value={c.variant}
            onChange={set("variant")}
            options={[
              { value: "particles", label: "Particles" },
              { value: "ring", label: "Ring" },
              { value: "wave", label: "Wave" },
              { value: "aura", label: "Aura" },
              { value: "bars", label: "Bars" },
              { value: "halftone", label: "Halftone" },
              { value: "plasma", label: "Plasma" },
              { value: "liquid", label: "Liquid" },
            ]}
          />
          {paletted(c.variant) && (
            <Segmented
              label="Palette"
              value={c.palette}
              onChange={set("palette")}
              options={[
                { value: "primary", label: "Primary" },
                { value: "iris", label: "Iris" },
                { value: "ember", label: "Ember" },
                { value: "cocoa", label: "Cocoa" },
                { value: "mist", label: "Mist" },
              ]}
            />
          )}
          {usesColor(c) && (
            <Segmented
              label="Color"
              value={c.color}
              onChange={set("color")}
              options={[
                { value: "primary", label: "Primary" },
                { value: "foreground", label: "Foreground" },
              ]}
            />
          )}
          <Range label="Size" value={c.size} min={96} max={320} step={8} unit="px" onChange={set("size")} />
          <Range label="Glow" value={c.glow} min={0} max={1} step={0.05} onChange={set("glow")} />
          {c.variant === "particles" && (
            <Range
              label="Particles"
              value={c.particles ?? Math.round(Math.min(6000, c.size * c.size * 0.07))}
              min={400}
              max={6000}
              step={100}
              onChange={set("particles")}
            />
          )}
        </ControlGroup>
        <ControlGroup title="Motion">
          <Range label="Speed" value={c.speed} min={0.25} max={2} step={0.05} unit="×" onChange={set("speed")} />
          <Range
            label="Sensitivity"
            value={c.sensitivity}
            min={0}
            max={2}
            step={0.1}
            unit="×"
            onChange={set("sensitivity")}
          />
        </ControlGroup>
      </aside>

      <Tabs defaultValue="preview" className="min-w-0 gap-0 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="states">All states</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="preview">
          <div className="flex h-160 flex-col overflow-hidden rounded-2xl border bg-background">
            <div className="flex flex-1 items-center justify-center p-6">
              <Orb c={c} state={state} level={level} />
            </div>
            <div className="flex flex-col items-center gap-4 border-t p-5">
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {current.body}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <ToggleGroup
                  value={[state]}
                  onValueChange={(v) => {
                    if (!v[0]) return
                    setCycle(false)
                    setState(v[0] as VoiceState)
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-wrap"
                >
                  {states.map((s) => (
                    <ToggleGroupItem key={s.value} value={s.value}>
                      {s.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <Toggle label="Cycle states" checked={cycle} onChange={setCycle} />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="states">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {states.map((s) => (
              <StateCard key={s.value} c={c} state={s} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="code">
          <div className="relative overflow-hidden rounded-2xl border bg-card">
            <CopyButton value={generateCode(c)} className="absolute top-3 right-3" />
            <pre className="max-h-160 overflow-auto p-5 font-mono text-xs leading-relaxed">{generateCode(c)}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Install with <code className="font-mono">npx shadcn@latest add @jds/voice-orb</code>. Only props that differ
            from the defaults are included. Drive <code className="font-mono">state</code> from your session and{" "}
            <code className="font-mono">level</code> from mic or playback loudness.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
