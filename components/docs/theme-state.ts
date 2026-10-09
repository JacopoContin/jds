"use client"

import * as React from "react"

/**
 * Theme choices stored as data attributes on <html>, restored before paint by `settingsInitScript`.
 * `fallback` is what a first-time visitor sees; `css` is the value globals.css styles with no
 * attribute, so only other values get one.
 */
export const domSettings = {
  color: { key: "jds:color", fallback: "blue", css: "neutral" },
  base: { key: "jds:base", fallback: "neutral", css: "neutral" },
  radius: { key: "jds:radius", fallback: "0.625", css: "0.625" },
  font: { key: "jds:font", fallback: "geist", css: "geist" },
} as const

export type DomSetting = keyof typeof domSettings

export const settingsInitScript = `try{var d=document.documentElement;${Object.entries(domSettings)
  .map(
    ([attr, s]) =>
      `var ${attr}=localStorage.getItem("${s.key}")||"${s.fallback}";if(${attr}!=="${s.css}")d.dataset.${attr}=${attr};`,
  )
  .join("")}}catch(e){}`

function applyDom(attr: DomSetting, value: string) {
  if (value === domSettings[attr].css) delete document.documentElement.dataset[attr]
  else document.documentElement.dataset[attr] = value
}

const EVENT = "jds:theme"

function readDom(attr: DomSetting) {
  return document.documentElement.dataset[attr] ?? domSettings[attr].css
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
  applyDom(attr, value || domSettings[attr].fallback)
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
    applyDom(attr, value)
    try {
      localStorage.setItem(domSettings[attr].key, value)
    } catch {}
    window.dispatchEvent(new Event(EVENT))
  }, [])

  const reset = React.useCallback(() => {
    ;(Object.keys(domSettings) as DomSetting[]).forEach((a) => set(a, domSettings[a].fallback))
  }, [set])

  return { values, set, reset }
}
