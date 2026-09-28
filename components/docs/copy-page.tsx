"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { CheckIcon, CopyIcon } from "@/lib/icons"

/**
 * Converts the rendered docs page to Markdown. Skips anything marked [data-md-skip]
 * (live previews, navigation). Code blocks keep their text; tables become pipe tables.
 */
function toMarkdown(root: Element): string {
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? "").replace(/\s+/g, " ")
    if (!(node instanceof HTMLElement)) return ""
    if (node.dataset.mdSkip !== undefined || node.getAttribute("aria-hidden") === "true") return ""
    const inner = () => Array.from(node.childNodes).map(walk).join("")
    switch (node.tagName) {
      case "H1":
        return `\n\n# ${node.textContent?.trim()}\n\n`
      case "H2":
        return `\n\n## ${node.textContent?.trim()}\n\n`
      case "H3":
        return `\n\n### ${node.textContent?.trim()}\n\n`
      case "P":
        return `\n\n${inner().trim()}\n\n`
      case "STRONG":
      case "B":
        return `**${inner()}**`
      case "EM":
        return `_${inner()}_`
      case "A":
        return `[${inner().trim()}](${new URL(node.getAttribute("href") ?? "", location.href).href})`
      case "CODE":
        return node.closest("pre") ? inner() : `\`${node.textContent}\``
      case "PRE":
        return `\n\n\`\`\`\n${node.textContent?.trimEnd()}\n\`\`\`\n\n`
      case "LI":
        return `\n- ${inner().trim()}`
      case "UL":
      case "OL":
        return `\n${inner()}\n`
      case "TABLE": {
        const rows = Array.from(node.querySelectorAll("tr")).map((tr) =>
          Array.from(tr.children).map((c) => (c.textContent ?? "").replace(/\s+/g, " ").trim()),
        )
        if (!rows.length) return ""
        const [head, ...body] = rows
        return `\n\n| ${head.join(" | ")} |\n| ${head.map(() => "---").join(" | ")} |\n${body.map((r) => `| ${r.join(" | ")} |`).join("\n")}\n\n`
      }
      case "BUTTON":
      case "SVG":
        return ""
      default:
        return inner()
    }
  }
  return walk(root)
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/** Copies the current docs page as Markdown, for pasting into a chat with an AI. */
export function CopyPage() {
  const pathname = usePathname()
  const [copied, setCopied] = React.useState(false)
  const component = pathname.match(/^\/docs\/components\/([^/]+)$/)?.[1]

  const copy = async () => {
    let md: string
    if (component) {
      md = await fetch(`/llms/components/${component}.md`).then((r) => r.text())
    } else {
      const root = document.querySelector("[data-docs] > div")
      md = root ? `${toMarkdown(root)}\n\nSource: ${location.href}\n` : ""
    }
    await navigator.clipboard.writeText(md)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <Button variant="outline" size="sm" onClick={copy} data-md-skip>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? "done" : "copy"}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.12 }}
          className="grid place-items-center"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </motion.span>
      </AnimatePresence>
      {copied ? "Copied" : "Copy page"}
    </Button>
  )
}
