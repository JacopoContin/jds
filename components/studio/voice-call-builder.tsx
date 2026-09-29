"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "cn"

import { ControlGroup, Range, Segmented, Text, Toggle } from "@/components/studio/controls"
import { render } from "@/components/studio/jsx"
import { studioMarkdown } from "@/components/studio/markdown"
import { StudioCode } from "@/components/studio/studio-code"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { RegenerateIcon } from "@/lib/icons"
import { useSimulatedVoiceAgent } from "@/recipes/voice-agent/session"
import { VoiceAgent } from "@/recipes/voice-agent/voice-agent"

type Config = {
  layout: "split" | "focus"
  captions: "line" | "transcript" | "off"
  waveform: boolean
  status: boolean
  handoff: boolean
  backdrop: "none" | "glow"
  orbSize: number
  agentName: string
  subtitle: string
}

type Surface = "page" | "dialog" | "panel"

const defaults: Config = {
  layout: "split",
  captions: "line",
  waveform: false,
  status: true,
  handoff: true,
  backdrop: "none",
  orbSize: 200,
  agentName: "Aria",
  subtitle: "Calendar and email assistant",
}

/** Common call screens to start from. */
const presets: { name: string; body: string; config: Partial<Config> }[] = [
  { name: "Call screen", body: "Call plus actions and transcript", config: {} },
  {
    name: "Focus",
    body: "Just the call, rolling transcript",
    config: { layout: "focus", captions: "transcript", backdrop: "glow" },
  },
  {
    name: "Waveform",
    body: "Small orb, waveform, one caption",
    config: { layout: "focus", waveform: true, orbSize: 140, backdrop: "glow" },
  },
  {
    name: "Minimal",
    body: "Orb and controls only",
    config: { layout: "focus", captions: "off", status: false, handoff: false },
  },
]

/** Props that differ from the recipe's defaults, as JSX attributes. */
function props(c: Config) {
  const p = ["session={session}"]
  if (c.layout !== "split") p.push(`layout="${c.layout}"`)
  if (c.agentName !== "Aria") p.push(`agentName="${c.agentName}"`)
  if (c.subtitle) p.push(`subtitle="${c.subtitle}"`)
  if (c.captions !== "line") p.push(`captions="${c.captions}"`)
  if (c.waveform) p.push("waveform")
  if (!c.status) p.push("status={false}")
  if (!c.handoff) p.push("handoff={false}")
  if (c.backdrop !== "none") p.push(`backdrop="${c.backdrop}"`)
  if (c.orbSize !== 200) p.push(`orb={{ size: ${c.orbSize} }}`)
  return p
}

function generateCode(c: Config) {
  return `import { useSimulatedVoiceAgent } from "@/components/voice-agent/session"
import { VoiceAgent } from "@/components/voice-agent/voice-agent"

// Swap for a hook that returns the same shape from your realtime provider.
const session = useSimulatedVoiceAgent()

${render({ tag: "VoiceAgent", props: props(c) })}`
}

function generateMarkdown(c: Config) {
  return studioMarkdown({
    title: "Voice call screen",
    intro: "A voice agent call screen built on the voice-agent recipe, with these settings.",
    choices: [
      ["Layout", c.layout === "split" ? "call with actions and transcript beside it" : "the call alone"],
      ["Captions", { line: "the latest line", transcript: "the last few lines", off: "none" }[c.captions]],
      ["Waveform", c.waveform ? "under the orb" : "off"],
      ["Status and timer", c.status ? "shown" : "hidden"],
      ["Hand to a person", c.handoff ? "button next to the controls" : "off"],
      ["Backdrop", c.backdrop === "glow" ? "soft primary glow behind the orb" : "none"],
      ["Orb size", `${c.orbSize}px`],
      ["Agent", c.subtitle ? `${c.agentName}, "${c.subtitle}"` : c.agentName],
    ],
    install: ["voice-agent"],
    placement: [
      c.layout === "split"
        ? "Give it a full page or a large area: the split layout needs room for the activity column."
        : "Put it in a dialog, a side panel's voice mode, or a narrow page column.",
      "Replace useSimulatedVoiceAgent with a hook that returns a VoiceAgentSession from your realtime provider.",
      "The orb follows the VoiceOrbProvider at your root; pass more orb props in orb to style this one differently.",
    ],
    code: generateCode(c),
  })
}

