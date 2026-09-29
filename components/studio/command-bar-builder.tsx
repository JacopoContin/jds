"use client"

import * as React from "react"
import { cn } from "cn"

import {
  CommandBar,
  CommandBarAnswer,
  CommandBarAsk,
  CommandBarFooter,
  CommandBarInput,
  CommandBarList,
} from "@/components/ai/command-bar"
import { Response } from "@/components/ai/response"
import { ControlGroup, Segmented, Text, Toggle } from "@/components/studio/controls"
import { render, type Node } from "@/components/studio/jsx"
import { installFromCode, studioMarkdown } from "@/components/studio/markdown"
import { StudioCode } from "@/components/studio/studio-code"
import { Button } from "@/components/ui/button"
import { CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command"
import { Kbd } from "@/components/ui/kbd"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AddIcon,
  ChartIcon,
  FileIcon,
  SettingsIcon,
  SparkleIcon,
} from "@/lib/icons"

type Config = {
  ask: "first" | "last" | "off"
  askLabel: string
  placeholder: string
  suggestions: boolean
  actions: boolean
  navigation: boolean
  icons: boolean
  shortcuts: boolean
  footer: boolean
  copy: boolean
  continueInChat: boolean
  presentation: "dialog" | "inline"
  width: "md" | "lg" | "xl"
}

const defaults: Config = {
  ask: "first",
  askLabel: "Ask AI",
  placeholder: "Search or ask anything…",
  suggestions: true,
  actions: true,
  navigation: false,
  icons: true,
  shortcuts: true,
  footer: true,
  copy: true,
  continueInChat: true,
  presentation: "dialog",
  width: "lg",
}

/** Common command bars to start from. */
const presets: { name: string; body: string; config: Partial<Config> }[] = [
  { name: "Ask first", body: "Enter asks the agent", config: {} },
  { name: "Search first", body: "Enter runs the best command", config: { ask: "last", navigation: true } },
  {
    name: "Assistant",
    body: "Named agent, suggestions only",
    config: { askLabel: "Ask Aria", placeholder: "Ask Aria anything…", actions: false, shortcuts: false },
  },
  {
    name: "Launcher",
    body: "Commands only, no AI",
    config: { ask: "off", suggestions: false, navigation: true, placeholder: "Search commands…" },
  },
]

const widths = { md: "sm:max-w-lg", lg: "sm:max-w-xl", xl: "sm:max-w-2xl" }

const groups = {
  suggestions: {
    heading: "Suggestions",
    items: [
      { label: "Summarize this page", icon: "SparkleIcon", node: <SparkleIcon /> },
      { label: "Draft a reply to the latest email", icon: "SparkleIcon", node: <SparkleIcon /> },
    ],
  },
  actions: {
    heading: "Actions",
    items: [
      { label: "New invoice", icon: "AddIcon", node: <AddIcon />, shortcut: "⌘N" },
      { label: "Open revenue report", icon: "ChartIcon", node: <ChartIcon /> },
    ],
  },
  navigation: {
    heading: "Go to",
    items: [
      { label: "Orders", icon: "FileIcon", node: <FileIcon />, shortcut: "G O" },
      { label: "Settings", icon: "SettingsIcon", node: <SettingsIcon />, shortcut: "⌘," },
    ],
  },
} as const

type GroupKey = keyof typeof groups
const shownGroups = (c: Config) => (["suggestions", "actions", "navigation"] as GroupKey[]).filter((g) => c[g])

const ANSWER =
  "Revenue is **€48.2k** this month, up 12% on last month. Most of the growth came from annual plans; monthly churn is flat."

/* ---------- Code generation ---------- */

