"use client"

import * as React from "react"

import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RecipePlatform, RecipeTag } from "@/lib/recipes"

type Item = { slug: string; tags: RecipeTag[]; platform: RecipePlatform; content: React.ReactNode }

/**
 * Recipe sections with a Web / Mobile switch and quick filters by kind. Sections are rendered
 * on the server and passed in; this only decides which show. Both live in the query string
 * (?platform=mobile&tag=voice) so a filtered view can be shared.
 */
export function RecipeList({
  tags,
  platforms,
  items,
}: {
  tags: { value: RecipeTag; label: string }[]
  platforms: { value: RecipePlatform; label: string }[]
  items: Item[]
}) {
  const [platform, setPlatform] = React.useState<RecipePlatform>("web")
  const [tag, setTag] = React.useState<RecipeTag | "all">("all")

  // Read the query once on mount; keep the URL in step when the filters change.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const p = params.get("platform")
    const t = params.get("tag")
    queueMicrotask(() => {
      if (p && platforms.some((x) => x.value === p)) setPlatform(p as RecipePlatform)
      if (t && tags.some((x) => x.value === t)) setTag(t as RecipeTag)
    })
  }, [platforms, tags])

  const sync = (nextPlatform: RecipePlatform, nextTag: RecipeTag | "all") => {
    const url = new URL(window.location.href)
    if (nextPlatform === "web") url.searchParams.delete("platform")
    else url.searchParams.set("platform", nextPlatform)
    if (nextTag === "all") url.searchParams.delete("tag")
    else url.searchParams.set("tag", nextTag)
    window.history.replaceState(null, "", url)
  }

  const onPlatform = items.filter((i) => i.platform === platform)
  // Only offer kinds this platform has, so a filter never leads to an empty list.
  const available = tags.filter((t) => onPlatform.some((i) => i.tags.includes(t.value)))
  const activeTag = tag !== "all" && available.some((t) => t.value === tag) ? tag : "all"
  const shown = activeTag === "all" ? onPlatform : onPlatform.filter((i) => i.tags.includes(activeTag))

  const choosePlatform = (next: RecipePlatform) => {
    setPlatform(next)
    sync(next, activeTag)
  }
  const chooseTag = (next: RecipeTag | "all") => {
    setTag(next)
    sync(platform, next)
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <Tabs value={platform} onValueChange={(v) => choosePlatform(v as RecipePlatform)}>
          <TabsList aria-label="Platform">
            {platforms.map((p) => (
              <TabsTrigger key={p.value} value={p.value}>
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Separator orientation="vertical" className="h-5" />
        <Tabs value={activeTag} onValueChange={(v) => chooseTag(v as RecipeTag | "all")}>
          <TabsList variant="line" aria-label="Kind of recipe" className="flex-wrap">
            <TabsTrigger value="all">All</TabsTrigger>
            {available.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      {shown.map((i) => (
        <React.Fragment key={i.slug}>{i.content}</React.Fragment>
      ))}
    </>
  )
}
