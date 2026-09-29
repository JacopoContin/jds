"use client"

import * as React from "react"
import { cn } from "cn"

import { ContextMeter } from "@/components/ai/context-meter"
import { Message, MessageContent } from "@/components/ai/message"
import { ModelPicker, type Model } from "@/components/ai/model-picker"
import {
  PromptInput,
  PromptInputAttachButton,
  PromptInputAttachments,
  PromptInputFooter,
  PromptInputFrame,
  PromptInputHeader,
  PromptInputOption,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  type ChatStatus,
  type SubmitKey,
} from "@/components/ai/prompt-input"
import { PromptInputMentions, type Mention } from "@/components/ai/prompt-input-mentions"
import { PromptInputMic } from "@/components/ai/prompt-input-mic"
import { Suggestion, Suggestions } from "@/components/ai/suggestions"
import { CopyButton } from "@/components/docs/copy-button"
import { ControlGroup, Segmented, Text, Toggle } from "@/components/studio/controls"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { VoiceOrb } from "@/components/voice/voice-orb"
import { InfoIcon, ReasoningIcon, ResearchIcon, WebSearchIcon } from "@/lib/icons"

type OptionKey = "web" | "research" | "think"

type Config = {
  placeholder: string
  header: boolean
  headerText: string
  /** Where option chips sit: a footer row under the input, inline in the toolbar, or nowhere. */
  options: "footer" | "toolbar" | "off"
  web: boolean
  research: boolean
  think: boolean
  attach: boolean
  mentions: boolean
  model: boolean
  context: boolean
  mic: boolean
  voice: boolean
  suggestions: "above" | "below" | "off"
  submitShape: "round" | "square"
  submitStyle: "filled" | "outline"
  submitOn: SubmitKey
}

type Surface = "page" | "docked" | "panel"

const defaults: Config = {
  placeholder: "Ask anything…",
  header: false,
  headerText: "Add context, let the agent manage the rest",
  options: "footer",
  web: true,
  research: true,
  think: false,
  attach: true,
  mentions: false,
  model: true,
  context: false,
  mic: true,
  voice: false,
  suggestions: "off",
  submitShape: "round",
  submitStyle: "filled",
  submitOn: "enter",
}

/** Common composers to start from. */
const presets: { name: string; body: string; config: Partial<Config> }[] = [
  { name: "Chat", body: "Attach, model, dictation", config: {} },
  {
    name: "Research",
    body: "Search and research chips",
    config: { options: "footer", web: true, research: true, think: true, model: false, suggestions: "below" },
  },
  {
    name: "Coding",
    body: "Mentions, context meter, ⌘↵",
    config: {
      placeholder: "Describe a change, @ to add files",
      options: "off",
      mentions: true,
      context: true,
      mic: false,
      submitOn: "mod-enter",
      submitShape: "square",
    },
  },
  {
    name: "Copilot",
    body: "Page context, voice mode",
    config: {
      header: true,
      headerText: "Orders · 128 rows",
      options: "off",
      model: false,
      mic: false,
      voice: true,
      suggestions: "above",
    },
  },
  {
    name: "Minimal",
    body: "Just text and send",
    config: { options: "off", attach: false, model: false, mic: false },
  },
]

const optionMeta: Record<OptionKey, { label: string; icon: string; node: React.ReactNode }> = {
  web: { label: "Web search", icon: "WebSearchIcon", node: <WebSearchIcon /> },
  research: { label: "Deep research", icon: "ResearchIcon", node: <ResearchIcon /> },
  think: { label: "Think", icon: "ReasoningIcon", node: <ReasoningIcon /> },
}

const models: Model[] = [
  { id: "opus", name: "Claude Opus 5.5", description: "Hardest problems", capabilities: ["reasoning", "vision"] },
  { id: "sonnet", name: "Claude Sonnet 5.5", description: "Everyday tasks", capabilities: ["reasoning", "vision"] },
  { id: "haiku", name: "Claude Haiku 4.5", description: "Quick answers", capabilities: ["fast"] },
]

