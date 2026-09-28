"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { ApprovalIcon, CheckIcon, CloseIcon } from "@/lib/icons"
import { spring } from "@/lib/motion"

type ApprovalDecision = "pending" | "approved" | "denied"

/**
 * Human-in-the-loop gate. The agent pauses on a risky action until the user decides.
 * Pass `decision` to render the resolved state after the fact.
 */
function Approval({
  title,
  description,
  decision = "pending",
  onApprove,
  onDeny,
  approveLabel = "Approve",
  denyLabel = "Deny",
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
  decision?: ApprovalDecision
  onApprove?: () => void
  onDeny?: () => void
  approveLabel?: string
  denyLabel?: string
}) {
  return (
    <div
      data-slot="approval"
      data-decision={decision}
      role="group"
      aria-label="Approval required"
      className={cn(
        "overflow-hidden rounded-xl border bg-card transition-colors duration-300",
        decision === "pending" && "border-foreground/20 bg-muted/40",
        className
      )}
      {...props}
    >
      <div className="flex gap-3 p-4">
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-lg",
            decision === "pending" ? "bg-muted text-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          <ApprovalIcon className="size-4" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="text-sm font-medium">{title}</div>
          {description && <div className="text-sm text-muted-foreground">{description}</div>}
          {children && <div className="pt-2">{children}</div>}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t px-4 py-2.5">
        <AnimatePresence mode="wait" initial={false}>
          {decision === "pending" ? (
            <motion.div
              key="actions"
              className="flex gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -4 }}
            >
              <Button variant="ghost" size="sm" onClick={onDeny}>
                {denyLabel}
              </Button>
              <Button size="sm" onClick={onApprove}>
                {approveLabel}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring.gentle}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium",
                decision === "approved" ? "text-success" : "text-muted-foreground"
              )}
            >
              {decision === "approved" ? <CheckIcon className="size-3.5" /> : <CloseIcon className="size-3.5" />}
              {decision === "approved" ? "Approved" : "Denied"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export { Approval, type ApprovalDecision }
