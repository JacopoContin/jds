"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { VoiceIcon } from "@/lib/icons"
import { MobileMinimizedCall } from "@/recipes/mobile-minimized-call/mobile-minimized-call"
import { useSimulatedVoiceAgent } from "@/recipes/voice-agent/session"

/** A stand-in for your app's screen, so the pill has something to float over. */
const agenda = [
  { time: "9:00", title: "Standup", detail: "Team room" },
  { time: "11:00", title: "Roadmap sync", detail: "Video call" },
  { time: "2:00", title: "Design review", detail: "With Luca" },
  { time: "4:30", title: "1:1", detail: "With Sam" },
  { time: "6:00", title: "Gym", detail: "Personal" },
]

export default function MobileMinimizedCallScreen() {
  const session = useSimulatedVoiceAgent()
  const [expanded, setExpanded] = React.useState(false)

  return (
    <MobileMinimizedCall
      session={session}
      expanded={expanded}
      onExpandedChange={setExpanded}
      subtitle="Calendar and email assistant"
    >
      <div className="flex h-full flex-col overflow-y-auto bg-background px-4 pt-(--safe-top) pb-(--safe-bottom)">
        <header className="flex items-end justify-between pt-20 pb-4">
          <div>
            <p className="text-xs text-muted-foreground">Wednesday</p>
            <h1 className="text-2xl font-semibold">Today</h1>
          </div>
          <Button variant="outline" onClick={session.restart}>
            <VoiceIcon />
            Call Aria
          </Button>
        </header>
        <ul className="flex flex-col divide-y rounded-xl border bg-card">
          {agenda.map((e) => (
            <li key={e.time} className="flex items-center gap-4 px-4 py-3">
              <span className="w-12 font-mono text-sm text-muted-foreground tabular-nums">{e.time}</span>
              <span className="flex flex-col">
                <span className="text-sm font-medium">{e.title}</span>
                <span className="text-xs text-muted-foreground">{e.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </MobileMinimizedCall>
  )
}