function generateCode(c: Config) {
  const icons = new Set<string>()
  const parts = new Set(["CommandBar", "CommandBarInput", "CommandBarList"])
  const list: Node[] = []
  const askRow: Node = c.askLabel !== "Ask AI" ? { tag: "CommandBarAsk", props: [`label="${c.askLabel}"`] } : "<CommandBarAsk />"
  if (c.ask !== "off") parts.add("CommandBarAsk")
  // Groups keep the order they're written in: the ask row first makes Enter ask, last makes Enter run a command.
  if (c.ask === "first") list.push(askRow)
  for (const key of shownGroups(c)) {
    const g = groups[key]
    list.push({
      tag: "CommandGroup",
      props: [`heading="${g.heading}"`],
      children: g.items.map((item) => {
        const children: Node[] = []
        if (c.icons) {
          icons.add(item.icon)
          children.push(`<${item.icon} />`)
        }
        children.push(item.label)
        if (c.shortcuts && "shortcut" in item) children.push(`<CommandShortcut>${item.shortcut}</CommandShortcut>`)
        return { tag: "CommandItem", props: [`onSelect={run}`], children }
      }),
    })
  }
  if (c.ask === "last") list.push(askRow)
  const body: Node[] = [
    c.placeholder === defaults.placeholder ? "<CommandBarInput />" : `<CommandBarInput placeholder="${c.placeholder}" />`,
    { tag: "CommandBarList", children: list },
  ]
  if (c.ask !== "off") {
    parts.add("CommandBarAnswer")
    const actions: string[] = []
    if (c.copy) actions.push('<Button size="sm" variant="outline" onClick={copy}>Copy</Button>')
    if (c.continueInChat) actions.push('<Button size="sm" variant="outline" onClick={openChat}>Continue in chat</Button>')
    body.push({
      tag: "CommandBarAnswer",
      props: actions.length ? [`actions={<>${actions.join("")}</>}`] : [],
      children: ["<Response>{answer}</Response>"],
    })
  }
  if (c.footer) {
    parts.add("CommandBarFooter")
    body.push("<CommandBarFooter />")
  }
  const barProps = c.ask !== "off" ? ["onAsk={(question) => sendMessage({ text: question })}"] : []
  if (c.presentation === "inline" && c.width !== "lg") barProps.push(`className="${widths[c.width].replace("sm:", "")}"`)
  let tree: Node = { tag: "CommandBar", props: barProps, children: body }
  if (c.presentation === "dialog") {
    parts.add("CommandBarDialog")
    tree = { tag: "CommandBarDialog", props: c.width !== "lg" ? [`className="${widths[c.width]}"`] : [], children: [tree] }
  }

  const order = [
    "CommandBar",
    "CommandBarAnswer",
    "CommandBarAsk",
    "CommandBarDialog",
    "CommandBarFooter",
    "CommandBarInput",
    "CommandBarList",
  ].filter((p) => parts.has(p))
  const head = [`import {\n  ${order.join(",\n  ")},\n} from "@/components/ai/command-bar"`]
  if (c.ask !== "off") head.push('import { Response } from "@/components/ai/response"')
  if (c.ask !== "off" && (c.copy || c.continueInChat)) head.push('import { Button } from "@/components/ui/button"')
  head.push(
    `import { CommandGroup, CommandItem${c.shortcuts ? ", CommandShortcut" : ""} } from "@/components/ui/command"`,
  )
  if (icons.size) head.push(`import { ${[...icons].sort().join(", ")} } from "@/lib/icons"`)
  return `${head.join("\n")}\n\n${render(tree)}`
}

function generateMarkdown(c: Config) {
  const code = generateCode(c)
  return studioMarkdown({
    title: "Command bar",
    intro: "A ⌘K command bar with these settings. It applies to this bar only.",
    choices: [
      [
        "Ask the agent",
        c.ask === "off"
          ? "off, commands only"
          : `"${c.askLabel}" row, ${c.ask === "first" ? "first, so Enter asks" : "last, so Enter runs the best command"}`,
      ],
      ["Placeholder", `"${c.placeholder}"`],
      ["Groups", shownGroups(c).map((g) => groups[g].heading).join(", ") || "none"],
      ["Icons", c.icons ? "on" : "off"],
      ["Shortcuts", c.shortcuts ? "on" : "off"],
      ["Keyboard hints footer", c.footer ? "on" : "off"],
      ...(c.ask !== "off"
        ? ([["Answer actions", [c.copy && "copy", c.continueInChat && "continue in chat"].filter(Boolean).join(", ") || "none"]] as [string, string][])
        : []),
      ["Presentation", c.presentation === "dialog" ? "dialog, opens with ⌘K / Ctrl+K" : "inline"],
      ["Width", { md: "medium", lg: "large", xl: "extra large" }[c.width]],
    ],
    install: installFromCode(code),
    placement: [
      c.presentation === "dialog"
        ? "Render it once near the root of the app; CommandBarDialog listens for ⌘K / Ctrl+K itself."
        : "Render it where the bar should sit, e.g. at the top of a dashboard.",
      "Replace the sample groups with your commands; each CommandItem's onSelect runs the command.",
      ...(c.ask !== "off"
        ? ["Wire onAsk to your agent (for example useChat's sendMessage) and stream the reply into CommandBarAnswer as answer."]
        : []),
    ],
    code,
  })
}

/* ---------- Preview ---------- */

function useFakeAnswer() {
  const [text, setText] = React.useState("")
  const run = React.useRef(0)
  const start = async () => {
    const id = ++run.current
    setText("")
    let out = ""
    for (const w of ANSWER.split(/(\s+)/)) {
      await new Promise((r) => setTimeout(r, 25))
      if (run.current !== id) return
      out += w
      setText(out)
    }
  }
  const cancel = () => {
    run.current++
    setText("")
  }
  return { text, start, cancel }
}