const mentionItems: Mention[] = [
  { id: "f1", label: "pricing.md", type: "file", description: "docs/" },
  { id: "f2", label: "checkout.tsx", type: "file", description: "app/checkout/" },
  { id: "t1", label: "web-search", type: "tool", description: "Search the web" },
  { id: "a1", label: "reviewer", type: "agent", description: "Code review agent" },
]

const suggestionList = ["Summarize this page", "Draft a reply", "Find overdue orders"]

const statuses: { value: ChatStatus; label: string }[] = [
  { value: "ready", label: "Ready" },
  { value: "submitted", label: "Submitted" },
  { value: "streaming", label: "Streaming" },
  { value: "error", label: "Error" },
]

const chips = (c: Config) => (["web", "research", "think"] as const).filter((k) => c[k])
const framed = (c: Config) => c.header || (c.options === "footer" && chips(c).length > 0)
const submitProps = (c: Config) => ({
  variant: c.submitStyle === "outline" ? ("outline" as const) : undefined,
  className: c.submitShape === "square" ? "rounded-lg" : undefined,
})

/* ---------- Code generation ---------- */

type Node = string | { tag: string; props?: string[]; children?: Node[]; text?: string }

function render(node: Node, depth = 0): string {
  const pad = "  ".repeat(depth)
  if (typeof node === "string") return pad + node
  const open = [node.tag, ...(node.props ?? [])].join(" ")
  if (node.text !== undefined) return `${pad}<${open}>${node.text}</${node.tag}>`
  if (!node.children?.length) return `${pad}<${open} />`
  return [`${pad}<${open}>`, ...node.children.map((child) => render(child, depth + 1)), `${pad}</${node.tag}>`].join(
    "\n",
  )
}

