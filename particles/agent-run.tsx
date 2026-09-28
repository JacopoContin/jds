"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"

import { AgentSteps, type AgentStep } from "@/components/ai/agent-steps"
import { Approval, type ApprovalDecision } from "@/components/ai/approval"
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai/conversation"
import { Message, MessageAction, MessageActions, MessageContent } from "@/components/ai/message"
import {
  PromptInput,
  PromptInputAttachButton,
  PromptInputAttachments,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  type ChatStatus,
} from "@/components/ai/prompt-input"
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai/reasoning"
import { Response } from "@/components/ai/response"
import { TypingIndicator } from "@/components/ai/shimmer"
import { Sources, type Source } from "@/components/ai/sources"
import { Suggestion, Suggestions } from "@/components/ai/suggestions"
import { ToolCall, ToolCallContent, ToolCallHeader, ToolCallSection, type ToolState } from "@/components/ai/tool-call"
import { CopyIcon, RegenerateIcon, ThumbsDownIcon, ThumbsUpIcon } from "@/lib/icons"

const PROMPT = "Refund order #4821 and let the customer know."

const REASONING =
  "The customer reported a damaged item. I should confirm the order exists, check it is inside the 30-day refund window, then issue the refund. Refunds move money, so I need approval before executing."

const RESPONSE = `Done. Order **#4821** was refunded in full.

| Item | Amount |
| --- | --- |
| Ceramic pour-over set | €64.00 |
| Shipping | €4.90 |
| **Total refunded** | **€68.90** |

I also sent Maria a confirmation email. Funds usually land in **3 to 5 business days**, per the payment provider's policy.

\`\`\`ts
await refunds.create({ orderId: "4821", amount: 6890, reason: "damaged" })
\`\`\`
`

const SOURCES: Source[] = [
  { url: "https://docs.stripe.com/refunds", title: "Refund and cancel payments" },
  { url: "https://example.com/policies/returns", title: "Returns and refunds policy" },
  { url: "https://example.com/orders/4821", title: "Order #4821" },
]

const STEP_LABELS = ["Look up order #4821", "Check refund eligibility", "Issue refund", "Email the customer"]

