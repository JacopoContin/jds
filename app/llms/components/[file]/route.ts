import { components } from "@/lib/docs"
import { componentMarkdown } from "@/lib/llms"

export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return components.filter((c) => !c.parent).map((c) => ({ file: `${c.slug}.md` }))
}

export async function GET(_: Request, { params }: RouteContext<"/llms/components/[file]">) {
  const { file } = await params
  const md = await componentMarkdown(file.replace(/\.md$/, ""))
  if (!md) return new Response("Not found", { status: 404 })
  return new Response(md, { headers: { "Content-Type": "text/markdown; charset=utf-8" } })
}