function generateCode(c: Config) {
  const parts = new Set(["PromptInput", "PromptInputTextarea", "PromptInputToolbar", "PromptInputTools", "PromptInputSubmit"])
  const icons: string[] = []
  const imports: string[] = []
  const options = c.options === "off" ? [] : chips(c)

  const chipNodes: Node[] = options.map((k) => {
    icons.push(optionMeta[k].icon)
    return { tag: "PromptInputOption", props: [`icon={<${optionMeta[k].icon} />}`], text: optionMeta[k].label }
  })
  if (options.length) parts.add("PromptInputOption")

  const tools: Node[] = []
  if (c.attach) {
    parts.add("PromptInputAttachButton").add("PromptInputAttachments")
    tools.push("<PromptInputAttachButton />")
  }
  if (c.options === "toolbar") tools.push(...chipNodes)

  const actions: Node[] = []
  if (c.context) {
    imports.push(`import { ContextMeter } from "@/components/ai/context-meter"`)
    actions.push("<ContextMeter used={usage.used} max={usage.max} showLabel={false} />")
  }
  if (c.model) {
    imports.push(`import { ModelPicker } from "@/components/ai/model-picker"`)
    actions.push(`<ModelPicker models={models} value={model} onValueChange={setModel} />`)
  }
  if (c.mic) {
    imports.push(`import { PromptInputMic } from "@/components/ai/prompt-input-mic"`)
    actions.push("<PromptInputMic />")
  }
  if (c.voice) {
    imports.push(`import { Button } from "@/components/ui/button"`, `import { VoiceOrb } from "@/components/voice/voice-orb"`)
    actions.push({
      tag: "Button",
      props: ['type="button"', 'variant="ghost"', 'size="icon-sm"', 'aria-label="Start voice mode"', "onClick={startVoice}"],
      children: ['<VoiceOrb variant="dot" size={18} />'],
    })
  }
  const submit = ["onStop={stop}"]
  if (c.submitStyle === "outline") submit.unshift('variant="outline"')
  if (c.submitShape === "square") submit.unshift('className="rounded-lg"')
  actions.push(`<PromptInputSubmit ${submit.join(" ")} />`)

  const inputProps = ["status={status}"]
  if (c.submitOn === "mod-enter") inputProps.push('submitOn="mod-enter"')
  inputProps.push("onSubmit={({ text, files }) => sendMessage({ text, files })}")

  const inputChildren: Node[] = []
  if (c.mentions) {
    imports.push(`import { PromptInputMentions } from "@/components/ai/prompt-input-mentions"`)
    inputChildren.push("<PromptInputMentions items={mentionables} />")
  }
  if (c.attach) inputChildren.push("<PromptInputAttachments />")
  inputChildren.push(c.placeholder === "Ask anything…" ? "<PromptInputTextarea />" : `<PromptInputTextarea placeholder="${c.placeholder}" />`)
  inputChildren.push({
    tag: "PromptInputToolbar",
    children: [
      tools.length ? { tag: "PromptInputTools", children: tools } : "<PromptInputTools />",
      actions.length > 1 ? { tag: "div", props: ['className="flex items-center gap-1"'], children: actions } : actions[0],
    ],
  })
  let composer: Node = { tag: "PromptInput", props: inputProps, children: inputChildren }

  if (framed(c)) {
    parts.add("PromptInputFrame")
    const frame: Node[] = []
    if (c.header) {
      parts.add("PromptInputHeader")
      icons.push("InfoIcon")
      frame.push({ tag: "PromptInputHeader", props: ["icon={<InfoIcon />}"], text: c.headerText })
    }
    frame.push(composer)
    if (c.options === "footer" && options.length) {
      parts.add("PromptInputFooter")
      frame.push({ tag: "PromptInputFooter", children: chipNodes })
    }
    composer = { tag: "PromptInputFrame", children: frame }
  }

  let root = composer
  if (c.suggestions !== "off") {
    imports.push(`import { Suggestion, Suggestions } from "@/components/ai/suggestions"`)
    const list: Node = {
      tag: "Suggestions",
      children: suggestionList.map((s) => `<Suggestion suggestion="${s}" onSelect={(text) => sendMessage({ text })} />`),
    }
    root = {
      tag: "div",
      props: ['className="flex flex-col gap-3"'],
      children: c.suggestions === "above" ? [list, composer] : [composer, list],
    }
  }

  const order = [
    "PromptInput",
    "PromptInputAttachButton",
    "PromptInputAttachments",
    "PromptInputFooter",
    "PromptInputFrame",
    "PromptInputHeader",
    "PromptInputOption",
    "PromptInputSubmit",
    "PromptInputTextarea",
    "PromptInputToolbar",
    "PromptInputTools",
  ].filter((p) => parts.has(p))
  const head = [
    ...imports.filter((line) => line.includes("@/components/ai/") && !line.includes("prompt-input")),
    `import {\n  ${order.join(",\n  ")},\n} from "@/components/ai/prompt-input"`,
    ...imports.filter((line) => line.includes("prompt-input-")),
    ...imports.filter((line) => !line.includes("@/components/ai/")),
  ]
  if (icons.length) head.push(`import { ${[...new Set(icons)].sort().join(", ")} } from "@/lib/icons"`)

  return `${[...new Set(head)].join("\n")}\n\n${render(root)}`
}

/* ---------- Preview ---------- */

