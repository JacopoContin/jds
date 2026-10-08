"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "cn"

import { ToolCall, ToolCallContent, ToolCallHeader, ToolCallSection } from "@/components/ai/tool-call"
import { Button } from "@/components/ui/button"
import { CallControls, CallEnd, CallInterrupt, CallMute, CallStatus } from "@/components/voice/call-controls"
import { LiveTranscript } from "@/components/voice/live-transcript"
import { VoiceOrb } from "@/components/voice/voice-orb"
import { Waveform } from "@/components/voice/waveform"
import { SuccessIcon } from "@/lib/icons"
import { duration, ease } from "@/lib/motion"

import type { VoiceAgentSession } from "./session"

/** Orb styling, exactly as the Voice Orb Studio generates it. State and level come from the session. */
type VoiceAgentOrb = Omit<React.ComponentProps<typeof VoiceOrb>, "state" | "level">

/**
 * A voice agent surface: the orb, a live caption and call controls, and (in the split
 * layout) the agent's actions and transcript beside it. Style the orb with `orb`, pick a
 * `layout`, and pass any `VoiceAgentSession`; `useSimulatedVoiceAgent` plays a sample.
 */
function VoiceAgent({
  session,
  orb: orbStyle,
  layout = "split",
  agentName = "Aria",
  subtitle,
  captions = "line",
  waveform = false,
  status = true,
  handoff = true,
  backdrop = "none",
  className,
}: {
  session: VoiceAgentSession
  /** Paste the props from the Voice Orb Studio. Without it, the orb follows the nearest VoiceOrbProvider. */
  orb?: VoiceAgentOrb
  /** "split" shows actions and transcript beside the call; "focus" is the call alone, for dialogs and panels. */
  layout?: "split" | "focus"
  agentName?: string
  /** A line under the agent's name, e.g. what it can help with. */
  subtitle?: string
  /** Under the orb: the latest line, the last few lines as a rolling transcript, or nothing. */
  captions?: "line" | "transcript" | "off"
  /** A live waveform under the orb, driven by the session's level. */
  waveform?: boolean
  /** Connection status and call timer under the name. */
  status?: boolean
  /** The "Hand to a person" button next to the call controls. */
  handoff?: boolean
  /** "glow" puts a soft light in the primary color behind the orb. */
  backdrop?: "none" | "glow"
  className?: string
}) {
  const { call, orb, level, transcript, actions, outcome } = session
  const split = layout === "split"
  const latest = transcript.at(-1)
  const ended = call === "ended"
  const log = React.useRef<HTMLDivElement>(null)
  // A speech-shaped spectrum from the single level: tallest in the middle, rippling with loudness.
  const spectrum = React.useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const center = 1 - Math.abs(i - 13.5) / 14
        return Math.min(1, level * 1.6 * center * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.9 + level * 9))))
      }),
    [level],
  )

  // Keep the newest line in view as the transcript grows.
  React.useEffect(() => {
    const el = log.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [latest?.text, transcript.length])

  return (
    <div
      data-slot="voice-agent"
      data-layout={layout}
      className={cn("@container flex w-full flex-col overflow-hidden rounded-2xl border bg-background md:h-160", className)}
    >
      {/* Split by the component's own width, so it stacks in a dialog or side panel on a wide screen. */}
      <div className={cn("grid min-h-0 flex-1 overflow-y-auto", split && "@3xl:grid-cols-[minmax(0,1fr)_22rem] @3xl:overflow-hidden")}>
      <section
        aria-label="Call"
        className={cn(
          "flex min-h-128 flex-col items-center justify-between gap-6 px-6 py-8",
          backdrop === "glow" && "bg-radial from-primary/15 to-transparent to-70%",
        )}
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-sm font-medium">{agentName}</span>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          {status && <CallStatus state={call} startedAt={session.startedAt} />}
        </div>

        <div className="flex flex-col items-center gap-4">
          <VoiceOrb size={200} {...orbStyle} state={orb} level={level} />
          {waveform && <Waveform spectrum={spectrum} active={orb === "speaking" || orb === "listening"} className="w-48" />}
        </div>

        <div className="flex min-h-20 w-full max-w-md flex-col items-center justify-end text-center" aria-hidden>
          {captions === "transcript" && !ended ? (
            <LiveTranscript segments={transcript.slice(-3)} agentName={agentName} className="w-full text-left" />
          ) : (
            <AnimatePresence mode="popLayout">
              {ended && outcome ? (
                <motion.div
                  key="outcome"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: duration.base, ease: ease.out }}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    <SuccessIcon className="size-4 text-success" />
                    {outcome.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{outcome.detail}</span>
                </motion.div>
              ) : (
                captions !== "off" &&
                latest && (
                  <motion.p
                    key={latest.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: duration.base, ease: ease.out }}
                    className={cn("text-base", latest.speaker === "user" && "text-muted-foreground")}
                  >
                    {latest.text}
                  </motion.p>
                )
              )}
            </AnimatePresence>
          )}
        </div>

        {ended ? (
          <Button variant="outline" onClick={session.restart}>
            Call again
          </Button>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <CallControls>
              <CallMute pressed={session.muted} onPressedChange={session.setMuted} />
              <CallInterrupt disabled={orb !== "speaking"} onClick={session.interrupt} />
              <CallEnd onClick={session.end} />
            </CallControls>
            {handoff && (
              <Button variant="outline" size="sm" onClick={session.transfer} disabled={call !== "connected"}>
                Hand to a person
              </Button>
            )}
          </div>
        )}
      </section>

      {split && (
      <aside aria-label="Agent activity" className="flex min-h-0 flex-col border-t @3xl:border-t-0 @3xl:border-l">
        <div className="flex flex-col gap-2 border-b p-4">
          <h3 className="text-xs font-medium text-muted-foreground">Actions</h3>
          {actions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing yet. Tool calls show up here as the agent works.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {actions.map((a) => (
                <ToolCall key={a.id}>
                  <ToolCallHeader name={a.tool} state={a.state} />
                  <ToolCallContent>
                    <ToolCallSection label="Input" value={a.input} />
                    {a.output !== undefined && <ToolCallSection label="Output" value={a.output} />}
                  </ToolCallContent>
                </ToolCall>
              ))}
            </div>
          )}
        </div>
        <div ref={log} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
          <h3 className="text-xs font-medium text-muted-foreground">Transcript</h3>
          <LiveTranscript segments={transcript} agentName={agentName} />
        </div>
      </aside>
      )}
      </div>
    </div>
  )
}

export { VoiceAgent, type VoiceAgentOrb }
