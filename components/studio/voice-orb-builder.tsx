"use client"

import * as React from "react"
import { cn } from "cn"

import { CopyButton } from "@/components/docs/copy-button"
import { ColorRow, ControlGroup, Range, Segmented, Toggle } from "@/components/studio/controls"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CallControls, CallEnd, CallInterrupt, CallMute, CallStatus } from "@/components/voice/call-controls"
import { LiveTranscript } from "@/components/voice/live-transcript"
import {
  VoiceOrb,
  auraPalettes,
  type OrbPalette,
  type VoiceOrbVariant,
  type VoiceState,
} from "@/components/voice/voice-orb"
import { useSimulatedSpectrum } from "@/hooks/use-simulated-spectrum"

type Config = {
  variant: VoiceOrbVariant
  palette: OrbPalette | "custom"
  /** Base, then three fields. Used when palette is "custom". */
  custom: string[]
  color: "primary" | "foreground"
  size: number
  glow: number
  speed: number
  sensitivity: number
  /** Particles variant only. Null follows the size. */
  particles: number | null
}

type Surface = "stage" | "panel" | "call" | "compact"

const defaults: Config = {
  variant: "particles",
  palette: "primary",
  custom: [...auraPalettes.iris],
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
  { name: "Glass", config: { variant: "glass", palette: "iris", glow: 0.3 } },
  { name: "Plasma", config: { variant: "plasma", palette: "iris", glow: 0.4 } },
  { name: "Lava", config: { variant: "liquid", palette: "ember", glow: 0.25 } },
  { name: "Mercury", config: { variant: "liquid", palette: "mist", speed: 0.8 } },
  { name: "Equalizer", config: { variant: "bars", sensitivity: 1.4 } },
  { name: "Print", config: { variant: "halftone", color: "foreground" } },
  { name: "Dot", config: { variant: "dot", size: 32, sensitivity: 1.4 } },
]

const states: { value: VoiceState; label: string; body: string; status: string }[] = [
  { value: "idle", label: "Idle", body: "Waiting. Slow, low-energy motion.", status: "Tap to talk" },
  { value: "connecting", label: "Connecting", body: "Session opening. Breathes until ready.", status: "Connecting…" },
  { value: "listening", label: "Listening", body: "Hearing the user. Follows mic level.", status: "Listening…" },
  { value: "thinking", label: "Thinking", body: "Working. Faster, turning motion.", status: "Thinking…" },
  { value: "speaking", label: "Speaking", body: "Agent talking. Follows output level.", status: "Speaking…" },
  { value: "error", label: "Error", body: "Something failed. Destructive and nearly still.", status: "Couldn't connect" },
]

const voiced = (s: VoiceState) => s === "listening" || s === "speaking"
const paletted = (v: VoiceOrbVariant) => v === "aura" || v === "plasma" || v === "liquid" || v === "glass"
const usesColor = (c: Config) => !paletted(c.variant) || c.palette === "primary"
const paletteOf = (c: Config) => (c.palette === "custom" ? c.custom : c.palette)
/** The dot is built for small spots; everything else needs room to show detail. */
const sizeRange = (v: VoiceOrbVariant) => (v === "dot" ? { min: 16, max: 96, step: 4 } : { min: 96, max: 320, step: 8 })

/** Props that differ from the component's defaults, one per line. */
function generateCode(c: Config) {
  const p = [`variant="${c.variant}"`]
  if (paletted(c.variant) && c.palette === "custom") p.push(`palette={[${c.custom.map((x) => `"${x}"`).join(", ")}]}`)
  else if (paletted(c.variant) && c.palette !== "primary") p.push(`palette="${c.palette}"`)
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
      palette={paletteOf(c)}
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

type SurfaceProps = { c: Config; state: VoiceState; level: number }

/** Voice mode of an agent side panel. */
function PanelSurface({ c, state, level }: SurfaceProps) {
  return (
    <div className="flex h-104 w-90 max-w-full flex-col overflow-hidden rounded-2xl border bg-card shadow-lg">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="text-sm font-medium">Agent</span>
        <span className="text-xs text-muted-foreground">Voice</span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <Orb c={c} state={state} level={level} size={Math.min(c.size, 180)} />
        <span className="text-sm text-muted-foreground">{states.find((s) => s.value === state)!.status}</span>
      </div>
      <div className="flex justify-center border-t p-3">
        <Button variant="outline" size="sm">
          Back to chat
        </Button>
      </div>
    </div>
  )
}

/** A full voice call: orb, transcript and call controls. */
function CallSurface({ c, state, level }: SurfaceProps) {
  const [startedAt] = React.useState(() => Date.now())
  const segments = [
    { id: "a", speaker: "agent" as const, text: "Hi, this is Aria at Harbor Dental. How can I help?", final: true },
    { id: "u", speaker: "user" as const, text: "I need to move my cleaning to next week.", final: state !== "listening" },
  ]
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium">Aria</span>
        <span className="text-xs text-muted-foreground">Front desk · Harbor Dental</span>
      </div>
      <Orb c={c} state={state} level={level} size={Math.min(c.size, 180)} />
      <LiveTranscript segments={segments} agentName="Aria" className="w-full" />
      <CallControls>
        <CallStatus state={state === "connecting" ? "connecting" : "connected"} startedAt={startedAt} />
        <CallMute />
        <CallInterrupt disabled={state !== "speaking"} />
        <CallEnd />
      </CallControls>
    </div>
  )
}

