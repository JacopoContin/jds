"use client"

import * as React from "react"

import { applyStoredTheme } from "@/components/docs/theme-state"
import { VoiceOrbProvider, type VoiceOrbVariant } from "@/components/voice/voice-orb"

const ORB_KEY = "jds:orb"
const ORB_VARIANTS = ["particles", "ring", "wave", "aura", "bars", "halftone", "plasma", "liquid", "glass", "dot"]
const isOrbVariant = (v: string | null): v is VoiceOrbVariant => !!v && ORB_VARIANTS.includes(v)

type SiteSettings = { orb: VoiceOrbVariant; setOrb: (v: VoiceOrbVariant) => void }

const SiteSettingsContext = React.createContext<SiteSettings | null>(null)

export function useSiteSettings() {
  const ctx = React.useContext(SiteSettingsContext)
  if (!ctx) throw new Error("useSiteSettings must be used inside <SiteSettingsProvider>")
  return ctx
}

/** Docs-site preferences. The orb variant applies to every VoiceOrb on the site. */
export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [orb, setOrbState] = React.useState<VoiceOrbVariant>("particles")

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(ORB_KEY)
      if (isOrbVariant(saved)) queueMicrotask(() => setOrbState(saved))
    } catch {}
  }, [])

  // Follow changes made in another document of the site, e.g. the page around a phone preview iframe.
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === ORB_KEY) {
        if (isOrbVariant(e.newValue)) setOrbState(e.newValue)
      } else applyStoredTheme(e.key, e.newValue)
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const setOrb = React.useCallback((v: VoiceOrbVariant) => {
    setOrbState(v)
    try {
      localStorage.setItem(ORB_KEY, v)
    } catch {}
  }, [])

  const value = React.useMemo(() => ({ orb, setOrb }), [orb, setOrb])

  return (
    <SiteSettingsContext.Provider value={value}>
      <VoiceOrbProvider variant={orb}>{children}</VoiceOrbProvider>
    </SiteSettingsContext.Provider>
  )
}
