"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "cn"

import { ArtifactCard } from "@/components/ai/artifact"
import { CommandBar, CommandBarFooter, CommandBarInput, CommandBarList } from "@/components/ai/command-bar"
import { Message, MessageContent } from "@/components/ai/message"
import {
  PromptInput,
  PromptInputAttachButton,
  PromptInputFooter,
  PromptInputFrame,
  PromptInputOption,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai/prompt-input"
import { ToolCall, ToolCallHeader } from "@/components/ai/tool-call"
import { Badge } from "@/components/ui/badge"
import { CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command"
import { Skeleton } from "@/components/ui/skeleton"
import { CallControls, CallEnd, CallInterrupt, CallMute } from "@/components/voice/call-controls"
import { VoiceOrb, type OrbPalette, type VoiceOrbVariant } from "@/components/voice/voice-orb"
import { useSimulatedSpectrum } from "@/hooks/use-simulated-spectrum"
import { AddIcon, ArrowRightIcon, ChartIcon, SparkleIcon, WebSearchIcon } from "@/lib/icons"

/* ---------- Live mini previews ---------- */

const orbs: { variant: VoiceOrbVariant; palette?: OrbPalette }[] = [
  { variant: "aura", palette: "iris" },
  { variant: "plasma", palette: "iris" },
  { variant: "particles" },
  { variant: "liquid", palette: "ember" },
  { variant: "ring" },
]

function OrbPreview() {
  const { level } = useSimulatedSpectrum(true)
  return (
    <div className="flex items-center gap-6">
      {orbs.map((o, i) => (
        <VoiceOrb
          key={o.variant}
          variant={o.variant}
          palette={o.palette}
          state={i === 2 ? "speaking" : "listening"}
          level={level}
          size={i === 2 ? 132 : 76}
        />
      ))}
    </div>
  )
}

function CallPreview() {
  const { level } = useSimulatedSpectrum(true)
  return (
    <div className="flex flex-col items-center gap-3">
      <VoiceOrb state="speaking" level={level} size={72} />
      <p className="text-xs text-muted-foreground">Tomorrow you&apos;re both free at 10:30…</p>
      <CallControls>
        <CallMute />
        <CallInterrupt />
        <CallEnd />
      </CallControls>
    </div>
  )
}

function PanelPreview() {
  return (
    <div className="flex h-40 w-72 overflow-hidden rounded-xl border bg-background shadow-lg">
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Skeleton className="h-3 w-16" />
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-2.5" />
        ))}
      </div>
      <div className="flex w-36 flex-col border-l bg-card">
        <div className="flex items-center gap-1.5 border-b px-2 py-1.5 text-xs font-medium">
          <SparkleIcon className="size-3" />
          Agent
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-2">
          <span className="self-end rounded-lg bg-secondary px-2 py-1 text-xs">Overdue?</span>
          <span className="text-xs text-muted-foreground">Three orders are late.</span>
        </div>
        <div className="m-2 h-6 rounded-lg border bg-background" />
      </div>
    </div>
  )
}

function PromptPreview() {
  return (
    <PromptInputFrame className="w-80">
      <PromptInput onSubmit={() => {}}>
        <PromptInputTextarea placeholder="Ask anything…" />
        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputAttachButton />
          </PromptInputTools>
          <PromptInputSubmit />
        </PromptInputToolbar>
      </PromptInput>
      <PromptInputFooter>
        <PromptInputOption icon={<WebSearchIcon />} defaultPressed>
          Web search
        </PromptInputOption>
      </PromptInputFooter>
    </PromptInputFrame>
  )
}

function ConversationPreview() {
  return (
    <div className="flex w-80 flex-col gap-3">
      <Message from="user">
        <MessageContent>Why did churn go up?</MessageContent>
      </Message>
      <Message from="assistant">
        <MessageContent>
          <ToolCall>
            <ToolCallHeader name="analytics.query" state="output-available" />
          </ToolCall>
          <span>Annual plans renewed after the price change.</span>
        </MessageContent>
      </Message>
    </div>
  )
}

function CommandPreview() {
  return (
    <CommandBar className="w-80">
      <CommandBarInput />
      <CommandBarList>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <SparkleIcon />
            Summarize this page
          </CommandItem>
          <CommandItem>
            <AddIcon />
            New invoice
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <ChartIcon />
            Open revenue report
          </CommandItem>
        </CommandGroup>
      </CommandBarList>
      <CommandBarFooter />
    </CommandBar>
  )
}

