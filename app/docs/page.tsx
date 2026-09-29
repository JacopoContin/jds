import type { Metadata } from "next"
import Link from "next/link"

import { H2, P, PageHeader, Pager } from "@/components/docs/prose"

export const metadata: Metadata = { title: "Introduction" }

export default function IntroductionPage() {
  return (
    <>
      <PageHeader
        title="Introduction"
        description="JDS (Jaco Design System) is an opinionated design system for AI agent and voice interfaces. Built on Base UI, distributed as source through the shadcn CLI."
      />

      <H2>How it works</H2>
      <P>
        You don&apos;t install a package. The CLI copies each component&apos;s source into your project, so you can read
        it, change it and own it. Updates are opt-in: re-run the add command and review the diff.
      </P>

      <H2>Why another system</H2>
      <P>
        General-purpose libraries give you buttons and dialogs. Agent products need more: a composer that knows when
        the model is streaming, a way to show reasoning without drowning the answer, tool calls users can inspect, a
        gate before the agent does something irreversible, and a voice mode that shows it&apos;s listening.
        JDS starts there, with the primitives underneath.
      </P>

      <H2>Principles</H2>
      <P>
        <strong>Agent state is always visible.</strong> Thinking, running a tool, waiting for approval, listening:
        each state has a component, so users never wonder if the agent is stuck.
      </P>
      <P>
        <strong>Neutral by default.</strong> No brand color. Activity reads through motion and contrast, so JDS
        fits your product instead of competing with it.
      </P>
      <P>
        <strong>Motion carries meaning.</strong> Springs are tuned per role: snappy for controls, gentle for content,
        soft for ambient voice. See <Link href="/docs/motion" className="text-foreground underline underline-offset-4">Motion</Link>.
      </P>
      <P>
        <strong>AI SDK compatible, not coupled.</strong> Status and tool states use the same strings as the AI SDK,
        so parts drop straight in. Nothing imports it.
      </P>

      <H2>Primitives, components and recipes</H2>
      <P>
        <strong>Primitives</strong> are Base UI building blocks with the JDS look: button, menu, dialog.{" "}
        <strong>Components</strong> are the agent and voice pieces built on them. <strong>Recipes</strong> are
        complete experiences, like a voice agent or a side panel, that install with one command and take the styles
        you set in the Studio.
      </P>

      <H2>Built for humans and agents</H2>
      <P>
        Every component is small, flat and commented where the intent isn&apos;t obvious, so a coding agent can read
        and change it as easily as you can. Each page&apos;s source is plain TSX.
      </P>

      <Pager href="/docs" />
    </>
  )
}
