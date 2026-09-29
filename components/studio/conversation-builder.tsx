"use client"

import * as React from "react"
import { cn } from "cn"

import { AgentSteps, type AgentStep } from "@/components/ai/agent-steps"
import { Approval, type ApprovalDecision } from "@/components/ai/approval"
import { ArtifactCard } from "@/components/ai/artifact"
import { Conversation, ConversationContent } from "@/components/ai/conversation"
import {
  Message,
  MessageAction,
  MessageActions,
  MessageAvatar,
  MessageContent,
  type MessageStyle,
} from "@/components/ai/message"
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai/reasoning"
import { Response } from "@/components/ai/response"
import { TypingIndicator } from "@/components/ai/shimmer"
import { Citation, Sources, type Source } from "@/components/ai/sources"
import { ToolCall, ToolCallContent, ToolCallHeader, ToolCallSection } from "@/components/ai/tool-call"
import { CodePanel } from "@/components/studio/code-panel"
import { ControlGroup, Segmented, Toggle } from "@/components/studio/controls"
import { render, type Node } from "@/components/studio/jsx"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CopyIcon, RegenerateIcon, ThumbsDownIcon, ThumbsUpIcon } from "@/lib/icons"

type Config = Required<MessageStyle> & {
  avatars: "none" | "assistant" | "both"
  actions: boolean
  reasoning: boolean
  plan: boolean
  tools: "detailed" | "compact" | "off"
  approval: boolean
  sources: "list" | "citations" | "both" | "off"
  artifact: boolean
}

type Surface = "page" | "panel"
type Phase = "working" | "done"

const defaults: Config = {
  bubbles: "user",
  shape: "tail",
  density: "comfortable",
  avatars: "none",
  actions: true,
  reasoning: true,
  plan: true,
  tools: "detailed",
  approval: true,
  sources: "list",
  artifact: false,
}

/** Common looks to start from. */
const presets: { name: string; body: string; config: Partial<Config> }[] = [
  { name: "Assistant", body: "Plain answers, full activity", config: {} },
  {
    name: "Messenger",
    body: "Bubbles both sides, avatars",
    config: {
      bubbles: "all",
      shape: "round",
      avatars: "both",
      plan: false,
      tools: "compact",
      approval: false,
      actions: false,
    },
  },
  {
    name: "Compact",
    body: "Dense, for side panels",
    config: { density: "compact", shape: "square", plan: false, tools: "compact", sources: "citations", actions: false },
  },
  {
    name: "Research",
    body: "Plan, citations, report",
    config: { sources: "both", artifact: true, approval: false, tools: "compact" },
  },
  {
    name: "Minimal",
    body: "Just the answer",
    config: { reasoning: false, plan: false, tools: "off", approval: false, sources: "off", actions: false },
  },
]

const PROMPT = "Why did churn go up in March?"
const REASONING =
  "Compare March to the prior three months, split by plan, then look for anything that changed: pricing, releases, support volume."
const ANSWER =
  "Churn rose to **4.1%** in March, up from 2.8%. Most of it came from annual plans renewing after the price change, and billing tickets doubled in the same weeks."
const sources: Source[] = [
  { url: "https://analytics.example.com/churn", title: "Churn by plan, Jan–Mar", snippet: "Annual plans: 1.9% → 5.6%" },
  { url: "https://support.example.com/billing", title: "Billing tickets, March", snippet: "212 tickets, up from 104" },
]

const steps = (phase: Phase): AgentStep[] => [
  { id: "1", label: "Pull churn by month and plan", status: "complete" },
  { id: "2", label: "Compare against pricing and releases", status: phase === "done" ? "complete" : "active" },
  { id: "3", label: "Check support volume", status: phase === "done" ? "complete" : "pending" },
]

/* ---------- Code generation ---------- */

