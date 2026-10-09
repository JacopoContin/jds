"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "cn"

import { AgentSteps, type AgentStep } from "@/components/ai/agent-steps"
import { Approval, type ApprovalDecision } from "@/components/ai/approval"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Textarea } from "@/components/ui/textarea"
import { ApprovalIcon, ChevronRightIcon, RegenerateIcon } from "@/lib/icons"
import { duration, ease, spring } from "@/lib/motion"

/**
 * A bottom sheet for approving an agent's action from a phone: what it wants to do, the exact
 * content, and approve in thumb reach. Pass `body` to let the user edit it before approving;
 * `onApprove` gets the edited text. Swiping the sheet away leaves the action pending and keeps
 * edits; give it a new `key` per request to start from the agent's text again.
 */
function ApprovalSheet({
  open,
  onOpenChange,
  title,
  description,
  fields = [],
  body,
  approveLabel = "Approve",
  denyLabel = "Deny",
  onApprove,
  onDeny,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  /** What the action touches, e.g. To and Subject. */
  fields?: { label: string; value: string }[]
  /** The content the agent wrote, editable before approving. */
  body?: string
  approveLabel?: string
  denyLabel?: string
  onApprove: (body?: string) => void
  onDeny: () => void
}) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(body)
  const bodyId = React.useId()

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent>
        <DrawerHeader className="items-center">
          <span className="mb-2 grid size-10 place-items-center rounded-full bg-muted">
            <ApprovalIcon className="size-5" />
          </span>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>

        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain p-4">
          {fields.length > 0 && (
            <dl className="flex flex-col divide-y rounded-lg border text-sm">
              {fields.map((f) => (
                <div key={f.label} className="flex gap-3 px-3 py-2">
                  <dt className="w-16 shrink-0 text-muted-foreground">{f.label}</dt>
                  <dd className="min-w-0 truncate">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {draft !== undefined &&
            (editing ? (
              <Textarea
                id={bodyId}
                aria-label="Message"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
                className="min-h-36"
              />
            ) : (
              <p id={bodyId} className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-line">
                {draft}
              </p>
            ))}
        </div>

        <div className="pb-(--safe-bottom)">
          <DrawerFooter>
            <Button size="lg" onClick={() => onApprove(draft)}>
              {approveLabel}
            </Button>
            <div className="grid grid-cols-2 gap-2 pb-4">
              {draft !== undefined ? (
                <Button size="lg" variant="outline" aria-controls={bodyId} onClick={() => setEditing((e) => !e)}>
                  {editing ? "Done editing" : "Edit"}
                </Button>
              ) : (
                <span />
              )}
              <Button size="lg" variant="destructive" onClick={onDeny}>
                {denyLabel}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

/** A sample request. Map your agent's paused tool call to these props. */
const request = {
  title: "Send email to Luca",
  description: "Aria wants to send this from your account.",
  fields: [
    { label: "To", value: "luca@example.com" },
    { label: "Subject", value: "Design review moved to tomorrow" },
  ],
  body: "Hi Luca,\n\nI moved our design review to tomorrow at 10:30. Same link as before.\n\nThanks!",
}

type Phase = "working" | "waiting" | "approved" | "denied"

const STEP_MS = 900

/**
 * An agent run on a phone that pauses for approval. The sheet opens on its own when the agent
 * needs a yes; swipe it away and the pending card brings it back. Scripted: wire `phase` to
 * your agent's run state and approve or deny its paused tool call.
 */
export default function MobileApproval({ className }: { className?: string }) {
  const [run, setRun] = React.useState(0)
  const [done, setDone] = React.useState(0)
  const [phase, setPhase] = React.useState<Phase>("working")
  const [open, setOpen] = React.useState(false)

  // Play the first two steps, then pause on the email and ask.
  React.useEffect(() => {
    if (phase !== "working") return
    const id = setTimeout(() => {
      if (done < 2) return setDone((d) => d + 1)
      setPhase("waiting")
      setOpen(true)
    }, STEP_MS)
    return () => clearTimeout(id)
  }, [phase, done, run])

  const decide = (decision: "approved" | "denied") => {
    setOpen(false)
    setPhase(decision)
  }

  const restart = () => {
    setDone(0)
    setPhase("working")
    setRun((r) => r + 1)
  }

  const status = (i: number): AgentStep["status"] =>
    i < done ? "complete" : i === done && phase === "working" ? "active" : "pending"
  const steps: AgentStep[] = [
    { id: "find", label: "Find the design review", status: status(0) },
    { id: "move", label: "Move it to tomorrow 10:30", status: status(1) },
    {
      id: "email",
      label: "Email Luca",
      detail: phase === "waiting" ? "Waiting for you" : undefined,
      status: phase === "approved" ? "complete" : phase === "denied" ? "error" : phase === "waiting" ? "active" : "pending",
    },
  ]
  const decision: ApprovalDecision = phase === "approved" ? "approved" : phase === "denied" ? "denied" : "pending"

  return (
    <div
      data-slot="mobile-approval"
      className={cn("flex h-dvh w-full flex-col overflow-hidden bg-background pt-(--safe-top)", className)}
    >
      <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium">Aria</span>
          <span className="text-xs text-muted-foreground">Move my 2pm with Luca to tomorrow</span>
        </div>
        <Button variant="ghost" size="icon" aria-label="Run again" onClick={restart}>
          <RegenerateIcon />
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 pb-(--safe-bottom)">
        <AgentSteps steps={steps} />

        <AnimatePresence mode="popLayout" initial={false}>
          {phase === "waiting" && (
            <motion.button
              key="pending"
              type="button"
              onClick={() => setOpen(true)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={spring.gentle}
              className="flex min-h-16 items-center gap-3 rounded-xl border border-foreground/20 bg-muted/40 p-4 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted">
                <ApprovalIcon className="size-4" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium">Aria needs your OK</span>
                <span className="truncate text-sm text-muted-foreground">{request.title}</span>
              </span>
              <span className="flex items-center gap-0.5 text-sm font-medium">
                Review
                <ChevronRightIcon className="size-4" />
              </span>
            </motion.button>
          )}
          {(phase === "approved" || phase === "denied") && (
            <motion.div
              key="resolved"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: duration.base, ease: ease.out }}
              className="flex flex-col gap-3"
            >
              <Approval title={request.title} description={request.fields[1].value} decision={decision} />
              <p className="text-sm">
                {phase === "approved"
                  ? "Sent. Luca has the new time, and the review is on both calendars."
                  : "Okay, I didn't send it. The meeting is still moved; let Luca know when you're ready."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ApprovalSheet
        key={run}
        open={open}
        onOpenChange={setOpen}
        {...request}
        approveLabel="Send email"
        denyLabel="Don't send"
        onApprove={() => decide("approved")}
        onDeny={() => decide("denied")}
      />
    </div>
  )
}

export { ApprovalSheet }
