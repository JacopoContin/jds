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
    status: "next",
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
    status: "planned",
    items: [
      "Frame, context header and option chips",
      "Attachments, model picker, tools, suggestions, dictation, mentions",
      "Send button and submit styles",
      "Generated code",
    ],
  },
  {
    title: "Recipes",
    status: "planned",
    items: [
      "Research agent: prompt, reasoning, sources, artifact",
      "Coding agent: plan, file edits, terminal, approval, result",
      "Support agent: conversation, tool call, customer data, approval, response",
      "Voice receptionist: orb, live transcript, actions, call controls",
      "Copilot side panel: context, conversation, actions, artifact",
      "Built on particles: each one a working composition, installed with one command",
    ],
  },
  {
    title: "Studio: conversation and agent activity",
    status: "planned",
    items: [
      "Bubbles, citations, artifacts, thinking and streaming",
      "Steps, progress, tool calls, approvals and background work",
      "Generated code",
    ],
  },
  {
    title: "Studio: voice call, command bar and artifact",
    status: "planned",
    items: [
      "Voice call: orb, transcript, controls, status and waveform together",
      "Command bar: actions, search, AI commands and shortcuts",
      "Artifact: document, code and preview layouts, panel behaviour",
    ],
  },
  {
    title: "Studio: whole experiences",
    status: "planned",
    items: [
      "Start from what you're building: chat, voice, copilot, coding or research agent",
      "Configure layout, style, components, behaviour and states in one flow",
      "Live app preview alongside the controls",
      "Copy as React, Tailwind or JDS",
    ],
  },
  {
    title: "Studio: motion and backgrounds",
    status: "planned",
    items: [
      "Motion presets you can feel",
      "Ambient backgrounds: gradient mesh, grain, aurora, dot fields",
      "Generated code",
    ],
  },
  {
    title: "Orbs: more families and visualizers",
    status: "planned",
    items: [
      "Mesh gradient, aurora, sonic rings and halo",
      "Visualizers: circular waveform, radial bars, spectrogram, audio ribbon, pulsing rings",
    ],
  },
  {
    title: "Portable foundations",
    status: "planned",
    items: [
      "Tokens exported as W3C design tokens JSON",
      "Motion and orb specs written platform-neutral",
      "Groundwork for native iOS and Android",
    ],
  },
  {
    title: "Foundation, components and particles",
    status: "done",
    items: [
      "Tokens, themes and customizer",
      "21 agent and voice components, 52 primitives",
      "10 particles",
      "Docs for humans and agents, visual regression tests",
    ],
  },
]

export default function RoadmapPage() {
  return (
    <>
      <PageHeader
        title="Roadmap"
        description="Components, recipes and visual tools for agent and voice interfaces. Web first, native later."
      />
      <P>
        Component libraries are plentiful; tools for designing AI interfaces are not. The Studio is where JDS earns its
        place: pick a preset, tune it visually, preview every state, copy the code. It grows in small steps, one surface
        at a time (orbs, then prompt input, then recipes, conversation and activity), until it can configure a whole agent
        experience. Tokens and specs stay platform-neutral so iOS and Android can follow.
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
