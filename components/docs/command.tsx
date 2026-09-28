"use client"

import * as React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/docs/copy-button"

const managers = {
  pnpm: { run: "pnpm dlx", install: "pnpm add" },
  npm: { run: "npx", install: "npm install" },
  yarn: { run: "yarn dlx", install: "yarn add" },
  bun: { run: "bunx --bun", install: "bun add" },
} as const

type Manager = keyof typeof managers

const PM_KEY = "jds:pm"

/**
 * A command with package manager tabs. `command` omits the runner:
 * "shadcn@latest add @jds/button" (run) or "motion cn" (install).
 */
export function Command({ command, type = "run" }: { command: string; type?: "run" | "install" }) {
  const [pm, setPm] = React.useState<Manager>("pnpm")

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(PM_KEY) as Manager | null
      if (saved && saved in managers) queueMicrotask(() => setPm(saved))
    } catch {}
  }, [])

  return (
    <Tabs
      value={pm}
      onValueChange={(v) => {
        setPm(v as Manager)
        try {
          localStorage.setItem(PM_KEY, v as string)
        } catch {}
      }}
      className="gap-0 overflow-hidden rounded-xl border bg-card"
    >
      <div className="flex items-center justify-between border-b px-2 py-1.5">
        <TabsList variant="line">
          {Object.keys(managers).map((m) => (
            <TabsTrigger key={m} value={m} className="font-mono text-xs">
              {m}
            </TabsTrigger>
          ))}
        </TabsList>
        <CopyButton value={`${managers[pm][type]} ${command}`} />
      </div>
      {Object.entries(managers).map(([m, runners]) => (
        <TabsContent key={m} value={m} className="overflow-x-auto px-4 py-3 font-mono text-[13px] whitespace-nowrap">
          <span className="text-muted-foreground">{runners[type]}</span> {command}
        </TabsContent>
      ))}
    </Tabs>
  )
}