function generateCode(c: Config) {
  const imports = new Map<string, Set<string>>()
  const need = (from: string, ...names: string[]) => {
    const set = imports.get(from) ?? new Set<string>()
    names.forEach((n) => set.add(n))
    imports.set(from, set)
  }
  need("@/components/ai/conversation", "Conversation", "ConversationContent")
  need("@/components/ai/message", "Message", "MessageContent")

  const avatar = (who: "user" | "assistant"): Node[] => {
    if (c.avatars === "none" || (c.avatars === "assistant" && who === "user")) return []
    need("@/components/ai/message", "MessageAvatar")
    return [who === "user" ? "<MessageAvatar name={user.name} src={user.image} />" : '<MessageAvatar name="AI" src="/agent.png" />']
  }

  const parts: Node[] = []
  if (c.reasoning) {
    need("@/components/ai/reasoning", "Reasoning", "ReasoningContent", "ReasoningTrigger")
    parts.push({
      tag: "Reasoning",
      props: ["isStreaming={isReasoning}"],
      children: ["<ReasoningTrigger />", { tag: "ReasoningContent", text: "{reasoning}" }],
    })
  }
  if (c.plan) {
    need("@/components/ai/agent-steps", "AgentSteps")
    parts.push("<AgentSteps steps={steps} />")
  }
  if (c.tools !== "off") {
    need("@/components/ai/tool-call", "ToolCall", "ToolCallHeader")
    const header = '<ToolCallHeader name={part.toolName} state={part.state} />'
    if (c.tools === "detailed") {
      need("@/components/ai/tool-call", "ToolCallContent", "ToolCallSection")
      parts.push({
        tag: "ToolCall",
        children: [
          header,
          {
            tag: "ToolCallContent",
            children: [
              '<ToolCallSection label="Input" value={part.input} />',
              '<ToolCallSection label="Output" value={part.output} error={part.errorText} />',
            ],
          },
        ],
      })
    } else parts.push({ tag: "ToolCall", children: [header] })
  }
  if (c.approval) {
    need("@/components/ai/approval", "Approval")
    parts.push({
      tag: "Approval",
      props: ['title="Export the customer list?"', "decision={decision}", "onApprove={approve}", "onDeny={deny}"],
    })
  }
  const citations = c.sources === "citations" || c.sources === "both"
  if (citations) {
    need("@/components/ai/sources", "Citation")
    parts.push({
      tag: "p",
      children: [
        "Churn rose to 4.1% in March, mostly annual plans renewing after the price change",
        '<Citation index={1} source={sources[0]} />, while billing tickets doubled',
        "<Citation index={2} source={sources[1]} />.",
      ],
    })
  } else {
    need("@/components/ai/response", "Response")
    parts.push({ tag: "Response", props: ['isAnimating={status === "streaming"}'], text: "{text}" })
  }
  if (c.sources === "list" || c.sources === "both") {
    need("@/components/ai/sources", "Sources")
    parts.push("<Sources sources={sources} />")
  }
  if (c.artifact) {
    need("@/components/ai/artifact", "ArtifactCard")
    parts.push('<ArtifactCard title="Churn analysis, March" description="Report · 4 pages" onOpen={openArtifact} />')
  }
  if (c.actions) {
    need("@/components/ai/message", "MessageActions", "MessageAction")
    need("@/lib/icons", "CopyIcon", "RegenerateIcon")
    parts.push({
      tag: "MessageActions",
      children: [
        { tag: "MessageAction", props: ['label="Copy"', "onClick={copy}"], children: ["<CopyIcon />"] },
        { tag: "MessageAction", props: ['label="Regenerate"', "onClick={regenerate}"], children: ["<RegenerateIcon />"] },
      ],
    })
  }

  const style: string[] = []
  if (c.bubbles !== "user") style.push(`bubbles="${c.bubbles}"`)
  if (c.shape !== "tail") style.push(`shape="${c.shape}"`)
  if (c.density !== "comfortable") style.push(`density="${c.density}"`)

  const tree: Node = {
    tag: "Conversation",
    props: style,
    children: [
      {
        tag: "ConversationContent",
        children: [
          {
            tag: "Message",
            props: ['from="user"'],
            children: [...avatar("user"), { tag: "MessageContent", text: PROMPT }],
          },
          {
            tag: "Message",
            props: ['from="assistant"'],
            children: [...avatar("assistant"), { tag: "MessageContent", children: parts }],
          },
        ],
      },
    ],
  }

  const order = (names: Set<string>) => [...names].sort((a, b) => a.localeCompare(b))
  const head = [...imports.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([from, names]) => `import { ${order(names).join(", ")} } from "${from}"`)
  return `${head.join("\n")}\n\n${render(tree)}`
}

