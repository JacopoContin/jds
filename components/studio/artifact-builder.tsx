"use client"

import * as React from "react"
import { cn } from "cn"

import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactCard,
  ArtifactContent,
  ArtifactHeader,
} from "@/components/ai/artifact"
import { Conversation, ConversationContent } from "@/components/ai/conversation"
import { Message, MessageContent } from "@/components/ai/message"
import { Response } from "@/components/ai/response"
import { ControlGroup, Segmented, Toggle } from "@/components/studio/controls"
import { render, type Node } from "@/components/studio/jsx"
import { installFromCode, studioMarkdown } from "@/components/studio/markdown"
import { StudioCode } from "@/components/studio/studio-code"
import { Button } from "@/components/ui/button"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, CopyIcon, DownloadIcon } from "@/lib/icons"

type Config = {
  kind: "document" | "code" | "preview"
  opens: "split" | "sheet" | "fullscreen" | "inline"
  resizable: boolean
  surface: "card" | "flush"
  versions: boolean
  copy: boolean
  download: boolean
  close: boolean
}

const defaults: Config = {
  kind: "document",
  opens: "split",
  resizable: true,
  surface: "flush",
  versions: false,
  copy: true,
  download: true,
  close: true,
}

/** Common ways to show an artifact. */
const presets: { name: string; body: string; config: Partial<Config> }[] = [
  { name: "Canvas", body: "Document beside the chat, resizable", config: {} },
  { name: "Code", body: "Code with versions", config: { kind: "code", versions: true } },
  { name: "Sheet", body: "Slides over the chat", config: { opens: "sheet" } },
  { name: "Focus", body: "Full screen preview", config: { opens: "fullscreen", kind: "preview", surface: "card" } },
  { name: "Inline", body: "Inside the message", config: { opens: "inline", surface: "card", close: false, download: false } },
]

const TITLE = "Q3 pricing update"
const DOC = `## Q3 pricing update

From **October 1**, the Team plan moves from €12 to **€14 per seat**. Annual billing now includes **two months free** instead of one.

- Monthly Team customers move at their next renewal
- Annual customers keep their price until their term ends
- Starter and Enterprise don't change`
const CODE = `export const plans = {
  starter: { monthly: 0 },
  team: { monthly: 14, annualMonthsFree: 2 },
  enterprise: { monthly: null },
}`

const kindLabel = { document: "Document", code: "Code", preview: "Preview" }
const description = (c: Config) => `${kindLabel[c.kind]}${c.versions ? " · v2 of 3" : ""}`

/* ---------- Code generation ---------- */

function artifactNode(c: Config): Node {
  const icons: string[] = []
  const actions: Node[] = []
  const action = (label: string, icon: string, handler: string) => {
    icons.push(icon)
    actions.push({ tag: "ArtifactAction", props: [`label="${label}"`, `onClick={${handler}}`], children: [`<${icon} />`] })
  }
  if (c.versions) {
    action("Previous version", "ChevronLeftIcon", "previousVersion")
    action("Next version", "ChevronRightIcon", "nextVersion")
  }
  if (c.copy) action("Copy", "CopyIcon", "copy")
  if (c.download) action("Download", "DownloadIcon", "download")
  if (c.close && c.opens !== "inline") action("Close", "CloseIcon", "close")

  const content: Node =
    c.kind === "document"
      ? { tag: "ArtifactContent", children: ["<Response>{artifact.markdown}</Response>"] }
      : c.kind === "code"
        ? { tag: "ArtifactContent", props: ['className="p-0"'], children: ['<pre className="p-4 font-mono text-xs">{artifact.code}</pre>'] }
        : {
            tag: "Tabs",
            props: ['defaultValue="preview"', 'className="min-h-0 flex-1"'],
            children: [
              {
                tag: "TabsList",
                props: ['variant="line"', 'className="mx-4 mt-2"'],
                children: ['<TabsTrigger value="preview">Preview</TabsTrigger>', '<TabsTrigger value="code">Code</TabsTrigger>'],
              },
              { tag: "TabsContent", props: ['value="preview"'], children: ['<ArtifactContent>{artifact.preview}</ArtifactContent>'] },
              {
                tag: "TabsContent",
                props: ['value="code"'],
                children: ['<ArtifactContent className="p-0"><pre className="p-4 font-mono text-xs">{artifact.code}</pre></ArtifactContent>'],
              },
            ],
          }

  const props = c.surface === "flush" ? ['className="rounded-none border-0"'] : []
  if (c.opens === "inline") props.push('className="h-80"')
  return {
    tag: "Artifact",
    props: [...new Set(props)],
    children: [
      {
        tag: "ArtifactHeader",
        props: [`title="${TITLE}"`, `description="${description(c)}"`],
        children: actions.length ? [{ tag: "ArtifactActions", children: actions }] : [],
      },
      content,
    ],
  }
}

