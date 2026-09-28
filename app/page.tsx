import Link from "next/link"
import { cn } from "cn"

import { buttonVariants } from "@/components/ui/button"
import { Example } from "@/components/docs/example"
import { componentBySlug } from "@/lib/docs"

const featured = [
  { slug: "prompt-input", span: "lg:col-span-2" },
  { slug: "voice-orb", span: "" },
  { slug: "reasoning", span: "" },
  { slug: "approval", span: "lg:col-span-2" },
  { slug: "tool-call", span: "lg:col-span-2" },
  { slug: "agent-steps", span: "" },
  { slug: "message", span: "lg:col-span-2" },
  { slug: "push-to-talk", span: "" },
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {featured.map(({ slug, span }) => {
          const doc = componentBySlug[slug]
          return (
            <div key={slug} className={cn("flex flex-col overflow-hidden rounded-xl border bg-card", span)}>
              <div className="flex min-h-64 flex-1 items-center justify-center p-6">
                <Example name={`${slug}-demo`} />
              </div>
              <Link
                href={`/docs/components/${slug}`}
                className="flex items-center justify-between border-t px-4 py-3 text-sm transition-colors hover:bg-muted/50"
              >
                <span className="font-medium">{doc.title}</span>
                <span className="text-muted-foreground">View</span>
              </Link>
            </div>
          )
        })}
      </div>
    </main>
  )
}
