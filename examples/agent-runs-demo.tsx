"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { AgentRuns, type AgentRun } from "@/components/ai/agent-runs"
import { AgentSteps, type AgentStep } from "@/components/ai/agent-steps"
import { Approval, type ApprovalDecision } from "@/components/ai/approval"
import { Message, MessageContent } from "@/components/ai/message"
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai/prompt-input"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, SparkleIcon } from "@/lib/icons"
import { spring } from "@/lib/motion"

/** A run plus what its thread shows when you open it in the panel. */
type Thread = AgentRun & { steps: AgentStep[]; ask?: { title: string; description: string; verb: string } }

const start = Date.now()
const initial: Thread[] = [
  {
    id: "refund",
    title: "Refund order #4821",
    agent: "Support",
    status: "needs-you",
    detail: "Refund €68.90 to Maria Rossi",
    steps: [
      { id: "1", label: "Look up order", status: "complete" },
      { id: "2", label: "Check refund window", status: "complete" },
      { id: "3", label: "Issue refund", status: "active" },
    ],
    ask: { title: "Refund €68.90 to Maria Rossi", description: "Goes back to the original card.", verb: "Refund" },
  },
  {
    id: "vendors",
    title: "Compare voice agent vendors",
    agent: "Research",
    status: "running",
    detail: "Reading pricing pages",
    startedAt: start - 3 * 60_000 - 51_000,
    steps: [
      { id: "1", label: "Collect vendors", status: "complete" },
      { id: "2", label: "Read pricing pages", status: "active" },
      { id: "3", label: "Write comparison", status: "pending" },
    ],
  },
  {
    id: "invoices",
    title: "Archive old invoices",
    agent: "Ops",
    status: "running",
    detail: "Finding invoices older than 7 years",
    startedAt: start - 89_000,
    steps: [
      { id: "1", label: "Find invoices older than 7 years", status: "active" },
      { id: "2", label: "Archive", status: "pending" },
    ],
  },
  {
    id: "digest",
    title: "Weekly metrics digest",
    agent: "Analytics",
    status: "done",
    detail: "Posted to #metrics",
    duration: "4m 12s",
    steps: [
      { id: "1", label: "Pull three dashboards", status: "complete" },
      { id: "2", label: "Post the digest", status: "complete" },
    ],
  },
  {
    id: "pr",
    title: "Review PR #982",
    agent: "Reviewer",
    status: "done",
    detail: "3 comments",
    duration: "6m 48s",
    steps: [
      { id: "1", label: "Read diff", status: "complete" },
      { id: "2", label: "Leave comments", status: "complete" },
    ],
  },
]

/**
 * An agent side panel with every agent's runs one click away in its header. Picking a run
 * opens its thread in the panel; the back arrow returns to your conversation.
 */
export default function AgentRunsDemo() {
  const [runs, setRuns] = React.useState(initial)
  const [openId, setOpenId] = React.useState<string>()
  const thread = runs.find((r) => r.id === openId)

  // A few seconds in, the invoices run reaches its archive step and needs you.
  React.useEffect(() => {
    const id = setTimeout(
      () =>
        setRuns((rs) =>
          rs.map((r) =>
            r.id === "invoices"
              ? {
                  ...r,
                  status: "needs-you",
                  detail: "Archive 214 invoices",
                  steps: [
                    { id: "1", label: "Find invoices older than 7 years", status: "complete", detail: "214 found" },
                    { id: "2", label: "Archive", status: "active" },
                  ],
                  ask: { title: "Archive 214 invoices", description: "They move to cold storage for 90 days.", verb: "Archive" },
                }
              : r,
          ),
        ),
      6000,
    )
    return () => clearTimeout(id)
  }, [])

  const decide = (id: string, decision: ApprovalDecision) =>
    setRuns((rs) =>
      rs.map((r) =>
        r.id === id
          ? {
              ...r,
              status: decision === "approved" ? "running" : "done",
              detail: decision === "approved" ? `${r.ask?.verb ?? "Continuing"}…` : "Stopped by you",
              startedAt: decision === "approved" ? Date.now() : undefined,
              duration: decision === "approved" ? undefined : "Stopped",
              ask: undefined,
            }
          : r,
      ),
    )

  return (
    <div className="flex h-136 w-full max-w-sm flex-col overflow-hidden rounded-xl border bg-card">
      <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-2">
        {thread ? (
          <Button variant="ghost" size="sm" onClick={() => setOpenId(undefined)} className="min-w-0">
            <ChevronLeftIcon />
            <span className="truncate">{thread.title}</span>
          </Button>
        ) : (
          <span className="flex items-center gap-2 px-2 text-sm font-medium">
            <SparkleIcon className="size-4" />
            Agent
          </span>
        )}
        <AgentRuns
          // The status keeps its width; a long run title truncates instead.
          className="shrink-0"
          runs={runs}
          onOpen={setOpenId}
          onApprove={(id) => decide(id, "approved")}
          onDeny={(id) => decide(id, "denied")}
        />
      </header>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={thread?.id ?? "chat"}
          initial={{ opacity: 0, x: thread ? 16 : -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={spring.gentle}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 text-sm *:shrink-0"
        >
          {thread ? (
            <>
              <p className="text-xs text-muted-foreground">
                {thread.agent} · {thread.status === "done" ? thread.duration : thread.detail}
              </p>
              <AgentSteps steps={thread.steps} />
              {thread.ask && (
                <Approval
                  title={thread.ask.title}
                  description={thread.ask.description}
                  approveLabel={thread.ask.verb}
                  onApprove={() => decide(thread.id, "approved")}
                  onDeny={() => decide(thread.id, "denied")}
                />
              )}
            </>
          ) : (
            <>
              <Message from="user">
                <MessageContent>What&apos;s on today?</MessageContent>
              </Message>
              <Message from="assistant">
                <MessageContent>
                  Three agents are working for you. The refund needs your approval: open it from the status at the top.
                </MessageContent>
              </Message>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="shrink-0 p-3">
        <PromptInput onSubmit={() => {}}>
          <PromptInputTextarea placeholder={thread ? `Message ${thread.agent}…` : "Ask anything…"} />
          <PromptInputToolbar>
            <PromptInputTools />
            <PromptInputSubmit />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  )
}
