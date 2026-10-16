"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "cn"

import { Shimmer } from "@/components/ai/shimmer"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { AgentIcon, ChevronRightIcon, SuccessIcon } from "@/lib/icons"
import { spring } from "@/lib/motion"

type AgentRunStatus = "needs-you" | "running" | "done"

/** One agent working for you: what it's on, and where it's at. */
type AgentRun = {
  id: string
  title: string
  /** Which agent, e.g. "Support". */
  agent?: string
  status: AgentRunStatus
  /** Running: the step it's on. Needs you: what it's asking. Done: how it ended. */
  detail?: string
  /** Running: when it started (ms), for a live timer. */
  startedAt?: number
  /** Done: how long it took, e.g. "4m 12s". */
  duration?: string
}

/** How many done runs show before "Show more". */
const RECENT = 3

const elapsed = (from: number, now: number) => {
  const s = Math.max(0, Math.round((now - from) / 1000))
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`
}

/** The time, every second while `active`, for the running runs' timers. */
function useNow(active: boolean) {
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [active])
  return now
}

/**
 * Every agent working for you, from a status in your side panel's header (or a nav item).
 * The trigger says what's running and what needs you; it opens a list grouped by urgency,
 * where you approve or deny in place, or pick a run to open it in your panel.
 */
function AgentRuns({
  runs,
  onOpen,
  onApprove,
  onDeny,
  onOpenAll,
  side = "bottom",
  align = "end",
  className,
}: {
  runs: AgentRun[]
  /** A run was picked: show it in your panel. */
  onOpen?: (id: string) => void
  onApprove?: (id: string) => void
  onDeny?: (id: string) => void
  /** Shows "Open all" at the bottom, e.g. to your full agent inbox. */
  onOpenAll?: () => void
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [showAll, setShowAll] = React.useState(false)
  const needs = runs.filter((r) => r.status === "needs-you")
  const running = runs.filter((r) => r.status === "running")
  const done = runs.filter((r) => r.status === "done")
  const now = useNow(open && running.length > 0)

  // The trigger pulses once whenever another run starts needing you.
  const [pulse, setPulse] = React.useState(0)
  const seen = React.useRef(needs.length)
  React.useEffect(() => {
    if (needs.length > seen.current) setPulse((p) => p + 1)
    seen.current = needs.length
  }, [needs.length])

  const pick = (id: string) => {
    setOpen(false)
    onOpen?.(id)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            data-slot="agent-runs-trigger"
            aria-label={`Agents: ${running.length} running, ${needs.length} need you`}
            className={className}
          />
        }
      >
        <span className="relative flex size-4 items-center justify-center">
          {needs.length > 0 ? (
            <>
              <motion.span
                key={pulse}
                aria-hidden
                className="absolute size-2 rounded-full bg-primary"
                initial={{ scale: 1, opacity: pulse ? 0.6 : 0 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              <span className="size-2 rounded-full bg-primary" />
            </>
          ) : running.length > 0 ? (
            <Spinner className="size-3.5" />
          ) : (
            <AgentIcon />
          )}
        </span>
        {running.length === 0 && needs.length === 0 ? (
          "Agents"
        ) : (
          <span className="tabular-nums">
            {running.length > 0 && `${running.length} running`}
            {running.length > 0 && needs.length > 0 && <span className="text-muted-foreground"> · </span>}
            {needs.length > 0 && <span className="text-primary">{needs.length} needs you</span>}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent side={side} align={align} className="w-80 gap-0 p-1.5">
        {runs.length === 0 && <p className="px-2.5 py-6 text-center text-sm text-muted-foreground">No agents running</p>}

        <Group title="Needs you" count={needs.length}>
          {needs.map((r) => (
            <Row key={r.id} run={r} onOpen={pick}>
              <div className="mt-2 flex gap-1.5">
                <Button size="xs" onClick={() => onApprove?.(r.id)}>
                  Approve
                </Button>
                <Button size="xs" variant="ghost" onClick={() => onDeny?.(r.id)}>
                  Deny
                </Button>
              </div>
            </Row>
          ))}
        </Group>

        <Group title="Running" count={running.length}>
          {running.map((r) => (
            <Row
              key={r.id}
              run={r}
              onOpen={pick}
              meta={r.startedAt !== undefined && <span className="tabular-nums">{elapsed(r.startedAt, now)}</span>}
              icon={<Spinner className="size-3.5" />}
              shimmer
            />
          ))}
        </Group>

        <Group title="Recent" count={done.length}>
          {(showAll ? done : done.slice(0, RECENT)).map((r) => (
            <Row
              key={r.id}
              run={r}
              onOpen={pick}
              meta={r.duration}
              icon={<SuccessIcon className="size-3.5 text-success" />}
            />
          ))}
          {done.length > RECENT && !showAll && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="w-full rounded-md px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Show {done.length - RECENT} more
            </button>
          )}
        </Group>

        {onOpenAll && (
          <div className="mt-1 border-t pt-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onOpenAll()
              }}
              className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-accent"
            >
              Open all
              <ChevronRightIcon className="size-4 text-muted-foreground" />
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

function Group({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null
  return (
    <section className="flex flex-col py-1 [&+&]:border-t">
      <h3 className="flex items-center justify-between px-2.5 pt-1.5 pb-1 text-xs font-medium text-muted-foreground">
        {title}
        <span className="tabular-nums">{count}</span>
      </h3>
      <AnimatePresence initial={false}>{children}</AnimatePresence>
    </section>
  )
}

/** A run in the list. The row opens it; buttons inside (approve, deny) act without opening. */
function Row({
  run,
  onOpen,
  icon,
  meta,
  shimmer = false,
  children,
}: {
  run: AgentRun
  onOpen: (id: string) => void
  icon?: React.ReactNode
  meta?: React.ReactNode
  shimmer?: boolean
  children?: React.ReactNode
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={spring.snappy}
      data-slot="agent-run"
      data-status={run.status}
      className="group/run overflow-hidden rounded-md transition-colors hover:bg-accent"
    >
      <div className="px-2.5 py-2">
        <button type="button" onClick={() => onOpen(run.id)} className="flex w-full items-start gap-2.5 text-left outline-none">
          <span className={cn("mt-0.5 flex size-4 shrink-0 items-center justify-center", !icon && "text-primary")}>
            {icon ?? <span className="size-2 rounded-full bg-primary" />}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-medium">{run.title}</span>
              {meta && <span className="shrink-0 text-xs text-muted-foreground">{meta}</span>}
            </span>
            {(run.agent || run.detail) && (
              <span className="truncate text-xs text-muted-foreground">
                {run.agent}
                {run.agent && run.detail && " · "}
                {run.detail && (shimmer ? <Shimmer>{run.detail}</Shimmer> : run.detail)}
              </span>
            )}
          </span>
        </button>
        {children && <div className="pl-6.5">{children}</div>}
      </div>
    </motion.div>
  )
}

export { AgentRuns, type AgentRun, type AgentRunStatus }
