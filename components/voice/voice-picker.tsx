"use client"

import * as React from "react"
import { Radio } from "@base-ui/react/radio"
import { RadioGroup } from "@base-ui/react/radio-group"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { PlayIcon, StopIcon } from "@/lib/icons"
import { spring } from "@/lib/motion"

type Voice = { id: string; name: string; description?: string; tags?: string[] }

/**
 * Choose a synthetic voice. Each option has a preview button: `onPreview` plays a
 * sample and returns a promise that settles when it ends; `onStopPreview` cuts it short.
 */
function VoicePicker({
  voices,
  value: controlled,
  defaultValue,
  onValueChange,
  onPreview,
  onStopPreview,
  className,
}: {
  voices: Voice[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  onPreview?: (voice: Voice) => Promise<void> | void
  onStopPreview?: () => void
  className?: string
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? voices[0]?.id)
  const [playing, setPlaying] = React.useState<string | null>(null)
  const value = controlled ?? uncontrolled

  const preview = async (voice: Voice) => {
    if (playing === voice.id) {
      onStopPreview?.()
      setPlaying(null)
      return
    }
    if (playing) onStopPreview?.()
    setPlaying(voice.id)
    try {
      await onPreview?.(voice)
    } finally {
      setPlaying((p) => (p === voice.id ? null : p))
    }
  }

  return (
    <RadioGroup
      data-slot="voice-picker"
      value={value}
      onValueChange={(v) => {
        if (controlled === undefined) setUncontrolled(v as string)
        onValueChange?.(v as string)
      }}
      className={cn("flex w-full flex-col gap-2", className)}
    >
      {voices.map((voice) => (
        <div
          key={voice.id}
          className="relative flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors has-data-checked:border-foreground/40 has-data-checked:bg-accent/40 has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
        >
          {/* The radio stretches over the whole card; the preview button sits above it. */}
          <Radio.Root
            value={voice.id}
            aria-label={voice.name}
            className="peer grid size-4 shrink-0 place-items-center rounded-full border outline-none after:absolute after:inset-0 after:rounded-xl data-checked:border-foreground"
          >
            <Radio.Indicator className="size-2 rounded-full bg-foreground" />
          </Radio.Root>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">{voice.name}</div>
            {voice.description && <div className="text-xs text-muted-foreground">{voice.description}</div>}
            {voice.tags && voice.tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {voice.tags.map((t) => (
                  <span key={t} className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          {onPreview && (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={playing === voice.id ? `Stop ${voice.name} preview` : `Preview ${voice.name}`}
              className="relative z-10 rounded-full"
              onClick={() => preview(voice)}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={playing === voice.id ? "stop" : "play"}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={spring.snappy}
                  className="grid place-items-center"
                >
                  {playing === voice.id ? (
                    <StopIcon className="size-3 fill-current" />
                  ) : (
                    <PlayIcon className="size-3.5 fill-current" />
                  )}
                </motion.span>
              </AnimatePresence>
            </Button>
          )}
        </div>
      ))}
    </RadioGroup>
  )
}

export { VoicePicker, type Voice }
