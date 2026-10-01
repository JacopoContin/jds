"use client"

import * as React from "react"

import { ContextMeter } from "@/components/ai/context-meter"
import {
  Conversation,
  ConversationContent,
  ConversationEmpty,
  ConversationScrollButton,
} from "@/components/ai/conversation"
import { Message, MessageAction, MessageActions, MessageContent } from "@/components/ai/message"
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
import { PromptInputMentions, type Mention } from "@/components/ai/prompt-input-mentions"
import { PromptInputMic } from "@/components/ai/prompt-input-mic"
import { Response } from "@/components/ai/response"
import { TypingIndicator } from "@/components/ai/shimmer"
import { Suggestion, Suggestions } from "@/components/ai/suggestions"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { CopyIcon, MenuIcon, RegenerateIcon, SearchIcon, SparkleIcon } from "@/lib/icons"

type Thread = { id: string; title: string; group: "Today" | "Yesterday" | "Last week" }
type Turn = { id: string; from: "user" | "assistant"; text: string }

const threads: Thread[] = [
  { id: "t1", title: "Q3 pricing announcement", group: "Today" },
  { id: "t2", title: "Refund policy for damaged items", group: "Today" },
  { id: "t3", title: "Onboarding email sequence", group: "Yesterday" },
  { id: "t4", title: "Competitor research: voice agents", group: "Yesterday" },
  { id: "t5", title: "Sprint retro summary", group: "Last week" },
  { id: "t6", title: "Hiring plan for design", group: "Last week" },
]

const models: Model[] = [
  { id: "opus", name: "Claude Opus 5.5", description: "Hardest problems", capabilities: ["reasoning", "vision"] },
  { id: "sonnet", name: "Claude Sonnet 5.5", description: "Everyday tasks", capabilities: ["reasoning", "vision"] },
  { id: "haiku", name: "Claude Haiku 4.5", description: "Quick answers", capabilities: ["fast"] },
]

const mentionables: Mention[] = [
  { id: "m1", label: "pricing.md", type: "file", description: "docs/" },
  { id: "m2", label: "web-search", type: "tool", description: "Search the web" },
  { id: "m3", label: "researcher", type: "agent", description: "Deep research" },
]

const REPLY = `Here's a tighter version:

> **Team plan: €12 → €14 per seat, from 1 October.** Annual plans keep today's price until renewal.

I moved the annual-plan reassurance up front, since that's what most customers will ask first.`

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** What a custom composer gets: the same names the Prompt Input Studio's code uses. */
type ComposerApi = {
  status: ChatStatus
  sendMessage: (message: { text: string; files?: File[] }) => void
  stop: () => void
}

/** Renders a custom composer as its own component, so its callbacks are ordinary props. */
function ComposerSlot({ render, ...api }: ComposerApi & { render: (api: ComposerApi) => React.ReactNode }) {
  return render(api)
}

/**
 * A full chat screen. Pass `composer` to replace the default composer, e.g. with code from
 * the Prompt Input Studio; the conversation itself is scripted.
 */
