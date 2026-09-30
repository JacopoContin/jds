"use client"

import * as React from "react"
import { cn } from "cn"

import {
  CommandBar,
  CommandBarAsk,
  CommandBarFooter,
  CommandBarInput,
  CommandBarList,
} from "@/components/ai/command-bar"
import { MessageStyleProvider, type MessageStyle } from "@/components/ai/message"
import { ModelPicker, type Model } from "@/components/ai/model-picker"
import {
  PromptInput,
  PromptInputAttachButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  type ChatStatus,
} from "@/components/ai/prompt-input"
import { PromptInputMic } from "@/components/ai/prompt-input-mic"
import { PromptInputOptionMenu } from "@/components/ai/prompt-input-option-menu"
import { AgentPanelVoiceButton } from "@/components/ai/agent-panel"
import { bases, baseSwatch, orbs, primaries, primarySwatch, radii, Swatches } from "@/components/docs/color-picker"
import { useSiteSettings } from "@/components/docs/site-settings"
import { useThemeState } from "@/components/docs/theme-state"
import { ControlGroup, Segmented, Toggle } from "@/components/studio/controls"
import { render, type Node } from "@/components/studio/jsx"
import { studioMarkdown } from "@/components/studio/markdown"
import { StudioCode } from "@/components/studio/studio-code"
import { Button } from "@/components/ui/button"
import { CommandGroup, CommandItem } from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { VoiceOrbVariant } from "@/components/voice/voice-orb"
import { AddIcon, ChartIcon, ReasoningIcon, ResearchIcon, SparkleIcon, WebSearchIcon } from "@/lib/icons"
import { fontSnippet, isDefaultTheme, themeUrl, type ThemeChoice } from "@/lib/theme"
import ChatApp from "@/recipes/chat-app/chat-app"
import { AgentSidePanel } from "@/recipes/agent-side-panel/agent-side-panel"
import { useSimulatedPanel } from "@/recipes/agent-side-panel/session"
import { useSimulatedVoiceAgent } from "@/recipes/voice-agent/session"
import { VoiceAgent } from "@/recipes/voice-agent/voice-agent"

type Surface = "chat" | "panel" | "voice"

type Config = {
  surface: Surface
  // Parts
  attach: boolean
  mic: boolean
  model: boolean
  tools: boolean
  bubbles: NonNullable<MessageStyle["bubbles"]>
  density: NonNullable<MessageStyle["density"]>
  panelVariant: "docked" | "floating"
  panelSurface: "card" | "glass"
  voiceLayout: "split" | "focus"
  captions: "line" | "transcript" | "off"
  backdrop: "none" | "glow"
  // Behaviour
  voice: boolean
  commandBar: boolean
}

const defaults: Config = {
  surface: "panel",
  attach: true,
  mic: true,
  model: false,
  tools: false,
  bubbles: "user",
  density: "comfortable",
  panelVariant: "floating",
  panelSurface: "card",
  voiceLayout: "focus",
  captions: "transcript",
  backdrop: "glow",
  voice: true,
  commandBar: true,
}

const surfaces: { value: Surface; title: string; body: string; recipe: string }[] = [
  { value: "chat", title: "Chat app", body: "A full-page chat with conversations and a composer.", recipe: "chat-app" },
  { value: "panel", title: "Side panel copilot", body: "An agent panel over your existing app.", recipe: "agent-side-panel" },
  { value: "voice", title: "Voice agent", body: "A call screen with the orb, captions and controls.", recipe: "voice-agent" },
]

const models: Model[] = [
  { id: "sonnet", name: "Claude Sonnet 5.5", description: "Everyday tasks" },
  { id: "opus", name: "Claude Opus 5.5", description: "Hardest problems" },
]

const toolOptions = [
  { id: "web", label: "Web search", icon: <WebSearchIcon /> },
  { id: "research", label: "Deep research", icon: <ResearchIcon /> },
  { id: "think", label: "Think", icon: <ReasoningIcon /> },
]

const usesComposer = (c: Config) => c.surface !== "voice"
const usesConversation = (c: Config) => c.surface !== "voice"

