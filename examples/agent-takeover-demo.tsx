"use client"

import * as React from "react"

import { AgentSteps, type AgentStep } from "@/components/ai/agent-steps"
import { Approval, type ApprovalDecision } from "@/components/ai/approval"
import { Message, MessageContent } from "@/components/ai/message"
import {
  PromptInput,
  PromptInputAttachButton,
  PromptInputContextItems,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  type PromptInputContextItem,
} from "@/components/ai/prompt-input"
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai/reasoning"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { PackageIcon, RegenerateIcon, SparkleIcon } from "@/lib/icons"
import { AgentField, AgentTakeover, AgentTyped } from "@/recipes/agent-takeover/agent-takeover"
import { takeoverProgress, useSimulatedTakeover, type TakeoverSession } from "@/recipes/agent-takeover/session"

/** Who supplies each item, already in your app. */
const suppliers: Record<string, string> = {
  "oat-milk": "Green Valley Dairy",
  espresso: "Roastworks",
  cups: "PackRight",
  croissants: "Maison Supply",
  vanilla: "Syrup & Co.",
}

/** Orders already on the page before the agent starts. */
const past = [
  {
    id: "whole-milk",
    title: "Whole milk, 2L",
    supplier: "Green Valley Dairy",
    quantity: "30 cases",
    status: "Delivered",
  },
  { id: "napkins", title: "Napkins", supplier: "PackRight", quantity: "5,000", status: "Delivered" },
]

