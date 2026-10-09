"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { CallEnd, CallStatus } from "@/components/voice/call-controls"
import { VoiceOrb } from "@/components/voice/voice-orb"
import { CloseIcon, SuccessIcon } from "@/lib/icons"
import { duration, ease, spring } from "@/lib/motion"

import { MobileVoiceAgent, type MobileVoiceAgentOrb } from "../mobile-voice-agent/mobile-voice-agent"
import type { VoiceAgentSession } from "../voice-agent/session"

/**
 * Keeps a voice call going while the user uses the rest of your app. Expanded, it's the full
 * mobile voice agent; minimized, the call shrinks to a pill under the status bar that shows who's
 * talking, ends the call in one tap, and expands back on tap. Wrap your app's screen in it.
 */
function MobileMinimizedCall({
  session,
  expanded,
  onExpandedChange,
  orb: orbStyle,
  agentName = "Aria",
  subtitle,
  children,
  className,
}: {
  session: VoiceAgentSession
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
  /** Paste the props from the Voice Orb Studio. Without it, the orb follows the nearest VoiceOrbProvider. */
  orb?: MobileVoiceAgentOrb
  agentName?: string
  subtitle?: string
  /** Your app's screen, shown under the pill while the call is minimized. */
  children: React.ReactNode
  className?: string
}) {
  const { call, orb, level, transcript, outcome, startedAt } = session
  const ended = call === "ended"
  // Dismissing an ended call hides its pill; the next call starts a new one.
  const [dismissed, setDismissed] = React.useState<number>()
  const showPill = !expanded && !(ended && dismissed === (startedAt ?? 0))
  const latest = transcript.at(-1)
  const agentTalking = orb === "speaking" && latest?.speaker === "agent"

  return (
    <div data-slot="mobile-minimized-call" className={cn("relative h-dvh w-full overflow-hidden", className)}>
      {children}

      <AnimatePresence>
        {showPill && (
          <motion.div
            key="pill"
            role="group"
            aria-label="Ongoing call"
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.96 }}
            transition={spring.gentle}
            className="fixed inset-x-3 top-(--safe-top) z-40 mx-auto mt-2 max-w-sm"
          >
            <div className="flex items-center gap-2 rounded-full border bg-card p-1.5 shadow-lg">
              <motion.button
                type="button"
                aria-label={`Return to the call with ${agentName}`}
                onClick={() => onExpandedChange(true)}
                whileTap={{ scale: 0.98 }}
                transition={spring.snappy}
                className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-full pr-1 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <VoiceOrb size={36} {...orbStyle} state={orb} level={level} className="shrink-0" />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{agentName}</span>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {ended ? (
                      <motion.span
                        key="outcome"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: duration.base, ease: ease.out }}
                        className="flex items-center gap-1 truncate text-xs text-muted-foreground"
                      >
                        <SuccessIcon className="size-3 shrink-0 text-success" />
                        {outcome?.title ?? "Call ended"}
                      </motion.span>
                    ) : agentTalking ? (
                      <motion.span
                        key={`caption-${latest.id}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: duration.base, ease: ease.out }}
                        className="truncate text-xs text-muted-foreground"
                      >
                        {latest.text}
                      </motion.span>
                    ) : (
                      <motion.span key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <CallStatus state={call} startedAt={startedAt} className="px-0" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </motion.button>
              {ended ? (
                <Button variant="ghost" size="icon" aria-label="Dismiss" onClick={() => setDismissed(startedAt ?? 0)}>
                  <CloseIcon />
                </Button>
              ) : (
                <CallEnd onClick={session.end} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key="call"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={spring.gentle}
            className="fixed inset-0 z-50"
          >
            <MobileVoiceAgent
              session={session}
              orb={orbStyle}
              agentName={agentName}
              subtitle={subtitle}
              onMinimize={() => onExpandedChange(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { MobileMinimizedCall }
