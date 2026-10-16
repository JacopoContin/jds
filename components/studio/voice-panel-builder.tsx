"use client"

import * as React from "react"

import { PhonePreview } from "@/components/docs/phone-preview"
import { ColorRow, ControlGroup, Range, Segmented, Toggle } from "@/components/studio/controls"
import { render } from "@/components/studio/jsx"
import { studioMarkdown } from "@/components/studio/markdown"
import { StudioCode } from "@/components/studio/studio-code"
import { useVoicePanelPreview } from "@/components/studio/use-voice-panel-preview"
import { glowProps, voicePanelDefaults, type VoicePanelConfig } from "@/components/studio/voice-panel-config"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/** Looks to start from. */
const presets: { name: string; body: string; config: Partial<VoicePanelConfig> }[] = [
  { name: "Spectrum drawer", body: "Lit drawer, glass controls", config: {} },
  {
    name: "Full screen",
    body: "Glow wraps the phone",
    config: { layout: "fullscreen", intensity: 1, reach: 1.2 },
  },
  {
    name: "Brushed metal",
    body: "Metal drawer, ember light",
    config: { surface: "metal", controls: "solid", palette: "ember", grain: 0.3 },
  },
  {
    name: "Frosted",
    body: "Glass drawer, iris light",
    config: { surface: "glass", palette: "iris", reach: 1.3 },
  },
]

/** The glow prop as a JSX expression, one property per line when it has several. */
function glowCode(c: VoicePanelConfig) {
  const g = glowProps(c)
  if (g === false) return "glow={false}"
  const entries = Object.entries(g).map(([k, v]) => `${k}: ${JSON.stringify(v).replace(/"([^"]+)":/g, "$1:")}`)
  if (!entries.length) return null
  return `glow={{ ${entries.join(", ")} }}`
}

function props(c: VoicePanelConfig) {
  const p = c.mode === "push-to-talk" ? ['mode="push-to-talk"', "session={session}"] : ["session={session}"]
  p.push("open={open}", "onOpenChange={setOpen}")
  if (c.layout !== "drawer") p.push(`layout="${c.layout}"`)
  if (c.surface !== "theme") p.push(`surface="${c.surface}"`)
  if (c.controls !== "glass") p.push(`controls="${c.controls}"`)
  const glow = glowCode(c)
  if (glow) p.push(glow)
  return p
}

function generateCode(c: VoicePanelConfig) {
  const session =
    c.mode === "push-to-talk"
      ? `import { useSimulatedPushToTalk } from "@/components/mobile-push-to-talk/session"

// Swap for a hook that records, transcribes and replies with the same shape.
const session = useSimulatedPushToTalk()`
      : `import { useSimulatedVoiceAgent } from "@/components/voice-agent/session"

// Swap for a hook that returns the same shape from your realtime provider.
const session = useSimulatedVoiceAgent()`
  return `import { MobileVoicePanel } from "@/components/mobile-voice-panel/mobile-voice-panel"
${session}
const [open, setOpen] = React.useState(false)

${render({ tag: "MobileVoicePanel", props: props(c), children: ["<YourScreen />"] })}`
}

const paletteLabel: Record<VoicePanelConfig["palette"], string> = {
  spectrum: "spectrum (amber, teal, violet, green, rose)",
  iris: "iris (violet and pink)",
  ember: "ember (orange and amber)",
  primary: "shades of the theme's primary color",
  custom: "custom",
}

function generateMarkdown(c: VoicePanelConfig) {
  return studioMarkdown({
    title: "Voice panel",
    intro: "Voice chat over the current screen, built on the mobile-voice-panel recipe, with these settings.",
    choices: [
      [
        "Talking",
        c.mode === "push-to-talk"
          ? "push-to-talk: hold to speak, let go to send"
          : "hands-free call with mute and interrupt",
      ],
      ["Layout", c.layout === "drawer" ? "a floating drawer over the page" : "full screen"],
      ["Panel", c.surface],
      ["Controls", c.controls],
      [
        "Glow",
        c.glow
          ? `${c.palette === "custom" ? c.colors.join(", ") : paletteLabel[c.palette]}; intensity ${c.intensity}, reach ${c.reach}, speed ${c.speed}, grain ${c.grain}, edge line ${c.edge ? "on" : "off"}`
          : "off",
      ],
    ],
    install: ["mobile-voice-panel"],
    placement: [
      "Wrap your app's screen in MobileVoicePanel and open it from a voice button.",
      c.layout === "drawer"
        ? "Set reserveTop to the height of your header, so the expanded drawer stops under it."
        : "Opt in to safe areas with viewport-fit=cover so the panel reaches the screen's edges.",
      c.mode === "push-to-talk"
        ? "Replace useSimulatedPushToTalk with a hook that returns a PushToTalkSession from your speech and agent stack."
        : "Replace useSimulatedVoiceAgent with a hook that returns a VoiceAgentSession from your realtime provider.",
    ],
    code: generateCode(c),
  })
}

