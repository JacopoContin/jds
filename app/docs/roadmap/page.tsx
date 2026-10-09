import type { Metadata } from "next"
import { cn } from "cn"

import { H2, P, PageHeader, Pager } from "@/components/docs/prose"

export const metadata: Metadata = { title: "Roadmap" }

type Status = "done" | "next" | "planned"

const phases: { title: string; status: Status; items: readonly string[] }[] = [
  {
    title: "Studio: agent panel",
    status: "done",
    items: [
      "Agent Panel component",
      "Docked or floating, left or right, card, page or glass",
      "Slide, fade or spring entrance",
      "Chat and voice modes, composer options",
      "Live preview with generated code",
    ],
  },
  {
    title: "Studio: voice orb",
    status: "done",
    items: [
      "One state API for every orb: idle, connecting, listening, thinking, speaking, error",
      "Presets, speed, glow and sensitivity, previewed in every state, with generated code",
      "Plasma and liquid, the first WebGL shader families",
    ],
  },
  {
    title: "Studio: voice orb, round two",
    status: "done",
    items: [
      "Custom palettes",
      "Preview the orb inside real surfaces",
      "Minimal dot for composer buttons, headers and call pills",
      "Glass orb",
      "Shape and material controls per family",
    ],
  },
  {
    title: "Studio: prompt input",
    status: "done",
    items: [
      "Frame, context header and option chips",
      "Attachments, model picker, tools, suggestions, dictation, mentions",
      "Send button and submit styles",
      "Generated code",
    ],
  },
  {
    title: "Recipes",
    status: "done",
    items: [
      "Voice agent: orb styled in the Studio, split or focus layout, session interface (live)",
      "Particles merged in: chat app, agent panel, agent run, inbox and more, each installable (live)",
      "Agent side panel: panel, orb and composer from their Studios, chat and hold-to-talk voice, useChat-shaped session (live)",
      "Chat app: composer from the Prompt Input Studio (live)",
      "Studio choices carry into recipes: each Studio's Code tab has the matching recipe snippet (live)",
      "Quick filters by voice, side panel, chat and operations (live)",
    ],
  },
  {
    title: "Studio: conversation and agent activity",
    status: "done",
    items: [
      "Bubbles, shape, density, avatars and message actions",
      "Reasoning, plan, tool calls, approvals, citations, sources and artifacts in one turn",
      "Working and done states, on a page or in a side panel",
      "Generated code",
    ],
  },
  {
    title: "Studio: voice call, command bar and artifact",
    status: "done",
    items: [
      "Voice call: layout, captions, waveform, status, hand-off and backdrop on the voice agent recipe (live)",
      "Command bar: a ⌘K bar that runs commands and asks the agent, with its own Studio (live)",
      "Artifact: document, code or preview, opening beside the chat, as a sheet, full screen or inline (live)",
    ],
  },
  {
    title: "Studio: whole experiences",
    status: "done",
    items: [
      "Start from what you're building: a chat app, a side panel copilot or a voice agent",
      "Look, parts and behaviour in one flow, sharing the site theme",
      "The whole app live alongside the controls: chat, voice mode and ⌘K all work",
      "Export one install, the root layout, the page and a Markdown spec",
    ],
  },
  {
    title: "Mobile",
    status: "done",
    items: [
      "Touch pass: tap equivalents for hover, 44px targets, safe areas and dynamic viewport",
      "Agent panel as a bottom drawer on phones",
      "Mobile recipes previewed in an iPhone frame, with a Web / Mobile switch on Recipes",
      "Mobile voice agent and mobile chat (live)",
      "Minimized call, push-to-talk and approve from phone (live)",
    ],
  },
  {
    title: "Native tokens",
    status: "done",
    items: [
      "Tokens exported as W3C design tokens JSON (DTCG)",
      "SwiftUI, Jetpack Compose and React Native exports, from Customize and the Styling page",
      "Durations, easings and springs carried over, so motion feels the same on every platform",
    ],
  },
  {
    title: "Studio: motion and backgrounds",
    status: "done",
    items: [
      "Motion Studio: springs, durations, easing and streamed-content entrances, felt on real interactions (live)",
      "Exports a replacement lib/motion.ts, so the whole app moves the new way",
      "Ambient Background component: gradient mesh, aurora and dot fields, with grain, tinted by the theme (live)",
      "Backgrounds Studio, previewed behind an empty chat and a voice call, with generated code (live)",
    ],
  },
  {
    title: "Orbs: more families and visualizers",
    status: "next",
    items: [
      "Mesh gradient, aurora, sonic rings and halo",
      "Visualizers: circular waveform, radial bars, spectrogram, audio ribbon, pulsing rings",
    ],
  },
  {
    title: "Native components",
    status: "planned",
    items: [
      "Orb specs written platform-neutral",
      "Groundwork for native iOS and Android components",
    ],
  },
  {
    title: "Foundation, components and compositions",
    status: "done",
    items: [
      "Tokens, themes and customizer",
      "21 agent and voice components, 52 primitives",
      "10 compositions, since merged into recipes",
      "Docs for humans and agents, visual regression tests",
    ],
  },
]

export default function RoadmapPage() {
  return (
    <>
      <PageHeader
        title="Roadmap"
        description="Components, recipes and visual tools for agent and voice interfaces. Web first, mobile web now, native next."
      />
      <P>
        Component libraries are plentiful; tools for designing AI interfaces are not. The Studio is where JDS earns its
        place: pick a preset, tune it visually, preview every state, copy the code. It grows in small steps, one surface
        at a time (orbs, then prompt input, then recipes, conversation and activity), until it can configure a whole agent
        experience. Tokens already export to SwiftUI, Compose and React Native; orb specs and native components follow.
      </P>
      {phases.map((phase) => (
        <div key={phase.title}>
          <H2>{phase.title}</H2>
          <div className="mt-3 flex flex-col gap-2">
            {phase.items.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm">
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    phase.status === "done" && "bg-success",
                    phase.status === "next" && "bg-foreground",
                    phase.status === "planned" && "bg-border",
                  )}
                />
                <span className={cn(phase.status === "planned" && "text-muted-foreground")}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <Pager href="/docs/roadmap" />
    </>
  )
}
