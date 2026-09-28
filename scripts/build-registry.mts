/**
 * Generates registry.json from lib/docs.ts. Dependencies are read from each file's
 * imports so the registry can't drift from the code. Run `pnpm registry:build`.
 */
import { readFileSync, writeFileSync } from "node:fs"

import { colorPresets } from "../lib/colors.ts"
import { components } from "../lib/docs.ts"
import { site } from "../lib/site.ts"

const NS = site.namespace
const importRe = /from\s+["']([^"']+)["']/g

function fileType(path: string) {
  if (path.startsWith("hooks/")) return "registry:hook"
  if (path.startsWith("lib/")) return "registry:lib"
  if (path.startsWith("components/ui/")) return "registry:ui"
  return "registry:component"
}

function analyze(paths: string[]) {
  const deps = new Set<string>()
  const regDeps = new Set<string>()
  for (const path of paths) {
    for (const [, spec] of readFileSync(path, "utf8").matchAll(importRe)) {
      if (spec.startsWith("@/")) {
        const local = spec.slice(2)
        if (paths.some((p) => p.replace(/\.tsx?$/, "") === local)) continue
        if (local === "lib/icons" || local === "lib/motion") regDeps.add(`${NS}/utils`)
        else if (local === "lib/utils") continue
        else {
          // Resolve to the item that ships this file (hooks live inside their component's item).
          const owner = components.find((c) => c.files.some((f) => f.replace(/\.tsx?$/, "") === local))
          if (owner) regDeps.add(`${NS}/${owner.slug}`)
          else throw new Error(`${path} imports ${spec}, which no registry item ships`)
        }
      } else if (!spec.startsWith(".") && spec !== "react" && !spec.startsWith("react/") && !spec.startsWith("next/")) {
        const parts = spec.split("/")
        const pkg = spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]
        if (pkg !== "react-dom") deps.add(pkg)
      }
    }
  }
  return { dependencies: [...deps].sort(), registryDependencies: [...regDeps].sort() }
}

// Keep the preset CSS in globals.css in sync with lib/colors.ts.
const decl = (o: Record<string, string>) =>
  Object.entries(o)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join("\n")
let presetCss = "\n/* Primary color presets. Generated from lib/colors.ts by scripts/build-registry.mts. */\n"
for (const p of colorPresets) {
  presetCss += `:root[data-color="${p.name}"] {\n${decl(p.light)}\n}\n:root.dark[data-color="${p.name}"] {\n${decl(p.dark)}\n}\n`
}
const globals = readFileSync("app/globals.css", "utf8")
  .replace(/\n\/\* Primary color presets[\s\S]*?(?=\n@layer base)/, "")
  .replace("\n@layer base", presetCss + "\n@layer base")
writeFileSync("app/globals.css", globals)

const css = globals
function vars(selector: RegExp) {
  const block = css.match(selector)?.[1] ?? ""
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()])
  )
}
const light = vars(/:root,\s*\.light\s*{([^}]*)}/)
const dark = vars(/\.dark\s*{([^}]*)}/)
const { radius, ...lightColors } = light

const items: object[] = [
  {
    name: "style",
    type: "registry:style",
    title: `${site.name} style`,
    description: "Neutral light and dark themes, status colors, motion keyframes, and shared utilities.",
    dependencies: ["motion", "lucide-react", "tw-animate-css"],
    registryDependencies: [`${NS}/utils`],
    cssVars: {
      theme: {
        "color-success": "var(--success)",
        "color-success-foreground": "var(--success-foreground)",
        "color-warning": "var(--warning)",
        "color-warning-foreground": "var(--warning-foreground)",
        "color-info": "var(--info)",
        "color-info-foreground": "var(--info-foreground)",
        "color-destructive-foreground": "var(--destructive-foreground)",
        "ease-out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
        "ease-in-out-quart": "cubic-bezier(0.76, 0, 0.24, 1)",
        "animate-shimmer": "shimmer 2s linear infinite",
        "animate-pulse-soft": "pulse-soft 1.6s var(--ease-in-out-quart) infinite",
      },
      light: { radius, ...lightColors },
      dark,
    },
    css: {
      "@keyframes shimmer": { from: { "background-position": "100% 0" }, to: { "background-position": "-100% 0" } },
      "@keyframes pulse-soft": { "0%, 100%": { opacity: "0.4" }, "50%": { opacity: "1" } },
    },
  },
  {
    name: "utils",
    type: "registry:lib",
    title: "Icons and motion",
    description: "Semantic icon map and motion presets shared by every component.",
    dependencies: ["motion", "lucide-react"],
    files: [
      { path: "lib/icons.ts", type: "registry:lib" },
      { path: "lib/motion.ts", type: "registry:lib" },
    ],
  },
  ...colorPresets.map((p) => ({
    name: `color-${p.name}`,
    type: "registry:theme",
    title: `${p.label} primary`,
    description: `Sets --primary and --ring to ${p.label.toLowerCase()}. Install after ${NS}/style.`,
    cssVars: { light: p.light, dark: p.dark },
  })),
  ...components.map((c) => ({
    name: c.slug,
    type: c.group === "components" ? "registry:ui" : "registry:component",
    title: c.title,
    description: c.description,
    ...analyze(c.files),
    files: c.files.map((path) => ({ path, type: fileType(path) })),
  })),
]

writeFileSync(
  "registry.json",
  JSON.stringify(
    { $schema: "https://ui.shadcn.com/schema/registry.json", name: "jds", homepage: site.url, items },
    null,
    2
  ) + "\n"
)
console.log(`registry.json: ${items.length} items`)
