"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Command,
} from "@/components/ui/command"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { components, docHref, nav, type ComponentDoc } from "@/lib/docs"
import { AgentIcon, FileIcon, SearchIcon, SparkleIcon, VoiceIcon } from "@/lib/icons"

type Entry = { title: string; href: string; description?: string; keywords?: string[] }

/**
 * Ranked substring match instead of cmdk's fuzzy default, which matches scattered
 * letters across long descriptions. Title prefix > title > word in description.
 */
function rank(value: string, search: string, keywords?: string[]) {
  const q = search.trim().toLowerCase()
  if (!q) return 1
  const title = value.toLowerCase().split(" ").slice(1).join(" ")
  if (title.startsWith(q)) return 1
  if (title.includes(q)) return 0.8
  if (
    keywords?.some((k) =>
      k
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .some((w) => w.startsWith(q)),
    )
  )
    return 0.4
  return 0
}

const byGroup = (g: ComponentDoc["group"]): Entry[] =>
  components
    .filter((c) => c.group === g)
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((c) => ({
      title: c.parent ? `${c.title} (Prompt Input)` : c.title,
      href: docHref(c),
      description: c.description,
      keywords: [c.slug, c.description],
    }))

const sections: { heading: string; icon: React.ReactNode; entries: Entry[] }[] = [
  {
    heading: "Docs",
    icon: <FileIcon />,
    entries: [...nav[0].items, { title: "Recipes", href: "/recipes" }].map((i) => ({
      title: i.title,
      href: i.href,
    })),
  },
  { heading: "Agent", icon: <SparkleIcon />, entries: byGroup("ai") },
  { heading: "Voice", icon: <VoiceIcon />, entries: byGroup("voice") },
  { heading: "Components", icon: <AgentIcon />, entries: byGroup("components") },
]

/** ⌘K / Ctrl+K (or "/") opens a palette over every page and component. */
export function Search() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        (e.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName))
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const go = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="hidden w-56 justify-between text-muted-foreground sm:flex"
      >
        <span className="flex items-center gap-2">
          <SearchIcon />
          Search docs…
        </span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Search" onClick={() => setOpen(true)} className="sm:hidden">
        <SearchIcon />
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search docs"
        description="Find a page or component"
        className="sm:max-w-xl"
      >
        <Command filter={rank}>
          <CommandInput placeholder="Search components and docs…" />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            {sections.map((s) => (
              <CommandGroup key={s.heading} heading={s.heading}>
                {s.entries.map((e) => (
                  <CommandItem
                    key={e.href}
                    value={`${s.heading} ${e.title}`}
                    keywords={e.keywords}
                    onSelect={() => go(e.href)}
                  >
                    {s.icon}
                    <span className="shrink-0">{e.title}</span>
                    {e.description && (
                      <span className="ml-auto hidden min-w-0 truncate pl-4 text-xs text-muted-foreground sm:block">
                        {e.description}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
