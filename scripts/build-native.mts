/**
 * Generates the React Native side after registry.json: native/lib/tokens.ts (the default
 * theme, the same file /tokens/react-native serves) and registry-native.json, the
 * @jds-native registry. Dependencies come from each file's imports, pinned to the ranges
 * native/package.json type-checks with, except the native modules the app installs itself.
 */
import { readFileSync, writeFileSync } from "node:fs"

import { nativeItems, nativeModules } from "../lib/native.ts"
import { site } from "../lib/site.ts"
import { themeDefaults } from "../lib/theme.ts"
import { buildTokens, formatTokens } from "../lib/tokens.ts"

writeFileSync("native/lib/tokens.ts", formatTokens(buildTokens(themeDefaults), "react-native"))

const NS = site.nativeNamespace
const pkg = JSON.parse(readFileSync("native/package.json", "utf8")) as { devDependencies: Record<string, string> }
/** The app brings React Native and its native modules; pure JS packages install at the range JDS checks against. */
const provided = new Set(["react", "react-native", ...nativeModules])
const importRe = /from\s+["']([^"']+)["']/g
const installed = (path: string) => path.replace(/^native\//, "")

function fileType(path: string) {
  if (path.startsWith("native/lib/")) return "registry:lib"
  if (path.startsWith("native/components/ui/")) return "registry:ui"
  return "registry:component"
}

function analyze(paths: string[]) {
  const deps = new Set<string>()
  const regDeps = new Set<string>()
  for (const path of paths) {
    for (const [, spec] of readFileSync(path, "utf8").matchAll(importRe)) {
      if (spec.startsWith("@/")) {
        const local = spec.slice(2)
        if (paths.some((p) => installed(p).replace(/\.tsx?$/, "") === local)) continue
        const owner = nativeItems.find((i) => i.files.some((f) => installed(f).replace(/\.tsx?$/, "") === local))
        if (!owner) throw new Error(`${path} imports ${spec}, which no native item ships`)
        regDeps.add(`${NS}/${owner.slug}`)
      } else if (!spec.startsWith(".")) {
        const parts = spec.split("/")
        const name = spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]
        if (provided.has(name)) continue
        const range = pkg.devDependencies[name]
        if (!range) throw new Error(`${path} imports ${name}, which native/package.json doesn't check against`)
        deps.add(`${name}@${range}`)
      }
    }
  }
  return { dependencies: [...deps].sort(), registryDependencies: [...regDeps].sort() }
}

const items = nativeItems.map((i) => ({
  name: i.slug,
  type: i.slug === "tokens" ? "registry:lib" : fileType(i.files[0]),
  title: i.title,
  description: i.description,
  ...analyze(i.files),
  files: i.files.map((path) => ({ path, type: fileType(path), target: installed(path) })),
}))

writeFileSync(
  "registry-native.json",
  JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "jds-native",
      homepage: `${site.url}/docs/native`,
      items,
    },
    null,
    2
  ) + "\n"
)
console.log(`registry-native.json: ${items.length} items`)