/* ---------- Code generation ---------- */

function composerNode(c: Config): Node {
  const tools: Node[] = []
  if (c.attach) tools.push("<PromptInputAttachButton />")
  if (c.tools) tools.push("<PromptInputOptionMenu options={tools} value={enabled} onValueChange={setEnabled} />")
  const actions: Node[] = []
  if (c.model) actions.push("<ModelPicker models={models} value={model} onValueChange={setModel} />")
  if (c.mic) actions.push("<PromptInputMic />")
  if (c.surface === "panel" && c.voice) actions.push("<AgentPanelVoiceButton />")
  actions.push("<PromptInputSubmit onStop={stop} />")
  return {
    tag: "PromptInput",
    props: ["status={status}", "onSubmit={({ text, files }) => sendMessage({ text, files })}"],
    children: [
      "<PromptInputTextarea />",
      {
        tag: "PromptInputToolbar",
        children: [
          tools.length ? { tag: "PromptInputTools", children: tools } : "<PromptInputTools />",
          actions.length > 1 ? { tag: "div", props: ['className="flex min-w-0 items-center gap-1"'], children: actions } : actions[0],
        ],
      },
    ],
  }
}

/** The composer as a render prop, indented to sit inside a recipe's props. */
function composerProp(c: Config, depth: number) {
  const body = render(composerNode(c), depth + 1)
  const pad = "  ".repeat(depth)
  return `composer={({ status, sendMessage, stop }) => (\n${body}\n${pad})}`
}

function pageCode(c: Config) {
  if (c.surface === "voice") {
    const props = ["session={session}"]
    if (c.voiceLayout !== "split") props.push(`layout="${c.voiceLayout}"`)
    if (c.captions !== "line") props.push(`captions="${c.captions}"`)
    if (c.backdrop !== "none") props.push(`backdrop="${c.backdrop}"`)
    return `// app/voice/page.tsx
"use client"

import { useSimulatedVoiceAgent } from "@/components/voice-agent/session"
import { VoiceAgent } from "@/components/voice-agent/voice-agent"

export default function VoicePage() {
  // Swap for a hook that returns a VoiceAgentSession from your realtime provider.
  const session = useSimulatedVoiceAgent()
  return (
${render({ tag: "VoiceAgent", props: [...props, 'className="h-svh rounded-none border-0"'] }, 2)}
  )
}`
  }
  if (c.surface === "chat") {
    return `// app/chat/page.tsx
"use client"

import ChatApp from "@/components/chat-app/chat-app"
${composerImports(c)}

export default function ChatPage() {
  return (
    <ChatApp
      ${composerProp(c, 3)}
    />
  )
}`
  }
  const panel: string[] = []
  if (c.panelVariant !== "docked") panel.push(`variant: "${c.panelVariant}"`)
  if (c.panelSurface !== "card") panel.push(`surface: "${c.panelSurface}"`)
  return `// app/(app)/layout.tsx: the panel sits over every page of your app
"use client"

import * as React from "react"
import { AgentSidePanel } from "@/components/agent-side-panel/agent-side-panel"
import { useSimulatedPanel } from "@/components/agent-side-panel/session"
${composerImports(c)}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  // Swap for chat from useChat${c.voice ? " and voice from your realtime provider" : ""}.
  const ${c.voice ? "session" : "{ chat }"} = useSimulatedPanel()
  return (
    <>
      {children}
      <AgentSidePanel
        session={${c.voice ? "session" : "{ chat }"}}
        open={open}
        onOpenChange={setOpen}${panel.length ? `\n        panel={{ ${panel.join(", ")} }}` : ""}
        ${composerProp(c, 4)}
      />
    </>
  )
}`
}

/** An import line, wrapped one name per line past 100 columns, the way Prettier would. */
function importLine(names: string[], from: string) {
  const line = `import { ${names.join(", ")} } from "${from}"`
  return line.length <= 100 ? line : `import {\n  ${names.join(",\n  ")},\n} from "${from}"`
}

