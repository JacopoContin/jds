import type { Metadata } from "next"
import Link from "next/link"

import { recipes } from "@/lib/recipes"

export const metadata: Metadata = {
  title: "Recipes",
  description: "Complete agent experiences you install with one command and connect to your backend.",
}

export default function RecipesPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-16 md:px-6">
      <div className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Recipes</h1>
        <p className="text-muted-foreground">
          Complete agent experiences built on particles. Each runs end to end with a simulated session, installs with
          one command, and has a single interface to implement for your voice or model backend.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {recipes.map((r) => (
          <Link key={r.slug} href={`/recipes/${r.slug}`}>
            <div className="flex h-full flex-col gap-2 rounded-xl border bg-card p-5 transition-colors hover:bg-accent/40">
              <h2 className="font-medium">{r.title}</h2>
              <p className="text-sm text-muted-foreground">{r.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
