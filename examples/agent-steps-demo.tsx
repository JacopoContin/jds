"use client"

import * as React from "react"

import { AgentSteps, type AgentStep } from "@/components/ai/agent-steps"

const LABELS = ["Read the brief", "Search competitor pricing", "Draft the comparison table", "Write the summary"]

export default function AgentStepsDemo() {
  const [active, setActive] = React.useState(0)

  React.useEffect(() => {
    const id = setInterval(() => setActive((a) => (a > LABELS.length ? 0 : a + 1)), 1400)
    return () => clearInterval(id)
  }, [])

  const steps: AgentStep[] = LABELS.map((label, i) => ({
    id: label,
    label,
    status: i < active ? "complete" : i === active ? "active" : "pending",
    detail: i === 1 && active > 1 ? "Found 6 sources" : undefined,
  }))

  return <AgentSteps steps={steps} className="w-full max-w-sm" />
}
