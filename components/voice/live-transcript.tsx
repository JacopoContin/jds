"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "cn"

type TranscriptSegment = { id: string; speaker: "user" | "agent"; text: string; final: boolean }

/**
 * Rolling transcript. Interim (non-final) text renders dimmed so users can see
 * recognition is in flight without mistaking it for committed input.
 */
function LiveTranscript({
  segments,
  agentName = "Agent",
  className,
  ...props
}: React.ComponentProps<"div"> & { segments: TranscriptSegment[]; agentName?: string }) {
  return (
    <div
      data-slot="live-transcript"
      role="log"
      aria-live="polite"
      className={cn("flex flex-col gap-3 text-sm", className)}
      {...props}
    >
      <AnimatePresence initial={false}>
        {segments.map((s) => (
          <motion.div
            key={s.id}
            layout="position"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-[4.5rem_1fr] gap-3"
          >
            <span
              className={cn(
                "pt-px text-xs font-medium tracking-wide uppercase",
                s.speaker === "agent" ? "text-ember" : "text-muted-foreground"
              )}
            >
              {s.speaker === "agent" ? agentName : "You"}
            </span>
            <p className={cn("leading-relaxed transition-colors duration-300", !s.final && "text-muted-foreground")}>
              {s.text}
              {!s.final && <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-current align-middle" />}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export { LiveTranscript, type TranscriptSegment }
