"use client"

import * as React from "react"
import { AnimatePresence, motion, type PanInfo } from "motion/react"
import { cn } from "cn"

import { ToolCall, ToolCallContent, ToolCallHeader, ToolCallSection } from "@/components/ai/tool-call"
import { LiquidGlass } from "@/components/effects/liquid-glass"
import { Button } from "@/components/ui/button"
import { CallInterrupt, CallMute } from "@/components/voice/call-controls"
import type { TranscriptSegment } from "@/components/voice/live-transcript"
import { PushToTalk } from "@/components/voice/push-to-talk"
import { VoiceGlow } from "@/components/voice/voice-glow"
import { VoiceOrb, type VoiceState } from "@/components/voice/voice-orb"
import { CloseIcon, SuccessIcon } from "@/lib/icons"
import { duration, ease, spring } from "@/lib/motion"

import type { PushToTalkSession } from "../mobile-push-to-talk/session"
import type { VoiceAgentSession } from "../voice-agent/session"

/** Orb styling, exactly as the Voice Orb Studio generates it. State and level come from the session. */
type MobileVoicePanelOrb = Omit<React.ComponentProps<typeof VoiceOrb>, "state" | "level">

/** Glow styling, as the Voice Panel Studio generates it. State and level come from the session. */
type MobileVoicePanelGlow = Omit<React.ComponentProps<typeof VoiceGlow>, "state" | "level" | "className">

/** Height of the compact panel: a few lines of caption over the controls. */
const COMPACT = 248
/** How far, or how fast, a drag on the handle has to go to expand or collapse the panel. */
const SWIPE_OFFSET = 40
const SWIPE_VELOCITY = 400

/** What the orb and glow show for each push-to-talk state. */
const talkOrb: Record<PushToTalkSession["state"], VoiceState> = {
  idle: "idle",
  recording: "listening",
  thinking: "thinking",
  speaking: "speaking",
}

type MobileVoicePanelProps = {
  open: boolean
  /** Closing ends the call, or throws away a recording in progress. */
  onOpenChange: (open: boolean) => void
  /** Paste the props from the Voice Orb Studio. Without it, the orb follows the nearest VoiceOrbProvider. */
  orb?: MobileVoicePanelOrb
  agentName?: string
  /** Space the expanded drawer leaves under the status bar, so your screen's header stays visible. */
  reserveTop?: number
  /** A floating drawer over the page, or the whole screen. */
  layout?: "drawer" | "fullscreen"
  /**
   * The panel's material. "theme" (the default) follows your app's surface tokens, so it matches
   * cards and menus. Flat, lit and metal pin that look on the panel alone; glass blurs the page.
   */
  surface?: "theme" | "flat" | "lit" | "metal" | "glass"
  /** Glass controls let the glow show through; solid ones sit on the panel. */
  controls?: "glass" | "solid"
  /** Colors, texture and reach of the light at the bottom, or false for none. Paste from the Voice Panel Studio. */
  glow?: MobileVoicePanelGlow | false
  /** Full screen, the corner radius of the phone's display, so the glow's edge line wraps it. */
  displayRadius?: number
  /** Your app's screen, which stays in place under the panel. */
  children: React.ReactNode
  className?: string
} & (
  | {
      /** Hands-free: an open call with mute and interrupt. The default. */
      mode?: "hands-free"
      session: VoiceAgentSession
    }
  | {
      /** Push-to-talk: hold the button to speak, let go to send. For noisy places and one hand. */
      mode: "push-to-talk"
      session: PushToTalkSession
    }
)

/** Panel classes per material: as a drawer it's an object on the page; full screen, the screen's edges frame it. */
const materials: Record<NonNullable<MobileVoicePanelProps["surface"]>, { drawer: string; fullscreen: string }> = {
  theme: {
    drawer: "bg-card ring-1 ring-surface-edge inset-shadow-surface surface-sheen",
    fullscreen: "bg-background surface-sheen",
  },
  flat: { drawer: "bg-card ring-1 ring-foreground/10", fullscreen: "bg-background" },
  lit: {
    drawer: "bg-card ring-1 ring-surface-edge inset-shadow-surface surface-sheen",
    fullscreen: "bg-background surface-sheen",
  },
  metal: {
    drawer: "bg-card ring-1 ring-surface-edge inset-shadow-surface surface-sheen",
    fullscreen: "bg-background surface-sheen",
  },
  glass: {
    drawer: "bg-glass inset-shadow-glass backdrop-blur-2xl backdrop-saturate-150",
    fullscreen: "bg-glass backdrop-blur-2xl backdrop-saturate-150",
  },
}

/** Glass and solid shells for the controls; glass lets the glow show through. */
function ControlShell({ glass, className, ...props }: React.ComponentProps<"div"> & { glass: boolean }) {
  return glass ? (
    <LiquidGlass className={className} {...props} />
  ) : (
    <div className={cn("bg-secondary/60 ring-1 ring-surface-edge inset-shadow-surface", className)} {...props} />
  )
}

/**
 * Voice chat over whatever screen the user is on. As a drawer (the default) it floats at the
 * bottom: compact, the live caption sits above the controls so the page stays readable; drag
 * the handle up for the whole conversation and the agent's actions. Full screen, it covers the
 * page and the glow wraps the phone's bottom corners. Wrap your app's screen in it.
 */
