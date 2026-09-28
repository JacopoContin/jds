"use client"

import * as React from "react"
import { Toggle } from "@base-ui/react/toggle"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { EndCallIcon, InterruptIcon, MicIcon, MicOffIcon } from "@/lib/icons"

type CallState = "connecting" | "connected" | "reconnecting" | "ended"

/** Pill that holds the controls for a realtime voice session. */
function CallControls({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="call-controls"
      role="toolbar"
      aria-label="Call controls"
      className={cn("inline-flex items-center gap-1.5 rounded-full border bg-card p-1.5 shadow-sm", className)}
      {...props}
    />
  )
}

const stateLabel: Record<CallState, string> = {
  connecting: "Connecting",
  connected: "Connected",
  reconnecting: "Reconnecting",
  ended: "Call ended",
}

/** Connection dot, label, and elapsed time since `startedAt` while connected. */
function CallStatus({ state, startedAt, className }: { state: CallState; startedAt?: number; className?: string }) {
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    if (state !== "connected") return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [state])

  const elapsed = startedAt && state === "connected" ? Math.max(0, Math.floor((now - startedAt) / 1000)) : null
  const time = elapsed === null ? null : `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`

  return (
    <div
      data-slot="call-status"
      data-state={state}
      aria-live="polite"
      className={cn("flex items-center gap-2 px-2.5 text-xs text-muted-foreground", className)}
    >
      <span
        className={cn(
          "size-1.5 rounded-full bg-muted-foreground",
          state === "connected" && "bg-success",
          (state === "connecting" || state === "reconnecting") && "animate-pulse-soft bg-warning"
        )}
      />
      <span>{stateLabel[state]}</span>
      {time && <span className="font-mono text-foreground tabular-nums">{time}</span>}
    </div>
  )
}

function ControlTooltip({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/** Mute the microphone. Pressed means muted. */
function CallMute({ className, pressed: controlled, defaultPressed, onPressedChange, ...props }: Toggle.Props) {
  const [muted, setMuted] = React.useState(defaultPressed ?? false)
  const pressed = controlled ?? muted
  return (
    <ControlTooltip label={pressed ? "Unmute" : "Mute"}>
      <Toggle
        data-slot="call-mute"
        aria-label={pressed ? "Unmute" : "Mute"}
        pressed={pressed}
        onPressedChange={(p, e) => {
          setMuted(p)
          onPressedChange?.(p, e)
        }}
        className={cn(
          "grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4.5",
          "data-pressed:bg-foreground data-pressed:text-background",
          className
        )}
        {...props}
      >
        {pressed ? <MicOffIcon /> : <MicIcon />}
      </Toggle>
    </ControlTooltip>
  )
}

/** Stop the agent mid-sentence so the user can take the turn. */
function CallInterrupt({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <ControlTooltip label="Interrupt">
      <Button
        data-slot="call-interrupt"
        variant="secondary"
        aria-label="Interrupt"
        className={cn("size-10 rounded-full [&_svg:not([class*='size-'])]:size-4.5", className)}
        {...props}
      >
        <InterruptIcon />
      </Button>
    </ControlTooltip>
  )
}

function CallEnd({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <ControlTooltip label="End call">
      <Button
        data-slot="call-end"
        aria-label="End call"
        className={cn(
          "h-10 rounded-full bg-destructive px-4 text-white hover:bg-destructive/90 [&_svg:not([class*='size-'])]:size-4.5",
          className
        )}
        {...props}
      >
        <EndCallIcon />
      </Button>
    </ControlTooltip>
  )
}

export { CallControls, CallStatus, CallMute, CallInterrupt, CallEnd, type CallState }
