"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"

import { AgentSteps, type AgentStep } from "@/components/ai/agent-steps"
import { Conversation, ConversationContent } from "@/components/ai/conversation"
import { Message, MessageContent } from "@/components/ai/message"
import { TypingIndicator } from "@/components/ai/shimmer"
import { Suggestion, Suggestions } from "@/components/ai/suggestions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { AgentIcon, CheckIcon } from "@/lib/icons"
import { spring } from "@/lib/motion"

type Answers = { goal?: string; tools?: string[]; approval?: string }

const goals = ["Customer support", "Research", "Sales outreach"]
const tools = ["Web search", "Gmail", "Linear", "Stripe", "Notion"]
const approvals = ["Before every action", "Only irreversible actions", "Never"]

const nameFor: Record<string, string> = {
  "Customer support": "Support agent",
  Research: "Research agent",
  "Sales outreach": "Outreach agent",
}

type Turn = { from: "user" | "assistant"; text: string }

export default function AgentOnboarding() {
  const [answers, setAnswers] = React.useState<Answers>({})
  const [turns, setTurns] = React.useState<Turn[]>([
    { from: "assistant", text: "Hi! Let's set up your first agent. What should it help with?" },
  ])
  const [typing, setTyping] = React.useState(false)
  const [picked, setPicked] = React.useState<string[]>(["Web search"])
  const step = !answers.goal ? 0 : !answers.tools ? 1 : !answers.approval ? 2 : 3

  const reply = (user: string, next: Answers, question?: string) => {
    setTurns((t) => [...t, { from: "user", text: user }])
    setAnswers(next)
    if (!question) return
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setTurns((t) => [...t, { from: "assistant", text: question }])
    }, 700)
  }

  const steps: AgentStep[] = [
    { id: "goal", label: "Goal", detail: answers.goal },
    { id: "tools", label: "Tools", detail: answers.tools?.join(", ") },
    { id: "approval", label: "Approvals", detail: answers.approval },
    { id: "review", label: "Review" },
  ].map((s, i) => ({ ...s, status: i < step ? "complete" : i === step ? "active" : "pending" }))

  const reset = () => {
    setAnswers({})
    setPicked(["Web search"])
    setTurns([{ from: "assistant", text: "Hi! Let's set up your first agent. What should it help with?" }])
  }

  return (
    <div className="flex h-160 w-full overflow-hidden rounded-2xl border bg-background">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Conversation>
          <ConversationContent className="gap-4">
            {turns.map((t, i) => (
              <Message key={i} from={t.from}>
                <MessageContent>{t.text}</MessageContent>
              </Message>
            ))}
            {typing && (
              <Message from="assistant">
                <MessageContent>
                  <TypingIndicator />
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
        </Conversation>

        <div className="min-h-24 border-t p-4">
          <AnimatePresence mode="wait">
            {!typing && (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={spring.gentle}
              >
                {step === 0 && (
                  <Suggestions>
                    {goals.map((g) => (
                      <Suggestion
                        key={g}
                        suggestion={g}
                        onSelect={(v) =>
                          reply(v, { goal: v }, "Which tools can it use? Pick any, you can change this later.")
                        }
                      />
                    ))}
                  </Suggestions>
                )}
                {step === 1 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {tools.map((t) => (
                      <Toggle
                        key={t}
                        variant="outline"
                        size="sm"
                        pressed={picked.includes(t)}
                        onPressedChange={(p) => setPicked((all) => (p ? [...all, t] : all.filter((x) => x !== t)))}
                      >
                        {t}
                      </Toggle>
                    ))}
                    <Button
                      size="sm"
                      className="ml-auto"
                      disabled={picked.length === 0}
                      onClick={() =>
                        reply(picked.join(", "), { ...answers, tools: picked }, "When should it ask you before acting?")
                      }
                    >
                      Continue
                    </Button>
                  </div>
                )}
                {step === 2 && (
                  <Suggestions>
                    {approvals.map((a) => (
                      <Suggestion
                        key={a}
                        suggestion={a}
                        onSelect={(v) =>
                          reply(
                            v,
                            { ...answers, approval: v },
                            "All set. Review the card on the right and create your agent.",
                          )
                        }
                      />
                    ))}
                  </Suggestions>
                )}
                {step === 3 && (
                  <div className="flex items-center justify-between gap-2">
                    <Button variant="ghost" size="sm" onClick={reset}>
                      Start over
                    </Button>
                    <Button size="sm" onClick={() => toast(`${nameFor[answers.goal!]} created`)}>
                      Create agent
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <aside className="hidden w-80 shrink-0 flex-col gap-6 border-l bg-card/50 p-5 md:flex">
        <motion.div layout transition={spring.gentle} className="flex flex-col gap-4 rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-5">
              <AgentIcon />
            </span>
            <div className="min-w-0">
              <div className="truncate font-medium">{answers.goal ? nameFor[answers.goal] : "New agent"}</div>
              <div className="text-xs text-muted-foreground">{answers.goal ?? "Waiting for a goal"}</div>
            </div>
          </div>
          <AnimatePresence initial={false}>
            {answers.tools && (
              <motion.div
                key="tools"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={spring.gentle}
                className="flex flex-wrap gap-1 overflow-hidden"
              >
                {answers.tools.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </motion.div>
            )}
            {answers.approval && (
              <motion.div
                key="approval"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={spring.gentle}
                className="flex items-center gap-1.5 overflow-hidden text-xs text-muted-foreground [&_svg]:size-3.5"
              >
                <CheckIcon />
                Asks: {answers.approval.toLowerCase()}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <AgentSteps steps={steps} />
      </aside>
    </div>
  )
}