function composerImports(c: Config) {
  const parts = ["PromptInput", "PromptInputSubmit", "PromptInputTextarea", "PromptInputToolbar", "PromptInputTools"]
  if (c.attach) parts.push("PromptInputAttachButton")
  const lines = [importLine(parts.sort(), "@/components/ai/prompt-input")]
  if (c.mic) lines.push('import { PromptInputMic } from "@/components/ai/prompt-input-mic"')
  if (c.tools) lines.push('import { PromptInputOptionMenu } from "@/components/ai/prompt-input-option-menu"')
  if (c.model) lines.push('import { ModelPicker } from "@/components/ai/model-picker"')
  if (c.surface === "panel" && c.voice) lines.push('import { AgentPanelVoiceButton } from "@/components/ai/agent-panel"')
  return lines.join("\n")
}

function layoutCode(c: Config, t: ThemeChoice) {
  const font = fontSnippet(t)
  const style: string[] = []
  if (usesConversation(c)) {
    if (c.bubbles !== "user") style.push(`bubbles="${c.bubbles}"`)
    if (c.density !== "comfortable") style.push(`density="${c.density}"`)
  }
  let inner = "{children}"
  if (c.commandBar && c.surface !== "voice") inner += "\n<AppCommandBar />"
  if (style.length) inner = `<MessageStyleProvider ${style.join(" ")}>\n  ${inner.replace("\n", "\n  ")}\n</MessageStyleProvider>`
  inner = `<VoiceOrbProvider variant="${t.orb}">\n  ${inner.replace(/\n/g, "\n  ")}\n</VoiceOrbProvider>`
  const imports = ['import { VoiceOrbProvider } from "@/components/voice/voice-orb"']
  if (style.length) imports.push('import { MessageStyleProvider } from "@/components/ai/message"')
  if (c.commandBar && c.surface !== "voice") imports.push('import { AppCommandBar } from "@/components/app-command-bar"')
  // Imports first, then the font loader, as the file would be written.
  const [fontImport, fontLoader] = font ? font.split("\n\n") : []
  if (fontImport) imports.unshift(fontImport)
  return `// app/layout.tsx
${imports.join("\n")}
${fontLoader ? `\n${fontLoader}\n` : ""}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"${font ? " className={sans.variable}" : ""}>
      <body>
        ${inner.replace(/\n/g, "\n        ")}
      </body>
    </html>
  )
}`
}

const commandBarCode = `// components/app-command-bar.tsx: ⌘K anywhere to run a command or ask the agent
"use client"

import {
  CommandBar,
  CommandBarAsk,
  CommandBarDialog,
  CommandBarFooter,
  CommandBarInput,
  CommandBarList,
} from "@/components/ai/command-bar"
import { CommandGroup, CommandItem } from "@/components/ui/command"

export function AppCommandBar() {
  return (
    <CommandBarDialog>
      <CommandBar onAsk={(question) => openAgentWith(question)}>
        <CommandBarInput />
        <CommandBarList>
          <CommandBarAsk />
          <CommandGroup heading="Actions">
            <CommandItem onSelect={newInvoice}>New invoice</CommandItem>
          </CommandGroup>
        </CommandBarList>
        <CommandBarFooter />
      </CommandBar>
    </CommandBarDialog>
  )
}`

function installCommand(c: Config, t: ThemeChoice) {
  const items = [surfaces.find((s) => s.value === c.surface)!.recipe]
  if (usesComposer(c)) {
    items.push("prompt-input")
    if (c.mic) items.push("prompt-input-mic")
    if (c.tools) items.push("prompt-input-option-menu")
    if (c.model) items.push("model-picker")
  }
  if (c.commandBar && c.surface !== "voice") items.push("command-bar")
  const theme = isDefaultTheme(t) ? "@jds/style" : `"${themeUrl(t)}"`
  return `npx shadcn@latest add ${theme} ${items.map((i) => `@jds/${i}`).join(" ")}`
}