function generateCode(c: Config) {
  const chat = "<Chat />"
  const artifact = artifactNode(c)
  let tree: Node
  const imports = [
    `import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactCard,
  ArtifactContent,
  ArtifactHeader,
} from "@/components/ai/artifact"`,
  ]
  if (c.kind === "document") imports.push('import { Response } from "@/components/ai/response"')
  if (c.kind === "preview") imports.push('import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"')

  if (c.opens === "split" && c.resizable) {
    imports.push('import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"')
    tree = {
      tag: "ResizablePanelGroup",
      props: ['orientation="horizontal"'],
      children: [
        { tag: "ResizablePanel", props: ['defaultSize="45%"', 'minSize="30%"'], children: [chat] },
        { when: "open", node: "<ResizableHandle withHandle />" },
        { when: "open", node: { tag: "ResizablePanel", props: ['defaultSize="55%"', 'minSize="35%"'], children: [artifact] } },
      ],
    }
  } else if (c.opens === "split") {
    tree = {
      tag: "div",
      props: ['className="grid h-full grid-cols-2"'],
      children: [chat, { when: "open", node: artifact }],
    }
  } else if (c.opens === "sheet") {
    imports.push('import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"')
    tree = {
      tag: "div",
      props: ['className="h-full"'],
      children: [
        chat,
        {
          tag: "Sheet",
          props: ["open={open}", "onOpenChange={setOpen}"],
          children: [
            {
              tag: "SheetContent",
              props: ['className="w-full gap-0 p-0 sm:max-w-xl"', "showCloseButton={false}"],
              children: [`<SheetTitle className="sr-only">${TITLE}</SheetTitle>`, artifact],
            },
          ],
        },
      ],
    }
  } else if (c.opens === "fullscreen") {
    imports.push('import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"')
    tree = {
      tag: "div",
      props: ['className="h-full"'],
      children: [
        chat,
        {
          tag: "Dialog",
          props: ["open={open}", "onOpenChange={setOpen}"],
          children: [
            {
              tag: "DialogContent",
              props: ['className="h-[90svh] max-w-[95vw] gap-0 p-0 sm:max-w-[95vw]"', "showCloseButton={false}"],
              children: [`<DialogTitle className="sr-only">${TITLE}</DialogTitle>`, artifact],
            },
          ],
        },
      ],
    }
  } else {
    tree = {
      tag: "MessageContent",
      children: ["<Response>{text}</Response>", artifact],
    }
  }

  const card =
    c.opens === "inline"
      ? ""
      : `// In the assistant's message: the card that opens it
<ArtifactCard title="${TITLE}" description="${description(c)}" active={open} onOpen={() => setOpen(true)} />

// The layout: <Chat /> is your conversation
`
  const icons = [...render(artifact).matchAll(/<(\w+Icon) \/>/g)].map((m) => m[1])
  if (icons.length) imports.push(`import { ${[...new Set(icons)].sort().join(", ")} } from "@/lib/icons"`)
  return `${imports.join("\n")}\n\n${card}${render(tree)}`
}

