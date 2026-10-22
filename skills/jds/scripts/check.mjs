#!/usr/bin/env node
/**
 * JDS design check. Run from the project root: node .claude/skills/jds/scripts/check.mjs [dirs...]
 *
 * 1. Contrast: every text token pair in app/globals.css, light and dark (WCAG 2, 4.5:1 for text).
 * 2. Source: patterns the JDS rules ban, with the fix to use instead.
 *
 * Errors exit 1. Warnings print but pass. A `jds-check-ignore` comment on the line, or the one
 * above it, skips that line. No dependencies.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"

const root = process.cwd()
const errors = []
const warnings = []
const report = (list, file, line, rule, message) => list.push({ file, line, rule, message })

// ---------- Contrast ----------

/** Text tokens and the surfaces they sit on. Ratio is the WCAG 2 minimum. */
const pairs = [
  ["foreground", "background", 4.5],
  ["card-foreground", "card", 4.5],
  ["popover-foreground", "popover", 4.5],
  ["primary-foreground", "primary", 4.5],
  ["secondary-foreground", "secondary", 4.5],
  ["accent-foreground", "accent", 4.5],
  ["muted-foreground", "background", 4.5],
  ["muted-foreground", "card", 4.5],
  ["muted-foreground", "muted", 4.5],
  ["sidebar-foreground", "sidebar", 4.5],
  ["sidebar-primary-foreground", "sidebar-primary", 4.5],
  ["destructive", "background", 4.5],
  ["destructive-foreground", "background", 4.5],
  ["success-foreground", "background", 4.5],
  ["warning-foreground", "background", 4.5],
  ["info-foreground", "background", 4.5],
  // Not text, but it has to be seen: focus rings and status dots (WCAG 1.4.11).
  ["ring", "background", 3],
]

function block(css, selector) {
  const match = css.match(selector)
  if (!match) return null
  const vars = {}
  for (const [, name, value] of match[1].matchAll(/--([\w-]+):\s*([^;]+);/g)) vars[name] = value.trim()
  return vars
}

function resolve(vars, fallback, name, depth = 0) {
  const value = vars[name] ?? fallback?.[name]
  if (!value || depth > 8) return null
  const ref = value.match(/^var\(--([\w-]+)\)$/)
  return ref ? resolve(vars, fallback, ref[1], depth + 1) : value
}

/** Linear sRGB channels, or null when the value has alpha or isn't a color we can read. */
function toLinearRgb(value) {
  const oklch = value.match(/^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*\)$/)
  if (oklch) {
    const L = oklch[1].endsWith("%") ? parseFloat(oklch[1]) / 100 : parseFloat(oklch[1])
    const C = parseFloat(oklch[2])
    const h = (parseFloat(oklch[3]) * Math.PI) / 180
    const a = C * Math.cos(h)
    const b = C * Math.sin(h)
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
    return [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ].map((c) => Math.min(1, Math.max(0, c)))
  }
  const hex = value.match(/^#([\da-f]{6}|[\da-f]{3})$/i)
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join("") : hex[1]
    return [0, 2, 4].map((i) => {
      const c = parseInt(h.slice(i, i + 2), 16) / 255
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
  }
  return null
}

const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b

function checkContrast() {
  const file = ["app/globals.css", "src/app/globals.css", "styles/globals.css"].find((f) => existsSync(join(root, f)))
  if (!file) return console.log("contrast: no globals.css found, skipped")
  const css = readFileSync(join(root, file), "utf8")
  const light = block(css, /:root(?:,\s*\.light)?\s*{([^}]*)}/)
  const dark = block(css, /\n\.dark\s*{([^}]*)}/)
  let checked = 0
  for (const [theme, vars, fallback] of [
    ["light", light, null],
    ["dark", dark, light],
  ]) {
    if (!vars) continue
    for (const [fg, bg, min] of pairs) {
      const a = resolve(vars, fallback, fg)
      const b = resolve(vars, fallback, bg)
      const ca = a && toLinearRgb(a)
      const cb = b && toLinearRgb(b)
      if (!ca || !cb) continue
      checked++
      const [hi, lo] = [luminance(ca), luminance(cb)].sort((x, y) => y - x)
      const ratio = (hi + 0.05) / (lo + 0.05)
      if (ratio < min)
        report(
          errors,
          file,
          0,
          "contrast",
          `${theme}: --${fg} on --${bg} is ${ratio.toFixed(2)}:1, needs ${min}:1. Change the lightness of one token.`,
        )
    }
  }
  console.log(`contrast: ${checked} token pairs checked in ${file}`)
}

// ---------- Source ----------

const palette =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose"

