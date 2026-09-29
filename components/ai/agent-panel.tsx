"use client"

import * as React from "react"
import { AnimatePresence, motion, type TargetAndTransition, type Transition } from "motion/react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { VoiceOrb } from "@/components/voice/voice-orb"
import { CloseIcon, SparkleIcon, VoiceIcon } from "@/lib/icons"
import { spring } from "@/lib/motion"

type PanelSide = "left" | "right"
type PanelVariant = "docked" | "floating"
type PanelSurface = "card" | "background" | "glass"
type PanelMotion = "slide" | "fade" | "spring"
type PanelMode = "chat" | "voice"

type AgentPanelContextValue = {
  mode: PanelMode
  setMode: (mode: PanelMode) => void
  onClose?: () => void
}

const AgentPanelContext = React.createContext<AgentPanelContextValue | null>(null)

function useAgentPanel() {
  const ctx = React.useContext(AgentPanelContext)
  if (!ctx) throw new Error("AgentPanel parts must be used inside <AgentPanel>")
  return ctx
}

const motionPresets: Record<PanelMotion, { offset: (side: PanelSide) => TargetAndTransition; transition: Transition }> = {
  slide: {
    offset: (side) => ({ x: side === "right" ? "100%" : "-100%" }),
    transition: { type: "tween", duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  },
  fade: { offset: () => ({ opacity: 0 }), transition: { duration: 0.2 } },
  spring: {
    offset: (side) => ({ x: side === "right" ? 48 : -48, opacity: 0, scale: 0.97 }),
    transition: spring.gentle,
  },
}

const surfaces: Record<PanelSurface, string> = {
  card: "bg-card",
  background: "bg-background",
  glass: "bg-background/70 backdrop-blur-xl backdrop-saturate-150",
}

/**
 * An agent side panel. Docked panels run full height against an edge; floating panels
 * sit inset with rounded corners and a shadow. `contained` positions it inside the
 * nearest positioned ancestor instead of the viewport.
 */
function AgentPanel({
  open,
  onOpenChange,
  side = "right",
  variant = "docked",
  surface = "card",
  width = 400,
  inset = 12,
  motion: motionPreset = "spring",
  contained = false,
  mode: controlledMode,
  defaultMode = "chat",
  onModeChange,
  className,
  children,
}: {
  open: boolean
  onOpenChange?: (open: boolean) => void
  side?: PanelSide
  variant?: PanelVariant
  surface?: PanelSurface
  /** Width in px. Capped to the available space. */
  width?: number
  /** Gap from the edges when floating, in px. */
  inset?: number
  motion?: PanelMotion
  /** Position inside the nearest positioned ancestor instead of the viewport. */
  contained?: boolean
  mode?: PanelMode
  defaultMode?: PanelMode
  onModeChange?: (mode: PanelMode) => void
  className?: string
  children: React.ReactNode
}) {
  const [uncontrolledMode, setUncontrolledMode] = React.useState(defaultMode)
  const mode = controlledMode ?? uncontrolledMode
  const setMode = React.useCallback(
    (m: PanelMode) => {
      if (controlledMode === undefined) setUncontrolledMode(m)
      onModeChange?.(m)
    },
    [controlledMode, onModeChange]
  )
  const preset = motionPresets[motionPreset]
  const floating = variant === "floating"

  return (
    <AgentPanelContext.Provider value={{ mode, setMode, onClose: onOpenChange && (() => onOpenChange(false)) }}>
      <AnimatePresence>
        {open && (
          <motion.aside
            key="agent-panel"
            data-slot="agent-panel"
            data-side={side}
            data-variant={variant}
            aria-label="Agent"
            initial={preset.offset(side)}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={preset.offset(side)}
            transition={preset.transition}
            className={cn(
              contained ? "absolute" : "fixed",
              "z-40 flex w-(--panel-w) max-w-[calc(100%-var(--panel-inset)*2)] flex-col overflow-hidden text-sm",
              surfaces[surface],
              floating
                ? "inset-y-(--panel-inset) rounded-2xl border shadow-2xl"
                : "inset-y-0 data-[side=left]:border-r data-[side=right]:border-l",
              side === "right" ? (floating ? "right-(--panel-inset)" : "right-0") : floating ? "left-(--panel-inset)" : "left-0",
              className
            )}
            style={{ "--panel-w": `${width}px`, "--panel-inset": `${floating ? inset : 0}px` } as React.CSSProperties}
          >
            {children}
          </motion.aside>
        )}
      </AnimatePresence>
    </AgentPanelContext.Provider>
  )
}

/** Title row: an icon or live orb, the title, an optional chat/voice switch and close. */
function AgentPanelHeader({
  title = "Agent",
  icon = "sparkle",
  modes,
  showClose = true,
  className,
  children,
}: {
  title?: string
  /** "orb" shows a small live Voice Orb. */
  icon?: "sparkle" | "orb" | "none"
  /** Show a chat/voice switch when more than one mode is listed. */
  modes?: PanelMode[]
  showClose?: boolean
  className?: string
  /** Extra controls, placed before the close button. */
  children?: React.ReactNode
}) {
  const { mode, setMode, onClose } = useAgentPanel()
  return (
    <div data-slot="agent-panel-header" className={cn("flex h-12 shrink-0 items-center gap-2 border-b px-3", className)}>
      {icon === "sparkle" && <SparkleIcon className="size-4 shrink-0" />}
      {icon === "orb" && <VoiceOrb variant="aura" size={22} state={mode === "voice" ? "listening" : "idle"} />}
      <span className="truncate font-medium">{title}</span>
      <div className="ml-auto flex items-center gap-1">
        {modes && modes.length > 1 && (
          <div role="tablist" aria-label="Mode" className="flex rounded-lg bg-muted p-0.5">
            {modes.map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className="relative flex h-6 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground transition-colors aria-selected:text-foreground [&_svg]:size-3.5"
              >
                {mode === m && (
                  <motion.span
                    layoutId="agent-panel-mode"
                    className="absolute inset-0 rounded-md bg-background shadow-xs"
                    transition={spring.snappy}
                  />
                )}
                <span className="relative flex items-center gap-1">
                  {m === "voice" ? <VoiceIcon /> : <SparkleIcon />}
                  {m === "voice" ? "Voice" : "Chat"}
                </span>
              </button>
            ))}
          </div>
        )}
        {children}
        {showClose && onClose && (
          <Button variant="ghost" size="icon-sm" aria-label="Close agent" onClick={onClose}>
            <CloseIcon />
          </Button>
        )}
      </div>
    </div>
  )
}

/** Main area. Renders `chat` or `voice` content for the current mode. */
function AgentPanelBody({
  chat,
  voice,
  className,
}: {
  chat: React.ReactNode
  voice?: React.ReactNode
  className?: string
}) {
  const { mode } = useAgentPanel()
  const showVoice = mode === "voice" && voice
  return (
    <div data-slot="agent-panel-body" className={cn("relative flex min-h-0 flex-1 flex-col", className)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={showVoice ? "voice" : "chat"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={spring.gentle}
          className="flex min-h-0 flex-1 flex-col"
        >
          {showVoice ? voice : chat}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function AgentPanelFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { mode } = useAgentPanel()
  if (mode === "voice") return null
  return <div data-slot="agent-panel-footer" className={cn("shrink-0 p-3 pt-0", className)} {...props} />
}

export {
  AgentPanel,
  AgentPanelHeader,
  AgentPanelBody,
  AgentPanelFooter,
  useAgentPanel,
  type PanelSide,
  type PanelVariant,
  type PanelSurface,
  type PanelMotion,
  type PanelMode,
}
