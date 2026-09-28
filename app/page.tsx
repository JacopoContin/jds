import Link from "next/link"
import { cn } from "cn"

import { buttonVariants } from "@/components/ui/button"
import { Example } from "@/components/docs/example"
import { componentBySlug, docHref } from "@/lib/docs"

type Card = { slug: string; demo?: string; span?: string }

/** Related components sit next to each other: the agent turn first, then voice. */
const groups: { title: string; cards: Card[] }[] = [
  {
    title: "Agent",
    cards: [
      { slug: "prompt-input", demo: "prompt-input-frame", span: "lg:col-span-2" },
      { slug: "suggestions" },
      { slug: "prompt-input-mentions", span: "lg:col-span-2" },
      { slug: "context-meter" },
      { slug: "model-picker", span: "lg:col-span-2" },
      { slug: "reasoning" },
      { slug: "branch", span: "lg:col-span-2" },
      { slug: "agent-steps" },
      { slug: "tool-call", span: "lg:col-span-2" },
      { slug: "sources" },
      { slug: "approval", span: "lg:col-span-2" },
      { slug: "shimmer" },
      { slug: "artifact", span: "md:col-span-2 lg:col-span-3" },
    ],
  },
  {
    title: "Voice",
    cards: [
      { slug: "voice-orb", span: "lg:col-span-2" },
      { slug: "push-to-talk" },
      { slug: "call-controls", span: "lg:col-span-2" },
      { slug: "voice-picker" },
      { slug: "prompt-input-mic", span: "lg:col-span-2" },
      { slug: "waveform" },
      { slug: "live-transcript", span: "md:col-span-2 lg:col-span-3" },
    ],
  },
]

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-16 md:px-6 md:py-20">
      <div className="flex max-w-2xl flex-col items-start gap-5">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Components for agent and voice interfaces.
        </h1>
        <p className="text-base text-pretty text-muted-foreground">
          An opinionated design system built on Base UI. Streaming, reasoning, tool calls, approvals and voice, plus
          the primitives underneath. Installed as source with the shadcn CLI.
        </p>
        <div className="flex gap-2">
          <Link href="/docs/get-started" className={buttonVariants()}>
            Get started
          </Link>
          <Link href="/docs/components/prompt-input" className={buttonVariants({ variant: "outline" })}>
            Browse components
          </Link>
        </div>
      </div>

      {groups.map((group) => (
        <section key={group.title} className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">{group.title}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {group.cards.map(({ slug, demo, span }) => {
              const doc = componentBySlug[slug]
              return (
                <div key={slug} className={cn("flex flex-col overflow-hidden rounded-xl border bg-card", span)}>
                  <div className="flex min-h-64 flex-1 items-center justify-center p-6">
                    <Example name={demo ?? `${slug}-demo`} />
                  </div>
                  <Link
                    href={docHref(doc)}
                    className="flex items-center justify-between border-t px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                  >
                    <span className="font-medium">{doc.title}</span>
                    <span className="text-muted-foreground">View</span>
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </main>
  )
}
