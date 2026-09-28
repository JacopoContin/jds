import { cn } from "cn"
import { codeToHtml } from "shiki"

import { CopyButton } from "@/components/docs/copy-button"

export async function highlight(code: string, lang = "tsx") {
  return codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "vitesse-dark" },
    defaultColor: false,
  })
}

export async function CodeBlock({
  code,
  lang = "tsx",
  title,
  className,
}: {
  code: string
  lang?: string
  title?: string
  className?: string
}) {
  const html = await highlight(code.trim(), lang)
  return (
    <div className={cn("group relative overflow-hidden rounded-xl border bg-card", className)}>
      {title && (
        <div className="flex h-10 items-center border-b px-4 font-mono text-xs text-muted-foreground">{title}</div>
      )}
      <CopyButton value={code.trim()} className="absolute top-2 right-2 z-10" />
      <div className="docs-code max-h-112 overflow-auto text-[13px]" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
