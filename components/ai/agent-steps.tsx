"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "cn"

import { Shimmer } from "@/components/ai/shimmer"
import { CheckIcon, CloseIcon } from "@/lib/icons"
import { spring } from "@/lib/motion"

type StepStatus = "pending" | "active" | "complete" | "error"

type AgentStep = { id: string; label: string; detail?: string; status: StepStatus }

/** Vertical plan/progress list, for multi-step agent runs. */
function AgentSteps({ steps, className, ...props }: React.ComponentProps<"ol"> & { steps: AgentStep[] }) {
  return (
    <ol data-slot="agent-steps" className={cn("relative flex flex-col", className)} {...props}>
      {steps.map((step, i) => (
        <li key={step.id} data-status={step.status} className="relative flex gap-3 pb-4 last:pb-0">
          {i < steps.length - 1 && (
            <span
              aria-hidden
              className={cn(
                "absolute top-5 bottom-0 left-2.25 w-px transition-colors duration-500",
                step.status === "complete" ? "bg-foreground/30" : "bg-border"
              )}
            />
          )}
          <StepMarker status={step.status} />
          <div className="min-w-0 flex-1 pt-px">
            <div
              className={cn(
                "text-sm transition-colors duration-300",
                step.status === "pending" && "text-muted-foreground",
                step.status === "error" && "text-destructive"
              )}
            >
              {step.status === "active" ? <Shimmer>{step.label}</Shimmer> : step.label}
            </div>
            {step.detail && <div className="mt-0.5 text-xs text-muted-foreground">{step.detail}</div>}
          </div>
        </li>
      ))}
    </ol>
  )
}

function StepMarker({ status }: { status: StepStatus }) {
  return (
    <span
      className={cn(
        "relative z-10 grid size-4.5 shrink-0 place-items-center rounded-full border bg-background transition-colors duration-300",
        status === "active" && "border-foreground",
        status === "complete" && "border-foreground bg-foreground text-background",
        status === "error" && "border-destructive bg-destructive text-background"
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {status === "active" && (
          <motion.span
            key="active"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={spring.snappy}
            className="size-1.5 animate-pulse-soft rounded-full bg-foreground"
          />
        )}
        {status === "complete" && (
          <motion.span key="complete" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring.snappy}>
            <CheckIcon className="size-2.5" strokeWidth={3} />
          </motion.span>
        )}
        {status === "error" && (
          <motion.span key="error" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring.snappy}>
            <CloseIcon className="size-2.5" strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

export { AgentSteps, type AgentStep, type StepStatus }