export function VoiceCallBuilder() {
  const [c, setC] = React.useState<Config>(defaults)
  const [surface, setSurface] = React.useState<Surface>("page")
  const session = useSimulatedVoiceAgent()
  const set =
    <K extends keyof Config>(key: K) =>
    (value: Config[K]) =>
      setC((prev) => ({ ...prev, [key]: value }))

  const agent = (
    <VoiceAgent
      session={session}
      layout={c.layout}
      agentName={c.agentName}
      subtitle={c.subtitle || undefined}
      captions={c.captions}
      waveform={c.waveform}
      status={c.status}
      handoff={c.handoff}
      backdrop={c.backdrop}
      orb={{ size: c.orbSize }}
      className={cn(
        surface === "page" && "h-full rounded-none border-0 md:h-full",
        surface === "dialog" && "md:h-auto",
        surface === "panel" && "h-full md:h-full",
      )}
    />
  )

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-5 overflow-y-auto border-b p-5 lg:h-[calc(100svh-3.5rem-1px)] lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold">Voice call</h1>
          <Button variant="ghost" size="xs" onClick={() => setC(defaults)}>
            Reset
          </Button>
        </div>
        <ControlGroup title="Presets">
          <div className="flex flex-col gap-1.5">
            {presets.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setC({ ...defaults, ...p.config })}
                className="flex items-baseline justify-between gap-3 rounded-lg border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="font-medium">{p.name}</span>
                <span className="truncate text-xs text-muted-foreground">{p.body}</span>
              </button>
            ))}
          </div>
        </ControlGroup>
        <ControlGroup title="Layout">
          <Segmented
            label="Layout"
            value={c.layout}
            onChange={set("layout")}
            options={[
              { value: "split", label: "With activity" },
              { value: "focus", label: "Call only" },
            ]}
          />
          <Segmented
            label="Backdrop"
            value={c.backdrop}
            onChange={set("backdrop")}
            options={[
              { value: "none", label: "None" },
              { value: "glow", label: "Glow" },
            ]}
          />
        </ControlGroup>
        <ControlGroup title="Presence">
          <Range label="Orb size" value={c.orbSize} min={96} max={260} step={4} unit="px" onChange={set("orbSize")} />
          <Toggle label="Waveform" checked={c.waveform} onChange={set("waveform")} />
          <Segmented
            label="Captions"
            value={c.captions}
            onChange={set("captions")}
            options={[
              { value: "line", label: "Line" },
              { value: "transcript", label: "Transcript" },
              { value: "off", label: "Off" },
            ]}
          />
          <p className="text-xs text-muted-foreground">
            The orb&apos;s look comes from the header&apos;s Customize menu or the{" "}
            <Link href="/studio/voice-orb" className="underline underline-offset-4 hover:text-foreground">
              Voice Orb Studio
            </Link>
            .
          </p>
        </ControlGroup>
        <ControlGroup title="Header and controls">
          <Text label="Agent name" value={c.agentName} onChange={set("agentName")} />
          <Text label="Subtitle" value={c.subtitle} onChange={set("subtitle")} />
          <Toggle label="Status and timer" checked={c.status} onChange={set("status")} />
          <Toggle label="Hand to a person" checked={c.handoff} onChange={set("handoff")} />
        </ControlGroup>
      </aside>

      <Tabs defaultValue="preview" className="min-w-0 gap-0 p-5 lg:h-[calc(100svh-3.5rem-1px)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={session.restart}>
            <RegenerateIcon />
            Replay call
          </Button>
        </div>
        <TabsContent value="preview" className="flex min-h-0 flex-col">
          <div className="flex h-160 flex-col overflow-hidden rounded-2xl border bg-background lg:h-auto lg:min-h-0 lg:flex-1">
            <div className="flex justify-center border-b p-3">
              <ToggleGroup
                value={[surface]}
                onValueChange={(v) => v[0] && setSurface(v[0] as Surface)}
                variant="outline"
                size="sm"
                aria-label="Preview surface"
              >
                <ToggleGroupItem value="page">Page</ToggleGroupItem>
                <ToggleGroupItem value="dialog">Dialog</ToggleGroupItem>
                <ToggleGroupItem value="panel">Side panel</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className={cn("flex min-h-0 flex-1 overflow-auto", surface !== "page" && "bg-muted/30 p-6")}>
              {surface === "page" && agent}
              {surface === "dialog" && <div className="m-auto w-full max-w-md shadow-2xl">{agent}</div>}
              {surface === "panel" && <div className="ml-auto h-full w-96 max-w-full shadow-2xl">{agent}</div>}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="code" className="min-h-0 overflow-y-auto">
          <StudioCode
            markdown={() => generateMarkdown(c)}
            scopes={[
              {
                value: "instance",
                label: "This call screen",
                code: generateCode(c),
                note: "Styles this call screen only. Install the recipe with npx shadcn@latest add @jds/voice-agent; the orb still follows your VoiceOrbProvider.",
              },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