function generateCode(c: Config, t: ThemeChoice) {
  const parts = [`# Install\n${installCommand(c, t)}`, layoutCode(c, t), pageCode(c)]
  if (c.commandBar && c.surface !== "voice") parts.push(commandBarCode)
  return parts.join("\n\n")
}

function generateMarkdown(c: Config, t: ThemeChoice) {
  const surface = surfaces.find((s) => s.value === c.surface)!
  const choices: [string, string][] = [
    ["Surface", `${surface.title}: ${surface.body}`],
    ["Theme", `primary ${t.color}, base ${t.base}, radius ${t.radius}rem, font ${t.font}, ${t.orb} orb`],
  ]
  if (usesComposer(c))
    choices.push([
      "Composer",
      [c.attach && "attachments", c.tools && "tools menu", c.model && "model picker", c.mic && "dictation"].filter(Boolean).join(", ") ||
        "text only",
    ])
  if (usesConversation(c)) choices.push(["Messages", `bubbles: ${c.bubbles}, density: ${c.density}`])
  if (c.surface === "panel") choices.push(["Panel", `${c.panelVariant}, ${c.panelSurface} surface`], ["Voice mode", c.voice ? "on" : "off"])
  if (c.surface === "voice") choices.push(["Call screen", `${c.voiceLayout} layout, ${c.captions} captions, ${c.backdrop} backdrop`])
  if (c.surface !== "voice") choices.push(["⌘K command bar", c.commandBar ? "on" : "off"])
  return studioMarkdown({
    title: `${surface.title} with JDS`,
    intro: "A complete agent experience assembled from JDS: the theme, the providers in the root layout, and the page.",
    choices,
    install: installCommand(c, t),
    placement: [
      "Run the install once: it adds the theme and every component and recipe below.",
      "Put the providers in the root layout so the theme, orb and message style apply everywhere.",
      c.surface === "panel"
        ? "Put the panel in the layout that wraps your app's pages, with a header button that opens it."
        : "Add the page at its route.",
      "Swap the simulated session for your backend: useChat for chat, your realtime provider for voice.",
    ],
    code: generateCode(c, t),
  })
}

/* ---------- Preview ---------- */

function Composer({ c, status, sendMessage, stop }: { c: Config; status: ChatStatus; sendMessage: (m: { text: string }) => void; stop: () => void }) {
  return (
    <PromptInput status={status} onSubmit={({ text }) => sendMessage({ text })}>
      <PromptInputTextarea />
      <PromptInputToolbar>
        <PromptInputTools>
          {c.attach && <PromptInputAttachButton />}
          {c.tools && <PromptInputOptionMenu options={toolOptions} defaultValue={["web"]} />}
        </PromptInputTools>
        <div className="flex min-w-0 items-center gap-1">
          {c.model && <ModelPicker models={models} defaultValue="sonnet" />}
          {c.mic && <PromptInputMic />}
          {c.surface === "panel" && c.voice && <AgentPanelVoiceButton />}
          <PromptInputSubmit onStop={stop} />
        </div>
      </PromptInputToolbar>
    </PromptInput>
  )
}

function CommandOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex justify-center bg-background/60 px-6 pt-[10%] backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <CommandBar onKeyDown={(e) => e.key === "Escape" && onClose()}>
          <CommandBarInput autoFocus />
          <CommandBarList>
            <CommandBarAsk />
            <CommandGroup heading="Actions">
              <CommandItem>
                <SparkleIcon />
                Summarize this page
              </CommandItem>
              <CommandItem>
                <AddIcon />
                New invoice
              </CommandItem>
              <CommandItem>
                <ChartIcon />
                Open revenue report
              </CommandItem>
            </CommandGroup>
          </CommandBarList>
          <CommandBarFooter />
        </CommandBar>
      </div>
    </div>
  )
}