function MobileVoicePanel(props: MobileVoicePanelProps) {
  const {
    open,
    onOpenChange,
    orb: orbStyle,
    agentName = "Aria",
    reserveTop = 72,
    layout = "drawer",
    surface = "theme",
    controls = "glass",
    glow,
    displayRadius = 55,
    children,
    className,
  } = props
  // One view of either session, so the layout below doesn't care which mode it's in.
  const talk = props.mode === "push-to-talk" ? props.session : undefined
  const callSession = props.mode === "push-to-talk" ? undefined : props.session
  const orb = talk ? talkOrb[talk.state] : callSession!.orb
  const level = (talk ?? callSession)!.level
  const recording = talk?.state === "recording"
  // While the button is held, what the mic hears so far shows as the newest line.
  const transcript: TranscriptSegment[] = talk
    ? recording
      ? [...talk.transcript, { id: "draft", speaker: "user", text: talk.draft || "Listening…", final: false }]
      : talk.transcript
    : callSession!.transcript
  const actions = callSession?.actions ?? []
  const outcome = callSession?.outcome
  const ended = callSession?.call === "ended"
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
    if (talk) {
      if (recording) talk.cancel()
    } else if (!ended) callSession!.end()
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

  const fullscreen = layout === "fullscreen"
  const expandedHeight = Math.max(COMPACT, height - reserveTop)
  const panelHeight = fullscreen ? height || "100%" : expanded ? expandedHeight : COMPACT
  /** The drawer's corners (rounded-4xl), or the display's when full screen. */
  const radius = fullscreen ? displayRadius : 32

  return (
    <div data-slot="mobile-voice-panel" className={cn("relative h-dvh w-full overflow-hidden", className)}>
      {children}

      <div
        ref={area}
        className={cn(
          "pointer-events-none fixed inset-0 z-40 flex flex-col justify-end",
          !fullscreen && "px-2 pt-(--safe-top) pb-(--safe-bottom)",
        )}
      >
        <AnimatePresence onExitComplete={() => setExpanded(false)}>
          {open && (
            <motion.section
              key="panel"
              data-surface={surface === "lit" || surface === "metal" ? surface : undefined}
              data-layout={layout}
              aria-label={`Voice chat with ${agentName}`}
              // Full screen it rounds to the display: a backdrop blur only clips to its own corners.
              initial={{ opacity: 0, y: 48, height: fullscreen ? panelHeight : COMPACT, borderRadius: radius }}
              animate={{ opacity: 1, y: 0, height: panelHeight, borderRadius: radius }}
              exit={{ opacity: 0, y: 48 }}
              transition={spring.gentle}
              className={cn(
                "pointer-events-auto relative isolate flex flex-col overflow-hidden",
                fullscreen ? "pt-(--safe-top) pb-(--safe-bottom)" : "mb-2 shadow-2xl",
                materials[surface][fullscreen ? "fullscreen" : "drawer"],
              )}
            >
              {/* The agent's light, rising from the bottom edge. Full screen, it wraps the display's corners. */}
              {glow !== false && (
                <VoiceGlow
                  state={orb}
                  level={level}
                  intensity={fullscreen ? 1 : 0.8}
                  radius={fullscreen ? displayRadius : undefined}
                  {...glow}
                  className={fullscreen ? "h-2/5" : "h-1/2"}
                />
              )}

              {!fullscreen && (
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
              )}

              <div
                ref={log}
                id={logId}
                className={cn(
                  "relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-5 pt-2 pb-4",
                  // Compact, older lines fade out under the handle so the newest one leads.
                  fullscreen || expanded ? "mask-t-from-90%" : "mask-t-from-45%",
                  fullscreen && "pt-6",
                )}
              >
                {/* Pushes a short conversation to the bottom, next to the controls. */}
                <div className="flex-1" />
                {(expanded || fullscreen) && actions.length > 0 && (
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
                  <p className="text-lg leading-snug text-muted-foreground">
                    {talk ? "Hold the button and talk. Let go to send." : `Connecting to ${agentName}…`}
                  </p>
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
                {talk ? (
                  <ControlShell glass={controls === "glass"} className="rounded-full p-1">
                    <PushToTalk
                      onPressStart={talk.start}
                      onPressEnd={talk.send}
                      level={level}
                      disabled={talk.state === "thinking"}
                      label={talk.state === "speaking" ? "Hold to interrupt" : "Hold to talk"}
                      className="size-14"
                    />
                  </ControlShell>
                ) : ended ? (
                  <Button variant="secondary" onClick={callSession!.restart}>
                    Talk again
                  </Button>
                ) : (
                  // Glass over the glow, so the agent's light shows through the controls.
                  <ControlShell glass={controls === "glass"} className="flex items-center gap-1 rounded-full p-1">
                    <CallMute
                      pressed={callSession!.muted}
                      onPressedChange={callSession!.setMuted}
                      className="bg-transparent"
                    />
                    <CallInterrupt variant="ghost" disabled={orb !== "speaking"} onClick={callSession!.interrupt} />
                  </ControlShell>
                )}
                <ControlShell glass={controls === "glass"} className="shrink-0 rounded-full">
                  <motion.button
                    type="button"
                    aria-label="End voice chat"
                    onClick={close}
                    whileTap={{ scale: 0.92 }}
                    transition={spring.snappy}
                    className="grid size-12 place-items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:bg-foreground/10 [&_svg]:size-5"
                  >
                    <CloseIcon />
                  </motion.button>
                </ControlShell>
              </footer>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export { MobileVoicePanel, type MobileVoicePanelGlow, type MobileVoicePanelOrb }
