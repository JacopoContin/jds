"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "cn"

import { usePromptInput } from "@/components/ai/prompt-input"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Waveform } from "@/components/voice/waveform"
import { useAudioLevel } from "@/hooks/use-audio-level"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { MicIcon, StopIcon } from "@/lib/icons"
import { spring } from "@/lib/motion"

/**
 * Dictation for <PromptInput>. Speech is transcribed into the textarea as you talk,
 * after any text already there, so it can be reviewed before sending.
 * Disabled with an explanation where the browser has no speech recognition.
 */
function PromptInputMic({ lang, className }: { lang?: string; className?: string }) {
  const { value, setValue } = usePromptInput()
  const speech = useSpeechRecognition({ lang })
  const mic = useAudioLevel({ bands: 10 })
  const base = React.useRef("")
  // Latest setter, so the transcript effect below only fires when speech changes.
  const setValueRef = React.useRef(setValue)
  React.useEffect(() => {
    setValueRef.current = setValue
  }, [setValue])

  const { transcript, listening } = speech
  React.useEffect(() => {
    if (!listening && !transcript) return
    const sep = base.current && transcript ? " " : ""
    setValueRef.current(base.current + sep + transcript)
  }, [transcript, listening])

  const stopMic = mic.stop
  React.useEffect(() => {
    if (!listening) stopMic()
  }, [listening, stopMic])

  const toggle = () => {
    if (speech.listening) {
      speech.stop()
      return
    }
    base.current = value.trimEnd()
    speech.start()
    void mic.start()
  }

  const label = !speech.supported
    ? "Dictation isn't supported in this browser"
    : speech.listening
      ? "Stop dictation"
      : speech.error
        ? `Dictation failed: ${speech.error}`
        : "Dictate"

  return (
    <motion.div layout transition={spring.snappy} className={cn("flex items-center", className)}>
      <AnimatePresence initial={false}>
        {speech.listening && (
          <motion.div
            key="wave"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={spring.snappy}
            className="overflow-hidden"
          >
            <Waveform spectrum={mic.spectrum} active={mic.active} className="h-6 w-16 px-1.5" />
          </motion.div>
        )}
      </AnimatePresence>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant={speech.listening ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label={label}
              aria-pressed={speech.listening}
              disabled={!speech.supported}
              onClick={toggle}
              className={cn(!speech.listening && "text-muted-foreground")}
            />
          }
        >
          {speech.listening ? <StopIcon className="size-3 fill-current" /> : <MicIcon />}
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </motion.div>
  )
}

export { PromptInputMic }
