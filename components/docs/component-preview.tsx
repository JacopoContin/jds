import { readFile } from "node:fs/promises"
import path from "node:path"

import { highlight } from "@/components/docs/code-block"
import { PreviewTabs } from "@/components/docs/preview-tabs"

export async function readSource(file: string) {
  return readFile(path.join(/* turbopackIgnore: true */ process.cwd(), file), "utf8")
}

export async function ComponentPreview({
  name,
  dir = "examples",
  align,
  className,
}: {
  name: string
  dir?: "examples" | "particles"
  align?: "center" | "start"
  className?: string
}) {
  const code = (await readSource(`${dir}/${name}.tsx`)).trim()
  const html = await highlight(code)
  return <PreviewTabs name={name} code={code} html={html} align={align} className={className} />
}
