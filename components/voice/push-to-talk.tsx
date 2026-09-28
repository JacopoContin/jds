"use client"

import * as React from "react"
import { motion } from "motion/react"
import { cn } from "cn"

import { MicIcon } from "@/lib/icons"
import { spring } from "@/lib/motion"

/**
 * Hold to talk: pointer press or the Space key (when `hotkey` is on).
 * Ring scales with `level` so the user sees they're being heard.
 */
function PushToTalk({
  onPressStart,
  onPressEnd,
  level = 0,
  hotkey = true,
  label = "Hold to talk",
  className,
  ...props
}: Omit<React.ComponentProps<"button">, "onPointerDown" | "onPointerUp"> & {
  onPressStart?: () => void
  onPressEnd?: () => void
  level?: number
  hotkey?: boolean
  label?: string
}) {
  const [pressed, setPressed] = React.useState(false)
  const pressedRef = React.useRef(false)

  const begin = React.useCallback(() => {
    if (pressedRef.current) return
    pressedRef.current = true
    setPressed(true)
    onPressStart?.()
  }, [onPressStart])

  const end = React.useCallback(() => {
    if (!pressedRef.current) return
    pressedRef.current = false
    setPressed(false)
    onPressEnd?.()
  }, [onPressEnd])

  React.useEffect(() => {
    if (!hotkey) return
    const isTyping = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && !isTyping(e.target)) {
        e.preventDefault()
        begin()
      }
    }
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") end()
    }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    window.addEventListener("blur", end)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
      window.removeEventListener("blur", end)
    }
  }, [hotkey, begin, end])

  return (
    <div className="relative grid place-items-center">
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full bg-muted"
        animate={{ scale: pressed ? 1.25 + level * 0.6 : 1, opacity: pressed ? 1 : 0 }}
        transition={spring.gentle}
      />
      <motion.button
        type="button"
        data-slot="push-to-talk"
        data-pressed={pressed || undefined}
        aria-pressed={pressed}
        aria-label={label}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          begin()
        }}
        onPointerUp={end}
        onPointerCancel={end}
        whileTap={{ scale: 0.94 }}
        transition={spring.snappy}
        className={cn(
          "relative grid size-16 touch-none place-items-center rounded-full border bg-card text-foreground shadow-sm transition-colors duration-200 outline-none select-none focus-visible:ring-4 focus-visible:ring-ring/30",
          "data-pressed:border-foreground data-pressed:bg-foreground data-pressed:text-background",
          className
        )}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        <MicIcon className="size-6" />
      </motion.button>
    </div>
  )
}

export { PushToTalk }