function Bar({ c }: { c: Config }) {
  const answer = useFakeAnswer()
  return (
    <CommandBar
      className={cn(
        "w-full",
        c.width === "md" && "max-w-lg",
        c.width === "lg" && "max-w-xl",
        c.width === "xl" && "max-w-2xl",
      )}
      onAsk={c.ask !== "off" ? answer.start : undefined}
      onBack={answer.cancel}
    >
      <CommandBarInput placeholder={c.placeholder} />
      <CommandBarList>
        {c.ask === "first" && <CommandBarAsk label={c.askLabel} />}
        {shownGroups(c).map((key) => (
          <CommandGroup key={key} heading={groups[key].heading}>
            {groups[key].items.map((item) => (
              <CommandItem key={item.label}>
                {c.icons && item.node}
                {item.label}
                {c.shortcuts && "shortcut" in item && <CommandShortcut>{item.shortcut}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        {c.ask === "last" && <CommandBarAsk label={c.askLabel} />}
      </CommandBarList>
      {c.ask !== "off" && (
        <CommandBarAnswer
          actions={
            (c.copy || c.continueInChat) && (
              <>
                {c.copy && (
                  <Button size="sm" variant="outline">
                    Copy
                  </Button>
                )}
                {c.continueInChat && (
                  <Button size="sm" variant="outline">
                    Continue in chat
                  </Button>
                )}
              </>
            )
          }
        >
          <Response isAnimating={answer.text.length < ANSWER.length}>{answer.text}</Response>
        </CommandBarAnswer>
      )}
      {c.footer && <CommandBarFooter />}
    </CommandBar>
  )
}

export function CommandBarBuilder() {
  const [c, setC] = React.useState<Config>(defaults)
  const set =
    <K extends keyof Config>(key: K) =>
    (value: Config[K]) =>
      setC((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-5 overflow-y-auto border-b p-5 lg:h-[calc(100svh-3.5rem-1px)] lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold">Command bar</h1>
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
        <ControlGroup title="Asking the agent">
          <Segmented
            label="Ask row"
            value={c.ask}
            onChange={set("ask")}
            options={[
              { value: "first", label: "First" },
              { value: "last", label: "Last" },
              { value: "off", label: "Off" },
            ]}
          />
          {c.ask !== "off" && (
            <>
              <p className="text-xs text-muted-foreground">
                {c.ask === "first" ? "Enter asks the agent." : "Enter runs the best-matching command."}
              </p>
              <Text label="Ask label" value={c.askLabel} onChange={set("askLabel")} />
              <Toggle label="Copy answer" checked={c.copy} onChange={set("copy")} />
              <Toggle label="Continue in chat" checked={c.continueInChat} onChange={set("continueInChat")} />
            </>
          )}
        </ControlGroup>
        <ControlGroup title="Commands">
          <Text label="Placeholder" value={c.placeholder} onChange={set("placeholder")} />
          <Toggle label="Suggestions" checked={c.suggestions} onChange={set("suggestions")} />
          <Toggle label="Actions" checked={c.actions} onChange={set("actions")} />
          <Toggle label="Navigation" checked={c.navigation} onChange={set("navigation")} />
          <Toggle label="Icons" checked={c.icons} onChange={set("icons")} />
          <Toggle label="Shortcuts" checked={c.shortcuts} onChange={set("shortcuts")} />
          <Toggle label="Keyboard hints" checked={c.footer} onChange={set("footer")} />
        </ControlGroup>
        <ControlGroup title="Presentation">
          <Segmented
            label="Show as"
            value={c.presentation}
            onChange={set("presentation")}
            options={[
              { value: "dialog", label: "⌘K dialog" },
              { value: "inline", label: "Inline" },
            ]}
          />
          <Segmented
            label="Width"
            value={c.width}
            onChange={set("width")}
            options={[
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
              { value: "xl", label: "Extra large" },
            ]}
          />
        </ControlGroup>
      </aside>

      <Tabs defaultValue="preview" className="min-w-0 gap-0 p-5 lg:h-[calc(100svh-3.5rem-1px)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <span className="text-xs text-muted-foreground">
            Type to filter, or ask a question and press <Kbd>↵</Kbd>
          </span>
        </div>
        <TabsContent value="preview" className="flex min-h-0 flex-col">
          <div className="relative flex h-160 flex-col overflow-hidden rounded-2xl border bg-background lg:h-auto lg:min-h-0 lg:flex-1">
            {/* Stand-in app behind the bar; dimmed when it shows as a dialog. */}
            <div className="flex flex-col gap-4 p-6">
              <Skeleton className="h-6 w-40" />
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            </div>
            <div
              className={cn(
                "absolute inset-0 flex justify-center px-6 pt-[12%]",
                c.presentation === "dialog" && "bg-background/60 backdrop-blur-sm",
              )}
            >
              {/* Keyed so switching presets starts from a clean bar. */}
              <div key={JSON.stringify(c)} className="flex w-full items-start justify-center">
                <Bar c={c} />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="code" className="min-h-0 overflow-y-auto">
          <StudioCode
            markdown={() => generateMarkdown(c)}
            scopes={[
              {
                value: "instance",
                label: "This command bar",
                code: generateCode(c),
                note: "Configures this bar only. Replace the sample groups with your commands, and wire onAsk to your agent.",
              },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