/* ---------- Preview ---------- */

function Turn({ c, phase }: { c: Config; phase: Phase }) {
  const working = phase === "working"
  const [decision, setDecision] = React.useState<ApprovalDecision>("pending")
  const citations = c.sources === "citations" || c.sources === "both"
  const avatar = (who: "user" | "assistant") =>
    c.avatars === "both" || (c.avatars === "assistant" && who === "assistant") ? (
      <MessageAvatar name={who === "user" ? "Sam" : "AI"} />
    ) : null

  return (
    <>
      <Message from="user">
        {avatar("user")}
        <MessageContent>{PROMPT}</MessageContent>
      </Message>
      <Message from="assistant">
        {avatar("assistant")}
        <MessageContent>
          {c.reasoning && (
            // Keyed on phase so it re-opens while working and settles when done.
            <Reasoning key={phase} isStreaming={working} duration={working ? undefined : 6}>
              <ReasoningTrigger />
              <ReasoningContent>{REASONING}</ReasoningContent>
            </Reasoning>
          )}
          {c.plan && <AgentSteps steps={steps(phase)} />}
          {c.tools !== "off" && (
            <ToolCall>
              <ToolCallHeader name="analytics.query" state={working ? "input-available" : "output-available"} />
              {c.tools === "detailed" && (
                <ToolCallContent>
                  <ToolCallSection label="Input" value={{ metric: "churn", by: "plan", months: 4 }} />
                  {!working && <ToolCallSection label="Output" value={{ march: "4.1%", february: "2.8%" }} />}
                </ToolCallContent>
              )}
            </ToolCall>
          )}
          {c.approval && (
            <Approval
              title="Export the customer list?"
              description="182 churned accounts, with emails, to a CSV."
              decision={decision}
              onApprove={() => setDecision("approved")}
              onDeny={() => setDecision("denied")}
            />
          )}
          {working ? (
            <TypingIndicator />
          ) : citations ? (
            <p>
              Churn rose to <strong>4.1%</strong> in March, up from 2.8%. Most of it came from annual plans renewing
              after the price change
              <Citation index={1} source={sources[0]} />, and billing tickets doubled in the same weeks
              <Citation index={2} source={sources[1]} />.
            </p>
          ) : (
            <Response>{ANSWER}</Response>
          )}
          {!working && (c.sources === "list" || c.sources === "both") && <Sources sources={sources} />}
          {!working && c.artifact && <ArtifactCard title="Churn analysis, March" description="Report · 4 pages" />}
          {!working && c.actions && (
            <MessageActions>
              <MessageAction label="Copy">
                <CopyIcon />
              </MessageAction>
              <MessageAction label="Regenerate">
                <RegenerateIcon />
              </MessageAction>
              <MessageAction label="Good response">
                <ThumbsUpIcon />
              </MessageAction>
              <MessageAction label="Bad response">
                <ThumbsDownIcon />
              </MessageAction>
            </MessageActions>
          )}
        </MessageContent>
      </Message>
    </>
  )
}