function PanelSurface({ c }: { c: Config }) {
  const session = useSimulatedPanel()
  const [open, setOpen] = React.useState(true)
  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Orders</h3>
          <span className="text-sm text-muted-foreground">128</span>
          {!open && (
            <Button size="sm" className="ml-auto" onClick={() => setOpen(true)}>
              <SparkleIcon />
              Ask agent
            </Button>
          )}
        </div>
        <div className="flex flex-col divide-y rounded-xl border">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
      <AgentSidePanel
        session={c.voice ? session : { chat: session.chat }}
        open={open}
        onOpenChange={setOpen}
        panel={{ contained: true, variant: c.panelVariant, surface: c.panelSurface, width: 384 }}
        context="Orders · 128 rows"
        composer={(api) => <Composer c={c} {...api} />}
      />
    </>
  )
}

function VoiceSurface({ c }: { c: Config }) {
  const session = useSimulatedVoiceAgent()
  return (
    <VoiceAgent
      session={session}
      layout={c.voiceLayout}
      captions={c.captions}
      backdrop={c.backdrop}
      subtitle="Calendar and email assistant"
      className="h-full rounded-none border-0 md:h-full"
    />
  )
}

function AppPreview({ c }: { c: Config }) {
  const [command, setCommand] = React.useState(false)
  return (
    <MessageStyleProvider bubbles={c.bubbles} density={c.density}>
      {/* transform-gpu contains the panel's fixed positioning inside the preview. */}
      <div className="relative flex min-h-0 flex-1 transform-gpu overflow-hidden">
        {c.surface === "chat" && (
          <div className="flex min-h-0 flex-1 [&>div]:h-full [&>div]:rounded-none [&>div]:border-0">
            <ChatApp composer={(api) => <Composer c={c} {...api} />} />
          </div>
        )}
        {c.surface === "panel" && <PanelSurface c={c} />}
        {c.surface === "voice" && <VoiceSurface c={c} />}
        {c.commandBar && c.surface !== "voice" && !command && (
          <button
            type="button"
            onClick={() => setCommand(true)}
            className="absolute bottom-4 left-4 z-40 flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-md transition-colors hover:text-foreground"
          >
            <SparkleIcon className="size-3.5" />
            Search or ask
            <kbd className="font-mono">⌘K</kbd>
          </button>
        )}
        {command && <CommandOverlay onClose={() => setCommand(false)} />}
      </div>
    </MessageStyleProvider>
  )
}

/* ---------- Builder ---------- */

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <ControlGroup title={`${n}. ${title}`}>
      {children}
    </ControlGroup>
  )
}