export function VoicePanelBuilder() {
  const [c, setC] = React.useState<VoicePanelConfig>(voicePanelDefaults)
  const frame = useVoicePanelPreview(c)
  const set =
    <K extends keyof VoicePanelConfig>(key: K) =>
    (value: VoicePanelConfig[K]) =>
      setC((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-5 overflow-y-auto border-b p-5 lg:h-[calc(100svh-3.5rem-1px)] lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold">Voice panel</h1>
          <Button variant="ghost" size="xs" onClick={() => setC(voicePanelDefaults)}>
            Reset
          </Button>
        </div>
        <ControlGroup title="Presets">
          <div className="flex flex-col gap-1.5">
            {presets.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setC({ ...voicePanelDefaults, ...p.config })}
                className="flex items-baseline justify-between gap-3 rounded-lg border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="font-medium">{p.name}</span>
                <span className="truncate text-xs text-muted-foreground">{p.body}</span>
              </button>
            ))}
          </div>
        </ControlGroup>
        <ControlGroup title="Placement">
          <Segmented
            label="Talking"
            value={c.mode}
            onChange={set("mode")}
            options={[
              { value: "hands-free", label: "Hands-free" },
              { value: "push-to-talk", label: "Push to talk" },
            ]}
          />
          <Segmented
            label="Layout"
            value={c.layout}
            onChange={(layout) =>
              // Full screen reads best at full strength; the drawer a little softer.
              setC((prev) => ({ ...prev, layout, intensity: layout === "fullscreen" ? 1 : 0.8 }))
            }
            options={[
              { value: "drawer", label: "Drawer" },
              { value: "fullscreen", label: "Full screen" },
            ]}
          />
          <Segmented
            label="Panel"
            value={c.surface}
            onChange={set("surface")}
            options={[
              { value: "theme", label: "Theme" },
              { value: "flat", label: "Flat" },
              { value: "lit", label: "Lit" },
              { value: "metal", label: "Metal" },
              { value: "glass", label: "Glass" },
            ]}
          />
          <Segmented
            label="Controls"
            value={c.controls}
            onChange={set("controls")}
            options={[
              { value: "glass", label: "Glass" },
              { value: "solid", label: "Solid" },
            ]}
          />
        </ControlGroup>
        <ControlGroup title="Glow colors">
          <Toggle label="Glow" checked={c.glow} onChange={set("glow")} />
          {c.glow && (
            <>
              <Segmented
                label="Palette"
                value={c.palette}
                onChange={set("palette")}
                options={[
                  { value: "spectrum", label: "Spectrum" },
                  { value: "iris", label: "Iris" },
                  { value: "ember", label: "Ember" },
                  { value: "primary", label: "Primary" },
                  { value: "custom", label: "Custom" },
                ]}
              />
              {c.palette === "custom" && (
                <ColorRow
                  label="Left to right"
                  names={["1", "2", "3", "4", "5"]}
                  values={c.colors}
                  onChange={set("colors")}
                />
              )}
            </>
          )}
        </ControlGroup>
        {c.glow && (
          <ControlGroup title="Glow texture">
            <Range label="Intensity" value={c.intensity} min={0.2} max={1} step={0.05} onChange={set("intensity")} />
            <Range label="Reach" value={c.reach} min={0.4} max={1.8} step={0.05} unit="×" onChange={set("reach")} />
            <Range label="Speed" value={c.speed} min={0} max={2} step={0.1} unit="×" onChange={set("speed")} />
            <Range label="Grain" value={c.grain} min={0} max={1} step={0.05} onChange={set("grain")} />
            <Toggle label="Edge line" checked={c.edge} onChange={set("edge")} />
          </ControlGroup>
        )}
      </aside>

      <Tabs defaultValue="preview" className="min-w-0 gap-0 p-5 lg:h-[calc(100svh-3.5rem-1px)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="preview" className="flex min-h-0 items-start justify-center overflow-y-auto">
          {/* The real recipe in an iframe, so dvh, safe areas and the fixed panel behave as on a phone. */}
          <div className="w-full max-w-80">
            <PhonePreview slug="mobile-voice-panel" title="Voice panel preview" iframeRef={frame} />
          </div>
        </TabsContent>
        <TabsContent value="code" className="min-h-0 overflow-y-auto">
          <StudioCode
            markdown={() => generateMarkdown(c)}
            scopes={[
              {
                value: "instance",
                label: "This panel",
                code: generateCode(c),
                note: "Install the recipe with npx shadcn@latest add @jds/mobile-voice-panel.",
              },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
