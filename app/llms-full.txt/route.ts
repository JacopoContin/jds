import { components } from "@/lib/docs"
import { componentMarkdown, llmsIndex } from "@/lib/llms"

export const dynamic = "force-static"

export async function GET() {
  const pages = await Promise.all(components.filter((c) => !c.parent).map((c) => componentMarkdown(c.slug)))
  const body = [llmsIndex(), ...pages.filter(Boolean)].join("\n---\n\n")
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
