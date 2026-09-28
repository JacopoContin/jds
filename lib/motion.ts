import type { Transition, Variants } from "motion/react"

/** Durations in seconds. Keep UI feedback under 250ms. */
export const duration = {
  instant: 0.1,
  fast: 0.16,
  base: 0.24,
  slow: 0.4,
} as const

export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.76, 0, 0.24, 1],
} as const

export const spring = {
  /** Buttons, toggles, small affordances. */
  snappy: { type: "spring", stiffness: 520, damping: 34, mass: 0.6 },
  /** Panels, messages, layout shifts. */
  gentle: { type: "spring", stiffness: 260, damping: 30 },
  /** Voice orbs and ambient elements. */
  soft: { type: "spring", stiffness: 120, damping: 18 },
} satisfies Record<string, Transition>

/** Enter from below, used for streamed messages and list items. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 6, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: duration.base, ease: ease.out },
  },
}

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.fast } },
}

export const stagger = (staggerChildren = 0.04): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren } },
})
