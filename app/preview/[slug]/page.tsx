import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Example } from "@/components/docs/example"
import { phoneRecipes } from "@/lib/recipes"

export const dynamicParams = false

export const metadata: Metadata = { robots: { index: false } }

export function generateStaticParams() {
  return phoneRecipes.map((slug) => ({ slug }))
}

/** A phone recipe alone at viewport size, so the recipe page can frame it in an iframe with real dvh and fixed drawers. */
export default async function PreviewPage({ params }: PageProps<"/preview/[slug]">) {
  const { slug } = await params
  if (!phoneRecipes.includes(slug)) notFound()
  return (
    <div data-preview className="flex h-dvh flex-col">
      <Example name={`${slug}-screen`} />
    </div>
  )
}
