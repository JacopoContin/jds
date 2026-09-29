"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SparkleIcon } from "@/lib/icons"
import { AgentSidePanel } from "@/recipes/agent-side-panel/agent-side-panel"
import { useSimulatedPanel } from "@/recipes/agent-side-panel/session"

export default function AgentPanelRecipeDemo() {
  const session = useSimulatedPanel()
  const [open, setOpen] = React.useState(true)
  return (
    <div className="relative flex h-160 w-full overflow-hidden rounded-2xl border bg-background">
      {/* Stand-in for your app. */}
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
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
      <AgentSidePanel
        session={session}
        open={open}
        onOpenChange={setOpen}
        panel={{ contained: true, width: 384 }}
        context="Orders · 128 rows"
        placeholder="Which orders are overdue?"
      />
    </div>
  )
}
