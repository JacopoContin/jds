"use client"

import * as React from "react"

import {
  AgentPanel,
  AgentPanelBody,
  AgentPanelFooter,
  AgentPanelHeader,
  AgentPanelVoiceButton,
  AgentPanelVoiceExit,
  type PanelMode,
  type PanelMotion,
  type PanelSide,
  type PanelSurface,
  type PanelVariant,
} from "@/components/ai/agent-panel"
import { Conversation, ConversationContent, ConversationEmpty } from "@/components/ai/conversation"
import { Message, MessageContent } from "@/components/ai/message"
import {
  PromptInput,
  PromptInputAttachButton,
  PromptInputFrame,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai/prompt-input"
import { PromptInputMic } from "@/components/ai/prompt-input-mic"
import { Suggestion, Suggestions } from "@/components/ai/suggestions"
import { CopyButton } from "@/components/docs/copy-button"
import { CodePanel } from "@/components/studio/code-panel"
import { ControlGroup, Range, Segmented, Text, Toggle } from "@/components/studio/controls"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PushToTalk } from "@/components/voice/push-to-talk"
import { VoiceOrb } from "@/components/voice/voice-orb"
import { useSimulatedSpectrum } from "@/hooks/use-simulated-spectrum"
import { FileIcon, RegenerateIcon, SparkleIcon } from "@/lib/icons"

type Config = {
  side: PanelSide
  variant: PanelVariant
  surface: PanelSurface
  width: number
  inset: number
  motion: PanelMotion
  title: string
  icon: "sparkle" | "orb" | "none"
  /** Where people enter voice mode. The composer is the usual place. */
  voiceEntry: "composer" | "header" | "both" | "off"
  context: boolean
  mic: boolean
  attach: boolean
  suggestions: boolean
  messages: boolean
}

const defaults: Config = {
  side: "right",
  variant: "docked",
  surface: "card",
  width: 400,
  inset: 12,
  motion: "spring",
  title: "Agent",
  icon: "sparkle",
  voiceEntry: "composer",
  context: true,
  mic: true,
  attach: true,
  suggestions: true,
  messages: false,
}

/** Props that differ from the component's own defaults, as JSX attributes. */
function panelProps(c: Config) {
  const p: string[] = ["open={open}", "onOpenChange={setOpen}"]
  if (c.side !== "right") p.push(`side="${c.side}"`)
  if (c.variant !== "docked") p.push(`variant="${c.variant}"`)
  if (c.surface !== "card") p.push(`surface="${c.surface}"`)
  if (c.width !== 400) p.push(`width={${c.width}}`)
  if (c.variant === "floating" && c.inset !== 12) p.push(`inset={${c.inset}}`)
  if (c.motion !== "spring") p.push(`motion="${c.motion}"`)
  return p
}

/** The same panel as the Agent panel recipe, which brings its own chat, composer and voice mode. */
function generateRecipeCode(c: Config) {
  const panel: string[] = []
  if (c.side !== "right") panel.push(`side: "${c.side}"`)
  if (c.variant !== "docked") panel.push(`variant: "${c.variant}"`)
  if (c.surface !== "card") panel.push(`surface: "${c.surface}"`)
  if (c.width !== 400) panel.push(`width: ${c.width}`)
  if (c.variant === "floating" && c.inset !== 12) panel.push(`inset: ${c.inset}`)
  if (c.motion !== "spring") panel.push(`motion: "${c.motion}"`)
  const props = ["session={session}", "open={open}", "onOpenChange={setOpen}"]
  if (panel.length) props.push(`panel={{ ${panel.join(", ")} }}`)
  if (c.title !== "Agent") props.push(`title="${c.title}"`)
  if (c.context) props.push('context="Orders · 128 rows"')
  return `<AgentSidePanel\n  ${props.join("\n  ")}\n/>`
}