export function ConversationBuilder() {
  const [c, setC] = React.useState<Config>(defaults)
  const [surface, setSurface] = React.useState<Surface>("page")
  const [phase, setPhase] = React.useState<Phase>("done")
  const set =
    <K extends keyof Config>(key: K) =>
    (value: Config[K]) =>
      setC((prev) => ({ ...prev, [key]: value }))
  const code = generateCode(c)

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-5 overflow-y-auto border-b p-5 lg:h-[calc(100svh-3.5rem-1px)] lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold">Conversation</h1>
          <Button variant="ghost" size="xs" onClick={() => setC(defaults)}>
            Reset
          </Button>
        </div>
        <ControlGroup title="Presets">
          <div className="flex flex-col gap-1.5">
            {presets.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setC({ ...defaults, ...p.config })}
                className="flex items-baseline justify-between gap-3 rounded-lg border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="font-medium">{p.name}</span>
                <span className="truncate text-xs text-muted-foreground">{p.body}</span>
              </button>
            ))}
          </div>
        </ControlGroup>
        <ControlGroup title="Messages">
          <Segmented
            label="Bubbles"
            value={c.bubbles}
            onChange={set("bubbles")}
            options={[
              { value: "user", label: "User" },
              { value: "all", label: "Both" },
              { value: "none", label: "None" },
            ]}
          />
          {c.bubbles !== "none" && (
            <Segmented
              label="Shape"
              value={c.shape}
              onChange={set("shape")}
              options={[
                { value: "tail", label: "Tail" },
                { value: "round", label: "Round" },
                { value: "square", label: "Square" },
              ]}
            />
          )}
          <Segmented
            label="Density"
            value={c.density}
            onChange={set("density")}
            options={[
              { value: "comfortable", label: "Comfortable" },
              { value: "compact", label: "Compact" },
            ]}
          />
          <Segmented
            label="Avatars"
            value={c.avatars}
            onChange={set("avatars")}
            options={[
              { value: "none", label: "None" },
              { value: "assistant", label: "Agent" },
              { value: "both", label: "Both" },
            ]}
          />
          <Toggle label="Message actions" checked={c.actions} onChange={set("actions")} />
        </ControlGroup>
        <ControlGroup title="Agent activity">
          <Toggle label="Reasoning" checked={c.reasoning} onChange={set("reasoning")} />
          <Toggle label="Plan" checked={c.plan} onChange={set("plan")} />
          <Segmented
            label="Tool calls"
            value={c.tools}
            onChange={set("tools")}
            options={[
              { value: "detailed", label: "Detailed" },
              { value: "compact", label: "Compact" },
              { value: "off", label: "Off" },
            ]}
          />
          <Toggle label="Approval" checked={c.approval} onChange={set("approval")} />
        </ControlGroup>
        <ControlGroup title="Answer">
          <Segmented
            label="Sources"
            value={c.sources}
            onChange={set("sources")}
            options={[
              { value: "list", label: "List" },
              { value: "citations", label: "Inline" },
              { value: "both", label: "Both" },
              { value: "off", label: "Off" },
            ]}
          />
          <Toggle label="Artifact card" checked={c.artifact} onChange={set("artifact")} />
        </ControlGroup>
      </aside>

      <Tabs defaultValue="preview" className="min-w-0 gap-0 p-5 lg:h-[calc(100svh-3.5rem-1px)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="preview" className="flex min-h-0 flex-col">
          <div className="flex h-160 flex-col overflow-hidden rounded-2xl border bg-background lg:h-auto lg:min-h-0 lg:flex-1">
            <div className="flex justify-center border-b p-3">
              <ToggleGroup
                value={[surface]}
                onValueChange={(v) => v[0] && setSurface(v[0] as Surface)}
                variant="outline"
                size="sm"
                aria-label="Preview surface"
              >
                <ToggleGroupItem value="page">Page</ToggleGroupItem>
                <ToggleGroupItem value="panel">Side panel</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className={cn("flex min-h-0 flex-1", surface === "panel" && "justify-center bg-muted/30 p-6")}>
              <div
                className={cn(
                  "flex min-h-0 flex-1 flex-col",
                  surface === "panel" && "max-w-96 overflow-hidden rounded-2xl border bg-card shadow-lg",
                )}
              >
                {surface === "panel" && <div className="border-b px-4 py-3 text-sm font-medium">Agent</div>}
                <Conversation bubbles={c.bubbles} shape={c.shape} density={c.density}>
                  <ConversationContent>
                    <Turn key={phase} c={c} phase={phase} />
                  </ConversationContent>
                </Conversation>
              </div>
            </div>
            <div className="flex justify-center border-t p-4">
              <ToggleGroup
                value={[phase]}
                onValueChange={(v) => v[0] && setPhase(v[0] as Phase)}
                variant="outline"
                size="sm"
                aria-label="Turn state"
              >
                <ToggleGroupItem value="working">Working</ToggleGroupItem>
                <ToggleGroupItem value="done">Done</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="code" className="min-h-0 overflow-y-auto">
          <CodePanel
            code={code}
            note={
              <>
                Each part installs on its own, e.g. <code className="font-mono">npx shadcn@latest add @jds/message</code>
                . Part names follow the AI SDK&apos;s message parts, so <code className="font-mono">part.state</code>{" "}
                and friends come straight from <code className="font-mono">useChat</code>.
              </>
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