function generateMarkdown(c: Config) {
  const code = generateCode(c)
  return studioMarkdown({
    title: "Artifact",
    intro: "How a generated document, code or preview opens next to the conversation.",
    choices: [
      ["Kind", c.kind === "preview" ? "live preview with a code tab" : c.kind],
      [
        "Opens",
        {
          split: `beside the chat${c.resizable ? ", resizable" : ""}`,
          sheet: "as a sheet over the chat",
          fullscreen: "full screen",
          inline: "inline, inside the message",
        }[c.opens],
      ],
      ["Surface", c.surface === "card" ? "card with border and radius" : "flush to its container"],
      ["Version switcher", c.versions ? "on" : "off"],
      [
        "Actions",
        [c.copy && "copy", c.download && "download", c.close && c.opens !== "inline" && "close"].filter(Boolean).join(", ") || "none",
      ],
    ],
    install: installFromCode(code),
    placement: [
      c.opens === "inline"
        ? "Render the artifact inside the assistant message that produced it."
        : "Show the ArtifactCard in the assistant message that produced it; it opens the artifact and stays highlighted while open.",
      c.opens === "split"
        ? "Put the chat and the artifact side by side in the chat page's main area."
        : c.opens === "sheet" || c.opens === "fullscreen"
          ? "Keep the open state next to the chat; closing returns to the conversation."
          : "Give it a fixed height so long artifacts scroll inside the message.",
      "Fill artifact.markdown, artifact.code or artifact.preview from the tool or message part that created it.",
    ],
    code,
  })
}

/* ---------- Preview ---------- */

function PreviewMock() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-3 rounded-xl border p-5">
      <span className="text-xs text-muted-foreground">Team</span>
      <span className="text-3xl font-semibold">
        €14<span className="text-sm font-normal text-muted-foreground"> / seat / month</span>
      </span>
      <span className="text-sm text-muted-foreground">Two months free when billed annually.</span>
      <Button size="sm">Choose Team</Button>
    </div>
  )
}

function ArtifactView({ c, onClose }: { c: Config; onClose: () => void }) {
  return (
    <Artifact className={cn(c.surface === "flush" && "rounded-none border-0", c.opens === "inline" && "h-80")}>
      <ArtifactHeader title={TITLE} description={description(c)}>
        <ArtifactActions>
          {c.versions && (
            <>
              <ArtifactAction label="Previous version">
                <ChevronLeftIcon />
              </ArtifactAction>
              <ArtifactAction label="Next version">
                <ChevronRightIcon />
              </ArtifactAction>
            </>
          )}
          {c.copy && (
            <ArtifactAction label="Copy">
              <CopyIcon />
            </ArtifactAction>
          )}
          {c.download && (
            <ArtifactAction label="Download">
              <DownloadIcon />
            </ArtifactAction>
          )}
          {c.close && c.opens !== "inline" && (
            <ArtifactAction label="Close" onClick={onClose}>
              <CloseIcon />
            </ArtifactAction>
          )}
        </ArtifactActions>
      </ArtifactHeader>
      {c.kind === "document" && (
        <ArtifactContent>
          <Response>{DOC}</Response>
        </ArtifactContent>
      )}
      {c.kind === "code" && (
        <ArtifactContent className="p-0">
          <pre className="p-4 font-mono text-xs leading-relaxed">{CODE}</pre>
        </ArtifactContent>
      )}
      {c.kind === "preview" && (
        <Tabs defaultValue="preview" className="min-h-0 flex-1">
          <TabsList variant="line" className="mx-4 mt-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="min-h-0">
            <ArtifactContent>
              <PreviewMock />
            </ArtifactContent>
          </TabsContent>
          <TabsContent value="code" className="min-h-0">
            <ArtifactContent className="p-0">
              <pre className="p-4 font-mono text-xs leading-relaxed">{CODE}</pre>
            </ArtifactContent>
          </TabsContent>
        </Tabs>
      )}
    </Artifact>
  )
}

function Chat({ c, open, onOpen }: { c: Config; open: boolean; onOpen: () => void }) {
  return (
    <Conversation>
      <ConversationContent className="px-5">
        <Message from="user">
          <MessageContent>Draft the Q3 pricing update for customers.</MessageContent>
        </Message>
        <Message from="assistant">
          <MessageContent>
            <Response>Here&apos;s a first draft. I led with the annual discount so the change reads as an option.</Response>
            {c.opens === "inline" ? (
              <ArtifactView c={c} onClose={() => {}} />
            ) : (
              <ArtifactCard title={TITLE} description={description(c)} active={open} onOpen={onOpen} />
            )}
          </MessageContent>
        </Message>
      </ConversationContent>
    </Conversation>
  )
}