function Composer({ c, status }: { c: Config; status: ChatStatus }) {
  const options = c.options === "off" ? [] : chips(c)
  const chipEls = options.map((k) => (
    <PromptInputOption key={k} icon={optionMeta[k].node} defaultPressed={k === "web"}>
      {optionMeta[k].label}
    </PromptInputOption>
  ))
  const input = (
    <PromptInput status={status} submitOn={c.submitOn} onSubmit={() => {}}>
      {c.mentions && <PromptInputMentions items={mentionItems} />}
      {c.attach && <PromptInputAttachments />}
      <PromptInputTextarea placeholder={c.placeholder} />
      <PromptInputToolbar>
        <PromptInputTools>
          {c.attach && <PromptInputAttachButton />}
          {c.options === "toolbar" && chipEls}
        </PromptInputTools>
        <div className="flex items-center gap-1">
          {c.context && <ContextMeter used={128_000} max={200_000} showLabel={false} />}
          {c.model && <ModelPicker models={models} defaultValue="sonnet" />}
          {c.mic && <PromptInputMic />}
          {c.voice && (
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Start voice mode">
              <VoiceOrb variant="dot" size={18} />
            </Button>
          )}
          <PromptInputSubmit {...submitProps(c)} />
        </div>
      </PromptInputToolbar>
    </PromptInput>
  )
  const composer = framed(c) ? (
    <PromptInputFrame>
      {c.header && <PromptInputHeader icon={<InfoIcon />}>{c.headerText}</PromptInputHeader>}
      {input}
      {c.options === "footer" && options.length > 0 && <PromptInputFooter>{chipEls}</PromptInputFooter>}
    </PromptInputFrame>
  ) : (
    input
  )
  if (c.suggestions === "off") return composer
  const list = (
    <Suggestions>
      {suggestionList.map((s) => (
        <Suggestion key={s} suggestion={s} />
      ))}
    </Suggestions>
  )
  return (
    <div className="flex w-full flex-col gap-3">
      {c.suggestions === "above" && list}
      {composer}
      {c.suggestions === "below" && list}
    </div>
  )
}

/** The composer where it usually lives: a new-chat page, under a conversation, or in a side panel. */
function SurfacePreview({ c, status, surface }: { c: Config; status: ChatStatus; surface: Surface }) {
  if (surface === "page")
    return (
      <div className="m-auto flex w-full max-w-2xl flex-col items-center gap-6">
        <h2 className="text-2xl font-semibold tracking-tight">What can I help with?</h2>
        <Composer c={c} status={status} />
      </div>
    )
  const thread = (
    <div className="flex min-h-0 flex-1 flex-col justify-end gap-4 overflow-hidden p-4">
      <Message from="user">
        <MessageContent>Which orders are overdue?</MessageContent>
      </Message>
      <Message from="assistant">
        <MessageContent>Three orders are more than a week late: #4817, #4802 and #4795.</MessageContent>
      </Message>
    </div>
  )
  if (surface === "docked")
    return (
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
        {thread}
        <div className="p-4 pt-0">
          <Composer c={c} status={status} />
        </div>
      </div>
    )
  return (
    <div className="m-auto flex h-full max-h-140 w-96 max-w-full flex-col overflow-hidden rounded-2xl border bg-card shadow-lg">
      <div className="border-b px-4 py-3 text-sm font-medium">Agent</div>
      {thread}
      <div className="border-t p-3">
        <Composer c={c} status={status} />
      </div>
    </div>
  )
}