/** The agent's two values per row: quantity, then the email to the supplier. */
const FIELDS = 2

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(v) => v[0] && onChange(v[0] as T)}
      variant="segmented"
      size="sm"
      aria-label={label}
    >
      {options.map((o) => (
        <ToggleGroupItem key={o.value} value={o.value}>
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

/**
 * The agent takes over Orders to restock a café, while you supervise from its side panel: you
 * approve the takeover there, watch the light and the inline signals, and can take back any
 * time. Click an order to add it to the panel's composer as context.
 */
export default function AgentTakeoverDemo() {
  const session = useSimulatedTakeover()
  const [light, setLight] = React.useState<"beam" | "track" | "glow">("beam")
  const [signals, setSignals] = React.useState<"inline" | "off">("inline")
  const [panel, setPanel] = React.useState<"show" | "hide">("show")
  // The takeover starts only when you approve it in the panel.
  const [decision, setDecision] = React.useState<ApprovalDecision>("pending")
  const [context, setContext] = React.useState<PromptInputContextItem[]>([])
  // Hovering the demo before trying it points you at the approval.
  const [hovering, setHovering] = React.useState(false)

  const { start } = session
  const approve = () => {
    setDecision("approved")
    start()
  }
  const restart = () => {
    setDecision("pending")
    setContext([])
    session.reset()
  }

  const toggleContext = (id: string, label: string) =>
    setContext((items) =>
      items.some((i) => i.id === id)
        ? items.filter((i) => i.id !== id)
        : [...items, { id, label, icon: <PackageIcon /> }],
    )

  return (
    <div
      className="flex w-full flex-col items-center gap-6"
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
    >
      <div className="flex flex-wrap justify-center gap-2">
        <Choice
          label="Light"
          value={light}
          onChange={setLight}
          options={[
            { value: "beam", label: "Beam" },
            { value: "track", label: "Track" },
            { value: "glow", label: "Glow" },
          ]}
        />
        <Choice
          label="Signals"
          value={signals}
          onChange={setSignals}
          options={[
            { value: "inline", label: "Inline" },
            { value: "off", label: "Off" },
          ]}
        />
        <Choice
          label="Panel"
          value={panel}
          onChange={setPanel}
          options={[
            { value: "show", label: "Panel" },
            { value: "hide", label: "No panel" },
          ]}
        />
      </div>

      <div
        // One height in every state: the panel scrolls as it fills, the table never outgrows it.
        className="flex h-160 w-full gap-3"
      >
        <AgentTakeover
          state={session.state}
          status={session.status}
          detail={session.detail}
          finished={session.finished}
          light={light}
          onTakeBack={session.takeBack}
          onResume={session.resume}
          className="flex min-w-0 flex-1 flex-col"
        >
          <OrdersTable
            session={session}
            inline={signals === "inline"}
            selected={context.map((c) => c.id)}
            onPick={panel === "show" ? toggleContext : undefined}
            onStart={panel === "hide" ? session.start : undefined}
            onRestart={restart}
          />
        </AgentTakeover>
        {panel === "show" && (
          <AgentPanel
            session={session}
            decision={decision}
            onApprove={approve}
            onDeny={() => setDecision("denied")}
            hint={hovering && decision === "pending"}
            onRestart={restart}
            context={context}
            onRemoveContext={(id) => setContext((items) => items.filter((i) => i.id !== id))}
          />
        )}
      </div>
    </div>
  )
}

/** Your app's screen: the Orders table the agent adds the restock to. */
function OrdersTable({
  session,
  inline,
  selected,
  onPick,
  onStart,
  onRestart,
}: {
  session: TakeoverSession
  inline: boolean
  /** Rows in the composer's context, shown as selected. */
  selected: string[]
  /** A row was clicked: add it to the agent's context. */
  onPick?: (id: string, label: string) => void
  /** Without the panel there's nowhere to approve, so the page offers to start. */
  onStart?: () => void
  onRestart: () => void
}) {
  const { state, rows, step } = session
  const writing = state === "working" || state === "paused"
  const progress = takeoverProgress(step, rows.length, FIELDS)
  const added = state === "idle" ? [] : rows.slice(0, writing ? progress.rows : rows.length)
  const field = (index: number, f: number) =>
    !writing || progress.written(index, f)
      ? ("done" as const)
      : progress.focus?.field === f && progress.focus.index === index
        ? ("writing" as const)
        : ("pending" as const)
  // Rows are context you can hand the agent, except while it's working: the page is its then.
  const pick = state === "working" ? undefined : onPick

  const row = (id: string, title: string, cells: React.ReactNode, agent = false) => (
    <TableRow
      key={id}
      data-agent={agent || undefined}
      data-state={selected.includes(id) ? "selected" : undefined}
      onClick={pick && (() => pick(id, title))}
      // The row the agent is on: its edge in the agent's color.
      className="h-12 cursor-pointer data-agent:bg-primary/5 data-agent:shadow-[inset_2px_0_0_var(--primary)]"
    >
      {cells}
    </TableRow>
  )

  return (
    <>
      <header className="flex h-12 items-center justify-between border-b px-5">
        <span className="text-sm font-medium">Orders</span>
        {state === "idle" && onStart && (
          <Button variant="outline" size="sm" onClick={onStart}>
            <SparkleIcon />
            Reorder low stock
          </Button>
        )}
        {state === "done" && (
          <Button variant="ghost" size="icon-sm" aria-label="Run again" onClick={onRestart}>
            <RegenerateIcon />
          </Button>
        )}
      </header>
      <div className="flex flex-col gap-4 p-5">
        <div className="overflow-hidden rounded-lg border">
          {/* Fixed columns: values arriving one by one mustn't shift the layout under the agent's cursor. */}
          <Table className="table-fixed">
            <colgroup>
              <col />
              <col className="w-40" />
              <col className="w-32" />
              <col className="w-32" />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {past.map((o) =>
                row(
                  o.id,
                  o.title,
                  <>
                    <TableCell>
                      <span className="block truncate font-medium">{o.title}</span>
                    </TableCell>
                    <TableCell>
                      <span className="block truncate">{o.supplier}</span>
                    </TableCell>
                    <TableCell>
                      <span className="tabular-nums">{o.quantity}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{o.status}</Badge>
                    </TableCell>
                  </>,
                ),
              )}
              {added.map((r, i) => {
                const creating = writing && progress.focus?.field === -1 && progress.focus.index === i
                const value = (f: number, children: React.ReactNode, label: string) =>
                  inline ? (
                    <AgentField state={field(i, f)} label={label} paused={state === "paused"}>
                      {children}
                    </AgentField>
                  ) : field(i, f) === "done" ? (
                    children
                  ) : null
                return row(
                  r.id,
                  r.title,
                  <>
                    <TableCell>
                      <span className="block truncate font-medium">
                        {creating && inline ? <AgentTyped text={r.title} /> : r.title}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="block truncate">{suppliers[r.id]}</span>
                    </TableCell>
                    <TableCell>
                      {value(0, <span className="tabular-nums">{r.values[0]}</span>, "Calculating…")}
                    </TableCell>
                    <TableCell>{value(1, <Badge variant="outline">{r.values[1]}</Badge>, "Emailing…")}</TableCell>
                  </>,
                  inline && writing && progress.focus?.index === i,
                )
              })}
              {/* What's still to come, while the agent adds rows. */}
              {inline && state === "working" && progress.rows < rows.length && (
                <TableRow className="h-12">
                  <TableCell>
                    <Skeleton className="h-3.5 w-1/2" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-14" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-16" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}

/**
 * The agent's side panel, outside the surface it took over: where you asked, where you approved
 * the takeover, where its steps follow the work, and where the rows you click land as context.
 */
function AgentPanel({
  session,
  decision,
  onApprove,
  onDeny,
  hint,
  onRestart,
  context,
  onRemoveContext,
}: {
  session: TakeoverSession
  decision: ApprovalDecision
  onApprove: () => void
  onDeny: () => void
  /** Show the tooltip that points people to the approval. */
  hint: boolean
  onRestart: () => void
  context: PromptInputContextItem[]
  onRemoveContext: (id: string) => void
}) {
  const { state, rows, step } = session
  const progress = takeoverProgress(step, rows.length, FIELDS)
  const count = rows.length
  const added = Math.min(step, count)
  const paused = state === "paused"
  const status = (done: boolean, active: boolean): AgentStep["status"] =>
    done ? "complete" : active ? "active" : "pending"
  const steps: AgentStep[] = [
    { id: "open", label: "Opening Orders", status: "complete" },
    { id: "stock", label: "Checking stock against par", status: "complete" },
    {
      id: "rows",
      label: `Adding orders · ${added} of ${count}`,
      status: status(step >= count, step < count),
      detail: paused && step < count ? "Paused" : undefined,
    },
    {
      id: "fields",
      label: "Emailing suppliers",
      status: status(progress.complete, step >= count && !progress.complete),
      detail: paused && step >= count ? "Paused" : undefined,
    },
  ]

  return (
    <aside className="hidden w-80 shrink-0 flex-col overflow-hidden rounded-xl border bg-card lg:flex">
      <header className="flex h-12 items-center justify-between gap-2 border-b px-4">
        <span className="flex items-center gap-2 text-sm font-medium">
          <SparkleIcon className="size-4" />
          Agent
        </span>
        {(state === "done" || decision === "denied") && (
          <Button variant="ghost" size="icon-sm" aria-label="Run again" onClick={onRestart}>
            <RegenerateIcon />
          </Button>
        )}
      </header>
      {/* Scrolls rather than squeezing its children: a shrunk approval card would clip its own buttons. */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 text-sm *:shrink-0">
        <Message from="user">
          <MessageContent>
            We&apos;re running low. Reorder what&apos;s below par and email the suppliers.
          </MessageContent>
        </Message>
        <Message from="assistant">
          <MessageContent>
            <p className="mb-2">{count} items are below par:</p>
            <ol className="list-decimal space-y-1 pl-4">
              {rows.map((r) => (
                <li key={r.id}>{r.title}</li>
              ))}
            </ol>
          </MessageContent>
        </Message>
        <Tooltip open={hint}>
          {/* A plain wrapper as the anchor, so the approval keeps its own attributes. */}
          <TooltipTrigger render={<div />}>
            <Approval
              title={`Reorder ${count} items`}
              description="I'll take over Orders to add each order and email its supplier. You can take back at any time."
              decision={decision}
              onApprove={onApprove}
              onDeny={onDeny}
              approveLabel="Take over"
            />
          </TooltipTrigger>
          <TooltipContent side="left">Try the agent takeover</TooltipContent>
        </Tooltip>
        {decision === "denied" && (
          <Message from="assistant">
            <MessageContent>Okay, I won&apos;t touch Orders.</MessageContent>
          </Message>
        )}
        {decision === "approved" && (
          <>
            <Reasoning duration={1}>
              <ReasoningTrigger />
              <ReasoningContent>
                Par levels come from the last four weeks of sales. Oat milk and cups run out first, so they go first;
                each quantity covers two weeks.
              </ReasoningContent>
            </Reasoning>
            <AgentSteps steps={steps} />
            {state === "done" && (
              <Message from="assistant">
                <MessageContent>
                  Done: {count} orders added and {count} suppliers emailed.
                </MessageContent>
              </Message>
            )}
          </>
        )}
      </div>
      <div className="p-3">
        <PromptInput onSubmit={() => {}}>
          <PromptInputContextItems items={context} onRemove={onRemoveContext} />
          <PromptInputTextarea placeholder={context.length ? "Ask about these orders…" : "Ask anything…"} />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputAttachButton />
            </PromptInputTools>
            <PromptInputSubmit />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </aside>
  )
}