export default function ChatApp({ composer }: { composer?: (api: ComposerApi) => React.ReactNode }) {
  const [active, setActive] = React.useState("t1")
  const [threadsOpen, setThreadsOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [turns, setTurns] = React.useState<Turn[]>([])
  const [status, setStatus] = React.useState<ChatStatus>("ready")
  const [used, setUsed] = React.useState(38_000)
  const run = React.useRef(0)

  const send = async (text: string) => {
    const id = ++run.current
    const alive = () => run.current === id
    const replyId = `a-${Date.now()}`
    setTurns((t) => [...t, { id: `u-${Date.now()}`, from: "user", text }])
    setStatus("submitted")
    await wait(600)
    if (!alive()) return
    setStatus("streaming")
    setTurns((t) => [...t, { id: replyId, from: "assistant", text: "" }])
    let out = ""
    for (const w of REPLY.split(/(\s+)/)) {
      if (!alive()) return
      out += w
      const snapshot = out
      setTurns((t) => t.map((x) => (x.id === replyId ? { ...x, text: snapshot } : x)))
      await wait(14 + Math.random() * 14)
    }
    setUsed((u) => u + 2_400)
    setStatus("ready")
  }

  const stop = () => {
    run.current++
    setStatus("ready")
  }

  const visible = threads.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
  const groups = ["Today", "Yesterday", "Last week"] as const
  const title = threads.find((t) => t.id === active)?.title ?? "New conversation"

  /** Opens a thread, or a new conversation for "". On small screens it also closes the thread sheet. */
  const open = (id: string) => {
    run.current++
    setActive(id)
    setTurns([])
    setStatus("ready")
    setThreadsOpen(false)
  }

  const threadList = (
    <>
      <div className="flex flex-col gap-2 p-3">
        <Button variant="outline" size="sm" className="justify-start" onClick={() => open("")}>
          <SparkleIcon />
          New conversation
        </Button>
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
        </InputGroup>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 pb-3">
        {groups.map((g) => {
          const items = visible.filter((t) => t.group === g)
          if (items.length === 0) return null
          return (
            <div key={g} className="flex flex-col gap-0.5">
              <span className="px-2 pb-1 text-xs text-muted-foreground">{g}</span>
              {items.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-current={active === t.id ? "page" : undefined}
                  onClick={() => open(t.id)}
                  className="truncate rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground aria-[current=page]:bg-sidebar-accent aria-[current=page]:text-foreground pointer-coarse:py-2.5"
                >
                  {t.title}
                </button>
              ))}
            </div>
          )
        })}
      </nav>
    </>
  )

  return (
    <div className="flex h-160 max-h-dvh w-full overflow-hidden rounded-2xl border bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar md:flex">{threadList}</aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 max-md:pl-2">
          <Sheet open={threadsOpen} onOpenChange={setThreadsOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon-sm" aria-label="Conversations" className="md:hidden" />}
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Conversations</SheetTitle>
              </SheetHeader>
              <div className="flex min-h-0 flex-1 flex-col">{threadList}</div>
            </SheetContent>
          </Sheet>
          <h3 className="truncate text-sm font-medium">{title}</h3>
          <div className="ml-auto flex items-center gap-1">
            <ContextMeter
              used={used}
              max={200_000}
              breakdown={[
                { label: "System and tools", tokens: 9_800 },
                { label: "Messages", tokens: used - 9_800 },
              ]}
            />
            <ModelPicker models={models} defaultValue="sonnet" />
          </div>
        </header>

        <Conversation>
          {turns.length === 0 ? (
            <ConversationEmpty title="What are we working on?" description="Mention a file with @, or dictate.">
              <Suggestions className="justify-center">
                <Suggestion suggestion="Tighten the pricing announcement" onSelect={send} />
                <Suggestion suggestion="Summarize yesterday's thread" onSelect={send} />
              </Suggestions>
            </ConversationEmpty>
          ) : (
            <ConversationContent className="gap-5">
              {turns.map((t) => (
                <Message key={t.id} from={t.from}>
                  <MessageContent>
                    {t.from === "user" ? (
                      t.text
                    ) : t.text ? (
                      <>
                        <Response isAnimating={status === "streaming"}>{t.text}</Response>
                        {status === "ready" && (
                          <MessageActions>
                            <MessageAction label="Copy">
                              <CopyIcon />
                            </MessageAction>
                            <MessageAction label="Regenerate">
                              <RegenerateIcon />
                            </MessageAction>
                          </MessageActions>
                        )}
                      </>
                    ) : (
                      <TypingIndicator />
                    )}
                  </MessageContent>
                </Message>
              ))}
              {status === "submitted" && (
                <Message from="assistant">
                  <MessageContent>
                    <TypingIndicator />
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
          )}
          <ConversationScrollButton />
        </Conversation>

        <div className="mx-auto mb-(--safe-bottom) w-full max-w-3xl p-3 pt-0">
          {composer ? (
            <ComposerSlot
              render={composer}
              status={status}
              sendMessage={({ text }) => text && send(text)}
              stop={stop}
            />
          ) : (
            <PromptInput status={status} onSubmit={({ text }) => text && send(text)}>
              <PromptInputMentions items={mentionables} />
              <PromptInputTextarea placeholder="Message, or @ to mention" />
              <PromptInputToolbar>
                <PromptInputTools>
                  <PromptInputAttachButton />
                </PromptInputTools>
                <div className="flex items-center gap-1">
                  <PromptInputMic />
                  <PromptInputSubmit onStop={stop} />
                </div>
              </PromptInputToolbar>
            </PromptInput>
          )}
        </div>
      </section>
    </div>
  )
}