export function ExperienceBuilder() {
  const [c, setC] = React.useState<Config>(defaults)
  const theme = useThemeState()
  const { orb, setOrb } = useSiteSettings()
  const choice: ThemeChoice = { ...theme.values, orb }
  const set =
    <K extends keyof Config>(key: K) =>
    (value: Config[K]) =>
      setC((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-5 overflow-y-auto border-b p-5 lg:h-[calc(100svh-3.5rem-1px)] lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold">Build an experience</h1>
          <Button variant="ghost" size="xs" onClick={() => setC(defaults)}>
            Reset
          </Button>
        </div>
        <Step n={1} title="What are you building?">
          <div className="flex flex-col gap-1.5" role="radiogroup">
            {surfaces.map((s) => (
              <button
                key={s.value}
                type="button"
                role="radio"
                aria-checked={c.surface === s.value}
                onClick={() => set("surface")(s.value)}
                className="flex flex-col gap-0.5 rounded-lg border bg-background px-3 py-2 text-left transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-checked:border-foreground/40 aria-checked:bg-accent"
              >
                <span className="text-sm font-medium">{s.title}</span>
                <span className="text-xs text-muted-foreground">{s.body}</span>
              </button>
            ))}
          </div>
        </Step>
        <Step n={2} title="Look">
          <div className="flex flex-col gap-2">
            <Label>Primary color</Label>
            <Swatches options={primaries} value={theme.values.color} swatch={primarySwatch} onChange={(v) => theme.set("color", v)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Base color</Label>
            <Swatches options={bases} value={theme.values.base} swatch={baseSwatch} onChange={(v) => theme.set("base", v)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Radius</Label>
            <ToggleGroup
              value={[theme.values.radius]}
              onValueChange={(v) => v[0] && theme.set("radius", v[0] as string)}
              variant="outline"
              size="sm"
            >
              {radii.map((r) => (
                <ToggleGroupItem key={r} value={r} aria-label={`Radius ${r}rem`}>
                  {r}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Voice orb</Label>
            <ToggleGroup
              value={[orb]}
              onValueChange={(v) => v[0] && setOrb(v[0] as VoiceOrbVariant)}
              variant="outline"
              size="sm"
              className="grid grid-cols-3"
            >
              {orbs.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value}>
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <p className="text-xs text-muted-foreground">Same theme as the header&apos;s Customize menu.</p>
        </Step>
        <Step n={3} title="Parts">
          {c.surface === "panel" && (
            <>
              <Segmented
                label="Panel"
                value={c.panelVariant}
                onChange={set("panelVariant")}
                options={[
                  { value: "docked", label: "Docked" },
                  { value: "floating", label: "Floating" },
                ]}
              />
              <Segmented
                label="Surface"
                value={c.panelSurface}
                onChange={set("panelSurface")}
                options={[
                  { value: "card", label: "Card" },
                  { value: "glass", label: "Glass" },
                ]}
              />
            </>
          )}
          {c.surface === "voice" && (
            <>
              <Segmented
                label="Layout"
                value={c.voiceLayout}
                onChange={set("voiceLayout")}
                options={[
                  { value: "split", label: "With activity" },
                  { value: "focus", label: "Call only" },
                ]}
              />
              <Segmented
                label="Captions"
                value={c.captions}
                onChange={set("captions")}
                options={[
                  { value: "line", label: "Line" },
                  { value: "transcript", label: "Transcript" },
                  { value: "off", label: "Off" },
                ]}
              />
              <Segmented
                label="Backdrop"
                value={c.backdrop}
                onChange={set("backdrop")}
                options={[
                  { value: "none", label: "None" },
                  { value: "glow", label: "Glow" },
                ]}
              />
            </>
          )}
          {usesConversation(c) && (
            <>
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
              <Segmented
                label="Density"
                value={c.density}
                onChange={set("density")}
                options={[
                  { value: "comfortable", label: "Comfortable" },
                  { value: "compact", label: "Compact" },
                ]}
              />
            </>
          )}
          {usesComposer(c) && (
            <>
              <Toggle label="Attachments" checked={c.attach} onChange={set("attach")} />
              <Toggle label="Tools menu" checked={c.tools} onChange={set("tools")} />
              <Toggle label="Model picker" checked={c.model} onChange={set("model")} />
              <Toggle label="Dictation" checked={c.mic} onChange={set("mic")} />
            </>
          )}
        </Step>
        {c.surface !== "voice" && (
          <Step n={4} title="Behaviour">
            {c.surface === "panel" && <Toggle label="Voice mode" checked={c.voice} onChange={set("voice")} />}
            <Toggle label="⌘K command bar" checked={c.commandBar} onChange={set("commandBar")} />
          </Step>
        )}
      </aside>

      <Tabs defaultValue="preview" className="min-w-0 gap-0 p-5 lg:h-[calc(100svh-3.5rem-1px)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Export</TabsTrigger>
          </TabsList>
          <span className="text-xs text-muted-foreground">Everything here is live: chat, open voice, try ⌘K.</span>
        </div>
        <TabsContent value="preview" className="flex min-h-0 flex-col">
          <div className="flex h-160 flex-col overflow-hidden rounded-2xl border bg-background lg:h-auto lg:min-h-0 lg:flex-1">
            {/* Keyed by surface so switching starts each app fresh. */}
            <AppPreview key={c.surface} c={c} />
          </div>
        </TabsContent>
        <TabsContent value="code" className={cn("min-h-0 overflow-y-auto")}>
          <StudioCode
            markdown={() => generateMarkdown(c, choice)}
            scopes={[
              {
                value: "app",
                label: "Whole app",
                code: generateCode(c, choice),
                note: "One install, the providers for your root layout, and the page. Swap the simulated sessions for your backend.",
              },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
