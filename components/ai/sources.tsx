"use client"

import * as React from "react"
import { cn } from "cn"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SourceIcon } from "@/lib/icons"

type Source = { url: string; title?: string; snippet?: string }

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

/** Inline numbered citation. Hover or tap to preview the source. */
function Citation({ index, source, className }: { index: number; source: Source; className?: string }) {
  return (
    <Popover>
      <PopoverTrigger
        openOnHover
        delay={120}
        data-slot="citation"
        className={cn(
          "mx-0.5 inline-grid h-4 min-w-4 -translate-y-px place-items-center rounded-sm bg-muted px-1 align-middle font-mono text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
          className
        )}
      >
        {index}
      </PopoverTrigger>
      <PopoverContent className="w-72 gap-1.5 p-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <SourceIcon className="size-3" />
          {hostname(source.url)}
        </div>
        <a href={source.url} target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline">
          {source.title ?? source.url}
        </a>
        {source.snippet && <p className="line-clamp-3 text-xs text-muted-foreground">{source.snippet}</p>}
      </PopoverContent>
    </Popover>
  )
}

/** Source cards under a response. They wrap into as many columns as fit, so nothing scrolls sideways. */
function Sources({ sources, className, ...props }: React.ComponentProps<"div"> & { sources: Source[] }) {
  return (
    <div
      data-slot="sources"
      className={cn("grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-2", className)}
      {...props}
    >
      {sources.map((source, i) => (
        <a
          key={source.url}
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 flex-col gap-1 rounded-lg border bg-card p-2.5 transition-colors hover:border-ring/40 hover:bg-muted/40"
        >
          <span className="line-clamp-2 text-xs font-medium">{source.title ?? source.url}</span>
          <span className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-mono">{i + 1}</span>
            <span className="truncate">{hostname(source.url)}</span>
          </span>
        </a>
      ))}
    </div>
  )
}

export { Citation, Sources, type Source }