function ArtifactPreview() {
  return (
    <div className="flex h-40 w-88 overflow-hidden rounded-xl border bg-background shadow-lg">
      <div className="flex w-44 shrink-0 flex-col justify-end gap-2 p-2">
        <span className="text-xs text-muted-foreground">Here&apos;s a first draft.</span>
        <ArtifactCard title="Pricing" description="Doc" active />
      </div>
      <div className="flex flex-1 flex-col gap-2 border-l bg-card p-3">
        <span className="text-xs font-medium">Q3 pricing update</span>
        <Skeleton className="h-3 w-3/4" />
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-2" />
        ))}
      </div>
    </div>
  )
}

function SoonPreview() {
  return (
    <div className="grid size-full place-items-center bg-radial from-primary/15 to-transparent to-60%">
      <span className="text-xs text-muted-foreground">In the works</span>
    </div>
  )
}

/* ---------- Gallery ---------- */

type Tool = {
  href: string
  title: string
  body: string
  preview: React.ReactNode
  featured?: boolean
  soon?: boolean
}

const tools: Tool[] = [
  {
    href: "/studio/voice-orb",
    title: "Voice orb",
    body: "Ten styles from particles to glass, palettes, shape and material, previewed in every state and inside real surfaces.",
    preview: <OrbPreview />,
    featured: true,
  },
  {
    href: "/studio/voice-call",
    title: "Voice call",
    body: "Layout, captions, waveform and backdrop for a call screen, with a live sample call.",
    preview: <CallPreview />,
  },
  {
    href: "/studio/side-panel",
    title: "Side panel",
    body: "Docked or floating, surface, entrance motion, chat and voice modes, composer.",
    preview: <PanelPreview />,
  },
  {
    href: "/studio/prompt-input",
    title: "Prompt input",
    body: "Context, tools, scope, voice and send behaviour, previewed where composers live.",
    preview: <PromptPreview />,
  },
  {
    href: "/studio/conversation",
    title: "Conversation",
    body: "Bubbles, density, avatars, and how reasoning, tool calls and sources show in a turn.",
    preview: <ConversationPreview />,
  },
  {
    href: "/studio/command-bar",
    title: "Command bar",
    body: "A ⌘K bar that runs commands and asks the agent.",
    preview: <CommandPreview />,
  },
  {
    href: "/studio/artifact",
    title: "Artifact",
    body: "How generated documents, code and previews open next to the chat.",
    preview: <ArtifactPreview />,
  },
  {
    href: "",
    title: "Motion and backgrounds",
    body: "Motion presets to feel, and ambient backgrounds for agent surfaces.",
    preview: <SoonPreview />,
    soon: true,
  },
]

function Card({ tool }: { tool: Tool }) {
  const inner = (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow,translate] duration-200",
        !tool.soon && "group-hover:-translate-y-0.5 group-hover:border-foreground/20 group-hover:shadow-lg",
      )}
    >
      {/* Live previews, made inert so they can't take focus or clicks; the card is the link. */}
      <div
        inert
        aria-hidden
        className={cn(
          "relative grid place-items-center overflow-hidden border-b bg-muted/30",
          tool.featured ? "h-64" : "h-52",
        )}
      >
        {tool.preview}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <div className="flex items-center gap-2">
          <h2 className="font-medium">{tool.title}</h2>
          {tool.soon && <Badge variant="secondary">Soon</Badge>}
          {!tool.soon && (
            <ArrowRightIcon className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">{tool.body}</p>
      </div>
    </div>
  )
  return tool.soon ? (
    <div className={cn("min-w-0 opacity-70", tool.featured && "lg:col-span-2")}>{inner}</div>
  ) : (
    // min-w-0: wide previews (like the orb row) must not stretch the grid column past the screen.
    <Link
      href={tool.href}
      className={cn(
        "group min-w-0 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        tool.featured && "lg:col-span-2",
      )}
    >
      {inner}
    </Link>
  )
}

/** The Studio index: every tool as a card with a live preview of what it makes. */
export function StudioGallery() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((t) => (
        <Card key={t.title} tool={t} />
      ))}
    </div>
  )
}
