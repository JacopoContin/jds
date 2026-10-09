"use client"

import * as React from "react"
import { AnimatePresence, motion, type PanInfo } from "motion/react"
import { cn } from "cn"

import { ToolCall, ToolCallContent, ToolCallHeader, ToolCallSection } from "@/components/ai/tool-call"
import { Button } from "@/components/ui/button"
import { CallControls, CallEnd, CallInterrupt, CallMute, CallStatus } from "@/components/voice/call-controls"
import { LiveTranscript } from "@/components/voice/live-transcript"
import { VoiceOrb } from "@/components/voice/voice-orb"
import { ChevronDownIcon, ChevronUpIcon, SuccessIcon } from "@/lib/icons"
import { duration, ease, spring } from "@/lib/motion"

import type { VoiceAgentSession } from "../voice-agent/session"

/** Orb styling, exactly as the Voice Orb Studio generates it. State and level come from the session. */
type MobileVoiceAgentOrb = Omit<React.ComponentProps<typeof VoiceOrb>, "state" | "level">

/** Height of the collapsed sheet, and the space the open sheet leaves for the shrunken orb. */
const PEEK = 64
const OPEN_GAP = 140
/** How far, or how fast, a drag on the handle has to go to open or close the sheet. */
const SWIPE_OFFSET = 40
const SWIPE_VELOCITY = 400

/**
 * A portrait, full-screen voice agent for phones: the orb and a live caption up top, the
 * agent's actions and transcript in a sheet you drag up, and call controls in thumb reach.
 * Reads the same `VoiceAgentSession` as `<VoiceAgent>`, so one backend serves both.
 */
function MobileVoiceAgent({
  session,
  orb: orbStyle,
  agentName = "Aria",
  subtitle,
  onMinimize,
  className,
}: {
  session: VoiceAgentSession
  /** Paste the props from the Voice Orb Studio. Without it, the orb follows the nearest VoiceOrbProvider. */
  orb?: MobileVoiceAgentOrb
  agentName?: string
  /** A line under the agent's name, e.g. what it can help with. */
  subtitle?: string
  /** Shows a minimize button in the header, e.g. to shrink the call to a pill while the user keeps using your app. */
  onMinimize?: () => void
  className?: string
}) {
  const { call, orb, level, transcript, actions, outcome } = session
  const [open, setOpen] = React.useState(false)
  const [height, setHeight] = React.useState(0)
  const stage = React.useRef<HTMLDivElement>(null)
  const log = React.useRef<HTMLDivElement>(null)
  const panned = React.useRef(false)
  const latest = transcript.at(-1)
  const ended = call === "ended"
  const sheetId = React.useId()

  // The open sheet fills the stage minus room for the orb, so track the stage's height.
  React.useEffect(() => {
    const el = stage.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Keep the newest line in view as the transcript grows.
  React.useEffect(() => {
    const el = log.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [latest?.text, transcript.length, open])

  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
    if (info.offset.y < -SWIPE_OFFSET || info.velocity.y < -SWIPE_VELOCITY) setOpen(true)
    else if (info.offset.y > SWIPE_OFFSET || info.velocity.y > SWIPE_VELOCITY) setOpen(false)
  }

  return (
    <div
      data-slot="mobile-voice-agent"
      data-sheet={open ? "open" : "closed"}
      className={cn(
        "flex h-dvh w-full touch-manipulation flex-col overflow-hidden bg-background pt-(--safe-top)",
        className,
      )}
    >
      <header className="relative flex flex-col items-center gap-1 px-6 pt-6 text-center">
        {onMinimize && (
          <Button variant="ghost" size="icon" aria-label="Minimize call" onClick={onMinimize} className="absolute top-4 left-4">
            <ChevronDownIcon />
          </Button>
        )}
        <span className="text-sm font-medium">{agentName}</span>
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        <CallStatus state={call} startedAt={session.startedAt} />
      </header>

      <div ref={stage} className="relative flex min-h-0 flex-1 flex-col items-center gap-6 px-6 pt-8">
        <motion.div
          animate={{ scale: open ? 0.45 : 1 }}
          transition={spring.gentle}
          className="origin-top"
        >
          <VoiceOrb size={220} {...orbStyle} state={orb} level={level} />
        </motion.div>

        <motion.div
          animate={{ opacity: open ? 0 : 1 }}
          transition={{ duration: duration.fast }}
          className="flex w-full max-w-sm flex-col items-center text-center"
          aria-hidden
        >
          <AnimatePresence mode="popLayout">
            {ended && outcome ? (
              <motion.div
                key="outcome"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: duration.base, ease: ease.out }}
                className="flex flex-col items-center gap-1"
              >
                <span className="flex items-center gap-1.5 text-base font-medium">
                  <SuccessIcon className="size-4 text-success" />
                  {outcome.title}
                </span>
                <span className="text-sm text-muted-foreground">{outcome.detail}</span>
              </motion.div>
            ) : (
              latest && (
                <motion.p
                  key={latest.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: duration.base, ease: ease.out }}
                  className={cn("line-clamp-4 text-lg leading-snug", latest.speaker === "user" && "text-muted-foreground")}
                >
                  {latest.text}
                </motion.p>
              )
            )}
          </AnimatePresence>
        </motion.div>

        <motion.section
          aria-label="Agent activity"
          initial={false}
          animate={{ height: open && height ? height - OPEN_GAP : PEEK }}
          transition={spring.gentle}
          className="absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-2xl border-x border-t bg-card shadow-lg"
        >
          <motion.button
            type="button"
            aria-expanded={open}
            aria-controls={sheetId}
            onPanStart={() => (panned.current = true)}
            onPanEnd={onPanEnd}
            onClick={() => {
              if (!panned.current) setOpen((o) => !o)
              panned.current = false
            }}
            className="flex w-full shrink-0 touch-none flex-col items-center gap-2 px-4 pt-2 pb-3 outline-none focus-visible:bg-accent"
          >
            <span className="h-1 w-9 rounded-full bg-border" />
            <span className="flex w-full items-center justify-between text-sm">
              <span className="font-medium">Transcript</span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                {actions.length > 0 && `${actions.length} ${actions.length === 1 ? "action" : "actions"}`}
                <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring.snappy} className="flex">
                  <ChevronUpIcon className="size-4" />
                </motion.span>
              </span>
            </span>
          </motion.button>

          <div ref={log} id={sheetId} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 pb-4">
            {actions.length > 0 && (
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
            {transcript.length === 0 ? (
              <p className="text-sm text-muted-foreground">The conversation shows up here as you talk.</p>
            ) : (
              <LiveTranscript segments={transcript} agentName={agentName} />
            )}
          </div>
        </motion.section>
      </div>

      <footer className="flex shrink-0 justify-center border-t bg-card px-6 pt-4 pb-(--safe-bottom)">
        <div className="flex min-h-12 items-center pb-4">
          {ended ? (
            <Button size="lg" variant="outline" onClick={session.restart}>
              Call again
            </Button>
          ) : (
            <CallControls>
              <CallMute pressed={session.muted} onPressedChange={session.setMuted} />
              <CallInterrupt disabled={orb !== "speaking"} onClick={session.interrupt} />
              <CallEnd onClick={session.end} />
            </CallControls>
          )}
        </div>
      </footer>
    </div>
  )
}

export { MobileVoiceAgent, type MobileVoiceAgentOrb }
