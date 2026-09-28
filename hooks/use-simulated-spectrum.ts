"use client"

import * as React from "react"

/** Speech-like spectrum for agent playback, demos, and users who decline mic access. */
export function useSimulatedSpectrum(active: boolean, bands = 24) {
  const [spectrum, setSpectrum] = React.useState<number[]>(() => Array(bands).fill(0))

  React.useEffect(() => {
    if (!active) return
    let raf = 0
    const tick = (t: number) => {
      setSpectrum(
        Array.from({ length: bands }, (_, i) => {
          const center = 1 - Math.abs(i - bands / 2) / (bands / 2)
          const wave = (Math.sin(t / 140 + i * 0.7) + Math.sin(t / 90 + i * 1.3)) / 4 + 0.5
          return Math.max(0, center * wave * (0.6 + Math.random() * 0.4))
        })
      )
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      setSpectrum(Array(bands).fill(0))
    }
  }, [active, bands])

  const level = Math.min(1, (spectrum.reduce((a, b) => a + b, 0) / bands) * 2.2)
  return { spectrum, level }
}
