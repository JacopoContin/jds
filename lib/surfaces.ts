/**
 * Surface lighting presets. Flat is the default and sets nothing: a soft foreground rim and no
 * inner light. Lit lights surfaces from above, like a physical panel: a dark rim where the edge
 * meets the page, a 1px highlight just inside it (brightest on top), and a tight contact shadow.
 * In dark, a faint white veil also lifts the surface off the page, keeping any base tint.
 * Wells (tab lists, segmented tracks) sink instead. Measured from a dark reference UI.
 *
 * Tokens: --surface-edge (ring-surface-edge / border-surface-edge), --surface-highlight
 * (inset-shadow-surface), --surface-well (inset-shadow-well).
 */
export type SurfacePreset = {
  name: string
  label: string
  light: Record<string, string>
  dark: Record<string, string>
}

export const surfacePresets: SurfacePreset[] = [
  {
    name: "lit",
    label: "Lit",
    light: {
      "surface-edge": "oklch(0 0 0 / 9%)",
      "surface-highlight":
        "inset 0 1px 0 0 oklch(1 0 0 / 90%), inset 0 -1px 0 0 oklch(0 0 0 / 4%), 0 1px 2px 0 oklch(0 0 0 / 6%)",
      "surface-well": "inset 0 1px 2px 0 oklch(0 0 0 / 8%), inset 0 0 0 1px oklch(0 0 0 / 4%)",
    },
    dark: {
      "surface-edge": "oklch(0 0 0 / 25%)",
      "surface-highlight":
        "inset 0 1px 0 0 oklch(1 0 0 / 5%), inset 0 0 0 1px oklch(1 0 0 / 5%), inset 0 0 0 100vmax oklch(1 0 0 / 4.5%), 0 1px 3px 0 oklch(0 0 0 / 35%)",
      "surface-well": "inset 0 1px 2px 0 oklch(0 0 0 / 35%), inset 0 0 0 1px oklch(0 0 0 / 20%)",
    },
  },
]