/** Small placements: a composer voice button, a panel header and a call pill. */
function CompactSurface({ c, state, level }: SurfaceProps) {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="flex items-center gap-2 rounded-2xl border bg-card p-2 pl-4">
        <span className="flex-1 text-sm text-muted-foreground">Ask anything…</span>
        <span className="flex size-10 items-center justify-center rounded-full bg-muted">
          <Orb c={c} state={state} level={level} size={24} />
        </span>
      </div>
      <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Orb c={c} state={state} level={level} size={18} />
          Agent
        </span>
        <span className="text-xs text-muted-foreground">{states.find((s) => s.value === state)!.status}</span>
      </div>
      <div className="flex items-center gap-2 self-center rounded-full border bg-card py-1.5 pr-4 pl-2">
        <Orb c={c} state={state} level={level} size={20} />
        <span className="text-sm">On call</span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">02:14</span>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Small spots favour the dot. Richer orbs lose their detail below about 32px.
      </p>
    </div>
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
  const [surface, setSurface] = React.useState<Surface>("stage")
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
  const range = sizeRange(c.variant)
  const surfaceProps = { c, state, level }

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
                    <Orb
                      c={preset}
                      state="idle"
                      level={0}
                      size={preset.variant === "wave" ? 24 : preset.variant === "dot" ? 20 : 40}
                    />
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
            onChange={(v) =>
              setC((prev) => {
                // Keep the size inside the new style's range.
                const r = sizeRange(v)
                const size = prev.size < r.min || prev.size > r.max ? (v === "dot" ? 32 : 200) : prev.size
                return { ...prev, variant: v, size }
              })
            }
            options={[
              { value: "particles", label: "Particles" },
              { value: "ring", label: "Ring" },
              { value: "wave", label: "Wave" },
              { value: "aura", label: "Aura" },
              { value: "bars", label: "Bars" },
              { value: "halftone", label: "Halftone" },
              { value: "plasma", label: "Plasma" },
              { value: "liquid", label: "Liquid" },
              { value: "glass", label: "Glass" },
              { value: "dot", label: "Dot" },
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
                { value: "custom", label: "Custom" },
              ]}
            />
          )}
          {paletted(c.variant) && c.palette === "custom" && (
            <ColorRow
              label="Colors"
              names={["Base", "Field 1", "Field 2", "Field 3"]}
              values={c.custom}
              onChange={set("custom")}
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
          <Range label="Size" value={c.size} {...range} unit="px" onChange={set("size")} />
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
            <div className="flex justify-center border-b p-3">
              <ToggleGroup
                value={[surface]}
                onValueChange={(v) => v[0] && setSurface(v[0] as Surface)}
                variant="outline"
                size="sm"
                aria-label="Preview surface"
              >
                <ToggleGroupItem value="stage">Stage</ToggleGroupItem>
                <ToggleGroupItem value="panel">Side panel</ToggleGroupItem>
                <ToggleGroupItem value="call">Call</ToggleGroupItem>
                <ToggleGroupItem value="compact">Compact</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="flex min-h-0 flex-1 overflow-auto p-6">
              {/* Auto margins centre the surface but let it scroll from the top when taller than the stage. */}
              <div className="m-auto flex w-full justify-center">
                {surface === "stage" && <Orb {...surfaceProps} />}
                {surface === "panel" && <PanelSurface {...surfaceProps} />}
                {surface === "call" && <CallSurface {...surfaceProps} />}
                {surface === "compact" && <CompactSurface {...surfaceProps} />}
              </div>
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
