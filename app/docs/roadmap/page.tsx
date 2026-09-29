import type { Metadata } from "next"
import { cn } from "cn"

import { H2, P, PageHeader, Pager } from "@/components/docs/prose"

export const metadata: Metadata = { title: "Roadmap" }

type Status = "done" | "next" | "planned"

const phases: { title: string; status: Status; items: readonly string[] }[] = [
  {
    title: "Studio: side panel",
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
    title: "Studio: prompt input",
    status: "next",
    items: [
      "Frame, context header and option chips",
      "Attachments, model picker, dictation, mentions",
      "Send button and submit styles",
      "Generated code",
    ],
  },
  {
    title: "Studio: orbs",
    status: "planned",
    items: ["Size, density, speed and glow per variant", "Per-state behaviour", "New orb designs", "Generated code"],
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
        description="High-quality AI components and interactions, configurable in the Studio. Web first, native later."
      />
      <P>
        The focus is the surfaces people actually interact with: side panels, prompt inputs, voice orbs, motion and
        backgrounds. Each gets a Studio page for designers and engineers to configure it and copy the code. Web comes
        first; tokens and specs are kept platform-neutral so iOS and Android can follow.
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
