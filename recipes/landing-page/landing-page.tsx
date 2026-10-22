"use client"

import { cn } from "cn"

import { Message, MessageContent } from "@/components/ai/message"
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from "@/components/ai/prompt-input"
import { ToolCall, ToolCallHeader } from "@/components/ai/tool-call"
import { AmbientBackground, type AmbientBackgroundVariant } from "@/components/effects/ambient-background"
import { Button } from "@/components/ui/button"
import { VoiceOrb, type VoiceOrbVariant } from "@/components/voice/voice-orb"
import { ArrowRightIcon } from "@/lib/icons"

/** Placeholder copy. Replace it with what your product does, in your own words. */
const features = [
  { title: "Ask in plain words", body: "Describe the outcome you want. The agent plans the steps and shows its work as it goes." },
  { title: "Works in your tools", body: "It reads and writes where your team already works, with the same permissions they have." },
  { title: "You approve what matters", body: "Anything that changes data or spends money waits for a yes, with what will happen spelled out." },
]

const links = ["Product", "Pricing", "Docs"]

/** The product, working: one exchange with a tool call, under the composer. */
function Showcase({ orb }: { orb?: VoiceOrbVariant }) {
  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl bg-card p-4 ring-1 ring-surface-edge inset-shadow-surface surface-sheen @lg:p-5">
      <div className="flex items-center gap-2">
        <VoiceOrb variant={orb} state="listening" size={28} />
        <span className="text-sm font-medium">Assistant</span>
      </div>
      <div className="flex flex-col gap-3">
        <Message from="user">
          <MessageContent>What changed since yesterday?</MessageContent>
        </Message>
        <Message from="assistant">
          <MessageContent>
            <ToolCall>
              <ToolCallHeader name="activity.summary" state="output-available" />
            </ToolCall>
            Three tickets closed and one deploy is waiting for your review.
          </MessageContent>
        </Message>
      </div>
      <PromptInput onSubmit={() => {}}>
        <PromptInputTextarea placeholder="Ask anything" />
        <PromptInputToolbar>
          <PromptInputSubmit className="ml-auto" />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  )
}

/**
 * A one-page site for an AI product: header, hero with the product working, how it works,
 * a closing call to action and a footer. Its layout follows its own width (container queries),
 * so it works full screen and inside a preview. Type, color and surfaces come from the theme.
 */
export default function LandingPage({
  name = "Acme",
  description = "An assistant that does the busywork, so your team can do the work.",
  hero = "left",
  background = "none",
  orb,
  cta = "Get started",
  className,
}: {
  name?: string
  /** One sentence: what the product does. It becomes the headline. */
  description?: string
  /** Left: copy beside the product. Centered: copy above it. */
  hero?: "left" | "centered"
  /** An ambient background behind the hero, tinted by the primary color. */
  background?: AmbientBackgroundVariant | "none"
  /** The orb in the showcase. Leave it out to use your VoiceOrbProvider. */
  orb?: VoiceOrbVariant
  cta?: string
  className?: string
}) {
  const centered = hero === "centered"
  return (
    <div className={cn("@container flex min-h-dvh flex-col bg-background text-foreground", className)}>
      <header className="flex items-center justify-between gap-6 px-6 py-4 @4xl:px-10">
        <span className="font-heading text-lg font-medium tracking-tight">{name}</span>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground @2xl:flex">
          {links.map((l) => (
            <a key={l} href="#" className="transition-colors hover:text-foreground">
              {l}
            </a>
          ))}
        </nav>
        <Button size="sm">{cta}</Button>
      </header>

      <main className="flex flex-col">
        <section className="relative isolate overflow-hidden px-6 pt-16 pb-20 @4xl:px-10 @4xl:pt-24 @4xl:pb-28">
          {background !== "none" && (
            <AmbientBackground variant={background} intensity={0.5} grain={0.15} className="-z-10" />
          )}
          <div
            className={cn(
              "mx-auto flex max-w-6xl flex-col gap-12",
              centered ? "items-center" : "@4xl:flex-row @4xl:items-center @4xl:gap-16",
            )}
          >
            <div className={cn("flex flex-col gap-6", centered ? "max-w-3xl items-center text-center" : "@4xl:flex-1")}>
              <h1 className="font-heading text-4xl font-medium tracking-tight text-balance @2xl:text-5xl @5xl:text-6xl">
                {description}
              </h1>
              <p className="max-w-xl text-lg text-pretty text-muted-foreground">
                {name} works alongside your team, in plain language, and asks before it acts.
              </p>
              <div className="flex items-center gap-3">
                <Button size="lg">{cta}</Button>
                <Button size="lg" variant="ghost">
                  See it work
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
              </div>
            </div>
            <div className={cn("w-full", centered ? "max-w-2xl" : "@4xl:max-w-md @4xl:flex-1")}>
              <Showcase orb={orb} />
            </div>
          </div>
        </section>

        <section className="border-t px-6 py-20 @4xl:px-10">
          <div className="mx-auto grid max-w-6xl gap-10 @3xl:grid-cols-3 @3xl:gap-8">
            {features.map((f, i) => (
              <div key={f.title} className="flex flex-col gap-2">
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                <h2 className="font-heading text-xl font-medium tracking-tight">{f.title}</h2>
                <p className="text-sm text-pretty text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t px-6 py-24 @4xl:px-10">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
            <h2 className="font-heading text-3xl font-medium tracking-tight text-balance @2xl:text-4xl">
              Give {name} the busywork.
            </h2>
            <Button size="lg">{cta}</Button>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-4 border-t px-6 py-8 text-sm text-muted-foreground @2xl:flex-row @2xl:items-center @2xl:justify-between @4xl:px-10">
        {/* No year: new Date() blocks prerendering under Cache Components. */}
        <span>© {name}</span>
        <nav className="flex gap-6">
          {[...links, "Privacy"].map((l) => (
            <a key={l} href="#" className="transition-colors hover:text-foreground">
              {l}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  )
}
