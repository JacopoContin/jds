"use client"

import * as React from "react"
import { motion } from "motion/react"
import { cn } from "cn"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { spring } from "@/lib/motion"

type ContextUsage = {
  /** Tokens in the context window right now. */
  used: number
  /** Context window size. */
  max: number
  /** Optional split of `used`, shown on hover. */
  breakdown?: { label: string; tokens: number }[]
}

const format = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`

/** Neutral until 80%, warning to 95%, then destructive. */
function level(ratio: number) {
  return ratio >= 0.95 ? "critical" : ratio >= 0.8 ? "warning" : "ok"
}

/**
 * How full the context window is, as a small ring that fits a toolbar.
 * Hover or focus for the exact numbers and what's using the space.
 */
function ContextMeter({
  used,
  max,
  breakdown,
  className,
  showLabel = true,
}: ContextUsage & { className?: string; showLabel?: boolean }) {
  const ratio = Math.min(1, used / max)
  const state = level(ratio)
  const r = 7
  const circumference = 2 * Math.PI * r

  return (
    <Popover>
      <PopoverTrigger
        openOnHover
        delay={150}
        data-slot="context-meter"
        data-state={state}
        aria-label={`Context ${Math.round(ratio * 100)}% used`}
        className={cn(
          "group inline-flex h-7 items-center gap-1.5 rounded-md px-1.5 font-mono text-xs text-muted-foreground tabular-nums transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50",
          "data-[state=warning]:text-warning-foreground data-[state=critical]:text-destructive-foreground",
          className
        )}
      >
        <svg viewBox="0 0 18 18" className="size-4 -rotate-90">
          <circle cx="9" cy="9" r={r} fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
          <motion.circle
            cx="9"
            cy="9"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={false}
            animate={{ strokeDashoffset: circumference * (1 - ratio) }}
            transition={spring.gentle}
          />
        </svg>
        {showLabel && <span>{Math.round(ratio * 100)}%</span>}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 gap-3 p-3">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium">Context</span>
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {format(used)} / {format(max)}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            className={cn(
              "h-full rounded-full bg-foreground",
              state === "warning" && "bg-warning",
              state === "critical" && "bg-destructive"
            )}
            initial={false}
            animate={{ width: `${ratio * 100}%` }}
            transition={spring.gentle}
          />
        </div>
        {breakdown && breakdown.length > 0 && (
          <dl className="flex flex-col gap-1.5 text-xs">
            {breakdown.map((b) => (
              <div key={b.label} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{b.label}</dt>
                <dd className="font-mono tabular-nums">{format(b.tokens)}</dd>
              </div>
            ))}
          </dl>
        )}
        {state !== "ok" && (
          <p className="text-xs text-muted-foreground">
            {state === "critical"
              ? "Nearly full. Older messages will be summarized or dropped."
              : "Getting full. Long threads may lose early detail."}
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}

export { ContextMeter, type ContextUsage }
