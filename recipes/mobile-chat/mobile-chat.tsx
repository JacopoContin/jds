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
import {
  Conversation,
  ConversationContent,
  ConversationEmpty,
  ConversationScrollButton,
} from "@/components/ai/conversation"
import { Message, MessageContent } from "@/components/ai/message"
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
import { Response } from "@/components/ai/response"
import { TypingIndicator } from "@/components/ai/shimmer"
import { Suggestion, Suggestions } from "@/components/ai/suggestions"
import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { CloseIcon, CopyIcon, DownloadIcon } from "@/lib/icons"

/** A generated document or file. In a real app these come from your agent's tool output. */
type ChatArtifact = { id: string; title: string; description: string; kind: "document" | "code"; content: string }
type Turn = { id: string; from: "user" | "assistant"; text: string; artifact?: string }

const artifacts: Record<string, ChatArtifact> = {
  email: {
    id: "email",
    title: "Pricing announcement",
    description: "Email · 180 words",
    kind: "document",
    content: `## New pricing, starting March 1

Hi there,

We're simplifying our plans. From March 1, **Team** becomes **Pro** and includes everything you use today, plus unlimited agents.

**If you're on an annual plan, nothing changes until your renewal.** You keep your current price for the rest of your term.

What's new in Pro:

- Unlimited agents and voice minutes
- Shared workspaces with roles
- Priority support

Questions? Reply to this email and a person will get back to you.`,
  },
  banner: {
    id: "banner",
    title: "pricing-banner.tsx",
    description: "React component · 24 lines",
    kind: "code",
    content: `\`\`\`tsx
import { Button } from "@/components/ui/button"

export function PricingBanner({ onLearnMore }: { onLearnMore: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">New pricing from March 1</p>
        <p className="text-sm text-muted-foreground">
          Annual plans keep their price until renewal.
        </p>
      </div>
      <Button size="sm" onClick={onLearnMore}>
        Learn more
      </Button>
    </div>
  )
}
\`\`\``,
  },
}

const opening: Turn[] = [
  { id: "u1", from: "user", text: "Draft the email announcing the new pricing." },
  {
    id: "a1",
    from: "assistant",
    text: "Here's a first draft. I led with what annual customers keep, since that's what most will ask first.",
    artifact: "email",
  },
]

const REPLY = "Done. Here's a banner for the dashboard that links to the announcement. It uses your Button and theme tokens."

const models: Model[] = [
  { id: "opus", name: "Claude Opus 5.5", description: "Hardest problems" },
  { id: "sonnet", name: "Claude Sonnet 5.5", description: "Everyday tasks" },
  { id: "haiku", name: "Claude Haiku 4.5", description: "Quick answers" },
]

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * A full-page chat for phones. Generated documents and code show as cards in the reply, and
 * open in a drawer from the bottom: half height to glance, swipe up for full screen, down
 * to get back to the chat. The conversation is scripted; wire your own messages in.
 */
export default function MobileChat({ className }: { className?: string }) {
  const [turns, setTurns] = React.useState<Turn[]>(opening)
  const [status, setStatus] = React.useState<ChatStatus>("ready")
  const [openId, setOpenId] = React.useState<string>()
  // Keeps the drawer's content while it animates closed.
  const [shownId, setShownId] = React.useState<string>()
  const run = React.useRef(0)
  const shown = shownId ? artifacts[shownId] : undefined

  const openArtifact = (id: string) => {
    setShownId(id)
    setOpenId(id)
  }

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
      await wait(18 + Math.random() * 18)
    }
    setTurns((t) => t.map((x) => (x.id === replyId ? { ...x, artifact: "banner" } : x)))
    setStatus("ready")
  }

  const stop = () => {
    run.current++
    setStatus("ready")
  }

  return (
    <div
      data-slot="mobile-chat"
      className={cn("flex h-dvh w-full flex-col overflow-hidden bg-background pt-(--safe-top)", className)}
    >
      <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-3">
        <h1 className="truncate text-sm font-medium">Pricing launch</h1>
        <ModelPicker models={models} defaultValue="sonnet" />
      </header>

      <Conversation>
        {turns.length === 0 ? (
          <ConversationEmpty title="What are we working on?" description="Ask for a draft, a file or a component.">
            <Suggestions className="justify-center">
              <Suggestion suggestion="Make a banner for the dashboard" onSelect={send} />
            </Suggestions>
          </ConversationEmpty>
        ) : (
          <ConversationContent className="gap-5 px-3">
            {turns.map((t) => {
              const artifact = t.artifact ? artifacts[t.artifact] : undefined
              return (
                <Message key={t.id} from={t.from}>
                  <MessageContent>
                    {t.from === "user" ? (
                      t.text
                    ) : t.text ? (
                      <div className="flex flex-col gap-3">
                        <Response isAnimating={status === "streaming" && !artifact}>{t.text}</Response>
                        {artifact && (
                          <ArtifactCard
                            title={artifact.title}
                            description={artifact.description}
                            kind={artifact.kind}
                            active={openId === artifact.id}
                            onOpen={() => openArtifact(artifact.id)}
                          />
                        )}
                      </div>
                    ) : (
                      <TypingIndicator />
                    )}
                  </MessageContent>
                </Message>
              )
            })}
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

      <div className="shrink-0 px-3 pt-0 pb-(--safe-bottom)">
        <div className="pb-3">
          <PromptInput status={status} onSubmit={({ text }) => text && send(text)}>
            <PromptInputTextarea placeholder="Ask for a change" />
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
        </div>
      </div>

      <Drawer
        open={!!openId}
        onOpenChange={(open) => !open && setOpenId(undefined)}
        snapPoints={[0.55, 1]}
        showSwipeHandle
      >
        <DrawerContent aria-label={shown?.title}>
          {shown && (
            <Artifact className="rounded-none border-0 bg-transparent">
              <ArtifactHeader title={<DrawerTitle>{shown.title}</DrawerTitle>} description={shown.description}>
                <ArtifactActions>
                  <ArtifactAction label="Copy" onClick={() => navigator.clipboard?.writeText(shown.content)}>
                    <CopyIcon />
                  </ArtifactAction>
                  <ArtifactAction label="Download">
                    <DownloadIcon />
                  </ArtifactAction>
                  <DrawerClose render={<Button variant="ghost" size="icon-sm" aria-label="Close" />}>
                    <CloseIcon />
                  </DrawerClose>
                </ArtifactActions>
              </ArtifactHeader>
              <ArtifactContent className="pb-(--safe-bottom)">
                <Response>{shown.content}</Response>
              </ArtifactContent>
            </Artifact>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
}
