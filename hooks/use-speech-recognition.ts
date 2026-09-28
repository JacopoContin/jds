"use client"

import * as React from "react"

// Minimal Web Speech API types; not in TypeScript's DOM lib.
type RecognitionResult = { isFinal: boolean; 0: { transcript: string } }
type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> }
type Recognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: RecognitionEvent) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}
type RecognitionCtor = new () => Recognition

function getRecognition(): RecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

const subscribe = () => () => {}

/**
 * Browser speech-to-text. `transcript` is everything heard since `start()`:
 * committed words plus the in-flight guess, which may still change.
 * Supported in Chrome, Edge and Safari.
 */
export function useSpeechRecognition({ lang }: { lang?: string } = {}) {
  const supported = React.useSyncExternalStore(subscribe, () => !!getRecognition(), () => false)
  const [listening, setListening] = React.useState(false)
  const [transcript, setTranscript] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const ref = React.useRef<Recognition | null>(null)

  const stop = React.useCallback(() => {
    ref.current?.stop()
  }, [])

  const start = React.useCallback(() => {
    const Ctor = getRecognition()
    if (!Ctor || ref.current) return
    const rec = new Ctor()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = lang ?? navigator.language
    let committed = ""
    rec.onresult = (e) => {
      let interim = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) committed += r[0].transcript
        else interim += r[0].transcript
      }
      setTranscript((committed + interim).trim())
    }
    rec.onerror = (e) => {
      if (e.error !== "aborted" && e.error !== "no-speech") setError(e.error)
    }
    rec.onend = () => {
      ref.current = null
      setListening(false)
    }
    ref.current = rec
    setTranscript("")
    setError(null)
    setListening(true)
    rec.start()
  }, [lang])

  React.useEffect(() => () => ref.current?.abort(), [])

  return { supported, listening, transcript, error, start, stop }
}
