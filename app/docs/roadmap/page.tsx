import type { Metadata } from "next"
import { cn } from "cn"

import { H2, P, PageHeader, Pager } from "@/components/docs/prose"

export const metadata: Metadata = { title: "Roadmap" }

const phases = [
  {
    title: "Foundation",
    status: "done",
    items: ["Tokens, light and dark", "Motion presets", "Icon layer", "Registry and CLI install"],
  },
  {
    title: "Agent",
    status: "done",
    items: ["Conversation, Message, Prompt Input", "Response, Reasoning, Tool Call", "Approval, Agent Steps, Sources", "Suggestions, Shimmer"],
  },
  {
    title: "Voice",
    status: "done",
    items: ["Voice Orb, Waveform", "Push to Talk, Live Transcript"],
  },
  {
    title: "Agent, part two",
    status: "done",
    items: ["Model Picker", "Branch (regenerated responses)", "Artifact panel", "Context Meter", "Mentions in the composer", "Voice Picker, Call Controls"],
  },
  {
    title: "Primitives",
    status: "done",
    items: [
      "Accordion, Alert, Alert Dialog, Breadcrumb, Checkbox, Combobox, Command",
      "Context Menu, Drawer, Empty, Field, Hover Card, Input Group, Input OTP",
      "Label, Menubar, Pagination, Progress, Radio Group, Slider, Spinner",
      "Switch, Table, Toggle, Toggle Group, Sheet",
    ],
  },
  {
    title: "Primitives, part two",
    status: "next",
    items: ["Calendar and Date Picker", "Number Field, Meter", "Toolbar, Form", "Navigation Menu, Resizable, Carousel"],
  },
  {
    title: "Particles",
    status: "planned",
    items: ["Chat app shell", "Agent inbox", "Voice call screen", "Settings for an agent", "Weekly drops"],
  },
] as const

export default function RoadmapPage() {
  return (
    <>
      <PageHeader title="Roadmap" description="Agent and voice first, then the full primitive set." />
      <P>
        Priorities follow what agent products need first. Primitives get added when a component needs them, then
        filled out to parity with general-purpose libraries.
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
                    phase.status === "planned" && "bg-border"
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
