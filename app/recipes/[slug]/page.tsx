import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CodeBlock } from "@/components/docs/code-block"
import { Command } from "@/components/docs/command"
import { readSource } from "@/components/docs/component-preview"
import { RecipeDemo } from "@/components/docs/recipe-demo"
import { recipeBySlug, recipes } from "@/lib/recipes"
import { site } from "@/lib/site"

export const dynamicParams = false

export function generateStaticParams() {
  return recipes.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: PageProps<"/recipes/[slug]">): Promise<Metadata> {
  const recipe = recipeBySlug[(await params).slug]
  return recipe ? { title: `${recipe.title} · Recipes`, description: recipe.description } : {}
}

export default async function RecipePage({ params }: PageProps<"/recipes/[slug]">) {
  const recipe = recipeBySlug[(await params).slug]
  if (!recipe) notFound()
  const sources = await Promise.all(recipe.files.map(async (file) => ({ file, code: await readSource(file) })))
  // Show just the interface to implement, not the whole simulated session.
  const session = (await readSource(recipe.session)).match(/\/\*\*[^]*?\*\/\ntype \w+Session = \{[^]*?\n\}/)?.[0]

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-16 md:px-6">
      <div className="flex max-w-2xl flex-col gap-3">
        <Link href="/recipes" className="text-sm text-muted-foreground hover:text-foreground">
          Recipes
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">{recipe.title}</h1>
        <p className="text-muted-foreground">{recipe.description}</p>
      </div>

      <RecipeDemo slug={recipe.slug} />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">How it flows</h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {recipe.flow.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-1.5 rounded-xl border bg-card p-4">
              <span className="font-mono text-xs text-muted-foreground">{i + 1}</span>
              <span className="text-sm font-medium">{step.title}</span>
              <span className="text-sm text-muted-foreground">{step.body}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex max-w-3xl flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Install</h2>
        <Command command={`shadcn@latest add ${site.namespace}/${recipe.slug}`} />
        <p className="text-sm text-muted-foreground">
          Installs the recipe and every component it uses. It runs straight away on the simulated session.
        </p>
      </section>

      {session && (
        <section className="flex max-w-3xl flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Connect your backend</h2>
          <p className="text-sm text-muted-foreground">
            The UI only reads this session. Build a hook that returns it from your realtime provider, then swap it for
            the simulated one.
          </p>
          <CodeBlock code={session} title="Session interface" />
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Source</h2>
        {sources.map((s) => (
          <CodeBlock key={s.file} code={s.code} title={s.file.replace(/^recipes\//, "components/")} />
        ))}
        {recipe.particle && (
          <p className="text-sm text-muted-foreground">
            Grew from the{" "}
            <Link href={`/particles#${recipe.particle}`} className="underline underline-offset-4 hover:text-foreground">
              {recipe.particle.replace("-", " ")} particle
            </Link>
            .
          </p>
        )}
      </section>
    </main>
  )
}
