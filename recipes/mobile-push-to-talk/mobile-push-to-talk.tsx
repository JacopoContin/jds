"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "cn"

import { LiveTranscript } from "@/components/voice/live-transcript"
import { VoiceOrb, type VoiceState } from "@/components/voice/voice-orb"
import { ChevronUpIcon, CloseIcon, MicIcon } from "@/lib/icons"
import { duration, ease, spring } from "@/lib/motion"

import type { PushToTalkSession } from "./session"

/** Orb styling, exactly as the Voice Orb Studio generates it. State and level come from the session. */
type MobilePushToTalkOrb = Omit<React.ComponentProps<typeof VoiceOrb>, "state" | "level">

/** How far up the thumb slides, in px, before letting go cancels instead of sends. */
const CANCEL_DISTANCE = 72
/** How far the button follows the thumb, so the slide feels connected without covering the hint. */
const MAX_LIFT = 16

const orbState: Record<PushToTalkSession["state"], VoiceState> = {
  idle: "idle",
  recording: "listening",
  thinking: "thinking",
  speaking: "speaking",
}

/**
 * Hold-to-talk voice for phones, for noisy places and one hand: hold the big button to talk,
 * let go to send, slide up to cancel. Holding while the agent speaks cuts it off.
 * The keyboard works too: hold Space or Enter on the button, Escape cancels.
 */
function MobilePushToTalk({
  session,
  orb: orbStyle,
  agentName = "Aria",
  subtitle,
  className,
}: {
  session: PushToTalkSession
  /** Paste the props from the Voice Orb Studio. Without it, the orb follows the nearest VoiceOrbProvider. */
  orb?: MobilePushToTalkOrb
  agentName?: string
  /** A line under the agent's name, e.g. what it can help with. */
  subtitle?: string
  className?: string
}) {
  const { state, level, transcript, draft } = session
  const [holding, setHolding] = React.useState(false)
  const [armed, setArmed] = React.useState(false)
  const [lift, setLift] = React.useState(0)
  const startY = React.useRef(0)
  const log = React.useRef<HTMLDivElement>(null)
  const latest = transcript.at(-1)
  const recording = state === "recording"

  // Keep the newest line in view as the conversation grows.
  React.useEffect(() => {
    const el = log.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [latest?.text, transcript.length])

  const begin = () => {
    if (holding || state === "thinking") return
    setHolding(true)
    setArmed(false)
    session.start()
    navigator.vibrate?.(10)
  }

  const finish = (cancel: boolean) => {
    if (!holding) return
    setHolding(false)
    setArmed(false)
    setLift(0)
    if (cancel) session.cancel()
    else session.send()
  }

  const prompt = recording
    ? draft || "Listening…"
    : state === "thinking"
      ? "Thinking…"
      : state === "speaking"
        ? "Hold to interrupt"
        : "Hold to talk"

  return (
    <div
      data-slot="mobile-push-to-talk"
      data-state={state}
      className={cn("flex h-dvh w-full touch-manipulation flex-col overflow-hidden bg-background pt-(--safe-top)", className)}
    >
      <header className="flex flex-col items-center gap-3 px-6 pt-6 pb-4 text-center">
        <VoiceOrb size={112} {...orbStyle} state={orbState[state]} level={level} />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm font-medium">{agentName}</span>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        </div>
      </header>

      <div ref={log} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
        {transcript.length === 0 ? (
          <p className="pt-8 text-center text-sm text-muted-foreground">
            Hold the button and talk. Let go to send, slide up to cancel.
          </p>
        ) : (
          <LiveTranscript segments={transcript} agentName={agentName} />
        )}
      </div>

      <footer className="flex shrink-0 flex-col items-center gap-4 border-t bg-card px-6 pt-4 pb-(--safe-bottom)">
        <div className="flex min-h-14 w-full items-end justify-center text-center" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={recording ? "draft" : prompt}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: armed ? 0.4 : 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: duration.fast, ease: ease.out }}
              className={cn("line-clamp-2 text-base", !recording && "text-sm text-muted-foreground")}
            >
              {prompt}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex h-6 items-center text-xs">
          <AnimatePresence mode="wait" initial={false}>
            {holding && (
              <motion.span
                key={armed ? "armed" : "hint"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: duration.fast }}
                className={cn("flex items-center gap-1", armed ? "font-medium text-destructive" : "text-muted-foreground")}
              >
                {armed ? <CloseIcon className="size-3.5" /> : <ChevronUpIcon className="size-3.5" />}
                {armed ? "Release to cancel" : "Slide up to cancel"}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <motion.div animate={{ y: lift }} transition={spring.snappy} className="relative mb-6 grid place-items-center">
          <motion.span
            aria-hidden
            className={cn("absolute inset-0 rounded-full", armed ? "bg-destructive/20" : "bg-muted")}
            animate={{ scale: recording ? 1.3 + level * 0.5 : 1, opacity: recording ? 1 : 0 }}
            transition={spring.gentle}
          />
          <motion.button
            type="button"
            data-holding={holding || undefined}
            data-armed={armed || undefined}
            aria-label={prompt}
            aria-pressed={holding}
            aria-disabled={state === "thinking"}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              startY.current = e.clientY
              begin()
            }}
            onPointerMove={(e) => {
              if (!holding) return
              const dy = Math.min(0, e.clientY - startY.current)
              setLift(Math.max(-MAX_LIFT, dy / 4))
              setArmed(-dy > CANCEL_DISTANCE)
            }}
            onPointerUp={() => finish(armed)}
            onPointerCancel={() => finish(true)}
            onKeyDown={(e) => {
              if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                e.preventDefault()
                begin()
              } else if (e.key === "Escape") finish(true)
            }}
            onKeyUp={(e) => {
              if (e.key === " " || e.key === "Enter") finish(false)
            }}
            onContextMenu={(e) => e.preventDefault()}
            animate={{ scale: holding ? 1.08 : 1 }}
            transition={spring.snappy}
            className={cn(
              "relative grid size-20 touch-none place-items-center rounded-full border shadow-sm outline-none select-none focus-visible:ring-4 focus-visible:ring-ring/30",
              "transition-colors duration-200 aria-disabled:opacity-50",
              armed
                ? "border-destructive bg-destructive text-background"
                : holding
                  ? "border-foreground bg-foreground text-background"
                  : "bg-background text-foreground",
            )}
          >
            <MicIcon className="size-7" />
          </motion.button>
        </motion.div>
      </footer>
    </div>
  )
}

export { MobilePushToTalk, type MobilePushToTalkOrb }