function generateCode(c: Config) {
  const voice = c.voiceEntry !== "off"
  const inComposer = c.voiceEntry === "composer" || c.voiceEntry === "both"
  const inHeader = c.voiceEntry === "header" || c.voiceEntry === "both"
  const panelParts = ["AgentPanel", "AgentPanelBody", "AgentPanelFooter", "AgentPanelHeader"]
  if (inComposer) panelParts.push("AgentPanelVoiceButton")
  if (voice) panelParts.push("AgentPanelVoiceExit")
  const imports = [
    `import { ${panelParts.join(", ")} } from "@/components/ai/agent-panel"`,
    `import { Conversation, ConversationContent } from "@/components/ai/conversation"`,
    `import {\n  PromptInput,${c.context ? "\n  PromptInputFrame,\n  PromptInputHeader," : ""}\n  PromptInputSubmit,\n  PromptInputTextarea,\n  PromptInputToolbar,\n  PromptInputTools,${c.attach ? "\n  PromptInputAttachButton," : ""}\n} from "@/components/ai/prompt-input"`,
  ]
  if (c.mic) imports.push(`import { PromptInputMic } from "@/components/ai/prompt-input-mic"`)
  if (voice) imports.push(`import { VoiceOrb } from "@/components/voice/voice-orb"`)

  const header = [`title="${c.title}"`]
  if (c.icon !== "sparkle") header.push(`icon="${c.icon}"`)
  if (inHeader) header.push(`modes={["chat", "voice"]}`)

  const input = `<PromptInput onSubmit={send}>
          <PromptInputTextarea />
          <PromptInputToolbar>
            <PromptInputTools>${c.attach ? "\n              <PromptInputAttachButton />" : ""}
            </PromptInputTools>
            ${c.mic ? "<PromptInputMic />\n            " : ""}${inComposer ? "<AgentPanelVoiceButton />\n            " : ""}<PromptInputSubmit />
          </PromptInputToolbar>
        </PromptInput>`

  const composer = c.context
    ? `<PromptInputFrame>
        <PromptInputHeader>Orders · 128 rows</PromptInputHeader>
        ${input.replace(/\n/g, "\n  ")}
      </PromptInputFrame>`
    : input.replace(/\n {2}/g, "\n")

  return `${imports.join("\n")}

<AgentPanel ${panelProps(c).join(" ")}>
  <AgentPanelHeader ${header.join(" ")} />
  <AgentPanelBody
    chat={
      <Conversation>
        <ConversationContent>{/* messages */}</ConversationContent>
      </Conversation>
    }${
      voice
        ? `\n    voice={\n      <>\n        <VoiceOrb state={voiceState} level={level} size={180} />\n        <AgentPanelVoiceExit />\n      </>\n    }`
        : ""
    }
  />
  <AgentPanelFooter>
    ${composer}
  </AgentPanelFooter>
</AgentPanel>`
}

function VoiceMode() {
  const [talking, setTalking] = React.useState(false)
  const { level } = useSimulatedSpectrum(talking)
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
      <VoiceOrb state={talking ? "listening" : "idle"} level={level} size={180} />
      <div className="flex flex-col items-center gap-2">
        <PushToTalk
          hotkey={false}
          level={level}
          onPressStart={() => setTalking(true)}
          onPressEnd={() => setTalking(false)}
        />
        <span className="text-xs text-muted-foreground">Hold to talk</span>
      </div>
      <AgentPanelVoiceExit />
    </div>
  )
}

function Chat({ c }: { c: Config }) {
  return (
    <Conversation>
      {c.messages ? (
        <ConversationContent className="gap-4 px-4 py-4">
          <Message from="user">
            <MessageContent>Which orders are overdue?</MessageContent>
          </Message>
          <Message from="assistant">
            <MessageContent>Three orders are more than a week late: #4817, #4802 and #4795.</MessageContent>
          </Message>
        </ConversationContent>
      ) : (
        <ConversationEmpty title="Ask about this page" description="Type, dictate, or switch to voice.">
          {c.suggestions && (
            <Suggestions className="justify-center">
              <Suggestion suggestion="Summarize" />
              <Suggestion suggestion="Find overdue" />
            </Suggestions>
          )}
        </ConversationEmpty>
      )}
    </Conversation>
  )
}

function Composer({ c }: { c: Config }) {
  const input = (
    <PromptInput onSubmit={() => {}}>
      <PromptInputTextarea placeholder="Ask anything…" />
      <PromptInputToolbar>
        <PromptInputTools>{c.attach && <PromptInputAttachButton />}</PromptInputTools>
        <div className="flex items-center gap-1">
          {c.mic && <PromptInputMic />}
          {(c.voiceEntry === "composer" || c.voiceEntry === "both") && <AgentPanelVoiceButton />}
          <PromptInputSubmit />
        </div>
      </PromptInputToolbar>
    </PromptInput>
  )
  if (!c.context) return input
  return (
    <PromptInputFrame>
      <PromptInputHeader icon={<FileIcon />}>Orders · 128 rows</PromptInputHeader>
      {input}
    </PromptInputFrame>
  )
}

