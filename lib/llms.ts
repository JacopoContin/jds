import { readFile } from "node:fs/promises"
import path from "node:path"

import { addonsOf, componentBySlug, components, docHref, nav, type ComponentDoc, type Prop } from "@/lib/docs"
import { site } from "@/lib/site"
import registry from "@/registry.json"

type RegistryItem = { name: string; dependencies?: string[]; registryDependencies?: string[] }

const read = (file: string) => readFile(path.join(/* turbopackIgnore: true */ process.cwd(), file), "utf8")
const lang = (file: string) => (file.endsWith(".ts") ? "ts" : "tsx")
const fence = (code: string, l = "tsx") => `\`\`\`${l}\n${code.trim()}\n\`\`\``

function propsTable(props: Prop[]) {
  const esc = (s: string) => s.replace(/\|/g, "\\|")
  return [
    "| Prop | Type | Default | Description |",
    "| --- | --- | --- | --- |",
    ...props.map(
      (p) =>
        `| \`${p.name}\` | \`${esc(p.type)}\` | ${p.default ? `\`${esc(p.default)}\`` : ""} | ${esc(p.description)} |`,
    ),
  ].join("\n")
}

function api(doc: ComponentDoc, level = "##") {
  if (!doc.api?.length) return ""
  return doc.api.map((a) => `${level}# ${a.component}\n\n${propsTable(a.props)}`).join("\n\n")
}

function install(doc: ComponentDoc) {
  const item = (registry.items as RegistryItem[]).find((i) => i.name === doc.slug)
  const lines = [fence(`npx shadcn@latest add ${site.namespace}/${doc.slug}`, "bash")]
  if (item?.dependencies?.length) lines.push(`npm dependencies: ${item.dependencies.map((d) => `\`${d}\``).join(", ")}`)
  if (item?.registryDependencies?.length)
    lines.push(`Also installs: ${item.registryDependencies.map((d) => `\`${d}\``).join(", ")}`)
  return lines.join("\n\n")
}

/** Full Markdown for one component page: install, usage, examples, add-ons, API and source. */
export async function componentMarkdown(slug: string, { source = true } = {}) {
  const doc = componentBySlug[slug]
  if (!doc || doc.parent) return null
  const out: string[] = [
    `# ${doc.title}`,
    doc.description,
    `Docs: ${site.url}${docHref(doc)}`,
    "## Installation",
    install(doc),
  ]

  if (doc.usage) out.push("## Usage", fence(doc.usage))

  const demo = await read(`examples/${slug}-demo.tsx`).catch(() => null)
  if (demo) out.push("## Example", fence(demo))
  for (const ex of doc.examples ?? []) {
    const code = await read(`examples/${ex.name}.tsx`).catch(() => null)
    if (code) out.push(`### ${ex.title}`, fence(code))
  }

  for (const addon of addonsOf(slug)) {
    out.push(`## ${addon.title}`, addon.description, install(addon), fence(addon.usage))
    const a = api(addon, "##")
    if (a) out.push(a)
  }

  const a = api(doc)
  if (a) out.push("## API Reference", a)

  if (source) {
    out.push("## Source")
    for (const file of doc.files) out.push(`### ${file}`, fence(await read(file), lang(file)))
  }
  return out.join("\n\n") + "\n"
}

const overview = nav[0].items

/** The llms.txt index: what JDS is and where every page's Markdown lives. */
export function llmsIndex() {
  const group = (g: ComponentDoc["group"]) =>
    components
      .filter((c) => c.group === g && !c.parent)
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((c) => `- [${c.title}](${site.url}/llms/components/${c.slug}.md): ${c.description}`)
      .join("\n")

  return `# ${site.name} (${site.fullName})

> An opinionated design system for AI agent and voice interfaces. Built on Base UI, installed as source with the shadcn CLI. Registry: \`${site.url}/r/{name}.json\`, namespace \`${site.namespace}\`.

Install a component: \`npx shadcn@latest add ${site.namespace}/<name>\` after adding \`"${site.namespace}": "${site.url}/r/{name}.json"\` to \`registries\` in components.json. Start with \`${site.namespace}/style\`.

## Docs

${overview.map((p) => `- [${p.title}](${site.url}${p.href})`).join("\n")}

## Agent components

${group("ai")}

## Voice components

${group("voice")}

## Primitives

${group("components")}

## Optional

- [Everything in one file](${site.url}/llms-full.txt): all component docs with source
- [Particles](${site.url}/particles): full screens composed from the components
`
}
