import type { Metadata } from "next"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Studio",
  description: "Configure AI interaction surfaces and copy the code.",
}

const tools = [
  {
    href: "/studio/side-panel",
    title: "Side panel",
    body: "Placement, docked or floating, surface, entrance motion, header, chat and voice modes, composer.",
    ready: true,
  },
  {
    href: "/studio/voice-orb",
    title: "Voice orb",
    body: "Ten styles with presets, palettes, shape and material, previewed in every state and inside real surfaces.",
    ready: true,
  },
  {
    href: "/studio/prompt-input",
    title: "Prompt input",
    body: "Presets, context header, option chips, tools, voice and send behaviour, previewed where composers live.",
    ready: true,
  },
  {
    href: "",
    title: "Motion and backgrounds",
    body: "Motion presets to feel, and ambient backgrounds for agent surfaces.",
    ready: false,
  },
]

export default function StudioPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-16 md:px-6">
      <div className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Studio</h1>
        <p className="text-muted-foreground">
          Configure AI interaction surfaces with live previews, then copy the exact code for your setup.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((t) => {
          const card = (
            <div className="flex h-full flex-col gap-2 rounded-xl border bg-card p-5 transition-colors hover:bg-accent/40">
              <div className="flex items-center gap-2">
                <h2 className="font-medium">{t.title}</h2>
                {!t.ready && <Badge variant="secondary">Soon</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{t.body}</p>
            </div>
          )
          return t.ready ? (
            <Link key={t.title} href={t.href}>
              {card}
            </Link>
          ) : (
            <div key={t.title} className="opacity-60">
              {card}
            </div>
          )
        })}
      </div>
    </main>
  )
}
