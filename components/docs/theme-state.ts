"use client"

import * as React from "react"

/** Theme choices stored as data attributes on <html>, restored before paint by `settingsInitScript`. */
export const domSettings = {
  color: { key: "jds:color", fallback: "neutral" },
  base: { key: "jds:base", fallback: "neutral" },
  radius: { key: "jds:radius", fallback: "0.625" },
  font: { key: "jds:font", fallback: "geist" },
} as const

export type DomSetting = keyof typeof domSettings

export const settingsInitScript = `try{var d=document.documentElement;${Object.entries(domSettings)
  .map(
    ([attr, s]) =>
      `var ${attr}=localStorage.getItem("${s.key}");if(${attr}&&${attr}!=="${s.fallback}")d.dataset.${attr}=${attr};`,
  )
  .join("")}}catch(e){}`

const EVENT = "jds:theme"

function readDom(attr: DomSetting) {
  return document.documentElement.dataset[attr] ?? domSettings[attr].fallback
}

function readAll(): Record<DomSetting, string> {
  return { color: readDom("color"), base: readDom("base"), radius: readDom("radius"), font: readDom("font") }
}

const fallbacks = Object.fromEntries(
  Object.entries(domSettings).map(([k, s]) => [k, s.fallback]),
) as Record<DomSetting, string>

/**
 * Applies a theme change made in another document of this site, such as the parent page of
 * a phone preview iframe. Wire it to the window's `storage` event, which only fires there.
 */
export function applyStoredTheme(key: string | null, value: string | null) {
  const attr = (Object.keys(domSettings) as DomSetting[]).find((a) => domSettings[a].key === key)
  if (!attr) return
  if (!value || value === domSettings[attr].fallback) delete document.documentElement.dataset[attr]
  else document.documentElement.dataset[attr] = value
  window.dispatchEvent(new Event(EVENT))
}

/**
 * The site theme (color, base, radius, font). Every caller stays in step: writes update
 * <html>, localStorage, and broadcast an event the other callers listen for, so the
 * header's Customize menu and a Studio can edit the same theme side by side.
 */
export function useThemeState() {
  const [values, setValues] = React.useState<Record<DomSetting, string>>(fallbacks)

  React.useEffect(() => {
    const sync = () => setValues(readAll())
    queueMicrotask(sync)
    window.addEventListener(EVENT, sync)
    return () => window.removeEventListener(EVENT, sync)
  }, [])

  const set = React.useCallback((attr: DomSetting, value: string) => {
    const { key, fallback } = domSettings[attr]
    if (value === fallback) delete document.documentElement.dataset[attr]
    else document.documentElement.dataset[attr] = value
    try {
      localStorage.setItem(key, value)
    } catch {}
    window.dispatchEvent(new Event(EVENT))
  }, [])

  const reset = React.useCallback(() => {
    ;(Object.keys(domSettings) as DomSetting[]).forEach((a) => set(a, domSettings[a].fallback))
  }, [set])

  return { values, set, reset }
}
