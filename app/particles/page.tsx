import type { Metadata } from "next"

import { ComponentPreview } from "@/components/docs/component-preview"

export const metadata: Metadata = { title: "Particles" }

const particles = [
  {
    name: "agent-run",
    title: "Agent run",
    description:
      "A full support-agent turn: reasoning, a plan, a tool call, approval before a refund, a streamed answer with sources.",
  },
  {
    name: "agent-panel",
    title: "Agent panel",
    description:
      "A side panel agent over an app page. Chat with page context, dictate with the mic, or switch to voice mode; the voice turns land back in the chat.",
  },
  {
    name: "voice-session",
    title: "Voice session",
    description: "Push to talk with live mic level, orb states, and a rolling transcript.",
  },
]

export default function ParticlesPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-4 py-16 md:px-6">
      <div className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Particles</h1>
        <p className="text-muted-foreground">
          Complete compositions of JDS components. Copy one as the starting point for a screen.
        </p>
      </div>
      {particles.map((p) => (
        <section key={p.name} id={p.name} className="flex scroll-mt-20 flex-col gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{p.title}</h2>
            <p className="text-sm text-muted-foreground">{p.description}</p>
          </div>
          <ComponentPreview name={p.name} dir="particles" align="start" />
        </section>
      ))}
    </main>
  )
}
