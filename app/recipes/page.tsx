import type { Metadata } from "next"
import Link from "next/link"

import { ComponentPreview } from "@/components/docs/component-preview"
import { recipes } from "@/lib/recipes"

export const metadata: Metadata = {
  title: "Recipes",
  description: "Complete agent and voice experiences you can run, install with one command, and build on.",
}

export default function RecipesPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-4 py-16 md:px-6">
      <div className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Recipes</h1>
        <p className="text-muted-foreground">
          Complete agent and voice experiences composed from JDS components. Each runs as-is and installs with one
          command. Recipes with a session interface connect to your backend without touching the UI.
        </p>
      </div>
      {recipes.map((r) => (
        <section key={r.slug} id={r.slug} className="flex scroll-mt-20 flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">{r.title}</h2>
              <p className="text-sm text-muted-foreground">{r.description}</p>
            </div>
            <Link
              href={`/recipes/${r.slug}`}
              className="shrink-0 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Install and source
            </Link>
          </div>
          <ComponentPreview name={r.slug} dir="recipes" align="start" />
        </section>
      ))}
    </main>
  )
}
