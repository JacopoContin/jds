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
  install,
}: {
  name: string
  /** "recipes" shows the recipe's entry file, recipes/<name>/<name>.tsx. */
  dir?: "examples" | "recipes"
  align?: "center" | "start"
  className?: string
  /** Registry item the snippet needs. Labels the tab "Usage" and says to install it first. */
  install?: string
}) {
  const file = dir === "recipes" ? `recipes/${name}/${name}.tsx` : `${dir}/${name}.tsx`
  const code = (await readSource(file)).trim()
  const html = await highlight(code)
  return <PreviewTabs name={name} code={code} html={html} align={align} className={className} install={install} />
}