function Stage({ c }: { c: Config }) {
  const [open, setOpen] = React.useState(true)
  const frame = React.useRef<HTMLDivElement>(null)
  const chat = <Chat c={c} open={open} onOpen={() => setOpen(true)} />
  const artifact = <ArtifactView c={c} onClose={() => setOpen(false)} />

  return (
    // transform-gpu makes this frame the reference for the sheet's fixed positioning, so it stays inside.
    <div ref={frame} className="relative flex min-h-0 flex-1 transform-gpu overflow-hidden">
      {c.opens === "split" && c.resizable && open && (
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize="45%" minSize="30%">
            {chat}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="55%" minSize="35%">
            <div className={cn("h-full", c.surface === "card" && "p-3")}>{artifact}</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
      {c.opens === "split" && !c.resizable && open && (
        <div className="grid min-h-0 flex-1 grid-cols-2">
          <div className="flex min-h-0 flex-col border-r">{chat}</div>
          <div className={cn("min-h-0", c.surface === "card" && "p-3")}>{artifact}</div>
        </div>
      )}
      {(c.opens !== "split" || !open) && <div className="flex min-h-0 flex-1 flex-col">{chat}</div>}
      {c.opens === "sheet" && (
        <Sheet open={open} onOpenChange={setOpen} modal={false}>
          <SheetContent
            container={frame}
            overlay={false}
            showCloseButton={false}
            className={cn("w-full gap-0 p-0 shadow-2xl sm:max-w-md", c.surface === "card" && "p-3")}
          >
            <SheetTitle className="sr-only">{TITLE}</SheetTitle>
            <SheetDescription className="sr-only">The generated document.</SheetDescription>
            {artifact}
          </SheetContent>
        </Sheet>
      )}
      {c.opens === "fullscreen" && open && (
        <div className="absolute inset-0 z-10 flex bg-background/70 p-6 backdrop-blur-sm">
          <div className="flex min-h-0 flex-1 flex-col shadow-2xl">{artifact}</div>
        </div>
      )}
    </div>
  )
}

export function ArtifactBuilder() {
  const [c, setC] = React.useState<Config>(defaults)
  const set =
    <K extends keyof Config>(key: K) =>
    (value: Config[K]) =>
      setC((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-5 overflow-y-auto border-b p-5 lg:h-[calc(100svh-3.5rem-1px)] lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold">Artifact</h1>
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
        <ControlGroup title="Behaviour">
          <Segmented
            label="Opens"
            value={c.opens}
            onChange={set("opens")}
            options={[
              { value: "split", label: "Beside" },
              { value: "sheet", label: "Sheet" },
              { value: "fullscreen", label: "Full screen" },
              { value: "inline", label: "Inline" },
            ]}
          />
          {c.opens === "split" && <Toggle label="Resizable" checked={c.resizable} onChange={set("resizable")} />}
        </ControlGroup>
        <ControlGroup title="Content">
          <Segmented
            label="Kind"
            value={c.kind}
            onChange={set("kind")}
            options={[
              { value: "document", label: "Document" },
              { value: "code", label: "Code" },
              { value: "preview", label: "Preview" },
            ]}
          />
          <Segmented
            label="Surface"
            value={c.surface}
            onChange={set("surface")}
            options={[
              { value: "flush", label: "Flush" },
              { value: "card", label: "Card" },
            ]}
          />
        </ControlGroup>
        <ControlGroup title="Header">
          <Toggle label="Version switcher" checked={c.versions} onChange={set("versions")} />
          <Toggle label="Copy" checked={c.copy} onChange={set("copy")} />
          <Toggle label="Download" checked={c.download} onChange={set("download")} />
          {c.opens !== "inline" && <Toggle label="Close" checked={c.close} onChange={set("close")} />}
        </ControlGroup>
      </aside>

      <Tabs defaultValue="preview" className="min-w-0 gap-0 p-5 lg:h-[calc(100svh-3.5rem-1px)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <span className="text-xs text-muted-foreground">Close it, then open it again from the card.</span>
        </div>
        <TabsContent value="preview" className="flex min-h-0 flex-col">
          <div className="flex h-160 flex-col overflow-hidden rounded-2xl border bg-background lg:h-auto lg:min-h-0 lg:flex-1">
            {/* Keyed so each configuration starts open. */}
            <Stage key={JSON.stringify(c)} c={c} />
          </div>
        </TabsContent>
        <TabsContent value="code" className="min-h-0 overflow-y-auto">
          <StudioCode
            markdown={() => generateMarkdown(c)}
            scopes={[
              {
                value: "instance",
                label: "This artifact",
                code: generateCode(c),
                note: "Keep open state next to the chat. Fill the artifact from the tool or message part that created it.",
              },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
