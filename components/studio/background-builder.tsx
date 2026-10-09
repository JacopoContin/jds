"use client"

import * as React from "react"

import { AmbientBackground, type AmbientBackgroundVariant } from "@/components/effects/ambient-background"
import { PromptInput, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar } from "@/components/ai/prompt-input"
import { Suggestion, Suggestions } from "@/components/ai/suggestions"
import { ControlGroup, Range, Segmented } from "@/components/studio/controls"
import { render } from "@/components/studio/jsx"
import { studioMarkdown } from "@/components/studio/markdown"
import { StudioCode } from "@/components/studio/studio-code"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CallControls, CallEnd, CallInterrupt, CallMute } from "@/components/voice/call-controls"
import { VoiceOrb } from "@/components/voice/voice-orb"
import { useSimulatedSpectrum } from "@/hooks/use-simulated-spectrum"

type Config = {
  variant: AmbientBackgroundVariant
  /** Percent, 0 to 100. */
  intensity: number
  speed: number
  /** Percent, 0 to 100. */
  grain: number
}

type Surface = "chat" | "voice"

const defaults: Config = { variant: "mesh", intensity: 60, speed: 1, grain: 30 }

const presets: { name: string; body: string; config: Config }[] = [
  { name: "Calm mesh", body: "Drifting glows, light grain", config: defaults },
  { name: "Aurora", body: "Bands across the top", config: { variant: "aurora", intensity: 70, speed: 1, grain: 20 } },
  {
    name: "Dot field",
    body: "Dots lit by a moving glow",
    config: { variant: "dots", intensity: 70, speed: 1, grain: 0 },
  },
  {
    name: "Still glow",
    body: "No motion, heavier grain",
    config: { variant: "mesh", intensity: 45, speed: 0, grain: 45 },
  },
]

const looks: Record<AmbientBackgroundVariant, string> = {
  mesh: "drifting glows in the primary color",
  aurora: "soft bands of the primary color across the top",
  dots: "a dot field lit by a moving glow in the primary color",
}

const fraction = (percent: number) => Math.round(percent) / 100

/** Props that differ from the component's defaults, as JSX attributes. */
function props(c: Config) {
  const p: string[] = []
  if (c.variant !== "mesh") p.push(`variant="${c.variant}"`)
  if (c.intensity !== 60) p.push(`intensity={${fraction(c.intensity)}}`)
  if (c.speed !== 1) p.push(`speed={${c.speed}}`)
  if (c.grain > 0) p.push(`grain={${fraction(c.grain)}}`)
  return p
}

function generateCode(c: Config) {
  return `import { AmbientBackground } from "@/components/effects/ambient-background"

${render({
  tag: "div",
  props: ['className="relative isolate overflow-hidden"'],
  children: [{ tag: "AmbientBackground", props: props(c) }, "{/* Your empty chat, call screen or onboarding */}"],
})}`
}

function generateMarkdown(c: Config) {
  return studioMarkdown({
    title: "Ambient background",
    intro: "A soft, moving backdrop behind an agent surface, tinted from the theme's primary color.",
    choices: [
      ["Look", looks[c.variant]],
      ["Intensity", `${c.intensity}%`],
      ["Motion", c.speed === 0 ? "still" : `${c.speed}× (one drift every ${Math.round(18 / c.speed)}s)`],
      ["Grain", c.grain ? `${c.grain}%` : "off"],
    ],
    install: ["ambient-background"],
    placement: [
      "Make the surface's container relative isolate overflow-hidden.",
      "Put AmbientBackground first inside it; it sits behind the content and ignores clicks.",
      "Use it where the screen is mostly empty: a new chat, a voice call, onboarding. Not behind dense content.",
    ],
    code: generateCode(c),
    notes: ["It holds still for people who prefer reduced motion.", "Change the theme's primary color to recolor it."],
  })
}

function ChatSurface() {
  return (
    <div className="m-auto flex w-full max-w-lg flex-col items-center gap-6 px-6 text-center">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Good morning</h2>
        <p className="text-muted-foreground">What should we work on today?</p>
      </div>
      <PromptInput onSubmit={() => {}} className="w-full text-left shadow-lg">
        <PromptInputTextarea placeholder="Ask anything…" />
        <PromptInputToolbar>
          <span />
          <PromptInputSubmit />
        </PromptInputToolbar>
      </PromptInput>
      <Suggestions className="justify-center">
        <Suggestion suggestion="Summarize my inbox" />
        <Suggestion suggestion="Plan my week" />
        <Suggestion suggestion="Draft a reply" />
      </Suggestions>
    </div>
  )
}

