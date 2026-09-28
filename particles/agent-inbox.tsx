"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { AgentSteps, type AgentStep } from "@/components/ai/agent-steps"
import { Approval, type ApprovalDecision } from "@/components/ai/approval"
import { ToolCall, ToolCallContent, ToolCallHeader, ToolCallSection, type ToolState } from "@/components/ai/tool-call"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { spring } from "@/lib/motion"

type RunStatus = "approval" | "running" | "done"

type Run = {
  id: string
  agent: string
  title: string
  when: string
  status: RunStatus
  steps: AgentStep[]
  tool: { name: string; state: ToolState; input: unknown; output?: unknown }
  approval?: { title: string; description: string; verb: string }
}

const initialRuns: Run[] = [
  {
    id: "r1",
    agent: "Support",
    title: "Refund order #4821",
    when: "2m",
    status: "approval",
    steps: [
      { id: "1", label: "Look up order", status: "complete" },
      { id: "2", label: "Check refund window", status: "complete" },
      { id: "3", label: "Issue refund", status: "active" },
    ],
    tool: { name: "orders.lookup", state: "output-available", input: { orderId: "4821" }, output: { total: 68.9 } },
    approval: { title: "Refund €68.90 to Maria Rossi", description: "Goes back to the original card.", verb: "Refund" },
  },
  {
    id: "r2",
    agent: "Ops",
    title: "Archive 214 old invoices",
    when: "9m",
    status: "approval",
    steps: [
      { id: "1", label: "Find invoices older than 7 years", status: "complete" },
      { id: "2", label: "Archive", status: "active" },
    ],
    tool: {
      name: "billing.search",
      state: "output-available",
      input: { before: "2019-01-01" },
      output: { count: 214 },
    },
    approval: { title: "Archive 214 invoices", description: "They move to cold storage for 90 days.", verb: "Archive" },
  },
  {
    id: "r3",
    agent: "Researcher",
    title: "Compare voice agent vendors",
    when: "14m",
    status: "running",
    steps: [
      { id: "1", label: "Collect vendors", status: "complete" },
      { id: "2", label: "Read pricing pages", status: "active" },
      { id: "3", label: "Write comparison", status: "pending" },
    ],
    tool: { name: "web.search", state: "input-available", input: { q: "realtime voice agent pricing" } },
  },
  {
    id: "r4",
    agent: "Reviewer",
    title: "Review PR #982",
    when: "1h",
    status: "done",
    steps: [
      { id: "1", label: "Read diff", status: "complete" },
      { id: "2", label: "Leave comments", status: "complete" },
    ],
    tool: { name: "github.review", state: "output-available", input: { pr: 982 }, output: { comments: 3 } },
  },
]

const statusBadge: Record<RunStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  approval: { label: "Needs you", variant: "default" },
  running: { label: "Running", variant: "secondary" },
  done: { label: "Done", variant: "outline" },
}

export default function AgentInbox() {
  const [runs, setRuns] = React.useState(initialRuns)
  const [filter, setFilter] = React.useState<"all" | RunStatus>("approval")
  const [selectedId, setSelectedId] = React.useState("r1")
  const [decisions, setDecisions] = React.useState<Record<string, ApprovalDecision>>({})

  const visible = runs.filter((r) => filter === "all" || r.status === filter)
  const selected = runs.find((r) => r.id === selectedId)
  const pending = runs.filter((r) => r.status === "approval").length

  const decide = (run: Run, ok: boolean) => {
    setDecisions((d) => ({ ...d, [run.id]: ok ? "approved" : "denied" }))
    setRuns((all) =>
      all.map((r) =>
        r.id === run.id
          ? {
              ...r,
              status: "done",
              steps: r.steps.map((s) => (s.status === "active" ? { ...s, status: ok ? "complete" : "error" } : s)),
            }
          : r,
      ),
    )
  }

  return (
    <div className="flex h-160 w-full overflow-hidden rounded-2xl border bg-background">
      <div className="flex w-full flex-col border-r md:w-80 md:shrink-0">
        <div className="flex items-center justify-between gap-2 border-b p-3">
          <h3 className="text-sm font-medium">Inbox</h3>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList>
              <TabsTrigger value="approval">Needs you{pending > 0 ? ` · ${pending}` : ""}</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <ul className="flex min-h-0 flex-1 flex-col overflow-y-auto p-2">
          <AnimatePresence initial={false}>
            {visible.map((r) => (
              <motion.li
                key={r.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={spring.gentle}
                className="overflow-hidden"
              >
                <button
                  type="button"
                  aria-current={selectedId === r.id ? "true" : undefined}
                  onClick={() => setSelectedId(r.id)}
                  className="flex w-full flex-col gap-1 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent/60 aria-[current=true]:bg-accent"
                >
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {r.agent}
                    <span className="ml-auto">{r.when}</span>
                  </span>
                  <span className="truncate text-sm font-medium">{r.title}</span>
                  <Badge variant={statusBadge[r.status].variant}>{statusBadge[r.status].label}</Badge>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
          {visible.length === 0 && (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>All clear</EmptyTitle>
                <EmptyDescription>Nothing is waiting on you.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </ul>
      </div>

      <div className="hidden min-w-0 flex-1 flex-col md:flex">
        {selected ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={spring.gentle}
              className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{selected.agent} agent</span>
                <h3 className="text-lg font-semibold">{selected.title}</h3>
              </div>
              <AgentSteps steps={selected.steps} />
              <ToolCall>
                <ToolCallHeader name={selected.tool.name} state={selected.tool.state} />
                <ToolCallContent>
                  <ToolCallSection label="Input" value={selected.tool.input} />
                  <ToolCallSection label="Output" value={selected.tool.output} />
                </ToolCallContent>
              </ToolCall>
              {selected.approval && (
                <Approval
                  title={selected.approval.title}
                  description={selected.approval.description}
                  approveLabel={selected.approval.verb}
                  decision={decisions[selected.id] ?? "pending"}
                  onApprove={() => decide(selected, true)}
                  onDeny={() => decide(selected, false)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>
    </div>
  )
}