export function PromptInputBuilder() {
  const [c, setC] = React.useState<Config>(defaults)
  const [status, setStatus] = React.useState<ChatStatus>("ready")
  const [surface, setSurface] = React.useState<Surface>("page")
  const set =
    <K extends keyof Config>(key: K) =>
    (value: Config[K]) =>
      setC((prev) => ({ ...prev, [key]: value }))
  const code = generateCode(c)

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-5 overflow-y-auto border-b p-5 lg:h-[calc(100svh-3.5rem)] lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold">Prompt input</h1>
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
        <ControlGroup title="Frame">
          <Text label="Placeholder" value={c.placeholder} onChange={set("placeholder")} />
          <Toggle label="Context header" checked={c.header} onChange={set("header")} />
          {c.header && <Text label="Header text" value={c.headerText} onChange={set("headerText")} />}
          <Segmented
            label="Suggestions"
            value={c.suggestions}
            onChange={set("suggestions")}
            options={[
              { value: "above", label: "Above" },
              { value: "below", label: "Below" },
              { value: "off", label: "Off" },
            ]}
          />
        </ControlGroup>
        <ControlGroup title="Options">
          <Segmented
            label="Placement"
            value={c.options}
            onChange={set("options")}
            options={[
              { value: "footer", label: "Footer" },
              { value: "toolbar", label: "Toolbar" },
              { value: "off", label: "Off" },
            ]}
          />
          {c.options !== "off" && (
            <>
              <Toggle label="Web search" checked={c.web} onChange={set("web")} />
              <Toggle label="Deep research" checked={c.research} onChange={set("research")} />
              <Toggle label="Think" checked={c.think} onChange={set("think")} />
            </>
          )}
        </ControlGroup>
        <ControlGroup title="Tools">
          <Toggle label="Attachments" checked={c.attach} onChange={set("attach")} />
          <Toggle label="@ mentions" checked={c.mentions} onChange={set("mentions")} />
          <Toggle label="Model picker" checked={c.model} onChange={set("model")} />
          <Toggle label="Context meter" checked={c.context} onChange={set("context")} />
          <Toggle label="Dictation" checked={c.mic} onChange={set("mic")} />
          <Toggle label="Voice mode" checked={c.voice} onChange={set("voice")} />
        </ControlGroup>
        <ControlGroup title="Send">
          <Segmented
            label="Shape"
            value={c.submitShape}
            onChange={set("submitShape")}
            options={[
              { value: "round", label: "Round" },
              { value: "square", label: "Square" },
            ]}
          />
          <Segmented
            label="Style"
            value={c.submitStyle}
            onChange={set("submitStyle")}
            options={[
              { value: "filled", label: "Filled" },
              { value: "outline", label: "Outline" },
            ]}
          />
          <Segmented
            label="Send with"
            value={c.submitOn}
            onChange={set("submitOn")}
            options={[
              { value: "enter", label: "Enter" },
              { value: "mod-enter", label: "⌘ Enter" },
            ]}
          />
        </ControlGroup>
      </aside>

      <Tabs defaultValue="preview" className="min-w-0 gap-0 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="preview">
          <div className="flex h-160 flex-col overflow-hidden rounded-2xl border bg-background">
            <div className="flex justify-center border-b p-3">
              <ToggleGroup
                value={[surface]}
                onValueChange={(v) => v[0] && setSurface(v[0] as Surface)}
                variant="outline"
                size="sm"
                aria-label="Preview surface"
              >
                <ToggleGroupItem value="page">New chat</ToggleGroupItem>
                <ToggleGroupItem value="docked">Conversation</ToggleGroupItem>
                <ToggleGroupItem value="panel">Side panel</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className={cn("flex min-h-0 flex-1 overflow-auto", surface !== "docked" && "p-6")}>
              <SurfacePreview c={c} status={status} surface={surface} />
            </div>
            <div className="flex flex-col items-center gap-3 border-t p-4">
              <p className="text-xs text-muted-foreground">
                {c.submitOn === "mod-enter" ? "⌘/Ctrl+Enter sends, Enter adds a line." : "Enter sends, Shift+Enter adds a line."}
              </p>
              <ToggleGroup
                value={[status]}
                onValueChange={(v) => v[0] && setStatus(v[0] as ChatStatus)}
                variant="outline"
                size="sm"
                aria-label="Chat status"
              >
                {statuses.map((s) => (
                  <ToggleGroupItem key={s.value} value={s.value}>
                    {s.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="code">
          <div className="relative overflow-hidden rounded-2xl border bg-card">
            <CopyButton value={code} className="absolute top-3 right-3" />
            <pre className="max-h-160 overflow-auto p-5 font-mono text-xs leading-relaxed">{code}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Install with <code className="font-mono">npx shadcn@latest add @jds/prompt-input</code> plus each add-on you
            use. <code className="font-mono">status</code>, <code className="font-mono">sendMessage</code> and{" "}
            <code className="font-mono">stop</code> come from the AI SDK&apos;s <code className="font-mono">useChat</code>.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