/** [rule, level, pattern, message, skip?(file), confirm?(lines, i)] Patterns run per line, outside comments. */
const rules = [
  [
    "raw-color",
    "error",
    new RegExp(`\\b(?:bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|divide|decoration)-(?:${palette})-\\d{2,3}\\b`),
    "Tailwind palette color. Use a theme token: bg-card, text-muted-foreground, bg-primary, text-destructive.",
  ],
  [
    "raw-color",
    "error",
    /className=.*(?:#[\da-fA-F]{3,8}\b|\b(?:rgb|hsl|oklch)a?\()/,
    "Hard-coded color in a class. Use a theme token, or add one in globals.css.",
  ],
  [
    "icons",
    "error",
    /from\s+["']lucide-react["'];?\s*$/,
    "Import icons from lib/icons.ts by meaning (SendIcon, CloseIcon), not from lucide-react.",
    (file) => file.endsWith("lib/icons.ts") || !existsSync(join(root, "lib/icons.ts")),
  ],
  [
    "hover-only",
    "warn",
    /opacity-0\b(?!.*(?:focus-within|focus-visible|pointer-coarse|group-focus|data-\[))[^"'`]*group-hover:opacity-100/,
    "Action revealed only on hover. Touch can't reach it: add group-focus-within: and pointer-coarse:opacity-100.",
  ],
  [
    "focus",
    "warn",
    /\boutline-none\b/,
    "outline-none without a focus-visible style removes the focus ring. Add focus-visible:ring-3 focus-visible:ring-ring/50.",
    null,
    // Class lists span lines, so the focus style can sit a few lines below.
    (lines, i) => !lines.slice(i, i + 4).some((l) => /\bfocus|\bring-/.test(l)),
  ],
  [
    "motion",
    "warn",
    /\b(?:duration|stiffness|damping):\s*(?!0(?![.\d]))\d|\bease:\s*\[/,
    "Hand-tuned motion. Use the presets in lib/motion.ts (spring.snappy, spring.gentle, duration.fast, rise).",
    (file) => file.endsWith("lib/motion.ts"),
  ],
  ["gradient-text", "warn", /\bbg-clip-text\b/, "Gradient text reads as generated. Use text-foreground and weight."],
  ["shadow", "warn", /\bshadow-2xl\b/, "Heavy shadow. Keep it for things that float (dialogs, ⌘K, a floating panel); cards use the surface tokens."],
  ["weight", "warn", /\bfont-(?:bold|extrabold|black)\b/, "Too heavy for app UI. Use font-medium, or font-semibold for a page title."],
  ["viewport", "warn", /\b(?:min-|max-)?h-screen\b/, "100vh is cut off by mobile browser bars. Use h-dvh or min-h-dvh."],
  [
    "copy",
    "warn",
    /["'>][^"'<]*\b(?:[Uu]nlock|[Ss]upercharge|[Ss]eamless(?:ly)?|[Ee]ffortless(?:ly)?|[Rr]evolutioni[sz]e|[Ee]levate your|[Hh]arness the power|[Gg]ame-?chang|[Nn]ext-level|[Ll]everage)/,
    "Marketing copy. Say what the thing does in plain words.",
  ],
  ["copy", "warn", /—/, "Em dash in UI copy. Use a comma, colon or parentheses."],
  // ©, ® and ™ are pictographic in Unicode but are plain text marks.
  ["copy", "warn", /["'>][^"'<]*[\p{Extended_Pictographic}--[©®™]]/v, "Emoji in UI. Use an icon from lib/icons.ts."],
]

const skipDirs = new Set(["node_modules", ".next", ".git", "dist", "build", "out", ".claude", "ui"])

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name) && !entry.name.startsWith(".")) yield* walk(join(dir, entry.name))
    } else if (/\.(tsx|jsx|ts|js|mdx)$/.test(entry.name) && !/\.(test|spec|d)\.[jt]sx?$/.test(entry.name)) {
      yield join(dir, entry.name)
    }
  }
}

function checkSource(dirs) {
  let files = 0
  for (const dir of dirs) {
    if (!existsSync(join(root, dir))) continue
    for (const path of walk(join(root, dir))) {
      const file = relative(root, path)
      files++
      const lines = readFileSync(path, "utf8").split("\n")
      lines.forEach((text, i) => {
        const code = text.trim()
        if (code.startsWith("//") || code.startsWith("*") || code.startsWith("/*")) return
        if (code.includes("jds-check-ignore") || lines[i - 1]?.includes("jds-check-ignore")) return
        for (const [rule, level, pattern, message, skip, confirm] of rules) {
          if (skip?.(file)) continue
          if (pattern.test(text) && (!confirm || confirm(lines, i))) report(level === "error" ? errors : warnings, file, i + 1, rule, message)
        }
      })
    }
  }
  console.log(`source: ${files} files checked`)
}

// ---------- Run ----------

const args = process.argv.slice(2)
checkContrast()
checkSource(args.length ? args : ["app", "src", "components", "recipes", "lib", "hooks"])

const print = (label, list) => {
  for (const { file, line, rule, message } of list) console.log(`${label} ${file}${line ? `:${line}` : ""}  [${rule}] ${message}`)
}
print("error", errors)
print("warn ", warnings)
console.log(`\n${errors.length} errors, ${warnings.length} warnings`)
process.exit(errors.length ? 1 : 0)