function VoiceSurface() {
  const { level } = useSimulatedSpectrum(true)
  return (
    <div className="m-auto flex flex-col items-center gap-8 px-6 text-center">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Aria</span>
        <span className="text-xs text-muted-foreground">Calendar and email assistant</span>
      </div>
      <VoiceOrb state="speaking" level={level} size={180} />
      <p className="max-w-sm text-lg">Tomorrow you&apos;re both free at 10:30, 1, or 4. Which works?</p>
      <CallControls>
        <CallMute />
        <CallInterrupt />
        <CallEnd />
      </CallControls>
    </div>
  )
}

export function BackgroundBuilder() {
  const [c, setC] = React.useState<Config>(defaults)
  const [surface, setSurface] = React.useState<Surface>("chat")
  const set =
    <K extends keyof Config>(key: K) =>
    (value: Config[K]) =>
      setC((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-5 overflow-y-auto border-b p-5 lg:h-[calc(100svh-3.5rem-1px)] lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold">Backgrounds</h1>
          <Button variant="ghost" size="xs" onClick={() => setC(defaults)}>
            Reset
          </Button>
        </div>
        <ControlGroup title="Presets">
          <div className="flex flex-col gap-2">
            {presets.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setC(p.config)}
                className="flex items-baseline justify-between gap-3 rounded-lg border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="font-medium">{p.name}</span>
                <span className="truncate text-xs text-muted-foreground">{p.body}</span>
              </button>
            ))}
          </div>
        </ControlGroup>
        <ControlGroup title="Look">
          <Segmented
            label="Style"
            value={c.variant}
            onChange={set("variant")}
            options={[
              { value: "mesh", label: "Mesh" },
              { value: "aurora", label: "Aurora" },
              { value: "dots", label: "Dots" },
            ]}
          />
          <Range
            label="Intensity"
            value={c.intensity}
            min={10}
            max={100}
            step={5}
            unit="%"
            onChange={set("intensity")}
          />
          <Range label="Grain" value={c.grain} min={0} max={100} step={5} unit="%" onChange={set("grain")} />
          <p className="text-xs text-muted-foreground">
            The color comes from the theme&apos;s primary. Change it in the header&apos;s Customize menu.
          </p>
        </ControlGroup>
        <ControlGroup title="Motion">
          <Range label="Speed" value={c.speed} min={0} max={2} step={0.25} unit="×" onChange={set("speed")} />
          <p className="text-xs text-muted-foreground">
            0 holds still. It always holds still for people who prefer reduced motion.
          </p>
        </ControlGroup>
      </aside>

      <Tabs defaultValue="preview" className="min-w-0 gap-0 p-5 lg:h-[calc(100svh-3.5rem-1px)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <ToggleGroup
            value={[surface]}
            onValueChange={(v) => v[0] && setSurface(v[0] as Surface)}
            variant="outline"
            size="sm"
            aria-label="Preview surface"
          >
            <ToggleGroupItem value="chat">Empty chat</ToggleGroupItem>
            <ToggleGroupItem value="voice">Voice call</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <TabsContent value="preview" className="flex min-h-0 flex-col">
          <div className="relative isolate flex h-160 overflow-hidden rounded-2xl border bg-background lg:h-auto lg:min-h-0 lg:flex-1">
            <AmbientBackground
              variant={c.variant}
              intensity={fraction(c.intensity)}
              speed={c.speed}
              grain={fraction(c.grain)}
            />
            {surface === "chat" ? <ChatSurface /> : <VoiceSurface />}
          </div>
        </TabsContent>
        <TabsContent value="code" className="min-h-0 overflow-y-auto">
          <StudioCode
            markdown={() => generateMarkdown(c)}
            scopes={[
              {
                value: "instance",
                label: "This surface",
                code: generateCode(c),
                note: "Install with npx shadcn@latest add @jds/ambient-background. It recolors with your theme's primary.",
              },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
