"use client"

import * as React from "react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { RecipeTag } from "@/lib/recipes"

/**
 * Recipe sections with quick filters. Sections are rendered on the server and passed in;
 * this only decides which show. The filter lives in the query string (?tag=voice)
 * so a filtered view can be shared.
 */
export function RecipeList({
  tags,
  items,
}: {
  tags: { value: RecipeTag; label: string }[]
  items: { slug: string; tags: RecipeTag[]; content: React.ReactNode }[]
}) {
  const [tag, setTag] = React.useState<RecipeTag | "all">("all")

  // Read ?tag= once on mount; keep the URL in step when it changes.
  React.useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("tag")
    if (initial && tags.some((t) => t.value === initial)) queueMicrotask(() => setTag(initial as RecipeTag))
  }, [tags])
  const choose = (next: RecipeTag | "all") => {
    setTag(next)
    const url = new URL(window.location.href)
    if (next === "all") url.searchParams.delete("tag")
    else url.searchParams.set("tag", next)
    window.history.replaceState(null, "", url)
  }

  const shown = tag === "all" ? items : items.filter((i) => i.tags.includes(tag))

  return (
    <>
      <ToggleGroup
        value={[tag]}
        onValueChange={(v) => v[0] && choose(v[0] as RecipeTag | "all")}
        variant="outline"
        size="sm"
        aria-label="Filter recipes"
        className="flex-wrap"
      >
        <ToggleGroupItem value="all">All</ToggleGroupItem>
        {tags.map((t) => (
          <ToggleGroupItem key={t.value} value={t.value}>
            {t.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {shown.map((i) => (
        <React.Fragment key={i.slug}>{i.content}</React.Fragment>
      ))}
    </>
  )
}
