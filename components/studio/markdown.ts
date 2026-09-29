/**
 * A short Markdown spec of a Studio configuration, for a teammate or a coding agent:
 * the choices in words, how to install, where the code goes, and the code.
 */
export function studioMarkdown({
  title,
  intro,
  choices,
  install,
  placement,
  code,
  notes = [],
}: {
  title: string
  intro: string
  /** [setting, value] pairs, in the order the Studio shows them. */
  choices: [string, string][]
  /** Registry items without the namespace, or a full install command. */
  install: string[] | string
  /** Where the code goes, one step per line. */
  placement: string[]
  code: string
  notes?: string[]
}) {
  return [
    `# ${title}`,
    "",
    intro,
    "",
    "## Choices",
    "",
    ...choices.map(([k, v]) => `- **${k}:** ${v}`),
    "",
    "## Install",
    "",
    "```bash",
    typeof install === "string" ? install : `npx shadcn@latest add ${install.map((i) => `@jds/${i}`).join(" ")}`,
    "```",
    "",
    "## Where it goes",
    "",
    ...placement.map((p, i) => `${i + 1}. ${p}`),
    "",
    "## Code",
    "",
    "```tsx",
    code,
    "```",
    ...(notes.length ? ["", "## Notes", "", ...notes.map((n) => `- ${n}`)] : []),
    "",
  ].join("\n")
}

/** Registry items a generated snippet imports, e.g. "@/components/ai/tool-call" becomes "tool-call". */
export function installFromCode(code: string) {
  const items = [...code.matchAll(/from "@\/components\/(?:ai|voice)\/([\w-]+)"/g)].map((m) => m[1])
  return [...new Set(items)].sort()
}