type Phase =
  | "idle"
  | "submitted"
  | "reasoning"
  | "steps"
  | "tool"
  | "approval"
  | "executing"
  | "responding"
  | "done"
  | "denied"

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function AgentRun() {
  const [phase, setPhase] = React.useState<Phase>("idle")
  const [userText, setUserText] = React.useState<string | null>(null)
  const [reasoning, setReasoning] = React.useState("")
  const [activeStep, setActiveStep] = React.useState(-1)
  const [toolState, setToolState] = React.useState<ToolState>("input-streaming")
  const [decision, setDecision] = React.useState<ApprovalDecision>("pending")
  const [response, setResponse] = React.useState("")
  const run = React.useRef(0)
  const approvalResolver = React.useRef<((ok: boolean) => void) | null>(null)

  const stream = async (text: string, set: (s: string) => void, id: number, speed = 14) => {
    const words = text.split(/(\s+)/)
    let out = ""
    for (const w of words) {
      if (run.current !== id) return false
      out += w
      set(out)
      await wait(speed + Math.random() * speed)
    }
    return true
  }

  const start = async (text: string) => {
    const id = ++run.current
    const alive = () => run.current === id
    setUserText(text)
    setReasoning("")
    setResponse("")
    setActiveStep(-1)
    setToolState("input-streaming")
    setDecision("pending")

    setPhase("submitted")
    await wait(700)
    if (!alive()) return
    setPhase("reasoning")
    if (!(await stream(REASONING, setReasoning, id, 22))) return
    await wait(300)
    if (!alive()) return

    setPhase("steps")
    setActiveStep(0)
    await wait(900)
    if (!alive()) return
    setActiveStep(1)
    setPhase("tool")
    await wait(500)
    setToolState("input-available")
    await wait(1100)
    if (!alive()) return
    setToolState("output-available")
    await wait(400)
    setActiveStep(2)

    setPhase("approval")
    const ok = await new Promise<boolean>((resolve) => (approvalResolver.current = resolve))
    if (!alive()) return
    setDecision(ok ? "approved" : "denied")
    if (!ok) {
      setPhase("denied")
      return
    }

    setPhase("executing")
    await wait(900)
    if (!alive()) return
    setActiveStep(3)
    await wait(700)
    if (!alive()) return
    setActiveStep(4)
    setPhase("responding")
    if (!(await stream(RESPONSE, setResponse, id, 10))) return
    setPhase("done")
  }

  const stop = () => {
    run.current++
    approvalResolver.current = null
    setPhase((p) => (p === "idle" ? p : "done"))
  }

  const status: ChatStatus =
    phase === "submitted" ? "submitted" : phase === "idle" || phase === "done" || phase === "denied" ? "ready" : "streaming"

  const steps: AgentStep[] = STEP_LABELS.map((label, i) => ({
    id: label,
    label,
    status:
      phase === "denied" && i === 2
        ? "error"
        : i < activeStep
          ? "complete"
          : i === activeStep
            ? "active"
            : "pending",
    detail: i === 1 && activeStep > 1 ? "Delivered 6 days ago, within the 30-day window" : undefined,
  }))

  const reached = (p: Phase) => {
    const order: Phase[] = ["idle", "submitted", "reasoning", "steps", "tool", "approval", "executing", "responding", "done"]
    if (phase === "denied") return order.indexOf(p) <= order.indexOf("approval")
    return order.indexOf(phase) >= order.indexOf(p)
  }

  return (
    <div className="flex h-160 flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl shadow-black/20">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <span className="size-2 rounded-full bg-ember" />
        <span className="text-sm font-medium">Support agent</span>
        <span className="ml-auto font-mono text-xs text-muted-foreground">demo · scripted</span>
      </div>

      <Conversation>
        <ConversationContent className="gap-5">
          {!userText && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
              <p className="font-heading text-3xl">What should the agent do?</p>
              <Suggestions className="justify-center">
                <Suggestion suggestion={PROMPT} onSelect={start} />
              </Suggestions>
            </div>
          )}

          {userText && (
            <Message from="user">
              <MessageContent>{userText}</MessageContent>
            </Message>
          )}

          {userText && (
            <Message from="assistant">
              <MessageContent>
                {phase === "submitted" && <TypingIndicator />}

                {reached("reasoning") && (
                  <Reasoning isStreaming={phase === "reasoning"}>
                    <ReasoningTrigger />
                    <ReasoningContent>{reasoning}</ReasoningContent>
                  </Reasoning>
                )}

                {reached("steps") && <AgentSteps steps={steps} />}

                {reached("tool") && (
                  <ToolCall>
                    <ToolCallHeader name="orders.lookup" state={toolState} />
                    <ToolCallContent>
                      <ToolCallSection label="Input" value={{ orderId: "4821" }} />
                      {toolState === "output-available" && (
                        <ToolCallSection
                          label="Output"
                          value={{ status: "delivered", total: 68.9, currency: "EUR", deliveredAt: "2026-09-22" }}
                        />
                      )}
                    </ToolCallContent>
                  </ToolCall>
                )}

                {reached("approval") && (
                  <Approval
                    title="Refund €68.90 to Maria Rossi"
                    description="This moves money back to the original payment method and can't be undone."
                    decision={decision}
                    approveLabel="Refund"
                    onApprove={() => approvalResolver.current?.(true)}
                    onDeny={() => approvalResolver.current?.(false)}
                  />
                )}

                {phase === "denied" && (
                  <p className="text-muted-foreground">Understood, I won&apos;t refund the order. Anything else?</p>
                )}

                {reached("responding") && (
                  <>
                    <Response isAnimating={phase === "responding"}>{response}</Response>
                    <AnimatePresence>
                      {phase === "done" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
                          <Sources sources={SOURCES} />
                          <MessageActions>
                            <MessageAction label="Copy" onClick={() => toast("Copied to clipboard")}>
                              <CopyIcon />
                            </MessageAction>
                            <MessageAction label="Replay" onClick={() => start(PROMPT)}>
                              <RegenerateIcon />
                            </MessageAction>
                            <MessageAction label="Good response" onClick={() => toast("Thanks for the feedback")}>
                              <ThumbsUpIcon />
                            </MessageAction>
                            <MessageAction label="Bad response" onClick={() => toast("Thanks for the feedback")}>
                              <ThumbsDownIcon />
                            </MessageAction>
                          </MessageActions>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="p-3 pt-0">
        <PromptInput status={status} onSubmit={({ text }) => start(text || PROMPT)}>
          <PromptInputAttachments />
          <PromptInputTextarea placeholder={`Try: ${PROMPT}`} />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputAttachButton />
            </PromptInputTools>
            <PromptInputSubmit onStop={stop} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  )
}
