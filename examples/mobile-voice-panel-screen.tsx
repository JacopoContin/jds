"use client"

import * as React from "react"

import {
  glowProps,
  VOICE_PANEL_MESSAGE,
  VOICE_PANEL_READY,
  voicePanelDefaults,
  type VoicePanelConfig,
} from "@/components/studio/voice-panel-config"
import { Button } from "@/components/ui/button"
import { VoiceIcon } from "@/lib/icons"
import { useSimulatedPushToTalk } from "@/recipes/mobile-push-to-talk/session"
import { MobileVoicePanel } from "@/recipes/mobile-voice-panel/mobile-voice-panel"
import { useSimulatedVoiceAgent } from "@/recipes/voice-agent/session"

/** A stand-in for your app's screen, so the panel has a page to sit over. */
const agenda = [
  { time: "9:00", title: "Standup", detail: "Team room" },
  { time: "11:00", title: "Roadmap sync", detail: "Video call" },
  { time: "2:00", title: "Design review", detail: "With Luca" },
  { time: "4:30", title: "1:1", detail: "With Sam" },
  { time: "6:00", title: "Gym", detail: "Personal" },
]

export default function MobileVoicePanelScreen() {
  const session = useSimulatedVoiceAgent()
  const talk = useSimulatedPushToTalk()
  const [open, setOpen] = React.useState(true)
  const [config, setConfig] = React.useState<VoicePanelConfig>(voicePanelDefaults)

  // Inside the Voice Panel Studio, the studio drives the panel's look. Say we're listening, then follow it.
  React.useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== VOICE_PANEL_MESSAGE) return
      setConfig(e.data.config)
      setOpen(true)
    }
    window.addEventListener("message", onMessage)
    if (window.parent !== window) window.parent.postMessage({ type: VOICE_PANEL_READY }, window.location.origin)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  return (
    <MobileVoicePanel
      {...(config.mode === "push-to-talk"
        ? { mode: "push-to-talk" as const, session: talk }
        : { mode: "hands-free" as const, session })}
      open={open}
      onOpenChange={setOpen}
      reserveTop={104}
      layout={config.layout}
      surface={config.surface}
      controls={config.controls}
      glow={glowProps(config)}
    >
      <div className="flex h-full flex-col overflow-y-auto bg-background px-4 pt-(--safe-top) pb-(--safe-bottom)">
        <header className="flex items-end justify-between pt-6 pb-4">
          <div>
            <p className="text-xs text-muted-foreground">Wednesday</p>
            <h1 className="text-2xl font-semibold">Today</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              session.restart()
              setOpen(true)
            }}
          >
            <VoiceIcon />
            Ask Aria
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
    </MobileVoicePanel>
  )
}
