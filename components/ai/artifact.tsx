"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronRightIcon, CodeIcon, FileIcon } from "@/lib/icons"

/**
 * A generated document, page or file, shown in its own panel next to the chat.
 * Compose: <Artifact> > <ArtifactHeader> (with <ArtifactActions>) + <ArtifactContent>.
 */
function Artifact({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="artifact"
      className={cn("flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card", className)}
      {...props}
    />
  )
}

function ArtifactHeader({
  title,
  description,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & { title: React.ReactNode; description?: React.ReactNode }) {
  return (
    <div
      data-slot="artifact-header"
      className={cn("flex min-h-12 shrink-0 items-center gap-3 border-b px-4 py-2", className)}
      {...props}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
        {description && <div className="truncate text-xs text-muted-foreground">{description}</div>}
      </div>
      {children}
    </div>
  )
}

function ArtifactActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="artifact-actions" className={cn("flex items-center gap-0.5", className)} {...props} />
}

function ArtifactAction({ label, className, ...props }: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            className={cn("text-muted-foreground", className)}
            {...props}
          />
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function ArtifactContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="artifact-content" className={cn("min-h-0 flex-1 overflow-auto p-4", className)} {...props} />
}

/** Inline card in a message that opens the artifact. */
function ArtifactCard({
  title,
  description,
  kind = "document",
  active,
  onOpen,
  className,
}: {
  title: string
  description?: string
  kind?: "document" | "code"
  /** True while this artifact is open in the panel. */
  active?: boolean
  onOpen?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      data-slot="artifact-card"
      data-active={active || undefined}
      onClick={onOpen}
      className={cn(
        "group flex w-full max-w-sm items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors outline-none hover:bg-accent/50 focus-visible:ring-3 focus-visible:ring-ring/50 data-active:border-foreground/30",
        className
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4">
        {kind === "code" ? <CodeIcon /> : <FileIcon />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{title}</span>
        {description && <span className="block truncate text-xs text-muted-foreground">{description}</span>}
      </span>
      <ChevronRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}

export { Artifact, ArtifactHeader, ArtifactActions, ArtifactAction, ArtifactContent, ArtifactCard }
