"use client"

import * as React from "react"
import { AnimatePresence, motion, type PanInfo } from "motion/react"
import { cn } from "cn"

import { ToolCall, ToolCallContent, ToolCallHeader, ToolCallSection } from "@/components/ai/tool-call"
import { Button } from "@/components/ui/button"
import { CallInterrupt, CallMute } from "@/components/voice/call-controls"
import { VoiceOrb } from "@/components/voice/voice-orb"
import { CloseIcon, SuccessIcon } from "@/lib/icons"
import { duration, ease, spring } from "@/lib/motion"

import type { VoiceAgentSession } from "../voice-agent/session"

/** Orb styling, exactly as the Voice Orb Studio generates it. State and level come from the session. */
type MobileVoicePanelOrb = Omit<React.ComponentProps<typeof VoiceOrb>, "state" | "level">

/** Height of the compact panel: a few lines of caption over the controls. */
const COMPACT = 248
/** How far, or how fast, a drag on the handle has to go to expand or collapse the panel. */
const SWIPE_OFFSET = 40
const SWIPE_VELOCITY = 400

/**
 * Voice chat in a floating bottom panel, over whatever screen the user is on. Compact, it
 * shows the live caption above the controls so the page stays readable; drag the handle up
 * for the whole conversation and the agent's actions. Wrap your app's screen in it.
 */
function MobileVoicePanel({
  session,
  open,
  onOpenChange,
  orb: orbStyle,
  agentName = "Aria",
  reserveTop = 72,
  children,
  className,
}: {
  session: VoiceAgentSession
  open: boolean
  /** Closing ends the call. */
  onOpenChange: (open: boolean) => void
  /** Paste the props from the Voice Orb Studio. Without it, the orb follows the nearest VoiceOrbProvider. */
  orb?: MobileVoicePanelOrb
  agentName?: string
  /** Space the expanded panel leaves under the status bar, so your screen's header stays visible. */
  reserveTop?: number
  /** Your app's screen, which stays in place under the panel. */
  children: React.ReactNode
  className?: string
}) {
  const { call, orb, level, transcript, actions, outcome } = session
  const ended = call === "ended"
  const [expanded, setExpanded] = React.useState(false)
  const [height, setHeight] = React.useState(0)
  const area = React.useRef<HTMLDivElement>(null)
  const log = React.useRef<HTMLDivElement>(null)
  const panned = React.useRef(false)
  const latest = transcript.at(-1)
  const logId = React.useId()

  // The expanded panel fills the area between the safe areas, minus reserveTop.
  React.useEffect(() => {
    const el = area.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Keep the newest line in view as the agent talks.
  React.useEffect(() => {
    const el = log.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [latest?.text, transcript.length, expanded, open])

  const close = () => {
    if (!ended) session.end()
    setExpanded(false)
    onOpenChange(false)
  }

  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
    if (info.offset.y < -SWIPE_OFFSET || info.velocity.y < -SWIPE_VELOCITY) setExpanded(true)
    else if (info.offset.y > SWIPE_OFFSET || info.velocity.y > SWIPE_VELOCITY) {
      // Dragging the compact panel down dismisses it, like any sheet.
      if (expanded) setExpanded(false)
      else close()
    }
  }

  const expandedHeight = Math.max(COMPACT, height - reserveTop)

  return (
    <div data-slot="mobile-voice-panel" className={cn("relative h-dvh w-full overflow-hidden", className)}>
      {children}

      <div
        ref={area}
        className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-end px-2 pt-(--safe-top) pb-(--safe-bottom)"
      >
        <AnimatePresence onExitComplete={() => setExpanded(false)}>
          {open && (
            <motion.section
              key="panel"
              data-surface="lit"
              aria-label={`Voice chat with ${agentName}`}
              initial={{ opacity: 0, y: 48, height: COMPACT }}
              animate={{ opacity: 1, y: 0, height: expanded ? expandedHeight : COMPACT }}
              exit={{ opacity: 0, y: 48 }}
              transition={spring.gentle}
              className="pointer-events-auto relative mb-2 flex flex-col overflow-hidden rounded-4xl bg-card/85 shadow-2xl ring-1 ring-surface-edge inset-shadow-surface backdrop-blur-xl"
            >
              {/* The agent's light, rising from the controls. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-primary/10 to-transparent"
              />

              <motion.button
                type="button"
                aria-expanded={expanded}
                aria-controls={logId}
                aria-label={expanded ? "Collapse conversation" : "Expand conversation"}
                onPanStart={() => (panned.current = true)}
                onPanEnd={onPanEnd}
                onClick={() => {
                  if (!panned.current) setExpanded((e) => !e)
                  panned.current = false
                }}
                className="relative z-10 flex h-6 w-full shrink-0 touch-none items-start justify-center pt-2 outline-none focus-visible:bg-accent/40"
              >
                <span className="h-1 w-9 rounded-full bg-muted-foreground/40" />
              </motion.button>

              <div
                ref={log}
                id={logId}
                className={cn(
                  "relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-5 pt-2 pb-4",
                  // Compact, older lines fade out under the handle so the newest one leads.
                  expanded ? "mask-t-from-90%" : "mask-t-from-45%",
                )}
              >
                {/* Pushes a short conversation to the bottom, next to the controls. */}
                <div className="flex-1" />
                {expanded && actions.length > 0 && (
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
                  <p className="text-lg leading-snug text-muted-foreground">Connecting to {agentName}…</p>
                ) : (
                  <ol aria-live="polite" className="flex flex-col gap-3">
                    {transcript.map((s) => (
                      <motion.li
                        key={s.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: s.final ? 1 : 0.7, y: 0 }}
                        transition={{ duration: duration.base, ease: ease.out }}
                        className={cn("text-lg leading-snug", s.speaker === "user" && "text-muted-foreground")}
                      >
                        <span className="sr-only">{s.speaker === "agent" ? agentName : "You"}: </span>
                        {s.text}
                      </motion.li>
                    ))}
                  </ol>
                )}
                {ended && outcome && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <SuccessIcon className="size-4 shrink-0 text-success" />
                    {outcome.title}
                  </p>
                )}
              </div>

              <footer className="relative flex shrink-0 items-center justify-between gap-3 px-4 pt-1 pb-4">
                <VoiceOrb size={56} {...orbStyle} state={orb} level={level} className="shrink-0" />
                {ended ? (
                  <Button variant="secondary" onClick={session.restart}>
                    Talk again
                  </Button>
                ) : (
                  <div className="flex items-center gap-1 rounded-full bg-secondary/60 p-1 ring-1 ring-surface-edge inset-shadow-surface">
                    <CallMute pressed={session.muted} onPressedChange={session.setMuted} className="bg-transparent" />
                    <CallInterrupt variant="ghost" disabled={orb !== "speaking"} onClick={session.interrupt} />
                  </div>
                )}
                <motion.button
                  type="button"
                  aria-label="End voice chat"
                  onClick={close}
                  whileTap={{ scale: 0.92 }}
                  transition={spring.snappy}
                  className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary/60 text-secondary-foreground ring-1 ring-surface-edge inset-shadow-surface outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:bg-accent [&_svg]:size-5"
                >
                  <CloseIcon />
                </motion.button>
              </footer>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export { MobileVoicePanel, type MobileVoicePanelOrb }