export function SidePanelBuilder() {
  const [c, setC] = React.useState<Config>(defaults)
  const [open, setOpen] = React.useState(true)
  const [mode, setMode] = React.useState<PanelMode>("chat")
  const set =
    <K extends keyof Config>(key: K) =>
    (value: Config[K]) =>
      setC((prev) => ({ ...prev, [key]: value }))

  const replay = () => {
    setOpen(false)
    setTimeout(() => setOpen(true), 350)
  }

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-5 overflow-y-auto border-b p-5 lg:h-[calc(100svh-3.5rem)] lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold">Side panel</h1>
          <Button variant="ghost" size="xs" onClick={() => setC(defaults)}>
            Reset
          </Button>
        </div>
        <ControlGroup title="Layout">
          <Segmented
            label="Side"
            value={c.side}
            onChange={set("side")}
            options={[
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ]}
          />
          <Segmented
            label="Style"
            value={c.variant}
            onChange={set("variant")}
            options={[
              { value: "docked", label: "Docked" },
              { value: "floating", label: "Floating" },
            ]}
          />
          <Range label="Width" value={c.width} min={320} max={560} step={8} unit="px" onChange={set("width")} />
          {c.variant === "floating" && (
            <Range label="Inset" value={c.inset} min={0} max={32} unit="px" onChange={set("inset")} />
          )}
        </ControlGroup>
        <ControlGroup title="Look">
          <Segmented
            label="Surface"
            value={c.surface}
            onChange={set("surface")}
            options={[
              { value: "card", label: "Card" },
              { value: "background", label: "Page" },
              { value: "glass", label: "Glass" },
            ]}
          />
          <Segmented
            label="Entrance"
            value={c.motion}
            onChange={(v) => {
              set("motion")(v)
              replay()
            }}
            options={[
              { value: "slide", label: "Slide" },
              { value: "fade", label: "Fade" },
              { value: "spring", label: "Spring" },
            ]}
          />
        </ControlGroup>
        <ControlGroup title="Header and voice">
          <Text label="Title" value={c.title} onChange={set("title")} />
          <Segmented
            label="Icon"
            value={c.icon}
            onChange={set("icon")}
            options={[
              { value: "sparkle", label: "Sparkle" },
              { value: "orb", label: "Orb" },
              { value: "none", label: "None" },
            ]}
          />
          <Segmented
            label="Voice entry"
            value={c.voiceEntry}
            onChange={(v) => {
              set("voiceEntry")(v)
              if (v === "off") setMode("chat")
            }}
            options={[
              { value: "composer", label: "Composer" },
              { value: "header", label: "Header" },
              { value: "both", label: "Both" },
              { value: "off", label: "Off" },
            ]}
          />
        </ControlGroup>
        <ControlGroup title="Composer">
          <Toggle label="Page context" checked={c.context} onChange={set("context")} />
          <Toggle label="Attachments" checked={c.attach} onChange={set("attach")} />
          <Toggle label="Dictation" checked={c.mic} onChange={set("mic")} />
        </ControlGroup>
        <ControlGroup title="Content">
          <Toggle label="Show messages" checked={c.messages} onChange={set("messages")} />
          {!c.messages && <Toggle label="Suggestions" checked={c.suggestions} onChange={set("suggestions")} />}
        </ControlGroup>
      </aside>

      <Tabs defaultValue="preview" className="min-w-0 gap-0 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={replay}>
              <RegenerateIcon />
              Replay entrance
            </Button>
            <Button size="sm" onClick={() => setOpen((o) => !o)}>
              <SparkleIcon />
              {open ? "Close" : "Open"} agent
            </Button>
          </div>
        </div>
        <TabsContent value="preview">
          <div className="relative h-160 overflow-hidden rounded-2xl border bg-background">
            <div className="flex flex-col gap-4 p-6">
              <Skeleton className="h-6 w-40" />
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-4" />
              ))}
            </div>
            <AgentPanel
              open={open}
              onOpenChange={setOpen}
              side={c.side}
              variant={c.variant}
              surface={c.surface}
              width={c.width}
              inset={c.inset}
              motion={c.motion}
              contained
              mode={mode}
              onModeChange={setMode}
            >
              <AgentPanelHeader
                title={c.title}
                icon={c.icon}
                modes={c.voiceEntry === "header" || c.voiceEntry === "both" ? ["chat", "voice"] : undefined}
              />
              <AgentPanelBody chat={<Chat c={c} />} voice={c.voiceEntry !== "off" ? <VoiceMode /> : undefined} />
              <AgentPanelFooter>
                <Composer c={c} />
              </AgentPanelFooter>
            </AgentPanel>
          </div>
        </TabsContent>
        <TabsContent value="code">
          <div className="relative overflow-hidden rounded-2xl border bg-card">
            <CopyButton value={generateCode(c)} className="absolute top-3 right-3" />
            <pre className="max-h-160 overflow-auto p-5 font-mono text-xs leading-relaxed">{generateCode(c)}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Install with <code className="font-mono">npx shadcn@latest add @jds/agent-panel</code>. Only props that
            differ from the defaults are included.
          </p>
          <div className="mt-8">
            <CodePanel
              title="In the Agent panel recipe"
              code={generateRecipeCode(c)}
              note={
                <>
                  The recipe brings chat, dictation and voice mode; leave <code className="font-mono">voice</code> out of
                  its session to turn voice off. Install it with{" "}
                  <code className="font-mono">npx shadcn@latest add @jds/agent-side-panel</code>.
                </>
              }
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
