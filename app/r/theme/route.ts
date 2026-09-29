import { parseTheme, themeItem } from "@/lib/theme"

/**
 * A registry theme built from query params, so a theme picked in the docs installs with
 * one command: npx shadcn@latest add "<site>/r/theme?color=blue&base=stone&radius=0.5"
 */
export function GET(request: Request) {
  const item = themeItem(parseTheme(new URL(request.url).searchParams))
  return Response.json(item, { headers: { "Cache-Control": "public, max-age=3600" } })
}
