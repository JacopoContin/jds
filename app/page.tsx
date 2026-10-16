import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { Example } from "@/components/docs/example"
import { componentBySlug, docHref } from "@/lib/docs"
import { ArrowRightIcon } from "@/lib/icons"

type Card = { slug: string; demo?: string; span?: string }

/** The two signature pieces, first and larger, each with a way into its Studio. */
const featured: (Card & { studio: string })[] = [
  { slug: "voice-orb", studio: "/studio/voice-orb" },
  { slug: "prompt-input", demo: "prompt-input-studio-preview", studio: "/studio/prompt-input" },
]

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-16 md:px-6 md:py-20">
      <div className="flex max-w-2xl flex-col items-start gap-5">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Voice and agent interfaces, crafted.
        </h1>
        <p className="text-base text-pretty text-muted-foreground">
          Voice orbs, live transcripts, tool calls, approvals and the light effects that show an agent at work.
          Installed as source with the shadcn CLI, ready for you or your coding agent to make your own.
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

      <section className="grid gap-4 md:grid-cols-2">
        {featured.map(({ slug, demo, studio }) => {
          const doc = componentBySlug[slug]
          return (
            <div key={slug} className="flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-surface-edge inset-shadow-surface surface-sheen">
              <div className="flex min-h-96 flex-1 items-center justify-center p-6">
                <Example name={demo ?? `${slug}-demo`} />
              </div>
              <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm">
                <Link href={docHref(doc)} className="font-medium hover:underline">
                  {doc.title}
                </Link>
                <Link
                  href={studio}
                  className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  Open in Studio
                  <ArrowRightIcon className="size-3.5" />
                </Link>
              </div>
            </div>
          )
        })}
      </section>

      {/* The agent showcase: a small Voice Panel Studio running the real recipe on a phone, in the site theme. */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">Agent</h2>
        <div className="flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-surface-edge inset-shadow-surface surface-sheen">
          <div className="flex justify-center p-6 md:p-10">
            <Example name="voice-panel-studio-preview" />
          </div>
          <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm">
            <Link href="/recipes/mobile-voice-panel" className="font-medium hover:underline">
              Voice Panel
            </Link>
            <Link
              href="/studio/voice-panel"
              className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              Open in Studio
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* The agent working directly on your app's UI, with you supervising: edge light, take back, inline signals. */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">Takeover</h2>
        <div className="flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-surface-edge inset-shadow-surface surface-sheen">
          <div className="p-6 md:p-10">
            <Example name="agent-takeover" />
          </div>
          <Link
            href="/recipes/agent-takeover"
            className="flex items-center justify-between border-t px-4 py-3 text-sm transition-colors hover:bg-muted/50"
          >
            <span className="font-medium">Agent Takeover</span>
            <span className="text-muted-foreground">View</span>
          </Link>
        </div>
      </section>
    </main>
  )
}
