"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "cn"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Shimmer } from "@/components/ai/shimmer"
import { ChevronDownIcon, ReasoningIcon } from "@/lib/icons"

type ReasoningProps = React.ComponentProps<typeof Collapsible> & {
  /** While true the panel opens and the timer runs. It auto-collapses when streaming ends. */
  isStreaming?: boolean
  /** Seconds spent reasoning. Measured automatically if omitted. */
  duration?: number
}

const ReasoningContext = React.createContext<{ isStreaming: boolean; seconds: number }>({
  isStreaming: false,
  seconds: 0,
})

function Reasoning({ isStreaming = false, duration, className, children, ...props }: ReasoningProps) {
  const [open, setOpen] = React.useState(isStreaming)
  const [measured, setMeasured] = React.useState(0)
  const startedAt = React.useRef<number | null>(null)
  const [prevStreaming, setPrevStreaming] = React.useState(isStreaming)

  // Open while streaming, close once when it finishes. Manual toggles are respected afterwards.
  if (prevStreaming !== isStreaming) {
    setPrevStreaming(isStreaming)
    setOpen(isStreaming)
  }

  React.useEffect(() => {
    if (isStreaming) {
      startedAt.current = Date.now()
    } else if (startedAt.current) {
      const elapsed = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000))
      startedAt.current = null
      queueMicrotask(() => setMeasured(elapsed))
    }
  }, [isStreaming])

  return (
    <ReasoningContext.Provider value={{ isStreaming, seconds: duration ?? measured }}>
      <Collapsible
        data-slot="reasoning"
        open={open}
        onOpenChange={setOpen}
        className={className}
        {...props}
      >
        {children}
      </Collapsible>
    </ReasoningContext.Provider>
  )
}

function ReasoningTrigger({ className, children, ...props }: React.ComponentProps<typeof CollapsibleTrigger>) {
  const { isStreaming, seconds } = React.useContext(ReasoningContext)
  return (
    <CollapsibleTrigger
      data-slot="reasoning-trigger"
      className={cn(
        "group/trigger flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
      {...props}
    >
      <ReasoningIcon className={cn("size-4", isStreaming && "text-foreground")} />
      {children ??
        (isStreaming ? (
          <Shimmer>Thinking…</Shimmer>
        ) : (
          <span>{seconds > 0 ? `Thought for ${seconds}s` : "Reasoning"}</span>
        ))}
      <ChevronDownIcon className="size-3.5 transition-transform duration-200 group-data-panel-open/trigger:rotate-180" />
    </CollapsibleTrigger>
  )
}

function ReasoningContent({ className, children, ...props }: React.ComponentProps<typeof CollapsibleContent>) {
  return (
    <CollapsibleContent
      data-slot="reasoning-content"
      className={cn(
        "h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-300 ease-out-quint data-ending-style:h-0 data-starting-style:h-0",
        className
      )}
      {...props}
    >
      <div className="mt-3 border-l-2 border-border pl-4 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
        <AnimatePresence initial={false}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </CollapsibleContent>
  )
}

export { Reasoning, ReasoningTrigger, ReasoningContent }
