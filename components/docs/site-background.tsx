"use client"

import { AmbientBackground, type AmbientBackgroundVariant } from "@/components/effects/ambient-background"
import { useThemeState } from "@/components/docs/theme-state"

/** The Customize menu's background, behind every page, so surfaces can be judged over it. */
export function SiteBackground() {
  const { values } = useThemeState()
  if (values.background === "none") return null
  return (
    <div data-slot="site-background" aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <AmbientBackground variant={values.background as AmbientBackgroundVariant} intensity={0.5} grain={0.15} />
    </div>
  )
}
