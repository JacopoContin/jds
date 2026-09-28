"use client"

import * as React from "react"

import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai/reasoning"
import { Button } from "@/components/ui/button"

const THOUGHT =
  "The user wants the cheapest route that still arrives by Friday. Rail is cheaper but takes two days with a change in Lyon. The direct flight is €40 more and same-day. Friday arrival rules nothing out, so rail wins on price."

export default function ReasoningDemo() {
  const [text, setText] = React.useState("")
  const [streaming, setStreaming] = React.useState(false)

  const run = () => {
    setText("")
    setStreaming(true)
    const words = THOUGHT.split(" ")
    let i = 0
    const id = setInterval(() => {
      i++
      setText(words.slice(0, i).join(" "))
      if (i >= words.length) {
        clearInterval(id)
        setStreaming(false)
      }
    }, 70)
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <Reasoning isStreaming={streaming}>
        <ReasoningTrigger />
        <ReasoningContent>{text || THOUGHT}</ReasoningContent>
      </Reasoning>
      <Button variant="outline" size="sm" className="self-start" onClick={run} disabled={streaming}>
        Think
      </Button>
    </div>
  )
}
