"use client"

import * as React from "react"

/**
 * Live microphone loudness (0..1) and frequency bands, sampled per animation frame.
 * Call `start()` from a user gesture; browsers block mic access otherwise.
 */
export function useAudioLevel({ bands = 24 }: { bands?: number } = {}) {
  const [level, setLevel] = React.useState(0)
  const [spectrum, setSpectrum] = React.useState<number[]>(() => Array(bands).fill(0))
  const [active, setActive] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const cleanup = React.useRef<(() => void) | null>(null)

  const stop = React.useCallback(() => {
    cleanup.current?.()
    cleanup.current = null
    setActive(false)
    setLevel(0)
    setSpectrum(Array(bands).fill(0))
  }, [bands])

  const start = React.useCallback(async () => {
    if (cleanup.current) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.75
      ctx.createMediaStreamSource(stream).connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)
      let raf = 0

      const tick = () => {
        analyser.getByteFrequencyData(data)
        const step = Math.floor(data.length / bands)
        const next = Array.from({ length: bands }, (_, i) => {
          let sum = 0
          for (let j = 0; j < step; j++) sum += data[i * step + j]
          return sum / step / 255
        })
        setSpectrum(next)
        setLevel(Math.min(1, (next.reduce((a, b) => a + b, 0) / bands) * 2.2))
        raf = requestAnimationFrame(tick)
      }
      tick()
      setActive(true)
      setError(null)

      cleanup.current = () => {
        cancelAnimationFrame(raf)
        stream.getTracks().forEach((t) => t.stop())
        void ctx.close()
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
    }
  }, [bands])

  React.useEffect(() => () => cleanup.current?.(), [])

  return { level, spectrum, active, error, start, stop }
}
