"use client"

import * as React from "react"
import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDownIcon, ErrorIcon, PendingIcon, SpinnerIcon, SuccessIcon, ToolIcon } from "@/lib/icons"

/** Matches AI SDK tool part states. */
type ToolState = "input-streaming" | "input-available" | "output-available" | "output-error"

const stateMeta: Record<ToolState, { label: string; icon: React.ReactNode; className: string }> = {
  "input-streaming": {
    label: "Pending",
    icon: <PendingIcon />,
    className: "text-muted-foreground",
  },
  "input-available": {
    label: "Running",
    icon: <SpinnerIcon className="animate-spin" />,
    className: "text-ember",
  },
  "output-available": {
    label: "Done",
    icon: <SuccessIcon />,
    className: "text-success",
  },
  "output-error": {
    label: "Failed",
    icon: <ErrorIcon />,
    className: "text-destructive",
  },
}

function ToolCall({ className, ...props }: React.ComponentProps<typeof Collapsible>) {
  return (
    <Collapsible
      data-slot="tool-call"
      className={cn("w-full overflow-hidden rounded-xl border bg-card", className)}
      {...props}
    />
  )
}

function ToolCallHeader({
  name,
  state,
  className,
  ...props
}: React.ComponentProps<typeof CollapsibleTrigger> & { name: string; state: ToolState }) {
  const meta = stateMeta[state]
  return (
    <CollapsibleTrigger
      data-slot="tool-call-header"
      className={cn(
        "group/trigger flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50",
        className
      )}
      {...props}
    >
      <span className="grid size-6 place-items-center rounded-md bg-muted text-muted-foreground">
        <ToolIcon className="size-3.5" />
      </span>
      <span className="flex-1 truncate font-mono text-xs">{name}</span>
      <Badge variant="outline" className={cn("gap-1 [&>svg]:size-3!", meta.className)}>
        {meta.icon}
        {meta.label}
      </Badge>
      <ChevronDownIcon className="size-4 text-muted-foreground transition-transform duration-200 group-data-panel-open/trigger:rotate-180" />
    </CollapsibleTrigger>
  )
}

function ToolCallContent({ className, ...props }: React.ComponentProps<typeof CollapsibleContent>) {
  return (
    <CollapsibleContent
      data-slot="tool-call-content"
      className={cn(
        "h-(--collapsible-panel-height) overflow-hidden border-t transition-[height] duration-300 ease-out-quint data-ending-style:h-0 data-starting-style:h-0",
        className
      )}
      {...props}
    />
  )
}

function ToolCallSection({
  label,
  value,
  error,
  className,
  ...props
}: React.ComponentProps<"div"> & { label: string; value?: unknown; error?: string }) {
  if (value === undefined && !error) return null
  const text = error ?? (typeof value === "string" ? value : JSON.stringify(value, null, 2))
  return (
    <div data-slot="tool-call-section" className={cn("space-y-1.5 p-3", className)} {...props}>
      <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</div>
      <pre
        className={cn(
          "overflow-x-auto rounded-lg bg-muted/60 p-3 font-mono text-xs leading-relaxed",
          error && "bg-destructive/10 text-destructive"
        )}
      >
        {text}
      </pre>
    </div>
  )
}

export { ToolCall, ToolCallHeader, ToolCallContent, ToolCallSection, type ToolState }
