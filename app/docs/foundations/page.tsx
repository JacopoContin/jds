import type { Metadata } from "next"
import Link from "next/link"

import { P, PageHeader } from "@/components/docs/prose"
import { components, docHref } from "@/lib/docs"

export const metadata: Metadata = { title: "Foundations" }

const foundations = components
  .filter((c) => c.group === "foundations" && !c.parent)
  .sort((a, b) => a.title.localeCompare(b.title))

/**
 * The primitives the agent and voice components are built on. They install like any other
 * component, and the CLI pulls them in on its own when a component needs one.
 */
export default function FoundationsPage() {
  return (
    <>
      <PageHeader
        title="Foundations"
        description="Base UI primitives with the JDS look. The agent and voice components are built on them, and the CLI installs the ones a component needs on its own."
      />
      <P>
        You rarely add these by hand. They&apos;re here when you want a menu, dialog or field that matches the rest of
        your agent UI.
      </P>
      <ul className="mt-6 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
        {foundations.map((c) => (
          <li key={c.slug} className="bg-background">
            <Link
              href={docHref(c)}
              className="flex h-full flex-col gap-1 px-4 py-3 transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
            >
              <span className="text-sm font-medium">{c.title}</span>
              <span className="text-xs text-muted-foreground">{c.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
